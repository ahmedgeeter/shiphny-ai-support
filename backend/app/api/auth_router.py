from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Any

from app.db.database import get_db
from app.models.customer import Customer, RoleEnum
from app.core.security import get_password_hash, verify_password, create_access_token
from app.api.deps import get_current_active_user, get_current_active_admin
from app.models.shipment import Shipment
from pydantic import BaseModel, EmailStr
from datetime import datetime

router = APIRouter(prefix="/api/auth", tags=["auth"])

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None
    role: RoleEnum = RoleEnum.CUSTOMER

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str | None
    role: RoleEnum
    
    class Config:
        from_attributes = True

@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)) -> Any:
    result = await db.execute(select(Customer).where(Customer.email == user_in.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    user = Customer(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name or "New Customer",
        role=user_in.role,
        wallet_balance=1000.0  # Free initial balance
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)) -> Any:
    result = await db.execute(select(Customer).where(Customer.email == form_data.username))
    user = result.scalars().first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not getattr(user, 'is_active', True):
        raise HTTPException(status_code=400, detail="Inactive user")
        
    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role.value,          # ← tell frontend the role immediately
        "full_name": user.full_name or "",
        "user_id": user.id,
    }

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: Customer = Depends(get_current_active_user)) -> Any:
    return current_user

class ShipmentResponse(BaseModel):
    id: int
    tracking_number: str
    status: str
    destination: str
    estimated_delivery: datetime | None

    class Config:
        from_attributes = True

class DashboardResponse(BaseModel):
    user: UserResponse
    balance: float
    total_orders: int
    shipments: list[ShipmentResponse]

@router.get("/me/dashboard", response_model=DashboardResponse)
async def get_my_dashboard(current_user: Customer = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)) -> Any:
    result = await db.execute(select(Shipment).where(Shipment.customer_id == current_user.id).order_by(Shipment.created_at.desc()))
    shipments = result.scalars().all()
    
    return DashboardResponse(
        user=current_user,
        balance=current_user.wallet_balance,
        total_orders=current_user.total_orders,
        shipments=[ShipmentResponse(
            id=s.id,
            tracking_number=s.tracking_number,
            status=s.status.value,
            destination=s.destination,
            estimated_delivery=s.estimated_delivery
        ) for s in shipments]
    )

class ShipmentCreate(BaseModel):
    destination: str

@router.post("/me/shipments", response_model=ShipmentResponse)
async def create_my_shipment(shipment_in: ShipmentCreate, current_user: Customer = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)) -> Any:
    import random
    import string
    
    # Generate random tracking number
    digits = "".join(random.choices(string.digits, k=4))
    letters = "".join(random.choices(string.ascii_uppercase, k=2))
    tracking = f"SHP-{letters}-{digits}"
    
    cost = 150.0  # Simulated fixed cost
    
    # Update customer stats
    current_user.total_orders += 1
    current_user.total_spent_egp += cost
    if current_user.wallet_balance >= cost:
        current_user.wallet_balance -= cost
        
    # Create shipment
    from app.models.shipment import ShipmentStatus
    new_shipment = Shipment(
        tracking_number=tracking,
        customer_id=current_user.id,
        destination=shipment_in.destination,
        status=ShipmentStatus.PENDING
    )
    db.add(new_shipment)
    await db.commit()
    await db.refresh(new_shipment)
    
    return ShipmentResponse(
        id=new_shipment.id,
        tracking_number=new_shipment.tracking_number,
        status=new_shipment.status.value,
        destination=new_shipment.destination,
        estimated_delivery=new_shipment.estimated_delivery
    )
