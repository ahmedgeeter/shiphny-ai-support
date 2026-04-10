"""
Customer Model - Realistic customer profiles for e-commerce
"""

import enum
from datetime import datetime
from typing import Optional

from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Text
from sqlalchemy.orm import relationship

from app.db.database import Base


class CustomerTier(str, enum.Enum):
    """Customer loyalty tiers."""
    NEW = "new"           # First time customer
    REGULAR = "regular"   # 2-5 orders
    VIP = "vip"          # 6+ orders or high value
    INACTIVE = "inactive" # No orders in 6 months


class PreferredLanguage(str, enum.Enum):
    """Customer language preference."""
    ARABIC = "ar"
    ENGLISH = "en"


class Customer(Base):
    """Customer profile with realistic Egyptian market data."""
    
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Basic Info
    full_name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False, index=True)
    phone = Column(String(20), unique=True, nullable=True)
    
    # Customer segmentation
    tier = Column(Enum(CustomerTier), default=CustomerTier.NEW, nullable=False)
    preferred_language = Column(Enum(PreferredLanguage), default=PreferredLanguage.ARABIC)
    
    # Purchase history (realistic for e-commerce)
    total_orders = Column(Integer, default=0)
    total_spent_egp = Column(Float, default=0.0)  # Egyptian Pounds
    average_order_value = Column(Float, default=0.0)
    
    # Last interaction tracking
    last_order_date = Column(DateTime, nullable=True)
    last_chat_date = Column(DateTime, nullable=True)
    
    # Notes for support agents
    support_notes = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    conversations = relationship("Conversation", back_populates="customer", lazy="selectin")
    
    def __repr__(self) -> str:
        return f"<Customer(id={self.id}, name='{self.full_name}', tier='{self.tier.value}')>"
    
    @property
    def is_vip(self) -> bool:
        """Quick check if VIP customer."""
        return self.tier == CustomerTier.VIP
    
    @property
    def display_name(self) -> str:
        """First name only for friendly greeting."""
        return self.full_name.split()[0] if self.full_name else "عميل"
    
    def update_order_stats(self, order_amount: float) -> None:
        """Update customer stats after new order."""
        self.total_orders += 1
        self.total_spent_egp += order_amount
        self.average_order_value = self.total_spent_egp / self.total_orders
        self.last_order_date = datetime.utcnow()
        
        # Update tier based on new stats
        if self.total_orders >= 6 or self.total_spent_egp >= 10000:
            self.tier = CustomerTier.VIP
        elif self.total_orders >= 2:
            self.tier = CustomerTier.REGULAR
