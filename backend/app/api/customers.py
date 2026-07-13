"""
Customers API Endpoints - Customer management
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.models.customer import Customer, CustomerTier


router = APIRouter(prefix="/api/customers", tags=["customers"])


class CustomerResponse(BaseModel):
    """Customer response model."""
    id: int
    full_name: str
    email: str
    phone: Optional[str]
    tier: str
    total_orders: int
    total_spent_egp: float
    
    class Config:
        from_attributes = True


@router.get("")
async def list_customers(
    tier: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
) -> list[CustomerResponse]:
    """List customers with filters."""
    
    query = select(Customer).order_by(desc(Customer.created_at))
    
    if tier:
        query = query.where(Customer.tier == tier)
    
    if search:
        search_filter = f"%{search}%"
        query = query.where(
            (Customer.full_name.ilike(search_filter)) |
            (Customer.email.ilike(search_filter))
        )
    
    query = query.limit(limit).offset(offset)
    
    result = await db.execute(query)
    customers = result.scalars().all()
    
    return [
        CustomerResponse(
            id=c.id,
            full_name=c.full_name,
            email=c.email,
            phone=c.phone,
            tier=c.tier.value if c.tier else "unknown",
            total_orders=c.total_orders,
            total_spent_egp=c.total_spent_egp
        )
        for c in customers
    ]


@router.get("/{customer_id}")
async def get_customer(
    customer_id: int,
    db: AsyncSession = Depends(get_db)
) -> CustomerResponse:
    """Get customer details."""
    
    result = await db.execute(
        select(Customer).where(Customer.id == customer_id)
    )
    customer = result.scalar_one_or_none()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return CustomerResponse(
        id=customer.id,
        full_name=customer.full_name,
        email=customer.email,
        phone=customer.phone,
        tier=customer.tier.value if customer.tier else "unknown",
        total_orders=customer.total_orders,
        total_spent_egp=customer.total_spent_egp
    )
