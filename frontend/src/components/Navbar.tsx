'use client';

import { Search, Bell, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
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
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 flex-shrink-0 z-10 sticky top-0 shadow-sm shadow-slate-100/50">
       <div className="flex items-center flex-1">
          <button className="md:hidden p-2 text-slate-500 mr-2 hover:bg-slate-50 rounded-lg transition-colors"><Menu size={20} /></button>
          
          <div className="relative w-full max-w-md hidden sm:block group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search tickets, clauses, or requesters..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-70">
                <kbd className="hidden sm:inline-block border border-slate-300 rounded px-1.5 text-[10px] font-mono text-slate-500 font-bold bg-white shadow-sm">⌘</kbd>
                <kbd className="hidden sm:inline-block border border-slate-300 rounded px-1.5 text-[10px] font-mono text-slate-500 font-bold bg-white shadow-sm">K</kbd>
            </div>
          </div>
       </div>

       <div className="flex items-center space-x-2">
          <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors mr-2">
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
              <Bell size={20} />
          </button>
          
          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
          
          <button className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-full pr-3 transition-colors ml-2 border border-transparent hover:border-slate-200">
             <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff&bold=true`} alt="User Profile" className="w-8 h-8 rounded-full shadow-sm" />
             <div className="hidden md:flex flex-col items-start leading-tight">
                <span className="text-sm font-semibold text-slate-700">{displayName}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{displayRole}</span>
             </div>
          </button>
       </div>
    </header>
  );
}
