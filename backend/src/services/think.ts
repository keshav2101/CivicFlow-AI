import { classifyAndExtract } from './ai';
import { PrismaClient, RequestType, Urgency } from '@prisma/client';

const prisma = new PrismaClient();

export interface ThinkResult {
  type: RequestType;
  amount: number | null;
  category: string;
  urgency: Urgency;
  explanation: string;
  parties?: string[];
  suggestedAction?: 'APPROVE' | 'REJECT' | 'ESCALATE' | 'REVIEW';
}

/**
 * Orchestrates the "Think" phase of a ticket's lifecycle.
 * Involves classification, extraction, and initial policy evaluation.
 */
export async function runThinkPipeline(text: string, orgId: string): Promise<ThinkResult> {
  console.log(`[Think Engine] Processing message for Org ${orgId}...`);
  
  // 1. LLM Extraction & Classification
  const rawAiResult = await classifyAndExtract(text);
  
  // 2. Normalization
  const result: ThinkResult = {
    type: (rawAiResult.type || 'GRIEVANCE') as RequestType,
    amount: rawAiResult.amount ? parseFloat(rawAiResult.amount) : null,
    category: rawAiResult.category || 'General',
    urgency: (rawAiResult.urgency || 'MEDIUM') as Urgency,
    explanation: rawAiResult.explanation || 'Analyzed via Gemini Generative Pipeline.',
    parties: rawAiResult.parties || []
  };

  // 3. Policy Engine (Hard Guardrails)
  const policyAction = await evaluatePolicies(result, orgId);
  result.suggestedAction = policyAction;

  return result;
}

/**
 * Evaluates extracted data against organization-specific hard policies.
 * Implementing 'Agentic Automation': Simple tickets < $20 are auto-approved.
 */
async function evaluatePolicies(data: ThinkResult, orgId: string): Promise<ThinkResult['suggestedAction']> {
  // 1. Agentic Automation: Auto-approve simple, low-value reimbursements
  if (data.type === 'REIMBURSEMENT' && data.amount && data.amount < 20) {
    console.log(`[PolicyEngine] Auto-approving simple reimbursement: $${data.amount}`);
    return 'APPROVE';
  }

  // 2. High Value Escalation: Over $5000 always needs Head of Operations
  if (data.amount && data.amount > 5000) {
    console.log(`[PolicyEngine] Escalating high-value ${data.type}: $${data.amount}`);
    return 'ESCALATE';
  }

  // 3. Complex Requests: MoUs and Grievances ALWAYS require human review
  if (data.type === 'MOU' || data.type === 'GRIEVANCE') {
    return 'REVIEW';
  }

  // Default: Human Review
  return 'REVIEW';
}
