import { runPhase8C10AttestationSuite } from './test_phase8c10_attestation_suite';

export function runPhase8C10AttestationOrchestrator() {
  console.log('=== RUNNING PHASE 8-C.10 CANARY 01 PROVENANCE ATTESTATION ORCHESTRATOR ===');
  const result = runPhase8C10AttestationSuite();

  console.log(`Passed: ${result.passedTests} / ${result.totalTests}`);
  for (const log of result.testLog) {
    console.log(log);
  }

  if (!result.pass) {
    throw new Error('PHASE_8C10_SUITE_FAILED: Phase 8-C.10 verification suite failed!');
  }

  console.log('\n✅ PHASE 8-C.10 COMPLETED SUCCESSFULLY WITH VERDICT: CANARY_01_SECOND_REMEDIATION_REQUIRED!');
  return result;
}

if (require.main === module) {
  runPhase8C10AttestationOrchestrator();
}
