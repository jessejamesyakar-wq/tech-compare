import { executePhase8CEnforcement } from './executePhase8CEnforcement';
import { runPhase8CTestSuite } from './test_phase8c_suite';

export function runPhase8CTest(timestamp: number = Date.now()) {
  const auditDir = `C:/Users/Alpdeniz/AceleEtme_Audits/phase8c_pre_write_enforcement_${timestamp}`;
  const catalogPath = 'C:/Users/Alpdeniz/.gemini/antigravity/scratch/tech-compare-test-workspace/src/lib/smartphonesData.json';

  console.log('=== RUNNING PHASE 8-C PRE-WRITE ENFORCEMENT UNIT & INTEGRATION TEST SUITE ===');
  const suiteResult = runPhase8CTestSuite();
  console.log(`Passed: ${suiteResult.passedTests} / ${suiteResult.totalTests}`);
  for (const log of suiteResult.testLog) {
    console.log(log);
  }

  if (!suiteResult.pass) {
    throw new Error('PHASE_8C_SUITE_FAILED: Pre-write enforcement unit/integration tests failed!');
  }

  console.log('\n--- EXECUTING PHASE 8-C CONTROLLED PRE-WRITE ENFORCEMENT ---');
  const result = executePhase8CEnforcement(auditDir, catalogPath);

  console.log('\n=== PHASE 8-C CONTROLLED PRE-WRITE ENFORCEMENT EXECUTIVE SUMMARY ===');
  console.log('Timestamp:', result.timestamp);
  console.log('Baseline Seal Hash:', result.baselineSeal.sealHash.substring(0, 16) + '...');
  console.log('Catalog Root Count Before:', result.catalogRootCountBefore, '(expected 905)');
  console.log('Catalog Root Count After:', result.catalogRootCountAfter, '(expected 905)');
  console.log('Catalog Fingerprint Match:', result.catalogFingerprintBefore === result.catalogFingerprintAfter ? '100% IDENTICAL' : 'MUTATION DETECTED');
  console.log('Price State Hash Match:', result.priceStateHashBefore === result.priceStateHashAfter ? '100% IDENTICAL' : 'MUTATION DETECTED');
  console.log('Zero Mutation Verified:', result.zeroMutationVerified ? 'PASS' : 'FAIL');
  console.log('Golden Suite Pass:', result.goldenRegressionReport.goldenSuitePass ? 'PASS (83/83 clean)' : 'FAIL');
  console.log('Bypass Security Audit Status:', result.bypassReport.overallSecurityStatus);
  console.log('Circuit Breaker Status:', result.circuitBreakerStatus);
  console.log('Candidates Evaluated in Test Runs:', result.metrics.candidatesEvaluated);
  console.log('Candidates Blocked (Pre-Write):', result.metrics.blocked);
  console.log('Candidates Staged Outside Public Catalog:', result.metrics.stagedCandidates);
  console.log('Golden Dataset Mutation Attempts Blocked:', result.metrics.goldenBlocks);
  console.log('Price Firewall Mutation Attempts Blocked:', result.metrics.priceFirewallAttempts);
  console.log('Chained Audit Log Valid:', result.auditChainValid ? 'PASS (SHA-256 Chain Intact)' : 'FAIL');
  console.log('Deployment Gate Decision (REPORT_ONLY):', result.deploymentGateReport.gateDecision);
  console.log('Readiness Verdict:', result.readinessVerdict, '(expected READY_FOR_8C_CANARY_WITH_KNOWN_LEGACY)');

  if (
    !result.zeroMutationVerified ||
    result.catalogRootCountAfter !== 905 ||
    !result.goldenRegressionReport.goldenSuitePass ||
    result.readinessVerdict !== 'READY_FOR_8C_CANARY_WITH_KNOWN_LEGACY'
  ) {
    throw new Error('PHASE_8C_TEST_FAILED: Readiness verdict or invariants violated');
  }

  console.log('\n✅ PHASE 8-C CONTROLLED PRE-WRITE ENFORCEMENT COMPLETED SUCCESSFULLY!');
  return result;
}

if (require.main === module) {
  runPhase8CTest();
}
