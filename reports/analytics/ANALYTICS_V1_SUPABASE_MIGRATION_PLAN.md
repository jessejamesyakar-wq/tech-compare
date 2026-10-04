# ACELEETME.TECH — ANALYTICS V1 SUPABASE MIGRATION PLAN
## Proposed Relational Ingestion Architecture for Post-Wave-2 Review

**Document Version:** 1.0.0  
**Draft Date:** 2026-10-04T20:30:00+03:00  
**Current Governance State:** \`PROPOSED_ONLY — NOT APPLIED\`  
**Wave 2.2 Invariant:** \`SUPABASE_WRITES = 0\` (STRICT ZERO MUTATION)  

---

### 1. Executive Summary

This document specifies the target database migration plan for durable analytics storage in Supabase PostgreSQL.

> [!IMPORTANT]
> **GOVERNANCE NOTICE:**
> In accordance with Master Program Wave 2.2 instructions, **NO Supabase migration is applied in this phase**. The server route `/api/telemetry/funnel` operates against an in-memory mock sink. This migration plan is provided for separate operator review and requires formal rehearsal before execution.

---

### 2. Relational Schema Design

```sql
-- Migration Candidate: 20261010_analytics_v1_durable_storage.sql
-- GATED: Do NOT run without operator authorization.

-- 1. Create enum for validated funnel event types
CREATE TYPE funnel_event_type AS ENUM (
  'landing_view',
  'search_performed',
  'product_view',
  'comparison_started',
  'retailer_outbound_click'
);

-- 2. Partitioned Table: analytics_funnel_events
CREATE TABLE IF NOT EXISTS public.analytics_funnel_events (
  event_id UUID NOT NULL,
  session_id UUID NOT NULL,
  event_type funnel_event_type NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (event_id, created_at)
) PARTITION BY RANGE (created_at);

-- 3. Monthly Partition Templates (Example: Q4 2026)
CREATE TABLE IF NOT EXISTS public.analytics_funnel_events_2026_10
  PARTITION OF public.analytics_funnel_events
  FOR VALUES FROM ('2026-10-01 00:00:00+00') TO ('2026-11-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS public.analytics_funnel_events_2026_11
  PARTITION OF public.analytics_funnel_events
  FOR VALUES FROM ('2026-11-01 00:00:00+00') TO ('2026-12-01 00:00:00+00');

-- 4. High-Performance B-Tree Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_funnel_events_session
  ON public.analytics_funnel_events (session_id, created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_funnel_events_type_time
  ON public.analytics_funnel_events (event_type, created_at);

-- 5. Row-Level Security (RLS) Policy
ALTER TABLE public.analytics_funnel_events ENABLE ROW LEVEL SECURITY;

-- Deny all public anon/authenticated access by default
CREATE POLICY "Deny all public direct access"
  ON public.analytics_funnel_events
  FOR ALL
  TO public
  USING (false);

-- Service role only for backend server ingestion route
CREATE POLICY "Allow server service_role ingestion"
  ON public.analytics_funnel_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);
```

---

### 3. Data Retention & Privacy Lifecycle (90-Day Rolling TTL)

To maintain database storage efficiency and comply with strict data minimization standards:

1. **Partition Drop:** Monthly partitions older than 90 days are detached and dropped automatically via scheduled `pg_cron` jobs.
2. **Aggregated Retention:** Before partition drops, daily summary statistics are materialized into `analytics_daily_funnel_aggregates` (containing counts only, with zero session IDs).
3. **No Re-identification Risk:** Session IDs cannot be linked back to individual users once browser session storage expires.

---

### 4. Rollback & Rehearsal Plan

Prior to running this migration in production:
1. **Rehearsal Environment:** Execute migration on a local Supabase / PostgreSQL test container.
2. **Readback Verification:** Ingest 1,000 synthetic events across all 5 event types, verify partition routing, and test drop performance.
3. **Rehearsal Rollback:** Execute `DROP TABLE analytics_funnel_events CASCADE; DROP TYPE funnel_event_type;` to ensure clean idempotency.
4. **Approval Gate:** Human operator sign-off is required before touching the production database.
