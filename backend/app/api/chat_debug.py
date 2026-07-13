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
    gemini_key = os.getenv("GEMINI_API_KEY")
    openrouter_key = os.getenv("OPENROUTER_API_KEY")
    return {
        "groq_key_exists": bool(service.api_key),
        "groq_key_preview": service.api_key[:20] + "..." if service.api_key else None,
        "gemini_key_exists": bool(gemini_key),
        "gemini_key_preview": gemini_key[:20] + "..." if gemini_key else None,
        "openrouter_key_exists": bool(openrouter_key),
        "openrouter_key_preview": openrouter_key[:20] + "..." if openrouter_key else None,
    }

@router.get("/test-openrouter")
async def test_openrouter():
    """Live test OpenRouter free model."""
    import httpx
    key = os.getenv("OPENROUTER_API_KEY")
    if not key:
        return {"error": "No OPENROUTER_API_KEY set", "success": False}
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json",
                         "HTTP-Referer": "https://shiphny-ai-support.onrender.com"},
                json={"model": "openai/gpt-oss-120b:free",
                      "messages": [{"role": "user", "content": "كم سعر الشحن للإسكندرية في شحني؟"}],
                      "max_tokens": 100}
            )
            if response.status_code == 200:
                text = response.json()["choices"][0]["message"]["content"]
                return {"success": True, "response": text}
            return {"success": False, "status": response.status_code, "body": response.text[:200]}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.get("/test-gemini")
async def test_gemini():
    """Live test Gemini API."""
    from app.services.gemini_ai import gemini_generate
    result = await gemini_generate(
        system_prompt="أنت مساعد شحني للشحن في مصر",
        user_message="كم سعر الشحن للإسكندرية؟"
    )
    return {"gemini_response": result, "success": result is not None}

@router.get("/test-groq")
async def test_groq():
    """Live test Groq API."""
    service = get_groq_service()
    try:
        import httpx
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                service.GROQ_API_URL,
                headers={"Authorization": f"Bearer {service.api_key}", "Content-Type": "application/json"},
                json={"model": service.model, "messages": [{"role": "user", "content": "hi"}], "max_tokens": 10}
            )
            return {"status_code": response.status_code, "success": response.status_code == 200, "body": response.text[:200]}
    except Exception as e:
        return {"error": str(e), "success": False}
