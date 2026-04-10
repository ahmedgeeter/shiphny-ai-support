"""
Groq AI Service - Professional delivery company AI agent
Uses Llama 3.3 70B via Groq API for Shiphny Express
Bilingual: Arabic + English with auto-detection
"""

import os
import time
import re
from typing import Optional, Dict, Any, List
from dataclasses import dataclass

import httpx


@dataclass
class AIResponse:
    """Structured AI response with metadata."""
    content: str
    confidence_score: float
    tokens_used: int
    response_time_ms: float
    model_used: str
    detected_intent: Optional[str] = None
    detected_language: Optional[str] = None


# ─── Knowledge Base for Shiphny Express ───
KNOWLEDGE_BASE_AR = """شحني Express | خط ساخن: 19282 | واتساب: 01001928200 | تتبع: shiphny.com/track
أسعار: القاهرة 35/45ج | الإسكندرية والدلتا 40/55ج | الصعيد 50/70ج | الحدود 60/85ج (قياسي/سريع)
تغطية: 27 محافظة - القاهرة/الجيزة/القليوبية/الإسكندرية/البحيرة/الغربية/المنوفية/الدقهلية/دمياط/الفيوم/بني سويف/المنيا/أسيوط/سوهاج/قنا/الأقصر/أسوان/بورسعيد/الإسماعيلية/السويس/مطروح/البحر الأحمر/سيناء/كفر الشيخ/الوادي الجديد/شرم الشيخ/الغردقة
مواعيد: القاهرة نفس اليوم (قبل 12ظ) | الدلتا 1-2يوم | الصعيد 2-3أيام | الحدود 3-5أيام | لا توصيل الجمعة
إرجاع: 14 يوم من الاستلام | استرداد 3-5 أيام | مجاني لعيوب المصنع | 15ج للرفض بدون سبب
تأمين: مجاني حتى 2000ج | ممتد حتى 50000ج (1% من القيمة)
دفع: كاش/COD/فودافون كاش/فيزا/فوري
شحنات الشركات: خصم 40% | من 25ج/شحنة | مدير حساب مخصص
التتبع: رقم الشحنة يبدأ بـ SH- متبوع 8 أرقام
"""

KNOWLEDGE_BASE_EN = """
## Shiphny Express Knowledge Base

### Company Information
- Name: Shiphny Express (شحني)
- Founded: 2019
- HQ: Cairo, Egypt
- Hotline: 19282
- Working Hours: 24/7
- Employees: 500+
- Delivery Vehicles: 200+
- Sorting Centers: 15

### Shipping Services
1. **Express Shipping**: Same-day delivery for Greater Cairo, 24 hours for governorates. Starting from EGP 45. Includes real-time tracking + SMS notifications + full insurance.
2. **Standard Shipping**: Delivery within 2-3 business days. Starting from EGP 35. Includes shipment tracking + safe delivery.
3. **Business Solutions**: Monthly and annual contracts with up to 40% discount. Includes dedicated account manager + monthly invoices + daily reports.
4. **E-commerce Shipping**: Integrated solutions for online stores with API integration and COD (Cash on Delivery).

### Coverage
- We serve all 27 Egyptian governorates
- Greater Cairo: Cairo, Giza, Qalyubia
- Delta: Alexandria, Beheira, Kafr El Sheikh, Gharbia, Monufia, Dakahlia, Damietta
- Upper Egypt: Fayoum, Beni Suef, Minya, Assiut, Sohag, Qena, Luxor, Aswan
- Canal: Port Said, Ismailia, Suez
- Border: Matrouh, Red Sea, New Valley, North Sinai, South Sinai

### Shipping Prices
- Greater Cairo: from EGP 35 (standard) / EGP 45 (express)
- Alexandria & Delta: from EGP 40 (standard) / EGP 55 (express)
- Upper Egypt: from EGP 50 (standard) / EGP 70 (express)
- Border Governorates: from EGP 60 (standard) / EGP 85 (express)
- Free shipping for orders over EGP 500 (Cairo only)
- Business rates start from EGP 25/shipment (based on monthly volume)

### Tracking
- Track via website: shiphny.com/track
- Or hotline: 19282
- Or WhatsApp: 01001928200
- Tracking number starts with SH- followed by 8 digits (e.g., SH-12345678)
- SMS notifications at: Shipment created, Collected from merchant, At sorting center, Out for delivery, Delivered

### Returns & Refunds
- Return within 14 days of delivery
- Must be in original condition
- Refund within 3-5 business days
- Free return for manufacturer defects
- EGP 15 return fee for refusal without reason

### Insurance
- Free insurance up to EGP 2,000
- Extended insurance up to EGP 50,000 (add 1% of shipment value)
- Full compensation for loss or damage caused by company

### Payment Methods
- Cash on Delivery (COD)
- Vodafone Cash
- Bank Transfer
- Credit Cards (Visa / Mastercard)
- Fawry / Masary

### Delivery Times
- Greater Cairo: Same day (if before 12 PM) or next day
- Alexandria & Delta: 1-2 business days
- Upper Egypt: 2-3 business days
- Border Governorates: 3-5 business days
- No Friday deliveries

### Common Issues Resolution
- Delayed shipment: Check tracking number first, if delayed beyond estimated time call 19282
- Damaged shipment: Take photos and contact us within 24 hours for compensation
- Wrong address: Can be corrected before out for delivery via 19282
- Refused delivery: One free re-delivery, then EGP 15 per attempt
- Lost shipment: Full compensation within 7 business days after verification
"""


class GroqAIService:
    """Professional AI agent for Shiphny Express delivery company."""

    GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

    # Enhanced intent patterns for delivery company
    # Maps intent keys to valid Intent enum values in conversation.py
    INTENT_KEY_MAP = {
        "shipping_status":  "shipping_status",
        "shipping_price":   "general",
        "coverage_area":    "general",
        "refund_request":   "refund_request",
        "complaint":        "complaint",
        "business_inquiry": "order_inquiry",
        "payment_inquiry":  "general",
        "insurance_inquiry":"general",
        "greeting":         "general",
        "general_inquiry":  "general",
    }

    INTENT_PATTERNS = {
        "shipping_status": [
            "شحن", "وصل", "موعد", "تأخير", "توصيل", "تتبع", "متابعة", "راجع فين", "وصلت",
            "tracking", "shipping", "delivery", "where is", "when will", "track my",
            "shipment status", "delivery status", "has my package"
        ],
        "shipping_price": [
            "سعر", "تكلفة", "كم سعر", "أسعار", "رسوم", "فلوس الشحن",
            "price", "cost", "how much", "shipping rate", "fee", "charge"
        ],
        "coverage_area": [
            "توصيل", "منطقة", "محافظة", "توصلون", "تغطية", "فين",
            "deliver to", "coverage", "area", "governorate", "do you ship to", "location"
        ],
        "refund_request": [
            "استرجاع", "استرداد", "فلوس", "رجع", "ارجاع", "رفضت",
            "refund", "return", "money back", "cancel", "send back"
        ],
        "complaint": [
            "غاضب", "سيء", "مشكلة", "تأخرت", "تالفة", "مكسورة", "خربانة",
            "bad", "angry", "problem", "terrible", "horrible", "broken", "damaged", "late"
        ],
        "business_inquiry": [
            "شركة", "عقد", "تعاقد", "خصم", "حساب", "تجاري",
            "business", "contract", "corporate", "enterprise", "bulk", "partnership"
        ],
        "payment_inquiry": [
            "دفع", "فودافون كاش", "كاش", "تحويل", "بطاقة", "فوري",
            "payment", "pay", "cod", "cash", "card", "vodafone cash"
        ],
        "insurance_inquiry": [
            "تأمين", "تعويض", "تلف", "فقد", "ضمان",
            "insurance", "compensation", "damaged", "lost", "guarantee", "warranty"
        ],
        "greeting": [
            "مرحبا", "اهلا", "السلام", "هاي", "صباح", "مساء",
            "hello", "hi", "hey", "good morning", "good evening", "salaam"
        ],
    }

    # Arabic character detection pattern
    ARABIC_PATTERN = re.compile(r'[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]+')

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        self.model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        self.temperature = float(os.getenv("GROQ_TEMPERATURE", "0.7"))
        self.max_tokens = int(os.getenv("GROQ_MAX_TOKENS", "512"))

    def _detect_language(self, message: str) -> str:
        """Auto-detect language from message content."""
        arabic_chars = len(self.ARABIC_PATTERN.findall(message))
        total_chars = len(message.replace(" ", ""))
        if total_chars == 0:
            return "ar"
        arabic_ratio = arabic_chars / max(total_chars, 1)
        return "ar" if arabic_ratio > 0.15 else "en"

    def _build_system_prompt(
        self,
        customer_context: Dict[str, Any],
        detected_lang: str = None,
        recent_bookings_text: str = ""
    ) -> str:
        """Build professional system prompt for Sara - Shiphny AI Agent."""

        customer_name = customer_context.get("name", "العميل" if detected_lang != "en" else "Customer")
        customer_tier = customer_context.get("tier", "عميل" if detected_lang != "en" else "Customer")
        order_count = customer_context.get("order_count", 0)
        language = detected_lang or customer_context.get("language", "ar")

        # Choose knowledge base based on language
        kb = KNOWLEDGE_BASE_AR if language == "ar" else KNOWLEDGE_BASE_EN

        # Append live bookings section if present
        live_section = recent_bookings_text if recent_bookings_text else ""

        booking_section = ""

        if language == "ar":
            prompt = f"""أنت "سارة" 🌟، المساعدة الذكية الاحترافية لشركة شحني (Shiphny Express) — شركة الشحن والتوصيل الرائدة في مصر.

## معلومات العميل الحالي:
- الاسم: **{customer_name}**
- الفئة: {customer_tier}
- عدد الشحنات السابقة: {order_count}

## شخصيتك:
- ودودة ودافئة لكن احترافية
- صبورة جداً مع العملاء الغاضبين — تعاطفي قبل أي حل
- خبيرة في الشحن والتوصيل واللوجستيات
- سريعة في تقديم حلول عملية ومرقّمة
- تستخدمين إيموجي بشكل مناسب (ليس مبالغ فيه)
- تتحدثين بالعربية المصرية المفهومة (مش فصحى جامدة)
- **تتذكرين اسم العميل وتستخدميه في ردودك**

## قواعد صارمة:
1. **استخدمي قاعدة المعلومات فقط** — لا تختلقي أسعار أو مواعيد أو معلومات غير موجودة
2. **لا تختلقي أرقام شحنات** — اطلبي الرقم من العميل دائماً
3. **إذا سُئتِ عن شيء خارج تخصصك** — اعتذري بلطف ووجّهي العميل للخط الساخن 19282
4. **إذا كان العميل غاضباً** — اعتذري بصدق أولاً، ثم تعاطفي، ثم قدّمي حلاً فورياً
5. **إذا كان العميل VIP** — استخدمي لهجة أسرع وأكثر شخصية مع عروض خاصة
6. **قدمي خطوات واضحة** دائماً — مرقّمة 1، 2، 3
7. **لا تقولي "أنا مجرد AI"** — أنتِ سارة موظفة خدمة عملاء
8. **إذا سُئتِ بالإنجليزي** — ردّي بالإنجليزي

## 🚨 تصعيد لموظف بشري:
إذا لاحظتِ أن العميل:
- يكرر شكواه أكثر من مرة دون حل
- يستخدم كلمات غضب شديد أو تهديد
- يطلب صراحةً التحدث مع مدير أو موظف

**قولي:** "أفهم مدى إحباطك تماماً يا {customer_name}، سأحوّل محادثتك لمشرف متخصص الآن. 🔴 [ESCALATE_TO_HUMAN]"

## 💡 اقتراحات استباقية:
بعد حل مشكلة العميل، أضيفي دائماً سطراً مقترحاً مفيداً مثل:
- "هل تريد حجز شحنة جديدة؟"
- "هل تريد معرفة أسعار خدمة الشحن السريع؟"
- "يمكنك تتبع شحنتك من الموقع مباشرةً"

## قاعدة المعلومات:
{kb}
{booking_section}
أجب بالعربية دائماً إلا إذا سُئلتِ بالإنجليزي."""
        else:
            prompt = f"""You are "Sara" 🌟, the professional AI assistant at Shiphny Express — Egypt's leading shipping and delivery company.

## Current Customer:
- Name: **{customer_name}**
- Tier: {customer_tier}
- Previous Shipments: {order_count}

## Your Personality:
- Warm and friendly yet professional
- Very patient with frustrated customers — always empathize before solving
- Expert in shipping, delivery, and logistics
- Quick to offer numbered, practical steps
- Use emojis appropriately (not excessively)
- Speak in clear, professional English
- **Remember the customer's name and use it naturally**

## Strict Rules:
1. **Knowledge base only** — never make up prices, times, or info
2. **Never invent tracking numbers** — always ask the customer
3. **Out of scope** — apologize politely and refer to hotline 19282
4. **Angry customer** — apologize sincerely first, then empathize, then offer an immediate fix
5. **VIP customer** — faster, more personalized tone with special offers
6. **Always numbered steps** — 1, 2, 3
7. **Never say "I'm just an AI"** — you are Sara, a CS agent
8. **If asked in Arabic** — respond in Arabic

## 🚨 Escalation to Human Agent:
If the customer:
- Repeats their complaint multiple times without resolution
- Uses very angry or threatening language
- Explicitly asks for a manager or human

**Say:** "I completely understand your frustration, {customer_name}. I'm escalating your case to a specialist right now. 🔴 [ESCALATE_TO_HUMAN]"

## 💡 Proactive Suggestions:
After resolving the customer's issue, always add one helpful suggestion such as:
- "Would you like to book a new shipment?"
- "Would you like to know about our express shipping rates?"
- "You can track your shipment directly on our website."

## Knowledge Base:
{kb}
{booking_section}
Always respond in English unless asked in Arabic."""

        return prompt

    def _detect_intent(self, message: str) -> tuple[str, float]:
        """Detect customer intent from message with enhanced patterns."""
        message_lower = message.lower()

        scores = {}
        for intent, keywords in self.INTENT_PATTERNS.items():
            score = sum(1 for keyword in keywords if keyword in message_lower)
            if score > 0:
                scores[intent] = score / len(keywords)

        if scores:
            best_intent = max(scores, key=scores.get)
            best_score = scores[best_intent]
            mapped = self.INTENT_KEY_MAP.get(best_intent, "general")
            return mapped, min(best_score * 3, 1.0)

        return "general", 0.5

    async def _load_recent_bookings(self, db=None, customer_id: int = None) -> str:
        """
        Load bookings for the CURRENT customer only — never expose other customers' data.
        Phone numbers are masked in the AI context.
        """
        if db is None:
            return ""
        try:
            from sqlalchemy import select, desc
            from app.models.booking import Booking
            query = select(Booking).order_by(desc(Booking.created_at)).limit(10)
            if customer_id:
                query = query.where(Booking.customer_id == customer_id)
            else:
                return ""   # No customer_id → never show any bookings
            result = await db.execute(query)
            bookings = result.scalars().all()
            if not bookings:
                return ""
            lines = ["", "### حجوزاتك الأخيرة (Real-time — مرئية لك فقط):"]
            for b in bookings:
                lines.append(f"- {b.to_ai_context(mask_phone=True)}")
            return "\n".join(lines)
        except Exception as e:
            print(f"[GroqAI] Could not load bookings: {e}")
            return ""

    async def generate_response(
        self,
        user_message: str,
        customer_context: Dict[str, Any],
        conversation_history: Optional[list] = None,
        db=None
    ) -> AIResponse:
        """Generate AI response with full context, knowledge base, and real-time bookings."""

        start_time = time.time()

        # Auto-detect language from message
        detected_lang = self._detect_language(user_message)

        # Always re-read API key from env (picks up .env changes without restart)
        self.api_key = os.getenv("GROQ_API_KEY") or self.api_key

        # Fallback mode if no API key
        if not self.api_key:
            from app.services.fallback_responses import get_fallback_response
            response_time = (time.time() - start_time) * 1000
            detected_intent, confidence = self._detect_intent(user_message)

            return AIResponse(
                content=get_fallback_response(user_message, detected_lang),
                confidence_score=0.75,
                tokens_used=0,
                response_time_ms=response_time,
                model_used="fallback-mode",
                detected_intent=detected_intent,
                detected_language=detected_lang
            )

        recent_bookings_text = await self._load_recent_bookings(db=db, customer_id=customer_context.get("customer_id"))
        system_prompt = self._build_system_prompt(customer_context, detected_lang, recent_bookings_text)

        # Build messages with knowledge base + live bookings
        messages = [
            {"role": "system", "content": system_prompt},
        ]

        # Add conversation history
        if conversation_history:
            for msg in conversation_history[-8:]:
                messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})

        # Add current user message
        messages.append({"role": "user", "content": user_message})

        # Call Groq API with retry on rate limit
        ai_content = None
        tokens_used = 0
        for attempt in range(2):
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(
                        self.GROQ_API_URL,
                        headers={
                            "Authorization": f"Bearer {self.api_key}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": self.model,
                            "messages": messages,
                            "temperature": self.temperature,
                            "max_tokens": self.max_tokens,
                            "top_p": 0.9,
                        }
                    )

                    if response.status_code == 429:
                        print(f"[Groq] Rate limited — switching to Gemini fallback")
                        from app.services.gemini_ai import gemini_generate
                        gemini_text = await gemini_generate(system_prompt, user_message, conversation_history)
                        if gemini_text:
                            ai_content = gemini_text
                        break

                    response.raise_for_status()
                    data = response.json()
                    ai_content = data["choices"][0]["message"]["content"]
                    tokens_used = data.get("usage", {}).get("total_tokens", 0)
                    break

            except httpx.HTTPStatusError as e:
                print(f"Groq API error: {e.response.status_code} - {e.response.text}")
                break
            except Exception as e:
                print(f"Error calling Groq: {e}")
                break

        if not ai_content:
            from app.services.gemini_ai import gemini_generate
            print("[Groq] Failed — trying Gemini")
            ai_content = await gemini_generate(system_prompt, user_message, conversation_history)

        if not ai_content:
            from app.services.fallback_responses import get_fallback_response
            ai_content = get_fallback_response(user_message, detected_lang)

        # Calculate metrics
        response_time = (time.time() - start_time) * 1000
        detected_intent, confidence = self._detect_intent(user_message)

        return AIResponse(
            content=ai_content,
            confidence_score=confidence,
            tokens_used=tokens_used,
            response_time_ms=response_time,
            model_used=self.model,
            detected_intent=detected_intent,
            detected_language=detected_lang
        )

    async def simple_chat(self, message: str) -> str:
        """Simple chat without context (for testing)."""
        detected_lang = self._detect_language(message)
        response = await self.generate_response(
            user_message=message,
            customer_context={
                "name": "عميل" if detected_lang == "ar" else "Customer",
                "tier": "عميل" if detected_lang == "ar" else "Customer",
                "order_count": 0,
                "language": detected_lang
            }
        )
        return response.content


# Global service instance
_groq_service: Optional[GroqAIService] = None


def get_groq_service() -> GroqAIService:
    """Get or create Groq service singleton."""
    global _groq_service
    if _groq_service is None:
        _groq_service = GroqAIService()
    return _groq_service
