from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.user import RoleEnum

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: RoleEnum = RoleEnum.student
    student_id: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = None
    phone: Optional[str] = None
    profile_image: Optional[str] = None
    bio: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    student_id: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = None
    phone: Optional[str] = None
    profile_image: Optional[str] = None
    bio: Optional[str] = None

class UserResponse(UserBase):
    id: UUID
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
