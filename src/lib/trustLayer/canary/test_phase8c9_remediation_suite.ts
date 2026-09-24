import fs from 'node:fs';
import path from 'node:path';
import { runPhase8C9StageASuite } from './test_phase8c9_stageA_suite';
import { executeCanary01Remediation } from './productionCanary01Remediator';

export interface Phase8C9FullSuiteResult {
  pass: boolean;
  stageAPassed: boolean;
  stageBPassed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  testLog: string[];
}

export function runPhase8C9FullSuite(): Phase8C9FullSuiteResult {
  const testLog: string[] = [];
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      testLog.push(`[PASS] ${testName}`);
    } else {
      failedTests++;
      testLog.push(`[FAIL] ${testName}`);
    }
  }

  // 1. STAGE A VERIFICATION (Must pass 100% before Stage B!)
  const stageARes = runPhase8C9StageASuite();
  assert(stageARes.pass === true, 'STAGE A: Provenance Contract Hardening suite passed 100% (17/17 tests)');

  if (!stageARes.pass) {
    return {
      pass: false,
      stageAPassed: false,
      stageBPassed: false,
      totalTests,
      passedTests,
      failedTests,
      testLog
    };
  }

  // 2. STAGE B REMEDIATION EXECUTION
  const auditDir = `C:/Users/Alpdeniz/AceleEtme_Audits/phase8c9_remediation_${Date.now()}`;
  const catalogPath = 'C:/Users/Alpdeniz/.gemini/antigravity/scratch/tech-compare-test-workspace/src/lib/smartphonesData.json';

  const remRes = executeCanary01Remediation(auditDir, catalogPath);

  assert(remRes.verdict === 'CANARY_01_FULLY_REPAIRED_AND_SEALED', 'STAGE B: Remediation executed with verdict CANARY_01_FULLY_REPAIRED_AND_SEALED');
  assert(remRes.sealData.postWriteVerification.originalPreserved === true, 'Original defective evidence ev_samsung_a57_screen_01 historically preserved (INVALIDATED_PROVENANCE)');
  assert(remRes.sealData.postWriteVerification.correctedActive === true, 'Corrected evidence ev_samsung_a57_screen_02_corrected appended (ACTIVE_VERIFIED)');
  assert(remRes.sealData.postWriteVerification.totalEvidenceCount === 2, 'Total evidence count on target root is 2 (1 historical + 1 active)');
  assert(remRes.sealData.postWriteVerification.activeEvidenceCount === 1, 'Active evidence count on target root is exactly 1');
  assert(remRes.sealData.postWriteVerification.rootCountMaintained905 === true, 'Root count maintained at 905');
  assert(remRes.sealData.postWriteVerification.productValueUnchanged === true, 'Product displayed specification value 100% UNCHANGED');
  assert(remRes.sealData.postWriteVerification.goldenDataset83Unchanged === true, '83 Golden Dataset roots 100% UNCHANGED');
  assert(remRes.sealData.postWriteVerification.priceStateUnchanged === true, 'Price state 100% UNCHANGED');
  assert(remRes.sealData.postWriteVerification.crossBrandIsolationClean === true, 'Cross-brand isolation clean (0 leaks)');
  assert(remRes.sealData.idempotencyResult.secondCorrectedCreated === false, 'Idempotency re-run verified: 0 second corrected evidence created');
  assert(remRes.sealData.goldenRegressionResult.goldenSuitePass === true, 'Golden Dataset regression suite passed (83/83 clean)');

  // Verify seal file created
  const sealFilePath = path.join(auditDir, 'phase8c_canary01_final_provenance_seal.json');
  assert(fs.existsSync(sealFilePath), 'phase8c_canary01_final_provenance_seal.json exists on disk');

  return {
    pass: failedTests === 0,
    stageAPassed: true,
    stageBPassed: failedTests === 0,
    totalTests,
    passedTests,
    failedTests,
    testLog
  };
}

if (require.main === module) {
  const res = runPhase8C9FullSuite();
  console.log('=== PHASE 8-C.9 FULL SUITE (STAGE A + STAGE B) ===');
  console.log(`Passed: ${res.passedTests} / ${res.totalTests}`);
  for (const log of res.testLog) {
    console.log(log);
  }
}
