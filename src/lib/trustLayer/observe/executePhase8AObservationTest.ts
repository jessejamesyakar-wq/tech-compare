import { executePhase8AObservation } from './executePhase8AObservation';
import { runPhase8A2TestSuite } from './test_phase8a2_suite';

export function runPhase8A2ObservationTest(timestamp: number = Date.now()) {
  const auditDir = `C:/Users/Alpdeniz/AceleEtme_Audits/phase8a2_trust_control_plane_${timestamp}`;
  const catalogPath = 'C:/Users/Alpdeniz/.gemini/antigravity/scratch/tech-compare-test-workspace/src/lib/smartphonesData.json';

  console.log('=== RUNNING PHASE 8-A.2 UNIT & REGRESSION TEST SUITE ===');
  const suiteResult = runPhase8A2TestSuite();
  console.log(`Passed: ${suiteResult.passedTests} / ${suiteResult.totalTests}`);
  for (const log of suiteResult.testLog) {
    console.log(log);
  }

  if (!suiteResult.pass) {
    throw new Error('PHASE_8A2_SUITE_FAILED: Unit/regression tests failed!');
  }

  console.log('\n--- STARTING PHASE 8-A.2 TRUST CONTROL PLANE OBSERVATION ---');
  const result = executePhase8AObservation(auditDir, catalogPath);

  console.log('\n=== PHASE 8-A.2 OBSERVATION EXECUTIVE SUMMARY ===');
  console.log('Timestamp:', result.timestamp);
  console.log('Catalog Root Count Before:', result.catalogRootCountBefore, '(expected 905)');
  console.log('Catalog Root Count After:', result.catalogRootCountAfter, '(expected 905)');
  console.log('Catalog Fingerprint Match:', result.catalogFingerprintBefore === result.catalogFingerprintAfter ? '100% IDENTICAL' : 'MUTATION DETECTED');
  console.log('Price State Hash Match:', result.priceStateHashBefore === result.priceStateHashAfter ? '100% IDENTICAL' : 'MUTATION DETECTED');
  console.log('Zero Mutation Verified:', result.zeroMutationVerified ? 'PASS' : 'FAIL');
  console.log('Golden Dataset Root Count:', result.goldenManifest.rootCount, '(expected 83)');
  console.log('Golden Suite Pass:', result.goldenRegressionReport.goldenSuitePass ? 'PASS (83/83 clean)' : 'FAIL');
  console.log('Price Protection Pass:', result.priceImmutabilityReport.priceProtectionState === 'IMMUTABLE_CLEAN' ? 'PASS' : 'FAIL');
  console.log('Source Authority Status:', result.authorityReport.auditStatus);
  console.log('Evidence Conflicts Found:', result.conflictReport.totalConflicts);
  console.log('Source Freshness State:', result.freshnessReport.overallFreshnessState);
  console.log('Real Identity Collisions Found:', result.identityCollisionReport.realCollisionsCount);
  console.log('Known Legacy Huawei Duplicate Candidates:', result.identityCollisionReport.legacyDuplicatesCount);
  console.log('Cross Brand Real Violations:', result.crossBrandReport.realViolationsCount);
  console.log('False Positives Eliminated:', result.crossBrandReport.falsePositivesEliminatedCount, '(29/29 eliminated)');
  console.log('Chained Audit Log Valid:', result.auditChainValid ? 'PASS (SHA-256 Chain Intact)' : 'FAIL');
  console.log('10-Dimensional Health Overall State:', result.healthReport.overallState);
  console.log('Deployment Gate Decision (REPORT_ONLY):', result.deploymentGateReport.gateDecision);
  console.log('Readiness Verdict:', result.readinessVerdict, '(expected READY_FOR_8B_WITH_KNOWN_LEGACY_FINDINGS)');

  console.log('\n=== 10-DIMENSIONAL CATALOG HEALTH DETAILED SCORECARD ===');
  for (const dim of result.healthReport.dimensions) {
    console.log(`- [${dim.state}] ${dim.dimensionName}: ${dim.details}`);
  }

  if (
    !result.zeroMutationVerified ||
    result.catalogRootCountAfter !== 905 ||
    !result.goldenRegressionReport.goldenSuitePass ||
    result.readinessVerdict !== 'READY_FOR_8B_WITH_KNOWN_LEGACY_FINDINGS'
  ) {
    throw new Error('PHASE_8A2_OBSERVATION_FAILED: Readiness verdict or invariants violated');
  }

  console.log('\n✅ PHASE 8-A.2 TRUST CONTROL PLANE CONTRACT REFINEMENT COMPLETED SUCCESSFULLY!');
  return result;
}

if (require.main === module) {
  runPhase8A2ObservationTest();
}
