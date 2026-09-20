import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';
import { getProductById, toCatalogProduct } from '../src/lib/data';
import { getComparisonRows, getMetricOutcome } from '../src/lib/comparisonEvidence';
import { hasUnresolvedSpecField, getSpecVerificationNotice } from '../src/lib/specVerification';
import { getConsoleSpecSummary, getConsoleSpecRows } from '../src/lib/productPresentation';
import { ProductSpecSources } from '../src/components/detail/ProductSpecSources';
import { CompareVerdictCard } from '../src/components/compare/CompareVerdictCard';
import { evaluateProductPricing } from '../src/lib/pricing/unifiedPriceEvaluator';
import type { Product } from '../src/lib/types';

let passed=0;
function check(label:string, fn:()=>void) { fn(); passed++; console.log(`PASS: ${label}`); }
const archive=JSON.parse(readFileSync('data/catalog_archives/msi-hp-source-facts-2026-09-20.json','utf8'));
const records:Product[]=archive.original.map((record:any)=>getProductById(record.product.id)!);
assert.equal(records.length,3);assert.ok(records.every(Boolean));
check('All exact products retain identity, commercial data and original archives',()=>{
 for(let i=0;i<records.length;i++) {
  const old=archive.original[i].product,p=records[i];
  for(const key of ['id','slug','name','basePrice','storeOffers','priceHistory','rating','reviewCount','epeyScore','image','images','sourceType','verifiedAt'])
   assert.deepEqual((p as any)[key],old[key],`${p.id}: ${key}`);
 }
});
for(const [sku,storage,host] of [['088TR',512,'www.teknosa.com'],['089TR',1024,'www.vatanbilgisayar.com']] as const) {
 check(`${sku}: exact SKU capacity has a direct source; no inherited 1 TB or fabricated gameplay metrics`,()=>{
  const p=records.find(p=>p.name.includes(sku))!,s=p.specs as any;
  assert.equal(s.storageGb,storage);assert.equal(s.ramGb,16);
  assert.equal(new URL(p.sourceUrl!).hostname,host);
  assert.ok(p.fieldSources?.some(f=>f.sourceUrl===p.sourceUrl && f.fields.includes('specs.storageGb')));
  assert.equal(s.fps,undefined);assert.equal(s.tflops,undefined);assert.equal(s.hdr,undefined);assert.equal(s.hdmi,undefined);
  assert.match(s.ports[0],/Thunderbolt 4/);
  assert.match(getConsoleSpecSummary(p),new RegExp(`${storage} GB`));
  if(storage===512)assert.doesNotMatch(getConsoleSpecSummary(p),/1 TB|1024 GB/);
  const html=render(<ProductSpecSources product={p}/>);
  assert.match(html,/Teknik bilgi kaynakları/);assert.match(html,/tüm ürünün doğrulandığı anlamına gelmez/);
  assert.ok(html.includes(host));
 });
}
const hp=records.find(p=>p.category==='laptops')!;
check('Console details show Turkish labels and units, preserving false and zero',()=>{
 const rows=getConsoleSpecRows({storageGb:512,ramGb:16,weightKg:0.675,batteryCapacityWh:53,adapterWatts:65,hdr:false,tflops:0,subCategory:'handheld_console'});
 assert.deepEqual(rows.map(({label,value})=>[label,value]),[
  ['Depolama','512 GB'],['RAM','16 GB'],['Ağırlık','0,675 kg'],['Batarya Kapasitesi','53 Wh'],['Güç Adaptörü','65 W'],['HDR','Yok'],['Kayıtlı İşlem Gücü','0 TFLOPs'],['Konsol Türü','Taşınabilir Konsol']
 ]);
});
check('HP non-configurable hardware follows exact C12CSEA manufacturer page',()=>{
 const s=hp.specs as any;
 assert.match(s.gpu,/RTX 5060/);assert.equal(s.screenResolution,'1920 x 1200 (16:10 IPS)');
 assert.equal(s.refreshRateHz,144);assert.equal(s.batteryCapacityWh,70);assert.equal(s.weightKg,2.44);
 assert.doesNotMatch(JSON.stringify(s.ports),/Thunderbolt|USB4/);
 for(const field of ['gpuTgpWatts','muxSwitch','batteryLifeHours','bodyMaterial'])assert.equal(s[field],undefined);
});
check('HP reseller RAM/OS conflict is visible and does not overwrite variant identity',()=>{
 assert.equal((hp.specs as any).ramGb,64);
 assert.match(getSpecVerificationNotice(hp)!,/32 GB RAM ve FreeDOS/);
 assert.match(render(<ProductSpecSources product={hp}/>),/64 GB.*Windows 11 Pro/);
 assert.ok(!hp.fieldSources?.some(f=>f.fields.includes('specs.ramGb')||f.fields.includes('specs.os')));
 assert.match((hp.specs as any).os,/Doğrulanmadı/);
});
check('Unverified RAM cannot win, even when numeric; independently sourced storage remains comparable',()=>{
 const other={...hp,id:'fixture-other',name:'Fixture',specVerification:undefined,specs:{...hp.specs,ramGb:16,storageGb:512}} as Product;
 const rows=getComparisonRows([hp,other]);
 assert.equal(getMetricOutcome(rows.find(r=>r.label==='RAM')!,[hp,other]),'insufficient_data');
 assert.equal(getMetricOutcome(rows.find(r=>r.label==='Depolama')!,[hp,other]),1);
 assert.match(render(<CompareVerdictCard products={[hp,other]}/>),/satıcı doğrulaması bekleniyor/);
});
check('Listing projection retains variant warning and does not share mutable metadata arrays',()=>{
 const projected=toCatalogProduct(hp);
 assert.deepEqual(projected.specVerification,hp.specVerification);
 assert.notEqual(projected.specVerification,hp.specVerification);
 assert.notEqual(projected.specVerification!.unresolvedFields,hp.specVerification!.unresolvedFields);
});
check('Unresolved fields are path bounded and also cover parent records',()=>{
 const p={...hp,specVerification:{note:'Fixture',unresolvedFields:['specs.memory.ramGb']}};
 assert.equal(hasUnresolvedSpecField(p,'memory.ramGb'),true);
 assert.equal(hasUnresolvedSpecField(p,'memory'),true);
 assert.equal(hasUnresolvedSpecField(p,'memory.storageGb'),false);
 assert.equal(hasUnresolvedSpecField(p,'memory.ramGbExtra'),false);
 p.specVerification.unresolvedFields=['memory'];assert.equal(hasUnresolvedSpecField(p,'memory.ramGb'),true);
});
check('Unsafe source links are not rendered',()=>{
 const p={...hp,specVerification:undefined,fieldSources:[{fields:['specs.ramGb'],sourceUrl:'javascript:alert(1)',checkedAt:new Date().toISOString()}]};
 assert.equal(render(<ProductSpecSources product={p}/>),'');
});
check('Technical evidence cannot renew or create a current store offer',()=>{
 const now=Date.now();
 for(let i=0;i<records.length;i++)assert.deepEqual(evaluateProductPricing(records[i],now),evaluateProductPricing(archive.original[i].product,now));
});
console.log(`\nMSI/HP source facts: ${passed} PASS (functions + React server rendering; not browser E2E).`);
