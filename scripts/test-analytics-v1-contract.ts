/**
 * scripts/test-analytics-v1-contract.ts
 *
 * Automated contract and unit test suite for Analytics V1 Application Implementation.
 * Tests Track B requirements under Wave 2.2 governance.
 */

import assert from 'assert';
import {
  trackFunnelEvent,
  getFunnelEvents,
  clearFunnelEvents,
  getOrCreateSessionId,
  resetFunnelSession,
  FunnelEvent
} from '../src/lib/analytics/funnel';
import { POST } from '../src/app/api/telemetry/funnel/route';
import {
  mockTelemetrySink,
  clearMockTelemetrySink,
  SUPABASE_ANALYTICS_ENABLED,
  RATE_LIMIT_CLASSIFICATION
} from '../src/lib/analytics/telemetryRouteState';
import { NextRequest } from 'next/server';

function createMockRequest(body: any, headers: Record<string, string> = {}): NextRequest {
  const url = 'http://localhost:3000/api/telemetry/funnel';
  const bodyText = typeof body === 'string' ? body : JSON.stringify(body);
  return new NextRequest(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: bodyText,
  });
}

async function main() {
  console.log('======================================================================');
  console.log('TEST SUITE: ANALYTICS V1 APPLICATION CONTRACT & PRIVACY BOUNDARY');
  console.log('======================================================================\n');

  clearFunnelEvents();
  clearMockTelemetrySink();
  resetFunnelSession();

  // Test 1: Invariant — Zero Supabase writes in Wave 2.2
  assert.strictEqual(SUPABASE_ANALYTICS_ENABLED, false, 'SUPABASE_ANALYTICS_ENABLED must be strictly false');
  console.log('[PASS] SUPABASE_ANALYTICS_ENABLED = false');

  // Test 1b: Rate limit classification is BEST_EFFORT_LOCAL_PROTECTION
  assert.strictEqual(RATE_LIMIT_CLASSIFICATION, 'BEST_EFFORT_LOCAL_PROTECTION');
  console.log('[PASS] RATE_LIMIT_CLASSIFICATION = BEST_EFFORT_LOCAL_PROTECTION');

  // Test 2: Ephemeral session identifier format and randomness
  resetFunnelSession();
  const sid1 = getOrCreateSessionId();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  assert.ok(uuidRegex.test(sid1), `Session ID ${sid1} must be a valid UUID`);

  const sid1Repeat = getOrCreateSessionId();
  assert.strictEqual(sid1, sid1Repeat, 'Consecutive calls within same session must return identical session ID');

  resetFunnelSession();
  const sid2 = getOrCreateSessionId();
  assert.ok(uuidRegex.test(sid2), `New session ID ${sid2} must be a valid UUID`);
  assert.notStrictEqual(sid1, sid2, 'Resetting session must produce a new cryptographically random UUID');
  console.log('[PASS] SESSION_ID_EPHEMERAL_RANDOM_UUID');

  // Test 2b: Day-boundary rotation guarantee
  // If the browser tab remains open across a date boundary, session ID rotates
  const sidDay1 = getOrCreateSessionId('2026-10-01');
  const sidDay1Repeat = getOrCreateSessionId('2026-10-01');
  assert.strictEqual(sidDay1, sidDay1Repeat, 'Same day must reuse session ID');

  const sidDay2 = getOrCreateSessionId('2026-10-02');
  assert.ok(uuidRegex.test(sidDay2), `Next day session ID must be valid UUID`);
  assert.notStrictEqual(sidDay1, sidDay2, 'Session ID must rotate across calendar day boundary');
  console.log('[PASS] SESSION_DAY_BOUNDARY_SAFE = YES (Automated rotation confirmed)');

  // Reset to live current session for funnel tests
  resetFunnelSession();
  const activeSid = getOrCreateSessionId();

  // Test 3: Track all 5 required events
  const e1 = trackFunnelEvent({
    type: 'landing_view',
    path: '/phones',
    referrerSource: 'direct',
  });
  assert.strictEqual(e1.type, 'landing_view');
  assert.ok(uuidRegex.test(e1.eventId));
  assert.strictEqual(e1.sessionId, activeSid);

  const e2 = trackFunnelEvent({
    type: 'search_performed',
    queryLength: 8,
    resultCount: 14,
    category: 'smartphones',
  });
  assert.strictEqual(e2.type, 'search_performed');
  assert.strictEqual((e2 as any).queryLength, 8);
  assert.strictEqual((e2 as any).resultCount, 14);
  assert.strictEqual((e2 as any).query, undefined, 'Raw search query must NOT exist on event');

  const e3 = trackFunnelEvent({
    type: 'product_view',
    productId: 'huawei-huawei-p60-pro',
    category: 'smartphones',
    hasPrice: false,
  });
  assert.strictEqual(e3.type, 'product_view');

  const e4 = trackFunnelEvent({
    type: 'comparison_started',
    productCount: 2,
    productIds: ['huawei-huawei-p60-pro', 'huawei-huawei-p50-pro'],
    source: 'compare_bar',
  });
  assert.strictEqual(e4.type, 'comparison_started');

  const e5 = trackFunnelEvent({
    type: 'retailer_outbound_click',
    storeId: 'mediamarkt',
    productId: 'huawei-huawei-p60-pro',
    hasVerifiedPrice: false,
    price: null,
  });
  assert.strictEqual(e5.type, 'retailer_outbound_click');

  const inMemory = getFunnelEvents();
  assert.strictEqual(inMemory.length, 5, 'Buffer must contain all 5 tracked events');
  console.log('[PASS] ALL_5_REQUIRED_FUNNEL_EVENTS_RECORDED');

  // Test 4: Route handler valid batch ingestion
  const validBatch = {
    batchId: '11111111-2222-3333-4444-555555555555',
    sentAt: new Date().toISOString(),
    events: [e1, e2, e3, e4, e5],
  };

  const reqValid = createMockRequest(validBatch, { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' });
  const resValid = await POST(reqValid);
  const jsonValid = await resValid.json();

  assert.strictEqual(resValid.status, 200);
  assert.strictEqual(jsonValid.ok, true);
  assert.strictEqual(jsonValid.acceptedEvents, 5);
  assert.strictEqual(jsonValid.supabasePersisted, undefined, 'supabasePersisted must not leak to public clients');
  assert.strictEqual(mockTelemetrySink.length, 1);
  console.log('[PASS] ROUTE_VALID_BATCH_ACCEPTED_TO_MOCK_SINK');

  // Test 5: Bot filtering interface
  const botReq = createMockRequest(validBatch, {
    'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  });
  const botRes = await POST(botReq);
  const botJson = await botRes.json();

  assert.strictEqual(botRes.status, 200);
  assert.strictEqual(botJson.status, 'ignored_bot');
  assert.strictEqual(mockTelemetrySink.length, 1, 'Bot requests must not be recorded in mock sink');
  console.log('[PASS] ROUTE_BOT_FILTER_IGNORES_WITHOUT_LOGGING');

  // Test 6: Rejection of privacy-violating fields (e.g. queryText, rawQuery, ip, email)
  const privacyViolatingBatch = {
    batchId: '22222222-3333-4444-5555-666666666666',
    sentAt: new Date().toISOString(),
    events: [
      {
        ...e2,
        query: 'iPhone 16 Pro Max ucuz',
      },
    ],
  };

  const reqViolating = createMockRequest(privacyViolatingBatch, { 'user-agent': 'Mozilla/5.0' });
  const resViolating = await POST(reqViolating);
  const jsonViolating = await resViolating.json();

  assert.strictEqual(resViolating.status, 400);
  assert.strictEqual(jsonViolating.ok, false);
  assert.ok(jsonViolating.error.includes('Privacy violation'));
  console.log('[PASS] ROUTE_REJECTS_RAW_QUERY_TEXT');

  // Test 7: Rejection of malformed eventId or sessionId
  const malformedBatch = {
    batchId: '33333333-4444-5555-6666-777777777777',
    sentAt: new Date().toISOString(),
    events: [
      {
        ...e1,
        sessionId: 'not-a-valid-uuid',
      },
    ],
  };

  const reqMalformed = createMockRequest(malformedBatch, { 'user-agent': 'Mozilla/5.0' });
  const resMalformed = await POST(reqMalformed);
  const jsonMalformed = await resMalformed.json();

  assert.strictEqual(resMalformed.status, 400);
  assert.strictEqual(jsonMalformed.ok, false);
  assert.ok(jsonMalformed.error.includes('invalid sessionId UUID'));
  console.log('[PASS] ROUTE_REJECTS_INVALID_SESSION_UUID');

  console.log('\n======================================================================');
  console.log('ALL 7 ANALYTICS V1 TESTS PASSED (0 FAILED)');
  console.log('======================================================================');
}

main().catch(err => {
  console.error('[FAIL]', err);
  process.exit(1);
});
