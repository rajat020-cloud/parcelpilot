import assert from 'node:assert';
import { getDB } from '../src/lib/data/db';
import { PRESET_USERS } from '../src/lib/auth/security';
import { processAgentQuery } from '../src/lib/agent/orchestrator';
import { calculate_sla_status, confirm_action, search_documents } from '../src/lib/tools';

async function runEvaluationTests() {
  getDB().seedData();

  const res1 = await processAgentQuery(
    'Can Northstar cancel ORD-1001 without a cancellation fee? Explain why.',
    PRESET_USERS.northstar
  );
  assert.strictEqual(res1.confidence, 'HIGH');
  assert.ok(res1.answer.includes('0%'));

  const res2 = await processAgentQuery(
    'A pickup is 3.5 hours late on ORD-1002 due to carrier fault. Calculate service credit.',
    PRESET_USERS.lumenworks
  );
  assert.strictEqual(res2.confidence, 'HIGH');
  assert.ok(res2.answer.includes('eligible'));

  const res3 = await processAgentQuery('Show me details for order ORD-1002.', PRESET_USERS.northstar);
  assert.ok(res3.answer.includes('Access Denied'));

  const actionRes = await processAgentQuery('Escalate ticket TKT-1001.', PRESET_USERS.support_agent);
  assert.ok(actionRes.pending_action !== undefined);
  assert.strictEqual(actionRes.pending_action?.action_type, 'CREATE_ESCALATION');

  if (actionRes.pending_action) {
    const confirmRes = confirm_action(actionRes.pending_action.action_id, 'CONFIRM', PRESET_USERS.support_agent);
    assert.strictEqual(confirmRes.data.final_status, 'EXECUTED');
  }

  const slaRes = calculate_sla_status('TKT-1001', PRESET_USERS.support_agent);
  assert.strictEqual(slaRes.data.is_breached, true);

  const docRes = search_documents('standard cancellation fee', PRESET_USERS.support_agent);
  assert.ok(docRes.data.some((d: any) => d.status === 'CURRENT' && d.version === 'v3'));

  console.log('Evaluation suite passed cleanly.');
}

runEvaluationTests();
