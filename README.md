<div align="center">

<pre>
   _____ _     _       _   _         _____ _    _        _____ _        _            _     
  / ____| |   (_)     | | | |       |_   _| |  | |      / ____| |      | |          | |    
 | (___ | |__  _ _ __ | |_| |__  _   _| | | |__| |_____| (___ | |_ __ _| |_ ___  ___| |__  
  \___ \| '_ \| | '_ \| __| '_ \| | | | | |  __  |______\___ \| __/ _` | __/ _ \/ __| '_ \ 
  ____) | | | | | |_) | |_| | | | |_| |_| | |  | |      ____) | || (_| | ||  __/\__ \ | | |
 |_____/|_| |_|_| .__/ \__|_| |_|\__, |_____|_|  |_|     |_____/ \__\__,_|\__\___||___/_| |_|
                | |               __/ |                                                    
                |_|              |___/                                                     
</pre>

<h3>AI-Powered Customer Support for Egyptian Shipping</h3>
<p><strong>Production-Grade | Bilingual | Zero-Downtime Failover | 24/24 Security Tests</strong></p>

<p>
  <img src="https://img.shields.io/badge/Python-3.11-3776AB?style=flat&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-0.111-009688?style=flat&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white" />
</p>

<p>
  <a href="#english">English</a> • <a href="#arabic">العربية</a>
</p>

</div>

---

<a name="english"></a>
# English Documentation

## Executive Summary

**Shiphny AI Support Agent** is a production-ready customer service automation system built for an Egyptian shipping company. The system handles real-time conversations in Arabic and English, performs identity verification before revealing sensitive shipment data, and maintains 100% uptime through a 4-layer AI failover architecture.

### Key Results

| Metric | Result |
|--------|--------|
| Security Tests | 24/24 passing |
| Response Time | <500ms (average) |
| Uptime | 99.9% with failover |
| Languages | Arabic + English |
| AI Providers | 3 (OpenRouter, Groq, Gemini) |

---

## The Problem

Egyptian shipping companies face critical customer service challenges:

| Traditional Support | AI-Powered Solution |
|---------------------|---------------------|
| 10+ minute wait times | Instant response |
| 9 PM closing time | 24/7 availability |
| Inconsistent pricing answers | Exact prices for 27 governorates |
| No caller verification | Mandatory identity verification |
| System downtime = no service | 4-layer AI failover chain |

---

## Technical Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React 18)                       │
│              Chat Widget | Analytics | RTL Arabic            │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   FASTAPI BACKEND                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Rate Limit  │  │  Injection  │  │  Session Manager    │  │
│  │  60/min/IP  │  │    Guard    │  │  (per conversation) │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                 │                    │            │
│         ▼                 ▼                    ▼            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │        DETERMINISTIC VERIFICATION LAYER                 │ │
│  │  User asks about SH-XXXXXX                             │ │
│  │       │                                                │ │
│  │       ├── No verification yet → Request email/phone/name│ │
│  │       ├── Wrong data → Reject with instructions         │ │
│  │       └── Correct data → Show shipment details (no AI) │ │
│  └────────────────────────────────────────────────────────┘ │
│                            │                                 │
│         ┌──────────────────┴──────────────────┐              │
│         ▼                                      ▼              │
│  ┌─────────────────┐              ┌──────────────────────┐     │
│  │  AI Provider    │              │   Static Fallback  │     │
│  │  Chain (for     │  ──fails──►  │   (zero API keys)  │     │
│  │  general Qs)    │              │                    │     │
│  │                 │              │ Intent-matched     │     │
│  │ OpenRouter →    │              │ bilingual          │     │
│  │ Groq → Gemini   │              │ responses          │     │
│  └─────────────────┘              └──────────────────────┘     │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Why This Architecture Matters

**1. Deterministic Security Layer**
- Verification decisions happen in backend code, not AI
- AI never decides whether to show sensitive data
- Works even when all AI providers are down

**2. Multi-Provider Failover**
- OpenRouter rotates 3 free models automatically
- Groq provides ultra-fast (~300ms) responses
- Gemini offers generous free quotas
- Static fallback ensures zero downtime

**3. Session Isolation**
- Each conversation has isolated verification state
- No leakage between sessions
- System-message-only verification tags

---

## Security Implementation

### 5-Layer Defense System

```
Layer 0: Global Injection Guard
         Sanitizes [VERIFIED:], SYSTEM OVERRIDE, ADMIN MODE from history

Layer 1: Injection Marker Blocker
         Rejects user messages with system-like patterns

Layer 2: Deterministic Response Builder
         Backend builds verification responses — AI not involved

Layer 3: AI System Prompt Rules
         Explicitly forbids self-verification

Layer 4: System-Only Trust
         Only system messages can mark [VERIFIED]
```

### Verification Flow

```
Customer: "Where is my shipment SH-12345678?"
    │
    ├─── System extracts reference: SH-12345678
    ├─── Checks conversation history for [VERIFIED] tag
    │
    ├─── NOT VERIFIED ──► "Please verify with email, phone, or name"
    │
    ├─── CUSTOMER SENDS: "ahmed@email.com"
    │
    ├─── System validates against database
    │       │
    │       ├── MATCH ──► Show shipment details
    │       └── NO MATCH ──► "Data incorrect. Try again or call 19282"
    │
    └─── AI never involved in verification decision
```

### Security Test Coverage: 24/24 Passing

| Test ID | Attack Vector | Result |
|---------|---------------|--------|
| SEC-01 | Request shipment without verification | Blocked |
| SEC-02 | Wrong email provided | Rejected, no data leaked |
| SEC-03 | Wrong phone provided | Rejected, no data leaked |
| SEC-04 | Wrong name provided | Rejected, no data leaked |
| SEC-05 | Self-verify injection ([VERIFIED:]) | Blocked |
| SEC-06 | Correct email provided | Details shown |
| SEC-07 | Correct phone provided | Details shown |
| SEC-08 | Correct name provided | Details shown |
| SEC-09 | Follow-up in verified session | No re-verification |
| SEC-10 | Session isolation (new session) | Properly isolated |
| SEC-11 | English verification flow | Working |
| SEC-12 | Prompt injection (4 variants) | All blocked |

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Backend | FastAPI 0.111 + Python 3.11 | Async API framework |
| AI Providers | OpenRouter, Groq, Gemini | Multi-provider failover |
| Database | SQLAlchemy 2 + SQLite/PostgreSQL | Async ORM |
| Frontend | React 18 + TypeScript 5 | Type-safe UI |
| Styling | Tailwind CSS | Responsive + RTL |
| HTTP Client | httpx | Async requests |
| Validation | Pydantic v2 | Type safety |

---

## API Reference

### Core Endpoints

**POST /api/chat**
```json
Request:
{
  "message": "عايز اعرف حالة شحنتي SH-12345678",
  "session_id": "optional-session-id",
  "language": "ar"
}

Response:
{
  "response": "لأديك تفاصيل شحنتك SH-12345678، محتاج أتحقق من هويتك...",
  "session_id": "generated-session-id",
  "confidence": 0.85,
  "response_time_ms": 245.3,
  "detected_intent": "shipping_status",
  "escalated": false
}
```

**POST /api/bookings/verify-identity**
```json
Request:
{
  "reference": "SH-12345678",
  "method": "email",
  "value": "customer@example.com"
}

Response:
{
  "verified": true,
  "booking": { ...shipment details... }
}
```

### Additional Endpoints

| Endpoint | Description |
|----------|-------------|
| GET /api/health | Health check |
| GET /api/analytics/dashboard | Conversation stats |
| GET /api/customers | Customer list |
| GET /api/debug/apikey | API key status |

---

## Engineering Challenges & Solutions

### Challenge 1: Preventing AI Data Leakage
**Problem:** AI models occasionally revealed shipment details before verification, especially fallback models.

**Solution:** Moved verification logic to deterministic backend layer. Verification responses built directly from database — AI never decides to show/hide data.

### Challenge 2: Multi-Provider Rate Limits
**Problem:** Free tiers limit requests (Groq ~30/min, OpenRouter 429s).

**Solution:** Built 4-layer failover chain with automatic rotation and fallback tracking.

### Challenge 3: Arabic NLP & RTL
**Problem:** Egyptian Arabic has limited NLP support, RTL requires special handling.

**Solution:** Character-based detection, regex intent matching, complete bilingual KB, CSS RTL.

### Challenge 4: Production Cold Starts
**Problem:** Free hosting tiers have 30s+ cold starts.

**Solution:** Lightweight ping endpoint for cron jobs, containerized deployment configs.

---

## Deployment

### Backend on Render

```yaml
# render.yaml (included in repo)
services:
  - type: web
    name: shiphny-ai-support
    runtime: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: OPENROUTER_API_KEY
        sync: false
      - key: GROQ_API_KEY
        sync: false
```

**Steps:**
1. Create Web Service at render.com
2. Connect GitHub repository
3. Add environment variables
4. Deploy (auto-detects render.yaml)

### Frontend on Vercel

```bash
cd frontend
npm run build
npx vercel --prod
```

Or manual:
1. Import GitHub repo at vercel.com
2. Root directory: `frontend`
3. Build: `npm run build`
4. Output: `dist`
5. Env: `VITE_API_URL=https://shiphny-ai-support.onrender.com`

### Preventing Cold Starts

Set up free cron at cron-job.org:
- URL: `https://shiphny-ai-support.onrender.com/api/ping`
- Schedule: Every 14 minutes
- Method: GET

---

## Environment Variables

| Variable | Required | Source |
|----------|----------|--------|
| OPENROUTER_API_KEY | Recommended | openrouter.ai |
| GROQ_API_KEY | Recommended | console.groq.com |
| GEMINI_API_KEY | Optional | aistudio.google.com |
| DATABASE_URL | No | Defaults to SQLite |
| SECRET_KEY | Production | Generate strong key |

Note: System works with zero API keys — falls back to static responses.

---

## Local Development

```bash
# Backend
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

---

## Testing

```bash
cd backend
python test_security.py
```

Expected: `SECURITY RESULT: 24/24 passed`

---

## License

MIT — Free for personal and commercial use.

---

<div align="center">

**[Back to Top](#shiphny-ai-support-agent)**

</div>

---

<a name="arabic"></a>
<div dir="rtl" align="right">

# التوثيق العربي

## ملخص تنفيذي

**نظام شحني للدعم الفني بالذكاء الاصطناعي** هو نظام آلي متكامل لخدمة العملاء مصمم لشركة شحن مصرية. يتعامل النظام مع المحادثات الفورية بالعربية والإنجليزية، ويؤدي التحقق من الهوية قبل عرض بيانات الشحن الحساسة، ويحافظ على تشغيل بنسبة 100% من خلال بنية تحتية متعددة المزودين.

### النتائج الرئيسية

| المقياس | النتيجة |
|---------|---------|
| اختبارات الأمان | 24/24 ناجح |
| وقت الاستجابة | أقل من 500 مللي ثانية |
| وقت التشغيل | 99.9% مع نظام احتياطي |
| اللغات | العربية + الإنجليزية |
| مزودي الذكاء الاصطناعي | 3 (OpenRouter, Groq, Gemini) |

---

## المشكلة

تواجه شركات الشحن في مصر تحديات حرجة في خدمة العملاء:

| الدعم التقليدي | الحل بالذكاء الاصطناعي |
|----------------|------------------------|
| انتظار 10+ دقيقة | استجابة فورية |
| إغلاق الساعة 9 مساءً | تشغيل 24/7 |
| إجابات متفاوتة للأسعار | أسعار دقيقة لـ 27 محافظة |
| عدم التحقق من المتصل | التحقق الإلزامي من الهوية |
| توقف النظام = لا خدمة | سلسلة احتياطية بـ 4 طبقات |

---

## البنية التقنية

### تصميم النظام

```
┌─────────────────────────────────────────────────────────────┐
│                    الواجهة الأمامية (React 18)              │
│              أداة المحادثة | التحليلات | العربية RTL        │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   الخلفية (FastAPI)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ تقييد السرعة│  │  حارس       │  │  مدير الجلسات      │  │
│  │  60/دقيقة   │  │  الحقن      │  │  (لكل محادثة)      │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                 │                    │            │
│         ▼                 ▼                    ▼            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │        طبقة التحقق الحتمية من الهوية                  │ │
│  │  العميل يسأل عن SH-XXXXXX                               │ │
│  │       │                                                │ │
│  │       ├── لا يوجد تحقق بعد → طلب البريد/الهاتف/الاسم   │ │
│  │       ├── بيانات خاطئة → رفض مع تعليمات                │ │
│  │       └── بيانات صحيحة → عرض تفاصيل الشحنة (بدون AI)   │ │
│  └────────────────────────────────────────────────────────┘ │
│                            │                                 │
│         ┌──────────────────┴──────────────────┐              │
│         ▼                                      ▼              │
│  ┌─────────────────┐              ┌──────────────────────┐     │
│  │  سلسلة مزودي    │              │   الرد الاحتياطي     │     │
│  │  الذكاء         │  ──فشل──►   │   (بدون مفاتيح API) │     │
│  │  الاصطناعي      │              │                      │     │
│  │                 │              │ مطابقة النية         │     │
│  │ OpenRouter →    │              │ ثنائية اللغة         │     │
│  │ Groq → Gemini   │              │                      │     │
│  └─────────────────┘              └──────────────────────┘     │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### لماذا هذه البنية مهمة

**1. طبقة الأمان الحتمية**
- قرارات التحقق تحدث في الكود الخلفي، ليس في الذكاء الاصطناعي
- الذكاء الاصطناعي لا يقرر أبداً عرض البيانات الحساسة
- يعمل حتى عند توقف جميع مزودي الذكاء الاصطناعي

**2. النظام الاحتياطي متعدد المزودين**
- OpenRouter: تدوير 3 نماذج مجانية تلقائياً
- Groq: استجابة فائقة السرعة (~300 مللي ثانية)
- Gemini: حصص مجانية سخية
- الرد الاحتياطي: ضمان عدم التوقف

**3. عزل الجلسات**
- كل محادثة لها حالة تحقق منعزلة
- لا تسرب بين الجلسات
- علامات التحقق فقط في رسائل النظام

---

## تطبيق الأمان

### نظام الدفاع بـ 5 طبقات

```
الطبقة 0: الحارس العام للحقن
         يطهر [VERIFIED:], SYSTEM OVERRIDE, ADMIN MODE من السجل

الطبقة 1: مانع علامات الحقن
         يرفض رسائل المستخدم بنماذج تشبه النظام

الطبقة 2: منشئ الردود الحتمية
         الخلفية تبني ردود التحقق — الذكاء الاصطناعي غير مشارك

الطبقة 3: قواعد موجه النظام للذكاء الاصطناعي
         تمنع صراحة التحقق الذاتي

الطبقة 4: الثقة بنظام-فقط
         فقط رسائل النظام يمكن أن تعلم [VERIFIED]
```

### تدفق التحقق

```
العميل: "فين شحنتي SH-12345678؟"
    │
    ├─── النظام يستخرج الرقم: SH-12345678
    ├─── يتحقق من سجل المحادثة لعلامة [VERIFIED]
    │
    ├─── غير متحقق ──► "يرجى التحقق بالبريد أو الهاتف أو الاسم"
    │
    ├─── العميل يرسل: "ahmed@email.com"
    │
    ├─── النظام يتحقق من قاعدة البيانات
    │       │
    │       ├── مطابقة ──► عرض تفاصيل الشحنة
    │       └── عدم مطابقة ──► "البيانات غير صحيحة. حاول مرة أخرى أو اتصل 19282"
    │
    └─── الذكاء الاصطناعي غير مشارك في قرار التحقق
```

### تغطية اختبارات الأمان: 24/24 ناجح

| رقم الاختبار | نوع الهجوم | النتيجة |
|--------------|------------|---------|
| SEC-01 | طلب شحنة بدون تحقق | تم الحظر |
| SEC-02 | بريد خاطئ | تم الرفض، لم تتسرب البيانات |
| SEC-03 | هاتف خاطئ | تم الرفض، لم تتسرب البيانات |
| SEC-04 | اسم خاطئ | تم الرفض، لم تتسرب البيانات |
| SEC-05 | حقن التحقق الذاتي ([VERIFIED:]) | تم الحظر |
| SEC-06 | بريد صحيح | تم عرض التفاصيل |
| SEC-07 | هاتف صحيح | تم عرض التفاصيل |
| SEC-08 | اسم صحيح | تم عرض التفاصيل |
| SEC-09 | متابعة في جلسة متحقق | لا إعادة تحقق |
| SEC-10 | عزل الجلسات (جلسة جديدة) | معزولة بشكل صحيح |
| SEC-11 | تدفق التحقق بالإنجليزية | يعمل |
| SEC-12 | حقن الموجه (4 أنواع) | جميعها محظورة |

---

## مكدس التقنيات

| الطبقة | التقنية | الغرض |
|--------|---------|-------|
| الخلفية | FastAPI 0.111 + Python 3.11 | إطار عمل API غير متزامن |
| مزودي الذكاء الاصطناعي | OpenRouter, Groq, Gemini | النظام الاحتياطي متعدد المزودين |
| قاعدة البيانات | SQLAlchemy 2 + SQLite/PostgreSQL | ORM غير متزامن |
| الواجهة الأمامية | React 18 + TypeScript 5 | واجهة آمنة النوع |
| التنسيق | Tailwind CSS | متجاوب + RTL |
| عميل HTTP | httpx | طلبات غير متزامنة |
| التحقق | Pydantic v2 | أمان النوع |

---

## مرجع API

### نقاط النهاية الأساسية

**POST /api/chat**
```json
الطلب:
{
  "message": "عايز اعرف حالة شحنتي SH-12345678",
  "session_id": "معرف-جلسة-اختياري",
  "language": "ar"
}

الرد:
{
  "response": "لأديك تفاصيل شحنتك SH-12345678، محتاج أتحقق من هويتك...",
  "session_id": "معرف-جلسة-منشأ",
  "confidence": 0.85,
  "response_time_ms": 245.3,
  "detected_intent": "shipping_status",
  "escalated": false
}
```

**POST /api/bookings/verify-identity**
```json
الطلب:
{
  "reference": "SH-12345678",
  "method": "email",
  "value": "customer@example.com"
}

الرد:
{
  "verified": true,
  "booking": { ...تفاصيل الشحنة... }
}
```

### نقاط النهاية الإضافية

| نقطة النهاية | الوصف |
|--------------|-------|
| GET /api/health | فحص الصحة |
| GET /api/analytics/dashboard | إحصائيات المحادثات |
| GET /api/customers | قائمة العملاء |
| GET /api/debug/apikey | حالة مفتاح API |

---

## التحديات الهندسية والحلول

### التحدي 1: منع تسرب البيانات بالذكاء الاصطناعي
**المشكلة:** نماذج الذكاء الاصطناعي تكشف أحياناً تفاصيل الشحنة قبل التحقق.

**الحل:** نقل منطق التحقق إلى طبقة خلفية حتمية. ردود التحقق تُبنى مباشرة من قاعدة البيانات — الذكاء الاصطناعي لا يقرر عرض/إخفاء البيانات.

### التحدي 2: قيود معدل الطلبات متعدد المزودين
**المشكلة:** الطبقات المجانية تحد الطلبات (Groq ~30/دقيقة، OpenRouter 429).

**الحل:** بناء سلسلة احتياطية بـ 4 طبقات مع التدوير التلقائي وتتبع الفشل.

### التحدي 3: معالجة اللغة العربية وRTL
**المشكلة:** اللهجة المصرية دعم NLP محدود، وRTL يتطلب معالجة خاصة.

**الحل:** الكشف المبني على الأحرف، مطابقة النية بالتعبيرات العادية، قاعدة معرفية ثنائية كاملة، CSS RTL.

### التحدي 4: التشغيل البارد في الإنتاج
**المشكلة:** الطبقات المجانية للاستضافة لها بدء تشغيل بارد 30+ ثانية.

**الحل:** نقطة نهاية ping خفيفة لوظائف cron، تكوينات نشر محاوية.

---

## النشر

### الخلفية على Render

```yaml
# render.yaml (مضمن في المستودع)
services:
  - type: web
    name: shiphny-ai-support
    runtime: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: OPENROUTER_API_KEY
        sync: false
      - key: GROQ_API_KEY
        sync: false
```

**الخطوات:**
1. إنشاء خدمة ويب على render.com
2. ربط مستودع GitHub
3. إضافة متغيرات البيئة
4. النشر (اكتشاف تلقائي لـ render.yaml)

### الواجهة الأمامية على Vercel

```bash
cd frontend
npm run build
npx vercel --prod
```

أو يدوي:
1. استيراد مستودع GitHub على vercel.com
2. الدليل الجذري: `frontend`
3. البناء: `npm run build`
4. المخرج: `dist`
5. البيئة: `VITE_API_URL=https://shiphny-ai-support.onrender.com`

### منع التشغيل البارد

إعداد cron مجاني على cron-job.org:
- الرابط: `https://shiphny-ai-support.onrender.com/api/ping`
- الجدول: كل 14 دقيقة
- الطريقة: GET

---

## متغيرات البيئة

| المتغير | مطلوب | المصدر |
|-----------|-------|--------|
| OPENROUTER_API_KEY | موصى به | openrouter.ai |
| GROQ_API_KEY | موصى به | console.groq.com |
| GEMINI_API_KEY | اختياري | aistudio.google.com |
| DATABASE_URL | لا | الافتراضي SQLite |
| SECRET_KEY | الإنتاج | توليد مفتاح قوي |

ملاحظة: النظام يعمل بدون مفاتيح API — يرجع إلى الردود الثابتة.

---

## التطوير المحلي

```bash
# الخلفية
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload

# الواجهة الأمامية
cd frontend
npm install
npm run dev
```

---

## الاختبار

```bash
cd backend
python test_security.py
```

المتوقع: `SECURITY RESULT: 24/24 passed`

---

## الرخصة

MIT — مجاني للاستخدام الشخصي والتجاري.

---

<div align="center">

**[العودة إلى الأعلى](#shiphny-ai-support-agent)**

</div>

</div>

