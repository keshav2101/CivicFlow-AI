# CivicFlow-AI: Project Context & State of Play 🏛️🤖

This document serves as the high-fidelity state-of-the-union for the **CivicFlow-AI** project. It is designed to immediately orient any administrative AI (Antigravity/Codex) with the project's technical "whereabouts," current implementation depth, and active roadmap.

---

## 🎯 Project Core Objective
**CivicFlow-AI** is an agentic administrative engine that automates organizational decision-making. It transforms unstructured human communication (WhatsApp, Web, Email) into structured, policy-aligned actions using a combination of **Deep Thinking AI** and **Hierarchical Human Oversight**.

---

## 🛠️ Technical Context (Stack)
- **Frontend**: Next.js 15 (App Router), Tailwind CSS V4, Framer Motion, SWR.
- **Backend**: Node.js & Express (TypeScript), Prisma ORM (PostgreSQL), BullMQ (Queue Management).
- **Infrastucture**: Redis (for task queues), PostgreSQL (state), Docker (Containerized services).
- **Intelligence**: `@google/genai` (Gemini 2.0/3.0 Thinking + Google Search Tool Grounding).
- **Comms**: node-telegram-bot-api (currently deferred), Deepgram Aura (Voice-to-Text).

---

## 🏛️ Organizational Architecture
The system operates on an hierarchical "Admin & Operations" model with pre-seeded roles:
1.  **Admin (Alex)**: Global oversight, handled in the dashboard greeting.
2.  **Treasurer (Jordan)**: Primary auditor for financial flows and budgets.
3.  **Head of Ops (Morgan)**: Reviewer for complex MoUs and high-value invoices.
4.  **CivicFlow AI**: The autonomous "System Agent" handling low-risk approvals.

---

## 🧠 The 'Nerve Engine' (IA Implementation)
Located in `backend/src/services/ai.ts` and `genai.ts`:
- **Thinking Logic**: Uses `thinkingBudget` for multi-step reasoning before classification.
- **Grounding**: Utilizes `googleSearch` tool for real-time verification of vendors and legal standards.
- **Deterministic Fail-Safe**: A keyword-based fallback engine exists to maintain uptime if the Gemini API hits 404/quota limits.

---

## ✅ Implementation Status (Phase-Wise)

### Phases 1–4: Foundations & UI [COMPLETED]
- [x] Responsive administrative dashboard with Next.js 15.
- [x] Tailwind CSS V4 design system with modern aesthetics.
- [x] Live Metric Engine for Automation Rate & SLA tracking.

### Phases 5–6: Triage & Scaling [COMPLETED]
- [x] Omni-channel Ingestion logic (Web Mock, Email, Whatsapp).
- [x] Multi-Role Seeder (`npm run seed`) for a full organization world.
- [x] Hierarchical Routing Rules for automated ticket assignment.

### Phase 7: Agentic Automation [COMPLETED]
- [x] **Autonomous Threshold**: Any reimbursement < $20 is auto-approved by the System Agent.
- [x] **Explainability Traces**: AI thinking/thoughts are stored in `Ticket.explanation`.
- [x] **Clause Negotiator**: Agentic re-drafting of legal clauses via Gemini 2.0 Thinking.

### Phase 8: Social Channel Expansion [PENDING/STAGING]
- [ ] Stabilize Telegram polling (currently deferred to avoid log spam).
- [ ] Bi-directional Email threading.

---

## 🧪 Current Testing Methodology (Codex Proof)
To verify the "whereabouts" of the project:
1.  **Backend Target**: Port 4000.
2.  **Frontend Target**: Port 3000.
3.  **Manual Test Command**:
    ```bash
    curl -X POST http://localhost:4000/ingest/mock -H "Content-Type: application/json" -d '{"text": "$12.50 student refund"}'
    ```
4.  **Verification**: Dashboard should reflect the item, assigned to 'System', marked 'Approved.'

---

## 📂 Key Entry Points
- `/backend/src/services/genai.ts`: The primary AI configuration.
- `/backend/src/workers/classification.worker.ts`: The core automation orchestrator.
- `/backend/src/seed.ts`: The blueprint for the organizational hierarchy.
- `/frontend/src/app/(app)/page.tsx`: The metric-driven cockpit.
