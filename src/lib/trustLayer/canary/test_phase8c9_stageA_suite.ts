import fs from 'node:fs';
import { evaluateCandidateProvenance } from './provenanceEnforcementGate';
import { validateHttpSourceContent } from './httpSourceValidator';
import { validateEvidenceContentHash } from './provenanceAuditEngine';
import { validateEvidenceTimestamps } from './timestampValidator';
import { validateAtomicClaim } from './atomicFactValidator';

export interface StageASuiteResult {
  pass: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  testLog: string[];
}

export function runPhase8C9StageASuite(): StageASuiteResult {
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

  // Pre-check production catalog unmutated
  const catalogPath = 'C:/Users/Alpdeniz/.gemini/antigravity/scratch/tech-compare-test-workspace/src/lib/smartphonesData.json';
  const catalogBefore = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

  // Test 1: Valid 2xx non-empty authoritative source -> ALLOW
  const t1 = evaluateCandidateProvenance({
    candidateId: 'c1',
    targetRootId: 'samsung-samsung-galaxy-a57-5g-126',
    atomicFactDomain: 'spec.screen.type',
    claimValue: 'Super AMOLED',
    sourceType: 'MANUFACTURER_OFFICIAL_SPEC_PAGE',
    requestedUrl: 'https://www.samsung.com/tr/smartphones/galaxy-a57-5g/specs/',
    httpStatus: 200,
    contentOverride: '<html><body>Samsung Galaxy A57 5G Super AMOLED Display</body></html>',
    observedAt: new Date().toISOString(),
    policyVersion: 'enforcement_policy_v1.0.0',
    policyHash: 'p_hash',
    candidatePayloadHash: 'c_hash'
  });
  assert(t1.decisionState === 'ALLOW', '1. Valid 2xx non-empty authoritative source -> ALLOW');

  // Test 2: 200 with empty body -> BLOCK
  const t2 = evaluateCandidateProvenance({
    candidateId: 'c2',
    targetRootId: 'samsung-samsung-galaxy-a57-5g-126',
    atomicFactDomain: 'spec.screen.type',
    claimValue: 'Super AMOLED',
    sourceType: 'MANUFACTURER_OFFICIAL_SPEC_PAGE',
    requestedUrl: 'https://www.samsung.com/tr/smartphones/galaxy-a57-5g/specs/',
    httpStatus: 200,
    contentOverride: '',
    observedAt: new Date().toISOString(),
    policyVersion: 'enforcement_policy_v1.0.0',
    policyHash: 'p_hash',
    candidatePayloadHash: 'c_hash'
  });
  assert(t2.decisionState === 'BLOCK' && t2.httpValidation.errorCode === 'SOURCE_CONTENT_UNAVAILABLE', '2. 200 with empty body -> BLOCK (SOURCE_CONTENT_UNAVAILABLE)');

  // Test 3: 404 with HTML body -> BLOCK
  const t3 = evaluateCandidateProvenance({
    candidateId: 'c3',
    targetRootId: 'samsung-samsung-galaxy-a57-5g-126',
    atomicFactDomain: 'spec.screen.type',
    claimValue: 'Super AMOLED',
    sourceType: 'MANUFACTURER_OFFICIAL_SPEC_PAGE',
    requestedUrl: 'https://www.samsung.com/tr/smartphones/galaxy-a57-5g/specs/',
    httpStatus: 404,
    contentOverride: '<html><body>404 Not Found</body></html>',
    observedAt: new Date().toISOString(),
    policyVersion: 'enforcement_policy_v1.0.0',
    policyHash: 'p_hash',
    candidatePayloadHash: 'c_hash'
  });
  assert(t3.decisionState === 'BLOCK' && t3.httpValidation.errorCode === 'SOURCE_RETRIEVAL_INVALID', '3. 404 with HTML body -> BLOCK (SOURCE_RETRIEVAL_INVALID)');

  // Test 4: 403 response -> BLOCK
  const t4 = evaluateCandidateProvenance({
    candidateId: 'c4',
    targetRootId: 'samsung-samsung-galaxy-a57-5g-126',
    atomicFactDomain: 'spec.screen.type',
    claimValue: 'Super AMOLED',
    sourceType: 'MANUFACTURER_OFFICIAL_SPEC_PAGE',
    requestedUrl: 'https://www.samsung.com/tr/smartphones/galaxy-a57-5g/specs/',
    httpStatus: 403,
    contentOverride: '<html><body>403 Forbidden</body></html>',
    observedAt: new Date().toISOString(),
    policyVersion: 'enforcement_policy_v1.0.0',
    policyHash: 'p_hash',
    candidatePayloadHash: 'c_hash'
  });
  assert(t4.decisionState === 'BLOCK', '4. 403 response -> BLOCK');

  // Test 5: 500 response -> BLOCK
  const t5 = evaluateCandidateProvenance({
    candidateId: 'c5',
    targetRootId: 'samsung-samsung-galaxy-a57-5g-126',
    atomicFactDomain: 'spec.screen.type',
    claimValue: 'Super AMOLED',
    sourceType: 'MANUFACTURER_OFFICIAL_SPEC_PAGE',
    requestedUrl: 'https://www.samsung.com/tr/smartphones/galaxy-a57-5g/specs/',
    httpStatus: 500,
    contentOverride: '<html><body>500 Internal Error</body></html>',
    observedAt: new Date().toISOString(),
    policyVersion: 'enforcement_policy_v1.0.0',
    policyHash: 'p_hash',
    candidatePayloadHash: 'c_hash'
  });
  assert(t5.decisionState === 'BLOCK', '5. 500 response -> BLOCK');

  // Test 6: Null content -> BLOCK
  const t6 = validateEvidenceContentHash(null);
  assert(t6.valid === false && t6.errorCode === 'SOURCE_CONTENT_UNAVAILABLE', '6. Null content -> BLOCK (SOURCE_CONTENT_UNAVAILABLE)');

  // Test 7: Undefined content -> BLOCK
  const t7 = validateEvidenceContentHash(undefined);
  assert(t7.valid === false && t7.errorCode === 'SOURCE_CONTENT_UNAVAILABLE', '7. Undefined content -> BLOCK (SOURCE_CONTENT_UNAVAILABLE)');

  // Test 8: SHA256("") -> BLOCK
  const t8 = validateEvidenceContentHash('');
  assert(t8.valid === false && t8.hash !== 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', '8. SHA256("") digest rejected');

  // Test 9: Future timestamp -> BLOCK
  const t9 = validateEvidenceTimestamps('2030-01-01T00:00:00.000Z', new Date().toISOString(), new Date(), 300);
  assert(t9.valid === false && t9.errorCode === 'FUTURE_TIMESTAMP_INVALID', '9. Future timestamp -> BLOCK (FUTURE_TIMESTAMP_INVALID)');

  // Test 10: LOCAL_AS_UTC defect -> BLOCK
  const t10 = validateEvidenceTimestamps('2026-09-23T22:45:00.000Z', new Date().toISOString(), new Date(Date.UTC(2026, 8, 23, 19, 45, 0)), 300);
  assert(t10.valid === false && t10.errorCode === 'LOCAL_AS_UTC_DEFECT', '10. LOCAL_AS_UTC defect -> BLOCK');

  // Test 11: Correct UTC conversion -> PASS
  const t11 = validateEvidenceTimestamps(new Date().toISOString(), new Date().toISOString(), new Date(), 300);
  assert(t11.valid === true, '11. Correct UTC timestamp -> PASS');

  // Test 12: Atomic claim fully supported -> ALLOW
  const t12 = validateAtomicClaim({ atomicFactDomain: 'spec.screen.type', claimValue: 'Super AMOLED' });
  assert(t12.valid === true, '12. Atomic claim fully supported -> ALLOW');

  // Test 13: Unsupported frame-material component in screen.type -> BLOCK
  const t13 = validateAtomicClaim({ atomicFactDomain: 'spec.screen.type', claimValue: '6.7" Metal Çerçeve Super AMOLED' });
  assert(t13.valid === false && t13.errorCode === 'UNSUPPORTED_COMPONENT', '13. Frame material in screen.type -> BLOCK (UNSUPPORTED_COMPONENT)');

  // Test 14: Super AMOLED Plus without normalization rule -> BLOCK
  const t14 = validateAtomicClaim({ atomicFactDomain: 'spec.screen.type', claimValue: 'Super AMOLED Plus' });
  assert(t14.valid === false && t14.errorCode === 'TAXONOMY_NORMALIZATION_RULE_MISSING', '14. Super AMOLED Plus without rule -> BLOCK');

  // Test 15: Super AMOLED Plus with normalization rule -> ALLOW
  const t15 = validateAtomicClaim({ atomicFactDomain: 'spec.screen.type', claimValue: 'Super AMOLED Plus', normalizationRuleId: 'norm_samoled_plus_v1' });
  assert(t15.valid === true && t15.normalizationApplied === true, '15. Super AMOLED Plus with normalization rule -> ALLOW');

  // Test 16: Non-whitelisted composite domain -> BLOCK
  const t16 = validateAtomicClaim({ atomicFactDomain: 'spec.screen.composite_all', claimValue: 'All specs' });
  assert(t16.valid === false && t16.errorCode === 'ATOMIC_FACT_MODEL_REQUIRED', '16. Non-whitelisted composite domain -> BLOCK');

  // Test 17: Verify 0 production catalog mutations during Stage A
  const catalogAfter = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
  assert(JSON.stringify(catalogBefore) === JSON.stringify(catalogAfter), '17. Zero production catalog mutations during Stage A');

  return {
    pass: failedTests === 0,
    totalTests,
    passedTests,
    failedTests,
    testLog
  };
}

if (require.main === module) {
  const res = runPhase8C9StageASuite();
  console.log('=== PHASE 8-C.9 STAGE A TEST SUITE ===');
  console.log(`Passed: ${res.passedTests} / ${res.totalTests}`);
  for (const log of res.testLog) {
    console.log(log);
  }
}
