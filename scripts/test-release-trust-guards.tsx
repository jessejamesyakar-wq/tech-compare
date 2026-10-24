import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getProductById } from '../src/lib/data';
import { getComparisonRows } from '../src/lib/comparisonEvidence';
import { hasUnresolvedSpecField } from '../src/lib/specVerification';
import { buildProductMetaDescription } from '../src/lib/seoHelper';
import { TrustEngine } from '../src/lib/ai/robopengu/trustEngine';
import { SpecSheet } from '../src/components/detail/SpecSheet';
import { I18nProvider } from '../src/lib/i18n/context';
import { mockSmartphones } from '../src/lib/mockData';
const id='samsung-samsung-galaxy-s25-fe-110';
const original=mockSmartphones.find(p=>p.id===id)!;
const before=JSON.stringify(original);
const p=getProductById(id)!;
assert.ok(p.specVerification);
for(const path of ['ram','ramGb','memory.ramGb','specs.memory.ramGb'])assert.ok(hasUnresolvedSpecField(p,path));
for(const path of ['memory.storageGb','memory.storageOptions','camera.mainMp'])assert.equal(hasUnresolvedSpecField(p,path),false,path);
const ram=getComparisonRows([p]).find(r=>r.id.includes('ramGb'))!;
assert.ok(ram);
assert.match(ram.getValue(p),/Doğrulama bekliyor/);
assert.equal(ram.getRawNumber?.(p),null);
assert.doesNotMatch(buildProductMetaDescription(p),/12\s*GB\s*RAM/);
assert.ok(TrustEngine.evaluate(p as any).blockedFields.includes('specs.memory.ramGb'));
const html=renderToStaticMarkup(<I18nProvider><SpecSheet specs={p.specs as any} productId={id}/></I18nProvider>);
assert.match(html,/Doğrulama bekliyor/);
assert.doesNotMatch(html,/12 GB/);
assert.equal(JSON.stringify(original),before,'Read must not mutate the catalog object');
const other={...p,id:'unrelated-product',specVerification:undefined};
assert.equal(hasUnresolvedSpecField(other,'memory.ramGb'),false);
assert.deepEqual(p.storeOffers,original.storeOffers);
assert.equal(p.basePrice,original.basePrice);
// A cloud server's default locale can differ from the browser's locale.
// Require an explicit locale instead of allowing a host-dependent SSR string.
const originalToLocaleString=Number.prototype.toLocaleString;
const localeCalls: unknown[]=[];
try {
  Number.prototype.toLocaleString=function(locales,options){
    localeCalls.push(locales);
    return originalToLocaleString.call(this,locales,options);
  };
  const specs={...p.specs,processor:{...(p.specs as any).processor,antutuScore:1650000}};
  const rendered=renderToStaticMarkup(<I18nProvider><SpecSheet specs={specs as any} productId={id}/></I18nProvider>);
  assert.match(rendered,/1\.650\.000 Puan/);
  assert.ok(localeCalls.length>0);
  assert.ok(localeCalls.every(locale=>locale==='tr-TR'),'SSR formatting must not depend on the host locale');
} finally { Number.prototype.toLocaleString=originalToLocaleString; }
console.log('PASS: RAM held across data, comparison, SEO, AI and rendered specs; sibling fields, other products, catalog and prices preserved.');
