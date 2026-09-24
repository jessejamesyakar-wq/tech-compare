import { ENFORCEMENT_POLICY_VERSION } from './enforcementPolicyV1';
import { EnforcementCircuitBreaker } from './enforcementCircuitBreaker';

export interface EnforcementObservabilityMetrics {
  evaluatedAt: string;
  policyVersion: string;
  circuitBreakerState: string;
  candidatesEvaluated: number;
  allowed: number;
  allowedWithWarning: number;
  reviewRequired: number;
  blocked: number;
  blocksByRule: Record<string, number>;
  goldenBlocks: number;
  scopeViolations: number;
  priceFirewallAttempts: number;
  auditFailures: number;
  stagedCandidates: number;
  duplicateAttempts: number;
  rollbackCount: number;
}

export class EnforcementObservabilityCollector {
  private static metrics: EnforcementObservabilityMetrics = {
    evaluatedAt: new Date().toISOString(),
    policyVersion: ENFORCEMENT_POLICY_VERSION,
    circuitBreakerState: 'CLOSED',
    candidatesEvaluated: 0,
    allowed: 0,
    allowedWithWarning: 0,
    reviewRequired: 0,
    blocked: 0,
    blocksByRule: {},
    goldenBlocks: 0,
    scopeViolations: 0,
    priceFirewallAttempts: 0,
    auditFailures: 0,
    stagedCandidates: 0,
    duplicateAttempts: 0,
    rollbackCount: 0
  };

  public static recordCandidateEvaluation(
    decisionState: string,
    ruleId?: string,
    options?: {
      isGoldenBlock?: boolean;
      isScopeViolation?: boolean;
      isPriceFirewallAttempt?: boolean;
      isAuditFailure?: boolean;
    }
  ): void {
    this.metrics.evaluatedAt = new Date().toISOString();
    this.metrics.circuitBreakerState = EnforcementCircuitBreaker.getStatus().state;
    this.metrics.candidatesEvaluated++;

    if (decisionState === 'ALLOW') this.metrics.allowed++;
    else if (decisionState === 'ALLOW_WITH_WARNING') this.metrics.allowedWithWarning++;
    else if (decisionState === 'REQUIRE_REVIEW') this.metrics.reviewRequired++;
    else if (decisionState === 'BLOCK') {
      this.metrics.blocked++;
      if (ruleId) {
        this.metrics.blocksByRule[ruleId] = (this.metrics.blocksByRule[ruleId] || 0) + 1;
      }
    }

    if (options?.isGoldenBlock) this.metrics.goldenBlocks++;
    if (options?.isScopeViolation) this.metrics.scopeViolations++;
    if (options?.isPriceFirewallAttempt) this.metrics.priceFirewallAttempts++;
    if (options?.isAuditFailure) this.metrics.auditFailures++;
  }

  public static recordStagedCandidate(): void {
    this.metrics.stagedCandidates++;
  }

  public static recordDuplicateAttempt(): void {
    this.metrics.duplicateAttempts++;
  }

  public static recordRollback(): void {
    this.metrics.rollbackCount++;
  }

  public static getMetrics(): EnforcementObservabilityMetrics {
    this.metrics.circuitBreakerState = EnforcementCircuitBreaker.getStatus().state;
    return { ...this.metrics };
  }
}
