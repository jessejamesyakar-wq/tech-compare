import { EnforcementCircuitBreaker } from '../enforce/enforcementCircuitBreaker';
import { ENFORCEMENT_POLICY_VERSION } from '../enforce/enforcementPolicyV1';

export interface LatencyHistogram {
  minMs: number;
  maxMs: number;
  avgMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  sampleCount: number;
}

export interface ErrorTaxonomyCounters {
  ENF_PROVENANCE_SYNTHETIC_FIXTURE_FORBIDDEN: number;
  ENF_GOLDEN_ROOT_MUTATION_FORBIDDEN: number;
  ENF_PRICE_FIELD_WRITE_FORBIDDEN: number;
  ENF_TRANSACTION_ABORTED: number;
  ENF_CONCURRENCY_LOCK_FAILED: number;
  ENF_RATE_LIMIT_EXCEEDED: number;
  ENF_SCOPE_VIOLATION: number;
  ENF_CROSS_BRAND_CONTAMINATION: number;
  OTHER_ERRORS: number;
}

export interface Phase8DObservabilitySnapshot {
  timestamp: string;
  policyVersion: string;
  circuitBreakerState: string;
  throughputCandidatesPerSec: number;
  totalCandidatesEvaluated: number;
  totalAllowed: number;
  totalBlocked: number;
  totalStagedForReview: number;
  totalRolledBack: number;
  totalDuplicatePrevented: number;
  latencies: LatencyHistogram;
  errorTaxonomy: ErrorTaxonomyCounters;
}

export class Phase8DObservabilityEngine {
  private static startTimeMs: number = Date.now();
  private static latenciesMs: number[] = [];

  private static totalEvaluated = 0;
  private static totalAllowed = 0;
  private static totalBlocked = 0;
  private static totalStagedForReview = 0;
  private static totalRolledBack = 0;
  private static totalDuplicatePrevented = 0;

  private static errors: ErrorTaxonomyCounters = {
    ENF_PROVENANCE_SYNTHETIC_FIXTURE_FORBIDDEN: 0,
    ENF_GOLDEN_ROOT_MUTATION_FORBIDDEN: 0,
    ENF_PRICE_FIELD_WRITE_FORBIDDEN: 0,
    ENF_TRANSACTION_ABORTED: 0,
    ENF_CONCURRENCY_LOCK_FAILED: 0,
    ENF_RATE_LIMIT_EXCEEDED: 0,
    ENF_SCOPE_VIOLATION: 0,
    ENF_CROSS_BRAND_CONTAMINATION: 0,
    OTHER_ERRORS: 0
  };

  public static recordEvaluation(durationMs: number, decisionState: string, errorCode?: string): void {
    this.totalEvaluated++;
    this.latenciesMs.push(durationMs);

    if (decisionState === 'ALLOW') {
      this.totalAllowed++;
    } else if (decisionState === 'BLOCK') {
      this.totalBlocked++;
    } else if (decisionState === 'REQUIRE_REVIEW') {
      this.totalStagedForReview++;
    } else if (decisionState === 'ROLLED_BACK') {
      this.totalRolledBack++;
    }

    if (errorCode) {
      this.recordError(errorCode);
    }
  }

  public static recordError(errorCode: string): void {
    if (errorCode in this.errors) {
      (this.errors as any)[errorCode]++;
    } else {
      this.errors.OTHER_ERRORS++;
    }
  }

  public static recordDuplicatePrevented(): void {
    this.totalDuplicatePrevented++;
  }

  public static recordRollback(): void {
    this.totalRolledBack++;
  }

  public static calculateLatencies(): LatencyHistogram {
    if (this.latenciesMs.length === 0) {
      return { minMs: 0, maxMs: 0, avgMs: 0, p50Ms: 0, p95Ms: 0, p99Ms: 0, sampleCount: 0 };
    }

    const sorted = [...this.latenciesMs].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, val) => acc + val, 0);

    return {
      minMs: sorted[0],
      maxMs: sorted[sorted.length - 1],
      avgMs: Math.round((sum / sorted.length) * 100) / 100,
      p50Ms: sorted[Math.floor(sorted.length * 0.5)],
      p95Ms: sorted[Math.floor(sorted.length * 0.95)],
      p99Ms: sorted[Math.floor(sorted.length * 0.99)],
      sampleCount: sorted.length
    };
  }

  public static getMetricsSnapshot(): Phase8DObservabilitySnapshot {
    const elapsedSeconds = Math.max(0.001, (Date.now() - this.startTimeMs) / 1000);
    const throughputCandidatesPerSec = Math.round((this.totalEvaluated / elapsedSeconds) * 100) / 100;

    return {
      timestamp: new Date().toISOString(),
      policyVersion: ENFORCEMENT_POLICY_VERSION,
      circuitBreakerState: EnforcementCircuitBreaker.getStatus().state,
      throughputCandidatesPerSec,
      totalCandidatesEvaluated: this.totalEvaluated,
      totalAllowed: this.totalAllowed,
      totalBlocked: this.totalBlocked,
      totalStagedForReview: this.totalStagedForReview,
      totalRolledBack: this.totalRolledBack,
      totalDuplicatePrevented: this.totalDuplicatePrevented,
      latencies: this.calculateLatencies(),
      errorTaxonomy: { ...this.errors }
    };
  }

  public static reset(): void {
    this.startTimeMs = Date.now();
    this.latenciesMs = [];
    this.totalEvaluated = 0;
    this.totalAllowed = 0;
    this.totalBlocked = 0;
    this.totalStagedForReview = 0;
    this.totalRolledBack = 0;
    this.totalDuplicatePrevented = 0;
    this.errors = {
      ENF_PROVENANCE_SYNTHETIC_FIXTURE_FORBIDDEN: 0,
      ENF_GOLDEN_ROOT_MUTATION_FORBIDDEN: 0,
      ENF_PRICE_FIELD_WRITE_FORBIDDEN: 0,
      ENF_TRANSACTION_ABORTED: 0,
      ENF_CONCURRENCY_LOCK_FAILED: 0,
      ENF_RATE_LIMIT_EXCEEDED: 0,
      ENF_SCOPE_VIOLATION: 0,
      ENF_CROSS_BRAND_CONTAMINATION: 0,
      OTHER_ERRORS: 0
    };
  }
}
