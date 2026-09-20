const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { parseObservedOffer, collectOffer, validateBinding, validPage, mergeObservation, MAX_HTML_BYTES } = require('./observedStoreOffer.cjs');
const { parseArgs, readCatalogs, writeCatalogChanges } = require('./observeStoreOffers.cjs');

// Synthetic fixtures exist only in this process and an isolated temporary directory.
const checkedAt = new Date(Date.now() - 2000).toISOString();
const binding = {
  productId: 'test-offer-s24', category: 'smartphones', catalogName: 'Test S24 512 GB', brand: 'Test',
  storeId: 'vatan', url: 'https://www.vatanbilgisayar.com/test-s24-512-gb.html',
  expectedTitle: 'Test S24 512 GB', expectedSku: '12345', expectedMpn: 'S24-512',
  reviewedAt: '2026-01-01', scopeNote: 'Test fixture, never a production source.',
};
const source = {
  '@type': 'Product', name: binding.expectedTitle, brand: { name: 'Test' }, sku: '12345', mpn: 'S24-512',
  offers: { '@type': 'Offer', price: '42000.50', priceCurrency: 'TRY', availability: 'https://schema.org/InStock', itemCondition: 'https://schema.org/NewCondition', seller: { name: 'Test Store' }, url: binding.url },
};
const html = value => `<link rel="canonical" href="${binding.url}"><script type="application/ld+json">${JSON.stringify(value)}</script>`;
const original = { id: binding.productId, name: binding.catalogName, category: binding.category, brand: binding.brand, basePrice: 50000, specs: { storageGb: 512 }, storeOffers: [{ storeName: 'Other Store', url: 'https://store.example/search?q=test', price: 30000, lastCheckedAt: '2020-01-01' }], priceHistory: [] };
const parse = value => parseObservedOffer(html(value), binding, { checkedAt });
let passed = 0;
async function check(name, run) { await run(); passed++; console.log('PASS: ' + name); }
async function main() {
  await check('one exact Product yields a canonical in-stock TRY offer without invented shipping', () => {
    const observation = parse(source);
    assert.equal(observation.offer.price, 42000.5);
    assert.equal(observation.offer.inStock, true);
    assert.equal(observation.offer.lastCheckedAt, checkedAt);
    assert.equal(observation.offer.shippingFee, undefined);
    assert.equal(observation.offer.rating, undefined);
    assert.equal(observation.bodySha256.length, 64);
  });
  await check('@graph and JSON-LD arrays are supported', () => {
    assert.equal(parse({ '@graph': [source] }).sourceSku, '12345');
    assert.equal(parse([source]).sourceSku, '12345');
  });
  for (const [name, change] of [
    ['S24/S24 Ultra boundary', p => { p.name = 'Test S24 Ultra 512 GB'; }],
    ['S2/S20 boundary', p => { p.name = 'Test S20 512 GB'; }],
    ['missing capacity', p => { p.name = 'Test S24'; }],
    ['different capacity', p => { p.name = 'Test S24 256 GB'; }],
    ['wrong merchant SKU', p => { p.sku = '123456'; }],
    ['missing manufacturer part number', p => { delete p.mpn; }],
    ['different brand', p => { p.brand.name = 'Other'; }],
    ['missing offers', p => { delete p.offers; }],
    ['aggregate offer', p => { p.offers['@type'] = 'AggregateOffer'; }],
    ['multiple seller offers', p => { p.offers = [p.offers, { ...p.offers }]; }],
    ['missing currency', p => { delete p.offers.priceCurrency; }],
    ['foreign currency', p => { p.offers.priceCurrency = 'USD'; }],
    ['missing stock evidence', p => { delete p.offers.availability; }],
    ['unknown stock evidence', p => { p.offers.availability = 'unknown'; }],
    ['missing condition', p => { delete p.offers.itemCondition; }],
    ['used/refurbished condition', p => { p.offers.itemCondition = 'https://schema.org/UsedCondition'; }],
    ['conflicting product condition', p => { p.itemCondition = 'https://schema.org/UsedCondition'; }],
    ['missing seller', p => { delete p.offers.seller; }],
    ['different offer URL', p => { p.offers.url = binding.url.replace('512', '256'); }],
    ['different Product URL', p => { p.url = binding.url.replace('512', '256'); }],
    ['expired price', p => { p.offers.priceValidUntil = '2020-01-01'; }],
    ['impossible validity date', p => { p.offers.priceValidUntil = '2099-02-31'; }],
  ]) await check('rejects ' + name, () => { const changed = structuredClone(source); change(changed); assert.throws(() => parse(changed)); });
  for (const price of ['42.000,50', '42000 TL', '', '-1', 0, null, 'Infinity', '42000.501', '42e3']) {
    await check('rejects malformed price ' + JSON.stringify(price), () => {
      const changed = structuredClone(source); changed.offers.price = price; assert.throws(() => parse(changed));
    });
  }
  await check('ignores upsell/related-product prices and arbitrary visible amounts', () => {
    const related = { '@type': 'WebPage', mainEntity: { ...source } };
    assert.throws(() => parse(related));
    assert.throws(() => parseObservedOffer('<h1>Test S24 512 GB</h1><p>42.000,50 TL</p>', binding, { checkedAt }));
  });
  await check('rejects duplicate Product nodes and changed canonical', () => {
    assert.throws(() => parse([source, source]));
    assert.throws(() => parseObservedOffer(html(source).replace('rel="canonical" href="' + binding.url, 'rel="canonical" href="https://www.vatanbilgisayar.com/other.html'), binding, { checkedAt }));
  });
  await check('rejects missing/future/invalid observation dates', () => {
    for (const date of [undefined, 'not-a-date', '2099-01-01T00:00:00.000Z', '2026-02-31T00:00:00.000Z']) assert.throws(() => parseObservedOffer(html(source), binding, { checkedAt: date }));
  });
  await check('price expiry uses the merchant day in Istanbul, including the UTC midnight boundary', () => {
    const response = structuredClone(source);
    response.offers.priceValidUntil = '2026-01-01';
    assert.throws(() => parseObservedOffer(html(response), binding, { checkedAt: '2026-01-01T22:00:00.000Z' }));
    response.offers.priceValidUntil = '2026-01-02';
    assert.equal(parseObservedOffer(html(response), binding, { checkedAt: '2026-01-01T22:00:00.000Z' }).offer.price, 42000.5);
  });
  await check('binding requires exact catalog identity and reviewed source', () => {
    validateBinding(binding, original);
    for (const product of [{ ...original, id: 'another-id' }, { ...original, name: 'Test S24 Ultra 512 GB' }, { ...original, brand: 'Other' }]) assert.throws(() => validateBinding(binding, product));
    assert.throws(() => validateBinding({ ...binding, expectedSku: '' }, original));
  });
  await check('search/home/internal/cross-host URLs cannot be fetched', () => {
    for (const url of ['https://www.vatanbilgisayar.com/', 'https://www.vatanbilgisayar.com/ara?q=test', binding.url + '?q=test', 'http://www.vatanbilgisayar.com/test.html', 'https://www.vatanbilgisayar.com.evil.example/test.html', 'https://127.0.0.1/test.html']) assert.throws(() => validPage(url, 'vatan'));
  });
  await check('HTTP failures preserve prior offers and timestamps', async () => {
    const result = await collectOffer(binding, { fetchImpl: async () => new Response('Denied', { status: 403 }), now: () => checkedAt });
    assert.equal(result.status, 'unverified'); assert.match(result.reason, /403/);
    assert.strictEqual(mergeObservation(original, result), original);
  });
  await check('timeout, redirect and oversized body are explicit failed checks', async () => {
    const timeout = await collectOffer(binding, { fetchImpl: async () => { throw new Error('Timeout'); } });
    assert.equal(timeout.status, 'unverified');
    const redirect = await collectOffer(binding, { fetchImpl: async (_, options) => { assert.equal(options.redirect, 'manual'); return new Response('', { status: 302 }); } });
    assert.equal(redirect.status, 'unverified');
    const large = await collectOffer(binding, { fetchImpl: async () => new Response('a'.repeat(MAX_HTML_BYTES + 1), { headers: { 'content-type': 'text/html' } }) });
    assert.match(large.reason, /Oversized/);
  });
  await check('timestamp follows completed body, and success merges only observed fields', async () => {
    let completed = false, clockReads = 0;
    const body = new ReadableStream({ pull(controller) { controller.enqueue(new TextEncoder().encode(html(source))); completed = true; controller.close(); } });
    const result = await collectOffer(binding, {
      fetchImpl: async () => new Response(body, { headers: { 'content-type': 'text/html' } }),
      now: () => { if (clockReads++ > 0) assert.equal(completed, true); return checkedAt; },
    });
    assert.equal(clockReads, 2);
    assert.equal(result.status, 'observed');
    const next = mergeObservation(original, result);
    assert.equal(original.storeOffers.length, 1);
    assert.equal(next.storeOffers.length, 2);
    assert.equal(next.basePrice, 50000); assert.deepEqual(next.specs, original.specs);
    assert.equal(next.priceHistory.length, 1); assert.equal(next.priceHistory[0].sourceType, 'observed');
    assert.equal(next.priceHistory[0].currency, 'TRY');
    const again = mergeObservation(next, result);
    assert.equal(again.storeOffers.length, 2); assert.equal(again.priceHistory.length, 1);
  });
  await check('out-of-stock/preorder never become current purchasable offers or price history', () => {
    for (const status of ['OutOfStock', 'SoldOut', 'PreOrder']) {
      const product = structuredClone(source); product.offers.availability = 'https://schema.org/' + status;
      const next = mergeObservation(original, { status: 'observed', observation: parse(product) });
      assert.equal(next.storeOffers.at(-1).inStock, false); assert.equal(next.priceHistory.length, 0);
    }
  });
  await check('default is read-only and legacy push/bad limits fail', () => {
    assert.equal(parseArgs([]).apply, false);
    for (const args of [['--push'], ['--limit=NaN'], ['--limit=0'], ['--limit=5001'], ['--apply', '--dry-run']]) assert.throws(() => parseArgs(args));
    assert.throws(() => parseArgs(['--apply', '--report=src/lib/smartphonesData.json']));
  });
  await check('catalog writer preserves full file wrapper, failures and concurrent edits; quarantine remains enforced', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'aceleetme-offer-test-'));
    assert.ok(path.resolve(directory).startsWith(path.resolve(os.tmpdir()) + path.sep));
    try {
      const file = path.join(directory, 'test.ts');
      const arrayText = JSON.stringify([original]);
      const full = '// keep this comment\nexport const test: Product[] = ' + arrayText + ';\n';
      fs.writeFileSync(file, full);
      const catalogs = [{ category: 'smartphones', products: [original], file, original: full, arrayText }];
      const result = { status: 'observed', observation: parse(source) };
      assert.deepEqual(writeCatalogChanges(catalogs, [{ status: 'unverified' }], []), []);
      assert.equal(fs.readFileSync(file, 'utf8'), full);
      assert.throws(() => writeCatalogChanges(catalogs, [result], [{ id: original.id, fieldsAwaitingSource: ['storeOffers'] }]));
      assert.equal(fs.readFileSync(file, 'utf8'), full);
      fs.writeFileSync(file, full + '// user change');
      assert.throws(() => writeCatalogChanges(catalogs, [result], []));
      fs.writeFileSync(file, full);
      assert.deepEqual(writeCatalogChanges(catalogs, [result], []), ['smartphones']);
      const saved = fs.readFileSync(file, 'utf8');
      assert.ok(saved.startsWith('// keep this comment\nexport const test: Product[] = '));
      assert.ok(saved.endsWith(';\n')); assert.ok(saved.includes('42000.5'));
    } finally {
      // The only recursive deletion is this exact directory created by the test above.
      if (path.dirname(path.resolve(directory)) !== path.resolve(os.tmpdir()) || !path.basename(directory).startsWith('aceleetme-offer-test-')) throw new Error('Unsafe cleanup target');
      fs.rmSync(directory, { recursive: true });
    }
  });
  await check('all real reviewed bindings resolve to exact catalog IDs without changing catalogs', () => {
    const catalogs = readCatalogs(); assert.equal(catalogs.length, 9);
    const manifest = require('../data/store_offer_sources.json');
    for (const entry of manifest.bindings) validateBinding(entry, catalogs.flatMap(catalog => catalog.products).find(product => product.id === entry.productId));
  });
  console.log(`Observed offer ingestion: ${passed} PASS, 0 FAIL`);
}
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { binding, source, original, checkedAt, html };
