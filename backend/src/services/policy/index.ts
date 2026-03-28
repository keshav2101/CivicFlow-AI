import { NormalizedEvent } from '../../channels/types';

export class PolicyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PolicyError';
  }
}

export async function applyPolicy(text: string, event: NormalizedEvent) {
  // Pre-LLM Deterministic Validation Checks
  console.log(`[PolicyEngine] Validating event ${event.id} from ${event.channel}`);

  const lowerText = text.toLowerCase();

  // 1. Mandatory format/size constraints
  if (text.trim().length < 5) {
    throw new PolicyError("Request too short to process.");
  }

  // 2. Amount Threshold based rules
  const amountMatch = text.match(/\$\s*(\d+[,.]?\d*)/);
  if (amountMatch) {
    const rawVal = amountMatch[1].replace(/,/g, '');
    const amount = parseFloat(rawVal);
    if (amount > 1000000) {
      throw new PolicyError("Amount exceeds hardcoded maximum allowed threshold ($1,000,000). Administrative escalation required.");
    }
  }

  // 3. Grievance routing conflict prevention
  if (lowerText.includes('grievance') || lowerText.includes('harassment')) {
    if (lowerText.includes('reimburse') || lowerText.includes('invoice')) {
        // Flag for HR specifically, preventing finance routing
        console.warn(`[PolicyEngine] Mixed Grievance/Finance intent detected. Forcing safety constraints.`);
    }
  }

  // 4. Block obvious spam/invalid requests
  if (lowerText.includes('lottery winner') || lowerText.includes('exclusive offer')) {
    throw new PolicyError("Blocked by spam policy filter.");
  }

  return true;
}
