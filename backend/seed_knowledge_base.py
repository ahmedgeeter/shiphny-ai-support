"""
Seed Knowledge Base with bilingual articles for Shiphny Express
Run: python seed_knowledge_base.py
"""

import asyncio
import sys
import os

# Add parent dir to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.database import AsyncSessionLocal, Base, get_engine
from app.models.knowledge_base import KnowledgeBaseArticle, ArticleCategory, ArticleLanguage
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select


ARTICLES = [
    # ─── ARABIC ARTICLES ───
    {
        "title": "كيفية تتبع شحنتك",
        "content": """لتتبع شحنتك في شحني، يمكنك استخدام إحدى الطرق التالية:

1. عبر الموقع: ادخل على shiphny.com/track وأدخل رقم الشحنة
2. عبر الخط الساخن: اتصل على 19282 واعطيهم رقم الشحنة
3. عبر واتساب: أرسل رقم الشحنة على 01001928200

رقم الشحنة يبدأ بـ SH- متبوع بـ 8 أرقام (مثال: SH-12345678)

ستحصل على تحديثات SMS تلقائياً عند كل مرحلة:
- إنشاء الشحنة
- استلامها من التاجر
- وصولها لمركز الفرز
- خروجها للتوصيل
- التسليم النهائي""",
        "summary": "تتبع الشحنة عبر الموقع أو الخط الساخن 19282 أو واتساب باستخدام رقم الشحنة SH-",
        "category": ArticleCategory.SHIPPING,
        "language": ArticleLanguage.ARABIC,
        "keywords": "تتبع,متابعة,شحنة,رقم,tracking,SH-",
        "is_pinned": True,
    },
    {
        "title": "أسعار الشحن",
        "content": """أسعار شحن شحني:

الشحن القياسي:
- القاهرة الكبرى: 35 ج.م
- الإسكندرية والدلتا: 40 ج.م
- الصعيد: 50 ج.م
- المحافظات الحدودية: 60 ج.م

الشحن السريع:
- القاهرة الكبرى: 45 ج.م
- الإسكندرية والدلتا: 55 ج.م
- الصعيد: 70 ج.م
- المحافظات الحدودية: 85 ج.م

عروض خاصة:
- شحن مجاني فوق 500 ج.م (القاهرة فقط)
- أسعار الشركات من 25 ج.م/شحنة""",
        "summary": "أسعار الشحن تبدأ من 35 ج.م للقياسي و45 ج.م للسريع في القاهرة",
        "category": ArticleCategory.SHIPPING,
        "language": ArticleLanguage.ARABIC,
        "keywords": "سعر,تكلفة,أسعار,رسوم,فلوس,كم,price,cost",
        "is_pinned": True,
    },
    {
        "title": "مناطق التغطية والتوصيل",
        "content": """شحني تغطي جميع محافظات مصر الـ 27:

القاهرة الكبرى: القاهرة، الجيزة، القليوبية
الدلتا: الإسكندرية، البحيرة، كفر الشيخ، الغربية، المنوفية، الدقهلية، دمياط
الصعيد: الفيوم، بني سويف، المنيا، أسيوط، سوهاج، قنا، الأقصر، أسوان
القناة: بورسعيد، الإسماعيلية، السويس
الحدود: مطروح، البحر الأحمر، الوادي الجديد، شمال سيناء، جنوب سيناء

أوقات التوصيل:
- القاهرة: نفس اليوم (قبل 12 ظهراً) أو اليوم التالي
- الإسكندرية والدلتا: 1-2 يوم عمل
- الصعيد: 2-3 أيام عمل
- المحافظات الحدودية: 3-5 أيام عمل
- لا يوجد توصيل يوم الجمعة""",
        "summary": "تغطية جميع محافظات مصر الـ 27 مع توصيل من نفس اليوم لـ 5 أيام عمل",
        "category": ArticleCategory.SHIPPING,
        "language": ArticleLanguage.ARABIC,
        "keywords": "تغطية,منطقة,محافظة,توصلون,توصيل,فين,coverage,area",
        "is_pinned": True,
    },
    {
        "title": "سياسة الإرجاع والاسترداد",
        "content": """سياسة إرجاع شحني:

- يمكن إرجاع الشحنة خلال 14 يوم من تاريخ الاستلام
- يجب أن تكون الشحنة في حالتها الأصلية بدون استخدام
- استرداد المبلغ خلال 3-5 أيام عمل
- الإرجاع مجاني في حالة عيب من المصنع
- رسوم إرجاع 15 ج.م في حالة رفض الاستلام بدون سبب
- يمكن إعادة التوصيل مرة واحدة مجاناً بعد رفض الاستلام""",
        "summary": "إرجاع خلال 14 يوم واسترداد خلال 3-5 أيام عمل",
        "category": ArticleCategory.RETURNS,
        "language": ArticleLanguage.ARABIC,
        "keywords": "استرجاع,استرداد,إرجاع,رفضت,رجع,refund,return",
    },
    {
        "title": "تأمين الشحنات",
        "content": """تأمين شحنات شحني:

- تأمين مجاني على كل شحنة حتى 2,000 ج.م
- تأمين ممتد حتى 50,000 ج.م بإضافة 1% من قيمة الشحنة
- تعويض كامل في حالة الفقد أو التلف بسبب الشركة
- في حالة التلف: التقط صور واتصل بنا خلال 24 ساعة
- في حالة الفقد: تعويض كامل خلال 7 أيام عمل بعد التحقق""",
        "summary": "تأمين مجاني حتى 2000 ج.م وممتد حتى 50000 ج.م",
        "category": ArticleCategory.PRODUCTS,
        "language": ArticleLanguage.ARABIC,
        "keywords": "تأمين,تعويض,تلف,فقد,ضمان,insurance,compensation",
    },
    {
        "title": "طرق الدفع المتاحة",
        "content": """طرق الدفع في شحني:

1. كاش عند الاستلام (COD) - الأكثر استخداماً
2. فودافون كاش - تحويل فوري
3. تحويل بنكي - لحسابات الشركات
4. بطاقات ائتمانية (فيزا / ماستركارد)
5. فوري / مصاري - في أي فرع

للشركات: فواتير شهرية مع مهلة دفع 15 يوم""",
        "summary": "COD, فودافون كاش, تحويل بنكي, فيزا, فوري",
        "category": ArticleCategory.PAYMENTS,
        "language": ArticleLanguage.ARABIC,
        "keywords": "دفع,فودافون كاش,كاش,تحويل,بطاقة,فوري,payment,cod,cash",
    },
    {
        "title": "حلول الشركات والخصومات",
        "content": """حلول شحني للشركات:

المميزات:
- خصومات تصل لـ 40% على الشحن
- مدير حساب مخصص ليك
- فواتير شهرية مع مهلة دفع 15 يوم
- تقارير يومية بالشحنات
- ربط API لمتجرك الإلكتروني
- نظام COD متكامل

الأسعار:
- تبدأ من 25 ج.م/شحنة (حسب الحجم الشهري)
- عقد شهري أو سنوي
- لا يوجد حد أدنى لعدد الشحنات

للتفاصيل: اتصل 19282""",
        "summary": "خصومات حتى 40% وأسعار من 25 ج.م/شحنة للشركات",
        "category": ArticleCategory.PROMOTIONS,
        "language": ArticleLanguage.ARABIC,
        "keywords": "شركة,عقد,تعاقد,خصم,حساب,تجاري,business,corporate,enterprise",
    },

    # ─── ENGLISH ARTICLES ───
    {
        "title": "How to Track Your Shipment",
        "content": """To track your Shiphny shipment, you can use any of these methods:

1. Via Website: Go to shiphny.com/track and enter your tracking number
2. Via Hotline: Call 19282 and provide your tracking number
3. Via WhatsApp: Send your tracking number to 01001928200

Your tracking number starts with SH- followed by 8 digits (e.g., SH-12345678)

You'll receive automatic SMS updates at each stage:
- Shipment Created
- Collected from Merchant
- At Sorting Center
- Out for Delivery
- Delivered""",
        "summary": "Track shipments via website, hotline 19282, or WhatsApp using SH- tracking number",
        "category": ArticleCategory.SHIPPING,
        "language": ArticleLanguage.ENGLISH,
        "keywords": "track,tracking,shipment,number,SH-,status,where",
        "is_pinned": True,
    },
    {
        "title": "Shipping Rates",
        "content": """Shiphny shipping rates:

Standard Shipping:
- Greater Cairo: EGP 35
- Alexandria & Delta: EGP 40
- Upper Egypt: EGP 50
- Border Governorates: EGP 60

Express Shipping:
- Greater Cairo: EGP 45
- Alexandria & Delta: EGP 55
- Upper Egypt: EGP 70
- Border Governorates: EGP 85

Special Offers:
- Free shipping over EGP 500 (Cairo only)
- Business rates from EGP 25/shipment""",
        "summary": "Shipping rates start from EGP 35 standard and EGP 45 express in Cairo",
        "category": ArticleCategory.SHIPPING,
        "language": ArticleLanguage.ENGLISH,
        "keywords": "price,cost,rates,fee,charge,how much,shipping",
        "is_pinned": True,
    },
    {
        "title": "Coverage Areas & Delivery Times",
        "content": """Shiphny covers all 27 Egyptian governorates:

Greater Cairo: Cairo, Giza, Qalyubia
Delta: Alexandria, Beheira, Kafr El Sheikh, Gharbia, Monufia, Dakahlia, Damietta
Upper Egypt: Fayoum, Beni Suef, Minya, Assiut, Sohag, Qena, Luxor, Aswan
Canal: Port Said, Ismailia, Suez
Border: Matrouh, Red Sea, New Valley, North Sinai, South Sinai

Delivery Times:
- Cairo: Same day (if before 12 PM) or next day
- Alexandria & Delta: 1-2 business days
- Upper Egypt: 2-3 business days
- Border Governorates: 3-5 business days
- No Friday deliveries""",
        "summary": "All 27 governorates covered, delivery from same day to 5 business days",
        "category": ArticleCategory.SHIPPING,
        "language": ArticleLanguage.ENGLISH,
        "keywords": "coverage,area,governorate,deliver to,location,coverage",
        "is_pinned": True,
    },
    {
        "title": "Returns & Refunds Policy",
        "content": """Shiphny Return Policy:

- Return within 14 days of delivery
- Must be in original condition without use
- Refund within 3-5 business days
- Free return for manufacturer defects
- EGP 15 return fee for refusal without reason
- One free re-delivery after refused delivery""",
        "summary": "14-day returns, 3-5 day refunds, free for defects",
        "category": ArticleCategory.RETURNS,
        "language": ArticleLanguage.ENGLISH,
        "keywords": "refund,return,money back,cancel,send back",
    },
    {
        "title": "Shipment Insurance",
        "content": """Shiphny Shipment Insurance:

- Free insurance on every shipment up to EGP 2,000
- Extended insurance up to EGP 50,000 (add 1% of shipment value)
- Full compensation for loss or damage caused by company
- For damage: Take photos and contact us within 24 hours
- For loss: Full compensation within 7 business days after verification""",
        "summary": "Free insurance up to EGP 2,000, extended up to EGP 50,000",
        "category": ArticleCategory.PRODUCTS,
        "language": ArticleLanguage.ENGLISH,
        "keywords": "insurance,compensation,damaged,lost,guarantee,warranty",
    },
    {
        "title": "Payment Methods",
        "content": """Shiphny Payment Methods:

1. Cash on Delivery (COD) - Most popular
2. Vodafone Cash - Instant transfer
3. Bank Transfer - For business accounts
4. Credit Cards (Visa / Mastercard)
5. Fawry / Masary - At any branch

For Businesses: Monthly invoices with 15-day payment terms""",
        "summary": "COD, Vodafone Cash, Bank Transfer, Visa, Fawry accepted",
        "category": ArticleCategory.PAYMENTS,
        "language": ArticleLanguage.ENGLISH,
        "keywords": "payment,pay,cod,cash,card,vodafone cash",
    },
    {
        "title": "Business Solutions & Discounts",
        "content": """Shiphny Business Solutions:

Benefits:
- Up to 40% discount on shipping
- Dedicated account manager
- Monthly invoices with 15-day payment terms
- Daily shipment reports
- API integration for your online store
- Full COD system

Pricing:
- Starting from EGP 25/shipment (based on monthly volume)
- Monthly or annual contracts
- No minimum shipment requirement

For details: Call 19282""",
        "summary": "Up to 40% discount, rates from EGP 25/shipment for businesses",
        "category": ArticleCategory.PROMOTIONS,
        "language": ArticleLanguage.ENGLISH,
        "keywords": "business,contract,corporate,enterprise,bulk,partnership",
    },
]


async def seed():
    """Seed the knowledge base with articles."""
    engine = get_engine()

    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Check if already seeded
        result = await session.execute(
            select(KnowledgeBaseArticle).limit(1)
        )
        if result.scalar_one_or_none():
            print("⚠️  Knowledge base already has articles. Clearing and re-seeding...")
            from sqlalchemy import delete
            await session.execute(delete(KnowledgeBaseArticle))
            await session.commit()

        # Insert articles
        for article_data in ARTICLES:
            article = KnowledgeBaseArticle(**article_data)
            session.add(article)

        await session.commit()
        print(f"✅ Seeded {len(ARTICLES)} knowledge base articles ({sum(1 for a in ARTICLES if a['language'] == ArticleLanguage.ARABIC)} AR + {sum(1 for a in ARTICLES if a['language'] == ArticleLanguage.ENGLISH)} EN)")


if __name__ == "__main__":
    asyncio.run(seed())
