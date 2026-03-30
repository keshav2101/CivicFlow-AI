import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { NormalizedEvent } from '../channels/types';
import { applyPolicy } from '../services/policy';
import { runThinkPipeline } from '../services/think';
import { createTicketAndRoute } from '../services/routing';
import { notifyTicketUpdate } from '../services/notification';
import { transcribeAudio } from '../services/ai';
import { redactPII } from '../utils/pii';
import { documentsQueue } from './queues';
import fs from 'fs';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });
const prisma = new PrismaClient();

export const classificationWorker = new Worker('classification', async job => {
  const event = job.data as NormalizedEvent;
  console.log(`[ClassificationWorker] Processing event ${event.id}`);

  // 1. Voice Transcription (if applicable)
  let rawText = event.rawText;
  if (event.voicePath && fs.existsSync(event.voicePath)) {
    console.log(`[ClassificationWorker] Transcribing voice memo for event ${event.id}`);
    const transcription = await transcribeAudio(event.voicePath);
    rawText = transcription;
    
    // Cleanup temporary audio file
    try { fs.unlinkSync(event.voicePath); } catch (e) { console.error('Failed to cleanup voice file:', e); }
  }

  // 2. PII Redaction securely stripped before sending to LLM
  const safeText = redactPII(rawText);

  // 3. Policy Engine Validate 
  await applyPolicy(safeText, event);

  // 4. Classification & Nerve Engine Extraction (Gemini)
  const extractedData = await runThinkPipeline(safeText, event.senderId); // Using senderId as org context proxy for now
  console.log(`[ClassificationWorker] Extracted Data:`, extractedData);

  // 4. Resolving Demo User and Org
  const org = await prisma.organization.findFirst();
  const user = await prisma.user.findFirst();
  if (!org || !user) throw new Error("Database not seeded with root Organization or User.");
  
  // 5. Routing & Ticket Creation (Applying Agentic Automation)
  const ticket = await createTicketAndRoute(org.id, user.id, {
    request_type: extractedData.type,
    amount: extractedData.amount,
    urgency: extractedData.urgency,
    category: extractedData.category,
    rawText: safeText,
    status: extractedData.suggestedAction === 'APPROVE' ? 'APPROVED' : 'PENDING'
  });
  
  // Store the LLM Explanation (Reasoning)
  const resolutionText = extractedData.suggestedAction === 'APPROVE' 
    ? `System Agent: Autonomous approval based on policy. ${extractedData.explanation}`
    : extractedData.explanation;

  await prisma.ticket.update({
    where: { id: ticket.id },
    data: { 
      explanation: { 
        reasoning: resolutionText,
        suggestedAction: extractedData.suggestedAction
      } 
    }
  });
  
  console.log(`[ClassificationWorker] Assessed (${extractedData.suggestedAction}) and Ticket created: ${ticket.id}`);

  // 6. Hand off to asynchronous Document Workflow worker
  if (ticket.type === 'MOU' || ticket.type === 'INVOICE' || ticket.type === 'REIMBURSEMENT') {
    await documentsQueue.add('generate-doc', { ticketId: ticket.id }, { jobId: `doc-${ticket.id}`, attempts: 3 });
  }

}, { connection, concurrency: 5 });

classificationWorker.on('failed', (job, err) => {
  console.error(`[ClassificationWorker] Job ${job?.id} failed:`, err);
});
