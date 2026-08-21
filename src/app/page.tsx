'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { ChatArea } from '@/components/ChatArea';
import { DashboardView } from '@/components/DashboardView';

export default function Home() {
  const [currentPreset, setCurrentPreset] = useState<string>('northstar');
  const [activeTab, setActiveTab] = useState<'chat' | 'dashboard'>('chat');

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      <Header
        currentPreset={currentPreset}
        onSelectPreset={setCurrentPreset}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6">
        {activeTab === 'chat' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
            <div className="lg:col-span-4 xl:col-span-3">
              <Sidebar currentPreset={currentPreset} />
            </div>
            <div className="lg:col-span-8 xl:col-span-9">
              <ChatArea currentPreset={currentPreset} />
            </div>
          </div>
        ) : (
          <DashboardView />
        )}
      </div>
    </main>
  );
}
