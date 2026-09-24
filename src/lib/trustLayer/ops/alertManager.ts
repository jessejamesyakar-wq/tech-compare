export type AlertSeverity = 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';

export interface OperationalAlert {
  alert_id: string;
  severity: AlertSeverity;
  source: string;
  error_code: string;
  affected_workflow: string;
  affected_roots: string[];
  first_seen: string;
  last_seen: string;
  occurrence_count: number;
  circuit_breaker_state: 'CLOSED' | 'OPEN';
  runbook_reference: string;
  acknowledgement_state: 'UNACKNOWLEDGED' | 'ACKNOWLEDGED' | 'RESOLVED';
  message: string;
}

export class AlertManager {
  private static alerts: Map<string, OperationalAlert> = new Map();

  public static raiseAlert(params: {
    severity: AlertSeverity;
    source: string;
    error_code: string;
    affected_workflow: string;
    affected_roots: string[];
    circuit_breaker_state: 'CLOSED' | 'OPEN';
    runbook_reference: string;
    message: string;
  }): OperationalAlert {
    const alertKey = `${params.error_code}:${params.affected_workflow}:${params.source}`;
    const now = new Date().toISOString();

    const existing = this.alerts.get(alertKey);
    if (existing) {
      existing.last_seen = now;
      existing.occurrence_count += 1;
      existing.circuit_breaker_state = params.circuit_breaker_state;
      existing.message = params.message;
      return existing;
    }

    const alertId = `ALT_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newAlert: OperationalAlert = {
      alert_id: alertId,
      severity: params.severity,
      source: params.source,
      error_code: params.error_code,
      affected_workflow: params.affected_workflow,
      affected_roots: params.affected_roots,
      first_seen: now,
      last_seen: now,
      occurrence_count: 1,
      circuit_breaker_state: params.circuit_breaker_state,
      runbook_reference: params.runbook_reference,
      acknowledgement_state: 'UNACKNOWLEDGED',
      message: params.message
    };

    this.alerts.set(alertKey, newAlert);
    return newAlert;
  }

  public static getAlerts(severityFilter?: AlertSeverity): OperationalAlert[] {
    const list = Array.from(this.alerts.values());
    if (severityFilter) {
      return list.filter((a) => a.severity === severityFilter);
    }
    return list;
  }

  public static acknowledgeAlert(alertId: string): boolean {
    for (const alert of this.alerts.values()) {
      if (alert.alert_id === alertId) {
        alert.acknowledgement_state = 'ACKNOWLEDGED';
        return true;
      }
    }
    return false;
  }

  public static resolveAlert(alertId: string): boolean {
    for (const [key, alert] of this.alerts.entries()) {
      if (alert.alert_id === alertId) {
        alert.acknowledgement_state = 'RESOLVED';
        return true;
      }
    }
    return false;
  }

  public static clearAllAlerts(): void {
    this.alerts.clear();
  }
}
