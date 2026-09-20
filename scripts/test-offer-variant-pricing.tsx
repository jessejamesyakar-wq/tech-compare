import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { evaluateProductPricing } from '../src/lib/pricing/unifiedPriceEvaluator';
import { evaluateAllStoresPresence } from '../src/lib/pricing/storeAvailabilityEngine';
import { selectProductOfferVariant } from '../src/lib/pricing/offerVariant';
import { ProductPriceSummary } from '../src/components/detail/ProductPriceSummary';
import { ProductJsonLd } from '../src/components/seo/ProductJsonLd';
import { StoreTable } from '../src/components/detail/StoreTable';
import { CompactStoreComparison } from '../src/components/detail/CompactStoreComparison';
import { I18nProvider } from '../src/lib/i18n/context';
import type { Product } from '../src/lib/types';
const { binding, source, original, html } = require('./test-observed-store-offers.cjs');
const { validateBinding, parseObservedOffer, mergeObservation } = require('./observedStoreOffer.cjs');
const now = Date.now();
const variantBinding = {...binding,expectedTitle:binding.expectedTitle+' Abis',variantId:'abis',variantName:'Abis'};
const originalWithVariants = {...original,variants:[{id:'abis',colorName:'Abis'},{id:'silver',colorName:'Gümüş'}]};
const observation = parseObservedOffer(html({...source,name:variantBinding.expectedTitle}),variantBinding,{checkedAt:new Date(now-2000).toISOString()});
const product: Product = mergeObservation({...originalWithVariants,slug:'fixture',currency:'TL',image:'/images/product-unverified.svg',highlights:[],storeOffers:[{storeName:'Vatan Bilgisayar',price:1000,url:'https://www.vatanbilgisayar.com/arama/test',isSearchLink:true,inStock:true}]},{status:'observed',observation});
let passed=0;
function check(name:string,run:()=>void){run();passed++;console.log('PASS: '+name);}
check('source registration requires an exact existing variant, colour, MPN and title',()=>{
 validateBinding(variantBinding,originalWithVariants);
 for(const altered of [{...variantBinding,variantId:'wrong'},{...variantBinding,variantName:'Gümüş'},{...variantBinding,expectedMpn:undefined},{...variantBinding,expectedTitle:binding.expectedTitle},binding]) assert.throws(()=>validateBinding(altered,originalWithVariants));
});
check('parser retains variant scope on both offer and history without mutating original',()=>{
 assert.equal(observation.offer.variantId,'abis');assert.equal(product.priceHistory[0].variantName,'Abis');assert.equal(original.priceHistory.length,0);
});
check('model-level and historical price labels retain the exact variant',()=>{
 const price=evaluateProductPricing(product,now);assert.equal(price.currentPrice,42000.5);assert.match(price.statusLabel,/Teklif varyantı: Abis/);
 const stale={...product,storeOffers:product.storeOffers.map(o=>({...o,lastCheckedAt:new Date(now-48*3600000).toISOString()}))};
 assert.equal(evaluateProductPricing(stale,now).currentPrice,null);assert.match(evaluateProductPricing(stale,now).statusLabel,/Son görülen.*Abis/);
});
check('other selected colour has neither current offer nor observed history nor schema offer',()=>{
 const silver=selectProductOfferVariant(product,'silver','Gümüş');
 assert.equal(evaluateProductPricing(silver,now).currentPrice,null);assert.equal(silver.priceHistory.length,0);
 assert.doesNotMatch(renderToStaticMarkup(<ProductJsonLd product={silver}/>),/"offers"/);
 const abis=selectProductOfferVariant(product,'abis','Abis');assert.equal(evaluateProductPricing(abis,now).currentPrice,42000.5);
 assert.equal(product.storeOffers.length,2);
});
check('an earlier search link never hides the observed merchant offer, regardless of order',()=>{
 for(const storeOffers of [product.storeOffers,[...product.storeOffers].reverse()]){
  const presence=evaluateAllStoresPresence({...product,storeOffers});assert.equal(presence.inStockCount,1);assert.equal(presence.lowestPrice,42000.5);assert.equal(presence.activeOffers[0].variantName,'Abis');
 }
});
check('conflicting stock status and missing boolean stock proof never count as current',()=>{
 for(const extra of [{inStock:undefined,stockStatus:'in_stock' as const},{inStock:true,stockStatus:'out_of_stock' as const}]){
 const changed={...product,storeOffers:[{...observation.offer,...extra}]};assert.equal(evaluateProductPricing(changed,now).currentPrice,null);assert.equal(evaluateAllStoresPresence(changed).inStockCount,0);
 }
});
check('two variants in one merchant do not inflate the store count',()=>{
 const changed={...product,storeOffers:[observation.offer,{...observation.offer,variantId:'silver',variantName:'Gümüş',price:44000}]};assert.equal(evaluateProductPricing(changed,now).activeStoreCount,1);
});
check('actual summary, both store components and JSON-LD render variant scope',()=>{
 assert.match(renderToStaticMarkup(<ProductPriceSummary product={product}/>),/Teklif varyantı: Abis/);
 for(const Component of [StoreTable,CompactStoreComparison]){
 const markup=renderToStaticMarkup(<I18nProvider><Component offers={product.storeOffers} currency="TL" product={product}/></I18nProvider>);
 assert.match(markup,/Teklif varyantı: Abis/);assert.match(markup,/42.000,5/);
 }
 assert.match(renderToStaticMarkup(<ProductJsonLd product={product}/>),/"color":"Abis"/);
});
check('real catalog observation changes only the reviewed offer and history',()=>{
 const archive=JSON.parse(readFileSync('data/catalog_archives/iphone17-abis-offer-before-2026-09-20.json','utf8'));
 const phones=JSON.parse(readFileSync('src/lib/smartphonesData.json','utf8'));
 const current=phones.find((p:Product)=>p.id===archive.product.id);
 assert.ok(current);
 const withoutCommercial=({storeOffers,priceHistory,...rest}:Product)=>rest;
 assert.deepEqual(withoutCommercial(current),withoutCommercial(archive.product));
 assert.equal(createHash('sha256').update(JSON.stringify(phones.filter((p:Product)=>p.id!==current.id))).digest('hex'),archive.otherProductsSha256);
 assert.deepEqual(current.storeOffers.filter((o:any)=>o.id!=='observed-vatan-153500'),archive.product.storeOffers);
 const observed=current.storeOffers.filter((o:any)=>o.id==='observed-vatan-153500');assert.equal(observed.length,1);
 assert.equal(observed[0].variantName,'Abis');assert.equal(observed[0].observationEvidence.manufacturerPartNumber,'MFYP4TU/A');
 assert.equal(observed[0].url,archive.source.url);assert.match(observed[0].observationEvidence.responseSha256,/^[a-f0-9]{64}$/);
});
console.log(`Variant pricing: ${passed} PASS, 0 FAIL (fixtures/catalog/functions/SSR, not live browser)`);
