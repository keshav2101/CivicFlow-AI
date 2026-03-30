import { PrismaClient, Role, RequestType, Urgency } from '@prisma/client';

const prisma = new PrismaClient();

async function runSeed() {
  console.log("[Seeder] Truncating database...");
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "AuditLog", "ClauseRevision", "Clause", "Document", "SLAEvent", "Approval", "Ticket", "LearningEvent", "MetricsSnapshot", "RoutingRule", "User", "Organization" CASCADE`);

  console.log("[Seeder] Creating dummy organization and users...");
  const org = await prisma.organization.create({
    data: { name: "University Demo Core", tenantId: "demo_1" }
  });

  const user = await prisma.user.create({
    data: { id: "35827b4b-42c5-4a8f-bb89-73871db15323", email: "student@demo.com", name: "Demo Student", role: Role.USER, organizationId: org.id }
  });

  const approverFinance = await prisma.user.create({
    data: { id: "13eb7ca6-2f56-42c1-83d5-c357c4acb873", email: "finance@demo.com", name: "Finance Lead", role: Role.APPROVER, organizationId: org.id }
  });

  const approverLegal = await prisma.user.create({
    data: { email: "legal@demo.com", name: "Legal Counsel", role: Role.APPROVER, organizationId: org.id }
  });

  console.log("[Seeder] Configuring routing rules...");
  await prisma.routingRule.createMany({
    data: [
      { organizationId: org.id, requestType: RequestType.REIMBURSEMENT, approverRole: Role.APPROVER, slaThresholdMinutes: 1440 },
      { organizationId: org.id, requestType: RequestType.MOU, approverRole: Role.APPROVER, slaThresholdMinutes: 2880 },
      { organizationId: org.id, requestType: RequestType.INVOICE, approverRole: Role.APPROVER, slaThresholdMinutes: 720 },
      { organizationId: org.id, requestType: RequestType.GRIEVANCE, approverRole: Role.ADMIN, slaThresholdMinutes: 120 }
    ]
  });

  console.log("[Seeder] Injecting 95 tickets...");
  
  // 50 Reimbursements
  for(let i=0; i<50; i++) {
    const daysAgo = Math.floor(Math.random() * 7);
    await createSimulatedTicket(org.id, user.id, approverFinance.id, RequestType.REIMBURSEMENT, Math.random() * 500, `Reimbursement Mock ${i}`, daysAgo);
  }
  // 20 MoUs
  for(let i=0; i<20; i++) {
    const daysAgo = Math.floor(Math.random() * 7);
    await createSimulatedTicket(org.id, user.id, approverLegal.id, RequestType.MOU, null, `MOU Partner Mock ${i}`, daysAgo);
  }
  // 15 Invoices
  for(let i=0; i<15; i++) {
    const daysAgo = Math.floor(Math.random() * 7);
    await createSimulatedTicket(org.id, user.id, approverFinance.id, RequestType.INVOICE, Math.random() * 10000, `Invoice Vendor Mock ${i}`, daysAgo);
  }
  // 10 Grievances
  for(let i=0; i<10; i++) {
    const daysAgo = Math.floor(Math.random() * 7);
    await createSimulatedTicket(org.id, user.id, user.id, RequestType.GRIEVANCE, null, `Anonymous Grievance ${i}`, daysAgo);
  }

  console.log("[Seeder] Generating Metrics Snapshots for the last 7 days...");
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    await prisma.metricsSnapshot.create({
      data: {
        organizationId: org.id,
        timestamp: date,
        routingAccuracy: 95 + Math.random() * 4,
        avgApprovalTimeMinutes: 10 + Math.random() * 10,
        slaComplianceRate: 90 + Math.random() * 9,
        clauseResolutionRate: 85 + Math.random() * 10,
        manualInterventionRate: 2 + Math.random() * 5,
        queueProcessingLatencyMs: 100 + Math.random() * 50
      }
    });
  }

  console.log("[Seeder] Seed complete! 95 tickets loaded for Evaluation.");
}

async function createSimulatedTicket(orgId: string, reqId: string, appId: string, type: RequestType, amt: number | null, text: string, daysAgo: number = 0) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);

  const t = await prisma.ticket.create({
    data: {
      organizationId: orgId,
      requesterId: reqId,
      type,
      amount: amt,
      urgency: Urgency.MEDIUM,
      rawText: text,
      status: 'PENDING',
      explanation: { reasoning: `Routed via initial deterministic evaluation for ${type}.` },
      createdAt: date,
      approvals: {
        create: {
          approverId: appId,
          stepIndex: 1,
          status: 'PENDING',
          createdAt: date
        }
      }
    }
  });
}

runSeed().catch(console.error);
