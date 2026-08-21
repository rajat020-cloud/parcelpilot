# ParcelPilot Support Copilot — 5-Minute Video Walkthrough Script

## Timing Breakdown

### 0:00 – 0:30 | Product & Problem Overview
- **Visual**: Show home page of ParcelPilot Support Copilot. Switch identity between `Northstar Logistics` (Customer) and `Support Operations` (Internal Agent).
- **Script**:
  > "Hello! Welcome to the demo of ParcelPilot Support Copilot — an enterprise AI agent platform built for B2B multi-carrier logistics support. Logistics support involves conflicting policy documents, custom enterprise contracts, and strict customer data isolation. Today I'll demonstrate how our agent resolves multi-step queries, navigates source conflicts, respects backend security, and empowers operations teams."

---

### 0:30 – 1:15 | Architecture Overview
- **Visual**: Show `ARCHITECTURE.md` diagram and tool trace UI panel.
- **Script**:
  > "ParcelPilot uses a multi-step Agent Orchestrator with structured tool calling. It features backend-enforced security where customer scope is locked at the data layer, a 6-tier Source Reliability hierarchy where enterprise contracts override standard policies, and a two-phase action confirmation system."

---

### 1:15 – 3:30 | Live Interactive Demo

#### Demo 1: Multi-Step Question & Enterprise Agreement Override
- **User Role**: `Northstar Logistics` (`ACC-1001`)
- **Query**: `"Can Northstar cancel ORD-1001 without a cancellation fee? Explain why."`
- **Agent Behavior**:
  - Displays visible tool steps (`✓ Identified Northstar` -> `✓ Retrieved ORD-1001` -> `✓ Checked Policy v3` -> `✓ Found Enterprise Agreement`).
  - **Result**: Cites Northstar's Enterprise Agreement (Rank 1), explaining that Northstar receives a **0% cancellation fee** for orders cancelled with > 12h notice or prior to dispatch, overriding standard Policy v3 (15% fee).
  - Displays Source Citations with authority badges and high confidence score.

#### Demo 2: Customer Data Isolation & Unauthorized Access Prevention
- **User Role**: `Northstar Logistics` (`ACC-1001`)
- **Query**: `"Show me details for order ORD-1002."` (Belongs to LumenWorks `ACC-1002`).
- **Agent Behavior**:
  - Backend tool intercepts request, detects `account_id` mismatch (`ACC-1001` vs `ACC-1002`), and rejects the lookup.
  - Agent response: *"Access Denied. You are only authorized to access records associated with Northstar Logistics."*

#### Demo 3: Service Credit Calculation & Action Confirmation Flow
- **User Role**: `Support Agent` (`support@parcelpilot.demo`)
- **Query**: `"Order ORD-1003 pickup was 3 hours late due to carrier fault. Calculate service credit eligibility and escalate."`
- **Agent Behavior**:
  - Invokes `calculate_service_credit`, finding 15% credit rate per SOP v4 for 3-hour carrier fault delay.
  - Invokes `prepare_escalation`, generating an interactive **Confirmation Card** in the chat UI.
  - Clicks **[Confirm & Execute Action]** -> State updates to `EXECUTED` with audit log ID.

---

### 3:30 – 4:15 | Proactive Operations Intelligence Dashboard
- **Visual**: Switch tab to **Internal Dashboard**.
- **Script**:
  > "For internal support managers, our Operations Dashboard analyzes real dataset records in real-time. It calculates active SLA breach risks, groups tickets by product issue codes like `ERR-API-502`, detects carrier delay spikes, and allows 1-click mass escalation."

---

### 4:15 – 5:00 | Key Engineering Trade-offs & Summary
- **Visual**: Show test runner output (`npm test`) and audit log table.
- **Script**:
  > "We prioritized a zero-dependency SQLite + vector memory layer, backend-enforced authorization, and an out-of-the-box fallback engine so the application is 100% reproducible and ready for production deployment. Thank you!"
