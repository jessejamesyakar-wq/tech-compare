import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import cp from 'node:child_process';
import { normalizeProductIdentity, buildProductIdentityKey } from '../src/lib/matching/productIdentityNormalizer';

const ROOT = path.resolve(__dirname, '..');
let passed = 0;

async function test(name: string, fn: () => unknown | Promise<unknown>) {
  await fn();
  passed++;
  console.log(`PASS ${name}`);
}

async function main() {
  console.log('======================================================================');
  console.log('🛡️  DAY 2.2: DUPLICATE FIX & APPLE 5G RECONCILIATION TEST SUITE  🛡️');
  console.log('======================================================================');

  // Load canonical catalog datasets
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

  const allRawProducts: any[] = [];
  let smartphones: any[] = [];
  for (const d of datasets) {
    const filePath = path.join(ROOT, 'src/lib', d.file);
    const content = fs.readFileSync(filePath, 'utf8');
    let products: any[] = [];
    if (d.type === 'json') {
      products = JSON.parse(content);
      if (d.name === 'smartphones') smartphones = products;
    } else {
      const match = content.match(/export\s+const\s+(\w+)\s*:\s*(?:Product\[\]|Smartphone\[\]|TVProduct\[\]|LaptopProduct\[\]|ApplianceProduct\[\]|GenericProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
      if (!match) throw new Error('Could not parse ' + d.file);
      products = JSON.parse(match[2]);
    }
    products.forEach((p: any) => { if (!p.category) p.category = d.name; });
    allRawProducts.push(...products);
  }

  const KNOWN_EXCLUSIONS = new Set([
    'oppo-k14-turbo-pro-512gb-2027',
    'oppo-k14-turbo-256gb-2027',
    'huawei-huawei-y9-1',
    'huawei-huawei-mate-60-pro-1',
    'huawei-huawei-p40-pro-1',
    'huawei-huawei-pura-70-pro-1'
  ]);

  const canonicalProducts = allRawProducts.filter(p => !KNOWN_EXCLUSIONS.has(p.id));

  // 1. DUPLICATE_PLUS_TOKEN_PRESERVED
  await test('DUPLICATE_PLUS_TOKEN_PRESERVED', () => {
    const normPlus = normalizeProductIdentity('Realme 16 Pro+');
    const normNoPlus = normalizeProductIdentity('Realme 16 Pro');
    assert.ok(normPlus.includes('+'), "Normalized 'Realme 16 Pro+' must retain the '+' token");
    assert.ok(!normNoPlus.includes('+'), "Normalized 'Realme 16 Pro' must not contain '+'");
    assert.ok(normalizeProductIdentity('Roborock S9+').includes('+'), "Roborock S9+ must retain '+'");
    assert.ok(normalizeProductIdentity('Samsung Galaxy S21+').includes('+'), "Samsung Galaxy S21+ must retain '+'");
    assert.ok(normalizeProductIdentity('Dyson Outsize+™').includes('+'), "Dyson Outsize+ must retain '+'");
  });

  // 2. S21_NOT_EQUAL_S21_PLUS
  await test('S21_NOT_EQUAL_S21_PLUS', () => {
    const keyS21 = buildProductIdentityKey('Samsung', 'Samsung Galaxy S21', 'smartphones');
    const keyS21Plus = buildProductIdentityKey('Samsung', 'Samsung Galaxy S21+', 'smartphones');
    assert.notEqual(keyS21, keyS21Plus, 'Samsung Galaxy S21 and S21+ must have distinct identity keys');
  });

  // 3. PRO_NOT_EQUAL_PRO_PLUS
  await test('PRO_NOT_EQUAL_PRO_PLUS', () => {
    const keyPro = buildProductIdentityKey('Realme', 'Realme 16 Pro', 'smartphones');
    const keyProPlus = buildProductIdentityKey('Realme', 'Realme 16 Pro+', 'smartphones');
    assert.notEqual(keyPro, keyProPlus, 'Realme 16 Pro and Pro+ must have distinct identity keys');
  });

  // 4. S9_NOT_EQUAL_S9_PLUS
  await test('S9_NOT_EQUAL_S9_PLUS', () => {
    const keyS9 = buildProductIdentityKey('Roborock', 'Roborock S9', 'appliances');
    const keyS9Plus = buildProductIdentityKey('Roborock', 'Roborock S9+', 'appliances');
    assert.notEqual(keyS9, keyS9Plus, 'Roborock S9 and S9+ must have distinct identity keys');
  });

  // 5. APPLE_17_PRO_256_5G_LOCK
  await test('APPLE_17_PRO_256_5G_LOCK', () => {
    const root = smartphones.find(p => p.id === 'apple-apple-iphone-17-pro-256-gb-1023349');
    assert.ok(root, 'apple-apple-iphone-17-pro-256-gb-1023349 must exist');
    assert.equal(root.specs?.connectivity?.has5G, true, 'iPhone 17 Pro 256GB has5G must be locked to true');
  });

  // 6. APPLE_17_PRO_512_5G_LOCK
  await test('APPLE_17_PRO_512_5G_LOCK', () => {
    const root = smartphones.find(p => p.id === 'apple-apple-iphone-17-pro-512-gb-1027082');
    assert.ok(root, 'apple-apple-iphone-17-pro-512-gb-1027082 must exist');
    assert.equal(root.specs?.connectivity?.has5G, true, 'iPhone 17 Pro 512GB has5G must be locked to true');
  });

  // 7. APPLE_17_PRO_1TB_5G_LOCK
  await test('APPLE_17_PRO_1TB_5G_LOCK', () => {
    const root = smartphones.find(p => p.id === 'apple-apple-iphone-17-pro-1-tb-1027083');
    assert.ok(root, 'apple-apple-iphone-17-pro-1-tb-1027083 must exist');
    assert.equal(root.specs?.connectivity?.has5G, true, 'iPhone 17 Pro 1TB has5G must be locked to true');
  });

  // 8. REDMI_NOTE_15_PRO_LTE_LOCK
  await test('REDMI_NOTE_15_PRO_LTE_LOCK', () => {
    const redmi256 = smartphones.find(p => p.id === 'xiaomi-redmi-note-15-pro-256gb-2026');
    const redmi512 = smartphones.find(p => p.id === 'xiaomi-redmi-note-15-pro-512gb-2026');
    assert.ok(redmi256, 'xiaomi-redmi-note-15-pro-256gb-2026 must exist');
    assert.ok(redmi512, 'xiaomi-redmi-note-15-pro-512gb-2026 must exist');
    assert.equal(redmi256.specs?.connectivity?.has5G, false, 'Redmi Note 15 Pro 256GB must remain 4G/LTE (has5G=false)');
    assert.equal(redmi512.specs?.connectivity?.has5G, false, 'Redmi Note 15 Pro 512GB must remain 4G/LTE (has5G=false)');
  });

  // 9. IPHONE_17E_SPEC_LOCK
  await test('IPHONE_17E_SPEC_LOCK', () => {
    const e256 = smartphones.find(p => p.id === 'apple-apple-iphone-17e-256-gb-1048093');
    const e512 = smartphones.find(p => p.id === 'apple-apple-iphone-17e-512-gb-1048094');
    assert.ok(e256, 'iPhone 17e 256GB root must exist');
    assert.ok(e512, 'iPhone 17e 512GB root must exist');
    assert.equal(e256.specs?.connectivity?.has5G, true, 'iPhone 17e 256GB must have has5G=true');
    assert.equal(e512.specs?.connectivity?.has5G, true, 'iPhone 17e 512GB must have has5G=true');
    assert.ok(e256.specs?.connectivity?.wifiStandard?.includes('Wi-Fi 6'), 'iPhone 17e must lock to Wi-Fi 6');
  });

  // 10. GOLDEN_REGRESSION (83/83 PASS)
  await test('GOLDEN_REGRESSION', () => {
    const GOLDEN_IDS = [
      'samsung-galaxy-s25', 'samsung-galaxy-s25-plus', 'samsung-galaxy-s25-ultra', 'samsung-galaxy-s26-plus',
      'samsung-galaxy-a57-5g', 'samsung-galaxy-a17-5g', 'samsung-galaxy-s26-ultra', 'samsung-samsung-galaxy-s24-93',
      'samsung-samsung-galaxy-s24-ultra-95', 'samsung-samsung-galaxy-a55-5g-103', 'samsung-samsung-galaxy-z-flip-6-97',
      'samsung-samsung-galaxy-z-fold-6-98', 'samsung-samsung-galaxy-s24-fe-96', 'samsung-samsung-galaxy-a54-5g-89',
      'samsung-samsung-galaxy-s22-ultra-68', 'samsung-samsung-galaxy-s21-51', 'samsung-samsung-galaxy-s21-50',
      'samsung-samsung-galaxy-s20-ultra-34', 'samsung-samsung-galaxy-z-fold-3-55', 'samsung-samsung-galaxy-note-20-ultra-37',
      'samsung-samsung-galaxy-a72-62',
      'apple-apple-iphone-16-pro-max-1-tb-960862', 'apple-apple-iphone-16-pro-max-512-gb-960861', 'apple-apple-iphone-16-pro-max-256-gb-952387',
      'apple-apple-iphone-16-pro-256-gb-960858', 'apple-apple-iphone-15-pro-max-1-tb-895854', 'apple-apple-iphone-15-pro-max-512-gb-895853',
      'apple-apple-iphone-16-pro-128-gb-952452', 'apple-apple-iphone-16-128-gb-959779', 'apple-apple-iphone-11-128-gb-335107',
      'apple-apple-iphone-16-pro-1-tb-960860',
      'apple-apple-iphone-16-plus-128-gb-959953', 'apple-apple-iphone-16-plus-256-gb-959954', 'apple-apple-iphone-16-plus-512-gb-959955',
      'apple-apple-iphone-16-256-gb-960853', 'apple-apple-iphone-16-512-gb-959781', 'apple-apple-iphone-16-pro-512-gb-960859',
      'apple-apple-iphone-15-128-gb-895865', 'apple-apple-iphone-15-256-gb-895866', 'apple-apple-iphone-15-512-gb-895867',
      'apple-apple-iphone-15-plus-128-gb-895859', 'apple-apple-iphone-15-plus-256-gb-895858', 'apple-apple-iphone-15-plus-512-gb-895862',
      'apple-apple-iphone-15-pro-128-gb-895855', 'apple-apple-iphone-15-pro-256-gb-895856', 'apple-apple-iphone-15-pro-512-gb-895860',
      'apple-apple-iphone-15-pro-1-tb-895857', 'apple-apple-iphone-15-pro-max-256-gb-895852', 'apple-apple-iphone-14-pro-max-128-gb-802361',
      'apple-apple-iphone-14-pro-256-gb-809144', 'apple-apple-iphone-14-pro-128-gb-802356', 'apple-apple-iphone-14-pro-512-gb-809145',
      'apple-apple-iphone-14-pro-1-tb-809146', 'apple-apple-iphone-13-128-gb-717135', 'apple-apple-iphone-13-pro-max-128-gb-716471',
      'apple-apple-iphone-13-pro-max-256-gb-717141',
      'apple-apple-iphone-13-pro-max-1-tb-717143', 'apple-apple-iphone-16e-512-gb-994887', 'apple-apple-iphone-13-pro-max-512-gb-717142',
      'apple-apple-iphone-16e-256-gb-994886', 'apple-apple-iphone-16e-128-gb-994885', 'apple-apple-iphone-13-pro-512-gb-717139',
      'apple-apple-iphone-11-64-gb-223976', 'apple-apple-iphone-se-2-2020-128-gb-548606', 'apple-apple-iphone-se-2-2020-548579',
      'apple-apple-iphone-xr-64-gb-127715', 'apple-apple-iphone-13-pro-1-tb-717140', 'apple-apple-iphone-11-pro-max-64-gb-224036',
      'apple-apple-iphone-11-pro-64-gb-224024', 'apple-apple-iphone-xs-max-512-gb-131639', 'apple-apple-iphone-xs-512-gb-131614',
      'apple-apple-iphone-xs-max-256-gb-131638', 'apple-apple-iphone-11-256-gb-335126', 'apple-apple-iphone-se-3-2022-256-gb-758822',
      'apple-apple-iphone-xs-256-gb-131610', 'apple-apple-iphone-se-3-2022-128-gb-758817', 'apple-apple-iphone-x-256-gb-92486',
      'apple-apple-iphone-xs-max-64-gb-127714', 'apple-apple-iphone-se-3-2022-758749', 'apple-apple-iphone-xs-64-gb-126668',
      'apple-apple-iphone-se-2-2020-256-gb-548607', 'apple-apple-iphone-xr-256-gb-138630', 'apple-apple-iphone-se-128-gb-76038'
    ];

    assert.equal(GOLDEN_IDS.length, 83, 'Golden dataset reference must contain 83 items');
    const canonicalMap = new Map(canonicalProducts.map(p => [p.id, p]));

    for (const gid of GOLDEN_IDS) {
      const prod = canonicalMap.get(gid);
      assert.ok(prod, `Golden product ${gid} must exist in canonical catalog`);
      assert.ok(prod.specs && Object.keys(prod.specs).length > 0, `Golden product ${gid} must have non-empty specs`);
    }
  });

  // 11. CANONICAL_COUNT_LOCK (5814)
  await test('CANONICAL_COUNT_LOCK', () => {
    assert.equal(allRawProducts.length, 5820, 'Raw source catalog must contain exactly 5,820 items');
    assert.equal(canonicalProducts.length, 5814, 'Canonical active catalog must remain exactly 5,814 items');
    assert.equal(KNOWN_EXCLUSIONS.size, 6, 'Quarantined exclusions must remain exactly 6');
  });

  // 12. PRICE_FIREWALL (0 price writes)
  await test('PRICE_FIREWALL', () => {
    // Check git diff on smartphonesData.json against origin/main to guarantee only has5G was changed
    const gitDiff = cp.execSync('git diff origin/main src/lib/smartphonesData.json', { cwd: ROOT, encoding: 'utf8' });
    const addedLines = gitDiff.split('\n').filter(l => l.startsWith('+') && !l.startsWith('+++'));
    const deletedLines = gitDiff.split('\n').filter(l => l.startsWith('-') && !l.startsWith('---'));

    assert.equal(addedLines.length, 3, 'Must have exactly 3 lines added to smartphonesData.json');
    assert.equal(deletedLines.length, 3, 'Must have exactly 3 lines deleted from smartphonesData.json');

    for (const line of addedLines) {
      assert.ok(line.includes('"has5G": true,'), `Added line must only be "has5G": true, got: ${line}`);
    }
    for (const line of deletedLines) {
      assert.ok(line.includes('"has5G": false,'), `Deleted line must only be "has5G": false, got: ${line}`);
    }

    // Verify 0 price mutations across entire catalog
    const fullDiff = cp.execSync('git diff origin/main src/lib/', { cwd: ROOT, encoding: 'utf8' });
    assert.ok(!fullDiff.includes('"price"'), 'Git diff in src/lib must not contain any price mutations');
    assert.ok(!fullDiff.includes('"basePrice"'), 'Git diff in src/lib must not contain any basePrice mutations');
  });

  console.log('======================================================================');
  console.log(`TOTAL DAY 2.2 TESTS: ${passed} / 12; ALL PASSED: ${passed}`);
  console.log('======================================================================');
}

main().catch((err) => {
  console.error('Test failure:', err);
  process.exit(1);
});
