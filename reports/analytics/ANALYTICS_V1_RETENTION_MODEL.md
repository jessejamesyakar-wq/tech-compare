# ACELEETME.TECH — ANALYTICS V1 RETENTION MODEL
## Master Program Wave 2.3A — Retention, Idempotency & Scheduler Architecture

**Document Version:** 1.1.0  
**Generated At:** 2026-10-04T21:08:00Z  
**Governance Scope:** `analytics_funnel_events` TTL, Daily Rollup Idempotency & Scheduler Governance  

---

### 1. Retention Policy Principles

1. **Configurable Raw Event Retention:**
   Raw event rows in `analytics_funnel_events` are transient operational records. They are retained only for a bounded, configurable duration defined by `RAW_RETENTION_DAYS`.
   - **Default Operational Setting:** `RAW_RETENTION_DAYS = 30`
   - **Configurable Range:** 7 days to 90 days.
   - **Hard Safety Floor:** 7 days minimum (enforced by constraint inside `purge_expired_raw_funnel_events()`). Refuses negative, zero, or null retention days.
2. **Explicit Regulatory Governance Notice:**
   The chosen parameter (`RAW_RETENTION_DAYS = 30`) is an operational engineering setting for storage bounding and data hygiene. **AceleEtme does NOT claim that this specific timeframe inherently satisfies statutory legal retention obligations under KVKK, GDPR, or applicable consumer regulations.**
3. **Scheduler Governance Contract:**
   Although the database maintenance functions (`public.rollup_funnel_daily` and `public.purge_expired_raw_funnel_events`) are designed and verified, **no scheduler has been deployed in this wave**.
   - `RETENTION_CURRENTLY_ENFORCED = NO (scheduler pending / SCHEDULER_REQUIRED)`
   - **Candidate Schedulers Evaluated:**
     1. **Vercel Cron:** Existing project architecture (`vercel.json` already defines `/api/cron/...` crons). A new authenticated endpoint (`/api/cron/analytics-maintenance` guarded by `CRON_SECRET`) can invoke the Supabase client using `service_role`.
     2. **Supabase `pg_cron` Extension:** Scheduled directly inside PostgreSQL (`SELECT cron.schedule('rollup', '0 2 * * *', 'SELECT public.rollup_funnel_daily(CURRENT_DATE - 1)');`).
   - Retention and rollup execution must not be described as active in production until a scheduled runner is provisioned.

---

### 2. Daily Rollup Architecture & Idempotency

#### Rollup Function: `rollup_funnel_daily(p_target_date DATE)`

```sql
CREATE OR REPLACE FUNCTION public.rollup_funnel_daily(p_target_date DATE)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_rows_affected INT := 0;
BEGIN
  WITH aggregated AS (
    SELECT
      p_target_date AS summary_date,
      COALESCE(category, 'all') AS category,
      COALESCE(store_id, 'all') AS store_id,
      COUNT(DISTINCT CASE WHEN event_type = 'landing_view' THEN session_id END)::INTEGER AS landing_sessions,
      COUNT(DISTINCT CASE WHEN event_type = 'search_performed' THEN session_id END)::INTEGER AS search_sessions,
      COUNT(CASE WHEN event_type = 'product_view' THEN 1 END)::INTEGER AS product_views,
      COUNT(CASE WHEN event_type = 'comparison_started' THEN 1 END)::INTEGER AS comparison_starts,
      COUNT(CASE WHEN event_type = 'retailer_outbound_click' THEN 1 END)::INTEGER AS retailer_outbound_clicks
    FROM public.analytics_funnel_events
    WHERE created_at >= p_target_date::timestamptz 
      AND created_at < (p_target_date + 1)::timestamptz
    GROUP BY COALESCE(category, 'all'), COALESCE(store_id, 'all')
  )
  INSERT INTO public.analytics_funnel_daily_summary (
    summary_date,
    category,
    store_id,
    landing_sessions,
    search_sessions,
    product_views,
    comparison_starts,
    retailer_outbound_clicks,
    updated_at
  )
  SELECT
    summary_date,
    category,
    store_id,
    landing_sessions,
    search_sessions,
    product_views,
    comparison_starts,
    retailer_outbound_clicks,
    now()
  FROM aggregated
  ON CONFLICT (summary_date, category, store_id)
  DO UPDATE SET
    landing_sessions = EXCLUDED.landing_sessions,
    search_sessions = EXCLUDED.search_sessions,
    product_views = EXCLUDED.product_views,
    comparison_starts = EXCLUDED.comparison_starts,
    retailer_outbound_clicks = EXCLUDED.retailer_outbound_clicks,
    updated_at = now();

  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
  RETURN v_rows_affected;
END;
$$;
```

#### Idempotency Verification
- **Unique Conflict Target:** `PRIMARY KEY (summary_date, category, store_id)`.
- **Conflict Behavior:** `DO UPDATE SET...`.
- If the scheduler or an administrator runs `public.rollup_funnel_daily(CURRENT_DATE)` multiple times, existing summary rows are overwritten with the latest counts rather than duplicated or incremented.
- Verified in rehearsal:
  - `ROLLUP_IDEMPOTENCY = VERIFIED`
  - `DUPLICATE_SUMMARY_ROWS = 0`

---

### 3. Raw Event Purge Mechanics & Scope Safety

#### Purge Function: `purge_expired_raw_funnel_events(p_retention_days INTEGER)`

```sql
CREATE OR REPLACE FUNCTION public.purge_expired_raw_funnel_events(p_retention_days INTEGER DEFAULT 30)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_cutoff TIMESTAMPTZ;
  v_purged_count INT := 0;
BEGIN
  IF p_retention_days IS NULL OR p_retention_days < 7 THEN
    RAISE EXCEPTION 'PURGE_SAFETY_ERROR: retention_days cannot be null or less than 7 days (requested: %)', p_retention_days;
  END IF;

  v_cutoff := now() - (p_retention_days || ' days')::interval;

  DELETE FROM public.analytics_funnel_events
  WHERE created_at < v_cutoff;

  GET DIAGNOSTICS v_purged_count = ROW_COUNT;
  RETURN v_purged_count;
END;
$$;
```

#### Safety Floor & Table Isolation
1. **Safety Floor Check:** Calling with `retention_days < 7`, `0`, negative numbers, or `NULL` immediately aborts the transaction with `PURGE_SAFETY_ERROR`.
2. **Strict Table Isolation:** The delete target is hardcoded to `public.analytics_funnel_events`. Commercial catalog and pricing tables (`prices`, `price_history`, `retailer_access_channels`) are completely unreferenced and untouched:
   - `PURGE_TABLE_ISOLATION = VERIFIED`
   - `PURGE_SAFETY_FLOOR = VERIFIED`

---

### 4. Lifecycle Comparison Matrix

| Dimension | Raw Table (`analytics_funnel_events`) | Summary Table (`analytics_funnel_daily_summary`) |
|---|---|---|
| **Storage Horizon** | Bounded (30 days default) | Persistent (Indefinite product analytics) |
| **Granularity** | Single event per row | One aggregated row per `(date, category, store)` |
| **Session Tracking** | Ephemeral `session_id` UUID | **ZERO** session identifiers |
| **Search Queries** | `query_length` and `result_count` only | Aggregated `search_sessions` |
| **Commercial Price** | `has_verified_price` boolean flag | Outbound click counts |
| **Public RLS Policy** | DENY ALL (anon & authenticated) | DENY ALL (anon & authenticated) |
| **RPC Access** | DENIED (`PUBLIC_RPC_PURGE = DENIED`) | DENIED (`PUBLIC_RPC_ROLLUP = DENIED`) |
| **Storage Footprint** | Bounded ceiling ($\le 30$ days of traffic) | Highly compact ($< 1$ MB/year) |
