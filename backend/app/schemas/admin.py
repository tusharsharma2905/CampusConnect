from pydantic import BaseModel
from typing import List

class PlatformStatsResponse(BaseModel):
    total_users: int
    total_students: int
    total_organizers: int
    total_events: int
    pending_events: int
    total_registrations: int

class UserActionRequest(BaseModel):
    action: str # "activate", "deactivate", "delete"
