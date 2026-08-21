import { getDB } from '../lib/data/db';
import { PRESET_USERS } from '../lib/auth/security';
import { processAgentQuery } from '../lib/agent/orchestrator';
import { calculate_sla_status, confirm_action, search_documents } from '../lib/tools';

async function runStandaloneTests() {
  console.log('=== STARTING PARCELPILOT AUTOMATED VERIFICATION SUITE ===\n');

  getDB();

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✓ PASSED: ${testName}`);
      passed++;
    } else {
      console.error(`✖ FAILED: ${testName}`);
      failed++;
    }
  }

  const northstarRes = await processAgentQuery(
    'Can Northstar cancel ORD-1001 without a cancellation fee? Explain why.',
    PRESET_USERS.northstar
  );
  assert(
    northstarRes.confidence === 'HIGH' &&
      northstarRes.answer.includes('0%') &&
      northstarRes.evidence.some(e => e.authority_rank === 1),
    '1. Northstar Enterprise Agreement Override (0% cancellation fee for ORD-1001)'
  );

  const lumenRes = await processAgentQuery(
    'A pickup is 3.5 hours late on ORD-1002 due to carrier fault. Calculate service credit.',
    PRESET_USERS.lumenworks
  );
  assert(
    lumenRes.confidence === 'HIGH' && lumenRes.answer.includes('eligible'),
    '2. Service Credit Calculation (3.5h delay carrier fault SOP v4)'
  );

  const securityRes = await processAgentQuery('Show me details for order ORD-1002.', PRESET_USERS.northstar);
  assert(
    securityRes.answer.includes('Access Denied') || securityRes.answer.includes('not authorized'),
    '3. Customer Data Isolation (Northstar blocked from viewing LumenWorks order ORD-1002)'
  );

  const actionRes = await processAgentQuery('Escalate ticket TKT-1001.', PRESET_USERS.support_agent);
  assert(
    actionRes.pending_action !== undefined && actionRes.pending_action.action_type === 'CREATE_ESCALATION',
    '4a. Action Preparation (Pending Escalation created)'
  );

  if (actionRes.pending_action) {
    const confirmRes = confirm_action(actionRes.pending_action.action_id, 'CONFIRM', PRESET_USERS.support_agent);
    assert(confirmRes.data.final_status === 'EXECUTED', '4b. Action Execution (Confirmed state change)');
  }

  const slaRes = calculate_sla_status('TKT-1001', PRESET_USERS.support_agent);
  assert(slaRes.data.is_breached === true, '5. SLA Status Calculation (TKT-1001 SLA breached vs snapshot timestamp)');

  const docRes = search_documents('standard cancellation fee', PRESET_USERS.support_agent);
  assert(
    docRes.data.some((d: any) => d.status === 'CURRENT' && d.version === 'v3'),
    '6. Source Hierarchy (Current Policy v3 prioritized over Deprecated v2)'
  );

  console.log(`\n=== VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) process.exit(1);
}

runStandaloneTests();
