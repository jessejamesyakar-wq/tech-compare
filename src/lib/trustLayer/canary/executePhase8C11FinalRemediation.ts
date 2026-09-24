import { runPhase8C11FullSuite } from './test_phase8c11_final_remediation_suite';

export function runPhase8C11Orchestrator() {
  console.log('=== RUNNING PHASE 8-C.11 FINAL APPEND-ONLY PROVENANCE REMEDIATION ORCHESTRATOR ===');
  const result = runPhase8C11FullSuite();

  console.log(`Passed: ${result.passedTests} / ${result.totalTests}`);
  for (const log of result.testLog) {
    console.log(log);
  }

  if (!result.pass) {
    throw new Error('PHASE_8C11_SUITE_FAILED: Phase 8-C.11 verification suite failed!');
  }

  console.log('\n✅ PHASE 8-C.11 COMPLETED SUCCESSFULLY WITH VERDICT: CANARY_01_FINAL_ATTESTED_PASS!');
  return result;
}

if (require.main === module) {
  runPhase8C11Orchestrator();
}
