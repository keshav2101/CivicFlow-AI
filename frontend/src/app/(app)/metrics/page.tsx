'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Zap, Clock, TrendingUp, TrendingDown,
  BarChart3, PieChart, Activity, Target, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { DEMO_TICKETS, TICKETS_BY_TYPE, METRICS } from '@/lib/demo-data';

// ── Helpers ───────────────────────────────────────────────────────────────────
const WEEK_DATA = [
  { day:'Mon', total:41, approved:38, sla:95 },
  { day:'Tue', total:78, approved:71, sla:91 },
  { day:'Wed', total:53, approved:49, sla:94 },
  { day:'Thu', total:94, approved:88, sla:94 },
  { day:'Fri', total:68, approved:62, sla:91 },
  { day:'Sat', total:29, approved:27, sla:93 },
  { day:'Sun', total:12, approved:12, sla:100 },
];
const SLA_TREND = [88, 91, 87, 93, 94, 92, 94, 95, 93, 94, 95, 94.2];
const MONTHS = ['Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb'];

const TYPE_COLORS: Record<string, string> = {
  REIMBURSEMENT:'#14b8a6', INVOICE:'#3b82f6', MOU:'#8b5cf6', GRIEVANCE:'#f43f5e',
};
const TYPE_LABEL: Record<string, string> = {
  REIMBURSEMENT:'Reimbursements', INVOICE:'Invoices', MOU:'MoUs', GRIEVANCE:'Grievances',
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MetricsPage() {
  const [rangeTab, setRangeTab] = useState<'week'|'month'|'quarter'>('week');

  const typeBreakdown = Object.entries(TICKETS_BY_TYPE).map(([type, tickets]) => ({
    type, count: tickets.length,
    approved: tickets.filter(t => t.status === 'APPROVED').length,
    pct: Math.round(tickets.length / DEMO_TICKETS.length * 100),
  }));

  return (
    <div className="py-6 pb-16 space-y-8 max-w-6xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Metrics & Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Real-time operational performance across all request types</p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Routing Accuracy',  value:'98.4%', delta:'+1.2%', up:true,  icon:<Target size={18}/>,      color:'from-indigo-500 to-violet-600'  },
          { label:'SLA Compliance',    value:'94.2%', delta:'+0.5%', up:true,  icon:<ShieldCheck size={18}/>,  color:'from-emerald-500 to-teal-600'   },
          { label:'Avg Approval Time', value:'14.5m', delta:'−4.1m', up:true,  icon:<Clock size={18}/>,        color:'from-blue-500 to-cyan-600'       },
          { label:'Manual Intervention',value:'5.1%', delta:'−2.3%', up:true,  icon:<Zap size={18}/>,          color:'from-amber-500 to-orange-500'    },
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }}
            className={`bg-gradient-to-br ${kpi.color} rounded-2xl p-5 text-white shadow-lg relative overflow-hidden`}>
            <div className="absolute -right-4 -bottom-4 opacity-10">{kpi.icon}</div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/20 rounded-xl">{kpi.icon}</div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${kpi.up ? 'bg-white/20' : 'bg-red-500/30'} flex items-center gap-0.5`}>
                {kpi.up ? <ArrowUpRight size={11}/> : <ArrowDownRight size={11}/>}{kpi.delta}
              </span>
            </div>
            <p className="text-3xl font-extrabold">{kpi.value}</p>
            <p className="text-white/70 text-xs mt-0.5">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* SLA trend line chart */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-slate-800 flex items-center gap-2"><Activity size={17} className="text-indigo-500"/> SLA Compliance Trend</h2>
              <p className="text-xs text-slate-400 mt-0.5">Monthly % over the past 12 months</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
              <TrendingUp size={12}/> +6.2% YoY
            </span>
          </div>
          {/* SVG line chart */}
          <div className="relative h-44">
            <SLALineChart data={SLA_TREND} labels={MONTHS} />
          </div>
        </motion.div>

        {/* Donut — type breakdown */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
            <PieChart size={17} className="text-violet-500"/> Request Types
          </h2>
          <DonutChart data={typeBreakdown} />
        </motion.div>
      </div>

      {/* Weekly bar chart */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.45 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-slate-800 flex items-center gap-2"><BarChart3 size={17} className="text-blue-500"/> Weekly Volume & Approval Rate</h2>
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {(['week','month','quarter'] as const).map(r => (
              <button key={r} onClick={() => setRangeTab(r)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors capitalize
                  ${rangeTab===r ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{r}</button>
            ))}
          </div>
        </div>
        <WeeklyBarChart data={WEEK_DATA} />
      </motion.div>

      {/* Per-type breakdown table */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50">
          <h2 className="font-bold text-slate-800">Performance by Request Type</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr className="text-left">
              {['Type','Total','Approved','Pending','SLA OK','Avg Time'].map(h => (
                <th key={h} className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {typeBreakdown.map((row, i) => {
              const tickets = TICKETS_BY_TYPE[row.type as keyof typeof TICKETS_BY_TYPE];
              const pending = tickets.filter(t => t.status==='PENDING'||t.status==='ESCALATED').length;
              const slaOk   = tickets.filter(t => t.sla==='On Track'||t.sla==='Completed').length;
              const times   = { REIMBURSEMENT:'12.3m', INVOICE:'18.7m', MOU:'2.1d', GRIEVANCE:'1.4d' };
              return (
                <motion.tr key={row.type} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.55+i*0.05 }}
                  className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: TYPE_COLORS[row.type] }}/>
                      <span className="font-semibold text-slate-800">{TYPE_LABEL[row.type]}</span>
                    </span>
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-700">{row.count}</td>
                  <td className="px-5 py-4 text-emerald-600 font-semibold">{row.approved}</td>
                  <td className="px-5 py-4 text-amber-600 font-semibold">{pending}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width:`${Math.round(slaOk/row.count*100)}%` }}/>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">{Math.round(slaOk/row.count*100)}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-500 font-medium">{times[row.type as keyof typeof times]}</td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}

// ── SVG Line Chart ────────────────────────────────────────────────────────────
function SLALineChart({ data, labels }: { data: number[]; labels: string[] }) {
  const W = 600, H = 160, PAD = 20;
  const min = 80, max = 102;
  const pts = data.map((v, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((v - min) / (max - min)) * (H - PAD * 2);
    return { x, y, v };
  });
  const path = pts.map((p, i) => `${i===0?'M':'L'}${p.x},${p.y}`).join(' ');
  const area = `${path} L${pts[pts.length-1].x},${H} L${pts[0].x},${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="slaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15"/>
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[85, 90, 95, 100].map(v => {
        const y = H - PAD - ((v - min) / (max - min)) * (H - PAD * 2);
        return (
          <g key={v}>
            <line x1={PAD} y1={y} x2={W-PAD} y2={y} stroke="#f1f5f9" strokeWidth="1"/>
            <text x={PAD-4} y={y+4} fontSize="9" fill="#94a3b8" textAnchor="end">{v}%</text>
          </g>
        );
      })}
      {/* Area fill */}
      <path d={area} fill="url(#slaGrad)"/>
      {/* Line */}
      <path d={path} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
      {/* Dots + labels */}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3.5" fill="white" stroke="#6366f1" strokeWidth="2"/>
          <text x={p.x} y={H-2} fontSize="9" fill="#94a3b8" textAnchor="middle">{labels[i]}</text>
        </g>
      ))}
    </svg>
  );
}

// ── Donut Chart ───────────────────────────────────────────────────────────────
function DonutChart({ data }: { data: { type: string; count: number; pct: number }[] }) {
  const R = 52, CX = 80, CY = 80, STROKE = 20;
  const circumference = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="flex items-center gap-4">
      <svg width="160" height="160" viewBox="0 0 160 160" className="flex-shrink-0">
        {data.map(({ type, pct }, i) => {
          const dash = (pct / 100) * circumference;
          const gap  = circumference - dash;
          const el = (
            <motion.circle key={type}
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke={TYPE_COLORS[type]}
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
        <text x={CX} y={CY-6} textAnchor="middle" fontSize="18" fontWeight="800" fill="#1e293b">
          {DEMO_TICKETS.length}
        </text>
        <text x={CX} y={CY+10} textAnchor="middle" fontSize="9" fill="#94a3b8">total</text>
      </svg>
      <ul className="space-y-2.5 flex-1">
        {data.map(({ type, count, pct }) => (
          <li key={type} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: TYPE_COLORS[type] }}/>
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

// ── Weekly Bar Chart ──────────────────────────────────────────────────────────
function WeeklyBarChart({ data }: { data: typeof WEEK_DATA }) {
  const max = Math.max(...data.map(d => d.total));
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div className="flex items-end gap-3 h-40">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer group"
          onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
          {hovered === i && (
            <div className="bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap mb-1 shadow-lg">
              {d.total} total · {d.approved} approved · {d.sla}% SLA
            </div>
          )}
          <div className="w-full relative flex-1 flex flex-col justify-end">
            {/* Total bar */}
            <motion.div initial={{ height:0 }} animate={{ height:`${(d.total/max)*100}%` }}
              transition={{ duration:0.7, delay:i*0.07, ease:'easeOut' }}
              className={`w-full rounded-t-xl transition-colors relative overflow-hidden ${hovered===i ? 'bg-indigo-300' : 'bg-indigo-100'}`}>
              {/* Approved overlay */}
              <motion.div initial={{ height:0 }} animate={{ height:`${(d.approved/d.total)*100}%` }}
                transition={{ duration:0.9, delay:i*0.07+0.4 }}
                className="absolute bottom-0 left-0 right-0 bg-indigo-500 rounded-t-xl"/>
            </motion.div>
          </div>
          <span className={`text-[10px] font-bold transition-colors ${hovered===i ? 'text-indigo-600' : 'text-slate-400'}`}>{d.day}</span>
        </div>
      ))}
    </div>
  );
}
