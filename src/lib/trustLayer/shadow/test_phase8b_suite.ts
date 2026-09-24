import { generatePhase8ABaselineSeal } from './phase8aBaselineSeal';
import { getKnownLegacyRegistry, auditKnownLegacyRegistryDisappearance } from './knownLegacyRegistry';
import { evaluateQuarantineDecision } from './quarantineDecisionEngine';
import { ShadowQuarantineQueue } from './shadowQuarantineQueue';
import { simulateHumanReview } from './humanReviewWorkflow';
import { runPhase8A2TestSuite } from '../observe/test_phase8a2_suite';

export function runPhase8BTestSuite(): { pass: boolean; totalTests: number; passedTests: number; failedTests: number; testLog: string[] } {
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

  // 1. Run all prior Phase 8-A / 8-A.2 tests first to ensure zero regressions!
  const phase8a2Res = runPhase8A2TestSuite();
  assert(phase8a2Res.pass === true, 'All Phase 8-A.2 regression tests continue to pass');

  // 2. Baseline Seal Verification
  const seal = generatePhase8ABaselineSeal();
  assert(
    seal.catalogRootCount === 905 && seal.goldenRootCount === 83 && seal.knownLegacyFindingCount === 4,
    'Phase 8-A Baseline Seal captures 905 catalog roots, 83 golden roots, and 4 known legacy findings'
  );

  // 3. Known Legacy Registry & Disappearance Detection
  const registry = getKnownLegacyRegistry();
  assert(registry.totalFindingsCount === 4 && registry.totalRootsCount === 8, 'Known Legacy Registry seeded with 4 Huawei duplicate pairs (8 roots)');

  const disapCheck = auditKnownLegacyRegistryDisappearance(['leg_huawei_p40_pro', 'leg_huawei_y9', 'leg_huawei_pura_70_pro', 'leg_huawei_mate_60_pro']);
  assert(disapCheck.status === 'ALL_INTACT', 'Known Legacy Registry intact check returns ALL_INTACT');

  // 4. Fail-Closed Trigger: True Foreign Root Contamination -> SHADOW_QUARANTINE / HIGH
  const decCrossBrand = evaluateQuarantineDecision({
    rootId: 'samsung-fake',
    brand: 'Samsung',
    detector: 'crossBrandIsolationObserver',
    findingClass: 'REAL_CROSS_BRAND_REFERENCE',
    description: 'Samsung product contains Apple A17 Pro spec',
    isGolden: false
  });
  assert(
    decCrossBrand.decisionState === 'SHADOW_QUARANTINE' && decCrossBrand.severity === 'HIGH',
    'Real cross-brand reference triggers SHADOW_QUARANTINE / HIGH'
  );

  // 5. Fail-Closed Trigger: Namespace Violation -> SHADOW_QUARANTINE / CRITICAL
  const decNamespace = evaluateQuarantineDecision({
    rootId: 'samsung-fake-2',
    brand: 'Samsung',
    detector: 'crossBrandIsolationObserver',
    findingClass: 'REAL_NAMESPACE_VIOLATION',
    description: 'Samsung product has manufacturer set to Apple',
    isGolden: false
  });
  assert(
    decNamespace.decisionState === 'SHADOW_QUARANTINE' && decNamespace.severity === 'CRITICAL',
    'Real namespace violation triggers SHADOW_QUARANTINE / CRITICAL'
  );

  // 6. Non-Trigger: Huawei Legacy Duplicate Candidate -> KNOWN_LEGACY / MEDIUM
  const decHuawei = evaluateQuarantineDecision({
    rootId: 'huawei-huawei-p40-pro',
    brand: 'Huawei',
    detector: 'identityCollisionObserver',
    findingClass: 'LEGACY_DUPLICATE_CANDIDATE',
    description: 'Huawei trailing-space legacy duplicate root',
    isGolden: false
  });
  assert(
    decHuawei.decisionState === 'KNOWN_LEGACY' && decHuawei.severity === 'MEDIUM',
    'Huawei legacy duplicate candidate evaluates to KNOWN_LEGACY / MEDIUM'
  );

  // 7. Non-Trigger: Legitimate Text Context -> CLEAR / INFO
  const decText = evaluateQuarantineDecision({
    rootId: 'samsung-s24',
    brand: 'Samsung',
    detector: 'crossBrandIsolationObserver',
    findingClass: 'LEGITIMATE_TEXT_CONTEXT',
    description: 'Text mention of competitor in description',
    isGolden: false
  });
  assert(
    decText.decisionState === 'CLEAR' && decText.severity === 'INFO',
    'Legitimate comparison text context evaluates to CLEAR / INFO'
  );

  // 8. Queue Idempotency & Deduplication
  const queue = new ShadowQuarantineQueue();
  const res1 = queue.enqueueDecision(decCrossBrand);
  const res2 = queue.enqueueDecision(decCrossBrand); // Duplicate enqueue
  assert(
    res1.isNew === true && res2.isNew === false && queue.getDuplicateEventsPrevented() === 1,
    'Shadow quarantine queue idempotently deduplicates identical decision enqueues'
  );

  // 9. Human Review Workflow (Forbidden Action Enforcement)
  let forbiddenActionBlocked = false;
  try {
    simulateHumanReview('dec_123', 'root_123', 'MERGE_NOW' as any);
  } catch (err: any) {
    if (err.message.includes('HUMAN_REVIEW_FORBIDDEN_ACTION')) {
      forbiddenActionBlocked = true;
    }
  }
  assert(forbiddenActionBlocked === true, 'Human review workflow blocks production mutation actions (MERGE_NOW)');

  // 10. Valid Shadow Human Review Action (CONFIRM_FINDING)
  const validReview = simulateHumanReview('dec_123', 'root_123', 'CONFIRM_FINDING', 'Verified by reviewer');
  assert(
    validReview.action === 'CONFIRM_FINDING' && validReview.productionMutationAttempted === false,
    'Valid shadow human review action modifies only non-production shadow state'
  );

  // 11. Golden Dataset Protection Rule (Golden Critical Finding)
  const decGoldenCritical = evaluateQuarantineDecision({
    rootId: 'samsung-galaxy-s25',
    brand: 'Samsung',
    detector: 'crossBrandIsolationObserver',
    findingClass: 'REAL_NAMESPACE_VIOLATION',
    description: 'Golden root namespace violation test',
    isGolden: true
  });
  assert(
    decGoldenCritical.goldenMembership === true && decGoldenCritical.severity === 'CRITICAL',
    'Golden root critical finding flagged with goldenMembership=true'
  );

  return {
    pass: failedTests === 0,
    totalTests,
    passedTests,
    failedTests,
    testLog
  };
}

if (require.main === module) {
  const result = runPhase8BTestSuite();
  console.log(`=== PHASE 8-B SHADOW QUARANTINE TEST SUITE ===`);
  console.log(`Passed: ${result.passedTests} / ${result.totalTests}`);
  console.log(`Failed: ${result.failedTests}`);
  for (const log of result.testLog) {
    console.log(log);
  }
}
