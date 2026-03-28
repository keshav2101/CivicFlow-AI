import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { generateDocument } from '../services/execute';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });

export const documentsWorker = new Worker('documents', async job => {
  const { ticketId } = job.data;
  console.log(`[DocumentsWorker] Generating documents for ticket ${ticketId}`);
  
  const doc = await generateDocument(ticketId);
  console.log(`[DocumentsWorker] Document created: ${doc.id}`);

}, { connection, concurrency: 5 });

documentsWorker.on('failed', (job, err) => {
  console.error(`[DocumentsWorker] Job ${job?.id} failed:`, err);
});
