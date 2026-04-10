# Shiphny AI Support Agent

A production-ready AI customer support system for a shipping and logistics company.
Built with FastAPI, React, and Llama 3.3 70B via the Groq API.

---

## Overview

Shiphny AI Support Agent is a full-stack application that demonstrates how an AI agent
can handle real customer support workloads for a shipping company. The AI agent, named Sara,
handles shipment inquiries, pricing questions, complaints, and escalations in both Arabic and English.

The system reads live data from a database, meaning Sara responds with accurate shipment information
rather than generic answers.

---

## Architecture

```
Browser
  |
  |-- Landing Page (React + Tailwind CSS)
  |-- Analytics Dashboard (React)
  |-- Chat Widget (React, floating, RTL/LTR)
       |
       | HTTP REST
       |
  FastAPI Backend (Python 3.11)
       |
       |-- /api/chat          Chat endpoint, session management, conversation history
       |-- /api/bookings      Shipment CRUD operations
       |-- /api/analytics     Dashboard statistics and intent distribution
       |-- /api/health        Service health check
       |-- /api/ping          Lightweight keep-alive endpoint
       |
       |-- Rate Limiter (20 requests / 60 seconds per IP)
       |
       |-- GroqAI Service
       |    |-- Language detection (Arabic / English)
       |    |-- Intent classification (7 categories)
       |    |-- System prompt builder (customer context + live booking data)
       |    |-- Groq API call (Llama 3.3 70B, ~300ms avg)
       |    |-- Escalation detection
       |
       |-- SQLite Database
            |-- customers
            |-- bookings
            |-- conversations
            |-- messages
```

---

## How the AI Works

Each incoming message passes through the following steps in order:

1. **Language detection** — identifies Arabic or English from message content
2. **Intent classification** — categorizes as: booking inquiry, complaint, pricing, tracking, or general
3. **Context assembly** — loads customer profile, tier, total orders, and live shipment records from the database
4. **Prompt construction** — builds a structured system prompt with the full knowledge base and customer-specific context
5. **Groq API call** — sends the conversation to Llama 3.3 70B, average latency under 500ms
6. **Escalation check** — detects the escalation trigger tag and flags the conversation for human handoff
7. **Persistence** — saves the message, AI response, detected intent, confidence score, and response time to the database

---

## Features

| Feature               | Description                                                                 |
|-----------------------|-----------------------------------------------------------------------------|
| Bilingual AI Agent    | Arabic and English, language auto-detected per message                      |
| Live Booking Data     | AI queries real shipment records and responds with accurate information      |
| Intent Detection      | 7 intent categories with confidence scoring                                 |
| Session Memory        | Conversation history stored in the database and browser localStorage        |
| Analytics Dashboard   | Conversations, customers, avg response time, resolution rate, intent chart  |
| Human Escalation      | Detects frustrated customers and flags the session for agent handoff        |
| Customer Tiers        | VIP, Premium, Standard — Sara adapts response tone per tier                 |
| Rate Limiting         | 20 messages per 60 seconds per IP address                                   |
| Booking Management    | Full create, read, and status update operations on shipments                |
| Docker Support        | Docker Compose setup for one-command local or cloud deployment              |
| Auto API Docs         | OpenAPI documentation auto-generated at /api/docs                           |

---

## Tech Stack

| Layer      | Technology                                       |
|------------|--------------------------------------------------|
| LLM        | Llama 3.3 70B Versatile via Groq API             |
| Backend    | FastAPI 0.111, Python 3.11, async SQLAlchemy 2   |
| Database   | SQLite (dev), compatible with PostgreSQL         |
| Frontend   | React 18, TypeScript 5, Vite, Tailwind CSS       |
| HTTP       | httpx for async external API calls               |
| Validation | Pydantic v2                                      |
| Container  | Docker and Docker Compose                        |

---

## Project Structure

```
shiphny-ai-support/
|-- backend/
|   |-- main.py                    FastAPI app, startup hooks, health and ping endpoints
|   |-- requirements.txt
|   |-- Dockerfile
|   |-- app/
|       |-- api/
|       |   |-- chat.py            Chat endpoint, session and history management, rate limiter
|       |   |-- bookings.py        Booking CRUD
|       |   |-- analytics.py       Dashboard statistics
|       |   |-- customers.py       Customer read operations
|       |-- models/
|       |   |-- customer.py        Customer model with tier enum (VIP, Premium, Standard)
|       |   |-- booking.py         Booking model with status enum
|       |   |-- conversation.py    Conversation, Message, and Intent models
|       |-- services/
|       |   |-- groq_ai.py         Core AI service: language detection, intent, prompts, Groq calls
|       |-- db/
|       |   |-- database.py        Async session factory and database initialization
|       |-- core/
|           |-- config.py          Application settings via pydantic-settings
|-- frontend/
|   |-- src/
|   |   |-- App.tsx                Main app, landing page, booking form, routing
|   |   |-- translations.ts        Arabic and English UI string definitions
|   |   |-- components/
|   |       |-- PersistentChat.tsx  Floating chat widget with session and localStorage
|   |       |-- Dashboard.tsx       Analytics dashboard component
|   |       |-- ChatWidget.tsx      Inline chat component
|   |       |-- Layout.tsx          Page layout wrapper
|   |-- Dockerfile
|   |-- nginx.conf
|-- docker-compose.yml
|-- render.yaml                    Render.com one-click deployment config
|-- .env.example                   Environment variable reference
```

---

## Getting Started

### Requirements

- Python 3.11 or higher
- Node.js 18 or higher
- Groq API key (free at https://console.groq.com)

### Local Development

**Backend**

```bash
cd backend

python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate       # macOS and Linux

pip install -r requirements.txt

cp ../.env.example .env
# Open .env and set GROQ_API_KEY

uvicorn main:app --reload --port 8000
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/api/docs

### Docker

```bash
cp .env.example backend/.env
# Set GROQ_API_KEY in backend/.env

docker compose up --build
```

---

## Environment Variables

| Variable       | Required | Description                                    |
|----------------|----------|------------------------------------------------|
| GROQ_API_KEY   | Yes      | API key from console.groq.com (free)           |
| GROQ_MODEL     | No       | Defaults to llama-3.3-70b-versatile            |
| DATABASE_URL   | No       | Defaults to SQLite                             |
| CORS_ORIGINS   | No       | List of allowed frontend origins               |
| DEBUG          | No       | Set to true for development logging            |

---

## API Reference

### POST /api/chat

```json
Request:
{
  "message": "Where is my shipment SH-12345678?",
  "customer_id": 1,
  "session_id": "existing-session-id-or-omit-to-start-new",
  "language": "en"
}

Response:
{
  "response": "Your shipment SH-12345678 is currently in transit.",
  "session_id": "abc123",
  "confidence": 0.91,
  "response_time_ms": 312.4,
  "detected_intent": "booking_inquiry",
  "escalated": false
}
```

### GET /api/analytics/dashboard

Returns: total conversations, customer count, average response time, resolved count, escalated count.

### GET /api/analytics/intents

Returns: intent distribution with counts and percentages.

### GET /api/bookings

Returns: paginated list of all bookings.

### POST /api/bookings

Creates a new shipment booking record.

### GET /api/health

Returns: application status and version.

### GET /api/ping

Lightweight keep-alive endpoint, returns `{"ok": true}` with no database access.

---

## Deployment

The repository includes a `render.yaml` file for automated deployment to Render.com.

**Backend on Render**

1. Go to render.com and create a new Web Service
2. Connect this repository
3. Render reads render.yaml automatically — no manual configuration needed
4. Add one environment variable: GROQ_API_KEY
5. Deploy

**Frontend on Vercel**

1. Go to vercel.com and import this repository
2. Set the root directory to frontend
3. Add environment variable: VITE_API_URL = your Render backend URL
4. Deploy

**Preventing Cold Starts**

The free Render tier pauses after 15 minutes of inactivity, causing a ~30 second delay on the next request.
To prevent this, set up a free cron job at cron-job.org to call GET /api/ping on your backend every 14 minutes.

---

## Example Conversations

**Shipment inquiry in Arabic**
```
User:  اخبرني عن شحنتي SH-34634614
Sara:  شحنتك SH-34634614 - شحن قياسي
       الحالة: قيد الانتظار
       من القاهرة الى الاسكندرية - 2 كجم
       هل تريد معرفة الوقت المتوقع للتسليم؟
```

**Pricing question in English**
```
User:  How much does express shipping cost?
Sara:  Express shipping starts at EGP 45.
       Same-day delivery in Greater Cairo.
       24-hour delivery to all 27 governorates.
       Includes real-time tracking, SMS notifications, and full insurance.
```

**Escalation trigger**
```
User:  This is unacceptable. I want to speak to a manager immediately.
Sara:  I completely understand your frustration and I apologize for the inconvenience.
       I am escalating your case to a specialist right now.
       [Conversation flagged for human handoff]
```

---

## License

MIT
