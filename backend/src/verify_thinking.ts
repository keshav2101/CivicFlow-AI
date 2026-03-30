import { generateWithThinking } from './services/genai';
import dotenv from 'dotenv';
dotenv.config();

async function testThinking() {
    console.log("🚀 Testing Gemini Thinking Engine Upgrade...");
    try {
        const result = await generateWithThinking("Verify this vendor: ACME Corp Cloud Services, $400 monthly.");
        console.log("✅ Success!");
        console.log("Text:", result.text);
        console.log("Thoughts:", result.thoughts);
        if (result.groundingMetadata) {
            console.log("Grounding Metadata Found (Search worked!)");
        }
    } catch (e: any) {
        console.error("❌ Test Failed:", e.message);
    }
}

testThinking();
