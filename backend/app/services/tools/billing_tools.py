from langchain_core.tools import tool
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.database import AsyncSessionLocal
from app.models.customer import Customer
from app.models.invoice import InvoiceStatus

@tool
async def get_billing_info(email: str) -> str:
    """
    Retrieve the billing information and outstanding invoices for a customer.
    
    Use this tool when a user asks about their wallet balance, payment dues, or unpaid invoices.
    Requires the customer's email address.
    
    Args:
        email: The email address of the customer.
        
    Returns:
        A formatted string detailing the customer's wallet balance and a summary of any 'Unpaid' 
        invoices (including the amount and due date), or a message indicating that the customer 
        was not found.
    """
    try:
        async with AsyncSessionLocal() as session:
            # Query the customer and eagerly load their invoices
            result = await session.execute(
                select(Customer)
                .options(selectinload(Customer.invoices))
                .where(Customer.email == email)
            )
            customer = result.scalar_one_or_none()
            
            if not customer:
                return f"Could not find any customer profile associated with the email: {email}. Please ask the user to verify their email address."
            
            # Filter unpaid invoices
            unpaid_invoices = [inv for inv in customer.invoices if inv.status == InvoiceStatus.UNPAID]
            
            summary = (
                f"Billing Information for {customer.name}:\n"
                f"- Wallet Balance: ${customer.wallet_balance:.2f}\n"
            )
            
            if unpaid_invoices:
                summary += f"- Unpaid Invoices ({len(unpaid_invoices)}):\n"
                for inv in unpaid_invoices:
                    due = inv.due_date.strftime("%Y-%m-%d") if inv.due_date else "Unknown"
                    summary += f"  * Invoice {inv.id}: ${inv.amount:.2f} (Due: {due})\n"
            else:
                summary += "- Unpaid Invoices: None\n"
                
            return summary
            
    except Exception as e:
        return f"An error occurred while retrieving the billing information: {str(e)}. Please inform the user that we are experiencing technical difficulties."
