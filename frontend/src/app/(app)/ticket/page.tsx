'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import useSWR from 'swr';
import { fetcher, API_ROUTES } from '@/lib/api';
import {
  CreditCard, FileText, Handshake, MessageSquareWarning,
  ArrowRight, Search, Filter, Clock, AlertTriangle, CheckCircle2, XCircle, Zap, Plus, Send, Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// ── Config ────────────────────────────────────────────────────────────────────
const TABS: { key: string | 'ALL'; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
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
  const { data: tickets, mutate } = useSWR(API_ROUTES.TICKETS, fetcher, { refreshInterval: 5000 });
  const [activeTab, setActiveTab]   = useState<string | 'ALL'>('ALL');
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState<string>('ALL');
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const displayTickets = tickets || [];

  const filtered = displayTickets.filter((t: any) => {
    const titleMatch = (t.title || t.rawText || '').toLowerCase().includes(search.toLowerCase());
    const idMatch = t.id.toLowerCase().includes(search.toLowerCase());
    const matchSearch = titleMatch || idMatch;
    
    const matchTab = activeTab === 'ALL' || t.type === activeTab;
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    
    return matchSearch && matchTab && matchStatus;
  });

  const counts: any = {
    ALL: displayTickets.length,
    REIMBURSEMENT: displayTickets.filter((t:any) => t.type === 'REIMBURSEMENT').length,
    INVOICE: displayTickets.filter((t:any) => t.type === 'INVOICE').length,
    MOU: displayTickets.filter((t:any) => t.type === 'MOU').length,
    GRIEVANCE: displayTickets.filter((t:any) => t.type === 'GRIEVANCE').length,
  };

  return (
    <div className="py-6 pb-16 space-y-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tickets</h1>
          <p className="text-slate-500 text-sm mt-1">{displayTickets.length} requests across all types</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-md transition-all active:scale-95"
          >
            <Plus size={16}/> New Request
          </button>
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
                {counts[tab.key] || 0}
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
              <p className="text-slate-400 font-semibold">No tickets found</p>
              <button onClick={() => { setSearch(''); setStatus('ALL'); setActiveTab('ALL'); }}
                className="text-sm text-indigo-600 hover:underline font-semibold">Clear filters</button>
            </motion.div>
          ) : filtered.map((ticket: any, i: number) => (
            <TicketRow key={ticket.id} ticket={ticket} index={i} />
          ))}
        </AnimatePresence>
      </div>

      {/* Submission Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <SubmitTicketModal 
            onClose={() => setShowSubmitModal(false)} 
            onSuccess={() => {
              mutate();
              setShowSubmitModal(false);
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Submit Ticket Modal ───────────────────────────────────────────────────────
function SubmitTicketModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:4000/ingest/mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error('Submission failed');
      
      // Artificial delay for that agentic feel
      await new Promise(r => setTimeout(r, 800));
      onSuccess();
    } catch (err) {
      setError('Could not submit request. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity:0, scale:0.9, y:20 }}
        animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.9, y:20 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
      >
        <div className="bg-indigo-600 p-6 text-white overflow-hidden relative">
          <Zap className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
          <h2 className="text-xl font-bold">Submit New Request</h2>
          <p className="text-indigo-100 text-sm mt-1 opacity-80">Our Thinking Engine will classify and route your request automatically.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Request Narrative</label>
            <textarea
              required
              rows={4}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Example: I need to reimburse $15.50 for student council coffee supplies..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 placeholder-slate-400 text-sm outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"
            />
            <p className="text-[10px] text-slate-400 mt-2 italic px-1">
              Tip: Include amounts ($), vendor names, or purpose. The AI handles the rest.
            </p>
          </div>

          {error && (
            <p className="text-red-500 text-xs font-semibold bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-200 transition-all active:scale-[.98]"
            >
              {loading ? <Loader2 size={18} className="animate-spin"/> : <><Send size={18}/> Submit to Engine</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Summary Stats ─────────────────────────────────────────────────────────────
function SummaryRow({ tickets }: { tickets: any[] }) {
  const pending   = tickets.filter(t => t.status === 'PENDING').length;
  const approved  = tickets.filter(t => t.status === 'APPROVED').length;
  const escalated = tickets.filter(t => t.status === 'ESCALATED').length;
  const total     = tickets.length;

  return (
    <div className="grid grid-cols-4 gap-3">
      {[
        { label:'Pending',   value: pending,   icon:<Clock size={15}/>,          color:'text-amber-600',  bg:'bg-amber-50  border-amber-100' },
        { label:'Approved',  value: approved,  icon:<CheckCircle2 size={15}/>,   color:'text-emerald-600',bg:'bg-emerald-50 border-emerald-100' },
        { label:'Escalated', value: escalated, icon:<AlertTriangle size={15}/>,  color:'text-orange-600', bg:'bg-orange-50 border-orange-100' },
        { label:'Total View',value: total,     icon:<FileText size={15}/>,       color:'text-slate-600',  bg:'bg-slate-50   border-slate-200' },
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
function TicketRow({ ticket, index }: { ticket: any; index: number }) {
  return (
    <motion.div
      layout initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
      exit={{ opacity:0, y:-8 }} transition={{ delay: index * 0.04, duration: 0.25 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 group"
    >
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Priority dot */}
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[ticket.urgency] || 'bg-slate-300'}`}/>

        {/* ID + Type */}
        <div className="flex-shrink-0 w-24">
          <p className="text-xs font-bold text-slate-400 font-mono">{ticket.id.slice(0, 8)}</p>
          <span className={`inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${TYPE_BADGE[ticket.type] || 'bg-slate-100 text-slate-400'}`}>
            {ticket.type === 'REIMBURSEMENT' ? 'REIMB.' : ticket.type}
          </span>
        </div>

        {/* Title + requester */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 truncate">{ticket.title || ticket.rawText || 'Auto-generated Title'}</p>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            {ticket.requester?.name || 'Anonymous'} · {formatDistanceToNow(new Date(ticket.createdAt))} ago
          </p>
        </div>

        {/* Amount (if any) */}
        {ticket.amount !== null && (
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
        <div className={`flex-shrink-0 text-xs w-28 text-right ${SLA_STYLE('On Track')}`}>
          Due in 24h
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
