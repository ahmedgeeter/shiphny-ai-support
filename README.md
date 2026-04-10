<div align="center">

# 🚚 Shiphny AI Support Agent

**Production-ready AI customer support chatbot for a shipping & logistics company**

[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://typescriptlang.org)
[![LLM](https://img.shields.io/badge/LLM-Llama_3.3_70B-orange)](https://groq.com)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)](https://docker.com)


---

## ✨ What is this?

**Shiphny AI Support Agent** is a full-stack AI chatbot platform for **Shiphny Express**, a shipping company serving all 27 Egyptian governorates. It demonstrates a production-grade AI support system with:

- 🤖 **Sara** — bilingual AI agent (Arabic 🇪🇬 + English) powered by Llama 3.3 70B via Groq
- 📦 **Live booking data** — customers ask about shipments, Sara answers with real DB data
- 📊 **Analytics dashboard** — KPIs, intent distribution, response time metrics
- ⚡ **Sub-second AI responses** — async FastAPI + Groq inference
- 🔄 **Persistent sessions** — conversation history saved in DB + localStorage
- 🧠 **Smart escalation** — detects frustrated customers → flags for human handoff

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         BROWSER                              │
│                                                              │
│  ┌─────────────────────┐    ┌──────────────────────────────┐ │
│  │    Landing Page     │    │    Analytics Dashboard       │ │
│  │  React + Tailwind   │    │  (KPIs, intents, response    │ │
│  │  Bilingual AR/EN    │    │   times, customer tiers)     │ │
│  └──────────┬──────────┘    └─────────────┬────────────────┘ │
│             │                             │                  │
│  ┌──────────▼─────────────────────────────▼────────────────┐ │
│  │              PersistentChat Widget                       │ │
│  │   Floating chatbot · localStorage history · RTL/LTR      │ │
│  └──────────────────────────┬───────────────────────────────┘ │
└─────────────────────────────│────────────────────────────────┘
                              │ REST API (JSON)
┌─────────────────────────────▼────────────────────────────────┐
│                      FASTAPI BACKEND                         │
│                                                              │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐  │
│  │ Rate Limiter │  │  Chat Router  │  │ Bookings Router  │  │
│  │ 20 req/60s   │  │ sessions &    │  │ CRUD · search ·  │  │
│  │  per IP      │  │ history       │  │ status updates   │  │
│  └──────────────┘  └───────┬───────┘  └──────────────────┘  │
│                             │                                │
│                   ┌─────────▼──────────┐                    │
│                   │   GroqAI Service   │                    │
│                   │                    │                    │
│                   │ 1. Detect language │                    │
│                   │ 2. Classify intent │                    │
│                   │ 3. Build prompt    │                    │
│                   │ 4. Call Llama 70B  │                    │
│                   │ 5. Check escalate  │                    │
│                   └─────────┬──────────┘                    │
│                             │                                │
│             ┌───────────────▼──────────────┐                │
│             │        SQLite Database        │                │
│             │  customers · bookings ·       │                │
│             │  conversations · messages     │                │
│             └──────────────────────────────┘                │
└─────────────────────────────┬────────────────────────────────┘
                              │
              ┌───────────────▼────────────────┐
              │        GROQ CLOUD API          │
              │   Llama 3.3 70B Versatile      │
              │   ~200ms inference latency     │
              └────────────────────────────────┘
```

---

## 🤖 AI Pipeline

Every message goes through this pipeline:

```
User Message
     │
     ▼
[1] Language Detection ──── Arabic (ar) or English (en)
     │
     ▼
[2] Intent Classification ─ booking_inquiry · complaint · pricing
                             tracking · general · escalation
     │
     ▼
[3] Context Building ─────── Customer name + tier + order count
                             Live booking data from DB
                             Last 8 conversation messages
     │
     ▼
[4] Groq API Call ────────── Llama 3.3 70B — ~200ms avg
     │
     ▼
[5] Escalation Check ─────── Detect [ESCALATE_TO_HUMAN] tag
     │
     ▼
[6] Persist to DB ─────────── Save message + response + metadata
     │
     ▼
Response → User
```

---

## 🎯 Features

| Feature | Details |
|---------|--------|
| **AI Agent "Sara"** | Llama 3.3 70B via Groq — sub-second responses |
| **Bilingual** | Arabic (RTL) + English — auto-detected per message |
| **Live Booking Data** | AI reads real shipment data from DB |
| **Intent Detection** | 7 intent categories with confidence scoring |
| **Human Escalation** | Detects frustrated customers → flags for handoff |
| **Session Memory** | History persisted in DB + localStorage |
| **Analytics Dashboard** | KPIs, intent chart, avg response time |
| **Rate Limiting** | 20 messages / 60s per IP |
| **Customer Tiers** | VIP / Premium / Standard — Sara adapts tone |
| **Booking System** | Full CRUD — create, track, update shipments |
| **Docker Ready** | Single `docker compose up --build` |
| **REST API Docs** | Auto-generated at `/api/docs` |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|----------|
| **LLM** | Llama 3.3 70B via Groq API |
| **Backend** | FastAPI 0.111 + Python 3.11 + async SQLAlchemy |
| **Database** | SQLite (dev) — swappable to PostgreSQL |
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS |
| **HTTP Client** | httpx (async Groq calls) |
| **Validation** | Pydantic v2 |
| **Container** | Docker + Docker Compose |

---

## 🚀 Quickstart

### Option 1 — Docker

```bash
git clone https://github.com/your-username/shiphny-ai-support
cd shiphny-ai-support

cp .env.example backend/.env
# Set GROQ_API_KEY in backend/.env

docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/api/docs |

---

### Option 2 — Local Development

**Backend**

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt

cp ../.env.example .env
# Set GROQ_API_KEY in .env

uvicorn main:app --reload --port 8000
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

---

## ⚙️ Environment Variables

```env
# Required
GROQ_API_KEY=gsk_...          # Free at console.groq.com
GROQ_MODEL=llama-3.3-70b-versatile

# Optional
APP_NAME=Shiphny AI Support
DATABASE_URL=sqlite+aiosqlite:///./supportbot.db
CORS_ORIGINS=["http://localhost:3000","https://your-app.vercel.app"]
DEBUG=false
```

---

## 📡 API Reference

### Chat

```http
POST /api/chat
Content-Type: application/json

{
  "message": "اخبرني عن شحنتي SH-12345678",
  "customer_id": 1,
  "session_id": "abc123",
  "language": "ar"
}
```

**Response:**
```json
{
  "response": "شحنتك SH-12345678 في الطريق إليك 📦",
  "session_id": "abc123",
  "confidence": 0.92,
  "response_time_ms": 213.4,
  "detected_intent": "booking_inquiry",
  "escalated": false
}
```

### Bookings

| Method | Endpoint | Description |
|--------|----------|-----------|
| `GET` | `/api/bookings` | List all bookings (paginated) |
| `POST` | `/api/bookings` | Create new booking |
| `GET` | `/api/bookings/{id}` | Get booking details |
| `PATCH` | `/api/bookings/{id}/status` | Update booking status |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-----------|
| `GET` | `/api/analytics/dashboard` | KPIs: conversations, customers, avg response time |
| `GET` | `/api/analytics/intents` | Intent distribution with percentages |

### Health

```http
GET /api/health
→ { "status": "healthy", "version": "1.0.0" }
```

---

## 💬 Example Conversations

**Booking inquiry — Arabic**
```
User:  اخبرني عن شحنتي SH-34634614
Sara:  مرحباً يا أحمد! 📦
       شحنتك SH-34634614 — شحن قياسي
       الحالة: قيد الانتظار
       من القاهرة ← إلى الإسكندرية | 2 كجم
       هل تريد معرفة الوقت المتوقع للتسليم؟ 🕒
```

**Pricing — English**
```
User:  How much does express shipping cost?
Sara:  Express shipping starts at EGP 45 🚚
       • Same-day delivery in Greater Cairo
       • 24-hour delivery to all governorates
       • Includes real-time tracking + SMS + insurance
```

**Escalation**
```
User:  هذا غير مقبول! أريد التحدث مع مدير الآن!
Sara:  أفهم مدى إحباطك، سأحوّل محادثتك لمشرف الآن. 🔴
       → [Flagged for human handoff]
```

---

## 📁 Project Structure

```
shiphny-ai-support/
├── backend/
│   ├── main.py                    # FastAPI app entry point
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── supportbot.db              # SQLite database
│   ├── seed/                      # DB seed data scripts
│   └── app/
│       ├── api/
│       │   ├── chat.py            # Chat endpoints + session management
│       │   ├── bookings.py        # Booking CRUD
│       │   └── analytics.py       # Dashboard stats
│       ├── models/
│       │   ├── customer.py        # Customer + tier enum
│       │   ├── booking.py         # Booking + status enum
│       │   └── conversation.py    # Conversation + Message + Intent
│       ├── services/
│       │   └── groq_ai.py         # AI: prompts, intent detection, Groq calls
│       ├── db/
│       │   └── database.py        # AsyncSession, init_db
│       └── core/
│           └── config.py          # Settings via pydantic-settings
├── frontend/
│   ├── src/
│   │   ├── App.tsx                # Main app + landing page + booking form
│   │   ├── translations.ts        # Arabic / English UI strings
│   │   └── components/
│   │       ├── PersistentChat.tsx # Floating AI chat widget
│   │       ├── Dashboard.tsx      # Analytics dashboard
│   │       ├── ChatWidget.tsx     # Inline chat component
│   │       └── Layout.tsx         # Page layout wrapper
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🔑 Get a Free Groq API Key

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up — free
3. Create API key
4. Add to `.env` → `GROQ_API_KEY=gsk_...`

Free tier: **100,000 tokens/day** — enough for development and demos.

---

## 📄 License

MIT — free to use for portfolio, demos, and commercial projects.
#   s h i p h n y - a i - s u p p o r t  
 