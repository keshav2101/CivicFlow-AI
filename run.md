# 🚀 Running CivicFlow-AI with Docker

CivicFlow-AI uses a **"Hybrid Docker"** approach for development. The heavy infrastructure (PostgreSQL, Redis) runs in containers, while the application logic (Backend, AI Workers, Frontend) runs locally for maximum development speed and debugging transparency.

## 🛠️ Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- [Node.js v20+](https://nodejs.org/) installed locally.
- A valid `.env` file in the `backend/` directory with your API keys.

---

## 🏗️ Step 1: Start Infrastructure (Docker)
In the root directory, run:
```bash
docker-compose up -d
```
This will start:
- **PostgreSQL**: Accessible at `localhost:5432` (`civicflow_db`)
- **Redis**: Accessible at `localhost:6379` (Used for AI Task Queues)

---

## 🔌 Step 2: Initialize Database (Prisma)
Once the Postgres container is healthy, sync your schema and seed the initial organizational data:
```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run seed
```

---

## 🧠 Step 3: Launch the "Nerve-Center" (Backend)
The backend handles LLM orchestration (Gemini), transcription (Deepgram), and administrative routing.
```bash
# From the backend directory
npm run dev
```
- **API Health Check**: `http://localhost:4000/review/tickets`

---

## 💻 Step 4: Launch the Dashboard (Frontend)
The frontend provides a real-time view of all operations.
```bash
cd ../frontend
npm install
npm run dev
```
- **App URL**: `http://localhost:3000`

---

## 🩺 Troubleshooting
- **Database Connection Issues**: Ensure your `.env` has `DATABASE_URL="postgresql://civicflow:civicflow_password@localhost:5432/civicflow_db"`.
- **Redis Connection Issues**: Ensure `REDIS_URL="redis://localhost:6379"`.
- **Port Conflicts**: If port 5432 or 6379 is occupied by a local service, stop that service or modify the `ports` section in `docker-compose.yml`.

---
*Autonomous Operations Engine — CivicFlow-AI*
