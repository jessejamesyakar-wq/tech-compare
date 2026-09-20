import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup as render} from 'react-dom/server';
import phones from '../src/lib/smartphonesData.json';
import {getProductById,toCatalogProduct} from '../src/lib/data';
import {phoneSpecText,PHONE_SPEC_FIELDS} from '../src/lib/smartphoneSpecFields';
import {ProductSpecSources} from '../src/components/detail/ProductSpecSources';
import {ProductJsonLd} from '../src/components/seo/ProductJsonLd';
import {evaluateProductPricing} from '../src/lib/pricing/unifiedPriceEvaluator';
import {getComparisonRows,getMetricOutcome} from '../src/lib/comparisonEvidence';
const archive=JSON.parse(readFileSync('data/catalog_archives/mate40-p40-source-facts-2026-09-20.json','utf8'));
const images=JSON.parse(readFileSync('data/catalog_image_sources.json','utf8'));
const reviews=JSON.parse(readFileSync('data/catalog_data_reviews.json','utf8'));
const mate=getProductById('huawei-mate-40-pro')!,p40=getProductById('huawei-p40-pro')!,rs=getProductById('huawei-mate-40-rs-porsche-design')!;
let passed=0;const check=(name:string,run:()=>void)=>{run();passed++;console.log('PASS: '+name);};
check('The three archived models preserve identity and commercial records',()=>{
 const ids=archive.original.map((p:any)=>p.id);assert.equal(ids.length,3);
 for(const old of archive.original){const p=phones.find(p=>p.id===old.id)!;
  const allowed=old.id===rs.id?['image','images']:['image','images','specs','highlights','specVerification','fieldSources'];
  for(const key of new Set([...Object.keys(old),...Object.keys(p)]))if(!allowed.includes(key))assert.deepEqual((p as any)[key],old[key],old.id+':'+key);
 }
});
check('Mate40Pro uses 90Hz refresh (not 240Hz touch sampling), exact chip, memory and battery',()=>{
 for(const [field,expected] of Object.entries({'screen.size':'6,76 inç','screen.refreshRate':'90 Hz','screen.resolution':'2772 x 1344','processor.chip':'Kirin 9000','memory.ramGb':'8 GB','memory.storageGb':'256 GB','battery.capacitymAh':'4.400 mAh','battery.chargingWatts':'66 W','battery.wirelessWatts':'50 W','camera.ultrawideMp':'20 MP','camera.selfieMp':'13 MP + 3D derinlik sensörü','build.weightGrams':'212 g'}))assert.equal(phoneSpecText(mate.specs,field),expected,field);
 assert.match(mate.specVerification!.note,/Tayland NOH-NX9/);
 assert.equal(mate.fieldSources![0].sourceUrl,'https://consumer.huawei.com/th/offer/shopee/mate40-pro/specs/');
});
check('P40Pro has its own display, camera, battery, wireless power and NM card scope',()=>{
 for(const [field,expected] of Object.entries({'screen.size':'6,58 inç','screen.refreshRate':'90 Hz','screen.resolution':'2640 x 1200','processor.chip':'Kirin 990 5G','memory.ramGb':'8 GB','memory.storageGb':'256 GB','battery.capacitymAh':'4.200 mAh','battery.chargingWatts':'40 W','battery.wirelessWatts':'27 W','camera.ultrawideMp':'40 MP','camera.selfieMp':'32 MP + derinlik sensörü','connectivity.bluetooth':'5.1','build.weightGrams':'209 g'}))assert.equal(phoneSpecText(p40.specs,field),expected,field);
 assert.match(p40.specVerification!.note,/Kenya/);assert.match(p40.specVerification!.note,/512 GB Huawei NM kart/);
 assert.equal(p40.fieldSources![0].sourceUrl,'https://consumer.huawei.com/ke/phones/p40-pro/specs/');
});
check('Model relatives and ambiguous duplicates never inherit these specifications',()=>{
 for(const slug of ['huawei-mate-40-pro-4g','huawei-p40-pro-1','huawei-mate-40e','huawei-mate-40-rs-porsche-design'])assert.deepEqual(getProductById(slug)!.specs,{},slug);
 assert.ok(reviews.entries.find((e:any)=>e.id===rs.id).fieldsAwaitingSource.includes('specs'));
 const row=getComparisonRows([mate,rs]).find(r=>r.label==='Batarya Kapasitesi')!;assert.ok(row);assert.equal(getMetricOutcome(row,[mate,rs]),'insufficient_data');
});
check('Missing benchmarks, eSIM and current software status stay unknown; sources render with limitations',()=>{
 for(const p of [mate,p40]){
  for(const field of ['screen.ppi','screen.brightnessNits','processor.process','processor.antutuScore'])assert.equal(phoneSpecText(p.specs,field),'Bilinmiyor',field);
  assert.equal((p.specs as any).connectivity.hasesim,undefined);assert.equal(p.releaseYear,undefined);
  assert.match(phoneSpecText(p.specs,'software.osName'),/ilk sürüm/);
  const html=render(<ProductSpecSources product={p}/>);assert.match(html,/Türkiye satıcı varyantı/);assert.match(html,/mevcut güncelleme durumu değildir/);assert.ok(html.includes(p.fieldSources![0].sourceUrl));
  assert.ok(p.specVerification!.unresolvedFields.includes('specs.connectivity.hasesim'));
 }
});
check('Images have distinct official model evidence; RS photo does not imply verified specifications',()=>{
 for(const p of [mate,p40,rs]){const evidence=images.entries.find((e:any)=>e.id===p.id);assert.ok(evidence);assert.equal(p.image,evidence.imagePath);assert.match(evidence.sourcePageUrl,/^https:\/\/consumer\.huawei\.com\//);assert.ok(!images.pending.some((e:any)=>e.id===p.id));}
 assert.equal(new Set([mate,p40,rs].map(p=>p.image)).size,3);
 assert.match(rs.specVerification!.note,/doğrulaması bekliyor/);
});
check('Real listing and comparison functions preserve the exact source fields and missing prices',()=>{
 for(const p of [mate,p40]){
  const projected=toCatalogProduct(p);for(const field of PHONE_SPEC_FIELDS)assert.equal(phoneSpecText(projected.specs,field),phoneSpecText(p.specs,field));
  assert.equal(evaluateProductPricing(p).currentPrice,null);assert.equal(evaluateProductPricing(p).displayPrice,null);
  assert.doesNotMatch(render(<ProductJsonLd product={p}/>),/"offers"|"aggregateRating"/);
  const pending=reviews.entries.find((e:any)=>e.id===p.id).fieldsAwaitingSource;assert.ok(!pending.includes('specs'));assert.ok(pending.includes('basePrice'));assert.ok(pending.includes('storeOffers'));
 }
 const row=getComparisonRows([mate,p40]).find(r=>r.label==='Yenileme Hızı')!;assert.ok(row);assert.equal(getMetricOutcome(row,[mate,p40]),'tie');
});
console.log(`\nMate40/P40 source facts: ${passed} PASS (catalog, real functions and server render; not browser E2E).`);
