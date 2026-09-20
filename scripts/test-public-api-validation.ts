import assert from 'node:assert/strict';
import fs from 'node:fs';
import { NextRequest } from 'next/server';
import { POST as feedback } from '../src/app/api/ai/feedback/route';
import { POST as outbound } from '../src/app/api/verify-outbound/route';
import { readLimitedJson } from '../src/lib/security/requestBody';
import { PriceVerificationEngine } from '../src/lib/security/priceVerification';
import { getProductById } from '../src/lib/data';
import { StoreOffer } from '../src/lib/types';

async function main() {
  let passed = 0;
  const files = ['data/robopengu_anomalies.json', 'data/robopengu_learning_patterns.json'];
  const before = files.map((path) => fs.existsSync(path) ? fs.readFileSync(path) : null);
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('External network is forbidden'); };
  let counter = 0;
  const request = (body: unknown, headers: Record<string, string> = {}) => new NextRequest('http://localhost/api/test', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': `test-only-${++counter}`, ...headers }, body: JSON.stringify(body),
  });
  try {
    for (const body of [null, [], {}, { userPrompt: 123 }, { userPrompt: '  ' },
      { userPrompt: 'telefon', userComment: 'x'.repeat(2001) }, { userPrompt: 'telefon', rating: 'approve' },
      { userPrompt: 'telefon', reasonCategory: 'system' }, { userPrompt: 'telefon', assistantResponse: {} },
      { userPrompt: 'telefon', unused: 'x'.repeat(33000) }]) {
      assert.equal((await feedback(request(body))).status, 400); passed++;
    }
    assert.equal((await feedback(request({ userPrompt: 'telefon' }, { origin: 'https://unrelated.example' }))).status, 403); passed++;
    assert.equal((await feedback(request({ userPrompt: 'telefon' }, { 'content-type': 'text/plain' }))).status, 400); passed++;
    const fixedHeaders = { 'x-forwarded-for': 'test-only-positive-rate-limit' };
    for (let i = 0; i < 10; i++) assert.equal((await feedback(request({ userPrompt: 'telefon', rating: 'positive' }, fixedHeaders))).status, 200);
    const limited = await feedback(request({ userPrompt: 'telefon', rating: 'positive' }, fixedHeaders));
    assert.equal(limited.status, 429); assert.ok(Number(limited.headers.get('retry-after')) > 0); passed++;
    await assert.rejects(() => readLimitedJson(request({ unicode: '🐧'.repeat(10) }), 20)); passed++;
    assert.deepEqual(await readLimitedJson(request({ unicode: '🐧' }), 30), { unicode: '🐧' }); passed++;
    await assert.rejects(() => readLimitedJson(new Request('http://localhost', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: '{malformed',
    }))); passed++;

    const now = Date.parse('2026-09-20T00:00:00Z');
    const offer: StoreOffer = { storeName: 'Test Store', price: 42000, inStock: true,
      url: 'https://merchant.example/product/test', lastCheckedAt: '2026-09-19T22:00:00Z' };
    const result = PriceVerificationEngine.verifyOffer(offer, now);
    assert.equal(result.verified, true); assert.equal(result.currentPrice, 42000); passed++;
    for (const change of [
      { lastCheckedAt: undefined }, { lastCheckedAt: '2099-01-01' }, { lastCheckedAt: '2026-02-31' },
      { inStock: undefined }, { inStock: false }, { price: NaN }, { price: Infinity }, { price: 0 },
      { url: 'javascript:alert(1)' }, { url: 'https://merchant.example/?s=test' },
      { url: 'https://user:password@merchant.example/product/test' },
    ]) {
      const checked = PriceVerificationEngine.verifyOffer({ ...offer, ...change }, now);
      assert.equal(checked.verified, false); assert.equal(checked.currentPrice, null); passed++;
    }
    assert.equal(PriceVerificationEngine.verifyOffer({ ...offer, inStock: undefined }, now).stockStatus, 'UNKNOWN'); passed++;
    const stale = PriceVerificationEngine.verifyOffer({ ...offer, lastCheckedAt: '2026-09-18T00:00:00Z' }, now);
    assert.equal(stale.verified, false); assert.equal(stale.lastSeenPrice, 42000); passed++;
    // The same offer is re-evaluated at the boundary; a cache cannot retain stale verification.
    assert.equal(PriceVerificationEngine.verifyOffer(offer, now + 23 * 3600000).verified, false); passed++;
    for (const body of [null, [], {}, { productId: 'id', storeName: {} }, { productId: 'id', storeName: 'store', targetUrl: {} }]) {
      assert.equal((await outbound(request(body))).status, 400); passed++;
    }
    assert.equal((await outbound(request({ productId: 'test-nonexistent-product', storeName: 'test' }))).status, 404); passed++;
    const product = getProductById('samsung-galaxy-s24');
    assert.ok(product?.storeOffers?.length);
    const savedOffer = product.storeOffers[0];
    assert.equal((await outbound(request({ productId: product.id, storeName: savedOffer.storeName, targetUrl: 'https://attacker.example/fake' }))).status, 404); passed++;
    const real = await outbound(request({ productId: product.id, storeName: savedOffer.storeName, targetUrl: savedOffer.url,
      price: 1, stockStatus: 'IN_STOCK', checkedAt: new Date().toISOString() }));
    assert.equal(real.status, 200);
    const actual = (await real.json()).verification;
    assert.notEqual(actual.currentPrice, 1);
    assert.equal(actual.redirectUrl, new URL(savedOffer.url!).href);
    assert.equal('verificationToken' in actual, false); passed++;
    for (let i = 0; i < files.length; i++) {
      assert.deepEqual(fs.existsSync(files[i]) ? fs.readFileSync(files[i]) : null, before[i]); passed++;
    }
    console.log(`Public API validation: ${passed} PASS, 0 FAIL; no negative feedback, data writes or external messages`);
  } finally { globalThis.fetch = originalFetch; }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
