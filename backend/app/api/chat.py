"""
Chat API Endpoints - Enterprise Autonomous Agent
"""

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
    Send a message to the Autonomous LangGraph Agent.
    Falls back to static response if AI libraries are not available.
    """
    session_id = request.session_id if request.session_id else str(uuid4())

    if not _agent_available or compiled_graph is None:
        # Graceful fallback when AI libs aren't installed
        from app.services.fallback_responses import get_fallback_response
        response_text = get_fallback_response(request.message)
        return ChatResponse(session_id=session_id, response=response_text)

    try:
        callbacks = []
        if _langfuse_available and LangfuseHandler:
            langfuse_handler = LangfuseHandler(
                session_id=session_id,
                user_id="anonymous",
                tags=["langgraph-agent"]
            )
            callbacks = [langfuse_handler]

        config = {
            "configurable": {"thread_id": session_id},
            "callbacks": callbacks
        }

        # Inject system context if user is logged in
        messages_to_send = []
        if current_user:
            # Fetch user shipments
            result = await db.execute(select(Shipment).where(Shipment.customer_id == current_user.id))
            shipments = result.scalars().all()
            
            shipments_info = "None"
            if shipments:
                shipments_info = "\n".join([f"- Tracking: {s.tracking_number}, Status: {s.status.value}, Destination: {s.destination}" for s in shipments])
            
            if current_user.role.value == 'admin':
                system_msg = (
                    f"SYSTEM INTERNAL CONTEXT: You are talking to a SYSTEM ADMIN.\n"
                    f"Name: {current_user.full_name}\n"
                    f"Email: {current_user.email}\n"
                    f"CRITICAL RULE: Since this user is an admin, they have FULL CLEARANCE. Do NOT ask them to verify their identity. "
                    f"If they ask about any shipment, provide the details immediately. "
                    f"If they ask for information about a specific customer, use the search_customer tool to find their profile and shipments. "
                    f"IMPORTANT: You MUST process tool calls in English. If the user speaks Arabic, translate the intent to English for the tool call, and then reply to the user in Arabic."
                )
            else:
                system_msg = (
                    f"SYSTEM INTERNAL CONTEXT: You are talking to a logged-in customer.\n"
                    f"Name: {current_user.full_name}\n"
                    f"Email: {current_user.email}\n"
                    f"Phone: {current_user.phone}\n"
                    f"Balance: {current_user.wallet_balance} EGP\n"
                    f"Active Shipments:\n{shipments_info}\n"
                    f"CRITICAL RULES:\n"
                    f"1. If they ask about a shipment in their 'Active Shipments' list, answer directly.\n"
                    f"2. If they ask about a shipment NOT in their list, you will see a 'SYSTEM SECRET True Owner' when you use the tool. "
                    f"You MUST verify that the True Owner matches the user's details above. If it does NOT match, tell them they don't have access to this shipment."
                )
            messages_to_send.append(("system", system_msg))
        else:
            system_msg = (
                f"SYSTEM INTERNAL CONTEXT: You are talking to an anonymous guest user.\n"
                f"CRITICAL RULE: If the user asks about a shipment or booking, you MUST use the provided tools to fetch the data. "
                f"HOWEVER, you will see a 'SYSTEM SECRET True Owner' in the tool response. "
                f"DO NOT REVEAL THE DETAILS YET. You MUST explicitly ask the user to verify their identity by providing one of the following: "
                f"1. Their first two names\n"
                f"2. Their phone number\n"
                f"3. Their email address\n"
                f"If the information they provide does NOT MATCH the 'True Owner' details from the database, you MUST refuse to disclose the shipment info. "
                f"NEVER HALLUCINATE data. Only rely on the database tool responses."
            )
            messages_to_send.append(("system", system_msg))
            
        messages_to_send.append(("user", request.message))

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
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while processing the request: {str(e)}"
        )

