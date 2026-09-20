import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';
import { getProductById, toCatalogProduct } from '../src/lib/data';
import { phoneSpecText } from '../src/lib/smartphoneSpecFields';
import { ProductSpecSources } from '../src/components/detail/ProductSpecSources';
import { getComparisonRows, getMetricOutcome } from '../src/lib/comparisonEvidence';
import { evaluateProductPricing } from '../src/lib/pricing/unifiedPriceEvaluator';

let passed=0;
const check=(name:string,run:()=>void)=>{run();passed++;console.log(`PASS: ${name}`);};
const product=getProductById('redmi-k90-pro-max-5g-512-gb')!;
const original=JSON.parse(readFileSync('data/catalog_archives/redmi-source-facts-2026-09-20.json','utf8')).original;
check('Exact Redmi model and commercial data remain intact',()=>{
 for(const key of ['id','slug','name','basePrice','image','images','storeOffers','priceHistory','rating','epeyScore','reviewCount']) assert.deepEqual((product as any)[key],original[key],key);
});
check('Manufacturer metadata corrects only supported screen and battery facts',()=>{
 assert.equal(phoneSpecText(product.specs,'screen.size'),'6,9 inç');
 assert.equal(phoneSpecText(product.specs,'battery.capacitymAh'),'7.560 mAh');
 assert.equal(phoneSpecText(product.specs,'build.waterResistance'),'IP68');
 assert.equal(phoneSpecText(product.specs,'memory.storageGb'),'512 GB');
 const source=product.fieldSources!.find(s=>s.sourceUrl==='https://www.mi.com/prod/redmi-k90-pro-max/specs')!;
 assert.deepEqual(source.fields,['specs.screenSize','specs.batteryCapacity','specs.waterResistance']);
 assert.match(source.scopeNote!,/Çin/);
});
check('Unverified marketing assertions no longer appear as highlights or editorial verdicts',()=>{
 const legacy=product as typeof product & {pros?:string[];cons?:string[]};
 assert.doesNotMatch(JSON.stringify([legacy.highlights,legacy.pros,legacy.cons]),/144Hz|6500|120W|2nm|Plastik/);
 assert.deepEqual(legacy.pros,[]);assert.deepEqual(legacy.cons,[]);
});
check('Partial evidence is visible without implying verified Turkey variant or all specs',()=>{
 const html=render(<ProductSpecSources product={product}/>);
 assert.match(html,/Teknik bilgi kaynakları/);assert.match(html,/mi.com/);
 assert.match(html,/Türkiye satıcı varyantı henüz doğrulanmadı/);
 assert.match(html,/tüm ürünün doğrulandığı anlamına gelmez/);
});
check('Listing retains sourced values and unresolved field notice',()=>{
 const projected=toCatalogProduct(product);
 assert.equal(phoneSpecText(projected.specs,'battery.capacitymAh'),'7.560 mAh');
 assert.deepEqual(projected.specVerification,product.specVerification);
});
check('Partial metadata does not silently promote legacy numbers into metric winners',()=>{
 const samsung=getProductById('samsung-galaxy-s25')!;
 for(const label of ['RAM Kapasitesi','Depolama','Batarya Kapasitesi']) {
  const row=getComparisonRows([product,samsung]).find(r=>r.label===label)!;
  assert.equal(getMetricOutcome(row,[product,samsung]),'insufficient_data');
 }
});
check('Technical source check does not refresh any commercial offer',()=>{
 const now=Date.now();assert.deepEqual(evaluateProductPricing(product,now),evaluateProductPricing(original,now));
});
console.log(`\nRedmi partial source facts: ${passed} PASS (functions + server rendering; not browser E2E).`);
