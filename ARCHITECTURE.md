# ParcelPilot Support Copilot — Technical Architecture Specification

## 1. System Overview & Agent Architecture

The **ParcelPilot Support Copilot** is built as an autonomous multi-step AI Agent system designed for B2B multi-carrier logistics support operations. Rather than relying on a single zero-shot LLM prompt, the system employs a decoupled, tool-augmented agent architecture with backend authorization, source reliability conflict resolution, and human-in-the-loop state action controls.

```
                  ┌──────────────────────────────────────────────┐
                  │                 USER INTERFACE               │
                  │ (Next.js / React / TypeScript / Tailwind CSS)│
                  └──────────────────────┬───────────────────────┘
                                         │ HTTP / REST API
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │          AUTHENTICATION & CONTEXT            │
                  │   Identity Switcher / Scope Evaluator        │
                  └──────────────────────┬───────────────────────┘
                                         │ Auth User + Account Context
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │           AGENT ORCHESTRATOR LOOP            │
                  │   Intent Classifier & Tool Loop Controller   │
                  └──────┬───────────────┬───────────────┬───────┘
                         │               │               │
      ┌──────────────────┴───┐   ┌───────┴───────┐   ┌───┴──────────────────┐
      │ DOCUMENT SEARCH RAG  │   │ STRUCTURED DB │   │  CALCULATION & MATH  │
      │  `search_documents`  │   │ `query_data`  │   │ `calculate_credit`   │
      └──────────┬───────────┘   └───────┬───────┘   └──────────┬───────────┘
                 │                       │                      │
                 └───────────────────┐   │   ┌──────────────────┘
                                     ▼   ▼   ▼
                  ┌──────────────────────────────────────────────┐
                  │   EVIDENCE AGGREGATOR & CONFLICT RESOLVER    │
                  │  (Hierarchy: Agreement > Policy > SOP > Ticket)
                  └──────────────────────┬───────────────────────┘
                                         │ Authority-Weighted Evidence
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │      POLICY EVALUATOR & CONFIDENCE SCORER    │
                  │  (CONFIDENT / LIKELY / UNCERTAIN / ESCALATE) │
                  └──────────────────────┬───────────────────────┘
                                         │
                         ┌───────────────┴───────────────┐
                         ▼                               ▼
          ┌─────────────────────────────┐ ┌─────────────────────────────┐
          │  FINAL SYNTHESIZED RESPONSE │ │   ACTION CONFIRMATION CARD  │
          │  + Tool Trace & Citations   │ │ (State Change: Prepare/Confirm)
          └─────────────────────────────┘ └─────────────────────────────┘
```

---

## 2. Component Design & Responsibilities

### 2.1 Agent Orchestrator & Loop Controller (`src/lib/agent/orchestrator.ts`)
- **Multi-Step Execution**: Iteratively selects tools, analyzes outputs, and updates context state.
- **Max Iterations & Circuit Breaker**: Caps execution at 5 tool calls per user query to prevent infinite loops.
- **Context Injection**: Passes current reference timestamp (`2026-08-20T12:00:00Z`), authenticated `account_id`, and role permissions into every agent iteration.

### 2.2 Tool Layer & Backend Authorization (`src/lib/tools/`)
Tool calls are strictly authorized in backend code prior to database or retrieval execution:
1. `search_documents`: Retrieves passage chunks matching semantic query, filtering by metadata (`status`, `document_type`, `account_id`).
2. `query_parcelpilot_data`: Structured lookup for Accounts, Orders, and Tickets.
   - *Security Check*: If user role is `CUSTOMER`, query automatically forces `WHERE account_id = session.account_id`. Cross-account accesses are rejected at the data layer with an `UNAUTHORIZED` error.
3. `calculate_service_credit`: Performs credit calculations evaluating delay hours, carrier fault boolean, order value, and contract multipliers.
4. `calculate_sla_status`: Calculates exact SLA deadline countdown or breach duration against snapshot timestamp `2026-08-20T12:00:00Z`.
5. `detect_similar_issues`: Queries ticket clusters across accounts sharing identical `product_issue_code` or carrier failure patterns.
6. `prepare_action` & `confirm_action`: Creates `PENDING` state-changing action objects. Execution occurs ONLY after explicit user HTTP request.

---

## 3. RAG Pipeline & Document Hierarchy

### 3.1 Document Ingestion & Chunking
- Documents are parsed, split into semantically coherent sections (250–500 words per chunk with 50-word overlaps).
- Each chunk is tagged with structured metadata:
  - `document_name`, `document_type` (`POLICY`, `SOP`, `AGREEMENT`, `PRODUCT_DOC`, `TICKET`), `version`, `effective_date`, `status` (`CURRENT`, `DEPRECATED`), `account_id` (null if global), `authority_rank` (1–6).

### 3.2 Source Conflict Resolution Matrix
When multiple documents contain overlapping or contradicting statements, the agent resolves authority using the matrix:

```
[Rank 1: Enterprise Agreement]  ─► Overrides standard cancellation fees & SLAs for specific accounts
        │
[Rank 2: Current Policy v3]     ─► Governs baseline standard SLAs & general cancellation rules
        │
[Rank 3: Current SOP v4]        ─► Governs operational calculations (e.g., 3h carrier fault pickup rule)
        │
[Rank 4: Product Ops Guide]     ─► Explains technical system errors & known bug codes
        │
[Rank 5: Deprecated Policy v2]  ─► Flagged as STALE/UNAUTHORITATIVE; ignored unless requested
        │
[Rank 6: Historical Tickets]    ─► Contextual evidence ONLY; NEVER authoritative policy
```

If a historical ticket resolution asserts a rule that contradicts `v3 Policy` or an `Enterprise Agreement`, the Conflict Resolver automatically flags the ticket as an **unreliable historical resolution** and cites the authoritative source instead.

---

## 4. Action Confirmation Flow (Human-in-the-Loop)

State-changing operations (Escalation creation, Ticket update, Task dispatch) follow a two-phase protocol:

```
Phase 1: PREPARATION (Model Side)
User Request -> Agent -> Tool: `prepare_action` -> Action State: `PENDING_CONFIRMATION`
                                                -> UI renders Confirmation Card

Phase 2: EXECUTION (User Side)
User Clicks [Confirm & Execute] -> API: `/api/actions/confirm` -> Execution -> Action State: `EXECUTED`
User Clicks [Cancel]            -> API: `/api/actions/cancel`  -> Action State: `CANCELLED`
```

---

## 5. Security Architecture & Threat Mitigation

1. **Account Isolation**: Tool parameters sent by LLM cannot bypass backend security wrappers. `WHERE account_id = session.account_id` is enforced programmatically in SQL / ORM bindings.
2. **Prompt Injection Defense**: User prompts are sanitized and isolated in system instructions. Direct data queries go through strict JSON tool schemas rather than raw SQL generation.
3. **Audit Trail**: Every request, tool invocation, records accessed, and action confirmation/rejection is written to an immutable `AuditLog` table.

---

## 6. Technical Trade-Offs & Decisions

| Decision | Selection | Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 App Router (React + TS) | Unified full-stack architecture, high performance, clean API routing. |
| **Database** | SQLite + In-Memory Vector Search | Zero external infrastructure requirement, fast local setup, 100% reproducible deployment. |
| **LLM Provider** | Configurable Gemini API / Fallback Engine | Fallback engine ensures tests and evaluation suite run reliably in offline / CI environments. |
| **UI Aesthetics** | Tailwind CSS + Lucide Icons | Modern, dark-mode/glassmorphism design system for enterprise-grade UI experience. |
