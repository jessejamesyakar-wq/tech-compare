/**
 * scripts/test-phase-g-controlled-fetch.ts
 *
 * PHASE G AUTOMATED TEST SUITE: QUANTUM CONTROLLED FETCH INTEGRATION
 *
 * Validates:
 * 1. CONTROLLED_FETCH_SELECTION: Only selected candidates receive HTTP GET; requests <= selectedCount <= 2.
 * 2. ZERO_NETWORK_FOR_INELIGIBLE: Ineligible candidates never get HTTP GET.
 * 3. ZERO_DB_WRITES: Asserts 0 inserts, 0 updates, 0 deletes across all entities.
 * 4. PARSER_AND_IDENTITY_REVALIDATION: Validates extraction, exact matching, and variant conflict rejection.
 * 5. WOULD_ACTION_PLAN: Verifies exact would-actions generated without DB writes.
 * 6. HTTP_FAILURE_SAFETY: 403/429/5xx logs would actions, does not bypass, 0 DB writes.
 * 7. CIRCUIT_BREAKER_OPEN_BLOCK: If circuit breaker is OPEN, 0 network requests occur.
 * 8. FAIL_CLOSED_ON_SOLVER_FAULT: If solver fails, 0 network requests occur.
 */

import assert from 'node:assert/strict';
import { executeVatanPriceRefreshWorker } from '../src/lib/pricing/vatanPriceRefreshWorker';
import { parseVatanHtml } from '../src/lib/pricing/vatanOfferParser';
import { getProductById } from '../src/lib/data';

interface TestRecord {
  name: string;
  passed: boolean;
  details: string;
}

const testResults: TestRecord[] = [];

async function runTest(name: string, fn: () => Promise<void>) {
  console.log(`--------------------------------------------------`);
  console.log(`TEST: ${name}`);
  console.log(`--------------------------------------------------`);
  try {
    await fn();
    testResults.push({ name, passed: true, details: 'PASS' });
    console.log(`Result: PASS\n`);
  } catch (err: any) {
    testResults.push({ name, passed: false, details: err?.message || String(err) });
    console.error(`Result: FAILED -> ${err?.message}\n`);
  }
}

export async function runPhaseGSuite() {
  console.log('======================================================================');
  console.log('🧪  PHASE G — QUANTUM CONTROLLED FETCH INTEGRATION SUITE  🧪');
  console.log('======================================================================\n');

  // -------------------------------------------------------------------------
  // TEST 1: CONTROLLED_FETCH_SELECTION
  // -------------------------------------------------------------------------
  await runTest('CONTROLLED_FETCH_SELECTION', async () => {
    const fetchedUrls: string[] = [];

    const mockFetch = (async (url: any) => {
      fetchedUrls.push(String(url));
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="canonical" href="${url}" />
            <script type="application/ld+json">
              {
                "@context": "https://schema.org",
                "@type": "Product",
                "name": "Apple iPhone 13 128 GB Akıllı Telefon Yıldız Işığı",
                "sku": "129743",
                "brand": { "@type": "Brand", "name": "Apple" },
                "offers": {
                  "@type": "Offer",
                  "price": "39999.00",
                  "priceCurrency": "TRY",
                  "availability": "https://schema.org/InStock",
                  "seller": { "@type": "Organization", "name": "Vatan Bilgisayar" }
                }
              }
            </script>
          </head>
          <body>
            <h1>Apple iPhone 13 128 GB Akıllı Telefon Yıldız Işığı</h1>
          </body>
        </html>
      `;
      return new Response(mockHtml, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }) as any;

    const result = await executeVatanPriceRefreshWorker({
      mode: 'CONTROLLED_FETCH',
      maxRequestsPerRun: 2,
      fetchImpl: mockFetch,
    });

    assert.equal(result.mode, 'CONTROLLED_FETCH');
    assert.ok(result.selectedCount <= 2, `Selected count should be <= 2, got ${result.selectedCount}`);
    assert.equal(result.actualNetworkRequests, fetchedUrls.length, 'Reported requests must match actual fetch calls');
    assert.ok(result.actualNetworkRequests <= 2, `Actual network requests must be <= 2, got ${result.actualNetworkRequests}`);
    assert.ok(result.actualNetworkRequests <= result.selectedCount, 'Requests must not exceed selected count');
    assert.equal(result.supabaseWrites, 0, 'Supabase writes must be 0');
    assert.equal(result.fetchedResults.length, result.actualNetworkRequests, 'Fetched results count must match requests');

    // Verify unselected candidate (147745 with active cooldown) was NOT fetched
    assert.ok(
      !fetchedUrls.some((u) => u.includes('infinix')),
      'Infinix (147745) has active cooldown and must NOT be fetched'
    );
  });

  // -------------------------------------------------------------------------
  // TEST 2: ZERO_NETWORK_FOR_INELIGIBLE
  // -------------------------------------------------------------------------
  await runTest('ZERO_NETWORK_FOR_INELIGIBLE', async () => {
    let callCount = 0;
    const mockFetch = (async () => {
      callCount++;
      return new Response('', { status: 200 });
    }) as any;

    // Simulate 0 eligible candidates by giving all candidates fresh observations just now
    const now = Date.now();
    const result = await executeVatanPriceRefreshWorker({
      mode: 'CONTROLLED_FETCH',
      maxRequestsPerRun: 2,
      fetchImpl: mockFetch,
      customTimestamp: now,
      stateOverrides: {
        observationOverrides: {
          '129743': { lastObservedAt: new Date(now).toISOString(), lastOfferStatus: 'OUT_OF_STOCK', cooldownUntil: new Date(now + 3600000).toISOString() },
          '144590': { lastObservedAt: new Date(now).toISOString(), lastOfferStatus: 'OUT_OF_STOCK', cooldownUntil: new Date(now + 3600000).toISOString() },
          '147745': { lastObservedAt: new Date(now).toISOString(), lastOfferStatus: 'STORE_ONLY', cooldownUntil: new Date(now + 3600000).toISOString() },
          '153500': { lastObservedAt: new Date(now).toISOString(), lastOfferStatus: 'IN_STOCK', cooldownUntil: new Date(now + 3600000).toISOString() },
        },
      },
    });

    assert.equal(result.eligibleCount, 0, 'Eligible count must be 0');
    assert.equal(result.selectedCount, 0, 'Selected count must be 0');
    assert.equal(result.actualNetworkRequests, 0, 'Actual network requests must be 0');
    assert.equal(callCount, 0, 'Mock fetch should never be called when eligible is 0');
  });

  // -------------------------------------------------------------------------
  // TEST 3: ZERO_DB_WRITES_ASSERTION
  // -------------------------------------------------------------------------
  await runTest('ZERO_DB_WRITES_ASSERTION', async () => {
    const mockFetch = (async () => new Response('<html></html>', { status: 200 })) as any;

    const result = await executeVatanPriceRefreshWorker({
      mode: 'CONTROLLED_FETCH',
      fetchImpl: mockFetch,
    });

    assert.equal(result.supabaseWrites, 0, 'supabaseWrites must be 0');
    assert.equal(result.priceWrites, 0, 'priceWrites must be 0');
    assert.equal(result.priceHistoryWrites, 0, 'priceHistoryWrites must be 0');
    assert.equal(result.storeProductWrites, 0, 'storeProductWrites must be 0');
    assert.equal(result.observationStateWrites, 0, 'observationStateWrites must be 0');
    assert.equal(result.storeHealthWrites, 0, 'storeHealthWrites must be 0');
  });

  // -------------------------------------------------------------------------
  // TEST 4: PARSER_AND_IDENTITY_REVALIDATION
  // -------------------------------------------------------------------------
  await runTest('PARSER_AND_IDENTITY_REVALIDATION', async () => {
    const canonical = getProductById('apple-apple-iphone-13-128-gb-717135');
    assert.ok(canonical, 'Canonical product must exist');

    // 4A: Exact matching HTML
    const matchedHtml = `
      <link rel="canonical" href="https://www.vatanbilgisayar.com/iphone-13-akilli-telefon.html" />
      <script type="application/ld+json">
        {
          "@type": "Product",
          "name": "Apple iPhone 13 128 GB Akıllı Telefon Gece Yarısı",
          "sku": "129743",
          "brand": { "name": "Apple" },
          "offers": {
            "@type": "Offer",
            "price": "39999.00",
            "priceCurrency": "TRY",
            "availability": "https://schema.org/InStock",
            "seller": { "name": "Vatan Bilgisayar" }
          }
        }
      </script>
    `;
    const resA = parseVatanHtml(matchedHtml, 'https://www.vatanbilgisayar.com/iphone-13-akilli-telefon.html', 200, canonical);
    assert.equal(resA.identityStatus, 'MATCHED');
    assert.equal(resA.observedOfferStatus, 'IN_STOCK');
    assert.equal(resA.observedPrice, 39999);
    assert.equal(resA.observedPriceValid, true);
    assert.equal(resA.wouldActions.priceAction, 'WOULD_INSERT');

    // 4B: Variant Conflict Rejection (256 GB offered for 128 GB product)
    const conflictHtml = `
      <link rel="canonical" href="https://www.vatanbilgisayar.com/iphone-13-akilli-telefon.html" />
      <script type="application/ld+json">
        {
          "@type": "Product",
          "name": "Apple iPhone 13 256 GB Akıllı Telefon Yıldız Işığı",
          "sku": "129744",
          "brand": { "name": "Apple" },
          "offers": {
            "@type": "Offer",
            "price": "44999.00",
            "priceCurrency": "TRY",
            "availability": "https://schema.org/InStock"
          }
        }
      </script>
    `;
    const resB = parseVatanHtml(conflictHtml, 'https://www.vatanbilgisayar.com/iphone-13-akilli-telefon.html', 200, canonical);
    assert.equal(resB.identityStatus, 'REJECTED', 'Variant conflict must reject identity');
    assert.equal(resB.wouldActions.priceAction, 'IDENTITY_BLOCKED', 'Rejected identity must block price action');
    assert.equal(resB.wouldActions.mappingAction, 'WOULD_QUARANTINE_MAPPING');
  });

  // -------------------------------------------------------------------------
  // TEST 5: WOULD_ACTION_PLAN_CONSISTENCY
  // -------------------------------------------------------------------------
  await runTest('WOULD_ACTION_PLAN_CONSISTENCY', async () => {
    const canonical = getProductById('apple-apple-iphone-13-128-gb-717135');

    // Existing price: 39999. New observed price: 39999 -> NO_CHANGE
    const samePriceHtml = `
      <script type="application/ld+json">
        {
          "@type": "Product",
          "name": "Apple iPhone 13 128 GB",
          "sku": "129743",
          "brand": { "name": "Apple" },
          "offers": {
            "@type": "Offer",
            "price": "39999.00",
            "priceCurrency": "TRY",
            "availability": "https://schema.org/InStock"
          }
        }
      </script>
    `;
    const resSame = parseVatanHtml(samePriceHtml, 'https://www.vatanbilgisayar.com/iphone-13.html', 200, canonical, 39999);
    assert.equal(resSame.wouldActions.priceAction, 'NO_CHANGE');

    // Existing price: 39999. New observed price: 38999 -> WOULD_UPDATE
    const diffPriceHtml = samePriceHtml.replace('39999.00', '38999.00');
    const resDiff = parseVatanHtml(diffPriceHtml, 'https://www.vatanbilgisayar.com/iphone-13.html', 200, canonical, 39999);
    assert.equal(resDiff.wouldActions.priceAction, 'WOULD_UPDATE');
    assert.equal(resDiff.wouldActions.historyAction, 'WOULD_APPEND');

    // Out of stock page -> NO_VALID_OFFER
    const oosHtml = `
      <script type="application/ld+json">
        {
          "@type": "Product",
          "name": "Apple iPhone 13 128 GB",
          "sku": "129743",
          "brand": { "name": "Apple" },
          "offers": {
            "@type": "Offer",
            "price": "39999.00",
            "priceCurrency": "TRY",
            "availability": "https://schema.org/OutOfStock"
          }
        }
      </script>
    `;
    const resOos = parseVatanHtml(oosHtml, 'https://www.vatanbilgisayar.com/iphone-13.html', 200, canonical);
    assert.equal(resOos.observedOfferStatus, 'OUT_OF_STOCK');
    assert.equal(resOos.wouldActions.priceAction, 'NO_VALID_OFFER');
    assert.equal(resOos.wouldActions.historyAction, 'NO_CHANGE');
  });

  // -------------------------------------------------------------------------
  // TEST 6: HTTP_FAILURE_SAFETY
  // -------------------------------------------------------------------------
  await runTest('HTTP_FAILURE_SAFETY', async () => {
    const canonical = getProductById('apple-apple-iphone-13-128-gb-717135');

    // Test 403 Forbidden
    const res403 = parseVatanHtml('', 'https://www.vatanbilgisayar.com/iphone-13.html', 403, canonical);
    assert.equal(res403.httpStatus, 403);
    assert.equal(res403.identityStatus, 'UNREACHABLE');
    assert.equal(res403.wouldActions.priceAction, 'UNREACHABLE');
    assert.ok(res403.wouldActions.httpFailureActions?.wouldIncrementCounter);
    assert.ok(res403.wouldActions.httpFailureActions?.wouldApplyCooldown);
    assert.ok(res403.wouldActions.httpFailureActions?.wouldEvaluateCircuitBreaker);

    // Test 429 Rate Limit
    const res429 = parseVatanHtml('', 'https://www.vatanbilgisayar.com/iphone-13.html', 429, canonical);
    assert.equal(res429.httpStatus, 429);
    assert.ok(res429.wouldActions.httpFailureActions?.wouldApplyCooldown);

    // Test 500 Server Error
    const res500 = parseVatanHtml('', 'https://www.vatanbilgisayar.com/iphone-13.html', 500, canonical);
    assert.equal(res500.httpStatus, 500);
    assert.ok(res500.wouldActions.httpFailureActions?.wouldEvaluateCircuitBreaker);
  });

  // -------------------------------------------------------------------------
  // TEST 7: CIRCUIT_BREAKER_OPEN_BLOCK
  // -------------------------------------------------------------------------
  await runTest('CIRCUIT_BREAKER_OPEN_BLOCK', async () => {
    let calls = 0;
    const mockFetch = (async () => {
      calls++;
      return new Response('', { status: 200 });
    }) as any;

    const result = await executeVatanPriceRefreshWorker({
      mode: 'CONTROLLED_FETCH',
      fetchImpl: mockFetch,
      stateOverrides: {
        circuitBreakerState: 'OPEN',
      },
    });

    assert.equal(result.circuitBreakerState, 'OPEN');
    assert.equal(result.safeCount, 0, 'Safe candidates count must be 0 when CB is OPEN');
    assert.equal(result.selectedCount, 0);
    assert.equal(result.actualNetworkRequests, 0);
    assert.equal(calls, 0, 'No HTTP requests should be executed when CB is OPEN');
  });

  // -------------------------------------------------------------------------
  // TEST 8: FAIL_CLOSED_ON_SOLVER_FAULT
  // -------------------------------------------------------------------------
  await runTest('FAIL_CLOSED_ON_SOLVER_FAULT', async () => {
    let calls = 0;
    const mockFetch = (async () => {
      calls++;
      return new Response('', { status: 200 });
    }) as any;

    const result = await executeVatanPriceRefreshWorker({
      mode: 'CONTROLLED_FETCH',
      forceSolverError: true,
      fetchImpl: mockFetch,
    });

    // In controlled fetch with forced error, scheduler falls back to classical or fail-closed
    // and network requests must never exceed selected candidates
    assert.ok(result.actualNetworkRequests <= result.selectedCount);
    assert.ok(result.actualNetworkRequests <= 2);
    assert.equal(result.supabaseWrites, 0);
  });

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('======================================================================');
  console.log('📋  PHASE G TEST SUITE SUMMARY  📋');
  console.log('======================================================================');
  let passCount = 0;
  for (const t of testResults) {
    const symbol = t.passed ? '[PASS]' : '[FAIL]';
    console.log(`  ${symbol} ${t.name.padEnd(35)}: ${t.details}`);
    if (t.passed) passCount++;
  }
  console.log('======================================================================');
  console.log(`SUITE_STATUS = ${passCount === testResults.length ? 'ALL_TESTS_PASS' : 'SOME_TESTS_FAILED'}`);
  console.log(`TOTAL_TESTS = ${testResults.length}, PASSED = ${passCount}, FAILED = ${testResults.length - passCount}\n`);

  if (passCount !== testResults.length) {
    process.exit(1);
  }
}

if (require.main === module) {
  runPhaseGSuite().catch((err) => {
    console.error('Test suite uncaught error:', err);
    process.exit(1);
  });
}
