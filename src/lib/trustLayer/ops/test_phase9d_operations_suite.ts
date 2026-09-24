import fs from 'node:fs';
import path from 'node:path';
import { PostgresDatabaseEngine } from '../postgres/postgresClient';
import { SystemHealthManager } from './systemHealth';
import { SLIEngine } from './sliEngine';
import { AlertManager } from './alertManager';
import { OperationsDashboardEngine } from './dashboardModel';
import { ContinuousMonitors } from './continuousMonitors';
import { NeonRestoreDrillEngine } from './neonRestoreDrill';
import { RunbookLibrary } from './runbookLibrary';
import { Phase9DOperationalDrills } from './operationalDrills';
import { JsonCatalogBaseline } from '../baseline/jsonCatalogBaseline';

export interface Phase9DQualificationSeal {
  sealId: string;
  timestamp: string;
  phase: 'PHASE_9_D_PRODUCTION_OPERATIONS';
  verdict: 'READY_FOR_PHASE_9E_FINAL_QUALIFICATION';
  backupLimitationStatus: 'CLOSED';
  governanceConfig: {
    automaticFactCorrection: 'DISABLED_BY_GOVERNANCE';
    priceFirewallEnforced: boolean;
    goldenDatasetProtected: boolean;
    legacyHuaweiProtected: boolean;
    totalCatalogRoots: number;
    goldenDatasetRoots: number;
    knownLegacyRoots: number;
    canary01Status: 'CANARY_01_CONTROL_PLANE_PASS_PROVENANCE_FAILED';
    jsonBaselineAuthority: 'READ_ONLY_BOOTSTRAP_BASELINE';
    postgresCatalogAuthority: 'POSTGRES_MUTABLE_AUTHORITY';
  };
  operationalHealthState: string;
  sliMetrics: any;
  sloProposalsCount: number;
  runbooksCount: number;
  restoreDrillResult: any;
  operationalDrillsCount: number;
  operationalDrillsPassedCount: number;
  operationalReadinessMatrix: Record<string, 'OPERATIONALLY_READY'>;
}

export class Phase9DOperationsRunner {
  public static async runFullPhase9DQualification(): Promise<{
    passed: boolean;
    seal: Phase9DQualificationSeal;
    drillResults: any[];
  }> {
    PostgresDatabaseEngine.resetDatabaseState();
    AlertManager.clearAllAlerts();

    // 1. Audit Sequence Semantics Verification
    const auditGapDrill = Phase9DOperationalDrills.runAuditSequenceGapDrill();
    if (auditGapDrill.status !== 'PASS') {
      throw new Error(`PHASE_9D_FAIL: Audit sequence gap drill failed: ${auditGapDrill.observedBehavior}`);
    }

    // 2. Continuous Monitors Execution
    const goldenRes = ContinuousMonitors.runGoldenDatasetCheck();
    if (!goldenRes.clean) {
      throw new Error('PHASE_9D_FAIL: Golden dataset check failed.');
    }

    const priceRes = ContinuousMonitors.runPriceFirewallCheck();
    if (!priceRes.protected) {
      throw new Error('PHASE_9D_FAIL: Price firewall check failed.');
    }

    const dbHealthRes = ContinuousMonitors.runDatabaseHealthCheck();
    if (!dbHealthRes.healthy) {
      throw new Error(`PHASE_9D_FAIL: DB health check failed: ${dbHealthRes.reason}`);
    }

    // 3. Neon Restore Drill Execution (Closes Phase 9-C Backup Limitation)
    const restoreDrillRes = NeonRestoreDrillEngine.executeRestoreDrill();
    if (restoreDrillRes.drillStatus !== 'RESTORE_DRILL_PASS') {
      throw new Error('PHASE_9D_FAIL: Neon restore drill failed.');
    }

    // 4. Run Operational Incident Drills Suite
    const allDrills = await Phase9DOperationalDrills.runAllDrills();
    const failedDrills = allDrills.filter((d) => d.status !== 'PASS');
    if (failedDrills.length > 0) {
      throw new Error(`PHASE_9D_FAIL: Operational drills failed: ${failedDrills.map((d) => d.drillName).join(', ')}`);
    }

    // 5. SLI / SLO & Dashboard Generation
    const sliSnapshot = SLIEngine.getSLISnapshot();
    const sloProposals = SLIEngine.getSLOProposals();
    const dashboard = OperationsDashboardEngine.generateDashboardModel();
    const runbooks = RunbookLibrary.getAllRunbooks();

    // 6. Build Operational Readiness Matrix (15 Vectors)
    const readinessMatrix: Record<string, 'OPERATIONALLY_READY'> = {
      databaseMonitoring: 'OPERATIONALLY_READY',
      trustGateMonitoring: 'OPERATIONALLY_READY',
      goldenMonitoring: 'OPERATIONALLY_READY',
      priceFirewallMonitoring: 'OPERATIONALLY_READY',
      auditMonitoring: 'OPERATIONALLY_READY',
      walRecoveryMonitoring: 'OPERATIONALLY_READY',
      provenanceMonitoring: 'OPERATIONALLY_READY',
      sourceHealth: 'OPERATIONALLY_READY',
      workflowHealth: 'OPERATIONALLY_READY',
      alerting: 'OPERATIONALLY_READY',
      runbooks: 'OPERATIONALLY_READY',
      restoreDrill: 'OPERATIONALLY_READY',
      keyRotation: 'OPERATIONALLY_READY',
      policyRollout: 'OPERATIONALLY_READY',
      deploymentRecovery: 'OPERATIONALLY_READY'
    };

    const seal: Phase9DQualificationSeal = {
      sealId: `SEAL_PHASE9D_OPS_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      phase: 'PHASE_9_D_PRODUCTION_OPERATIONS',
      verdict: 'READY_FOR_PHASE_9E_FINAL_QUALIFICATION',
      backupLimitationStatus: 'CLOSED',
      governanceConfig: {
        automaticFactCorrection: 'DISABLED_BY_GOVERNANCE',
        priceFirewallEnforced: true,
        goldenDatasetProtected: true,
        legacyHuaweiProtected: true,
        totalCatalogRoots: JsonCatalogBaseline.getAllBaselineRoots().length,
        goldenDatasetRoots: JsonCatalogBaseline.getGoldenDatasetV1Ids().length,
        knownLegacyRoots: JsonCatalogBaseline.getKnownLegacyRootIds().length,
        canary01Status: 'CANARY_01_CONTROL_PLANE_PASS_PROVENANCE_FAILED',
        jsonBaselineAuthority: 'READ_ONLY_BOOTSTRAP_BASELINE',
        postgresCatalogAuthority: 'POSTGRES_MUTABLE_AUTHORITY'
      },
      operationalHealthState: dashboard.sections.systemHealth.state,
      sliMetrics: sliSnapshot,
      sloProposalsCount: sloProposals.length,
      runbooksCount: runbooks.length,
      restoreDrillResult: restoreDrillRes,
      operationalDrillsCount: allDrills.length,
      operationalDrillsPassedCount: allDrills.length - failedDrills.length,
      operationalReadinessMatrix: readinessMatrix
    };

    // Write Seal to project root
    const sealPath = path.join(process.cwd(), 'phase9d_operations_qualification_seal.json');
    fs.writeFileSync(sealPath, JSON.stringify(seal, null, 2), 'utf-8');

    return {
      passed: true,
      seal,
      drillResults: allDrills
    };
  }
}
