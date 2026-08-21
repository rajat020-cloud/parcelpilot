# ParcelPilot Support Copilot — Customer Support AI Agent Assessment

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-7%20Passed-emerald)](#running-tests)

A production-grade, multi-step **AI Agent System** built for **ParcelPilot** — a B2B logistics platform used by enterprise businesses to book and manage multi-carrier shipments.

The system features dual support contexts (Customer-facing & Internal Support/Operations), dynamic dataset ingestion, backend-enforced account isolation, a 6-tier Source Reliability hierarchy, interactive action confirmation cards, and a real-time Operations Intelligence Dashboard.

---

## Table of Contents
- [1. Product Overview](#1-product-overview)
- [2. Key Features](#2-key-features)
- [3. Tech Stack](#3-tech-stack)
- [4. Project Structure](#4-project-structure)
- [5. Environment Variables](#5-environment-variables)
- [6. Data Ingestion & Snapshot Timestamp](#6-data-ingestion--snapshot-timestamp)
- [7. Running Locally](#7-running-locally)
- [8. Running Automated Tests](#8-running-automated-tests)
- [9. Agent & Tool Architecture](#9-agent--tool-architecture)
- [10. Source Reliability Strategy](#10-source-reliability-strategy)
- [11. Access Control & Security](#11-access-control--security)
- [12. Action Confirmation Flow](#12-action-confirmation-flow)
- [13. Proactive Issue Detection Dashboard](#13-proactive-issue-detection-dashboard)
- [14. Architecture & Product Documentation](#14-architecture--product-documentation)
- [15. Known Limitations & Future Roadmap](#15-known-limitations--future-roadmap)
- [16. AI Coding Tool Usage](#16-ai-coding-tool-usage)

---

## 1. Product Overview
ParcelPilot support teams handle complex inquiries involving customer-specific contract overrides, deprecating support policies, carrier fault pickup delays, SLA countdowns, and platform technical issues (`ERR-API-502`, `ERR-LBL-409`).

The **ParcelPilot Support Copilot** acts as an autonomous assistant that:
- Accepts natural-language inquiries from customers or internal support agents.
- Queries structured order/ticket/account databases with backend authorization.
- Performs financial calculations for service credits and cancellation fees.
- Resolves conflicts between enterprise contracts, active policies, and deprecated documents.
- Prepares state-changing actions (escalations, ticket updates) requiring explicit user confirmation.
- Displays tool execution progress, source citations with authority ranks, and confidence indicators.

---

## 2. Key Features
- **Dynamic Dataset Ingestion**: Ingests 6 PDF/text policy & agreement documents + 4-sheet Excel workbook (`README`, `Accounts`, `Orders`, `Tickets`).
- **Strict Data Isolation**: Customer accounts are programmatically restricted to `account_id = user.account_id`. Cross-account data leaks are blocked at the tool layer.
- **Enterprise Agreement Overrides**: Prioritizes customer enterprise contract terms over standard global support policies.
- **Human-in-the-Loop Action Cards**: State-changing operations render an interactive UI card requiring explicit user confirmation.
- **Operations Intelligence Dashboard**: Calculates real dataset SLA breach countdowns, carrier delay spikes, and multi-customer bug clusters.

---

## 3. Tech Stack
- **Framework**: Next.js 14 App Router (React, TypeScript)
- **Styling**: Tailwind CSS (Dark Mode Glassmorphism Theme), Lucide Icons
- **Database & Data Layer**: SQLite / Standalone Zero-Dependency Memory Engine (`src/lib/data/db.ts`)
- **LLM / Agent Engine**: Google Gemini API (`@google/genai`) with Deterministic Rule-Based Fallback Orchestrator
- **Test Runner**: Vitest & Standalone Verification Suite (`src/scripts/test.ts`)

---

## 4. Project Structure
```
├── data_pack/                  # Generated PDF & TXT documents + XLSX workbook
│   ├── documents/              # 01_Support_Policy_v3, Enterprise Agreements, SOPs
│   └── ParcelPilot_Assessment_Data.xlsx
├── src/
│   ├── app/                    # Next.js App Router pages & API endpoints
│   │   ├── api/
│   │   │   ├── agent/chat/     # Agent chat endpoint
│   │   │   ├── actions/confirm/# Action confirmation endpoint
│   │   │   └── dashboard/      # Operations dashboard analytics endpoint
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx            # Main application layout
│   ├── components/             # UI Components
│   │   ├── Header.tsx          # Top bar & Identity/Role switcher
│   │   ├── ChatArea.tsx        # Chat interface, citations, quick prompt pills
│   │   ├── ConfirmationCard.tsx# Interactive state-action confirmation card
│   │   ├── DashboardView.tsx   # Internal operations intelligence dashboard
│   │   └── Sidebar.tsx         # Account scope & authority matrix sidebar
│   ├── lib/
│   │   ├── agent/              # Multi-step Agent Orchestrator & Conflict Resolver
│   │   ├── auth/               # Security & simulated role management
│   │   ├── data/               # Ingestion pipeline, DB layer & metadata index
│   │   └── tools/              # Backend-authorized agent tools
│   └── scripts/
│       ├── seed.ts             # Standalone DB seeding script
│       └── test.ts             # Standalone verification test runner
├── tests/
│   └── agent_eval.test.ts      # Vitest evaluation test suite
├── .env.example                # Sample environment configuration
├── ARCHITECTURE.md             # Required Technical Architecture note
├── PRODUCT.md                  # Required Product Strategy note
├── AI_USAGE.md                 # Required AI Tool Usage note
├── DEMO_SCRIPT.md              # 5-minute demo video script
└── DATA_MODEL.md               # Data model & schema specification
```

---

## 5. Environment Variables
Create a `.env` file in the root directory (see `.env.example`):
```env
NODE_ENV=development
PORT=3000
DATASET_SNAPSHOT_TIME=2026-08-20T12:00:00Z
GEMINI_API_KEY=your_optional_gemini_api_key
```

---

## 6. Data Ingestion & Snapshot Timestamp
- **Snapshot Time**: `2026-08-20T12:00:00Z` (Reference timestamp from workbook `README`).
- All relative SLA countdowns, recency checks, and effective date comparisons are evaluated against this snapshot time.

---

## 7. Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Seed database & data pack
npm run seed

# 3. Run application in development mode
npm run dev

# Open http://localhost:3000 in your browser
```

---

## 8. Running Automated Tests

Run the standalone verification suite testing all 7 assessment criteria:
```bash
npx tsx src/scripts/test.ts
```

Output:
```
=== STARTING PARCELPILOT AUTOMATED VERIFICATION SUITE ===

✓ Data pack generated successfully
✓ PASSED: 1. Northstar Enterprise Agreement Override (0% cancellation fee for ORD-1001)
✓ PASSED: 2. Service Credit Calculation (3.5h delay carrier fault SOP v4)
✓ PASSED: 3. Customer Data Isolation (Northstar blocked from viewing LumenWorks order ORD-1002)
✓ PASSED: 4a. Action Preparation (Pending Escalation created)
✓ PASSED: 4b. Action Execution (Confirmed state change)
✓ PASSED: 5. SLA Status Calculation (TKT-1001 SLA breached vs snapshot timestamp)
✓ PASSED: 6. Source Hierarchy (Current Policy v3 prioritized over Deprecated v2)

=== VERIFICATION COMPLETE: 7 PASSED, 0 FAILED ===
```

---

## 9. Agent & Tool Architecture
The agent uses a multi-tool loop (`src/lib/agent/orchestrator.ts`):
1. `search_documents`: RAG passage search with metadata filtering (`status`, `authority_rank`, `account_id`).
2. `query_parcelpilot_data`: Structured entity lookup for Accounts, Orders, and Tickets.
3. `calculate_service_credit`: Evaluates delay hours, carrier fault, order value, and agreement rates.
4. `calculate_sla_status`: Calculates remaining minutes or breach status relative to snapshot time.
5. `detect_similar_issues`: Queries ticket clusters sharing identical `product_issue_code`.
6. `prepare_action` & `confirm_action`: Prepares and executes state-changing actions.

---

## 10. Source Reliability Strategy
Retrieval results are evaluated against a strict 6-tier hierarchy:
1. **Customer Enterprise Agreement** (Rank 1 - Highest Authority)
2. **Current Support Policy v3** (Rank 2)
3. **Cancellation & Service Credit SOP v4** (Rank 3)
4. **Product Ops & Known Issues** (Rank 4)
5. **Deprecated Policy v2** (Rank 5 - Unauthoritative)
6. **Historical Support Tickets** (Rank 6 - Contextual evidence only)

---

## 11. Access Control & Security
Security is enforced programmatically in tool handlers (`src/lib/tools/index.ts`):
- Role `CUSTOMER`: `WHERE account_id = session.account_id` is forced on all queries. Cross-account lookups return `UNAUTHORIZED`.
- Roles `SUPPORT_AGENT`, `OPERATIONS_MANAGER`, `ADMIN`: Operational access across accounts.

---

## 12. Action Confirmation Flow
State-changing operations follow a two-phase protocol:
- **Phase 1 (Preparation)**: Tool creates a `PENDING` action record and renders an interactive **Confirmation Card** in the UI.
- **Phase 2 (Execution)**: Action is executed ONLY when the user clicks `[Confirm & Execute Action]`.

---

## 13. Proactive Issue Detection Dashboard
The internal dashboard (`/api/dashboard`) computes real-time operational insights from the dataset:
- Tickets approaching or breaching SLA deadlines.
- Product bug clusters (e.g. `ERR-API-502`).
- Carrier delay percentages across logistics providers.

---

## 14. Architecture & Product Documentation
Detailed specs are included in the repository:
- [ARCHITECTURE.md](ARCHITECTURE.md) — Agent design, RAG pipeline, conflict matrix, security, technical trade-offs.
- [PRODUCT.md](PRODUCT.md) — Selected client problem, Northstar metric, roadmap, intentional exclusions.
- [AI_USAGE.md](AI_USAGE.md) — AI coding tool usage disclosure & validation methodology.
- [DEMO_SCRIPT.md](DEMO_SCRIPT.md) — 5-minute video walkthrough script.
- [DATA_MODEL.md](DATA_MODEL.md) — Dataset schemas, ERD, and file inventory.

---

## 15. Known Limitations & Future Roadmap
- **Limitations**: In-memory / SQLite database is designed for local/take-home evaluation; production deployment can connect to PostgreSQL (`pgvector`) or Supabase.
- **Roadmap**: Q3 2026 direct carrier API webhook integrations; Q4 2026 predictive machine learning delay forecasting.

---

## 16. AI Coding Tool Usage
Built using the **Antigravity AI Agent System** powered by Google DeepMind's Gemini 3.6 Flash reasoning model. 100% of generated business logic and financial formulas were verified against source policies and automated test suites.
