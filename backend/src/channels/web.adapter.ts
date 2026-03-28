import { NormalizedEvent } from './types';
import { randomUUID } from 'crypto';

export class WebAdapter {
  static parsePayload(body: any): NormalizedEvent {
    return {
      id: randomUUID(),
      channel: 'WEB',
      senderId: body.userId || body.email,
      rawText: body.description || '',
      metadata: { category: body.category },
      timestamp: new Date()
    };
  }
}
