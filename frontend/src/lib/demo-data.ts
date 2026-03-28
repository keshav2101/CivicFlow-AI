// ── shared/demo-data.ts — single source of truth for all demo tickets ──────

export type TicketStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED';
export type TicketType   = 'REIMBURSEMENT' | 'INVOICE' | 'MOU' | 'GRIEVANCE';
export type SLAStatus    = 'Breached' | 'At Risk' | 'On Track' | 'Completed';

export interface Clause {
  id: string;
  title: string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
  preview: string;
  original: string;
  revised: string;
  explanation: string;
  updatedAt: Date;
}

export interface Ticket {
  id: string;
  type: TicketType;
  title: string;
  requester: string;
  assignee: string;
  amount?: number;
  status: TicketStatus;
  sla: SLAStatus;
  dueIn: string;
  submittedAt: Date;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  tags: string[];
  summary: string;
  clauses?: Clause[];
  explanation: {
    routing: string;
    classification: string;
    fallback?: string;
    learning?: string;
  };
  auditLog: { time: string; event: string }[];
}

// ─────────────────────────────────────────────────────────────────────────────
const now = () => new Date();
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000);

export const DEMO_TICKETS: Ticket[] = [

  // ── REIMBURSEMENTS ─────────────────────────────────────────────────────────
  {
    id: 'TCK-1001', type: 'REIMBURSEMENT',
    title: 'Hackathon Travel & Accommodation',
    requester: 'Rahul Sharma', assignee: 'Finance Lead', amount: 8500,
    status: 'PENDING', sla: 'At Risk', dueIn: 'Due in 2h',
    submittedAt: hoursAgo(22), priority: 'HIGH',
    tags: ['travel', 'event', 'tech-fest'],
    summary: 'Team of 4 traveled to Bangalore for National Hackathon 2026. Requesting reimbursement for train tickets, hotel (2 nights), and meals.',
    explanation: {
      routing: 'Routed to Finance Lead — amount $8,500 is within $10K threshold.',
      classification: 'Type: REIMBURSEMENT, confidence 96.4%. Entities: amount=$8500, category=travel, urgency=high.',
    },
    auditLog: [
      { time: '10:00', event: 'Email received from rahul@org.com' },
      { time: '10:01', event: 'PII scrubber ran — 1 phone number redacted' },
      { time: '10:01', event: 'Classified as REIMBURSEMENT (96.4%)' },
      { time: '10:02', event: 'Routed to Finance Lead queue' },
    ],
  },
  {
    id: 'TCK-1002', type: 'REIMBURSEMENT',
    title: 'Office Supplies — Stationery & Printer Ink',
    requester: 'Priya Nair', assignee: 'Admin Manager', amount: 1250,
    status: 'APPROVED', sla: 'Completed', dueIn: 'Done',
    submittedAt: hoursAgo(48), priority: 'LOW',
    tags: ['office', 'supplies'],
    summary: 'Routine purchase of A4 paper reams, printer ink cartridges, and stationery for the main office.',
    explanation: {
      routing: 'Routed to Admin Manager — category=office_supplies maps to Admin queue.',
      classification: 'Type: REIMBURSEMENT, confidence 99.1%.',
    },
    auditLog: [
      { time: '09:00', event: 'WhatsApp message parsed' },
      { time: '09:00', event: 'Classified as REIMBURSEMENT (99.1%)' },
      { time: '09:01', event: 'Auto-approved — under ₹2,000 threshold' },
    ],
  },
  {
    id: 'TCK-1003', type: 'REIMBURSEMENT',
    title: 'Annual Club Dinner — Catering Invoice',
    requester: 'Aditya Verma', assignee: 'Finance Director', amount: 14200,
    status: 'ESCALATED', sla: 'Breached', dueIn: 'Breached 5h ago',
    submittedAt: hoursAgo(30), priority: 'HIGH',
    tags: ['event', 'catering'],
    summary: 'Annual club dinner with 80 members. External catering vendor charges $14,200. Requires Finance Director sign-off due to >$10K policy.',
    explanation: {
      routing: 'Escalated to Finance Director — amount $14,200 triggers mandatory high-value policy.',
      classification: 'Type: REIMBURSEMENT, confidence 94.2%.',
      fallback: 'Finance Lead breached SLA. Auto-escalated to Finance Director.',
      learning: 'SLA threshold for Finance Lead extended by +2h after 3 consecutive breaches.',
    },
    auditLog: [
      { time: '08:00', event: 'Web form submitted by Aditya Verma' },
      { time: '08:01', event: 'Policy engine: amount>$10K → Finance Director' },
      { time: '13:00', event: 'SLA breached — Finance Lead unresponsive' },
      { time: '13:01', event: 'Auto-escalated to Finance Director' },
    ],
  },
  {
    id: 'TCK-1004', type: 'REIMBURSEMENT',
    title: 'Conference Registration Fees — Tech Summit',
    requester: 'Sneha Pillai', assignee: 'Finance Lead', amount: 4500,
    status: 'PENDING', sla: 'On Track', dueIn: 'Due in 6h',
    submittedAt: hoursAgo(8), priority: 'MEDIUM',
    tags: ['conference', 'learning'],
    summary: 'Registration fees for 3 delegates attending Tech Summit India 2026.',
    explanation: {
      routing: 'Routed to Finance Lead — amount within threshold, category=conference.',
      classification: 'Type: REIMBURSEMENT, confidence 97.8%.',
    },
    auditLog: [
      { time: '09:30', event: 'Email parsed from sneha@org.com' },
      { time: '09:31', event: 'Classified as REIMBURSEMENT (97.8%)' },
      { time: '09:32', event: 'Routed to Finance Lead' },
    ],
  },
  {
    id: 'TCK-1005', type: 'REIMBURSEMENT',
    title: 'Emergency Medical Aid — Field Volunteer',
    requester: 'Arjun Das', assignee: 'Finance Director', amount: 11000,
    status: 'APPROVED', sla: 'Completed', dueIn: 'Done',
    submittedAt: hoursAgo(72), priority: 'HIGH',
    tags: ['medical', 'emergency', 'volunteer'],
    summary: 'Medical emergency for a field volunteer during a rural outreach program. Fast-track approved.',
    explanation: {
      routing: 'Routed to Finance Director — amount >$10K AND urgency=emergency.',
      classification: 'Type: REIMBURSEMENT, confidence 91.3%. Urgency: HIGH.',
    },
    auditLog: [
      { time: '22:00', event: 'WhatsApp message received — urgency=EMERGENCY flagged' },
      { time: '22:01', event: 'Fast-track policy applied' },
      { time: '22:05', event: 'Finance Director approved via email reply' },
    ],
  },

  // ── INVOICES ───────────────────────────────────────────────────────────────
  {
    id: 'TCK-1006', type: 'INVOICE',
    title: 'Cloud Infrastructure — AWS Services Q1',
    requester: 'Acme Systems Ltd', assignee: 'Finance Lead', amount: 6800,
    status: 'APPROVED', sla: 'Completed', dueIn: 'Done',
    submittedAt: hoursAgo(96), priority: 'MEDIUM',
    tags: ['cloud', 'tech', 'vendor'],
    summary: 'Quarterly AWS cloud services invoice covering EC2, S3, and RDS usage for CivicFlow platform infrastructure.',
    explanation: {
      routing: 'Routed to Finance Lead — vendor invoice, amount within threshold.',
      classification: 'Type: INVOICE, confidence 98.9%.',
    },
    auditLog: [
      { time: '09:00', event: 'Email invoice received from aws-billing@amazon.com' },
      { time: '09:01', event: 'Classified as INVOICE (98.9%)' },
      { time: '09:02', event: 'Approved by Finance Lead' },
    ],
  },
  {
    id: 'TCK-1007', type: 'INVOICE',
    title: 'Design Agency — Brand Identity Package',
    requester: 'Pixel Studio Co.', assignee: 'Finance Director', amount: 18500,
    status: 'PENDING', sla: 'At Risk', dueIn: 'Due in 3h',
    submittedAt: hoursAgo(18), priority: 'HIGH',
    tags: ['design', 'branding', 'agency'],
    summary: 'Final invoice for full brand identity package: logos, color system, typography, and brand guidelines document.',
    explanation: {
      routing: 'Escalated to Finance Director — invoice amount $18,500 exceeds $10K policy threshold.',
      classification: 'Type: INVOICE, confidence 97.4%.',
    },
    auditLog: [
      { time: '10:00', event: 'Email invoice from studio@pixelco.design' },
      { time: '10:01', event: 'Policy engine: >$10K → Finance Director' },
      { time: '10:02', event: 'SLA timer started — 24h window' },
    ],
  },
  {
    id: 'TCK-1008', type: 'INVOICE',
    title: 'Security Audit — External Firm',
    requester: 'CyberShield Pvt Ltd', assignee: 'Finance Lead', amount: 9200,
    status: 'REJECTED', sla: 'Completed', dueIn: 'Done',
    submittedAt: hoursAgo(60), priority: 'MEDIUM',
    tags: ['security', 'audit', 'vendor'],
    summary: 'Invoice for annual security penetration testing. Rejected due to missing GST number on invoice.',
    explanation: {
      routing: 'Routed to Finance Lead — amount within threshold.',
      classification: 'Type: INVOICE, confidence 96.1%.',
    },
    auditLog: [
      { time: '11:00', event: 'Invoice email received' },
      { time: '11:01', event: 'Classified as INVOICE (96.1%)' },
      { time: '14:00', event: 'Rejected — missing GST registration number' },
      { time: '14:01', event: 'Rejection notice sent to vendor' },
    ],
  },
  {
    id: 'TCK-1009', type: 'INVOICE',
    title: 'Printing & Merchandise — Event Banners',
    requester: 'PrintFast Solutions', assignee: 'Admin Manager', amount: 2100,
    status: 'APPROVED', sla: 'Completed', dueIn: 'Done',
    submittedAt: hoursAgo(40), priority: 'LOW',
    tags: ['printing', 'event'],
    summary: 'Roll-up banners, ID cards, and flex boards for the Annual NGO Summit.',
    explanation: {
      routing: 'Routed to Admin Manager — category=merchandise, amount low.',
      classification: 'Type: INVOICE, confidence 99.2%.',
    },
    auditLog: [
      { time: '08:30', event: 'WhatsApp invoice image parsed via OCR' },
      { time: '08:31', event: 'Classified as INVOICE (99.2%)' },
      { time: '10:00', event: 'Admin Manager approved' },
    ],
  },
  {
    id: 'TCK-1010', type: 'INVOICE',
    title: 'Legal Retainer — Monthly Fee',
    requester: 'Kapoor & Associates LLP', assignee: 'Finance Lead', amount: 5000,
    status: 'PENDING', sla: 'On Track', dueIn: 'Due in 12h',
    submittedAt: hoursAgo(4), priority: 'MEDIUM',
    tags: ['legal', 'retainer'],
    summary: 'Monthly legal retainer fee for ongoing advisory and contract review services.',
    explanation: {
      routing: 'Routed to Finance Lead — recurring monthly invoice, amount within threshold.',
      classification: 'Type: INVOICE, confidence 98.0%.',
    },
    auditLog: [
      { time: '09:00', event: 'Recurring invoice auto-flagged from Kapoor & Associates' },
      { time: '09:01', event: 'Routed to Finance Lead for standard approval' },
    ],
  },

  // ── MOUs ──────────────────────────────────────────────────────────────────
  {
    id: 'TCK-1011', type: 'MOU',
    title: 'Partnership MOU — Acme Corp Technology Alliance',
    requester: 'Acme Corp', assignee: 'Legal Manager',
    status: 'PENDING', sla: 'Breached', dueIn: 'Breached 3h ago',
    submittedAt: hoursAgo(27), priority: 'HIGH',
    tags: ['partnership', 'technology', 'alliance'],
    summary: 'Strategic technology partnership for co-developing AI tools for citizen services. 3-year term, mutual IP sharing.',
    explanation: {
      routing: 'Routed to Legal Manager — MOU document type triggers Legal queue.',
      classification: 'Type: MOU, confidence 97.1%.',
      fallback: 'Primary Legal Counsel unavailable — routed to Legal Manager.',
    },
    auditLog: [
      { time: '09:00', event: 'MOU document received via email' },
      { time: '09:01', event: 'Decomposed into 3 clauses for negotiation' },
      { time: '12:00', event: 'SLA breached — Legal Manager unresponsive' },
    ],
    clauses: [
      {
        id: 'c1', title: 'Scope of Work', status: 'APPROVED',
        preview: 'AI tool co-development for citizen services, 3-year term.',
        original: 'The parties agree to collaborate on software development projects.', 
        revised: 'The parties agree to collaborate on AI-powered software development for citizen services for a period of 3 years, as detailed in Annex A.',
        explanation: 'Scope clause matched standard technology partnership template at 98% similarity. AI expanded definition per standard practice.',
        updatedAt: hoursAgo(25),
      },
      {
        id: 'c2', title: 'Payment Terms', status: 'PENDING',
        preview: '$5,000/month payable within 45 days.',
        original: 'Payment of $5,000 per month is due within 30 days of invoice.',
        revised: 'Payment of $5,000 per month is due within 45 days of invoice receipt.',
        explanation: 'Vendor proposed 45-day terms. Policy allows up to 60 days — AI accepted revision within threshold.',
        updatedAt: hoursAgo(2),
      },
      {
        id: 'c3', title: 'Liability Cap', status: 'REJECTED',
        preview: 'Vendor proposed 2× liability cap — reduced to 1× by policy.',
        original: 'Each party\'s liability is capped at 2× the total annual contract value.',
        revised: 'Each party\'s liability is capped at 1× the total annual contract value.',
        explanation: 'Policy rule enforced: liability cap must not exceed 1× contract value. AI reduced vendor proposal from 2× to 1×.',
        updatedAt: hoursAgo(20),
      },
    ],
  },
  {
    id: 'TCK-1012', type: 'MOU',
    title: 'MOU — State Government Data Sharing',
    requester: 'Dept. of Rural Development', assignee: 'Legal Counsel',
    status: 'APPROVED', sla: 'Completed', dueIn: 'Done',
    submittedAt: hoursAgo(120), priority: 'HIGH',
    tags: ['government', 'data', 'compliance'],
    summary: 'Data sharing agreement with State Rural Development Department for beneficiary records. All clauses approved after 2 rounds of negotiation.',
    explanation: {
      routing: 'Routed to Legal Counsel — government entity and data sharing flagged as high-priority.',
      classification: 'Type: MOU, confidence 95.5%.',
    },
    auditLog: [
      { time: 'Day 1 09:00', event: 'MOU document received from govt. email' },
      { time: 'Day 1 10:00', event: 'Initial clause review by Legal Counsel' },
      { time: 'Day 2 14:00', event: 'All 5 clauses approved after round 2 negotiation' },
    ],
    clauses: [],
  },
  {
    id: 'TCK-1013', type: 'MOU',
    title: 'Research Collaboration — IIT Bombay',
    requester: 'IIT Bombay CSE Dept.', assignee: 'Legal Manager',
    status: 'PENDING', sla: 'On Track', dueIn: 'Due in 18h',
    submittedAt: hoursAgo(6), priority: 'MEDIUM',
    tags: ['research', 'academic', 'collaboration'],
    summary: 'Academic research MOU for joint publication rights and student internship placements.',
    explanation: {
      routing: 'Routed to Legal Manager — academic institution, standard MOU template applied.',
      classification: 'Type: MOU, confidence 96.7%.',
    },
    auditLog: [
      { time: '11:00', event: 'MOU received from iitb.ac.in email domain' },
      { time: '11:01', event: 'Academic institution template applied' },
      { time: '11:02', event: 'Forwarded to Legal Manager for review' },
    ],
    clauses: [],
  },

  // ── GRIEVANCES ─────────────────────────────────────────────────────────────
  {
    id: 'TCK-1014', type: 'GRIEVANCE',
    title: 'Workplace Harassment — Anonymous Complaint',
    requester: 'Anonymous', assignee: 'HR Head',
    status: 'PENDING', sla: 'At Risk', dueIn: 'Due in 4h',
    submittedAt: hoursAgo(20), priority: 'HIGH',
    tags: ['harassment', 'anonymous', 'hr'],
    summary: 'Anonymous complaint regarding inappropriate conduct by a team lead during a project meeting on March 25th.',
    explanation: {
      routing: 'Routed to HR Head — grievance category=harassment triggers mandatory HR escalation.',
      classification: 'Type: GRIEVANCE, confidence 93.8%. Sensitivity: HIGH.',
    },
    auditLog: [
      { time: '14:00', event: 'Anonymous web form submitted' },
      { time: '14:01', event: 'PII fully redacted — identity preserved' },
      { time: '14:02', event: 'Routed to HR Head — harassment policy triggered' },
    ],
  },
  {
    id: 'TCK-1015', type: 'GRIEVANCE',
    title: 'Resource Allocation Dispute — Project Delta',
    requester: 'Kavya Menon', assignee: 'Admin Manager',
    status: 'APPROVED', sla: 'Completed', dueIn: 'Done',
    submittedAt: hoursAgo(100), priority: 'MEDIUM',
    tags: ['resources', 'allocation', 'project'],
    summary: 'Complaint about unequal resource distribution between sub-teams in Project Delta. Resolved through mediation.',
    explanation: {
      routing: 'Routed to Admin Manager — grievance category=resource_allocation.',
      classification: 'Type: GRIEVANCE, confidence 89.6%.',
    },
    auditLog: [
      { time: 'Day 1', event: 'Email complaint received' },
      { time: 'Day 2', event: 'Mediation session scheduled' },
      { time: 'Day 3', event: 'Resolution documented and approved' },
    ],
  },
  {
    id: 'TCK-1016', type: 'GRIEVANCE',
    title: 'Late Salary Disbursement — March 2026',
    requester: 'Multiple Employees (8)', assignee: 'Finance Director',
    status: 'ESCALATED', sla: 'Breached', dueIn: 'Breached 2h ago',
    submittedAt: hoursAgo(16), priority: 'HIGH',
    tags: ['salary', 'payroll', 'urgent'],
    summary: '8 employees report March 2026 salary not credited despite due date passing. Urgent escalation required.',
    explanation: {
      routing: 'Escalated to Finance Director — collective grievance + financial impact.',
      classification: 'Type: GRIEVANCE, confidence 96.2%.',
      fallback: 'Finance Lead did not respond within 4h — auto-escalated per policy.',
    },
    auditLog: [
      { time: '08:00', event: '8 separate WhatsApp messages received' },
      { time: '08:01', event: 'Aggregated into single collective grievance' },
      { time: '12:00', event: 'SLA breached — escalated to Finance Director' },
    ],
  },
  {
    id: 'TCK-1017', type: 'GRIEVANCE',
    title: 'Infrastructure Complaint — Broken AC in Lab',
    requester: 'Lab Members (12)', assignee: 'Admin Manager',
    status: 'PENDING', sla: 'On Track', dueIn: 'Due in 20h',
    submittedAt: hoursAgo(4), priority: 'LOW',
    tags: ['infrastructure', 'facility'],
    summary: 'Air conditioning unit in Computer Lab B non-functional for 3 days. Affecting 12 students and productivity.',
    explanation: {
      routing: 'Routed to Admin Manager — facility complaint maps to Admin queue.',
      classification: 'Type: GRIEVANCE, confidence 91.5%.',
    },
    auditLog: [
      { time: '13:00', event: 'Group WhatsApp complaint received' },
      { time: '13:01', event: 'Classified as GRIEVANCE (91.5%)' },
      { time: '13:02', event: 'Routed to Admin Manager for facility action' },
    ],
  },
  {
    id: 'TCK-1018', type: 'GRIEVANCE',
    title: 'Unfair Task Assignment — Volunteer Coordinator',
    requester: 'Shruti Bose', assignee: 'HR Head',
    status: 'REJECTED', sla: 'Completed', dueIn: 'Done',
    submittedAt: hoursAgo(80), priority: 'LOW',
    tags: ['volunteer', 'task-allocation'],
    summary: 'Complaint about disproportionate task assignments by volunteer coordinator. After review, found to be within normal operational parameters.',
    explanation: {
      routing: 'Routed to HR Head — internal conduct complaint.',
      classification: 'Type: GRIEVANCE, confidence 88.9%.',
    },
    auditLog: [
      { time: 'Day 1', event: 'Email grievance received' },
      { time: 'Day 2', event: 'HR reviewed task logs — no policy violation found' },
      { time: 'Day 2', event: 'Grievance closed — no further action needed' },
    ],
  },
  {
    id: 'TCK-1019', type: 'REIMBURSEMENT',
    title: 'Equipment Purchase — Raspberry Pi Kits',
    requester: 'Tech Club', assignee: 'Finance Lead', amount: 3100,
    status: 'PENDING', sla: 'On Track', dueIn: 'Due in 8h',
    submittedAt: hoursAgo(10), priority: 'MEDIUM',
    tags: ['equipment', 'tech-club', 'electronics'],
    summary: 'Batch purchase of 10 Raspberry Pi 4 kits for the embedded systems workshop.',
    explanation: {
      routing: 'Routed to Finance Lead — equipment purchase under $5K threshold.',
      classification: 'Type: REIMBURSEMENT, confidence 95.1%.',
    },
    auditLog: [
      { time: '08:00', event: 'Purchase request submitted via web form' },
      { time: '08:01', event: 'Classified as REIMBURSEMENT (95.1%)' },
      { time: '08:02', event: 'Routed to Finance Lead' },
    ],
  },
  {
    id: 'TCK-1020', type: 'MOU',
    title: 'Sponsorship Agreement — Annual Cultural Fest',
    requester: 'Reliance Foundation', assignee: 'Legal Manager',
    status: 'PENDING', sla: 'On Track', dueIn: 'Due in 30h',
    submittedAt: hoursAgo(2), priority: 'MEDIUM',
    tags: ['sponsorship', 'cultural', 'event'],
    summary: '₹5 lakh sponsorship MOU for Annual Cultural Fest 2026. Includes branding rights and stage time.',
    explanation: {
      routing: 'Routed to Legal Manager — sponsorship MOU with branding clause requires legal review.',
      classification: 'Type: MOU, confidence 94.3%.',
    },
    auditLog: [
      { time: '16:00', event: 'Sponsorship proposal received from foundation@reliancefoundation.org' },
      { time: '16:01', event: 'Classified as MOU — branding clause detected' },
      { time: '16:02', event: 'Routed to Legal Manager' },
    ],
    clauses: [],
  },
];

// ── Helper utilities ──────────────────────────────────────────────────────────

export const TICKETS_BY_TYPE = {
  REIMBURSEMENT: DEMO_TICKETS.filter(t => t.type === 'REIMBURSEMENT'),
  INVOICE:       DEMO_TICKETS.filter(t => t.type === 'INVOICE'),
  MOU:           DEMO_TICKETS.filter(t => t.type === 'MOU'),
  GRIEVANCE:     DEMO_TICKETS.filter(t => t.type === 'GRIEVANCE'),
};

export const getTicketById = (id: string) => DEMO_TICKETS.find(t => t.id === id);

export const METRICS = {
  slaCompliance:    94.2,
  avgTurnaroundMin: 14.5,
  automationRate:   94.9,
  activeTickets:    DEMO_TICKETS.filter(t => t.status === 'PENDING' || t.status === 'ESCALATED').length,
  totalRequests:    DEMO_TICKETS.length,
  aiDecisions:      DEMO_TICKETS.length * 47,
  clausesNegotiated: 47,
};
