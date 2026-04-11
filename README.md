<div align="center">

# 🚚 Shiphny AI Support Agent

### نظام دعم عملاء ذكي ومتكامل لشركة شحني Express

**وكيل ذكاء اصطناعي احترافي يتحدث العربية والإنجليزية — يعمل 24/7 — يجيب عن كل سؤال**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-shiphny.netlify.app-blue?style=for-the-badge)](https://shiphny.netlify.app)
[![Backend](https://img.shields.io/badge/⚙️_Backend-Render.com-green?style=for-the-badge)](https://shiphny-ai-support.onrender.com)
[![Python](https://img.shields.io/badge/Python-3.11-yellow?style=for-the-badge&logo=python)](https://python.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)

</div>

---

## 📸 لقطات من النظام

<div align="center">
<table>
<tr>
<td align="center"><img src="docs/screenshots/chat-pricing.png" width="280"/><br/><b>أسعار الشحن لكل محافظة</b></td>
<td align="center"><img src="docs/screenshots/chat-coverage.png" width="280"/><br/><b>تغطية المحافظات الحدودية</b></td>
<td align="center"><img src="docs/screenshots/chat-location.png" width="280"/><br/><b>معلومات الشركة والموقع</b></td>
</tr>
</table>
</div>

> **سارة** — المساعدة الذكية التي تجيب بدقة على أسعار الشحن لجميع محافظات مصر الـ 27، مواعيد التوصيل، سياسات الإرجاع، وكل ما يخطر على بال العميل.

---

## 🎯 ما هو هذا المشروع؟

**Shiphny AI Support Agent** هو نظام دعم عملاء مدعوم بالذكاء الاصطناعي، مصمم خصيصاً لشركات الشحن والتوصيل في مصر. النظام يحاكي تجربة شركة شحن حقيقية بالكامل.

### لماذا هذا المشروع مهم؟

| المشكلة التقليدية | الحل مع Shiphny AI |
|---|---|
| موظف خدمة عملاء يعمل 8 ساعات فقط | الذكاء الاصطناعي متاح **24/7 بدون توقف** |
| إجابات غير دقيقة أو متأخرة | إجابات فورية من **قاعدة معرفة شاملة** |
| لا يتذكر محادثات سابقة | **ذاكرة كاملة** للمحادثة من البداية |
| لا يفهم العربية المصرية | **يتحدث العربية المصرية** بشكل طبيعي |
| لا يعرف أسعار كل المحافظات | **27 محافظة** بأسعار دقيقة لكل منها |
| تأخر في التصعيد لموظف بشري | **كشف تلقائي** للحالات التي تحتاج تدخل بشري |

---

## ✨ المميزات الرئيسية

### 🤖 الذكاء الاصطناعي
- **ثنائي اللغة** — عربي وإنجليزي، يكتشف اللغة تلقائياً من أول كلمة
- **قاعدة معرفة شاملة** — أسعار 27 محافظة، مواعيد التوصيل، سياسات الإرجاع، التأمين، طرق الدفع
- **تصنيف النية** — يفهم إذا كان العميل يسأل عن سعر، أو يتتبع شحنة، أو يقدم شكوى
- **تكيف مع الشخصية** — يتعامل مع عملاء VIP بأسلوب مختلف عن العملاء العاديين
- **كشف التصعيد** — يحول المحادثة لموظف بشري تلقائياً عند الغضب الشديد
- **نظام Fallback ذكي** — OpenRouter → Groq → إجابة احتياطية، ضمان عدم الانقطاع

### 💬 واجهة الشات
- تصميم عصري ومتجاوب مع الجوال
- دعم كامل للـ RTL (العربية)
- أزرار اقتراحات سريعة
- مؤشر الكتابة الحي
- ذاكرة المحادثة عبر localStorage

### 📊 لوحة التحليلات
- إجمالي المحادثات والعملاء
- متوسط وقت الاستجابة
- توزيع النوايا (أسعار، تتبع، شكاوى...)
- معدل الحل والتصعيد

### 🏢 إدارة الشحنات
- CRUD كامل للحجوزات
- متابعة حالة الشحنة
- ربط الشحنة بالعميل

---

## 🏗️ هيكل النظام

```
┌─────────────────────────────────────────────────────────┐
│                      المستخدم                           │
│          Browser (React 18 + TypeScript + Tailwind)      │
│    Landing Page │ Chat Widget │ Analytics Dashboard      │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP REST API
┌──────────────────────────▼──────────────────────────────┐
│              FastAPI Backend (Python 3.11)               │
│                                                         │
│  /api/chat ──► Rate Limiter ──► Session Manager         │
│  /api/bookings              ──► Booking CRUD            │
│  /api/analytics             ──► Stats & Charts          │
│  /api/ping                  ──► Keep-alive              │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │              AI Pipeline                         │   │
│  │  1. Language Detection (AR / EN)                 │   │
│  │  2. Intent Classification (7 categories)         │   │
│  │  3. Customer Context Assembly (DB)               │   │
│  │  4. System Prompt Builder + Knowledge Base       │   │
│  │  5. AI Call: OpenRouter → Groq → Fallback        │   │
│  │  6. Escalation Detection                         │   │
│  │  7. Save to DB (intent, confidence, time)        │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  SQLite Database                                        │
│  customers │ bookings │ conversations │ messages        │
└─────────────────────────────────────────────────────────┘
                           │
               ┌───────────┼───────────┐
               ▼           ▼           ▼
         OpenRouter      Groq AI    Static
       (Primary AI)    (Fallback)  (Fallback)
    gpt-oss-120b:free  llama-3.3-70b
```

---

## 🛠️ التقنيات المستخدمة

| الطبقة | التقنية | السبب |
|--------|---------|-------|
| **LLM Primary** | OpenRouter `openai/gpt-oss-120b:free` | مجاني، بدون rate limit عملي |
| **LLM Fallback** | Groq `llama-3.3-70b-versatile` | سريع جداً (~300ms) |
| **Backend** | FastAPI 0.111 + Python 3.11 | Async، سريع، توثيق تلقائي |
| **ORM** | SQLAlchemy 2 (Async) | استعلامات غير متزامنة |
| **Database** | SQLite (dev) / PostgreSQL (prod) | مرونة النشر |
| **Frontend** | React 18 + TypeScript 5 + Vite | أداء عالي |
| **Styling** | Tailwind CSS | تصميم سريع ومتجاوب |
| **HTTP Client** | httpx (async) | استدعاءات AI غير متزامنة |
| **Validation** | Pydantic v2 | Type safety كامل |
| **Container** | Docker + Docker Compose | نشر سهل |
| **Hosting** | Render (Backend) + Netlify (Frontend) | مجاني في البداية |

---

## 📁 هيكل الملفات

```
shiphny-ai-support/
├── backend/
│   ├── main.py                      # FastAPI app، startup، health، ping
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── seed_knowledge_base.py       # بيانات قاعدة المعرفة الأولية
│   └── app/
│       ├── api/
│       │   ├── chat.py              # Chat endpoint، session، rate limiter
│       │   ├── bookings.py          # CRUD الحجوزات
│       │   ├── analytics.py         # إحصاءات لوحة التحكم
│       │   ├── customers.py         # قراءة بيانات العملاء
│       │   └── chat_debug.py        # endpoints للتشخيص
│       ├── models/
│       │   ├── customer.py          # نموذج العميل (VIP/Premium/Standard)
│       │   ├── booking.py           # نموذج الحجز مع enum الحالة
│       │   ├── conversation.py      # المحادثة، الرسائل، النوايا
│       │   └── knowledge_base.py    # مقالات قاعدة المعرفة
│       ├── services/
│       │   ├── groq_ai.py           # خدمة AI الرئيسية (OpenRouter + Groq)
│       │   ├── gemini_ai.py         # خدمة Gemini الاحتياطية
│       │   └── fallback_responses.py # إجابات احتياطية ثابتة
│       ├── db/
│       │   └── database.py          # Async session factory
│       └── core/
│           └── config.py            # إعدادات التطبيق
├── frontend/
│   ├── src/
│   │   ├── App.tsx                  # الصفحة الرئيسية، التوجيه، نموذج الحجز
│   │   ├── api.ts                   # API base URL
│   │   ├── translations.ts          # نصوص عربي/إنجليزي
│   │   └── components/
│   │       ├── PersistentChat.tsx   # Chat widget عائم مع localStorage
│   │       ├── Dashboard.tsx        # لوحة التحليلات
│   │       ├── ChatWidget.tsx       # Chat مضمّن
│   │       └── Layout.tsx           # wrapper الصفحة
│   ├── Dockerfile
│   └── nginx.conf
├── docs/
│   └── screenshots/                 # صور لقطات الشاشة
├── docker-compose.yml
├── render.yaml                      # إعداد النشر التلقائي على Render
└── .env.example                     # نموذج متغيرات البيئة
```

---

## 🚀 التشغيل المحلي

### المتطلبات
- Python 3.11+
- Node.js 18+
- مفتاح OpenRouter API مجاني من [openrouter.ai](https://openrouter.ai)

### الخطوات

**1. Backend**
```bash
cd backend

python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux

pip install -r requirements.txt

# أنشئ ملف .env
copy ..\\.env.example .env

# افتح .env وأضف:
# OPENROUTER_API_KEY=sk-or-v1-...
# GROQ_API_KEY=gsk_...

uvicorn main:app --reload --port 8000
```

**2. Frontend**
```bash
cd frontend
npm install
npm run dev
```

**3. الروابط المحلية**
| الخدمة | الرابط |
|--------|--------|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/api/docs |
| API Docs (ReDoc) | http://localhost:8000/api/redoc |

### Docker (خطوة واحدة)
```bash
cp .env.example backend/.env
# عدّل backend/.env وأضف API keys

docker compose up --build
```

---

## ⚙️ متغيرات البيئة

| المتغير | مطلوب | الوصف |
|---------|-------|-------|
| `OPENROUTER_API_KEY` | ✅ نعم | مفتاح OpenRouter (مجاني من openrouter.ai) |
| `GROQ_API_KEY` | ✅ نعم | مفتاح Groq (مجاني من console.groq.com) |
| `GEMINI_API_KEY` | اختياري | مفتاح Google Gemini كـ fallback إضافي |
| `GROQ_MODEL` | لا | الافتراضي: `llama-3.3-70b-versatile` |
| `DATABASE_URL` | لا | الافتراضي: SQLite محلي |
| `CORS_ORIGINS` | لا | origins المسموح بها للـ frontend |
| `DEBUG` | لا | `true` لتفعيل logs التطوير |

---

## 📡 API Reference

### `POST /api/chat`
```json
// Request
{
  "message": "كم سعر الشحن للإسكندرية؟",
  "customer_id": 1,
  "session_id": "optional-existing-session",
  "language": "ar"
}

// Response
{
  "response": "سعر الشحن للإسكندرية: القياسي 40ج، السريع 55ج 😊",
  "session_id": "abc-123",
  "confidence": 0.94,
  "response_time_ms": 380.5,
  "detected_intent": "shipping_price",
  "escalated": false
}
```

### `GET /api/analytics/dashboard`
إجمالي المحادثات، العملاء، متوسط وقت الاستجابة، معدل الحل، حالات التصعيد.

### `GET /api/analytics/intents`
توزيع النوايا مع الأعداد والنسب المئوية.

### `GET/POST /api/bookings`
قائمة الحجوزات (GET) أو إنشاء حجز جديد (POST).

### `GET /api/health`
حالة التطبيق والإصدار.

### `GET /api/ping`
Keep-alive خفيف الوزن — بدون DB، استجابة فورية.

### `GET /api/debug/apikey`
فحص حالة جميع API keys (Groq, Gemini, OpenRouter).

### `GET /api/debug/test-openrouter`
اختبار مباشر لـ OpenRouter مع سؤال حقيقي.

---

## ☁️ النشر على الإنترنت

### Backend على Render

1. افتح [render.com](https://render.com) وأنشئ **Web Service** جديد
2. اربطه بهذا الـ repository
3. Render يقرأ `render.yaml` تلقائياً
4. أضف متغيرات البيئة:
   - `OPENROUTER_API_KEY`
   - `GROQ_API_KEY`
5. اضغط Deploy

### Frontend على Netlify/Vercel

1. افتح [netlify.com](https://netlify.com) أو [vercel.com](https://vercel.com)
2. استورد الـ repository
3. اضبط الـ root directory على `frontend`
4. أضف:
   - `VITE_API_URL` = رابط الـ Backend على Render
5. Deploy

### منع Cold Starts على Render (مهم!)

الـ free tier على Render ينام بعد 15 دقيقة من عدم النشاط ويسبب تأخير 30 ثانية.

**الحل المجاني:** أنشئ cron job على [cron-job.org](https://cron-job.org) يستدعي:
```
GET https://shiphny-ai-support.onrender.com/api/ping
```
كل **14 دقيقة** — هيبقى الـ backend صاحي دائماً.

---

## 💬 أمثلة محادثات حقيقية

**سعر الشحن**
```
👤 كم سعر الشحن للإسكندرية؟
🤖 سارة: السعر للإسكندرية 📦
         - الشحن القياسي: 40 جنيه
         - الشحن السريع: 55 جنيه
         لو عندك أي استفسار ثاني أنا موجودة! 😊
```

**تغطية المحافظات الحدودية**
```
👤 هل توصلون لشرم الشيخ؟
🤖 سارة: ✅ شرم الشيخ (جنوب سيناء):
         - قياسي: 60 جنيه
         - سريع: 85 جنيه
         مدة التوصيل 3-5 أيام عمل 🚚
```

**معلومات الشركة**
```
👤 مكان الشركة فين؟
🤖 سارة: مقرنا في القاهرة، مصر 😊
         لو محتاج أي مساعدة تانية، قولي! 🚀
```

**تصعيد لموظف بشري**
```
👤 هذا مرفوض تماماً، أريد التحدث مع مدير
🤖 سارة: أفهم مدى إحباطك تماماً، سأحوّل محادثتك
         لمشرف متخصص الآن. 🔴 [ESCALATE_TO_HUMAN]
```

---

## 🧠 كيف يعمل الـ AI؟

```
رسالة العميل
     │
     ▼
┌─────────────────┐
│ 1. كشف اللغة   │ ◄── عربي أو إنجليزي
└────────┬────────┘
         ▼
┌─────────────────┐
│ 2. تصنيف النية │ ◄── سعر / تتبع / شكوى / إرجاع / شركة / عام
└────────┬────────┘
         ▼
┌─────────────────────────────┐
│ 3. بناء السياق             │ ◄── اسم العميل + tier + تاريخ الشحنات
└────────┬────────────────────┘
         ▼
┌─────────────────────────────┐
│ 4. بناء System Prompt      │ ◄── قاعدة المعرفة (27 محافظة) + بيانات العميل
└────────┬────────────────────┘
         ▼
┌─────────────────────────────┐
│ 5. استدعاء AI              │
│   OpenRouter (primary)      │
│   Groq (fallback)           │
│   Static (last resort)      │
└────────┬────────────────────┘
         ▼
┌─────────────────┐
│ 6. كشف التصعيد │ ◄── [ESCALATE_TO_HUMAN] tag
└────────┬────────┘
         ▼
┌──────────────────────────────┐
│ 7. حفظ في DB + إرسال الرد  │
└──────────────────────────────┘
```

---

## 📊 قاعدة المعرفة — ماذا يعرف الـ AI؟

| الموضوع | التفاصيل |
|---------|----------|
| **أسعار الشحن** | 27 محافظة بالاسم، قياسي وسريع لكل منها |
| **مواعيد التوصيل** | القاهرة نفس اليوم، الدلتا 1-2 يوم، الصعيد 2-3، الحدود 3-5 |
| **التتبع** | رقم SH- + 8 أرقام، عبر الموقع/الخط الساخن/واتساب |
| **الإرجاع** | 14 يوم، استرداد 3-5 أيام، مجاني للعيوب، 15ج للرفض |
| **التأمين** | مجاني حتى 2000ج، ممتد حتى 50000ج بـ 1% |
| **الدفع** | COD، فودافون كاش، فيزا، فوري، تحويل بنكي |
| **الشركات** | خصم 40%، API، مدير حساب، فواتير شهرية |
| **القيود** | داخل مصر فقط، 30كج max، لا مواد خطرة |
| **المشاكل الشائعة** | تأخر، عنوان خاطئ، شحنة تالفة، شحنة مفقودة |

---

## 📄 الترخيص

MIT License — مجاني للاستخدام الشخصي والتجاري.

---

<div align="center">

**صُنع بـ ❤️ لتحسين تجربة عملاء الشحن في مصر**

[🌐 Live Demo](https://shiphny.netlify.app) • [⚙️ API Docs](https://shiphny-ai-support.onrender.com/api/docs) • [📞 19282](tel:19282)

</div>
