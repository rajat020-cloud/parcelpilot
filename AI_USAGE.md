# ParcelPilot Support Copilot — AI Tool Usage Disclosure

## 1. AI Coding Tools Used
- **Antigravity AI Agent System** (Google DeepMind Agentic Coding Framework featuring Gemini 3.6 Flash reasoning model).
- **Google Gemini 2.5/3.6 API** (`@google/genai`) for server-side agent reasoning and tool execution.

---

## 2. Methodology & Workflow
- **System Architecture & Data Modeling**: AI was used to draft initial schemas, ERDs, and RAG metadata structures based on the take-home assessment guidelines.
- **Code Generation & Acceleration**:
  - Boilerplate Next.js App Router API endpoints and UI component scaffolding.
  - SQLite data access utilities and mock dataset generator.
  - Multi-step Agent Orchestrator loop & tool interface definitions.
- **Manual Verification & Review**:
  - All financial credit formulas and cancellation fee calculation logic were manually reviewed against `03_SOP_v4` and Enterprise Agreements.
  - Security scoping wrappers (`WHERE account_id = session.account_id`) were manually audited and verified to prevent data leakage.
  - Automated test cases were written and verified against edge cases (deprecated policies, missing data, carrier delay thresholds).

---

## 3. Validation & Quality Assurance
- 100% of generated TypeScript code was compiled and type-checked (`npm run build`).
- Automated tests were executed (`npm test`) to guarantee dynamic dataset retrieval and zero hard-coding of example answers.
