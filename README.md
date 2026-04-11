<div align="center">

# Shiphny AI Support Agent

### A production-ready AI customer support system for a real shipping company

[![Live Demo](https://img.shields.io/badge/Live%20Demo-shiphny.netlify.app-blue?style=flat-square)](https://shiphny.netlify.app)
[![Backend API](https://img.shields.io/badge/Backend-Render.com-brightgreen?style=flat-square)](https://shiphny-ai-support.onrender.com/api/docs)
[![Python](https://img.shields.io/badge/Python-3.11-blue?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## What is this?

Shiphny is a full-stack AI customer support agent built for a fictional (but realistic) Egyptian shipping company called **Shiphny Express**. The agent — named **Sara** — handles real customer conversations in both Arabic and English, answers questions about shipping prices across all 27 Egyptian governorates, tracks shipments, processes return requests, and escalates frustrated customers to a human agent automatically.

This isn't a demo with hardcoded responses. Sara pulls customer data from a live database, builds a dynamic context for each conversation, and calls a large language model to generate a natural, accurate reply — all in under 500ms.

> **Why I built this:** I wanted to solve a real problem. Customer support for shipping companies in Egypt is painful — long wait times, inconsistent answers, and no 24/7 availability. This project shows how AI can replace that friction with something that actually works.

---

## The problem it solves

Think about calling a shipping company's support line. You wait on hold, the agent doesn't know the exact price for your governorate, and by the time you get an answer it's 9pm and the line is closed.

Sara fixes all of that:

- Available **24 hours a day, 7 days a week** — no shifts, no holidays
- Knows the **exact shipping price** for every one of Egypt's 27 governorates
- **Remembers the full conversation** — no need to repeat yourself
- Speaks **natural Egyptian Arabic** — not stiff formal text
- Detects when a customer is angry and **automatically escalates** to a human
- Treats **VIP customers differently** — faster, more personalized, with special offers
- Falls back gracefully — if the primary AI is unavailable, a secondary one kicks in instantly

---

## Live demo

| Link | Description |
|------|-------------|
| [shiphny.netlify.app](https://shiphny.netlify.app) | The full frontend — try the chat widget |
| [API Docs (Swagger)](https://shiphny-ai-support.onrender.com/api/docs) | Interactive backend documentation |

---

## Tech stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Primary LLM** | OpenRouter `openai/gpt-oss-120b:free` | No practical rate limits, free tier |
| **Fallback LLM** | Groq `llama-3.3-70b-versatile` | ~300ms response, free tier |
| **Backend** | FastAPI 0.111 + Python 3.11 | Async, fast, auto-generates API docs |
| **Database ORM** | SQLAlchemy 2 (Async) | Non-blocking DB queries |
| **Database** | SQLite (dev) / PostgreSQL (prod) | Easy to swap for production |
| **Frontend** | React 18 + TypeScript 5 + Vite | Type-safe, fast builds |
| **Styling** | Tailwind CSS | Responsive, mobile-first |
| **HTTP client** | httpx (async) | Non-blocking AI API calls |
| **Validation** | Pydantic v2 | Strong type safety on every request |
| **Containers** | Docker + Docker Compose | One-command deployment |
| **Hosting** | Render (backend) + Netlify (frontend) | Free tier, auto-deploy on push |

---

## How the AI pipeline works

Every message Sara receives goes through this exact sequence:

```
Customer message
      │
      ▼
1. Language detection         Arabic or English, auto-detected per message
      │
      ▼
2. Intent classification      Pricing / Tracking / Complaint / Return / Business / General
      │
      ▼
3. Context assembly           Customer name, tier (VIP/Premium/Standard), shipment history from DB
      │
      ▼
4. Prompt construction        Injects knowledge base (all 27 governorates) + customer context
      │
      ▼
5. AI call                    OpenRouter (primary) → Groq (fallback) → Static response (last resort)
      │
      ▼
6. Escalation check           Detects [ESCALATE_TO_HUMAN] tag in the response
      │
      ▼
7. Persist to database        Message, response, intent, confidence score, response time
```

The system never returns a blank screen. If the primary AI is rate-limited, Groq takes over. If Groq fails, a pre-written context-aware response is returned. The customer always gets an answer.

---

## Features

### AI and conversation
- Bilingual — detects Arabic vs English per message, not per session
- Full conversation memory — history is stored in DB and browser localStorage
- Intent detection across 7 categories with confidence scoring
- Tone adaptation — VIP customers get a faster, more premium experience
- Human escalation — detects anger, threats, or explicit requests for a manager
- Triple-layer fallback — OpenRouter → Groq → Static, zero downtime

### Chat interface
- Modern floating chat widget, works on mobile
- Full RTL support for Arabic
- Quick-action suggestion buttons
- Live typing indicator
- Session persistence across page refreshes

### Analytics dashboard
- Total conversations and active customers
- Average AI response time
- Intent distribution chart (what customers ask most)
- Resolution rate and escalation count

### Shipment management
- Full CRUD for bookings
- Shipment status tracking
- Linked customer profiles

---

## Project structure

```
shiphny-ai-support/
├── backend/
│   ├── main.py                    FastAPI app entry point
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── seed_knowledge_base.py     Seeds initial knowledge base articles
│   └── app/
│       ├── api/
│       │   ├── chat.py            Chat endpoint, session management, rate limiter
│       │   ├── bookings.py        Shipment CRUD
│       │   ├── analytics.py       Dashboard stats
│       │   ├── customers.py       Customer read operations
│       │   └── chat_debug.py      Debug and health check endpoints
│       ├── models/
│       │   ├── customer.py        Customer model — tier enum (VIP/Premium/Standard)
│       │   ├── booking.py         Booking model — status enum
│       │   ├── conversation.py    Conversation, Message, Intent models
│       │   └── knowledge_base.py  Knowledge base article model
│       ├── services/
│       │   ├── groq_ai.py         Core AI service — detection, prompts, OpenRouter, Groq
│       │   ├── gemini_ai.py       Gemini fallback service
│       │   └── fallback_responses.py  Static bilingual fallback responses
│       ├── db/
│       │   └── database.py        Async session factory and DB init
│       └── core/
│           └── config.py          App settings via pydantic-settings
├── frontend/
│   ├── src/
│   │   ├── App.tsx                Landing page, booking form, routing
│   │   ├── api.ts                 Centralized API base URL
│   │   ├── translations.ts        Arabic and English UI strings
│   │   └── components/
│   │       ├── PersistentChat.tsx Floating chat widget with localStorage
│   │       ├── Dashboard.tsx      Analytics dashboard
│   │       ├── ChatWidget.tsx     Inline chat component
│   │       └── Layout.tsx         Page layout wrapper
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── render.yaml                    One-click Render deployment config
└── .env.example                   Environment variable reference
```

---

## Running locally

**Requirements:** Python 3.11+, Node.js 18+, a free [OpenRouter](https://openrouter.ai) API key

**Backend**
```bash
cd backend

python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate      # macOS / Linux

pip install -r requirements.txt

cp ../.env.example .env
# Add OPENROUTER_API_KEY and GROQ_API_KEY to .env

uvicorn main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger docs | http://localhost:8000/api/docs |

**Docker (single command)**
```bash
cp .env.example backend/.env
# Add your API keys to backend/.env

docker compose up --build
```

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes | Free key from [openrouter.ai](https://openrouter.ai) |
| `GROQ_API_KEY` | Yes | Free key from [console.groq.com](https://console.groq.com) |
| `GEMINI_API_KEY` | Optional | Google Gemini as additional fallback |
| `DATABASE_URL` | No | Defaults to local SQLite |
| `GROQ_MODEL` | No | Defaults to `llama-3.3-70b-versatile` |
| `CORS_ORIGINS` | No | Allowed frontend origins |

---

## API reference

### `POST /api/chat`
```json
// Request
{
  "message": "How much does shipping to Alexandria cost?",
  "customer_id": 1,
  "session_id": "optional-existing-session-id"
}

// Response
{
  "response": "Shipping to Alexandria is EGP 40 standard, EGP 55 express 😊",
  "session_id": "abc-123",
  "confidence": 0.94,
  "response_time_ms": 380.5,
  "detected_intent": "shipping_price",
  "escalated": false
}
```

### `GET /api/analytics/dashboard`
Total conversations, customers, average response time, resolution rate, escalation count.

### `GET /api/analytics/intents`
Intent distribution with counts and percentages.

### `GET /api/bookings`
Paginated list of all shipment bookings.

### `POST /api/bookings`
Create a new booking record.

### `GET /api/ping`
Ultra-lightweight keep-alive — no DB, instant `{"ok": true}`.

### `GET /api/debug/apikey`
Check which AI keys are loaded (Groq, Gemini, OpenRouter).

### `GET /api/debug/test-openrouter`
Live end-to-end test of the OpenRouter integration.

---

## Deploying to production

**Backend on Render**
1. Create a new Web Service on [render.com](https://render.com)
2. Connect this repository — Render reads `render.yaml` automatically
3. Add environment variables: `OPENROUTER_API_KEY`, `GROQ_API_KEY`
4. Deploy

**Frontend on Netlify or Vercel**
1. Import this repository
2. Set the root directory to `frontend`
3. Add `VITE_API_URL` pointing to your Render backend URL
4. Deploy

**Preventing cold starts (important for free tier)**

Render's free plan pauses the service after 15 minutes of inactivity, causing a ~30 second delay on the next request. To prevent this, set up a free cron job at [cron-job.org](https://cron-job.org) to ping `GET /api/ping` every 14 minutes. The endpoint is designed specifically for this — no DB queries, instant response.

---

## Sample conversations

**Pricing question**
```
User   How much does it cost to ship to Alexandria?
Sara   Shipping to Alexandria 📦
       Standard: EGP 40 | Express: EGP 55
       Anything else I can help you with? 😊
```

**Coverage question**
```
User   Do you deliver to Sharm El Sheikh?
Sara   ✅ Yes! Sharm El Sheikh (South Sinai):
       Standard: EGP 60 | Express: EGP 85
       Delivery takes 3-5 business days 🚚
```

**Escalation**
```
User   This is completely unacceptable. I want to speak to a manager now.
Sara   I completely understand your frustration and I'm truly sorry.
       I'm escalating your case to a specialist right now. 🔴 [ESCALATE_TO_HUMAN]
```

---

## What the AI knows

The knowledge base baked into every conversation covers:

- **Shipping prices** — exact rates for all 27 Egyptian governorates, standard and express
- **Delivery times** — same-day in Cairo, 1-2 days Delta, 2-3 days Upper Egypt, 3-5 days border
- **Shipment tracking** — SH-XXXXXXXX format, via website / hotline / WhatsApp
- **Returns policy** — 14-day window, 3-5 day refund, free for defects
- **Insurance** — free up to EGP 2,000, extended to EGP 50,000 for 1% of value
- **Payment methods** — COD, Vodafone Cash, Visa, Mastercard, Fawry, bank transfer
- **Business solutions** — up to 40% discount, API integration, dedicated account manager
- **Common problems** — delayed shipment, wrong address, damaged package, lost shipment
- **Restrictions** — Egypt domestic only, 30kg max, no hazardous materials

---

## License

MIT — free for personal and commercial use.

---

<div align="center">

Built to show what AI-powered customer support looks like when it's done properly.

[Live Demo](https://shiphny.netlify.app) · [API Docs](https://shiphny-ai-support.onrender.com/api/docs)

</div>
