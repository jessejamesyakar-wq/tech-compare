import assert from 'node:assert/strict';
import fs from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getObservedPriceHistory } from '../src/lib/pricing/priceHistoryEvidence';
import { catalogPriceRecords, createPriceObservation, readPriceRecord } from '../src/lib/pricing/priceRecordEvidence';
import { PriceNormalizer } from '../src/lib/pricing/priceNormalizer';
import { calculatePriceSignal } from '../src/lib/priceSignal';
import { PriceHistoryChart } from '../src/components/detail/PriceHistoryChart';
import { I18nProvider } from '../src/lib/i18n/context';
import { PriceAnomalyGuard } from '../src/lib/security/priceAnomalyGuard';
import { getProductById, getTVById, toCatalogProduct } from '../src/lib/data';
import type { Product, PriceHistoryPoint, StoreOffer } from '../src/lib/types';
import type { DbPrice } from '../src/lib/db/priceRepository';
import { execute2026PriceScrape } from '../src/lib/scraper/livePriceScraper2026';
import { GET as retiredScraperRoute } from '../src/app/api/cron/scrape-2026-prices/route';
import { NextRequest } from 'next/server';

// Pure fixture transformations + actual React server rendering. No catalog writes,
// repository upserts, database requests, scraped data or browser claims.
const now=Date.now(),ago=(h:number)=>new Date(now-h*3600000).toISOString();
const point=(h:number,price=48000):PriceHistoryPoint=>({date:ago(h),observedAt:ago(h),price,store:'Fixture',sourceType:'observed',sourceUrl:'https://example.com/products/a',currency:'TRY'});
const offer:StoreOffer={storeName:'Fixture',price:42000,url:'https://example.com/products/a',inStock:true,lastCheckedAt:ago(2)};
const product={id:'fixture',name:'Fixture',category:'smartphones',basePrice:50000,storeOffers:[offer],priceHistory:[point(480),point(24,45000)],specs:{}} as unknown as Product;
const record:DbPrice={id:'fixture',productId:'fixture',storeId:'fixture',storeProductId:'sku',price:42000,totalPrice:42000,shippingPrice:null,currency:'TRY',stockStatus:'IN_STOCK',sellerName:'Fixture',url:offer.url!,isAnomaly:false,checkedAt:ago(2)};
let passed=0;function check(label:string,fn:()=>void){fn();passed++;console.log('PASS: '+label);}
const graph=(data:PriceHistoryPoint[])=>renderToStaticMarkup(<I18nProvider><PriceHistoryChart data={data} currency="TL"/></I18nProvider>);

check('Bare generated date/price pairs are not observations',()=>assert.deepEqual(getObservedPriceHistory([{date:ago(480),price:57000},{date:ago(24),price:50000}],now),[]));
for(const [name,change] of Object.entries({synthetic:{sourceType:'synthetic'},unverified:{sourceType:'unverified'},missingSource:{sourceUrl:undefined},search:{sourceUrl:'https://example.com/search?q=a'},homepage:{sourceUrl:'https://example.com/'},unsafe:{sourceUrl:'javascript:alert(1)'},missingStore:{store:''},missingTime:{observedAt:undefined},mismatch:{observedAt:ago(3)},future:{date:ago(-1),observedAt:ago(-1)},invalid:{date:'2026-02-30',observedAt:'2026-02-30'},currency:{currency:'USD'},infinite:{price:Infinity},negative:{price:-1}})){
 check('Rejects history '+name,()=>assert.equal(getObservedPriceHistory([{...point(2),...change} as PriceHistoryPoint],now).length,0));
}
check('Valid points sort without mutating input and projection preserves proof',()=>{const data=[point(2),point(480)];const before=JSON.stringify(data);assert.deepEqual(getObservedPriceHistory(data,now),[data[1],data[0]]);assert.equal(JSON.stringify(data),before);assert.deepEqual(toCatalogProduct({...product,priceHistory:data}).priceHistory,data);});
check('Duplicate observations cannot inflate evidence and conflicting prices are rejected',()=>{const p=point(2);assert.equal(getObservedPriceHistory([p,p],now).length,1);assert.equal(getObservedPriceHistory([p,{...p,price:1},p],now).length,0);});
check('Synthetic series cannot generate an apparent purchase opportunity',()=>{const r=calculatePriceSignal({...product,priceHistory:product.priceHistory.map(({date,price})=>({date,price}))});assert.equal(r.status,'insufficient_data');assert.equal(r.dataPointsCount,0);});
check('Sourced real span remains usable',()=>assert.equal(calculatePriceSignal(product).status,'buy_now'));
check('Actual chart renders missing evidence instead of synthetic trend',()=>{const h=graph(product.priceHistory.map(({date,price})=>({date,price})));assert.match(h,/Yetersiz Doğrulanmış Veri/);assert.doesNotMatch(h,/Gözlem Verisi|Kaynaklı Fiyat Geçmişi/);});
check('Two stores at the same instant cannot invent a one-day trend',()=>assert.match(graph([point(2),{...point(2),store:'Other'}]),/Yetersiz Doğrulanmış Veri/));
check('Actual chart retains valid observed points',()=>{const h=graph(product.priceHistory);assert.match(h,/2 gözlem noktası/);assert.doesNotMatch(h,/Yetersiz Doğrulanmış Veri/);});
check('Synthetic history cannot skew anomaly baseline',()=>assert.equal(PriceAnomalyGuard.calculateBaseline({basePrice:100,priceHistory:[{date:ago(24),price:10000},{date:ago(48),price:10000}]}),100));
check('Catalog reads preserve original date, direct URL and unknown shipping',()=>{const [p]=catalogPriceRecords('fixture',[offer],now);assert.equal(p.checkedAt,offer.lastCheckedAt);assert.equal(p.url,offer.url);assert.equal(p.shippingPrice,null);assert.equal(p.totalPrice,offer.price);});
check('Catalog reads never freshen stale offers or seed unverified/search/unknown stock',()=>{const stale=catalogPriceRecords('fixture',[{...offer,lastCheckedAt:ago(48)}],now);assert.equal(stale[0].checkedAt,ago(48));for(const changed of [{lastCheckedAt:undefined},{url:'https://example.com/search?q=a'},{inStock:undefined},{lastCheckedAt:ago(-1)}])assert.deepEqual(catalogPriceRecords('fixture',[{...offer,...changed}],now),[]);});
check('Database snake_case fields actually map',()=>{const p=readPriceRecord({id:'x',product_id:'fixture',store_id:'shop',store_product_id:'sku',price:10,total_price:12,shipping_price:2,currency:'TRY',stock_status:'IN_STOCK',seller_name:'Seller',url:offer.url,is_anomaly:false,checked_at:ago(2)});assert.ok(p);assert.equal(p.totalPrice,12);assert.equal(p.productId,'fixture');assert.equal(p.stockStatus,'IN_STOCK');assert.equal(p.checkedAt,ago(2));});
check('Invalid numeric prices, foreign currency and search URLs are filtered',()=>{for(const change of [{price:NaN},{totalPrice:Infinity},{currency:'USD'},{url:'https://example.com/'}])assert.equal(readPriceRecord({...record,...change}),null);});
check('Only fresh in-stock direct record can become cheapest',()=>{const rows=[record,{...record,id:'stale',price:100,totalPrice:100,checkedAt:ago(48)},{...record,id:'unknown',price:50,totalPrice:50,stockStatus:'UNKNOWN' as const},{...record,id:'future',price:20,totalPrice:20,checkedAt:ago(-1)}];const view=PriceNormalizer.preparePriceViewList(rows);assert.deepEqual(view.filter(p=>p.isCheapest).map(p=>p.id),['fixture']);assert.equal(view.find(p=>p.id==='stale')?.priceStatus,'stale');assert.equal(view.find(p=>p.id==='future')?.priceStatus,'unverified');});
check('Unknown shipping is not free; missing/future check time is not recent',()=>{const [p]=PriceNormalizer.preparePriceViewList([record]);assert.equal(p.formattedShipping,'Kargo ücreti bilinmiyor');assert.match(PriceNormalizer.getTimeAgo(''),/doğrulanmadı/);assert.match(PriceNormalizer.getTimeAgo(ago(-1)),/doğrulanmadı/);});
check('History write keeps successful observation time and URL including first check',()=>{const h=createPriceObservation(record,undefined,now);assert.ok(h);assert.equal(h.recordedAt,record.checkedAt);assert.equal(h.sourceUrl,record.url);assert.equal(h.oldPrice,undefined);});
check('Unchanged but separately observed price can extend real history',()=>assert.ok(createPriceObservation(record,{...record,checkedAt:ago(48)},now)));
check('Anomalous, unknown/out of stock, unverified or search checks cannot enter history',()=>{for(const change of [{isAnomaly:true},{stockStatus:'UNKNOWN'},{stockStatus:'OUT_OF_STOCK'},{checkedAt:''},{checkedAt:ago(-1)},{url:'https://example.com/search?q=a'}])assert.equal(createPriceObservation({...record,...change} as DbPrice,null,now),null);});
check('Known dangerous legacy generators fail before executing their old code',()=>{for(const file of ['addOppo20252026Lineup.js','addOppo2027Lineup.js','addVivo20252026Lineup.js','addXiaomi20252027Lineup.js','bulkCalibrateAllCategories.js','addIcecatVerifiedProducts.js','calibrateAllWithTs.js','updateAndEnrichHonorCatalog.js']){const s=fs.readFileSync('scripts/'+file,'utf8');assert.match(s,/^\/\/ Disabled legacy migration[^\n]*\nthrow new Error/);}});
check('Malformed percent encoding returns no product rather than throwing',()=>assert.equal(getProductById('%E0%A4%A'),null));
check('Exact S24 corrections are scoped to manufacturer-checked fields',()=>{const p=getProductById('samsung-galaxy-s24');assert.ok(p&&p.category==='smartphones');assert.equal(p.specs.screen?.resolution,'2340 x 1080 px');assert.equal(p.specs.screen?.ppi,undefined);assert.equal(p.specs.battery?.chargingWatts,25);assert.equal(p.specs.build?.weightGrams,167);assert.equal(p.specs.camera?.telephotoMp,'10 MP (3x Optik Zoom)');assert.equal(p.specs.memory?.storageGb,128);assert.ok(p.fieldSources?.every(s=>s.fields.length&&s.sourceUrl.startsWith('https://')));assert.deepEqual(toCatalogProduct(p).fieldSources,p.fieldSources);});
check('iPhone 16 Pro Max year/storage options/Bluetooth are corrected without changing variants',()=>{for(const [slug,capacity] of [['256-gb',256],['512-gb',512],['1-tb',1024]] as const){const p=getProductById('apple-iphone-16-pro-max-'+slug);assert.ok(p&&p.category==='smartphones');assert.equal(p.releaseYear,2024);assert.deepEqual(p.specs.memory?.storageOptions,[256,512,1024]);assert.equal(p.specs.memory?.storageGb,capacity);assert.equal(p.specs.connectivity?.bluetooth,'5.3');}});
async function main(){
 await assert.rejects(execute2026PriceScrape(),/devre dışı/);passed++;console.log('PASS: Retired scraper rejects without network/catalog access');
 const prior=process.env.CRON_SECRET;
 try {
   process.env.CRON_SECRET='isolated-fixture-key';
   const denied=await retiredScraperRoute(new NextRequest('http://localhost/api/cron/scrape-2026-prices'));
   assert.equal(denied.status,401);
   const disabled=await retiredScraperRoute(new NextRequest('http://localhost/api/cron/scrape-2026-prices',{headers:{authorization:'Bearer isolated-fixture-key'}}));
   assert.equal(disabled.status,503);assert.equal((await disabled.json()).success,false);
   passed++;console.log('PASS: Retired route preserves auth and cannot report successful synthetic updates (isolated handler)');
 } finally { if(prior===undefined)delete process.env.CRON_SECRET;else process.env.CRON_SECRET=prior; }
 assert.equal(await getTVById('oled'),undefined);passed++;console.log('PASS: TV partial model cannot choose an arbitrary OLED');
 assert.equal((await getTVById('philips-65oled810'))?.category,'tvs');passed++;console.log('PASS: TV full model still resolves');
 console.log(`\nPrice history evidence: ${passed} PASS, 0 FAIL (pure functions + SSR; no browser or catalog mutation).`);
}
main().catch(error=>{console.error(error);process.exitCode=1;});
