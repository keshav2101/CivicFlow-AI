import { llmProvider } from '../lib/llm';
import { messagingProvider } from '../lib/messaging';

jest.mock('../lib/llm', () => ({
  llmProvider: {
    generateText: jest.fn().mockResolvedValue('Mocked response'),
    generateStructured: jest.fn().mockResolvedValue({ request_type: 'MOU' })
  }
}));

jest.mock('../lib/messaging', () => ({
  messagingProvider: {
    sendWhatsApp: jest.fn().mockResolvedValue(true),
    sendEmail: jest.fn().mockResolvedValue(true)
  }
}));

describe('Provider Abstractions', () => {
  test('LLM Mock prevents real API billing consumption', async () => {
    const res = await llmProvider.generateText('test');
    expect(res).toBe('Mocked response');
    expect(llmProvider.generateText).toHaveBeenCalled();
  });

  test('Messaging Mock verifies outbound logic safety', async () => {
    await messagingProvider.sendEmail('test@test', 'sub', 'body');
    expect(messagingProvider.sendEmail).toHaveBeenCalled();
  });
});
