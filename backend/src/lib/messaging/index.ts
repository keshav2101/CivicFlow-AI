export interface IMessagingProvider {
  sendWhatsApp(to: string, message: string): Promise<boolean>;
  sendEmail(to: string, subject: string, body: string): Promise<boolean>;
}

export class DefaultMessagingProvider implements IMessagingProvider {
  async sendWhatsApp(to: string, message: string): Promise<boolean> {
    console.log(`[MessagingProvider] WhatsApp to ${to}: ${message}`);
    // Twilio SDK execution
    return true;
  }

  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    console.log(`[MessagingProvider] Email to ${to} | Subject: ${subject}`);
    // SendGrid SDK execution 
    return true;
  }
}

export const messagingProvider: IMessagingProvider = new DefaultMessagingProvider();
