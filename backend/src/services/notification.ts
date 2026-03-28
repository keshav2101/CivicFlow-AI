// Mocks for Notification integrations
export async function sendWhatsAppMessage(to: string, message: string) {
  console.log(`[WhatsApp API Mock] Sending to ${to}: ${message}`);
  // Implementation would use Twilio:
  // twilioClient.messages.create({ body: message, from: TWILIO_WHATSAPP_NUMBER, to: `whatsapp:${to}` })
}

export async function sendEmail(to: string, subject: string, body: string) {
  console.log(`[Email API Mock] Sending to ${to} | Subject: ${subject}`);
  // Implementation would use Nodemailer or SendGrid:
  // sgMail.send({ to, from: 'civicflow@org.com', subject, text: body })
}

export async function notifyApprover(approverEmail: string, ticketId: string) {
  const link = `${process.env.FRONTEND_URL}/ticket/${ticketId}`;
  await sendEmail(
    approverEmail, 
    `Action Required: Ticket ${ticketId}`, 
    `You have a new action required on CivicFlow. Please review: ${link}`
  );
}
