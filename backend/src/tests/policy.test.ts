import { applyPolicy, PolicyError } from '../services/policy';
import { NormalizedEvent } from '../channels/types';

describe('Policy Engine', () => {
  const baseEvent: NormalizedEvent = {
    id: '123',
    channel: 'WEB',
    senderId: 'user1',
    rawText: '',
    timestamp: new Date()
  };

  test('Rejects short requests', async () => {
    await expect(applyPolicy('hi', baseEvent)).rejects.toThrow(PolicyError);
  });

  test('Blocks amounts over $1M', async () => {
    await expect(applyPolicy('I need $1,500,000 for building', baseEvent)).rejects.toThrow(/Amount exceeds hardcoded maximum/);
  });

  test('Allows valid requests', async () => {
    const res = await applyPolicy('Please reimburse $50 for the team lunch yesterday.', baseEvent);
    expect(res).toBe(true);
  });

  test('Blocks spam', async () => {
    await expect(applyPolicy('Exclusive offer for you to become a lottery winner', baseEvent)).rejects.toThrow(/spam/);
  });
});
