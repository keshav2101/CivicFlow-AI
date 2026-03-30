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

/**
 * Core Think Engine powered by Gemini 1.5 Pro
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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const prompt = `
    You are an expert operations administrator for an organization. 
    Analyze the following unstructured message and extract structured data.
    
    TICKET TYPES:
    1. REIMBURSEMENT (Money back for spent items)
    2. INVOICE (Vendor bill for future payment)
    3. MOU (Legal agreement/contract between parties)
    4. GRIEVANCE (Complaint or issue report)
    
    SCHEMAS:
    - REIMBURSEMENT: { amount, currency, items }
    - INVOICE: { amount, vendor, dueDate }
    - MOU: { partyB, duration, keyTerms }
    - GRIEVANCE: { category, intensity }
    
    MESSAGE: "${text}"
    
    RESPONSE FORMAT: JSON ONLY.
    Include fields: type (Enum), amount (Float or null), category (String), urgency (LOW|MEDIUM|HIGH), explanation (Reasoning for classification).
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonStr = response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error in classifyAndExtract (Gemini):', error);
    throw error;
  }
}
