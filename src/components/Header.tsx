'use client';

import React from 'react';
import { PRESET_USERS, UserSession } from '@/lib/auth/security';
import { Bot, LayoutDashboard, Shield, ChevronDown, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentPreset: string;
  onSelectPreset: (presetKey: string) => void;
  activeTab: 'chat' | 'dashboard';
  onTabChange: (tab: 'chat' | 'dashboard') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPreset,
  onSelectPreset,
  activeTab,
  onTabChange,
}) => {
  const currentUser = PRESET_USERS[currentPreset] || PRESET_USERS.northstar;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-3 shadow-lg">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 text-slate-950 font-bold shadow-cyan-500/20 shadow-lg">
            <Bot className="h-6 w-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white">ParcelPilot Copilot</h1>
              <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20">
                AI Agent v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400">B2B Logistics Support & Conflict Resolution System</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onTabChange('chat')}
            className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
              activeTab === 'chat'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Bot className="h-4 w-4" />
            <span>Support Copilot</span>
          </button>
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Ops Intelligence Dashboard</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative group">
            <div className="flex items-center space-x-2 rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2 text-xs cursor-pointer hover:border-slate-700 transition-all">
              <Shield className="h-4 w-4 text-cyan-400" />
              <div className="text-left">
                <div className="text-[10px] text-slate-400 font-mono uppercase">Simulated Role</div>
                <div className="font-semibold text-slate-200">{currentUser.name}</div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </div>

            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-800 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none group-hover:pointer-events-auto z-50">
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Select Identity Persona
              </div>
              {Object.entries(PRESET_USERS).map(([key, user]) => (
                <button
                  key={key}
                  onClick={() => onSelectPreset(key)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-left transition-all ${
                    currentPreset === key
                      ? 'bg-sky-500/10 text-sky-400 font-semibold border border-sky-500/20'
                      : 'text-slate-300 hover:bg-slate-800/70'
                  }`}
                >
                  <div>
                    <div>{user.name}</div>
                    <div className="text-[10px] text-slate-500">{user.email}</div>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {user.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
