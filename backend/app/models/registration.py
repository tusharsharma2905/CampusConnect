import uuid
import enum
from sqlalchemy import Column, String, DateTime, Enum, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class RegistrationStatusEnum(str, enum.Enum):
    registered = 'registered'
    cancelled = 'cancelled'
    attended = 'attended'
    waitlisted = 'waitlisted'

class Registration(Base):
    __tablename__ = 'registrations'
    
    __table_args__ = (UniqueConstraint('event_id', 'user_id', name='uq_event_user'),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    registration_id = Column(String(50), unique=True, nullable=False)
    event_id = Column(UUID(as_uuid=True), ForeignKey('events.id'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))

    status = Column(Enum(RegistrationStatusEnum), default=RegistrationStatusEnum.registered)
    custom_data = Column(JSONB)

    registered_at = Column(DateTime, default=datetime.utcnow)
    cancelled_at = Column(DateTime, nullable=True)

    event = relationship('Event', back_populates='registrations')
    user = relationship('User', back_populates='registrations')
    attendance = relationship('Attendance', back_populates='registration', uselist=False)
    certificates = relationship('Certificate', back_populates='registration')
