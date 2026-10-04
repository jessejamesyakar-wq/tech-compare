import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '..');
let passed = 0;

async function test(name: string, fn: () => unknown | Promise<unknown>) {
  await fn();
  passed++;
  console.log(`PASS ${name}`);
}

async function main() {
  console.log('======================================================================');
  console.log('🛡️  DAY 2.2B: SEARCH INDEX CANONICAL LEAKAGE GATE TEST SUITE  🛡️');
  console.log('======================================================================');

  const searchIndexPath = path.join(ROOT, 'public/data/search-index.json');
  assert.ok(fs.existsSync(searchIndexPath), 'public/data/search-index.json must exist');
  const searchIndex: any[] = JSON.parse(fs.readFileSync(searchIndexPath, 'utf8'));

  const HUAWEI_LEGACY_IDS = [
    'huawei-huawei-y9-1',
    'huawei-huawei-mate-60-pro-1',
    'huawei-huawei-p40-pro-1',
    'huawei-huawei-pura-70-pro-1'
  ];

  const QUARANTINED_OPPO_IDS = [
    'oppo-k14-turbo-pro-512gb-2027',
    'oppo-k14-turbo-256gb-2027'
  ];

  const ALL_EXCLUDED = [...HUAWEI_LEGACY_IDS, ...QUARANTINED_OPPO_IDS];

  // 1. SEARCH_INDEX_COUNT_MATCHES_CANONICAL
  await test('SEARCH_INDEX_COUNT_MATCHES_CANONICAL', () => {
    assert.equal(
      searchIndex.length,
      5814,
      `Search index count must match canonical safe count exactly (expected 5814, got ${searchIndex.length})`
    );
  });

  // 2. NO_HUAWEI_LEGACY_IN_SEARCH_INDEX
  await test('NO_HUAWEI_LEGACY_IN_SEARCH_INDEX', () => {
    for (const hid of HUAWEI_LEGACY_IDS) {
      const match = searchIndex.find((p) => p.id === hid || p.slug === hid);
      assert.equal(
        match,
        undefined,
        `Huawei legacy duplicate ghost root ${hid} MUST NOT exist in search index!`
      );
    }
  });

  // 3. NO_QUARANTINED_OPPO_IN_SEARCH_INDEX
  await test('NO_QUARANTINED_OPPO_IN_SEARCH_INDEX', () => {
    for (const oid of QUARANTINED_OPPO_IDS) {
      const match = searchIndex.find((p) => p.id === oid || p.slug === oid);
      assert.equal(
        match,
        undefined,
        `Quarantined future Oppo 2027 root ${oid} MUST NOT exist in search index!`
      );
    }
  });

  // 4. SEARCH_UI_USES_CANONICAL_INDEX
  await test('SEARCH_UI_USES_CANONICAL_INDEX', () => {
    // Verify clientSearch source code points to /data/search-index.json
    const clientSearchPath = path.join(ROOT, 'src/lib/clientSearch.ts');
    const clientSearchCode = fs.readFileSync(clientSearchPath, 'utf8');
    assert.ok(
      clientSearchCode.includes('/data/search-index.json'),
      'clientSearch must fetch /data/search-index.json'
    );

    // Verify simulating search against the generated index produces 0 results for any excluded ID
    for (const exId of ALL_EXCLUDED) {
      const idMatches = searchIndex.filter(
        (p) => (p.id || '').toLowerCase() === exId || (p.slug || '').toLowerCase() === exId
      );
      assert.equal(
        idMatches.length,
        0,
        `Search index simulation for excluded product ${exId} returned ${idMatches.length} items (expected 0)`
      );
    }
  });

  // 5. CANONICAL_COUNT_LOCK
  await test('CANONICAL_COUNT_LOCK', () => {
    const datasets = [
      { name: 'smartphones', file: 'smartphonesData.json', type: 'json' },
      { name: 'tvs', file: 'mockTVs.ts', type: 'ts' },
      { name: 'laptops', file: 'mockLaptops.ts', type: 'ts' },
      { name: 'tablets', file: 'mockTablets.ts', type: 'ts' },
      { name: 'smartwatches', file: 'mockSmartwatches.ts', type: 'ts' },
      { name: 'headphones', file: 'mockHeadphones.ts', type: 'ts' },
      { name: 'appliances', file: 'mockAppliances.ts', type: 'ts' },
      { name: 'monitors', file: 'mockMonitors.ts', type: 'ts' },
      { name: 'consoles', file: 'mockConsoles.ts', type: 'ts' }
    ];

    let totalRaw = 0;
    for (const d of datasets) {
      const content = fs.readFileSync(path.join(ROOT, 'src/lib', d.file), 'utf8');
      let products: any[] = [];
      if (d.type === 'json') {
        products = JSON.parse(content);
      } else {
        const match = content.match(/export\s+const\s+(\w+)\s*:\s*(?:Product\[\]|Smartphone\[\]|TVProduct\[\]|LaptopProduct\[\]|ApplianceProduct\[\]|GenericProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
        products = JSON.parse(match![2]);
      }
      totalRaw += products.length;
    }

    assert.equal(totalRaw, 5820, 'Raw source count must be 5,820');
    assert.equal(ALL_EXCLUDED.length, 6, 'Quarantined exclusions must be exactly 6');
    const canonicalSafeCount = totalRaw - ALL_EXCLUDED.length;
    assert.equal(canonicalSafeCount, 5814, 'Canonical safe count must be exactly 5,814');
    assert.equal(searchIndex.length, canonicalSafeCount, 'Search index length must match canonical safe count');
  });

  console.log('======================================================================');
  console.log(`TOTAL DAY 2.2B TESTS: ${passed} / 5; ALL PASSED: ${passed}`);
  console.log('======================================================================');
}

main().catch((err) => {
  console.error('Test failure:', err);
  process.exit(1);
});
