import { PostgresDatabaseEngine } from '../postgres/postgresClient';
import { EnforcementCircuitBreaker } from '../enforce/enforcementCircuitBreaker';

export type SystemHealthState =
  | 'HEALTHY'
  | 'DEGRADED'
  | 'WRITE_RESTRICTED'
  | 'READ_ONLY_SAFE_MODE'
  | 'CIRCUIT_BREAKER_OPEN'
  | 'RECOVERY_IN_PROGRESS'
  | 'INCIDENT_REVIEW_REQUIRED';

export interface OperationalHealthAssessment {
  state: SystemHealthState;
  timestamp: string;
  circuitBreakerState: 'CLOSED' | 'OPEN';
  databaseConnected: boolean;
  auditChainValid: boolean;
  goldenDatasetClean: boolean;
  priceFirewallProtected: boolean;
  activeIncidentsCount: number;
  remediationActionRequired?: string;
}

export class SystemHealthManager {
  private static currentState: SystemHealthState = 'HEALTHY';
  private static recoveryInProgress: boolean = false;
  private static incidentReviewRequired: boolean = false;

  public static setRecoveryStatus(inProgress: boolean): void {
    this.recoveryInProgress = inProgress;
  }

  public static setIncidentReviewRequired(required: boolean): void {
    this.incidentReviewRequired = required;
  }

  public static evaluateSystemHealth(inputs?: {
    databaseConnected?: boolean;
    auditChainValid?: boolean;
    goldenDatasetClean?: boolean;
    priceFirewallProtected?: boolean;
    circuitBreakerState?: 'CLOSED' | 'OPEN';
  }): OperationalHealthAssessment {
    const timestamp = new Date().toISOString();
    const cbStatus = EnforcementCircuitBreaker.getStatus();

    const dbConnected = inputs?.databaseConnected ?? PostgresDatabaseEngine.isPostgresConnected();
    const cbState = inputs?.circuitBreakerState ?? cbStatus.state;
    const auditValid = inputs?.auditChainValid ?? true;
    const goldenClean = inputs?.goldenDatasetClean ?? true;
    const priceProtected = inputs?.priceFirewallProtected ?? true;

    let state: SystemHealthState = 'HEALTHY';
    let remediationActionRequired: string | undefined = undefined;

    if (this.recoveryInProgress) {
      state = 'RECOVERY_IN_PROGRESS';
      remediationActionRequired = 'Wait for recovery process to complete and pass post-recovery validation.';
    } else if (cbState === 'OPEN') {
      state = 'CIRCUIT_BREAKER_OPEN';
      remediationActionRequired = 'Investigate trip reason and issue explicit authorized circuit breaker reset.';
    } else if (!goldenClean || !priceProtected || !auditValid) {
      state = 'INCIDENT_REVIEW_REQUIRED';
      remediationActionRequired = 'Critical governance/integrity violation detected. Stop writes and review incident.';
    } else if (!dbConnected) {
      state = 'READ_ONLY_SAFE_MODE';
      remediationActionRequired = 'PostgreSQL backend unavailable. Operating in Fail-Closed Read-Only mode.';
    } else if (this.incidentReviewRequired) {
      state = 'WRITE_RESTRICTED';
      remediationActionRequired = 'Write operations restricted pending review of active security alerts.';
    }

    this.currentState = state;

    return {
      state,
      timestamp,
      circuitBreakerState: cbState,
      databaseConnected: dbConnected,
      auditChainValid: auditValid,
      goldenDatasetClean: goldenClean,
      priceFirewallProtected: priceProtected,
      activeIncidentsCount: state === 'HEALTHY' ? 0 : 1,
      remediationActionRequired
    };
  }

  public static getCurrentState(): SystemHealthState {
    return this.currentState;
  }
}
