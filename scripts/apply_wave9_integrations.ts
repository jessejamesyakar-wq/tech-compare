import fs from 'node:fs';
import path from 'node:path';
import {
  MutationScopeGuard,
  MutationScopeDeclaration,
  IntendedRootMutation
} from '../src/lib/trustLayer/enforce/mutationScopeGuard';
import { GOLDEN_DATASET_V1_IDS } from '../src/lib/trustLayer/observe/goldenDatasetV1';

function main() {
  console.log('====================================================');
  console.log('🛡️  EXECUTING WAVE 9 INTEGRATIONS (A & B)  🛡️');
  console.log('====================================================\n');

  const catalogPath = path.join(__dirname, '../src/lib/smartphonesData.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

  if (catalog.length !== 905) {
    throw new Error(`Catalog count invariant broken: ${catalog.length}`);
  }

  const allGoldenRoots = new Set([
    ...GOLDEN_DATASET_V1_IDS.samsung21,
    ...GOLDEN_DATASET_V1_IDS.apple7b,
    ...GOLDEN_DATASET_V1_IDS.apple7c,
    ...GOLDEN_DATASET_V1_IDS.apple7d,
  ]);

  // Load Worker 1 (51 Golden items)
  const w1 = JSON.parse(fs.readFileSync(path.join(__dirname, '../MEGA_WAVE/WAVE9_CLOSURE/worker_01_golden_brightness.json'), 'utf8')).items;
  // Load Worker 2 (97 Safe items)
  const w2 = JSON.parse(fs.readFileSync(path.join(__dirname, '../MEGA_WAVE/WAVE9_CLOSURE/worker_02_safe_brightness.json'), 'utf8')).items;

  // Split w2 into Golden and Non-Golden
  const w2Golden = w2.filter((i: any) => allGoldenRoots.has(i.rootId));
  const w2NonGolden = w2.filter((i: any) => !allGoldenRoots.has(i.rootId));

  const allGoldenBrightness = [...w1, ...w2Golden];
  const allNonGoldenBrightness = w2NonGolden;

  console.log(`Golden brightness overlays to register: ${allGoldenBrightness.length}`); // 51 + 15 = 66
  console.log(`Non-golden brightness migrations to apply: ${allNonGoldenBrightness.length}`); // 82
  console.log(`Total brightness items: ${allGoldenBrightness.length + allNonGoldenBrightness.length}`); // 148

  // 1. Apply Non-Golden Brightness Migrations under MutationScopeGuard
  const authorizedRootIds = allNonGoldenBrightness.map((i: any) => i.rootId);
  const authorizedFieldPaths = [
    'specs.screen.brightnessTypicalNits',
    'specs.screen.brightnessHBMNits',
    'specs.screen.brightnessPeakNits',
    'specs.screen.brightnessOutdoorNits'
  ];

  const scope: MutationScopeDeclaration = {
    taskId: 'TASK-WAVE9-BRIGHTNESS-MIGRATION',
    description: 'Apply 82 verified non-golden Brightness V2 schema migrations',
    authorizedRootIds,
    authorizedFieldPaths,
    maxRootMutations: authorizedRootIds.length + 5,
    priceMutationAllowed: false,
    goldenDatasetMutationAllowed: false
  };

  const intendedMutations: IntendedRootMutation[] = [];
  for (const item of allNonGoldenBrightness) {
    const fMutations = [];
    const mig = item.proposedMigration;
    if (mig.brightnessTypicalNits) fMutations.push({ fieldPath: 'specs.screen.brightnessTypicalNits', afterValue: mig.brightnessTypicalNits });
    if (mig.brightnessHBMNits) fMutations.push({ fieldPath: 'specs.screen.brightnessHBMNits', afterValue: mig.brightnessHBMNits });
    if (mig.brightnessPeakNits) fMutations.push({ fieldPath: 'specs.screen.brightnessPeakNits', afterValue: mig.brightnessPeakNits });
    if (mig.brightnessOutdoorNits) fMutations.push({ fieldPath: 'specs.screen.brightnessOutdoorNits', afterValue: mig.brightnessOutdoorNits });

    intendedMutations.push({
      rootId: item.rootId,
      fieldMutations: fMutations
    });
  }

  console.log('Validating intended mutations with MutationScopeGuard...');
  const validation = MutationScopeGuard.validateIntendedMutations(scope, intendedMutations);
  if (!validation.valid) {
    throw new Error(`Scope guard rejected: ${validation.message}`);
  }
  console.log('Scope guard validation PASSED ✅');

  const snapshotBefore = JSON.parse(JSON.stringify(catalog));

  // Apply to catalog
  for (const item of allNonGoldenBrightness) {
    const p = catalog.find((x: any) => x.id === item.rootId);
    if (!p) throw new Error(`Product ${item.rootId} not found in catalog`);
    if (!p.specs) p.specs = {};
    if (!p.specs.screen) p.specs.screen = {};
    const mig = item.proposedMigration;
    if (mig.brightnessTypicalNits) p.specs.screen.brightnessTypicalNits = mig.brightnessTypicalNits;
    if (mig.brightnessHBMNits) p.specs.screen.brightnessHBMNits = mig.brightnessHBMNits;
    if (mig.brightnessPeakNits) p.specs.screen.brightnessPeakNits = mig.brightnessPeakNits;
    if (mig.brightnessOutdoorNits) p.specs.screen.brightnessOutdoorNits = mig.brightnessOutdoorNits;
  }

  console.log('Running post-operation assertions...');
  const postAssertion = MutationScopeGuard.assertPostOperation(scope, snapshotBefore, catalog);
  if (!postAssertion.passed) {
    throw new Error('Post-operation assertions FAILED');
  }
  console.log('Post-operation assertions PASSED ✅');
  console.log(`Actual mutated roots: ${postAssertion.actualRootMutationCount}`);

  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
  console.log('smartphonesData.json updated successfully!');

  // 2. Register Golden Overlays in goldenCorrectionRegistry.ts
  const registryPath = path.join(__dirname, '../src/lib/trustLayer/observe/goldenCorrectionRegistry.ts');
  let regContent = fs.readFileSync(registryPath, 'utf8');

  const newRegEntries = allGoldenBrightness.map((item: any, idx: number) => {
    const corrId = `GC-GOLDEN-BRIGHTNESS-WAVE9-${String(idx + 1).padStart(3, '0')}`;
    const targetField = item.targetV2Field || item.targetField || 'specs.screen.brightnessTypicalNits';
    const targetValue = item.exactValue || item.targetValue;
    return `    {
      correctionId: '${corrId}',
      rootId: '${item.rootId}',
      fieldPath: '${targetField}',
      oldValue: 'Bilinmiyor',
      newValue: ${targetValue},
      evidence: '${(item.evidence || '').replace(/'/g, "\\'")}',
      reason: 'Verified official manufacturer display brightness specification for Golden root ${item.rootId}',
      supersedesVersion: 'V1.0',
      checkedAt: '2026-10-02T02:15:00Z',
      status: 'APPROVED',
    },`;
  });

  const insertion = '\n' + newRegEntries.join('\n');
  const target = `      status: 'APPROVED',
    },
  ];`;

  if (!regContent.includes(target)) {
    throw new Error('Target insertion marker not found in goldenCorrectionRegistry.ts');
  }

  regContent = regContent.replace(target, `      status: 'APPROVED',\n    },${insertion}\n  ];`);
  fs.writeFileSync(registryPath, regContent, 'utf8');
  console.log(`goldenCorrectionRegistry.ts updated with ${allGoldenBrightness.length} new Golden brightness overlays!`);

  // 3. Provenance Closures (150 items: 66 Golden Overlays + 82 Non-Golden Migrations + 2 RAM Verified)
  const closures: any[] = [];

  // Golden Brightness Overlays
  allGoldenBrightness.forEach((item: any, idx: number) => {
    closures.push({
      verificationId: `PROV-W9-BRIGHT-GOLDEN-${String(idx + 1).padStart(3, '0')}`,
      rootId: item.rootId,
      fieldPath: item.targetV2Field || item.targetField,
      newValue: item.exactValue || item.targetValue,
      resolutionType: 'GOLDEN_CORRECTION_REGISTRY_OVERLAY',
      evidence: item.evidence,
      verifiedAt: '2026-10-02T02:15:00Z',
      verifiedBy: 'INTEGRATOR_A'
    });
  });

  // Non-Golden Brightness Migrations
  allNonGoldenBrightness.forEach((item: any, idx: number) => {
    closures.push({
      verificationId: `PROV-W9-BRIGHT-NON-GOLDEN-${String(idx + 1).padStart(3, '0')}`,
      rootId: item.rootId,
      fieldPath: item.targetField || 'specs.screen.brightnessTypicalNits',
      migratedValues: item.proposedMigration,
      resolutionType: 'BRIGHTNESS_SCHEMA_V2_MIGRATION',
      evidence: item.evidence,
      verifiedAt: '2026-10-02T02:15:00Z',
      verifiedBy: 'INTEGRATOR_A'
    });
  });

  // 2 RAM Verified Closures
  closures.push({
    verificationId: 'PROV-W9-RAM-VERIFIED-001',
    rootId: 'google-google-pixel-9a-25',
    fieldPath: 'specs.memory.ramType',
    catalogValue: 'LPDDR5X',
    resolutionType: 'VERIFIED_EXISTING_PROVENANCE_CLOSURE',
    evidence: 'Google Store official device technical specifications explicitly specify LPDDR5X RAM.',
    verifiedAt: '2026-10-02T02:15:00Z',
    verifiedBy: 'INTEGRATOR_B'
  });

  closures.push({
    verificationId: 'PROV-W9-RAM-VERIFIED-002',
    rootId: 'samsung-samsung-galaxy-s24-ultra-95',
    fieldPath: 'specs.memory.ramType',
    catalogValue: 'LPDDR5X',
    resolutionType: 'VERIFIED_EXISTING_PROVENANCE_CLOSURE',
    evidence: 'Samsung Mobile Press official device specification sheet explicitly specifies LPDDR5X memory.',
    verifiedAt: '2026-10-02T02:15:00Z',
    verifiedBy: 'INTEGRATOR_B'
  });

  const provenanceReport = {
    wave: 'WAVE-9',
    createdAt: new Date().toISOString(),
    totalClosures: closures.length,
    brightnessGoldenOverlays: allGoldenBrightness.length,
    brightnessNonGoldenMigrations: allNonGoldenBrightness.length,
    ramVerifiedClosures: 2,
    closures
  };

  const provPath = path.join(__dirname, '../reports/PROVENANCE_CLOSURES_WAVE9.json');
  fs.writeFileSync(provPath, JSON.stringify(provenanceReport, null, 2), 'utf8');
  console.log(`PROVENANCE_CLOSURES_WAVE9.json generated with ${closures.length} total closures!`);
}

main();
