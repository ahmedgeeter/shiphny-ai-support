"""
Customer Model - Enterprise Customer Profile
"""

import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Boolean
from sqlalchemy.orm import relationship

from app.db.database import Base


class CustomerTier(str, enum.Enum):
    """Customer tier for enterprise segmentation."""
    bronze = "bronze"
    silver = "silver"
    gold = "gold"
    platinum = "platinum"


class RoleEnum(str, enum.Enum):
    """User role for access control."""
    ADMIN = "admin"
    CUSTOMER = "customer"


class Customer(Base):
    """Enterprise Customer profile."""
    
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    name = Column(String(100), nullable=True)  # backward compat
    company_name = Column(String(150), nullable=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    phone = Column(String(30), nullable=True)
    hashed_password = Column(String(200), nullable=True)
    tier = Column(Enum(CustomerTier), default=CustomerTier.bronze)
    wallet_balance = Column(Float, default=0.00)
    total_orders = Column(Integer, default=0)
    total_spent_egp = Column(Float, default=0.00)
    role = Column(Enum(RoleEnum), default=RoleEnum.CUSTOMER, nullable=False)
    is_active = Column(Boolean, default=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    conversations = relationship("Conversation", back_populates="customer", lazy="selectin")
    shipments = relationship("Shipment", back_populates="customer", lazy="selectin", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="customer", lazy="selectin", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<Customer(id={self.id}, name='{self.full_name}', email='{self.email}')>"
