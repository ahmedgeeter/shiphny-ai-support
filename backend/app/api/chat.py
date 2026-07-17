"""
Chat API Endpoints - Enterprise Autonomous Agent
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional
from uuid import uuid4

# Import Langfuse callback handler for LLMOps
from langfuse.callback import CallbackHandler

# Import our compiled LangGraph agent
from app.services.agent import compiled_graph

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
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Send a message to the Autonomous LangGraph Agent.
    
    This endpoint:
    - Maintains conversation state via Redis Checkpointer using `session_id` as `thread_id`.
    - Traces every LLM reasoning step and tool call via Langfuse.
    - Routes queries dynamically based on complexity (Cloud FinOps).
    """
    try:
        # Generate a new session_id if none was provided
        session_id = request.session_id if request.session_id else str(uuid4())
        
        # Initialize Langfuse Callback Handler for LLMOps auditing
        # Make sure LANGFUSE_SECRET_KEY, LANGFUSE_PUBLIC_KEY, and LANGFUSE_HOST are in the environment
        langfuse_handler = CallbackHandler(
            session_id=session_id,
            user_id="anonymous", # Or pass authenticated user_id if available
            tags=["langgraph-agent"]
        )
        
        # Configure the LangGraph invocation with the thread_id and callback
        config = {
            "configurable": {"thread_id": session_id},
            "callbacks": [langfuse_handler]
        }
        
        # Invoke the compiled graph asynchronously
        result = await compiled_graph.ainvoke(
            {"messages": [("user", request.message)]}, 
            config=config
        )
        
        # The final message in the state is the agent's response
        final_message = result["messages"][-1].content
        
        return ChatResponse(
            session_id=session_id,
            response=final_message
        )
        
    except Exception as e:
        # Prevent FastAPI crash and return friendly error
        raise HTTPException(
            status_code=500, 
            detail=f"An error occurred while processing the request: {str(e)}"
        )
