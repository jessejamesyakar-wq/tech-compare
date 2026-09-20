const { createHash } = require('node:crypto');
const cheerio = require('cheerio');

// Only reviewed direct pages are fetched. No search results, arbitrary hosts or fuzzy SKU matching.
const STORES = {
  teknosa: { name: 'Teknosa', host: 'www.teknosa.com', productPath: /-p-\d+$/ },
  vatan: { name: 'Vatan Bilgisayar', host: 'www.vatanbilgisayar.com', productPath: /\/[^/]+\.html$/ },
};
const MAX_HTML_BYTES = 3 * 1024 * 1024;
function fail(message) { throw new Error(message); }
function text(value) {
  return typeof value === 'string' ? cheerio.load(value).text().normalize('NFKC').replace(/\s+/g, ' ').trim() : '';
}
function sameText(a, b) { return text(a).toLocaleLowerCase('tr-TR') === text(b).toLocaleLowerCase('tr-TR'); }
function hasType(node, type) {
  return [node?.['@type']].flat().some(value => value === type || value === `https://schema.org/${type}` || value === `http://schema.org/${type}`);
}
function validPage(url, storeId) {
  const store = STORES[storeId];
  if (!store) fail('Unsupported store');
  let page;
  try { page = new URL(url); } catch { fail('Invalid source URL'); }
  if (page.protocol !== 'https:' || page.hostname !== store.host || page.port || page.username || page.password || page.search || page.hash || !store.productPath.test(page.pathname)) {
    fail('A reviewed, direct HTTPS product URL is required');
  }
  return page.href;
}

function validateBinding(binding, product) {
  if (!binding || !product || binding.productId !== product.id || binding.category !== product.category || binding.catalogName !== product.name) fail('Catalog identity changed or is missing');
  validPage(binding.url, binding.storeId);
  if (!text(binding.expectedTitle) || !text(binding.expectedSku) || !text(binding.scopeNote) || !text(binding.reviewedAt)) fail('Incomplete reviewed page binding');
  if (binding.brand !== product.brand) fail('Catalog brand mismatch');
  if (product.variants?.length || product.colorOptions?.length || binding.variantId || binding.variantName) {
    const variants = (product.variants || []).filter(variant => variant.id === binding.variantId);
    if (variants.length !== 1 || !text(binding.variantName) || variants[0].colorName !== binding.variantName) fail('Exact catalog variant identity required');
    if (!binding.expectedMpn || !sameText(binding.expectedTitle.split(/\s+/).slice(-binding.variantName.split(/\s+/).length).join(' '), binding.variantName)) fail('Reviewed source must identify the variant and manufacturer part number');
  }
  const reviewed = Date.parse(binding.reviewedAt);
  if (!Number.isFinite(reviewed) || reviewed > Date.now()) fail('Invalid binding review date');
  return binding;
}

/** A single Product's own Offer, exact reviewed title AND merchant SKU, TRY and explicit stock/condition. */
function parseObservedOffer(html, binding, { checkedAt, finalUrl = binding.url } = {}) {
  validPage(binding.url, binding.storeId);
  if (finalUrl !== binding.url) fail('Product page redirected; review the new identity first');
  if (typeof html !== 'string' || Buffer.byteLength(html) > MAX_HTML_BYTES) fail('Invalid/oversized HTML');
  const time = Date.parse(checkedAt);
  if (!Number.isFinite(time) || time > Date.now() || new Date(time).toISOString() !== checkedAt) fail('Invalid observation timestamp');
  const $ = cheerio.load(html);
  const canonicals = $('link[rel="canonical"]').map((_, node) => $(node).attr('href')).get();
  if (canonicals.some(url => new URL(url, finalUrl).href !== binding.url)) fail('Canonical points to another product');
  const nodes = [];
  function collect(value) {
    if (Array.isArray(value)) { value.forEach(collect); return; }
    if (!value || typeof value !== 'object') return;
    nodes.push(value);
    // Deliberately exclude related products/reviews/item lists.
    if (Array.isArray(value['@graph'])) value['@graph'].forEach(collect);
  }
  $('script[type="application/ld+json"]').each((_, node) => {
    try { collect(JSON.parse($(node).html() || '')); } catch { /* No fallback to arbitrary page numbers. */ }
  });
  const products = nodes.filter(node => hasType(node, 'Product') && sameText(node.name, binding.expectedTitle) && String(node.sku) === binding.expectedSku);
  if (products.length !== 1) fail('Expected one exact Product title and merchant SKU');
  const product = products[0];
  if (!sameText(typeof product.brand === 'string' ? product.brand : product.brand?.name, binding.brand)) fail('Source brand mismatch');
  if (binding.expectedMpn && !sameText(product.mpn, binding.expectedMpn)) fail('Source manufacturer part number mismatch');
  if (product.url && new URL(product.url, finalUrl).href !== binding.url) fail('Product URL mismatch');
  const offers = Array.isArray(product.offers) ? product.offers : product.offers ? [product.offers] : [];
  if (offers.length !== 1 || !hasType(offers[0], 'Offer')) fail('No single direct Offer; aggregate/ambiguous prices are not observations');
  const offer = offers[0];
  if (offer.priceCurrency !== 'TRY') fail('TRY currency evidence required');
  const priceString = String(offer.price);
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(priceString)) fail('Invalid structured price');
  const price = Number(priceString);
  if (!Number.isFinite(price) || price <= 0 || price > Number.MAX_SAFE_INTEGER / 100) fail('Invalid positive price');
  if (typeof offer.url !== 'string' || new URL(offer.url, finalUrl).href !== binding.url) fail('Offer must reference the reviewed product URL');
  const condition = offer.itemCondition || product.itemCondition;
  const newConditions = ['https://schema.org/NewCondition', 'http://schema.org/NewCondition'];
  if (!newConditions.includes(condition) || (product.itemCondition && !newConditions.includes(product.itemCondition))) fail('New product condition is unverified');
  const states = { InStock: ['in_stock', true], OutOfStock: ['out_of_stock', false], SoldOut: ['out_of_stock', false], PreOrder: ['preorder', false] };
  const availability = typeof offer.availability === 'string' ? offer.availability.replace(/^https?:\/\/schema\.org\//, '') : '';
  if (!states[availability]) fail('Stock status is missing or unsupported');
  const sellerName = text(typeof offer.seller === 'string' ? offer.seller : offer.seller?.name);
  if (!sellerName) fail('Seller is unverified');
  if (offer.priceValidUntil != null) {
    const expiry = Date.parse(offer.priceValidUntil);
    const localDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(time));
    if (!/^\d{4}-\d\d-\d\d$/.test(offer.priceValidUntil) || !Number.isFinite(expiry) || new Date(expiry).toISOString().slice(0, 10) !== offer.priceValidUntil || offer.priceValidUntil < localDay) fail('Price has expired or validity is invalid');
  }
  return {
    productId: binding.productId, category: binding.category, storeId: binding.storeId,
    sourceTitle: text(product.name), sourceSku: String(product.sku), sourceMpn: text(product.mpn) || undefined,
    bodySha256: createHash('sha256').update(html).digest('hex'),
    offer: {
      id: `observed-${binding.storeId}-${binding.expectedSku}`,
      storeName: STORES[binding.storeId].name, sellerName, price, url: binding.url,
      sourceUrl: binding.url, sourceType: 'retailer', isSearchLink: false,
      ...(binding.variantId ? { variantId: binding.variantId, variantName: binding.variantName } : {}),
      inStock: states[availability][1], stockStatus: states[availability][0], lastCheckedAt: checkedAt,
      observationEvidence: {
        merchantSku: String(product.sku), title: text(product.name), manufacturerPartNumber: text(product.mpn) || undefined,
        currency: 'TRY', responseSha256: createHash('sha256').update(html).digest('hex'),
      },
    },
  };
}

async function collectOffer(binding, { fetchImpl = fetch, now = () => new Date().toISOString(), timeoutMs = 15000 } = {}) {
  const startedAt = now();
  try {
    validPage(binding.url, binding.storeId);
    const response = await fetchImpl(binding.url, {
      redirect: 'manual', signal: AbortSignal.timeout(timeoutMs),
      headers: { Accept: 'text/html', 'Accept-Language': 'tr-TR,tr;q=0.9', 'User-Agent': 'AceleetmeOfferAudit/1.0 (+https://www.aceleetme.tech/iletisim)' },
    });
    if (!response.ok) fail(`HTTP ${response.status}`);
    if (!/text\/html/i.test(response.headers.get('content-type') || '')) fail('Expected HTML response');
    if (Number(response.headers.get('content-length')) > MAX_HTML_BYTES) fail('Oversized response');
    const reader = response.body?.getReader();
    if (!reader) fail('Empty response');
    const chunks = [];
    let bytes = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > MAX_HTML_BYTES) fail('Oversized response');
        chunks.push(Buffer.from(value));
      }
    } finally { await reader.cancel(); }
    // Timestamp is taken only after the entire successful HTTP response was downloaded.
    const checkedAt = now();
    const observation = parseObservedOffer(Buffer.concat(chunks).toString('utf8'), binding, { checkedAt, finalUrl: response.url || binding.url });
    return { status: 'observed', startedAt, observation };
  } catch (error) {
    // Attempt time belongs to the report, never to the product's lastCheckedAt.
    return { status: 'unverified', startedAt, productId: binding.productId, storeId: binding.storeId, url: binding.url, reason: error.message };
  }
}

/** Pure merge. Failures leave the original object and every date untouched. */
function mergeObservation(product, result) {
  if (result.status !== 'observed') return product;
  const observed = result.observation;
  if (product.id !== observed.productId || product.category !== observed.category) fail('Observation identity mismatch');
  const offer = observed.offer;
  const storeOffers = (product.storeOffers || []).filter(previous => previous.url !== offer.url && previous.id !== offer.id);
  storeOffers.push(offer);
  const priceHistory = [...(product.priceHistory || [])];
  if (offer.inStock === true) {
    const point = { date: offer.lastCheckedAt, observedAt: offer.lastCheckedAt, price: offer.price, store: offer.sellerName, sourceUrl: offer.url, sourceType: 'observed', currency: 'TRY', ...(offer.variantId ? { variantId: offer.variantId, variantName: offer.variantName } : {}) };
    if (!priceHistory.some(previous => previous.date === point.date && previous.sourceUrl === point.sourceUrl && previous.store === point.store)) priceHistory.push(point);
  }
  // Catalog reference price, specs, ratings, images and unrelated merchants never change.
  return { ...product, storeOffers, priceHistory };
}

module.exports = { STORES, MAX_HTML_BYTES, validPage, validateBinding, parseObservedOffer, collectOffer, mergeObservation };
