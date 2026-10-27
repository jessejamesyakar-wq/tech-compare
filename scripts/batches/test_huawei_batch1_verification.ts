/**
 * scripts/batches/test_huawei_batch1_verification.ts
 *
 * Automated regression test suite for Huawei Repair Batch 1.
 * Verifies all locks, field presence, and invariant guarantees.
 */

import * as fs from 'fs';
import * as path from 'path';
import assert from 'assert';
import { getStoredProducts } from '../../src/lib/adminData';
import { CANONICAL_EXCLUDED_ID_SET } from '../../src/lib/governance/canonicalExclusions';
import { GOLDEN_DATASET_V1_IDS } from '../../src/lib/trustLayer/observe/goldenDatasetV1';

async function main() {
  console.log('======================================================================');
  console.log('TEST SUITE: HUAWEI REPAIR BATCH 1 POST-MUTATION VERIFICATION');
  console.log('======================================================================\n');

  const allProducts = getStoredProducts();
  const canonical = allProducts.filter(p => !CANONICAL_EXCLUDED_ID_SET.has(p.id));

  // 1. Invariant: 5814 Canonical
  assert.strictEqual(canonical.length, 5814, `Expected 5814 canonical products, got ${canonical.length}`);
  console.log('[PASS] CANONICAL_PRODUCTS = 5814');

  // 2. All 10 roots exist and have specs
  const targets = [
    'huawei-huawei-nova-12-ultra',
    'huawei-huawei-p60-pro',
    'huawei-huawei-p50-pro',
    'huawei-huawei-p30-pro',
    'huawei-huawei-mate-60-pro',
    'huawei-huawei-mate-50-pro',
    'huawei-huawei-nova-10-pro',
    'huawei-huawei-ascend-y201-pro',
    'huawei-huawei-enjoy-10-plus',
    'huawei-huawei-enjoy-20-pro'
  ];

  for (const tid of targets) {
    const p = allProducts.find(x => x.id === tid);
    assert.ok(p, `Target root ${tid} must exist`);
    assert.ok(p.specs && Object.keys(p.specs).length > 0, `Target root ${tid} must have populated specs`);
    assert.ok(p.releaseYear, `Target root ${tid} must have releaseYear`);
    assert.strictEqual(p.storeOffers.length, 0, `Target root ${tid} must have 0 store offers`);
    assert.strictEqual(p.priceHistory?.length || 0, 0, `Target root ${tid} must have 0 price history`);
  }
  console.log('[PASS] ALL_10_TARGETS_POPULATED_WITHOUT_PRICES');

  // 3. Hard Lock: nova 12 Ultra has5G is undefined
  const nova12 = allProducts.find(x => x.id === 'huawei-huawei-nova-12-ultra')!;
  assert.strictEqual((nova12.specs as any)?.connectivity?.has5G, undefined, 'nova 12 Ultra has5G must remain undefined');
  assert.ok(nova12.specVerification?.unresolvedFields.includes('connectivity.has5G'), 'nova 12 Ultra must flag connectivity.has5G as unresolved');
  console.log('[PASS] NOVA_12_ULTRA_5G_LOCKED_UNDEFINED');

  // 4. Hard Lock: Mate 60 Pro has5G is undefined
  const mate60 = allProducts.find(x => x.id === 'huawei-huawei-mate-60-pro')!;
  assert.strictEqual((mate60.specs as any)?.connectivity?.has5G, undefined, 'Mate 60 Pro has5G must remain undefined');
  assert.ok(mate60.specVerification?.unresolvedFields.includes('connectivity.has5G'), 'Mate 60 Pro must flag connectivity.has5G as unresolved');
  console.log('[PASS] MATE_60_PRO_5G_LOCKED_UNDEFINED');

  // 5. Hard Lock: P50 Pro chipset is undefined & modelNumber is undefined
  const p50 = allProducts.find(x => x.id === 'huawei-huawei-p50-pro')!;
  assert.strictEqual((p50.specs as any)?.processor?.chip, undefined, 'P50 Pro chipset must remain undefined');
  assert.strictEqual(p50.model, undefined, 'P50 Pro modelNumber must remain undefined');
  assert.ok(p50.specVerification?.unresolvedFields.includes('processor.chip'), 'P50 Pro must flag processor.chip as unresolved');
  console.log('[PASS] P50_PRO_DUAL_PLATFORM_CHIPSET_LOCKED_UNDEFINED');

  // 6. Confirmed 5G on Enjoy 20 Pro
  const enjoy20 = allProducts.find(x => x.id === 'huawei-huawei-enjoy-20-pro')!;
  assert.strictEqual((enjoy20.specs as any)?.connectivity?.has5G, true, 'Enjoy 20 Pro has5G must be true');
  console.log('[PASS] ENJOY_20_PRO_5G_VERIFIED_TRUE');

  // 7. Confirmed 4G / non-5G on P60 Pro, P30 Pro, Mate 50 Pro, nova 10 Pro, Ascend Y201 Pro, Enjoy 10 Plus
  const non5gTargets = [
    'huawei-huawei-p60-pro',
    'huawei-huawei-p50-pro',
    'huawei-huawei-p30-pro',
    'huawei-huawei-mate-50-pro',
    'huawei-huawei-nova-10-pro',
    'huawei-huawei-ascend-y201-pro',
    'huawei-huawei-enjoy-10-plus'
  ];
  for (const nid of non5gTargets) {
    const p = allProducts.find(x => x.id === nid)!;
    assert.strictEqual((p.specs as any)?.connectivity?.has5G, false, `${nid} has5G must be false`);
  }
  console.log('[PASS] ALL_7_NON_5G_MODELS_VERIFIED_FALSE');

  // 8. Golden Dataset Integrity (83 roots)
  const allGoldenIds = [
    ...GOLDEN_DATASET_V1_IDS.samsung21,
    ...GOLDEN_DATASET_V1_IDS.apple7b,
    ...GOLDEN_DATASET_V1_IDS.apple7c,
    ...GOLDEN_DATASET_V1_IDS.apple7d,
  ];
  for (const gid of allGoldenIds) {
    const g = allProducts.find(x => x.id === gid);
    assert.ok(g, `Golden root ${gid} must exist in catalog`);
  }
  console.log('[PASS] GOLDEN_DATASET_83_ROOTS_VERIFIED_INTACT');

  // 9. Wave 2.2B Source Type Semantics Closure
  const mixedTargets = [
    'huawei-huawei-nova-12-ultra',
    'huawei-huawei-p60-pro',
    'huawei-huawei-p30-pro',
    'huawei-huawei-mate-60-pro',
    'huawei-huawei-mate-50-pro',
    'huawei-huawei-nova-10-pro',
    'huawei-huawei-ascend-y201-pro',
    'huawei-huawei-enjoy-10-plus',
    'huawei-huawei-enjoy-20-pro'
  ];
  for (const mtid of mixedTargets) {
    const p = allProducts.find(x => x.id === mtid)!;
    assert.strictEqual(p.sourceType, undefined, `${mtid} has mixed provenance; sourceType must be unset (got '${p.sourceType}')`);
  }
  const p50Root = allProducts.find(x => x.id === 'huawei-huawei-p50-pro')!;
  assert.strictEqual(p50Root.sourceType, 'manufacturer', `huawei-huawei-p50-pro is pure manufacturer datasheet evidence; sourceType must be 'manufacturer'`);
  console.log('[PASS] SOURCE_TYPE_SEMANTICS_VERIFIED (1 manufacturer, 9 unset)');

  // 10. Empty Specs Inventory Invariant (375 remaining)
  const emptySpecs = canonical.filter(p => !p.specs || Object.keys(p.specs).length === 0);
  assert.strictEqual(emptySpecs.length, 375, `Expected 375 empty specs roots, got ${emptySpecs.length}`);
  console.log('[PASS] EMPTY_SPECS_INVARIANT = 375');

  console.log('\n======================================================================');
  console.log('ALL 10 POST-MUTATION TESTS PASSED (0 FAILED)');
  console.log('======================================================================');
}

main().catch(err => {
  console.error('[FAIL]', err);
  process.exit(1);
});
