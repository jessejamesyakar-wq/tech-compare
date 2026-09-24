import { executePhase8BShadowQuarantine } from './executePhase8BShadowQuarantine';
import { runPhase8BTestSuite } from './test_phase8b_suite';

export function runPhase8BTest(timestamp: number = Date.now()) {
  const auditDir = `C:/Users/Alpdeniz/AceleEtme_Audits/phase8b_shadow_quarantine_${timestamp}`;
  const catalogPath = 'C:/Users/Alpdeniz/.gemini/antigravity/scratch/tech-compare-test-workspace/src/lib/smartphonesData.json';

  console.log('=== RUNNING PHASE 8-B SHADOW QUARANTINE UNIT & INTEGRATION TEST SUITE ===');
  const suiteResult = runPhase8BTestSuite();
  console.log(`Passed: ${suiteResult.passedTests} / ${suiteResult.totalTests}`);
  for (const log of suiteResult.testLog) {
    console.log(log);
  }

  if (!suiteResult.pass) {
    throw new Error('PHASE_8B_SUITE_FAILED: Unit/integration tests failed!');
  }

  console.log('\n--- EXECUTING PHASE 8-B SHADOW QUARANTINE & DECISION INFRASTRUCTURE ---');
  const result = executePhase8BShadowQuarantine(auditDir, catalogPath);

  console.log('\n=== PHASE 8-B SHADOW QUARANTINE EXECUTIVE SUMMARY ===');
  console.log('Timestamp:', result.timestamp);
  console.log('Baseline Seal Hash:', result.baselineSeal.sealHash.substring(0, 16) + '...');
  console.log('Catalog Root Count Before:', result.catalogRootCountBefore, '(expected 905)');
  console.log('Catalog Root Count After:', result.catalogRootCountAfter, '(expected 905)');
  console.log('Catalog Fingerprint Match:', result.catalogFingerprintBefore === result.catalogFingerprintAfter ? '100% IDENTICAL' : 'MUTATION DETECTED');
  console.log('Price State Hash Match:', result.priceStateHashBefore === result.priceStateHashAfter ? '100% IDENTICAL' : 'MUTATION DETECTED');
  console.log('Store Offers Hash Match:', result.storeOffersHashBefore === result.storeOffersHashAfter ? '100% IDENTICAL' : 'MUTATION DETECTED');
  console.log('Price History Hash Match:', result.priceHistoryHashBefore === result.priceHistoryHashAfter ? '100% IDENTICAL' : 'MUTATION DETECTED');
  console.log('Zero Mutation Verified:', result.zeroMutationVerified ? 'PASS' : 'FAIL');
  console.log('Golden Suite Pass:', result.goldenRegressionReport.goldenSuitePass ? 'PASS (83/83 clean)' : 'FAIL');
  console.log('Known Legacy Registry Status:', result.knownLegacyAudit.status, '(4 Huawei duplicate pairs intact)');
  console.log('Shadow Queue Total Items:', result.shadowQueueItems.length);
  console.log('Duplicate Queue Events Prevented:', result.metrics.duplicateQueueEventsPrevented);
  console.log('Total Shadow Quarantined (Real Failure):', result.metrics.totalShadowQuarantined);
  console.log('Known Legacy Tracked Items:', result.metrics.knownLegacyFindingsCount);
  console.log('Chained Audit Log Valid:', result.auditChainValid ? 'PASS (SHA-256 Chain Intact)' : 'FAIL');
  console.log('Deployment Gate Decision (REPORT_ONLY):', result.deploymentGateReport.gateDecision);
  console.log('Readiness Verdict:', result.readinessVerdict, '(expected READY_FOR_8C_WITH_KNOWN_LEGACY_FINDINGS)');

  console.log('\n=== DECISIONS BREAKDOWN BY SEVERITY ===');
  console.log('- Critical:', result.metrics.bySeverity.critical);
  console.log('- High:', result.metrics.bySeverity.high);
  console.log('- Medium:', result.metrics.bySeverity.medium);
  console.log('- Low:', result.metrics.bySeverity.low);
  console.log('- Info:', result.metrics.bySeverity.info);

  if (
    !result.zeroMutationVerified ||
    result.catalogRootCountAfter !== 905 ||
    !result.goldenRegressionReport.goldenSuitePass ||
    result.readinessVerdict !== 'READY_FOR_8C_WITH_KNOWN_LEGACY_FINDINGS'
  ) {
    throw new Error('PHASE_8B_TEST_FAILED: Readiness verdict or invariants violated');
  }

  console.log('\n✅ PHASE 8-B SHADOW QUARANTINE & DECISION INFRASTRUCTURE COMPLETED SUCCESSFULLY!');
  return result;
}

if (require.main === module) {
  runPhase8BTest();
}
