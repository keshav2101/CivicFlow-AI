import { messagingProvider } from '../../lib/messaging';

export class DispatcherService {
  static async sendApprovalNotification(approverEmail: string, ticketId: string, channel: 'WHATSAPP' | 'EMAIL') {
    const link = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/ticket/${ticketId}`;
    const text = `Action Required: You have a new ticket ${ticketId} awaiting review. Link: ${link}`;

    try {
      if (channel === 'WHATSAPP') {
        await messagingProvider.sendWhatsApp(approverEmail, text);
      } else {
        await messagingProvider.sendEmail(approverEmail, `Action Required: Ticket ${ticketId}`, text);
      }
      return true;
    } catch (e) {
      console.error(`[DispatcherService] Delivery failed! Retrying logic triggered...`, e);
      throw e; // To be handled by BullMQ retry mechanisms organically
    }
  }

  static async sendStatusUpdate(requesterEmail: string, status: string, ticketId: string) {
    const text = `Your ticket ${ticketId} is now: ${status}`;
    await messagingProvider.sendEmail(requesterEmail, `Status Update: ${ticketId}`, text);
  }
}
