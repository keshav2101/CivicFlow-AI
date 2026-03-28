export interface NormalizedEvent {
  id: string; // generated uuid
  channel: 'WHATSAPP' | 'EMAIL' | 'WEB';
  senderId: string;
  rawText: string;
  mediaUrls?: string[];
  metadata?: Record<string, any>;
  timestamp: Date;
}
