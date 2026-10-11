import uuid
import random
import string
from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime

from app.models.registration import Registration, RegistrationStatusEnum
from app.models.event import Event, EventStatusEnum
from app.models.attendance import Attendance
from app.schemas.registration import RegistrationCreate

class RegistrationService:
    @staticmethod
    def _generate_reg_id() -> str:
        # REG-2026-XXXXXX
        year = datetime.now().year
        random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        return f"REG-{year}-{random_part}"

    @staticmethod
    def _generate_qr_token() -> str:
        return f"qr_{uuid.uuid4().hex}"

    @staticmethod
    def register_for_event(db: Session, event_id: str, user_id: str, data: RegistrationCreate) -> dict:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
            
        if event.status not in [EventStatusEnum.published, EventStatusEnum.approved]:
            raise HTTPException(status_code=400, detail="Event is not open for registration")

        if event.registration_deadline and datetime.utcnow() > event.registration_deadline:
            raise HTTPException(status_code=400, detail="Registration deadline has passed")

        existing = db.query(Registration).filter(
            Registration.event_id == event_id,
            Registration.user_id == user_id,
            Registration.status != RegistrationStatusEnum.cancelled
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="You are already registered for this event")

        # Capacity check with a transaction lock (simplified for this context)
        # In production, use SELECT FOR UPDATE
        if event.capacity and event.registration_count >= event.capacity:
            # Handle Waitlist logic if needed
            raise HTTPException(
                status_code=400, 
                detail="This event has reached maximum capacity"
            )

        reg_id = RegistrationService._generate_reg_id()
        
        registration = Registration(
            registration_id=reg_id,
            event_id=event_id,
            user_id=user_id,
            status=RegistrationStatusEnum.registered,
            custom_data=data.custom_data
        )
        
        db.add(registration)
        
        # Increase event registration count
        event.registration_count += 1
        
        # Generate QR Attendance Record early
        attendance = Attendance(
            registration=registration,
            qr_token=RegistrationService._generate_qr_token()
        )
        db.add(attendance)
        
        db.commit()
        db.refresh(registration)
        db.refresh(attendance)
        
        return {
            "registration_id": registration.registration_id,
            "event_id": str(registration.event_id),
            "status": registration.status.value,
            "qr_token": attendance.qr_token
        }

    @staticmethod
    def get_user_registrations(db: Session, user_id: str):
        return db.query(Registration).filter(
            Registration.user_id == user_id
        ).order_by(Registration.registered_at.desc()).all()

    @staticmethod
    def cancel_registration(db: Session, registration_id: str, user_id: str):
        reg = db.query(Registration).filter(
            Registration.registration_id == registration_id,
            Registration.user_id == user_id
        ).first()
        
        if not reg:
            raise HTTPException(status_code=404, detail="Registration not found")
            
        if reg.status == RegistrationStatusEnum.cancelled:
            raise HTTPException(status_code=400, detail="Registration is already cancelled")
            
        reg.status = RegistrationStatusEnum.cancelled
        reg.cancelled_at = datetime.utcnow()
        
        # Decrease event registration count
        event = db.query(Event).filter(Event.id == reg.event_id).first()
        if event and event.registration_count > 0:
            event.registration_count -= 1
            
        db.commit()
        return {"message": "Registration cancelled successfully"}
