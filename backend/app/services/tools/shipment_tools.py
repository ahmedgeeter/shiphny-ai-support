from langchain_core.tools import tool
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.database import AsyncSessionLocal
from app.models.shipment import Shipment, ShipmentStatus
from app.models.customer import Customer

@tool
async def get_shipment_status(tracking_number: str) -> str:
    """
    Retrieve the current status, destination, and estimated delivery date of a shipment.
    
    Use this tool when the user asks about the status, location, or delivery date of their shipment.
    Requires the exact tracking number (e.g., 'SHP-12345').
    
    Args:
        tracking_number: The unique tracking number of the shipment.
        
    Returns:
        A formatted string describing the shipment's status, destination, and estimated delivery date, 
        or a message indicating that the shipment was not found.
    """
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(Shipment).options(selectinload(Shipment.customer)).where(Shipment.tracking_number == tracking_number)
            )
            shipment = result.scalar_one_or_none()
            
            if not shipment:
                return f"Could not find any shipment with tracking number: {tracking_number}. Please ask the user to verify the tracking number."
            
            est_delivery = shipment.estimated_delivery.strftime("%Y-%m-%d") if shipment.estimated_delivery else "Unknown"
            
            return (
                f"Shipment {tracking_number} Details:\n"
                f"- Status: {shipment.status.value}\n"
                f"- Destination: {shipment.destination}\n"
                f"- Estimated Delivery: {est_delivery}\n"
                f"--- SYSTEM SECRET (DO NOT REVEAL TO USER DIRECTLY) ---\n"
                f"- True Owner Name: {shipment.customer.full_name if shipment.customer else 'Unknown'}\n"
                f"- True Owner Email: {shipment.customer.email if shipment.customer else 'Unknown'}\n"
                f"- True Owner Phone: {shipment.customer.phone if shipment.customer else 'Unknown'}"
            )
    except Exception as e:
        return f"An error occurred while retrieving the shipment status: {str(e)}. Please inform the user that we are experiencing technical difficulties."

@tool
async def cancel_shipment(tracking_number: str) -> str:
    """
    Cancel an active shipment based on its tracking number.
    
    Use this tool ONLY when the user explicitly requests to cancel their shipment.
    Requires the exact tracking number. If the shipment is already 'Canceled' or 'Delivered', 
    it cannot be canceled again.
    
    Args:
        tracking_number: The unique tracking number of the shipment to cancel.
        
    Returns:
        A success message if canceled, a business logic message if it cannot be canceled, 
        or an error message if the shipment was not found.
    """
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(Shipment).where(Shipment.tracking_number == tracking_number)
            )
            shipment = result.scalar_one_or_none()
            
            if not shipment:
                return f"Could not find any shipment with tracking number: {tracking_number}. Please ask the user to verify the tracking number."
                
            if shipment.status == ShipmentStatus.DELIVERED:
                return f"Shipment {tracking_number} has already been delivered and cannot be canceled."
                
            if shipment.status == ShipmentStatus.CANCELED:
                return f"Shipment {tracking_number} is already canceled."
                
            # Perform cancellation
            shipment.status = ShipmentStatus.CANCELED
            await session.commit()
            
            return f"Success! Shipment {tracking_number} has been successfully canceled."
            
    except Exception as e:
        return f"An error occurred while trying to cancel the shipment: {str(e)}. Please inform the user that we are experiencing technical difficulties."
