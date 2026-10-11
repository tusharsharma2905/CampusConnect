import uuid
import enum
from sqlalchemy import Column, String, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class AttendanceStatusEnum(str, enum.Enum):
    pending = 'pending'
    present = 'present'

class Attendance(Base):
    __tablename__ = 'attendance'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    registration_id = Column(UUID(as_uuid=True), ForeignKey('registrations.id'), unique=True)
    qr_token = Column(String(255), unique=True, nullable=False)
    scanned_at = Column(DateTime, nullable=True)
    marked_by = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=True)
    status = Column(Enum(AttendanceStatusEnum), default=AttendanceStatusEnum.pending)

    registration = relationship('Registration', back_populates='attendance')
    marker = relationship('User')
