'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Bell, Shield, Users, ChevronRight, Save,
  Hash, Mail, MessageCircle, ToggleLeft, ToggleRight, Check
} from 'lucide-react';

const SECTIONS = [
  { id:'org',     icon:<Building2 size={18}/>, label:'Organization'  },
  { id:'notify',  icon:<Bell size={18}/>,      label:'Notifications' },
  { id:'security',icon:<Shield size={18}/>,    label:'Security'      },
  { id:'team',    icon:<Users size={18}/>,     label:'Team & Roles'  },
];

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className={`relative w-10 h-5 rounded-full transition-colors ${on ? 'bg-indigo-600' : 'bg-slate-200'}`}>
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-5' : ''}`}/>
    </button>
  );
}

export default function SettingsPage() {
  const [active, setActive]     = useState('org');
  const [saved, setSaved]       = useState(false);
  const [orgName, setOrgName]   = useState('University Demo Core');
  const [orgType, setOrgType]   = useState('university');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [notifs, setNotifs]     = useState({ email:true, whatsapp:true, slack:false, digest:true });
  const [slaHours, setSlaHours] = useState(24);
  const [threshold, setThreshold] = useState(10000);
  const [twoFA, set2FA]         = useState(true);
  const [piiScrub, setPii]      = useState(true);

  const TEAM = [
    { name:'Sarah Jenkins', role:'Admin',        email:'sarah@org.ai',  avatar:'SJ', color:'bg-indigo-500' },
    { name:'Rohan Mehta',   role:'Finance Lead', email:'rohan@org.ai',  avatar:'RM', color:'bg-emerald-500' },
    { name:'Priya Nair',    role:'Legal Manager',email:'priya@org.ai',  avatar:'PN', color:'bg-violet-500' },
    { name:'Akash Dev',     role:'Finance Lead', email:'akash@org.ai',  avatar:'AD', color:'bg-blue-500' },
    { name:'Kavya Menon',   role:'Admin Manager',email:'kavya@org.ai',  avatar:'KM', color:'bg-rose-500' },
  ];

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="py-6 pb-16 max-w-5xl mx-auto">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Configure your organization, workflows, and preferences</p>
        </div>
        <button onClick={save}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm
            ${saved ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
          {saved ? <><Check size={15}/> Saved!</> : <><Save size={15}/> Save Changes</>}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <nav className="w-48 flex-shrink-0 space-y-1">
          {SECTIONS.map(sec => (
            <button key={sec.id} onClick={() => setActive(sec.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${active === sec.id ? 'bg-indigo-50 text-indigo-700 nav-active' : 'text-slate-600 hover:bg-slate-50'}`}>
              <span className={active===sec.id?'text-indigo-500':'text-slate-400'}>{sec.icon}</span>
              {sec.label}
              {active===sec.id && <ChevronRight size={13} className="ml-auto text-indigo-300"/>}
            </button>
          ))}
        </nav>

        {/* Panel */}
        <div className="flex-1 min-w-0">
          <motion.div key={active} initial={{ opacity:0, x:12 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.2 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">

            {/* ── Organisation ─────────────────────────────────────────────── */}
            {active === 'org' && (
              <>
                <SectionTitle>Organization Profile</SectionTitle>
                <Field label="Organization Name">
                  <input value={orgName} onChange={e => setOrgName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400"/>
                </Field>
                <Field label="Organization Type">
                  <select value={orgType} onChange={e => setOrgType(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                    <option value="university">University / College Club</option>
                    <option value="ngo">NGO / Non-profit</option>
                    <option value="startup">Startup / SME</option>
                    <option value="govt">Government Body</option>
                  </select>
                </Field>
                <Field label="Timezone">
                  <select value={timezone} onChange={e => setTimezone(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                    <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                  </select>
                </Field>
                <SectionTitle>Workflow Defaults</SectionTitle>
                <Field label={`Default SLA Window: ${slaHours}h`}>
                  <input type="range" min="4" max="72" step="4" value={slaHours}
                    onChange={e => setSlaHours(+e.target.value)}
                    className="w-full accent-indigo-600"/>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>4h</span><span>72h</span></div>
                </Field>
                <Field label={`High-Value Policy Threshold: $${threshold.toLocaleString()}`}>
                  <input type="range" min="1000" max="50000" step="1000" value={threshold}
                    onChange={e => setThreshold(+e.target.value)}
                    className="w-full accent-indigo-600"/>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>$1K</span><span>$50K</span></div>
                </Field>
              </>
            )}

            {/* ── Notifications ─────────────────────────────────────────────── */}
            {active === 'notify' && (
              <>
                <SectionTitle>Notification Channels</SectionTitle>
                <p className="text-sm text-slate-500">Choose how approvers and requesters receive notifications.</p>
                {[
                  { key:'email',     label:'Email (Gmail API)',          sub:'Send approval requests and status updates via email', icon:<Mail size={18} className="text-blue-500"/> },
                  { key:'whatsapp',  label:'WhatsApp Business',          sub:'Push ticket summaries and approval links via WhatsApp', icon:<MessageCircle size={18} className="text-emerald-500"/> },
                  { key:'slack',     label:'Slack Integration',          sub:'Post workflow events to a designated Slack channel', icon:<Hash size={18} className="text-violet-500"/> },
                  { key:'digest',    label:'Daily Email Digest',         sub:'Send a 9 AM summary of pending tickets to all admins', icon:<Bell size={18} className="text-amber-500"/> },
                ].map(ch => (
                  <div key={ch.key} className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="p-2 bg-slate-50 rounded-xl">{ch.icon}</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">{ch.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{ch.sub}</p>
                    </div>
                    <Toggle on={notifs[ch.key as keyof typeof notifs]} onChange={() => setNotifs(n => ({ ...n, [ch.key]: !n[ch.key as keyof typeof notifs] }))}/>
                  </div>
                ))}
              </>
            )}

            {/* ── Security ───────────────────────────────────────────────────── */}
            {active === 'security' && (
              <>
                <SectionTitle>Security & Compliance</SectionTitle>
                <div className="space-y-4">
                  {[
                    { label:'Two-Factor Authentication (2FA)', sub:'Require 2FA for all admin accounts', on:twoFA, set:set2FA },
                    { label:'PII Auto-Redaction',             sub:'Scrub emails and phone numbers before sending to AI', on:piiScrub, set:setPii },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">{s.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
                      </div>
                      <Toggle on={s.on} onChange={() => s.set(v => !v)}/>
                    </div>
                  ))}
                </div>
                <SectionTitle>API Access</SectionTitle>
                <div className="bg-slate-900 rounded-xl p-4 font-mono text-sm text-emerald-400 space-y-1">
                  <p><span className="text-slate-500"># API Base URL</span></p>
                  <p>https://api.civicflow.ai/v1</p>
                  <p className="mt-2"><span className="text-slate-500"># Bearer Token</span></p>
                  <p className="text-yellow-400">cf_live_••••••••••••••••••••••••••••••••</p>
                </div>
                <button className="text-sm text-indigo-600 font-semibold hover:underline">Regenerate API Token →</button>
              </>
            )}

            {/* ── Team ──────────────────────────────────────────────────────── */}
            {active === 'team' && (
              <>
                <SectionTitle>Team Members</SectionTitle>
                <div className="space-y-3">
                  {TEAM.map(member => (
                    <div key={member.email} className="flex items-center gap-3 p-3.5 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className={`w-9 h-9 rounded-full ${member.color} flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0`}>
                        {member.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{member.name}</p>
                        <p className="text-xs text-slate-400">{member.email}</p>
                      </div>
                      <select defaultValue={member.role}
                        className="text-xs font-bold border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400">
                        <option>Admin</option>
                        <option>Finance Lead</option>
                        <option>Finance Director</option>
                        <option>Legal Manager</option>
                        <option>Legal Counsel</option>
                        <option>Admin Manager</option>
                        <option>HR Head</option>
                        <option>Member</option>
                      </select>
                    </div>
                  ))}
                </div>
                <button className="text-sm text-indigo-600 font-bold hover:underline">+ Invite new member</button>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest pt-2 first:pt-0 border-t border-slate-50 first:border-0">{children}</h2>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-700 block">{label}</label>
      {children}
    </div>
  );
}
