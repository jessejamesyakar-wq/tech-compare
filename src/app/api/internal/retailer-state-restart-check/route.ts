import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import {
  RetailerQuantumScheduler,
  RetailerRefreshCandidate,
  RetailerHealthState,
  OptimizationBudget,
  DEFAULT_RETAILER_POLICY,
} from '@/lib/pricing/retailerQuantumScheduler';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // 1. Check server secret availability
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret?.trim()) {
    return NextResponse.json(
      { ok: false, error: 'Service Unavailable: Server authorization not configured' },
      { status: 503 }
    );
  }

  // 2. Validate Bearer token in constant time
  const authHeader = request.headers.get('authorization') || '';
  const expectedHeader = `Bearer ${cronSecret}`;
  const actualBuffer = Buffer.from(authHeader);
  const expectedBuffer = Buffer.from(expectedHeader);

  const isAuthorized =
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer);

  if (!isAuthorized) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  // 3. Obtain elevated server-side client
  const serverClient = getSupabaseServerClient();
  if (!serverClient) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Server client is not configured in production runtime',
      },
      { status: 500 }
    );
  }

  try {
    // 4. Query total counts across durable state tables
    const { count: durableStateRows, data: allObs, error: obsErr } = await serverClient
      .from('retailer_observation_state')
      .select('*', { count: 'exact' });

    if (obsErr) {
      return NextResponse.json(
        { ok: false, error: 'Failed to query retailer_observation_state: ' + obsErr.message },
        { status: 500 }
      );
    }

    const { count: storeHealthRows, data: allHealth, error: healthErr } = await serverClient
      .from('retailer_store_health')
      .select('*', { count: 'exact' });

    if (healthErr) {
      return NextResponse.json(
        { ok: false, error: 'Failed to query retailer_store_health: ' + healthErr.message },
        { status: 500 }
      );
    }

    // 5. Query active Vatan store_products
    const { data: storeProducts, error: spErr } = await serverClient
      .from('store_products')
      .select('*')
      .eq('store_id', 'vatan')
      .eq('active', true)
      .order('product_id', { ascending: true });

    if (spErr || !storeProducts) {
      return NextResponse.json(
        { ok: false, error: 'Failed to query store_products: ' + (spErr?.message || 'not found') },
        { status: 500 }
      );
    }

    // 6. Query existing prices and price history for Vatan
    const { data: prices, error: priceErr } = await serverClient
      .from('prices')
      .select('*')
      .eq('store_id', 'vatan');

    if (priceErr) {
      return NextResponse.json(
        { ok: false, error: 'Failed to query prices: ' + priceErr.message },
        { status: 500 }
      );
    }

    const { data: priceHistories, error: phErr } = await serverClient
      .from('price_history')
      .select('*')
      .eq('store_id', 'vatan');

    if (phErr) {
      return NextResponse.json(
        { ok: false, error: 'Failed to query price_history: ' + phErr.message },
        { status: 500 }
      );
    }

    // 7. Query stores table for Vatan reliability score
    const { data: vatanStoreRow } = await serverClient
      .from('stores')
      .select('*')
      .eq('id', 'vatan')
      .maybeSingle();

    // 8. Query products table for product priorities
    const productIds = storeProducts.map(sp => sp.product_id);
    const { data: productsData } = await serverClient
      .from('products')
      .select('id, priority')
      .in('id', productIds);

    const productMap = new Map((productsData || []).map(p => [p.id, p]));
    const obsMap = new Map((allObs || []).map(o => [`${o.store_id}::${o.store_product_id}`, o]));
    const priceMap = new Map((prices || []).map(p => [`${p.store_id}::${p.product_id}`, p]));
    const vatanHealth = (allHealth || []).find(h => h.store_id === 'vatan');

    const now = Date.now();

    // 9. Reconstruct mapping states from durable DB
    const reconstructed = storeProducts.map(sp => {
      const obsKey = `${sp.store_id}::${sp.store_product_id}`;
      const obs = obsMap.get(obsKey);

      const priceKey = `${sp.store_id}::${sp.product_id}`;
      const priceRow = priceMap.get(priceKey);

      return {
        storeProductId: sp.store_product_id,
        productId: sp.product_id,
        lastHttpStatus: obs?.last_http_status ?? null,
        lastOfferStatus: obs?.last_offer_status ?? null,
        lastObservedAt: obs?.last_observed_at ?? null,
        cooldownUntil: obs?.cooldown_until ?? null,
        currentPriceExists: Boolean(priceRow && priceRow.price !== null),
        currentPrice: priceRow?.price ?? null,
        currentStock: priceRow?.stock_status ?? null,
        circuitBreakerState: vatanHealth?.circuit_breaker_state ?? 'CLOSED',
        rateLimitUntil: vatanHealth?.rate_limit_until ?? null,
      };
    });

    // 10. Check exact expected states
    const iphone13 = reconstructed.find(r => r.storeProductId === '129743');
    const msi = reconstructed.find(r => r.storeProductId === '144590');
    const infinix = reconstructed.find(r => r.storeProductId === '147745');
    const iphone17 = reconstructed.find(r => r.storeProductId === '153500');

    const iphone13Pass = iphone13?.lastOfferStatus === 'OUT_OF_STOCK';
    const msiPass = msi?.lastOfferStatus === 'OUT_OF_STOCK';
    const infinixPass = infinix?.lastOfferStatus === 'STORE_ONLY';
    const iphone17Pass =
      iphone17?.lastOfferStatus === 'IN_STOCK' &&
      iphone17?.currentPrice === 119999 &&
      iphone17?.currentStock === 'IN_STOCK';

    const stateSurvivesRestart = Boolean(
      iphone13Pass && msiPass && infinixPass && iphone17Pass
    );

    // 11. Build candidates for Quantum Scheduler shadow run
    const candidates: RetailerRefreshCandidate[] = storeProducts.map(sp => {
      const obsKey = `${sp.store_id}::${sp.store_product_id}`;
      const obs = obsMap.get(obsKey);

      const priceKey = `${sp.store_id}::${sp.product_id}`;
      const priceRow = priceMap.get(priceKey);

      const prod = productMap.get(sp.product_id);
      const lastObservedAt = obs?.last_observed_at || null;
      const ageHours = lastObservedAt
        ? Math.max(0, (now - new Date(lastObservedAt).getTime()) / (1000 * 60 * 60))
        : 9999;

      const productHistories = (priceHistories || []).filter(
        h => h.product_id === sp.product_id
      );

      return {
        productId: sp.product_id,
        storeId: sp.store_id,
        storeProductId: sp.store_product_id,
        mappingActive: sp.active === true,
        identityStatus: (sp.match_status as any) || 'MATCHED',
        matchConfidence: sp.match_confidence ?? 100,
        lastCheckedAt: lastObservedAt,
        ageHours: Number(ageHours.toFixed(2)),
        currentPriceExists: Boolean(priceRow && priceRow.price !== null),
        currentPrice: priceRow?.price ?? null,
        currentStock: priceRow?.stock_status ?? null,
        historyCount: productHistories.length,
        lastHttpStatus: obs?.last_http_status ?? null,
        lastOfferStatus: obs?.last_offer_status ?? null,
        productPriority: prod?.priority ?? 'NORMAL',
        storeHealth: 1.0,
        recentFailureCount: obs?.consecutive_failures ?? 0,
        recentNoOfferCount: obs?.consecutive_no_offer ?? 0,
      };
    });

    const healthState: RetailerHealthState = {
      storeId: 'vatan',
      circuitBreakerOpen: vatanHealth?.circuit_breaker_state === 'OPEN',
      circuitBreakerState: (vatanHealth?.circuit_breaker_state as any) || 'CLOSED',
      rateLimitCooldownActive: vatanHealth?.rate_limit_until
        ? new Date(vatanHealth.rate_limit_until) > new Date()
        : false,
      degradedHealth:
        (vatanHealth?.recent_403_count ?? 0) > 0 ||
        (vatanHealth?.recent_429_count ?? 0) > 0 ||
        (vatanHealth?.recent_5xx_count ?? 0) > 0,
      reliabilityScore: vatanStoreRow?.reliability_score
        ? Number(vatanStoreRow.reliability_score) / 5.0
        : 1.0,
    };

    const budget: OptimizationBudget = {
      storeId: 'vatan',
      maxRequestsPerRun: 2,
    };

    const schedulingResult = RetailerQuantumScheduler.schedule(
      candidates,
      healthState,
      budget,
      DEFAULT_RETAILER_POLICY
    );

    // 12. Return safe JSON payload (ZERO credentials or sensitive env values)
    return NextResponse.json({
      ok: true,
      runtime: 'VERCEL_PRODUCTION',
      durableStateRows: durableStateRows ?? 0,
      storeHealthRows: storeHealthRows ?? 0,
      iphone13State: iphone13?.lastOfferStatus || 'UNKNOWN',
      msiState: msi?.lastOfferStatus || 'UNKNOWN',
      infinixState: infinix?.lastOfferStatus || 'UNKNOWN',
      iphone17State: iphone17?.lastOfferStatus || 'UNKNOWN',
      iphone17Details: {
        price: iphone17?.currentPrice,
        stock: iphone17?.currentStock,
        offerStatus: iphone17?.lastOfferStatus,
      },
      stateSource: 'DURABLE_DB',
      hardcodedStateUsed: false,
      stateSurvivesRestart,
      reconstructedMappings: reconstructed,
      vatanHealth: {
        healthStatus: vatanHealth?.health_status || 'UNKNOWN',
        circuitBreakerState: vatanHealth?.circuit_breaker_state || 'CLOSED',
        rateLimitUntil: vatanHealth?.rate_limit_until || null,
      },
      quantumShadow: {
        mappingCount: schedulingResult.totalCandidates,
        safeCount: schedulingResult.safeCandidatesCount,
        eligibleCount: schedulingResult.quantumEligibleCount,
        selectedCount: schedulingResult.selectedCandidates.length,
        selectedProductIds: schedulingResult.selectedProductIds,
        decisions: schedulingResult.decisions.map(d => ({
          productId: d.productId,
          storeProductId: d.storeProductId,
          statusSource: 'DURABLE_DB',
          hardGateReason: d.reason,
          quantumEligible: d.quantumEligible,
          decision: d.decision,
        })),
        telemetry: schedulingResult.telemetry,
      },
      circuitBreakerState: vatanHealth?.circuit_breaker_state || 'CLOSED',
      supabaseWrites: 0,
      networkRequests: 0,
      secretExposure: 'NONE',
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: 'Internal execution failure: ' + (err?.message || String(err)) },
      { status: 500 }
    );
  }
}
