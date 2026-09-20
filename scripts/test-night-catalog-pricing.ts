import assert from 'node:assert/strict';
import { toCatalogProduct } from '../src/lib/data';
import { getDynamicHeroSlides } from '../src/lib/heroSlides';
import { calculatePriceSignal } from '../src/lib/priceSignal';
import { getConsoleSpecSummary } from '../src/lib/productPresentation';
import { evaluateProductPricing, getPriceHeading } from '../src/lib/pricing/unifiedPriceEvaluator';
import type { Product, StoreOffer } from '../src/lib/types';

const now = Date.now();
const hoursAgo = (hours: number) => new Date(now - hours * 3600000).toISOString();
const observed = (date: string, price: number) => ({ date, price, observedAt: date, currency: 'TRY', sourceType: 'observed' as const, store: 'Fixture Store', sourceUrl: 'https://example.com/products/a' });
const offer: StoreOffer = {
  storeName: 'Example Store', price: 42000,
  url: 'https://example.com/products/a', inStock: true, lastCheckedAt: hoursAgo(2),
};
const product = {
  id: 'night-fixture-a', slug: 'night-fixture-a', name: 'Fixture A (512 GB)',
  brand: 'Fixture', category: 'smartphones', basePrice: 50000,
  image: '/images/fixture-a.png', sourceType: 'unverified',
  specs: { memory: { storageGb: 512 } },
  highlights: ['512 GB depolama'],
  storeOffers: [offer],
  priceHistory: [observed(hoursAgo(480), 48000), observed(hoursAgo(24), 46000)],
} as unknown as Product;

let passed = 0;
function check(name: string, verify: () => void) {
  verify();
  passed++;
  console.log(`PASS: ${name}`);
}

check('Projection preserves observed history and does not mutate the source', () => {
  const before = JSON.stringify(product);
  assert.deepEqual(toCatalogProduct(product).priceHistory, product.priceHistory);
  assert.equal(JSON.stringify(product), before);
});
check('Missing history stays empty', () => {
  assert.deepEqual(toCatalogProduct({ ...product, priceHistory: undefined } as unknown as Product).priceHistory, []);
});
check('Missing rating remains missing', () => assert.equal(toCatalogProduct(product).rating, undefined));
check('Unknown stock remains unknown and cannot become a current offer', () => {
  const projected = toCatalogProduct({ ...product, storeOffers: [{ ...offer, inStock: undefined }] });
  assert.equal(projected.storeOffers[0].inStock, undefined);
  assert.equal(evaluateProductPricing(projected).currentPrice, null);
});
check('A general update timestamp is not price verification', () => {
  const projected = toCatalogProduct({ ...product, storeOffers: [{ ...offer, lastCheckedAt: undefined, lastUpdated: hoursAgo(2) } as StoreOffer] });
  assert.equal(evaluateProductPricing(projected).currentPrice, null);
});
check('Projection preserves search-link classification', () => {
  const projected = toCatalogProduct({ ...product, storeOffers: [{ ...offer, isSearchLink: true }] });
  assert.equal(projected.storeOffers[0].isSearchLink, true);
  assert.equal(evaluateProductPricing(projected).currentPrice, null);
});
check('A cheapest offer after the fourth store is not lost', () => {
  const offers = Array.from({ length: 6 }, (_, i) => ({ ...offer, storeName: `Store ${i}`, price: 48000 - i * 1000 }));
  const projected = toCatalogProduct({ ...product, storeOffers: offers });
  assert.equal(projected.storeOffers.length, 6);
  assert.equal(evaluateProductPricing(projected).currentPrice, 43000);
});
check('Raw and projected fresh pricing agree', () => assert.deepEqual(evaluateProductPricing(toCatalogProduct(product)), evaluateProductPricing(product)));
check('A 48-hour-old offer stays historical through projection', () => {
  const projected = toCatalogProduct({ ...product, storeOffers: [{ ...offer, lastCheckedAt: hoursAgo(48) }] });
  const price = evaluateProductPricing(projected);
  assert.equal(price.currentPrice, null);
  assert.equal(price.lastSeenPrice, 42000);
  assert.equal(getPriceHeading(price), 'Son Görülen Fiyat');
});
check('Catalog prices are labelled as reference prices', () => {
  assert.equal(getPriceHeading(evaluateProductPricing({ ...product, storeOffers: [] })), 'Katalog Referans Fiyatı');
});
check('No number is shown when both price sources are absent', () => {
  assert.equal(getPriceHeading(evaluateProductPricing({ storeOffers: [] })), 'Fiyat Bilgisi Yok');
});

for (const [label, invalidOffer] of [
  ['stale', { ...offer, lastCheckedAt: hoursAgo(48) }],
  ['unknown stock', { ...offer, inStock: undefined }],
  ['search link', { ...offer, url: 'https://www.amazon.com.tr/s?k=fixture' }],
  ['future date', { ...offer, lastCheckedAt: hoursAgo(-24) }],
] as const) {
  check(`Price signal refuses ${label} offers`, () => {
    const signal = calculatePriceSignal({ ...product, storeOffers: [invalidOffer] });
    assert.equal(signal.status, 'insufficient_data');
    assert.equal(signal.currentPrice, 0);
  });
}
check('Catalog-only pricing cannot generate an opportunity score', () => {
  assert.equal(calculatePriceSignal({ ...product, storeOffers: [] }).status, 'insufficient_data');
});
check('Invalid/future history cannot create the minimum observation span', () => {
  const signal = calculatePriceSignal({ ...product, priceHistory: [
    observed('not-a-date', 60000), observed(hoursAgo(-480), 60000), observed(hoursAgo(2), 42000),
  ] });
  assert.equal(signal.status, 'insufficient_data');
  assert.equal(signal.dataPointsCount, 1);
  assert.equal(signal.daysTracked, 0);
});
check('Real fresh pricing and a sufficient observation span still work', () => {
  const signal = calculatePriceSignal(product);
  assert.equal(signal.currentPrice, 42000);
  assert.equal(signal.daysTracked, 19);
  assert.equal(signal.status, 'buy_now');
});
check('An empty catalog cannot invent hero products', () => assert.deepEqual(getDynamicHeroSlides([]), []));
check('Hero preserves actual identity, highlights and fresh-price status', () => {
  const [slide] = getDynamicHeroSlides([product]);
  assert.equal(slide.mainHeadline, product.name);
  assert.deepEqual(slide.specPills, product.highlights);
  assert.equal(slide.priceLabel, 'Güncel Fiyat');
  assert.equal(slide.price, '42.000 ₺');
  assert.equal(slide.score, undefined);
});
check('Hero reference price cannot claim a fresh offer', () => {
  const [slide] = getDynamicHeroSlides([{ ...product, storeOffers: [] }]);
  assert.equal(slide.price, '50.000 ₺');
  assert.equal(slide.priceLabel, 'Katalog Referans Fiyatı');
  assert.equal(slide.statusLabel, 'Fiyat doğrulanmadı');
});
check('Console summaries preserve 512 GB instead of defaulting to 1 TB', () => {
  const summary = getConsoleSpecSummary({ ...product, category: 'consoles', specs: { storageGb: 512, resolution: '1080p' } } as Product);
  assert.equal(summary, '512 GB • 1080p');
});
check('A Pro model name cannot invent 4K, 120 FPS or storage', () => {
  assert.equal(getConsoleSpecSummary({ ...product, name: 'Fixture Pro', category: 'consoles', specs: {}, highlights: [] } as Product), '');
});
console.log(`\nNight catalog/pricing regressions: ${passed} PASS, 0 FAIL`);
