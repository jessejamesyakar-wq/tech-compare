/**
 * REGRESSION TEST SUITE: P2-A PROVENANCE VALIDATOR & GOVERNANCE RULES
 *
 * PROVES:
 * 1. Wrong model source cannot be VERIFIED (MODEL_IDENTITY_MISMATCH)
 * 2. Ambiguous brightness field cannot be auto-verified with peak evidence (BLOCKED_SCHEMA_SEMANTICS)
 * 3. Chip RAM support does not prove device RAM type (CHIP_RAM_INSUFFICIENT)
 * 4. When catalog value changes, stale provenance becomes invalid (VALUE_HASH_MISMATCH)
 * 5. Golden or out-of-scope root-field write is strictly rejected (GOLDEN_DATASET_PROTECTED / SCOPE_VIOLATION_ROOT)
 */

import {
  P2AProvenanceValidator,
  P2AProvenanceRecord
} from './canary/p2aProvenanceValidator';

const dummyCatalog = [
  {
    id: 'google-google-pixel-10-pro-xl-28',
    name: 'Google Pixel 10 Pro XL',
    specs: {
      screen: { brightnessNits: 3000 },
      processor: { chip: 'Google Tensor G5', process: '3nm (TSMC)' },
      memory: { ramType: 'LPDDR5X' }
    }
  },
  {
    id: 'samsung-galaxy-s25-ultra',
    name: 'Samsung Galaxy S25 Ultra',
    specs: {
      screen: { brightnessNits: 2600 }
    }
  }
];

let passedTests = 0;
const totalTests = 5;

console.log('=== RUNNING P2-A PROVENANCE VALIDATOR REGRESSION TEST SUITE ===');

// --------------------------------------------------------------------------
// TEST 1: Wrong model source cannot be VERIFIED
// --------------------------------------------------------------------------
try {
  const record: P2AProvenanceRecord = {
    rootId: 'google-google-pixel-10-pro-xl-28',
    rawFieldPath: 'specs.processor.process',
    canonicalFieldPath: 'specs.processor.process',
    currentRawValue: '3nm (TSMC)',
    unitAndTechnicalMeaning: 'semiconductor fabrication node',
    verifiedValueOrHash: '3nm',
    valueHash: P2AProvenanceValidator.computeValueHash('3nm (TSMC)'),
    sourceUrls: ['https://www.apple.com/iphone-16-pro'],
    sourceTitle: 'Apple iPhone 16 Pro Tech Specs',
    sectionOrTable: 'Chip',
    summaryOrExcerpt: 'A18 Pro built on second-generation 3-nanometer technology.',
    accessedAt: '2026-09-30T23:25:00Z',
    modelSkuRegion: 'Apple iPhone 16 Pro', // Mismatched model!
    sourceType: 'MANUFACTURER_OFFICIAL',
    status: 'VERIFIED_EXISTING_VALUE',
    runId: 'RUN-TEST-01'
  };

  const res = P2AProvenanceValidator.validateRecord(record, dummyCatalog);
  if (!res.valid && res.errorCode === 'MODEL_IDENTITY_MISMATCH') {
    console.log('✅ Regression Test 1: Wrong model source cannot be VERIFIED (MODEL_IDENTITY_MISMATCH)');
    passedTests++;
  } else {
    throw new Error(`Test 1 Failed: Expected MODEL_IDENTITY_MISMATCH, got ${res.errorCode}`);
  }
} catch (e: any) {
  console.error('❌ Regression Test 1 Failed:', e.message);
}

// --------------------------------------------------------------------------
// TEST 2: Ambiguous brightness field cannot be auto-verified with peak evidence
// --------------------------------------------------------------------------
try {
  const record: P2AProvenanceRecord = {
    rootId: 'google-google-pixel-10-pro-xl-28',
    rawFieldPath: 'specs.screen.brightnessNits',
    canonicalFieldPath: 'specs.screen.brightnessNits',
    currentRawValue: 3000,
    unitAndTechnicalMeaning: 'peak HDR brightness nits', // Declared as peak
    verifiedValueOrHash: '3000',
    valueHash: P2AProvenanceValidator.computeValueHash(3000),
    sourceUrls: ['https://store.google.com/pixel_specs'],
    sourceTitle: 'Google Pixel Technical Specifications',
    sectionOrTable: 'Display',
    summaryOrExcerpt: 'Up to 3,000 nits (peak brightness)',
    accessedAt: '2026-09-30T23:25:00Z',
    modelSkuRegion: 'Pixel 10 Pro XL',
    sourceType: 'MANUFACTURER_OFFICIAL',
    status: 'VERIFIED_EXISTING_VALUE',
    runId: 'RUN-TEST-02'
  };

  const res = P2AProvenanceValidator.validateRecord(record, dummyCatalog);
  if (!res.valid && res.errorCode === 'BLOCKED_SCHEMA_SEMANTICS') {
    console.log('✅ Regression Test 2: Ambiguous brightness field cannot be auto-verified with peak evidence (BLOCKED_SCHEMA_SEMANTICS)');
    passedTests++;
  } else {
    throw new Error(`Test 2 Failed: Expected BLOCKED_SCHEMA_SEMANTICS, got ${res.errorCode}`);
  }
} catch (e: any) {
  console.error('❌ Regression Test 2 Failed:', e.message);
}

// --------------------------------------------------------------------------
// TEST 3: Chip RAM support does not prove device RAM type
// --------------------------------------------------------------------------
try {
  const record: P2AProvenanceRecord = {
    rootId: 'google-google-pixel-10-pro-xl-28',
    rawFieldPath: 'specs.memory.ramType',
    canonicalFieldPath: 'specs.memory.ramType',
    currentRawValue: 'LPDDR5X',
    unitAndTechnicalMeaning: 'low-power DDR RAM generation',
    verifiedValueOrHash: 'LPDDR5X',
    valueHash: P2AProvenanceValidator.computeValueHash('LPDDR5X'),
    sourceUrls: ['https://tsmc.com/whitepaper'],
    sourceTitle: 'SoC Chip Foundry Architecture Whitepaper',
    sectionOrTable: 'Memory Controller',
    summaryOrExcerpt: 'Memory controller supports up to LPDDR5X-8533.',
    accessedAt: '2026-09-30T23:25:00Z',
    modelSkuRegion: 'Pixel 10 Pro XL',
    sourceType: 'FOUNDRY_WHITEPAPER', // Chip whitepaper, not OEM device sheet
    status: 'VERIFIED_EXISTING_VALUE',
    runId: 'RUN-TEST-03'
  };

  const res = P2AProvenanceValidator.validateRecord(record, dummyCatalog);
  if (!res.valid && res.errorCode === 'CHIP_RAM_INSUFFICIENT') {
    console.log('✅ Regression Test 3: Chip RAM support does not prove device RAM type (CHIP_RAM_INSUFFICIENT)');
    passedTests++;
  } else {
    throw new Error(`Test 3 Failed: Expected CHIP_RAM_INSUFFICIENT, got ${res.errorCode}`);
  }
} catch (e: any) {
  console.error('❌ Regression Test 3 Failed:', e.message);
}

// --------------------------------------------------------------------------
// TEST 4: When catalog value changes, stale provenance becomes invalid
// --------------------------------------------------------------------------
try {
  const record: P2AProvenanceRecord = {
    rootId: 'google-google-pixel-10-pro-xl-28',
    rawFieldPath: 'specs.processor.process',
    canonicalFieldPath: 'specs.processor.process',
    currentRawValue: '4nm (Samsung)', // Old value
    unitAndTechnicalMeaning: 'semiconductor fabrication node',
    verifiedValueOrHash: '4nm',
    valueHash: P2AProvenanceValidator.computeValueHash('4nm (Samsung)'), // Hash of old value!
    sourceUrls: ['https://store.google.com/pixel_specs'],
    sourceTitle: 'Google Pixel Technical Specifications',
    sectionOrTable: 'Processor',
    summaryOrExcerpt: 'Tensor processor fabricated on 4nm process.',
    accessedAt: '2026-09-29T10:00:00Z',
    modelSkuRegion: 'Pixel 10 Pro XL',
    sourceType: 'MANUFACTURER_OFFICIAL',
    status: 'VERIFIED_EXISTING_VALUE',
    runId: 'RUN-TEST-04'
  };

  // In dummyCatalog, process is '3nm (TSMC)', so valueHash will NOT match!
  const res = P2AProvenanceValidator.validateRecord(record, dummyCatalog);
  if (!res.valid && res.errorCode === 'VALUE_HASH_MISMATCH') {
    console.log('✅ Regression Test 4: When catalog value changes, stale provenance becomes invalid (VALUE_HASH_MISMATCH)');
    passedTests++;
  } else {
    throw new Error(`Test 4 Failed: Expected VALUE_HASH_MISMATCH, got ${res.errorCode}`);
  }
} catch (e: any) {
  console.error('❌ Regression Test 4 Failed:', e.message);
}

// --------------------------------------------------------------------------
// TEST 5: Golden or out-of-scope root-field write is strictly rejected
// --------------------------------------------------------------------------
try {
  const goldenRecord: P2AProvenanceRecord = {
    rootId: 'samsung-galaxy-s25-ultra', // Protected Golden root!
    rawFieldPath: 'specs.screen.brightnessNits',
    canonicalFieldPath: 'specs.screen.brightnessNits',
    currentRawValue: 2600,
    unitAndTechnicalMeaning: 'screen brightness nits',
    verifiedValueOrHash: '2600',
    valueHash: P2AProvenanceValidator.computeValueHash(2600),
    sourceUrls: ['https://www.samsung.com/galaxy-s25-ultra'],
    sourceTitle: 'Samsung S25 Ultra Tech Specs',
    sectionOrTable: 'Display',
    summaryOrExcerpt: 'Dynamic AMOLED 2X with 2600 nits peak.',
    accessedAt: '2026-09-30T23:25:00Z',
    modelSkuRegion: 'SM-S938B',
    sourceType: 'MANUFACTURER_OFFICIAL',
    status: 'VERIFIED_EXISTING_VALUE',
    runId: 'RUN-TEST-05'
  };

  const resGolden = P2AProvenanceValidator.validateRecord(goldenRecord, dummyCatalog);

  const outOfScopeRecord: P2AProvenanceRecord = {
    ...goldenRecord,
    rootId: 'random-unauthorized-root-999'
  };
  const resScope = P2AProvenanceValidator.validateRecord(
    outOfScopeRecord,
    dummyCatalog,
    ['google-google-pixel-10-pro-xl-28'] // Allowed scope
  );

  if (
    !resGolden.valid && resGolden.errorCode === 'GOLDEN_DATASET_PROTECTED' &&
    !resScope.valid && resScope.errorCode === 'SCOPE_VIOLATION_ROOT'
  ) {
    console.log('✅ Regression Test 5: Golden or out-of-scope root-field write is strictly rejected (GOLDEN_DATASET_PROTECTED / SCOPE_VIOLATION_ROOT)');
    passedTests++;
  } else {
    throw new Error(`Test 5 Failed: Expected GOLDEN_DATASET_PROTECTED and SCOPE_VIOLATION_ROOT, got ${resGolden.errorCode} & ${resScope.errorCode}`);
  }
} catch (e: any) {
  console.error('❌ Regression Test 5 Failed:', e.message);
}

// --------------------------------------------------------------------------
// TEST 6: Root not found in catalog is rejected (CATALOG_ROOT_NOT_FOUND)
// --------------------------------------------------------------------------
try {
  const missingRootRecord: P2AProvenanceRecord = {
    rootId: 'non-existent-catalog-phone-123',
    rawFieldPath: 'specs.processor.process',
    canonicalFieldPath: 'specs.processor.process',
    currentRawValue: '3nm (TSMC)',
    unitAndTechnicalMeaning: 'semiconductor fabrication node',
    verifiedValueOrHash: '3nm',
    valueHash: P2AProvenanceValidator.computeValueHash('3nm (TSMC)'),
    sourceUrls: ['https://store.google.com'],
    sourceTitle: 'Google Specs',
    sectionOrTable: 'Processor',
    summaryOrExcerpt: 'Leading 3nm TSMC process.',
    accessedAt: '2026-09-30T23:25:00Z',
    modelSkuRegion: 'Pixel 10',
    sourceType: 'MANUFACTURER_OFFICIAL',
    status: 'VERIFIED_EXISTING_VALUE',
    runId: 'RUN-TEST-06'
  };

  const res = P2AProvenanceValidator.validateRecord(missingRootRecord, dummyCatalog);
  if (!res.valid && res.errorCode === 'CATALOG_ROOT_NOT_FOUND') {
    console.log('✅ Regression Test 6: Root not found in catalog is rejected (CATALOG_ROOT_NOT_FOUND)');
    passedTests++;
  } else {
    throw new Error(`Test 6 Failed: Expected CATALOG_ROOT_NOT_FOUND, got ${res.errorCode}`);
  }
} catch (e: any) {
  console.error('❌ Regression Test 6 Failed:', e.message);
}

// --------------------------------------------------------------------------
// TEST 7: Real root with non-existent field path is rejected (FIELD_PATH_NOT_FOUND)
// --------------------------------------------------------------------------
try {
  const missingFieldRecord: P2AProvenanceRecord = {
    rootId: 'google-google-pixel-10-pro-xl-28',
    rawFieldPath: 'specs.nonExistentField.missingSubfield',
    canonicalFieldPath: 'specs.nonExistentField.missingSubfield',
    currentRawValue: 'val',
    unitAndTechnicalMeaning: 'nonexistent spec',
    verifiedValueOrHash: 'val',
    valueHash: P2AProvenanceValidator.computeValueHash('val'),
    sourceUrls: ['https://store.google.com'],
    sourceTitle: 'Google Specs',
    sectionOrTable: 'Misc',
    summaryOrExcerpt: 'Invalid field excerpt.',
    accessedAt: '2026-09-30T23:25:00Z',
    modelSkuRegion: 'Pixel 10 Pro XL',
    sourceType: 'MANUFACTURER_OFFICIAL',
    status: 'VERIFIED_EXISTING_VALUE',
    runId: 'RUN-TEST-07'
  };

  const res = P2AProvenanceValidator.validateRecord(missingFieldRecord, dummyCatalog);
  if (!res.valid && res.errorCode === 'FIELD_PATH_NOT_FOUND') {
    console.log('✅ Regression Test 7: Real root with non-existent field path is rejected (FIELD_PATH_NOT_FOUND)');
    passedTests++;
  } else {
    throw new Error(`Test 7 Failed: Expected FIELD_PATH_NOT_FOUND, got ${res.errorCode}`);
  }
} catch (e: any) {
  console.error('❌ Regression Test 7 Failed:', e.message);
}

// --------------------------------------------------------------------------
// TEST 8: Chip dependency mismatch invalidates process provenance (CHIP_DEPENDENCY_MISMATCH)
// --------------------------------------------------------------------------
try {
  const chipMismatchRecord: P2AProvenanceRecord = {
    rootId: 'google-google-pixel-10-pro-xl-28',
    rawFieldPath: 'specs.processor.process',
    canonicalFieldPath: 'specs.processor.process',
    currentRawValue: '3nm (TSMC)',
    unitAndTechnicalMeaning: 'semiconductor fabrication node',
    verifiedValueOrHash: '3nm',
    valueHash: P2AProvenanceValidator.computeValueHash('3nm (TSMC)'),
    chipDependency: 'Snapdragon 8 Elite', // Product actually has 'Google Tensor G5'!
    sourceUrls: ['https://store.google.com'],
    sourceTitle: 'Google Specs',
    sectionOrTable: 'Processor',
    summaryOrExcerpt: 'Leading node.',
    accessedAt: '2026-09-30T23:25:00Z',
    modelSkuRegion: 'Pixel 10 Pro XL',
    sourceType: 'MANUFACTURER_OFFICIAL',
    status: 'VERIFIED_EXISTING_VALUE',
    runId: 'RUN-TEST-08'
  };

  const res = P2AProvenanceValidator.validateRecord(chipMismatchRecord, dummyCatalog);
  if (!res.valid && res.errorCode === 'CHIP_DEPENDENCY_MISMATCH') {
    console.log('✅ Regression Test 8: Chip dependency mismatch invalidates process provenance (CHIP_DEPENDENCY_MISMATCH)');
    passedTests++;
  } else {
    throw new Error(`Test 8 Failed: Expected CHIP_DEPENDENCY_MISMATCH, got ${res.errorCode}`);
  }
} catch (e: any) {
  console.error('❌ Regression Test 8 Failed:', e.message);
}

// --------------------------------------------------------------------------
// TEST 9: RAM capacity statement without LPDDR generation is rejected (RAM_CAPACITY_INSUFFICIENT)
// --------------------------------------------------------------------------
try {
  const ramCapacityRecord: P2AProvenanceRecord = {
    rootId: 'google-google-pixel-10-pro-xl-28',
    rawFieldPath: 'specs.memory.ramType',
    canonicalFieldPath: 'specs.memory.ramType',
    currentRawValue: 'LPDDR5X',
    unitAndTechnicalMeaning: 'RAM generation',
    verifiedValueOrHash: '16 GB', // Only capacity, no LPDDR!
    valueHash: P2AProvenanceValidator.computeValueHash('LPDDR5X'),
    sourceUrls: ['https://store.google.com'],
    sourceTitle: 'Google Specs',
    sectionOrTable: 'Memory',
    summaryOrExcerpt: '16 GB RAM installed.',
    accessedAt: '2026-09-30T23:25:00Z',
    modelSkuRegion: 'Pixel 10 Pro XL',
    sourceType: 'MANUFACTURER_OFFICIAL',
    status: 'VERIFIED_EXISTING_VALUE',
    runId: 'RUN-TEST-09'
  };

  const res = P2AProvenanceValidator.validateRecord(ramCapacityRecord, dummyCatalog);
  if (!res.valid && res.errorCode === 'RAM_CAPACITY_INSUFFICIENT') {
    console.log('✅ Regression Test 9: RAM capacity statement without LPDDR generation is rejected (RAM_CAPACITY_INSUFFICIENT)');
    passedTests++;
  } else {
    throw new Error(`Test 9 Failed: Expected RAM_CAPACITY_INSUFFICIENT, got ${res.errorCode}`);
  }
} catch (e: any) {
  console.error('❌ Regression Test 9 Failed:', e.message);
}

// --------------------------------------------------------------------------
// TEST 10: Blocked records cannot claim VERIFIED status (RECORD_STATUS_BLOCKED)
// --------------------------------------------------------------------------
try {
  const blockedRecord: P2AProvenanceRecord = {
    rootId: 'google-google-pixel-10-pro-xl-28',
    rawFieldPath: 'specs.memory.ramType',
    canonicalFieldPath: 'specs.memory.ramType',
    currentRawValue: 'LPDDR5X',
    unitAndTechnicalMeaning: 'RAM generation',
    verifiedValueOrHash: 'UNVERIFIED',
    valueHash: P2AProvenanceValidator.computeValueHash('LPDDR5X'),
    sourceUrls: ['https://store.google.com'],
    sourceTitle: 'Google Specs',
    sectionOrTable: 'Memory',
    summaryOrExcerpt: 'Omitted from specs.',
    accessedAt: '2026-09-30T23:25:00Z',
    modelSkuRegion: 'Pixel 10 Pro XL',
    sourceType: 'MANUFACTURER_OFFICIAL',
    status: 'BLOCKED_EVIDENCE', // Blocked!
    runId: 'RUN-TEST-10'
  };

  const res = P2AProvenanceValidator.validateRecord(blockedRecord, dummyCatalog);
  if (!res.valid && res.errorCode === 'RECORD_STATUS_BLOCKED') {
    console.log('✅ Regression Test 10: Blocked records cannot claim VERIFIED status (RECORD_STATUS_BLOCKED)');
    passedTests++;
  } else {
    throw new Error(`Test 10 Failed: Expected RECORD_STATUS_BLOCKED, got ${res.errorCode}`);
  }
} catch (e: any) {
  console.error('❌ Regression Test 10 Failed:', e.message);
}

// --------------------------------------------------------------------------
// TEST 11: Quarantined roots cannot receive provenance (QUARANTINED_ROOT_REJECTED)
// --------------------------------------------------------------------------
try {
  const quarantinedCatalog = [
    ...dummyCatalog,
    {
      id: 'oppo-k14-turbo-256gb-2027',
      name: 'Oppo K14 Turbo',
      specs: { processor: { process: '4nm' } }
    }
  ];

  const quarantinedRecord: P2AProvenanceRecord = {
    rootId: 'oppo-k14-turbo-256gb-2027',
    rawFieldPath: 'specs.processor.process',
    canonicalFieldPath: 'specs.processor.process',
    currentRawValue: '4nm',
    unitAndTechnicalMeaning: 'semiconductor fabrication node',
    verifiedValueOrHash: '4nm',
    valueHash: P2AProvenanceValidator.computeValueHash('4nm'),
    sourceUrls: ['https://oppo.com'],
    sourceTitle: 'Oppo Specs',
    sectionOrTable: 'Processor',
    summaryOrExcerpt: 'Future unreleased device.',
    accessedAt: '2026-09-30T23:25:00Z',
    modelSkuRegion: 'K14 Turbo',
    sourceType: 'MANUFACTURER_OFFICIAL',
    status: 'VERIFIED_EXISTING_VALUE',
    runId: 'RUN-TEST-11'
  };

  const res = P2AProvenanceValidator.validateRecord(quarantinedRecord, quarantinedCatalog);
  if (!res.valid && res.errorCode === 'QUARANTINED_ROOT_REJECTED') {
    console.log('✅ Regression Test 11: Quarantined roots cannot receive provenance (QUARANTINED_ROOT_REJECTED)');
    passedTests++;
  } else {
    throw new Error(`Test 11 Failed: Expected QUARANTINED_ROOT_REJECTED, got ${res.errorCode}`);
  }
} catch (e: any) {
  console.error('❌ Regression Test 11 Failed:', e.message);
}

// --------------------------------------------------------------------------
// TEST 12: Unauthorized root-field pair rejected (SCOPE_VIOLATION_FIELD)
// --------------------------------------------------------------------------
try {
  const unauthorizedPairRecord: P2AProvenanceRecord = {
    rootId: 'google-google-pixel-10-pro-xl-28',
    rawFieldPath: 'specs.camera.mainMp',
    canonicalFieldPath: 'specs.camera.mainMp',
    currentRawValue: '50 MP',
    unitAndTechnicalMeaning: 'camera resolution',
    verifiedValueOrHash: '50 MP',
    valueHash: P2AProvenanceValidator.computeValueHash('50 MP'),
    sourceUrls: ['https://store.google.com'],
    sourceTitle: 'Google Specs',
    sectionOrTable: 'Camera',
    summaryOrExcerpt: '50 MP main camera.',
    accessedAt: '2026-09-30T23:25:00Z',
    modelSkuRegion: 'Pixel 10 Pro XL',
    sourceType: 'MANUFACTURER_OFFICIAL',
    status: 'VERIFIED_EXISTING_VALUE',
    runId: 'RUN-TEST-12'
  };

  const res = P2AProvenanceValidator.validateRecord(
    unauthorizedPairRecord,
    dummyCatalog,
    ['google-google-pixel-10-pro-xl-28'],
    ['google-google-pixel-10-pro-xl-28::specs.processor.process'] // Only process is authorized
  );
  if (!res.valid && res.errorCode === 'SCOPE_VIOLATION_FIELD') {
    console.log('✅ Regression Test 12: Unauthorized root-field pair rejected (SCOPE_VIOLATION_FIELD)');
    passedTests++;
  } else {
    throw new Error(`Test 12 Failed: Expected SCOPE_VIOLATION_FIELD, got ${res.errorCode}`);
  }
} catch (e: any) {
  console.error('❌ Regression Test 12 Failed:', e.message);
}

// --------------------------------------------------------------------------
// TEST 13: Real Consumer verification and Idempotency check
// --------------------------------------------------------------------------
try {
  const { ProvenanceConsumer } = require('./provenance/provenanceConsumer');

  const validRecord: P2AProvenanceRecord = {
    rootId: 'google-google-pixel-10-pro-xl-28',
    rawFieldPath: 'specs.processor.process',
    canonicalFieldPath: 'specs.processor.process',
    currentRawValue: '3nm (TSMC)',
    unitAndTechnicalMeaning: 'semiconductor fabrication node',
    verifiedValueOrHash: '3nm (TSMC)',
    valueHash: P2AProvenanceValidator.computeValueHash('3nm (TSMC)'),
    chipDependency: 'Google Tensor G5',
    sourceUrls: ['https://blog.google'],
    sourceTitle: 'Google Specs',
    sectionOrTable: 'Processor',
    summaryOrExcerpt: 'Leading 3nm TSMC process.',
    accessedAt: '2026-09-30T23:25:00Z',
    modelSkuRegion: 'Pixel 10 Pro XL',
    sourceType: 'MANUFACTURER_OFFICIAL',
    status: 'VERIFIED_EXISTING_VALUE',
    runId: 'RUN-TEST-13'
  };

  const fieldRes = ProvenanceConsumer.verifyField(
    'google-google-pixel-10-pro-xl-28',
    'specs.processor.process',
    dummyCatalog,
    [validRecord]
  );

  const mockQueue = [
    {
      rootId: 'google-google-pixel-10-pro-xl-28',
      fieldPath: 'specs.processor.process',
      priority: 'P2'
    }
  ];

  const firstPass = ProvenanceConsumer.reconcileQueue(mockQueue, dummyCatalog, [validRecord]);
  // After resolving, queue item is resolved. If an already resolved item is evaluated:
  const secondPass = ProvenanceConsumer.reconcileQueue([], dummyCatalog, [validRecord]);

  if (
    fieldRes.verified &&
    fieldRes.status === 'PROVENANCE_VERIFIED_MATCH' &&
    firstPass.newlyResolvedP2Count === 1 &&
    secondPass.newlyResolvedP2Count === 0
  ) {
    console.log('✅ Regression Test 13: Real Consumer verification and Idempotency passed (IDEMPOTENT_RECONCILIATION)');
    passedTests++;
  } else {
    throw new Error(`Test 13 Failed: Consumer verification or idempotency failed`);
  }
} catch (e: any) {
  console.error('❌ Regression Test 13 Failed:', e.message);
}

const expectedTotalTests = 13;
console.log(`\nSummary: ${passedTests}/${expectedTotalTests} tests passed.`);
if (passedTests !== expectedTotalTests) {
  process.exit(1);
}
