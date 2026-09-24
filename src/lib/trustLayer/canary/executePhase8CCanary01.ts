import { runPhase8CCanary01TestSuite } from './test_phase8c_canary01_suite';

export function runPhase8CCanary01Runner() {
  console.log('=== RUNNING PHASE 8-C PRODUCTION CANARY 01 EXECUTION & VERIFICATION SUITE ===');
  const result = runPhase8CCanary01TestSuite();

  console.log(`Passed: ${result.passedTests} / ${result.totalTests}`);
  for (const log of result.testLog) {
    console.log(log);
  }

  if (!result.pass) {
    throw new Error('PHASE_8C_CANARY01_SUITE_FAILED: Production Canary 01 verification suite failed!');
  }

  console.log('\n✅ PHASE 8-C PRODUCTION CANARY 01 COMPLETED SUCCESSFULLY WITH VERDICT: CANARY_01_PASS!');
  return result;
}

if (require.main === module) {
  runPhase8CCanary01Runner();
}
