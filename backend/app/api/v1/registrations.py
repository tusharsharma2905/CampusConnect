from typing import Any, List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.registration import RegistrationCreate, RegistrationResponse
from app.services.registration_service import RegistrationService

router = APIRouter()

@router.get("/me", response_model=List[RegistrationResponse])
def get_my_registrations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get current user's registrations.
    """
    return RegistrationService.get_user_registrations(db, str(current_user.id))

@router.delete("/{registration_id}")
def cancel_registration(
    registration_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Cancel a registration.
    """
    return RegistrationService.cancel_registration(db, registration_id, str(current_user.id))
