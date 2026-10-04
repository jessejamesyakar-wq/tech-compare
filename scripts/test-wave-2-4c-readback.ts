import assert from 'node:assert/strict';

async function main() {
  console.log('======================================================================');
  console.log('🛡️  ACELEETME.TECH — WAVE 2.4C: LIVE SCHEMA & FIREWALL READBACK  🛡️');
  console.log('======================================================================\n');

  const key = 'sb_publishable_A5339Ld8oXFcU0OzdXdqCw_G1excd4Q';
  const base = 'https://yynqtjddwnrphugnjatq.supabase.co/rest/v1';
  const headers = { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact' };

  // 1. Core tables readback
  const [prodRes, storeRes, spRes, priceRes, histRes, chanRes] = await Promise.all([
    fetch(`${base}/products?select=*`, { method: 'HEAD', headers }),
    fetch(`${base}/stores?select=*`, { method: 'HEAD', headers }),
    fetch(`${base}/store_products?select=*`, { method: 'HEAD', headers }),
    fetch(`${base}/prices?select=*`, { method: 'HEAD', headers }),
    fetch(`${base}/price_history?select=*`, { method: 'HEAD', headers }),
    fetch(`${base}/retailer_access_channels?select=*`, { method: 'HEAD', headers })
  ]);

  const actualProducts = prodRes.headers.get('content-range')?.split('/')[1];
  const actualStores = storeRes.headers.get('content-range')?.split('/')[1];
  const actualStoreProducts = spRes.headers.get('content-range')?.split('/')[1];
  const actualPrices = priceRes.headers.get('content-range')?.split('/')[1];
  const actualPriceHistory = histRes.headers.get('content-range')?.split('/')[1];

  console.log(`ACTUAL_PRODUCTS = ${actualProducts} (Expected: 5814)`);
  console.log(`ACTUAL_STORES = ${actualStores} (Expected: 8)`);
  console.log(`ACTUAL_STORE_PRODUCTS = ${actualStoreProducts} (Expected: 4)`);
  console.log(`ACTUAL_PRICES = ${actualPrices} (Expected: 1)`);
  console.log(`ACTUAL_PRICE_HISTORY = ${actualPriceHistory} (Expected: 1)`);
  console.log(`CHANNELS_STATUS = ${chanRes.status} (Protected via RLS: 401 Unauthorized)`);

  assert.strictEqual(actualProducts, '5814', 'Products count mismatch');
  assert.strictEqual(actualStores, '8', 'Stores count mismatch');
  assert.strictEqual(actualStoreProducts, '4', 'Store products count mismatch');
  assert.strictEqual(actualPrices, '1', 'Prices count mismatch');
  assert.strictEqual(actualPriceHistory, '1', 'Price history count mismatch');
  assert.strictEqual(chanRes.status, 401, 'Retailer channels must deny public access with 401');

  // 2. PostgREST Security Readback (Anon / Public access denied)
  // RPC Rollup denied to public/anon
  const rollupRpcRes = await fetch(`${base}/rpc/rollup_funnel_daily`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_target_date: '2026-10-04' })
  });
  console.log(`PUBLIC_RPC_ROLLUP_STATUS = ${rollupRpcRes.status} (Expected: 404 / PGRST202 - Denied/Hidden)`);
  assert.ok(rollupRpcRes.status === 404 || rollupRpcRes.status === 401 || rollupRpcRes.status === 403);

  // RPC Purge denied to public/anon
  const purgeRpcRes = await fetch(`${base}/rpc/purge_expired_raw_funnel_events`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_retention_days: 30 })
  });
  console.log(`PUBLIC_RPC_PURGE_STATUS = ${purgeRpcRes.status} (Expected: 404 / PGRST202 - Denied/Hidden)`);
  assert.ok(purgeRpcRes.status === 404 || purgeRpcRes.status === 401 || purgeRpcRes.status === 403);

  // Raw events table direct access denied to public/anon
  const eventsTableRes = await fetch(`${base}/analytics_funnel_events`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_type: 'landing_view' })
  });
  console.log(`ANON_TABLE_EVENTS_STATUS = ${eventsTableRes.status} (Expected: 404 / 401 - Denied/Hidden)`);
  assert.ok(eventsTableRes.status === 404 || eventsTableRes.status === 401 || eventsTableRes.status === 403);

  // Summary table direct access denied to public/anon
  const summaryTableRes = await fetch(`${base}/analytics_funnel_daily_summary`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ summary_date: '2026-10-04' })
  });
  console.log(`ANON_TABLE_SUMMARY_STATUS = ${summaryTableRes.status} (Expected: 404 / 401 - Denied/Hidden)`);
  assert.ok(summaryTableRes.status === 404 || summaryTableRes.status === 401 || summaryTableRes.status === 403);

  console.log('\n======================================================================');
  console.log('✅ ALL READ-ONLY SECURITY AND FIREWALL ASSERTIONS PASSED');
  console.log('======================================================================\n');
}

main().catch(err => {
  console.error('[FAIL]', err);
  process.exit(1);
});
