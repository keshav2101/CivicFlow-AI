export interface NormalizedPayload {
  channel: 'WHATSAPP' | 'EMAIL' | 'WEB';
  senderId: string;
  rawText: string;
  mediaUrls?: string[];
}

export function normalizeWhatsAppPayload(body: any): NormalizedPayload {
  return {
    channel: 'WHATSAPP',
    senderId: body.From,
    rawText: body.Body || '',
    mediaUrls: body.MediaUrl0 ? [body.MediaUrl0] : []
  };
}

export function normalizeEmailPayload(body: any): NormalizedPayload {
  return {
    channel: 'EMAIL',
    senderId: body.from,
    rawText: body.text || body.html || '',
  };
}
