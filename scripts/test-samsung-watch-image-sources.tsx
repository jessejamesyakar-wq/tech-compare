import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import React from 'react';
import {renderToStaticMarkup as render} from 'react-dom/server';
import {mockSmartwatches} from '../src/lib/mockSmartwatches';
import {getProductById,toCatalogProduct} from '../src/lib/data';
import {resolveActiveColor} from '../src/lib/colorVariantHelper';
import {ProductImageGallery} from '../src/components/detail/ProductImageGallery';
import {ProductColorPicker} from '../src/components/detail/ProductColorPicker';
import {ProductJsonLd} from '../src/components/seo/ProductJsonLd';
const {checkCatalogImageEvidence,checkPendingImageEvidence}=require('./catalogImageEvidence.cjs');
const archive=JSON.parse(readFileSync('data/catalog_archives/samsung-watch-generation-image-facts-2026-09-20.json','utf8'));
const manifest=JSON.parse(readFileSync('data/catalog_image_sources.json','utf8'));
const ids=new Set<string>(archive.original.map((p:any)=>p.id));
const entries=manifest.entries.filter((e:any)=>ids.has(e.id));
const pending=manifest.pending.filter((e:any)=>ids.has(e.id));
const hash=(data:string|Buffer)=>createHash('sha256').update(data).digest('hex');
let passed=0;function test(name:string,run:()=>void){run();passed++;console.log('PASS '+name);}
test('18 original identities and all non-image data preserved; 118 other watches unchanged',()=>{
 assert.equal(ids.size,18);assert.equal(mockSmartwatches.length,136);
 for(const old of archive.original){const p=getProductById(old.id)!;assert.ok(p);assert.equal(getProductById(old.slug)!.id,p.id);
  for(const key of new Set([...Object.keys(old),...Object.keys(p)]))if(!['image','images','imageSource','colorOptions'].includes(key))assert.deepEqual((p as any)[key],old[key],old.id+':'+key);
  assert.deepEqual(p.colorOptions!.map(({name,hex})=>({name,hex})),old.colorOptions);
 }
 assert.equal(hash(JSON.stringify(mockSmartwatches.filter(p=>!ids.has(p.id)))),archive.unmodifiedCatalogSha256);
});
test('17 distinct exact-model manufacturer photos replace the later-generation images',()=>{
 assert.equal(entries.length,17);assert.equal(new Set(entries.map((e:any)=>e.sha256)).size,17);
 assert.deepEqual(checkCatalogImageEvidence(mockSmartwatches,entries,'public'),[]);
 for(const entry of entries){
  const source=archive.sources.find((s:any)=>'samsung-'+s.key===entry.id);assert.ok(source);
  assert.equal(entry.sourcePageUrl,source.sourcePageUrl);assert.equal(entry.sha256,source.sha256);
  assert.ok(new URL(entry.sourcePageUrl).pathname.includes(source.model));
  assert.ok(entry.sourceImageUrl.toLowerCase().includes(source.model.toLowerCase()));
  assert.notEqual(entry.sha256,archive.previousImages.find((e:any)=>e.id===entry.id).sha256);
 }
});
test('Default colors, card images, real gallery and structured data agree',()=>{
 for(const entry of entries){const p=getProductById(entry.id)!;
  const color=resolveActiveColor(p,null,null);assert.equal(color.selectedColor,entry.reviewedColorName);
  assert.equal(color.selectedColorImage,entry.imagePath);assert.deepEqual(color.selectedColorImages,[entry.imagePath]);
  assert.equal(toCatalogProduct(p).image,entry.imagePath);
  const html=render(<ProductImageGallery product={p} activeColorImage={color.selectedColorImage} activeColorImages={color.selectedColorImages}/>);
  assert.match(html,/Görsel kaynağı ve kapsamı/);assert.ok(html.includes(entry.imagePath)||html.includes(encodeURIComponent(entry.imagePath)));
  assert.ok(render(<ProductJsonLd product={p}/>).includes(entry.imagePath));
 }
});
test('17 unverified color photographs remain explicit placeholders, even via color URL',()=>{
 assert.equal(entries.reduce((n:number,e:any)=>n+e.unverifiedColorNames.length,0),17);
 for(const entry of entries)for(const colorName of entry.unverifiedColorNames){
  const p=getProductById(entry.id)!,color=resolveActiveColor(p,colorName,null);
  assert.equal(color.selectedColor,colorName);assert.equal(color.selectedColorImage,'/images/product-unverified.svg');
  const html=render(<ProductImageGallery product={p} activeColorImage={color.selectedColorImage} activeColorImages={color.selectedColorImages}/>);
  assert.match(html,/doğrulanmayı bekliyor/);assert.doesNotMatch(html,/Görsel kaynağı ve kapsamı|Fotoğrafı Büyüt/);
 }
});
test('Borrowed generation/color photos and missing color evidence fail verification',()=>{
 const entry=entries.find((e:any)=>e.id==='samsung-gear-sport'),p=getProductById(entry.id)!;
 const wrong=structuredClone(p);wrong.colorOptions!.find(c=>c.name==='Siyah')!.image=p.image;
 assert.ok(checkCatalogImageEvidence([wrong],[entry],'public').some((e:string)=>e.includes('Unreviewed color')));
 const missing=structuredClone(p);missing.colorOptions!.pop();
 assert.ok(checkCatalogImageEvidence([missing],[entry],'public').some((e:string)=>e.includes('color scope')));
 const old=archive.original.find((p:any)=>p.id===entry.id);
 assert.ok(checkCatalogImageEvidence([{...p,image:old.image}],[entry],'public').some((e:string)=>e.includes('Reviewed image changed')));
});
test('Ambiguous LTE titanium variant has no borrowed model image, schema image or false source',()=>{
 assert.equal(pending.length,1);assert.equal(pending[0].id,'samsung-galaxy-watch-3-45mm-lte-titanium');
 const p=getProductById(pending[0].id)!;assert.equal(p.image,'/images/product-unverified.svg');assert.equal(p.imageSource,undefined);
 assert.deepEqual(checkPendingImageEvidence([p],[],pending),[]);
 assert.doesNotMatch(render(<ProductJsonLd product={p}/>),/"image"/);
 const wrong=structuredClone(p);wrong.colorOptions![0].image=archive.original.find((o:any)=>o.id===p.id).image;
 assert.ok(checkPendingImageEvidence([wrong],[],pending).some((e:string)=>e.includes('Unreviewed model')));
});
test('Color default change does not invent a color or affect unreviewed products',()=>{
 const p=structuredClone(getProductById('samsung-gear-sport')!);delete p.imageSource;
 assert.equal(resolveActiveColor(p).selectedColor,p.colorOptions![0].name);
 const valid=getProductById('samsung-gear-sport')!;
 assert.equal(resolveActiveColor(valid,'Siyah').selectedColor,'Siyah');
 assert.equal(resolveActiveColor(valid,'Mavi').selectedColor,'Mavi');
});
test('Real color controls expose selected state, touch size and keyboard focus',()=>{
 const p=getProductById('samsung-gear-sport')!;
 const html=render(<ProductColorPicker product={p} selectedColor="Mavi" onSelectColor={()=>{}}/>);
 assert.equal((html.match(/aria-pressed="true"/g)||[]).length,1);
 assert.equal((html.match(/aria-pressed="false"/g)||[]).length,1);
 assert.match(html,/min-h-11/);assert.match(html,/focus-visible:outline/);
});
console.log(`${passed} Samsung image tests passed (catalog/functions/SSR; not browser E2E).`);
