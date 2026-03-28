import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ExplainabilityLayer {
  static async logTicketExplanation(ticketId: string, reasoning: any) {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        explanation: reasoning
      }
    });
  }

  static async getTicketExplanation(ticketId: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { explanation: true }
    });
    return ticket?.explanation;
  }

  static async getClauseExplanation(clauseId: string) {
    const clause = await prisma.clause.findUnique({
      where: { id: clauseId },
      include: { revisions: true }
    });
    return clause?.revisions.map(r => ({
      version: r.version,
      reasonForChange: r.reason,
      aiDiffExplanation: r.explanation
    }));
  }
}
