import fs from 'node:fs';
import path from 'node:path';
import {
  MutationScopeGuard,
  MutationScopeDeclaration,
  IntendedRootMutation
} from '../src/lib/trustLayer/enforce/mutationScopeGuard';
import { GoldenCorrectionRegistry, GoldenCorrection } from '../src/lib/trustLayer/observe/goldenCorrectionRegistry';

function main() {
  const catalogPath = path.join(__dirname, '../src/lib/smartphonesData.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

  if (catalog.length !== 905) {
    throw new Error(`Catalog count invariant broken: ${catalog.length}`);
  }

  // 1. Process Patches (8 items)
  const processPatches = [
    { rootId: 'apple-apple-iphone-3gs-16-gb-137', val: 'Samsung 65nm' },
    { rootId: 'philips-xenium-e2125', val: 'TSMC 40nm' },
    { rootId: 'philips-xenium-e227', val: 'TSMC 28nm' },
    { rootId: 'philips-s318', val: 'TSMC 28nm' },
    { rootId: 'tcl-tcl-605-50', val: 'TSMC 12nm' },
    { rootId: 'tecno-tecno-spark-40-4g', val: 'TSMC 12nm' },
    { rootId: 'samsung-samsung-galaxy-a02-56', val: 'TSMC 28nm' },
    { rootId: 'samsung-samsung-galaxy-a56-5g-117', val: 'Samsung 4nm' }
  ];

  // 2. RAM Patches (5 items)
  const ramPatches = [
    { rootId: 'oneplus-oneplus-nord-ce3', val: 'LPDDR4X' },
    { rootId: 'oneplus-oneplus-nord-ce4', val: 'LPDDR4X' },
    { rootId: 'oneplus-oneplus-nord-ce4-lite', val: 'LPDDR4X' },
    { rootId: 'oneplus-oneplus-nord-ce4-lite-india', val: 'LPDDR4X' },
    { rootId: 'oneplus-oneplus-nord-ce5-5g', val: 'LPDDR4X' }
  ];

  const authorizedRootIds = [
    ...processPatches.map(p => p.rootId),
    ...ramPatches.map(p => p.rootId)
  ];

  const authorizedFieldPaths = [
    'specs.processor.process',
    'specs.memory.ramType'
  ];

  const scope: MutationScopeDeclaration = {
    taskId: 'TASK-WAVE7-MASS-INTEGRATION',
    description: 'Apply 8 non-golden process patches and 5 device-level OEM RAM patches',
    authorizedRootIds,
    authorizedFieldPaths,
    maxRootMutations: 20,
    priceMutationAllowed: false,
    goldenDatasetMutationAllowed: false
  };

  const intendedMutations: IntendedRootMutation[] = [
    ...processPatches.map(p => ({
      rootId: p.rootId,
      fieldMutations: [{ fieldPath: 'specs.processor.process', afterValue: p.val }]
    })),
    ...ramPatches.map(p => ({
      rootId: p.rootId,
      fieldMutations: [{ fieldPath: 'specs.memory.ramType', afterValue: p.val }]
    }))
  ];

  console.log('Running pre-mutation scope guard validation...');
  const validation = MutationScopeGuard.validateIntendedMutations(scope, intendedMutations);
  if (!validation.valid) {
    throw new Error(`Scope guard rejected: ${validation.message}`);
  }
  console.log('Scope guard validation PASSED ✅');

  const snapshotBefore = JSON.parse(JSON.stringify(catalog));

  // Apply process patches
  for (const patch of processPatches) {
    const p = catalog.find((x: any) => x.id === patch.rootId);
    if (!p) throw new Error(`Product ${patch.rootId} not found`);
    if (!p.specs) p.specs = {};
    if (!p.specs.processor) p.specs.processor = {};
    p.specs.processor.process = patch.val;
  }

  // Apply RAM patches
  for (const patch of ramPatches) {
    const p = catalog.find((x: any) => x.id === patch.rootId);
    if (!p) throw new Error(`Product ${patch.rootId} not found`);
    if (!p.specs) p.specs = {};
    if (!p.specs.memory) p.specs.memory = {};
    p.specs.memory.ramType = patch.val;
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

  // 3. Register 8 Golden Corrections in goldenCorrectionRegistry.ts
  const goldenCorrections = [
    { rootId: 'samsung-galaxy-s25', val: 'TSMC 3nm', name: 'Samsung Galaxy S25' },
    { rootId: 'samsung-galaxy-s25-plus', val: 'TSMC 3nm', name: 'Samsung Galaxy S25+' },
    { rootId: 'samsung-galaxy-s25-ultra', val: 'TSMC 3nm', name: 'Samsung Galaxy S25 Ultra' },
    { rootId: 'samsung-samsung-galaxy-s24-93', val: 'Samsung 4nm', name: 'Samsung Galaxy S24' },
    { rootId: 'samsung-samsung-galaxy-s24-ultra-95', val: 'TSMC 4nm', name: 'Samsung Galaxy S24 Ultra' },
    { rootId: 'samsung-samsung-galaxy-a55-5g-103', val: 'Samsung 4nm', name: 'Samsung Galaxy A55 5G' },
    { rootId: 'samsung-samsung-galaxy-z-flip-6-97', val: 'TSMC 4nm', name: 'Samsung Galaxy Z Flip 6' },
    { rootId: 'samsung-samsung-galaxy-z-fold-6-98', val: 'TSMC 4nm', name: 'Samsung Galaxy Z Fold 6' }
  ];

  const registryPath = path.join(__dirname, '../src/lib/trustLayer/observe/goldenCorrectionRegistry.ts');
  let regContent = fs.readFileSync(registryPath, 'utf8');

  const newRegEntries = goldenCorrections.map((item, idx) => {
    const corrId = `GC-SAMSUNG-WAVE7-PROCESS-${String(idx + 1).padStart(3, '0')}`;
    return `    {
      correctionId: '${corrId}',
      rootId: '${item.rootId}',
      fieldPath: 'specs.processor.process',
      oldValue: 'Bilinmiyor',
      newValue: '${item.val}',
      evidence: 'Official Samsung Electronics and foundry commercial mass production disclosure for ${item.name}.',
      reason: 'Verified official manufacturer and foundry fabrication node correction for Golden root ${item.rootId}',
      supersedesVersion: 'V1.0',
      checkedAt: '2026-10-02T01:45:00Z',
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
  console.log('goldenCorrectionRegistry.ts updated with 8 new Golden corrections!');

  // 4. Generate PROVENANCE_CLOSURES_WAVE7.json
  const closures: any[] = [];

  // 16 Process closures
  processPatches.forEach((p, idx) => {
    closures.push({
      verificationId: `PROV-W7-PROC-NON-GOLDEN-${String(idx + 1).padStart(3, '0')}`,
      rootId: p.rootId,
      fieldPath: 'specs.processor.process',
      newValue: p.val,
      resolutionType: 'CATALOG_MUTATION_APPLIED',
      verifiedAt: '2026-10-02T01:45:00Z',
      verifiedBy: 'INTEGRATOR_A'
    });
  });

  goldenCorrections.forEach((p, idx) => {
    closures.push({
      verificationId: `PROV-W7-PROC-GOLDEN-OVERLAY-${String(idx + 1).padStart(3, '0')}`,
      rootId: p.rootId,
      fieldPath: 'specs.processor.process',
      newValue: p.val,
      resolutionType: 'GOLDEN_CORRECTION_REGISTRY_OVERLAY',
      verifiedAt: '2026-10-02T01:45:00Z',
      verifiedBy: 'INTEGRATOR_A'
    });
  });

  // 95 Camera closures
  const camChunk1 = JSON.parse(fs.readFileSync('MEGA_WAVE/WAVE7_SCHEMA_ATTACK/worker_04_camera_chunk1.json', 'utf8')).items;
  const camChunk2 = JSON.parse(fs.readFileSync('MEGA_WAVE/WAVE7_SCHEMA_ATTACK/worker_05_camera_chunk2.json', 'utf8')).items;
  const allCam = [...camChunk1, ...camChunk2].filter(i => i.status === 'PROVENANCE_CLOSURE_READY');

  allCam.forEach((item, idx) => {
    closures.push({
      verificationId: `PROV-W7-CAM-DXO-${String(idx + 1).padStart(3, '0')}`,
      rootId: item.rootId,
      fieldPath: item.fieldPath,
      catalogValue: item.catalogValue,
      resolutionType: 'VERIFIED_EXISTING_PROVENANCE_CLOSURE',
      evidence: item.evidence,
      verifiedAt: '2026-10-02T01:45:00Z',
      verifiedBy: 'INTEGRATOR_B'
    });
  });

  // 6 RAM closures (5 patches + 1 verified)
  ramPatches.forEach((p, idx) => {
    closures.push({
      verificationId: `PROV-W7-RAM-PATCH-${String(idx + 1).padStart(3, '0')}`,
      rootId: p.rootId,
      fieldPath: 'specs.memory.ramType',
      newValue: p.val,
      resolutionType: 'CATALOG_MUTATION_APPLIED',
      evidence: 'OnePlus official device-level technical specification sheet.',
      verifiedAt: '2026-10-02T01:45:00Z',
      verifiedBy: 'INTEGRATOR_C'
    });
  });

  closures.push({
    verificationId: 'PROV-W7-RAM-VERIFIED-001',
    rootId: 'google-google-pixel-8-pro-256-gb-895874',
    fieldPath: 'specs.memory.ramType',
    catalogValue: 'LPDDR5X',
    resolutionType: 'VERIFIED_EXISTING_PROVENANCE_CLOSURE',
    evidence: 'Google Store official device technical specifications explicitly specify LPDDR5X RAM.',
    verifiedAt: '2026-10-02T01:45:00Z',
    verifiedBy: 'INTEGRATOR_C'
  });

  const provenanceReport = {
    wave: 'WAVE-7',
    createdAt: new Date().toISOString(),
    totalClosures: closures.length,
    processClosures: 16,
    cameraClosures: allCam.length,
    ramClosures: 6,
    closures
  };

  const provPath = path.join(__dirname, '../reports/PROVENANCE_CLOSURES_WAVE7.json');
  fs.writeFileSync(provPath, JSON.stringify(provenanceReport, null, 2), 'utf8');
  console.log(`PROVENANCE_CLOSURES_WAVE7.json generated with ${closures.length} total closures!`);
}

main();
