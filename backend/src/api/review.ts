import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { negotiationQueue } from '../workers/queues';
import { notifyTicketUpdate } from '../services/notification';

const prisma = new PrismaClient();
const router = Router();

router.get('/tickets', async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        requester: true,
        organization: true,
        approvals: {
          include: {
            approver: true
          }
        },
        documents: {
          include: {
            clauses: {
              include: {
                revisions: {
                  orderBy: { version: 'desc' }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/approve', async (req, res) => {
  try {
    const { ticketId, approverId, stepIndex } = req.body;
    const approval = await prisma.approval.findFirst({ where: { ticketId, approverId, stepIndex } });
    if (!approval) return res.status(404).send('Approval step not found');
    
    await prisma.approval.update({ where: { id: approval.id }, data: { status: 'APPROVED' } });
    await prisma.ticket.update({ where: { id: ticketId }, data: { status: 'APPROVED' } });
    
    // Notify stakeholders
    await notifyTicketUpdate(ticketId, 'APPROVED').catch(err => {
      console.error('Failed to send ticket update notification:', err);
    });

    res.status(200).send('Approved successfully');
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

router.post('/reject', async (req, res) => {
  try {
    const { ticketId, approverId, stepIndex, feedback } = req.body;
    const approval = await prisma.approval.findFirst({ where: { ticketId, approverId, stepIndex } });
    if (!approval) return res.status(404).send('Approval step not found');
    
    await prisma.approval.update({ where: { id: approval.id }, data: { status: 'REJECTED', feedback } });
    await prisma.ticket.update({ where: { id: ticketId }, data: { status: 'REJECTED' } });
    
    // Notify stakeholders
    await notifyTicketUpdate(ticketId, 'REJECTED').catch(err => {
      console.error('Failed to send ticket update notification:', err);
    });

    res.status(200).send('Rejected successfully');
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

router.post('/clause', async (req, res) => {
  try {
    const { clauseId, partyId, action, constraints } = req.body;
    
    // Async offload to Worker to rewrite with LLM
    await negotiationQueue.add('rewrite-clause', {
      clauseId, partyId, action, constraints
    }, { jobId: `neg-${clauseId}-${Date.now()}` });
    
    res.status(202).json({ success: true, message: "Clause feedback processing successfully enqueued." });
  } catch (error) {
    console.error('Error handling clause feedback:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
