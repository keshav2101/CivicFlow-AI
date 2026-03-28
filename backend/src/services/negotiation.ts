import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
});

export async function submitClauseFeedback(clauseId: string, partyId: string, constraints: string, action: 'APPROVE' | 'REJECT') {
  const clause = await prisma.clause.findUnique({ 
    where: { id: clauseId },
    include: { revisions: true }
  });
  if (!clause) throw new Error("Clause not found");

  // Determine which party is acting (Mock logic: if partyId starts with org_, it's Party A, else Party B)
  const isPartyA = partyId.startsWith('org_');
  
  if (action === 'APPROVE') {
    return prisma.clause.update({
      where: { id: clauseId },
      data: isPartyA ? { statusPartyA: 'APPROVED' } : { statusPartyB: 'APPROVED' }
    });
  }

  // Handle REJECT by triggering LLM redrafting loop
  console.log(`[ClauseNegotiation] Clause ${clauseId} rejected by ${partyId}. Constraints: ${constraints}`);
  
  let newText = clause.text;

  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy_key') {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: "You are a legal negotiator AI. The user rejected a clause and provided constraints. Rewrite ONLY the clause to satisfy the constraint while preserving the original intent." },
          { role: "user", content: `Original Clause: ${clause.text}\nConstraints: ${constraints}` }
        ]
      });
      newText = completion.choices[0].message?.content || newText;
    } catch (err) {
      console.error("[ClauseNegotiation] LLM negotiation failed. Using heuristic fallback.", err);
      newText = `${clause.text} (Amendment: ${constraints})`;
    }
  } else {
    // Local fallback mock
    newText = `${clause.text}\n[AMENDED per feedback: ${constraints}]`;
  }

  const newVersion = (clause.revisions?.length ?? 0) + 2; // initial is 1

  // Clause rejected, we update the status, update the current text, and add a revision
  return prisma.clause.update({
    where: { id: clauseId },
    data: {
      text: newText,
      statusPartyA: 'PENDING', 
      statusPartyB: 'PENDING',
      revisions: {
        create: {
          version: newVersion,
          text: newText,
          reason: constraints,
          actorId: partyId
        }
      }
    }
  });
}
