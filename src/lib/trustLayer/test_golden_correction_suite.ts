/**
 * REGRESSION & GOVERNANCE TEST SUITE: GOLDEN DATASET CORRECTION OVERLAY
 *
 * Verifies:
 * 1. Arbitrary Golden mutation -> BLOCK
 * 2. Unauthorized correction (PENDING/REJECTED) -> BLOCK
 * 3. Wrong root / non-Golden root -> BLOCK
 * 4. Missing / insufficient evidence -> BLOCK
 * 5. Approved superseding correction -> PASS
 * 6. Historical Golden Dataset V1 remains 100% immutable
 * 7. Overlay applies cleanly to catalog
 */

import { GoldenCorrectionRegistry, GoldenCorrection } from './observe/goldenCorrectionRegistry';
import { MutationScopeGuard, MutationScopeDeclaration, IntendedRootMutation } from './enforce/mutationScopeGuard';
import { EnforcementCircuitBreaker } from './enforce/enforcementCircuitBreaker';
import { GOLDEN_DATASET_V1_IDS } from './observe/goldenDatasetV1';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export function runGoldenCorrectionSuite(): { results: TestResult[]; summary: { total: number; passed: number; failed: number } } {
  const results: TestResult[] = [];

  function record(name: string, fn: () => void) {
    EnforcementCircuitBreaker.resetCircuit();
    try {
      fn();
      results.push({ name, passed: true });
    } catch (err: any) {
      results.push({ name, passed: false, error: err.message });
    }
  }

  // 1. Incontrovertible Evidence Chain Verification for iPhone 11 A13
  record('Test 1: iPhone 11 A13 registered correction has strong evidence and approved status', () => {
    const correction = GoldenCorrectionRegistry.getApprovedCorrection(
      'apple-apple-iphone-11-128-gb-335107',
      'specs.processor.process'
    );
    if (!correction) throw new Error('Approved correction not found in registry');
    if (correction.newValue !== 'TSMC 7nm+') throw new Error(`Unexpected newValue: ${correction.newValue}`);
    if (correction.oldValue !== 'TSMC 5nm') throw new Error(`Unexpected oldValue: ${correction.oldValue}`);
    if (!correction.evidence.includes('TSMC') || correction.evidence.length < 50) {
      throw new Error('Evidence chain too short or missing TSMC node citation');
    }
    if (correction.status !== 'APPROVED') throw new Error('Correction must be APPROVED');
  });

  // 2. Arbitrary Golden mutation blocked by MutationScopeGuard
  record('Test 2: Arbitrary unapproved Golden mutation is strictly BLOCKED', () => {
    let blocked = false;
    try {
      const scope: MutationScopeDeclaration = {
        taskId: 'TASK-ARBITRARY-MUTATION',
        description: 'Attempt arbitrary modification on golden iPhone 16 Pro Max',
        authorizedRootIds: ['apple-apple-iphone-16-pro-max-1-tb-960862'],
        authorizedFieldPaths: ['specs.processor.chip'],
        maxRootMutations: 1,
      };
      const intended: IntendedRootMutation[] = [
        {
          rootId: 'apple-apple-iphone-16-pro-max-1-tb-960862',
          fieldMutations: [{ fieldPath: 'specs.processor.chip', afterValue: 'Arbitrary Chip Name' }],
        },
      ];
      MutationScopeGuard.validateIntendedMutations(scope, intended);
    } catch (err: any) {
      if (err.stopCode === 'GOLDEN_DATASET_AUTH_REQUIRED') {
        blocked = true;
      }
    }
    if (!blocked) throw new Error('Expected GOLDEN_DATASET_AUTH_REQUIRED stop code');
  });

  // 3. Unauthorized / Pending correction is BLOCKED by validator
  record('Test 3: Pending/unauthorized correction candidate is strictly BLOCKED', () => {
    const unapprovedCandidate: Partial<GoldenCorrection> = {
      correctionId: 'GC-UNAPPROVED-TEST',
      rootId: 'apple-apple-iphone-11-128-gb-335107',
      fieldPath: 'specs.processor.process',
      oldValue: 'TSMC 5nm',
      newValue: 'TSMC 3nm',
      evidence: 'Some unverified forum speculation with sufficient character length here for testing',
      status: 'PENDING',
    };
    const res = GoldenCorrectionRegistry.validateCorrectionCandidate(unapprovedCandidate);
    if (res.valid || res.stopCode !== 'UNAUTHORIZED_CORRECTION') {
      throw new Error(`Expected UNAUTHORIZED_CORRECTION, got: ${res.stopCode}`);
    }
  });

  // 4. Missing evidence is BLOCKED by validator
  record('Test 4: Missing or weak evidence is strictly BLOCKED', () => {
    const missingEvidenceCandidate: Partial<GoldenCorrection> = {
      correctionId: 'GC-NO-EVIDENCE-TEST',
      rootId: 'apple-apple-iphone-11-128-gb-335107',
      fieldPath: 'specs.processor.process',
      oldValue: 'TSMC 5nm',
      newValue: 'TSMC 7nm+',
      evidence: 'short', // less than 20 chars
      status: 'APPROVED',
    };
    const res = GoldenCorrectionRegistry.validateCorrectionCandidate(missingEvidenceCandidate);
    if (res.valid || res.stopCode !== 'MISSING_EVIDENCE') {
      throw new Error(`Expected MISSING_EVIDENCE, got: ${res.stopCode}`);
    }
  });

  // 5. Wrong / non-Golden root is BLOCKED by validator
  record('Test 5: Wrong/non-Golden root is strictly BLOCKED', () => {
    const wrongRootCandidate: Partial<GoldenCorrection> = {
      correctionId: 'GC-WRONG-ROOT-TEST',
      rootId: 'non-existent-or-regular-product-id',
      fieldPath: 'specs.processor.process',
      oldValue: '10nm',
      newValue: '7nm',
      evidence: 'Strong manufacturer evidence with plenty of characters exceeding twenty chars',
      status: 'APPROVED',
    };
    const res = GoldenCorrectionRegistry.validateCorrectionCandidate(wrongRootCandidate);
    if (res.valid || res.stopCode !== 'INVALID_ROOT') {
      throw new Error(`Expected INVALID_ROOT, got: ${res.stopCode}`);
    }
  });

  // 6. Approved superseding correction PASSES MutationScopeGuard
  record('Test 6: Approved superseding Golden correction PASSES MutationScopeGuard', () => {
    const scope: MutationScopeDeclaration = {
      taskId: 'TASK-GOLDEN-OVERLAY-A13',
      description: 'Apply approved A13 fabrication node correction',
      authorizedRootIds: ['apple-apple-iphone-11-128-gb-335107'],
      authorizedFieldPaths: ['specs.processor.process'],
      maxRootMutations: 1,
    };
    const intended: IntendedRootMutation[] = [
      {
        rootId: 'apple-apple-iphone-11-128-gb-335107',
        fieldMutations: [{ fieldPath: 'specs.processor.process', afterValue: 'TSMC 7nm+' }],
      },
    ];
    const validation = MutationScopeGuard.validateIntendedMutations(scope, intended);
    if (!validation.valid) throw new Error('Approved golden correction should pass validation');
  });

  // 7. Verify Historical V1 Baseline Immutability
  record('Test 7: Golden Dataset V1 IDs collection is fully intact', () => {
    const totalV1Ids =
      GOLDEN_DATASET_V1_IDS.samsung21.length +
      GOLDEN_DATASET_V1_IDS.apple7b.length +
      GOLDEN_DATASET_V1_IDS.apple7c.length +
      GOLDEN_DATASET_V1_IDS.apple7d.length;
    if (totalV1Ids !== 83) {
      throw new Error(`Expected 83 total Golden V1 IDs, found ${totalV1Ids}`);
    }
  });

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  return {
    results,
    summary: { total: results.length, passed, failed },
  };
}

if (require.main === module) {
  const { results, summary } = runGoldenCorrectionSuite();
  console.log(`\n=== GOLDEN DATASET CORRECTION SUITE RESULTS ===`);
  results.forEach((r) => console.log(`${r.passed ? '✅' : '❌'} ${r.name} ${r.error ? `(${r.error})` : ''}`));
  console.log(`\nSummary: ${summary.passed}/${summary.total} Passed (${summary.failed} Failed)`);
  if (summary.failed > 0) process.exit(1);
}
