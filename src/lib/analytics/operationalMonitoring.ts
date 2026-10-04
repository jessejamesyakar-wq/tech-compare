/**
 * src/lib/analytics/operationalMonitoring.ts
 *
 * ACELEETME.TECH — Wave 2.4C.1 Operational Monitoring & Failure Tracking
 *
 * Server-side operational counters and structured logging for:
 * 1. Telemetry Ingestion (failures remain strictly non-blocking to clients)
 * 2. Scheduled Rollups (idempotent daily aggregation)
 * 3. Expired Event Purging (retention window cleanup)
 *
 * Security & Privacy:
 * - Internal server diagnostics only.
 * - Accessible exclusively via authenticated admin routes (ADMIN_ANALYTICS_TOKEN).
 * - Never exposed publicly or returned in client-side bundles.
 */

export interface OperationalCounters {
  ingestion: {
    totalReceived: number;
    totalPersisted: number;
    failures: number;
    lastSuccessAt: string | null;
    lastFailureAt: string | null;
    lastFailureReason: string | null;
  };
  rollup: {
    totalRuns: number;
    successfulRuns: number;
    failures: number;
    lastSuccessAt: string | null;
    lastFailureAt: string | null;
    lastFailureReason: string | null;
    lastRowsAffected: number;
    lastMechanism: string | null;
  };
  purge: {
    totalRuns: number;
    successfulRuns: number;
    failures: number;
    lastSuccessAt: string | null;
    lastFailureAt: string | null;
    lastFailureReason: string | null;
    lastPurgedRows: number;
    lastMechanism: string | null;
  };
}

const operationalCounters: OperationalCounters = {
  ingestion: {
    totalReceived: 0,
    totalPersisted: 0,
    failures: 0,
    lastSuccessAt: null,
    lastFailureAt: null,
    lastFailureReason: null,
  },
  rollup: {
    totalRuns: 0,
    successfulRuns: 0,
    failures: 0,
    lastSuccessAt: null,
    lastFailureAt: null,
    lastFailureReason: null,
    lastRowsAffected: 0,
    lastMechanism: null,
  },
  purge: {
    totalRuns: 0,
    successfulRuns: 0,
    failures: 0,
    lastSuccessAt: null,
    lastFailureAt: null,
    lastFailureReason: null,
    lastPurgedRows: 0,
    lastMechanism: null,
  },
};

export function recordIngestionEvent(params: {
  receivedCount: number;
  persistedCount: number;
  success: boolean;
  error?: string;
}) {
  operationalCounters.ingestion.totalReceived += params.receivedCount;
  if (params.success) {
    operationalCounters.ingestion.totalPersisted += params.persistedCount;
    operationalCounters.ingestion.lastSuccessAt = new Date().toISOString();
  } else {
    operationalCounters.ingestion.failures += 1;
    operationalCounters.ingestion.lastFailureAt = new Date().toISOString();
    operationalCounters.ingestion.lastFailureReason = params.error?.slice(0, 300) || 'Ingestion persistence failed';
    console.error('[Analytics:Operational:IngestionFailure]', {
      timestamp: operationalCounters.ingestion.lastFailureAt,
      error: operationalCounters.ingestion.lastFailureReason,
      nonBlocking: true,
    });
  }
}

export function recordRollupExecution(params: {
  success: boolean;
  rowsAffected?: number;
  mechanism?: string;
  error?: string;
}) {
  operationalCounters.rollup.totalRuns += 1;
  if (params.success) {
    operationalCounters.rollup.successfulRuns += 1;
    operationalCounters.rollup.lastSuccessAt = new Date().toISOString();
    operationalCounters.rollup.lastRowsAffected = params.rowsAffected ?? 0;
    operationalCounters.rollup.lastMechanism = params.mechanism || 'rpc';
  } else {
    operationalCounters.rollup.failures += 1;
    operationalCounters.rollup.lastFailureAt = new Date().toISOString();
    operationalCounters.rollup.lastFailureReason = params.error?.slice(0, 300) || 'Rollup failed';
    console.error('[Analytics:Operational:RollupFailure]', {
      timestamp: operationalCounters.rollup.lastFailureAt,
      error: operationalCounters.rollup.lastFailureReason,
    });
  }
}

export function recordPurgeExecution(params: {
  success: boolean;
  purgedRows?: number;
  mechanism?: string;
  error?: string;
}) {
  operationalCounters.purge.totalRuns += 1;
  if (params.success) {
    operationalCounters.purge.successfulRuns += 1;
    operationalCounters.purge.lastSuccessAt = new Date().toISOString();
    operationalCounters.purge.lastPurgedRows = params.purgedRows ?? 0;
    operationalCounters.purge.lastMechanism = params.mechanism || 'rpc';
  } else {
    operationalCounters.purge.failures += 1;
    operationalCounters.purge.lastFailureAt = new Date().toISOString();
    operationalCounters.purge.lastFailureReason = params.error?.slice(0, 300) || 'Purge failed';
    console.error('[Analytics:Operational:PurgeFailure]', {
      timestamp: operationalCounters.purge.lastFailureAt,
      error: operationalCounters.purge.lastFailureReason,
    });
  }
}

export function getOperationalHealthSummary() {
  const ingestionHealth = operationalCounters.ingestion.failures === 0 ? 'HEALTHY' : 'DEGRADED';
  const rollupHealth = operationalCounters.rollup.failures === 0 ? 'HEALTHY' : 'DEGRADED';
  const purgeHealth = operationalCounters.purge.failures === 0 ? 'HEALTHY' : 'DEGRADED';

  return {
    overallHealth: (ingestionHealth === 'HEALTHY' && rollupHealth === 'HEALTHY' && purgeHealth === 'HEALTHY')
      ? 'HEALTHY'
      : 'DEGRADED',
    ingestionHealth,
    rollupHealth,
    purgeHealth,
    telemetryFailuresNonBlocking: true,
    counters: operationalCounters,
    timestamp: new Date().toISOString(),
  };
}
