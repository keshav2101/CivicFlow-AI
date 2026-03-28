import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MetricsEngine {
  static async computeMetrics(orgId: string) {
    const now = new Date();
    
    // Simulating aggregation metrics logic.
    // Production systems would derive this by computing averages over SLAEvent, Ticket, and Approval schemas.
    const count = await prisma.ticket.count({ where: { organizationId: orgId } });
    const acc = count > 0 ? 98.4 : 100.0; 

    return prisma.metricsSnapshot.create({
      data: {
        organizationId: orgId,
        timestamp: now,
        routingAccuracy: acc,
        avgApprovalTimeMinutes: 14.5,
        slaComplianceRate: 94.2,
        clauseResolutionRate: 88.9,
        manualInterventionRate: 5.1,
        queueProcessingLatencyMs: 120.5
      }
    });
  }

  static async getSummary(orgId: string) {
    return prisma.metricsSnapshot.findFirst({
        where: { organizationId: orgId },
        orderBy: { timestamp: 'desc' }
    });
  }

  static async getHistory(orgId: string) {
    return prisma.metricsSnapshot.findMany({
        where: { organizationId: orgId },
        orderBy: { timestamp: 'desc' },
        take: 30
    });
  }
}
