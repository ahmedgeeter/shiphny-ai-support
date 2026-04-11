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
╔══════════════════════════════════════════════════════╗
   شحني Express — شركة الشحن والتوصيل الرائدة في مصر
╚══════════════════════════════════════════════════════╝

■ معلومات التواصل:
- الخط الساخن: 19282 (24 ساعة / 7 أيام)
- واتساب: 01001928200
- الموقع: shiphny.com
- تتبع الشحنات: shiphny.com/track
- البريد: support@shiphny.com
- المقر: القاهرة، مصر

■ نبذة عن الشركة:
- تأسست عام 2019
- 500+ موظف، 200+ سيارة توصيل، 15 مركز فرز
- تخدم أكثر من 1 مليون عميل
- تغطي جميع محافظات مصر الـ 27
- متاحة 24/7 بدون انقطاع

══════════════════════════════════════════
   أسعار الشحن لكل محافظة (قياسي / سريع)
══════════════════════════════════════════

▸ القاهرة الكبرى:
  القاهرة: 35ج / 45ج
  الجيزة: 35ج / 45ج
  القليوبية: 35ج / 45ج

▸ منطقة الدلتا:
  الإسكندرية: 40ج / 55ج
  البحيرة: 40ج / 55ج
  كفر الشيخ: 40ج / 55ج
  الغربية (طنطا): 40ج / 55ج
  المنوفية (شبين الكوم): 40ج / 55ج
  الدقهلية (المنصورة): 40ج / 55ج
  دمياط: 40ج / 55ج
  الشرقية (الزقازيق): 40ج / 55ج

▸ منطقة القناة:
  بورسعيد: 40ج / 55ج
  الإسماعيلية: 40ج / 55ج
  السويس: 40ج / 55ج

▸ الصعيد:
  الفيوم: 50ج / 70ج
  بني سويف: 50ج / 70ج
  المنيا: 50ج / 70ج
  أسيوط: 50ج / 70ج
  سوهاج: 50ج / 70ج
  قنا: 50ج / 70ج
  الأقصر: 50ج / 70ج
  أسوان: 50ج / 70ج

▸ المحافظات الحدودية والسياحية:
  مطروح (مرسى مطروح): 60ج / 85ج
  البحر الأحمر (الغردقة، سفاجا، مرسى علم): 60ج / 85ج
  جنوب سيناء (شرم الشيخ، دهب، نويبع): 60ج / 85ج
  شمال سيناء (العريش): 60ج / 85ج
  الوادي الجديد (الخارجة): 60ج / 85ج

▸ عروض خاصة:
  - شحن مجاني للطلبات فوق 500ج (القاهرة الكبرى فقط)
  - الشركات: أسعار تبدأ من 25ج/شحنة حسب الحجم الشهري

══════════════════════════════════════════
   أوقات التوصيل
══════════════════════════════════════════
- القاهرة / الجيزة / القليوبية: نفس اليوم إذا الطلب قبل 12 ظهراً، وإلا اليوم التالي
- الإسكندرية والدلتا والقناة: 1-2 يوم عمل
- الصعيد (الفيوم لأسوان): 2-3 أيام عمل
- المحافظات الحدودية والسياحية: 3-5 أيام عمل
- لا يوجد توصيل يوم الجمعة
- الأعياد الرسمية: قد يتأخر يوم إضافي

══════════════════════════════════════════
   تتبع الشحنات
══════════════════════════════════════════
- رقم التتبع: يبدأ بـ SH- متبوع بـ 8 أرقام (مثال: SH-12345678)
- طرق التتبع:
  1. الموقع: shiphny.com/track
  2. الخط الساخن: 19282
  3. واتساب: 01001928200
- رسائل SMS تلقائية عند كل مرحلة:
  ✔ إنشاء الشحنة → ✔ استلامها من التاجر → ✔ وصولها لمركز الفرز
  ✔ خروجها للتوصيل → ✔ التسليم النهائي
- وقت تحديث الحالة: كل 2-4 ساعات

══════════════════════════════════════════
   سياسة الإرجاع والاسترداد
══════════════════════════════════════════
- مدة الإرجاع: خلال 14 يوم من تاريخ الاستلام
- الشرط: يجب أن تكون الشحنة في حالتها الأصلية بدون استخدام
- مدة الاسترداد: 3-5 أيام عمل بعد استلام المنتج
- الإرجاع مجاني في حالة:
  ✔ عيب من المصنع
  ✔ المنتج لا يطابق الوصف
  ✔ خطأ في الشحنة من جهتنا
- رسوم الإرجاع: 15ج في حالة رفض الاستلام بدون سبب مقبول
- إعادة التوصيل: مرة واحدة مجانية بعد رفض الاستلام، ثم 15ج لكل محاولة

══════════════════════════════════════════
   تأمين الشحنات
══════════════════════════════════════════
- تأمين مجاني: على كل شحنة تلقائياً حتى 2,000ج
- تأمين ممتد: حتى 50,000ج بإضافة 1% من قيمة الشحنة فقط
- شحنة تالفة: التقط صور فوراً واتصل بنا خلال 24 ساعة للتعويض
- شحنة مفقودة: تعويض كامل خلال 7 أيام عمل بعد التحقق
- الشحنات ذات القيمة العالية: يُنصح بالتأمين الممتد

══════════════════════════════════════════
   طرق الدفع
══════════════════════════════════════════
- كاش عند الاستلام (COD) — الأكثر استخداماً
- فودافون كاش — تحويل فوري
- اورنج كاش / اتصالات كاش
- بطاقات ائتمانية: فيزا / ماستركارد
- فوري — في أي فرع أو تطبيق
- مصاري
- تحويل بنكي (للشركات والحسابات الكبيرة)
- للشركات: فواتير شهرية مع مهلة دفع 15 يوم

══════════════════════════════════════════
   حلول الشركات والمتاجر الإلكترونية
══════════════════════════════════════════
- خصومات تصل لـ 40% على الشحن
- أسعار تبدأ من 25ج/شحنة حسب الحجم الشهري
- مدير حساب مخصص متاح دائماً
- فواتير شهرية مع مهلة دفع 15 يوم
- تقارير يومية وأسبوعية تفصيلية
- ربط API لمتجرك الإلكتروني (Shopify, WooCommerce, Salla, Zid)
- نظام COD متكامل مع تسويات يومية
- لوحة تحكم مخصصة للمتجر
- لا يوجد حد أدنى لعدد الشحنات
- عقود شهرية أو سنوية
- للتسجيل: اتصل 19282 أو راسلنا على business@shiphny.com

══════════════════════════════════════════
   المشاكل الشائعة وحلولها
══════════════════════════════════════════
- شحنة متأخرة: تحقق من رقم التتبع أولاً، لو تأخرت أكثر من المدة المحددة اتصل 19282
- عنوان خاطئ: يمكن تعديله قبل خروج الشحنة للتوصيل عبر 19282 أو واتساب
- مندوب لم يصل: اتصل 19282 وسنعيد جدولة التوصيل فوراً
- شحنة تالفة: التقط صور وأرسلها لواتساب 01001928200 خلال 24 ساعة
- شحنة مفقودة: فتح بلاغ عبر 19282 وتعويض كامل خلال 7 أيام
- لم أستلم رسالة التأكيد: تحقق من رقم الهاتف أو تابع عبر الموقع
- الشحنة عليها Hold: اتصل 19282 لمعرفة السبب وحله

══════════════════════════════════════════
   معلومات إضافية مهمة
══════════════════════════════════════════
- شحن دولي: شحني تعمل داخل مصر فقط، لا شحن لخارج مصر حالياً
- استقبال طرود من الخارج: غير متاح حالياً
- الحد الأقصى لوزن الشحنة: 30 كيلو للشحنة العادية
- الحد الأقصى للأبعاد: 100×60×60 سم
- الشحنات الكبيرة/الثقيلة: تواصل مع فريق الشركات على 19282
- المواد الخطرة والسوائل والمواد القابلة للاشتعال: غير مقبولة
- الأدوية والمستلزمات الطبية: مقبولة مع توثيق
- المجوهرات والذهب: مقبولة مع التأمين الممتد فقط
- ساعات عمل خدمة العملاء: 24/7 على الخط الساخن 19282
"""

KNOWLEDGE_BASE_EN = """
╔══════════════════════════════════════════════════════╗
   Shiphny Express — Egypt's Leading Shipping Company
╚══════════════════════════════════════════════════════╝

■ Contact Information:
- Hotline: 19282 (24/7)
- WhatsApp: 01001928200
- Website: shiphny.com
- Track shipments: shiphny.com/track
- Email: support@shiphny.com
- HQ: Cairo, Egypt

■ About Shiphny:
- Founded 2019 | 500+ staff | 200+ delivery vehicles | 15 sorting centers
- Serves 1M+ customers across all 27 Egyptian governorates | Available 24/7

══════════════════════════════════════════
   Shipping Prices (Standard / Express EGP)
══════════════════════════════════════════
Greater Cairo: Cairo 35/45 | Giza 35/45 | Qalyubia 35/45
Delta: Alexandria 40/55 | Beheira 40/55 | Kafr El Sheikh 40/55
  Gharbia 40/55 | Monufia 40/55 | Dakahlia 40/55 | Damietta 40/55 | Sharqia 40/55
Canal: Port Said 40/55 | Ismailia 40/55 | Suez 40/55
Upper Egypt: Fayoum 50/70 | Beni Suef 50/70 | Minya 50/70
  Assiut 50/70 | Sohag 50/70 | Qena 50/70 | Luxor 50/70 | Aswan 50/70
Border/Tourist: Matrouh 60/85 | Red Sea (Hurghada/Safaga/Marsa Alam) 60/85
  South Sinai (Sharm El Sheikh/Dahab) 60/85 | North Sinai (Arish) 60/85
  New Valley (Kharga) 60/85
Special: Free shipping over EGP 500 (Cairo only) | Business from EGP 25/shipment

══════════════════════════════════════════
   Delivery Times
══════════════════════════════════════════
Cairo/Giza/Qalyubia: Same day if ordered before 12PM, else next day
Alexandria & Delta & Canal: 1-2 business days
Upper Egypt: 2-3 business days
Border/Tourist Governorates: 3-5 business days
No Friday deliveries | Public holidays may add 1 day

══════════════════════════════════════════
   Tracking
══════════════════════════════════════════
Tracking number format: SH- followed by 8 digits (e.g., SH-12345678)
Track via: shiphny.com/track | Hotline 19282 | WhatsApp 01001928200
Automatic SMS at: Created → Collected → Sorting Center → Out for Delivery → Delivered

══════════════════════════════════════════
   Returns & Refunds
══════════════════════════════════════════
Return window: 14 days from delivery | Must be in original unused condition
Refund time: 3-5 business days | Free for: manufacturer defects, wrong item, our error
15 EGP fee for refusal without valid reason | 1 free re-delivery after refusal

══════════════════════════════════════════
   Insurance
══════════════════════════════════════════
Free insurance up to EGP 2,000 on every shipment automatically
Extended up to EGP 50,000 by adding 1% of shipment value
Damaged: take photos, contact within 24hrs | Lost: full compensation within 7 days

══════════════════════════════════════════
   Payment Methods
══════════════════════════════════════════
Cash on Delivery (COD) | Vodafone Cash | Orange Cash | Etisalat Cash
Visa / Mastercard | Fawry | Bank Transfer
Business accounts: monthly invoices with 15-day payment terms

══════════════════════════════════════════
   Business & E-commerce Solutions
══════════════════════════════════════════
Up to 40% discount | From EGP 25/shipment | Dedicated account manager
Daily/weekly reports | API integration (Shopify, WooCommerce, Salla, Zid)
Full COD system with daily settlements | Custom dashboard | No minimum shipments
Monthly or annual contracts | Contact: 19282 or business@shiphny.com

══════════════════════════════════════════
   Important Policies
══════════════════════════════════════════
International shipping: Egypt domestic only — no international shipping
Max weight: 30kg per shipment | Max dimensions: 100×60×60 cm
Large/heavy shipments: contact business team at 19282
Not accepted: hazardous materials, flammables, liquids
Accepted with docs: medicines, medical supplies
Jewelry/gold: accepted with extended insurance only
Customer service: 24/7 on hotline 19282
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
        recent_bookings_text: str = "",
        identity_verified: bool = False,
        verified_ref: str = None,
    ) -> str:
        """Build professional system prompt for Sara - Shiphny AI Agent."""

        customer_name = customer_context.get("name", "العميل" if detected_lang != "en" else "Customer")
        language = detected_lang or customer_context.get("language", "ar")

        # Choose knowledge base based on language
        kb = KNOWLEDGE_BASE_AR if language == "ar" else KNOWLEDGE_BASE_EN

        # Live bookings — only shown after identity is verified
        bookings_section = recent_bookings_text if (recent_bookings_text and identity_verified) else ""

        if language == "ar":
            if identity_verified and bookings_section:
                ref_note = f" للشحنة {verified_ref}" if verified_ref else ""
                verification_status = f"""\n=== ✅ [VERIFIED:{verified_ref or ''}] — تم التحقق من الهوية{ref_note} ===
تم التحقق بنجاح عبر النظام. اعرض تفاصيل الشحنة الموجودة في قسم [تفاصيل الشحنة] بشكل ودي وواضح.
"""
            elif identity_verified and verified_ref:
                verification_status = f"\n=== ✅ [VERIFIED:{verified_ref}] — تم التحقق من هوية العميل للشحنة {verified_ref} \u2014 لكن بيانات الشحنة غير متاحة. أخبر العميل بصدق أنه تم التحقق وستحضر البيانات فوراً.\n"
            else:
                verification_status = ""

            verification_rules = """
=== سياسة التحقق من الهوية [إلزامي — لا تخالفها أبداً] ===

قاعدة الذهب والإياب:
✔️ لا تعرض أي تفاصيل شحنة (حالة، موقع، سعر، وزن، أي بيانات) إلا بعد ظهور [VERIFIED:رقمالشحنة] في السياق.
✖️ لا تقرر أنت بنفسك أن التحقق نجح — هذا قرار النظام وحده.
✖️ لا تخترع تفاصيل شحنة ولا تفترض أي معلومة.
✖️ لا تقل للعميل إن البيانات صحيحة بناءً على ما كتبه — أنت لا تعلم ما هو مخزّن في النظام.

الإجراء عند طلب الشحنة:
1. إذا لم يذكر رقم الشحنة (يبدأ بـ SH-) → اطلبه.
2. بعد ذكر الرقم → اطلب بيانات التحقق بإحدى الطرق الثلاث:
   • آخر 4 أرقام من رقم الموبايل المسجّل
   • أول اسمين (الاسم الأول والثاني) كما هو مسجَّل
   • البريد الإلكتروني المسجَّل مع الشحنة
3. بعد أن يرسل العميل البيانات → قل فقط: "جاري التحقق..." وانتظر رد النظام.
4. إذا ظهر [VERIFIED:رقمالشحنة] في السياق → عرض التفاصيل من قسم [تفاصيل الشحنة] أدناه.
5. إذا لم يظهر [VERIFIED] → قل: "عذراً، البيانات غير متطابقة. حاول مرة أخرى أو اتصل بـ 19282."
"""
            prompt = f"""أنت سارة، موظفة خدمة عملاء شركة شحني للشحن في مصر. العميل: {customer_name}.
ردودك: قصيرة، ودية، بالعربية المصرية، بالإيموجي المناسب.
لا تخترع معلومات — استخدم قاعدة المعلومات فقط. للأسئلة الخارجة عن نطاقك: حوّل للخط الساخن 19282.
{verification_rules}
{verification_status}
{kb}
{bookings_section}"""
        else:
            if identity_verified and bookings_section:
                ref_note_en = f" for shipment {verified_ref}" if verified_ref else ""
                verification_status = f"\n=== ✅ [VERIFIED:{verified_ref or ''}] — Identity Confirmed{ref_note_en} ===\nSystem confirmed identity. Show shipment details from [SHIPMENT DETAILS] section below.\n"
            elif identity_verified and verified_ref:
                verification_status = f"\n=== ✅ [VERIFIED:{verified_ref}] — Identity confirmed for {verified_ref} — details loading. Tell customer verification succeeded and details are coming.\n"
            else:
                verification_status = ""

            verification_rules = """
=== Identity Verification Policy [MANDATORY — NEVER BYPASS] ===

GOLDEN RULE:
✔️ ONLY show shipment details when [VERIFIED:reference] appears in the conversation context.
✖️ NEVER decide yourself that verification succeeded.
✖️ NEVER invent or guess shipment details.
✖️ NEVER tell the customer their info is correct based on what they typed.

Process when customer asks about a shipment:
1. If no SH- reference given → ask for it.
2. Once reference given → ask them to verify identity via ONE of:
   • Last 4 digits of registered mobile
   • First and last name as registered
   • Email address registered with the shipment
3. After they send data → say ONLY: "Checking now..." — wait for system.
4. If [VERIFIED:ref] appears in context → show details from [SHIPMENT DETAILS] below.
5. If [VERIFIED] does NOT appear → say: "Sorry, details don't match. Try again or call 19282."
"""
            prompt = f"""You are Sara, a customer service agent at Shiphny Express (Egypt shipping company). Customer: {customer_name}.
Be friendly, concise, use emojis. Only use info from knowledge base. For out-of-scope questions refer to hotline 19282.
{verification_rules}
{verification_status}
{kb}
{bookings_section}"""

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

    async def _load_recent_bookings(
        self,
        db=None,
        customer_id: int = None,
        verified_ref: str = None,
    ) -> str:
        """
        Load bookings for the current customer — or a specific verified booking.
        Phone/email are NEVER exposed in AI context (privacy).
        Only shown after identity is verified.
        """
        if db is None:
            return ""
        try:
            from sqlalchemy import select, desc, or_
            from app.models.booking import Booking
            bookings = []

            # If a specific shipment was verified, always include it (real-time from DB)
            if verified_ref:
                vres = await db.execute(
                    select(Booking).where(Booking.reference == verified_ref)
                )
                vbk = vres.scalar_one_or_none()
                if vbk:
                    bookings.append(vbk)

            # Also include all bookings belonging to this customer (if logged in)
            if customer_id and customer_id != 1:  # 1 = guest
                query = (
                    select(Booking)
                    .where(Booking.customer_id == customer_id)
                    .order_by(desc(Booking.created_at))
                    .limit(5)
                )
                result = await db.execute(query)
                for b in result.scalars().all():
                    if not any(x.reference == b.reference for x in bookings):
                        bookings.append(b)

            if not bookings:
                return ""

            lines = ["", "### تفاصيل الشحنة (Real-time من قاعدة البيانات):"]
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
        db=None,
        force_verified_ref: str = None,
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

        # ── Identity Verification Check ───────────────────────────────────────
        # 1) If chat endpoint just verified this request, use it directly
        # 2) Otherwise scan conversation history for a persisted [VERIFIED:ref] tag
        identity_verified = False
        verified_ref = None

        if force_verified_ref:
            # This request just got verified — use it immediately
            identity_verified = True
            verified_ref = force_verified_ref
            # Augment user_message so the AI knows verification just succeeded
            # and should now display the shipment details
            if detected_lang == "ar":
                user_message = (
                    f"[النظام: تم التحقق من هوية العميل بنجاح للشحنة {verified_ref}. "
                    f"اعرض تفاصيل الشحنة الآن بشكل ودي.]\n{user_message}"
                )
            else:
                user_message = (
                    f"[SYSTEM: Identity verified for shipment {verified_ref}. "
                    f"Show shipment details now.]\n{user_message}"
                )
        elif conversation_history:
            for msg in conversation_history:
                content = msg.get("content", "")
                if "[VERIFIED:" in content:
                    identity_verified = True
                    try:
                        verified_ref = content.split("[VERIFIED:")[1].split("]")[0].strip()
                    except Exception:
                        pass

        recent_bookings_text = await self._load_recent_bookings(
            db=db,
            customer_id=customer_context.get("customer_id"),
            verified_ref=verified_ref if identity_verified else None,
        )
        system_prompt = self._build_system_prompt(
            customer_context, detected_lang, recent_bookings_text, identity_verified, verified_ref
        )

        ai_content = None
        tokens_used = 0

        messages = [{"role": "system", "content": system_prompt}]
        if conversation_history:
            # Always include messages with SH- refs or [VERIFIED] tags (critical context)
            # Plus the last 6 messages for recency
            import re as _re
            pinned = []
            recent = conversation_history[-8:]
            recent_set = {id(m) for m in recent}
            for msg in conversation_history:
                content = msg.get("content", "")
                is_critical = (
                    bool(_re.search(r'SH-\d{8}', content)) or
                    "[VERIFIED:" in content
                )
                if is_critical and id(msg) not in recent_set:
                    pinned.append(msg)
            for msg in (pinned + recent):
                role = msg.get("role", "user")
                # Skip system messages from going to AI (they were for our logic only)
                if role == "system":
                    continue
                messages.append({"role": role, "content": msg.get("content", "")})
        messages.append({"role": "user", "content": user_message})

        # 1) Try OpenRouter first (free models, no rate limit issues)
        openrouter_key = os.getenv("OPENROUTER_API_KEY")
        if openrouter_key:
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(
                        "https://openrouter.ai/api/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {openrouter_key}",
                            "Content-Type": "application/json",
                            "HTTP-Referer": "https://shiphny-ai-support.onrender.com",
                        },
                        json={
                            "model": "openai/gpt-oss-120b:free",
                            "messages": messages,
                            "temperature": self.temperature,
                            "max_tokens": self.max_tokens,
                        }
                    )
                    if response.status_code == 200:
                        data = response.json()
                        ai_content = data["choices"][0]["message"]["content"]
                        tokens_used = data.get("usage", {}).get("total_tokens", 0)
                        print("[AI] OpenRouter responded")
                    else:
                        print(f"[OpenRouter] Error {response.status_code}: {response.text[:150]}")
            except Exception as e:
                print(f"[OpenRouter] Exception: {e}")

        # 2) Fallback to Groq
        if not ai_content:
            print("[AI] OpenRouter failed — trying Groq")
            for attempt in range(2):
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
                            print(f"[AI] Groq responded (attempt {attempt+1})")
                            break
                        elif response.status_code == 429:
                            import asyncio
                            await asyncio.sleep(3)
                        else:
                            break
                except Exception as e:
                    print(f"[Groq] Exception: {e}")
                    break

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
