import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';
import phones from '../src/lib/smartphonesData.json';
import dataReviews from '../data/catalog_data_reviews.json';
import { getProductById, toCatalogProduct } from '../src/lib/data';
import { getComparisonRows, getMetricOutcome } from '../src/lib/comparisonEvidence';
import { CompareVerdictCard } from '../src/components/compare/CompareVerdictCard';
import { SpecSheet } from '../src/components/detail/SpecSheet';
import { BentoFeatureCards } from '../src/components/detail/BentoFeatureCards';
import { I18nProvider } from '../src/lib/i18n/context';
import { PHONE_SPEC_FIELDS, hasLegacyPhoneSpecs, phoneSpecText } from '../src/lib/smartphoneSpecFields';
import type { Product, Smartphone, SmartphoneSpecs } from '../src/lib/types';

let passed = 0;
function check(name:string,run:()=>void) { run(); passed++; console.log(`PASS: ${name}`); }
const base = getProductById('redmi-k90-pro-max-5g-512-gb')!;
assert.ok(base);
const fixture = (specs:unknown) => ({...base,id:'spec-fixture',specs} as Product);
const row = (p:Product,label:string) => getComparisonRows([p]).find(r=>r.label === label)!;

check('Reported Redmi link retains recorded 512 GB and displays its flat specs',()=>{
  assert.equal(base.slug,'redmi-k90-pro-max-5g-512-gb');
  assert.equal(row(base,'Depolama').getValue(base),'512 GB');
  assert.equal(row(base,'RAM Kapasitesi').getValue(base),'16 GB');
  const samsung = getProductById('samsung-galaxy-s25')!;
  const html = render(<CompareVerdictCard products={[base,samsung]}/>);
  assert.doesNotMatch(html,/Teknik özellik kaydı yok/);
  assert.match(html,/kaynak doğrulaması bekleyen/);
  assert.match(html,/OLED \(144Hz\)/); // Existing record, NOT a verified product fact.
});

check('Both old formats render detail values without mutating the catalog',()=>{
  const specs = {screenSize:'6.3 inç IPS LCD',processor:'Kirin 990 / 980',ram:'8 GB / 12 GB',storage:'128 GB / 256 GB',battery:'4000 mAh',chargingSpeed:'10W - 22.5W',mainCamera:'50 MP + 12 MP',frontCamera:'8 MP',os:'Recorded OS'};
  const before = JSON.stringify(specs);
  const html = render(<I18nProvider><SpecSheet specs={specs as unknown as SmartphoneSpecs}/></I18nProvider>);
  for(const value of ['6.3 inç IPS LCD','8 GB / 12 GB','128 GB / 256 GB','4000 mAh','10W - 22.5W','Kirin 990 / 980','50 MP + 12 MP']) assert.ok(html.includes(value),value);
  assert.equal(JSON.stringify(specs),before);
  assert.match(html,/kaynak doğrulaması bekleyen/);
});

check('Detail highlight cards and quick-field readers use the same recorded values',()=>{
  const p=fixture({screenSize:6.5,displayType:'Fixture OLED',chipset:'Fixture Chip',ram:'8 GB / 12 GB',storage:'128 GB',batteryCapacity:4500,chargingSpeed:'15 W / 30 W',mainCamera:'50 MP + 12 MP'});
  const html=render(<BentoFeatureCards phone={p as Smartphone}/>);
  for(const value of ['6,5 inç','Fixture OLED','Fixture Chip','4.500 mAh','15 W / 30 W','50 MP + 12 MP']) assert.ok(html.includes(value),value);
  assert.equal(phoneSpecText(p.specs,'memory.ramGb'),'8 GB / 12 GB');
  assert.equal(phoneSpecText(p.specs,'memory.storageGb'),'128 GB');
  assert.match(html,/kaynak doğrulaması bekleyen/);
});

check('Old numeric and ranged values cannot silently become a winner',()=>{
  for(const ram of [16,'16 GB','8 GB / 16 GB']) {
    const a=fixture({ram}), b={...fixture({memory:{ramGb:8}}),id:'b'};
    assert.equal(getMetricOutcome(row(a,'RAM Kapasitesi'),[a,b]),'insufficient_data');
  }
  assert.equal(row(base,'Yenileme Hızı').getValue(base),'Bilinmiyor'); // Never parse 144Hz from panel prose.
});

check('Listing projection preserves the old schema without inventing canonical metrics',()=>{
  for(const raw of phones.filter(p=>!(p.specs as any).screen && !(p.specs as any).memory)) {
    const p=raw as unknown as Product, projected=toCatalogProduct(p);
    for(const field of PHONE_SPEC_FIELDS) assert.equal(phoneSpecText(projected.specs,field),phoneSpecText(p.specs,field),`${p.slug}: ${field.label}`);
    assert.equal(row(projected,'RAM Kapasitesi').getRawNumber!(projected),null);
  }
});

check('Structured values win precedence and false/zero do not disappear',()=>{
  const p=fixture({ram:64,memory:{ramGb:0},has5G:true,connectivity:{has5G:false},processor:{process:'3nm'},battery:{wirelessCharging:false}});
  assert.equal(row(p,'RAM Kapasitesi').getValue(p),'0 GB');
  assert.equal(row(p,'5G').getValue(p),'Yok');
  assert.equal(row(p,'Kablosuz Şarj').getValue(p),'Yok');
  assert.equal(row(p,'İşlemci').getValue(p),'Bilinmiyor'); // An object is not a chipset string.
  assert.equal(row(p,'Batarya Kapasitesi').getValue(p),'Bilinmiyor');
});

check('Combined camera text is not relabelled as a single main camera',()=>{
  const p=fixture({mainCamera:'50 MP + 50 MP periskop + 12 MP'});
  assert.equal(row(p,'Ana Kamera').getValue(p),'Bilinmiyor');
  assert.equal(row(p,'Arka Kamera Sistemi (katalog kaydı)').getValue(p),'50 MP + 50 MP periskop + 12 MP');
});

check('Truly empty or invalid records retain the missing-data state',()=>{
  const p=fixture({ram:NaN,storage:Infinity,screenSize:' ',battery:{},has5G:null});
  assert.equal(hasLegacyPhoneSpecs(p.specs),false);
  assert.ok(PHONE_SPEC_FIELDS.every(f=>phoneSpecText(p.specs,f)==='Bilinmiyor'));
  const html=render(<CompareVerdictCard products={[p,{...p,id:'empty-2'}]}/>);
  assert.match(html,/Teknik özellik kaydı yok/);
});

check('Readable phone specs stay readable; quarantined specs stay explicitly empty',()=>{
  let restored=0, pending=0;
  const quarantined=new Set(dataReviews.entries.filter(e=>e.fieldsAwaitingSource.includes('specs')).map(e=>e.id));
  for(const raw of phones) {
    const p=raw as unknown as Product;
    if(quarantined.has(p.id)) {
      pending++; assert.deepEqual(p.specs,{}); assert.ok(p.specVerification?.note);
      assert.ok(getComparisonRows([p]).filter(r=>r.category!=='Fiyat ve Kayıt Bilgisi').every(r=>r.getValue(p)==='Bilinmiyor'),p.slug);
      continue;
    }
    assert.ok(getComparisonRows([p]).some(r=>r.category!=='Fiyat ve Kayıt Bilgisi' && r.getValue(p)!=='Bilinmiyor'),p.slug);
    if(!(raw.specs as any).screen && !(raw.specs as any).memory) { restored++; assert.equal(hasLegacyPhoneSpecs(p.specs),true,p.slug); }
  }
  assert.ok(restored > 0); // Source corrections may migrate individual records to a mixed/structured schema.
  assert.equal(pending,392);
  console.log(`  ${phones.length} records checked; ${restored} flat records readable, ${pending} explicitly pending. This is NOT source verification.`);
});

check('Both exact S25 records use S25 facts rather than Ultra hardware',()=>{
  for(const slug of ['samsung-galaxy-s25','samsung-galaxy-s25-128gb']) {
    const p=getProductById(slug)!;
    assert.ok(p);
    assert.equal(row(p,'Çözünürlük').getValue(p),'2340 x 1080 (FHD+)');
    assert.equal(row(p,'Telefoto').getValue(p),'10 MP (3x optik zoom)');
    assert.equal(row(p,'Kablolu Şarj Gücü').getValue(p),'25 W');
    assert.equal(row(p,'Ağırlık').getValue(p),'162 g');
    assert.equal(row(p,'Depolama').getValue(p),'128 GB');
    assert.equal(row(p,'Kayıtlı AnTuTu Puanı (yöntem doğrulanmadı)').getValue(p),'Bilinmiyor');
  }
  assert.equal(base.releaseYear,2025);
});
console.log(`\nPhone spec compatibility: ${passed} PASS, 0 FAIL (functions + server rendering; not browser E2E).`);
