'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Home, Ticket, BarChart3, ShieldCheck, Settings, LogOut, ChevronRight, BookOpen } from 'lucide-react';

import { DEMO_TICKETS } from '@/lib/demo-data';

const NAV = [
  { href:'/overview', icon:<BookOpen size={18}/>,     label:'Overview'   },
  { href:'/',        icon:<Home size={18}/>,        label:'Dashboard'  },
  { href:'/ticket',  icon:<Ticket size={18}/>,       label:'Tickets',   badge: DEMO_TICKETS.length.toString() },
  { href:'/metrics', icon:<BarChart3 size={18}/>,    label:'Metrics'    },
  { href:'/audit',   icon:<ShieldCheck size={18}/>,  label:'Audit Logs' },
  { href:'/admin',   icon:<Settings size={18}/>,     label:'Settings'   },
];

export default function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('civicflow_user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  const displayName = user?.name || 'Sarah Jenkins';
  const displayRole = user?.role || 'Admin';

  return (
    <aside className={`bg-white flex-col h-full ${className}`}>
      
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-slate-100 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mr-3 shadow-md shadow-indigo-200 flex-shrink-0">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div>
          <span className="font-extrabold text-slate-900 text-base tracking-tight block leading-tight">CivicFlow</span>
          <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">AI Platform</span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-3">Navigation</p>
        {NAV.map(({ href, icon, label, badge }) => {
          const active = href === '/' ? pathname === '/' : pathname?.startsWith(href);
          return (
            <Link key={href} href={href}
              className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group relative
                ${active ? 'bg-indigo-50 text-indigo-700 nav-active' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
              <span className={`mr-3 transition-colors ${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                {icon}
              </span>
              <span className="flex-1">{label}</span>
              {badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {badge}
                </span>
              )}
              {active && <ChevronRight size={14} className="text-indigo-400 ml-1"/>}
            </Link>
          );
        })}
      </nav>

      {/* Workspace selector */}
      <div className="px-3 pb-3 flex-shrink-0">
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-4">
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Workspace</p>
          <select className="w-full bg-white border border-indigo-100 rounded-xl text-sm p-2 outline-none shadow-sm focus:ring-2 focus:ring-indigo-400 text-slate-700 font-semibold transition-shadow cursor-pointer">
            <option>University Demo Core</option>
            <option>City Governance Trial</option>
            <option>NGO Partner Network</option>
          </select>
        </div>

        {/* User footer */}
        <div className="mt-3 flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 cursor-pointer group transition-colors">
          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff&bold=true&size=48`}
            className="w-8 h-8 rounded-full shadow-sm flex-shrink-0" alt="User"/>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 leading-tight truncate">{displayName}</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{displayRole}</p>
          </div>
          <Link href="/login" onClick={() => localStorage.removeItem('civicflow_user')}>
            <LogOut size={15} className="text-slate-300 group-hover:text-red-400 transition-colors flex-shrink-0"/>
          </Link>
        </div>
      </div>
    </aside>
  );
}
