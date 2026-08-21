'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, CheckCircle, AlertCircle, FileText, ChevronDown, ChevronUp, Sparkles, Loader2 } from 'lucide-react';
import { ConfirmationCard } from './ConfirmationCard';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  reasoning_summary?: string;
  evidence?: Array<{
    source_name: string;
    source_type: string;
    authority_rank: number;
    snippet: string;
    is_authoritative: boolean;
  }>;
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW' | 'REQUIRES HUMAN REVIEW';
  tool_activity?: string[];
  pending_action?: {
    action_id: string;
    action_type: string;
    target_id: string;
    details: string;
  };
}

interface ChatAreaProps {
  currentPreset: string;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ currentPreset }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_welcome',
      sender: 'agent',
      text: 'Hello! I am your **ParcelPilot Support Copilot**. Ask me any question regarding order cancellations, service credits, SLAs, technical issue codes, or enterprise contract terms.',
      timestamp: '12:00 UTC',
      confidence: 'HIGH',
      evidence: [],
      tool_activity: ['✓ Authenticated identity scope', '✓ Initialized vector & database index'],
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedCitations, setExpandedCitations] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickPrompts = [
    'Can Northstar cancel ORD-1001 without a cancellation fee? Explain why.',
    'A pickup is 3.5 hours late on ORD-1002 due to carrier fault. Calculate service credit.',
    'Escalate ticket TKT-1001.',
    'Check SLA status for TKT-1002.',
    'Show me details for order ORD-1002.', // Security test query
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const timeString = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const userMsg: Message = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: timeString,
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: textToSend, user_preset: currentPreset }),
      });

      const data = await res.json();

      const agentMsg: Message = {
        id: `msg_agent_${Date.now()}`,
        sender: 'agent',
        text: data.answer || 'No response returned.',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        reasoning_summary: data.reasoning_summary,
        evidence: data.evidence || [],
        confidence: data.confidence || 'HIGH',
        tool_activity: data.tool_activity || [],
        pending_action: data.pending_action,
      };

      setMessages(prev => [...prev, agentMsg]);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCitation = (msgId: string) => {
    setExpandedCitations(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3.5 ${
              msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold shadow-md ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-tr from-sky-600 to-blue-600 text-white'
                  : 'bg-gradient-to-tr from-cyan-600 to-teal-500 text-white'
              }`}
            >
              {msg.sender === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
            </div>

            {/* Bubble */}
            <div className={`flex max-w-[82%] flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center space-x-2 text-[11px] text-slate-400 mb-1">
                <span className="font-medium text-slate-300">
                  {msg.sender === 'user' ? 'You' : 'ParcelPilot Copilot'}
                </span>
                <span>•</span>
                <span>{msg.timestamp}</span>
                {msg.confidence && (
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold border ${
                      msg.confidence === 'HIGH'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : msg.confidence === 'MEDIUM'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {msg.confidence} CONFIDENCE
                  </span>
                )}
              </div>

              {/* Message Content Container */}
              <div
                className={`rounded-2xl px-4 py-3 text-sm shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-sky-600 text-white rounded-tr-none'
                    : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none space-y-3'
                }`}
              >
                {/* Text Content */}
                <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>

                {/* Tool Trace Badges */}
                {msg.sender === 'agent' && msg.tool_activity && msg.tool_activity.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-1">
                    <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                      Tool Execution Trace:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.tool_activity.map((step, idx) => (
                        <span
                          key={idx}
                          className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-cyan-300 border border-slate-700/60"
                        >
                          {step}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Confirmation Card Integration */}
                {msg.pending_action && (
                  <ConfirmationCard
                    actionId={msg.pending_action.action_id}
                    actionType={msg.pending_action.action_type}
                    targetId={msg.pending_action.target_id}
                    details={msg.pending_action.details}
                    userPreset={currentPreset}
                    onActionComplete={() => {}}
                  />
                )}

                {/* Evidence & Citations Drawer */}
                {msg.sender === 'agent' && msg.evidence && msg.evidence.length > 0 && (
                  <div className="mt-3 rounded-xl bg-slate-950/60 border border-slate-800 p-2.5">
                    <button
                      onClick={() => toggleCitation(msg.id)}
                      className="flex w-full items-center justify-between text-xs font-semibold text-sky-400 hover:text-sky-300"
                    >
                      <div className="flex items-center space-x-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        <span>Source Citations ({msg.evidence.length})</span>
                      </div>
                      {expandedCitations[msg.id] ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>

                    {expandedCitations[msg.id] && (
                      <div className="mt-2 space-y-2 border-t border-slate-800/80 pt-2 text-xs">
                        {msg.evidence.map((ev, i) => (
                          <div key={i} className="rounded-lg bg-slate-900 p-2 border border-slate-800">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-slate-200">{ev.source_name}</span>
                              <span className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[10px] text-sky-300 border border-sky-500/20 font-mono">
                                Authority Rank #{ev.authority_rank}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 italic">"{ev.snippet}"</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center space-x-3 text-xs text-sky-400">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 border border-slate-800">
              <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
              <span>Orchestrating agent tools & evaluating conflict hierarchy...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Pills */}
      <div className="px-6 py-2 border-t border-slate-800/60 bg-slate-950/40 overflow-x-auto">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0">Quick Prompts:</span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="shrink-0 rounded-full bg-slate-900 px-3 py-1 text-[11px] text-slate-300 hover:bg-sky-600 hover:text-white border border-slate-800 transition-all cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-3"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask ParcelPilot Copilot about policy, orders, SLA, fees, credits..."
            className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 border border-slate-800 focus:border-sky-500 focus:outline-none transition-all"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-600 text-white hover:bg-sky-500 transition-all disabled:opacity-40 cursor-pointer shadow-lg shadow-sky-600/20"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
