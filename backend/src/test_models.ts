import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function list() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use any, doesn't matter
  
  try {
    // There isn't a direct listModels in the main class easily, 
    // but we can try to hit the v1 endpoint or just try a few fallback IDs.
    console.log("Checking available model IDs...");
    
    // Attempting a simple generation with a very basic model to see if the key works
    const testModels = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
    
    for (const m of testModels) {
        try {
            const testModel = genAI.getGenerativeModel({ model: m });
            await testModel.generateContent("test");
            console.log(`✅ Model found and working: ${m}`);
        } catch (e: any) {
            console.log(`❌ Model failed: ${m} - ${e.message}`);
        }
    }
  } catch (error) {
    console.error("List failed:", error);
  }
}

list();
