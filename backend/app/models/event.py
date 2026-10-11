import uuid
import enum
from sqlalchemy import Column, String, Integer, Text, DateTime, Boolean, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class EventTypeEnum(str, enum.Enum):
    online = 'online'
    offline = 'offline'
    hybrid = 'hybrid'

class EventStatusEnum(str, enum.Enum):
    draft = 'draft'
    pending_approval = 'pending_approval'
    approved = 'approved'
    published = 'published'
    rejected = 'rejected'
    cancelled = 'cancelled'
    completed = 'completed'

class Event(Base):
    __tablename__ = 'events'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    slug = Column(String(300), unique=True, nullable=False)
    short_description = Column(String(500))
    description = Column(Text)
    category_id = Column(UUID(as_uuid=True), ForeignKey('categories.id'))
    organizer_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    venue_id = Column(UUID(as_uuid=True), ForeignKey('venues.id'))
    banner_image = Column(Text)

    event_type = Column(Enum(EventTypeEnum), default=EventTypeEnum.offline)

    start_datetime = Column(DateTime, nullable=False)
    end_datetime = Column(DateTime, nullable=False)
    registration_deadline = Column(DateTime)

    capacity = Column(Integer)
    registration_count = Column(Integer, default=0)

    eligibility = Column(Text)
    rules = Column(Text)
    prizes = Column(Text)
    faq = Column(JSONB)

    status = Column(Enum(EventStatusEnum), default=EventStatusEnum.draft)

    is_featured = Column(Boolean, default=False)
    online_link = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship('Category', back_populates='events')
    organizer = relationship('User', back_populates='events_created', foreign_keys=[organizer_id])
    venue = relationship('Venue', back_populates='events')
    registrations = relationship('Registration', back_populates='event')
    favorites = relationship('Favorite', back_populates='event')
    feedback = relationship('Feedback', back_populates='event')
    speakers = relationship('EventSpeaker', back_populates='event')
    announcements = relationship('Announcement', back_populates='event')
    certificates = relationship('Certificate', back_populates='event')

class EventSpeaker(Base):
    __tablename__ = 'event_speakers'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey('events.id'))
    name = Column(String(150))
    designation = Column(String(150))
    organization = Column(String(150))
    bio = Column(Text)
    photo = Column(Text)

    event = relationship('Event', back_populates='speakers')
