import fs from 'node:fs';
import path from 'node:path';
import { runPhase8C9StageASuite } from './test_phase8c9_stageA_suite';
import { runPhase8C10AttestationSuite } from './test_phase8c10_attestation_suite';
import { executeFinalCanary01Remediation } from './productionCanary01FinalRemediator';

export interface Phase8C11FullSuiteResult {
  pass: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  testLog: string[];
}

export function runPhase8C11FullSuite(): Phase8C11FullSuiteResult {
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

  // 1. Stage A Provenance Hardening Suite
  const stageARes = runPhase8C9StageASuite();
  assert(stageARes.pass === true, 'Phase 8-C.9 Stage A suite passed 100% (17/17 tests)');

  // 2. Phase 8-C.10 Read-Only Attestation Suite
  const attRes = runPhase8C10AttestationSuite();
  assert(attRes.pass === true, 'Phase 8-C.10 Read-Only Attestation suite passed 100% (16/16 tests)');

  // 3. Phase 8-C.11 Final Append-Only Remediation Execution
  const auditDir = `C:/Users/Alpdeniz/AceleEtme_Audits/phase8c11_final_attested_${Date.now()}`;
  const catalogPath = 'C:/Users/Alpdeniz/.gemini/antigravity/scratch/tech-compare-test-workspace/src/lib/smartphonesData.json';

  const remRes = executeFinalCanary01Remediation(auditDir, catalogPath);
  console.log('remRes output:', JSON.stringify(remRes, null, 2));
  assert(remRes.verdict === 'CANARY_01_FINAL_ATTESTED_PASS', 'Phase 8-C.11 Final Remediation executed with verdict CANARY_01_FINAL_ATTESTED_PASS');
  assert(remRes.sealData.postWriteVerification.ev1Preserved === true, 'Evidence #01 ev_samsung_a57_screen_01 historically preserved (INVALIDATED_PROVENANCE)');
  assert(remRes.sealData.postWriteVerification.ev2Preserved === true, 'Evidence #02 ev_samsung_a57_screen_02_corrected historically preserved (INVALIDATED_PROVENANCE)');
  assert(remRes.sealData.postWriteVerification.ev3Active === true, 'Evidence #03 ev_samsung_a57_screen_03_attested active (ACTIVE_VERIFIED)');
  assert(remRes.sealData.postWriteVerification.totalEvidenceCount === 3, 'Total evidence count on target root is 3 (2 historical + 1 active)');
  assert(remRes.sealData.postWriteVerification.activeEvidenceCount === 1, 'Active evidence count on target root is exactly 1');
  assert(remRes.sealData.postWriteVerification.rootCountMaintained905 === true, 'Root count maintained at 905');
  assert(remRes.sealData.postWriteVerification.productValueUnchanged === true, 'Product displayed specification value 100% UNCHANGED');
  assert(remRes.sealData.postWriteVerification.goldenDataset83Unchanged === true, '83 Golden Dataset roots 100% UNCHANGED');
  assert(remRes.sealData.postWriteVerification.priceStateUnchanged === true, 'Price state 100% UNCHANGED');
  assert(remRes.sealData.postWriteVerification.crossBrandIsolationClean === true, 'Cross-brand isolation clean (0 leaks)');
  assert(remRes.sealData.postWriteVerification.unexpectedChangedEntitiesCount === 0, 'Unexpected changed entities count is 0');
  assert(remRes.sealData.idempotencyResult.secondAttestedCreated === false, 'Idempotency re-run verified: 0 second attested evidence created');
  assert(remRes.sealData.goldenRegressionResult.goldenSuitePass === true, 'Golden Dataset regression suite passed (83/83 clean)');

  // Verify seal file created
  const sealFilePath = path.join(auditDir, 'phase8c_canary01_final_attested_seal.json');
  assert(fs.existsSync(sealFilePath), 'phase8c_canary01_final_attested_seal.json exists on disk');

  return {
    pass: failedTests === 0,
    totalTests,
    passedTests,
    failedTests,
    testLog
  };
}

if (require.main === module) {
  const res = runPhase8C11FullSuite();
  console.log('=== PHASE 8-C.11 FINAL ATTESTED REMEDIATION SUITE ===');
  console.log(`Passed: ${res.passedTests} / ${res.totalTests}`);
  for (const log of res.testLog) {
    console.log(log);
  }
}
