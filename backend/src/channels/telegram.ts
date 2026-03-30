import TelegramBot from 'node-telegram-bot-api';
import { IngestionService } from '../services/ingestion';
import { NormalizedEvent } from './types';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

export class TelegramAdapter {
  private static bot: TelegramBot | null = null;

  static async init() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      console.warn('[TelegramAdapter] TELEGRAM_BOT_TOKEN not set. Telegram ingestion disabled.');
      return;
    }

    this.bot = new TelegramBot(token, { polling: true });

    // Ensure downloads dir exists
    const downloadDir = path.join(process.cwd(), 'downloads');
    if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);

    console.log('[TelegramAdapter] Telegram bot initialized and polling...');

    this.bot.on('message', async (msg) => {
      try {
        if (!msg.text && !msg.voice) return;

        console.log(`[TelegramAdapter] Received message from ${msg.chat.id}`);
        
        const event: NormalizedEvent = {
          id: `tg-${msg.message_id}-${msg.chat.id}-${Date.now()}`,
          channel: 'TELEGRAM',
          senderId: msg.chat.id.toString(),
          senderName: msg.from?.username || msg.from?.first_name || 'Unknown',
          rawText: msg.text || '',
          timestamp: new Date(msg.date * 1000),
          metadata: {
            chatType: msg.chat.type,
            hasVoice: !!msg.voice
          }
        };


        // Handle Voice Memo Download
        if (msg.voice && this.bot) {
          try {
            const filePath = await this.bot.downloadFile(msg.voice.file_id, path.join(process.cwd(), 'downloads'));
            event.voicePath = filePath;
            event.rawText = "[Voice Memo Received]";
            console.log(`[TelegramAdapter] Downloaded voice memo to ${filePath}`);
          } catch (dlError) {
            console.error('[TelegramAdapter] Failed to download voice file:', dlError);
          }
        }

        await IngestionService.ingestEvent(event);
      } catch (error) {
        console.error('[TelegramAdapter] Error processing telegram message:', error);
      }
    });

    this.bot.on('polling_error', (error: any) => {
      // Specifically target 404/Unauthorized to stop the bot and prevent spam
      if (error.code === 'ETELEGRAM' && error.message.includes('404')) {
        console.error('[TelegramAdapter] Invalid Bot Token (404). Stopping polling to prevent log spam.');
        this.bot?.stopPolling();
      } else {
        console.warn('[TelegramAdapter] Telegram polling warning:', error.message || error);
      }
    });

    this.bot.on('error', (error) => {
      console.error('[TelegramAdapter] Telegram bot critical error:', error);
    });
  }

  static getBot() {
    return this.bot;
  }
}
