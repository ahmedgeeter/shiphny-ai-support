import os
from deerflow import DeerFlow, Agent
from typing import Dict, Any

class SupportOrchestrator:
    """
    DeerFlow orchestration layer that integrates multiple specialized sub-agents
    (e.g., support, booking, tracking) into a unified enterprise agent harness.
    """
    
    def __init__(self):
        # Initialize the DeerFlow superagent
        self.orchestrator = DeerFlow(name="SupportBot_SuperAgent")
        
        # Configure sub-agents
        self.support_agent = Agent(
            name="General_Support",
            description="Handles general support queries and FAQs."
        )
        
        self.booking_agent = Agent(
            name="Booking_Specialist",
            description="Handles new shipment bookings and pricing."
        )
        
        # Register agents to the orchestrator
        self.orchestrator.register_agent(self.support_agent)
        self.orchestrator.register_agent(self.booking_agent)
        
    async def process_message(self, message: str, customer_context: Dict[str, Any]) -> str:
        """
        Process a user message through the DeerFlow orchestrator, tracking with Langfuse.
        """
        # Inject context into DeerFlow memory
        self.orchestrator.memory.inject_context(customer_context)
        
        # Execute the request
        response = await self.orchestrator.execute(message)
        return response

# Singleton instance
orchestrator = SupportOrchestrator()
