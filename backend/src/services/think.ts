import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
});

const extractionSchema = {
  type: "object",
  properties: {
    request_type: { type: "string", enum: ["REIMBURSEMENT", "INVOICE", "MOU", "GRIEVANCE"] },
    amount: { type: "number", description: "The financial amount if applicable" },
    parties: { type: "array", items: { type: "string" }, description: "Names of parties involved, useful for MoUs" },
    urgency: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
    category: { type: "string", description: "A short category descriptor" },
  },
  required: ["request_type", "urgency"]
};

export async function classifyAndExtract(text: string) {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy_key') {
    return fallbackHeuristics(text);
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "You are an operations classification AI. Extract structured data from the user request." },
        { role: "user", content: text }
      ],
      functions: [{ name: "extract_info", parameters: extractionSchema }],
      function_call: { name: "extract_info" }
    });

    const output = response.choices[0].message?.function_call?.arguments;
    if (output) {
      return JSON.parse(output);
    }
  } catch (err) {
    console.error("LLM Extraction failed, falling back to heuristics:", err);
  }

  return fallbackHeuristics(text);
}

function fallbackHeuristics(text: string) {
  const lowerText = text.toLowerCase();
  let request_type = "GRIEVANCE"; // default
  let amount = null;
  let urgency = "MEDIUM";

  if (lowerText.includes('reimburse') || lowerText.includes('refund') || lowerText.includes('expense')) {
    request_type = "REIMBURSEMENT";
  } else if (lowerText.includes('invoice') || lowerText.includes('bill')) {
    request_type = "INVOICE";
  } else if (lowerText.includes('mou') || lowerText.includes('memorandum') || lowerText.includes('agreement')) {
    request_type = "MOU";
  }

  // Extract simple dollar amounts
  const amountMatch = text.match(/\$?\d+(?:\.\d{2})?/);
  if (amountMatch) {
    amount = parseFloat(amountMatch[0].replace('$', ''));
  }

  if (lowerText.includes('urgent') || lowerText.includes('asap')) {
    urgency = "HIGH";
  }

  return { request_type, amount, parties: [], urgency, category: "Fallback" };
}
