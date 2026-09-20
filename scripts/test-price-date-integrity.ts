import assert from 'node:assert/strict';
import { parseDateToMs, parseOfferDateToMs, formatObservedDate } from '../src/lib/dateParsing';
import { getPriceFreshness, isValidDateString, isValidFreshOfferDate } from '../src/lib/priceFreshness';
import { evaluateProductPricing, getEligibleDirectOffers } from '../src/lib/pricing/unifiedPriceEvaluator';
import type { StoreOffer } from '../src/lib/types';

let passed = 0;
function check(label: string, assertion: () => void) { assertion(); passed++; console.log(`PASS: ${label}`); }
const now = Date.parse('2026-09-20T12:00:00.000Z');
const offer = (date: string): StoreOffer => ({ storeName: 'Fixture Store', price: 42000, url: 'https://example.com/product/a', inStock: true, lastCheckedAt: date });

for (const value of ['2026-02-30', '2026-02-29', '2026-04-31', '31.02.2026', '2026-13-01', '2026-00-01', '2026-09-00', '2026-09-19T25:00:00Z', '2026-09-19T12:60:00Z', '2026-09-19T12:00:00+15:00', '2026-09-19T12:00:00', '19 Eylül', 'Eylül', 'not-a-date', '']) {
  check(`Invalid or ambiguous date rejected: ${value || '(empty)'}`, () => {
    assert.equal(parseDateToMs(value), 0);
    assert.equal(isValidDateString(value), false);
    assert.equal(getPriceFreshness(value, now).status, 'unverified');
    assert.equal(evaluateProductPricing({ storeOffers: [offer(value)] }, now).currentPrice, null);
  });
}
for (const value of ['19.09.2026', '19/09/2026', '19 Eylül 2026', '19 EYLÜL 2026', '2026-09-19']) {
  check(`Complete date parsed consistently: ${value}`, () => {
    assert.equal(parseOfferDateToMs(value), Date.UTC(2026, 8, 19));
    assert.equal(formatObservedDate(value), '19.09.2026');
  });
}
check('Leap day is accepted only in a leap year', () => assert.equal(parseDateToMs('29.02.2024'), Date.UTC(2024, 1, 29)));
check('Monthly history remains available without becoming a verified offer', () => {
  assert.equal(parseDateToMs('Eylül 2026'), Date.UTC(2026, 8, 1));
  assert.equal(parseOfferDateToMs('Eylül 2026'), 0);
  assert.equal(getEligibleDirectOffers([offer('Eylül 2026')], now).staleDirectOffers.length, 0);
});
check('Timezone offset represents the same instant', () => {
  assert.equal(parseDateToMs('2026-09-19T21:00:00Z'), parseDateToMs('2026-09-20T00:00:00+03:00'));
});
check('UTC evening is shown as the correct Istanbul calendar day', () => {
  assert.equal(formatObservedDate('2026-09-17T21:24:03.157Z'), '18.09.2026');
  assert.equal(getPriceFreshness('2026-09-17T21:24:03.157Z', now).formattedDate, '18.09.2026');
  assert.equal(evaluateProductPricing({ storeOffers: [offer('2026-09-17T21:24:03.157Z')] }, now).statusLabel, 'Son görülen fiyat: 18.09.2026');
});
for (const [ageMs, status] of [[0, 'fresh'], [24 * 3600000, 'fresh'], [24 * 3600000 + 1, 'stale'], [30 * 86400000, 'stale'], [30 * 86400000 + 1, 'unverified'], [-1, 'unverified']] as const) {
  check(`Exact freshness boundary ${ageMs} ms: ${status}`, () => {
    const date = new Date(now - ageMs).toISOString();
    assert.equal(getPriceFreshness(date, now).status, status);
    assert.equal(isValidFreshOfferDate(date, 1, now), status === 'fresh');
    const pricing = evaluateProductPricing({ storeOffers: [offer(date)] }, now);
    assert.equal(pricing.currentPrice, status === 'fresh' ? 42000 : null);
    assert.equal(pricing.lastSeenPrice, status === 'stale' ? 42000 : null);
  });
}
check('Device/server timezone cannot change date labels', () => {
  const previous = process.env.TZ;
  try {
    for (const zone of ['UTC', 'America/Los_Angeles', 'Europe/Istanbul']) {
      process.env.TZ = zone;
      assert.equal(formatObservedDate('2026-09-17T21:24:03.157Z'), '18.09.2026');
    }
  } finally { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous; }
});
check('Non-finite catalog prices do not appear as numbers', () => {
  assert.equal(evaluateProductPricing({ basePrice: Infinity }).displayPrice, null);
  assert.equal(evaluateProductPricing({ basePrice: NaN }).displayPrice, null);
});
console.log(`Price/date integrity: ${passed} PASS, 0 FAIL`);
