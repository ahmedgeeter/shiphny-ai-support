from langchain_core.tools import tool
from pydantic import BaseModel, Field
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from app.db.database import AsyncSessionLocal
from app.models.customer import Customer
from app.models.shipment import Shipment

class SearchCustomerArgs(BaseModel):
    query: str = Field(description="The exact name, email, or phone number of the customer to search for.")

@tool(args_schema=SearchCustomerArgs)
async def search_customer(query: str) -> str:
    """
    Search for a customer by their name, email, or phone number.
    Use this tool when an Admin asks for information about a specific customer.
    """
    try:
        async with AsyncSessionLocal() as session:
            # Search by name (partial match), exact email, or exact phone
            stmt = select(Customer).options(
                selectinload(Customer.shipments)
            ).where(
                or_(
                    Customer.full_name.ilike(f"%{query}%"),
                    Customer.email == query,
                    Customer.phone == query
                )
            ).limit(5)
            
            result = await session.execute(stmt)
            customers = result.scalars().all()
            
            if not customers:
                return f"Could not find any customer matching '{query}'."
            
            responses = []
            for customer in customers:
                # Format recent shipments
                recent_shipments = sorted(customer.shipments, key=lambda s: s.created_at, reverse=True)[:3]
                shipments_str = "None"
                if recent_shipments:
                    shipments_str = "\n  ".join([f"- {s.tracking_number} ({s.status.value}) to {s.destination}" for s in recent_shipments])
                
                info = (
                    f"Customer ID: {customer.id}\n"
                    f"Name: {customer.full_name}\n"
                    f"Email: {customer.email}\n"
                    f"Phone: {customer.phone}\n"
                    f"Role: {customer.role.value}\n"
                    f"Status: {'Active' if getattr(customer, 'is_active', True) else 'Inactive'}\n"
                    f"Tier: {customer.tier.value}\n"
                    f"Wallet Balance: {customer.wallet_balance} EGP\n"
                    f"Total Orders: {customer.total_orders}\n"
                    f"Total Spent: {customer.total_spent_egp} EGP\n"
                    f"Recent Shipments:\n  {shipments_str}"
                )
                responses.append(info)
                
            return "\n\n---\n\n".join(responses)
            
    except Exception as e:
        return f"An error occurred while searching for the customer: {str(e)}"
