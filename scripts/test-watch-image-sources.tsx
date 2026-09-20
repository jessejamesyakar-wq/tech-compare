import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import React from 'react';
import {renderToStaticMarkup as render} from 'react-dom/server';
import {mockSmartwatches} from '../src/lib/mockSmartwatches';
import {getProductById,toCatalogProduct} from '../src/lib/data';
import {resolveActiveColor} from '../src/lib/colorVariantHelper';
import {ProductImageGallery} from '../src/components/detail/ProductImageGallery';
import {ProductJsonLd} from '../src/components/seo/ProductJsonLd';
const {checkCatalogImageEvidence}=require('./catalogImageEvidence.cjs');
const archive=JSON.parse(readFileSync('data/catalog_archives/garmin-amazfit-image-facts-2026-09-20.json','utf8'));
const technical=JSON.parse(readFileSync('data/catalog_archives/forerunner965-trex3-technical-facts-2026-09-20.json','utf8'));
const technicalIds=new Set(technical.original.map((p:any)=>p.id));
const reviewedTechnicalKeys=['specs','highlights','fieldSources','specVerification'];
const manifest=JSON.parse(readFileSync('data/catalog_image_sources.json','utf8'));
const products=archive.original.map((old:any)=>getProductById(old.id)!);
let passed=0;function test(name:string,run:()=>void){run();passed++;console.log('PASS '+name);}
test('Six identities and commercial data preserved; four subsequent technical reviews tracked separately',()=>{
 assert.equal(archive.original.length,6);
 for(const old of archive.original){const p=getProductById(old.id)!;assert.ok(p);assert.equal(getProductById(old.slug)!.id,old.id);
  for(const key of Object.keys(old)){
   if(['image','images','imageSource'].includes(key))continue;
   if(technicalIds.has(old.id)&&reviewedTechnicalKeys.includes(key)){
    // Prove the later review started from the image-only state. Its exact field
    // changes are independently constrained in test-watch-technical-sources.
    assert.deepEqual(technical.original.find((p:any)=>p.id===old.id)[key],old[key]);
   }else assert.deepEqual((p as any)[key],old[key],`${old.id}:${key}`);
  }
  assert.notEqual(p.image,old.image);
 }
});
test('Four real model images replace the Huawei bytes in all six records',()=>{
 assert.equal(new Set(products.map((p:any)=>p.image)).size,4);
 for(const p of products){const hash=createHash('sha256').update(readFileSync('public'+p.image)).digest('hex');assert.notEqual(hash,archive.previousImageSha256);}
 const entries=manifest.entries.filter((e:any)=>products.some((p:any)=>p.id===e.id));
 assert.equal(entries.length,6);assert.deepEqual(checkCatalogImageEvidence(mockSmartwatches,entries,'public'),[]);
});
test('Catalog cards, color resolver, real gallery and schema carry the same corrected image',()=>{
 for(const p of products){
  assert.equal(toCatalogProduct(p).image,p.image);
  const resolved=resolveActiveColor(p,null,null);
  assert.equal(resolved.selectedColorImage,p.image);
  const html=render(<ProductImageGallery product={p} activeColorImage={resolved.selectedColorImage} activeColorImages={resolved.selectedColorImages}/>);
  assert.match(html,/Görsel kaynağı ve kapsamı/);
  assert.ok(html.includes(p.imageSource.scopeNote.replace(/&/g,'&amp;')));
  assert.ok(html.includes(encodeURIComponent(p.image))||html.includes(p.image));
  const schema=render(<ProductJsonLd product={p}/>);assert.ok(schema.includes(p.image));
 }
});
test('Shared reviewed assets are restricted to the two known duplicate-model ID pairs',()=>{
 const groups=new Map<string,string[]>();for(const p of products)groups.set(p.image,[...(groups.get(p.image)||[]),p.id]);
 const shared=[...groups.values()].filter(ids=>ids.length>1).map(ids=>ids.sort());
 assert.deepEqual(shared.sort(),[['garmin-forerunner-965','garmin-forerunner-965-titanium'],['amazfit-t-rex-3','amazfit-t-rex-3-outdoor-gps']].map(ids=>ids.sort()).sort());
});
test('Restoring the old Huawei image or borrowing the other Garmin model fails evidence validation',()=>{
 const p=products.find((p:any)=>p.id==='garmin-fenix-8-51mm-amoled'),entry=manifest.entries.find((e:any)=>e.id===p.id);
 for(const wrong of [archive.original.find((o:any)=>o.id===p.id).image,products.find((p:any)=>p.id==='garmin-forerunner-965').image]){
  assert.ok(checkCatalogImageEvidence([{...p,image:wrong,images:[wrong]}],[entry],'public').some((e:string)=>e.includes('Reviewed image changed')));
 }
});
test('Image evidence does not promote product or stock verification; technical changes have a separate review',()=>{
 for(const p of products){const old=archive.original.find((o:any)=>o.id===p.id);
  for(const key of ['sourceType','sourceUrl','verifiedAt','storeOffers'])assert.deepEqual(p[key],old[key]);
  if(!technicalIds.has(p.id))for(const key of ['fieldSources','specVerification','specs'])assert.deepEqual(p[key],old[key]);
  assert.match(p.imageSource.scopeNote,/satıcı|satıcının/);
 }
});
console.log(`${passed} watch tests passed (catalog/functions/SSR; not browser E2E).`);
