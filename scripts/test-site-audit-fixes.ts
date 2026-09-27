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

// 1. Task A01: LG 24MP450P-B Classification & 75Hz Monitor Specs
check('A01: LG 24MP450P-B is classified as monitor with 75 Hz refresh rate', () => {
  const p = getProductById('lg-lg-24mp450p-b');
  assert.ok(p, 'LG 24MP450P-B must exist in catalog');
  assert.equal(p.category, 'monitors', 'Category must be monitors');
  const specs = p.specs as any;
  assert.ok(specs, 'Specs must exist');
  assert.equal(specs.refreshRateHz, 75, 'Refresh rate must be 75 Hz (not 100 Hz)');
  assert.equal(specs.panelType, 'IPS', 'Panel type must be IPS');
  assert.equal(specs.screenSizeInches, 23.8, 'Screen size must be 23.8 inches');
  assert.equal(specs.displayPort, '1.2', 'DisplayPort must be 1.2');
  assert.equal(p.releaseYear, 2021, 'Release year must be 2021');
});

// 2. Task A02: Deep Equality of Store Offers & Price History for LG 24MP450P-B
check('A02: LG 24MP450P-B store offers and price history are preserved with exact deep equality (6 offers, 6 history items)', () => {
  const p = getProductById('lg-lg-24mp450p-b');
  assert.ok(p, 'LG 24MP450P-B must exist');
  assert.equal(p.basePrice, 14919, 'Base price must be 14919 TL');
  assert.equal(p.currency, 'TL');

  const expectedStoreOffers = [
    {
      storeName: 'Hepsiburada',
      storeLogo: '/images/stores/hepsiburada.png',
      price: 14999,
      shippingFee: 0,
      inStock: true,
      url: 'https://www.hepsiburada.com/ara?q=LG%2024MP450P-B',
      rating: 4.8
    },
    {
      storeName: 'Trendyol',
      storeLogo: '/images/stores/trendyol.png',
      price: 15179,
      shippingFee: 0,
      inStock: true,
      url: 'https://www.trendyol.com/sr?q=LG%2024MP450P-B',
      rating: 4.8
    },
    {
      storeName: 'MediaMarkt',
      storeLogo: '/images/stores/mediamarkt.png',
      price: 15369,
      shippingFee: 0,
      inStock: true,
      url: 'https://www.mediamarkt.com.tr/tr/search.html?query=LG%2024MP450P-B',
      rating: 4.8
    },
    {
      storeName: 'Vatan Bilgisayar',
      storeLogo: '/images/stores/vatan.png',
      price: 15519,
      shippingFee: 0,
      inStock: true,
      url: 'https://www.vatanbilgisayar.com/arama/LG%2024MP450P-B',
      rating: 4.8
    },
    {
      storeName: 'Amazon Türkiye',
      storeLogo: '/images/stores/amazon.png',
      price: 14919,
      shippingFee: 0,
      inStock: true,
      url: 'https://www.amazon.com.tr/s?k=LG%2024MP450P-B',
      rating: 4.8
    },
    {
      storeName: 'Teknosa',
      storeLogo: '/images/stores/teknosa.png',
      price: 15419,
      shippingFee: 0,
      inStock: true,
      url: 'https://www.teknosa.com/arama?s=LG%2024MP450P-B',
      rating: 4.8
    }
  ];

  const expectedPriceHistory = [
    { date: 'Ekim 2025', price: 17100 },
    { date: 'Kasım 2025', price: 16650 },
    { date: 'Aralık 2025', price: 16200 },
    { date: 'Ocak 2026', price: 15750 },
    { date: 'Şubat 2026', price: 15300 },
    { date: 'Ağustos 2026', price: 15000 }
  ];

  assert.deepEqual(p.storeOffers, expectedStoreOffers, 'storeOffers array must match canonical baseline exactly');
  assert.deepEqual(p.priceHistory, expectedPriceHistory, 'priceHistory array must match canonical 6-entry baseline exactly');
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

console.log(`\nSite Audit Fixes Regression Suite: ${passed} PASS, 0 FAIL.`);
