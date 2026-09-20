import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getStoredProducts } from '../src/lib/adminData';
import { getProductById } from '../src/lib/data';
import { getComparisonRows } from '../src/lib/comparisonEvidence';

const archive = JSON.parse(readFileSync('data/catalog_archives/lg-monitors-25-tv-duplicates-2026-09-20.json', 'utf8'));
const catalog = getStoredProducts();
let passed = 0;
for (const entry of archive.records) {
  const resolved = getProductById(entry.oldId);
  assert.ok(resolved, `Missing old link ${entry.oldId}`);
  assert.equal(resolved.id, entry.canonicalId);
  assert.equal(resolved.category, 'monitors');
  assert.equal(resolved.slug, entry.canonicalId);
  assert.equal(getProductById(resolved.slug)?.id, resolved.id);
  assert.equal(catalog.some(p => p.id === entry.oldId), false);
  const model = new RegExp(`\\b${entry.model}\\b`, 'i');
  assert.equal(catalog.filter(p => model.test(p.name)).length, 1);
  const source = resolved.fieldSources?.find(s => s.sourceUrl === entry.sourceUrl && s.scopeNote?.includes('Only this exact model'));
  assert.ok(source); assert.deepEqual(source.fields, ['category']);
  // Store offers from the discarded duplicate must not become new live evidence.
  assert.deepEqual(resolved.storeOffers, entry.previousMonitorRecord.storeOffers);
  assert.deepEqual(resolved.priceHistory, entry.previousMonitorRecord.priceHistory);
  passed++; console.log(`PASS ${entry.model}: exact alias, single monitor, category-only evidence, offers preserved`);
}
assert.equal(archive.records.length, 25);
assert.notEqual(getProductById('lg-ultragear-27gx790a-b')!.id, getProductById('lg-ultragear-27gx790b-b')!.id);
assert.equal(getProductById('lg-lg-ultragear-27gx790b-z'), null);
assert.equal(getProductById('lg-lg-ultragear-27gx790'), null);
passed++; console.log('PASS: A/B model suffixes stay distinct; unknown/truncated suffixes return null');
const baseline = JSON.parse(readFileSync('data/catalog_baseline.json', 'utf8'));
assert.equal(catalog.length, baseline.total);
assert.equal(catalog.filter(p => p.category === 'tvs').length, baseline.counts.tvs);
assert.equal(catalog.filter(p => p.category === 'monitors').length, baseline.counts.monitors);
passed++; console.log('PASS: actual catalog and category counts match preserved integrity baseline');
// Manufacturer facts, not a second implementation of the correction algorithm.
// Full pre-correction records let this also catch unintended commercial-data changes.
const corrections = JSON.parse(readFileSync('data/catalog_archives/lg-four-monitor-spec-corrections-2026-09-20.json', 'utf8'));
const facts = [
  { model:'27g640a-b', hz:300, nits:400, year:2025, title:'300Hz', response:1, hdr:'DisplayHDR 400', contrast:'1300:1' },
  { model:'27gx790b-b', hz:540, nits:335, year:2026, title:'0.02ms', response:0.02, hdr:'DisplayHDR True Black 500', contrast:'1500000:1' },
  { model:'34g630a-b', hz:240, nits:300, year:2025, title:'1500R', response:1, hdr:'DisplayHDR 400', contrast:'4000:1' },
  { model:'27g850a-b', hz:240, nits:450, year:2025, title:'Nano IPS Black', response:1, hdr:'DisplayHDR 600', contrast:'2000:1' },
];
for (const fact of facts) {
  const product = getProductById('lg-ultragear-' + fact.model)!;
  const spec = product.specs as Record<string, unknown>;
  assert.ok(product.name.includes(fact.title)); assert.equal(product.releaseYear, fact.year);
  assert.equal(spec.responseTimeMs, fact.response); assert.equal(spec.hdrSupport, fact.hdr); assert.equal(spec.contrastRatio, fact.contrast);
  const rows = getComparisonRows([product, product]);
  assert.equal(rows.find(r => r.id === 'Ekran:refreshRateHz')!.getRawNumber!(product), fact.hz);
  assert.equal(rows.find(r => r.id === 'Ekran:brightnessNits')!.getRawNumber!(product), fact.nits);
  assert.ok(product.fieldSources?.some(s => s.fields.includes('specs.brightnessNits') && s.sourceUrl.endsWith(fact.model + '/')));
  const old = corrections.records.find((r: {id: string}) => r.id === product.id).previousRecord;
  for (const key of ['basePrice','storeOffers','priceHistory','image','images','rating','reviewCount','verifiedAt']) {
    assert.deepEqual((product as unknown as Record<string, unknown>)[key], old[key]);
  }
  passed++; console.log(`PASS ${fact.model}: verified title/spec facts reach comparison rows; commercial data preserved`);
}
console.log(`\nLG duplicate aliases: ${passed} PASS, 0 FAIL. Read-only data/resolver tests, not browser tests.`);
