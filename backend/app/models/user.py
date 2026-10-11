import uuid
from sqlalchemy import Column, String, Boolean, Integer, DateTime, Text, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from app.core.database import Base

class RoleEnum(str, enum.Enum):
    student = "student"
    organizer = "organizer"
    admin = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.student)
    student_id = Column(String(50), unique=True, nullable=True)
    department = Column(String(100), nullable=True)
    year = Column(Integer, nullable=True)
    phone = Column(String(20), nullable=True)
    profile_image = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    interests = relationship("UserInterest", back_populates="user")
    events_created = relationship("Event", back_populates="organizer", foreign_keys="[Event.organizer_id]")
    registrations = relationship("Registration", back_populates="user")
    favorites = relationship("Favorite", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    feedback = relationship("Feedback", back_populates="user")
    certificates = relationship("Certificate", back_populates="user")

class UserInterest(Base):
    __tablename__ = "user_interests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    interest = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="interests")
