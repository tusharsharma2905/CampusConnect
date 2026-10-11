import uuid
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Announcement(Base):
    __tablename__ = 'announcements'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey('events.id'))
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    title = Column(String(255))
    message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship('Event', back_populates='announcements')
    creator = relationship('User')
