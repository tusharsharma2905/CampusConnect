from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime

from app.models.attendance import Attendance, AttendanceStatusEnum
from app.models.registration import Registration, RegistrationStatusEnum
from app.schemas.attendance import AttendanceScanRequest, AttendanceScanResponse

class AttendanceService:
    @staticmethod
    def scan_qr(db: Session, data: AttendanceScanRequest, organizer_id: str) -> AttendanceScanResponse:
        # 1. QR exists
        attendance = db.query(Attendance).filter(Attendance.qr_token == data.qr_token).first()
        if not attendance:
            raise HTTPException(status_code=404, detail="Invalid QR code")
            
        # 2. Registration exists
        registration = attendance.registration
        if not registration or registration.status == RegistrationStatusEnum.cancelled:
            raise HTTPException(status_code=400, detail="Registration is invalid or cancelled")
            
        # 5. QR has not already been scanned
        if attendance.status == AttendanceStatusEnum.present:
            raise HTTPException(
                status_code=400, 
                detail="⚠ Already Checked In"
            )
            
        # Mark attendance
        attendance.status = AttendanceStatusEnum.present
        attendance.scanned_at = datetime.utcnow()
        attendance.marked_by = organizer_id
        
        registration.status = RegistrationStatusEnum.attended
        
        db.commit()
        db.refresh(attendance)
        
        return AttendanceScanResponse(
            success=True,
            message="✓ Attendance Marked",
            student_name=registration.user.name,
            registration_id=registration.registration_id,
            scanned_at=attendance.scanned_at
        )
