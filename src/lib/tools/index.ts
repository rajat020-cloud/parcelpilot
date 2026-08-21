import { getDB, DocumentChunk, Order, Ticket, Account, Action } from '../data/db';
import { UserSession, authorizeAccountAccess } from '../auth/security';

export interface ToolResult {
  tool_name: string;
  success: boolean;
  data: any;
  error?: string;
  summary: string;
}

export const SNAPSHOT_TIME = '2026-08-20T12:00:00Z';

export function search_documents(query: string, session: UserSession): ToolResult {
  const db = getDB();
  db.logAudit(session.user_id, session.role, session.account_id, 'search_documents', `Query: "${query}"`);

  const accountScope = session.role === 'CUSTOMER' ? session.account_id || undefined : undefined;
  const chunks = db.searchDocumentChunks(query, accountScope);

  const formattedResults = chunks.map(chunk => ({
    doc_name: chunk.doc_name,
    doc_type: chunk.doc_type,
    version: chunk.version,
    status: chunk.status,
    authority_rank: chunk.authority_rank,
    effective_date: chunk.effective_date,
    passage: chunk.content,
    is_deprecated: chunk.status === 'DEPRECATED',
    is_customer_agreement: chunk.doc_type === 'AGREEMENT',
  }));

  return {
    tool_name: 'search_documents',
    success: true,
    data: formattedResults,
    summary: `Found ${formattedResults.length} relevant document passages across current policies, enterprise agreements, and SOPs.`,
  };
}

export function query_parcelpilot_data(
  entity_type: 'account' | 'order' | 'ticket',
  filter_id: string | undefined,
  session: UserSession
): ToolResult {
  const db = getDB();
  db.logAudit(session.user_id, session.role, session.account_id, 'query_parcelpilot_data', `Entity: ${entity_type}, Filter: ${filter_id || 'NONE'}`);

  if (entity_type === 'account') {
    const targetAccId = filter_id || session.account_id || 'ACC-1001';
    if (!authorizeAccountAccess(session, targetAccId)) {
      return {
        tool_name: 'query_parcelpilot_data',
        success: false,
        data: null,
        error: `UNAUTHORIZED: Customer role (${session.account_id}) cannot inspect account ${targetAccId}.`,
        summary: `Access Denied: You are not authorized to view account data for ${targetAccId}.`,
      };
    }
    const acc = db.getAccount(targetAccId);
    if (!acc) {
      return { tool_name: 'query_parcelpilot_data', success: false, data: null, summary: `Account ${targetAccId} not found.` };
    }
    return { tool_name: 'query_parcelpilot_data', success: true, data: acc, summary: `Retrieved account details for ${acc.company_name} (${acc.account_id}).` };
  }

  if (entity_type === 'order') {
    if (!filter_id) {
      if (session.role === 'CUSTOMER' && session.account_id) {
        const orders = db.getOrdersByAccount(session.account_id);
        return { tool_name: 'query_parcelpilot_data', success: true, data: orders, summary: `Retrieved ${orders.length} orders for account ${session.account_id}.` };
      }
      const orders = db.getAllOrders();
      return { tool_name: 'query_parcelpilot_data', success: true, data: orders, summary: `Retrieved ${orders.length} orders across system.` };
    }

    const order = db.getOrder(filter_id);
    if (!order) {
      return { tool_name: 'query_parcelpilot_data', success: false, data: null, summary: `Order ${filter_id} not found.` };
    }

    if (!authorizeAccountAccess(session, order.account_id)) {
      return {
        tool_name: 'query_parcelpilot_data',
        success: false,
        data: null,
        error: `UNAUTHORIZED: Customer account ${session.account_id} attempted to access order ${filter_id} belonging to account ${order.account_id}.`,
        summary: `Access Denied: You are not authorized to access order ${filter_id}.`,
      };
    }

    return { tool_name: 'query_parcelpilot_data', success: true, data: order, summary: `Retrieved order ${order.order_id} (Account: ${order.account_id}, Value: $${order.order_value}, Status: ${order.status}).` };
  }

  if (entity_type === 'ticket') {
    if (!filter_id) {
      if (session.role === 'CUSTOMER' && session.account_id) {
        const tickets = db.getTicketsByAccount(session.account_id);
        return { tool_name: 'query_parcelpilot_data', success: true, data: tickets, summary: `Retrieved ${tickets.length} tickets for account ${session.account_id}.` };
      }
      const tickets = db.getAllTickets();
      return { tool_name: 'query_parcelpilot_data', success: true, data: tickets, summary: `Retrieved ${tickets.length} tickets across system.` };
    }

    const ticket = db.getTicket(filter_id);
    if (!ticket) {
      return { tool_name: 'query_parcelpilot_data', success: false, data: null, summary: `Ticket ${filter_id} not found.` };
    }

    if (!authorizeAccountAccess(session, ticket.account_id)) {
      return {
        tool_name: 'query_parcelpilot_data',
        success: false,
        data: null,
        error: `UNAUTHORIZED: Customer account ${session.account_id} attempted to access ticket ${filter_id} belonging to ${ticket.account_id}.`,
        summary: `Access Denied: You are not authorized to view ticket ${filter_id}.`,
      };
    }

    return { tool_name: 'query_parcelpilot_data', success: true, data: ticket, summary: `Retrieved ticket ${ticket.ticket_id} (${ticket.subject}, Status: ${ticket.status}, Priority: ${ticket.priority}).` };
  }

  return { tool_name: 'query_parcelpilot_data', success: false, data: null, summary: 'Invalid entity type requested.' };
}

export function calculate_service_credit(order_id: string, session: UserSession): ToolResult {
  const db = getDB();
  const order = db.getOrder(order_id);
  if (!order) {
    return { tool_name: 'calculate_service_credit', success: false, data: null, summary: `Order ${order_id} not found.` };
  }

  if (!authorizeAccountAccess(session, order.account_id)) {
    return { tool_name: 'calculate_service_credit', success: false, data: null, summary: `UNAUTHORIZED access to order ${order_id}.` };
  }

  db.logAudit(session.user_id, session.role, session.account_id, 'calculate_service_credit', `Order: ${order_id}`);

  let creditRate = 0;
  let ruleApplied = '';
  let eligible = false;

  if (!order.carrier_fault) {
    return {
      tool_name: 'calculate_service_credit',
      success: true,
      data: { eligible: false, credit_amount: 0, reason: 'Delay was not caused by carrier fault.' },
      summary: `Order ${order_id} is NOT eligible for service credit (No carrier fault recorded).`,
    };
  }

  if (order.account_id === 'ACC-1001') {
    if (order.delay_hours > 2.0) {
      eligible = true;
      creditRate = 0.25;
      ruleApplied = 'Northstar Enterprise Agreement Section 6.1 (25% credit for delay > 2h carrier fault)';
    }
  } else if (order.account_id === 'ACC-1002') {
    if (order.delay_hours >= 3.0) {
      eligible = true;
      creditRate = 0.15 * 1.5;
      ruleApplied = 'LumenWorks Enterprise Agreement Section 5.2 (1.5x multiplier on SOP rate = 22.5%)';
    }
  } else {
    if (order.delay_hours >= 3.0) {
      eligible = true;
      creditRate = 0.15;
      ruleApplied = 'SOP v4 Section 2 (15% service credit for pickup delay >= 3.0 hours carrier fault)';
    } else if (order.delay_hours > 4.0) {
      eligible = true;
      creditRate = 0.10;
      ruleApplied = 'Support Policy v3 Section 3 (10% standard service credit for delay > 4 hours)';
    }
  }

  const creditAmount = eligible ? order.order_value * creditRate : 0;

  return {
    tool_name: 'calculate_service_credit',
    success: true,
    data: {
      order_id,
      account_id: order.account_id,
      order_value: order.order_value,
      delay_hours: order.delay_hours,
      carrier_fault: order.carrier_fault,
      eligible,
      credit_rate: creditRate,
      credit_amount: creditAmount,
      rule_applied: ruleApplied,
    },
    summary: eligible
      ? `Calculated Service Credit: $${creditAmount.toFixed(2)} (${(creditRate * 100).toFixed(1)}% of $${order.order_value}) under rule: ${ruleApplied}.`
      : `Order ${order_id} delay of ${order.delay_hours}h does not meet minimum credit threshold under standard policy.`,
  };
}

export function calculate_sla_status(ticket_id: string, session: UserSession): ToolResult {
  const db = getDB();
  const ticket = db.getTicket(ticket_id);
  if (!ticket) {
    return { tool_name: 'calculate_sla_status', success: false, data: null, summary: `Ticket ${ticket_id} not found.` };
  }

  if (!authorizeAccountAccess(session, ticket.account_id)) {
    return { tool_name: 'calculate_sla_status', success: false, data: null, summary: `UNAUTHORIZED access to ticket ${ticket_id}.` };
  }

  db.logAudit(session.user_id, session.role, session.account_id, 'calculate_sla_status', `Ticket: ${ticket_id}`);

  const snapshotMs = new Date(SNAPSHOT_TIME).getTime();
  const dueMs = new Date(ticket.sla_due_at).getTime();
  const diffMs = dueMs - snapshotMs;
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  const isBreached = diffMinutes < 0;

  return {
    tool_name: 'calculate_sla_status',
    success: true,
    data: {
      ticket_id,
      created_at: ticket.created_at,
      sla_due_at: ticket.sla_due_at,
      snapshot_reference_time: SNAPSHOT_TIME,
      remaining_minutes: diffMinutes,
      is_breached: isBreached,
      status_label: isBreached
        ? `SLA BREACHED by ${Math.abs(diffMinutes)} minutes (Due: ${ticket.sla_due_at})`
        : `SLA OK - ${diffMinutes} minutes remaining`,
    },
    summary: isBreached
      ? `WARNING: Ticket ${ticket_id} SLA is BREACHED by ${Math.abs(diffMinutes)} minutes relative to snapshot timestamp (${SNAPSHOT_TIME}).`
      : `Ticket ${ticket_id} SLA is within limits (${diffMinutes}m remaining).`,
  };
}

export function detect_similar_issues(product_issue_code: string, session: UserSession): ToolResult {
  const db = getDB();
  db.logAudit(session.user_id, session.role, session.account_id, 'detect_similar_issues', `Code: ${product_issue_code}`);

  const allTickets = db.getAllTickets();
  const matchingTickets = allTickets.filter(t => t.product_issue_code === product_issue_code);
  const affectedAccounts = Array.from(new Set(matchingTickets.map(t => t.account_id)));

  return {
    tool_name: 'detect_similar_issues',
    success: true,
    data: {
      product_issue_code,
      total_tickets: matchingTickets.length,
      affected_accounts_count: affectedAccounts.length,
      tickets: matchingTickets.map(t => ({ ticket_id: t.ticket_id, account_id: t.account_id, subject: t.subject, status: t.status })),
    },
    summary: `Found ${matchingTickets.length} tickets across ${affectedAccounts.length} distinct accounts reporting product issue ${product_issue_code}.`,
  };
}

export function prepare_action(
  action_type: 'CREATE_ESCALATION' | 'UPDATE_TICKET' | 'CREATE_FOLLOWUP',
  target_id: string,
  details: string,
  session: UserSession
): ToolResult {
  const db = getDB();
  const action_id = `ACT-${Date.now().toString().slice(-6)}`;
  const newAction: Action = {
    action_id,
    user_id: session.user_id,
    role: session.role,
    action_type,
    target_id,
    details,
    status: 'PENDING',
    created_at: new Date().toISOString(),
  };

  db.createAction(newAction);
  db.logAudit(session.user_id, session.role, session.account_id, 'prepare_action', `Action: ${action_id} (${action_type})`);

  return {
    tool_name: 'prepare_action',
    success: true,
    data: newAction,
    summary: `Prepared state-changing action ${action_id} (${action_type} for ${target_id}). Requires explicit user confirmation to execute.`,
  };
}

export function confirm_action(action_id: string, decision: 'CONFIRM' | 'CANCEL', session: UserSession): ToolResult {
  const db = getDB();
  const action = db.getAction(action_id);
  if (!action) {
    return { tool_name: 'confirm_action', success: false, data: null, summary: `Action ${action_id} not found.` };
  }

  const finalStatus = decision === 'CONFIRM' ? 'EXECUTED' : 'CANCELLED';
  db.updateActionStatus(action_id, finalStatus);
  db.logAudit(session.user_id, session.role, session.account_id, 'confirm_action', `Action: ${action_id} set to ${finalStatus}`);

  return {
    tool_name: 'confirm_action',
    success: true,
    data: { action_id, final_status: finalStatus },
    summary: finalStatus === 'EXECUTED'
      ? `Action ${action_id} successfully CONFIRMED and EXECUTED.`
      : `Action ${action_id} CANCELLED by user.`,
  };
}
