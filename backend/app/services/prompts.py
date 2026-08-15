"""
Prompt Generation Service

This module is responsible for generating dynamic system prompts for the AI agent.
By decoupling this from the HTTP routes, we maintain a clean separation of concerns.
"""

from typing import List, Optional
from app.models.customer import Customer
from app.models.shipment import Shipment

def build_system_prompt(current_user: Optional[Customer], shipments: List[Shipment]) -> str:
    """
    Constructs the contextual system prompt based on user state and active shipments.
    
    Args:
        current_user: The authenticated customer object, or None if guest.
        shipments: A list of active shipments for the user.
        
    Returns:
        A formatted string containing the instructions and context for the LangGraph agent.
    """
    if current_user:
        shipments_info = "None"
        if shipments:
            # Format the active shipments for the AI context
            shipments_info = "\n".join(
                [f"- Tracking: {s.tracking_number}, Status: {s.status.value}, Destination: {s.destination}" for s in shipments]
            )
        
        # Handle admin privileges
        if current_user.role.value == 'admin':
            return (
                f"SYSTEM INTERNAL CONTEXT: You are talking to a SYSTEM ADMIN.\n"
                f"Name: {current_user.full_name}\n"
                f"Email: {current_user.email}\n\n"
                f"CRITICAL RULE: Since this user is an admin, they have FULL CLEARANCE. Do NOT ask them to verify their identity. "
                f"If they ask about any shipment, provide the details immediately. "
                f"If they ask for information about a specific customer, use the search_customer tool to find their profile and shipments. "
                f"IMPORTANT: You MUST process tool calls in English. If the user speaks Arabic, translate the intent to English for the tool call, and then reply to the user in Arabic."
            )
        
        # Standard authenticated user context
        return (
            f"SYSTEM INTERNAL CONTEXT: You are talking to a logged-in customer.\n"
            f"Name: {current_user.full_name}\n"
            f"Email: {current_user.email}\n"
            f"Phone: {current_user.phone}\n"
            f"Balance: {current_user.wallet_balance} EGP\n\n"
            f"Active Shipments:\n{shipments_info}\n\n"
            f"CRITICAL RULES:\n"
            f"1. If the user asks about a shipment that is EXACTLY listed in their 'Active Shipments' above, you DO NOT need to call any tools. Answer them directly.\n"
            f"2. If they ask about a shipment NOT in their list, you MUST use the 'get_shipment_status' tool. "
            f"IF the tool says the shipment exists, you MUST ask the user to verify their identity. "
            f"IF the tool says the shipment does not exist, tell the user politely and STOP. Do NOT ask for verification.\n"
            f"3. Once the user replies with verification data, you MUST use the 'verify_and_get_shipment' tool. NEVER HALLUCINATE data.\n"
            f"4. If the user asks general questions (e.g. shipping rates, return policy), use the 'search_knowledge_base' tool. Do NOT guess."
        )

    # Anonymous user context
    return (
        f"SYSTEM INTERNAL CONTEXT: You are talking to an anonymous guest user.\n"
        f"CRITICAL RULE: If the user asks about a shipment or booking, you MUST use the 'get_shipment_status' tool. "
        f"IF the tool says the shipment exists, you MUST ask the user to provide their Name, Phone, or Email for verification. "
        f"IF the tool says the shipment does not exist, tell the user politely and STOP. Do NOT ask for verification.\n"
        f"Once they provide verification data, you MUST use the 'verify_and_get_shipment' tool. "
        f"NEVER HALLUCINATE data. Only rely on the tool responses. If verification fails, tell the user politely.\n"
        f"If the user asks general questions, use the 'search_knowledge_base' tool."
    )
