import assert from 'node:assert/strict';
import { evaluateOfferScope, CatalogProductRaw } from '../src/lib/pricing/offerScopeEvaluator';
import { getEligibleDirectOffers } from '../src/lib/pricing/unifiedPriceEvaluator';
import { isSearchUrl, isBrokenUrl } from '../src/lib/priceFreshness';

console.log('Running D02 Offer Scope Fixture Tests...\n');

let passed = 0;
const check = (name: string, fn: () => void) => {
  fn();
  passed++;
  console.log(`PASS: ${name}`);
};

// 1. Missing Stock Fixture
check('D02 Fixture: offer with missing inStock field is counted in inStockUnknownCount', () => {
  const products: CatalogProductRaw[] = [
    {
      id: 'prod-missing-stock',
      name: 'Missing Stock Product',
      storeOffers: [
        { storeName: 'Store A', price: 1000, url: 'https://www.store.com/prod1' } // inStock undefined!
      ]
    }
  ];
  const res = evaluateOfferScope(products);
  assert.equal(res.stockStatus.inStockUnknownCount, 1, 'Missing inStock must be counted in inStockUnknownCount');
  assert.equal(res.stockStatus.inStockTrueCount, 0);
  assert.equal(res.stockStatus.inStockFalseCount, 0);
});

// 2. Broken URL Fixture
check('D02 Fixture: offer with broken URL ("#", empty) is counted in invalidUrlCount', () => {
  const products: CatalogProductRaw[] = [
    {
      id: 'prod-broken-url',
      name: 'Broken URL Product',
      storeOffers: [
        { storeName: 'Store A', price: 1000, url: '#', inStock: true },
        { storeName: 'Store B', price: 1200, url: '', inStock: true }
      ]
    }
  ];
  const res = evaluateOfferScope(products);
  assert.equal(res.urlClassification.invalidUrlCount, 2, 'Broken URLs must be counted in invalidUrlCount');
  assert.equal(res.urlClassification.directProductUrlCandidates, 0);
  assert.equal(res.urlClassification.searchUrlOffersCount, 0);
});

// 3. Search URL Fixture
check('D02 Fixture: offer with search URL is counted in searchUrlOffersCount', () => {
  const products: CatalogProductRaw[] = [
    {
      id: 'prod-search-url',
      name: 'Search URL Product',
      storeOffers: [
        { storeName: 'Amazon', price: 1000, url: 'https://www.amazon.com.tr/s?k=test', inStock: true }
      ]
    }
  ];
  const res = evaluateOfferScope(products);
  assert.equal(res.urlClassification.searchUrlOffersCount, 1, 'Search URLs must be counted in searchUrlOffersCount');
  assert.equal(res.urlClassification.directProductUrlCandidates, 0);
  assert.equal(res.urlClassification.invalidUrlCount, 0);
});

// 4. Unverified Date Fixture
check('D02 Fixture: offer with missing or invalid date is counted in unverifiedDateOffersCount', () => {
  const products: CatalogProductRaw[] = [
    {
      id: 'prod-invalid-date',
      name: 'Invalid Date Product',
      storeOffers: [
        { storeName: 'Store A', price: 1000, url: 'https://www.store.com/prod1', inStock: true, lastCheckedAt: 'invalid-date' },
        { storeName: 'Store B', price: 1200, url: 'https://www.store.com/prod2', inStock: true } // missing lastCheckedAt
      ]
    }
  ];
  const res = evaluateOfferScope(products);
  assert.equal(res.freshnessStatus.unverifiedDateOffersCount, 2, 'Invalid/missing dates must be counted in unverifiedDateOffersCount');
  assert.equal(res.freshnessStatus.freshOffersCount, 0);
  assert.equal(res.freshnessStatus.staleOffersCount, 0);
});

// 5. Variant & ColorOptions Containers and Nested Offers Fixture
check('D02 Fixture: nested storeOffers in colorOptions/variants are excluded from totalStoreOfferElements with explicit paths', () => {
  const products: CatalogProductRaw[] = [
    {
      id: 'prod-nested',
      name: 'Nested Offers Product',
      storeOffers: [
        { storeName: 'Root Store', price: 1000, url: 'https://www.store.com/root', inStock: true }
      ],
      colorOptions: [
        {
          name: 'Siyah',
          hex: '#000',
          storeOffers: [{ storeName: 'Color Store', price: 1050, url: 'https://www.store.com/color', inStock: true }]
        }
      ],
      variants: [
        {
          name: '256 GB',
          price: 1200,
          storeOffers: [{ storeName: 'Variant Store', price: 1250, url: 'https://www.store.com/variant', inStock: true }]
        }
      ]
    }
  ];
  const res = evaluateOfferScope(products);
  assert.equal(res.catalogMetrics.totalStoreOfferElements, 1, 'Only root product.storeOffers must be included');
  assert.equal(res.catalogMetrics.totalColorOptionsContainers, 1);
  assert.equal(res.catalogMetrics.totalVariantsContainers, 1);
  assert.deepEqual(res.catalogMetrics.includedOfferPaths, ['product.storeOffers']);
  assert.deepEqual(res.catalogMetrics.excludedOfferPaths, ['product.colorOptions[].storeOffers', 'product.variants[].storeOffers']);
});

// 6. Parser Error Throwing Fixture
check('D02 Fixture: evaluateOfferScope throws explicit Error on invalid schema', () => {
  assert.throws(
    () => evaluateOfferScope('not-an-array' as any),
    /Input products must be an array/
  );
  assert.throws(
    () => evaluateOfferScope([{ invalidProduct: true } as any]),
    /Invalid product schema/
  );
});

// 7. P1 Production Function Test: Comprehensive negative URL rejection across fresh and stale dates
check('P1 Production Function Test: getEligibleDirectOffers rejects missing, empty, broken (#), whitespace, and credentials URLs across fresh and stale dates', () => {
  const nowMs = Date.now();
  const freshDateIso = new Date(nowMs - 3600 * 1000).toISOString(); // 1 hour ago
  const staleDateIso = new Date(nowMs - 5 * 86400 * 1000).toISOString(); // 5 days ago

  const negativeUrlCandidates = [
    undefined,
    '',
    '   ',
    '#',
    'http://user:pass@malicious.com/item'
  ];

  const rawOffers: any[] = [];

  // Add negative fresh offers
  negativeUrlCandidates.forEach((url, i) => {
    rawOffers.push({
      storeName: `Negative Fresh ${i}`,
      price: 1000 + i * 100,
      inStock: true,
      url,
      lastCheckedAt: freshDateIso
    });
  });

  // Add negative stale offers
  negativeUrlCandidates.forEach((url, i) => {
    rawOffers.push({
      storeName: `Negative Stale ${i}`,
      price: 2000 + i * 100,
      inStock: true,
      url,
      lastCheckedAt: staleDateIso
    });
  });

  // Add Positive Controls
  rawOffers.push({
    storeName: 'Valid Fresh Direct Store',
    price: 15000,
    inStock: true,
    url: 'https://www.vatanbilgisayar.com/msi-claw-a1m.html',
    lastCheckedAt: freshDateIso
  });

  rawOffers.push({
    storeName: 'Valid Stale Direct Store',
    price: 16000,
    inStock: true,
    url: 'https://www.teknosa.com/msi-claw-a1m-p-785374399',
    lastCheckedAt: staleDateIso
  });

  const { freshDirectOffers, staleDirectOffers } = getEligibleDirectOffers(rawOffers, nowMs);

  assert.equal(freshDirectOffers.length, 1, 'Only Valid Fresh Direct Store must be in freshDirectOffers');
  assert.equal(freshDirectOffers[0].storeName, 'Valid Fresh Direct Store');

  assert.equal(staleDirectOffers.length, 1, 'Only Valid Stale Direct Store must be in staleDirectOffers');
  assert.equal(staleDirectOffers[0].storeName, 'Valid Stale Direct Store');
});

console.log(`\nD02 Offer Scope Fixture Tests: ${passed} PASS, 0 FAIL.`);
