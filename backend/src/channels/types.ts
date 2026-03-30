export interface NormalizedEvent {
  id: string; // generated uuid
  channel: 'WHATSAPP' | 'EMAIL' | 'WEB' | 'TELEGRAM';
  senderId: string;
  senderName?: string;
  rawText: string;
  mediaUrls?: string[];
  voiceId?: string | null;
  voicePath?: string | null;
  metadata?: Record<string, any>;
  timestamp: Date;
}
