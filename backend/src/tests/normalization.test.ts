import { WhatsAppAdapter } from '../channels/whatsapp.adapter';
import { EmailAdapter } from '../channels/email.adapter';

describe('Channel Adapters', () => {
  test('WhatsApp Adapter normalizes correctly', () => {
    const payload = { From: '+1234567890', Body: 'Hello world', MediaUrl0: 'http://img' };
    const event = WhatsAppAdapter.parsePayload(payload);
    expect(event.channel).toBe('WHATSAPP');
    expect(event.senderId).toBe('+1234567890');
    expect(event.rawText).toBe('Hello world');
    expect(event.mediaUrls).toContain('http://img');
  });

  test('Email Adapter normalizes correctly', () => {
    const payload = { from: 'test@org.com', subject: 'Invoice', text: 'Attached invoice' };
    const event = EmailAdapter.parsePayload(payload);
    expect(event.channel).toBe('EMAIL');
    expect(event.senderId).toBe('test@org.com');
    expect(event.metadata?.subject).toBe('Invoice');
  });
});
