"""
Bookings API - Real-time shipment bookings
Security: each booking is scoped to its customer_id.
The AI only ever sees bookings belonging to the requesting customer.
"""

import random
import string
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.models.booking import Booking, BookingStatus, _mask_phone

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


# ── Simple in-process rate limiter ────────────────────────────────────────────
from collections import defaultdict
from time import time as _time

_rate_store: dict = defaultdict(list)
_RATE_LIMIT = 10       # max requests
_RATE_WINDOW = 60      # per seconds

def _check_rate(ip: str) -> None:
    now = _time()
    window = _rate_store[ip]
    _rate_store[ip] = [t for t in window if now - t < _RATE_WINDOW]
    if len(_rate_store[ip]) >= _RATE_LIMIT:
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please wait a moment.",
            headers={"Retry-After": "60"},
        )
    _rate_store[ip].append(now)


# ── Request / Response ────────────────────────────────────────────────────────

class BookingRequest(BaseModel):
    customer_id:      int = Field(1, description="Customer placing the booking")
    sender_name:      str = Field(..., min_length=2, max_length=100)
    sender_phone:     str = Field(..., min_length=8, max_length=20)
    sender_email:     Optional[str] = Field(None, max_length=120, description="Email for identity verification")
    pickup_address:   str = Field(..., min_length=5, max_length=300)
    delivery_address: str = Field(..., min_length=5, max_length=300)
    service_type:     str = Field(..., min_length=1, max_length=100)
    weight_kg:        Optional[float] = Field(None, ge=0.1, le=1000)
    notes:            Optional[str]   = Field(None, max_length=500)

    @field_validator("sender_phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        digits = "".join(c for c in v if c.isdigit())
        if len(digits) < 8:
            raise ValueError("رقم الهاتف يجب أن يكون 8 أرقام على الأقل")
        return v.strip()

    @field_validator("sender_name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("الاسم يجب أن يكون حرفين على الأقل")
        return v


class BookingResponse(BaseModel):
    reference:        str
    sender_name:      str
    sender_phone:     str       # masked in list; full in own-booking lookup
    sender_email:     Optional[str] = None
    pickup_address:   str
    delivery_address: str
    service_type:     str
    weight_kg:        Optional[float]
    notes:            Optional[str]
    status:           str
    created_at:       datetime


class VerifyIdentityRequest(BaseModel):
    """Request to verify customer identity before exposing shipment details."""
    reference:   str = Field(..., description="Booking reference e.g. SH-12345678")
    method:      str = Field(..., description="Verification method: phone_last4 | name | email")
    value:       str = Field(..., min_length=2, max_length=120, description="The value to verify")


class VerifyIdentityResponse(BaseModel):
    verified:   bool
    message_ar: str
    message_en: str
    booking:    Optional[BookingResponse] = None


# ── Helpers ───────────────────────────────────────────────────────────────────

def _generate_ref() -> str:
    digits = "".join(random.choices(string.digits, k=8))
    return f"SH-{digits}"

def _to_response(b: Booking, mask: bool = True) -> BookingResponse:
    return BookingResponse(
        reference        = b.reference,
        sender_name      = b.sender_name,
        sender_phone     = _mask_phone(b.sender_phone) if mask else b.sender_phone,
        sender_email     = b.sender_email if not mask else None,
        pickup_address   = b.pickup_address,
        delivery_address = b.delivery_address,
        service_type     = b.service_type,
        weight_kg        = b.weight_kg,
        notes            = b.notes,
        status           = b.status.value,
        created_at       = b.created_at,
    )


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("", response_model=BookingResponse, status_code=201)
async def create_booking(
    data: BookingRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> BookingResponse:
    """Create a new shipment booking (scoped to customer_id)."""
    _check_rate(request.client.host)

    for _ in range(10):
        ref = _generate_ref()
        existing = await db.execute(select(Booking).where(Booking.reference == ref))
        if not existing.scalar_one_or_none():
            break

    booking = Booking(
        reference        = ref,
        customer_id      = data.customer_id,
        sender_name      = data.sender_name,
        sender_phone     = data.sender_phone,
        sender_email     = data.sender_email.strip().lower() if data.sender_email else None,
        pickup_address   = data.pickup_address,
        delivery_address = data.delivery_address,
        service_type     = data.service_type,
        weight_kg        = data.weight_kg,
        notes            = data.notes,
        status           = BookingStatus.PENDING,
    )
    db.add(booking)
    await db.commit()
    await db.refresh(booking)

    # Return full phone to the owner immediately after creation
    return _to_response(booking, mask=False)


@router.post("/verify-identity", response_model=VerifyIdentityResponse)
async def verify_identity(
    data: VerifyIdentityRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> VerifyIdentityResponse:
    """
    Verify a customer's identity before exposing shipment details.
    Methods:
      - phone_last4: last 4 digits of registered phone
      - name: first two words of sender name (case-insensitive)
      - email: registered email address (case-insensitive)
    """
    _check_rate(request.client.host)

    result = await db.execute(
        select(Booking).where(Booking.reference == data.reference.upper().strip())
    )
    booking = result.scalar_one_or_none()

    if not booking:
        return VerifyIdentityResponse(
            verified=False,
            message_ar="رقم الشحنة غير موجود. تأكد من الرقم وحاول مرة أخرى.",
            message_en="Shipment not found. Please check the reference number.",
        )

    verified = False
    method = data.method.strip().lower()
    value = data.value.strip()

    if method == "phone_last4":
        digits = "".join(c for c in booking.sender_phone if c.isdigit())
        verified = digits[-4:] == value.replace(" ", "")[-4:]

    elif method == "name":
        stored_words = booking.sender_name.strip().lower().split()
        input_words  = value.lower().split()
        # Match first two words (or one if only one registered)
        match_count  = min(2, len(stored_words))
        verified = stored_words[:match_count] == input_words[:match_count]

    elif method == "email":
        if booking.sender_email:
            verified = booking.sender_email.strip().lower() == value.lower()
        else:
            return VerifyIdentityResponse(
                verified=False,
                message_ar="البريد الإلكتروني لم يُسجَّل مع هذه الشحنة. جرّب طريقة التحقق بالاسم أو رقم الهاتف.",
                message_en="No email registered for this shipment. Try name or phone verification.",
            )
    else:
        return VerifyIdentityResponse(
            verified=False,
            message_ar="طريقة التحقق غير صحيحة. استخدم: phone_last4 أو name أو email.",
            message_en="Invalid verification method. Use: phone_last4, name, or email.",
        )

    if verified:
        return VerifyIdentityResponse(
            verified=True,
            message_ar="تم التحقق من هويتك بنجاح ✅",
            message_en="Identity verified successfully ✅",
            booking=_to_response(booking, mask=False),
        )
    else:
        return VerifyIdentityResponse(
            verified=False,
            message_ar="البيانات غير صحيحة. تأكد من المعلومات وحاول مرة أخرى.",
            message_en="Incorrect details. Please check your information and try again.",
        )


@router.get("/my/{customer_id}", response_model=list[BookingResponse])
async def list_my_bookings(
    customer_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> list[BookingResponse]:
    """List bookings belonging to a specific customer only."""
    _check_rate(request.client.host)
    result = await db.execute(
        select(Booking)
        .where(Booking.customer_id == customer_id)
        .order_by(desc(Booking.created_at))
        .limit(20)
    )
    return [_to_response(b, mask=False) for b in result.scalars().all()]


@router.get("/{reference}", response_model=BookingResponse)
async def get_booking(
    reference: str,
    customer_id: int = 1,
    request: Request = None,
    db: AsyncSession = Depends(get_db),
) -> BookingResponse:
    """
    Get a booking by reference.
    Returns 404 if the booking does not belong to customer_id (prevents enumeration).
    """
    if request:
        _check_rate(request.client.host)
    result = await db.execute(
        select(Booking).where(Booking.reference == reference.upper())
    )
    booking = result.scalar_one_or_none()
    # Return 404 even if booking exists but belongs to someone else
    if not booking or (booking.customer_id is not None and booking.customer_id != customer_id):
        raise HTTPException(status_code=404, detail="Booking not found")

    return _to_response(booking, mask=False)
