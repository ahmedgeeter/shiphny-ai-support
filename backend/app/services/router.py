import os
import logging
from typing import Optional
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq

logger = logging.getLogger("shiphny.router")

def get_primary_and_fallback_llms():
    """
    Initializes primary and fallback LLMs based on available API credentials.
    Returns primary LLM equipped with fallback providers for resilient execution.
    """
    models = []

    # Provider 1: Groq (Ultra-fast latency for real-time customer assistance)
    if os.getenv("GROQ_API_KEY"):
        try:
            models.append(ChatGroq(model="llama-3.3-70b-versatile", temperature=0.1))
        except Exception as e:
            logger.warning(f"Failed to initialize Groq model: {e}")

    # Provider 2: Google Gemini (High contextual capacity fallback)
    if os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY"):
        try:
            models.append(ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.1))
        except Exception as e:
            logger.warning(f"Failed to initialize Gemini model: {e}")

    # Provider 3: OpenAI (Secondary fallback)
    if os.getenv("OPENAI_API_KEY"):
        try:
            models.append(ChatOpenAI(model="gpt-4o-mini", temperature=0.1))
        except Exception as e:
            logger.warning(f"Failed to initialize OpenAI model: {e}")

    if not models:
        # Default development stub if no credentials are configured
        logger.warning("No external LLM credentials configured. Defaulting to Gemini 1.5 Flash.")
        return ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0)

    primary = models[0]
    fallbacks = models[1:]

    if fallbacks:
        return primary.with_fallbacks(fallbacks)
    return primary

def get_llm_for_query(user_query: Optional[str] = None):
    """
    Returns an LLM client with built-in automated provider fallback.
    """
    return get_primary_and_fallback_llms()
