from pydantic import BaseModel
from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime

class VenueBase(BaseModel):
    name: str
    building: Optional[str] = None
    room: Optional[str] = None
    capacity: int
    address: Optional[str] = None
    facilities: Optional[Dict[str, Any]] = None

class VenueResponse(VenueBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class VenueCreate(VenueBase):
    pass
