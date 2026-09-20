import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup as render} from 'react-dom/server';
import {mockAppliances} from '../src/lib/mockAppliances';
import {getProductById} from '../src/lib/data';
import {getProductImageSource} from '../src/lib/productImages';
import {ProductImageGallery} from '../src/components/detail/ProductImageGallery';
import {ProductJsonLd} from '../src/components/seo/ProductJsonLd';
const {checkCatalogImageEvidence}=require('./catalogImageEvidence.cjs');
const archive=JSON.parse(readFileSync('data/catalog_archives/appliance-kettle-image-facts-2026-09-20.json','utf8'));
const manifest=JSON.parse(readFileSync('data/catalog_image_sources.json','utf8'));
let passed=0;
function test(name:string,run:()=>void){run();passed++;console.log('PASS '+name);}
test('All five original products resolve; non-image facts and prices are preserved',()=>{
 assert.equal(archive.original.length,5);
 for(const old of archive.original){
  const current=mockAppliances.find(p=>p.id===old.id)!;
  assert.ok(current);assert.equal(getProductById(old.slug)!.id,old.id);
  for(const key of Object.keys(old))if(!['image','images','imageSource'].includes(key))assert.deepEqual((current as any)[key],old[key],`${old.id}:${key}`);
  assert.notEqual(current.image,old.image);
 }
});
test('Four sourced photos render their scope and producer link through the real gallery',()=>{
 const reviewed=mockAppliances.filter(p=>archive.original.some((o:any)=>o.id===p.id)&&p.imageSource);
 assert.equal(reviewed.length,4);
 for(const p of reviewed){
  const html=render(<ProductImageGallery product={p}/>);
  assert.ok(html.includes('data-testid="product-image-source"'));
  assert.ok(html.includes(p.imageSource!.scopeNote.replace(/&/g,'&amp;')));
  assert.ok(html.includes(p.imageSource!.sourceUrl.replace(/&/g,'&amp;')));
  assert.match(html,/Fotoğrafı Büyüt/);
 }
});
test('Unresolved Karaca Pro distinction stays open, with no kettle, source badge or magnifier',()=>{
 const p=getProductById('karaca-caysever-robotea-connect')!;
 assert.equal(p.image,'/images/product-unverified.svg');
 assert.ok(manifest.pending.some((e:any)=>e.id===p.id));
 assert.ok(!manifest.entries.some((e:any)=>e.id===p.id));
 const html=render(<ProductImageGallery product={p}/>);
 assert.doesNotMatch(html,/icecat-philips|product-image-source|Fotoğrafı Büyüt/);
 const schema=render(<ProductJsonLd product={p}/>);
 assert.doesNotMatch(schema,/"image"/);
});
test('Source label cannot follow a different color image or unsafe/future evidence',()=>{
 const original=mockAppliances.find(p=>p.imageSource)!;
 assert.ok(getProductImageSource(original,original.image));
 assert.equal(getProductImageSource(original,'/different-color.jpg'),null);
 for(const patch of [{sourceUrl:'javascript:alert(1)'},{sourceUrl:'https://user:pass@example.com/'},{checkedAt:'2099-01-01'},{checkedAt:'invalid'},{scopeNote:''}]){
  const p={...original,imageSource:{...original.imageSource!,...patch}};
  assert.equal(getProductImageSource(p,p.image),null);
 }
});
test('Displayed producer claims must match the reviewed manifest',()=>{
 const p=mockAppliances.find(p=>p.imageSource)!,entry=manifest.entries.find((e:any)=>e.id===p.id);
 const altered={...p,imageSource:{...p.imageSource!,scopeNote:'Entire product fully verified'}};
 assert.ok(checkCatalogImageEvidence([altered],[entry],'public').some((e:string)=>e.includes('Displayed image source differs')));
});
test('Arzum extraction retains manual identity and embedded image provenance',()=>{
 const entry=manifest.entries.find((e:any)=>e.id==='arzum-okka-grandio-duo');
 assert.equal(entry.extraction.type,'embedded-pdf-image');assert.equal(entry.extraction.page,1);
 assert.equal(entry.extraction.name,'Im0.png');assert.match(entry.extraction.sourceSha256,/^[a-f0-9]{64}$/);
 assert.match(entry.sourcePageUrl,/arzum\.com\.tr\/.*\.pdf$/);
});
console.log(`${passed} appliance tests passed (data/functions/server render; not browser E2E).`);
