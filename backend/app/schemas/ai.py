from pydantic import BaseModel
from typing import List, Optional

class GenerateContentRequest(BaseModel):
    prompt: str
    context: Optional[str] = None
    max_tokens: Optional[int] = 500

class GenerateContentResponse(BaseModel):
    content: str

class EventSuggestionRequest(BaseModel):
    interests: List[str]
    past_events: List[str]

class EventSuggestionResponse(BaseModel):
    recommendations: List[str]
    reasoning: str
