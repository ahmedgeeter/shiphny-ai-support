"""Debug chat endpoint without database"""
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.fallback_responses import get_fallback_response
from app.services.groq_ai import get_groq_service
import os

router = APIRouter(prefix="/api/debug", tags=["debug"])

class SimpleRequest(BaseModel):
    message: str

@router.post("/chat")
async def simple_chat(request: SimpleRequest):
    """Simple chat without database - for testing."""
    response = get_fallback_response(request.message)
    return {
        "response": response,
        "received": request.message
    }

@router.get("/apikey")
async def check_api_key():
    """Check API key status."""
    service = get_groq_service()
    return {
        "api_key_exists": bool(service.api_key),
        "api_key_preview": service.api_key[:20] + "..." if service.api_key else None,
        "model": service.model,
        "env_groq_key_exists": bool(os.getenv("GROQ_API_KEY")),
        "env_groq_model": os.getenv("GROQ_MODEL")
    }
