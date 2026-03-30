import { PrismaClient, Role, RequestType, Urgency } from '@prisma/client';
const prisma = new PrismaClient();
import { MetricsEngine } from './services/metrics';

async function runSeed() {
  console.log("[Seeder] Truncating database...");
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "AuditLog", "ClauseRevision", "Clause", "Document", "SLAEvent", "Approval", "Ticket", "LearningEvent", "MetricsSnapshot", "RoutingRule", "User", "Organization" CASCADE`);

  console.log("[Seeder] Creating organizational hierarchy...");
  const org = await prisma.organization.create({
    data: { name: "University Demo Core", tenantId: "demo_1" }
  });

  // 1. Admin: Alex (Oversight)
  const adminAlex = await prisma.user.create({
    data: { id: "a1e1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5", email: "alex.admin@demo.com", name: "Alex (Admin)", role: Role.ADMIN, organizationId: org.id }
  });

  // 2. Treasurer: Jordan (Financials)
  const treasurerJordan = await prisma.user.create({
    data: { id: "j1o2r3d4-a5n6-b7e8-c9d0-f1e2a3b4c5d6", email: "jordan.treasury@demo.com", name: "Jordan (Treasurer)", role: Role.APPROVER, organizationId: org.id }
  });

  // 3. Head of Ops: Morgan (Contracts/MoU)
  const headOpsMorgan = await prisma.user.create({
    data: { id: "m1o2r3g4-a5n6-b7e8-c9d0-f1e2a3b4c5d6", email: "morgan.ops@demo.com", name: "Morgan (Head of Ops)", role: Role.APPROVER, organizationId: org.id }
  });

  // 4. Regular Users: Sam & Taylor
  const userSam = await prisma.user.create({
    data: { id: "s1a2m3u4-e5l6-b7e8-c9d0-f1e2a3b4c5d6", email: "sam.student@demo.com", name: "Sam (Researcher)", role: Role.USER, organizationId: org.id }
  });
  const alexAdminUser = await prisma.user.create({
     data: { id: "a1d2m3i4-n5a6-l7e8-x9d0-c1o2u3r4t5e6", email: "system.ai@demo.com", name: "CivicFlow AI", role: Role.SYSTEM, organizationId: org.id }
  })
  const userTaylor = await prisma.user.create({
    data: { id: "t1a2y3l4-o5r6-b7e8-c9d0-f1e2a3b4c5d6", email: "taylor.staff@demo.com", name: "Taylor (Staff)", role: Role.USER, organizationId: org.id }
  });

  console.log("[Seeder] Configuring hierarchical routing rules...");
  await prisma.routingRule.createMany({
    data: [
      // Reimbursements go to Treasurer
      { organizationId: org.id, requestType: RequestType.REIMBURSEMENT, approverRole: Role.APPROVER, slaThresholdMinutes: 1440 },
      // MoUs go to Head of Ops
      { organizationId: org.id, requestType: RequestType.MOU, approverRole: Role.APPROVER, slaThresholdMinutes: 2880 },
      // Invoices > $5000 go to Head of Ops (logic will be in worker, but rule points to role)
      { organizationId: org.id, requestType: RequestType.INVOICE, approverRole: Role.APPROVER, slaThresholdMinutes: 720 },
      // Grievances go to Admin
      { organizationId: org.id, requestType: RequestType.GRIEVANCE, approverRole: Role.ADMIN, slaThresholdMinutes: 120 }
    ]
  });

  console.log("[Seeder] Injecting 95 tickets with mix of 'Simple' (Auto-Approved) and 'Complex' (Pending)...");
  
  // 50 Reimbursements (30 simple auto-approved, 20 pending)
  for(let i=0; i<30; i++) {
    const daysAgo = Math.floor(Math.random() * 7);
    await createSimulatedTicket(org.id, userSam.id, treasurerJordan.id, RequestType.REIMBURSEMENT, 5 + Math.random() * 15, `Simple Expense ${i}`, daysAgo, 'APPROVED');
  }
  for(let i=0; i<20; i++) {
    const daysAgo = Math.floor(Math.random() * 7);
    await createSimulatedTicket(org.id, userSam.id, treasurerJordan.id, RequestType.REIMBURSEMENT, 50 + Math.random() * 450, `Complex Reimbursement ${i}`, daysAgo, 'PENDING');
  }

  // 20 MoUs (Always complex/Pending)
  for(let i=0; i<20; i++) {
    const daysAgo = Math.floor(Math.random() * 7);
    await createSimulatedTicket(org.id, userTaylor.id, headOpsMorgan.id, RequestType.MOU, null, `University Partnership MOU ${i}`, daysAgo, 'PENDING');
  }

  // 15 Invoices (High value to Head of Ops, Low to Treasurer)
  for(let i=0; i<8; i++) {
    const daysAgo = Math.floor(Math.random() * 7);
    await createSimulatedTicket(org.id, userTaylor.id, headOpsMorgan.id, RequestType.INVOICE, 6000 + Math.random() * 4000, `High-Value Invoice ${i}`, daysAgo, 'PENDING');
  }
  for(let i=0; i<7; i++) {
    const daysAgo = Math.floor(Math.random() * 7);
    await createSimulatedTicket(org.id, userTaylor.id, treasurerJordan.id, RequestType.INVOICE, 100 + Math.random() * 2000, `Standard Invoice ${i}`, daysAgo, 'PENDING');
  }

  // 10 Grievances (Always Admin)
  for(let i=0; i<10; i++) {
    const daysAgo = Math.floor(Math.random() * 7);
    await createSimulatedTicket(org.id, userSam.id, adminAlex.id, RequestType.GRIEVANCE, null, `Student Complaint ${i}`, daysAgo, 'PENDING');
  }

  console.log("[Seeder] Generating Real-Time Metrics Snapshots for the last 7 days...");
  for (let i = 0; i < 7; i++) {
    // Manually compute and update for historical dates
    const snap = await MetricsEngine.computeMetrics(org.id);
    const date = new Date();
    date.setDate(date.getDate() - i);
    await prisma.metricsSnapshot.update({
      where: { id: snap.id },
      data: { timestamp: date }
    });
  }

  console.log("[Seeder] Seed complete! Distributed among Admin, Treasurer, and Head of Ops.");
}

async function createSimulatedTicket(orgId: string, reqId: string, appId: string, type: RequestType, amt: number | null, text: string, daysAgo: number = 0, status: 'PENDING' | 'APPROVED' = 'PENDING') {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);

  const reasoning = status === 'APPROVED' 
    ? `System Agent: Auto-approved as ${type} value ($${amt?.toFixed(2)}) is below the $20 autonomous threshold.`
    : `Think Engine: Routed to ${appId === 'j1o2r3d4-a5n6-b7e8-c9d0-f1e2a3b4c5d6' ? 'Treasurer' : appId === 'm1o2r3g4-a5n6-b7e8-c9d0-f1e2a3b4c5d6' ? 'Head of Ops' : 'Admin'} for complex policy verification.`;

  const ticket = await prisma.ticket.create({
    data: {
      organizationId: orgId,
      requesterId: reqId,
      type,
      amount: amt,
      urgency: Urgency.MEDIUM,
      rawText: text,
      status: status,
      explanation: { 
        reasoning: reasoning,
        classification: type,
        extraction: { amount: amt }
      },
      createdAt: date,
      approvals: {
        create: {
          approverId: appId,
          stepIndex: 1,
          status: status === 'APPROVED' ? 'APPROVED' : 'PENDING',
          createdAt: date
        }
      }
    }
  });

  // If MoU, create document and clauses
  if (type === RequestType.MOU) {
    const doc = await prisma.document.create({
        data: {
            ticketId: ticket.id,
            status: 'PENDING_REVIEW',
            content: "Draft Partnership Agreement v1.0",
        }
    });

    // Seed 3 standard clauses
    const clausesRaw = [
        { title: "Intellectual Property", original: "All IP belongs to the University.", revised: "Shared IP ownership for specific project outcomes with University retaining core rights.", reasoning: "Standard reciprocal research terms applied." },
        { title: "Termination Notice", original: "30 days written notice.", revised: "90 days written notice with specific cure period for breaches.", reasoning: "Expanded notice period to ensure continuity for multi-year research." },
        { title: "Liability Cap", original: "Unlimited liability for both parties.", revised: "Liability capped at 1.5x of the total project value per annum.", reasoning: "Industry standard risk mitigation used to protect organization reserves." }
    ];

    for (const c of clausesRaw) {
        const clause = await prisma.clause.create({
            data: {
                documentId: doc.id,
                title: c.title,
                text: c.revised,
                statusPartyA: 'PENDING',
                statusPartyB: 'PENDING',
                revisions: {
                    create: [
                        { version: 1, text: c.original, reason: "Manual upload from vendor PDF", actorId: reqId },
                        { version: 2, text: c.revised, reason: "Generative AI policy adjustment", explanation: { reasoning: c.reasoning }, actorId: "a1d2m3i4-n5a6-l7e8-x9d0-c1o2u3r4t5e6" }
                    ]
                }
            }
        });
    }
  }
}

runSeed().catch(console.error);
