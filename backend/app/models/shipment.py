"""
Shipment Model - Enterprise Shipment Tracking
"""

import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship

from app.db.database import Base


class ShipmentStatus(str, enum.Enum):
    """Shipment tracking status."""
    PENDING = "Pending"
    IN_TRANSIT = "In_Transit"
    DELIVERED = "Delivered"
    CANCELED = "Canceled"


class Shipment(Base):
    """Enterprise Shipment profile."""
    
    __tablename__ = "shipments"
    
    id = Column(Integer, primary_key=True, index=True)
    tracking_number = Column(String(50), unique=True, nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    
    status = Column(Enum(ShipmentStatus), default=ShipmentStatus.PENDING, nullable=False)
    destination = Column(String(200), nullable=False)
    estimated_delivery = Column(DateTime, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    customer = relationship("Customer", back_populates="shipments")
    
    def __repr__(self) -> str:
        return f"<Shipment(tracking='{self.tracking_number}', status='{self.status.value}')>"
