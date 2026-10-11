from sqlalchemy import Boolean
import uuid
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Favorite(Base):
    __tablename__ = 'favorites'
    __table_args__ = (UniqueConstraint('user_id', 'event_id', name='uq_user_event_fav'),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    event_id = Column(UUID(as_uuid=True), ForeignKey('events.id'))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship('User', back_populates='favorites')
    event = relationship('Event', back_populates='favorites')

