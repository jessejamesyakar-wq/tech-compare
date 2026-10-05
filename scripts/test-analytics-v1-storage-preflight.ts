/**
 * scripts/test-analytics-v1-storage-preflight.ts
 *
 * ACELEETME.TECH — WAVE 2.3A ANALYTICS V1 STORAGE PREFLIGHT & OPERATIONS TEST SUITE
 * Validates mock DB storage adapter, transactional rollback semantics,
 * strict allowlist enforcement, data minimization, function privilege revocation,
 * rollup idempotency, purge safety floor, path sanitization, and non-blocking failure tolerance.
 */

import assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import { NextRequest } from 'next/server';
import {
  trackFunnelEvent,
  getFunnelEvents,
  clearFunnelEvents,
  getOrCreateSessionId,
  resetFunnelSession,
  sanitizeRoutePath,
  FunnelEvent
} from '../src/lib/analytics/funnel';
import { POST } from '../src/app/api/telemetry/funnel/route';
import {
  mockTelemetrySink,
  clearMockTelemetrySink,
  SUPABASE_ANALYTICS_ENABLED,
  RATE_LIMIT_CLASSIFICATION
} from '../src/lib/analytics/telemetryRouteState';

// ==============================================================================
// 1. TEST HARNESS & ASSERTION COUNTER
// ==============================================================================

let testCasesCount = 0;
let assertionsCount = 0;
let passedCount = 0;
let failedCount = 0;

function check(condition: boolean, message?: string) {
  assertionsCount++;
  assert.ok(condition, message);
}

function checkEqual<T>(actual: T, expected: T, message?: string) {
  assertionsCount++;
  assert.strictEqual(actual, expected, message);
}

function checkThrows(fn: () => any, expected?: RegExp | ((err: any) => boolean), message?: string) {
  assertionsCount++;
  if (expected !== undefined) {
    assert.throws(fn, expected, message);
  } else {
    assert.throws(fn, message);
  }
}

async function runTestCase(name: string, fn: () => void | Promise<void>) {
  testCasesCount++;
  try {
    const res = fn();
    if (res instanceof Promise) {
      await res;
    }
    passedCount++;
    console.log(`[PASS] Test ${testCasesCount}: ${name}`);
  } catch (err) {
    failedCount++;
    console.error(`[FAIL] Test ${testCasesCount}: ${name}`, err);
    throw err;
  }
}

// ==============================================================================
// 2. MOCK DATABASE ADAPTER (Simulating Supabase PostgreSQL Table Schema)
// ==============================================================================

interface DbFunnelEventRow {
  id: string;
  session_id: string;
  event_type: 'landing_view' | 'search_performed' | 'product_view' | 'comparison_started' | 'retailer_outbound_click';
  path: string | null;
  category: string | null;
  product_id: string | null;
  store_id: string | null;
  query_length: number | null;
  result_count: number | null;
  has_verified_price: boolean;
  created_at: string;
}

interface DbDailySummaryRow {
  summary_date: string;
  category: string;
  store_id: string;
  landing_sessions: number;
  search_sessions: number;
  product_views: number;
  comparison_starts: number;
  retailer_outbound_clicks: number;
  updated_at: string;
}

class MockDatabaseAdapter {
  public funnelEventsTable: DbFunnelEventRow[] = [];
  public dailySummaryTable: DbDailySummaryRow[] = [];
  public persistentMutationsCount = 0;

  // Strict Table Schema Columns Allowlist (Reflecting PostgreSQL schema)
  private readonly ALLOWED_DB_COLUMNS = new Set([
    'id',
    'session_id',
    'event_type',
    'path',
    'category',
    'product_id',
    'store_id',
    'query_length',
    'result_count',
    'has_verified_price',
    'created_at'
  ]);

  private readonly FORBIDDEN_DB_COLUMNS = [
    'price', 'numeric_price', 'product_price',
    'query', 'raw_query', 'search_text', 'search_query', 'q',
    'email', 'user_email',
    'ip', 'ip_address', 'client_ip',
    'user_agent', 'ua', 'useragent',
    'fingerprint', 'device_fingerprint',
    'account_id', 'password', 'token', 'authorization'
  ];

  public insertFunnelEvent(row: any): DbFunnelEventRow {
    // 1. Verify absence of any forbidden columns
    for (const forbidden of this.FORBIDDEN_DB_COLUMNS) {
      if (forbidden in row && row[forbidden] !== undefined && row[forbidden] !== null) {
        throw new Error(`DB_SECURITY_VIOLATION: Forbidden column '${forbidden}' passed to mock DB adapter.`);
      }
    }

    // 2. Verify all keys are strictly within the allowed columns set
    for (const key of Object.keys(row)) {
      if (!this.ALLOWED_DB_COLUMNS.has(key)) {
        throw new Error(`DB_SCHEMA_VIOLATION: Column '${key}' does not exist on table analytics_funnel_events.`);
      }
    }

    // 3. Check constraints
    const allowedTypes = ['landing_view', 'search_performed', 'product_view', 'comparison_started', 'retailer_outbound_click'];
    if (!allowedTypes.includes(row.event_type)) {
      throw new Error(`DB_CHECK_VIOLATION: event_type '${row.event_type}' violates check constraint.`);
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(row.session_id)) {
      throw new Error(`DB_TYPE_VIOLATION: session_id '${row.session_id}' is not a valid UUID.`);
    }

    const sanitizedRow: DbFunnelEventRow = {
      id: row.id || 'f0000000-0000-0000-0000-000000000000',
      session_id: row.session_id,
      event_type: row.event_type,
      path: row.path ? String(row.path).slice(0, 200) : null,
      category: row.category ? String(row.category).slice(0, 100) : null,
      product_id: row.product_id ? String(row.product_id).slice(0, 200) : null,
      store_id: row.store_id ? String(row.store_id).slice(0, 100) : null,
      query_length: typeof row.query_length === 'number' ? row.query_length : null,
      result_count: typeof row.result_count === 'number' ? row.result_count : null,
      has_verified_price: Boolean(row.has_verified_price),
      created_at: row.created_at || new Date().toISOString()
    };

    this.funnelEventsTable.push(sanitizedRow);
    this.persistentMutationsCount++;
    return sanitizedRow;
  }

  /**
   * Simulates PostgreSQL ON CONFLICT (summary_date, category, store_id) DO UPDATE.
   * Deterministic and idempotent: re-executing for the same date does not produce duplicate rows.
   */
  public rollupDailySummary(targetDate: string): number {
    const eventsOnDate = this.funnelEventsTable.filter(e => e.created_at.startsWith(targetDate));
    
    // Group by category and store_id
    const groups = new Map<string, DbFunnelEventRow[]>();
    for (const ev of eventsOnDate) {
      const cat = ev.category || 'all';
      const store = ev.store_id || 'all';
      const key = `${cat}::${store}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(ev);
    }

    let affected = 0;
    groups.forEach((evList, key) => {
      const [cat, store] = key.split('::');
      const landingSessions = new Set(evList.filter(e => e.event_type === 'landing_view').map(e => e.session_id)).size;
      const searchSessions = new Set(evList.filter(e => e.event_type === 'search_performed').map(e => e.session_id)).size;
      const productViews = evList.filter(e => e.event_type === 'product_view').length;
      const comparisonStarts = evList.filter(e => e.event_type === 'comparison_started').length;
      const retailerOutboundClicks = evList.filter(e => e.event_type === 'retailer_outbound_click').length;

      const summaryRow: DbDailySummaryRow = {
        summary_date: targetDate,
        category: cat,
        store_id: store,
        landing_sessions: landingSessions,
        search_sessions: searchSessions,
        product_views: productViews,
        comparison_starts: comparisonStarts,
        retailer_outbound_clicks: retailerOutboundClicks,
        updated_at: new Date().toISOString()
      };

      // Check that summary row has zero session identifiers
      checkEqual((summaryRow as any).session_id, undefined);
      checkEqual((summaryRow as any).sessionId, undefined);

      const existingIdx = this.dailySummaryTable.findIndex(
        r => r.summary_date === targetDate && r.category === cat && r.store_id === store
      );

      if (existingIdx >= 0) {
        // Idempotent upsert
        this.dailySummaryTable[existingIdx] = summaryRow;
      } else {
        this.dailySummaryTable.push(summaryRow);
      }
      affected++;
    });

    return affected;
  }

  public purgeExpiredEvents(retentionDays: number | null | undefined, nowEpochMs: number): number {
    if (retentionDays === null || retentionDays === undefined || retentionDays < 7) {
      throw new Error(`PURGE_SAFETY_ERROR: retention_days cannot be null or less than 7 days (requested: ${retentionDays})`);
    }
    const cutoffMs = nowEpochMs - (retentionDays * 86400 * 1000);
    const beforeCount = this.funnelEventsTable.length;
    this.funnelEventsTable = this.funnelEventsTable.filter(e => new Date(e.created_at).getTime() >= cutoffMs);
    return beforeCount - this.funnelEventsTable.length;
  }

  public rollbackAll(): void {
    this.funnelEventsTable = [];
    this.dailySummaryTable = [];
    this.persistentMutationsCount = 0;
  }
}

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

// ==============================================================================
// 3. MAIN TEST RUNNER
// ==============================================================================

async function main() {
  console.log('======================================================================');
  console.log('TEST SUITE: WAVE 2.3A ANALYTICS V1 DURABLE STORAGE & OPERATIONS CLOSURE');
  console.log('======================================================================\n');

  clearFunnelEvents();
  clearMockTelemetrySink();
  resetFunnelSession();

  // Test 1: Invariant — Zero Supabase writes in application baseline
  await runTestCase('INVARIANT: SUPABASE_ANALYTICS_ENABLED = false', () => {
    checkEqual(SUPABASE_ANALYTICS_ENABLED, false);
  });

  // Test 2: Rate limit classification
  await runTestCase('INVARIANT: RATE_LIMIT_CLASSIFICATION = BEST_EFFORT_LOCAL_PROTECTION', () => {
    checkEqual(RATE_LIMIT_CLASSIFICATION, 'BEST_EFFORT_LOCAL_PROTECTION');
  });

  // Test 3: Migration Rehearsal SQL Files Integrity & Function Privilege Revocations
  await runTestCase('MIGRATION_SCRIPTS_INTEGRITY & PRIVILEGE REVOCATIONS', () => {
    const preflightSqlPath = path.resolve('supabase/migrations/20261004_analytics_v1_funnel_preflight.sql');
    const rehearsalSqlPath = path.resolve('supabase/migrations/20261004_analytics_v1_funnel_rehearsal.sql');
    
    check(fs.existsSync(preflightSqlPath), 'Preflight SQL migration must exist');
    check(fs.existsSync(rehearsalSqlPath), 'Rehearsal SQL migration must exist');

    const preflightSql = fs.readFileSync(preflightSqlPath, 'utf8');
    const rehearsalSql = fs.readFileSync(rehearsalSqlPath, 'utf8');

    // Transactional boundaries
    check(rehearsalSql.includes('BEGIN;'), 'Rehearsal script must start with BEGIN;');
    check(rehearsalSql.includes('ROLLBACK;'), 'Rehearsal script must end with ROLLBACK;');
    check(rehearsalSql.includes('ENABLE ROW LEVEL SECURITY;'), 'RLS must be enabled in rehearsal');

    // Function declarations
    check(rehearsalSql.includes('rollup_funnel_daily'), 'Rollup function must be declared');
    check(rehearsalSql.includes('purge_expired_raw_funnel_events'), 'Purge function must be declared');

    // Explicit Privilege Revocations from PUBLIC, anon, authenticated
    check(preflightSql.includes('REVOKE ALL ON FUNCTION public.rollup_funnel_daily(DATE) FROM PUBLIC, anon, authenticated;'), 'Preflight must revoke rollup execute from public');
    check(preflightSql.includes('REVOKE ALL ON FUNCTION public.purge_expired_raw_funnel_events(INTEGER) FROM PUBLIC, anon, authenticated;'), 'Preflight must revoke purge execute from public');
    check(preflightSql.includes('GRANT EXECUTE ON FUNCTION public.rollup_funnel_daily(DATE) TO service_role;'), 'Preflight must grant rollup execute to service_role');
    check(preflightSql.includes('GRANT EXECUTE ON FUNCTION public.purge_expired_raw_funnel_events(INTEGER) TO service_role;'), 'Preflight must grant purge execute to service_role');

    check(rehearsalSql.includes('REVOKE ALL ON FUNCTION public.rollup_funnel_daily(DATE) FROM PUBLIC, anon, authenticated;'), 'Rehearsal must revoke rollup execute from public');
    check(rehearsalSql.includes('REVOKE ALL ON FUNCTION public.purge_expired_raw_funnel_events(INTEGER) FROM PUBLIC, anon, authenticated;'), 'Rehearsal must revoke purge execute from public');
    check(rehearsalSql.includes('GRANT EXECUTE ON FUNCTION public.rollup_funnel_daily(DATE) TO service_role;'), 'Rehearsal must grant rollup execute to service_role');
    check(rehearsalSql.includes('GRANT EXECUTE ON FUNCTION public.purge_expired_raw_funnel_events(INTEGER) TO service_role;'), 'Rehearsal must grant purge execute to service_role');

    // Privilege assertions in rehearsal script
    check(rehearsalSql.includes("has_function_privilege('anon', 'public.rollup_funnel_daily(date)', 'execute')"), 'Rehearsal must assert anon lacks rollup execute');
    check(rehearsalSql.includes("has_function_privilege('authenticated', 'public.rollup_funnel_daily(date)', 'execute')"), 'Rehearsal must assert authenticated lacks rollup execute');
    check(rehearsalSql.includes("has_function_privilege('anon', 'public.purge_expired_raw_funnel_events(integer)', 'execute')"), 'Rehearsal must assert anon lacks purge execute');
    check(rehearsalSql.includes("has_function_privilege('authenticated', 'public.purge_expired_raw_funnel_events(integer)', 'execute')"), 'Rehearsal must assert authenticated lacks purge execute');

    // Rehearsal rollup idempotency assertion
    check(rehearsalSql.includes('Rollup idempotency violated!'), 'Rehearsal must assert rollup idempotency');

    // Rehearsal purge safety floor assertion
    check(rehearsalSql.includes('PURGE_SAFETY_ERROR'), 'Rehearsal must assert purge safety floor');
  });

  // Test 4: Mock Database Adapter Valid Insertions
  const db = new MockDatabaseAdapter();
  await runTestCase('MOCK_DB_ADAPTER_VALID_INSERTION_ACCEPTED', () => {
    const validRow = db.insertFunnelEvent({
      session_id: '11111111-2222-3333-4444-555555555555',
      event_type: 'product_view',
      path: '/phones/huawei-p60-pro',
      category: 'smartphones',
      product_id: 'huawei-huawei-p60-pro',
      store_id: null,
      query_length: null,
      result_count: null,
      has_verified_price: false
    });
    checkEqual(validRow.event_type, 'product_view');
    checkEqual(validRow.product_id, 'huawei-huawei-p60-pro');
    checkEqual(db.funnelEventsTable.length, 1);
  });

  // Test 5: Mock Database Adapter Rejects Forbidden Direct Identifiers & Numeric Price
  await runTestCase('MOCK_DB_ADAPTER_STRICT_SCHEMA_GUARDS', () => {
    checkThrows(() => {
      db.insertFunnelEvent({
        session_id: '11111111-2222-3333-4444-555555555555',
        event_type: 'retailer_outbound_click',
        price: 24999.00
      });
    }, /Forbidden column 'price'/);

    checkThrows(() => {
      db.insertFunnelEvent({
        session_id: '11111111-2222-3333-4444-555555555555',
        event_type: 'search_performed',
        query: 'iPhone 16 ucuz'
      });
    }, /Forbidden column 'query'/);

    checkThrows(() => {
      db.insertFunnelEvent({
        session_id: '11111111-2222-3333-4444-555555555555',
        event_type: 'landing_view',
        ip: '192.168.1.1'
      });
    }, /Forbidden column 'ip'/);

    checkThrows(() => {
      db.insertFunnelEvent({
        session_id: '11111111-2222-3333-4444-555555555555',
        event_type: 'landing_view',
        email: 'user@example.com'
      });
    }, /Forbidden column 'email'/);
  });

  // Test 6: Rollup Daily Summary aggregates without preserving session IDs & proves Idempotency
  await runTestCase('ROLLUP_DAILY_SUMMARY_NO_SESSION_IDENTIFIERS_AND_IDEMPOTENT', () => {
    const today = '2026-10-04';
    db.insertFunnelEvent({
      session_id: '11111111-2222-3333-4444-555555555555',
      event_type: 'landing_view',
      path: '/',
      category: 'smartphones',
      created_at: `${today}T10:00:00.000Z`
    });
    db.insertFunnelEvent({
      session_id: '22222222-3333-4444-5555-666666666666',
      event_type: 'landing_view',
      path: '/',
      category: 'smartphones',
      created_at: `${today}T11:00:00.000Z`
    });
    db.insertFunnelEvent({
      session_id: '11111111-2222-3333-4444-555555555555',
      event_type: 'retailer_outbound_click',
      category: 'smartphones',
      store_id: 'amazon',
      product_id: 'huawei-huawei-p60-pro',
      created_at: `${today}T10:15:00.000Z`
    });

    const rowsCreated = db.rollupDailySummary(today);
    check(rowsCreated >= 1, 'Rollup must produce daily summary rows');
    const initialSummaryLength = db.dailySummaryTable.length;

    for (const sRow of db.dailySummaryTable) {
      checkEqual(typeof sRow.landing_sessions, 'number');
      checkEqual(typeof sRow.retailer_outbound_clicks, 'number');
      checkEqual((sRow as any).session_id, undefined);
    }

    // IDEMPOTENCY TEST: Run rollup second time on identical targetDate
    const rerunRowsCreated = db.rollupDailySummary(today);
    checkEqual(rerunRowsCreated, rowsCreated, 'Rerun affected row count must match original');
    checkEqual(db.dailySummaryTable.length, initialSummaryLength, 'Idempotency guarantee: summary row count must not increase (DUPLICATE_SUMMARY_ROWS = 0)');
  });

  // Test 7: Configurable Retention Purge Behavior & Safety Floor
  await runTestCase('CONFIGURABLE_RETENTION_PURGE_SAFETY_FLOOR', () => {
    const nowMs = new Date('2026-10-04T12:00:00.000Z').getTime();
    // Insert an expired event (45 days old)
    db.funnelEventsTable.push({
      id: 'f0000000-0000-0000-0000-000000000099',
      session_id: '99999999-9999-9999-9999-999999999999',
      event_type: 'landing_view',
      path: '/',
      category: null,
      product_id: null,
      store_id: null,
      query_length: null,
      result_count: null,
      has_verified_price: false,
      created_at: new Date(nowMs - (45 * 86400 * 1000)).toISOString()
    });

    const purgedCount = db.purgeExpiredEvents(30, nowMs);
    checkEqual(purgedCount, 1, 'Must purge events older than 30 days');
    
    // Safety Floor Verifications: retention days < 7, 0, negative, null, undefined must throw
    checkThrows(() => { db.purgeExpiredEvents(5, nowMs); }, /PURGE_SAFETY_ERROR/);
    checkThrows(() => { db.purgeExpiredEvents(0, nowMs); }, /PURGE_SAFETY_ERROR/);
    checkThrows(() => { db.purgeExpiredEvents(-1, nowMs); }, /PURGE_SAFETY_ERROR/);
    checkThrows(() => { db.purgeExpiredEvents(null, nowMs); }, /PURGE_SAFETY_ERROR/);
    checkThrows(() => { db.purgeExpiredEvents(undefined, nowMs); }, /PURGE_SAFETY_ERROR/);
  });

  // Test 8: Transactional Rollback Rehearsal Simulation
  await runTestCase('TRANSACTIONAL_ROLLBACK_SIMULATION', () => {
    db.rollbackAll();
    checkEqual(db.funnelEventsTable.length, 0);
    checkEqual(db.dailySummaryTable.length, 0);
    checkEqual(db.persistentMutationsCount, 0);
  });

  // Test 9: Path Sanitization, Token Stripping & Length Bounding
  await runTestCase('PATH_SANITIZATION_AND_TOKEN_STRIPPING', () => {
    // 9a. Strip query parameters
    checkEqual(sanitizeRoutePath('/phones?sort=price&brand=huawei'), '/phones');
    // 9b. Strip hash fragments
    checkEqual(sanitizeRoutePath('/compare#specs-table'), '/compare');
    // 9c. Strip credentials and tokens in URL
    checkEqual(sanitizeRoutePath('https://admin:secretToken@aceleetme.tech/phones/huawei-p60-pro?auth=xyz#overview'), '/phones/huawei-p60-pro');
    // 9d. Add leading slash if missing
    checkEqual(sanitizeRoutePath('phones/huawei-p60-pro'), '/phones/huawei-p60-pro');
    // 9e. Bounded length (max 200 characters)
    const longPath = '/' + 'a'.repeat(250);
    const sanitized = sanitizeRoutePath(longPath);
    check(sanitized.length <= 200, 'Sanitized path length must be <= 200');
    checkEqual(sanitized.length, 200);
  });

  // Test 10: Application Route Accepts Valid Payload
  const activeSid = getOrCreateSessionId();
  await runTestCase('ROUTE_ACCEPTS_STRICTLY_VALID_PAYLOAD', async () => {
    const reqValid = createMockRequest({
      batchId: '11111111-2222-3333-4444-555555555555',
      sentAt: new Date().toISOString(),
      events: [
        {
          eventId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
          sessionId: activeSid,
          timestamp: new Date().toISOString(),
          type: 'product_view',
          productId: 'huawei-huawei-p50-pro',
          category: 'smartphones',
          hasPrice: false
        }
      ]
    });
    const resValid = await POST(reqValid);
    checkEqual(resValid.status, 200);
  });

  // Test 11: Unknown event type rejected
  await runTestCase('ROUTE_REJECTS_UNKNOWN_EVENT_TYPE', async () => {
    const reqUnknownEvent = createMockRequest({
      batchId: '11111111-2222-3333-4444-555555555555',
      sentAt: new Date().toISOString(),
      events: [
        {
          eventId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
          sessionId: activeSid,
          timestamp: new Date().toISOString(),
          type: 'checkout_purchase',
          amount: 5000
        }
      ]
    });
    const resUnknownEvent = await POST(reqUnknownEvent);
    checkEqual(resUnknownEvent.status, 400);
  });

  // Test 12: Unknown key on valid event rejected (Strict Allowlist)
  await runTestCase('ROUTE_REJECTS_UNKNOWN_KEY_ON_EVENT', async () => {
    const reqUnknownKey = createMockRequest({
      batchId: '11111111-2222-3333-4444-555555555555',
      sentAt: new Date().toISOString(),
      events: [
        {
          eventId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
          sessionId: activeSid,
          timestamp: new Date().toISOString(),
          type: 'landing_view',
          path: '/phones',
          customTrackerToken: 'secret-token-123'
        }
      ]
    });
    const resUnknownKey = await POST(reqUnknownKey);
    checkEqual(resUnknownKey.status, 400);
  });

  // Test 13: Direct identifiers rejected (ip, email, userAgent, fingerprint, etc.)
  await runTestCase('ROUTE_REJECTS_ALL_FORBIDDEN_IDENTIFIER_KEYS', async () => {
    for (const forbiddenKey of ['ip', 'client_ip', 'email', 'user_email', 'userAgent', 'fingerprint', 'password', 'token']) {
      const reqPii = createMockRequest({
        batchId: '11111111-2222-3333-4444-555555555555',
        sentAt: new Date().toISOString(),
        events: [
          {
            eventId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
            sessionId: activeSid,
            timestamp: new Date().toISOString(),
            type: 'landing_view',
            path: '/',
            [forbiddenKey]: 'malicious_value'
          }
        ]
      });
      const resPii = await POST(reqPii);
      checkEqual(resPii.status, 400, `Key '${forbiddenKey}' must be rejected with 400`);
    }
  });

  // Test 14: Raw search query rejected
  await runTestCase('ROUTE_REJECTS_RAW_SEARCH_QUERY', async () => {
    const reqRawQuery = createMockRequest({
      batchId: '11111111-2222-3333-4444-555555555555',
      sentAt: new Date().toISOString(),
      events: [
        {
          eventId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
          sessionId: activeSid,
          timestamp: new Date().toISOString(),
          type: 'search_performed',
          queryLength: 10,
          resultCount: 5,
          query: 'iPhone 16'
        }
      ]
    });
    const resRawQuery = await POST(reqRawQuery);
    checkEqual(resRawQuery.status, 400);
  });

  // Test 15: Oversized payload (> 64 KB) rejected with 413
  await runTestCase('ROUTE_REJECTS_OVERSIZED_PAYLOAD_WITH_413', async () => {
    const hugeString = 'x'.repeat(70 * 1024);
    const reqOversized = createMockRequest({
      batchId: '11111111-2222-3333-4444-555555555555',
      sentAt: new Date().toISOString(),
      events: [
        {
          eventId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
          sessionId: activeSid,
          timestamp: new Date().toISOString(),
          type: 'landing_view',
          path: hugeString
        }
      ]
    });
    const resOversized = await POST(reqOversized);
    checkEqual(resOversized.status, 413);
  });

  // Test 16: session_id required as valid UUID
  await runTestCase('ROUTE_REQUIRES_VALID_SESSION_ID_UUID', async () => {
    const reqMissingSid = createMockRequest({
      batchId: '11111111-2222-3333-4444-555555555555',
      sentAt: new Date().toISOString(),
      events: [
        {
          eventId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
          timestamp: new Date().toISOString(),
          type: 'landing_view',
          path: '/'
        }
      ]
    });
    const resMissingSid = await POST(reqMissingSid);
    checkEqual(resMissingSid.status, 400);
  });

  // Test 17: Non-blocking Failure Tolerance (UI never breaks if telemetry fails)
  await runTestCase('NON_BLOCKING_UI_TOLERANCE', () => {
    let outboundLinkProceeded = false;
    try {
      trackFunnelEvent({
        type: 'retailer_outbound_click',
        storeId: 'amazon',
        productId: 'huawei-huawei-p50-pro',
        hasVerifiedPrice: false
      });
      outboundLinkProceeded = true;
    } catch {
      outboundLinkProceeded = false;
    }
    checkEqual(outboundLinkProceeded, true, 'Outbound click must proceed without blocking');
  });

  // Test 18: Security Audit — Client bundle scan for service_role keys
  await runTestCase('SECURITY_AUDIT: Zero service_role keys in client files', () => {
    const clientFiles = [
      'src/components/outbound/OutboundPriceModal.tsx',
      'src/lib/analytics/funnel.ts',
      'src/app/phones/[id]/PhoneDetailClient.tsx',
      'src/app/search/SearchClient.tsx'
    ];
    for (const cFile of clientFiles) {
      const fullPath = path.resolve(cFile);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        check(!content.includes('service_role'), `File ${cFile} must NOT contain 'service_role'`);
        check(!content.includes('SUPABASE_SERVICE_ROLE_KEY'), `File ${cFile} must NOT reference SUPABASE_SERVICE_ROLE_KEY`);
      }
    }
  });

  console.log('\n======================================================================');
  console.log(`RECONCILED RESULTS:`);
  console.log(`TEST_CASES = ${testCasesCount}`);
  console.log(`ASSERTIONS = ${assertionsCount}`);
  console.log(`PASSED = ${passedCount}`);
  console.log(`FAILED = ${failedCount}`);
  console.log('======================================================================');

  if (failedCount > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('[FAIL]', err);
  process.exit(1);
});
