import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {getProductById} from '../src/lib/data';
import {getComparisonRows} from '../src/lib/comparisonEvidence';
const archive=JSON.parse(readFileSync('data/catalog_archives/lg-final-three-facts-2026-09-20.json','utf8'));
for(const entry of archive.records){
 const p=getProductById(entry.id)!;assert.ok(p);assert.equal(p.category,'monitors');
 for(const key of ['basePrice','storeOffers','priceHistory','rating','reviewCount','image','images','slug','verifiedAt']) assert.deepEqual((p as unknown as Record<string,unknown>)[key],entry.original[key]);
 assert.ok(p.fieldSources?.some(s=>s.sourceUrl===entry.sourceUrl && s.fields.includes(entry.fields[0])));
}
const g6=getProductById('lg-ultragear-27g610a-b')!,wide=getProductById('lg-ultrawide-29wq600-w')!,gx=getProductById('lg-ultragear-27gx790b-b')!;
const rows=getComparisonRows([g6,wide]);
assert.equal(rows.find(r=>r.id==='Ekran:brightnessNits')!.getRawNumber!(g6),400);
assert.match(rows.find(r=>r.id==='Ekran:hdrSupport')!.getValue(g6),/DisplayHDR 400/);
assert.match(rows.find(r=>r.id==='Bağlantı ve Ergonomi:syncTechnology')!.getValue(g6),/FreeSync Premium/);
console.log('PASS 27G610A-B: corrected 400 nit/HDR 400/FreeSync Premium reach comparison');
assert.match(rows.find(r=>r.id==='Ekran:responseTimeMs')!.getValue(wide),/5 ms/);
assert.match(wide.name,/5ms GtG/);assert.match(wide.highlights.join(' '),/1 ms MBR ayrı/);
assert.equal(wide.releaseYear,2022);
console.log('PASS 29WQ600-W: 5 ms GtG, separately labeled MBR, corrected model year');
const ports=rows.find(r=>r.id==='Bağlantı ve Ergonomi:ports')!.getValue(gx);
assert.doesNotMatch(ports,/DTS/);assert.match(ports,/USB-C/);assert.match(ports,/4 kutuplu/);
console.log('PASS 27GX790B-B: physical ports include USB-C and audio jack, no audio codec as port');
console.log('PASS all 3 models: identities and commercial data preserved');
console.log('Final LG facts: 4 PASS, 0 FAIL. Read-only data/adapter tests, not browser tests.');
