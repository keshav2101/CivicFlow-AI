'use client';

import { useState, use, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  AlertTriangle, CheckCircle2, XCircle, Clock, User, ChevronDown,
  ChevronRight, BrainCircuit, GitCommit, X, Layers, PanelRight,
  ArrowLeft, CreditCard, FileText, Handshake, MessageSquareWarning
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import useSWR, { mutate } from 'swr';
import { fetcher, API_ROUTES } from '@/lib/api';
import { getTicketById, DEMO_TICKETS, type Clause } from '@/lib/demo-data';

const STATUS_CONFIG = {
  APPROVED: { label:'Approved', color:'bg-emerald-100 text-emerald-700', icon:<CheckCircle2 size={12}/> },
  PENDING:  { label:'Pending',  color:'bg-amber-100  text-amber-700',    icon:<Clock size={12}/> },
  REJECTED: { label:'Rejected', color:'bg-red-100    text-red-700',      icon:<XCircle size={12}/> },
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  REIMBURSEMENT: <CreditCard size={16} className="text-teal-600"/>,
  INVOICE:       <FileText size={16} className="text-blue-600"/>,
  MOU:           <Handshake size={16} className="text-violet-600"/>,
  GRIEVANCE:     <MessageSquareWarning size={16} className="text-rose-600"/>,
};

const PRIORITY_COLOR: Record<string, string> = {
  HIGH:'text-red-600 bg-red-50 border-red-200',
  MEDIUM:'text-amber-600 bg-amber-50 border-amber-200',
  LOW:'text-emerald-600 bg-emerald-50 border-emerald-200',
};

export default function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  // Real data fetch
  const { data: tickets } = useSWR(API_ROUTES.TICKETS, fetcher);
  const ticket = tickets?.find((t: any) => t.id === id) || getTicketById(id);
  
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [sidebarOpen, setSidebar] = useState(false);
  const [toast, setToast]         = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = async (action: 'approve' | 'reject', feedback?: string) => {
    if (!ticket) return;
    setIsProcessing(true);
    try {
      const endpoint = action === 'approve' ? API_ROUTES.APPROVE : API_ROUTES.REJECT;
      const res = await fetch(`http://localhost:4000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ticketId: ticket.id, 
          approverId: ticket.approvals?.[0]?.approverId || 'demo-user-id',
          stepIndex: 1,
          feedback 
        }),
      });
      if (res.ok) {
        showToast(`Ticket ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
        mutate(API_ROUTES.TICKETS);
      } else {
        showToast(`Failed to ${action} ticket.`);
      }
    } catch (err) {
      showToast('Action failed. Check console.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClauseAction = async (clauseId: string, action: string, constraints?: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`http://localhost:4000/review/clause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
           clauseId, 
           partyId: ticket?.approvals?.[0]?.approverId || 'system',
           action, 
           constraints 
        }),
      });
      if (res.ok) {
        showToast(`Clause ${action} successfully.`);
      } else {
        showToast(`Failed to ${action} clause.`);
      }
    } catch (err) {
      showToast('Clause action failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!ticket) return (
    <div className="py-20 flex flex-col items-center gap-4">
      <p className="text-2xl font-bold text-slate-300">Ticket not found</p>
      <Link href="/ticket" className="text-indigo-600 font-semibold hover:underline flex items-center gap-1">
        <ArrowLeft size={15}/> Back to Tickets
      </Link>
    </div>
  );

  // ── Flatten nested MoU data for the UI ──────────────────────────────────────
  const clauses = useMemo(() => {
    if (ticket.type !== 'MOU' || !ticket.documents?.[0]?.clauses) return [];
    
    return (ticket.documents[0].clauses as any[]).map(clause => {
      const latest = clause.revisions?.[0] || {};
      const original = clause.revisions?.find((r:any) => r.version === 1) || latest;
      
      return {
        id: clause.id,
        title: clause.title || "Untitled Clause",
        status: clause.statusPartyA === 'APPROVED' && clause.statusPartyB === 'APPROVED' ? 'APPROVED' : 'PENDING',
        updatedAt: clause.updatedAt,
        preview: latest.text?.slice(0, 80) + '...',
        original: original.text || "",
        revised: latest.text || "",
        explanation: latest.explanation?.reasoning || "AI recommendation based on standard organizational policy."
      };
    });
  }, [ticket]);

  return (
    <div className="py-6 pb-16 max-w-4xl mx-auto space-y-5 relative">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }}
            className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400"/> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back nav */}
      <Link href="/ticket" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-600 transition-colors font-semibold">
        <ArrowLeft size={15}/> Back to Tickets
      </Link>

      {/* ── Step 1: Ticket Summary ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2 mb-2">
              <span className="text-xs font-bold text-slate-400 font-mono">{ticket.id}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${PRIORITY_COLOR[ticket.urgency] || 'bg-slate-50 text-slate-500'}`}>
                {ticket.urgency} PRIORITY
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                {TYPE_ICON[ticket.type]} {ticket.type.replace('REIMBURSEMENT','REIMBURSEMENT')}
              </span>
              {ticket.sla === 'Breached' && (
                <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                  <AlertTriangle size={11}/> SLA Breached
                </span>
              )}
              {ticket.sla === 'At Risk' && (
                <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  <Clock size={11}/> {ticket.dueIn}
                </span>
              )}
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 leading-tight">
              {ticket.type} Request — {ticket.id.slice(0, 8)}
            </h1>
            <p className="text-sm text-slate-500 mt-1.5 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1"><User size={13}/> {ticket.requester?.name || 'Unknown'}</span>
              <span>→ Finance Queue</span>
              {ticket.amount && (
                <span className="font-bold text-slate-700">${ticket.amount.toLocaleString()}</span>
              )}
              <span>{formatDistanceToNow(new Date(ticket.createdAt))} ago</span>
            </p>
            {/* Summary */}
            <p className="text-sm text-slate-600 mt-3 leading-relaxed bg-slate-50 rounded-xl p-3 border border-slate-100 italic">
              "{ticket.rawText}"
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setSidebar(v=>!v)}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors" title="Details">
              <PanelRight size={18}/>
            </button>
            <button onClick={() => handleAction('reject')} disabled={isProcessing}
              className="px-4 py-2 border border-slate-200 text-sm font-semibold text-slate-700 rounded-xl hover:bg-slate-50 transition-colors">
              Reject
            </button>
            <button onClick={() => handleAction('approve')} disabled={isProcessing}
              className={`px-5 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm ${isProcessing ? 'opacity-50' : ''}`}>
              {isProcessing ? 'Processing...' : 'Approve All'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Step 2: Clauses (for MOU) or Info cards (others) ──────────────── */}
      {clauses.length > 0 ? (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Layers size={15} className="text-slate-400"/>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Clauses ({clauses.length})</h2>
          </div>
          <div className="space-y-3">
            {clauses.map((clause: any) => (
              <ClauseCard key={clause.id} clause={clause}
                open={expanded === clause.id}
                onToggle={() => setExpanded(expanded === clause.id ? null : clause.id)}
                onAction={handleClauseAction}
                isProcessing={isProcessing}/>
            ))}
          </div>
        </div>
      ) : (
        /* For non-MOU tickets show a details card */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Request Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <InfoBlock label="Type"       value={ticket.type} />
            <InfoBlock label="Status"     value={ticket.status} />
            <InfoBlock label="Requester"  value={ticket.requester?.name || 'Unknown'} />
            <InfoBlock label="Org"        value={ticket.organization?.name || 'N/A'} />
            {ticket.amount && <InfoBlock label="Amount" value={`$${ticket.amount.toLocaleString()}`}/>}
            <InfoBlock label="SLA"        value="On Track" />
          </div>
          {/* AI explanation */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1.5">
              <BrainCircuit size={13}/> AI Reasoning Trace
            </p>
            <p className="text-sm text-slate-700 font-medium">
              {ticket.explanation?.reasoning || 'No reasoning trace available for this classification.'}
            </p>
            {ticket.explanation?.explanation && (
                <p className="text-xs text-slate-500 mt-2 p-2 bg-white/50 rounded-lg italic">
                    "{ticket.explanation.explanation}"
                </p>
            )}
          </div>
          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button onClick={() => handleAction('approve')} disabled={isProcessing || ticket.status === 'APPROVED'}
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm">
              Approve
            </button>
            <button onClick={() => handleAction('reject')} disabled={isProcessing || ticket.status === 'REJECTED'}
              className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-sm font-bold rounded-xl hover:bg-red-100 disabled:opacity-50 transition-colors">
              Reject
            </button>
          </div>
        </div>
      )}

      {/* ── Collapsible Sidebar ────────────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 bg-black/20 z-30 backdrop-blur-[1px]"
              onClick={() => setSidebar(false)}/>
            <motion.aside
              initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }}
              transition={{ type:'spring', stiffness:300, damping:30 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-40 flex flex-col overflow-y-auto">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">Details & Audit</h3>
                <button onClick={() => setSidebar(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                  <X size={18} className="text-slate-500"/>
                </button>
              </div>
              <div className="p-5 space-y-6">
                {/* Approval Chain */}
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Approval Chain</h4>
                  <ol className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-0 before:bottom-0 before:w-px before:bg-slate-200">
                    {[
                      { label:'System AI Guard',   sub:'PII check + classification', done:true },
                      { label:'Policy Engine',     sub:'Threshold rules validated',  done:true },
                      { label: ticket.approvals?.[0]?.approver?.name || 'Assigned Approver', sub: ticket.status === 'APPROVED' ? 'Policy Resolved' : 'Awaiting Review', done: ticket.status === 'APPROVED' },
                      { label:'Resolution',        sub: ticket.status === 'APPROVED' ? 'Finalized' : 'Pending', done: ticket.status === 'APPROVED' },
                    ].map((step, i) => (
                      <li key={i} className="relative flex items-start gap-3">
                        <span className={`absolute -left-[14px] mt-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center
                          ${step.done ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                          {step.done && <CheckCircle2 size={10} className="text-white"/>}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{step.label}</p>
                          <p className={`text-xs mt-0.5 text-slate-400`}>{step.sub}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* AI Explainability */}
                <CollapsibleSection icon={<BrainCircuit size={14}/>} title="AI Reasoning" defaultOpen>
                  <div className="space-y-2.5 text-sm">
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="font-semibold text-slate-800 italic">"{(ticket.explanation as any)?.reasoning || ticket.explanation.routing}"</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-slate-600 text-xs">{(ticket.explanation as any)?.classification || 'Extraction complete'}</p>
                    </div>
                  </div>
                </CollapsibleSection>

                {/* Audit trail */}
                <CollapsibleSection icon={<GitCommit size={14}/>} title="Audit Trail">
                  <ul className="text-xs text-slate-500 space-y-2 font-mono">
                    {(ticket.auditLog || []).map((log: any, i: number) => (
                      <li key={i} className={log.event.toLowerCase().includes('breach') || log.event.toLowerCase().includes('escalat')
                        ? 'text-red-500 font-bold' : ''}>
                        <span className="text-slate-300 mr-2">{log.time}</span>{log.event}
                      </li>
                    ))}
                  </ul>
                </CollapsibleSection>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-semibold text-slate-800 truncate">{value}</p>
    </div>
  );
}

function ClauseCard({ clause, open, onToggle, onAction, isProcessing }: {
  clause: any; open: boolean; onToggle: () => void; onAction: (id: string, action: string, constraints?: string) => void; isProcessing: boolean;
}) {
  const [suggest, setSuggest] = useState(false);
  const [text, setText] = useState('');
  const statusKey = (clause.status as keyof typeof STATUS_CONFIG) || 'PENDING';
  const cfg = STATUS_CONFIG[statusKey];

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 shadow-sm overflow-hidden
      ${open ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-slate-100 hover:border-slate-200 hover:shadow-md'}`}>
      <button onClick={onToggle} className="w-full flex items-center justify-between px-5 py-4 text-left">
        <div className="flex items-center gap-3 min-w-0">
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.color}`}>
            {cfg.icon} {cfg.label}
          </span>
          <span className="font-semibold text-slate-800 truncate">{clause.title}</span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          <span className="text-xs text-slate-400 hidden sm:block">
            Updated {formatDistanceToNow(clause.updatedAt)} ago
          </span>
          <ChevronRight size={16} className={`text-slate-400 transition-transform duration-200 ${open?'rotate-90':''}`}/>
        </div>
      </button>

      {!open && <p className="text-sm text-slate-500 px-5 pb-4 truncate">{clause.preview}</p>}

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
            exit={{ height:0, opacity:0 }} transition={{ duration:0.25 }} className="border-t border-slate-100">
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] font-bold text-red-500 uppercase tracking-wider mb-1.5">Original</p>
                  <div className="text-sm bg-red-50 text-red-900 border border-red-100 rounded-xl p-3 leading-relaxed line-through decoration-red-300">
                    {clause.original}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1.5">AI Revision</p>
                  <div className="text-sm bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-xl p-3 leading-relaxed">
                    {clause.revised}
                  </div>
                </div>
              </div>

              <details className="group text-sm">
                <summary className="cursor-pointer flex items-center gap-2 text-slate-500 hover:text-slate-700 select-none list-none">
                  <BrainCircuit size={14} className="text-indigo-400"/>
                  <span className="font-medium">Why this decision?</span>
                  <ChevronDown size={14} className="group-open:rotate-180 transition-transform ml-auto"/>
                </summary>
                <p className="mt-2 text-slate-600 bg-slate-50 border border-slate-100 rounded-xl p-3 leading-relaxed text-xs">
                  {clause.explanation}
                </p>
              </details>

              <AnimatePresence>
                {suggest && (
                  <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Constraints for AI Negotiator</label>
                    <textarea value={text} onChange={e => setText(e.target.value)} rows={2}
                      placeholder="e.g. Keep liability under 1× and add mutual termination clause…"
                      className="w-full border border-slate-200 rounded-xl text-sm p-3 resize-none outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 bg-slate-50 transition-all"/>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-2 pt-1">
                <button 
                  onClick={() => onAction(clause.id, 'approve')}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50">Approve</button>
                <button 
                  onClick={() => onAction(clause.id, 'reject')}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-sm font-bold rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50">Reject</button>
                <button onClick={() => setSuggest(v=>!v)}
                  disabled={isProcessing}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50">
                  {suggest ? 'Cancel' : 'Suggest Change'}
                </button>
                {suggest && text.trim() && (
                  <button 
                    onClick={() => { onAction(clause.id, 'rewrite', text); setSuggest(false); setText(''); }}
                    disabled={isProcessing}
                    className="ml-auto px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50">Send to AI →</button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CollapsibleSection({ title, icon, children, defaultOpen = false }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(v=>!v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <span className="text-slate-400">{icon}</span>{title}
        </span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${open?'rotate-180':''}`}/>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height:0 }} animate={{ height:'auto' }} exit={{ height:0 }} transition={{ duration:0.2 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
