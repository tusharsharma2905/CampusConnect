from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.attendance import AttendanceStatusEnum

class AttendanceScanRequest(BaseModel):
    qr_token: str

class AttendanceResponse(BaseModel):
    id: UUID
    registration_id: UUID
    qr_token: str
    scanned_at: Optional[datetime]
    marked_by: Optional[UUID]
    status: AttendanceStatusEnum

    class Config:
        from_attributes = True

class AttendanceScanResponse(BaseModel):
    success: bool
    message: str
    student_name: str
    registration_id: str
    scanned_at: datetime
