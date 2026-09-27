import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { getProductById } from '../src/lib/data';
import { calculateOverallDuelWinner } from '../src/lib/compareMetrics';

console.log('Running Site Audit Fixes Regression Suite...\n');

let passed = 0;
const check = (name: string, fn: () => void) => {
  fn();
  passed++;
  console.log(`PASS: ${name}`);
};

// 1. Task A01 / D01: LG Monitor Reclassifications & Manufacturer Specs
check('A01/D01: LG 24MP450P-B, LG 27MP450P-B, LG 32UN550-W are classified as monitors with exact manufacturer specs', () => {
  const p24 = getProductById('lg-lg-24mp450p-b');
  assert.ok(p24, 'LG 24MP450P-B must exist in catalog');
  assert.equal(p24.category, 'monitors', 'Category must be monitors');
  assert.equal(p24.releaseYear, 2021, 'Release year must be 2021');
  const specs24 = p24.specs as any;
  assert.equal(specs24.screenSizeInches, 23.8, 'Screen size must be 23.8 inches');
  assert.equal(specs24.refreshRateHz, 75, 'Refresh rate must be 75 Hz (not 100 Hz)');
  assert.equal(specs24.panelType, 'IPS', 'Panel type must be IPS');
  assert.equal(specs24.displayPort, '1.2');

  const p27 = getProductById('lg-lg-27mp450p-b');
  assert.ok(p27, 'LG 27MP450P-B must exist in catalog');
  assert.equal(p27.category, 'monitors', 'Category must be monitors');
  assert.equal(p27.releaseYear, 2021, 'Release year must be 2021');
  const specs27 = p27.specs as any;
  assert.equal(specs27.refreshRateHz, 75, 'Refresh rate must be 75 Hz (not 100 Hz)');
  assert.equal(specs27.panelType, 'IPS', 'Panel type must be IPS');
  assert.equal(specs27.screenSizeInches, 27);
  assert.equal(specs27.displayPort, '1.2');

  const p32 = getProductById('lg-lg-32un550-w');
  assert.ok(p32, 'LG 32UN550-W must exist in catalog');
  assert.equal(p32.category, 'monitors', 'Category must be monitors');
  assert.equal(p32.releaseYear, 2020, 'Release year must be 2020');
  const specs32 = p32.specs as any;
  assert.equal(specs32.refreshRateHz, 60, 'Refresh rate must be 60 Hz (not 100 Hz)');
  assert.equal(specs32.panelType, 'VA', 'Panel type must be VA (not Fast IPS)');
  assert.equal(specs32.screenSizeInches, 31.5);
  assert.equal(specs32.resolution, '3840x2160 (4K UHD)');
});

// 2. Task A02: Deep Equality of Store Offers & Price History for all 3 LG Monitors
check('A02: LG 24MP450P-B, LG 27MP450P-B, LG 32UN550-W store offers and price history are preserved with exact deep equality against baseline', () => {
  const fixturePath = path.join(__dirname, '../tests/fixtures/lg-veri-koruma-baslangic.json');
  assert.ok(fs.existsSync(fixturePath), `Baseline fixture file must exist at ${fixturePath}`);
  const baselineList = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  assert.equal(baselineList.length, 3, 'Baseline fixture must contain exactly 3 LG records');

  const base24 = baselineList.find((b: any) => b.id === 'lg-lg-24mp450p-b');
  const base27 = baselineList.find((b: any) => b.id === 'lg-lg-27mp450p-b');
  const base32 = baselineList.find((b: any) => b.id === 'lg-lg-32un550-w');

  assert.ok(base24, 'Baseline for LG 24MP450P-B must exist');
  assert.ok(base27, 'Baseline for LG 27MP450P-B must exist');
  assert.ok(base32, 'Baseline for LG 32UN550-W must exist');

  const p24 = getProductById('lg-lg-24mp450p-b');
  assert.ok(p24, 'LG 24MP450P-B must exist in catalog');
  assert.equal(p24.basePrice, base24.basePrice, 'LG 24MP450P-B basePrice must match baseline exactly');
  assert.equal(p24.currency, base24.currency, 'LG 24MP450P-B currency must match baseline exactly');
  assert.deepEqual(p24.storeOffers, base24.storeOffers, 'LG 24MP450P-B storeOffers must match baseline exactly');
  assert.deepEqual(p24.priceHistory, base24.priceHistory, 'LG 24MP450P-B priceHistory must match baseline exactly');

  const p27 = getProductById('lg-lg-27mp450p-b');
  assert.ok(p27, 'LG 27MP450P-B must exist in catalog');
  assert.equal(p27.basePrice, base27.basePrice, 'LG 27MP450P-B basePrice must match baseline exactly');
  assert.equal(p27.currency, base27.currency, 'LG 27MP450P-B currency must match baseline exactly');
  assert.deepEqual(p27.storeOffers, base27.storeOffers, 'LG 27MP450P-B storeOffers must match baseline exactly');
  assert.deepEqual(p27.priceHistory, base27.priceHistory, 'LG 27MP450P-B priceHistory must match baseline exactly');

  const p32 = getProductById('lg-lg-32un550-w');
  assert.ok(p32, 'LG 32UN550-W must exist in catalog');
  assert.equal(p32.basePrice, base32.basePrice, 'LG 32UN550-W basePrice must match baseline exactly');
  assert.equal(p32.currency, base32.currency, 'LG 32UN550-W currency must match baseline exactly');
  assert.deepEqual(p32.storeOffers, base32.storeOffers, 'LG 32UN550-W storeOffers must match baseline exactly');
  assert.deepEqual(p32.priceHistory, base32.priceHistory, 'LG 32UN550-W priceHistory must match baseline exactly');
});

// 3. Task A03: Full Color Name Formatting in CompactProductCard
check('A03: CompactProductCard component displays full color name without split truncation', () => {
  const cardPath = path.join(__dirname, '../src/components/catalog/CompactProductCard.tsx');
  const cardSource = fs.readFileSync(cardPath, 'utf8');

  assert.ok(!cardSource.includes("activeColor.name.split(' ')[0]"), 'Truncation via split must be removed from CompactProductCard');
  assert.ok(cardSource.includes('{activeColor.name}'), 'CompactProductCard must render full activeColor.name');
});

// 4. Task A04: S24 Ultra Field Normalization
check('A04: Galaxy S24 Ultra screen.type is normalized to Dynamic AMOLED 2X', () => {
  const s24u = getProductById('samsung-samsung-galaxy-s24-ultra-95');
  assert.ok(s24u, 'S24 Ultra must exist in catalog');
  const specs = s24u.specs as any;
  assert.ok(specs, 'Specs must exist');
  assert.equal(specs.screen?.type, 'Dynamic AMOLED 2X', 'Panel type must be normalized Dynamic AMOLED 2X');
  assert.equal(specs.screen?.refreshRate, 120, 'Refresh rate must be 120 Hz');
  assert.equal(specs.screen?.brightnessNits, 2600, 'Brightness must be 2600 nits');
});

// 5. Task A05: Score Presentation & Transparency Warnings in DuelArena
check('A05: Missing lab score yields insufficient_data and DuelArena uses compact visual score weights', () => {
  const winner = calculateOverallDuelWinner(null, 90);
  assert.equal(winner, 'insufficient_data', 'Missing verified lab score must return insufficient_data');

  const arenaPath = path.join(__dirname, '../src/components/compare/DuelArena.tsx');
  const arenaSource = fs.readFileSync(arenaPath, 'utf8');

  assert.ok(!arenaSource.includes('text-5xl font-black'), 'Giant 5xl font-black score styling must be removed');
  assert.ok(arenaSource.includes('text-xs font-bold'), 'Compact text-xs font-bold pill score badge must be present');
  assert.ok(arenaSource.includes('Ölçüm yöntemi bağımsız testle doğrulanmadı'), 'Transparency notice for unverified catalog score must be present');
});

// 6. Task D03: Category Sort Options Wording
check('D03: Category clients use Katalog Puanına Göre for rating sort option', () => {
  const categoryFiles = [
    'src/app/tvs/TVsClient.tsx',
    'src/app/phones/PhonesClient.tsx',
    'src/app/monitors/MonitorsClient.tsx',
    'src/app/laptops/LaptopsClient.tsx',
    'src/app/tablets/TabletsClient.tsx',
    'src/app/smartwatches/SmartwatchesClient.tsx',
    'src/app/headphones/HeadphonesClient.tsx',
    'src/app/appliances/AppliancesClient.tsx',
    'src/app/consoles/ConsolesClient.tsx'
  ];

  categoryFiles.forEach(relPath => {
    const fullPath = path.join(__dirname, '..', relPath);
    const content = fs.readFileSync(fullPath, 'utf8');
    assert.ok(content.includes('Katalog Puanına Göre'), `${relPath} must contain Katalog Puanına Göre sort option`);
    assert.ok(!content.includes('>En Yüksek Puanlılar<'), `${relPath} must not contain legacy En Yüksek Puanlılar option`);
  });
});

// 7. Legacy LG URL Redirects Rule Validation
check('Legacy LG TV URLs have permanent redirect rules to /monitors/', () => {
  const redirectsPath = path.join(__dirname, '../data/redirects.json');
  const redirects = JSON.parse(fs.readFileSync(redirectsPath, 'utf8'));

  const lg24 = redirects.find((r: any) => r.source === '/tvs/lg-lg-24mp450p-b');
  assert.ok(lg24, 'Legacy /tvs/lg-lg-24mp450p-b redirect rule must exist');
  assert.equal(lg24.destination, '/monitors/lg-lg-24mp450p-b');
  assert.equal(lg24.permanent, true);

  const lg27 = redirects.find((r: any) => r.source === '/tvs/lg-lg-27mp450p-b');
  assert.ok(lg27, 'Legacy /tvs/lg-lg-27mp450p-b redirect rule must exist');
  assert.equal(lg27.destination, '/monitors/lg-lg-27mp450p-b');
  assert.equal(lg27.permanent, true);

  const lg32 = redirects.find((r: any) => r.source === '/tvs/lg-lg-32un550-w');
  assert.ok(lg32, 'Legacy /tvs/lg-lg-32un550-w redirect rule must exist');
  assert.equal(lg32.destination, '/monitors/lg-lg-32un550-w');
  assert.equal(lg32.permanent, true);
});

console.log(`\nSite Audit Fixes Regression Suite: ${passed} PASS, 0 FAIL.`);
