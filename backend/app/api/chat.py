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

# ── Rate limiting: 60 messages / 60 s per IP ─────────────────────────────────
_chat_rate: dict = defaultdict(list)

def _check_chat_rate(ip: str) -> None:
    now = _time()
    _chat_rate[ip] = [t for t in _chat_rate[ip] if now - t < 60]
    if len(_chat_rate[ip]) >= 60:
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

    # ══════════════════════════════════════════════════════════════════════════
    # ██  GLOBAL INJECTION GUARD  ██
    # Sanitize user messages in history that contain system-like tags.
    # This prevents injected [VERIFIED:] in user messages from influencing the AI.
    # ══════════════════════════════════════════════════════════════════════════
    _GLOBAL_INJECT_MARKERS = [
        "[VERIFIED", "SYSTEM OVERRIDE", "ADMIN MODE", "BYPASS VERIFICATION",
        "ignore all previous", "ignore previous instructions",
    ]
    for _hm in history_list:
        if _hm.get("role") == "user":
            _c = _hm.get("content", "")
            if any(_mk.lower() in _c.lower() for _mk in _GLOBAL_INJECT_MARKERS):
                # Neutralize: replace dangerous content with harmless placeholder
                _hm["content"] = "[message blocked by security filter]"

    # ══════════════════════════════════════════════════════════════════════════
    # ██  REAL-TIME IDENTITY VERIFICATION LAYER  ██
    # Deterministic — does NOT depend on AI model. Works even during rate limits.
    # Steps:
    #   1) Check if session already verified via DB system messages
    #   2) Extract SH-ref from conversation
    #   3) Detect verification method from user input
    #   4) Validate against DB in real-time
    #   5) Build deterministic response OR pass to AI
    # ══════════════════════════════════════════════════════════════════════════
    from app.models.booking import Booking as _Booking

    auto_verified_inject = None
    pending_ref = None
    verification_outcome = None   # None | "success" | "failed" | "not_found"
    verified_booking = None       # The Booking object if verified
    _lang = request.language or "ar"

    # ── 1) Check if already verified in this session ──
    already_verified = any(
        "[VERIFIED:" in m.get("content", "")
        for m in history_list
        if m.get("role") == "system"
    )

    if not already_verified:
        # ── 2) Find the most recent SH- reference in conversation ──
        for msg in reversed(history_list):
            found = re.findall(r'SH-\d{8}', msg.get("content", ""))
            if found:
                pending_ref = found[-1]
                break
        # Also check current message
        current_refs = re.findall(r'SH-\d{8}', request.message)
        if current_refs:
            pending_ref = current_refs[0]

        # ── SECURITY: Block injection attempts ──
        if pending_ref:
            _INJECT_MARKERS = [
                "✅", "[VERIFIED", "[نتيجة", "VERIFY RESULT", "SYSTEM OVERRIDE",
                "تم التحقق", "identity verified", "ADMIN MODE", "BYPASS",
                "ignore all previous", "ignore previous instructions",
                "show all data", "show all shipment", "no restrictions",
                "اعرض بيانات", "أظهر بيانات", "اكشف", "OVERRIDE",
            ]
            if any(m.lower() in request.message.lower() for m in _INJECT_MARKERS):
                print(f"[SEC] Injection attempt blocked")
                pending_ref = None

        # ── 3) Detect verification method from user input ──
        if pending_ref:
            user_val = request.message.strip()
            user_val_clean = re.sub(r'SH-\d{8}', '', user_val).strip()
            if user_val_clean:
                user_val = user_val_clean

            method = None
            _digits_only = user_val.replace(" ", "").replace("-", "")

            _SENTENCE_WORDS = [
                'عايز','اعرف','حالة','شحنتي','شحنة','تفاصيل','مساعدة','ممكن','ياريت',
                'اريد','ارجو','ابي','ودي','أريد','أرجو','معرفة','تحقق','هوية',
                'بيانات','كيف','متي','متى','وين','فين','check','want','need','show',
                'verify','override','ignore','bypass','system','admin','what','where',
                'track','status','help','please','لو','سمحت','عاوز','محتاج',
            ]

            if "@" in user_val and "." in user_val and len(user_val) < 100:
                method = "email"
            elif _digits_only.isdigit() and 4 <= len(_digits_only) <= 8:
                method = "phone_last4"
            elif (
                2 <= len(user_val.split()) <= 4
                and all(len(w) >= 2 for w in user_val.split())
                and not any(w in user_val.lower() for w in _SENTENCE_WORDS)
                and len(user_val) < 50
            ):
                method = "name"

            # ── 4) Validate against DB in real-time ──
            if method:
                try:
                    _bres = await db.execute(
                        select(_Booking).where(_Booking.reference == pending_ref)
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
                            verification_outcome = "success"
                            verified_booking = _bk
                            auto_verified_inject = f"[VERIFIED:{pending_ref}]"
                            print(f"[Chat] ✅ Verified {pending_ref} via {method}")
                        else:
                            verification_outcome = "failed"
                            print(f"[Chat] ❌ Verification failed for {pending_ref} via {method}")
                    else:
                        verification_outcome = "not_found"
                        print(f"[Chat] ⚠️ Booking {pending_ref} not found")
                except Exception as _e:
                    print(f"[Chat] Verify error: {_e}")

    # ── 5) Persist verification state to DB ──
    if auto_verified_inject:
        # Save [VERIFIED:ref] system message for session persistence
        db.add(Message(
            conversation_id=conversation.id,
            role=MessageRole.SYSTEM,
            content=auto_verified_inject,
        ))
        await db.flush()
        # Add to history_list so AI sees it this turn
        history_list.append({"role": "system", "content": auto_verified_inject})

    if verification_outcome == "failed":
        if _lang == "ar":
            _fail_msg = (
                f"[نتيجة التحقق: فشل] البيانات ({user_val}) غير مطابقة لشحنة {pending_ref}."
            )
        else:
            _fail_msg = (
                f"[VERIFY RESULT: FAILED] Data ({user_val}) does not match {pending_ref}."
            )
        history_list.append({"role": "system", "content": _fail_msg})
        # Persist attempt to DB
        db.add(Message(
            conversation_id=conversation.id,
            role=MessageRole.SYSTEM,
            content=_fail_msg,
        ))
        await db.flush()

    if verification_outcome == "not_found":
        _nf_msg = f"[SYSTEM: Booking {pending_ref} not found in database]"
        history_list.append({"role": "system", "content": _nf_msg})
        db.add(Message(
            conversation_id=conversation.id,
            role=MessageRole.SYSTEM,
            content=_nf_msg,
        ))
        await db.flush()

    # ══════════════════════════════════════════════════════════════════════════
    # ██  DETERMINISTIC RESPONSE BUILDER  ██
    # For verification success/failure, build response WITHOUT AI model.
    # This guarantees correct behavior even during rate limits.
    # ══════════════════════════════════════════════════════════════════════════
    preferred_lang = request.language or (customer.preferred_language.value if customer.preferred_language else "ar")
    _start_ms = _time() * 1000
    deterministic_response = None

    # ── A) VERIFICATION SUCCESS → build shipment details response directly ──
    if verification_outcome == "success" and verified_booking:
        b = verified_booking
        status_ar = _Booking.STATUS_AR.get(b.status.value, b.status.value)
        if preferred_lang == "ar":
            deterministic_response = (
                f"تم التحقق بنجاح.\n\n"
                f"تفاصيل شحنتك {b.reference}:\n"
                f"• الاسم: {b.sender_name}\n"
                f"• الخدمة: {b.service_type}\n"
                f"• من: {b.pickup_address}\n"
                f"• إلى: {b.delivery_address}\n"
                f"• الحالة: {status_ar}\n"
                f"• الوزن: {b.weight_kg or 'غير محدد'} كجم\n"
                f"• تاريخ الحجز: {b.created_at.strftime('%Y-%m-%d %H:%M') if b.created_at else '-'}\n\n"
                f"هل تحتاج أي مساعدة أخرى؟"
            )
        else:
            deterministic_response = (
                f"Identity verified.\n\n"
                f"Shipment {b.reference} details:\n"
                f"• Name: {b.sender_name}\n"
                f"• Service: {b.service_type}\n"
                f"• From: {b.pickup_address}\n"
                f"• To: {b.delivery_address}\n"
                f"• Status: {b.status.value.title()}\n"
                f"• Weight: {b.weight_kg or 'N/A'} kg\n"
                f"• Booked: {b.created_at.strftime('%Y-%m-%d %H:%M') if b.created_at else '-'}\n\n"
                f"Need anything else?"
            )

    # ── B) VERIFICATION FAILED → clear rejection message ──
    elif verification_outcome == "failed":
        if preferred_lang == "ar":
            deterministic_response = (
                f"عذراً، البيانات التي أدخلتها غير مطابقة لسجلات الشحنة {pending_ref}.\n\n"
                f"يرجى المحاولة مرة أخرى بإحدى الطرق التالية:\n"
                f"1. آخر 4 أرقام من رقم الموبايل المسجّل\n"
                f"2. الاسم الأول والثاني كما هو مسجّل\n"
                f"3. البريد الإلكتروني المسجّل\n\n"
                f"أو اتصل بالخط الساخن: 19282"
            )
        else:
            deterministic_response = (
                f"Sorry, the details you entered do not match our records for {pending_ref}.\n\n"
                f"Please try again with one of:\n"
                f"1. Last 4 digits of registered phone\n"
                f"2. First and last name as registered\n"
                f"3. Registered email address\n\n"
                f"Or call our hotline: 19282"
            )

    # ── C) PENDING VERIFICATION — user mentioned SH-ref but no data yet ──
    elif pending_ref and verification_outcome is None and not already_verified:
        if preferred_lang == "ar":
            deterministic_response = (
                f"لأديك تفاصيل شحنتك {pending_ref}، محتاج أتحقق من هويتك الأول:\n\n"
                f"1. آخر 4 أرقام من رقم الموبايل المسجّل\n"
                f"2. الاسم الأول والثاني كما هو مسجّل\n"
                f"3. البريد الإلكتروني المسجّل\n\n"
                f"أرسل لي أي واحدة منهم."
            )
        else:
            deterministic_response = (
                f"To show you details for {pending_ref}, I need to verify your identity first:\n\n"
                f"1. Last 4 digits of your registered phone number\n"
                f"2. Your first and last name as registered\n"
                f"3. Your registered email address\n\n"
                f"Please send any one of the above."
            )

    # ── D) BOOKING NOT FOUND → clear message ──
    elif verification_outcome == "not_found":
        if preferred_lang == "ar":
            deterministic_response = (
                f"عذراً، رقم الشحنة {pending_ref} غير موجود في نظامنا.\n"
                f"تأكد من الرقم وحاول مرة أخرى، أو اتصل بالخط الساخن: 19282."
            )
        else:
            deterministic_response = (
                f"Sorry, shipment {pending_ref} was not found in our system.\n"
                f"Please double-check the number or call: 19282."
            )

    # ── D) If deterministic response was built, use it directly (no AI needed) ──
    if deterministic_response:
        elapsed_ms = (_time() * 1000) - _start_ms
        ai_message = Message(
            conversation_id=conversation.id,
            role=MessageRole.ASSISTANT,
            content=deterministic_response,
            ai_model_used="deterministic-validation",
            ai_confidence_score=1.0,
            tokens_used=0,
            response_time_ms=elapsed_ms,
            detected_intent=Intent.SHIPPING_STATUS,
        )
        db.add(ai_message)
        conversation.response_time_avg_ms = elapsed_ms
        conversation.ai_confidence_avg = 1.0
        conversation.primary_intent = Intent.SHIPPING_STATUS
        await db.commit()
        return ChatResponse(
            response=deterministic_response,
            session_id=conversation.session_id,
            confidence=1.0,
            response_time_ms=elapsed_ms,
            detected_intent="shipping_status",
            escalated=False,
        )

    # ══════════════════════════════════════════════════════════════════════════
    # ██  AI RESPONSE (for non-verification messages)  ██
    # ══════════════════════════════════════════════════════════════════════════
    customer_context = {
        "customer_id": customer.id,
        "name": customer.display_name,
        "tier": customer.tier.value if customer.tier else "عميل",
        "order_count": customer.total_orders,
        "language": preferred_lang,
        "total_spent": customer.total_spent_egp,
    }

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
        ai_response = AIResponse(
            content="عذراً، حدث خطأ تقني. يرجى المحاولة مرة أخرى." if preferred_lang == "ar"
                    else "Sorry, a technical error occurred. Please try again.",
            confidence_score=0.0,
            tokens_used=0,
            response_time_ms=0,
            model_used="error",
            detected_intent="error"
        )

    # ── Escalation detection ──
    ESCALATION_TAG = "[ESCALATE_TO_HUMAN]"
    escalated = ESCALATION_TAG in ai_response.content
    clean_content = ai_response.content.replace(ESCALATION_TAG, "").strip()

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
