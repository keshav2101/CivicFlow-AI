import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Modernized Gemini Engine with Thinking & Grounding
 * Primarily used for deep policy analysis and complex negotiations.
 */
const client = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY || '',
});

// Primary: User's requested Gemini 3. Fallback: Stable 2.0 Thinking.
const DEFAULT_MODEL = "gemini-3-flash-preview";
const FALLBACK_MODEL = "gemini-2.0-flash-thinking-exp";

export interface ThinkingResult {
    text: string;
    thoughts: string;
    groundingMetadata?: any;
}

export async function generateWithThinking(prompt: string, modelId: string = DEFAULT_MODEL): Promise<ThinkingResult> {
    try {
        console.log(`[Thinking Engine] Generating with ${modelId}...`);
        
        const response = await client.models.generateContent({
            model: modelId,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                tools: [{ googleSearch: {} }], // Enable grounding
                thinkingConfig: {
                    includeThoughts: true,
                    // Use thinkingBudget as the standard reasoning parameter for current exp models
                    thinkingBudget: 4000 
                }
            } as any // Cast to any to bypass preview type mismatches
        });

        // The modern SDK returns thoughts in the 'parts' or metadata depending on the model.
        let text = "";
        let thoughts = "";

        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if ((part as any).thought) {
                    thoughts += part.text + "\n";
                } else {
                    text += part.text;
                }
            }
        }

        return { 
            text: text || (response as any).text || "", 
            thoughts: thoughts || "No explicit thoughts recorded.",
            groundingMetadata: response.candidates?.[0]?.groundingMetadata
        };

    } catch (error: any) {
        if (error.message.includes('404') && modelId === DEFAULT_MODEL) {
            console.warn(`[Thinking Engine] Gemini 3 Preview not found. Falling back to 2.0 Thinking Exp...`);
            return generateWithThinking(prompt, FALLBACK_MODEL);
        }
        console.error('[Thinking Engine] Fatal Error:', error);
        throw error;
    }
}
