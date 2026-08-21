'use client';

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface ConfirmationCardProps {
  actionId: string;
  actionType: string;
  targetId: string;
  details: string;
  userPreset: string;
  onActionComplete?: () => void;
}

export const ConfirmationCard: React.FC<ConfirmationCardProps> = ({
  actionId,
  actionType,
  targetId,
  details,
  userPreset,
  onActionComplete,
}) => {
  const [status, setStatus] = useState<'PENDING' | 'EXECUTED' | 'CANCELLED'>('PENDING');
  const [loading, setLoading] = useState(false);

  const handleDecision = async (decision: 'CONFIRM' | 'CANCEL') => {
    setLoading(true);
    try {
      const res = await fetch('/api/actions/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_id: actionId,
          decision,
          user_preset: userPreset,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus(data.data.final_status);
        if (onActionComplete) onActionComplete();
      }
    } catch (e) {
      console.error('Confirmation error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-3 rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 shadow-lg">
      <div className="flex items-start space-x-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              State-Changing Action Confirmation Required
            </h4>
            <span className="font-mono text-[10px] text-amber-300/70">{actionId}</span>
          </div>

          <p className="mt-1 text-xs text-slate-300">{details}</p>

          <div className="mt-2 flex items-center space-x-4 text-[11px] text-slate-400 font-mono">
            <div>
              Action: <span className="text-slate-200 font-semibold">{actionType}</span>
            </div>
            <div>
              Target: <span className="text-slate-200 font-semibold">{targetId}</span>
            </div>
          </div>

          {status === 'PENDING' ? (
            <div className="mt-3 flex items-center space-x-2">
              <button
                onClick={() => handleDecision('CONFIRM')}
                disabled={loading}
                className="flex items-center space-x-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-600/20"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                <span>Confirm & Execute Action</span>
              </button>
              <button
                onClick={() => handleDecision('CANCEL')}
                disabled={loading}
                className="flex items-center space-x-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-rose-900/50 hover:text-rose-200 transition-all disabled:opacity-50 cursor-pointer border border-slate-700"
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Cancel Action</span>
              </button>
            </div>
          ) : (
            <div
              className={`mt-3 flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-lg border w-fit ${
                status === 'EXECUTED'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              {status === 'EXECUTED' ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Action Executed & Audit Logged</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  <span>Action Cancelled by User</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
