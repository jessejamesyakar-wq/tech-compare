# ACELEETME.TECH — ANALYTICS V1 SCHEMA CONTRACT
## Master Program Wave 2.3A — Database Schema & Security Contract Specification

**Document Version:** 1.1.0  
**Generated At:** 2026-10-04T21:08:00Z  
**Target Migration:** [supabase/migrations/20261004_analytics_v1_funnel_preflight.sql](file:///C:/Projects/aceleetme-agent-workspaces/task_followup_fixes/supabase/migrations/20261004_analytics_v1_funnel_preflight.sql)  
**Governance Scope:** `analytics_funnel_events`, `analytics_funnel_daily_summary`, & Maintenance Functions  

---

### 1. Raw Event Table: `analytics_funnel_events`

```sql
CREATE TABLE public.analytics_funnel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  path VARCHAR(200),
  category VARCHAR(100),
  product_id VARCHAR(200),
  store_id VARCHAR(100),
  query_length INTEGER,
  result_count INTEGER,
  has_verified_price BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Funnel event type constraints
  CONSTRAINT chk_funnel_event_type CHECK (
    event_type IN (
      'landing_view',
      'search_performed',
      'product_view',
      'comparison_started',
      'retailer_outbound_click'
    )
  ),
  -- Bounded query length check
  CONSTRAINT chk_funnel_query_length CHECK (
    query_length IS NULL OR (query_length >= 0 AND query_length <= 500)
  ),
  -- Bounded result count check
  CONSTRAINT chk_funnel_result_count CHECK (
    result_count IS NULL OR result_count >= 0
  )
);
```

#### Detailed Column Contract

| Column Name | PostgreSQL Type | Nullable | Default | Constraints / Validation |
|---|---|---|---|---|
| `id` | `UUID` | No | `gen_random_uuid()` | Primary Key. RFC4122 v4 UUID. |
| `session_id` | `UUID` | No | None | Operational correlation ID. Must match RFC4122 UUID v4 regex. Rotates daily. |
| `event_type` | `VARCHAR(50)` | No | None | Strict check constraint allowlist: 5 funnel events. |
| `path` | `VARCHAR(200)` | Yes | `NULL` | Sanitized client route pathname. Max length 200. Query params, hash, tokens stripped. |
| `category` | `VARCHAR(100)` | Yes | `NULL` | Coarse category slug (`smartphones`, `laptops`, etc.). Max length 100. |
| `product_id` | `VARCHAR(200)` | Yes | `NULL` | Canonical product root identifier. Max length 200. |
| `store_id` | `VARCHAR(100)` | Yes | `NULL` | Merchant identifier (`amazon`, `trendyol`, etc.). Max length 100. |
| `query_length` | `INTEGER` | Yes | `NULL` | Number of characters in search query ($0 \le x \le 500$). |
| `result_count` | `INTEGER` | Yes | `NULL` | Yield count of search results ($x \ge 0$). |
| `has_verified_price` | `BOOLEAN` | No | `false` | Presence of active verified price in catalog. |
| `created_at` | `TIMESTAMPTZ` | No | `now()` | Ingestion timestamp for TTL purges and daily partitioning. |

---

### 2. Daily Summary Table: `analytics_funnel_daily_summary`

```sql
CREATE TABLE public.analytics_funnel_daily_summary (
  summary_date DATE NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'all',
  store_id VARCHAR(100) NOT NULL DEFAULT 'all',
  landing_sessions INTEGER NOT NULL DEFAULT 0,
  search_sessions INTEGER NOT NULL DEFAULT 0,
  product_views INTEGER NOT NULL DEFAULT 0,
  comparison_starts INTEGER NOT NULL DEFAULT 0,
  retailer_outbound_clicks INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (summary_date, category, store_id)
);
```

#### Column Definitions & Anonymity Guarantees

- **`summary_date` (`DATE`):** Calendar day of aggregation.
- **`category` (`VARCHAR(100)`):** Aggregation dimension for category-level breakdown (`'all'` for sitewide).
- **`store_id` (`VARCHAR(100)`):** Aggregation dimension for merchant outbound analysis (`'all'` for aggregate).
- **`landing_sessions` (`INTEGER`):** Count of distinct `session_id` values logging `landing_view`.
- **`search_sessions` (`INTEGER`):** Count of distinct `session_id` values logging `search_performed`.
- **`product_views` (`INTEGER`):** Aggregate count of `product_view` events.
- **`comparison_starts` (`INTEGER`):** Aggregate count of `comparison_started` events.
- **`retailer_outbound_clicks` (`INTEGER`):** Aggregate count of `retailer_outbound_click` events.
- **`updated_at` (`TIMESTAMPTZ`):** Timestamp of last rollup execution.
- **Zero Session Identifiers Guarantee:** `analytics_funnel_daily_summary` contains **zero** `session_id` columns, zero IP addresses, and zero tracking keys.

---

### 3. Function Security, Execution Privileges & RPC Protections

PostgreSQL grants `EXECUTE` on new public functions to `PUBLIC` by default. Under Supabase/PostgREST architecture, this permits public unauthenticated visitors (`anon`) to trigger functions via RPC (`/rest/v1/rpc/...`).

To eliminate this vulnerability, the migration draft explicitly hardens function privileges:

```sql
REVOKE ALL ON FUNCTION public.rollup_funnel_daily(DATE) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.purge_expired_raw_funnel_events(INTEGER) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.rollup_funnel_daily(DATE) TO service_role;
GRANT EXECUTE ON FUNCTION public.purge_expired_raw_funnel_events(INTEGER) TO service_role;
```

#### Security Attributes Ledger

| Function | Security Definer | search_path | Public RPC Status | Allowed Callers |
|---|---|---|---|---|
| `public.rollup_funnel_daily(DATE)` | `SECURITY DEFINER` | `pg_catalog, public` (pinned) | **DENIED** (401/403) | `service_role` (backend worker) |
| `public.purge_expired_raw_funnel_events(INTEGER)` | `SECURITY DEFINER` | `pg_catalog, public` (pinned) | **DENIED** (401/403) | `service_role` (backend worker) |

---

### 4. Server-Side Ingestion Allowlist Contract

The ingestion route (`POST /api/telemetry/funnel`) enforces a strict two-tier allowlist:

#### Batch-Level Allowed Keys
- `batchId` (`string`, max 100)
- `sentAt` (`string`, ISO 8601 timestamp)
- `events` (`array`, $1 \le \text{length} \le 50$)

#### Event-Level Allowed Keys by Type
```typescript
const ALLOWED_KEYS_BY_TYPE = {
  landing_view: new Set([
    'eventId', 'sessionId', 'timestamp', 'type', 'path', 'referrerSource'
  ]),
  search_performed: new Set([
    'eventId', 'sessionId', 'timestamp', 'type', 'queryLength', 'resultCount', 'category'
  ]),
  product_view: new Set([
    'eventId', 'sessionId', 'timestamp', 'type', 'productId', 'category', 'hasPrice'
  ]),
  comparison_started: new Set([
    'eventId', 'sessionId', 'timestamp', 'type', 'productCount', 'productIds', 'source'
  ]),
  retailer_outbound_click: new Set([
    'eventId', 'sessionId', 'timestamp', 'type', 'storeId', 'productId', 'hasVerifiedPrice', 'price'
  ])
};
```

#### Direct Identifier Rejection Rule
If any incoming event object contains any of the following keys, the entire batch is rejected with `HTTP 400 Bad Request`:
```text
ip, user_ip, client_ip,
email, user_email,
query, rawQuery, searchTerm, searchText, q,
password,
token, bearer,
authorization, auth,
cookie, cookies,
userAgent, user_agent,
fingerprint, device_fingerprint,
accountId, account_id
```

---

### 5. Technical Constraints & Bounded Limits

| Parameter | Limit | Enforcement Point | Rejection Status |
|---|---|---|---|
| Max Payload Size | 64 KB (65,536 bytes) | Route raw text guard | `HTTP 413 Payload Too Large` |
| Max Events Per Batch | 50 events | Route array validation | `HTTP 400 Bad Request` |
| Event Path String Length | 200 characters | `sanitizeRoutePath` & DDL | Truncated / `HTTP 400` |
| Category String Length | 100 characters | Route & DDL constraint | `HTTP 400 Bad Request` |
| Product ID String Length | 200 characters | Route & DDL constraint | `HTTP 400 Bad Request` |
| Store ID String Length | 100 characters | Route & DDL constraint | `HTTP 400 Bad Request` |
| Query Length Value | $0 \le x \le 500$ | Route & DDL constraint | `HTTP 400 Bad Request` |
| Result Count Value | $x \ge 0$ | Route & DDL constraint | `HTTP 400 Bad Request` |
| Purge Minimum Retention | $\ge 7$ days | Function parameter assertion | `PURGE_SAFETY_ERROR` |
