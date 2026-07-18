import os
from typing import Annotated, TypedDict

# Graceful fallback if AI libraries aren't installed
try:
    from langgraph.graph import StateGraph, START, END
    from langgraph.graph.message import add_messages
    from langgraph.prebuilt import ToolNode
    from langchain_core.messages import BaseMessage
    from app.services.tools.shipment_tools import get_shipment_status, cancel_shipment
    from app.services.tools.billing_tools import get_billing_info
    from app.services.tools.customer_tools import search_customer
    from app.services.router import get_llm_for_query
    _ai_available = True
except ImportError:
    _ai_available = False

try:
    from langgraph.checkpoint.redis import AsyncRedisSaver
except ImportError:
    try:
        from langgraph.checkpoint.memory import MemorySaver as AsyncRedisSaver
    except ImportError:
        AsyncRedisSaver = None

def _build_graph():
    """Build LangGraph only if AI libs are available."""
    if not _ai_available:
        return None

    class AgentState(TypedDict):
        messages: Annotated[list[BaseMessage], add_messages]

    tools = [get_shipment_status, cancel_shipment, get_billing_info, search_customer]

    def call_model(state: AgentState):
        messages = state["messages"]
        last_message = messages[-1].content if messages else ""
        llm = get_llm_for_query(last_message)
        llm_with_tools = llm.bind_tools(tools)
        response = llm_with_tools.invoke(messages)
        return {"messages": [response]}

    def should_continue(state: AgentState) -> str:
        messages = state["messages"]
        last_message = messages[-1]
        if last_message.tool_calls:
            return "tools"
        return END

    workflow = StateGraph(AgentState)
    workflow.add_node("call_model", call_model)
    workflow.add_node("tools", ToolNode(tools))
    workflow.add_edge(START, "call_model")
    workflow.add_conditional_edges("call_model", should_continue, {"tools": "tools", END: END})
    workflow.add_edge("tools", "call_model")

    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    try:
        from urllib.parse import urlparse
        parsed = urlparse(redis_url)
        host = parsed.hostname or "localhost"
        port = parsed.port or 6379
        db = int(parsed.path.lstrip('/')) if parsed.path and parsed.path.lstrip('/') else 0
        if AsyncRedisSaver:
            checkpointer = AsyncRedisSaver.from_conn_info(host=host, port=port, db=db)
        else:
            raise Exception("No checkpointer available")
    except Exception:
        try:
            from langgraph.checkpoint.memory import MemorySaver
            checkpointer = MemorySaver()
        except ImportError:
            checkpointer = None

    if checkpointer:
        return workflow.compile(checkpointer=checkpointer)
    return workflow.compile()

compiled_graph = _build_graph()
