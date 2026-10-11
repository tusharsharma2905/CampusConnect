from typing import Any
from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.ai import GenerateContentRequest, EventSuggestionRequest, GenerateContentResponse, EventSuggestionResponse
from app.services.ai_service import AIService

router = APIRouter()

@router.post("/generate", response_model=GenerateContentResponse)
def generate_content(
    request: GenerateContentRequest,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Generate content using Gemini AI.
    """
    return AIService.generate_content(request)

@router.post("/suggestions", response_model=EventSuggestionResponse)
def get_suggestions(
    request: EventSuggestionRequest,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get personalized event suggestions using Gemini AI.
    """
    return AIService.get_event_suggestions(request)
