import { GoogleGenerativeAI } from '@google/generative-ai';
const { DeepgramClient } = require('@deepgram/sdk');
import fs from 'fs';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
const deepgram = new DeepgramClient(process.env.DEEPGRAM_API_KEY || 'dummy_key');

/**
 * Transcribes audio file using Deepgram Aura/Nova-2
 */
export async function transcribeAudio(audioFilePath: string): Promise<string> {
  if (!process.env.DEEPGRAM_API_KEY) {
    console.warn("DEEPGRAM_API_KEY is not set. Returning dummy transcription.");
    return "This is a mock transcription of the incoming audio (Demo Mode).";
  }
  
  try {
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      fs.readFileSync(audioFilePath),
      {
        model: 'nova-2',
        smart_format: true,
      }
    );

    if (error) throw error;
    return result.results.channels[0].alternatives[0].transcript;
  } catch (error) {
    console.error('Error in transcribeAudio (Deepgram):', error);
    throw error;
  }
}

import { generateWithThinking } from './genai';

/**
 * Core Think Engine powered by Gemini 1.5/2.0/3.0 Thinking Preview
 */
export async function classifyAndExtract(text: string) {
    if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY not set. Returning mock extracted data.");
        return {
            type: "REIMBURSEMENT",
            amount: 15.50,
            category: "Facilities",
            urgency: "MEDIUM",
            explanation: "Mocked extraction for local dev (No API key found)."
        };
    }

  try {
    const prompt = `
    You are an expert operations administrator. Analyze: "${text}"
    
    RESPONSE FORMAT: JSON ONLY.
    Include: type (REIMBURSEMENT|INVOICE|MOU|GRIEVANCE), amount (Float/null), category (String), urgency (LOW|MEDIUM|HIGH), explanation (Reasoning).
    `;

    const { text: jsonResponse, thoughts, groundingMetadata } = await generateWithThinking(prompt);
    const jsonStr = jsonResponse.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(jsonStr);
    
    // Enrich with thinking/grounding data
    parsed.explanation = `${parsed.explanation || ''} [Thinking: ${thoughts}] ${groundingMetadata ? '[Source: Google Search]' : ''}`.trim();
    
    return parsed;
  } catch (error: any) {
    console.error('Error in classifyAndExtract (Modern GenAI):', error.message);
    
    // --- Fail-Safe Deterministic Fallback for Demo/Testing ---
    const lowerText = text.toLowerCase();
    if (lowerText.includes('reimbursement') || lowerText.includes('refund')) {
        const amountMatch = text.match(/\d+(\.\d+)?/);
        const amount = amountMatch ? parseFloat(amountMatch[0]) : 15.00;
        return {
            type: "REIMBURSEMENT",
            amount: amount,
            category: "Expense",
            urgency: "MEDIUM",
            explanation: `(AI Fallback) System identified reimbursement for $${amount}. ${error.message.includes('404') ? 'Thinking Engine 404 - using local policy.' : ''}`
        };
    }
    if (lowerText.includes('invoice') || lowerText.includes('bill') || lowerText.includes('$')) {
        const amountMatch = text.match(/\d+[,.]?\d+/);
        const amount = amountMatch ? parseFloat(amountMatch[0].replace(',','')) : 500.00;
        return {
            type: "INVOICE",
            amount: amount,
            category: "Finance",
            urgency: "HIGH",
            explanation: `(AI Fallback) System identified invoice for $${amount}.`
        };
    }
    if (lowerText.includes('mou') || lowerText.includes('agreement') || lowerText.includes('contract')) {
        return {
            type: "MOU",
            amount: null,
            category: "Legal",
            urgency: "MEDIUM",
            explanation: "(AI Fallback) System identified partnership/agreement document."
        };
    }
    
    // Default fallback
    return {
        type: "GRIEVANCE",
        amount: null,
        category: "General",
        urgency: "LOW",
        explanation: "(AI Fallback) Defaulting to general grievance."
    };
  }
}
