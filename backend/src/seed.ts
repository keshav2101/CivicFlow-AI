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
    data: { email: "student@demo.com", name: "Demo Student", role: Role.USER, organizationId: org.id }
  });

  const approverFinance = await prisma.user.create({
    data: { email: "finance@demo.com", name: "Finance Lead", role: Role.APPROVER, organizationId: org.id }
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
    await createSimulatedTicket(org.id, user.id, approverFinance.id, RequestType.REIMBURSEMENT, Math.random() * 500, `Reimbursement Mock ${i}`);
  }
  // 20 MoUs
  for(let i=0; i<20; i++) {
    await createSimulatedTicket(org.id, user.id, approverLegal.id, RequestType.MOU, null, `MOU Partner Mock ${i}`);
  }
  // 15 Invoices
  for(let i=0; i<15; i++) {
    await createSimulatedTicket(org.id, user.id, approverFinance.id, RequestType.INVOICE, Math.random() * 10000, `Invoice Vendor Mock ${i}`);
  }
  // 10 Grievances
  for(let i=0; i<10; i++) {
    await createSimulatedTicket(org.id, user.id, user.id, RequestType.GRIEVANCE, null, `Anonymous Grievance ${i}`);
  }

  console.log("[Seeder] Seed complete! 95 tickets loaded for Evaluation.");
}

async function createSimulatedTicket(orgId: string, reqId: string, appId: string, type: RequestType, amt: number | null, text: string) {
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
      approvals: {
        create: {
          approverId: appId,
          stepIndex: 1,
          status: 'PENDING'
        }
      }
    }
  });
}

runSeed().catch(console.error);
