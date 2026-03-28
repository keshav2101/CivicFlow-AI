import OpenAI from 'openai';

export interface ILLMProvider {
  generateText(prompt: string, systemContext?: string): Promise<string>;
  generateStructured<T>(prompt: string, schema: any): Promise<T>;
}

export class OpenAILLMProvider implements ILLMProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy_key' });
  }

  async generateText(prompt: string, systemContext: string = "You are a helpful assistant."): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "system", content: systemContext }, { role: "user", content: prompt }]
    });
    return response.choices[0].message?.content || "";
  }

  async generateStructured<T>(prompt: string, schema: any): Promise<T> {
    const response = await this.client.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "system", content: "You must respond strictly in JSON." }, { role: "user", content: `${prompt}\nSchema: ${JSON.stringify(schema)}` }],
      response_format: { type: "json_object" }
    });
    return JSON.parse(response.choices[0].message?.content || "{}") as T;
  }
}

export const llmProvider: ILLMProvider = new OpenAILLMProvider();
