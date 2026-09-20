import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getStoredProducts } from '../src/lib/adminData';
import { getProductById } from '../src/lib/data';
import { getComparisonRows } from '../src/lib/comparisonEvidence';

const archive = JSON.parse(readFileSync('data/catalog_archives/lg-monitors-tv-batch-2026-09-20.json', 'utf8'));
const products = getStoredProducts();
let passed = 0;
const check = (name: string, fn: () => void) => { fn(); passed++; console.log(`PASS: ${name}`); };
for (const entry of archive.records) {
  check(`${entry.oldId}: exact old alias, canonical ID and slug resolve to one monitor`, () => {
    const resolved = getProductById(entry.oldId)!;
    assert.ok(resolved); assert.equal(resolved.id, entry.canonicalId); assert.equal(resolved.category, 'monitors');
    assert.equal(getProductById(resolved.slug)?.id, resolved.id);
    const model = entry.canonicalId.split('-').slice(-2).join('-').toLowerCase();
    assert.equal(products.filter(p => p.name.toLowerCase().includes(model)).length, 1);
    assert.equal(products.some(p => p.id === entry.oldId), false);
    assert.ok(resolved.fieldSources?.some(s => s.sourceUrl === entry.sourceUrl && s.fields.includes('category')));
    assert.equal(resolved.verifiedAt, entry.previousMonitorRecord?.verifiedAt);
  });
  check(`${entry.canonicalId}: no invented prices or transferred duplicate offers`, () => {
    const current = getProductById(entry.canonicalId)!;
    const previous = entry.previousMonitorRecord || entry.archivedTVRecord;
    for (const field of ['basePrice', 'storeOffers', 'priceHistory', 'image', 'images']) {
      assert.deepEqual((current as unknown as Record<string, unknown>)[field], previous[field]);
    }
  });
}
check('Unique moved models use monitor fields and no copied TV processor/OS/audio defaults', () => {
  for (const entry of archive.records.filter((r: { action: string }) => r.action === 'move_category')) {
    const specs = getProductById(entry.canonicalId)!.specs! as Record<string, unknown>;
    for (const key of ['smartOs', 'processorEngine', 'audioPowerWatts', 'displayTech', 'voiceControl']) assert.equal(specs[key], undefined);
    assert.ok(specs.panelType);
  }
});
check('24G411A-B separates 120 Hz normal / 144 Hz OC and 5 ms GtG / 1 ms MBR', () => {
  const p = getProductById('lg-ultragear-24g411a-b')!;
  const s = p.specs as Record<string, unknown>;
  assert.equal(s.refreshRateHz, 120); assert.equal(s.responseTimeMs, 5); assert.equal(s.panelType, 'IPS');
  assert.match(p.highlights.join(' '), /hız aşırtma ile 144 Hz/); assert.match(p.highlights.join(' '), /ayrı 1 ms MBR/);
});
check('34WR55QK-B and 32G600A-B retain exact distinct VA panel / refresh rate', () => {
  const a = getProductById('lg-ultrawide-34wr55qk-b')!, b = getProductById('lg-ultragear-32g600a-b')!;
  assert.equal((a.specs as Record<string, unknown>).panelType, 'VA'); assert.equal((b.specs as Record<string, unknown>).panelType, 'VA');
  const row = getComparisonRows([a, b]).find(r => r.label === 'Yenileme Hızı')!;
  assert.ok(row); assert.equal(row.getRawNumber!(a), 100); assert.equal(row.getRawNumber!(b), 180);
});
check('Typical brightness and Thunderbolt generation are corrected without claiming every field verified', () => {
  const oled = getProductById('lg-ultragear-32gs95uv-b')!, sixK = getProductById('lg-ultrafine-32u990a-s')!;
  assert.equal((oled.specs as Record<string, unknown>).brightnessNits, 275);
  assert.equal((sixK.specs as Record<string, unknown>).brightnessNits, 450);
  assert.match(sixK.name, /Thunderbolt 5/); assert.doesNotMatch(sixK.highlights.join(' '), /Thunderbolt 4/);
  for (const id of ['lg-ultrafine-32u990a-s', 'lg-ultragear-32g600a-b', 'lg-ultragear-24g411a-b']) {
    const p = getProductById(id)!;
    assert.equal(p.releaseYear, 2025); assert.ok(p.fieldSources!.at(-1)!.fields.includes('releaseYear'));
  }
  assert.deepEqual(getProductById('lg-ultrafine-32un88ap-w')!.fieldSources!.at(-1)!.fields, ['category']);
});
check('Six old entries yield three removed duplicates and three preserved unique models', () => {
  assert.equal(archive.records.filter((r: { action: string }) => r.action === 'merge_duplicate').length, 3);
  assert.equal(archive.records.filter((r: { action: string }) => r.action === 'move_category').length, 3);
  const baseline = JSON.parse(readFileSync('data/catalog_baseline.json', 'utf8'));
  assert.equal(products.length, baseline.total);
  assert.equal(products.filter(p => p.category === 'tvs').length, baseline.counts.tvs);
  assert.equal(products.filter(p => p.category === 'monitors').length, baseline.counts.monitors);
});
console.log(`\nLG classification: ${passed} PASS, 0 FAIL. Resolver/data tests only; no browser or catalog writes.`);
