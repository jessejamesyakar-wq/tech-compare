export type CircuitBreakerState = 'CLOSED' | 'OPEN';

export type CircuitBreakerTripReason =
  | 'AUDIT_CHAIN_CORRUPTION'
  | 'GOLDEN_DATASET_DRIFT'
  | 'POLICY_HASH_MISMATCH'
  | 'UNEXPECTED_CATALOG_FINGERPRINT_SHIFT'
  | 'PRICE_FIREWALL_BREACH'
  | 'WRITE_SCOPE_BREACH'
  | 'TOCTOU_PAYLOAD_MISMATCH'
  | 'POST_WRITE_INVARIANT_FAILURE'
  | 'CONTROL_PLANE_INTERNAL_ERROR';

export interface CircuitBreakerStatus {
  state: CircuitBreakerState;
  tripReason?: CircuitBreakerTripReason;
  trippedAt?: string;
  tripCount: number;
  message: string;
}

export class EnforcementCircuitBreaker {
  private static instanceState: CircuitBreakerState = 'CLOSED';
  private static tripReason?: CircuitBreakerTripReason;
  private static trippedAt?: string;
  private static tripCount: number = 0;

  public static tripCircuit(reason: CircuitBreakerTripReason, details?: string): CircuitBreakerStatus {
    this.instanceState = 'OPEN';
    this.tripReason = reason;
    this.trippedAt = new Date().toISOString();
    this.tripCount++;

    return {
      state: 'OPEN',
      tripReason: reason,
      trippedAt: this.trippedAt,
      tripCount: this.tripCount,
      message: `CONTROL_PLANE_CIRCUIT_BREAKER_OPEN: Tripped due to ${reason}. Details: ${details || 'None'}`
    };
  }

  public static resetCircuit(): void {
    this.instanceState = 'CLOSED';
    this.tripReason = undefined;
    this.trippedAt = undefined;
  }

  public static getStatus(): CircuitBreakerStatus {
    return {
      state: this.instanceState,
      tripReason: this.tripReason,
      trippedAt: this.trippedAt,
      tripCount: this.tripCount,
      message: this.instanceState === 'OPEN'
        ? `CONTROL_PLANE_CIRCUIT_BREAKER_OPEN: ${this.tripReason}`
        : 'CONTROL_PLANE_CIRCUIT_BREAKER_CLOSED: Operational'
    };
  }

  public static isOperational(): boolean {
    return this.instanceState === 'CLOSED';
  }

  public static trip(scope: string, details?: string): CircuitBreakerStatus {
    return this.tripCircuit('CONTROL_PLANE_INTERNAL_ERROR', details);
  }

  public static reset(scope?: string): void {
    this.resetCircuit();
  }
}
