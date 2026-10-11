from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_admin_user
from app.models.user import User
from app.schemas.admin import PlatformStatsResponse, UserActionRequest
from app.schemas.user import UserResponse
from app.services.admin_service import AdminService

router = APIRouter()

@router.get("/stats", response_model=PlatformStatsResponse)
def get_platform_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
) -> Any:
    """
    Get platform-wide statistics.
    """
    return AdminService.get_platform_stats(db)

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
) -> Any:
    """
    Get all users.
    """
    return AdminService.get_users(db, skip=skip, limit=limit)

@router.patch("/users/{user_id}/manage")
def manage_user(
    user_id: str,
    action: UserActionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
) -> Any:
    """
    Activate, deactivate, or delete a user.
    """
    return AdminService.manage_user(db, user_id, action.action)
