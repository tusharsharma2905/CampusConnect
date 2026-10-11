from typing import Any, Optional
from uuid import UUID
from datetime import datetime
import math

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.dependencies import get_db, get_current_user, get_current_organizer_user, get_current_admin_user
from app.models.user import User
from app.models.event import Event, EventStatusEnum
from app.models.announcement import Announcement
from app.schemas.event import EventCreate, EventUpdate, EventResponse, PaginatedEventResponse
from app.schemas.registration import RegistrationCreate
from app.services.event_service import EventService
from app.services.registration_service import RegistrationService

router = APIRouter()

@router.post("/{event_id}/register", status_code=status.HTTP_201_CREATED)
def register_for_event(
    event_id: str,
    data: RegistrationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Register for an event.
    """
    return RegistrationService.register_for_event(db, event_id, str(current_user.id), data)

@router.get("", response_model=PaginatedEventResponse)
def get_events(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
    search: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[EventStatusEnum] = None,
) -> Any:
    """
    Retrieve events.
    """
    skip = (page - 1) * limit
    events, total = EventService.get_events(
        db, skip=skip, limit=limit, search=search, category=category, status=status
    )
    total_pages = math.ceil(total / limit)
    
    return {
        "items": events,
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": total_pages
    }

@router.get("/organizer/my", response_model=PaginatedEventResponse)
def get_my_organized_events(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[EventStatusEnum] = None,
    current_user: User = Depends(get_current_organizer_user),
) -> Any:
    """
    Get all events created by the logged-in organizer.
    For administrators, returns all events across the platform with full status visibility.
    """
    skip = (page - 1) * limit
    is_admin = (current_user.role == "admin")
    org_id = None if is_admin else str(current_user.id)
    events, total = EventService.get_events(
        db, skip=skip, limit=limit, status=status, organizer_id=org_id, all_statuses=is_admin
    )
    total_pages = math.ceil(total / limit)
    return {
        "items": events,
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": total_pages
    }

@router.get("/{event_id}", response_model=EventResponse)
def get_event(
    event_id: str,
    db: Session = Depends(get_db),
) -> Any:
    """
    Get event by ID.
    """
    return EventService.get_event(db, event_id)

@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    *,
    db: Session = Depends(get_db),
    event_in: EventCreate,
    current_user: User = Depends(get_current_organizer_user),
) -> Any:
    """
    Create new event (Organizer only).
    """
    return EventService.create_event(db, event_in=event_in, organizer_id=current_user.id)

@router.put("/{event_id}", response_model=EventResponse)
def update_event(
    *,
    db: Session = Depends(get_db),
    event_id: str,
    event_in: EventUpdate,
    current_user: User = Depends(get_current_organizer_user),
) -> Any:
    """
    Update an event.
    """
    # Authorization checks should ensure user is the organizer or admin
    return EventService.update_event(db, event_id, event_in)

@router.delete("/{event_id}", response_model=EventResponse)
def cancel_event(
    *,
    db: Session = Depends(get_db),
    event_id: str,
    current_user: User = Depends(get_current_organizer_user),
) -> Any:
    """
    Cancel an event. (Soft delete)
    """
    return EventService.cancel_event(db, event_id)

@router.patch("/{event_id}/approve", response_model=EventResponse)
def approve_event(
    *,
    db: Session = Depends(get_db),
    event_id: str,
    current_user: User = Depends(get_current_admin_user),
) -> Any:
    """
    Approve an event (Admin only).
    """
    return EventService.approve_event(db, event_id)

@router.patch("/{event_id}/publish", response_model=EventResponse)
def publish_event(
    *,
    db: Session = Depends(get_db),
    event_id: str,
    current_user: User = Depends(get_current_organizer_user),
) -> Any:
    """
    Publish an approved event.
    """
    return EventService.publish_event(db, event_id)

class AnnouncementCreate(BaseModel):
    title: str
    message: str

class AnnouncementResponse(BaseModel):
    id: UUID
    event_id: UUID
    title: str
    message: str
    created_at: datetime
    event_title: Optional[str] = None

    class Config:
        from_attributes = True

@router.get("/organizer/announcements/all", response_model=list[AnnouncementResponse])
def get_organizer_announcements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_organizer_user),
) -> Any:
    """
    Get all announcements made by the logged-in organizer.
    """
    announcements = db.query(Announcement).filter(
        Announcement.created_by == current_user.id
    ).order_by(Announcement.created_at.desc()).all()
    
    result = []
    for a in announcements:
        ev = db.query(Event).filter(Event.id == a.event_id).first()
        result.append(AnnouncementResponse(
            id=a.id,
            event_id=a.event_id,
            title=a.title,
            message=a.message,
            created_at=a.created_at,
            event_title=ev.title if ev else "Event"
        ))
    return result

@router.post("/{event_id}/announcements", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
def create_event_announcement(
    event_id: str,
    data: AnnouncementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_organizer_user),
) -> Any:
    """
    Create and broadcast an announcement for an event.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    announcement = Announcement(
        event_id=event.id,
        created_by=current_user.id,
        title=data.title,
        message=data.message,
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    
    return AnnouncementResponse(
        id=announcement.id,
        event_id=announcement.event_id,
        title=announcement.title,
        message=announcement.message,
        created_at=announcement.created_at,
        event_title=event.title
    )

@router.get("/{event_id}/announcements", response_model=list[AnnouncementResponse])
def get_event_announcements(
    event_id: str,
    db: Session = Depends(get_db),
) -> Any:
    """
    Get announcements for a specific event.
    """
    announcements = db.query(Announcement).filter(
        Announcement.event_id == event_id
    ).order_by(Announcement.created_at.desc()).all()
    
    ev = db.query(Event).filter(Event.id == event_id).first()
    return [
        AnnouncementResponse(
            id=a.id,
            event_id=a.event_id,
            title=a.title,
            message=a.message,
            created_at=a.created_at,
            event_title=ev.title if ev else "Event"
        ) for a in announcements
    ]
