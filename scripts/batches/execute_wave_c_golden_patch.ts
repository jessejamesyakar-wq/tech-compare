import * as fs from 'fs';
import * as path from 'path';
import {
  MutationScopeGuard,
  MutationScopeDeclaration,
  IntendedRootMutation
} from '../../src/lib/trustLayer/enforce/mutationScopeGuard';

const catalogPath = path.resolve('src/lib/smartphonesData.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

console.log('=== WAVE-C SAMSUNG GOLDEN SURGICAL PATCH ===');
console.log('Baseline catalog root count:', catalog.length);

// 1. Pre-mutation snapshot
const r1Before = catalog.find((p: any) => p.id === 'samsung-galaxy-a17-5g');
const r2Before = catalog.find((p: any) => p.id === 'samsung-galaxy-a57-5g');

if (!r1Before || !r2Before) {
  throw new Error('STOP: One or both target roots not found in catalog');
}

const snapshot = {
  timestamp: new Date().toISOString(),
  baselineCatalogRootCount: catalog.length,
  roots: [
    {
      id: r1Before.id,
      name: r1Before.name,
      isGolden: MutationScopeGuard.isGoldenDatasetRoot(r1Before.id),
      chipBefore: r1Before.specs?.processor?.chip,
      screenTypeBefore: r1Before.specs?.screen?.type,
      basePrice: r1Before.basePrice,
      price: r1Before.price
    },
    {
      id: r2Before.id,
      name: r2Before.name,
      isGolden: MutationScopeGuard.isGoldenDatasetRoot(r2Before.id),
      chipBefore: r2Before.specs?.processor?.chip,
      screenTypeBefore: r2Before.specs?.screen?.type,
      basePrice: r2Before.basePrice,
      price: r2Before.price
    }
  ]
};

console.log('Pre-Mutation Snapshot:', JSON.stringify(snapshot, null, 2));

// Verify baseline values match Wave-C forensic findings
if (snapshot.roots[0].chipBefore !== 'MediaTek Dimensity 6300 (6nm)') {
  throw new Error(`BASELINE_DRIFT: samsung-galaxy-a17-5g chip is '${snapshot.roots[0].chipBefore}'`);
}
if (snapshot.roots[0].screenTypeBefore !== 'Dynamic LTPO AMOLED 2X') {
  throw new Error(`BASELINE_DRIFT: samsung-galaxy-a17-5g screenType is '${snapshot.roots[0].screenTypeBefore}'`);
}
if (snapshot.roots[1].screenTypeBefore !== 'Dynamic LTPO AMOLED 2X') {
  throw new Error(`BASELINE_DRIFT: samsung-galaxy-a57-5g screenType is '${snapshot.roots[1].screenTypeBefore}'`);
}

// 2. Define Scope Declaration
const scope: MutationScopeDeclaration = {
  taskId: 'TASK-WAVE-C-GOLDEN-PATCH',
  description: 'Surgical correction of 3 demonstrably wrong Samsung Golden fields',
  authorizedRootIds: [
    'samsung-galaxy-a17-5g',
    'samsung-galaxy-a57-5g'
  ],
  authorizedFieldPaths: [
    'specs.processor.chip',
    'specs.screen.type'
  ],
  authorizedRootFieldMap: {
    'samsung-galaxy-a17-5g': ['specs.processor.chip', 'specs.screen.type'],
    'samsung-galaxy-a57-5g': ['specs.screen.type']
  },
  maxRootMutations: 2,
  priceMutationAllowed: false,
  goldenDatasetMutationAllowed: true
};

// 3. Define Intended Mutations
const intendedMutations: IntendedRootMutation[] = [
  {
    rootId: 'samsung-galaxy-a17-5g',
    fieldMutations: [
      {
        fieldPath: 'specs.processor.chip',
        beforeValue: 'MediaTek Dimensity 6300 (6nm)',
        afterValue: 'Samsung Exynos 1330'
      },
      {
        fieldPath: 'specs.screen.type',
        beforeValue: 'Dynamic LTPO AMOLED 2X',
        afterValue: 'Super AMOLED (90Hz)'
      }
    ]
  },
  {
    rootId: 'samsung-galaxy-a57-5g',
    fieldMutations: [
      {
        fieldPath: 'specs.screen.type',
        beforeValue: 'Dynamic LTPO AMOLED 2X',
        afterValue: 'Super AMOLED Plus (120Hz)'
      }
    ]
  }
];

// 4. Execute Guarded Mutation
const { catalog: mutatedCatalog, assertionResult } = MutationScopeGuard.executeGuardedMutation(
  scope,
  catalog,
  intendedMutations,
  (catalogDraft) => {
    const draft = catalogDraft as any[];
    const a17 = draft.find((p: any) => p.id === 'samsung-galaxy-a17-5g');
    if (a17) {
      if (!a17.specs) a17.specs = {};
      if (!a17.specs.processor) a17.specs.processor = {};
      if (!a17.specs.screen) a17.specs.screen = {};
      a17.specs.processor.chip = 'Samsung Exynos 1330';
      a17.specs.screen.type = 'Super AMOLED (90Hz)';
    }

    const a57 = draft.find((p: any) => p.id === 'samsung-galaxy-a57-5g');
    if (a57) {
      if (!a57.specs) a57.specs = {};
      if (!a57.specs.screen) a57.specs.screen = {};
      a57.specs.screen.type = 'Super AMOLED Plus (120Hz)';
    }
  }
);

console.log('Guarded Mutation executed successfully!');
console.log('Assertion Result:', assertionResult);

if (!assertionResult.passed) {
  throw new Error('STOP: Assertion result failed');
}
if (assertionResult.actualRootMutationCount !== 2) {
  throw new Error(`STOP: Expected 2 mutated roots, got ${assertionResult.actualRootMutationCount}`);
}
if (assertionResult.priceMutationCount !== 0) {
  throw new Error(`STOP: Price mutations detected: ${assertionResult.priceMutationCount}`);
}
if (assertionResult.goldenMutationCount !== 2) {
  throw new Error(`STOP: Expected 2 golden mutations, got ${assertionResult.goldenMutationCount}`);
}
if (mutatedCatalog.length !== 905) {
  throw new Error(`STOP: Catalog count invariant violated: ${mutatedCatalog.length}`);
}

// 5. Atomic write to disk with backup
const backupPath = `${catalogPath}.bak.${Date.now()}`;
fs.copyFileSync(catalogPath, backupPath);
fs.writeFileSync(catalogPath, JSON.stringify(mutatedCatalog, null, 2) + '\n', 'utf8');

console.log(`Saved backup to ${backupPath}`);
console.log(`Wrote updated catalog to ${catalogPath}`);

// Verify on-disk
const reloaded = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const r1After = reloaded.find((p: any) => p.id === 'samsung-galaxy-a17-5g');
const r2After = reloaded.find((p: any) => p.id === 'samsung-galaxy-a57-5g');

console.log('Post-Mutation Verification:');
console.log('r1 (a17):', {
  chip: r1After.specs?.processor?.chip,
  screenType: r1After.specs?.screen?.type
});
console.log('r2 (a57):', {
  screenType: r2After.specs?.screen?.type
});
console.log('Catalog root count after write:', reloaded.length);
console.log('=== SURGICAL PATCH COMPLETE ===');
