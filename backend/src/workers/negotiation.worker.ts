import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { generateWithThinking } from '../services/genai';

const prisma = new PrismaClient();

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null
});

export const negotiationWorker = new Worker('negotiation', async (job: Job) => {
    const { clauseId, action, constraints } = job.data;
    console.log(`[NegotiationWorker] Processing ${action} for Clause: ${clauseId}`);

    if (action === 'rewrite') {
        const clause = await prisma.clause.findUnique({
            where: { id: clauseId },
            include: { revisions: { orderBy: { version: 'desc' }, take: 1 } }
        });

        if (!clause) throw new Error("Clause not found");
        const currentText = clause.revisions[0]?.text || clause.text;

        const prompt = `
            You are a senior legal AI negotiator.
            Task: Redraft clause based on constraints.
            Current: "${currentText}"
            Constraints: "${constraints}"
            
            RESPONSE FORMAT: JSON ONLY.
            { "revised_text": "...", "reasoning": "..." }
        `;

        const { text: jsonResponse, thoughts } = await generateWithThinking(prompt);
        const jsonMatch = jsonResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("AI failed to return valid JSON for re-draft.");
        
        const { revised_text, reasoning } = JSON.parse(jsonMatch[0]);
        
        const fullReasoning = `${reasoning} [Thinking: ${thoughts}]`.trim();

        // 3. Create NEW Revision
        const lastVersion = clause.revisions[0]?.version || 1;
        await prisma.clauseRevision.create({
            data: {
                clauseId,
                version: lastVersion + 1,
                text: revised_text,
                reason: "AI Thinking Re-draft",
                explanation: { reasoning: fullReasoning },
                actorId: "a1d2m3i4-n5a6-l7e8-x9d0-c1o2u3r4t5e6" // CivicFlow AI systemic ID
            }
        });

        // 4. Update the Clause main text
        await prisma.clause.update({
            where: { id: clauseId },
            data: { 
                text: revised_text,
                statusPartyA: 'PENDING',
                statusPartyB: 'PENDING'
            }
        });

        console.log(`[NegotiationWorker] Successfully re-drafted clause ${clauseId} using Thinking Engine.`);
    }

    if (action === 'approve') {
        await prisma.clause.update({
            where: { id: clauseId },
            data: { statusPartyA: 'APPROVED', statusPartyB: 'APPROVED' }
        });
    }

    if (action === 'reject') {
        await prisma.clause.update({
            where: { id: clauseId },
            data: { statusPartyA: 'REJECTED', statusPartyB: 'REJECTED' }
        });
    }

}, { connection } as any);

negotiationWorker.on('failed', (job, err) => {
    console.error(`[NegotiationWorker] Job ${job?.id} failed:`, err);
});
