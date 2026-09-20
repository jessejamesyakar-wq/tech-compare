import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup as render} from 'react-dom/server';
import {mockSmartwatches} from '../src/lib/mockSmartwatches';
import {SMARTWATCH_SPEC_FIELDS,readSmartwatchSpec,smartwatchSpecText} from '../src/lib/smartwatchSpecFields';
import {getComparisonRows,getMetricOutcome} from '../src/lib/comparisonEvidence';
import {SmartwatchSpecSheet} from '../src/components/detail/SmartwatchSpecSheet';
import type {Product} from '../src/lib/types';
const field=(key:string)=>SMARTWATCH_SPEC_FIELDS.find(f=>f.paths.split('|').includes(key))!;
const fenix=mockSmartwatches.find(p=>p.id==='garmin-fenix-8-51mm-amoled')!;
const newer=mockSmartwatches.find(p=>p.id==='garmin-forerunner-965-titanium')!;
let passed=0;function test(name:string,run:()=>void){run();passed++;console.log('PASS '+name);}
test('Real older Fenix record no longer loses screen size, GPS, NFC or water resistance',()=>{
 const rows=getComparisonRows([fenix,newer]);
 for(const [label,expected] of Object.entries({'Ekran Boyutu':'1,4 inç',GPS:'Var',NFC:'Var','Su Dayanıklılığı':'10 ATM'})){
  assert.equal(rows.find(r=>r.label===label)!.getValue(fenix),expected,label);
 }
});
test('Newer format retains units, materials and negative capability values',()=>{
 const rows=getComparisonRows([fenix,newer]);
 assert.equal(rows.find(r=>r.label==='Ekran Boyutu')!.getValue(newer),'1,4 inç');
 assert.equal(rows.find(r=>r.label==='Mikrofon')!.getValue(newer),'Yok');
 assert.equal(rows.find(r=>r.label==='Hücresel Bağlantı')!.getValue(newer),'Yok');
 assert.equal(rows.find(r=>r.label==='Kasa Malzemesi')!.getValue(newer),(newer.specs as any).casingMaterial);
});
test('False is distinct from missing, malformed text, infinity and negative numbers',()=>{
 assert.equal(smartwatchSpecText({hasGPS:false},field('hasGps')),'Yok');
 for(const value of [undefined,null,'false','true',0,1])assert.equal(smartwatchSpecText({hasGps:value},field('hasGps')),'Bilinmiyor');
 for(const value of [-1,NaN,Infinity])assert.equal(smartwatchSpecText({displaySizeInches:value},field('displaySizeInch')),'Bilinmiyor');
 assert.equal(smartwatchSpecText({displaySizeInches:false},field('displaySizeInch')),'Bilinmiyor');
 assert.equal(smartwatchSpecText({batteryLifeDays:0},field('batteryLifeDays')),'0 gün');
});
test('Contradictory aliases do not silently prefer one value; equal aliases remain readable',()=>{
 for(const specs of [{hasGps:false,hasGPS:true},{displaySizeInch:1.4,displaySizeInches:1.2},{storageGb:32,internalStorageGB:16}]){
  const key=Object.keys(specs)[0];assert.equal(smartwatchSpecText(specs,field(key)),'Çelişkili katalog verisi');
  assert.equal(readSmartwatchSpec(specs,field(key)).value,undefined);
 }
 assert.equal(smartwatchSpecText({hasGPS:false,hasGps:false},field('hasGps')),'Yok');
 assert.equal(smartwatchSpecText({waterResistance:'10 ATM',waterResistanceAtm:10},field('waterResistance')),'10 ATM');
 assert.equal(smartwatchSpecText({displaySizeInch:1.44441,displaySizeInches:1.44442},field('displaySizeInch')),'Çelişkili katalog verisi');
});
test('IP and water-pressure ratings remain different properties, not converted to diving claims',()=>{
 assert.equal(smartwatchSpecText({ipRating:'IP68'},field('waterResistance')),'Bilinmiyor');
 assert.equal(smartwatchSpecText({ipRating:'IP68'},field('ipRating')),'IP68');
 assert.equal(smartwatchSpecText({waterResistanceAtm:5},field('waterResistance')),'5 ATM');
});
test('All 136 current watch records and every recorded spec key are covered without mutation',()=>{
 assert.equal(mockSmartwatches.length,136);
 const before=JSON.stringify(mockSmartwatches),known=new Set(SMARTWATCH_SPEC_FIELDS.flatMap(f=>f.paths.split('|')));
 for(const p of mockSmartwatches){
  assert.ok(p.specs,`${p.id}: missing specs object`);
  for(const key of Object.keys(p.specs))assert.ok(known.has(key),`${p.id}:${key}`);
  for(const f of SMARTWATCH_SPEC_FIELDS){const present=f.paths.split('|').filter(k=>(p.specs as any)[k]!==undefined);
   if(present.length){assert.notEqual(smartwatchSpecText(p.specs,f),'Bilinmiyor',`${p.id}:${f.label}`);}
  }
 }
 assert.equal(JSON.stringify(mockSmartwatches),before);
});
test('Real detail component uses Turkish terms and units; empty records show explicit unknowns',()=>{
 const html=render(<SmartwatchSpecSheet product={fenix}/>);
 assert.match(html,/Ekran Boyutu/);assert.match(html,/1,4 inç/);assert.match(html,/51 mm/);assert.match(html,/10 ATM/);
 assert.doesNotMatch(html,/>hasGPS<|>displaySizeInches<|>waterResistanceAtm</);
 const empty=render(<SmartwatchSpecSheet product={{...fenix,specs:{}} as Product}/>);
 assert.equal((empty.match(/Bilinmiyor/g)||[]).length,SMARTWATCH_SPEC_FIELDS.length);
});
test('Unresolved weight cannot declare a numeric winner; pilot battery modes gain no winner metric',()=>{
 const p={...fenix,specVerification:{note:'Weight requires source',unresolvedFields:['specs.weightGrams']}};
 const rows=getComparisonRows([p,newer]);
 assert.equal(getMetricOutcome(rows.find(r=>r.label==='Ağırlık')!,[p,newer]),'insufficient_data');
 assert.equal(rows.find(r=>r.label==='Kayıtlı Pil Süresi')!.getRawNumber,undefined);
 assert.equal(rows.find(r=>r.label==='Batarya Kapasitesi')!.getRawNumber,undefined);
});
console.log(`${passed} smartwatch compatibility tests passed (136 catalog records, functions and SSR; not source verification).`);
