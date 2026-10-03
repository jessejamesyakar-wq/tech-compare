-- Phase H-D. Review read-only preflight first. No retailer/price/store data writes.
-- Run as one transaction. Any assertion failure must roll back the transaction.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
SET LOCAL search_path = pg_catalog, public;
SELECT pg_advisory_xact_lock(hashtext('aceleetme:retailer-access-channels:v1'));

DO $$ BEGIN
  IF to_regprocedure('public.update_updated_at_column()') IS NULL THEN
    RAISE EXCEPTION 'PREFLIGHT_BLOCKED: existing updated_at function missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.stores WHERE id = 'vatan') THEN
    RAISE EXCEPTION 'PREFLIGHT_BLOCKED: Vatan store missing';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.retailer_access_channels (
  store_id varchar(64) NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  channel_id varchar(64) NOT NULL,
  channel_type varchar(32) NOT NULL CHECK (channel_type IN
    ('DIRECT_WEB','OFFICIAL_API','AFFILIATE_API','PARTNER_FEED','APPROVED_FEED')),
  enabled boolean NOT NULL DEFAULT true,
  production_ready boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (store_id, channel_id),
  CONSTRAINT retailer_channels_direct_web_not_ready CHECK
    (channel_type <> 'DIRECT_WEB' OR production_ready = false)
);
CREATE TABLE IF NOT EXISTS public.retailer_channel_health (
  store_id varchar(64) NOT NULL,
  channel_id varchar(64) NOT NULL,
  health_status varchar(32) NOT NULL DEFAULT 'UNKNOWN' CHECK
    (health_status IN ('UNKNOWN','HEALTHY','DEGRADED','UNHEALTHY','CIRCUIT_OPEN')),
  circuit_breaker_state varchar(32) NOT NULL DEFAULT 'CLOSED' CHECK
    (circuit_breaker_state IN ('CLOSED','HALF_OPEN','OPEN')),
  rate_limit_until timestamptz,
  recent_403_count integer NOT NULL DEFAULT 0 CHECK (recent_403_count >= 0),
  recent_429_count integer NOT NULL DEFAULT 0 CHECK (recent_429_count >= 0),
  recent_5xx_count integer NOT NULL DEFAULT 0 CHECK (recent_5xx_count >= 0),
  last_success_at timestamptz,
  last_failure_at timestamptz,
  last_error_code varchar(64),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (store_id, channel_id),
  FOREIGN KEY (store_id, channel_id)
    REFERENCES public.retailer_access_channels(store_id, channel_id) ON DELETE CASCADE
);

-- IF NOT EXISTS alone cannot prove schema compatibility. Refuse the old H-C draft.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name IN ('retailer_access_channels','retailer_channel_health')
      AND column_name IN ('reliability_score','rate_cap_rps','circuit_breaker_tripped_at','circuit_breaker_reason'))
    OR NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.retailer_access_channels'::regclass
      AND conname='retailer_channels_direct_web_not_ready' AND contype='c' AND convalidated)
  THEN RAISE EXCEPTION 'PREFLIGHT_BLOCKED: existing channel schema drift; review instead of overwriting'; END IF;
END $$;

ALTER TABLE public.retailer_access_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retailer_channel_health ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.retailer_access_channels, public.retailer_channel_health FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON public.retailer_access_channels, public.retailer_channel_health TO service_role;

DROP TRIGGER IF EXISTS trg_retailer_channels_updated_at ON public.retailer_access_channels;
CREATE TRIGGER trg_retailer_channels_updated_at BEFORE UPDATE ON public.retailer_access_channels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_retailer_channel_health_updated_at ON public.retailer_channel_health;
CREATE TRIGGER trg_retailer_channel_health_updated_at BEFORE UPDATE ON public.retailer_channel_health
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Canonical channel ID is store-scoped. Runtime uses vatan:direct_web; loader translates.
INSERT INTO public.retailer_access_channels (store_id,channel_id,channel_type,enabled,production_ready)
VALUES ('vatan','direct_web','DIRECT_WEB',true,false)
ON CONFLICT (store_id,channel_id) DO NOTHING;

-- Seed only from matching durable historical evidence, never NOW() as a failure timestamp.
-- Replay never resets health/counters. Different live evidence requires a new preflight.
INSERT INTO public.retailer_channel_health
  (store_id,channel_id,health_status,circuit_breaker_state,recent_403_count,last_failure_at,last_error_code)
SELECT 'vatan','direct_web','DEGRADED','CLOSED',2,h.last_failure_at,'HTTP_403'
FROM public.retailer_store_health h
WHERE h.store_id='vatan' AND h.recent_403_count=2
  AND h.last_failure_at='2026-10-03T18:53:31.637Z'::timestamptz
  AND h.circuit_breaker_state='CLOSED'
  AND (SELECT count(*) FROM public.retailer_observation_state o
    WHERE o.store_id='vatan' AND o.store_product_id IN ('129743','144590')
      AND o.last_http_status=403 AND o.last_offer_status='HTTP_ERROR'
      AND o.last_observed_at=h.last_failure_at)=2
ON CONFLICT (store_id,channel_id) DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.retailer_channel_health
    WHERE store_id='vatan' AND channel_id='direct_web') THEN
    RAISE EXCEPTION 'PREFLIGHT_BLOCKED: historical seed evidence does not match live durable state';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.retailer_access_channels
    WHERE store_id='vatan' AND channel_id='direct_web' AND enabled AND NOT production_ready
      AND channel_type='DIRECT_WEB') THEN
    RAISE EXCEPTION 'READBACK_FAILED: Vatan channel policy mismatch';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public'
    AND tablename IN ('retailer_access_channels','retailer_channel_health')) THEN
    RAISE EXCEPTION 'PREFLIGHT_BLOCKED: unexpected RLS policy; review existing policies';
  END IF;
END $$;
-- Transactional readback, visible before commit; no protected business tables modified.
SELECT * FROM public.retailer_access_channels ORDER BY store_id,channel_id;
SELECT * FROM public.retailer_channel_health ORDER BY store_id,channel_id;
COMMIT;
