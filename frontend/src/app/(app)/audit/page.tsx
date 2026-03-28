'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, ShieldCheck, Clock, AlertTriangle,
  CheckCircle2, XCircle, Zap, Repeat2, FileText, ChevronDown, Download
} from 'lucide-react';
import { DEMO_TICKETS } from '@/lib/demo-data';
import { formatDistanceToNow, format } from 'date-fns';

// Build audit log from all tickets
const ALL_EVENTS = DEMO_TICKETS.flatMap(ticket =>
  ticket.auditLog.map((log, i) => ({
    id: `${ticket.id}-${i}`,
    ticketId: ticket.id,
    ticketTitle: ticket.title,
    ticketType: ticket.type,
    time: new Date(ticket.submittedAt.getTime() + i * 60000 * 5),
    event: log.event,
    category: log.event.toLowerCase().includes('breach') || log.event.toLowerCase().includes('escalat') ? 'ESCALATION' :
              log.event.toLowerCase().includes('approv') ? 'APPROVAL' :
              log.event.toLowerCase().includes('reject') ? 'REJECTION' :
              log.event.toLowerCase().includes('classify') || log.event.toLowerCase().includes('classif') ? 'AI_DECISION' :
              log.event.toLowerCase().includes('pii') ? 'COMPLIANCE' : 'SYSTEM',
  }))
).sort((a, b) => b.time.getTime() - a.time.getTime());

const CATEGORY_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  ESCALATION:  { label:'Escalation',  color:'bg-orange-100 text-orange-700', icon:<AlertTriangle size={13}/> },
  APPROVAL:    { label:'Approval',    color:'bg-emerald-100 text-emerald-700',icon:<CheckCircle2 size={13}/> },
  REJECTION:   { label:'Rejection',   color:'bg-red-100 text-red-700',        icon:<XCircle size={13}/> },
  AI_DECISION: { label:'AI Decision', color:'bg-indigo-100 text-indigo-700',  icon:<Zap size={13}/> },
  COMPLIANCE:  { label:'Compliance',  color:'bg-violet-100 text-violet-700',  icon:<ShieldCheck size={13}/> },
  SYSTEM:      { label:'System',      color:'bg-slate-100 text-slate-600',    icon:<Repeat2 size={13}/> },
};

const TYPE_BADGE: Record<string, string> = {
  REIMBURSEMENT:'bg-teal-100 text-teal-700',
  INVOICE:'bg-blue-100 text-blue-700',
  MOU:'bg-violet-100 text-violet-700',
  GRIEVANCE:'bg-rose-100 text-rose-700',
};

const CATEGORIES = ['ALL', 'ESCALATION', 'APPROVAL', 'REJECTION', 'AI_DECISION', 'COMPLIANCE', 'SYSTEM'];

export default function AuditPage() {
  const [search, setSearch]     = useState('');
  const [catFilter, setCat]     = useState('ALL');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage]         = useState(1);
  const PER_PAGE = 15;

  const filtered = ALL_EVENTS.filter(ev => {
    const matchSearch = ev.event.toLowerCase().includes(search.toLowerCase()) ||
                        ev.ticketId.toLowerCase().includes(search.toLowerCase()) ||
                        ev.ticketTitle.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'ALL' || ev.category === catFilter;
    return matchSearch && matchCat;
  });

  const paginated = filtered.slice(0, page * PER_PAGE);
  const hasMore   = filtered.length > paginated.length;

  // Summary counts
  const counts = Object.fromEntries(
    CATEGORIES.slice(1).map(c => [c, ALL_EVENTS.filter(e => e.category === c).length])
  );

  return (
    <div className="py-6 pb-16 space-y-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Audit Logs</h1>
          <p className="text-slate-500 text-sm mt-1">
            {ALL_EVENTS.length} immutable events · append-only · tamper-proof
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 shadow-sm transition-all">
          <Download size={15}/> Export CSV
        </button>
      </div>

      {/* Summary Chips */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => {
          const active = catFilter === cat;
          const cfg    = CATEGORY_CONFIG[cat];
          const count  = cat === 'ALL' ? ALL_EVENTS.length : counts[cat] || 0;
          return (
            <button key={cat} onClick={() => { setCat(cat); setPage(1); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all
                ${active ? (cfg ? cfg.color + ' border-current shadow-sm' : 'bg-slate-800 text-white border-slate-800 shadow-sm')
                         : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
              {cfg && cfg.icon}
              {cat === 'ALL' ? 'All Events' : cfg.label}
              <span className={`ml-0.5 px-1.5 rounded-full text-[10px] ${active ? 'bg-white/30' : 'bg-slate-100 text-slate-400'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search events, ticket ID, or title…"
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"/>
      </div>

      {/* Log List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <div className="col-span-2">Time</div>
          <div className="col-span-2">Ticket</div>
          <div className="col-span-1">Type</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-5">Event</div>
        </div>

        <div className="divide-y divide-slate-50">
          <AnimatePresence initial={false}>
            {paginated.map((ev, i) => {
              const cfg = CATEGORY_CONFIG[ev.category];
              const isOpen = expanded === ev.id;
              return (
                <motion.div key={ev.id}
                  initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay: i * 0.015, duration: 0.2 }}>
                  <button onClick={() => setExpanded(isOpen ? null : ev.id)}
                    className="w-full grid grid-cols-12 gap-2 px-5 py-3 text-left hover:bg-slate-50 transition-colors group items-center">
                    <div className="col-span-2">
                      <p className="text-xs text-slate-700 font-mono font-bold">{format(ev.time, 'HH:mm:ss')}</p>
                      <p className="text-[10px] text-slate-400">{formatDistanceToNow(ev.time)} ago</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs font-bold text-indigo-600 font-mono">{ev.ticketId}</p>
                    </div>
                    <div className="col-span-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${TYPE_BADGE[ev.ticketType]}`}>
                        {ev.ticketType === 'REIMBURSEMENT' ? 'REIMB' : ev.ticketType.slice(0,3)}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>
                    <div className="col-span-4 flex items-center gap-2">
                      <p className={`text-sm text-slate-700 truncate ${ev.category==='ESCALATION' ? 'text-red-600 font-semibold' : ''}`}>
                        {ev.event}
                      </p>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <ChevronDown size={14} className={`text-slate-300 group-hover:text-slate-500 transition-all ${isOpen ? 'rotate-180' : ''}`}/>
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
                        className="overflow-hidden border-t border-slate-50 bg-slate-50/50 px-5 py-3">
                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <div>
                            <p className="text-slate-400 font-bold uppercase tracking-wider mb-1">Ticket</p>
                            <p className="text-slate-700 font-semibold">{ev.ticketTitle}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 font-bold uppercase tracking-wider mb-1">Event SHA</p>
                            <p className="font-mono text-slate-500 text-[10px]">{ev.id.replace(/-/g,'').substring(0,32)}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 font-bold uppercase tracking-wider mb-1">Timestamp (ISO)</p>
                            <p className="font-mono text-slate-500 text-[10px]">{ev.time.toISOString()}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Load more */}
        {hasMore && (
          <div className="border-t border-slate-100 px-5 py-3 bg-slate-50 text-center">
            <button onClick={() => setPage(p => p + 1)}
              className="text-sm text-indigo-600 font-bold hover:underline">
              Load more ({filtered.length - paginated.length} remaining)
            </button>
          </div>
        )}
        {filtered.length === 0 && (
          <div className="py-12 flex flex-col items-center gap-2 text-slate-400">
            <Filter size={28} className="text-slate-200"/>
            <p className="font-semibold">No events match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
