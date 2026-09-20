import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import React from 'react';
import {renderToStaticMarkup as render} from 'react-dom/server';
import {NextRequest} from 'next/server';
import phones from '../src/lib/smartphonesData.json';
import {getProductById, toCatalogProduct, filterSmartphones} from '../src/lib/data';
import {saveProduct, deleteProduct, getStoredProducts} from '../src/lib/adminData';
import {GET as compareApi} from '../src/app/api/compare/route';
import {evaluateProductPricing} from '../src/lib/pricing/unifiedPriceEvaluator';
import {ProductPriceSummary} from '../src/components/detail/ProductPriceSummary';
import {ProductSpecSources} from '../src/components/detail/ProductSpecSources';
import {ProductJsonLd} from '../src/components/seo/ProductJsonLd';
import {getProductReleaseYear, getHistoricalRetroContext} from '../src/lib/releaseYearFilter';
import {getProductColorList} from '../src/lib/colorVariantHelper';
import {getComparisonRows, getMetricOutcome} from '../src/lib/comparisonEvidence';
import {phoneSpecText} from '../src/lib/smartphoneSpecFields';
import {getSpecVerificationNotice} from '../src/lib/specVerification';
import type {Product} from '../src/lib/types';
const {checkPendingCatalogData}=require('./catalogDataReview.cjs');
const archive=JSON.parse(readFileSync('data/catalog_archives/huawei-generated-data-2026-09-20.json','utf8'));
const review=JSON.parse(readFileSync('data/catalog_data_reviews.json','utf8'));
// This suite owns the archived Huawei group; other category reviews are checked
// by their own suites and the all-catalog pre-deploy/import guard.
const huaweiIds=new Set(archive.original.map((p:any)=>p.id));
const huaweiReviews=review.entries.filter((e:any)=>huaweiIds.has(e.id));
let passed=0;
async function check(label:string,run:()=>unknown){await run();passed++;console.log('PASS: '+label);}
async function main(){
await check('All 396 original records retained; every catalog identity still resolves',()=>{
 assert.equal(archive.original.length,396);assert.equal(huaweiReviews.length,396);
 for(const old of archive.original){const p=phones.find(p=>p.id===old.id)!;assert.ok(p);
  for(const key of ['id','slug','name','brand','category'])assert.equal((p as any)[key],old[key]);
  assert.equal(getProductById(old.id)!.id,p.id);assert.equal(getProductById(old.slug)!.id,p.id);
 }
});
await check('390 technical records remain explicitly incomplete, never counted as corrected',()=>{
 const incomplete=phones.filter(p=>p.brand==='Huawei'&&!Object.keys(p.specs).length);
 assert.equal(incomplete.length,390);
 assert.deepEqual(incomplete.map(p=>p.id).sort(),review.entries.filter((e:any)=>e.fieldsAwaitingSource.includes('specs')).map((e:any)=>e.id).sort());
 for(const p of incomplete){assert.match(getSpecVerificationNotice(p as unknown as Product)!,/doğrulaması bekliyor/);assert.equal(p.highlights?.length,0);}
});
await check('Pending fields cannot silently regain prices, ratings, stock, history or specs',()=>{
 assert.deepEqual(checkPendingCatalogData(phones,huaweiReviews),[]);
 const first=review.entries.find((e:any)=>e.fieldsAwaitingSource.includes('specs'));
 for(const [field,value] of Object.entries({basePrice:2479,rating:4.8,reviewCount:999,releaseYear:2024,specs:{battery:'2100 mAh'},storeOffers:[{price:2499,inStock:true}],priceHistory:[{price:2500,date:'2026-09-01'}]})){
  const next=structuredClone(phones) as any[];next.find(p=>p.id===first.id)[field]=value;
  assert.ok(checkPendingCatalogData(next,huaweiReviews).some((e:string)=>e.includes(first.id+':'+field)),field);
 }
});
await check('Known synthetic values cannot leak through pricing, listing, schema or sources',()=>{
 const p=getProductById('huawei-mate-40-rs-porsche-design')!;
 for(const product of [p,toCatalogProduct(p)]){const price=evaluateProductPricing(product);assert.equal(price.displayPrice,null);assert.equal(price.currentPrice,null);}
 const priceHtml=render(<ProductPriceSummary product={p}/>);assert.match(priceHtml,/Fiyat bilgisi yok/);assert.doesNotMatch(priceHtml,/2\.479|89\.999|Katalog Referans/);
 const schema=render(<ProductJsonLd product={p}/>);assert.doesNotMatch(schema,/"offers"|"aggregateRating"/);
 assert.match(render(<ProductSpecSources product={p}/>),/kaynak doğrulaması bekliyor/);
 assert.equal(phoneSpecText(p.specs,'battery.capacitymAh'),'Bilinmiyor');
 assert.deepEqual(getProductColorList(p),[]);
});
await check('Pura70Pro manufacturer facts fill one exact model; ambiguous duplicate remains pending',()=>{
 const p=getProductById('huawei-pura-70-pro')!;
 for(const [field,expected] of Object.entries({'screen.refreshRate':'120 Hz','memory.ramGb':'12 GB','memory.storageGb':'512 GB','processor.chip':'Kirin 9010','camera.ultrawideMp':'12.5 MP','camera.selfieMp':'13 MP','battery.capacitymAh':'5.050 mAh','battery.chargingWatts':'100 W','battery.wirelessWatts':'80 W','build.weightGrams':'220 g'}))assert.equal(phoneSpecText(p.specs,field),expected,field);
 assert.match(p.image,/verified\/huawei-huawei-pura-70-pro\.png/);
 assert.match(p.fieldSources![0].scopeNote!,/Singapur/);
 assert.deepEqual(getProductById('huawei-pura-70-pro-1')!.specs,{});
 const mate=getProductById('huawei-mate-40-rs-porsche-design')!;
 const battery=getComparisonRows([p,mate]).find(r=>r.label.includes('Batarya Kapasitesi'))!;
 assert.ok(battery);assert.equal(getMetricOutcome(battery,[p,mate]),'insufficient_data');
});
await check('Names cannot fabricate release years or claim discontinued retail availability',()=>{
 for(const name of ['Huawei Y5II','Huawei Mate 70','Huawei P60 Pro'])assert.equal(getProductReleaseYear({name}),null);
 assert.equal(getProductReleaseYear({name:'Known model',releaseYear:2016}),2016);
 const context=getHistoricalRetroContext({name:'Unknown'});assert.equal(context.releaseYear,null);
 assert.doesNotMatch(context.availabilityNotice,/satışı tamamlanmıştır/);
});
await check('Unknown prices never qualify as budget matches; price sorts put them last',async()=>{
 for(const sortBy of ['priceAsc','priceDesc'] as const){const items=await filterSmartphones({brand:['Huawei'],sortBy});assert.equal(items.length,396);assert.ok(items.every(p=>evaluateProductPricing(p).displayPrice===null));}
 assert.equal((await filterSmartphones({brand:['Huawei'],maxPrice:50000})).length,0);
});
await check('Legacy price writers stop before file, network or module access',()=>{
 for(const f of ['scrape2026Prices.js','calibratePrices.js','syncBasePrices.js']){
  let io=false;assert.throws(()=>runInNewContext(readFileSync('scripts/'+f,'utf8'),{require(){io=true;throw Error('Unexpected IO');}}),/devre dışı/);assert.equal(io,false,f);
 }
});
await check('Compare API uses fresh direct offers only; base/unknown stock/search/stale rejected',async()=>{
 const snapshot=getStoredProducts().map(p=>p.id);const base=getProductById('huawei-pura-70-pro')!;
 const fixture={...base,id:'test-quarantine-compare-api',slug:'test-quarantine-compare-api',name:'Quarantinex Fixturezx (512 GB)',brand:'Quarantinex',basePrice:50000};
 assert.ok(!snapshot.includes(fixture.id));
 const offer={storeName:'Hepsiburada',storeLogo:'',url:'https://www.hepsiburada.com/test-p-HB0001',price:42000,inStock:true,lastCheckedAt:new Date(Date.now()-3600000).toISOString()};
 try{
  for(const offers of [[],[{...offer,inStock:undefined}],[{...offer,url:'https://www.hepsiburada.com/ara?q=test'}],[{...offer,lastCheckedAt:new Date(Date.now()-48*3600000).toISOString()}],[offer]]){
   await saveProduct({...fixture,storeOffers:offers});
   const response=await compareApi(new NextRequest('http://localhost/api/compare?q=Quarantinex%20Fixturezx%20512GB'));const body=await response.json();
   if(offers[0]===offer)assert.equal(body.match?.bestPrice,42000);else assert.equal(body.match,null);
  }
 }finally{await deleteProduct(fixture.id);assert.deepEqual(getStoredProducts().map(p=>p.id),snapshot);}
});
console.log(`\nCatalog quarantine: ${passed} PASS (real functions, local process API handler and server render; not browser E2E).`);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
