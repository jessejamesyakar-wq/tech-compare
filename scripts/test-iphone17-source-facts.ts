import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getProductById } from '../src/lib/data';
import { getComparisonRows, getMetricOutcome } from '../src/lib/comparisonEvidence';
import type { Smartphone } from '../src/lib/types';

const archive = JSON.parse(readFileSync('data/catalog_archives/iphone17-pro-max-facts-2026-09-20.json','utf8'));
const phones: Smartphone[] = [];
for (const old of archive.original) {
  const p = getProductById(old.slug) as Smartphone;
  assert.equal(p.id, old.id); phones.push(p);
  assert.equal(p.specs.memory?.storageGb, old.specs.memory.storageGb);
  assert.deepEqual(p.specs.memory?.storageOptions, [256,512,1024,2048]);
  assert.equal(p.specs.connectivity?.has5G, true);
  assert.equal(p.specs.connectivity?.bluetooth, '6');
  assert.equal(p.specs.processor?.chip, 'Apple A19 Pro');
  assert.equal(p.releaseYear, 2025);
  assert.equal(p.specs.build?.weightGrams, 231);
  assert.equal(p.specs.build?.thicknessMm, 8.75);
  assert.match(p.specs.build?.frameMaterial!, /Alüminyum/);
  assert.match(p.specs.camera?.selfieMp!, /18 MP/);
  assert.match(p.specs.camera?.telephotoMp!, /100 mm \(4x\).*12 MP.*8x/);
  assert.equal(p.specs.screen?.brightnessNits, 1000);
  assert.equal(p.specs.screen?.ppi, 460);
  assert.equal(p.specs.battery?.wirelessWatts, 25);
  assert.match(p.specs.software?.osName!, /iOS 26 \(çıkış sürümü\)/);
  assert.equal(p.specs.memory?.ramGb, undefined);
  assert.equal(p.specs.battery?.capacitymAh, undefined);
  assert.equal(p.specs.battery?.chargingWatts, undefined);
  assert.equal(p.specs.processor?.antutuScore, undefined);
  assert.equal(p.specs.camera?.dxomarkScore, undefined);
  assert.equal(p.specs.software?.updateYears, undefined);
  const raw = p as unknown as Record<string, unknown>;
  assert.deepEqual(raw.pros, []); assert.deepEqual(raw.cons, []);
  assert.equal(p.variants?.length, 3);
  assert.ok(p.variants?.every(v => (v as unknown as {color: string}).color === v.colorName && !v.id.endsWith('-uzay')));
  for (const key of ['basePrice','price','storeOffers','priceHistory','rating','reviewCount','epeyScore','image','images','sourceType','verifiedAt'])
    assert.deepEqual((p as unknown as Record<string,unknown>)[key], old[key], `${old.slug}: ${key} preserved`);
  assert.ok(p.fieldSources?.some(s => s.sourceUrl === 'https://support.apple.com/tr-tr/125091'));
  console.log(`PASS ${p.slug}: exact storage, source-backed facts, unsupported measurements omitted, commercial fields preserved`);
}
assert.equal(phones.length,4);
const rows=getComparisonRows(phones.slice(0,2));
for(const id of ['İşlemci ve Bellek:memory.ramGb','Batarya ve Şarj:battery.capacitymAh','Batarya ve Şarj:battery.chargingWatts']) {
  const row=rows.find(r=>r.id===id)!; assert.ok(row);
  assert.equal(row.getValue(phones[0]), 'Bilinmiyor');
  assert.equal(row.getRawNumber!(phones[0]),null);
  assert.equal(getMetricOutcome(row, phones.slice(0,2)), 'insufficient_data');
}
console.log('PASS actual comparison rows: missing RAM/battery/watts cannot produce a numeric value or winner');
const fiveG=rows.find(r=>r.id.endsWith(':connectivity.has5G'))!; assert.ok(fiveG);
assert.match(fiveG.getValue(phones[0]),/Var|Evet|Destek/);
console.log('PASS actual comparison row: 5G support is shown');
console.log('iPhone 17 source facts: 6 PASS, 0 FAIL. Read-only data/resolver/adapter assertions, not browser tests.');
