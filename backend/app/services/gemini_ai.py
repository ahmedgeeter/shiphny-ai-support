"""
Gemini AI Service - Fallback when Groq rate limits
Uses gemini-2.0-flash via REST API (no extra SDK needed)
"""

import os
import time
import httpx
from typing import Optional


GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"


async def gemini_generate(system_prompt: str, user_message: str, history: list = None) -> Optional[str]:
    """Call Gemini API and return text response, or None on failure."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    contents = []

    if history:
        for msg in history[-6:]:
            role = "user" if msg.get("role") == "user" else "model"
            contents.append({"role": role, "parts": [{"text": msg.get("content", "")}]})

    contents.append({"role": "user", "parts": [{"text": user_message}]})

    payload = {
        "system_instruction": {"parts": [{"text": system_prompt}]},
        "contents": contents,
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 512,
            "topP": 0.9,
        }
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{GEMINI_API_URL}?key={api_key}",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            data = response.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        print(f"[Gemini] Error: {e}")
        return None
