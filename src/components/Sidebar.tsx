'use client';

import React from 'react';
import { PRESET_USERS } from '@/lib/auth/security';
import { ShieldCheck, BookOpen, Layers, Lock, FileText, Sparkles } from 'lucide-react';

interface SidebarProps {
  currentPreset: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPreset }) => {
  const currentUser = PRESET_USERS[currentPreset] || PRESET_USERS.northstar;

  const authorityHierarchy = [
    { rank: 1, label: 'Customer Enterprise Agreement', desc: 'Custom terms override standard policies', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
    { rank: 2, label: 'Current Support Policy v3', desc: 'Standard SLAs & cancellation fees', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
    { rank: 3, label: 'Cancellation SOP v4', desc: 'Operational credit rules & 3h carrier delay rule', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' },
    { rank: 4, label: 'Product Ops Guide', desc: 'Known issues & bug codes (ERR-API-502)', color: 'text-sky-400 border-sky-500/30 bg-sky-500/10' },
    { rank: 5, label: 'Deprecated Policy v2', desc: 'Unauthoritative historical reference', color: 'text-slate-500 border-slate-700 bg-slate-900/50' },
    { rank: 6, label: 'Historical Support Tickets', desc: 'Contextual evidence only; cannot override rules', color: 'text-slate-500 border-slate-700 bg-slate-900/50' },
  ];

  return (
    <aside className="space-y-6">
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2 text-sky-400">
          <ShieldCheck className="h-5 w-5" />
          <h3 className="text-sm font-bold text-white">Active Identity & Scope</h3>
        </div>

        <div className="rounded-xl bg-slate-900/80 p-3.5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">{currentUser.name}</span>
            <span className="rounded bg-sky-500/10 px-2 py-0.5 text-[10px] font-mono text-sky-300 border border-sky-500/20">
              {currentUser.role}
            </span>
          </div>

          <div className="text-xs text-slate-400 space-y-1 pt-1 border-t border-slate-800/80">
            <div className="flex justify-between">
              <span>Account Scope:</span>
              <span className="font-mono text-slate-200">{currentUser.account_id || 'Global (Internal)'}</span>
            </div>
            {currentUser.company_name && (
              <div className="flex justify-between">
                <span>Organization:</span>
                <span className="text-slate-200">{currentUser.company_name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-slate-900/50 p-3 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
          <div className="flex items-center space-x-1.5 text-slate-300 font-semibold">
            <Lock className="h-3.5 w-3.5 text-cyan-400" />
            <span>Backend Security Policy:</span>
          </div>
          <p className="leading-relaxed">
            {currentUser.role === 'CUSTOMER'
              ? `Queries automatically constrained to ${currentUser.account_id}. Cross-account operations yield HTTP 403 Unauthorized.`
              : 'Internal support persona authorized to query across all tenant accounts and trigger state escalation workflows.'}
          </p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2 text-cyan-400">
          <Layers className="h-5 w-5" />
          <h3 className="text-sm font-bold text-white">Source Authority Matrix</h3>
        </div>
        <p className="text-[11px] text-slate-400">
          Agent conflict resolution engine prioritizes sources strictly by authority rank:
        </p>

        <div className="space-y-2">
          {authorityHierarchy.map(item => (
            <div key={item.rank} className={`rounded-xl p-2.5 border text-xs transition-all ${item.color}`}>
              <div className="flex items-center justify-between font-semibold">
                <span>Rank #{item.rank}: {item.label}</span>
              </div>
              <p className="text-[10px] opacity-80 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
