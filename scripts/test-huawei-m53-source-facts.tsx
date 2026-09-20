import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup as render} from 'react-dom/server';
import phones from '../src/lib/smartphonesData.json';
import {getProductById,toCatalogProduct} from '../src/lib/data';
import {PHONE_SPEC_FIELDS,phoneSpecText} from '../src/lib/smartphoneSpecFields';
import {ProductJsonLd} from '../src/components/seo/ProductJsonLd';
import {ProductSpecSources} from '../src/components/detail/ProductSpecSources';
import {buildProductMetadata,buildProductMetaDescription} from '../src/lib/seoHelper';
import {getComparisonRows,getMetricOutcome} from '../src/lib/comparisonEvidence';
import {evaluateProductPricing} from '../src/lib/pricing/unifiedPriceEvaluator';
import type {Product} from '../src/lib/types';

let passed=0;
function check(label:string,run:()=>void){run();passed++;console.log(`PASS: ${label}`);}
const archive=JSON.parse(readFileSync('data/catalog_archives/huawei-m53-source-facts-2026-09-20.json','utf8'));
const y=getProductById('huawei-y5ii')!,p=getProductById('huawei-pura-70-ultra')!,n=getProductById('huawei-nova-11-pro')!,m=getProductById('samsung-galaxy-m53-5g')!;
check('172 archived records preserve identities; original commercial data remains archived',()=>{
 assert.equal(archive.original.length,172);
 for(const old of archive.original){const current=phones.find(p=>p.id===old.id)!;
  assert.ok(current,old.id);
  for(const key of ['id','slug','name','brand','category'])assert.deepEqual((current as any)[key],old[key],`${old.id}:${key}`);
  if(old.brand!=='Huawei')assert.deepEqual(evaluateProductPricing(getProductById(current.id)!),evaluateProductPricing(old));
 }
});
check('Y5II manufacturer facts replace guessed modern hardware',()=>{
 assert.equal(phoneSpecText(y.specs,'screen.size'),'5 inç');
 assert.equal(phoneSpecText(y.specs,'memory.ramGb'),'1 GB');
 assert.equal(phoneSpecText(y.specs,'memory.storageGb'),'8 GB');
 assert.equal(phoneSpecText(y.specs,'battery.capacitymAh'),'2200 mAh');
 assert.equal(phoneSpecText(y.specs,'camera.selfieMp'),'2 MP');
 assert.equal(phoneSpecText(y.specs,'battery.chargingWatts'),'Bilinmiyor');
 assert.doesNotMatch(JSON.stringify(y.highlights),/50 MP|5000|HarmonyOS/);
});
check('Pura70Ultra uses the identified Singapore scope, not a generated combined capacity',()=>{
 assert.equal(phoneSpecText(p.specs,'screen.size'),'6,8 inç');
 assert.equal(phoneSpecText(p.specs,'screen.refreshRate'),'120 Hz');
 assert.equal(phoneSpecText(p.specs,'camera.selfieMp'),'13 MP');
 assert.equal(phoneSpecText(p.specs,'memory.storageGb'),'512 GB');
 assert.match(p.specVerification!.note,/Singapur/);
 const row=getComparisonRows([p,m]).find(r=>r.label==='Depolama')!;
 assert.equal(getMetricOutcome(row,[p,m]),'insufficient_data');
 assert.doesNotMatch(buildProductMetaDescription(p),/1 TB/);
});
check('nova11Pro preserves dual selfie cameras and leaves absent RAM unknown',()=>{
 assert.equal(phoneSpecText(n.specs,'screen.size'),'6,78 inç');
 assert.equal(phoneSpecText(n.specs,'screen.refreshRate'),'120 Hz');
 assert.equal(phoneSpecText(n.specs,'camera.selfieMp'),'60 MP ultra geniş + 8 MP portre');
 assert.equal(phoneSpecText(n.specs,'battery.chargingWatts'),'100 W');
 assert.equal(phoneSpecText(n.specs,'memory.ramGb'),'Bilinmiyor');
 assert.equal(phoneSpecText(n.specs,'memory.storageGb'),'256 GB');
});
check('M53 exact technical table resolves display/camera/connectivity conflicts',()=>{
 for(const [field,expected] of Object.entries({'screen.refreshRate':'120 Hz','screen.resolution':'1080 x 2400 (FHD+)','camera.ultrawideMp':'8 MP','camera.selfieMp':'32 MP','build.weightGrams':'176 g','connectivity.wifiStandard':'802.11 a/b/g/n/ac','connectivity.bluetooth':'5.2'}))assert.equal(phoneSpecText(m.specs,field),expected);
 for(const field of ['screen.brightnessNits','processor.antutuScore','processor.process','battery.wirelessCharging','build.waterResistance'])assert.equal(phoneSpecText(m.specs,field),'Bilinmiyor');
 assert.equal((m.specs as any).camera.dxomarkScore,undefined);
 assert.doesNotMatch(JSON.stringify(m.highlights),/Garantili/);
});
check('All four source scopes and unresolved notices are visible',()=>{
 for(const current of [y,p,n,m]){
  const html=render(<ProductSpecSources product={current}/>);
  assert.match(html,/Teknik bilgi kaynakları/);assert.match(html,/tüm ürünün doğrulandığı anlamına gelmez/);
  assert.ok(current.fieldSources!.some(s=>s.fields.length>10));
  assert.ok(html.includes(current.fieldSources!.at(-1)!.sourceUrl.replace(/&/g,'&amp;')));
 }
});
check('Listing preserves readable nested and flat fields without upgrading their schema',()=>{
 for(const current of [y,p,n,m]){
  const projected=toCatalogProduct(current);
  for(const field of PHONE_SPEC_FIELDS)assert.equal(phoneSpecText(projected.specs,field),phoneSpecText(current.specs,field),`${current.id}:${field.label}`);
  assert.deepEqual(projected.specVerification,current.specVerification);
 }
});
check('Pending photographs cannot masquerade as product images in SEO',()=>{
 const raw=phones.find(p=>p.image==='/images/product-unverified.svg')!;
 const current=raw as unknown as Product;
 const html=render(<ProductJsonLd product={current}/>);
 const schema=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)![1]);
 assert.equal(schema.image,undefined);
 const og=buildProductMetadata(current,'phones').openGraph as any;
 assert.deepEqual(og.images,[{url:'https://www.aceleetme.tech/icon.png',alt:'aceleEtme'}]);
 const real=render(<ProductJsonLd product={n}/>);assert.ok(real.includes(n.image));
});
console.log(`\nHuawei/M53 facts: ${passed} PASS (catalog, functions and server render; not browser E2E).`);
