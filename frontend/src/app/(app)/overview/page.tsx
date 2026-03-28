import React from 'react';
import { 
  Network, Cpu, Database, Server, Smartphone, ScanFace, LockKeyhole, ArrowRight, Zap, 
  Target, LayoutDashboard, ScrollText, Layers, Bot, Scale, ShieldAlert,
  Wallet, FileSignature, Receipt, Code2, Users2, Blocks
} from 'lucide-react';

export default function OverviewPage() {
  return (
    <div className="py-8 pb-24 space-y-16 max-w-6xl mx-auto px-4">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="text-center space-y-5 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs uppercase tracking-widest border border-indigo-100 mb-2">
          <Blocks size={14}/> System Architecture
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          CivicFlow AI Engine
        </h1>
        <p className="text-slate-500 text-lg leading-relaxed">
          The definitive reference for the CivicFlow AI platform. Discover how unstructured communications are autonomously transformed, validated, negotiated, and deterministically routed.
        </p>
      </div>

      {/* ── 1. The Core Problem & Solution ───────────────────────────────────── */}
      <section className="bg-slate-900 rounded-[2rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none"/>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/20 blur-[100px] rounded-full pointer-events-none"/>
        
        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <ShieldAlert className="text-rose-400" size={24} />
              The Chaos of Zero-IT Ops
            </h2>
            <p className="text-slate-300 leading-relaxed text-sm">
              Community orgs, college clubs, and NGOs manage operations entirely through unstructured, fragmented channels: WhatsApp groups, email threads, and verbal agreements. Without IT teams to enforce rigid software, critical processes like **Vendor Invoices, Member Reimbursements, MoU Negotiations, and Grievances** instantly decay.
            </p>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"/> **Lost Requests:** Buried in group chats.</li>
              <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"/> **No SLAs:** Approvals delayed indefinitely.</li>
              <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"/> **Blind Liability:** Zero audit trail for financial payouts.</li>
            </ul>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 backdrop-blur-sm">
            <h2 className="text-xl font-bold flex items-center gap-3 text-emerald-400">
              <Target size={22} />
              The CivicFlow Paradigm
            </h2>
            <p className="text-slate-300 leading-relaxed text-sm">
              CivicFlow AI introduces an autonomous operations layer that requires zero user onboarding. Users continue sending WhatsApp messages and emails, while the AI **extracts, types, enforces structural bounds, and dynamically routes** workflows into a highly-observable dashboard.
            </p>
            <div className="flex gap-2 pt-2">
              <span className="bg-white/10 text-white text-[10px] font-bold uppercase px-2 py-1 rounded-md tracking-wider">Zero Config</span>
              <span className="bg-white/10 text-white text-[10px] font-bold uppercase px-2 py-1 rounded-md tracking-wider">Multi-Modal</span>
              <span className="bg-white/10 text-white text-[10px] font-bold uppercase px-2 py-1 rounded-md tracking-wider">Auditable</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. High Level Architecture Diagram (CSS Based) ────────────────────── */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 overflow-hidden">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center justify-center gap-2">
            <Network size={24} className="text-indigo-500" />
            System Topology & Data Pipeline
          </h2>
          <p className="text-slate-500 text-sm max-w-2xl mx-auto">From raw, unstructured messaging to cryptographically secured, auditable approvals.</p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Main diagram track */}
          <div className="flex flex-col md:flex-row items-stretch justify-between gap-6 relative z-10">
            
            <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-6 flex flex-col items-center text-center relative group hover:border-indigo-200 transition-colors">
              <div className="w-14 h-14 bg-white shadow-sm rounded-xl border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Smartphone className="text-slate-700" size={24} />
              </div>
              <h3 className="font-bold text-slate-800 text-sm mb-2">1. Omni-Channel Entry</h3>
              <p className="text-xs text-slate-500">Unstructured inputs via WhatsApp APIs, Email integrations, Voice transcribing, & Web Forms.</p>
              
              <div className="hidden md:block absolute -right-5 top-1/2 -translate-y-1/2 z-20 bg-indigo-50 text-indigo-400 rounded-full border border-white">
                <ArrowRight size={24}/>
              </div>
            </div>

            <div className="flex-1 bg-indigo-50 border border-indigo-200 rounded-2xl p-6 flex flex-col items-center text-center relative ring-4 ring-indigo-500/10 group hover:bg-indigo-100 transition-colors">
              <div className="w-14 h-14 bg-indigo-600 shadow-lg shadow-indigo-300 rounded-xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform">
                <Cpu size={24} />
              </div>
              <h3 className="font-bold text-indigo-900 text-sm mb-2">2. AI Neuro-Engine</h3>
              <p className="text-xs text-indigo-700/80">Entity Extraction, Intent Classification, Policy Verification, and Multi-Agent Reasoning.</p>
              
              <div className="hidden md:block absolute -right-5 top-1/2 -translate-y-1/2 z-20 bg-emerald-50 text-emerald-500 rounded-full border border-white">
                <ArrowRight size={24}/>
              </div>
            </div>

            <div className="flex-1 bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex flex-col items-center text-center relative group hover:border-emerald-200 transition-colors">
              <div className="w-14 h-14 bg-emerald-500 shadow-lg shadow-emerald-200 rounded-xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform">
                <ScanFace size={24} />
              </div>
              <h3 className="font-bold text-emerald-900 text-sm mb-2">3. Human Validation</h3>
              <p className="text-xs text-emerald-700/80">Dashboard delivery for single-click approval, delegation, and cryptographically signed logs.</p>
            </div>

          </div>

          <div className="hidden md:block absolute left-16 right-16 top-1/2 h-0.5 bg-slate-200 -z-10 -translate-y-1/2" />
        </div>
      </section>

      {/* ── 3. Four Core Pillars / Ticket Types ───────────────────────────────── */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900">Supported Workflow Domains</h2>
          <p className="text-slate-500 text-sm">CivicFlow AI naturally distills raw input into four discrete, highly-typed pipelines.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Item */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 flex gap-5 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
              <Wallet size={20} className="text-teal-600"/>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg mb-1">Reimbursements</h3>
              <p className="text-sm text-slate-500 mb-3 leading-relaxed">AI acts as an OCR and fraud-detection engine. It reads receipts, extracts totals and taxes, compares exact amounts, and routes low-dollar claims for instant approval while flagging anomalies.</p>
              <div className="flex gap-2"><span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">High Volume</span></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 flex gap-5 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Receipt size={20} className="text-blue-600"/>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg mb-1">Vendor Invoices</h3>
              <p className="text-sm text-slate-500 mb-3 leading-relaxed">Maps supplier strings against a known vendor directory, validating PO numbers, calculating payment terms (Net-30), and automatically projecting organizational cashflow liabilities.</p>
              <div className="flex gap-2"><span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">High Value</span></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 flex gap-5 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
              <FileSignature size={20} className="text-violet-600"/>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg mb-1">Memorandums of Understanding (MoU)</h3>
              <p className="text-sm text-slate-500 mb-3 leading-relaxed">AI segments long legal PDFs into independent, semantically-tracked clauses. Modifying a date triggers generative redrafting, displaying interactive GitHub-style diffs to Legal teams.</p>
              <div className="flex gap-2"><span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">High Complexity</span></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 flex gap-5 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
              <Scale size={20} className="text-rose-600"/>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg mb-1">Grievances & Policy</h3>
              <p className="text-sm text-slate-500 mb-3 leading-relaxed">Employs PII auto-redaction before storage. Intent classification identifies severity (Urgency 1-10) and ensures strict SLAs. High-severity complaints are securely routed directly to HR.</p>
              <div className="flex gap-2"><span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">High Sensitivity</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Technical Specifications Details ──────────────────────────────────── */}
      <section className="bg-slate-50 border-y border-slate-200 py-16 -mx-4 px-4 sm:-mx-8 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 flex items-center justify-center gap-2">
              <Cpu size={24} className="text-indigo-500" />
              Advanced Explainability & Determinism
            </h2>
            <p className="text-slate-500 text-sm max-w-2xl mx-auto">How CivicFlow solves the "Black Box" LLM problem natively.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="bg-white rounded-2xl shadow-sm p-6 hover:-translate-y-1 transition-transform border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4 text-blue-500 border border-blue-100">
                <Server size={18} />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Deterministic Guardrails</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Before relying on probabilistic LLM responses, CivicFlow injects a deterministic rules engine. 
                If a reimbursement exceeds a hard limit of $5,000, it is instantly escalated to Finance, 
                bridging deterministic limits with Generative AI without risk of hallucinations.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 hover:-translate-y-1 transition-transform border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mb-4 text-violet-500 border border-violet-100">
                <Bot size={18} />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Immutable Chain-of-Thought</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                CivicFlow documents every internal decision. When a request is auto-categorized, the exact generative prompt, reasoning paragraph, and standard confidence score are cryptographically flushed to tracking logs for legal auditing.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 hover:-translate-y-1 transition-transform border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-4 text-amber-500 border border-amber-100">
                <ScrollText size={18} />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Generative Clause Diffing</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Legal MoUs are split into semantic nodes. If the AI detects a timeline adjustment request, it safely drafts the modified segment and isolates the outcome in a distinct Green/Red text-diff interface for secure validation by legal agents.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── 5. Data Models ───────────────────────────────────────────────────────── */}
      <section className="bg-slate-900 rounded-[2rem] p-8 md:p-12 overflow-hidden text-white relative shadow-2xl">
        <div className="absolute top-0 right-0 w-full h-full pattern-grid-lg opacity-5 text-indigo-500 pointer-events-none"></div>
        <div className="absolute -top-10 -right-10 text-white/5 pointer-events-none">
          <Code2 size={240}/>
        </div>
        
        <div className="relative z-10 grid lg:grid-cols-5 gap-10 items-center">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Database size={24} className="text-blue-400" />
              TypeScript Data Context
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Every workflow adheres strictly to a normalized database interface modeled in TypeScript. This ensures full downstream type-safety in Next.js and secure transmission to the Prisma Postgres ORM.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <span className="block text-2xl font-black text-white">4</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Base Enums</span>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <span className="block text-2xl font-black text-white">100%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Schema Validated</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-[#0f172a]/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 font-mono text-xs sm:text-sm text-slate-300 leading-relaxed shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-700/50 pb-3">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="ml-3 text-[10px] text-slate-500 font-sans tracking-widest uppercase font-bold">models/Ticket.ts</span>
              </div>
<pre className="overflow-x-auto whitespace-pre-wrap"><code className="language-typescript">{`export interface Ticket {
  id: string;                      // Globally unique v4 identifier
  type: 'Reimbursement' | 'Invoice' | 'MoU' | 'Grievance';
  status: 'Pending' | 'Approved' | 'Rejected' | 'Escalated' | 'Needs Revision';
  submitter: { name: string; contact: string; role?: string };
  
  metrics: {
    urgency: number;               // Extracted 1-10 priority score
    amount?: number;               // Core liability/spend limit extracted
    currency?: string;
  };

  ai_routing: {
    category: string;
    confidence: number;            // Neural confidence out of 1.00
    explainability: string;        // Chain-of-Thought vector path reasoning
  };

  clauses?: MoUClause[];           // Isolated paragraphs for AI negotiation
  audit_hash: string;              // Cryptographic signature for tamper logs
}`}</code></pre>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
