import { NormalizedEvent } from './types';
import { randomUUID } from 'crypto';

export class TelegramAdapter {
  static parsePayload(body: any): NormalizedEvent {
    // Standard Telegram Bot API Message structure
    const message = body.message || body.edited_message;
    
    return {
      id: `tg-${message.message_id}-${randomUUID()}`,
      channel: 'TELEGRAM',
      senderId: message.from.id.toString(),
      senderName: `${message.from.first_name || ''} ${message.from.last_name || ''}`.trim(),
      rawText: message.text || message.caption || '',
      mediaUrls: message.photo ? [message.photo[message.photo.length - 1].file_id] : [],
      voiceId: message.voice?.file_id || null,
      timestamp: new Date(message.date * 1000)
    };
  }

  static async sendMessage(chatId: string, text: string) {
    console.log(`[Telegram Adapter] Sending message to ${chatId}: ${text}`);
    // In demo mode, we just log. Real implementation would use fetch() or a library.
  }
}
