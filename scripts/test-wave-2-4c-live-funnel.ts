import assert from 'node:assert/strict';
import crypto from 'node:crypto';

async function main() {
  console.log('======================================================================');
  console.log('🛡️  ACELEETME.TECH — WAVE 2.4C: LIVE PRODUCTION FUNNEL VALIDATION  🛡️');
  console.log('======================================================================\n');

  const endpoint = 'https://www.aceleetme.tech/api/telemetry/funnel';

  // 1. Session 1: Full 5-stage funnel
  const session1Id = crypto.randomUUID();
  const event1_landing = crypto.randomUUID();
  const event1_search = crypto.randomUUID();
  const event1_product = crypto.randomUUID();
  const event1_compare = crypto.randomUUID();
  const event1_outbound = crypto.randomUUID();

  const now = new Date().toISOString();

  const session1Batch = {
    batchId: 'wave-2-4c-session-1-' + Date.now(),
    sentAt: now,
    events: [
      {
        eventId: event1_landing,
        sessionId: session1Id,
        timestamp: now,
        type: 'landing_view',
        path: '/',
        referrerSource: 'direct'
      },
      {
        eventId: event1_search,
        sessionId: session1Id,
        timestamp: now,
        type: 'search_performed',
        queryLength: 6,
        resultCount: 14,
        category: 'smartphones'
      },
      {
        eventId: event1_product,
        sessionId: session1Id,
        timestamp: now,
        type: 'product_view',
        productId: 'apple-apple-iphone-16-pro-max-256-gb-952387',
        category: 'smartphones',
        hasPrice: true
      },
      {
        eventId: event1_compare,
        sessionId: session1Id,
        timestamp: now,
        type: 'comparison_started',
        productCount: 2,
        productIds: [
          'apple-apple-iphone-16-pro-max-256-gb-952387',
          'samsung-galaxy-s24-ultra'
        ],
        source: 'compare_bar'
      },
      {
        eventId: event1_outbound,
        sessionId: session1Id,
        timestamp: now,
        type: 'retailer_outbound_click',
        storeId: 'vatan',
        productId: 'apple-apple-iphone-16-pro-max-256-gb-952387',
        hasVerifiedPrice: true,
        price: 119999
      }
    ]
  };

  console.log('--- 1. DISPATCHING 5-STAGE FUNNEL BATCH (SESSION 1) ---');
  const res1 = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AceleetmeValidation/2.4C'
    },
    body: JSON.stringify(session1Batch)
  });

  console.log('Session 1 HTTP Status:', res1.status);
  const json1 = await res1.json();
  console.log('Session 1 Response:', JSON.stringify(json1));
  assert.strictEqual(res1.status, 200, 'Batch 1 HTTP 200');
  assert.strictEqual(json1.ok, true, 'Batch 1 ok = true');
  assert.strictEqual(json1.acceptedEvents, 5, 'Batch 1 accepted 5 events');
  assert.strictEqual(json1.supabasePersisted, undefined, 'No supabasePersisted in response');
  assert.strictEqual('databaseError' in json1, false, 'No databaseError exposed');

  // 2. Session 2: Distinct Session Correlation
  const session2Id = crypto.randomUUID();
  assert.notStrictEqual(session1Id, session2Id, 'Session IDs must be distinct');

  const session2Batch = {
    batchId: 'wave-2-4c-session-2-' + Date.now(),
    sentAt: new Date().toISOString(),
    events: [
      {
        eventId: crypto.randomUUID(),
        sessionId: session2Id,
        timestamp: new Date().toISOString(),
        type: 'landing_view',
        path: '/search?q=samsung',
        referrerSource: 'internal'
      },
      {
        eventId: crypto.randomUUID(),
        sessionId: session2Id,
        timestamp: new Date().toISOString(),
        type: 'search_performed',
        queryLength: 7,
        resultCount: 8,
        category: 'smartphones'
      }
    ]
  };

  console.log('\n--- 2. DISPATCHING DISTINCT SESSION BATCH (SESSION 2) ---');
  const res2 = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AceleetmeValidation/2.4C'
    },
    body: JSON.stringify(session2Batch)
  });

  console.log('Session 2 HTTP Status:', res2.status);
  const json2 = await res2.json();
  console.log('Session 2 Response:', JSON.stringify(json2));
  assert.strictEqual(res2.status, 200, 'Batch 2 HTTP 200');
  assert.strictEqual(json2.ok, true, 'Batch 2 ok = true');
  assert.strictEqual(json2.acceptedEvents, 2, 'Batch 2 accepted 2 events');

  // 3. Privacy & Data Minimization Invariant: Disallowed properties rejected
  console.log('\n--- 3. TESTING PRIVACY VIOLATION REJECTION ---');
  const forbiddenPayload = {
    batchId: 'forbidden-test',
    sentAt: new Date().toISOString(),
    events: [
      {
        eventId: crypto.randomUUID(),
        sessionId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'landing_view',
        path: '/',
        ip: '192.168.1.1' // Forbidden PII
      }
    ]
  };

  const resForbidden = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(forbiddenPayload)
  });
  console.log('Forbidden Payload HTTP Status:', resForbidden.status);
  assert.strictEqual(resForbidden.status, 400, 'Must reject payloads containing IP/PII with HTTP 400');

  // 4. Raw Search Query Text Rejection
  const forbiddenQueryPayload = {
    batchId: 'forbidden-query-test',
    sentAt: new Date().toISOString(),
    events: [
      {
        eventId: crypto.randomUUID(),
        sessionId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'search_performed',
        query: 'secret iphone query', // Forbidden raw query
        queryLength: 19,
        resultCount: 5
      }
    ]
  };

  const resForbiddenQuery = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(forbiddenQueryPayload)
  });
  console.log('Forbidden Query Payload HTTP Status:', resForbiddenQuery.status);
  assert.strictEqual(resForbiddenQuery.status, 400, 'Must reject payloads containing raw search queries');

  console.log('\n======================================================================');
  console.log('✅ ALL LIVE PRODUCTION FUNNEL & PRIVACY VALIDATION TESTS PASSED');
  console.log('======================================================================\n');
}

main().catch(err => {
  console.error('[FAIL]', err);
  process.exit(1);
});
