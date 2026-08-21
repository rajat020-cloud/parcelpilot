import fs from 'fs';
import path from 'path';
import { generateAllDataFiles, SNAPSHOT_TIMESTAMP } from './generate_datapack';

export interface Account {
  account_id: string;
  company_name: string;
  tier: 'ENTERPRISE' | 'PREMIUM' | 'STANDARD';
  sla_hours: number;
  contract_start: string;
  contract_end: string;
  status: string;
}

export interface Order {
  order_id: string;
  account_id: string;
  created_at: string;
  origin: string;
  destination: string;
  carrier: string;
  order_value: number;
  status: string;
  scheduled_pickup: string;
  actual_pickup: string | null;
  delay_hours: number;
  carrier_fault: boolean;
  cancellation_notice_hours: number | null;
}

export interface Ticket {
  ticket_id: string;
  account_id: string;
  order_id: string | null;
  created_at: string;
  status: string;
  priority: string;
  subject: string;
  description: string;
  resolution: string | null;
  sla_due_at: string;
  product_issue_code: string | null;
}

export interface DocumentChunk {
  id: string;
  doc_name: string;
  doc_type: 'POLICY' | 'SOP' | 'AGREEMENT' | 'PRODUCT_DOC' | 'TICKET';
  status: 'CURRENT' | 'DEPRECATED';
  version: string;
  effective_date: string;
  authority_rank: number;
  account_id: string | null;
  content: string;
}

export interface Action {
  action_id: string;
  user_id: string;
  role: string;
  action_type: string;
  target_id: string;
  details: string;
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED';
  created_at: string;
}

export interface AuditLog {
  id?: number;
  timestamp: string;
  user_id: string;
  role: string;
  account_id: string | null;
  action: string;
  details: string;
}

class ParcelPilotMemoryDB {
  private accountsMap = new Map<string, Account>();
  private ordersMap = new Map<string, Order>();
  private ticketsMap = new Map<string, Ticket>();
  private chunksMap = new Map<string, DocumentChunk>();
  private actionsMap = new Map<string, Action>();
  private auditLogs: AuditLog[] = [];

  constructor() {
    this.seedData();
  }

  public seedData() {
    generateAllDataFiles();

    const accounts: Account[] = [
      { account_id: 'ACC-1001', company_name: 'Northstar Logistics', tier: 'ENTERPRISE', sla_hours: 1, contract_start: '2025-06-01', contract_end: '2027-06-01', status: 'ACTIVE' },
      { account_id: 'ACC-1002', company_name: 'LumenWorks', tier: 'ENTERPRISE', sla_hours: 2, contract_start: '2025-09-01', contract_end: '2026-09-01', status: 'ACTIVE' },
      { account_id: 'ACC-1003', company_name: 'Apex Freight', tier: 'PREMIUM', sla_hours: 4, contract_start: '2026-01-15', contract_end: '2027-01-15', status: 'ACTIVE' },
      { account_id: 'ACC-1004', company_name: 'SwiftCargo Systems', tier: 'STANDARD', sla_hours: 12, contract_start: '2026-02-01', contract_end: '2027-02-01', status: 'ACTIVE' },
      { account_id: 'ACC-1005', company_name: 'Horizon Distribution', tier: 'STANDARD', sla_hours: 12, contract_start: '2026-03-01', contract_end: '2027-03-01', status: 'ACTIVE' },
    ];
    accounts.forEach(a => this.accountsMap.set(a.account_id, a));

    const orders: Order[] = [
      { order_id: 'ORD-1001', account_id: 'ACC-1001', created_at: '2026-08-18T14:00:00Z', origin: 'Chicago, IL', destination: 'Dallas, TX', carrier: 'FedEx Express', order_value: 2450.0, status: 'CANCELLED', scheduled_pickup: '2026-08-19T10:00:00Z', actual_pickup: null, delay_hours: 0, carrier_fault: false, cancellation_notice_hours: 18.5 },
      { order_id: 'ORD-1002', account_id: 'ACC-1002', created_at: '2026-08-19T08:00:00Z', origin: 'Atlanta, GA', destination: 'Miami, FL', carrier: 'DHL Freight', order_value: 1800.0, status: 'DELAYED', scheduled_pickup: '2026-08-20T06:00:00Z', actual_pickup: '2026-08-20T09:30:00Z', delay_hours: 3.5, carrier_fault: true, cancellation_notice_hours: null },
      { order_id: 'ORD-1003', account_id: 'ACC-1001', created_at: '2026-08-19T11:00:00Z', origin: 'Seattle, WA', destination: 'Denver, CO', carrier: 'XPO Logistics', order_value: 3200.0, status: 'DELAYED', scheduled_pickup: '2026-08-20T05:00:00Z', actual_pickup: '2026-08-20T08:00:00Z', delay_hours: 3.0, carrier_fault: true, cancellation_notice_hours: null },
      { order_id: 'ORD-1004', account_id: 'ACC-1003', created_at: '2026-08-20T07:00:00Z', origin: 'New York, NY', destination: 'Boston, MA', carrier: 'FedEx Express', order_value: 950.0, status: 'BOOKED', scheduled_pickup: '2026-08-21T08:00:00Z', actual_pickup: null, delay_hours: 0, carrier_fault: false, cancellation_notice_hours: null },
      { order_id: 'ORD-1005', account_id: 'ACC-1004', created_at: '2026-08-20T04:00:00Z', origin: 'Chicago, IL', destination: 'Detroit, MI', carrier: 'XPO Logistics', order_value: 1400.0, status: 'DELAYED', scheduled_pickup: '2026-08-20T05:00:00Z', actual_pickup: '2026-08-20T11:00:00Z', delay_hours: 6.0, carrier_fault: true, cancellation_notice_hours: null },
      { order_id: 'ORD-1006', account_id: 'ACC-1005', created_at: '2026-08-20T06:00:00Z', origin: 'Phoenix, AZ', destination: 'Los Angeles, CA', carrier: 'FedEx Express', order_value: 2100.0, status: 'DELAYED', scheduled_pickup: '2026-08-20T06:30:00Z', actual_pickup: '2026-08-20T11:00:00Z', delay_hours: 4.5, carrier_fault: true, cancellation_notice_hours: null },
    ];
    orders.forEach(o => this.ordersMap.set(o.order_id, o));

    const tickets: Ticket[] = [
      { ticket_id: 'TKT-1001', account_id: 'ACC-1001', order_id: 'ORD-1001', created_at: '2026-08-20T10:00:00Z', status: 'OPEN', priority: 'HIGH', subject: 'ORD-1001 Cancellation Fee Inquiry', description: 'Northstar cancelled ORD-1001 with 18.5 hours notice prior to scheduled pickup. Demanding confirmation of 0% fee per enterprise contract.', resolution: null, sla_due_at: '2026-08-20T11:00:00Z', product_issue_code: null },
      { ticket_id: 'TKT-1002', account_id: 'ACC-1002', order_id: 'ORD-1002', created_at: '2026-08-20T09:30:00Z', status: 'OPEN', priority: 'URGENT', subject: '3.5 hour pickup delay on ORD-1002 carrier fault', description: 'Pickup was 3.5 hours late due to DHL vehicle breakdown. Requesting service credit.', resolution: null, sla_due_at: '2026-08-20T11:30:00Z', product_issue_code: 'ERR-API-502' },
      { ticket_id: 'TKT-1003', account_id: 'ACC-1001', order_id: 'ORD-1003', created_at: '2026-08-20T08:00:00Z', status: 'IN_PROGRESS', priority: 'HIGH', subject: 'Late pickup 3 hours ORD-1003', description: 'XPO pickup delayed by 3 hours. Carrier fault confirmed.', resolution: null, sla_due_at: '2026-08-20T09:00:00Z', product_issue_code: null },
      { ticket_id: 'TKT-1004', account_id: 'ACC-1003', order_id: 'ORD-1004', created_at: '2025-11-10T10:00:00Z', status: 'RESOLVED', priority: 'MEDIUM', subject: 'Historical cancellation request fee question', description: 'Customer asked about cancellation fee policy.', resolution: 'Applied flat 25% cancellation fee per deprecated support policy v2.', sla_due_at: '2025-11-10T14:00:00Z', product_issue_code: null },
      { ticket_id: 'TKT-1005', account_id: 'ACC-1004', order_id: 'ORD-1005', created_at: '2026-08-20T11:00:00Z', status: 'OPEN', priority: 'HIGH', subject: 'Tracking API error ERR-API-502', description: 'Tracking status not updating for order ORD-1005 due to API sync error.', resolution: null, sla_due_at: '2026-08-20T23:00:00Z', product_issue_code: 'ERR-API-502' },
      { ticket_id: 'TKT-1006', account_id: 'ACC-1005', order_id: 'ORD-1006', created_at: '2026-08-20T11:15:00Z', status: 'OPEN', priority: 'HIGH', subject: 'Tracking status delayed ERR-API-502', description: 'Carrier status sync failed with ERR-API-502 on shipment ORD-1006.', resolution: null, sla_due_at: '2026-08-20T23:15:00Z', product_issue_code: 'ERR-API-502' },
    ];
    tickets.forEach(t => this.ticketsMap.set(t.ticket_id, t));

    const embeddedDocs: DocumentChunk[] = [
      {
        id: 'CHK-01',
        doc_name: '01_Support_Policy_v3_CURRENT.pdf',
        doc_type: 'POLICY',
        status: 'CURRENT',
        version: 'v3',
        effective_date: '2026-01-01',
        authority_rank: 2,
        account_id: null,
        content: `PARCELPILOT GLOBAL SUPPORT POLICY v3 (CURRENT)\nStatus: CURRENT ACTIVE\nAuthority Rank: 2\n1. SLAs: Enterprise Tier 2-hour SLA for high priority. Premium Tier 4-hour SLA. Standard Tier 12-hour SLA.\n2. Cancellation Fees: Orders cancelled >24 hours prior to pickup incur 0% cancellation fee. Orders cancelled <24 hours prior to pickup incur standard 15% cancellation fee unless overridden by enterprise contract. Orders cancelled post-dispatch incur 50% fee.\n3. Service Credits: Verified carrier-fault delay >4h qualifies for 10% credit.`,
      },
      {
        id: 'CHK-02',
        doc_name: '02_Support_Policy_v2_DEPRECATED.pdf',
        doc_type: 'POLICY',
        status: 'DEPRECATED',
        version: 'v2',
        effective_date: '2024-01-01',
        authority_rank: 5,
        account_id: null,
        content: `PARCELPILOT GLOBAL SUPPORT POLICY v2 (DEPRECATED)\nStatus: DEPRECATED\nAuthority Rank: 5\n1. Flat 25% cancellation fee applied to all order cancellations regardless of notice period.\n2. No service credits permitted for delays under 8 hours.`,
      },
      {
        id: 'CHK-03',
        doc_name: '03_Cancellation_and_Service_Credit_SOP_v4.pdf',
        doc_type: 'SOP',
        status: 'CURRENT',
        version: 'v4',
        effective_date: '2026-02-15',
        authority_rank: 3,
        account_id: null,
        content: `PARCELPILOT CANCELLATION AND SERVICE CREDIT SOP v4\nStatus: CURRENT SOP\nAuthority Rank: 3\nSPECIAL CARRIER FAULT PICKUP DELAY RULE (3-HOUR RULE): If pickup is delayed >= 3 hours due to carrier fault, customer qualifies for an immediate 15% service credit on total order value. Escalation required if delay > 5h or order value > $5,000.`,
      },
      {
        id: 'CHK-04',
        doc_name: '04_Product_Operations_Guide_and_Known_Issues.pdf',
        doc_type: 'PRODUCT_DOC',
        status: 'CURRENT',
        version: 'v1',
        effective_date: '2026-03-01',
        authority_rank: 4,
        account_id: null,
        content: `PARCELPILOT PRODUCT OPERATIONS GUIDE AND KNOWN ISSUES\nAuthority Rank: 4\nBug Code: ERR-API-502 - Carrier API status sync latency affecting FedEx and DHL tracking feeds. Workaround: verify carrier portal directly. 0% cancellation fee applies if cancellation requested due to un-synced status.`,
      },
      {
        id: 'CHK-05',
        doc_name: '05_Northstar_Logistics_Enterprise_Agreement.pdf',
        doc_type: 'AGREEMENT',
        status: 'CURRENT',
        version: 'v1',
        effective_date: '2025-06-01',
        authority_rank: 1,
        account_id: 'ACC-1001',
        content: `NORTHSTAR LOGISTICS ENTERPRISE MASTER SERVICES AGREEMENT\nAccount ID: ACC-1001\nAuthority Rank: 1 (Highest Authority - Customer Contract Override)\nSection 4.2 CANCELLATION FEE OVERRIDE: Northstar Logistics shall incur ZERO (0%) CANCELLATION FEE for any order cancelled prior to physical carrier pickup or with at least 12 hours notice prior to scheduled pickup. Section 6.1: Pickup delay > 2 hours carrier fault qualifies Northstar for 25% credit.`,
      },
      {
        id: 'CHK-06',
        doc_name: '06_LumenWorks_Service_Agreement.pdf',
        doc_type: 'AGREEMENT',
        status: 'CURRENT',
        version: 'v1',
        effective_date: '2025-09-01',
        authority_rank: 1,
        account_id: 'ACC-1002',
        content: `LUMENWORKS ENTERPRISE SERVICE AGREEMENT\nAccount ID: ACC-1002\nAuthority Rank: 1 (Highest Authority - Customer Contract Override)\nSection 3.4 TECHNICAL FAULT CANCELLATION: 0% cancellation fee if requested due to platform bugs (ERR-API-502). Section 5.2 SERVICE CREDIT MULTIPLIER: 1.5x credit multiplier on standard SOP rate (22.5% total order value credit for carrier delay >= 3.0h).`,
      },
    ];

    embeddedDocs.forEach(chunk => this.chunksMap.set(chunk.id, chunk));
  }

  public getAccount(accountId: string): Account | undefined {
    return this.accountsMap.get(accountId);
  }

  public getAllAccounts(): Account[] {
    return Array.from(this.accountsMap.values());
  }

  public getOrder(orderId: string): Order | undefined {
    return this.ordersMap.get(orderId);
  }

  public getOrdersByAccount(accountId: string): Order[] {
    return Array.from(this.ordersMap.values()).filter(o => o.account_id === accountId);
  }

  public getAllOrders(): Order[] {
    return Array.from(this.ordersMap.values());
  }

  public getTicket(ticketId: string): Ticket | undefined {
    return this.ticketsMap.get(ticketId);
  }

  public getTicketsByAccount(accountId: string): Ticket[] {
    return Array.from(this.ticketsMap.values()).filter(t => t.account_id === accountId);
  }

  public getAllTickets(): Ticket[] {
    return Array.from(this.ticketsMap.values());
  }

  public searchDocumentChunks(query: string, accountId?: string): DocumentChunk[] {
    const chunks = Array.from(this.chunksMap.values());
    const qLower = query.toLowerCase();

    return chunks
      .filter(chunk => {
        if (chunk.account_id && accountId && chunk.account_id !== accountId) {
          return false;
        }
        return true;
      })
      .map(chunk => {
        let score = 0;
        const cLower = chunk.content.toLowerCase();
        const words = qLower.split(/\s+/).filter(w => w.length > 2);

        for (const w of words) {
          if (cLower.includes(w)) score += 1;
        }

        if (chunk.authority_rank === 1) score += 2;
        if (chunk.status === 'CURRENT') score += 1;
        if (chunk.status === 'DEPRECATED') score -= 2;

        return { chunk, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.chunk);
  }

  public createAction(action: Action) {
    this.actionsMap.set(action.action_id, action);
  }

  public updateActionStatus(actionId: string, status: 'EXECUTED' | 'CANCELLED') {
    const action = this.actionsMap.get(actionId);
    if (action) {
      action.status = status;
    }
  }

  public getAction(actionId: string): Action | undefined {
    return this.actionsMap.get(actionId);
  }

  public logAudit(user_id: string, role: string, account_id: string | null, action: string, details: string) {
    this.auditLogs.unshift({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      user_id,
      role,
      account_id,
      action,
      details,
    });
  }

  public getAuditLogs(): AuditLog[] {
    return this.auditLogs.slice(0, 100);
  }
}

let dbInstance: ParcelPilotMemoryDB | null = null;

export function getDB(): ParcelPilotMemoryDB {
  if (!dbInstance) {
    dbInstance = new ParcelPilotMemoryDB();
  }
  return dbInstance;
}
export { SNAPSHOT_TIMESTAMP as SNAPSHOT_TIME };
