import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function optimizeRoutingRules() {
  console.log("[AdaptiveLearning] Running transparent heuristic learning cycle...");
  
  // 1. SLA Breach Escalation Analysis
  const breachedEvents = await prisma.sLAEvent.findMany({
    where: { breached: true },
    include: { ticket: true }
  });

  const breachesByType: Record<string, number> = {};
  for (const event of breachedEvents) {
    const type = event.ticket.type;
    breachesByType[type] = (breachesByType[type] || 0) + 1;
  }

  for (const [type, count] of Object.entries(breachesByType)) {
    if (count > 3) {
       const rule = await prisma.routingRule.findFirst({ where: { requestType: type as any } });
       if (rule) {
         console.log(`[AdaptiveLearning] Increasing SLA Threshold for ${type} due to recurrent breaches.`);
         
         const ruleBefore = { ...rule };
         const ruleAfter = await prisma.routingRule.update({
           where: { id: rule.id },
           data: { slaThresholdMinutes: rule.slaThresholdMinutes + 60 }
         });

         // Record the learning event for Explainability transparency
         await prisma.learningEvent.create({
           data: {
             organizationId: rule.organizationId,
             ruleBefore: ruleBefore as any,
             ruleAfter: ruleAfter as any,
             reasonForChange: `SLA Threshold dynamically increased by +60m due to ${count} repeated SLA breaches.`,
             confidenceScore: 0.95
           }
         });
       }
    }
  }

  if (breachedEvents.length > 0) {
    await prisma.sLAEvent.deleteMany({
      where: { id: { in: breachedEvents.map(e => e.id) } }
    });
  }

  // 2. Reassignment & Deputy Routing Detection
  const reassignmentLogs = await prisma.auditLog.findMany({
    where: { action: 'TICKET_ESCALATED' }
  });

  if (reassignmentLogs.length > 10) {
    console.log(`[AdaptiveLearning] Analyzed ${reassignmentLogs.length} recent escalations. High Deputy Routing identified.`);
    const firstOrg = reassignmentLogs[0]?.organizationId;
    if (firstOrg) {
        await prisma.learningEvent.create({
            data: {
                organizationId: firstOrg,
                reasonForChange: `System noticed ${reassignmentLogs.length} escalation routes deployed. Recommending structural promotion of Fallback Roles into Primary Roles.`,
                confidenceScore: 0.88,
                ruleBefore: {},
                ruleAfter: {}
            }
        });
    }
  }

  console.log("[AdaptiveLearning] Cycle complete.");
}
