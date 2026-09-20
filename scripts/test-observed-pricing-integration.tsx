import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { evaluateProductPricing } from '../src/lib/pricing/unifiedPriceEvaluator';
import { getObservedPriceHistory } from '../src/lib/pricing/priceHistoryEvidence';
import { ProductPriceSummary } from '../src/components/detail/ProductPriceSummary';
import { ProductJsonLd } from '../src/components/seo/ProductJsonLd';
import type { Product } from '../src/lib/types';
const { binding, source, original, html } = require('./test-observed-store-offers.cjs');
const { parseObservedOffer, mergeObservation } = require('./observedStoreOffer.cjs');

const now = Date.now();
const freshDate = new Date(now - 2 * 3600000).toISOString();
const staleDate = new Date(now - 48 * 3600000).toISOString();
function product(date: string, availability = 'InStock'): Product {
  const response = structuredClone(source);
  response.offers.availability = 'https://schema.org/' + availability;
  const observation = parseObservedOffer(html(response), binding, { checkedAt: date });
  return mergeObservation({ ...original, slug: original.id, image: '/images/product-unverified.svg', currency: 'TL', highlights: [] }, { status: 'observed', observation });
}
let passed = 0;
function check(name: string, run: () => void) { run(); passed++; console.log('PASS: ' + name); }
const fresh = product(freshDate), stale = product(staleDate);
check('real evaluator accepts a completed current observation', () => {
  const price = evaluateProductPricing(fresh, now);
  assert.equal(price.currentPrice, 42000.5); assert.equal(price.activeStoreCount, 1);
  assert.equal(price.lastCheckedAt, freshDate);
});
check('48-hour observation stays historical and outside current price', () => {
  const price = evaluateProductPricing(stale, now);
  assert.equal(price.currentPrice, null); assert.equal(price.lastSeenPrice, 42000.5); assert.equal(price.activeStoreCount, 0);
});
check('real detail and structured data consume the same observed price', () => {
  assert.match(renderToStaticMarkup(<ProductPriceSummary product={fresh} />), /Güncel Fiyat/);
  const schema = renderToStaticMarkup(<ProductJsonLd product={fresh} />);
  assert.match(schema, /42000.5/); assert.match(schema, /TRY/);
});
check('stock-out and preorder are excluded by real consumer', () => {
  for (const state of ['OutOfStock', 'PreOrder']) {
    const p = product(freshDate, state);
    assert.equal(evaluateProductPricing(p, now).currentPrice, null);
    assert.equal(getObservedPriceHistory(p.priceHistory, now).length, 0);
  }
});
check('observations retain real history provenance', () => {
  const history = getObservedPriceHistory(fresh.priceHistory, now);
  assert.equal(history.length, 1); assert.equal(history[0].sourceUrl, binding.url);
  assert.equal(history[0].observedAt, freshDate);
});
check('failed refresh keeps prior observation date and price intact', () => {
  const result = mergeObservation(stale, { status: 'unverified', reason: 'HTTP 403' });
  assert.strictEqual(result, stale);
  const price = evaluateProductPricing(result, now);
  assert.equal(price.currentPrice, null); assert.equal(price.lastCheckedAt, staleDate);
});
console.log(`Observed pricing integration: ${passed} PASS, 0 FAIL (function/SSR; no browser or external writes)`);
