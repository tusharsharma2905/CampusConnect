import uuid
import enum
from sqlalchemy import Column, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class CertificateTypeEnum(str, enum.Enum):
    participation = 'participation'
    winner = 'winner'
    runner_up = 'runner_up'
    volunteer = 'volunteer'
    organizer = 'organizer'

class Certificate(Base):
    __tablename__ = 'certificates'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    certificate_id = Column(String(100), unique=True, nullable=False)
    registration_id = Column(UUID(as_uuid=True), ForeignKey('registrations.id'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    event_id = Column(UUID(as_uuid=True), ForeignKey('events.id'))

    certificate_type = Column(Enum(CertificateTypeEnum))
    recipient_name = Column(String(150))
    issued_at = Column(DateTime, default=datetime.utcnow)
    certificate_url = Column(Text)
    verification_code = Column(String(255), unique=True)

    registration = relationship('Registration', back_populates='certificates')
    user = relationship('User', back_populates='certificates')
    event = relationship('Event', back_populates='certificates')
