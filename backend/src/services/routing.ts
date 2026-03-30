import { PrismaClient, RequestType, Urgency } from '@prisma/client';
import { notifyTicketGenerated, notifyTicketUpdate } from './notification';

const prisma = new PrismaClient();

export async function createTicketAndRoute(
  organizationId: string,
  requesterId: string,
  extractedData: {
    request_type: RequestType;
    amount?: number | null;
    urgency: Urgency;
    category?: string;
    rawText: string;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED';
  }
) {
  // 1. Fetch Routing Rule for the specific request type
  const rule = await prisma.routingRule.findFirst({
    where: {
      organizationId,
      requestType: extractedData.request_type
    }
  });

  if (!rule) {
    throw new Error(`No routing rule found for ${extractedData.request_type}`);
  }

  // 2. Find eligible approver based on role requirement
  const approver = await prisma.user.findFirst({
    where: {
      organizationId,
      role: rule.approverRole
    }
  });

  if (!approver) {
    throw new Error(`No eligible approver found for role ${rule.approverRole}`);
  }

  // 3. Create Ticket and Initial Approval Step
  const ticket = await prisma.ticket.create({
    data: {
      organizationId,
      requesterId,
      type: extractedData.request_type,
      amount: extractedData.amount,
      urgency: extractedData.urgency,
      category: extractedData.category,
      rawText: extractedData.rawText,
      status: extractedData.status || 'PENDING',
      // Create the approval relation
      approvals: {
        create: {
          approverId: approver.id,
          stepIndex: 1
        }
      },
      // Initialize SLA timer event
      slaEvents: {
        create: {
          stepIndex: 1
        }
      }
    },
    include: {
      approvals: true,
      slaEvents: true
    }
  });

  // Notify stakeholders
  await notifyTicketGenerated(ticket.id, ticket.type, ticket.urgency).catch(err => {
    console.error('Failed to send ticket generation notification:', err);
  });

  return ticket;
}

export async function escalateTicket(ticketId: string, currentStepIndex: number) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { organization: true }
  });

  if (!ticket) return null;

  const rule = await prisma.routingRule.findFirst({
    where: {
      organizationId: ticket.organizationId,
      requestType: ticket.type
    }
  });

  if (rule?.fallbackRole) {
    const fallbackApprover = await prisma.user.findFirst({
      where: {
        organizationId: ticket.organizationId,
        role: rule.fallbackRole
      }
    });

    if (fallbackApprover) {
      await prisma.approval.create({
        data: {
          ticketId,
          approverId: fallbackApprover.id,
          stepIndex: currentStepIndex + 1
        }
      });
      const updatedTicket = await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: 'ESCALATED' }
      });
      // Notify stakeholders
      await notifyTicketUpdate(ticketId, 'ESCALATED').catch(err => {
        console.error('Failed to send ticket escalation notification:', err);
      });
      return updatedTicket;
    }
  }
  return null;
}
