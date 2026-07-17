"""
Customer Model - Enterprise Customer Profile
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship

from app.db.database import Base


class Customer(Base):
    """Enterprise Customer profile."""
    
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    company_name = Column(String(150), nullable=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    wallet_balance = Column(Float, default=0.00)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    # Keeping conversations for backward compatibility if needed, but adding shipments and invoices
    conversations = relationship("Conversation", back_populates="customer", lazy="selectin")
    shipments = relationship("Shipment", back_populates="customer", lazy="selectin", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="customer", lazy="selectin", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<Customer(id={self.id}, name='{self.name}', company='{self.company_name}')>"
