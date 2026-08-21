import Link from 'next/link';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-950 p-6 text-slate-100">
      <div className="glass-panel max-w-md w-full rounded-2xl p-6 border border-slate-800 text-center space-y-4 shadow-2xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
          <FileQuestion className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-white">404 - Page Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested page route does not exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-500 transition-all shadow-lg shadow-sky-600/20"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to ParcelPilot Copilot</span>
        </Link>
      </div>
    </div>
  );
}
