# 🚢 Shiphny — Multi-Agent Logistics & Support Platform

An enterprise-grade, asynchronous AI support and shipment intelligence platform engineered with **FastAPI**, **LangGraph**, **Redis**, and **PostgreSQL**.

---

## 🏗️ Architecture Overview

Shiphny demonstrates a production-oriented microservices architecture designed to decouple heavy AI workflows from synchronous customer communications:

```
┌──────────────────┐
│   React Client   │ (Vite / TypeScript / Tailwind)
└─────────┬────────┘
          │ REST / WebSockets
          ▼
┌──────────────────┐
│  FastAPI Gateway │ (Auth, Rate Limiting, RBAC)
└────┬─────────┬───┘
     │         │
     │         ▼
     │    ┌──────────────────────────────────────────────┐
     │    │ LangGraph Agentic Workflow                   │
     │    │ - Cyclic State Machine                       │
     │    │ - Deterministic Tool-Calling Guardrails      │
     │    │ - Multi-Provider Fallback (Groq ➔ Gemini)    │
     │    └──────────────────────────────────────────────┘
     ▼
┌──────────────┐      ┌──────────────┐
│  PostgreSQL  │      │ Redis Cache  │
│  (Ledger/DB) │      │  & Sessions  │
└──────────────┘      └──────────────┘
```

---

## ⚡ Core Engineering Highlights

- **Deterministic Agent Execution:** Built on LangGraph state machines, restricting LLMs to authenticated tool boundaries (`get_shipment_status`, `verify_customer`, `cancel_shipment`) to eliminate hallucination vectors.
- **Automated LLM Resilience:** Provider fallback pipeline chaining Groq Llama-3.3-70B to Gemini 1.5 Flash via LangChain `with_fallbacks`, guaranteeing uptime during provider throttling.
- **Relational Integrity:** PostgreSQL schema managed via Alembic migrations, supporting atomic transaction consistency for booking operations and customer records.
- **Containerized Infrastructure:** Declarative orchestration via Docker Compose for local development, with Helm charts and Terraform templates targeting Kubernetes (EKS).

---

## 🚀 Getting Started

### 1. Clone & Configure

```bash
git clone https://github.com/ahmedgeeter/shiphny-ai-support.git
cd shiphny-ai-support
cp backend/.env.example backend/.env
```

### 2. Run with Docker Compose

```bash
docker-compose up --build
```

The services will spin up on:
- **Backend API:** `http://localhost:8000/docs`
- **Frontend App:** `http://localhost:3000`
- **PostgreSQL:** `localhost:5432`
- **Redis:** `localhost:6379`
