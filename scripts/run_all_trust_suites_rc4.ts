import { runGoldenCorrectionSuite } from '../src/lib/trustLayer/test_golden_correction_suite';
import { runCameraV2Suite } from '../src/lib/trustLayer/test_camera_v2_suite';
import { runRetailerRoboPenguSuite } from '../src/lib/trustLayer/test_retailer_robopengu_suite';
import { runMutationScopeGuardSuite } from '../src/lib/trustLayer/test_mutation_scope_guard_suite';

console.log('====================================================');
console.log('🛡️  RC_WAVE4 TRUST AND GOVERNANCE SUITE RUNNER  🛡️');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runSuite(name: string, fn: () => { results: any[]; summary: { total: number; passed: number; failed: number } }) {
  console.log(`--- RUNNING: ${name} ---`);
  try {
    const { results, summary } = fn();
    results.forEach((r) => {
      console.log(`  ${r.passed ? '✅' : '❌'} ${r.name} ${r.error ? `(Error: ${r.error})` : ''}`);
    });
    console.log(`  Result: ${summary.passed}/${summary.total} passed (${summary.failed} failed)\n`);
    totalTests += summary.total;
    passedTests += summary.passed;
    failedTests += summary.failed;
  } catch (err: any) {
    console.error(`  ❌ Suite execution failed:`, err.message);
    failedTests++;
  }
}

runSuite('Golden Dataset Correction Suite', runGoldenCorrectionSuite);
runSuite('Camera Spec V2 Suite', runCameraV2Suite);
runSuite('Retailers & RoboPengu Price Suite', runRetailerRoboPenguSuite);
runSuite('Mutation Scope Guard Suite', runMutationScopeGuardSuite);

console.log('====================================================');
console.log(`TOTAL SUITE SUMMARY: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
console.log('====================================================');

if (failedTests > 0) {
  process.exit(1);
}
