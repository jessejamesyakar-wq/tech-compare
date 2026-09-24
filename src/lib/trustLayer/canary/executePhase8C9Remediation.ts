import { runPhase8C9FullSuite } from './test_phase8c9_remediation_suite';

export function runPhase8C9Orchestrator() {
  console.log('=== RUNNING PHASE 8-C.9 PROVENANCE HARDENING & REMEDIATION ORCHESTRATOR ===');
  const result = runPhase8C9FullSuite();

  console.log(`Passed: ${result.passedTests} / ${result.totalTests}`);
  for (const log of result.testLog) {
    console.log(log);
  }

  if (!result.pass) {
    throw new Error('PHASE_8C9_SUITE_FAILED: Phase 8-C.9 verification suite failed!');
  }

  console.log('\n✅ PHASE 8-C.9 COMPLETED SUCCESSFULLY WITH VERDICT: CANARY_01_FULLY_REPAIRED_AND_SEALED!');
  return result;
}

if (require.main === module) {
  runPhase8C9Orchestrator();
}
