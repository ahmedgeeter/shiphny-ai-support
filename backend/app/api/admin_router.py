from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import Any, List
from pydantic import BaseModel

from app.db.database import get_db
from app.models.customer import Customer, CustomerTier
from app.models.shipment import Shipment, ShipmentStatus
from app.api.deps import get_current_active_admin
from app.api.auth_router import UserResponse, ShipmentResponse

router = APIRouter(prefix="/api/admin", tags=["admin"])

class CustomerAdminResponse(UserResponse):
    wallet_balance: float
    total_orders: int
    total_spent_egp: float
    tier: CustomerTier
    is_active: bool

class CustomerUpdate(BaseModel):
    wallet_balance: float | None = None
    is_active: bool | None = None

class ShipmentUpdate(BaseModel):
    status: ShipmentStatus | None = None
    estimated_delivery: str | None = None

@router.get("/customers", response_model=List[CustomerAdminResponse])
async def get_all_customers(db: AsyncSession = Depends(get_db), current_admin: Customer = Depends(get_current_active_admin)):
    result = await db.execute(select(Customer).order_by(Customer.created_at.desc()))
    customers = result.scalars().all()
    return customers

@router.put("/customers/{customer_id}", response_model=CustomerAdminResponse)
async def update_customer(customer_id: int, update_data: CustomerUpdate, db: AsyncSession = Depends(get_db), current_admin: Customer = Depends(get_current_active_admin)):
    result = await db.execute(select(Customer).where(Customer.id == customer_id))
    customer = result.scalars().first()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    if update_data.wallet_balance is not None:
        customer.wallet_balance = update_data.wallet_balance
    if update_data.is_active is not None:
        customer.is_active = update_data.is_active
        
    await db.commit()
    await db.refresh(customer)
    return customer

@router.get("/customers/{customer_id}/shipments", response_model=List[ShipmentResponse])
async def get_customer_shipments(customer_id: int, db: AsyncSession = Depends(get_db), current_admin: Customer = Depends(get_current_active_admin)):
    result = await db.execute(select(Shipment).where(Shipment.customer_id == customer_id).order_by(Shipment.created_at.desc()))
    shipments = result.scalars().all()
    
    return [ShipmentResponse(
        id=s.id,
        tracking_number=s.tracking_number,
        status=s.status.value,
        destination=s.destination,
        estimated_delivery=s.estimated_delivery
    ) for s in shipments]

@router.put("/shipments/{shipment_id}", response_model=ShipmentResponse)
async def update_shipment(shipment_id: int, update_data: ShipmentUpdate, db: AsyncSession = Depends(get_db), current_admin: Customer = Depends(get_current_active_admin)):
    result = await db.execute(select(Shipment).where(Shipment.id == shipment_id))
    shipment = result.scalars().first()
    
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
        
    if update_data.status is not None:
        shipment.status = update_data.status
    if update_data.estimated_delivery is not None:
        from datetime import datetime
        try:
            shipment.estimated_delivery = datetime.fromisoformat(update_data.estimated_delivery.replace('Z', '+00:00'))
        except ValueError:
            pass # Ignore invalid date formats for now
            
    await db.commit()
    await db.refresh(shipment)
    
    return ShipmentResponse(
        id=shipment.id,
        tracking_number=shipment.tracking_number,
        status=shipment.status.value,
        destination=shipment.destination,
        estimated_delivery=shipment.estimated_delivery
    )
