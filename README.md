# CivicFlow-AI: Agentic Administrative Workflow Automation 🏛️🤖

CivicFlow-AI is a next-generation "Thinking" administrative engine designed to automate organizational workflows. It bridges the gap between unstructured communication (WhatsApp, Web, Email) and structured organizational policy through autonomous AI agents and hierarchical human review.

---

## 🌟 Key Features

### 🧠 1. Thinking-First Nerve Engine
Powered by **Gemini 2.0 Thinking** and **Google Search Grounding**, the system doesn't just classify—it reasons.
- **Deep Reasoning**: Every classification is backed by a transparent chain-of-thought trace (`ThinkingConfig`).
- **Real-Time Verification**: The AI uses live search results to verify vendor legitimacy and legal standards.

### 🤖 2. Agentic Automation Pipeline
The platform implements an "Autonomous Threshold" for high-velocity operations.
- **Auto-Resolution**: Small tasks (e.g., Student Reimbursements < $20.00) are instantly approved by the System Agent.
- **Intelligent Triage**: Complex requests are automatically routed to the correct hierarchical role (Treasurer, Head of Ops, or Admin) based on extracted value and policy.

### ✍️ 3. Generative Clause Negotiator
An interactive legal workspace for MoUs and Partnerships.
- **Redrafting**: Human experts can suggest constraints (e.g., "Add mutual termination"), and the AI re-drafts the legal text in real-time.
- **Version Control**: Full audit trail of original vs. AI-suggested vs. human-approved clauses.

### 📊 4. Real-Time Operations Dashboard
A data-driven command center for administrators.
- **Automation KPIs**: Live tracking of "Automation Rate" and "SLA Compliance."
- **Hierarchical Views**: Personalized Dashboards for Admin (Alex), Treasurer (Jordan), and Head of Operations (Morgan).

---

## 🛠️ Technical Stack

- **Frontend**: Next.js 15 (App Router), Tailwind CSS V4, Framer Motion, SWR.
- **Backend**: Node.js & Express (TypeScript), Prisma ORM (PostgreSQL).
- **AI Infrastructure**: `@google/genai` (Gemini 2.0/3.0), Deepgram (Voice Transcription).
- **Task Queue**: Redis-backed BullMQ for asynchronous classification and negotiation.

---

## 🚀 Getting Started

### 1. Environment Configuration
Create a `.env` file in the `/backend` directory:
```env
GEMINI_API_KEY=your_google_ai_key
DEEPGRAM_API_KEY=your_deepgram_key
DATABASE_URL=postgresql://user:pass@localhost:5432/civicflow_db
REDIS_URL=redis://localhost:6379
```

### 2. Database & Seeding
Initialize the organizational hierarchy (Admin, Treasurer, Head of Ops):
```bash
cd backend
npm install
npx prisma migrate dev
npm run seed
```

### 3. Run Development Servers
```bash
# Backend
npm run dev

# Frontend (in separate terminal)
npm run dev
```

---

## 🧪 Testing the Workflow

Use the **[Testing Guide](file:///Users/sukhadkaur/.gemini/antigravity/brain/d36b17ff-6d9a-47a7-adc4-014a2addb171/testing_guide.md)** to verify the agentic capabilities:

1.  **Manual Ingestion (Mock)**:
    ```bash
    curl -X POST http://localhost:4000/ingest/mock \
      -H "Content-Type: application/json" \
      -d '{"text": "Refunding $12.50 for a student society coffee meeting."}'
    ```
2.  **Verify Results**: Open **[http://localhost:3000](http://localhost:3000)** and observe the system's "Thoughts" and autonomous approval.

---

## 🏗️ Organizational Roles
- **Alex (Admin)**: Full system oversight.
- **Jordan (Treasurer)**: Financial policy enforcement.
- **Morgan (Head of Ops)**: High-value legal and operational review.
- **CivicFlow AI**: Autonomous agent for low-value task resolution.
