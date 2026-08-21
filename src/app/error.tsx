'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Router Error:', error);
  }, [error]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-950 p-6 text-slate-100">
      <div className="glass-panel max-w-md w-full rounded-2xl p-6 border border-slate-800 text-center space-y-4 shadow-2xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Something went wrong</h2>
        <p className="text-xs text-slate-400">
          An unexpected runtime error occurred. You can click below to reset the application view.
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center space-x-2 rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-500 transition-all cursor-pointer shadow-lg shadow-sky-600/20"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reset Application View</span>
        </button>
      </div>
    </div>
  );
}
