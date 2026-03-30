<div align="center">
  <img src="frontend/public/globe.svg" alt="CivicFlow AI Logo" width="80" height="80">
  <h1 align="center">CivicFlow AI</h1>
  <p align="center">
    <strong>An Autonomous, Omni-Channel Operations Agent for Zero-IT Organizations</strong>
  </p>
  <p align="center">
    <a href="https://github.com/keshav2101/CivicFlow-AI/stargazers"><img src="https://img.shields.io/github/stars/keshav2101/CivicFlow-AI?style=for-the-badge&color=indigo" alt="Stars Badge"/></a>
    <a href="https://github.com/keshav2101/CivicFlow-AI/network/members"><img src="https://img.shields.io/github/forks/keshav2101/CivicFlow-AI?style=for-the-badge&color=emerald" alt="Forks Badge"/></a>
    <a href="https://github.com/keshav2101/CivicFlow-AI/issues"><img src="https://img.shields.io/github/issues/keshav2101/CivicFlow-AI?style=for-the-badge&color=rose" alt="Issues Badge"/></a>
    <a href="https://github.com/keshav2101/CivicFlow-AI/pulls"><img src="https://img.shields.io/github/issues-pr/keshav2101/CivicFlow-AI?style=for-the-badge&color=violet" alt="Pull Requests Badge"/></a>
  </p>
</div>

<br />

## 🌟 The Problem: The Chaos of Zero-IT Operations
Community organizations, college clubs, and NGOs manage multi-thousand dollar operations entirely through unstructured, fragmented channels: **WhatsApp groups, noisy email threads, and localized verbal agreements.**

Without dedicated IT teams to configure rigid ticketing software, critical administrative processes rapidly decay:
- ❌ **Lost Requests**: Reimbursements and vendor invoices are buried rapidly into group chats.
- ❌ **No SLAs**: Approvals are delayed indefinitely due to absent structure.
- ❌ **Blind Liability**: There is zero cryptographic audit trail for financial distributions.

## 🚀 The Solution: The CivicFlow Paradigm
**CivicFlow AI** introduces a strictly modeled, autonomous operations layer requiring **zero user onboarding**. Members keep sending unstructured text via their native apps (WhatsApp, Email), and CivicFlow's *Generative AI Policy Engine* intercepts the traffic. 

The AI extracts entities, maps intents, enforces hard policy guardrails (e.g. Reject requests >$500), and injects clean JSON objects directly into a sophisticated, Stripe-inspired dashboard queue for single-click Administrative approval.

---

## 🏛️ System Architecture

### 1. Omni-Channel Ingestion Pipelines
Ingests unstructured text from disparate edge points to establish initial context.
- **WhatsApp API Adapter**: Parses messages, receipts, and photos native to group chats.
- **MailHook Server**: Decodes unstructured inbound threads and maps CC/BCC permissions natively.

### 2. Multi-Agent Neuro-Engine
Routes data via an internal mesh of highly optimized sub-LLMs.
- **Entity Extraction**: Plucks values natively (`amount: 250`, `urgency: 4`, `currency: USD`).
- **Intent Classifier**: Pushes bounds down 4 structural pillars (Reimbursement, Invoice, MoU, Grievance).
- **Immutable Explainability**: Pushes its Chain-of-Thought (CoT) reasoning out to PostgreSQL.

### 3. Human-in-the-Loop Operations Dashboard (Frontend)
A high-density Next.js web ecosystem providing immediate validation states.
- **Zero-Click Live Metrics**: Interactive, animated KPIs tracking total system volume.
- **Clause Negotiator (MoU)**: Visual side-by-side legal text differ for dynamically generative contract agreements.
- **Tamper-Proof Audit Vault**: A centralized read-only ledger capturing cryptographic sequences of all AI operations.

---

## 💻 Tech Stack
| Tier | Technology Suite | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React, Next.js 15 (App Router), Tailwind V4 | High-density Web Application Interface |
| **Backend** | Node.js (TypeScript) & Express | Scalable microservices handling ingress ingestion |
| **Intelligence**| Google Gemini 1.5 Pro | Structured intent mapping and entity extraction |
| **Voice** | Deepgram Nova-2 | High-accuracy audio transcription |
| **Database** | PostgreSQL + Prisma ORM | Relational typing schemas and JSON store |

---

## 🛠⚙️ Repository Structure
This monolithic repository natively isolates the API backend from the Application Dashboard client using decoupled modular environments.

```bash
📦 CivicFlow-AI
 ┣ 📂 backend          # Node.js/Express Native Endpoints
 ┃ ┣ 📂 prisma         # Relational Postgres Schema Definitions
 ┃ ┣ 📂 src            
 ┃ ┃ ┣ 📂 api          # OpenAPI standard REST Controllers
 ┃ ┃ ┣ 📂 channels     # Webhooks (WhatsApp, Email)
 ┃ ┃ ┣ 📂 services     # Localized AI Workflow Engine Modules
 ┃ ┃ ┗ 📜 index.ts     # Microservice Booter
 ┣ 📂 frontend         # Next.js Application Client
 ┃ ┣ 📂 public         # Native SVGs & Assets
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 app          # App Routing Layer (Dashboard, Login, Tickets)
 ┃ ┃ ┣ 📂 components   # Reusable Atomic UI Blocks (Navbar, Sidebar)
 ┃ ┃ ┗ 📂 lib          # Static Client Utilities & Demo Vectors (data)
 ┃ ┣ 📜 next.config.ts # Core Pipeline Config
 ┃ ┗ 📜 package.json   # NPM Executables
```

---

## 🏃 Getting Started (Local Development)

Booting CivicFlow UI in a local environment is streamlined for instant feedback loops. Ensure you have **Node 20+** and **NPM 10+** installed.

### 1. Clone the Source
```bash
git clone https://github.com/keshav2101/CivicFlow-AI.git
cd CivicFlow-AI
```

### 2. Configure the Frontend Environment
Connect to the local interface environment and orchestrate dependencies.
```bash
cd frontend
npm install
```

### 3. Launch the Application Server
Trigger the native `.next` engine build for local hot-module reloading.
```bash
npm run dev
```

The system will report live on [`http://localhost:3000`](http://localhost:3000). The native admin dashboard can be accessed directly by simulating a demo login natively.

---

## 🐳 Docker Deployment (Recommended)
For a streamlined setup using Docker containers for PostgreSQL and Redis:
See the **[run.md](./run.md)** file for step-by-step Docker instructions.

---

## 📜 Open Source License
Distributed natively under the MIT License. See `LICENSE` for more explicit configuration thresholds.

<p align="center">Built with 🧠 and ❤️ for Zero-IT Operations teams globally.</p>
