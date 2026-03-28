'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  CreditCard, FileText, Handshake, MessageSquareWarning,
  ArrowRight, Search, Filter, Clock, AlertTriangle, CheckCircle2, XCircle, Zap
} from 'lucide-react';
import { DEMO_TICKETS, TICKETS_BY_TYPE, type TicketType, type Ticket } from '@/lib/demo-data';
import { formatDistanceToNow } from 'date-fns';

// ── Config ────────────────────────────────────────────────────────────────────
const TABS: { key: TicketType | 'ALL'; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
  { key: 'ALL',           label: 'All Tickets',    icon: <FileText size={16}/>,              color: 'text-slate-700',  bg: 'bg-slate-100'   },
  { key: 'REIMBURSEMENT', label: 'Reimbursements', icon: <CreditCard size={16}/>,            color: 'text-teal-700',   bg: 'bg-teal-50'     },
  { key: 'INVOICE',       label: 'Invoices',       icon: <FileText size={16}/>,              color: 'text-blue-700',   bg: 'bg-blue-50'     },
  { key: 'MOU',           label: 'MoUs',           icon: <Handshake size={16}/>,             color: 'text-violet-700', bg: 'bg-violet-50'   },
  { key: 'GRIEVANCE',     label: 'Grievances',     icon: <MessageSquareWarning size={16}/>,  color: 'text-rose-700',   bg: 'bg-rose-50'     },
];

const STATUS_STYLE: Record<string, string> = {
  PENDING:   'bg-amber-100  text-amber-700',
  APPROVED:  'bg-emerald-100 text-emerald-700',
  REJECTED:  'bg-red-100    text-red-700',
  ESCALATED: 'bg-orange-100 text-orange-700',
};
const SLA_STYLE = (s: string) =>
  s === 'Breached'  ? 'text-red-600 font-bold'      :
  s === 'At Risk'   ? 'text-amber-600 font-semibold' :
  s === 'Completed' ? 'text-emerald-600'              : 'text-slate-500';

const TYPE_BADGE: Record<string, string> = {
  REIMBURSEMENT: 'bg-teal-100 text-teal-700',
  INVOICE:       'bg-blue-100 text-blue-700',
  MOU:           'bg-violet-100 text-violet-700',
  GRIEVANCE:     'bg-rose-100 text-rose-700',
};

const PRIORITY_DOT: Record<string, string> = {
  HIGH:   'bg-red-500',
  MEDIUM: 'bg-amber-400',
  LOW:    'bg-emerald-400',
};

function StatusIcon({ s }: { s: string }) {
  if (s === 'APPROVED')  return <CheckCircle2 size={14} className="text-emerald-500"/>;
  if (s === 'REJECTED')  return <XCircle size={14} className="text-red-500"/>;
  if (s === 'ESCALATED') return <AlertTriangle size={14} className="text-orange-500"/>;
  return <Clock size={14} className="text-amber-500"/>;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function TicketsPage() {
  const [activeTab, setActiveTab]   = useState<TicketType | 'ALL'>('ALL');
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState<string>('ALL');

  const baseTickets = activeTab === 'ALL' ? DEMO_TICKETS : TICKETS_BY_TYPE[activeTab];
  const filtered = baseTickets.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                        t.requester.toLowerCase().includes(search.toLowerCase()) ||
                        t.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    ALL:           DEMO_TICKETS.length,
    REIMBURSEMENT: TICKETS_BY_TYPE.REIMBURSEMENT.length,
    INVOICE:       TICKETS_BY_TYPE.INVOICE.length,
    MOU:           TICKETS_BY_TYPE.MOU.length,
    GRIEVANCE:     TICKETS_BY_TYPE.GRIEVANCE.length,
  };

  return (
    <div className="py-6 pb-16 space-y-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tickets</h1>
          <p className="text-slate-500 text-sm mt-1">{DEMO_TICKETS.length} requests across all types</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Status filter */}
          <select value={statusFilter} onChange={e => setStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-600 font-medium outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm">
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="ESCALATED">Escalated</option>
          </select>
          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search tickets…"
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm w-56"/>
          </div>
        </div>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(tab => {
          const active = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150
                ${active
                  ? `${tab.bg} ${tab.color} border-current shadow-sm`
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
              {tab.icon}
              {tab.label}
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ml-0.5
                ${active ? 'bg-white/70' : 'bg-slate-100 text-slate-500'}`}>
                {counts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Summary stats row for active type */}
      <SummaryRow tickets={filtered} />

      {/* Ticket List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm py-16 flex flex-col items-center gap-3">
              <Filter size={32} className="text-slate-200"/>
              <p className="text-slate-400 font-semibold">No tickets match your filters</p>
              <button onClick={() => { setSearch(''); setStatus('ALL'); }}
                className="text-sm text-indigo-600 hover:underline font-semibold">Clear filters</button>
            </motion.div>
          ) : filtered.map((ticket, i) => (
            <TicketRow key={ticket.id} ticket={ticket} index={i} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Summary Stats ─────────────────────────────────────────────────────────────
function SummaryRow({ tickets }: { tickets: Ticket[] }) {
  const pending   = tickets.filter(t => t.status === 'PENDING').length;
  const approved  = tickets.filter(t => t.status === 'APPROVED').length;
  const escalated = tickets.filter(t => t.status === 'ESCALATED').length;
  const breached  = tickets.filter(t => t.sla === 'Breached').length;

  return (
    <div className="grid grid-cols-4 gap-3">
      {[
        { label:'Pending',   value: pending,   icon:<Clock size={15}/>,          color:'text-amber-600',  bg:'bg-amber-50  border-amber-100' },
        { label:'Approved',  value: approved,  icon:<CheckCircle2 size={15}/>,   color:'text-emerald-600',bg:'bg-emerald-50 border-emerald-100' },
        { label:'Escalated', value: escalated, icon:<AlertTriangle size={15}/>,  color:'text-orange-600', bg:'bg-orange-50 border-orange-100' },
        { label:'SLA Breached',value:breached, icon:<Zap size={15}/>,            color:'text-red-600',    bg:'bg-red-50    border-red-100' },
      ].map((s, i) => (
        <div key={i} className={`flex items-center gap-3 p-3.5 rounded-xl border ${s.bg} ${s.color}`}>
          {s.icon}
          <div>
            <p className="text-xl font-extrabold leading-tight">{s.value}</p>
            <p className="text-xs font-semibold opacity-70">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Ticket Row ─────────────────────────────────────────────────────────────────
function TicketRow({ ticket, index }: { ticket: Ticket; index: number }) {
  return (
    <motion.div
      layout initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
      exit={{ opacity:0, y:-8 }} transition={{ delay: index * 0.04, duration: 0.25 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 group"
    >
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Priority dot */}
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[ticket.priority]}`}/>

        {/* ID + Type */}
        <div className="flex-shrink-0 w-24">
          <p className="text-xs font-bold text-slate-400 font-mono">{ticket.id}</p>
          <span className={`inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${TYPE_BADGE[ticket.type]}`}>
            {ticket.type === 'REIMBURSEMENT' ? 'REIMB.' : ticket.type}
          </span>
        </div>

        {/* Title + requester */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 truncate">{ticket.title}</p>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            {ticket.requester} · {formatDistanceToNow(ticket.submittedAt)} ago
          </p>
        </div>

        {/* Amount (if any) */}
        {ticket.amount !== undefined && (
          <div className="flex-shrink-0 text-right">
            <p className="text-sm font-bold text-slate-700">${ticket.amount.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400">Amount</p>
          </div>
        )}

        {/* Status */}
        <div className="flex-shrink-0 flex items-center gap-1.5">
          <StatusIcon s={ticket.status}/>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[ticket.status]}`}>
            {ticket.status}
          </span>
        </div>

        {/* SLA */}
        <div className={`flex-shrink-0 text-xs w-28 text-right ${SLA_STYLE(ticket.sla)}`}>
          {ticket.dueIn}
        </div>

        {/* Assignee */}
        <div className="flex-shrink-0 text-xs text-slate-400 w-32 text-right hidden lg:block truncate">
          {ticket.assignee}
        </div>

        {/* CTA */}
        <Link href={`/ticket/${ticket.id}`}
          className="flex-shrink-0 flex items-center gap-1 text-xs text-indigo-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity ml-2 whitespace-nowrap">
          Review <ArrowRight size={13}/>
        </Link>
      </div>
    </motion.div>
  );
}
