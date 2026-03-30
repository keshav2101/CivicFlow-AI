'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { name: 'Sarah Jenkins', role: 'Admin',   email: 'admin@demo.civicflow.ai',   password: 'admin123', color: 'from-violet-500 to-indigo-600' },
  { name: 'Jordan Finance', role: 'Finance', email: 'finance@demo.civicflow.ai', password: 'fin123',   color: 'from-emerald-500 to-teal-600'  },
  { name: 'Morgan Legal', role: 'Legal',   email: 'legal@demo.civicflow.ai',   password: 'leg123',   color: 'from-blue-500 to-cyan-600'     },
  { name: 'Sam Jenkins', role: 'Researcher', email: 'researcher@demo.civicflow.ai', password: 'user123', color: 'from-amber-500 to-orange-600' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    const match = DEMO_ACCOUNTS.find(a => a.email === email && a.password === password);
    if (match) {
      localStorage.setItem('civicflow_user', JSON.stringify({ name: match.name, role: match.role, email: match.email }));
      router.push('/');
    } else {
      setError('Invalid credentials. Try a demo account below.');
      setLoading(false);
    }
  };

  const quickLogin = async (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setLoading(true);
    localStorage.setItem('civicflow_user', JSON.stringify({ name: acc.name, role: acc.role, email: acc.email }));
    await new Promise(r => setTimeout(r, 700));
    router.push('/');
  };

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center p-4 relative overflow-hidden">

      {/* Floating decorative orbs */}
      <div className="absolute top-20 left-16 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl float-slow pointer-events-none" />
      <div className="absolute bottom-24 right-20 w-96 h-96 rounded-full bg-teal-400/15 blur-3xl float-fast pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-violet-500/10 blur-2xl float-slow pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl mb-4 glow-card">
            <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">CivicFlow AI</h1>
          <p className="text-white/60 mt-1.5 text-sm">Autonomous Operations Platform</p>
        </motion.div>

        {/* Login Card */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8">

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-1.5">Email address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@organization.com"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-sm outline-none focus:bg-white/15 focus:border-white/50 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-sm outline-none focus:bg-white/15 focus:border-white/50 transition-all"
                />
                <button type="button" onClick={() => setShow(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors">
                  {show ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.p initial={{ opacity:0, x: -8 }} animate={{ opacity:1, x:0 }}
                className="text-red-300 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl bg-white text-indigo-700 font-bold text-sm hover:bg-white/90 active:scale-[.98] transition-all shadow-lg disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={18} className="animate-spin"/> Signing in…</> : 'Sign In →'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-white/15"/>
            <span className="text-white/40 text-xs font-medium">or try a demo account</span>
            <div className="h-px flex-1 bg-white/15"/>
          </div>

          {/* Quick login buttons */}
          <div className="space-y-2.5">
            {DEMO_ACCOUNTS.map(acc => (
              <button key={acc.role} onClick={() => quickLogin(acc)} disabled={loading}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r ${acc.color} text-white text-sm font-semibold hover:opacity-90 active:scale-[.98] transition-all shadow-md disabled:opacity-50`}>
                <span className="flex items-center gap-2">
                  <ShieldCheck size={16}/>
                  Continue as {acc.role}
                </span>
                <span className="text-white/70 text-xs font-mono">{acc.email}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <p className="text-center text-white/30 text-xs mt-6">
          © 2026 CivicFlow AI · Enterprise Operations Platform
        </p>
      </div>
    </div>
  );
}
