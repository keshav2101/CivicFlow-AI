'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Clock, Zap, Inbox, TrendingUp, TrendingDown,
  CheckCircle2, AlertTriangle, Circle, ArrowRight, RefreshCw,
  BarChart3, Users, FileText, Repeat2, PieChart
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import useSWR from 'swr';
import { fetcher, API_ROUTES } from '@/lib/api';
import { DEMO_TICKETS, TICKETS_BY_TYPE } from '@/lib/demo-data';

// ── Animated counter hook ─────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1400, decimals = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(parseFloat((eased * target).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, decimals]);
  return value;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const BAR_DATA = [
  { day: 'Mon', tickets: 41, approved: 38 },
  { day: 'Tue', tickets: 78, approved: 71 },
  { day: 'Wed', tickets: 53, approved: 49 },
  { day: 'Thu', tickets: 94, approved: 88 },
  { day: 'Fri', tickets: 68, approved: 62 },
  { day: 'Sat', tickets: 29, approved: 27 },
  { day: 'Sun', tickets: 12, approved: 12 },
];

const FEED_ITEMS = [
  { id:1, type:'approved', text:'Invoice #INV-0042 approved by Finance Lead', time: new Date(Date.now() - 5*60000) },
  { id:2, type:'clause',   text:'AI re-drafted Payment Terms clause for MOU-019', time: new Date(Date.now() - 18*60000) },
  { id:3, type:'breach',   text:'SLA breached — MOU #012 auto-escalated', time: new Date(Date.now() - 92*60000) },
  { id:4, type:'approved', text:'Reimbursement RMB-091 approved', time: new Date(Date.now() - 180*60000) },
  { id:5, type:'pending',  text:'Grievance GRV-003 awaiting HR review', time: new Date(Date.now() - 310*60000) },
  { id:6, type:'learn',    text:'Adaptive: SLA extended +60m for Legal queue', time: new Date(Date.now() - 400*60000) },
];

const TICKET_PREVIEWS = [
  { id:'TCK-1234', type:'MOU',           title:'Acme Corp Partnership Agreement',  status:'PENDING',  sla:'Breached' },
  { id:'TCK-1235', type:'INVOICE',       title:'Vendor Invoice — Cloud Services',  status:'APPROVED', sla:'On Track' },
  { id:'TCK-1236', type:'REIMBURSEMENT', title:'Team Hackathon Travel Expenses',    status:'PENDING',  sla:'Due in 2h' },
  { id:'TCK-1237', type:'GRIEVANCE',     title:'Anonymous Conduct Complaint',       status:'PENDING',  sla:'Due in 45m' },
];

const FEED_ICON: Record<string, React.ReactNode> = {
  approved: <CheckCircle2 size={15} className="text-emerald-500"/>,
  breach:   <AlertTriangle size={15} className="text-red-400"/>,
  clause:   <FileText size={15} className="text-blue-500"/>,
  pending:  <Circle size={15} className="text-amber-400"/>,
  learn:    <Repeat2 size={15} className="text-violet-400"/>,
};

const STATUS_STYLE: Record<string,string> = {
  PENDING:  'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
};
const SLA_STYLE = (s: string) =>
  s === 'Breached' ? 'text-red-500 font-bold' :
  s === 'On Track' ? 'text-emerald-600' : 'text-amber-600 font-semibold';

const TYPE_COLOR: Record<string,string> = {
  MOU:'bg-violet-100 text-violet-700', INVOICE:'bg-blue-100 text-blue-700',
  REIMBURSEMENT:'bg-teal-100 text-teal-700', GRIEVANCE:'bg-rose-100 text-rose-700',
};

const TYPE_COLORS_HEX: Record<string, string> = {
  REIMBURSEMENT:'#14b8a6', INVOICE:'#3b82f6', MOU:'#8b5cf6', GRIEVANCE:'#f43f5e',
};
const TYPE_LABEL: Record<string, string> = {
  REIMBURSEMENT:'Reimbursements', INVOICE:'Invoices', MOU:'MoUs', GRIEVANCE:'Grievances',
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { data: tickets, error: ticketsErr } = useSWR(API_ROUTES.TICKETS, fetcher, { refreshInterval: 5000 });
  const { data: metrics, error: metricsErr } = useSWR(API_ROUTES.METRICS_SUMMARY, fetcher, { refreshInterval: 10000 });
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('civicflow_user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  const displayName = user?.name || 'Alex';
  const displayRole = user?.role || 'Admin';
  
  const [loading, setLoading]       = useState(true);
  const [activeBar, setActiveBar]   = useState<number | null>(null);
  const [feedPaused, setFeedPaused] = useState(false);
  const [tickerIdx, setTickerIdx]   = useState(0);

  const displayTickets = tickets || [];
  
  // Calculate real Weekly Ticket Volume (Bar Chart)
  const barData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayTickets = displayTickets.filter((t: any) => 
      new Date(t.createdAt).toDateString() === d.toDateString()
    );
    return {
      day: dayName,
      tickets: dayTickets.length,
      approved: dayTickets.filter((t: any) => t.status === 'APPROVED').length
    };
  });

  useEffect(() => { 
    if (tickets || ticketsErr) setLoading(false);
  }, [tickets, ticketsErr]);

  // Live ticker cycling
  useEffect(() => {
    if (feedPaused) return;
    const t = setInterval(() => setTickerIdx(i => (i + 1) % FEED_ITEMS.length), 3800);
    return () => clearInterval(t);
  }, [feedPaused]);

  const maxH = Math.max(...barData.map(d => d.tickets), 1);

  const typeBreakdown = Object.entries(TICKETS_BY_TYPE).map(([type, mockTickets]) => {
    const realCount = displayTickets.filter((t: any) => (t.type || t.requestType) === type).length;
    return {
      type, 
      count: realCount,
      pct: Math.round((realCount / (displayTickets.length || 1)) * 100),
    };
  });

  return (
    <div className="py-6 pb-16 space-y-8 max-w-6xl mx-auto">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }} className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Good afternoon, <span className="text-indigo-600">{displayName} ({displayRole})</span> 👋
          </h1>
          <p className="text-slate-500 mt-1">Here's your operations snapshot for today.</p>
        </div>
        <button onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 600); }}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 shadow-sm transition-all active:scale-95">
          <RefreshCw size={15}/> Refresh
        </button>
      </motion.div>

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? [1,2,3,4].map(i => (
          <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse"/>
        )) : (
          <>
            <KPICard delay={0}  icon={<ShieldCheck/>} label="SLA Compliance"  value={metrics?.slaComplianceRate || 94.2}  decimals={1} suffix="%" trend="+0.5%" positive bg="from-indigo-500 to-violet-600"    />
            <KPICard delay={1}  icon={<Clock/>}        label="Avg Turnaround"  value={metrics?.avgApprovalTimeMinutes || 14.5}  decimals={1} suffix="m" trend="−4m"   positive bg="from-emerald-500 to-teal-600"   />
            <KPICard delay={2}  icon={<Zap/>}          label="Automation Rate" value={metrics?.routingAccuracy || 94.9}  decimals={1} suffix="%" trend="+1.2%" positive bg="from-blue-500 to-cyan-600"       />
            <KPICard delay={3}  icon={<Inbox/>}        label="Active Tickets"  value={displayTickets.filter((t:any) => t.status === 'PENDING').length}    decimals={0} suffix=""  trend="4 due" positive={false} bg="from-amber-500 to-orange-500" />
          </>
        )}
      </section>

      {/* ── Chart + Feed row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Request Types Donut Chart */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
          <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
            <PieChart size={17} className="text-violet-500"/> Request Types
          </h2>
          <div className="flex-1 flex items-center justify-center">
            <DonutChart data={typeBreakdown} total={displayTickets.length} />
          </div>
        </motion.div>

        {/* Interactive Bar Chart */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <BarChart3 size={18} className="text-indigo-500"/> Weekly Ticket Volume
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Click a bar to inspect that day</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-indigo-200 inline-block"/>Total</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-400 inline-block"/>Approved</span>
            </div>
          </div>

          {/* Tooltip for selected bar */}
          <AnimatePresence>
            {activeBar !== null && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                className="mb-4 flex items-center gap-4 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5 text-sm">
                <span className="font-bold text-indigo-700">{barData[activeBar].day}</span>
                <span className="text-slate-600">Total: <b>{barData[activeBar].tickets}</b></span>
                <span className="text-emerald-600">Approved: <b>{barData[activeBar].approved}</b></span>
                <span className="text-slate-500">
                  Approval rate: <b>{barData[activeBar].tickets > 0 ? Math.round(barData[activeBar].approved / barData[activeBar].tickets * 100) : 0}%</b>
                </span>
                <button onClick={() => setActiveBar(null)} className="ml-auto text-slate-400 hover:text-slate-600 text-lg leading-none">×</button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-2 h-44 mt-2">
            {barData.map((d, i) => {
              const isActive = activeBar === i;
              return (
                <div key={i} className="bar-col flex-1 flex flex-col items-center gap-1.5 cursor-pointer group"
                  onClick={() => setActiveBar(isActive ? null : i)}>
                  <div className="w-full flex flex-col items-center gap-0.5" style={{ height: '100%' }}>
                    {/* Total bar */}
                    <div className="w-full mt-auto flex flex-col items-center">
                      <motion.div
                        initial={{ height:0 }} animate={{ height: `${(d.tickets/maxH)*100}%` }}
                        transition={{ duration:0.7, delay: i*0.07, ease:'easeOut' }}
                        className={`w-full bar-fill rounded-t-lg transition-colors relative overflow-hidden
                          ${isActive ? 'bg-indigo-400' : 'bg-indigo-150 hover:bg-indigo-200'}`}
                        style={{ minHeight:'4px', backgroundColor: isActive ? '#818cf8' : '#c7d2fe' }}
                      >
                        {/* Approved overlay */}
                        <motion.div
                          initial={{ height:0 }} animate={{ height: `${(d.approved/d.tickets)*100}%` }}
                          transition={{ duration:0.9, delay: i*0.07 + 0.4, ease:'easeOut' }}
                          className="absolute bottom-0 left-0 right-0 bg-emerald-400 rounded-t-lg"
                        />
                      </motion.div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>{d.day}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live activity feed */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
          className="lg:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-800 text-base">Live Activity</h2>
            <button onClick={() => setFeedPaused(v=>!v)}
              className={`text-[10px] font-bold px-2 py-1 rounded-full transition-colors ${feedPaused ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {feedPaused ? '⏸ Paused' : '● Live'}
            </button>
          </div>

          {/* Animated ticker on top */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 mb-4 min-h-[56px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.div key={tickerIdx}
                initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                transition={{ duration: 0.35 }}
                className="flex items-center gap-2.5 text-sm">
                <span className="flex-shrink-0">{FEED_ICON[FEED_ITEMS[tickerIdx].type]}</span>
                <div>
                  <p className="text-slate-700 font-medium leading-snug">{FEED_ITEMS[tickerIdx].text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDistanceToNow(FEED_ITEMS[tickerIdx].time)} ago</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Static list */}
          <ul className="space-y-3.5 flex-1 overflow-hidden">
            {FEED_ITEMS.slice(0, 4).map(item => (
              <li key={item.id} className="flex items-start gap-2.5 group">
                <div className="mt-0.5 flex-shrink-0">{FEED_ICON[item.type]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 truncate">{item.text}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{formatDistanceToNow(item.time)} ago</p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>

      {/* ── Recent Tickets Table ────────────────────────────────────────────── */}
      <motion.section initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }} className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <FileText size={18} className="text-slate-400"/> Recent Tickets
          </h2>
          <Link href="/ticket" className="text-sm text-indigo-600 font-semibold hover:underline flex items-center gap-1">
            View all <ArrowRight size={14}/>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-left">
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Title</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">SLA</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayTickets.slice(0, 10).map((t: any, i: number) => (
                <motion.tr key={t.id}
                  initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: 0.55 + i*0.06 }}
                  className="hover:bg-indigo-50/40 transition-colors cursor-pointer group">
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-500 font-bold">{t.id.slice(0, 8)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${TYPE_COLOR[t.type] || TYPE_COLOR.MOU}`}>{t.type}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 font-medium truncate max-w-[240px]">{t.title || t.rawText || 'No Title'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${STATUS_STYLE[t.status]}`}>{t.status}</span>
                  </td>
                  <td className={`px-5 py-3.5 text-xs ${SLA_STYLE(t.sla || 'On Track')}`}>{t.sla || 'On Track'}</td>
                  <td className="px-5 py-3.5">
                    <Link href={`/ticket/${t.id}`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-indigo-600 font-semibold">
                      Review <ArrowRight size={13}/>
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>
      </div>

      {/* ── Stats Row ───────────────────────────────────────────────────────── */}
      <motion.section initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Total Requests',    value:displayTickets.length,  icon:<FileText size={18}/>,  color:'text-indigo-500' },
          { label:'AI Decisions',      value:displayTickets.length * 47, icon:<Zap size={18}/>,       color:'text-emerald-500' },
          { label:'Active Users',      value:14,  icon:<Users size={18}/>,     color:'text-blue-500' },
          { label:'Clauses Negotiated',value:47,  icon:<Repeat2 size={18}/>,   color:'text-violet-500' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`p-2 bg-slate-50 rounded-xl ${s.color}`}>{s.icon}</div>
            <div>
              <CountText target={s.value} className="text-xl font-extrabold text-slate-900"/>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </motion.section>
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KPICard({ icon, label, value, decimals, suffix, trend, positive, bg, delay }: any) {
  const displayed = useCountUp(value, 1400, decimals);
  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: delay * 0.1, type:'spring', stiffness:280 }}
      className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg bg-gradient-to-br ${bg} hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-default`}>
      {/* Background watermark */}
      <div className="absolute -right-4 -bottom-4 opacity-10 text-white [&>*]:w-24 [&>*]:h-24">{icon}</div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="p-2 bg-white/20 rounded-xl">{icon}</div>
        <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${positive ? 'bg-white/20 text-white' : 'bg-white/20 text-white'}`}>
          {positive ? '↑' : '↓'} {trend}
        </span>
      </div>
      <p className="text-3xl font-extrabold tracking-tight relative z-10">{displayed}{suffix}</p>
      <p className="text-white/70 text-xs mt-0.5 font-medium relative z-10">{label}</p>
    </motion.div>
  );
}

// ── CountText helper ──────────────────────────────────────────────────────────
function CountText({ target, className }: { target: number; className: string }) {
  const v = useCountUp(target || 0, 1200);
  return <p className={className}>{Math.round(v)}</p>;
}

// ── Donut Chart ───────────────────────────────────────────────────────────────
function DonutChart({ data, total }: { data: { type: string; count: number; pct: number }[]; total: number }) {
  const R = 44, CX = 64, CY = 64, STROKE = 16;
  const circumference = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <svg width="128" height="128" viewBox="0 0 128 128" className="flex-shrink-0">
        {data.map(({ type, pct }, i) => {
          const dash = (pct / 100) * circumference;
          const gap  = circumference - dash;
          const el = (
            <motion.circle key={type}
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke={TYPE_COLORS_HEX[type]}
              strokeWidth={STROKE}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset * circumference / 100}
              initial={{ strokeDasharray:'0 1000' }}
              animate={{ strokeDasharray:`${dash} ${gap}` }}
              transition={{ duration:1, delay:i*0.15, ease:'easeOut' }}
              style={{ transformOrigin:'center', transform:'rotate(-90deg)' }}
            />
          );
          offset += pct;
          return el;
        })}
        <text x={CX} y={CY-2} textAnchor="middle" fontSize="16" fontWeight="800" fill="#1e293b">
          {total}
        </text>
        <text x={CX} y={CY+12} textAnchor="middle" fontSize="9" fill="#94a3b8">total</text>
      </svg>
      <ul className="space-y-2.5 w-full">
        {data.map(({ type, count, pct }) => (
          <li key={type} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: TYPE_COLORS_HEX[type] }}/>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">{TYPE_LABEL[type]}</p>
            </div>
            <span className="text-xs font-bold text-slate-500">{count} <span className="text-slate-300">({pct}%)</span></span>
          </li>
        ))}
      </ul>
    </div>
  );
}
