import assert from 'node:assert/strict';
import { getStoredProducts } from '../src/lib/adminData';
import { namedCatalogLookup, isCatalogPresenceQuestion, catalogPresenceReply, catalogTechnicalContext } from '../src/lib/ai/catalogGrounding';
import { searchProductsInCatalog } from '../src/lib/ai/resolvers';

const catalog = getStoredProducts();
const before = JSON.stringify(catalog);
for (const query of ['iPhone 18 Pro var mı?', 'iphone18pro özellikleri', 'iPhone 18 Pro’yu anlat']) {
  const matches = searchProductsInCatalog(query, 5);
  assert.ok(matches.length > 0, query);
  assert.ok(matches.every(p => /^Apple iPhone 18 Pro \(/.test(p.name)), query);
  assert.ok(matches.every(p => p.category === 'smartphones'));
}
assert.ok(searchProductsInCatalog('iPhone 18 Pro Max var mı?', 5).every(p => p.name.includes('iPhone 18 Pro Max')));
assert.ok(searchProductsInCatalog('iPhone 18 var mı?', 5).every(p => /^Apple iPhone 18 \(/.test(p.name)));
const capacity = searchProductsInCatalog('iPhone 18 Pro 512 GB var mı?', 5);
assert.ok(capacity.length > 0);
assert.ok(capacity.every(p => p.name.includes('Pro (512 GB)')));
assert.equal(searchProductsInCatalog('iPhone 99 Pro', 5).length, 0);
assert.equal(searchProductsInCatalog('iPhone 18 Pro 8 TB', 5).length, 0);
assert.equal(namedCatalogLookup('iPhone 18 Pro ile iPhone 17 Pro kıyasla', catalog), null);
assert.equal(namedCatalogLookup('merhaba', catalog), null);
assert.equal(isCatalogPresenceQuestion('iPhone 18 Pro var mı?'), true);
assert.equal(isCatalogPresenceQuestion('iPhone 18 Pro’da telefoto var mı?'), false);
assert.equal(isCatalogPresenceQuestion('iPhone 18 Pro stokta var mı?'), false);
const galaxy = namedCatalogLookup('Samsung Galaxy S26 Ultra var mı?', catalog);
assert.ok(galaxy?.products.length);
assert.ok(galaxy.products.every(p => p.name.includes('Galaxy S26 Ultra')));
const found = namedCatalogLookup('iPhone 18 Pro var mı?', catalog)!;
assert.match(catalogPresenceReply(found), /aceleEtme kataloğunda kayıtlı/);
assert.doesNotMatch(catalogPresenceReply(found), /Pro Max|Dell|henüz çıkmadı/);
assert.match(catalogPresenceReply(namedCatalogLookup('iPhone 99 Pro', catalog)!), /ürünün hiç olmadığı.*anlamına gelmez/);
const context = catalogTechnicalContext(found.products);
assert.ok(context[0].specifications.length > 5);
assert.ok(context[0].specifications.some(s => s.recordedValue !== 'Bilinmiyor'));
assert.doesNotMatch(JSON.stringify(context), /Katalog Puanı|Çıkış Yılı|Güncel Mağaza Fiyatı/);
assert.equal(JSON.stringify(catalog), before);
console.log('PASS: exact iPhone generations/tiers/capacities, unknown model and capacity, catalog-derived Galaxy alias, non-invented presence reply, technical evidence, unchanged catalog');
