import { NextResponse } from 'next/server';
import { getDB, SNAPSHOT_TIME } from '@/lib/data/db';

export async function GET() {
  try {
    const db = getDB();
    const tickets = db.getAllTickets();
    const orders = db.getAllOrders();
    const auditLogs = db.getAuditLogs();

    const snapshotMs = new Date(SNAPSHOT_TIME).getTime();

    const ticketsWithSLA = tickets.map(t => {
      const dueMs = new Date(t.sla_due_at).getTime();
      const diffMinutes = Math.round((dueMs - snapshotMs) / (1000 * 60));
      const isBreached = diffMinutes < 0 && t.status !== 'RESOLVED';

      return {
        ...t,
        remaining_minutes: diffMinutes,
        is_breached: isBreached,
      };
    });

    const openBreachedTickets = ticketsWithSLA.filter(t => t.is_breached);
    const delayedCarrierOrders = orders.filter(o => o.carrier_fault && o.delay_hours >= 3.0);
    const trackingApiBugTickets = tickets.filter(t => t.product_issue_code === 'ERR-API-502');

    return NextResponse.json({
      snapshot_timestamp: SNAPSHOT_TIME,
      summary: {
        total_tickets: tickets.length,
        open_tickets: tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length,
        breached_sla_tickets: openBreachedTickets.length,
        carrier_delayed_orders: delayedCarrierOrders.length,
        bug_cluster_ERR_API_502: trackingApiBugTickets.length,
      },
      proactive_alerts: [
        {
          id: 'ALERT-001',
          severity: 'HIGH',
          title: 'SLA Breach Risk Detected',
          description: `${openBreachedTickets.length} open tickets have breached SLA response window relative to snapshot timestamp (${SNAPSHOT_TIME}).`,
          affected_tickets: openBreachedTickets.map(t => t.ticket_id),
        },
        {
          id: 'ALERT-002',
          severity: 'MEDIUM',
          title: 'Carrier Delay Spike (3+ Hours)',
          description: `${delayedCarrierOrders.length} shipments experienced pickup delays >= 3.0 hours due to carrier fault. Service credit eligible.`,
          affected_orders: delayedCarrierOrders.map(o => o.order_id),
        },
        {
          id: 'ALERT-003',
          severity: 'HIGH',
          title: 'Product Bug Cluster: ERR-API-502',
          description: `${trackingApiBugTickets.length} open customer tickets report FedEx/DHL carrier tracking status sync latency.`,
          affected_issue_code: 'ERR-API-502',
        },
      ],
      tickets: ticketsWithSLA,
      orders,
      audit_logs: auditLogs,
    });
  } catch (error: any) {
    console.error('API /api/dashboard error:', error);
    return NextResponse.json({ error: 'Failed to build dashboard intelligence payload' }, { status: 500 });
  }
}
