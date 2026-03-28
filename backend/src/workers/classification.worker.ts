import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { NormalizedEvent } from '../channels/types';
import { applyPolicy } from '../services/policy';
import { classifyAndExtract } from '../services/think';
import { createTicketAndRoute } from '../services/routing';
import { redactPII } from '../utils/pii';
import { documentsQueue } from './queues';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });
const prisma = new PrismaClient();

export const classificationWorker = new Worker('classification', async job => {
  const event = job.data as NormalizedEvent;
  console.log(`[ClassificationWorker] Processing event ${event.id}`);

  // 1. PII Redaction securely stripped before sending to LLM
  const safeText = redactPII(event.rawText);

  // 2. Policy Engine Validate 
  await applyPolicy(safeText, event);

  // 3. Classification
  const extractedData = await classifyAndExtract(safeText);
  console.log(`[ClassificationWorker] Extracted Data:`, extractedData);

  // 4. Resolving Demo User and Org
  const org = await prisma.organization.findFirst();
  const user = await prisma.user.findFirst();
  if (!org || !user) throw new Error("Database not seeded with root Organization or User.");
  
  // 5. Routing & Ticket Creation
  const ticket = await createTicketAndRoute(org.id, user.id, {
    request_type: extractedData.request_type as any,
    amount: extractedData.amount,
    urgency: extractedData.urgency as any,
    category: extractedData.category,
    rawText: safeText
  });
  
  console.log(`[ClassificationWorker] Assessed and Ticket created: ${ticket.id}`);

  // 6. Hand off to asynchronous Document Workflow worker
  if (ticket.type === 'MOU' || ticket.type === 'INVOICE' || ticket.type === 'REIMBURSEMENT') {
    await documentsQueue.add('generate-doc', { ticketId: ticket.id }, { jobId: `doc-${ticket.id}`, attempts: 3 });
  }

}, { connection, concurrency: 5 });

classificationWorker.on('failed', (job, err) => {
  console.error(`[ClassificationWorker] Job ${job?.id} failed:`, err);
});
