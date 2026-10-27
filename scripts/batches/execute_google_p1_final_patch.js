/**
 * SURGICAL MUTATION SCRIPT: GOOGLE P1 FINAL PATCH
 *
 * Implements Scope-Locked mutation of exactly 13 fields across 3 Google roots:
 * 1. google-google-pixel-10-pro-xl-28 (6 fields)
 * 2. google-pixel-10-pro-xl-256gb-icecat (1 field)
 * 3. google-google-pixel-9a-25 (6 fields)
 *
 * Fourth root google-pixel-9a-128gb-icecat is audit-only (0 mutations).
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_PATH = path.join(__dirname, '../../src/lib/smartphonesData.json');

// 1. Authorization Scope Declaration
const SCOPE_DECLARATION = {
  taskId: 'TASK-GOOGLE-P1-FINAL-PATCH',
  description: 'Authorized Google P1 Final Patch - 13 fields across 3 roots',
  authorizedRootIds: [
    'google-google-pixel-10-pro-xl-28',
    'google-pixel-10-pro-xl-256gb-icecat',
    'google-google-pixel-9a-25'
  ],
  authorizedFieldPaths: [
    'specs.screen.refreshRate',
    'specs.screen.ppi',
    'specs.battery.capacitymAh',
    'specs.connectivity.bluetooth',
    'specs.build.weightGrams',
    'specs.software.osName',
    'specs.batteryCapacity',
    'specs.processor.process',
    'specs.camera.ultrawideMp'
  ],
  maxRootMutations: 3,
  priceMutationAllowed: false,
  goldenDatasetMutationAllowed: false
};

// 2. Expected Baseline Values (Before State)
const EXPECTED_BEFORE = {
  'google-google-pixel-10-pro-xl-28': {
    'specs.screen.refreshRate': 144,
    'specs.screen.ppi': 490,
    'specs.battery.capacitymAh': 5300,
    'specs.connectivity.bluetooth': '5.4',
    'specs.build.weightGrams': 207,
    'specs.software.osName': 'Android 15 (Gemini AI)'
  },
  'google-pixel-10-pro-xl-256gb-icecat': {
    'specs.batteryCapacity': 5100
  },
  'google-google-pixel-9a-25': {
    'specs.screen.ppi': 411,
    'specs.processor.process': '3nm (TSMC)',
    'specs.camera.ultrawideMp': '48 MP Super Actua UW',
    'specs.battery.capacitymAh': 4800,
    'specs.connectivity.bluetooth': '5.4',
    'specs.build.weightGrams': 178
  }
};

// 3. Authorized Target Values (Official Manufacturer Specifications)
const TARGET_MUTATIONS = {
  'google-google-pixel-10-pro-xl-28': {
    'specs.screen.refreshRate': 120,
    'specs.screen.ppi': 486,
    'specs.battery.capacitymAh': 5200,
    'specs.connectivity.bluetooth': '6.0',
    'specs.build.weightGrams': 232,
    'specs.software.osName': 'Android 16'
  },
  'google-pixel-10-pro-xl-256gb-icecat': {
    'specs.batteryCapacity': 5200
  },
  'google-google-pixel-9a-25': {
    'specs.screen.ppi': 422.2,
    'specs.processor.process': '4nm',
    'specs.camera.ultrawideMp': '13 MP',
    'specs.battery.capacitymAh': 5100,
    'specs.connectivity.bluetooth': '5.3',
    'specs.build.weightGrams': 187.1
  }
};

function getNestedValue(obj, fieldPath) {
  const parts = fieldPath.split('.');
  let curr = obj;
  for (const part of parts) {
    if (!curr || typeof curr !== 'object') return undefined;
    curr = curr[part];
  }
  return curr;
}

function setNestedValue(obj, fieldPath, value) {
  const parts = fieldPath.split('.');
  let curr = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!curr[part] || typeof curr[part] !== 'object') {
      curr[part] = {};
    }
    curr = curr[part];
  }
  curr[parts[parts.length - 1]] = value;
}

function main() {
  console.log('================================================================================');
  console.log('TASK: GOOGLE P1 FINAL PATCH — SURGICAL MUTATION');
  console.log('MODE: CONTROLLED MUTATION WITH SCOPE LOCK & EVIDENCE GATE');
  console.log('================================================================================\n');

  // Load catalog
  const catalogRaw = fs.readFileSync(DATA_PATH, 'utf8');
  const catalog = JSON.parse(catalogRaw);
  const initialRootCount = catalog.length;
  console.log(`Loaded catalog: ${initialRootCount} roots.`);

  // 1. Preflight: Root existence & Baseline verification
  console.log('--- 1. PRE-FLIGHT BASELINE & PRICE VERIFICATION ---');
  let baselineDriftCount = 0;
  const driftErrors = [];

  for (const [rootId, expectedFields] of Object.entries(EXPECTED_BEFORE)) {
    const product = catalog.find(p => p.id === rootId);
    if (!product) {
      throw new Error(`PREFLIGHT_FAIL: Root '${rootId}' not found in catalog!`);
    }

    console.log(`\nInspecting Root: ${rootId} (${product.name})`);
    console.log(`  Base Price: ${product.basePrice} TRY, Store Offers Count: ${product.storeOffers?.length || 0}`);

    for (const [fieldPath, expectedVal] of Object.entries(expectedFields)) {
      const currentVal = getNestedValue(product, fieldPath);
      console.log(`  - [${fieldPath}] Current: ${JSON.stringify(currentVal)} | Expected: ${JSON.stringify(expectedVal)}`);

      if (currentVal !== expectedVal) {
        baselineDriftCount++;
        driftErrors.push({
          rootId,
          fieldPath,
          currentVal,
          expectedVal,
          classification: 'BASELINE_DRIFT'
        });
      }
    }
  }

  if (baselineDriftCount > 0) {
    console.error(`\n🚨 BASELINE DRIFT DETECTED: ${baselineDriftCount} fields do not match expected before state:`);
    console.error(JSON.stringify(driftErrors, null, 2));
    throw new Error('STOP: Mutation halted due to BASELINE_DRIFT.');
  }

  console.log('\n✅ Preflight Baseline Verification Passed: 0 baseline drifts detected.');

  // 2. Prepare deep clone before mutation for forensic tracking
  const beforeCatalogCopy = JSON.parse(JSON.stringify(catalog));

  // 3. Perform surgical mutation
  console.log('\n--- 2. EXECUTING SURGICAL MUTATION (13 FIELDS) ---');
  const mutatedFieldsRecord = [];

  for (const [rootId, patchFields] of Object.entries(TARGET_MUTATIONS)) {
    const product = catalog.find(p => p.id === rootId);

    for (const [fieldPath, targetVal] of Object.entries(patchFields)) {
      const oldVal = getNestedValue(product, fieldPath);
      setNestedValue(product, fieldPath, targetVal);
      mutatedFieldsRecord.push({
        rootId,
        fieldPath,
        oldValue: oldVal,
        newValue: targetVal
      });
      console.log(`  [PATCHED] ${rootId} -> ${fieldPath}: ${JSON.stringify(oldVal)} => ${JSON.stringify(targetVal)}`);
    }
  }

  // 4. Forensic diff check
  console.log('\n--- 3. POST-MUTATION FORENSIC DIFF AUDIT ---');
  const actualMutatedRoots = new Set();
  const actualMutatedFields = new Set();
  let priceMutationCount = 0;

  for (let i = 0; i < catalog.length; i++) {
    const pBefore = beforeCatalogCopy[i];
    const pAfter = catalog[i];

    if (pBefore.id !== pAfter.id) {
      throw new Error(`ID Mismatch at index ${i}: ${pBefore.id} vs ${pAfter.id}`);
    }

    // Check price mutations
    if (
      pBefore.basePrice !== pAfter.basePrice ||
      JSON.stringify(pBefore.storeOffers) !== JSON.stringify(pAfter.storeOffers) ||
      JSON.stringify(pBefore.priceHistory) !== JSON.stringify(pAfter.priceHistory)
    ) {
      priceMutationCount++;
    }

    const beforeStr = JSON.stringify(pBefore);
    const afterStr = JSON.stringify(pAfter);
    if (beforeStr !== afterStr) {
      actualMutatedRoots.add(pAfter.id);
    }
  }

  for (const m of mutatedFieldsRecord) {
    actualMutatedFields.add(m.fieldPath);
  }

  console.log(`Actual Mutated Roots Count: ${actualMutatedRoots.size} (${Array.from(actualMutatedRoots).join(', ')})`);
  console.log(`Actual Mutated Fields Count: ${mutatedFieldsRecord.length}`);
  console.log(`Price Mutation Count: ${priceMutationCount}`);

  // Assertions
  const authorizedRootSet = new Set(SCOPE_DECLARATION.authorizedRootIds);
  const authorizedFieldSet = new Set(SCOPE_DECLARATION.authorizedFieldPaths);

  for (const r of actualMutatedRoots) {
    if (!authorizedRootSet.has(r)) {
      throw new Error(`UNAUTHORIZED_ROOT_MUTATION: Root '${r}' was mutated but not in scope!`);
    }
  }

  for (const f of actualMutatedFields) {
    if (!authorizedFieldSet.has(f)) {
      throw new Error(`UNAUTHORIZED_FIELD_MUTATION: Field '${f}' was mutated but not in scope!`);
    }
  }

  if (actualMutatedRoots.size > SCOPE_DECLARATION.maxRootMutations) {
    throw new Error(`ROOT_LIMIT_EXCEEDED: Mutated ${actualMutatedRoots.size} roots > max ${SCOPE_DECLARATION.maxRootMutations}`);
  }

  if (priceMutationCount > 0) {
    throw new Error(`PRICE_FIREWALL_VIOLATION: Price mutation count is ${priceMutationCount}!`);
  }

  if (catalog.length !== initialRootCount) {
    throw new Error(`ROOT_COUNT_MUTATION: Root count changed from ${initialRootCount} to ${catalog.length}!`);
  }

  // 5. Create backup and atomic write
  const backupPath = `${DATA_PATH}.bak.${Date.now()}`;
  fs.writeFileSync(backupPath, catalogRaw, 'utf8');
  console.log(`\nCreated catalog backup: ${backupPath}`);

  fs.writeFileSync(DATA_PATH, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
  console.log(`Updated catalog successfully written to ${DATA_PATH}`);

  console.log('\n✅ GOOGLE P1 FINAL PATCH COMPLETED SUCCESSFULLY (13 fields patched).');
}

main();
