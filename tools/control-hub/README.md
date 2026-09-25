# ACELEETME Control Hub V0.1 — Read-Only Foundation

Self-contained orchestration tool for dispatching safe READ-ONLY engineering tasks to Google Antigravity Managed Agents via the Gemini Interactions API.

## Core Security Invariants
- **Read-Only Operations**: GitHub access is strictly READ-ONLY (`jessejamesyakar-wq/tech-compare`).
- **Inline Governance**: Every task includes the permanent read-only governance instruction inline.
- **Risk Gating**: Only `GREEN` tasks are executed. `YELLOW` and `RED` tasks are rejected locally prior to agent dispatch with `TASK_REQUIRES_HIGHER_GOVERNANCE`.
- **Secret Redaction**: Environment secrets (`GEMINI_API_KEY`, `ACELEETME_GITHUB_READ_TOKEN`, Auth headers) are redacted from logs and task records.
- **Fail-Closed Execution**: If write operations or missing credentials are required, execution fails closed without mutation.
- **No Production Mutation**: Isolated from production runtime and databases.

## Usage
```bash
# Run repository inspection task
npm run task -- inspect

# Run typecheck task
npm run task -- typecheck

# Check Control Hub status
npm run status

# Run test suite
npm test
```
