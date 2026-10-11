from typing import Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.dependencies import get_db, get_current_organizer_user
from app.models.user import User
from app.schemas.attendance import AttendanceScanRequest, AttendanceScanResponse
from app.services.attendance_service import AttendanceService

router = APIRouter()

@router.post("/scan", response_model=AttendanceScanResponse)
def scan_qr_attendance(
    data: AttendanceScanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_organizer_user),
) -> Any:
    """
    Scan a QR code to mark attendance (Organizer only).
    """
    return AttendanceService.scan_qr(db, data, str(current_user.id))
