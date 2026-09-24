import { executePhase8C7CanaryReadiness } from './executePhase8C7CanaryReadiness';
import { runPhase8C7TestSuite } from './test_phase8c7_suite';

export function runPhase8C7Test(timestamp: number = Date.now()) {
  const auditDir = `C:/Users/Alpdeniz/AceleEtme_Audits/phase8c7_canary_readiness_${timestamp}`;
  const catalogPath = 'C:/Users/Alpdeniz/.gemini/antigravity/scratch/tech-compare-test-workspace/src/lib/smartphonesData.json';

  console.log('=== RUNNING PHASE 8-C.7 BYPASS CLOSURE & CANARY READINESS TEST SUITE ===');
  const suiteResult = runPhase8C7TestSuite();
  console.log(`Passed: ${suiteResult.passedTests} / ${suiteResult.totalTests}`);
  for (const log of suiteResult.testLog) {
    console.log(log);
  }

  if (!suiteResult.pass) {
    throw new Error('PHASE_8C7_SUITE_FAILED: Bypass closure unit/integration tests failed!');
  }

  console.log('\n--- EXECUTING PHASE 8-C.7 BYPASS CLOSURE & CANARY READINESS SEAL ---');
  const result = executePhase8C7CanaryReadiness(auditDir, catalogPath);

  console.log('\n=== PHASE 8-C.7 CANARY READINESS EXECUTIVE SUMMARY ===');
  console.log('Timestamp:', result.timestamp);
  console.log('Canary Readiness Seal Hash:', result.canaryReadinessSeal.sealHash.substring(0, 16) + '...');
  console.log('Catalog Root Count Before:', result.catalogRootCountBefore, '(expected 905)');
  console.log('Catalog Root Count After:', result.catalogRootCountAfter, '(expected 905)');
  console.log('Catalog Fingerprint Match:', result.catalogFingerprintBefore === result.catalogFingerprintAfter ? '100% IDENTICAL' : 'MUTATION DETECTED');
  console.log('Price State Hash Match:', result.priceStateHashBefore === result.priceStateHashAfter ? '100% IDENTICAL' : 'MUTATION DETECTED');
  console.log('Zero Mutation Verified:', result.zeroMutationVerified ? 'PASS' : 'FAIL');
  console.log('Golden Suite Pass:', result.goldenRegressionReport.goldenSuitePass ? 'PASS (83/83 clean)' : 'FAIL');
  console.log('Write Path Inventory Status:', result.inventoryReport.inventoryStatus);
  console.log('Bypass Risk Count:', result.inventoryReport.bypassRiskCount, '(expected 0)');
  console.log('Unknown Path Count:', result.inventoryReport.unknownCount, '(expected 0)');
  console.log('Canary Dry Run Result:', result.canaryDryRunResult.status, '(expected CANARY_DRY_RUN_PASS)');
  console.log('Circuit Breaker Status:', result.circuitBreakerStatus);
  console.log('Chained Audit Log Valid:', result.auditChainValid ? 'PASS (SHA-256 Chain Intact)' : 'FAIL');
  console.log('Readiness Verdict:', result.readinessVerdict, '(expected READY_FOR_SINGLE_PATH_CANARY)');

  if (
    !result.zeroMutationVerified ||
    result.catalogRootCountAfter !== 905 ||
    !result.goldenRegressionReport.goldenSuitePass ||
    result.inventoryReport.bypassRiskCount !== 0 ||
    result.readinessVerdict !== 'READY_FOR_SINGLE_PATH_CANARY'
  ) {
    throw new Error('PHASE_8C7_TEST_FAILED: Canary readiness verdict or invariants violated');
  }

  console.log('\n✅ PHASE 8-C.7 BYPASS CLOSURE & CANARY READINESS SEAL COMPLETED SUCCESSFULLY!');
  return result;
}

if (require.main === module) {
  runPhase8C7Test();
}
