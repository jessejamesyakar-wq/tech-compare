/**
 * REGRESSION TEST SUITE: MUTATION SCOPE GUARD
 *
 * Covers required stop codes:
 * 1. SCOPE_VIOLATION_ROOT (sibling / family expansion strictly blocked)
 * 2. SCOPE_VIOLATION_FIELD (unauthorized field paths blocked)
 * 3. PRICE_FIREWALL_VIOLATION (price fields protected by default)
 * 4. GOLDEN_DATASET_AUTH_REQUIRED (golden dataset protected by default)
 * 5. ROOT_LIMIT_EXCEEDED (overflow of maxRootMutations blocked)
 * 6. Post-operation assertion failures
 * 7. Legitimate authorized guarded mutations
 */

import {
  MutationScopeGuard,
  MutationScopeDeclaration,
  IntendedRootMutation,
  MutationScopeViolationError
} from './enforce/mutationScopeGuard';
import { EnforcementCircuitBreaker } from './enforce/enforcementCircuitBreaker';

interface TestResult {
  name: string;
  passed: boolean;
  stopCodeReceived?: string;
  expectedStopCode?: string;
  error?: string;
}

export function runMutationScopeGuardSuite(): { results: TestResult[]; summary: { total: number; passed: number; failed: number } } {
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

  function recordExpectStopCode(name: string, expectedCode: string, fn: () => void) {
    EnforcementCircuitBreaker.resetCircuit();
    try {
      fn();
      results.push({
        name,
        passed: false,
        expectedStopCode: expectedCode,
        error: `Expected stopCode ${expectedCode} but no error was thrown.`
      });
    } catch (err: any) {
      if (err instanceof MutationScopeViolationError && err.stopCode === expectedCode) {
        results.push({
          name,
          passed: true,
          stopCodeReceived: err.stopCode,
          expectedStopCode: expectedCode
        });
      } else {
        results.push({
          name,
          passed: false,
          stopCodeReceived: err.stopCode || err.name,
          expectedStopCode: expectedCode,
          error: `Expected ${expectedCode}, got ${err.stopCode || err.message}`
        });
      }
    }
  }

  // 1. Sibling Root Scope Violation
  recordExpectStopCode(
    'Regression Test 1: Sibling Root Mutation Rejected (SCOPE_VIOLATION_ROOT)',
    'SCOPE_VIOLATION_ROOT',
    () => {
      const scope: MutationScopeDeclaration = {
        taskId: 'TASK-APPLE-IP4-REPAIR',
        description: 'Repair Apple iPhone 4 16GB only',
        authorizedRootIds: ['apple-apple-iphone-4-16-gb-138'],
        authorizedFieldPaths: ['specs.connectivity.wifiStandard'],
        maxRootMutations: 1
      };

      const intended: IntendedRootMutation[] = [
        {
          // Attempting sibling 8GB variant under "family consistency"
          rootId: 'apple-apple-iphone-4-8-gb-93',
          fieldMutations: [{ fieldPath: 'specs.connectivity.wifiStandard', afterValue: 'Wi-Fi 4' }]
        }
      ];

      MutationScopeGuard.validateIntendedMutations(scope, intended);
    }
  );

  // 2. Unauthorized Field Mutation
  recordExpectStopCode(
    'Regression Test 2: Unauthorized Field Mutation Rejected (SCOPE_VIOLATION_FIELD)',
    'SCOPE_VIOLATION_FIELD',
    () => {
      const scope: MutationScopeDeclaration = {
        taskId: 'TASK-FIELD-GUARD',
        description: 'Update only screen size',
        authorizedRootIds: ['apple-apple-iphone-4-16-gb-138'],
        authorizedFieldPaths: ['specs.screen.size'],
        maxRootMutations: 1
      };

      const intended: IntendedRootMutation[] = [
        {
          rootId: 'apple-apple-iphone-4-16-gb-138',
          // Unauthorized field path
          fieldMutations: [{ fieldPath: 'specs.camera.mainMp', afterValue: '5 MP' }]
        }
      ];

      MutationScopeGuard.validateIntendedMutations(scope, intended);
    }
  );

  // 3. Price Firewall Violation
  recordExpectStopCode(
    'Regression Test 3: Price Field Mutation Blocked by Default (PRICE_FIREWALL_VIOLATION)',
    'PRICE_FIREWALL_VIOLATION',
    () => {
      const scope: MutationScopeDeclaration = {
        taskId: 'TASK-PRICE-GUARD',
        description: 'Update specs only',
        authorizedRootIds: ['apple-apple-iphone-4-16-gb-138'],
        authorizedFieldPaths: ['basePrice'],
        maxRootMutations: 1
        // priceMutationAllowed is omitted -> defaults to false
      };

      const intended: IntendedRootMutation[] = [
        {
          rootId: 'apple-apple-iphone-4-16-gb-138',
          fieldMutations: [{ fieldPath: 'basePrice', afterValue: 1500 }]
        }
      ];

      MutationScopeGuard.validateIntendedMutations(scope, intended);
    }
  );

  // 4. Golden Dataset Mutation Without Authorization
  recordExpectStopCode(
    'Regression Test 4: Golden Dataset Mutation Blocked Without Auth (GOLDEN_DATASET_AUTH_REQUIRED)',
    'GOLDEN_DATASET_AUTH_REQUIRED',
    () => {
      const scope: MutationScopeDeclaration = {
        taskId: 'TASK-GOLDEN-GUARD',
        description: 'Update 5G flag',
        // apple-apple-iphone-16-pro-128-gb-952452 is in Golden Dataset V1 (apple7b)
        authorizedRootIds: ['apple-apple-iphone-16-pro-128-gb-952452'],
        authorizedFieldPaths: ['specs.connectivity.has5G'],
        maxRootMutations: 1
        // goldenDatasetMutationAllowed is omitted -> defaults to false
      };

      const intended: IntendedRootMutation[] = [
        {
          rootId: 'apple-apple-iphone-16-pro-128-gb-952452',
          fieldMutations: [{ fieldPath: 'specs.connectivity.has5G', afterValue: true }]
        }
      ];

      MutationScopeGuard.validateIntendedMutations(scope, intended);
    }
  );

  // 5. Root Limit Exceeded
  recordExpectStopCode(
    'Regression Test 5: Root Mutation Limit Overflow (ROOT_LIMIT_EXCEEDED)',
    'ROOT_LIMIT_EXCEEDED',
    () => {
      const scope: MutationScopeDeclaration = {
        taskId: 'TASK-LIMIT-GUARD',
        description: 'Batch of max 2 roots',
        authorizedRootIds: [
          'apple-apple-iphone-4-16-gb-138',
          'apple-apple-iphone-5-16-gb-91',
          'apple-apple-iphone-5c-16-gb-90'
        ],
        authorizedFieldPaths: ['specs.screen.size'],
        maxRootMutations: 2 // Max allowed is 2, but intended targets 3
      };

      const intended: IntendedRootMutation[] = [
        { rootId: 'apple-apple-iphone-4-16-gb-138', fieldMutations: [{ fieldPath: 'specs.screen.size', afterValue: '3.5 inç' }] },
        { rootId: 'apple-apple-iphone-5-16-gb-91', fieldMutations: [{ fieldPath: 'specs.screen.size', afterValue: '4.0 inç' }] },
        { rootId: 'apple-apple-iphone-5c-16-gb-90', fieldMutations: [{ fieldPath: 'specs.screen.size', afterValue: '4.0 inç' }] }
      ];

      MutationScopeGuard.validateIntendedMutations(scope, intended);
    }
  );

  // 6. Post-Operation Invariant Assertion: Unauthorized Root in Draft
  recordExpectStopCode(
    'Regression Test 6: Post-Operation Assertion Catches Leaked Sibling Root (SCOPE_VIOLATION_ROOT)',
    'SCOPE_VIOLATION_ROOT',
    () => {
      const scope: MutationScopeDeclaration = {
        taskId: 'TASK-POST-ASSERT-ROOT',
        description: 'Authorized only 16GB',
        authorizedRootIds: ['apple-apple-iphone-4-16-gb-138'],
        authorizedFieldPaths: ['specs.connectivity.wifiStandard'],
        maxRootMutations: 2
      };

      const beforeCatalog = [
        { id: 'apple-apple-iphone-4-16-gb-138', specs: { connectivity: { wifiStandard: 'old' } } },
        { id: 'apple-apple-iphone-4-8-gb-93', specs: { connectivity: { wifiStandard: 'old' } } }
      ];

      // Draft inadvertently mutated sibling 8GB
      const afterCatalog = [
        { id: 'apple-apple-iphone-4-16-gb-138', specs: { connectivity: { wifiStandard: 'new' } } },
        { id: 'apple-apple-iphone-4-8-gb-93', specs: { connectivity: { wifiStandard: 'new' } } }
      ];

      MutationScopeGuard.assertPostOperation(scope, beforeCatalog, afterCatalog);
    }
  );

  // 7. Post-Operation Invariant Assertion: Price Mutation Leak
  recordExpectStopCode(
    'Regression Test 7: Post-Operation Assertion Catches Leaked Price Change (PRICE_FIREWALL_VIOLATION)',
    'PRICE_FIREWALL_VIOLATION',
    () => {
      const scope: MutationScopeDeclaration = {
        taskId: 'TASK-POST-ASSERT-PRICE',
        description: 'Authorized spec update',
        authorizedRootIds: ['apple-apple-iphone-4-16-gb-138'],
        authorizedFieldPaths: ['specs.connectivity.wifiStandard'],
        maxRootMutations: 1
      };

      const beforeCatalog = [
        { id: 'apple-apple-iphone-4-16-gb-138', basePrice: 1000, specs: { connectivity: { wifiStandard: 'old' } } }
      ];

      // Draft accidentally changed basePrice
      const afterCatalog = [
        { id: 'apple-apple-iphone-4-16-gb-138', basePrice: 999, specs: { connectivity: { wifiStandard: 'old' } } }
      ];

      MutationScopeGuard.assertPostOperation(scope, beforeCatalog, afterCatalog);
    }
  );

  // 8. Legitimate Authorized Guarded Execution
  record(
    'Regression Test 8: Authorized Guarded Mutation Passes Pre and Post Invariants',
    () => {
      const scope: MutationScopeDeclaration = {
        taskId: 'TASK-LEGITIMATE-MUTATION',
        description: 'Authorized update of Wi-Fi standard',
        authorizedRootIds: ['apple-apple-iphone-4-16-gb-138'],
        authorizedFieldPaths: ['specs.connectivity.wifiStandard'],
        maxRootMutations: 1
      };

      const catalog = [
        { id: 'apple-apple-iphone-4-16-gb-138', specs: { connectivity: { wifiStandard: 'Wi-Fi 7' } } },
        { id: 'apple-apple-iphone-4-8-gb-93', specs: { connectivity: { wifiStandard: 'Wi-Fi 4' } } }
      ];

      const intended: IntendedRootMutation[] = [
        {
          rootId: 'apple-apple-iphone-4-16-gb-138',
          fieldMutations: [{ fieldPath: 'specs.connectivity.wifiStandard', afterValue: 'Wi-Fi 4 (802.11b/g/n)' }]
        }
      ];

      const result = MutationScopeGuard.executeGuardedMutation(
        scope,
        catalog,
        intended,
        draft => {
          const item = draft.find(p => p.id === 'apple-apple-iphone-4-16-gb-138');
          if (item) {
            item.specs.connectivity.wifiStandard = 'Wi-Fi 4 (802.11b/g/n)';
          }
        }
      );

      if (!result.assertionResult.passed) {
        throw new Error('Expected assertionResult.passed to be true');
      }
      if (result.assertionResult.actualRootMutationCount !== 1) {
        throw new Error(`Expected 1 mutated root, got ${result.assertionResult.actualRootMutationCount}`);
      }
      if (result.assertionResult.priceMutationCount !== 0) {
        throw new Error('Expected 0 price mutations');
      }
    }
  );

  // 9. Root-Field Pair Lock Rejection
  recordExpectStopCode(
    'Regression Test 9: Root-Field Pair Lock Rejects Field Permitted Only on Different Root (SCOPE_VIOLATION_FIELD)',
    'SCOPE_VIOLATION_FIELD',
    () => {
      const scope: MutationScopeDeclaration = {
        taskId: 'TEST-TASK-09',
        description: 'Test pair lock rejection',
        authorizedRootIds: ['samsung-galaxy-a17-5g', 'samsung-galaxy-a57-5g'],
        authorizedFieldPaths: ['specs.processor.chip', 'specs.screen.type'],
        authorizedRootFieldMap: {
          'samsung-galaxy-a17-5g': ['specs.processor.chip', 'specs.screen.type'],
          'samsung-galaxy-a57-5g': ['specs.screen.type'] // chip is NOT authorized on a57!
        },
        maxRootMutations: 2,
        goldenDatasetMutationAllowed: true
      };

      const intended: IntendedRootMutation[] = [
        {
          rootId: 'samsung-galaxy-a57-5g',
          fieldMutations: [
            { fieldPath: 'specs.processor.chip', afterValue: 'Samsung Exynos 1680' } // Should fail!
          ]
        }
      ];

      MutationScopeGuard.validateIntendedMutations(scope, intended);
    }
  );

  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;

  return { results, summary: { total, passed, failed } };
}

// Standalone execution support
if (require.main === module) {
  console.log('=== RUNNING MUTATION SCOPE GUARD REGRESSION TEST SUITE ===');
  const { results, summary } = runMutationScopeGuardSuite();
  for (const r of results) {
    const mark = r.passed ? '✅' : '❌';
    console.log(`${mark} ${r.name}`);
    if (!r.passed) {
      console.log(`   Error: ${r.error}`);
    } else if (r.stopCodeReceived) {
      console.log(`   [STOP_CODE_VERIFIED: ${r.stopCodeReceived}]`);
    }
  }
  console.log(`\nSummary: ${summary.passed}/${summary.total} tests passed.`);
  if (summary.failed > 0) {
    process.exit(1);
  }
}
