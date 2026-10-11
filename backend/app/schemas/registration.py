from pydantic import BaseModel
from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from app.models.registration import RegistrationStatusEnum
from app.schemas.event import EventResponse

class RegistrationBase(BaseModel):
    custom_data: Optional[Dict[str, Any]] = None

class RegistrationCreate(RegistrationBase):
    pass

class RegistrationResponse(RegistrationBase):
    id: UUID
    registration_id: str
    event_id: UUID
    user_id: UUID
    status: RegistrationStatusEnum
    registered_at: datetime
    cancelled_at: Optional[datetime] = None
    
    event: Optional[EventResponse] = None

    class Config:
        from_attributes = True
