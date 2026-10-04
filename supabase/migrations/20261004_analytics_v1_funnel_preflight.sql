-- =============================================================================
-- ACELEETME.TECH — ANALYTICS V1 DURABLE STORAGE PREFLIGHT SPECIFICATION
-- Master Program Wave 2.3: Funnel Analytics Preflight Schema
-- Target: PostgreSQL 14+ / Supabase (aceleetme-production)
-- Mode: DRAFT SPECIFICATION ONLY — ZERO PERSISTENT EXECUTION IN THIS WAVE
-- Tables: analytics_funnel_events, analytics_funnel_daily_summary
-- 
-- Privacy & Security Enforcements:
-- 1. No Direct Identifiers: Raw queries, IP, User-Agent, emails, fingerprints are forbidden.
-- 2. Data Minimization: Numeric prices and full HTTP referrers are omitted.
-- 3. Strict RLS: DENY anon, DENY public authenticated; service_role write-only.
-- 4. Anonymized Rollup: Daily aggregations do NOT preserve session identifiers.
-- 5. Bounded Retention: Parameterized raw purge function (default 30 days).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. RAW EVENT INGESTION TABLE (MINIMAL SCHEMA)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.analytics_funnel_events (
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

  -- Funnel event type constraints
  CONSTRAINT chk_funnel_event_type CHECK (
    event_type IN (
      'landing_view',
      'search_performed',
      'product_view',
      'comparison_started',
      'retailer_outbound_click'
    )
  ),
  -- Bounded query length check
  CONSTRAINT chk_funnel_query_length CHECK (
    query_length IS NULL OR (query_length >= 0 AND query_length <= 500)
  ),
  -- Bounded result count check
  CONSTRAINT chk_funnel_result_count CHECK (
    result_count IS NULL OR result_count >= 0
  )
);

-- Comments documenting strict field-level governance
COMMENT ON TABLE public.analytics_funnel_events IS 'Stores sanitized conversion funnel events. No direct identifiers persisted, zero raw queries, zero IP/UA.';
COMMENT ON COLUMN public.analytics_funnel_events.session_id IS 'Client-generated random UUID for session correlation only. Not derived from IP/UA/fingerprint.';
COMMENT ON COLUMN public.analytics_funnel_events.query_length IS 'Character length of search query. Raw query text is omitted for data minimization.';
COMMENT ON COLUMN public.analytics_funnel_events.has_verified_price IS 'Boolean flag indicating catalog price presence. Numeric price is omitted.';

-- -----------------------------------------------------------------------------
-- 2. INDEXES FOR OPERATIONAL QUERYING & RETENTION PURGES
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_funnel_events_created_at 
  ON public.analytics_funnel_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_funnel_events_session_id 
  ON public.analytics_funnel_events (session_id);

CREATE INDEX IF NOT EXISTS idx_funnel_events_type_created 
  ON public.analytics_funnel_events (event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_funnel_events_category 
  ON public.analytics_funnel_events (category) 
  WHERE category IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_funnel_events_store_id 
  ON public.analytics_funnel_events (store_id) 
  WHERE store_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (FAIL-CLOSED ACCESS CONTROL)
-- -----------------------------------------------------------------------------
ALTER TABLE public.analytics_funnel_events ENABLE ROW LEVEL SECURITY;

-- DENY ALL to anonymous public traffic
DROP POLICY IF EXISTS "deny_anon_all_funnel_events" ON public.analytics_funnel_events;
CREATE POLICY "deny_anon_all_funnel_events" ON public.analytics_funnel_events
  FOR ALL TO anon 
  USING (false) 
  WITH CHECK (false);

-- DENY ALL to standard authenticated public traffic
DROP POLICY IF EXISTS "deny_authenticated_all_funnel_events" ON public.analytics_funnel_events;
CREATE POLICY "deny_authenticated_all_funnel_events" ON public.analytics_funnel_events
  FOR ALL TO authenticated 
  USING (false) 
  WITH CHECK (false);

-- ALLOW service_role (server-side Next.js route only)
DROP POLICY IF EXISTS "allow_service_role_all_funnel_events" ON public.analytics_funnel_events;
CREATE POLICY "allow_service_role_all_funnel_events" ON public.analytics_funnel_events
  FOR ALL TO service_role 
  USING (true) 
  WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 4. DAILY SUMMARY AGGREGATION TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.analytics_funnel_daily_summary (
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

CREATE INDEX IF NOT EXISTS idx_funnel_summary_date 
  ON public.analytics_funnel_daily_summary (summary_date DESC);

CREATE INDEX IF NOT EXISTS idx_funnel_summary_category 
  ON public.analytics_funnel_daily_summary (category);

CREATE INDEX IF NOT EXISTS idx_funnel_summary_store_id 
  ON public.analytics_funnel_daily_summary (store_id);

ALTER TABLE public.analytics_funnel_daily_summary ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_anon_all_funnel_summary" ON public.analytics_funnel_daily_summary;
CREATE POLICY "deny_anon_all_funnel_summary" ON public.analytics_funnel_daily_summary
  FOR ALL TO anon 
  USING (false) 
  WITH CHECK (false);

DROP POLICY IF EXISTS "deny_authenticated_all_funnel_summary" ON public.analytics_funnel_daily_summary;
CREATE POLICY "deny_authenticated_all_funnel_summary" ON public.analytics_funnel_daily_summary
  FOR ALL TO authenticated 
  USING (false) 
  WITH CHECK (false);

DROP POLICY IF EXISTS "allow_service_role_all_funnel_summary" ON public.analytics_funnel_daily_summary;
CREATE POLICY "allow_service_role_all_funnel_summary" ON public.analytics_funnel_daily_summary
  FOR ALL TO service_role 
  USING (true) 
  WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 5. DAILY ROLLUP FUNCTION (ZERO SESSION RETENTION)
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
-- 6. CONFIGURABLE RETENTION PURGE FUNCTION
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
-- 7. FUNCTION PERMISSIONS (DENY PUBLIC / ANON / AUTHENTICATED RPC EXPOSURE)
-- -----------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.rollup_funnel_daily(DATE) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.purge_expired_raw_funnel_events(INTEGER) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.rollup_funnel_daily(DATE) TO service_role;
GRANT EXECUTE ON FUNCTION public.purge_expired_raw_funnel_events(INTEGER) TO service_role;
