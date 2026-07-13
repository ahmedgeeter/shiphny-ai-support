"""
Booking Model - Customer shipment bookings
Created via website form, injected into AI knowledge base in real-time
"""

import enum
from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, Float, ForeignKey
from app.db.database import Base


def _mask_phone(phone: str) -> str:
    """01012345678 → 010****678 — never expose full phone in AI context."""
    if len(phone) >= 8:
        return phone[:3] + '****' + phone[-3:]
    return '***'


class BookingStatus(str, enum.Enum):
    PENDING   = "pending"
    CONFIRMED = "confirmed"
    COLLECTED = "collected"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class Booking(Base):
    __tablename__ = "bookings"

    id           = Column(Integer, primary_key=True, index=True)
    reference    = Column(String(20), unique=True, nullable=False, index=True)
    customer_id  = Column(Integer, ForeignKey('customers.id'), nullable=True, index=True)

    # Sender
    sender_name  = Column(String(100), nullable=False)
    sender_phone = Column(String(20),  nullable=False)
    sender_email = Column(String(120), nullable=True)

    # Shipment details
    pickup_address   = Column(String(300), nullable=False)
    delivery_address = Column(String(300), nullable=False)
    service_type     = Column(String(100), nullable=False)   # Express / Standard / Business
    weight_kg        = Column(Float, nullable=True)
    notes            = Column(Text, nullable=True)

    # Status
    status = Column(Enum(BookingStatus), default=BookingStatus.PENDING, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<Booking(ref={self.reference}, sender={self.sender_name}, status={self.status.value})>"

    STATUS_AR = {
        "pending":   "قيد الانتظار",
        "confirmed": "تم التأكيد",
        "collected": "تم الاستلام من المرسل",
        "delivered": "تم التوصيل",
        "cancelled": "ملغي",
    }

    def to_ai_context(self, mask_phone: bool = True) -> str:
        """Return a human-readable summary for injection into the AI system prompt. Never expose email."""
        status_ar = self.STATUS_AR.get(self.status.value, self.status.value)
        return (
            f"رقم الشحنة: {self.reference} | "
            f"الاسم: {self.sender_name} | "
            f"الخدمة: {self.service_type} | "
            f"من: {self.pickup_address} → إلى: {self.delivery_address} | "
            f"الحالة: {status_ar} | "
            f"الوزن: {self.weight_kg or 'غير محدد'} كجم | "
            f"تاريخ الحجز: {self.created_at.strftime('%Y-%m-%d %H:%M') if self.created_at else '-'}"
        )
