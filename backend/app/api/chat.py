"""
Chat API Endpoints - Enterprise Autonomous Agent
Handles real-time communication between customers and the AI support engine.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional
from uuid import uuid4

from app.api.deps import get_optional_current_user
from app.models.customer import Customer
from app.models.shipment import Shipment
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.services.prompts import build_system_prompt

# Configure module logger for observability
logger = logging.getLogger(__name__)

# Graceful fallback if AI libraries aren't installed yet
try:
    from langfuse.callback import CallbackHandler as LangfuseHandler
    _langfuse_available = True
except ImportError:
    _langfuse_available = False
    LangfuseHandler = None

try:
    from app.services.agent import compiled_graph
    _agent_available = True
except ImportError:
    _agent_available = False
    compiled_graph = None

router = APIRouter(prefix="/api/chat", tags=["chat"])

class ChatRequest(BaseModel):
    """Chat message request."""
    session_id: Optional[str] = Field(None, description="Unique session ID for memory context")
    message: str = Field(..., min_length=1, max_length=2000, description="User message")

class ChatResponse(BaseModel):
    """AI chat response."""
    session_id: str = Field(..., description="Session ID used for this conversation")
    response: str = Field(..., description="The AI agent's response")

@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest, 
    current_user: Customer | None = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
) -> ChatResponse:
    """
    Process an incoming chat message using the LangGraph AI agent.
    If AI services are unavailable, falls back to static responses.
    """
    session_id = request.session_id if request.session_id else str(uuid4())

    if not _agent_available or compiled_graph is None:
        # Graceful fallback when AI libs aren't installed
        logger.warning("AI services unavailable. Using fallback response.")
        from app.services.fallback_responses import get_fallback_response
        response_text = get_fallback_response(request.message)
        return ChatResponse(session_id=session_id, response=response_text)

    try:
        callbacks = []
        if _langfuse_available and LangfuseHandler:
            langfuse_handler = LangfuseHandler(
                session_id=session_id,
                user_id=current_user.email if current_user else "anonymous",
                tags=["langgraph-agent"]
            )
            callbacks = [langfuse_handler]

        config = {
            "configurable": {"thread_id": session_id},
            "callbacks": callbacks
        }

        # Build dynamic context based on user auth state and active shipments
        messages_to_send = []
        shipments = []
        if current_user:
            result = await db.execute(select(Shipment).where(Shipment.customer_id == current_user.id))
            shipments = result.scalars().all()
            
        system_msg = build_system_prompt(current_user, shipments)
        messages_to_send.append(("system", system_msg))
        messages_to_send.append(("user", request.message))

        # Invoke the LangGraph agent
        result = await compiled_graph.ainvoke(
            {"messages": messages_to_send},
            config=config
        )

        final_message = result["messages"][-1].content

        return ChatResponse(
            session_id=session_id,
            response=final_message
        )

    except Exception as e:
        # CRITICAL: Always log full stack traces for production debugging
        logger.error(f"Chat endpoint failed for session {session_id}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="An internal error occurred while processing the chat request."
        )
