import { NormalizedEvent } from './types';
import { randomUUID } from 'crypto';

export class WhatsAppAdapter {
  static parsePayload(body: any): NormalizedEvent {
    return {
      id: randomUUID(),
      channel: 'WHATSAPP',
      senderId: body.From,
      rawText: body.Body || '',
      mediaUrls: body.MediaUrl0 ? [body.MediaUrl0] : [],
      timestamp: new Date()
    };
  }

  // To be used by the multi-channel dispatcher later
  static async sendDeliveryAck(to: string) {
    console.log(`[WhatsApp Adapter] Delivering ack to ${to}`);
  }
}
