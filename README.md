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

<h3>DevOps & Cloud Native Portfolio Showcase</h3>

<p>
  <strong>Kubernetes (EKS) • Terraform • Helm • GitHub Actions (CI/CD) • Docker Compose</strong>
</p>

<p>
  <img src="https://img.shields.io/badge/AWS-EKS-FF9900?style=flat&logo=amazon-aws&logoColor=white" alt="AWS EKS" />
  <img src="https://img.shields.io/badge/Terraform-1.9-844FBA?style=flat&logo=terraform&logoColor=white" alt="Terraform" />
  <img src="https://img.shields.io/badge/Helm-Charts-0F1689?style=flat&logo=helm&logoColor=white" alt="Helm" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=flat&logo=fastapi&logoColor=white" alt="FastAPI" />
</p>

</div>

---

## 🎯 Project Purpose

**This repository is a comprehensive DevOps engineering portfolio showcase.** 
It demonstrates the ability to architect, provision, and deploy a production-grade, highly available microservices application using modern cloud-native tools.

While the underlying application is a functional AI-powered logistics support bot, the true highlight of this repository is the **infrastructure automation, CI/CD pipelines, and Kubernetes orchestration.**

---

## 🏗 Infrastructure as Code (Terraform)

The `infrastructure/` directory contains declarative Terraform code designed for **AWS**. 
*(Note: These are production-grade templates and are not meant to be applied unless you intend to provision real, paid AWS resources).*

- **VPC & Networking:** Custom VPC with public, private, and intra subnets. Includes cost-optimized single NAT Gateways.
- **EKS Cluster:** Managed Kubernetes cluster (v1.30) with dynamically scaling node groups.
- **ECR:** Elastic Container Registry for secure image hosting.
- **State Management:** S3 backend with DynamoDB state locking for team collaboration.

---

## 🚀 Kubernetes & GitOps (Helm & ArgoCD)

The `k8s/` directory contains the deployment manifests.

- **Helm Charts (`k8s/helm/shippny`):**
  - Parameterized deployments for Frontend, Backend, and Background Workers.
  - **Horizontal Pod Autoscaler (HPA):** Dynamically scales replicas between 2 and 5 based on CPU utilization (target 80%).
  - Configurable resource requests and limits.
- **ArgoCD:** Application manifests ready for pull-based GitOps deployment.

---

## ⚙️ CI/CD Pipeline (GitHub Actions)

The `.github/workflows/ci-cd.yaml` file defines a fully automated pipeline:
- **Build & Push:** Uses Docker Buildx to compile highly optimized, multi-stage Docker images for both the React frontend and FastAPI backend.
- **GHCR Integration:** Pushes images securely to the GitHub Container Registry.
- **Manifest Updates:** Automatically patches the Helm `values.yaml` with the latest Git SHA to trigger ArgoCD syncs.

---

## 👨‍💻 Recruiter / Local Evaluation Guide (Free & Easy)

You can run the entire microservices stack (Frontend, Backend, PostgreSQL, Redis) locally on your machine for free in just a few minutes using **Docker Compose**.

### Prerequisites
- Docker & Docker Compose installed.
- Git.

### 1-Minute Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ahmedgeeter/shiphny-ai-support.git
   cd shiphny-ai-support
   ```

2. **Configure Environment:**
   Copy the provided template to create your `.env` file:
   ```bash
   cp backend/.env.example backend/.env
   ```

3. **Launch the Stack:**
   ```bash
   docker-compose up --build
   ```

### What happens?
Docker Compose will automatically:
1. Spin up **PostgreSQL** and **Redis**.
2. Run database migrations (`alembic upgrade head`) automatically.
3. Start the **FastAPI Backend** on `http://localhost:8000`.
4. Start the **React Frontend** on `http://localhost:3000`.

*You can now explore the frontend at `http://localhost:3000` and the API docs at `http://localhost:8000/api/docs`.*

---

<div align="center">
  <i>Built to demonstrate engineering excellence, scalable architectures, and DevOps best practices.</i>
</div>
