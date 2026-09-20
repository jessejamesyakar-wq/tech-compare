import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getAllProducts, getProductById } from '../src/lib/data';
import { getStoredProducts } from '../src/lib/adminData';
import type { Product, StoreOffer } from '../src/lib/types';
import { ProductJsonLd } from '../src/components/seo/ProductJsonLd';
import { evaluateProductPricing, getEligibleDirectOffers } from '../src/lib/pricing/unifiedPriceEvaluator';
import { buildProductMetaTitle } from '../src/lib/seoHelper';
import sitemap from '../src/app/sitemap';
import { performFullStateCleanup } from './testCleanupHelper';

const site = 'https://www.aceleetme.tech';
const base = new URL(process.env.TEST_BASE_URL || 'http://localhost:3000');
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(base.hostname), 'Only local test servers are allowed');
const categories = ['phones', 'tvs', 'laptops', 'tablets', 'smartwatches', 'headphones', 'appliances', 'monitors', 'consoles'];
const productPath = (p: Product) => '/' + (p.category === 'smartphones' ? 'phones' : p.category) + '/' + (p.slug || p.id);
let httpChecks = 0;
let checks = 0;
function passed(message: string) { checks++; console.log('PASS ' + message); }

async function request(path: string, init: RequestInit = {}) {
  httpChecks++;
  return fetch(new URL(path, base), { redirect: 'manual', signal: AbortSignal.timeout(60000), ...init });
}
function schemas(html: string) {
  const $ = load(html);
  // Invalid JSON must fail the suite rather than disappear from its evidence.
  return $('script[type="application/ld+json"]').toArray().map((node) => JSON.parse($(node).text()));
}
function schemaFor(product: Product) {
  const html = renderToStaticMarkup(createElement(ProductJsonLd, { product }));
  return { html, product: schemas(html).find((s) => s['@type'] === 'Product') };
}
async function canonicalPage(path: string, expected: string, noindex = false) {
  const response = await request(path);
  assert.equal(response.status, 200, path + ' status');
  const html = await response.text();
  const $ = load(html);
  assert.equal($('link[rel="canonical"]').length, 1, path + ' must have one canonical');
  assert.equal($('link[rel="canonical"]').attr('href'), expected, path + ' canonical');
  const tokens = ($('meta[name="robots"]').attr('content') || '').toLowerCase().split(/[,\s]+/);
  assert.equal(tokens.includes('noindex'), noindex, path + ' robots');
  return { html, $ };
}
async function redirect(from: string, to: string) {
  const response = await request(from);
  assert.equal(response.status, 308, from + ' must permanently redirect');
  assert.equal(new URL(response.headers.get('location')!, base).pathname, to, from + ' destination');
  await canonicalPage(to, site + to);
  passed('308 -> 200, no loop: ' + from);
}

async function main() {
  const products = await getAllProducts();
  const template = products.find((p) => p.category === 'smartphones')!;
  assert.ok(template);
  const now = Date.now();
  const offer: StoreOffer = {
    storeName: 'Hepsiburada', price: 42000, inStock: true,
    url: 'https://www.hepsiburada.com/seo-test-p-123',
    lastCheckedAt: new Date(now - 2 * 3600000).toISOString(),
  } as StoreOffer;
  const fixture = (offers: StoreOffer[]): Product => ({
    ...template, id: 'seo-unit-only', slug: 'seo-unit-only', rating: 4.8, reviewCount: 120,
    basePrice: 50000, image: '/icon.png', images: [], variants: [], storeOffers: offers,
  });

  // Real component rendering and shared evaluator; this is not a mocked HTTP test.
  const scenarios: [string, StoreOffer[], number | null][] = [
    ['fresh', [offer], 42000],
    ['stale', [{ ...offer, lastCheckedAt: new Date(now - 48 * 3600000).toISOString() }], null],
    ['no offer', [], null],
    ['unknown stock', [{ ...offer, inStock: undefined } as unknown as StoreOffer], null],
    ['out of stock with contradictory legacy flag', [{ ...offer, inStock: false, stockStatus: 'in_stock' }], null],
    ['search URL', [{ ...offer, url: 'https://www.amazon.com.tr/s?k=phone' }], null],
    ['invalid URL protocol', [{ ...offer, url: 'javascript:alert(1)' }], null],
    ['infinite price', [{ ...offer, price: Infinity }], null],
    ['future date', [{ ...offer, lastCheckedAt: new Date(now + 3600000).toISOString() }], null],
    ['invalid date', [{ ...offer, lastCheckedAt: 'not-a-date' }], null],
  ];
  for (const [label, offers, price] of scenarios) {
    const p = fixture(offers);
    const schema = schemaFor(p).product;
    assert.ok(schema);
    assert.equal(evaluateProductPricing(p).currentPrice, price);
    assert.equal(schema.offers?.price ?? null, price, label + ' schema/UI agreement');
    assert.equal(schema.aggregateRating, undefined);
    assert.equal(schema.mpn, undefined);
    assert.equal(schema.offers?.itemCondition, undefined);
    passed('component + pricing: ' + label);
  }
  const exactBoundary = { ...offer, lastCheckedAt: new Date(now - 24 * 3600000).toISOString() };
  assert.equal(getEligibleDirectOffers([exactBoundary], now).freshDirectOffers.length, 1);
  assert.equal(getEligibleDirectOffers([exactBoundary], now + 1).freshDirectOffers.length, 0);
  const aggregate = schemaFor(fixture([offer, { ...offer, price: 43000, storeName: 'Trendyol', url: 'https://www.trendyol.com/test-p-456' }])).product;
  assert.equal(aggregate.offers.lowPrice, 42000);
  assert.equal(aggregate.offers.highPrice, 43000);
  assert.equal(aggregate.offers.offerCount, 2);
  const hostileName = '</script><script id="unexpected">alert(1)</script>';
  const hostile = schemaFor({ ...fixture([]), name: hostileName, mpn: 'REAL-MPN-123', reviewsVerified: true, ratingSource: 'unproven' } as unknown as Product);
  assert.equal(load(hostile.html)('script').length, 2, 'Product data cannot create executable script tags');
  assert.equal(hostile.product.name, hostileName);
  assert.equal(hostile.product.mpn, 'REAL-MPN-123');
  assert.equal(hostile.product.aggregateRating, undefined, 'Arbitrary flags are not verified review evidence');
  passed('24h boundary, aggregate offers, explicit MPN and safe JSON serialization');

  const entries = await sitemap();
  const expectedProducts = new Set(products.map((p) => site + productPath(p)));
  const productEntries = entries.filter((e) => new URL(e.url).pathname.split('/').filter(Boolean).length === 2);
  assert.deepEqual(new Set(productEntries.map((e) => e.url)), expectedProducts);
  assert.equal(new Set(entries.map((e) => e.url)).size, entries.length, 'Duplicate sitemap URLs');
  for (const entry of entries) {
    const url = new URL(entry.url);
    assert.equal(url.origin, site);
    assert.equal(url.search, '');
    assert.equal(entry.lastModified, undefined, 'No inferred content dates');
    assert.ok(!/^\/(search|alerts|compare|duello|admin|api)(\/|$)/.test(url.pathname));
  }
  for (const entry of productEntries) {
    const [category, slug] = new URL(entry.url).pathname.split('/').filter(Boolean);
    assert.ok(categories.includes(category));
    const resolved = await getProductById(decodeURIComponent(slug));
    assert.ok(resolved, entry.url + ' must resolve');
    assert.equal(site + productPath(resolved), entry.url, 'Resolved product must use this canonical URL');
  }
  passed('all ' + productEntries.length + ' product sitemap URLs resolve; ' + entries.length + ' total URLs, no invented dates');
  if (process.argv.includes('--unit-only')) return;

  // HTTP coverage is a sample per category, not a claim that all products were fetched.
  await canonicalPage('/', site);
  for (const category of categories) {
    await canonicalPage('/' + category, site + '/' + category);
    const sample = products.find((p) => productPath(p).startsWith('/' + category + '/'))!;
    assert.ok(sample, 'Missing category sample: ' + category);
    const page = await canonicalPage(productPath(sample), site + productPath(sample));
    assert.equal(page.$('title').text(), buildProductMetaTitle(sample));
    assert.equal(schemas(page.html).find((s) => s['@type'] === 'Product')?.name, sample.name);
    // Exercise each route's category guard as well as its canonical target.
    const wrongCategory = category === 'phones' ? 'tvs' : 'phones';
    await redirect('/' + wrongCategory + '/' + (sample.slug || sample.id), productPath(sample));
    const differentId = products.find((p) => productPath(p).startsWith('/' + category + '/') && p.id !== p.slug);
    if (differentId) await redirect('/' + category + '/' + differentId.id, productPath(differentId));
  }
  for (const path of ['/search?q=iphone', '/compare?d1=samsung-galaxy-s24', '/alerts', '/duello']) {
    await canonicalPage(path, site + path.split('?')[0], true);
  }
  for (const path of ['/gizlilik-politikasi', '/kullanim-kosullari', '/yasal-uyari', '/iletisim']) {
    await canonicalPage(path, site + path);
  }
  const missing = await request('/phones/seo-definitely-missing-' + randomUUID());
  assert.equal(missing.status, 404);
  assert.match(load(await missing.text())('meta[name="robots"]').map((_, node) => load(node).root().find('meta').attr('content') || '').get().join(','), /noindex/);
  await redirect('/tvs/lg-lg-ultragear-27gx790a-b', '/monitors/lg-ultragear-27gx790a-b');
  passed('9 categories, utility noindex pages, legal/contact pages and missing-product 404');

  const sitemapRes = await request('/sitemap.xml');
  assert.equal(sitemapRes.status, 200);
  const xml = load(await sitemapRes.text(), { xmlMode: true });
  assert.deepEqual(xml('url > loc').map((_, el) => xml(el).text()).get().sort(), entries.map((e) => e.url).sort());
  assert.equal(xml('lastmod').length, 0);
  const robotsRes = await request('/robots.txt');
  assert.equal(robotsRes.status, 200);
  const robots = await robotsRes.text();
  assert.match(robots, /^Sitemap: https:\/\/www\.aceleetme\.tech\/sitemap\.xml$/m);
  assert.match(robots, /^Disallow: \/api\/$/m);
  assert.match(robots, /^Disallow: \/admin\/$/m);
  assert.ok(!/^Disallow: \/(?:search|compare|alerts|duello)/m.test(robots), 'Crawlers must be able to see noindex metadata');
  passed('actual sitemap XML and robots.txt HTTP responses');

  if (process.argv.includes('--production')) {
    const blocked = await request('/api/test-inject-products', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"products":[]}',
    });
    assert.equal(blocked.status, 404, 'Production must not expose test injection');
    passed('production test endpoint returns 404');
    return;
  }

  // A per-run ID and preflight prevent overwriting existing products.
  let key = process.env.TEST_INJECTION_KEY;
  if (!key && fs.existsSync('.env.local')) {
    key = fs.readFileSync('.env.local', 'utf8').match(/^\s*TEST_INJECTION_KEY\s*=\s*["']?([^"'\r\n]+)["']?\s*$/m)?.[1]?.trim();
  }
  assert.ok(key, 'TEST_INJECTION_KEY is required for local HTTP fixture integration');
  const initial = structuredClone(getStoredProducts());
  const initialIds = initial.map((p) => p.id);
  const prefix = 'seo-test-' + randomUUID();
  const fixtures = [fixture([offer]), fixture(scenarios[1][1]), fixture([])].map((p, i) => ({
    ...p, id: prefix + '-id-' + i, slug: prefix + '-slug-' + i,
  }));
  const tracked = new Set<string>();
  let testError: unknown;
  try {
    for (const p of fixtures) {
      assert.ok(!initialIds.includes(p.id));
      assert.equal((await request('/api/products/' + p.id)).status, 404, 'Fixture ID must not exist before injection');
      assert.equal((await request('/api/products/' + p.slug)).status, 404, 'Fixture slug must not exist before injection');
    }
    // Track all attempted mutations before sending the request (including partial failures).
    fixtures.forEach((p) => tracked.add(p.id));
    const injected = await request('/api/test-inject-products', {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-test-injection-key': key },
      body: JSON.stringify({ products: fixtures }),
    });
    assert.equal(injected.status, 200);
    const result = await injected.json();
    assert.equal(result.ok, true);
    assert.equal(result.injectedCount, fixtures.length);
    for (let i = 0; i < fixtures.length; i++) {
      const p = fixtures[i];
      const page = await canonicalPage(productPath(p), site + productPath(p));
      const schema = schemas(page.html).find((s) => s['@type'] === 'Product');
      assert.ok(schema);
      assert.equal(schema.offers?.price ?? null, i === 0 ? 42000 : null);
      assert.equal(schema.aggregateRating, undefined);
      assert.equal(schema.mpn, undefined);
      assert.equal(page.$('meta[name="description"]').length, 1);
      assert.ok(page.$('meta[name="description"]').attr('content')!.length <= 160);
      const image = new URL(page.$('meta[property="og:image"]').attr('content')!);
      assert.equal(image.href, site + '/icon.png');
      // Same-origin asset is fetched from this build, not the previously deployed site.
      const imageResponse = await request(image.pathname);
      assert.equal(imageResponse.status, 200);
      assert.match(imageResponse.headers.get('content-type') || '', /^image\//);
      assert.ok((await imageResponse.arrayBuffer()).byteLength > 0);
      await redirect('/phones/' + p.id, productPath(p));
    }
    passed('real HTTP fresh/stale/no-offer JSON-LD, canonical IDs, OG image status/MIME/body');
  } catch (error) {
    testError = error;
  } finally {
    const cleanup = await performFullStateCleanup(tracked, initialIds, initialIds.length, key, base.origin);
    assert.deepEqual(getStoredProducts(), initial, 'Original local catalog contents must be unchanged');
    const errors = testError ? [testError] : [];
    if (!cleanup.serverMemoryCleanupPassed || !cleanup.localMemoryCleanupPassed) errors.push(new Error('Test cleanup failed'));
    if (errors.length) throw new AggregateError(errors, 'SEO verification or cleanup failed');
  }
}

main().then(() => {
  console.log('SEO PASS: ' + checks + ' check groups; ' + httpChecks + ' local HTTP requests (sample coverage, not every product page).');
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
