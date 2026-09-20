import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup as render} from 'react-dom/server';
import {mockSmartwatches} from '../src/lib/mockSmartwatches';
import {getProductById,toCatalogProduct} from '../src/lib/data';
import {getStoredProducts} from '../src/lib/adminData';
import {getComparisonRows,getMetricOutcome} from '../src/lib/comparisonEvidence';
import {SMARTWATCH_SPEC_FIELDS,smartwatchProductSpecText} from '../src/lib/smartwatchSpecFields';
import {SmartwatchSpecSheet} from '../src/components/detail/SmartwatchSpecSheet';
import {ProductSpecSources} from '../src/components/detail/ProductSpecSources';
import {evaluateProductPricing} from '../src/lib/pricing/unifiedPriceEvaluator';
import type {Product} from '../src/lib/types';
const {checkPendingCatalogData}=require('./catalogDataReview.cjs');
const archive=JSON.parse(readFileSync('data/catalog_archives/forerunner965-trex3-technical-facts-2026-09-20.json','utf8'));
const review=JSON.parse(readFileSync('data/catalog_data_reviews.json','utf8'));
const ids=['garmin-forerunner-965','garmin-forerunner-965-titanium','amazfit-t-rex-3','amazfit-t-rex-3-outdoor-gps'];
const products=ids.map(id=>getProductById(id)!);
const field=(key:string)=>SMARTWATCH_SPEC_FIELDS.find(f=>f.paths.split('|').includes(key))!;
const display=(p:Product,key:string)=>smartwatchProductSpecText(p,field(key));
let passed=0;const test=(name:string,run:()=>void)=>{run();passed++;console.log('PASS '+name);};

test('Four exact identities remain; only reviewed technical fields and mode wording changed',()=>{
 assert.deepEqual(archive.original.map((p:any)=>p.id).sort(),[...ids].sort());assert.equal(mockSmartwatches.length,136);
 for(const p of products){const old=archive.original.find((o:any)=>o.id===p.id);assert.ok(p);assert.equal(getProductById(p.slug)!.id,p.id);
  for(const key of new Set([...Object.keys(old),...Object.keys(p)]))if(!['specs','highlights','fieldSources','specVerification'].includes(key))assert.deepEqual((p as any)[key],old[key],`${p.id}:${key}`);
  const changed=p.brand==='Garmin'?['batteryCapacityMah','batteryType','storageGb','batteryLifeDays','batteryLifeNote','caseSizeMm','weightGrams']:['hasNFC','hasNfc','batteryCapacityMah','batteryLifeDays','batteryLifeNote','nfcSupportNote'];
  for(const key of new Set([...Object.keys(old.specs),...Object.keys(p.specs!)]))if(!changed.includes(key))assert.deepEqual((p.specs as any)[key],old.specs[key],`${p.id}:specs.${key}`);
  const expected=old.highlights.map((h:string)=>h==='23 Gün Pil Ömrü'?'Akıllı saat modunda 23 güne kadar pil süresi':h==='27 Güne Varan Devasa Pil Ömrü & Çevrimdışı Harita Navigasyonu'?'Tipik kullanımda 27 güne kadar pil süresi & Çevrimdışı Harita Navigasyonu':h==='27 Güne Varan İnanılmaz Batarya Ömrü'?'Tipik kullanımda 27 güne kadar pil süresi':h);
  assert.deepEqual(p.highlights,expected);
 }
});
test('Conflicting Garmin capacities are archived and absent; sourced battery and memory facts agree',()=>{
 assert.deepEqual(archive.original.filter((p:any)=>p.brand==='Garmin').map((p:any)=>p.specs.batteryCapacityMah).sort(),[420,450]);
 for(const p of products.filter(p=>p.brand==='Garmin')){
  assert.equal((p.specs as any).batteryCapacityMah,undefined);assert.equal(display(p,'batteryCapacityMah'),'Bilinmiyor');
  assert.equal(display(p,'storageGb'),'32 GB');assert.equal(display(p,'caseSizeMm'),'47,1 mm');assert.equal(display(p,'weightGrams'),'53 g');
  assert.equal(display(p,'batteryType'),'Şarj edilebilir dahili lityum iyon');assert.equal(display(p,'batteryLifeDays'),'23 gün');
  assert.match(display(p,'batteryLifeNote'),/Akıllı saat modunda 23 güne kadar/);assert.match(display(p,'batteryLifeNote'),/GPS, müzik/);
 }
});
test('T-Rex generic variants do not assert either regional NFC boolean',()=>{
 const originals=archive.original.filter((p:any)=>p.brand==='Amazfit');
 assert.deepEqual(originals.map((p:any)=>p.specs.hasNFC??p.specs.hasNfc).sort(),[false,true]);
 for(const p of products.filter(p=>p.brand==='Amazfit')){
  assert.equal((p.specs as any).hasNfc,undefined);assert.equal((p.specs as any).hasNFC,undefined);assert.equal(display(p,'hasNfc'),'Bilinmiyor');
  assert.match(display(p,'nfcSupportNote'),/İtalya/);assert.match(display(p,'nfcSupportNote'),/Türkiye’de ödeme desteği doğrulanmadı/);
  assert.equal(display(p,'batteryCapacityMah'),'700 mAh');assert.equal(display(p,'batteryLifeDays'),'27 gün');
  assert.match(display(p,'batteryLifeNote'),/nominal/);assert.match(display(p,'batteryLifeNote'),/tipik kullanımda 27/);assert.match(display(p,'batteryLifeNote'),/yoğun kullanımda 13/);
 }
});
test('Exact pending paths stop import/build restoration, including false NFC',()=>{
 assert.equal(review.entries.length,400);assert.deepEqual(checkPendingCatalogData(getStoredProducts(),review.entries),[]);
 for(const p of products){const entry=review.entries.find((e:any)=>e.id===p.id);assert.ok(entry);assert.deepEqual(entry.fieldsAwaitingSource,p.specVerification!.unresolvedFields);
  const fields=p.brand==='Garmin'?['batteryCapacityMah']:['hasNfc','hasNFC'];
  for(const key of fields)for(const value of p.brand==='Garmin'?[420,450]:[false,true]){
   const wrong={...p,specs:{...p.specs,[key]:value}};
   assert.ok(checkPendingCatalogData([wrong],[entry]).some((e:string)=>e.includes(`${p.id}:specs.${key}`)));
  }
 }
});
test('Runtime projections cannot revive pending values through aliases; sibling facts stay visible',()=>{
 for(const p of products){const key=p.brand==='Garmin'?'batteryCapacityMah':'hasNfc';
  const wrong={...p,specs:{...p.specs,...(p.brand==='Garmin'?{batteryCapacityMah:450}:{hasNfc:true,hasNFC:true})}} as Product;
  for(const record of [wrong,toCatalogProduct(wrong)]){
   assert.equal(display(record,key),'Bilinmiyor');
   const row=getComparisonRows([record]).find(r=>r.label===(key==='hasNfc'?'NFC':'Batarya Kapasitesi'))!;
   assert.equal(row.getValue(record),'Bilinmiyor');
  }
  assert.equal(display(wrong,'batteryLifeDays'),p.brand==='Garmin'?'23 gün':'27 gün');
 }
});
test('Every sourced field exists, has the reviewed source and leaves missing fields unverified',()=>{
 for(const p of products){
  const declared=p.fieldSources!.flatMap(s=>s.fields);
  for(const s of p.fieldSources!){
   const observation=archive.observations.find((o:any)=>o.sourceUrl===s.sourceUrl);assert.ok(observation);assert.equal(s.checkedAt,observation.checkedAt);
   assert.ok(Date.parse(s.checkedAt)<=Date.now());assert.ok(s.fields.length>0);assert.ok(s.scopeNote);
   for(const key of s.fields){assert.ok(key.startsWith('specs.'));assert.notEqual((p.specs as any)[key.slice(6)],undefined);}
  }
  assert.ok(p.specVerification!.unresolvedFields.every(k=>!declared.includes(k)));
  assert.equal(p.sourceType,archive.original.find((o:any)=>o.id===p.id).sourceType);assert.equal(p.verifiedAt,undefined);
 }
});
test('Real source/spec components render unknowns, regional and battery conditions with usable source links',()=>{
 for(const p of products){const html=render(<><ProductSpecSources product={p}/><SmartwatchSpecSheet product={p}/></>);
  assert.match(html,/Teknik bilgi kaynakları/);assert.match(html,/Bilinmiyor/);assert.match(html,/Pil Süresi Koşulları/);assert.match(html,/min-h-11/);
  for(const s of p.fieldSources!)assert.ok(html.includes(s.sourceUrl.replace(/&/g,'&amp;')));
  if(p.brand==='Amazfit')assert.match(html,/Türkiye’de ödeme desteği doğrulanmadı/);else assert.match(html,/32 GB/);
 }
});
test('Battery modes and NFC notes do not create winners or imply current prices',()=>{
 for(const row of getComparisonRows(products.slice(0,2)).filter(r=>/Pil|Batarya|NFC/.test(r.label)))assert.equal(getMetricOutcome(row,products.slice(0,2)),'not_comparable');
 for(const p of products){assert.equal(evaluateProductPricing(p).currentPrice,null);assert.deepEqual(p.storeOffers,archive.original.find((o:any)=>o.id===p.id).storeOffers);}
});
console.log(`${passed} watch technical tests passed (catalog, real functions and SSR; not browser E2E).`);
