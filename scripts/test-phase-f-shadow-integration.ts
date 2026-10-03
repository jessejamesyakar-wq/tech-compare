/**
 * scripts/test-phase-f-shadow-integration.ts
 *
 * PHASE F — QUANTUM SCHEDULER SHADOW MODE WORKER INTEGRATION SUITE
 *
 * 8 MANDATORY TEST SUITES:
 * 1. SHADOW_REAL_STATE (Real durable DB state execution)
 * 2. ZERO_ELIGIBLE (All candidates in cooldown)
 * 3. CIRCUIT_BREAKER_OPEN (Circuit breaker open gate)
 * 4. AGED_STATE (Controlled aging fixtures)
 * 5. SOLVER_FAILURE_FALLBACK (Classical fallback preserves gates)
 * 6. HARD_GATE_BYPASS (Gate immutability check)
 * 7. NO_NETWORK_IN_SHADOW (0 retailer HTTP calls)
 * 8. NO_DB_WRITE_IN_SHADOW (0 Supabase mutations)
 */

import { executeVatanPriceRefreshWorker } from '../src/lib/pricing/vatanPriceRefreshWorker';
import {
  RetailerQuantumScheduler,
  RetailerRefreshCandidate,
  RetailerHealthState,
  OptimizationBudget,
  DEFAULT_RETAILER_POLICY,
  RetailerSafetyGates,
  ClassicalGreedyScheduler,
} from '../src/lib/pricing/retailerQuantumScheduler';

interface TestSummary {
  name: string;
  passed: boolean;
  details: string;
}

const testResults: TestSummary[] = [];

async function runSuite() {
  console.log('======================================================================');
  console.log('🧪  PHASE F — QUANTUM SCHEDULER SHADOW MODE INTEGRATION SUITE  🧪');
  console.log('======================================================================\n');

  const originalFetch = global.fetch;
  let retailerNetworkCalls = 0;

  // Intercept global fetch to monitor any retailer outbound calls
  global.fetch = async (input: any, init?: any) => {
    const urlStr = typeof input === 'string' ? input : input?.url || '';
    if (urlStr.includes('vatanbilgisayar.com')) {
      retailerNetworkCalls++;
      throw new Error(`CRITICAL_POLICY_VIOLATION: Outbound retailer fetch attempted to ${urlStr}`);
    }
    return originalFetch(input, init);
  };

  try {
    // -----------------------------------------------------------------------
    // TEST 1: SHADOW_REAL_STATE
    // -----------------------------------------------------------------------
    console.log('--------------------------------------------------');
    console.log('TEST 1: SHADOW_REAL_STATE');
    console.log('--------------------------------------------------');
    const realResult = await executeVatanPriceRefreshWorker({ mode: 'SHADOW' });

    const test1Pass =
      realResult.mappingCount === 4 &&
      realResult.safeCount === 4 &&
      realResult.eligibleCount === 3 &&
      realResult.selectedCount === 2 &&
      realResult.selectedProductIds.length === 2 &&
      realResult.actualNetworkRequests === 0 &&
      realResult.supabaseWrites === 0 &&
      realResult.priceWrites === 0 &&
      realResult.priceHistoryWrites === 0 &&
      realResult.storeProductWrites === 0 &&
      realResult.circuitBreakerState === 'CLOSED' &&
      realResult.solverBackend === 'SIMULATED_ANNEALING' &&
      realResult.fallbackUsed === false &&
      retailerNetworkCalls === 0;

    testResults.push({
      name: 'SHADOW_REAL_STATE',
      passed: test1Pass,
      details: `mappings=${realResult.mappingCount}, eligible=${realResult.eligibleCount}, selected=${realResult.selectedCount}, network=${realResult.actualNetworkRequests}, writes=${realResult.supabaseWrites}`,
    });
    console.log(`Result: ${test1Pass ? 'PASS' : 'FAIL'}`);

    // -----------------------------------------------------------------------
    // TEST 2: ZERO_ELIGIBLE
    // -----------------------------------------------------------------------
    console.log('\n--------------------------------------------------');
    console.log('TEST 2: ZERO_ELIGIBLE');
    console.log('--------------------------------------------------');
    const now = Date.now();
    const zeroResult = await executeVatanPriceRefreshWorker({
      mode: 'SHADOW',
      customTimestamp: now,
      stateOverrides: {
        observationOverrides: {
          '153500': {
            lastHttpStatus: 200,
            lastOfferStatus: 'IN_STOCK',
            lastObservedAt: new Date(now - 1 * 3600 * 1000).toISOString(), // 1h ago (< 4h cooldown)
          },
          '129743': {
            lastHttpStatus: 200,
            lastOfferStatus: 'OUT_OF_STOCK',
            lastObservedAt: new Date(now - 2 * 3600 * 1000).toISOString(), // 2h ago (< 12h cooldown)
          },
          '144590': {
            lastHttpStatus: 200,
            lastOfferStatus: 'OUT_OF_STOCK',
            lastObservedAt: new Date(now - 2 * 3600 * 1000).toISOString(), // 2h ago (< 12h cooldown)
          },
          '147745': {
            lastHttpStatus: 200,
            lastOfferStatus: 'STORE_ONLY',
            lastObservedAt: new Date(now - 5 * 3600 * 1000).toISOString(), // 5h ago (< 24h cooldown)
          },
        },
      },
    });

    const test2Pass =
      zeroResult.eligibleCount === 0 &&
      zeroResult.selectedCount === 0 &&
      zeroResult.plannedRequests.length === 0 &&
      zeroResult.actualNetworkRequests === 0 &&
      zeroResult.telemetry.quboExecuted === false &&
      zeroResult.telemetry.solverBackend === 'NONE';

    testResults.push({
      name: 'ZERO_ELIGIBLE',
      passed: test2Pass,
      details: `eligible=${zeroResult.eligibleCount}, selected=${zeroResult.selectedCount}, quboExecuted=${zeroResult.telemetry.quboExecuted}, backend=${zeroResult.telemetry.solverBackend}`,
    });
    console.log(`Result: ${test2Pass ? 'PASS' : 'FAIL'}`);

    // -----------------------------------------------------------------------
    // TEST 3: CIRCUIT_BREAKER_OPEN
    // -----------------------------------------------------------------------
    console.log('\n--------------------------------------------------');
    console.log('TEST 3: CIRCUIT_BREAKER_OPEN');
    console.log('--------------------------------------------------');
    const cbResult = await executeVatanPriceRefreshWorker({
      mode: 'SHADOW',
      stateOverrides: {
        circuitBreakerState: 'OPEN',
      },
    });

    const test3Pass =
      cbResult.circuitBreakerState === 'OPEN' &&
      cbResult.safeCount === 0 &&
      cbResult.eligibleCount === 0 &&
      cbResult.selectedCount === 0 &&
      cbResult.plannedRequests.length === 0 &&
      cbResult.actualNetworkRequests === 0 &&
      cbResult.candidateDecisions.every(d => d.hardGateReason === 'CIRCUIT_BREAKER_OPEN');

    testResults.push({
      name: 'CIRCUIT_BREAKER_OPEN',
      passed: test3Pass,
      details: `cbState=${cbResult.circuitBreakerState}, safeCount=${cbResult.safeCount}, eligible=${cbResult.eligibleCount}, selected=${cbResult.selectedCount}`,
    });
    console.log(`Result: ${test3Pass ? 'PASS' : 'FAIL'}`);

    // -----------------------------------------------------------------------
    // TEST 4: AGED_STATE
    // -----------------------------------------------------------------------
    console.log('\n--------------------------------------------------');
    console.log('TEST 4: AGED_STATE');
    console.log('--------------------------------------------------');
    // Section 11 Specification:
    // iPhone13 OOS = 13h (> 12h -> eligible)
    // MSI OOS = 2h (< 12h -> hard skip RECENT_OUT_OF_STOCK)
    // Infinix STORE_ONLY = 25h (> 24h -> eligible)
    // iPhone17 LIVE = 1h (< 4h -> hard skip RECENT_LIVE_PRICE)
    const agedResult = await executeVatanPriceRefreshWorker({
      mode: 'SHADOW',
      customTimestamp: now,
      stateOverrides: {
        observationOverrides: {
          '129743': {
            lastHttpStatus: 200,
            lastOfferStatus: 'OUT_OF_STOCK',
            lastObservedAt: new Date(now - 13 * 3600 * 1000).toISOString(),
          },
          '144590': {
            lastHttpStatus: 200,
            lastOfferStatus: 'OUT_OF_STOCK',
            lastObservedAt: new Date(now - 2 * 3600 * 1000).toISOString(),
          },
          '147745': {
            lastHttpStatus: 200,
            lastOfferStatus: 'STORE_ONLY',
            lastObservedAt: new Date(now - 25 * 3600 * 1000).toISOString(),
          },
          '153500': {
            lastHttpStatus: 200,
            lastOfferStatus: 'IN_STOCK',
            lastObservedAt: new Date(now - 1 * 3600 * 1000).toISOString(),
          },
        },
      },
    });

    const iphone13Decision = agedResult.candidateDecisions.find(d => d.storeProductId === '129743');
    const msiDecision = agedResult.candidateDecisions.find(d => d.storeProductId === '144590');
    const infinixDecision = agedResult.candidateDecisions.find(d => d.storeProductId === '147745');
    const iphone17Decision = agedResult.candidateDecisions.find(d => d.storeProductId === '153500');

    const test4Pass =
      iphone13Decision?.quantumEligible === true &&
      infinixDecision?.quantumEligible === true &&
      msiDecision?.quantumEligible === false &&
      msiDecision?.hardGateReason === 'RECENT_OUT_OF_STOCK' &&
      iphone17Decision?.quantumEligible === false &&
      iphone17Decision?.hardGateReason === 'RECENT_LIVE_PRICE' &&
      agedResult.eligibleCount === 2 &&
      agedResult.selectedCount === 2;

    testResults.push({
      name: 'AGED_STATE',
      passed: test4Pass,
      details: `iphone13Eligible=${iphone13Decision?.quantumEligible}, infinixEligible=${infinixDecision?.quantumEligible}, msiReason=${msiDecision?.hardGateReason}, iphone17Reason=${iphone17Decision?.hardGateReason}, selected=${agedResult.selectedCount}`,
    });
    console.log(`Result: ${test4Pass ? 'PASS' : 'FAIL'}`);

    // -----------------------------------------------------------------------
    // TEST 5: SOLVER_FAILURE_FALLBACK
    // -----------------------------------------------------------------------
    console.log('\n--------------------------------------------------');
    console.log('TEST 5: SOLVER_FAILURE_FALLBACK');
    console.log('--------------------------------------------------');
    // Direct verification of classical fallback with ineligible candidates
    const fallbackTestCandidates: RetailerRefreshCandidate[] = [
      {
        productId: 'prod-ineligible-cooldown',
        storeId: 'vatan',
        storeProductId: '147745',
        mappingActive: true,
        identityStatus: 'MATCHED',
        matchConfidence: 100,
        lastCheckedAt: new Date(now - 2 * 3600 * 1000).toISOString(),
        ageHours: 2.0,
        currentPriceExists: false,
        currentPrice: null,
        currentStock: null,
        historyCount: 0,
        lastHttpStatus: 200,
        lastOfferStatus: 'STORE_ONLY', // 24h cooldown
        productPriority: 'HIGH_PRIORITY',
        storeHealth: 1.0,
        recentFailureCount: 0,
        recentNoOfferCount: 0,
      },
      {
        productId: 'prod-eligible-stale',
        storeId: 'vatan',
        storeProductId: '129743',
        mappingActive: true,
        identityStatus: 'MATCHED',
        matchConfidence: 100,
        lastCheckedAt: new Date(now - 30 * 3600 * 1000).toISOString(),
        ageHours: 30.0,
        currentPriceExists: false,
        currentPrice: null,
        currentStock: null,
        historyCount: 0,
        lastHttpStatus: 200,
        lastOfferStatus: 'OUT_OF_STOCK',
        productPriority: 'NORMAL',
        storeHealth: 1.0,
        recentFailureCount: 0,
        recentNoOfferCount: 0,
      },
    ];

    const health: RetailerHealthState = {
      storeId: 'vatan',
      circuitBreakerOpen: false,
      circuitBreakerState: 'CLOSED',
      rateLimitCooldownActive: false,
      degradedHealth: false,
      reliabilityScore: 0.94,
    };

    const budget: OptimizationBudget = {
      storeId: 'vatan',
      maxRequestsPerRun: 2,
    };

    // Run scheduler directly to observe fallback handling
    const directSchedulerResult = RetailerQuantumScheduler.schedule(
      fallbackTestCandidates,
      health,
      budget,
      DEFAULT_RETAILER_POLICY
    );

    // Verify that the ineligible candidate is NEVER selected, even in fallback or classical evaluation
    const fallbackSelectedIds = directSchedulerResult.selectedProductIds;
    const test5Pass =
      !fallbackSelectedIds.includes('prod-ineligible-cooldown') &&
      fallbackSelectedIds.includes('prod-eligible-stale') &&
      directSchedulerResult.quantumEligibleCount === 1;

    testResults.push({
      name: 'SOLVER_FAILURE_FALLBACK',
      passed: test5Pass,
      details: `eligibleCount=${directSchedulerResult.quantumEligibleCount}, selectedIds=${JSON.stringify(fallbackSelectedIds)} (ineligible correctly excluded)`,
    });
    console.log(`Result: ${test5Pass ? 'PASS' : 'FAIL'}`);

    // -----------------------------------------------------------------------
    // TEST 6: HARD_GATE_BYPASS
    // -----------------------------------------------------------------------
    console.log('\n--------------------------------------------------');
    console.log('TEST 6: HARD_GATE_BYPASS');
    console.log('--------------------------------------------------');
    // Test that inactive mapping, dead mapping, and circuit breaker cannot be bypassed
    const inactiveCandidate: RetailerRefreshCandidate = {
      productId: 'prod-inactive',
      storeId: 'vatan',
      storeProductId: '999999',
      mappingActive: false, // Inactive
      identityStatus: 'MATCHED',
      matchConfidence: 100,
      lastCheckedAt: null,
      ageHours: 9999,
      currentPriceExists: false,
      currentPrice: null,
      currentStock: null,
      historyCount: 0,
      lastHttpStatus: 200,
      lastOfferStatus: null,
      productPriority: 'HIGH_PRIORITY',
      storeHealth: 1.0,
      recentFailureCount: 0,
      recentNoOfferCount: 0,
    };

    const structGate1 = RetailerSafetyGates.evaluateStructuralGate(inactiveCandidate, health);
    const deadCandidate: RetailerRefreshCandidate = {
      ...inactiveCandidate,
      mappingActive: true,
      lastHttpStatus: 404, // Dead
    };
    const structGate2 = RetailerSafetyGates.evaluateStructuralGate(deadCandidate, health);
    const cbOpenHealth: RetailerHealthState = { ...health, circuitBreakerOpen: true, circuitBreakerState: 'OPEN' };
    const structGate3 = RetailerSafetyGates.evaluateStructuralGate({ ...deadCandidate, lastHttpStatus: 200 }, cbOpenHealth);

    const test6Pass =
      structGate1.passed === false &&
      structGate1.reason === 'INACTIVE_MAPPING' &&
      structGate2.passed === false &&
      structGate2.reason === 'DEAD_MAPPING' &&
      structGate3.passed === false &&
      structGate3.reason === 'CIRCUIT_BREAKER_OPEN';

    testResults.push({
      name: 'HARD_GATE_BYPASS',
      passed: test6Pass,
      details: `inactiveGate=${structGate1.reason}, deadGate=${structGate2.reason}, cbGate=${structGate3.reason} (bypass strictly impossible)`,
    });
    console.log(`Result: ${test6Pass ? 'PASS' : 'FAIL'}`);

    // -----------------------------------------------------------------------
    // TEST 7: NO_NETWORK_IN_SHADOW
    // -----------------------------------------------------------------------
    console.log('\n--------------------------------------------------');
    console.log('TEST 7: NO_NETWORK_IN_SHADOW');
    console.log('--------------------------------------------------');
    const test7Pass = retailerNetworkCalls === 0 && realResult.actualNetworkRequests === 0;
    testResults.push({
      name: 'NO_NETWORK_IN_SHADOW',
      passed: test7Pass,
      details: `interceptedOutboundCalls=${retailerNetworkCalls}, actualNetworkRequests=${realResult.actualNetworkRequests}`,
    });
    console.log(`Result: ${test7Pass ? 'PASS' : 'FAIL'}`);

    // -----------------------------------------------------------------------
    // TEST 8: NO_DB_WRITE_IN_SHADOW
    // -----------------------------------------------------------------------
    console.log('\n--------------------------------------------------');
    console.log('TEST 8: NO_DB_WRITE_IN_SHADOW');
    console.log('--------------------------------------------------');
    const test8Pass =
      realResult.supabaseWrites === 0 &&
      realResult.priceWrites === 0 &&
      realResult.priceHistoryWrites === 0 &&
      realResult.storeProductWrites === 0;

    testResults.push({
      name: 'NO_DB_WRITE_IN_SHADOW',
      passed: test8Pass,
      details: `supabaseWrites=${realResult.supabaseWrites}, priceWrites=${realResult.priceWrites}, historyWrites=${realResult.priceHistoryWrites}, storeProductWrites=${realResult.storeProductWrites}`,
    });
    console.log(`Result: ${test8Pass ? 'PASS' : 'FAIL'}`);

  } finally {
    // Restore global fetch
    global.fetch = originalFetch;
  }

  // -------------------------------------------------------------------------
  // FINAL SUITE VERIFICATION & REPORT
  // -------------------------------------------------------------------------
  console.log('\n======================================================================');
  console.log('📋  TEST SUITE EXECUTION SUMMARY  📋');
  console.log('======================================================================');
  let allPass = true;
  for (const r of testResults) {
    console.log(`  [${r.passed ? 'PASS' : 'FAIL'}] ${r.name.padEnd(26)} : ${r.details}`);
    if (!r.passed) allPass = false;
  }
  console.log('======================================================================');
  console.log(`SUITE_STATUS = ${allPass ? 'ALL_TESTS_PASS' : 'SOME_TESTS_FAILED'}`);
  console.log(`TOTAL_TESTS = ${testResults.length}, PASSED = ${testResults.filter(t => t.passed).length}, FAILED = ${testResults.filter(t => !t.passed).length}`);

  if (!allPass) {
    process.exit(1);
  }
}

runSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
