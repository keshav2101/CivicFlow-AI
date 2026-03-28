import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { escalateTicket } from '../services/routing';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });

export const escalationWorker = new Worker('escalation', async job => {
  const { ticketId, currentStepIndex } = job.data;
  console.log(`[EscalationWorker] Escalating ticket SLA breach ${ticketId}`);
  
  await escalateTicket(ticketId, currentStepIndex);
}, { connection, concurrency: 1 });
