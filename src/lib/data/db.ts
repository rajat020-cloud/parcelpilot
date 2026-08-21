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

    const docsDir = path.join(process.cwd(), 'data_pack', 'documents');
    if (fs.existsSync(docsDir)) {
      const docFiles = fs.readdirSync(docsDir).filter(f => f.endsWith('.txt'));

      for (const file of docFiles) {
        const fullPath = path.join(docsDir, file);
        const content = fs.readFileSync(fullPath, 'utf-8');

        let doc_type: 'POLICY' | 'SOP' | 'AGREEMENT' | 'PRODUCT_DOC' | 'TICKET' = 'POLICY';
        let status: 'CURRENT' | 'DEPRECATED' = 'CURRENT';
        let version = 'v3';
        let effective_date = '2026-01-01';
        let authority_rank = 2;
        let account_id: string | null = null;

        if (file.includes('DEPRECATED')) {
          status = 'DEPRECATED';
          version = 'v2';
          authority_rank = 5;
          effective_date = '2024-01-01';
        } else if (file.includes('SOP')) {
          doc_type = 'SOP';
          version = 'v4';
          authority_rank = 3;
          effective_date = '2026-02-15';
        } else if (file.includes('Known_Issues')) {
          doc_type = 'PRODUCT_DOC';
          version = 'v1';
          authority_rank = 4;
          effective_date = '2026-03-01';
        } else if (file.includes('Northstar')) {
          doc_type = 'AGREEMENT';
          account_id = 'ACC-1001';
          authority_rank = 1;
          effective_date = '2025-06-01';
        } else if (file.includes('LumenWorks')) {
          doc_type = 'AGREEMENT';
          account_id = 'ACC-1002';
          authority_rank = 1;
          effective_date = '2025-09-01';
        }

        const chunk: DocumentChunk = {
          id: `CHK-${file}`,
          doc_name: file,
          doc_type,
          status,
          version,
          effective_date,
          authority_rank,
          account_id,
          content,
        };
        this.chunksMap.set(chunk.id, chunk);
      }
    }
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
