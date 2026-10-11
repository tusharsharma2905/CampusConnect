from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from app.models.event import EventTypeEnum, EventStatusEnum
from app.schemas.user import UserResponse
from app.schemas.category import CategoryResponse
from app.schemas.venue import VenueResponse

class EventSpeakerBase(BaseModel):
    name: str
    designation: Optional[str] = None
    organization: Optional[str] = None
    bio: Optional[str] = None
    photo: Optional[str] = None

class EventSpeakerCreate(EventSpeakerBase):
    pass

class EventSpeakerResponse(EventSpeakerBase):
    id: UUID
    event_id: UUID
    model_config = ConfigDict(from_attributes=True)

class EventBase(BaseModel):
    title: str
    short_description: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[UUID] = None
    venue_id: Optional[UUID] = None
    banner_image: Optional[str] = None
    event_type: EventTypeEnum = EventTypeEnum.offline
    start_datetime: datetime
    end_datetime: datetime
    registration_deadline: Optional[datetime] = None
    capacity: Optional[int] = None
    eligibility: Optional[str] = None
    rules: Optional[str] = None
    prizes: Optional[str] = None
    faq: Optional[Dict[str, Any]] = None
    is_featured: bool = False
    online_link: Optional[str] = None

class EventCreate(EventBase):
    speakers: Optional[List[EventSpeakerCreate]] = []

class EventUpdate(BaseModel):
    title: Optional[str] = None
    short_description: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[UUID] = None
    venue_id: Optional[UUID] = None
    banner_image: Optional[str] = None
    event_type: Optional[EventTypeEnum] = None
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    registration_deadline: Optional[datetime] = None
    capacity: Optional[int] = None
    eligibility: Optional[str] = None
    rules: Optional[str] = None
    prizes: Optional[str] = None
    faq: Optional[Dict[str, Any]] = None
    is_featured: Optional[bool] = None
    online_link: Optional[str] = None

class EventResponse(EventBase):
    id: UUID
    slug: str
    organizer_id: UUID
    registration_count: int
    status: EventStatusEnum
    created_at: datetime
    updated_at: datetime
    
    organizer: Optional[UserResponse] = None
    category: Optional[CategoryResponse] = None
    venue: Optional[VenueResponse] = None
    speakers: List[EventSpeakerResponse] = []
    
    model_config = ConfigDict(from_attributes=True)

class PaginatedEventResponse(BaseModel):
    items: List[EventResponse]
    page: int
    limit: int
    total: int
    total_pages: int
