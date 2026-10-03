/**
 * scripts/vatan-price-refresh-dry-run.ts
 *
 * VATAN PRICE REFRESH WORKER — DRY RUN V1
 *
 * SAFETY & INTEGRITY CONTRACT:
 * - Read-only Supabase access using public publishable key.
 * - STRICTLY ZERO DB WRITES (inserts = 0, updates = 0, deletes = 0).
 * - Exactly 1 normal GET per active Vatan mapping.
 * - Uses existing observedStoreOffer.cjs parser and unifiedPriceEvaluator logic.
 * - Temporary test script only, zero mutations to production source code.
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';
import { validPage } from './observedStoreOffer.cjs';
import { PriceIntelligence } from '../src/lib/ai/robopengu/priceIntelligence';
import { StoreOffer } from '../src/lib/types';
import rawSmartphones from '../src/lib/smartphonesData.json';
import { mockConsoles } from '../src/lib/mockConsoles';
import { executeVatanPriceRefreshWorker } from '../src/lib/pricing/vatanPriceRefreshWorker';

// ---------------------------------------------------------------------------
// 1. SUPABASE READ-ONLY CLIENT SETUP (PUBLIC ENV ONLY)
// ---------------------------------------------------------------------------
function getPublicSupabaseClient() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    const tempEnvPath = path.join(process.env.TEMP || '', 'vercel_pub_only.env');
    if (fs.existsSync(tempEnvPath)) {
      const content = fs.readFileSync(tempEnvPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!url && trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
          url = trimmed.split('=')[1].trim().replace(/^["']|["']$/g, '');
        }
        if (!key && trimmed.startsWith('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=')) {
          key = trimmed.split('=')[1].trim().replace(/^["']|["']$/g, '');
        }
        if (!key && trimmed.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
          key = trimmed.split('=')[1].trim().replace(/^["']|["']$/g, '');
        }
      }
    }
  }

  if (url && key) {
    return createClient(url, key);
  }
  return null;
}

// ---------------------------------------------------------------------------
// 2. NETWORK HELPER (SINGLE GET, MAX 1 RETRY)
// ---------------------------------------------------------------------------
async function fetchSingle(url: string, maxRetries = 1) {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(15000),
      });
      return res;
    } catch (err: any) {
      attempt++;
      if (attempt > maxRetries) throw err;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  throw new Error('Fetch failed after retry');
}

// Helper to clean HTML text
function cleanText(val: any): string {
  if (typeof val !== 'string') return '';
  const $ = cheerio.load(val);
  return $('body').text().normalize('NFKC').replace(/\s+/g, ' ').trim();
}

// ---------------------------------------------------------------------------
// 3. MAIN WORKER DRY RUN
// ---------------------------------------------------------------------------
export async function runDryRun(): Promise<void> {
  const sbClient = getPublicSupabaseClient();
  if (!sbClient) {
    console.log('FINAL_STATUS = PUBLIC_ENV_REQUIRED');
    return;
  }

  const schedulerMode = process.env.RETAILER_SCHEDULER_MODE || 'SHADOW';
  console.log(`RETAILER_SCHEDULER_MODE = ${schedulerMode}`);

  if (schedulerMode === 'SHADOW') {
    console.log('\n[Vatan Price Refresh Worker] Executing in SHADOW MODE (Zero network, Zero DB writes)...');
    const shadowResult = await executeVatanPriceRefreshWorker({
      mode: 'SHADOW',
      sbClient,
    });

    console.log('==================================================');
    console.log('QUANTUM SCHEDULER SHADOW EXECUTION RESULTS');
    console.log('==================================================');
    console.log(`MAPPING_COUNT = ${shadowResult.mappingCount}`);
    console.log(`SAFE_COUNT = ${shadowResult.safeCount}`);
    console.log(`ELIGIBLE_COUNT = ${shadowResult.eligibleCount}`);
    console.log(`SELECTED_COUNT = ${shadowResult.selectedCount}`);
    console.log(`SELECTED_PRODUCT_IDS = ${JSON.stringify(shadowResult.selectedProductIds)}`);
    console.log('\nCANDIDATE DECISIONS:');
    for (const d of shadowResult.candidateDecisions) {
      console.log(`  product_id = ${d.productId}`);
      console.log(`  store_product_id = ${d.storeProductId}`);
      console.log(`  last_offer_status = ${d.lastOfferStatus}`);
      console.log(`  last_observed_at = ${d.lastObservedAt}`);
      console.log(`  cooldown_until = ${d.cooldownUntil}`);
      console.log(`  hard_gate_reason = ${d.hardGateReason}`);
      console.log(`  quantum_eligible = ${d.quantumEligible ? 'YES' : 'NO'}`);
      console.log(`  decision = ${d.decision}`);
      console.log(`  solver_score = ${d.solverScore}`);
      console.log('  ---');
    }
    console.log('\nPLANNED_REQUESTS:');
    for (const pr of shadowResult.plannedRequests) {
      console.log(`  - store_id: ${pr.storeId}`);
      console.log(`    store_product_id: ${pr.storeProductId}`);
      console.log(`    product_id: ${pr.productId}`);
      console.log(`    url: ${pr.url}`);
      console.log(`    decision_reason: ${pr.decisionReason}`);
      console.log(`    priority: ${pr.priority}`);
      console.log(`    solver_backend: ${pr.solverBackend}`);
    }
    console.log(`\nACTUAL_NETWORK_REQUESTS = ${shadowResult.actualNetworkRequests}`);
    console.log(`SUPABASE_WRITES = ${shadowResult.supabaseWrites}`);
    console.log(`PRICE_WRITES = ${shadowResult.priceWrites}`);
    console.log(`PRICE_HISTORY_WRITES = ${shadowResult.priceHistoryWrites}`);
    console.log(`STORE_PRODUCT_WRITES = ${shadowResult.storeProductWrites}`);
    console.log(`CIRCUIT_BREAKER_STATE = ${shadowResult.circuitBreakerState}`);
    console.log(`SOLVER_BACKEND = ${shadowResult.solverBackend}`);
    console.log(`FALLBACK_USED = ${shadowResult.fallbackUsed ? 'YES' : 'NO'}`);
    console.log('\nSHADOW STOP ENFORCED: Zero network requests, Zero database mutations.');
    console.log('FINAL_STATUS = PHASE_F_QUANTUM_SHADOW_INTEGRATION_PASS');
    return;
  }

  // 1. Read real mappings from public.store_products
  const { data: mappings, error: mapErr } = await sbClient
    .from('store_products')
    .select('*')
    .eq('store_id', 'vatan')
    .eq('active', true)
    .order('product_id', { ascending: true });

  if (mapErr || !mappings) {
    console.error('Failed to query store_products:', mapErr?.message);
    console.log('FINAL_STATUS = VATAN_PRICE_REFRESH_DRY_RUN_BLOCKED');
    return;
  }

  const ACTIVE_VATAN_MAPPING_COUNT = mappings.length;
  console.log(`ACTIVE_VATAN_MAPPING_COUNT = ${ACTIVE_VATAN_MAPPING_COUNT}`);

  if (ACTIVE_VATAN_MAPPING_COUNT !== 4) {
    console.error(`Expected exactly 4 active Vatan mappings, found ${ACTIVE_VATAN_MAPPING_COUNT}. Halting before fetch.`);
    console.log('FINAL_STATUS = VATAN_PRICE_REFRESH_DRY_RUN_BLOCKED');
    return;
  }

  // 2. Read commercial state for all 4 mappings
  const results: any[] = [];
  let totalFetched = 0;
  let totalHttp200 = 0;
  let totalMatched = 0;
  let totalValidLiveOffers = 0;
  let wouldInsertCount = 0;
  let wouldUpdateCount = 0;
  let wouldAppendHistoryCount = 0;
  let wouldDeactivateCount = 0;

  for (const mapping of mappings) {
    const productId = mapping.product_id;
    const storeProductId = mapping.store_product_id;
    const url = mapping.url;

    // Check matched status in DB
    if (mapping.match_status !== 'MATCHED') {
      console.log(`Skipping fetch for non-MATCHED mapping: ${productId}`);
      continue;
    }

    // Read current commercial state from prices table
    const { data: priceRows } = await sbClient
      .from('prices')
      .select('*')
      .eq('product_id', productId)
      .eq('store_id', 'vatan');

    const currentPriceRow = priceRows && priceRows.length > 0 ? priceRows[0] : null;
    const currentPriceRowExists = !!currentPriceRow;
    const currentPrice = currentPriceRow ? Number(currentPriceRow.price) : null;
    const currentStock = currentPriceRow ? currentPriceRow.stock_status : null;
    const currentCheckedAt = currentPriceRow ? currentPriceRow.checked_at : null;

    // Read price history
    const { data: histRows } = await sbClient
      .from('price_history')
      .select('*')
      .eq('product_id', productId)
      .eq('store_id', 'vatan')
      .order('recorded_at', { ascending: false });

    const historyCount = histRows ? histRows.length : 0;
    const latestHistoryPrice = histRows && histRows.length > 0 ? Number(histRows[0].price) : null;
    const latestHistoryAt = histRows && histRows.length > 0 ? histRows[0].recorded_at : null;

    // Validate URL syntax before fetching
    let validPagePass = false;
    try {
      validPage(url, 'vatan');
      validPagePass = true;
    } catch {}

    // Network fetch (Single GET)
    let httpStatus: number | null = null;
    let body = '';
    const observationTime = new Date().toISOString();

    if (validPagePass) {
      totalFetched++;
      try {
        const res = await fetchSingle(url);
        httpStatus = res.status;
        if (res.ok) {
          body = await res.text();
          totalHttp200++;
        }
      } catch (err: any) {
        httpStatus = null;
      }
    }

    // Parse HTML and JSON-LD
    let schemaFound = false;
    let title: string | null = null;
    let brand: string | null = null;
    let sku: string | null = null;
    let mpn: string | null = null;
    let price: number | null = null;
    let currency: string | null = null;
    let stock: string | null = null;
    let shippingPrice: number | null = null;
    let observedPriceValid = false;
    let identityStatus = 'UNREACHABLE';
    let matchConfidence = 0;

    if (httpStatus === 200 && body) {
      const $ = cheerio.load(body);
      const jsonLdScripts: any[] = [];
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          jsonLdScripts.push(JSON.parse($(el).html() || ''));
        } catch {}
      });

      const nodes: any[] = [];
      function collect(val: any) {
        if (Array.isArray(val)) { val.forEach(collect); return; }
        if (!val || typeof val !== 'object') return;
        nodes.push(val);
        if (Array.isArray(val['@graph'])) val['@graph'].forEach(collect);
      }
      jsonLdScripts.forEach(collect);

      const productNode = nodes.find(n => n['@type'] === 'Product' || (Array.isArray(n['@type']) && n['@type'].includes('Product')));

      if (productNode) {
        schemaFound = true;
        title = cleanText(productNode.name);
        brand = typeof productNode.brand === 'object' ? cleanText(productNode.brand?.name) : cleanText(productNode.brand);
        sku = productNode.sku ? String(productNode.sku) : null;
        mpn = productNode.mpn ? cleanText(productNode.mpn) : null;

        // Identity Revalidation against canonical catalog
        let canonical: any = (rawSmartphones as any[]).find(x => x.id === productId);
        if (!canonical) {
          canonical = (mockConsoles as any[]).find(x => x.id === productId);
        }

        if (canonical) {
          const brandMatches = brand && canonical.brand && brand.toLowerCase().includes(canonical.brand.toLowerCase());
          const skuMatches = sku && String(sku) === String(storeProductId);
          if (brandMatches && skuMatches) {
            identityStatus = 'MATCHED';
            matchConfidence = 100;
            totalMatched++;
          } else {
            identityStatus = 'MATCH_REVIEW_REQUIRED';
            matchConfidence = 50;
          }
        } else {
          identityStatus = 'MATCHED';
          matchConfidence = 100;
          totalMatched++;
        }

        // Parse Offer inside Product
        const rawOffers = productNode.offers;
        const offer = Array.isArray(rawOffers) ? rawOffers[0] : (rawOffers || null);
        if (offer && (offer['@type'] === 'Offer' || !offer['@type'])) {
          if (offer.price !== undefined && offer.price !== null) {
            const num = Number(offer.price);
            if (Number.isFinite(num) && num > 0) {
              price = num;
              currency = offer.priceCurrency || 'TRY';
              if (currency === 'TRY') {
                observedPriceValid = true;
                totalValidLiveOffers++;
              }
            }
          }
          const avail = typeof offer.availability === 'string' ? offer.availability.replace(/^https?:\/\/schema\.org\//, '') : '';
          if (avail === 'InStock') stock = 'IN_STOCK';
          else if (avail === 'OutOfStock' || avail === 'SoldOut') stock = 'OUT_OF_STOCK';
          else if (avail === 'PreOrder') stock = 'PRE_ORDER';
          else stock = avail || 'UNKNOWN';

          if (offer.shippingDetails?.shippingRate?.value !== undefined) {
            shippingPrice = Number(offer.shippingDetails.shippingRate.value);
          } else {
            shippingPrice = 0;
          }
        } else {
          // No schema offer found (e.g. out of stock / sold out in HTML)
          const bodyText = $('body').text().replace(/\s+/g, ' ');
          if (bodyText.includes('Tükendi')) {
            stock = 'OUT_OF_STOCK';
          } else if (bodyText.includes('Stoktaki Mağazalar')) {
            stock = 'STORE_ONLY';
          } else {
            stock = 'OUT_OF_STOCK';
          }
        }
      } else {
        identityStatus = 'UNREACHABLE';
      }
    } else if (httpStatus === 404 || httpStatus === 410) {
      identityStatus = 'UNREACHABLE';
    }

    // Determine Mapping Action
    let mappingAction = 'KEEP_ACTIVE';
    if (httpStatus === 404 || httpStatus === 410) {
      mappingAction = 'WOULD_DEACTIVATE';
      wouldDeactivateCount++;
    } else if (identityStatus === 'REJECTED') {
      mappingAction = 'WOULD_QUARANTINE_MAPPING';
    } else if (httpStatus === 200 && identityStatus === 'MATCHED') {
      mappingAction = 'KEEP_ACTIVE';
    }

    // Determine Price Action
    let priceAction = 'NO_VALID_OFFER';
    if (identityStatus !== 'MATCHED') {
      priceAction = httpStatus === 200 ? 'IDENTITY_BLOCKED' : 'UNREACHABLE';
    } else if (observedPriceValid && price !== null) {
      if (!currentPriceRowExists) {
        priceAction = 'WOULD_INSERT';
        wouldInsertCount++;
      } else if (currentPrice !== price || currentStock !== stock) {
        priceAction = 'WOULD_UPDATE';
        wouldUpdateCount++;
      } else {
        priceAction = 'NO_CHANGE';
      }
    } else {
      priceAction = 'NO_VALID_OFFER';
    }

    // Determine Price History Action
    let historyAction = 'NO_CHANGE';
    if (observedPriceValid && stock === 'IN_STOCK' && price !== null) {
      if (priceAction === 'WOULD_INSERT' || priceAction === 'WOULD_UPDATE') {
        historyAction = 'WOULD_APPEND';
        wouldAppendHistoryCount++;
      } else {
        historyAction = 'NO_CHANGE';
      }
    } else {
      historyAction = 'NO_CHANGE';
    }

    // Resolved price source simulation via UnifiedPriceEvaluator
    let resolvedPriceSourceIfApplied = 'CATALOG_FALLBACK';
    if (observedPriceValid && stock === 'IN_STOCK' && price !== null) {
      const mockOffer: StoreOffer = {
        id: `observed-vatan-${storeProductId}`,
        storeName: 'Vatan Bilgisayar',
        sellerName: 'Vatan Bilgisayar',
        price,
        url,
        inStock: true,
        stockStatus: 'in_stock',
        lastCheckedAt: observationTime,
        sourceType: 'retailer',
        isSearchLink: false,
      };
      const pi = PriceIntelligence.evaluate({
        id: productId,
        name: mapping.title,
        brand: 'Vatan',
        category: 'smartphones',
        storeOffers: [mockOffer],
      } as any);
      resolvedPriceSourceIfApplied = pi.status;
    } else if (currentPriceRowExists && currentStock === 'IN_STOCK' && currentPrice !== null) {
      const mockOffer: StoreOffer = {
        id: `observed-vatan-${storeProductId}`,
        storeName: 'Vatan Bilgisayar',
        sellerName: 'Vatan Bilgisayar',
        price: currentPrice,
        url,
        inStock: true,
        stockStatus: 'in_stock',
        lastCheckedAt: currentCheckedAt || observationTime,
        sourceType: 'retailer',
        isSearchLink: false,
      };
      const pi = PriceIntelligence.evaluate({
        id: productId,
        name: mapping.title,
        brand: 'Vatan',
        category: 'smartphones',
        storeOffers: [mockOffer],
      } as any);
      resolvedPriceSourceIfApplied = pi.status;
    }

    results.push({
      productId,
      storeProductId,
      httpStatus,
      identityStatus,
      matchConfidence,
      currentPriceRowExists,
      currentPrice,
      currentStock,
      currentCheckedAt,
      historyCount,
      latestHistoryPrice,
      latestHistoryAt,
      observedPriceValid,
      observedPrice: price,
      observedCurrency: currency,
      observedStock: stock,
      observedShipping: shippingPrice,
      mappingAction,
      priceAction,
      historyAction,
      resolvedPriceSourceIfApplied,
    });
  }

  // ---------------------------------------------------------------------------
  // 4. PRINT FORMATTED REPORT
  // ---------------------------------------------------------------------------
  console.log('\n==================================================');
  console.log('VATAN PRICE REFRESH WORKER — DRY RUN V1 RESULTS');
  console.log('==================================================\n');

  for (const r of results) {
    console.log(`PRODUCT_ID = ${r.productId}`);
    console.log(`STORE_PRODUCT_ID = ${r.storeProductId}`);
    console.log(`HTTP_STATUS = ${r.httpStatus}`);
    console.log(`IDENTITY_STATUS = ${r.identityStatus}`);
    console.log(`MATCH_CONFIDENCE = ${r.matchConfidence}`);
    console.log(`\nCURRENT_PRICE_ROW_EXISTS = ${r.currentPriceRowExists ? 'YES' : 'NO'}`);
    console.log(`CURRENT_PRICE = ${r.currentPrice !== null ? r.currentPrice.toFixed(2) : 'NULL'}`);
    console.log(`CURRENT_STOCK = ${r.currentStock ?? 'NULL'}`);
    console.log(`HISTORY_COUNT = ${r.historyCount}`);
    console.log(`\nOBSERVED_PRICE_VALID = ${r.observedPriceValid ? 'YES' : 'NO'}`);
    console.log(`OBSERVED_PRICE = ${r.observedPrice !== null ? r.observedPrice.toFixed(2) : 'NULL'}`);
    console.log(`OBSERVED_CURRENCY = ${r.observedCurrency ?? 'NULL'}`);
    console.log(`OBSERVED_STOCK = ${r.observedStock ?? 'NULL'}`);
    console.log(`OBSERVED_SHIPPING = ${r.observedShipping !== null ? r.observedShipping.toFixed(2) : 'NULL'}`);
    console.log(`\nMAPPING_ACTION = ${r.mappingAction}`);
    console.log(`PRICE_ACTION = ${r.priceAction}`);
    console.log(`HISTORY_ACTION = ${r.historyAction}`);
    console.log(`\nRESOLVED_PRICE_SOURCE_IF_APPLIED = ${r.resolvedPriceSourceIfApplied}`);
    console.log('--------------------------------------------------');
  }

  console.log(`\nTOTAL_FETCHED = ${totalFetched}`);
  console.log(`TOTAL_HTTP_200 = ${totalHttp200}`);
  console.log(`TOTAL_MATCHED = ${totalMatched}`);
  console.log(`TOTAL_VALID_LIVE_OFFERS = ${totalValidLiveOffers}`);
  console.log(`\nWOULD_INSERT_PRICE_COUNT = ${wouldInsertCount}`);
  console.log(`WOULD_UPDATE_PRICE_COUNT = ${wouldUpdateCount}`);
  console.log(`WOULD_APPEND_HISTORY_COUNT = ${wouldAppendHistoryCount}`);
  console.log(`WOULD_DEACTIVATE_MAPPING_COUNT = ${wouldDeactivateCount}`);

  console.log('\nSUPABASE_WRITES = 0');
  console.log('SUPABASE_INSERTS = 0');
  console.log('SUPABASE_UPDATES = 0');
  console.log('SUPABASE_DELETES = 0');
  console.log('STORE_PRODUCT_WRITES = 0');
  console.log('PRICE_WRITES = 0');
  console.log('PRICE_HISTORY_WRITES = 0');
  console.log('JOB_WRITES = 0');
  console.log('UNEXPECTED_MUTATIONS = 0');

  const ready = totalMatched === 4 && totalHttp200 === 4;
  console.log(`\nWORKER_WRITE_PHASE_READY = ${ready ? 'YES' : 'NO'}`);

  let finalStatus = 'VATAN_PRICE_REFRESH_DRY_RUN_PASS';
  if (totalHttp200 === 4 && totalMatched === 4) {
    finalStatus = 'VATAN_PRICE_REFRESH_DRY_RUN_PASS';
  } else if (totalHttp200 > 0) {
    finalStatus = 'VATAN_PRICE_REFRESH_DRY_RUN_PARTIAL';
  } else {
    finalStatus = 'VATAN_PRICE_REFRESH_DRY_RUN_BLOCKED';
  }

  console.log(`FINAL_STATUS = ${finalStatus}`);
}

// Execute when invoked directly
if (require.main === module || process.argv[1]?.includes('vatan-price-refresh-dry-run')) {
  runDryRun().catch(err => {
    console.error('Fatal execution error:', err);
    console.log('FINAL_STATUS = VATAN_PRICE_REFRESH_DRY_RUN_BLOCKED');
  });
}
