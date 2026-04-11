"""
Chat API Endpoints - Real-time customer support chat
"""

from collections import defaultdict
from datetime import datetime
from time import time as _time
from typing import Optional
from uuid import uuid4

import re

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel, Field
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.models.customer import Customer
from app.models.conversation import Conversation, Message, ConversationStatus, MessageRole, Intent
from app.services.groq_ai import get_groq_service, AIResponse



router = APIRouter(prefix="/api/chat", tags=["chat"])

# ── Rate limiting: 20 messages / 60 s per IP ─────────────────────────────────
_chat_rate: dict = defaultdict(list)

def _check_chat_rate(ip: str) -> None:
    now = _time()
    _chat_rate[ip] = [t for t in _chat_rate[ip] if now - t < 60]
    if len(_chat_rate[ip]) >= 20:
        raise HTTPException(
            status_code=429,
            detail="رجاء الانتظار قليلاً قبل إرسال رسالة جديدة." if True else "Too many messages. Please wait.",
            headers={"Retry-After": "60"},
        )
    _chat_rate[ip].append(now)


# Request/Response Models
class ChatRequest(BaseModel):
    """Chat message request."""
    message: str = Field(..., min_length=1, max_length=2000, description="Customer message")
    customer_id: int = Field(1, description="Customer ID")
    session_id: Optional[str] = Field(None, description="Existing session ID (optional)")
    language: Optional[str] = Field("ar", description="Preferred language: ar or en")


class ChatResponse(BaseModel):
    """AI chat response."""
    response: str = Field(..., description="AI response text")
    session_id: str = Field(..., description="Session ID for continuity")
    confidence: float = Field(..., description="AI confidence score (0-1)")
    response_time_ms: float = Field(..., description="Response time in milliseconds")
    detected_intent: Optional[str] = Field(None, description="Detected customer intent")
    escalated: bool = Field(False, description="True if conversation was escalated to a human agent")


class ConversationListItem(BaseModel):
    """Conversation list item."""
    id: int
    session_id: str
    customer_name: str
    status: str
    started_at: datetime
    message_count: int


@router.post("/test")
async def chat_test(request: ChatRequest) -> dict:
    """Simple test endpoint without database."""
    from app.services.fallback_responses import get_fallback_response
    
    response_text = get_fallback_response(request.message)
    
    return {
        "response": response_text,
        "session_id": "test-session",
        "confidence": 0.75,
        "response_time_ms": 100,
        "detected_intent": "greeting",
        "mode": "fallback"
    }


@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    http_request: Request,
    db: AsyncSession = Depends(get_db)
) -> ChatResponse:
    """
    Send a chat message and get AI response.
    
    Creates new conversation if session_id not provided.
    """
    _check_chat_rate(http_request.client.host)

    # Get customer
    result = await db.execute(
        select(Customer).where(Customer.id == request.customer_id)
    )
    customer = result.scalar_one_or_none()
    
    if not customer:
        from app.models.customer import CustomerTier, PreferredLanguage
        customer = Customer(
            id=request.customer_id,
            full_name="Guest User",
            email=f"guest_{request.customer_id}@shiphny.com",
            phone=f"000000000{request.customer_id}",
            tier=CustomerTier.NEW,
            preferred_language=PreferredLanguage.ARABIC,
            total_orders=0,
            total_spent_egp=0.0
        )
        db.add(customer)
        await db.flush()
    
    # Get or create conversation
    if request.session_id:
        result = await db.execute(
            select(Conversation).where(Conversation.session_id == request.session_id)
        )
        conversation = result.scalar_one_or_none()
    else:
        conversation = None
    
    if not conversation:
        # Use the provided session_id so the client can resume the same conversation.
        # Fall back to a generated id only when none was provided.
        session_id = request.session_id if request.session_id else str(uuid4())[:20]
        conversation = Conversation(
            customer_id=customer.id,
            session_id=session_id,
            status=ConversationStatus.ACTIVE,
            channel="api"
        )
        db.add(conversation)
        await db.flush()
    
    # Add user message
    user_message = Message(
        conversation_id=conversation.id,
        role=MessageRole.USER,
        content=request.message
    )
    db.add(user_message)
    await db.flush()
    
    # Get conversation history for context
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation.id)
        .order_by(desc(Message.created_at))
        .limit(20)
    )
    history = result.scalars().all()
    history_list = [
        {"role": msg.role.value, "content": msg.content}
        for msg in reversed(history)
    ]

    # ── Auto Identity Verification ────────────────────────────────────────────
    # Scan the last few messages for a pending verification context:
    # If the AI asked for identity and the user just replied with a value,
    # automatically call /api/bookings/verify-identity and inject [VERIFIED:ref].
    auto_verified_inject = None
    pending_ref = None   # track for passing to generate_response
    already_verified = any("[VERIFIED:" in m.get("content", "") for m in history_list)

    if not already_verified:
        # Find the most recent SH- reference mentioned anywhere in the conversation
        # (user or assistant) — search ALL history, most recent first
        pending_ref = None
        for msg in reversed(history_list):
            found = re.findall(r'SH-\d{8}', msg.get("content", ""))
            if found:
                pending_ref = found[-1]   # take last ref in that message
                break

        # Also check if the current user message itself contains an SH- ref
        # (they might be giving the ref in the same message as their verify data)
        current_refs = re.findall(r'SH-\d{8}', request.message)
        if current_refs:
            pending_ref = current_refs[0]


        if pending_ref:
            user_val = request.message.strip()
            # Strip the SH-ref itself from user_val for cleaner method detection
            user_val_clean = re.sub(r'SH-\d{8}', '', user_val).strip()
            if user_val_clean:
                user_val = user_val_clean

            # Detect verification method from user input
            method = None
            if "@" in user_val and "." in user_val:
                method = "email"
            elif user_val.replace(" ", "").isdigit() and len(user_val.replace(" ", "")) <= 6:
                method = "phone_last4"
            elif len(user_val.split()) >= 2:
                method = "name"
            elif user_val.replace(" ", "").isdigit():
                method = "phone_last4"
            print(f"[DEBUG] method={method} user_val='{user_val}'")

            if method:
                try:
                    from sqlalchemy import select as _select
                    from app.models.booking import Booking as _Booking
                    _bres = await db.execute(
                        _select(_Booking).where(_Booking.reference == pending_ref)
                    )
                    _bk = _bres.scalar_one_or_none()
                    if _bk:
                        _verified = False
                        if method == "phone_last4":
                            _digits = "".join(c for c in _bk.sender_phone if c.isdigit())
                            _verified = _digits[-4:] == user_val.replace(" ", "")[-4:]
                        elif method == "name":
                            _stored = _bk.sender_name.strip().lower().split()
                            _input = user_val.lower().split()
                            _n = min(2, len(_stored))
                            _verified = _stored[:_n] == _input[:_n]
                        elif method == "email":
                            if _bk.sender_email:
                                _verified = _bk.sender_email.strip().lower() == user_val.lower()
                        if _verified:
                            auto_verified_inject = f"[VERIFIED:{pending_ref}]"
                            print(f"[Chat] Auto-verified {pending_ref} via {method}")
                except Exception as _e:
                    print(f"[Chat] Auto-verify failed: {_e}")

    # Inject verification tag into history AND persist it to DB so it survives future requests
    if auto_verified_inject:
        history_list.append({"role": "system", "content": auto_verified_inject})
        # Persist as a system message so AI remembers verification across requests
        verified_msg = Message(
            conversation_id=conversation.id,
            role=MessageRole.SYSTEM,
            content=auto_verified_inject,
        )
        db.add(verified_msg)
        await db.flush()

    # Prepare customer context with language from request
    preferred_lang = request.language or (customer.preferred_language.value if customer.preferred_language else "ar")

    customer_context = {
        "customer_id": customer.id,
        "name": customer.display_name,
        "tier": customer.tier.value if customer.tier else "عميل",
        "order_count": customer.total_orders,
        "language": preferred_lang,
        "total_spent": customer.total_spent_egp,
    }
    
    # Generate AI response
    # Pass verified_ref directly so generate_response doesn't need to re-scan history
    # (history was built BEFORE [VERIFIED] was injected, so scanning it would miss it)
    just_verified_ref = pending_ref if auto_verified_inject else None
    ai_service = get_groq_service()
    try:
        ai_response: AIResponse = await ai_service.generate_response(
            user_message=request.message,
            customer_context=customer_context,
            conversation_history=history_list,
            db=db,
            force_verified_ref=just_verified_ref,
        )
    except Exception as e:
        # Fallback response if AI fails
        ai_response = AIResponse(
            content="عذراً، حدث خطأ تقني. يرجى المحاولة مرة أخرى.",
            confidence_score=0.0,
            tokens_used=0,
            response_time_ms=0,
            model_used="error",
            detected_intent="error"
        )
    
    # ── Escalation detection ──────────────────────────────────────────────────
    ESCALATION_TAG = "[ESCALATE_TO_HUMAN]"
    escalated = ESCALATION_TAG in ai_response.content
    clean_content = ai_response.content.replace(ESCALATION_TAG, "").strip()

    # Add AI message (clean, no internal tags)
    try:
        msg_intent = Intent(ai_response.detected_intent) if ai_response.detected_intent else None
    except ValueError:
        msg_intent = None
    ai_message = Message(
        conversation_id=conversation.id,
        role=MessageRole.ASSISTANT,
        content=clean_content,
        ai_model_used=ai_response.model_used,
        ai_confidence_score=ai_response.confidence_score,
        tokens_used=ai_response.tokens_used,
        response_time_ms=ai_response.response_time_ms,
        detected_intent=msg_intent
    )
    db.add(ai_message)

    # Update conversation
    if escalated:
        conversation.status = ConversationStatus.ESCALATED
    if ai_response.detected_intent and ai_response.detected_intent != "error":
        try:
            conversation.primary_intent = Intent(ai_response.detected_intent)
        except ValueError:
            conversation.primary_intent = None
    conversation.response_time_avg_ms = ai_response.response_time_ms
    conversation.ai_confidence_avg = ai_response.confidence_score

    await db.commit()

    return ChatResponse(
        response=clean_content,
        session_id=conversation.session_id,
        confidence=ai_response.confidence_score,
        response_time_ms=ai_response.response_time_ms,
        detected_intent=ai_response.detected_intent,
        escalated=escalated,
    )


@router.get("/conversations")
async def list_conversations(
    customer_id: Optional[int] = None,
    status: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
) -> list[ConversationListItem]:
    """List conversations with filters."""
    
    query = select(Conversation).order_by(desc(Conversation.started_at))
    
    if customer_id:
        query = query.where(Conversation.customer_id == customer_id)
    
    if status:
        query = query.where(Conversation.status == status)
    
    query = query.limit(limit).offset(offset)
    
    result = await db.execute(query)
    conversations = result.scalars().all()
    
    # Build response with customer names
    items = []
    for conv in conversations:
        # Get customer name
        cust_result = await db.execute(
            select(Customer).where(Customer.id == conv.customer_id)
        )
        customer = cust_result.scalar_one_or_none()
        
        items.append(ConversationListItem(
            id=conv.id,
            session_id=conv.session_id,
            customer_name=customer.full_name if customer else "Unknown",
            status=conv.status.value if conv.status else "unknown",
            started_at=conv.started_at,
            message_count=conv.message_count if hasattr(conv, 'message_count') else 0
        ))
    
    return items


@router.get("/conversations/{session_id}")
async def get_conversation(
    session_id: str,
    db: AsyncSession = Depends(get_db)
) -> dict:
    """Get full conversation with messages."""
    
    result = await db.execute(
        select(Conversation).where(Conversation.session_id == session_id)
    )
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Get messages
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation.id)
        .order_by(Message.created_at)
    )
    messages = result.scalars().all()
    
    return {
        "id": conversation.id,
        "session_id": conversation.session_id,
        "status": conversation.status.value if conversation.status else None,
        "started_at": conversation.started_at,
        "ended_at": conversation.ended_at,
        "primary_intent": conversation.primary_intent.value if conversation.primary_intent else None,
        "messages": [
            {
                "role": msg.role.value,
                "content": msg.content,
                "ai_confidence": msg.ai_confidence_score,
                "created_at": msg.created_at
            }
            for msg in messages
        ]
    }
