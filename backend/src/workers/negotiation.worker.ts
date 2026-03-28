import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { submitClauseFeedback } from '../services/negotiation';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });

export const negotiationWorker = new Worker('negotiation', async job => {
  const { clauseId, partyId, constraints, action } = job.data;
  console.log(`[NegotiationWorker] Processing clause feedback for ${clauseId}`);
  
  await submitClauseFeedback(clauseId, partyId, constraints, action);
  console.log(`[NegotiationWorker] Finished LLM negotiation constraints for ${clauseId}.`);

}, { connection, concurrency: 5 });
