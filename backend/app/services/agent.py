import os
from typing import Annotated, TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode
from langchain_core.messages import BaseMessage

# Import our tools
from app.services.tools.shipment_tools import get_shipment_status, cancel_shipment
from app.services.tools.billing_tools import get_billing_info

# Import our router
from app.services.router import get_llm_for_query

# Import redis checkpointer
try:
    from langgraph.checkpoint.redis import AsyncRedisSaver
except ImportError:
    # Fallback if specific package isn't installed
    from langgraph.checkpoint.memory import MemorySaver as AsyncRedisSaver

# Define AgentState
class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]

# Initialize Tools
tools = [get_shipment_status, cancel_shipment, get_billing_info]

def call_model(state: AgentState):
    """
    Node that calls the LLM based on our routing logic and the latest user message.
    """
    messages = state["messages"]
    # Get the last user query to determine routing
    last_message = messages[-1].content if messages else ""
    
    # Route to heavy or fast model
    llm = get_llm_for_query(last_message)
    
    # Bind tools to the LLM
    llm_with_tools = llm.bind_tools(tools)
    
    # Invoke model with all messages
    response = llm_with_tools.invoke(messages)
    
    return {"messages": [response]}

def should_continue(state: AgentState) -> str:
    """
    Conditional edge to determine whether to call tools or end the conversation.
    """
    messages = state["messages"]
    last_message = messages[-1]
    
    if last_message.tool_calls:
        return "tools"
    return END

# Build StateGraph
workflow = StateGraph(AgentState)

workflow.add_node("call_model", call_model)
workflow.add_node("tools", ToolNode(tools))

workflow.add_edge(START, "call_model")
workflow.add_conditional_edges("call_model", should_continue, {"tools": "tools", END: END})
workflow.add_edge("tools", "call_model")

# Get Redis connection info from environment
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")

def get_compiled_graph():
    """
    Returns the compiled graph with the Redis Checkpointer for conversational memory.
    """
    # Parse redis URL for from_conn_info or use from_conn_string if available
    try:
        from urllib.parse import urlparse
        parsed = urlparse(redis_url)
        host = parsed.hostname or "localhost"
        port = parsed.port or 6379
        db = int(parsed.path.lstrip('/')) if parsed.path and parsed.path.lstrip('/') else 0
        
        checkpointer = AsyncRedisSaver.from_conn_info(host=host, port=port, db=db)
    except Exception:
        # Fallback to memory saver if redis is not available or parsing fails
        from langgraph.checkpoint.memory import MemorySaver
        checkpointer = MemorySaver()
        
    return workflow.compile(checkpointer=checkpointer)

compiled_graph = get_compiled_graph()
