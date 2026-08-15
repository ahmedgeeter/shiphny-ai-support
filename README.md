# Shiphny AI Support & Logistics Platform

Shiphny is an enterprise-grade logistics and shipping management platform. I built this system to solve the complex challenges of tracking shipments, managing bookings, and handling customer support at scale. It integrates a secure, sandboxed AI agent directly into the core workflows to automate customer inquiries without compromising data security.

## Architecture & Tech Stack

This project was engineered with a microservices-first approach, focusing heavily on scalability, fault tolerance, and security.

### Infrastructure & Deployment
*   **Kubernetes (EKS):** The entire application is containerized and orchestrated via Kubernetes. I wrote custom Helm charts (`k8s/helm/shippny`) to parameterize deployments and ensure seamless Horizontal Pod Autoscaling (HPA).
*   **Terraform:** All AWS infrastructure (VPC, private subnets, NAT Gateways, EKS cluster) is provisioned declaratively as Code (`infrastructure/main.tf`).
*   **CI/CD Pipeline:** GitHub Actions automatically builds multi-stage Docker images, runs security scans, and updates the Kubernetes manifests upon every merge.

### Backend (FastAPI & Python)
*   **API Layer:** High-performance, asynchronous REST APIs built with FastAPI. It handles routing, JWT-based authentication, and strict Role-Based Access Control (RBAC).
*   **Database:** PostgreSQL is used as the ACID-compliant persistent store for financial ledgers, bookings, and customer profiles. Migrations are managed securely via Alembic.
*   **Background Processing:** Celery and Redis manage background tasks (like bulk invoice generation and asynchronous AI inference) so the main API thread is never blocked.
*   **AI Integration:** I used LangGraph to build a deterministic, cyclic graph for the AI agent. The AI is strictly sandboxed—it cannot hallucinate data because it is forced to call verified internal tools (e.g., `get_shipment_status`) and must authenticate the user before revealing sensitive tracking information.

### Frontend (React & TypeScript)
*   **Client App:** A robust Single Page Application built with React and Vite. It provides dashboards for logistics operators to monitor fleets, and customer portals for tracking active shipments and interacting with the AI agent.

## Core Features

1.  **Shipment & Fleet Tracking:** Real-time visibility into the lifecycle of logistics operations.
2.  **Automated Bookings:** A robust engine for managing client freight schedules.
3.  **Financial Ledger:** Automated invoicing and billing cycles.
4.  **Autonomous Support Agent:** An AI that acts as a Tier 1 support engineer. It reads the user's authentication context, checks their active shipments, answers general knowledge base queries, and verifies identity before looking up external tracking numbers.

## Local Development Setup

You can run the entire microservices stack locally without needing AWS credentials.

1. Clone the repository:
   ```bash
   git clone https://github.com/ahmedgeeter/shiphny-ai-support.git
   cd shiphny-ai-support
   ```

2. Configure environment variables:
   ```bash
   cp backend/.env.example backend/.env
   # Add your required API keys to backend/.env
   ```

3. Spin up the cluster using Docker Compose:
   ```bash
   docker-compose up --build
   ```

This command will initialize PostgreSQL, run all necessary database migrations, start Redis, and boot both the FastAPI backend (port 8000) and the React frontend (port 3000).

API Documentation will be accessible at: `http://localhost:8000/api/docs`
