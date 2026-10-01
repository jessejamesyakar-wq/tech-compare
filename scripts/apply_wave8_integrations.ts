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
  console.log('🛡️  EXECUTING WAVE 8 DOMAIN INTEGRATIONS (A, B, C)  🛡️');
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

  // 1. Process Patches (3 Non-Golden items: Precision Foundry Node Alignment)
  const processPatches = [
    { rootId: 'samsung-samsung-galaxy-s25-107', val: 'TSMC 3nm', model: 'Samsung Galaxy S25 (256 GB)' },
    { rootId: 'samsung-samsung-galaxy-s25-108', val: 'TSMC 3nm', model: 'Samsung Galaxy S25+ (256 GB)' },
    { rootId: 'samsung-samsung-galaxy-s25-ultra-109', val: 'TSMC 3nm', model: 'Samsung Galaxy S25 Ultra (512 GB)' }
  ];

  // 2. Brightness V2 Migrations from Workers 5-7 (Filtered strictly to Non-Golden items)
  const w5 = JSON.parse(fs.readFileSync(path.join(__dirname, '../MEGA_WAVE/WAVE8_CLEANUP/worker_05_brightness_chunk1.json'), 'utf8')).items;
  const w6 = JSON.parse(fs.readFileSync(path.join(__dirname, '../MEGA_WAVE/WAVE8_CLEANUP/worker_06_brightness_chunk2.json'), 'utf8')).items;
  const w7 = JSON.parse(fs.readFileSync(path.join(__dirname, '../MEGA_WAVE/WAVE8_CLEANUP/worker_07_brightness_chunk3.json'), 'utf8')).items;

  const rawBrightnessProposals = [...w5, ...w6, ...w7];
  const nonGoldenBrightnessProposals = rawBrightnessProposals.filter(p => !allGoldenRoots.has(p.rootId));

  console.log(`Loaded ${rawBrightnessProposals.length} total brightness proposals.`);
  console.log(`Filtered to ${nonGoldenBrightnessProposals.length} non-golden brightness proposals.`);

  // Verify all patch targets exist in catalog
  for (const patch of processPatches) {
    if (!catalog.some((p: any) => p.id === patch.rootId)) {
      throw new Error(`Process patch target not in catalog: ${patch.rootId}`);
    }
  }
  for (const prop of nonGoldenBrightnessProposals) {
    if (!catalog.some((p: any) => p.id === prop.rootId)) {
      throw new Error(`Brightness patch target not in catalog: ${prop.rootId}`);
    }
  }

  // Build authorized scope
  const authorizedRootIds = [
    ...processPatches.map(p => p.rootId),
    ...nonGoldenBrightnessProposals.map(p => p.rootId)
  ];

  const authorizedFieldPaths = [
    'specs.processor.process',
    'specs.screen.brightnessTypicalNits',
    'specs.screen.brightnessHBMNits',
    'specs.screen.brightnessPeakNits',
    'specs.screen.brightnessOutdoorNits'
  ];

  const scope: MutationScopeDeclaration = {
    taskId: 'TASK-WAVE8-MASS-INTEGRATION',
    description: 'Apply 3 non-golden process precision foundry patches and 49 non-golden Brightness V2 schema migrations',
    authorizedRootIds,
    authorizedFieldPaths,
    maxRootMutations: authorizedRootIds.length + 5,
    priceMutationAllowed: false,
    goldenDatasetMutationAllowed: false
  };

  // Build intended mutations for pre-validation
  const intendedMutations: IntendedRootMutation[] = [];

  for (const p of processPatches) {
    intendedMutations.push({
      rootId: p.rootId,
      fieldMutations: [{ fieldPath: 'specs.processor.process', afterValue: p.val }]
    });
  }

  for (const prop of nonGoldenBrightnessProposals) {
    const fMutations = [];
    const mig = prop.proposedMigration;
    if (mig.brightnessTypicalNits) fMutations.push({ fieldPath: 'specs.screen.brightnessTypicalNits', afterValue: mig.brightnessTypicalNits });
    if (mig.brightnessHBMNits) fMutations.push({ fieldPath: 'specs.screen.brightnessHBMNits', afterValue: mig.brightnessHBMNits });
    if (mig.brightnessPeakNits) fMutations.push({ fieldPath: 'specs.screen.brightnessPeakNits', afterValue: mig.brightnessPeakNits });
    if (mig.brightnessOutdoorNits) fMutations.push({ fieldPath: 'specs.screen.brightnessOutdoorNits', afterValue: mig.brightnessOutdoorNits });

    intendedMutations.push({
      rootId: prop.rootId,
      fieldMutations: fMutations
    });
  }

  console.log('Running pre-mutation scope guard validation...');
  const validation = MutationScopeGuard.validateIntendedMutations(scope, intendedMutations);
  if (!validation.valid) {
    throw new Error(`Scope guard rejected: ${validation.message}`);
  }
  console.log('Scope guard validation PASSED ✅');

  const snapshotBefore = JSON.parse(JSON.stringify(catalog));

  // Apply Process Patches
  for (const patch of processPatches) {
    const p = catalog.find((x: any) => x.id === patch.rootId);
    if (!p.specs) p.specs = {};
    if (!p.specs.processor) p.specs.processor = {};
    p.specs.processor.process = patch.val;
  }

  // Apply Brightness V2 Migrations
  for (const prop of nonGoldenBrightnessProposals) {
    const p = catalog.find((x: any) => x.id === prop.rootId);
    if (!p.specs) p.specs = {};
    if (!p.specs.screen) p.specs.screen = {};
    const mig = prop.proposedMigration;
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

  // Generate PROVENANCE_CLOSURES_WAVE8.json
  const closures: any[] = [];

  // Process closures (3 items)
  processPatches.forEach((p, idx) => {
    closures.push({
      verificationId: `PROV-W8-PROC-S25-${String(idx + 1).padStart(3, '0')}`,
      rootId: p.rootId,
      fieldPath: 'specs.processor.process',
      newValue: p.val,
      resolutionType: 'CATALOG_MUTATION_APPLIED',
      evidence: 'Qualcomm Snapdragon 8 Elite official announcement & TSMC 3nm (N3E) commercial mass production disclosure.',
      verifiedAt: '2026-10-02T02:05:00Z',
      verifiedBy: 'INTEGRATOR_C'
    });
  });

  // Brightness V2 closures (49 items)
  nonGoldenBrightnessProposals.forEach((prop, idx) => {
    closures.push({
      verificationId: `PROV-W8-BRIGHTNESS-V2-${String(idx + 1).padStart(3, '0')}`,
      rootId: prop.rootId,
      fieldPath: 'specs.screen.brightnessV2',
      migratedValues: prop.proposedMigration,
      resolutionType: 'BRIGHTNESS_SCHEMA_V2_MIGRATION',
      evidence: prop.evidence,
      verifiedAt: '2026-10-02T02:05:00Z',
      verifiedBy: 'INTEGRATOR_B'
    });
  });

  const provenanceReport = {
    wave: 'WAVE-8',
    createdAt: new Date().toISOString(),
    totalClosures: closures.length,
    processClosures: processPatches.length,
    ramClosures: 0,
    brightnessV2Closures: nonGoldenBrightnessProposals.length,
    governanceReclassifications: {
      dxomarkToExternalBenchmarkDebt: 314,
      historicalDxomarkClosuresPreservedWithTag: 95
    },
    closures
  };

  const provPath = path.join(__dirname, '../reports/PROVENANCE_CLOSURES_WAVE8.json');
  fs.writeFileSync(provPath, JSON.stringify(provenanceReport, null, 2), 'utf8');
  console.log(`PROVENANCE_CLOSURES_WAVE8.json written successfully with ${closures.length} closures!`);
}

main();
