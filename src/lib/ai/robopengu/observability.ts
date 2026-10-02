// src/lib/ai/robopengu/observability.ts
/**
 * Worker 10: AI UX & Observability
 * Structured telemetry and event logging for RoboPengu AI interactions.
 * Zero conversation PII stored.
 */

export type TelemetryEventType =
  | 'INTENT_PARSED'
  | 'CANDIDATES_FILTERED'
  | 'RECOMMENDATION_GENERATED'
  | 'OPTIMIZATION_SOLVED'
  | 'FALLBACK_TRIGGERED'
  | 'ERROR_CAUGHT';

export interface TelemetryEvent {
  eventType: TelemetryEventType;
  timestamp: string;
  durationMs?: number;
  metadata: Record<string, string | number | boolean | null | undefined>;
}

export class RoboPenguObservability {
  private static events: TelemetryEvent[] = [];
  private static readonly MAX_BUFFER_SIZE = 1000;

  public static record(
    eventType: TelemetryEventType,
    metadata: Record<string, string | number | boolean | null | undefined>,
    durationMs?: number
  ): void {
    // Sanitize metadata to guarantee NO PII
    const sanitizedMetadata: Record<string, any> = {};
    for (const [key, value] of Object.entries(metadata)) {
      if (['prompt', 'rawQuery', 'userMessage', 'name', 'email', 'ip'].includes(key)) {
        // Strip out raw text / PII
        sanitizedMetadata[`${key}Length`] = typeof value === 'string' ? value.length : 0;
      } else {
        sanitizedMetadata[key] = value;
      }
    }

    const event: TelemetryEvent = {
      eventType,
      timestamp: new Date().toISOString(),
      durationMs,
      metadata: sanitizedMetadata,
    };

    this.events.push(event);
    if (this.events.length > this.MAX_BUFFER_SIZE) {
      this.events.shift();
    }
  }

  public static getRecentEvents(limit: number = 50): TelemetryEvent[] {
    return this.events.slice(-limit);
  }

  public static clear(): void {
    this.events = [];
  }
}
