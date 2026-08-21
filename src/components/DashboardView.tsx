'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, ShieldAlert, CheckCircle, Clock, AlertTriangle, Cpu, RefreshCw, FileSpreadsheet } from 'lucide-react';

interface DashboardData {
  snapshot_timestamp: string;
  summary: {
    total_tickets: number;
    open_tickets: number;
    breached_sla_tickets: number;
    carrier_delayed_orders: number;
    bug_cluster_ERR_API_502: number;
  };
  proactive_alerts: Array<{
    id: string;
    severity: string;
    title: string;
    description: string;
  }>;
  tickets: Array<{
    ticket_id: string;
    account_id: string;
    subject: string;
    priority: string;
    status: string;
    remaining_minutes: number;
    is_breached: boolean;
  }>;
  orders: Array<{
    order_id: string;
    account_id: string;
    carrier: string;
    order_value: number;
    delay_hours: number;
    carrier_fault: boolean;
    status: string;
  }>;
  audit_logs: Array<{
    timestamp: string;
    user_id: string;
    role: string;
    action: string;
    details: string;
  }>;
}

export const DashboardView: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center space-x-3 text-sky-400 text-sm">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading Real-Time Operations Intelligence...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Cpu className="h-6 w-6 text-sky-400" />
            <span>Operations Intelligence & Issue Detection Dashboard</span>
          </h2>
          <p className="text-xs text-slate-400">
            Proactive analysis across ticket SLAs, carrier delay metrics, and platform error codes against reference snapshot timestamp ({data.snapshot_timestamp})
          </p>
        </div>
        <button
          onClick={fetchDashboard}
          className="flex items-center space-x-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs text-slate-300 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl glass-panel p-4 border border-rose-500/30 bg-rose-950/10 shadow-lg">
          <div className="flex items-center justify-between text-rose-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">SLA Breach Risk</span>
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="text-2xl font-extrabold text-white">{data.summary.breached_sla_tickets} Tickets</div>
          <p className="mt-1 text-[11px] text-rose-300/80">Active tickets requiring immediate escalation</p>
        </div>

        <div className="rounded-2xl glass-panel p-4 border border-amber-500/30 bg-amber-950/10 shadow-lg">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Carrier Delay Spike</span>
            <Clock className="h-5 w-5" />
          </div>
          <div className="text-2xl font-extrabold text-white">{data.summary.carrier_delayed_orders} Shipments</div>
          <p className="mt-1 text-[11px] text-amber-300/80">Pickup delays &gt;= 3.0h carrier fault</p>
        </div>

        <div className="rounded-2xl glass-panel p-4 border border-cyan-500/30 bg-cyan-950/10 shadow-lg">
          <div className="flex items-center justify-between text-cyan-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Bug Cluster (ERR-API-502)</span>
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="text-2xl font-extrabold text-white">{data.summary.bug_cluster_ERR_API_502} Reports</div>
          <p className="mt-1 text-[11px] text-cyan-300/80">FedEx/DHL tracking sync latency</p>
        </div>

        <div className="rounded-2xl glass-panel p-4 border border-emerald-500/30 bg-emerald-950/10 shadow-lg">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Active System Tickets</span>
            <CheckCircle className="h-5 w-5" />
          </div>
          <div className="text-2xl font-extrabold text-white">{data.summary.open_tickets} Open</div>
          <p className="mt-1 text-[11px] text-emerald-300/80">Out of {data.summary.total_tickets} total logged tickets</p>
        </div>
      </div>

      <div className="rounded-2xl glass-panel p-6 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <span>Proactive Internal Issue Detection Feed</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.proactive_alerts.map(alert => (
            <div
              key={alert.id}
              className={`rounded-xl p-4 border ${
                alert.severity === 'HIGH'
                  ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                  : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs">{alert.title}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                  {alert.severity}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{alert.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl glass-panel p-6 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Live Support Ticket SLA Tracker</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 font-mono text-[10px] uppercase">
                <tr>
                  <th className="p-2.5">Ticket ID</th>
                  <th className="p-2.5">Priority</th>
                  <th className="p-2.5">Subject</th>
                  <th className="p-2.5">SLA Countdown</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.tickets.map(t => (
                  <tr key={t.ticket_id} className="hover:bg-slate-900/40">
                    <td className="p-2.5 font-mono text-cyan-400 font-semibold">{t.ticket_id}</td>
                    <td className="p-2.5 font-mono text-[11px]">{t.priority}</td>
                    <td className="p-2.5 max-w-[200px] truncate">{t.subject}</td>
                    <td className="p-2.5">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-mono font-semibold ${
                          t.is_breached
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {t.is_breached ? `BREACHED (${t.remaining_minutes}m)` : `OK (${t.remaining_minutes}m remaining)`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl glass-panel p-6 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">System Security & Tool Audit Trail</h3>
          <div className="overflow-y-auto max-h-72 space-y-2 font-mono text-[11px]">
            {data.audit_logs.length === 0 ? (
              <div className="text-slate-500 italic p-4 text-center">No agent tools executed in current session yet.</div>
            ) : (
              data.audit_logs.map((log, i) => (
                <div key={i} className="rounded-lg bg-slate-900/80 p-2.5 border border-slate-800/80 text-slate-300">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                    <span className="text-cyan-400 font-bold">{log.action}</span>
                    <span>{log.timestamp.slice(11, 19)}</span>
                  </div>
                  <div className="text-slate-400">User: {log.user_id} ({log.role})</div>
                  <div className="text-slate-200 mt-1">{log.details}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
