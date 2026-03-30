import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mocks for Notification integrations
export async function sendWhatsAppMessage(to: string, message: string) {
  console.log(`[WhatsApp API Mock] Sending to ${to}: ${message}`);
}

export function getHardcodedEmail(role: 'ADMIN' | 'USER' | 'OTHER'): string {
  if (role === 'ADMIN') return 'work.harshilm@gmail.com';
  if (role === 'USER') return 'sk0111@srmist.edu.in';
  return 'vs9129@srmist.edu.in';
}

export async function sendEmail(originalTo: string, subject: string, body: string, forceRole?: 'ADMIN' | 'USER' | 'OTHER') {
  const to = forceRole ? getHardcodedEmail(forceRole) : getHardcodedEmail('OTHER');

  console.log(`[Email API] Intercepted intended recipient: ${originalTo}, routing to hardcoded: ${to} | Subject: ${subject}`);
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("BREVO_API_KEY is not defined. Email will not be sent.");
    return;
  }

  const payload = {
    sender: { name: "CivicFlow Notification", email: "admin@harshilmalhotra.dev" },
    to: [{ email: to }],
    subject: subject,
    htmlContent: body
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      console.error(`Brevo API error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.log(`Brevo API response:`, text);
    } else {
      console.log(`[Email API] Successfully sent to ${to}`);
    }
  } catch (err) {
    console.error(`Failed to send email to ${to}:`, err);
  }
}

export async function notifyApprover(approverEmail: string, ticketId: string) {
  const link = `${process.env.FRONTEND_URL}/ticket/${ticketId}`;
  await sendEmail(
    approverEmail,
    `Action Required: Ticket ${ticketId}`,
    `<p>You have a new action required on CivicFlow. Please review: <a href="${link}">${link}</a></p>`,
    'ADMIN'
  );
}

function getHtmlTemplate(actionTitle: string, ticket: any, frontendUrl: string): string {
  const urgencyColor = ticket.urgency === 'HIGH' ? '#ef4444' : ticket.urgency === 'MEDIUM' ? '#f59e0b' : '#3b82f6';
  
  // Handle Prisma internal JSON type safely
  let explanationHtml = '';
  if (ticket.explanation) {
    let expObj: any = ticket.explanation;
    if (typeof expObj === 'string') {
      try { expObj = JSON.parse(expObj); } catch (e) {}
    }
    const safeReasoning = expObj?.reasoning || expObj?.suggestedAction;
    if (safeReasoning) {
      explanationHtml = `
        <div style="margin-top: 24px;">
          <h4 style="margin-top: 0; margin-bottom: 12px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">AI Agent Analysis / Resolution</h4>
          <div style="background-color: #eef2ff; padding: 16px; border-radius: 8px; color: #3730a3; font-size: 14px; line-height: 1.6; white-space: pre-wrap; border-left: 4px solid #6366f1;">${safeReasoning}</div>
        </div>
      `;
    }
  }

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); color: white; padding: 24px; text-align: center;">
        <h2 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">CivicFlow Update</h2>
      </div>
      
      <div style="padding: 32px; background-color: #ffffff;">
        <h3 style="margin-top: 0; color: #111827; font-size: 20px;">${actionTitle}</h3>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Ticket <strong>#${ticket.id}</strong> requires your attention or has been updated.</p>
        
        <div style="margin-top: 24px; background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; padding: 20px;">
          <h4 style="margin-top: 0; margin-bottom: 16px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Ticket Details</h4>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; width: 35%;">Type</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 500;">${ticket.type || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Category</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 500;">${ticket.category || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Urgency</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: ${urgencyColor};">${ticket.urgency || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Status</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="background-color: #dbeafe; color: #1e40af; padding: 4px 10px; border-radius: 9999px; font-weight: 600; font-size: 12px;">${ticket.status || 'N/A'}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Amount</td>
              <td style="padding: 8px 0; color: #111827; font-weight: 500;">${ticket.amount ? '$' + ticket.amount : 'N/A'}</td>
            </tr>
          </table>
        </div>

        <div style="margin-top: 24px;">
          <h4 style="margin-top: 0; margin-bottom: 12px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Original Request</h4>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; color: #374151; font-size: 14px; line-height: 1.6; white-space: pre-wrap; border-left: 4px solid #9ca3af;">${ticket.rawText || 'No description provided.'}</div>
        </div>
        
        ${explanationHtml}

        <div style="text-align: center; margin-top: 40px; margin-bottom: 10px;">
          <a href="${frontendUrl}/ticket/${ticket.id}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3); transition: all 0.2s;">View in Dashboard</a>
        </div>
      </div>
      
      <div style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px; text-align: center;">
        <p style="margin: 0; color: #9ca3af; font-size: 12px;">&copy; ${new Date().getFullYear()} CivicFlow. This is an automated notification.</p>
      </div>
    </div>
  `;
}

export async function notifyTicketGenerated(ticketId: string, type: string, urgency: string) {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) return;

  const subject = `New Ticket Generated: ${ticket.category || ticket.type}`;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const body = getHtmlTemplate(`New Ticket Generated`, ticket, frontendUrl);

  // Notify user
  await sendEmail('user', subject, body, 'USER');
  // Notify admin
  await sendEmail('admin', subject, body, 'ADMIN');
}

export async function notifyTicketUpdate(ticketId: string, status: string) {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) return;

  const subject = `Ticket Update: ${status}`;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const body = getHtmlTemplate(`Ticket Status Updated`, ticket, frontendUrl);

  // Notify user
  await sendEmail('user', subject, body, 'USER');
  // Notify admin
  await sendEmail('admin', subject, body, 'ADMIN');
}

