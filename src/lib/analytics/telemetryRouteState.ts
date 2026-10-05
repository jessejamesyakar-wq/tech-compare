/** Shared telemetry route state and test seams.
 * Kept outside route.ts so the Next.js route exposes only supported exports.
 * Gate values and process-local sink behavior are unchanged.
 */

/**
 * Dual Feature Gate: Server Persistence Control
 * Hard Governance Control (Wave 2.4B.2):
 * Strictly FAIL CLOSED. Server persistence is enabled ONLY when
 * process.env.ANALYTICS_SERVER_PERSISTENCE_ENABLED === 'true'.
 * If absent, undefined, or 'false', it strictly evaluates to false.
 */
export const SERVER_PERSISTENCE_ENABLED =
  typeof process !== 'undefined' &&
  process.env.ANALYTICS_SERVER_PERSISTENCE_ENABLED === 'true';

// Hard Governance Invariant: Zero Supabase Writes in Wave 2.2 (Retained for baseline compatibility)
export const SUPABASE_ANALYTICS_ENABLED = false;

export interface TelemetryRecord {
  receivedAt: string;
  batchId: string;
  eventsCount: number;
  types: string[];
}

// In-memory mock/test sink for local testing and validation
export const mockTelemetrySink: TelemetryRecord[] = [];

export function clearMockTelemetrySink(): void {
  mockTelemetrySink.length = 0;
}

// Rate Protection Classification:
// In a serverless/multi-instance deployment, this in-memory sliding-window token bucket operates
// per-instance. It is not globally synchronized across distributed replicas and is classified as
// BEST_EFFORT_LOCAL_PROTECTION against client runaway loops, without introducing new infrastructure.
export const RATE_LIMIT_CLASSIFICATION = 'BEST_EFFORT_LOCAL_PROTECTION';
