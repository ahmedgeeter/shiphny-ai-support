"""
Bilingual Fallback Responses for Shiphny Express AI Agent
Used when Groq API key is not available
"""

from typing import Dict


FALLBACK_RESPONSES_AR: Dict[str, str] = {
    "shipping_status": """لتتبع شحنتك، يمكنك:

1. الدخول على موقعنا: shiphny.com/track
2. الاتصال بالخط الساخن: 19282
3. واتساب: 01001928200

فقط أدخل رقم الشحنة (يبدأ بـ SH-) وستحصل على كل التفاصيل.""",

    "shipping_price": """أسعار الشحن لدينا:

• القاهرة الكبرى: من 35 ج.م (قياسي) / 45 ج.م (سريع)
• الإسكندرية والدلتا: من 40 ج.م (قياسي) / 55 ج.م (سريع)
• الصعيد: من 50 ج.م (قياسي) / 70 ج.م (سريع)
• المحافظات الحدودية: من 60 ج.م (قياسي) / 85 ج.م (سريع)
• الشحن المجاني فوق 500 ج.م (القاهرة فقط)
• أسعار الشركات من 25 ج.م/شحنة

للتفاصيل اتصل بنا: 19282""",

    "coverage_area": """نغطي جميع محافظات مصر الـ 27!

[+] القاهرة الكبرى (القاهرة، الجيزة، القليوبية)
[+] الدلتا (الإسكندرية، البحيرة، الغربية، المنوفية، الدقهلية)
[+] الصعيد (المنيا، أسيوط، سوهاج، قنا، الأقصر، أسوان)
[+] القناة (بورسعيد، الإسماعيلية، السويس)
[+] المحافظات الحدودية (مطروح، البحر الأحمر، سيناء)

أي محافظة تفكر فيها - نوصلها.""",

    "refund_request": """سياسة الإرجاع:

• الإرجاع خلال 14 يوم من الاستلام
• الشحنة لازم تكون في حالتها الأصلية
• استرداد المبلغ خلال 3-5 أيام عمل
• إرجاع مجاني لو العيب من المصنع
• رسوم 15 ج.م لو رفضت الاستلام بدون سبب

اتصل بنا: 19282 للمساعدة""",

    "complaint": """نأسف جداً لسماع ذلك. نأخذ كل شكوى بجدية تامة.

لحل المشكلة بسرعة:
1. اتصل بالخط الساخن: 19282
2. أو واتساب: 01001928200
3. اذكر رقم الشحنة وتفاصيل المشكلة

سنعمل كل شيء لحل المشكلة.""",

    "business_inquiry": """حلول الشركات من شحني:

• خصومات تصل لـ 40% على الشحن
• مدير حساب مخصص لك
• فواتير شهرية وتقارير يومية
• ربط API لمتجرك الإلكتروني
• أسعار تبدأ من 25 ج.م/شحنة

اتصل بنا: 19282 لعمل عرض خاص.""",

    "payment_inquiry": """طرق الدفع المتاحة:

• كاش عند الاستلام (COD)
• فودافون كاش
• تحويل بنكي
• فيزا / ماستركارد
• فوري / مصاري

الدفع السهل والآمن مع شحني.""",

    "insurance_inquiry": """تأمين الشحنات:

• تأمين مجاني حتى 2,000 ج.م
• تأمين ممتد حتى 50,000 ج.م (1% من قيمة الشحنة)
• تعويض كامل لو الشحنة ضاعت أو اتلفت بسببنا

شحنتك في أمان مع شحني.""",

    "greeting": """أهلاً وسهلاً! أنا سارة، مساعدتك الذكية في شحني.

أقدر أساعدك في:
- تتبع الشحنات
- أسعار الشحن
- مناطق التغطية
- مواعيد التوصيل
- الإرجاع والاسترداد

قول لي كيف أقدر أساعدك.""",

    "general_inquiry": """أنا سارة من شحني، أقدر أساعدك في:

- تتبع الشحنات - أدخل رقم الشحنة
- أسعار الشحن - قول لي المنطقة
- مناطق التغطية - نوصل كل مكان في مصر
- الإرجاع والاسترداد
- حلول الشركات

أو اتصل بالخط الساخن: 19282""",
}


FALLBACK_RESPONSES_EN: Dict[str, str] = {
    "shipping_status": """To track your shipment, you can:

1. Visit our website: shiphny.com/track
2. Call our hotline: 19282
3. WhatsApp: 01001928200

Just enter your tracking number (starts with SH-) and you will get all the details.""",

    "shipping_price": """Our shipping rates:

• Greater Cairo: from EGP 35 (standard) / EGP 45 (express)
• Alexandria & Delta: from EGP 40 (standard) / EGP 55 (express)
• Upper Egypt: from EGP 50 (standard) / EGP 70 (express)
• Border Governorates: from EGP 60 (standard) / EGP 85 (express)
• Free shipping over EGP 500 (Cairo only)
• Business rates from EGP 25/shipment

For details, call us: 19282""",

    "coverage_area": """We cover all 27 Egyptian governorates!

[+] Greater Cairo (Cairo, Giza, Qalyubia)
[+] Delta (Alexandria, Beheira, Gharbia, Monufia, Dakahlia)
[+] Upper Egypt (Minya, Assiut, Sohag, Qena, Luxor, Aswan)
[+] Canal (Port Said, Ismailia, Suez)
[+] Border Governorates (Matrouh, Red Sea, Sinai)

Wherever you need - we deliver.""",

    "refund_request": """Return Policy:

• Return within 14 days of delivery
• Must be in original condition
• Refund within 3-5 business days
• Free return for manufacturer defects
• EGP 15 fee for refusal without reason

Call us: 19282 and we will help you.""",

    "complaint": """We are very sorry to hear that. We take every complaint seriously.

To resolve this quickly:
1. Call our hotline: 19282
2. Or WhatsApp: 01001928200
3. Provide your tracking number and issue details

We will do everything to fix this.""",

    "business_inquiry": """Shiphny Business Solutions:

• Up to 40% discount on shipping
• Dedicated account manager
• Monthly invoices and daily reports
• API integration for your online store
• Rates starting from EGP 25/shipment

Call us: 19282 for a custom quote.""",

    "payment_inquiry": """Available Payment Methods:

• Cash on Delivery (COD)
• Vodafone Cash
• Bank Transfer
• Visa / Mastercard
• Fawry / Masary

Easy and secure payments with Shiphny.""",

    "insurance_inquiry": """Shipment Insurance:

• Free insurance up to EGP 2,000
• Extended insurance up to EGP 50,000 (1% of shipment value)
• Full compensation for loss or damage caused by us

Your shipment is safe with Shiphny.""",

    "greeting": """Hello! I am Sara, your smart assistant at Shiphny Express.

I can help you with:
- Shipment Tracking
- Shipping Rates
- Coverage Areas
- Delivery Times
- Returns and Refunds

How can I help you today?""",

    "general_inquiry": """I am Sara from Shiphny, I can help you with:

- Shipment Tracking - enter your tracking number
- Shipping Rates - tell me the area
- Coverage - we deliver everywhere in Egypt
- Returns and Refunds
- Business Solutions

Or call our hotline: 19282""",
}


def get_fallback_response(message: str, language: str = "ar") -> str:
    """Get appropriate fallback response based on message intent and language."""
    from app.services.groq_ai import GroqAIService

    service = GroqAIService()
    detected_intent, _ = service._detect_intent(message)

    responses = FALLBACK_RESPONSES_AR if language == "ar" else FALLBACK_RESPONSES_EN

    return responses.get(detected_intent, responses["general_inquiry"])
