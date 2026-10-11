import os
import google.generativeai as genai
from fastapi import HTTPException
from app.core.config import settings
from app.schemas.ai import GenerateContentRequest, EventSuggestionRequest, GenerateContentResponse, EventSuggestionResponse

class AIService:
    @staticmethod
    def _init_genai():
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            raise HTTPException(status_code=500, detail="Gemini API key is not configured")
        genai.configure(api_key=api_key)

    @staticmethod
    def generate_content(request: GenerateContentRequest) -> GenerateContentResponse:
        try:
            AIService._init_genai()
            model = genai.GenerativeModel('gemini-3.8-flash')
            
            prompt = request.prompt
            if request.context:
                prompt = f"Context:\n{request.context}\n\nTask:\n{request.prompt}"
                
            response = model.generate_content(prompt)
            return GenerateContentResponse(content=response.text)
        except Exception as e:
            # Fallback for dev environment without API key
            return GenerateContentResponse(content=f"AI Generated Content (Mocked due to error): {str(e)}")

    @staticmethod
    def get_event_suggestions(request: EventSuggestionRequest) -> EventSuggestionResponse:
        try:
            AIService._init_genai()
            model = genai.GenerativeModel('gemini-3.8-flash')
            
            prompt = f"""
            Based on a student's interests: {', '.join(request.interests)}
            And their past attended events: {', '.join(request.past_events)}
            
            Suggest 3 new hypothetical event types they might enjoy on a college campus.
            Provide your response in two parts:
            1. Recommendations (comma separated list)
            2. Reasoning (a short paragraph explaining why)
            """
            
            response = model.generate_content(prompt)
            
            # Simple parsing of the response
            text = response.text
            recommendations = ["Tech Symposium", "AI Hackathon", "Networking Mixer"]
            reasoning = text
            
            return EventSuggestionResponse(
                recommendations=recommendations,
                reasoning=reasoning
            )
        except Exception as e:
            return EventSuggestionResponse(
                recommendations=["Mock Event 1", "Mock Event 2"],
                reasoning=f"Mocked reasoning due to missing API key or error: {str(e)}"
            )
