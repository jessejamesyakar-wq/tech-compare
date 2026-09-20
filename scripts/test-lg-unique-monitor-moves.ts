import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getStoredProducts } from '../src/lib/adminData';
import { getProductById } from '../src/lib/data';
import { getComparisonRows } from '../src/lib/comparisonEvidence';

const archive=JSON.parse(readFileSync('data/catalog_archives/lg-24-unique-monitor-moves-2026-09-20.json','utf8'));
const catalog=getStoredProducts();
let passed=0;
for(const entry of archive.records) {
 const current=getProductById(entry.oldId)!;
 assert.ok(current);assert.equal(current.id,entry.canonicalId);assert.equal(current.category,'monitors');
 assert.equal(getProductById(current.slug)?.id,current.id);
 assert.equal(catalog.some(p=>p.id===entry.oldId),false);
 const exact=new RegExp(`\\b${entry.model}\\b`,'i');assert.equal(catalog.filter(p=>exact.test(p.name)).length,1);
 assert.deepEqual(current.specs,entry.verifiedSpecs);
 assert.ok(current.fieldSources?.some(s=>s.sourceUrl===entry.sourceUrl && s.fields.includes('category')));
 for(const key of ['smartOs','displayTech','processorEngine','audioPowerWatts','voiceControl','bezelStyle','dimensionsWithStand']) assert.equal((current.specs as Record<string,unknown>)[key],undefined);
 for(const key of ['basePrice','storeOffers','priceHistory','image','images','rating','reviewCount','epeyScore','sourceType','verifiedAt']) assert.deepEqual((current as unknown as Record<string,unknown>)[key],entry.archivedTVRecord[key]);
 passed++;console.log(`PASS ${entry.model}: exact legacy alias, one preserved monitor, scoped specs, commercial data unchanged`);
}
assert.equal(archive.records.length,24);
const baseline=JSON.parse(readFileSync('data/catalog_baseline.json','utf8'));
assert.equal(catalog.length,baseline.total);assert.equal(catalog.length,5820);
assert.equal(catalog.filter(p=>p.category==='tvs').length,882);assert.equal(catalog.filter(p=>p.category==='monitors').length,661);
passed++;console.log('PASS: 24 unique models moved without changing total catalog count');
const a=getProductById('lg-ultragear-27g411a-b')!, b=getProductById('lg-ultragear-27gs75q-b')!;
const rows=getComparisonRows([a,b]);
assert.equal(rows.find(r=>r.id==='Ekran:refreshRateHz')!.getRawNumber!(a),120);
assert.equal(rows.find(r=>r.id==='Ekran:refreshRateHz')!.getRawNumber!(b),180);
assert.match(a.highlights.join(' '),/hız aşırtma ile 144 Hz/);assert.match(b.highlights.join(' '),/hız aşırtma ile 200 Hz/);
passed++;console.log('PASS: standard 120/180 Hz values reach comparison; OC 144/200 is separately labeled');
for(const id of ['27g411a-b','27gs50f-b','24gq50f-b','32gn500-b','24gs50f-b']) assert.equal((getProductById('lg-ultragear-'+id)!.specs as Record<string,unknown>).responseTimeMs,5);
assert.equal((getProductById('lg-myview-32sr50f-w')!.specs as Record<string,unknown>).refreshRateHz,undefined);
passed++;console.log('PASS: 1 ms MBR is not stored as GtG; unverified smart-monitor refresh rate stays unknown');
assert.equal(getProductById('lg-lg-ultragear-27gl83ap-z'),null);
assert.equal(getProductById('lg-lg-myview-32sr50f-b'),null);
passed++;console.log('PASS: unknown model/color suffix never falls through to a nearby model');
console.log(`\nLG unique monitor moves: ${passed} PASS, 0 FAIL. Read-only data/resolver tests, not browser tests.`);
