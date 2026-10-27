import fs from 'fs';
import path from 'path';
import {
  MutationScopeGuard,
  MutationScopeDeclaration,
  IntendedRootMutation
} from '../../src/lib/trustLayer/enforce/mutationScopeGuard';

console.log('====================================================');
console.log('TASK: BATCH-APPLE-P0-5G-MODEM');
console.log('MODE: CONTROLLED MUTATION WITH SCOPE LOCK');
console.log('====================================================\n');

const CATALOG_PATH = path.join(__dirname, '../../src/lib/smartphonesData.json');

// 1. Declare Scope Lock
const scope: MutationScopeDeclaration = {
  taskId: 'BATCH-APPLE-P0-5G-MODEM',
  description: 'Correct demonstrably wrong has5G: false flag on exactly 3 iPhone 17 Pro models',
  authorizedRootIds: [
    'apple-apple-iphone-17-pro-1-tb-1027083',
    'apple-apple-iphone-17-pro-256-gb-1023349',
    'apple-apple-iphone-17-pro-512-gb-1027082'
  ],
  authorizedFieldPaths: [
    'specs.connectivity.has5G'
  ],
  maxRootMutations: 3,
  priceMutationAllowed: false,
  goldenDatasetMutationAllowed: false
};

// 2. Validate Declaration
MutationScopeGuard.validateDeclaration(scope);
console.log('✅ Scope Declaration Validated.');
console.log('   Authorized Roots (3):', scope.authorizedRootIds);
console.log('   Authorized Field Paths (1):', scope.authorizedFieldPaths);
console.log('   Max Root Mutations:', scope.maxRootMutations);
console.log('   Price Mutation Allowed:', scope.priceMutationAllowed);
console.log('   Golden Dataset Mutation Allowed:', scope.goldenDatasetMutationAllowed);

// 3. Load Current Catalog and Create Backup
const rawContent = fs.readFileSync(CATALOG_PATH, 'utf8');
const beforeCatalog = JSON.parse(rawContent);
const rootCountBefore = beforeCatalog.length;

const backupPath = `${CATALOG_PATH}.bak.${Date.now()}`;
fs.writeFileSync(backupPath, rawContent, 'utf8');
console.log(`\n✅ Backup snapshot created at: ${backupPath}`);
console.log(`   Catalog Root Count Before: ${rootCountBefore}`);

// 4. Pre-Flight Verification
console.log('\n--- PRE-FLIGHT VERIFICATION ---');
const catalogMap = new Map<string, any>(beforeCatalog.map((p: any) => [p.id, p]));

for (const rootId of scope.authorizedRootIds) {
  const p = catalogMap.get(rootId);
  if (!p) {
    throw new Error(`PRE_FLIGHT_ERROR: Authorized root '${rootId}' not found in catalog!`);
  }

  const currentVal = p.specs?.connectivity?.has5G;
  console.log(`- Root: ${rootId}`);
  console.log(`  Model: ${p.name}`);
  console.log(`  Current specs.connectivity.has5G: ${currentVal}`);

  if (currentVal !== false) {
    throw new Error(`PRE_FLIGHT_ERROR: Root '${rootId}' has5G value is '${currentVal}', expected false!`);
  }

  if (MutationScopeGuard.isGoldenDatasetRoot(rootId)) {
    throw new Error(`PRE_FLIGHT_ERROR: Root '${rootId}' belongs to Golden Dataset! Mutation forbidden.`);
  }
}

// Build intended mutations
const intendedMutations: IntendedRootMutation[] = scope.authorizedRootIds.map(rootId => ({
  rootId,
  fieldMutations: [
    {
      fieldPath: 'specs.connectivity.has5G',
      beforeValue: false,
      afterValue: true
    }
  ]
}));

// Pre-write validation
const preCheckResult = MutationScopeGuard.validateIntendedMutations(scope, intendedMutations);
console.log('\n✅ Pre-Flight Scope Guard Validation Passed:');
console.log('   Target Roots Count:', preCheckResult.targetRootsCount);
console.log('   Target Fields Count:', preCheckResult.targetFieldsCount);

// 5. Apply Guarded Mutation
console.log('\n--- APPLYING MUTATION ---');
const afterCatalog = JSON.parse(JSON.stringify(beforeCatalog));

for (const rootId of scope.authorizedRootIds) {
  const p = afterCatalog.find((x: any) => x.id === rootId);
  if (p && p.specs && p.specs.connectivity) {
    p.specs.connectivity.has5G = true;
    console.log(`- Mutated [${p.id}].specs.connectivity.has5G: false -> true`);
  }
}

// 6. Post-Operation Assertions
console.log('\n--- POST-OPERATION ASSERTION ---');
const assertionResult = MutationScopeGuard.assertPostOperation(scope, beforeCatalog, afterCatalog);
console.log('✅ Post-Operation Scope Guard Invariants Verified:');
console.log('   Passed:', assertionResult.passed);
console.log('   Actual Mutated Roots:', assertionResult.actualMutatedRoots);
console.log('   Actual Mutated Fields:', assertionResult.actualMutatedFields);
console.log('   Actual Root Mutation Count:', assertionResult.actualRootMutationCount);
console.log('   Price Mutation Count:', assertionResult.priceMutationCount);
console.log('   Golden Mutation Count:', assertionResult.goldenMutationCount);

if (assertionResult.actualRootMutationCount !== 3) {
  throw new Error(`POST_ASSERTION_ERROR: Expected exactly 3 root mutations, got ${assertionResult.actualRootMutationCount}!`);
}

if (assertionResult.priceMutationCount !== 0) {
  throw new Error(`POST_ASSERTION_ERROR: Expected 0 price mutations, got ${assertionResult.priceMutationCount}!`);
}

if (assertionResult.goldenMutationCount !== 0) {
  throw new Error(`POST_ASSERTION_ERROR: Expected 0 golden mutations, got ${assertionResult.goldenMutationCount}!`);
}

const rootCountAfter = afterCatalog.length;
console.log(`   Catalog Root Count After: ${rootCountAfter}`);
if (rootCountBefore !== rootCountAfter) {
  throw new Error(`POST_ASSERTION_ERROR: Root count changed from ${rootCountBefore} to ${rootCountAfter}!`);
}

// 7. Write Mutated Catalog Atomically
fs.writeFileSync(CATALOG_PATH, JSON.stringify(afterCatalog, null, 2) + '\n', 'utf8');
console.log(`\n✅ Mutated catalog successfully written to: ${CATALOG_PATH}`);
console.log('--- BATCH MUTATION EXECUTION COMPLETE ---');
