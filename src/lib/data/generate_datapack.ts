import fs from 'fs';
import path from 'path';

const DATA_PACK_DIR = path.join(process.cwd(), 'data_pack');
const DOCS_DIR = path.join(DATA_PACK_DIR, 'documents');

export const SNAPSHOT_TIMESTAMP = '2026-08-20T12:00:00Z';

export function ensureDirectoriesExist() {
  try {
    if (!fs.existsSync(DATA_PACK_DIR)) {
      fs.mkdirSync(DATA_PACK_DIR, { recursive: true });
    }
    if (!fs.existsSync(DOCS_DIR)) {
      fs.mkdirSync(DOCS_DIR, { recursive: true });
    }
  } catch (e) {}
}

function safeWriteFile(filePath: string, content: string) {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
  } catch (e) {}
}

export function generateAllDataFiles() {
  ensureDirectoriesExist();

  const doc1 = `PARCELPILOT GLOBAL SUPPORT POLICY v3 (CURRENT)
Document ID: DOC-POL-V3
Status: CURRENT ACTIVE
Effective Date: 2026-01-01
Authority Rank: 2 (General Standard Policy)

1. SERVICE LEVEL AGREEMENTS (SLAs)
ParcelPilot provides support response time SLAs based on customer account tier:
- Enterprise Tier: 2-hour response SLA for high/urgent priority tickets.
- Premium Tier: 4-hour response SLA for standard support tickets.
- Standard Tier: 12-hour response SLA for routine inquiries.

2. STANDARD CANCELLATION POLICY & FEES
- Orders cancelled greater than 24 hours prior to scheduled pickup time incur 0% cancellation fee.
- Orders cancelled less than 24 hours prior to scheduled pickup time incur a standard 15% cancellation fee based on total order value.
- Orders cancelled after carrier dispatch or arrival at pickup location incur a 50% cancellation fee unless overridden by customer-specific enterprise contract.

3. GENERAL SERVICE CREDITS
- Shipments experiencing verified carrier-fault pickup or delivery delays exceeding 4 hours are eligible for a standard 10% service credit of total order value.
- Claims must be submitted within 30 days of shipment booking.
`;
  safeWriteFile(path.join(DOCS_DIR, '01_Support_Policy_v3_CURRENT.pdf'), doc1);
  safeWriteFile(path.join(DOCS_DIR, '01_Support_Policy_v3_CURRENT.txt'), doc1);

  const doc2 = `PARCELPILOT GLOBAL SUPPORT POLICY v2 (DEPRECATED)
Document ID: DOC-POL-V2
Status: DEPRECATED
Effective Date: 2024-01-01
Expiration Date: 2025-12-31
Authority Rank: 5 (Unauthoritative Deprecated Policy)

NOTICE: THIS POLICY VERSION IS DEPRECATED AND NO LONGER IN EFFECT.

1. DEPRECATED SLAs
- Baseline 24-hour SLA across all customer tiers.

2. DEPRECATED CANCELLATION RULES
- Flat 25% cancellation fee applied to all order cancellations regardless of notice period.

3. DEPRECATED SERVICE CREDITS
- No service credits permitted for delays under 8 hours.
`;
  safeWriteFile(path.join(DOCS_DIR, '02_Support_Policy_v2_DEPRECATED.pdf'), doc2);
  safeWriteFile(path.join(DOCS_DIR, '02_Support_Policy_v2_DEPRECATED.txt'), doc2);

  const doc3 = `PARCELPILOT CANCELLATION AND SERVICE CREDIT SOP v4
Document ID: DOC-SOP-V4
Status: CURRENT SOP
Effective Date: 2026-02-15
Authority Rank: 3 (Operational Procedure)

1. PURPOSE & SCOPE
This Standard Operating Procedure (SOP) outlines step-by-step instructions for support agents evaluating cancellation fee waivers and service credit requests.

2. SPECIAL CARRIER FAULT PICKUP DELAY RULE (3-HOUR RULE)
- If a scheduled pickup is delayed by 3 hours or more (delay_hours >= 3.0) due to verified carrier fault (carrier_fault = true), the customer qualifies for an immediate 15% service credit on the total order value.
- Formula: Credit Amount = Order Value * 0.15.

3. ESCALATION REQUIREMENTS
Support agents must prepare a formal escalation card (requiring manager confirmation) under any of the following conditions:
a) Carrier fault pickup delay exceeds 5 hours.
b) Total order value exceeds $5,000.
c) Customer requests an exception to general policy or custom agreement interpretation.
`;
  safeWriteFile(path.join(DOCS_DIR, '03_Cancellation_and_Service_Credit_SOP_v4.pdf'), doc3);
  safeWriteFile(path.join(DOCS_DIR, '03_Cancellation_and_Service_Credit_SOP_v4.txt'), doc3);

  const doc4 = `PARCELPILOT PRODUCT OPERATIONS GUIDE AND KNOWN ISSUES
Document ID: DOC-PRD-V1
Status: CURRENT PRODUCT DOC
Effective Date: 2026-03-01
Authority Rank: 4 (Technical Documentation)

1. KNOWN SYSTEM ISSUES & BUG CODES

Bug Code: ERR-API-502
Description: Carrier API status sync latency affecting FedEx and DHL integration feeds.
Impact: Order tracking updates may lag up to 6 hours behind physical shipment events.
Workaround: Manually verify carrier tracking portal directly. 0% cancellation fee applies if cancellation requested due to un-synced status.

Bug Code: ERR-LBL-409
Description: PDF barcode rendering failure during batch label generation.
Workaround: Regenerate label individually in single-order view.

Bug Code: ERR-SCH-301
Description: Automated carrier pickup dispatch failure during peak dispatch window (14:00-16:00 UTC).
`;
  safeWriteFile(path.join(DOCS_DIR, '04_Product_Operations_Guide_and_Known_Issues.pdf'), doc4);
  safeWriteFile(path.join(DOCS_DIR, '04_Product_Operations_Guide_and_Known_Issues.txt'), doc4);

  const doc5 = `NORTHSTAR LOGISTICS ENTERPRISE MASTER SERVICES AGREEMENT
Document ID: DOC-AGR-ACC1001
Account ID: ACC-1001
Status: CURRENT ACTIVE CONTRACT
Effective Date: 2025-06-01
Expiration Date: 2027-06-01
Authority Rank: 1 (Highest Authority - Customer Contract Override)

CONTRACTUAL OVERRIDES:

1. DEDICATED SUPPORT SLA (Section 2.1)
- Northstar Logistics is entitled to a guaranteed 1-hour response SLA for all tickets submitted.

2. CANCELLATION FEE OVERRIDE (Section 4.2)
- Notwithstanding ParcelPilot standard support policies or general cancellation fee structures, Northstar Logistics shall incur ZERO (0%) CANCELLATION FEE for any order cancelled prior to physical carrier pickup or with at least 12 hours notice prior to scheduled pickup.

3. ENHANCED SERVICE CREDIT OVERRIDE (Section 6.1)
- For any shipment pickup delay exceeding 2.0 hours caused by carrier fault, Northstar Logistics is entitled to a 25% service credit of total order value (overriding standard policy 10% and SOP 15%).
`;
  safeWriteFile(path.join(DOCS_DIR, '05_Northstar_Logistics_Enterprise_Agreement.pdf'), doc5);
  safeWriteFile(path.join(DOCS_DIR, '05_Northstar_Logistics_Enterprise_Agreement.txt'), doc5);

  const doc6 = `LUMENWORKS ENTERPRISE SERVICE AGREEMENT
Document ID: DOC-AGR-ACC1002
Account ID: ACC-1002
Status: CURRENT ACTIVE CONTRACT
Effective Date: 2025-09-01
Expiration Date: 2026-09-01
Authority Rank: 1 (Highest Authority - Customer Contract Override)

CONTRACTUAL OVERRIDES:

1. TECHNICAL FAULT CANCELLATION (Section 3.4)
- LumenWorks incurs 0% cancellation fee if cancellation is requested due to platform technical bugs (e.g. ERR-API-502 or ERR-LBL-409).

2. SERVICE CREDIT MULTIPLIER (Section 5.2)
- Service credits for carrier delay qualify for a 1.5x credit multiplier on standard SOP rate (22.5% total order value credit for carrier delay >= 3.0h).
`;
  safeWriteFile(path.join(DOCS_DIR, '06_LumenWorks_Service_Agreement.pdf'), doc6);
  safeWriteFile(path.join(DOCS_DIR, '06_LumenWorks_Service_Agreement.txt'), doc6);
}
