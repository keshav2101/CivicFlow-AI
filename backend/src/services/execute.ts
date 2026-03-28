import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function generateDocument(ticketId: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { organization: true, requester: true }
  });

  if (!ticket) throw new Error("Ticket not found");

  const templateFile = path.join(__dirname, '..', 'templates', `${ticket.type.toLowerCase()}.template.json`);
  if (!fs.existsSync(templateFile)) throw new Error("Template file not found in registry");

  const templateStr = fs.readFileSync(templateFile, 'utf-8');
  const template = JSON.parse(templateStr);

  // Template binding engine
  let content = template.content
    .replace('{{organization}}', ticket.organization.name)
    .replace('{{requester}}', ticket.requester.name || ticket.requester.email)
    .replace('{{amount}}', ticket.amount?.toString() || 'N/A')
    .replace('{{category}}', ticket.category || 'General');

  // Heuristic validation against missing fields
  if (content.includes('{{') && content.includes('}}')) {
    throw new Error(`Missing fields in document binding. Required variables: ${template.variables.join(', ')}`);
  }

  const document = await prisma.document.create({
    data: {
      ticketId: ticket.id,
      content,
      status: 'DRAFT',
      metadata: { templateVersion: template.version } // Storing template version dynamically payload 
    }
  });

  // If MoU, trigger clause splitting logic
  if (ticket.type === 'MOU') {
    const clausesText = content.split('\n\n').filter((c: string) => c.trim().length > 0);
    for (const text of clausesText) {
      await prisma.clause.create({
        data: {
          documentId: document.id,
          text,
          statusPartyA: 'PENDING',
          statusPartyB: 'PENDING',
          revisions: {
            create: [{
              version: 1,
              text
            }]
          }
        }
      });
    }
  }

  return document;
}
