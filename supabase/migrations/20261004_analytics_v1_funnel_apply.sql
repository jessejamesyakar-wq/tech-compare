-- =============================================================================
-- ACELEETME.TECH — WAVE 2.4A PRODUCTION MIGRATION APPLY GATE
-- Package: Analytics V1 Storage Schema & Privilege Hardening Apply
-- Target: PostgreSQL 14+ / Supabase (aceleetme-production)
-- Mode: CONTROLLED PRODUCTION DATABASE MIGRATION (Single Atomic Transaction)
-- Target Tables: analytics_funnel_events, analytics_funnel_daily_summary
-- Target Functions: public.rollup_funnel_daily(DATE), public.purge_expired_raw_funnel_events(INTEGER)
--
-- Safety Guarantees:
-- 1. Explicit atomic transaction: BEGIN ... COMMIT.
-- 2. Lock timeout 5s, Statement timeout 30s, Advisory lock protected.
-- 3. Core Database Firewall: Zero mutation to prices, price_history, products, stores, store_products, retailer_access_channels.
-- 4. Technical Data Minimization: Minimal columns only (zero price, zero raw query, zero IP/UA/PII).
-- 5. Strict RLS: DENY anon, DENY authenticated, service_role write-only.
-- 6. Function Privilege Hardening: REVOKE execute from PUBLIC/anon/authenticated; GRANT to service_role only.
-- 7. Zero Event Baseline: analytics_funnel_events count = 0, analytics_funnel_daily_summary count = 0.
-- =============================================================================

BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
SET LOCAL search_path = pg_catalog, public;

-- Exclusive advisory transaction lock for analytics migration apply
SELECT pg_advisory_xact_lock(hashtext('aceleetme:analytics-v1:apply'));

-- -----------------------------------------------------------------------------
-- 1. PRE-APPLY BASELINE ASSERTIONS
-- -----------------------------------------------------------------------------
DO $$ 
DECLARE
  v_events_exist INT;
  v_summary_exist INT;
  v_products_count INT;
  v_prices_count INT;
  v_history_count INT;
  v_stores_count INT;
  v_store_products_count INT;
  v_channels_count INT;
BEGIN
  -- Verify analytics tables do not already exist
  SELECT count(*) INTO v_events_exist FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'analytics_funnel_events';
  
  SELECT count(*) INTO v_summary_exist FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'analytics_funnel_daily_summary';

  IF v_events_exist > 0 THEN
    RAISE EXCEPTION 'PREFLIGHT_BLOCKED: analytics_funnel_events already exists before apply';
  END IF;

  IF v_summary_exist > 0 THEN
    RAISE EXCEPTION 'PREFLIGHT_BLOCKED: analytics_funnel_daily_summary already exists before apply';
  END IF;

  -- Verify core production tables exist and baseline row counts
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products') THEN
    RAISE EXCEPTION 'PREFLIGHT_BLOCKED: required public.products table not found';
  END IF;

  SELECT count(*) INTO v_products_count FROM public.products;
  IF v_products_count <> 5814 THEN
    RAISE EXCEPTION 'PREFLIGHT_BLOCKED: canonical products count % != 5814', v_products_count;
  END IF;

  SELECT count(*) INTO v_prices_count FROM public.prices;
  IF v_prices_count <> 1 THEN
    RAISE EXCEPTION 'PREFLIGHT_BLOCKED: baseline prices count % != 1', v_prices_count;
  END IF;

  SELECT count(*) INTO v_history_count FROM public.price_history;
  IF v_history_count <> 1 THEN
    RAISE EXCEPTION 'PREFLIGHT_BLOCKED: baseline price_history count % != 1', v_history_count;
  END IF;

  SELECT count(*) INTO v_stores_count FROM public.stores;
  IF v_stores_count <> 8 THEN
    RAISE EXCEPTION 'PREFLIGHT_BLOCKED: baseline stores count % != 8', v_stores_count;
  END IF;

  SELECT count(*) INTO v_store_products_count FROM public.store_products;
  IF v_store_products_count <> 4 THEN
    RAISE EXCEPTION 'PREFLIGHT_BLOCKED: baseline store_products count % != 4', v_store_products_count;
  END IF;

  SELECT count(*) INTO v_channels_count FROM public.retailer_access_channels;
  IF v_channels_count <> 1 THEN
    RAISE EXCEPTION 'PREFLIGHT_BLOCKED: baseline retailer_access_channels count % != 1', v_channels_count;
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 2. APPLY DDL: RAW FUNNEL EVENTS INGESTION TABLE
-- -----------------------------------------------------------------------------
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

COMMENT ON TABLE public.analytics_funnel_events IS 'Stores sanitized conversion funnel events. No direct identifiers persisted, zero raw queries, zero IP/UA.';
COMMENT ON COLUMN public.analytics_funnel_events.session_id IS 'Client-generated random UUID for session correlation only. Not derived from IP/UA/fingerprint.';
COMMENT ON COLUMN public.analytics_funnel_events.query_length IS 'Character length of search query. Raw query text is omitted for data minimization.';
COMMENT ON COLUMN public.analytics_funnel_events.has_verified_price IS 'Boolean flag indicating catalog price presence. Numeric price is omitted.';

CREATE INDEX idx_funnel_events_created_at ON public.analytics_funnel_events (created_at DESC);
CREATE INDEX idx_funnel_events_session_id ON public.analytics_funnel_events (session_id);
CREATE INDEX idx_funnel_events_type_created ON public.analytics_funnel_events (event_type, created_at DESC);
CREATE INDEX idx_funnel_events_category ON public.analytics_funnel_events (category) WHERE category IS NOT NULL;
CREATE INDEX idx_funnel_events_store_id ON public.analytics_funnel_events (store_id) WHERE store_id IS NOT NULL;

ALTER TABLE public.analytics_funnel_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_all_funnel_events" ON public.analytics_funnel_events
  FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE POLICY "deny_authenticated_all_funnel_events" ON public.analytics_funnel_events
  FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "allow_service_role_all_funnel_events" ON public.analytics_funnel_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 3. APPLY DDL: DAILY SUMMARY TABLE
-- -----------------------------------------------------------------------------
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

COMMENT ON TABLE public.analytics_funnel_daily_summary IS 'Daily rollups of conversion funnel metrics. Contains zero session IDs and zero user tracking data.';

CREATE INDEX idx_funnel_summary_date ON public.analytics_funnel_daily_summary (summary_date DESC);
CREATE INDEX idx_funnel_summary_category ON public.analytics_funnel_daily_summary (category);
CREATE INDEX idx_funnel_summary_store_id ON public.analytics_funnel_daily_summary (store_id);

ALTER TABLE public.analytics_funnel_daily_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_all_funnel_summary" ON public.analytics_funnel_daily_summary
  FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE POLICY "deny_authenticated_all_funnel_summary" ON public.analytics_funnel_daily_summary
  FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "allow_service_role_all_funnel_summary" ON public.analytics_funnel_daily_summary
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 4. APPLY DDL: ROLLUP FUNCTION (IDEMPOTENT, SECURITY DEFINER)
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 5. APPLY DDL: PURGE FUNCTION (SAFETY FLOOR >= 7d, SECURITY DEFINER)
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 6. PRIVILEGE HARDENING (REVOKE PUBLIC / anon / authenticated; GRANT service_role)
-- -----------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.rollup_funnel_daily(DATE) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.purge_expired_raw_funnel_events(INTEGER) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.rollup_funnel_daily(DATE) TO service_role;
GRANT EXECUTE ON FUNCTION public.purge_expired_raw_funnel_events(INTEGER) TO service_role;

-- -----------------------------------------------------------------------------
-- 7. PRE-COMMIT VERIFICATION ASSERTIONS
-- -----------------------------------------------------------------------------
DO $$ 
DECLARE
  v_forbidden_cols INT;
  v_raw_rows INT;
  v_summary_rows INT;
  v_prod_count INT;
  v_price_count INT;
  v_hist_count INT;
BEGIN
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
    RAISE EXCEPTION 'PRE_COMMIT_FAILED: forbidden columns detected in analytics_funnel_events: %', v_forbidden_cols;
  END IF;

  -- Assert zero initial rows
  SELECT count(*) INTO v_raw_rows FROM public.analytics_funnel_events;
  SELECT count(*) INTO v_summary_rows FROM public.analytics_funnel_daily_summary;

  IF v_raw_rows <> 0 THEN
    RAISE EXCEPTION 'PRE_COMMIT_FAILED: expected 0 initial raw rows, found %', v_raw_rows;
  END IF;
  IF v_summary_rows <> 0 THEN
    RAISE EXCEPTION 'PRE_COMMIT_FAILED: expected 0 initial summary rows, found %', v_summary_rows;
  END IF;

  -- Assert function execution privileges revoked for anon / authenticated
  IF has_function_privilege('anon', 'public.rollup_funnel_daily(date)', 'execute') THEN
    RAISE EXCEPTION 'PRE_COMMIT_FAILED: anon role has unexpected EXECUTE on rollup_funnel_daily';
  END IF;
  IF has_function_privilege('authenticated', 'public.rollup_funnel_daily(date)', 'execute') THEN
    RAISE EXCEPTION 'PRE_COMMIT_FAILED: authenticated role has unexpected EXECUTE on rollup_funnel_daily';
  END IF;
  IF has_function_privilege('anon', 'public.purge_expired_raw_funnel_events(integer)', 'execute') THEN
    RAISE EXCEPTION 'PRE_COMMIT_FAILED: anon role has unexpected EXECUTE on purge_expired_raw_funnel_events';
  END IF;
  IF has_function_privilege('authenticated', 'public.purge_expired_raw_funnel_events(integer)', 'execute') THEN
    RAISE EXCEPTION 'PRE_COMMIT_FAILED: authenticated role has unexpected EXECUTE on purge_expired_raw_funnel_events';
  END IF;

  -- Assert service_role has execution privileges
  IF NOT has_function_privilege('service_role', 'public.rollup_funnel_daily(date)', 'execute') THEN
    RAISE EXCEPTION 'PRE_COMMIT_FAILED: service_role lacks EXECUTE on rollup_funnel_daily';
  END IF;
  IF NOT has_function_privilege('service_role', 'public.purge_expired_raw_funnel_events(integer)', 'execute') THEN
    RAISE EXCEPTION 'PRE_COMMIT_FAILED: service_role lacks EXECUTE on purge_expired_raw_funnel_events';
  END IF;

  -- Assert core tables unchanged
  SELECT count(*) INTO v_prod_count FROM public.products;
  SELECT count(*) INTO v_price_count FROM public.prices;
  SELECT count(*) INTO v_hist_count FROM public.price_history;

  IF v_prod_count <> 5814 THEN
    RAISE EXCEPTION 'CORE_FIREWALL_VIOLATED: products count changed: %', v_prod_count;
  END IF;
  IF v_price_count <> 1 THEN
    RAISE EXCEPTION 'CORE_FIREWALL_VIOLATED: prices count changed: %', v_price_count;
  END IF;
  IF v_hist_count <> 1 THEN
    RAISE EXCEPTION 'CORE_FIREWALL_VIOLATED: price_history count changed: %', v_hist_count;
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 8. COMMIT GATE
-- All assertions satisfied. Executing atomic commit.
-- -----------------------------------------------------------------------------
COMMIT;

-- -----------------------------------------------------------------------------
-- 9. POST-COMMIT READBACK (PERMANENT SCHEMA & ZERO ROW VERIFICATION)
-- -----------------------------------------------------------------------------
DO $$ 
DECLARE
  v_events_exist INT;
  v_summary_exist INT;
  v_events_rows INT;
  v_summary_rows INT;
BEGIN
  SELECT count(*) INTO v_events_exist FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'analytics_funnel_events';
  
  SELECT count(*) INTO v_summary_exist FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'analytics_funnel_daily_summary';

  IF v_events_exist <> 1 THEN
    RAISE EXCEPTION 'POST_COMMIT_FAILED: analytics_funnel_events does not exist after commit';
  END IF;
  IF v_summary_exist <> 1 THEN
    RAISE EXCEPTION 'POST_COMMIT_FAILED: analytics_funnel_daily_summary does not exist after commit';
  END IF;

  SELECT count(*) INTO v_events_rows FROM public.analytics_funnel_events;
  SELECT count(*) INTO v_summary_rows FROM public.analytics_funnel_daily_summary;

  IF v_events_rows <> 0 THEN
    RAISE EXCEPTION 'POST_COMMIT_FAILED: analytics_funnel_events has unexpected rows: %', v_events_rows;
  END IF;
  IF v_summary_rows <> 0 THEN
    RAISE EXCEPTION 'POST_COMMIT_FAILED: analytics_funnel_daily_summary has unexpected rows: %', v_summary_rows;
  END IF;
END $$;
