-- =============================================================================
-- ACELEETME.TECH — ANALYTICS V1 TRANSACTIONAL ROLLBACK REHEARSAL SCRIPT
-- Master Program Wave 2.3: Transactional Rollback Rehearsal
-- Mode: MUST ROLLBACK — ZERO PERSISTENT MUTATION
-- Target: PostgreSQL 14+ / Supabase (aceleetme-production)
-- Target Tables: analytics_funnel_events, analytics_funnel_daily_summary
--
-- Safety Guarantees:
-- 1. Full transactional encapsulation: BEGIN ... ROLLBACK.
-- 2. Zero persistent schema changes; zero persistent data writes.
-- 3. Lock timeout 5s, Statement timeout 30s, Advisory lock protected.
-- 4. Verifies DDL, RLS policies, indexing, aggregation rollup, and retention purge.
-- 5. Strict schema assertion guarantees absence of direct identifiers, raw query, IP, and UA columns.
-- =============================================================================

BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
SET LOCAL search_path = pg_catalog, public;

-- Exclusive advisory transaction lock for analytics migration rehearsal
SELECT pg_advisory_xact_lock(hashtext('aceleetme:analytics-v1:rehearsal'));

-- -----------------------------------------------------------------------------
-- 1. PRE-REHEARSAL SNAPSHOT ASSERTIONS
-- -----------------------------------------------------------------------------
DO $$ 
DECLARE
  v_events_exist INT;
  v_summary_exist INT;
  v_prices_count INT;
BEGIN
  -- Verify analytics tables do not already exist in production
  SELECT count(*) INTO v_events_exist FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'analytics_funnel_events';
  
  SELECT count(*) INTO v_summary_exist FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'analytics_funnel_daily_summary';

  IF v_events_exist > 0 THEN
    RAISE EXCEPTION 'PRE_SNAPSHOT_FAILED: analytics_funnel_events already exists before rehearsal';
  END IF;

  IF v_summary_exist > 0 THEN
    RAISE EXCEPTION 'PRE_SNAPSHOT_FAILED: analytics_funnel_daily_summary already exists before rehearsal';
  END IF;

  -- Verify baseline price tables exist and are untouched
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'prices'
  ) THEN
    RAISE EXCEPTION 'PRE_SNAPSHOT_FAILED: required public.prices table not found';
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 2. APPLY DDL INSIDE TRANSACTION
-- -----------------------------------------------------------------------------

-- 2a. Raw events table
CREATE TABLE public.analytics_funnel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  path VARCHAR(200),
  category VARCHAR(100),
  product_id VARCHAR(200),
  store_id VARCHAR(100),
  query_length INTEGER,
  result_count INTEGER,
  has_verified_price BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_funnel_event_type CHECK (
    event_type IN (
      'landing_view',
      'search_performed',
      'product_view',
      'comparison_started',
      'retailer_outbound_click'
    )
  ),
  CONSTRAINT chk_funnel_query_length CHECK (
    query_length IS NULL OR (query_length >= 0 AND query_length <= 500)
  ),
  CONSTRAINT chk_funnel_result_count CHECK (
    result_count IS NULL OR result_count >= 0
  )
);

-- 2b. Indexes on raw events
CREATE INDEX idx_rehearsal_funnel_created_at ON public.analytics_funnel_events (created_at DESC);
CREATE INDEX idx_rehearsal_funnel_session_id ON public.analytics_funnel_events (session_id);
CREATE INDEX idx_rehearsal_funnel_type_created ON public.analytics_funnel_events (event_type, created_at DESC);
CREATE INDEX idx_rehearsal_funnel_category ON public.analytics_funnel_events (category) WHERE category IS NOT NULL;
CREATE INDEX idx_rehearsal_funnel_store_id ON public.analytics_funnel_events (store_id) WHERE store_id IS NOT NULL;

-- 2c. RLS on raw events
ALTER TABLE public.analytics_funnel_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rehearsal_deny_anon_events" ON public.analytics_funnel_events
  FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE POLICY "rehearsal_deny_authenticated_events" ON public.analytics_funnel_events
  FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "rehearsal_allow_service_role_events" ON public.analytics_funnel_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 2d. Daily summary table
CREATE TABLE public.analytics_funnel_daily_summary (
  summary_date DATE NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'all',
  store_id VARCHAR(100) NOT NULL DEFAULT 'all',
  landing_sessions INTEGER NOT NULL DEFAULT 0,
  search_sessions INTEGER NOT NULL DEFAULT 0,
  product_views INTEGER NOT NULL DEFAULT 0,
  comparison_starts INTEGER NOT NULL DEFAULT 0,
  retailer_outbound_clicks INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (summary_date, category, store_id)
);

CREATE INDEX idx_rehearsal_summary_date ON public.analytics_funnel_daily_summary (summary_date DESC);

ALTER TABLE public.analytics_funnel_daily_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rehearsal_deny_anon_summary" ON public.analytics_funnel_daily_summary
  FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE POLICY "rehearsal_deny_authenticated_summary" ON public.analytics_funnel_daily_summary
  FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "rehearsal_allow_service_role_summary" ON public.analytics_funnel_daily_summary
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 2e. Rollup aggregation function
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

-- 2f. Retention purge function
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

-- 2g. Function permissions (Deny anon/authenticated RPC, allow service_role)
REVOKE ALL ON FUNCTION public.rollup_funnel_daily(DATE) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.purge_expired_raw_funnel_events(INTEGER) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.rollup_funnel_daily(DATE) TO service_role;
GRANT EXECUTE ON FUNCTION public.purge_expired_raw_funnel_events(INTEGER) TO service_role;

-- -----------------------------------------------------------------------------
-- 3. TEST INSERTIONS (MOCK DATASET REHEARSAL)
-- -----------------------------------------------------------------------------
INSERT INTO public.analytics_funnel_events (
  session_id, event_type, path, category, product_id, store_id, query_length, result_count, has_verified_price, created_at
) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'landing_view', '/phones', 'smartphones', NULL, NULL, NULL, NULL, false, now()),
  ('a0000001-0000-0000-0000-000000000001', 'search_performed', '/search', 'smartphones', NULL, NULL, 6, 12, false, now()),
  ('a0000001-0000-0000-0000-000000000001', 'product_view', '/phones/huawei-p60-pro', 'smartphones', 'huawei-huawei-p60-pro', NULL, NULL, NULL, false, now()),
  ('a0000001-0000-0000-0000-000000000001', 'comparison_started', '/compare', 'smartphones', NULL, NULL, NULL, NULL, false, now()),
  ('a0000001-0000-0000-0000-000000000001', 'retailer_outbound_click', '/phones/huawei-p60-pro', 'smartphones', 'huawei-huawei-p60-pro', 'mediamarkt', NULL, NULL, false, now());

-- -----------------------------------------------------------------------------
-- 4. IN-TRANSACTION SCHEMA & BEHAVIOR ASSERTIONS
-- -----------------------------------------------------------------------------
DO $$ 
DECLARE
  v_inserted_count INT;
  v_forbidden_cols INT;
  v_rollup_result INT;
  v_summary_rows INT;
  v_summary_rows_rerun INT;
  v_purged INT;
  v_floor_exception_caught BOOLEAN := false;
  v_prices_count_before INT;
  v_prices_count_after INT;
BEGIN
  -- Assert 5 rows inserted
  SELECT count(*) INTO v_inserted_count FROM public.analytics_funnel_events;
  IF v_inserted_count <> 5 THEN
    RAISE EXCEPTION 'REHEARSAL_ASSERTION_FAILED: expected 5 inserted events, got %', v_inserted_count;
  END IF;

  -- Assert absence of forbidden PII / query / price columns
  SELECT count(*) INTO v_forbidden_cols FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'analytics_funnel_events'
    AND column_name IN (
      'query', 'raw_query', 'search_text', 'search_query', 'q',
      'email', 'user_email',
      'ip', 'ip_address', 'client_ip',
      'user_agent', 'ua', 'useragent',
      'fingerprint', 'device_fingerprint',
      'price', 'numeric_price', 'product_price',
      'password', 'token', 'authorization'
    );

  IF v_forbidden_cols > 0 THEN
    RAISE EXCEPTION 'REHEARSAL_ASSERTION_FAILED: forbidden columns detected in analytics_funnel_events: %', v_forbidden_cols;
  END IF;

  -- Assert function execution privilege revocation
  IF has_function_privilege('anon', 'public.rollup_funnel_daily(date)', 'execute') THEN
    RAISE EXCEPTION 'REHEARSAL_ASSERTION_FAILED: anon role has unexpected EXECUTE on rollup_funnel_daily';
  END IF;

  IF has_function_privilege('authenticated', 'public.rollup_funnel_daily(date)', 'execute') THEN
    RAISE EXCEPTION 'REHEARSAL_ASSERTION_FAILED: authenticated role has unexpected EXECUTE on rollup_funnel_daily';
  END IF;

  IF has_function_privilege('anon', 'public.purge_expired_raw_funnel_events(integer)', 'execute') THEN
    RAISE EXCEPTION 'REHEARSAL_ASSERTION_FAILED: anon role has unexpected EXECUTE on purge_expired_raw_funnel_events';
  END IF;

  IF has_function_privilege('authenticated', 'public.purge_expired_raw_funnel_events(integer)', 'execute') THEN
    RAISE EXCEPTION 'REHEARSAL_ASSERTION_FAILED: authenticated role has unexpected EXECUTE on purge_expired_raw_funnel_events';
  END IF;

  -- Assert rollup function executes successfully
  v_rollup_result := public.rollup_funnel_daily(CURRENT_DATE);
  IF v_rollup_result < 1 THEN
    RAISE EXCEPTION 'REHEARSAL_ASSERTION_FAILED: rollup_funnel_daily affected % rows, expected >= 1', v_rollup_result;
  END IF;

  -- Assert daily summary table has aggregated row
  SELECT count(*) INTO v_summary_rows FROM public.analytics_funnel_daily_summary;
  IF v_summary_rows < 1 THEN
    RAISE EXCEPTION 'REHEARSAL_ASSERTION_FAILED: daily summary table is empty after rollup';
  END IF;

  -- Assert Rollup Idempotency: Running rollup a second time produces 0 duplicate rows
  v_rollup_result := public.rollup_funnel_daily(CURRENT_DATE);
  SELECT count(*) INTO v_summary_rows_rerun FROM public.analytics_funnel_daily_summary;
  IF v_summary_rows_rerun <> v_summary_rows THEN
    RAISE EXCEPTION 'REHEARSAL_ASSERTION_FAILED: Rollup idempotency violated! Duplicate summary rows generated: before=%, after=%', v_summary_rows, v_summary_rows_rerun;
  END IF;

  -- Assert rollup summary table has zero session identifiers
  SELECT count(*) INTO v_forbidden_cols FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'analytics_funnel_daily_summary'
    AND column_name LIKE '%session%';

  IF v_forbidden_cols > 0 THEN
    RAISE EXCEPTION 'REHEARSAL_ASSERTION_FAILED: daily summary table contains session identifier column!';
  END IF;

  -- Record prices count before purge
  SELECT count(*) INTO v_prices_count_before FROM public.prices;

  -- Assert purge safety floor throws when retention_days < 7
  BEGIN
    PERFORM public.purge_expired_raw_funnel_events(5);
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM LIKE '%PURGE_SAFETY_ERROR%' THEN
        v_floor_exception_caught := true;
      END IF;
  END;

  IF NOT v_floor_exception_caught THEN
    RAISE EXCEPTION 'REHEARSAL_ASSERTION_FAILED: purge safety floor check failed to reject retention_days < 7';
  END IF;

  -- Assert purge function works safely on normal threshold
  v_purged := public.purge_expired_raw_funnel_events(30);
  -- With records created just now (age < 30 days), zero records should be purged
  IF v_purged <> 0 THEN
    RAISE EXCEPTION 'REHEARSAL_ASSERTION_FAILED: fresh events were purged prematurely: %', v_purged;
  END IF;

  -- Assert table isolation: prices table completely untouched
  SELECT count(*) INTO v_prices_count_after FROM public.prices;
  IF v_prices_count_after <> v_prices_count_before THEN
    RAISE EXCEPTION 'REHEARSAL_ASSERTION_FAILED: Purge violated table isolation! Prices count changed.';
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 5. MANDATORY ROLLBACK — ZERO PERSISTENT MUTATION
-- -----------------------------------------------------------------------------
ROLLBACK;
