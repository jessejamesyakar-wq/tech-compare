import fs from 'node:fs';
import path from 'node:path';
import {
  MutationScopeGuard,
  MutationScopeDeclaration,
  IntendedRootMutation
} from '../src/lib/trustLayer/enforce/mutationScopeGuard';

function main() {
  const manifestPath = path.join(__dirname, '../MEGA_WAVE/WAVE6_MASS_CLOSURE/data_integrator_a_manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  const catalogPath = path.join(__dirname, '../src/lib/smartphonesData.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

  const initialCount = catalog.length;
  if (initialCount !== 905) {
    throw new Error(`Catalog count invariant broken before start: ${initialCount} (expected 905)`);
  }

  const nonGoldenItems = manifest.nonGoldenManifest;
  console.log(`Preparing to apply ${nonGoldenItems.length} non-golden process patches...`);

  // Build MutationScopeDeclaration
  const authorizedRootIds = nonGoldenItems.map((item: any) => item.rootId);
  const authorizedFieldPaths = ['specs.processor.process'];

  const scope: MutationScopeDeclaration = {
    taskId: 'TASK-WAVE6-DATA-INTEGRATOR-A-PROCESS',
    description: 'Apply 113 double-evidence confirmed fabrication process patches to non-golden products',
    authorizedRootIds,
    authorizedFieldPaths,
    maxRootMutations: 120,
    priceMutationAllowed: false,
    goldenDatasetMutationAllowed: false
  };

  const intendedMutations: IntendedRootMutation[] = nonGoldenItems.map((item: any) => ({
    rootId: item.rootId,
    fieldMutations: [
      {
        fieldPath: 'specs.processor.process',
        beforeValue: item.oldValue,
        afterValue: item.newValue
      }
    ]
  }));

  // Pre-mutation validation via MutationScopeGuard
  console.log('Running pre-mutation scope guard validation...');
  const validation = MutationScopeGuard.validateIntendedMutations(scope, intendedMutations);
  if (!validation.valid) {
    throw new Error(`MutationScopeGuard rejected mutations: ${validation.message}`);
  }
  console.log('MutationScopeGuard pre-validation PASSED ✅');

  // Take deep snapshot before mutations for post-operation assertion
  const snapshotBefore = JSON.parse(JSON.stringify(catalog));

  // Apply mutations
  let appliedCount = 0;
  for (const item of nonGoldenItems) {
    const product = catalog.find((p: any) => p.id === item.rootId);
    if (!product) {
      throw new Error(`Product ${item.rootId} not found in catalog!`);
    }
    if (!product.specs) product.specs = {};
    if (!product.specs.processor) product.specs.processor = {};
    product.specs.processor.process = item.newValue;
    appliedCount++;
  }

  console.log(`Applied ${appliedCount} mutations to memory catalog.`);

  // Post-mutation assertion
  console.log('Running post-mutation assertions...');
  const postAssertion = MutationScopeGuard.assertPostOperation(
    scope,
    snapshotBefore,
    catalog
  );

  if (!postAssertion.passed) {
    throw new Error('Post-mutation assertions FAILED!');
  }
  console.log('Post-mutation assertions PASSED ✅');
  console.log(`Actual mutated roots: ${postAssertion.actualRootMutationCount}`);
  console.log(`Price mutations: ${postAssertion.priceMutationCount}`);
  console.log(`Golden mutations: ${postAssertion.goldenMutationCount}`);

  if (catalog.length !== 905) {
    throw new Error(`Catalog count changed! Now ${catalog.length}`);
  }

  // Write catalog back
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
  console.log(`Successfully wrote updated catalog to ${catalogPath}!`);
}

main();
