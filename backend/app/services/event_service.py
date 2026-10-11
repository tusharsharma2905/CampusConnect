import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException
from slugify import slugify
from typing import List, Optional, Tuple
from datetime import datetime

from app.models.event import Event, EventSpeaker, EventStatusEnum
from app.schemas.event import EventCreate, EventUpdate

class EventService:
    @staticmethod
    def _generate_slug(db: Session, title: str) -> str:
        base_slug = slugify(title)
        slug = base_slug
        counter = 1
        while db.query(Event).filter(Event.slug == slug).first():
            slug = f"{base_slug}-{counter}"
            counter += 1
        return slug

    @staticmethod
    def _check_venue_conflict(db: Session, venue_id: str, start_dt: datetime, end_dt: datetime, exclude_event_id: str = None):
        if not venue_id:
            return
        query = db.query(Event).filter(
            Event.venue_id == venue_id,
            Event.status.in_([EventStatusEnum.approved, EventStatusEnum.published]),
            Event.start_datetime < end_dt,
            Event.end_datetime > start_dt
        )
        if exclude_event_id:
            query = query.filter(Event.id != exclude_event_id)
        
        conflict = query.first()
        if conflict:
            raise HTTPException(
                status_code=400,
                detail={"code": "VENUE_CONFLICT", "message": "This venue is already booked during the selected time."}
            )

    @staticmethod
    def get_events(
        db: Session, 
        skip: int = 0, 
        limit: int = 12,
        search: Optional[str] = None,
        category: Optional[str] = None,
        status: Optional[EventStatusEnum] = None,
        organizer_id: Optional[str] = None,
        all_statuses: bool = False,
    ) -> Tuple[List[Event], int]:
        query = db.query(Event)
        
        if organizer_id:
            query = query.filter(Event.organizer_id == organizer_id)
            if status:
                query = query.filter(Event.status == status)
        elif status:
            query = query.filter(Event.status == status)
        elif not all_statuses:
            query = query.filter(Event.status.in_([EventStatusEnum.published, EventStatusEnum.approved]))
        
        if search:
            query = query.filter(Event.title.ilike(f"%{search}%") | Event.description.ilike(f"%{search}%"))
            
        if category:
            query = query.filter(Event.category.has(name=category))
            
        total = query.count()
        events = query.order_by(Event.start_datetime.asc()).offset(skip).limit(limit).all()
        return events, total

    @staticmethod
    def get_event(db: Session, event_id: str) -> Event:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise HTTPException(status_code=404, detail={"code": "EVENT_NOT_FOUND", "message": "The requested event could not be found."})
        return event

    @staticmethod
    def create_event(db: Session, event_in: EventCreate, organizer_id: str) -> Event:
        EventService._check_venue_conflict(db, str(event_in.venue_id) if event_in.venue_id else None, event_in.start_datetime, event_in.end_datetime)
        
        event_data = event_in.model_dump(exclude={"speakers"})
        event_data["slug"] = EventService._generate_slug(db, event_data["title"])
        event_data["organizer_id"] = organizer_id
        event_data["status"] = EventStatusEnum.pending_approval
        
        db_event = Event(**event_data)
        db.add(db_event)
        
        if event_in.speakers:
            for speaker_in in event_in.speakers:
                db_speaker = EventSpeaker(**speaker_in.model_dump(), event=db_event)
                db.add(db_speaker)
                
        db.commit()
        db.refresh(db_event)
        return db_event

    @staticmethod
    def update_event(db: Session, event_id: str, event_in: EventUpdate) -> Event:
        db_event = EventService.get_event(db, event_id)
        
        update_data = event_in.model_dump(exclude_unset=True)
        
        if 'venue_id' in update_data or 'start_datetime' in update_data or 'end_datetime' in update_data:
            start = update_data.get('start_datetime', db_event.start_datetime)
            end = update_data.get('end_datetime', db_event.end_datetime)
            venue = update_data.get('venue_id', db_event.venue_id)
            if venue:
                EventService._check_venue_conflict(db, str(venue), start, end, exclude_event_id=event_id)

        for field, value in update_data.items():
            setattr(db_event, field, value)
            
        db.commit()
        db.refresh(db_event)
        return db_event

    @staticmethod
    def approve_event(db: Session, event_id: str) -> Event:
        db_event = EventService.get_event(db, event_id)
        db_event.status = EventStatusEnum.published
        db.commit()
        db.refresh(db_event)
        return db_event

    @staticmethod
    def publish_event(db: Session, event_id: str) -> Event:
        db_event = EventService.get_event(db, event_id)
        if db_event.status != EventStatusEnum.approved:
            raise HTTPException(status_code=400, detail="Event must be approved before publishing")
        db_event.status = EventStatusEnum.published
        db.commit()
        db.refresh(db_event)
        return db_event

    @staticmethod
    def cancel_event(db: Session, event_id: str) -> Event:
        db_event = EventService.get_event(db, event_id)
        db_event.status = EventStatusEnum.cancelled
        db.commit()
        db.refresh(db_event)
        return db_event
