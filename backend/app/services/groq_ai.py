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
KNOWLEDGE_BASE_AR = """
=== شحني Express — شركة الشحن الرائدة في مصر ===
الخط الساخن: 19282 | واتساب: 01001928200 | تتبع: shiphny.com/track | 24/7
تأسست 2019 | 500+ موظف | 200+ سيارة | 15 مركز فرز

--- أسعار الشحن لكل محافظة (قياسي/سريع بالجنيه) ---
القاهرة: 35/45 | الجيزة: 35/45 | القليوبية: 35/45
الإسكندرية: 40/55 | البحيرة: 40/55 | كفر الشيخ: 40/55
الغربية: 40/55 | المنوفية: 40/55 | الدقهلية: 40/55 | دمياط: 40/55
الفيوم: 50/70 | بني سويف: 50/70 | المنيا: 50/70
أسيوط: 50/70 | سوهاج: 50/70 | قنا: 50/70 | الأقصر: 50/70 | أسوان: 50/70
بورسعيد: 40/55 | الإسماعيلية: 40/55 | السويس: 40/55
مطروح: 60/85 | البحر الأحمر (الغردقة/سفاجا): 60/85
جنوب سيناء (شرم الشيخ): 60/85 | شمال سيناء (العريش): 60/85
الوادي الجديد: 60/85
شحن مجاني للطلبات فوق 500ج (القاهرة فقط) | الشركات من 25ج/شحنة

--- أوقات التوصيل ---
القاهرة/الجيزة/القليوبية: نفس اليوم لو قبل 12ظ وإلا اليوم التالي
الدلتا والقناة: 1-2 يوم عمل | الصعيد: 2-3 أيام | الحدود: 3-5 أيام
لا توصيل الجمعة

--- خدمات ---
تتبع: رقم SH- + 8 أرقام | عبر shiphny.com/track أو 19282 أو واتساب
تأمين: مجاني حتى 2000ج | ممتد حتى 50000ج بإضافة 1%
إرجاع: خلال 14 يوم | استرداد 3-5 أيام | مجاني لعيوب المصنع | 15ج للرفض بدون سبب
دفع: كاش/COD/فودافون كاش/فيزا/ماستركارد/فوري/مصاري/تحويل بنكي
شحنة تالفة: اتصل خلال 24ساعة بصور | شحنة مفقودة: تعويض خلال 7 أيام
عنوان خاطئ: عدّل قبل خروج الشحنة عبر 19282 | رفض الاستلام: إعادة توصيل مجانية
الشركات: خصم 40% | مدير حساب | API | فواتير شهرية | لا حد أدنى للشحنات
شحن دولي: لا تشحن لخارج مصر | داخل مصر فقط
طرود: لا تستقبل طرود من خارج مصر حالياً
"""

KNOWLEDGE_BASE_EN = """
=== Shiphny Express — Egypt's Leading Shipping Company ===
Hotline: 19282 | WhatsApp: 01001928200 | Track: shiphny.com/track | 24/7
Founded 2019 | 500+ staff | 200+ vehicles | 15 sorting centers

--- Prices per Governorate (Standard/Express EGP) ---
Cairo: 35/45 | Giza: 35/45 | Qalyubia: 35/45
Alexandria: 40/55 | Beheira: 40/55 | Kafr El Sheikh: 40/55
Gharbia: 40/55 | Monufia: 40/55 | Dakahlia: 40/55 | Damietta: 40/55
Fayoum: 50/70 | Beni Suef: 50/70 | Minya: 50/70
Assiut: 50/70 | Sohag: 50/70 | Qena: 50/70 | Luxor: 50/70 | Aswan: 50/70
Port Said: 40/55 | Ismailia: 40/55 | Suez: 40/55
Matrouh: 60/85 | Red Sea (Hurghada/Safaga): 60/85
South Sinai (Sharm El Sheikh): 60/85 | North Sinai (Arish): 60/85
New Valley: 60/85
Free shipping over EGP 500 (Cairo only) | Business from EGP 25/shipment

--- Delivery Times ---
Cairo/Giza/Qalyubia: Same day if before 12PM, else next day
Delta & Canal: 1-2 business days | Upper Egypt: 2-3 days | Border: 3-5 days
No Friday deliveries

--- Services ---
Tracking: SH- + 8 digits | Via website, hotline or WhatsApp
Insurance: Free up to 2000 EGP | Extended up to 50,000 EGP (+1%)
Returns: 14 days | Refund 3-5 days | Free for defects | 15 EGP refused delivery fee
Payment: Cash/COD/Vodafone Cash/Visa/Mastercard/Fawry/Bank Transfer
Damaged shipment: Contact within 24hrs with photos | Lost: compensation within 7 days
Wrong address: Fix before dispatch via 19282 | Refused: 1 free re-delivery
Business: 40% discount | Account manager | API | Monthly invoices | No minimum
International: Domestic Egypt only — no international shipping
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
            prompt = f"""أنت سارة، موظفة خدمة عملاء شركة شحني للشحن في مصر. العميل: {customer_name}.
ردودك: قصيرة، ودية، بالعربية المصرية، بالإيموجي المناسب.
لا تخترع معلومات — استخدم قاعدة المعلومات فقط. للأسئلة الخارجة عن نطاقك: حوّل للخط الساخن 19282.
{kb}
{booking_section}"""
        else:
            prompt = f"""You are Sara, a customer service agent at Shiphny Express (Egypt shipping company). Customer: {customer_name}.
Be friendly, concise, use emojis. Only use info from knowledge base. For out-of-scope questions refer to hotline 19282.
{kb}
{booking_section}"""

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

        ai_content = None
        tokens_used = 0

        # 1) Try Gemini first (1M token/min free limit)
        from app.services.gemini_ai import gemini_generate
        ai_content = await gemini_generate(system_prompt, user_message, conversation_history)
        if ai_content:
            print("[AI] Gemini responded")

        # 2) Fallback to Groq if Gemini fails
        if not ai_content:
            print("[AI] Gemini failed — trying Groq")
            messages = [{"role": "system", "content": system_prompt}]
            if conversation_history:
                for msg in conversation_history[-6:]:
                    messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
            messages.append({"role": "user", "content": user_message})
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(
                        self.GROQ_API_URL,
                        headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
                        json={"model": self.model, "messages": messages, "temperature": self.temperature, "max_tokens": self.max_tokens}
                    )
                    if response.status_code == 200:
                        data = response.json()
                        ai_content = data["choices"][0]["message"]["content"]
                        tokens_used = data.get("usage", {}).get("total_tokens", 0)
                        print("[AI] Groq responded")
                    else:
                        print(f"[Groq] Error {response.status_code}")
            except Exception as e:
                print(f"[Groq] Exception: {e}")

        # 3) Static fallback
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
