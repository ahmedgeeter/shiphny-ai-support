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
        A message instructing you to verify the user's identity first.
    """
    return (
        f"Shipment {tracking_number} is secured. DO NOT hallucinate details. "
        f"You MUST ask the user to provide their Email, Phone Number, or Full Name. "
        f"Once they provide it, use the 'verify_and_get_shipment' tool to get the real details."
    )

@tool
async def verify_and_get_shipment(tracking_number: str, verification_value: str) -> str:
    """
    Verify the user's identity and retrieve their shipment details.
    
    Use this tool AFTER asking the user for their email, name, or phone number.
    
    Args:
        tracking_number: The exact tracking number (e.g., 'SHP-12345').
        verification_value: The email, name, or phone number the user provided.
        
    Returns:
        The shipment details if verification succeeds, or an error if it fails.
    """
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(Shipment).options(selectinload(Shipment.customer)).where(Shipment.tracking_number == tracking_number)
            )
            shipment = result.scalar_one_or_none()
            
            if not shipment:
                return f"Could not find any shipment with tracking number: {tracking_number}."
            
            customer = shipment.customer
            if not customer:
                return "Shipment has no owner. Cannot verify."
                
            val = verification_value.strip().lower()
            
            phone_match = False
            if customer.phone:
                digits_db = "".join(c for c in customer.phone if c.isdigit())
                digits_val = "".join(c for c in val if c.isdigit())
                if digits_val and len(digits_val) >= 4 and digits_val in digits_db:
                    phone_match = True
                    
            email_match = False
            if customer.email and customer.email.strip().lower() == val:
                email_match = True
                
            name_match = False
            if customer.full_name:
                db_words = customer.full_name.strip().lower().split()
                val_words = val.split()
                if len(val_words) >= 2 and len(db_words) >= 2:
                    if db_words[:2] == val_words[:2]:
                        name_match = True
                elif len(val_words) == 1 and len(db_words) >= 1:
                    if db_words[0] == val_words[0]:
                        name_match = True
            
            if not (phone_match or email_match or name_match):
                return "Verification failed. The provided information does not match the owner of this shipment."
            
            est_delivery = shipment.estimated_delivery.strftime("%Y-%m-%d") if shipment.estimated_delivery else "Unknown"
            
            return (
                f"Verification Successful!\n"
                f"Shipment {tracking_number} Details:\n"
                f"- Status: {shipment.status.value}\n"
                f"- Destination: {shipment.destination}\n"
                f"- Estimated Delivery: {est_delivery}"
            )
    except Exception as e:
        return f"An error occurred while verifying the shipment: {str(e)}."

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
