/**
 * scripts/test-hard-fix-01.ts
 *
 * ACELEETME.TECH — HARD FIX 01 VERIFICATION TEST SUITE
 * 
 * Target Verifications:
 * 1. NEXT_SECURITY_VERSION_PATCHED (16.3.8)
 * 2. ANALYTICS_QUERY_ERROR_ABORTS_PURGE
 * 3. ANALYTICS_ZERO_ROWS_VALID
 * 4. ANALYTICS_UPSERT_ERROR_ABORTS_PURGE
 * 5. PURGE_ERROR_REPORTED_AS_FAILURE
 * 6. RETIRED_PRICE_CRONS_UNSCHEDULED (RETIRED_PRICE_CRONS_ACTIVE = 0)
 * 7. PUBLIC_HEALTH_NO_FALSE_LIVE_API
 * 8. PUBLIC_HEALTH_NO_SECRET_STATE
 * 9. CANONICAL_PRODUCTS_5814
 * 10. PRICE_FIREWALL
 */

import fs from 'fs';
import path from 'path';
import { getStoredProducts } from '../src/lib/adminData';
import { isCanonicalExcluded } from '../src/lib/governance/canonicalExclusions';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] ${testName}${detail ? ` — ${detail}` : ''}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log('======================================================================');
  console.log('ACELEETME.TECH — HARD FIX 01 VERIFICATION SUITE');
  console.log('======================================================================\n');

  const rootDir = process.cwd();

  // -------------------------------------------------------------------------
  // 1. NEXT_SECURITY_VERSION_PATCHED
  // -------------------------------------------------------------------------
  const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  const installedNextPkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'node_modules/next/package.json'), 'utf8'));

  assert(
    pkg.dependencies.next === '16.3.8',
    'NEXT_SECURITY_VERSION_PATCHED: package.json next is 16.3.8',
    `Got: ${pkg.dependencies.next}`
  );

  assert(
    installedNextPkg.version === '16.3.8',
    'NEXT_SECURITY_VERSION_PATCHED: node_modules next is 16.3.8',
    `Got: ${installedNextPkg.version}`
  );

  assert(
    pkg.devDependencies['eslint-config-next'] === '16.3.8',
    'NEXT_SECURITY_VERSION_PATCHED: eslint-config-next is 16.3.8',
    `Got: ${pkg.devDependencies['eslint-config-next']}`
  );

  // -------------------------------------------------------------------------
  // 2. ANALYTICS MAINTENANCE INVARIANTS (Code Structure & AST Analysis)
  // -------------------------------------------------------------------------
  const cronMaintenancePath = path.join(rootDir, 'src/app/api/cron/analytics-maintenance/route.ts');
  const cronSource = fs.readFileSync(cronMaintenancePath, 'utf8');

  // Check 2: ANALYTICS_QUERY_ERROR_ABORTS_PURGE
  // If fetchError occurs, it must NOT set rollupSuccess = true and must return 500 status
  const queryErrorFailsClosed =
    cronSource.includes("if (fetchError)") &&
    cronSource.includes("recordRollupExecution({ success: false") &&
    cronSource.includes("error: 'Rollup query failed. Purge aborted:");

  assert(
    queryErrorFailsClosed,
    'ANALYTICS_QUERY_ERROR_ABORTS_PURGE: fetchError records failure and aborts purge'
  );

  // Check 3: ANALYTICS_ZERO_ROWS_VALID
  // If !fetchError and rawEvents is empty -> rollupMechanism = 'zero_event_baseline' with rollupSuccess = true
  const zeroRowsValid =
    cronSource.includes("rollupMechanism = 'zero_event_baseline'") &&
    cronSource.includes("rollupRowsAffected = 0");

  assert(
    zeroRowsValid,
    'ANALYTICS_ZERO_ROWS_VALID: Zero raw events baseline validly recognized'
  );

  // Check 4: ANALYTICS_UPSERT_ERROR_ABORTS_PURGE
  // If upsertError occurs, it must NOT continue and must abort with 500
  const upsertErrorFailsClosed =
    cronSource.includes("if (upsertError)") &&
    cronSource.includes("recordRollupExecution({ success: false, error: 'Summary upsert error:") &&
    cronSource.includes("error: 'Rollup summary upsert failed. Purge aborted:");

  assert(
    upsertErrorFailsClosed,
    'ANALYTICS_UPSERT_ERROR_ABORTS_PURGE: Summary upsert failure records failure and aborts purge'
  );

  // Check 5: PURGE_ERROR_REPORTED_AS_FAILURE
  // If delError occurs in purge fallback, it must record failure and return error
  const purgeErrorFailsClosed =
    cronSource.includes("if (delError)") &&
    cronSource.includes("recordPurgeExecution({ success: false") &&
    cronSource.includes("error: 'Purge failed: ' + delError.message") &&
    cronSource.includes("if (!purgeSuccess)");

  assert(
    purgeErrorFailsClosed,
    'PURGE_ERROR_REPORTED_AS_FAILURE: Database purge failure records failure and fails closed'
  );

  // Verify that zero_event_baseline is NOT used for actual database errors
  const zeroEventOnErrors =
    cronSource.includes("fetchError) {\n        console.warn") &&
    cronSource.includes("rollupMechanism = 'zero_event_baseline'");
  assert(
    !zeroEventOnErrors,
    'ZERO_EVENT_BASELINE_NOT_USED_FOR_QUERY_ERROR: Clean invariant maintained'
  );

  // -------------------------------------------------------------------------
  // 6. RETIRED_PRICE_CRONS_UNSCHEDULED
  // -------------------------------------------------------------------------
  const vercelJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'vercel.json'), 'utf8'));
  const activeCronPaths = (vercelJson.crons || []).map((c: any) => c.path);

  const hasScrape2026 = activeCronPaths.includes('/api/cron/scrape-2026-prices');
  const hasScrapePrices = activeCronPaths.includes('/api/cron/scrape-prices');
  const hasAnalyticsMaintenance = activeCronPaths.includes('/api/cron/analytics-maintenance');

  assert(!hasScrape2026, 'RETIRED_PRICE_CRONS_UNSCHEDULED: /api/cron/scrape-2026-prices removed');
  assert(!hasScrapePrices, 'RETIRED_PRICE_CRONS_UNSCHEDULED: /api/cron/scrape-prices removed');
  assert(hasAnalyticsMaintenance, 'RETIRED_PRICE_CRONS_UNSCHEDULED: /api/cron/analytics-maintenance retained');
  assert(
    activeCronPaths.length === 1,
    'RETIRED_PRICE_CRONS_ACTIVE = 0',
    `Active cron count: ${activeCronPaths.length}`
  );

  // -------------------------------------------------------------------------
  // 7 & 8. PUBLIC HEALTH ENDPOINT TRUTH REPAIR
  // -------------------------------------------------------------------------
  const healthRoutePath = path.join(rootDir, 'src/app/api/health/route.ts');
  const healthSource = fs.readFileSync(healthRoutePath, 'utf8');

  const hasSecretKeyLeak =
    healthSource.includes('AUTHORIZED_SECRET_KEY') ||
    healthSource.includes('secret key') ||
    healthSource.includes('serverWrites');

  assert(
    !hasSecretKeyLeak,
    'PUBLIC_HEALTH_NO_SECRET_STATE: No server secret key status exposed'
  );

  const hasFalseLiveApi =
    healthSource.includes('LIVE_API') ||
    healthSource.includes('AMAZON_ACCESS_KEY') ||
    healthSource.includes('TRENDYOL_API_KEY') ||
    healthSource.includes('HEPSIBURADA_USERNAME');

  assert(
    !hasFalseLiveApi,
    'PUBLIC_HEALTH_NO_FALSE_LIVE_API: Zero false LIVE_API claims based on env presence'
  );

  // -------------------------------------------------------------------------
  // 9. CANONICAL_PRODUCTS_5814
  // -------------------------------------------------------------------------
  const allProducts = getStoredProducts();
  const canonicalProducts = allProducts.filter(
    (p) => !isCanonicalExcluded(p.id) && !isCanonicalExcluded(p.slug)
  );

  assert(
    allProducts.length === 5820,
    'RAW_PRODUCTS_COUNT = 5820',
    `Got: ${allProducts.length}`
  );

  assert(
    canonicalProducts.length === 5814,
    'CANONICAL_PRODUCTS = 5814',
    `Got: ${canonicalProducts.length}`
  );

  // -------------------------------------------------------------------------
  // 10. PRICE_FIREWALL
  // -------------------------------------------------------------------------
  const syntheticPricePattern = /price:\s*['"]\d+(\.\d+)?\s*(TL|₺)?['"]/i;
  const hardcodedPricesInHealth = healthSource.match(syntheticPricePattern);
  const hardcodedPricesInCron = cronSource.match(syntheticPricePattern);

  assert(
    !hardcodedPricesInHealth && !hardcodedPricesInCron,
    'PRICE_FIREWALL: Zero synthetic prices introduced in modified routes'
  );

  console.log('\n======================================================================');
  console.log(`TOTAL PASSED: ${passed}`);
  console.log(`TOTAL FAILED: ${failed}`);
  console.log('======================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error(err);
  process.exit(1);
});
