# Phase H-D preflight

Baseline: `d8ad1d9661b5e55b04741c0ebdac2ca71440ee4e`. GitHub main was read and matches the local checkout and Vercel Ready deployment. Work is isolated from Antigravity's uncommitted files in `C:/Projects/aceleetme-agent-workspaces/task_followup_fixes`.

Live Supabase project: `yynqtjddwnrphugnjatq` / aceleetme-production. Read-only preflight at 2026-10-03T21:36:54.289473Z verified:

- Both proposed channel tables absent.
- `stores.id` is varchar(64); existing `public.update_updated_at_column()` returns trigger and updates NEW.updated_at.
- Vatan aggregate health UNKNOWN, circuit CLOSED, recent_403_count 2, last_failure_at 2026-10-03T18:53:31.637Z.
- Mapping 129743 and 144590 both have HTTP_ERROR/403 at exactly that timestamp; last_success_at remains preserved.
- Counts: products 5814, stores 8, store_products 4, prices 1, price_history 1, price_update_jobs 0, retailer_observation_state 4, retailer_store_health 8.

Migration: `supabase/migrations/20261003_retailer_access_channels.sql`; archive copy under reports/supabase/archive. Only new channel tables receive persistent writes. Registry seed is Vatan/direct_web, enabled true, readiness false; health seed DEGRADED, CLOSED, 403 count 2, with timestamp selected from matching durable evidence. Replay uses DO NOTHING and cannot reset operational state. Historical evidence mismatch aborts the transaction. No theoretical API/feed rows are seeded.

Rate policy and capabilities stay in the existing code registry; DB fields are unnecessary. They are not treated as approval: unsupported claims of reviewed terms/automation approval in the H-C draft were cleared. All eight stores remain unready. No duplicate reliability field. Composite primary keys cover store/channel lookup; no extra indexes justified for this tiny registry.

RLS is enabled; PUBLIC/anon/authenticated privileges are revoked; existing service_role gets backend privileges. Existing updated_at function reused. SQL enforces DIRECT_WEB => production_ready=false. Existing H-C schema drift or policies aborts instead of silently accepting them.

Runtime changes:

- Actual scheduler applies channel checks before QUBO/fallback. Variables identify product/store/channel; alternative routes for the same product/store have a mutual-exclusion penalty plus a hard selection cap.
- Missing, invalid, unapproved, open/half-open, rate-limited channels fail closed. DB readiness cannot enable an unimplemented adapter. Direct web remains blocked even if a runtime flag is tampered with.
- Worker reads server DB state and channel tables; removed public-client and report-snapshot fallbacks. Missing identity no longer becomes MATCHED/100. Unavailable state is reported as UNAVAILABLE.
- Worker direct-web dispatcher has an independent hard stop. Legacy comparison scraper and Hepsiburada scraping cron cannot bypass it. Legacy random-price generator throws instead of producing offers.
- Existing store health and product mappings are not rewritten. No new price observations, no price/history writes, no real QPU claim.

Validation: 20 offline tests passed, including actual injected solver failure, approved alternate fixture, missing DB state, readiness tampering, duplicate route, real worker with instrumented zero fetch/write calls, and disabled legacy paths. Final TypeScript check and `npm run build -- --webpack` passed. Historical H-C tests are archived, not presented as current passing integration evidence.

Production gates: read-only preflight -> exact migration rollback rehearsal -> verify tables still absent -> reviewed single transaction apply -> readback constraints/privileges/seed plus protected-table fingerprints -> idempotency rehearsal -> source deploy only after final build and exact diff review. Any mismatch aborts; no blind retry. After commit, rollback means disabling the new channel registry and rolling back application code, leaving new operational tables intact; no DROP/TRUNCATE or resetting old counters.

Database execution: normalized SQL equivalent to the migration (comments/diagnostic wording omitted), with additional transaction-scoped safety assertions, was executed in the Supabase SQL editor. A rollback rehearsal passed RLS/effective-role privileges, direct-web readiness constraint, negative-counter constraint and composite-FK tests. A subsequent independent query proved both tables absent after rollback.

The committed transaction ran the migration body twice, compared complete channel rows for replay stability, re-ran assertions, and checked all protected-table fingerprints before commit. Independent post-commit readback confirmed persistence. Created_at/updated_at for both seeded rows: 2026-10-03T21:42:46.327305Z. Only one registry row and one health row were committed. Existing store health remains UNKNOWN; its counter remains 2. No price/history/mapping/observation/store-health writes.

Protected-table fingerprints before and after commit (MD5 of sorted full JSON rows; same algorithm on both sides):

| Table | Rows | Unchanged fingerprint |
|---|---:|---|
| products | 5814 | 43c228ef5bdc5b41e4f1ccf699bcb607 |
| stores | 8 | e15a27247f3ca95f26deac87775f1243 |
| store_products | 4 | 45f0783f60393961a4e0af8b2db9c5f6 |
| prices | 1 | 2490678867ac18410feb868acefe299a |
| price_history | 1 | 0a1b115c8dc5f53c1ddfcc813a6cf09c |
| price_update_jobs | 0 | d41d8cd98f00b204e9800998ecf8427e |
| retailer_observation_state | 4 | cd80e53c54e0c42a02a41124ac9d40a1 |
| retailer_store_health | 8 | 4e096df88db4c3d19ca3e95f021cc8bd |

Current status: PHASE_H_D_CHANNEL_MIGRATION_PASS; MIGRATION_APPLIED=YES; ROLLBACK_REHEARSAL=PASS; IDEMPOTENCY=PASS; PROTECTED_DATA_UNCHANGED=YES. Application deployment is recorded in the task delivery report after Ready/readback verification. No authorized production-ready feed/API exists, so real retailer acquisition and price writes remain closed. REAL_QPU=NO.

Antigravity handoff: preserve unrelated local files. The previous H-C files in task_followup_fixes were untracked and are now superseded by the reviewed release. Archive them before advancing that worktree to the released GitHub main; do not overwrite them or rerun historical H-A counter writes. Continue with approved API/feed onboarding only after a real contract, adapter, credentials, capability verification and rate policy exist. Run SHADOW first, with no retailer HTTP or price writes; never enable direct_web to unblock a test.
