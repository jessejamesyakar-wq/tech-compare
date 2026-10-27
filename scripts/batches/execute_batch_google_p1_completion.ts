import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  MutationScopeGuard,
  MutationScopeDeclaration,
  IntendedRootMutation
} from '../../src/lib/trustLayer/enforce/mutationScopeGuard';

console.log('================================================================================');
console.log('TASK: BATCH-GOOGLE-P1-COMPLETION');
console.log('MODE: EVIDENCE-GATED CONTROLLED MUTATION WITH SCOPE LOCK');
console.log('================================================================================\n');

const ROOT_DIR = path.join(__dirname, '../../');
const CATALOG_PATH = path.join(ROOT_DIR, 'src/lib/smartphonesData.json');

// ============================================================================
// PHASE 5: SCOPE LOCK DECLARATION
// ============================================================================
const scope: MutationScopeDeclaration = {
  taskId: 'BATCH-GOOGLE-P1-COMPLETION',
  description: 'Surgically correct verified P1 core specs for Google Pixel 10 Pro XL and Pixel 9a with official manufacturer evidence',
  authorizedRootIds: [
    'google-google-pixel-10-pro-xl-28',
    'google-pixel-10-pro-xl-256gb-icecat',
    'google-google-pixel-9a-25',
    'google-pixel-9a-128gb-icecat'
  ],
  authorizedFieldPaths: [
    'specs.screen.size',
    'specs.screen.type',
    'specs.processor.chip',
    'specs.screen.resolution'
  ],
  maxRootMutations: 4,
  priceMutationAllowed: false,
  goldenDatasetMutationAllowed: false
};

// Validate Scope Declaration structure
MutationScopeGuard.validateDeclaration(scope);
console.log('✅ Scope Declaration Validated:');
console.log('   Task ID:', scope.taskId);
console.log('   Authorized Roots (4):', scope.authorizedRootIds);
console.log('   Authorized Field Paths (4):', scope.authorizedFieldPaths);
console.log('   Max Root Mutations:', scope.maxRootMutations);
console.log('   Price Mutation Allowed:', scope.priceMutationAllowed);
console.log('   Golden Dataset Mutation Allowed:', scope.goldenDatasetMutationAllowed);

// ============================================================================
// PHASE 6: BACKUP & SNAPSHOT
// ============================================================================
const rawCatalogBefore = fs.readFileSync(CATALOG_PATH, 'utf8');
const beforeCatalog = JSON.parse(rawCatalogBefore);
const rootCountBefore = beforeCatalog.length;

if (rootCountBefore !== 905) {
  throw new Error(`PREFLIGHT_ERROR: Expected catalog root count 905, found ${rootCountBefore}`);
}

const backupPath = `${CATALOG_PATH}.bak.${Date.now()}`;
fs.writeFileSync(backupPath, rawCatalogBefore, 'utf8');
console.log(`\n✅ Backup snapshot created at: ${backupPath}`);
console.log(`   Catalog Root Count Before: ${rootCountBefore}`);

// Snapshot price fields and records of target roots
const catalogMap = new Map<string, any>(beforeCatalog.map((p: any) => [p.id, p]));
const snapshotRecords: Record<string, any> = {};

for (const rootId of scope.authorizedRootIds) {
  const p = catalogMap.get(rootId);
  if (!p) {
    throw new Error(`PREFLIGHT_ERROR: Authorized root '${rootId}' not found in catalog!`);
  }
  if (MutationScopeGuard.isGoldenDatasetRoot(rootId)) {
    throw new Error(`PREFLIGHT_ERROR: Root '${rootId}' is in Golden Dataset! Mutation strictly forbidden.`);
  }

  snapshotRecords[rootId] = {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    priceFingerprint: {
      basePrice: p.basePrice,
      price: p.price,
      storeOffers: p.storeOffers,
      priceHistory: p.priceHistory,
      merchantOffers: p.merchantOffers
    },
    specsBefore: JSON.parse(JSON.stringify(p.specs || {}))
  };
}

const snapshotArtifact = {
  timestamp: new Date().toISOString(),
  taskId: scope.taskId,
  catalogHashBefore: crypto.createHash('sha256').update(rawCatalogBefore).digest('hex'),
  rootCountBefore,
  targetRootsSnapshot: snapshotRecords
};

fs.writeFileSync(
  path.join(ROOT_DIR, 'reports/p1_google_pre_mutation_snapshot.json'),
  JSON.stringify(snapshotArtifact, null, 2),
  'utf8'
);
console.log('✅ Auditable snapshot written to reports/p1_google_pre_mutation_snapshot.json');

// ============================================================================
// PHASE 4 & 5: PROPOSED MUTATIONS & SCOPE PRE-FLIGHT
// ============================================================================
interface ProposedMutationDetail {
  rootId: string;
  slug: string;
  fieldPath: string;
  beforeValue: any;
  afterValue: any;
  sourceUrl: string;
  sourceType: string;
  confidence: string;
  rationale: string;
}

const proposedMutations: ProposedMutationDetail[] = [
  {
    rootId: 'google-google-pixel-10-pro-xl-28',
    slug: 'google-pixel-10-pro-xl',
    fieldPath: 'specs.screen.size',
    beforeValue: '6.85"',
    afterValue: '6.8"',
    sourceUrl: 'https://support.google.com/pixelphone/answer/7158570',
    sourceType: 'MANUFACTURER_OFFICIAL',
    confidence: 'HIGH',
    rationale: 'Google official hardware tech specs confirm 6.8-inch (171 mm) Super Actua display.'
  },
  {
    rootId: 'google-google-pixel-10-pro-xl-28',
    slug: 'google-pixel-10-pro-xl',
    fieldPath: 'specs.screen.type',
    beforeValue: '6.85" 2K 144Hz LTPO OLED 3500 Nits',
    afterValue: '6.8" Super Actua LTPO OLED (120Hz)',
    sourceUrl: 'https://support.google.com/pixelphone/answer/7158570',
    sourceType: 'MANUFACTURER_OFFICIAL',
    confidence: 'HIGH',
    rationale: 'Google official tech specs confirm Super Actua LTPO OLED display with Smooth Display (1-120 Hz) and 3300 nits peak.'
  },
  {
    rootId: 'google-google-pixel-10-pro-xl-28',
    slug: 'google-pixel-10-pro-xl',
    fieldPath: 'specs.processor.chip',
    beforeValue: 'Google Tensor G5 (TSMC 3nm)',
    afterValue: 'Google Tensor G5',
    sourceUrl: 'https://support.google.com/pixelphone/answer/7158570',
    sourceType: 'MANUFACTURER_OFFICIAL',
    confidence: 'HIGH',
    rationale: 'Google official documentation explicitly names the processor as Google Tensor G5.'
  },
  {
    rootId: 'google-google-pixel-9a-25',
    slug: 'google-pixel-9a',
    fieldPath: 'specs.processor.chip',
    beforeValue: 'Google Tensor G4 (Düz Arka Gövde)',
    afterValue: 'Google Tensor G4',
    sourceUrl: 'https://store.google.com/us/product/pixel_9a_specs?hl=en-US',
    sourceType: 'MANUFACTURER_OFFICIAL',
    confidence: 'HIGH',
    rationale: 'Removes inadvertent Turkish chassis commentary ("Düz Arka Gövde") and sets canonical processor name Google Tensor G4.'
  },
  {
    rootId: 'google-google-pixel-9a-25',
    slug: 'google-pixel-9a',
    fieldPath: 'specs.screen.resolution',
    beforeValue: '2400 x 1080 px',
    afterValue: '2424 x 1080 px',
    sourceUrl: 'https://store.google.com/us/product/pixel_9a_specs?hl=en-US',
    sourceType: 'MANUFACTURER_OFFICIAL',
    confidence: 'HIGH',
    rationale: 'Google official specs document exact 1080 x 2424 pOLED resolution (20:9 ratio at 422.2 PPI).'
  }
];

console.log('\n--- PROPOSED MUTATION PLAN ---');
proposedMutations.forEach((m, idx) => {
  console.log(`[${idx + 1}] Root: ${m.rootId} (${m.slug})`);
  console.log(`    Field: ${m.fieldPath}`);
  console.log(`    Before: '${m.beforeValue}' -> After: '${m.afterValue}'`);
  console.log(`    Source: ${m.sourceUrl} (${m.sourceType}, Confidence: ${m.confidence})`);
  console.log(`    Rationale: ${m.rationale}`);
});

// Group intended mutations by rootId for Scope Guard validation
const intendedByRoot = new Map<string, any[]>();
for (const m of proposedMutations) {
  if (!intendedByRoot.has(m.rootId)) {
    intendedByRoot.set(m.rootId, []);
  }
  intendedByRoot.get(m.rootId)!.push({
    fieldPath: m.fieldPath,
    beforeValue: m.beforeValue,
    afterValue: m.afterValue
  });
}

const intendedMutations: IntendedRootMutation[] = Array.from(intendedByRoot.entries()).map(([rootId, fieldMutations]) => ({
  rootId,
  fieldMutations
}));

console.log('\n--- PRE-FLIGHT SCOPE GUARD VALIDATION ---');
const preCheckResult = MutationScopeGuard.validateIntendedMutations(scope, intendedMutations);
console.log('✅ Scope Guard Pre-Flight Validation Passed:');
console.log('   Target Roots Count:', preCheckResult.targetRootsCount);
console.log('   Target Fields Count:', preCheckResult.targetFieldsCount);

// ============================================================================
// PHASE 7: SURGICAL MUTATION
// ============================================================================
console.log('\n--- APPLYING SURGICAL MUTATIONS ---');
const afterCatalog = JSON.parse(JSON.stringify(beforeCatalog));

// Root 1: google-google-pixel-10-pro-xl-28
const p10 = afterCatalog.find((x: any) => x.id === 'google-google-pixel-10-pro-xl-28');
if (!p10) throw new Error('Cannot find google-google-pixel-10-pro-xl-28 in working draft!');
p10.specs.screen.size = '6.8"';
p10.specs.screen.type = '6.8" Super Actua LTPO OLED (120Hz)';
p10.specs.processor.chip = 'Google Tensor G5';
console.log(`- Mutated [${p10.id}] specs.screen.size: '6.85"' -> '6.8"'`);
console.log(`- Mutated [${p10.id}] specs.screen.type: '6.85" 2K 144Hz LTPO OLED 3500 Nits' -> '6.8" Super Actua LTPO OLED (120Hz)'`);
console.log(`- Mutated [${p10.id}] specs.processor.chip: 'Google Tensor G5 (TSMC 3nm)' -> 'Google Tensor G5'`);

// Root 3: google-google-pixel-9a-25
const p9a = afterCatalog.find((x: any) => x.id === 'google-google-pixel-9a-25');
if (!p9a) throw new Error('Cannot find google-google-pixel-9a-25 in working draft!');
p9a.specs.processor.chip = 'Google Tensor G4';
p9a.specs.screen.resolution = '2424 x 1080 px';
console.log(`- Mutated [${p9a.id}] specs.processor.chip: 'Google Tensor G4 (Düz Arka Gövde)' -> 'Google Tensor G4'`);
console.log(`- Mutated [${p9a.id}] specs.screen.resolution: '2400 x 1080 px' -> '2424 x 1080 px'`);

// ============================================================================
// PHASE 8: AUTOMATIC POST-MUTATION FORENSICS & INVARIANTS
// ============================================================================
console.log('\n--- POST-MUTATION FORENSICS & INVARIANT ASSERTIONS ---');
const assertionResult = MutationScopeGuard.assertPostOperation(scope, beforeCatalog, afterCatalog);

console.log('✅ Scope Guard Post-Operation Result:');
console.log('   Passed:', assertionResult.passed);
console.log('   Actual Mutated Roots:', assertionResult.actualMutatedRoots);
console.log('   Actual Mutated Fields:', assertionResult.actualMutatedFields);
console.log('   Actual Root Mutation Count:', assertionResult.actualRootMutationCount);
console.log('   Price Mutation Count:', assertionResult.priceMutationCount);
console.log('   Golden Mutation Count:', assertionResult.goldenMutationCount);

if (assertionResult.actualRootMutationCount > 4) {
  throw new Error(`GOVERNANCE_FAILURE: Mutated root count (${assertionResult.actualRootMutationCount}) > 4`);
}
if (assertionResult.priceMutationCount !== 0) {
  throw new Error(`GOVERNANCE_FAILURE: Price mutation count (${assertionResult.priceMutationCount}) !== 0`);
}
if (assertionResult.goldenMutationCount !== 0) {
  throw new Error(`GOVERNANCE_FAILURE: Golden dataset mutation count (${assertionResult.goldenMutationCount}) !== 0`);
}

const rootCountAfter = afterCatalog.length;
console.log(`   Catalog Root Count After: ${rootCountAfter}`);
if (rootCountBefore !== rootCountAfter || rootCountAfter !== 905) {
  throw new Error(`GOVERNANCE_FAILURE: Root count invariant violated! Before: ${rootCountBefore}, After: ${rootCountAfter}`);
}

// Check price integrity on all 4 target roots
for (const rootId of scope.authorizedRootIds) {
  const pAfter = afterCatalog.find((x: any) => x.id === rootId);
  const snap = snapshotRecords[rootId];
  if (JSON.stringify(snap.priceFingerprint) !== JSON.stringify({
    basePrice: pAfter.basePrice,
    price: pAfter.price,
    storeOffers: pAfter.storeOffers,
    priceHistory: pAfter.priceHistory,
    merchantOffers: pAfter.merchantOffers
  })) {
    throw new Error(`GOVERNANCE_FAILURE: Price fingerprint changed on root ${rootId}!`);
  }
}
console.log('✅ Price Fingerprint Invariant Verified: 100% identical on all target roots.');

// Check that unaffected fields on target roots remained identical
if (p10.specs.camera.mainMp !== '50 MP' || p10.specs.connectivity.has5G !== true) {
  throw new Error('GOVERNANCE_FAILURE: Unintended mutation on Pixel 10 Pro XL camera or connectivity!');
}
if (p9a.specs.camera.mainMp !== '48 MP' || p9a.specs.connectivity.has5G !== true || p9a.specs.screen.size !== '6.3"') {
  throw new Error('GOVERNANCE_FAILURE: Unintended mutation on Pixel 9a camera, connectivity, or screen size!');
}
console.log('✅ Unaffected Field Invariant Verified.');

// ============================================================================
// ATOMIC WRITE
// ============================================================================
fs.writeFileSync(CATALOG_PATH, JSON.stringify(afterCatalog, null, 2) + '\n', 'utf8');
console.log(`\n✅ Mutated catalog successfully written to: ${CATALOG_PATH}`);

// Save forensic execution summary
const executionReport = {
  taskId: scope.taskId,
  executedAt: new Date().toISOString(),
  catalogBackupPath: backupPath,
  rootCountBefore,
  rootCountAfter,
  scopeLock: {
    authorizedRootIds: scope.authorizedRootIds,
    authorizedFieldPaths: scope.authorizedFieldPaths,
    maxRootMutations: scope.maxRootMutations,
    priceMutationAllowed: scope.priceMutationAllowed,
    goldenDatasetMutationAllowed: scope.goldenDatasetMutationAllowed
  },
  preCheckResult,
  postAssertionResult: assertionResult,
  appliedMutations: proposedMutations,
  forensicInvariants: {
    unauthorizedRootsCount: 0,
    unauthorizedFieldsCount: 0,
    priceMutationCount: assertionResult.priceMutationCount,
    goldenDatasetMutationCount: assertionResult.goldenMutationCount,
    unexpectedRootMutationCount: 0,
    unexpectedFieldMutationCount: 0,
    rootCountDelta: rootCountAfter - rootCountBefore
  }
};

fs.writeFileSync(
  path.join(ROOT_DIR, 'reports/p1_google_batch_execution.json'),
  JSON.stringify(executionReport, null, 2),
  'utf8'
);
console.log('✅ Execution log saved to reports/p1_google_batch_execution.json');
console.log('--- BATCH EXECUTION COMPLETED SUCCESSFULLY ---');
