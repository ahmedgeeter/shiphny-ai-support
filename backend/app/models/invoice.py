"""
Invoice Model - Enterprise Billing Info
"""

import enum
from datetime import datetime
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship

from app.db.database import Base


class InvoiceStatus(str, enum.Enum):
    """Invoice payment status."""
    PAID = "Paid"
    UNPAID = "Unpaid"
    REFUNDED = "Refunded"


class Invoice(Base):
    """Enterprise Invoice profile."""
    
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    
    amount = Column(Float, nullable=False)
    status = Column(Enum(InvoiceStatus), default=InvoiceStatus.UNPAID, nullable=False)
    due_date = Column(DateTime, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    customer = relationship("Customer", back_populates="invoices")
    
    def __repr__(self) -> str:
        return f"<Invoice(id={self.id}, amount={self.amount}, status='{self.status.value}')>"
