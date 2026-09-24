import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { executeProductionCanary01 } from './productionCanary01Runner';

export interface Canary01SuiteResult {
  pass: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  testLog: string[];
}

export function runPhase8CCanary01TestSuite(): Canary01SuiteResult {
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

  const timestamp = Date.now();
  const auditDir = `C:/Users/Alpdeniz/AceleEtme_Audits/canary01_${timestamp}`;
  const catalogPath = 'C:/Users/Alpdeniz/.gemini/antigravity/scratch/tech-compare-test-workspace/src/lib/smartphonesData.json';

  // Read catalog before canary run to verify initial state
  const rawBefore = fs.readFileSync(catalogPath, 'utf-8');
  const catalogBefore: any[] = JSON.parse(rawBefore);
  assert(catalogBefore.length === 905, 'Catalog root count is 905 before Canary 01');

  // Execute Production Canary 01
  const canaryRes = executeProductionCanary01(auditDir, catalogPath);

  assert(canaryRes.verdict === 'CANARY_01_PASS', 'Production Canary 01 executed with verdict CANARY_01_PASS');
  assert(canaryRes.seal.authorizedDelta.evidenceAddedCount === 1, 'Exactly 1 evidence record added to target root');
  assert(canaryRes.seal.authorizedDelta.displayedFactValueChangesCount === 0, 'Zero user-facing fact value changes');
  assert(canaryRes.seal.authorizedDelta.priceMutationsCount === 0, 'Zero price mutations');
  assert(canaryRes.seal.authorizedDelta.rootCountDelta === 0, 'Zero root count delta (905 -> 905)');
  assert(canaryRes.seal.postWriteVerification.goldenDataset83Unchanged === true, '83 Golden Dataset roots remain 100% unchanged');
  assert(canaryRes.seal.postWriteVerification.protectedReferences56Unchanged === true, '56 Protected references remain 100% unchanged');
  assert(canaryRes.seal.postWriteVerification.huaweiLegacyPairs4Unchanged === true, '4 Huawei legacy pairs remain 100% unchanged');
  assert(canaryRes.seal.postWriteVerification.priceStateUnchanged === true, 'Price state remains 100% unchanged');
  assert(canaryRes.seal.postWriteVerification.crossBrandIsolationClean === true, 'Cross-brand isolation clean (0 real leaks)');
  assert(canaryRes.seal.postWriteVerification.unexpectedChangedEntitiesCount === 0, 'Unexpected changed entities count is 0');
  assert(canaryRes.seal.idempotencyResult.secondEvidenceCreated === false, 'Idempotency test passed: 0 second evidence records created');
  assert(canaryRes.seal.goldenRegressionResult.goldenSuitePass === true, 'Golden Dataset regression suite passed (83/83 clean)');

  // Verify seal file created
  const sealFilePath = path.join(auditDir, 'phase8c_production_canary01_seal.json');
  assert(fs.existsSync(sealFilePath), 'phase8c_production_canary01_seal.json exists on disk');

  return {
    pass: failedTests === 0,
    totalTests,
    passedTests,
    failedTests,
    testLog
  };
}

if (require.main === module) {
  const result = runPhase8CCanary01TestSuite();
  console.log(`=== PHASE 8-C PRODUCTION CANARY 01 TEST SUITE ===`);
  console.log(`Passed: ${result.passedTests} / ${result.totalTests}`);
  console.log(`Failed: ${result.failedTests}`);
  for (const log of result.testLog) {
    console.log(log);
  }
}
