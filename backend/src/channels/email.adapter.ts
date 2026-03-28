import { NormalizedEvent } from './types';
import { randomUUID } from 'crypto';

export class EmailAdapter {
  static parsePayload(body: any): NormalizedEvent {
    return {
      id: randomUUID(),
      channel: 'EMAIL',
      senderId: body.from,
      rawText: body.text || body.html || '',
      metadata: { subject: body.subject },
      timestamp: new Date()
    };
  }
}
