# ACELEETME.TECH — ANALYTICS V1 APPLICATION CONTRACT
## Master Program Wave 2.2 — Track B Specification

**Document Version:** 1.0.0  
**Effective Date:** 2026-10-04T20:30:00+03:00  
**Status:** \`APPLICATION_LAYER_READY\` (MOCK_SINK_ACTIVE, SUPABASE_MUTATION_OFF)  
**Security Classification:** INTERNAL TECHNICAL SPECIFICATION  

---

### 1. Architectural Overview

The Analytics V1 application implementation introduces client-side conversion funnel telemetry and server-side ingestion validation without modifying or writing to the production database.

```
+-----------------------------------------------------------------------------------+
| CLIENT BROWSER                                                                    |
|                                                                                   |
|  [User Actions]                                                                   |
|         |                                                                         |
|         v                                                                         |
|  trackFunnelEvent()                                                               |
|         |                                                                         |
|         +---> Session Manager (crypto.randomUUID in sessionStorage)               |
|         +---> Circular Buffer (In-memory last 50 events for local diagnostics)    |
|         +---> CustomEvent ('aceleetme:funnel' for reactive UI listeners)          |
|         +---> Batch Queue (Buffers up to 5 events or 3s debounce)                 |
|                     |                                                             |
|                     +---> Transport (navigator.sendBeacon with fetch fallback)    |
+---------------------|-------------------------------------------------------------+
                      | POST /api/telemetry/funnel (JSON / Blob)
                      v
+-----------------------------------------------------------------------------------+
| INGESTION ROUTE (/api/telemetry/funnel)                                           |
|                                                                                   |
|  1. Bot Filter Interface (crawlers identified & ignored; UA NEVER logged)         |
|  2. Rate Protection (sliding-window bucket; client IP never stored)               |
|  3. Payload Size Guard (max 64 KB)                                                |
|  4. Strict Privacy & Schema Validation (rejects raw query, email, IP, malformed)  |
|  5. Mock Telemetry Sink (In-memory bounded buffer for test assertions)             |
|                                                                                   |
|  [SUPABASE_ANALYTICS_ENABLED = false]  <--- STRICT ZERO DB WRITES IN WAVE 2.2      |
+-----------------------------------------------------------------------------------+
```

---

### 2. Ephemeral Session Management & Day-Boundary Guarantee

1. **Generation:** Cryptographically random UUID version 4 via `crypto.randomUUID()`.
2. **Storage:** Stored strictly in `window.sessionStorage` (`aceleetme_telemetry_sid` and `aceleetme_telemetry_sdate`).
3. **Day-Boundary Safe (`SESSION_DAY_BOUNDARY_SAFE = YES`):**
   - The session manager stores the UTC creation date (`YYYY-MM-DD`).
   - If a browser tab remains open across a date change, the very next event evaluation checks the UTC date, invalidates the previous session, rotates to a fresh `crypto.randomUUID()`, and updates the date stamp.
   - Session identifiers **strictly never span multiple calendar days**.
4. **Non-Derivation Guarantee:** Session IDs are **never** derived from IP addresses, User-Agent strings, Canvas/WebGL fingerprints, cookies, email addresses, or user account credentials.
5. **Regulatory Classification Notice:** This technical design is structured around data minimization and privacy-by-design principles. Operational compliance conclusions (e.g. KVKK / GDPR exemption or consent requirements) are reserved for organizational legal review and are not asserted by code comments.

---

### 3. Event Schemas & Data Minimization

All events share the base interface:
```typescript
interface BaseFunnelEvent {
  eventId: string;     // UUID v4
  sessionId: string;   // UUID v4
  timestamp: string;   // ISO 8601 UTC
  type: FunnelEventType;
}
```

#### Event 1: `landing_view`
Triggered upon landing on a primary entrypoint.
- `path`: string (max 500 chars, e.g. `/`, `/phones`)
- `referrerSource`: `'direct' | 'internal' | 'external'`

#### Event 2: `search_performed`
Triggered when a search or category filter is executed.
- **Technical Minimization Rule:** Raw search terms (`query`, `rawQuery`, `searchTerm`) are **strictly prohibited** and rejected by the schema validator.
- `queryLength`: number (integer >= 0, length of query string)
- `resultCount`: number (integer >= 0, matching products returned)
- `category`: optional string (e.g. `'smartphones'`)

#### Event 3: `product_view`
Triggered when a canonical product detail page is viewed.
- `productId`: string (max 300 chars, e.g. `'huawei-huawei-p60-pro'`)
- `category`: string (e.g. `'smartphones'`)
- `hasPrice`: boolean (indicates whether any verified or catalog price is displayed)

#### Event 4: `comparison_started`
Triggered when a user compares two or more devices.
- `productCount`: number (integer >= 2)
- `productIds`: string[] (array of canonical product IDs, length 2..10)
- `source`: `'detail_page' | 'compare_bar' | 'search' | 'duel'`

#### Event 5: `retailer_outbound_click`
Triggered when a user clicks an outbound store link.
- `storeId`: string (e.g. `'mediamarkt'`, `'vatan'`, `'trendyol'`)
- `productId`: string
- `hasVerifiedPrice`: boolean
- `price`: number | null (displayed price at click time)

---

### 4. Client Transport & Batching

- **Queue Limits:** Flushes when batch buffer reaches **5 events** or after **3,000 ms** idle debounce.
- **Unload Safety:** Hooks into `window.visibilitychange` (`state === 'hidden'`) and `window.pagehide` to flush pending events using `navigator.sendBeacon`.
- **Payload Envelope:**
  ```json
  {
    "batchId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "sentAt": "2026-10-04T20:30:00.000Z",
    "events": [ ... ]
  }
  ```

---

### 5. Server Ingestion Route Contract (`/api/telemetry/funnel`)

- **Method:** `POST`
- **Headers Accepted:** `Content-Type: application/json` or `text/plain`
- **Max Payload Size:** 64 KB
- **Bot Filter:** Crawlers (Googlebot, Bingbot, HeadlessChrome, curl, etc.) return HTTP 200 with `{ ok: true, status: 'ignored_bot' }`. The User-Agent string is **never** saved to database or printed in server logs.
- **Rate Protection Semantics (`RATE_LIMIT_CLASSIFICATION = BEST_EFFORT_LOCAL_PROTECTION`):**
  - Implemented as an in-memory token-bucket limiter (60 tokens per minute per coarse subnet).
  - In serverless / multi-instance environments, this protects local instance event loops and is not globally synchronized across replicas.
  - Zero new infrastructure introduced in Wave 2.2.
- **Safe Logging Policy:**
  - Zero raw IP address logging.
  - Zero User-Agent string persistence.
  - Zero raw request-body logging.
- **Current Sink:** Bounded in-memory mock sink (`mockTelemetrySink`).
- **Database Status:** `SUPABASE_ANALYTICS_ENABLED = false`. Zero database calls.
