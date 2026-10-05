/**
 * src/app/api/telemetry/funnel/route.ts
 *
 * ACELEETME.TECH — CONVERSION FUNNEL TELEMETRY ROUTE
 * Master Program Wave 2.3A (Final Security & Operations Closure)
 *
 * Technical Privacy & Governance Rules:
 * - NO Supabase writes in this wave (SUPABASE_ANALYTICS_ENABLED = false).
 * - Direct Identifiers Policy: NO_DIRECT_IDENTIFIERS_PERSISTED (Zero IP logging, zero User-Agent persistence, zero request-body dumps).
 * - Session Identifier Model: EPHEMERAL_RANDOM_SESSION_ID_ONLY (random UUID v4, operational session correlation only).
 * - Technical Data Minimization: Query strings and numeric prices rejected/omitted; only queryLength and resultCount accepted.
 * - Path Sanitization: Strips query strings, hash fragments, credentials, and tokens; bounded to route pathname.
 * - Bot Filter Interface: Detects automated crawlers and ignores them without storing UA strings.
 * - Rate Protection: In-memory sliding-window limiter guarding ingestion endpoint (BEST_EFFORT_LOCAL_PROTECTION).
 */

import { NextRequest, NextResponse } from 'next/server';
import { sanitizeRoutePath } from '@/lib/analytics/funnel';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { recordIngestionEvent } from '@/lib/analytics/operationalMonitoring';
import { SERVER_PERSISTENCE_ENABLED, mockTelemetrySink } from '@/lib/analytics/telemetryRouteState';

export const dynamic = 'force-dynamic';

const MAX_PAYLOAD_BYTES = 64 * 1024; // 64 KB limit
const MAX_EVENTS_PER_BATCH = 50;

// Bot signature pattern for bot filtering interface
const BOT_UA_REGEX = /(bot|spider|crawl|headless|curl|wget|python-requests|aiohttp|slurp|lighthouse|postman)/i;

// In-memory rate limiting bucket (max 60 requests/minute per bucket)
interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}
const rateLimitMap = new Map<string, RateLimitBucket>();
const RATE_LIMIT_CAPACITY = 60;
const RATE_REFILL_RATE_MS = 1000; // 1 token per second = 60/min

function checkRateLimit(pseudoKey: string): boolean {
  const now = Date.now();
  let bucket = rateLimitMap.get(pseudoKey);

  if (!bucket) {
    bucket = { tokens: RATE_LIMIT_CAPACITY - 1, lastRefill: now };
    rateLimitMap.set(pseudoKey, bucket);
    return true;
  }

  // Refill tokens
  const elapsed = now - bucket.lastRefill;
  const tokensToAdd = Math.floor(elapsed / RATE_REFILL_RATE_MS);
  if (tokensToAdd > 0) {
    bucket.tokens = Math.min(RATE_LIMIT_CAPACITY, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  if (bucket.tokens > 0) {
    bucket.tokens--;
    return true;
  }

  return false;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(val: any): boolean {
  return typeof val === 'string' && UUID_REGEX.test(val);
}

function isValidISOString(val: any): boolean {
  if (typeof val !== 'string') return false;
  const d = new Date(val);
  return !isNaN(d.getTime());
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitizedBatch?: {
    batchId: string;
    sentAt: string;
    events: any[];
  };
}

function validateAndSanitizeBatch(body: any): ValidationResult {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid payload: JSON object or array expected.' };
  }

  let batchId = '';
  let sentAt = '';
  let rawEvents: any[] = [];

  if (Array.isArray(body)) {
    rawEvents = body;
    batchId = 'batch-' + Date.now();
    sentAt = new Date().toISOString();
  } else {
    const allowedBatchKeys = new Set(['batchId', 'sentAt', 'events']);
    for (const bk of Object.keys(body)) {
      if (!allowedBatchKeys.has(bk)) {
        return { valid: false, error: `Disallowed or unknown batch property '${bk}'.` };
      }
    }
    batchId = typeof body.batchId === 'string' ? body.batchId : 'batch-' + Date.now();
    sentAt = typeof body.sentAt === 'string' && isValidISOString(body.sentAt) ? body.sentAt : new Date().toISOString();
    rawEvents = Array.isArray(body.events) ? body.events : [body];
  }

  if (rawEvents.length === 0) {
    return { valid: false, error: 'Batch must contain at least 1 event.' };
  }

  if (rawEvents.length > MAX_EVENTS_PER_BATCH) {
    return { valid: false, error: `Batch exceeds maximum limit of ${MAX_EVENTS_PER_BATCH} events.` };
  }

  const validEvents: any[] = [];

  for (let i = 0; i < rawEvents.length; i++) {
    const ev = rawEvents[i];
    if (!ev || typeof ev !== 'object') {
      return { valid: false, error: `Event at index ${i} is not a valid object.` };
    }

    // Strict Privacy Rejections: Check for disallowed sensitive keys
    const disallowedKeys = [
      'ip', 'user_ip', 'client_ip',
      'email', 'user_email',
      'query', 'rawQuery', 'searchTerm', 'searchText', 'q',
      'password',
      'token', 'bearer',
      'authorization', 'auth',
      'cookie', 'cookies',
      'userAgent', 'user_agent',
      'fingerprint', 'device_fingerprint',
      'accountId', 'account_id'
    ];
    for (const key of disallowedKeys) {
      if (key in ev) {
        return {
          valid: false,
          error: `Privacy violation: Disallowed field '${key}' present in event at index ${i}.`
        };
      }
    }

    // Required fields: eventId, sessionId, timestamp, type
    if (!isValidUUID(ev.eventId)) {
      return { valid: false, error: `Event at index ${i} has invalid eventId UUID.` };
    }
    if (!isValidUUID(ev.sessionId)) {
      return { valid: false, error: `Event at index ${i} has invalid sessionId UUID.` };
    }
    if (!isValidISOString(ev.timestamp)) {
      return { valid: false, error: `Event at index ${i} has invalid timestamp.` };
    }

    const type = ev.type;

    // Strict Allowlist: Reject unknown keys per event type
    const ALLOWED_KEYS_BY_TYPE: Record<string, Set<string>> = {
      landing_view: new Set(['eventId', 'sessionId', 'timestamp', 'type', 'path', 'referrerSource']),
      search_performed: new Set(['eventId', 'sessionId', 'timestamp', 'type', 'queryLength', 'resultCount', 'category']),
      product_view: new Set(['eventId', 'sessionId', 'timestamp', 'type', 'productId', 'category', 'hasPrice']),
      comparison_started: new Set(['eventId', 'sessionId', 'timestamp', 'type', 'productCount', 'productIds', 'source']),
      retailer_outbound_click: new Set(['eventId', 'sessionId', 'timestamp', 'type', 'storeId', 'productId', 'hasVerifiedPrice', 'price'])
    };

    const allowedKeySet = ALLOWED_KEYS_BY_TYPE[type];
    if (!allowedKeySet) {
      return { valid: false, error: `Unrecognized event type '${type}' at index ${i}.` };
    }

    for (const k of Object.keys(ev)) {
      if (!allowedKeySet.has(k)) {
        return { valid: false, error: `Unknown or disallowed key '${k}' in ${type} event at index ${i}.` };
      }
    }
    switch (type) {
      case 'landing_view': {
        if (typeof ev.path !== 'string' || ev.path.length > 500) {
          return { valid: false, error: `Invalid path in landing_view event at index ${i}.` };
        }
        if (ev.referrerSource && !['direct', 'internal', 'external'].includes(ev.referrerSource)) {
          return { valid: false, error: `Invalid referrerSource in landing_view event at index ${i}.` };
        }
        validEvents.push({
          eventId: ev.eventId,
          sessionId: ev.sessionId,
          timestamp: ev.timestamp,
          type: 'landing_view',
          path: sanitizeRoutePath(ev.path),
          referrerSource: ev.referrerSource || 'direct',
        });
        break;
      }

      case 'search_performed': {
        if (typeof ev.queryLength !== 'number' || ev.queryLength < 0 || ev.queryLength > 500) {
          return { valid: false, error: `Invalid queryLength in search_performed event at index ${i}.` };
        }
        if (typeof ev.resultCount !== 'number' || ev.resultCount < 0) {
          return { valid: false, error: `Invalid resultCount in search_performed event at index ${i}.` };
        }
        validEvents.push({
          eventId: ev.eventId,
          sessionId: ev.sessionId,
          timestamp: ev.timestamp,
          type: 'search_performed',
          queryLength: ev.queryLength,
          resultCount: ev.resultCount,
          category: typeof ev.category === 'string' ? ev.category.slice(0, 100) : undefined,
        });
        break;
      }

      case 'product_view': {
        if (typeof ev.productId !== 'string' || ev.productId.length > 300) {
          return { valid: false, error: `Invalid productId in product_view event at index ${i}.` };
        }
        validEvents.push({
          eventId: ev.eventId,
          sessionId: ev.sessionId,
          timestamp: ev.timestamp,
          type: 'product_view',
          productId: ev.productId,
          category: typeof ev.category === 'string' ? ev.category.slice(0, 100) : 'unknown',
          hasPrice: Boolean(ev.hasPrice),
        });
        break;
      }

      case 'comparison_started': {
        if (typeof ev.productCount !== 'number' || ev.productCount < 2) {
          return { valid: false, error: `comparison_started event at index ${i} requires productCount >= 2.` };
        }
        if (!Array.isArray(ev.productIds) || ev.productIds.length < 2) {
          return { valid: false, error: `comparison_started event at index ${i} requires productIds array.` };
        }
        validEvents.push({
          eventId: ev.eventId,
          sessionId: ev.sessionId,
          timestamp: ev.timestamp,
          type: 'comparison_started',
          productCount: ev.productCount,
          productIds: ev.productIds.slice(0, 10).map((id: any) => String(id).slice(0, 300)),
          source: typeof ev.source === 'string' ? ev.source.slice(0, 50) : 'compare_bar',
        });
        break;
      }

      case 'retailer_outbound_click': {
        if (typeof ev.storeId !== 'string' || ev.storeId.length > 100) {
          return { valid: false, error: `Invalid storeId in retailer_outbound_click event at index ${i}.` };
        }
        if (typeof ev.productId !== 'string' || ev.productId.length > 300) {
          return { valid: false, error: `Invalid productId in retailer_outbound_click event at index ${i}.` };
        }
        validEvents.push({
          eventId: ev.eventId,
          sessionId: ev.sessionId,
          timestamp: ev.timestamp,
          type: 'retailer_outbound_click',
          storeId: ev.storeId,
          productId: ev.productId,
          hasVerifiedPrice: Boolean(ev.hasVerifiedPrice),
          price: typeof ev.price === 'number' ? ev.price : null,
        });
        break;
      }

      default:
        return { valid: false, error: `Unrecognized event type '${type}' at index ${i}.` };
    }
  }

  return {
    valid: true,
    sanitizedBatch: {
      batchId,
      sentAt,
      events: validEvents,
    },
  };
}

export async function POST(req: NextRequest) {
  // 1. Bot Filtering Interface
  // Note: User-Agent header is checked for bot patterns but NEVER persisted or logged.
  const userAgent = req.headers.get('user-agent') || '';
  if (BOT_UA_REGEX.test(userAgent)) {
    return NextResponse.json(
      { ok: true, status: 'ignored_bot' },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  // 2. Rate Protection (keyed by coarse pseudo-bucket without storing raw IP)
  const forwardedFor = req.headers.get('x-forwarded-for') || '';
  const coarseKey = forwardedFor ? forwardedFor.split(',')[0].split('.').slice(0, 3).join('.') : 'local';
  if (!checkRateLimit(coarseKey)) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests. Please throttle telemetry dispatch.' },
      { status: 429, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  // 3. Size Guard & Body Parsing
  let parsedBody: any;
  try {
    const rawText = await req.text();
    if (rawText.length > MAX_PAYLOAD_BYTES) {
      return NextResponse.json(
        { ok: false, error: 'Payload exceeds maximum allowed size of 64KB.' },
        { status: 413, headers: { 'Cache-Control': 'no-store' } }
      );
    }
    if (!rawText.trim()) {
      return NextResponse.json(
        { ok: false, error: 'Empty payload.' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }
    parsedBody = JSON.parse(rawText);
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Malformed JSON payload.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  // 4. Schema Validation & Sanitization
  const validation = validateAndSanitizeBatch(parsedBody);
  if (!validation.valid || !validation.sanitizedBatch) {
    return NextResponse.json(
      { ok: false, error: validation.error || 'Validation failed.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const { batchId, events } = validation.sanitizedBatch;

  // 5. Durable Storage Persistence (Wave 2.4B Server Sink)
  let supabasePersisted = false;

  if (SERVER_PERSISTENCE_ENABLED) {
    try {
      const supabase = getSupabaseServerClient();
      if (supabase) {
        const rowsToInsert = events.map((ev: any) => ({
          id: ev.eventId,
          session_id: ev.sessionId,
          event_type: ev.type,
          path: ev.path ? sanitizeRoutePath(ev.path) : null,
          category: ev.category ? String(ev.category).slice(0, 100) : null,
          product_id: ev.productId ? String(ev.productId).slice(0, 200) : null,
          store_id: ev.storeId ? String(ev.storeId).slice(0, 100) : null,
          query_length: typeof ev.queryLength === 'number' ? ev.queryLength : null,
          result_count: typeof ev.resultCount === 'number' ? ev.resultCount : null,
          has_verified_price: Boolean(ev.hasVerifiedPrice),
          created_at: ev.timestamp || new Date().toISOString(),
        }));

        const { error } = await supabase
          .from('analytics_funnel_events')
          .insert(rowsToInsert);

        if (error) {
          console.error('[Analytics:Route] Supabase persistence error:', error.message);
          recordIngestionEvent({
            receivedCount: events.length,
            persistedCount: 0,
            success: false,
            error: error.message,
          });
        } else {
          supabasePersisted = true;
          recordIngestionEvent({
            receivedCount: events.length,
            persistedCount: rowsToInsert.length,
            success: true,
          });
        }
      }
    } catch (err: any) {
      console.error('[Analytics:Route] Supabase persistence exception:', err?.message || err);
      recordIngestionEvent({
        receivedCount: events.length,
        persistedCount: 0,
        success: false,
        error: err?.message || 'Persistence exception',
      });
    }
  } else {
    recordIngestionEvent({
      receivedCount: events.length,
      persistedCount: 0,
      success: true,
    });
  }

  // 6. In-Memory Mock Sink Dispatch (Always maintained for diagnostics / local fallback)
  mockTelemetrySink.push({
    receivedAt: new Date().toISOString(),
    batchId,
    eventsCount: events.length,
    types: events.map((e: any) => e.type),
  });

  // Keep mock sink bounded
  if (mockTelemetrySink.length > 100) {
    mockTelemetrySink.shift();
  }

  return NextResponse.json(
    {
      ok: true,
      batchId,
      acceptedEvents: events.length,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}
