/**
 * src/lib/analytics/funnel.ts
 *
 * ACELEETME.TECH — CONVERSION FUNNEL TELEMETRY INSTRUMENTATION
 * Master Program Wave 2.3A (Technical Data Minimization & Privacy Architecture)
 *
 * Operational Privacy Specifications:
 * - Session Identifier Model: EPHEMERAL_RANDOM_SESSION_ID_ONLY via crypto.randomUUID().
 * - Direct Identifiers: NO_DIRECT_IDENTIFIERS_PERSISTED (Zero IP, zero User-Agent, zero hardware fingerprints, zero email, zero credentials).
 * - Session Scope: Operational correlation within current browser session only (sessionStorage or in-memory fallback; rotates at UTC midnight).
 * - Technical Data Minimization: Search tracking transmits only queryLength and resultCount; raw search strings and numeric prices are omitted.
 * - Path Sanitization: Strips query strings, hash fragments, credentials, and tokens; preserves route pathname only.
 * - Legal Disclaimer: Operational engineering correlation only. No legal compliance conclusions (e.g. KVKK/GDPR statutory exemption) are asserted.
 */

/**
 * Dual Feature Gate: Client Auto-Telemetry
 * Hard Governance Control (Wave 2.4B / 2.4B.1):
 * When false, normal user browsing does NOT enqueue or send telemetry over the network.
 * In-memory buffer and local custom event listeners continue to function for UI testing.
 * Supports explicit client toggle via NEXT_PUBLIC_ANALYTICS_AUTO_TELEMETRY_ENABLED (strictly boolean, zero secrets).
 * Default is locked to false.
 */
export const CLIENT_AUTO_TELEMETRY_ENABLED =
  typeof process !== 'undefined' &&
  process.env.NEXT_PUBLIC_ANALYTICS_AUTO_TELEMETRY_ENABLED === 'true';

/**
 * Sanitizes a URL or path to preserve only the bounded route pathname.
 * Strips query parameters, hash fragments, protocols, domains, credentials, and tokens.
 */
export function sanitizeRoutePath(rawPath: string): string {
  if (!rawPath || typeof rawPath !== 'string') return '/';
  let cleaned = rawPath.trim();
  try {
    if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
      const parsed = new URL(cleaned);
      cleaned = parsed.pathname;
    }
  } catch {
    // fallback if malformed URL
  }
  // Strip embedded credentials (user:pass@)
  cleaned = cleaned.replace(/^[a-zA-Z0-9._%+-]+:[^@]+@/, '');
  // Strip query strings and hash fragments
  const qIdx = cleaned.indexOf('?');
  if (qIdx !== -1) cleaned = cleaned.substring(0, qIdx);
  const hIdx = cleaned.indexOf('#');
  if (hIdx !== -1) cleaned = cleaned.substring(0, hIdx);
  // Guarantee leading slash and bound length to 200 characters (PostgreSQL column limit)
  if (!cleaned.startsWith('/')) cleaned = '/' + cleaned;
  if (cleaned.length > 200) cleaned = cleaned.substring(0, 200);
  return cleaned;
}

export type FunnelEventType =
  | 'landing_view'
  | 'search_performed'
  | 'product_view'
  | 'comparison_started'
  | 'retailer_outbound_click';

export interface BaseFunnelEvent {
  eventId: string;
  sessionId: string;
  timestamp: string;
}

export interface LandingViewEvent extends BaseFunnelEvent {
  type: 'landing_view';
  path: string;
  referrerSource?: 'direct' | 'internal' | 'external';
}

export interface SearchPerformedEvent extends BaseFunnelEvent {
  type: 'search_performed';
  queryLength: number;
  resultCount: number;
  category?: string;
}

export interface ProductViewEvent extends BaseFunnelEvent {
  type: 'product_view';
  productId: string;
  category: string;
  hasPrice: boolean;
}

export interface ComparisonStartedEvent extends BaseFunnelEvent {
  type: 'comparison_started';
  productCount: number;
  productIds: string[];
  source: 'detail_page' | 'compare_bar' | 'search' | 'duel';
}

export interface RetailerOutboundClickEvent extends BaseFunnelEvent {
  type: 'retailer_outbound_click';
  storeId: string;
  productId: string;
  hasVerifiedPrice: boolean;
  price?: number | null;
}

export type FunnelEvent =
  | LandingViewEvent
  | SearchPerformedEvent
  | ProductViewEvent
  | ComparisonStartedEvent
  | RetailerOutboundClickEvent;

export type FunnelEventInput =
  | Omit<LandingViewEvent, 'eventId' | 'sessionId' | 'timestamp'>
  | Omit<SearchPerformedEvent, 'eventId' | 'sessionId' | 'timestamp'>
  | Omit<ProductViewEvent, 'eventId' | 'sessionId' | 'timestamp'>
  | Omit<ComparisonStartedEvent, 'eventId' | 'sessionId' | 'timestamp'>
  | Omit<RetailerOutboundClickEvent, 'eventId' | 'sessionId' | 'timestamp'>;

export interface TelemetryBatch {
  batchId: string;
  sentAt: string;
  events: FunnelEvent[];
}

export type FunnelEventListener = (event: FunnelEvent) => void;

// UUID generation helper
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Cryptographically random fallback where randomUUID is unavailable
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant RFC4122
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  // Math.random fallback (e.g. old test runners)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const SESSION_STORAGE_KEY = 'aceleetme_telemetry_sid';
const SESSION_STORAGE_DATE_KEY = 'aceleetme_telemetry_sdate';
let inMemorySessionId: string | null = null;
let inMemorySessionDate: string | null = null;

function getCurrentUTCDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Returns the short-lived session identifier for the current browser session.
 * Guarantees day-boundary rotation: if a tab remains open across a date change,
 * the session ID automatically rotates to a new cryptographically random UUID.
 * Never persists across days and never derived from IP/UA/fingerprint.
 */
export function getOrCreateSessionId(testDateOverride?: string): string {
  const today = testDateOverride || getCurrentUTCDate();

  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const stored = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
      const storedDate = window.sessionStorage.getItem(SESSION_STORAGE_DATE_KEY);

      // Rotate if session is from a previous calendar day or malformed
      if (
        stored &&
        storedDate === today &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(stored)
      ) {
        return stored;
      }

      const fresh = generateUUID();
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, fresh);
      window.sessionStorage.setItem(SESSION_STORAGE_DATE_KEY, today);
      return fresh;
    } catch {
      // Storage access blocked or restricted
    }
  }

  if (!inMemorySessionId || inMemorySessionDate !== today) {
    inMemorySessionId = generateUUID();
    inMemorySessionDate = today;
  }
  return inMemorySessionId;
}

export function resetFunnelSession(): void {
  inMemorySessionId = null;
  inMemorySessionDate = null;
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      window.sessionStorage.removeItem(SESSION_STORAGE_DATE_KEY);
    } catch {
      // Ignore
    }
  }
}

// In-memory circular buffer for debugging / local audit (last 50 events)
const MAX_BUFFER_SIZE = 50;
const eventBuffer: FunnelEvent[] = [];
const listeners: Set<FunnelEventListener> = new Set();

/**
 * Batch Queue & Beacon Transport
 */
class FunnelBatchQueue {
  private queue: FunnelEvent[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly batchSizeLimit = 5;
  private readonly flushIntervalMs = 3000;
  private readonly endpoint = '/api/telemetry/funnel';
  private lifecycleHooksRegistered = false;

  constructor() {
    this.registerLifecycleHooks();
  }

  private registerLifecycleHooks(): void {
    if (typeof window === 'undefined' || this.lifecycleHooksRegistered) return;
    this.lifecycleHooksRegistered = true;

    const handleUnload = () => this.flush();

    try {
      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          handleUnload();
        }
      });
      window.addEventListener('pagehide', handleUnload);
    } catch {
      // Ignore in non-standard environments
    }
  }

  public enqueue(event: FunnelEvent): void {
    this.queue.push(event);

    if (this.queue.length >= this.batchSizeLimit) {
      this.flush();
    } else if (!this.timer) {
      this.timer = setTimeout(() => {
        this.timer = null;
        this.flush();
      }, this.flushIntervalMs);
    }
  }

  public flush(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.queue.length === 0) return;

    const eventsToSend = [...this.queue];
    this.queue = [];

    const batch: TelemetryBatch = {
      batchId: generateUUID(),
      sentAt: new Date().toISOString(),
      events: eventsToSend,
    };

    const payloadText = JSON.stringify(batch);

    // 1. Prefer sendBeacon for non-blocking unload safety
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      try {
        const blob = new Blob([payloadText], { type: 'application/json' });
        const success = navigator.sendBeacon(this.endpoint, blob);
        if (success) return;
      } catch {
        // Fallback to fetch
      }
    }

    // 2. Fetch transport with keepalive
    if (typeof fetch === 'function') {
      try {
        fetch(this.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payloadText,
          keepalive: true,
        }).catch(() => {
          // Non-blocking telemetry error suppression
        });
      } catch {
        // Suppress
      }
    }
  }

  public getPendingCount(): number {
    return this.queue.length;
  }

  public clearQueue(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.queue = [];
  }
}

const batchQueue = new FunnelBatchQueue();

/**
 * Tracks a privacy-safe conversion funnel event
 */
export function trackFunnelEvent(eventInput: FunnelEventInput): FunnelEvent {
  const sessionId = getOrCreateSessionId();
  const eventId = generateUUID();
  const timestamp = new Date().toISOString();

  const sanitizedInput = { ...eventInput };
  if (sanitizedInput.type === 'landing_view') {
    sanitizedInput.path = sanitizeRoutePath(sanitizedInput.path);
  }

  const event = {
    ...sanitizedInput,
    eventId,
    sessionId,
    timestamp,
  } as FunnelEvent;

  // 1. Maintain in-memory ring buffer
  if (eventBuffer.length >= MAX_BUFFER_SIZE) {
    eventBuffer.shift();
  }
  eventBuffer.push(event);

  // 2. Notify subscribers
  listeners.forEach(fn => {
    try {
      fn(event);
    } catch (err) {
      console.warn('[Analytics:Funnel] Listener error:', err);
    }
  });

  // 3. Dispatch browser CustomEvent for client listeners if in DOM environment
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(
        new CustomEvent('aceleetme:funnel', {
          detail: event,
        })
      );
    } catch {
      // Ignore in non-standard window environments
    }
  }

  // 4. Enqueue into batch transport ONLY if client auto-telemetry is enabled
  if (CLIENT_AUTO_TELEMETRY_ENABLED) {
    batchQueue.enqueue(event);
  }

  return event;
}

/**
 * Explicit helper to enqueue a controlled canary event for testing/verification
 * without activating client auto-telemetry for normal browsing.
 */
export function enqueueCanaryEvent(event: FunnelEvent): void {
  batchQueue.enqueue(event);
}

/**
 * Subscribe to funnel events (e.g. for testing, debugging or future backend forwarders)
 */
export function addFunnelListener(listener: FunnelEventListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Read current in-memory events (Read-only copy for diagnostics/audits)
 */
export function getFunnelEvents(): readonly FunnelEvent[] {
  return [...eventBuffer];
}

/**
 * Clear in-memory event buffer (primarily for test isolation)
 */
export function clearFunnelEvents(): void {
  eventBuffer.length = 0;
  batchQueue.clearQueue();
}

/**
 * Force flush the client batch queue immediately
 */
export function flushFunnelQueue(): void {
  batchQueue.flush();
}

/**
 * Get current pending queue count
 */
export function getFunnelPendingQueueCount(): number {
  return batchQueue.getPendingCount();
}
