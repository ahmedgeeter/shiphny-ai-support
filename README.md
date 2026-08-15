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

<h3>Enterprise Logistics and Shipping Management System</h3>

<p>
  <strong>Kubernetes (EKS) | Terraform | Helm | GitHub Actions | Docker Compose | React | FastAPI</strong>
</p>

</div>

---

## Project Overview

Shiphny is a comprehensive, enterprise-grade logistics and shipping management platform designed to handle complex supply chain operations. The system provides a robust architecture for managing shipments, bookings, customer profiles, and invoicing, seamlessly integrated with an advanced, AI-driven customer support engine.

Built for scale and reliability, Shiphny leverages a modern microservices architecture orchestrated via Kubernetes, with infrastructure provisioned as code using Terraform. It is engineered to meet the high-availability and strict security demands of the global logistics industry.

---

## Core Domain Features

The platform focuses on automating and streamlining core logistics workflows:

*   **Shipment Tracking and Management:** End-to-end visibility into shipment lifecycles, real-time status updates, and destination tracking.
*   **Booking and Scheduling:** Automated booking systems connecting clients with available freight and transportation assets.
*   **Customer Relationship Management:** Centralized profiles, order history, and account management for B2B and B2C clients.
*   **Invoicing and Billing:** Automated financial ledger handling billing cycles, invoice generation, and payment tracking.
*   **Intelligent AI Support:** A secure, context-aware AI assistant integrated directly into the platform to resolve customer inquiries, track orders, and process logistics data without human intervention.

---

## System Architecture

The system utilizes a decoupled microservices approach to ensure horizontal scalability and fault tolerance.

*   **Frontend (React):** A highly responsive Single Page Application (SPA) providing intuitive dashboards for logistics operators and clients.
*   **Backend (FastAPI):** High-performance, asynchronous REST APIs handling core business logic, database transactions, and authentication.
*   **Task Queue (Celery and Redis):** Background processing for resource-intensive tasks, such as generating large invoice batches or processing complex AI inference requests, ensuring the main API remains non-blocking.
*   **Relational Database (PostgreSQL):** ACID-compliant persistent storage for critical logistics data, bookings, and financial records.

---

## Security and Protection Mechanisms

Given the sensitive nature of shipping data and financial transactions, the platform implements rigorous security protocols:

*   **Defense-in-Depth Authentication:** Secure, token-based authentication (JWT) with strict Role-Based Access Control (RBAC) ensuring data isolation between different clients and operators.
*   **AI Sandbox and Prompt Injection Protection:** The integrated AI support agent operates within a strict deterministic sandbox. It utilizes cryptographic verification tags and system-level guards to prevent prompt injection attacks or unauthorized data access. The AI cannot bypass core authentication rules.
*   **Network Isolation:** Database and cache layers operate in isolated private subnets within a custom AWS VPC, completely inaccessible from the public internet.

---

## Infrastructure and DevOps Automation

The deployment lifecycle is fully automated, enforcing immutable infrastructure and GitOps methodologies.

*   **Infrastructure as Code (Terraform):** The `infrastructure/` directory contains declarative configurations for AWS, provisioning a secure VPC, NAT Gateways, and an Elastic Kubernetes Service (EKS) cluster.
*   **Kubernetes Orchestration (Helm):** The `k8s/helm/shippny` charts parameterize the deployment of all microservices, utilizing Horizontal Pod Autoscalers (HPA) to scale resources dynamically based on load.
*   **Continuous Integration and Continuous Deployment (GitHub Actions):** Every commit triggers an automated pipeline that builds optimized, multi-stage Docker images, scans for vulnerabilities, pushes to the GitHub Container Registry, and updates deployment manifests.

---

## Local Development and Evaluation

The entire logistics microservices stack can be evaluated locally without requiring access to the production AWS environment.

### Requirements
*   Docker and Docker Compose
*   Git

### Quick Start Guide

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/ahmedgeeter/shiphny-ai-support.git
    cd shiphny-ai-support
    ```

2.  **Environment Configuration:**
    Create a local environment file based on the provided template:
    ```bash
    cp backend/.env.example backend/.env
    ```

3.  **Start the Services:**
    Launch the database, cache, backend APIs, and frontend client:
    ```bash
    docker-compose up --build
    ```

Docker Compose will automatically provision isolated PostgreSQL and Redis instances, execute necessary database schema migrations, and expose the FastAPI backend on port 8000 and the React frontend on port 3000. 

Interactive API documentation is accessible at `http://localhost:8000/api/docs`.
