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
  <strong>Kubernetes (EKS) | Terraform | Helm | GitHub Actions (CI/CD) | Docker Compose</strong>
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

## Project Overview

This repository serves as a comprehensive DevOps engineering portfolio showcase. It demonstrates the ability to architect, provision, and deploy a production-grade, highly available microservices application using modern cloud-native tools and practices.

While the underlying application is a functional AI-powered logistics support bot, the primary focus of this repository is the infrastructure automation, CI/CD pipelines, and Kubernetes orchestration. It is designed to reflect enterprise-level standards.

---

## Infrastructure as Code (Terraform)

The `infrastructure/` directory contains declarative Terraform code designed for AWS. Please note that these are production-grade templates and are not meant to be applied unless you intend to provision real, paid AWS resources.

*   **VPC and Networking:** Provisions a custom Virtual Private Cloud (VPC) with public, private, and intra subnets. It includes cost-optimized, highly available NAT Gateways.
*   **EKS Cluster:** Sets up a managed Kubernetes cluster (v1.30) with dynamically scaling node groups to handle varying workloads efficiently.
*   **Elastic Container Registry (ECR):** Configures secure image hosting repositories.
*   **State Management:** Utilizes an S3 backend with DynamoDB state locking to ensure safe, concurrent team collaboration.

---

## Kubernetes and GitOps (Helm and ArgoCD)

The `k8s/` directory contains the deployment manifests necessary for orchestrating the containers.

*   **Helm Charts (`k8s/helm/shippny`):**
    *   Provides parameterized deployments for the Frontend, Backend, and Background Workers.
    *   **Horizontal Pod Autoscaler (HPA):** Dynamically scales application replicas between 2 and 5 based on CPU utilization, targeting an 80% threshold.
    *   Features highly configurable resource requests and limits to ensure cluster stability.
*   **ArgoCD Integration:** The application manifests are structured and ready for a pull-based GitOps deployment workflow.

---

## CI/CD Pipeline (GitHub Actions)

The `.github/workflows/ci-cd.yaml` file defines a fully automated, continuous integration and deployment pipeline:

*   **Build and Push:** Leverages Docker Buildx to compile highly optimized, multi-stage Docker images for both the React frontend and the FastAPI backend.
*   **GHCR Integration:** Pushes the built images securely to the GitHub Container Registry.
*   **Automated Manifest Updates:** Automatically patches the Helm `values.yaml` file with the latest Git SHA, bridging the gap between CI and CD by triggering ArgoCD synchronization.

---

## Recruiter and Local Evaluation Guide

You can run the entire microservices stack (Frontend, Backend, PostgreSQL, Redis) locally on your machine for free in just a few minutes using Docker Compose. This allows you to evaluate the codebase without requiring an AWS account.

### Prerequisites
*   Docker and Docker Compose installed.
*   Git installed.

### Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ahmedgeeter/shiphny-ai-support.git
    cd shiphny-ai-support
    ```

2.  **Configure the Environment:**
    Copy the provided environment template to create your local `.env` file:
    ```bash
    cp backend/.env.example backend/.env
    ```

3.  **Launch the Stack:**
    Build and start the containers using Docker Compose:
    ```bash
    docker-compose up --build
    ```

### Execution Details
Once the command is executed, Docker Compose will automatically perform the following:
1.  Spin up isolated **PostgreSQL** and **Redis** instances.
2.  Run the necessary database migrations (`alembic upgrade head`) before starting the backend.
3.  Start the **FastAPI Backend** on `http://localhost:8000`.
4.  Start the **React Frontend** on `http://localhost:3000`.

You can explore the user interface at `http://localhost:3000` and review the interactive API documentation at `http://localhost:8000/api/docs`.

---

<div align="center">
  <i>Built to demonstrate engineering excellence, scalable architectures, and DevOps best practices.</i>
</div>
