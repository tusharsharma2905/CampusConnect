from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_organizer_user
from app.models.user import User
from app.schemas.analytics import EventAnalyticsResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter()

@router.get("/events/{event_id}", response_model=EventAnalyticsResponse)
def get_event_analytics(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_organizer_user),
) -> Any:
    """
    Get analytics for a specific event (Organizer only).
    """
    return AnalyticsService.get_event_analytics(db, event_id)
