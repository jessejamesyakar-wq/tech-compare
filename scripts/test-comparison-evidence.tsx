import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';
import type { Product, StoreOffer, Smartphone } from '../src/lib/types';
import { getComparisonRows, getMetricOutcome, getRowWinnerId, describeMetric } from '../src/lib/comparisonEvidence';
import { getProductScore, calculateOverallDuelWinner } from '../src/lib/compareMetrics';
import { generateRefereeVerdict } from '../src/lib/ai/refereeVerdictEngine';
import { CompareVerdictCard } from '../src/components/compare/CompareVerdictCard';
import { DeepCompareSections } from '../src/components/compare/deep/DeepCompareSections';
import { DuelArena } from '../src/components/compare/DuelArena';
import { DUEL_PRESETS } from '../src/lib/duelPresets';
import { DEFAULT_DUEL_P1, DEFAULT_DUEL_P2 } from '../src/lib/defaultDuelProducts';
import { getProductById } from '../src/lib/data';

let passed=0;
const check=(name:string,run:()=>void)=>{run();passed++;console.log(`PASS: ${name}`);};
const base={id:'fixture-a',slug:'fixture-a',name:'Fixture A',brand:'Fixture',category:'smartphones',basePrice:50000,rating:4.8,reviewCount:1000,specs:{},image:'/images/placeholder-product.svg',storeOffers:[]} as unknown as Product;
const other={...base,id:'fixture-b',slug:'fixture-b',name:'Fixture B'} as Product;
const pair=(category:string,s1:unknown={},s2:unknown={})=>[{...base,category,specs:s1},{...other,category,specs:s2}] as Product[];
const find=(products:Product[],label:string)=>{const row=getComparisonRows(products).find(r=>r.label===label);assert.ok(row,`Missing row ${label}`);return row;};
const offer=(price:number,hours=2):StoreOffer=>({storeName:'Fixture Store',price,url:'https://example.com/product/fixture',inStock:true,lastCheckedAt:new Date(Date.now()-hours*3600000).toISOString()});

for(const category of ['smartphones','tvs','laptops','monitors','tablets','smartwatches','headphones','appliances','consoles']){
 check(`${category}: missing specs never produce a numeric winner or invented feature`,()=>{
   const products=pair(category),rows=getComparisonRows(products);assert.ok(rows.length>3);
   for(const row of rows){assert.equal(getRowWinnerId(row,products),null);assert.notEqual(getMetricOutcome(row,products),'tie');if(row.category!=='Fiyat ve Kayıt Bilgisi')assert.equal(row.getValue(products[0]),'Bilinmiyor');}
   const verdict=generateRefereeVerdict(products[0],products[1]);assert.ok(verdict.scenarios.every(s=>s.winnerProductId===null));
 });
}
check('Stars and review counts are never performance scores',()=>{assert.equal(getProductScore({rating:4.8}),null);assert.equal(getProductScore({rating:5,aceleEtmeScore:81}),81);assert.equal(getProductScore({aceleEtmeScore:0}),0);});
check('Nonfinite and out of range overall scores are insufficient, not a winner/tie',()=>{for(const v of [NaN,Infinity,-1,101]){assert.equal(calculateOverallDuelWinner(v,80),'insufficient_data');assert.equal(calculateOverallDuelWinner(v,v),'insufficient_data');}});
check('RAM compares actual values, ties are explicit and missing third side blocks winner',()=>{
 const products=pair('laptops',{ramGb:32},{ramGb:16}),row=find(products,'RAM');assert.equal(getMetricOutcome(row,products),1);assert.equal(getRowWinnerId(row,products),base.id);
 assert.equal(getRowWinnerId(row,[...products,{...other,id:'fixture-c',specs:{}} as Product]),null);
 assert.equal(getMetricOutcome(row,pair('laptops',{ramGb:16},{ramGb:16})),'tie');
 assert.match(describeMetric(row,products),/16 GB daha yüksek kayıtlı değer/);
});
check('NaN/Infinity/string RAM cannot win',()=>{for(const v of [NaN,Infinity,'64',-1]){const products=pair('laptops',{ramGb:v},{ramGb:16});assert.equal(getMetricOutcome(find(products,'RAM'),products),'insufficient_data');}});
check('Storage stays 1024 GB instead of an erroneous 1.024 TB',()=>{const p=pair('laptops',{storageGb:1024},{storageGb:512});assert.equal(find(p,'Depolama').getValue(p[0]),'1.024 GB');});
check('NPU zero and boolean false remain distinct from missing values',()=>{const p=pair('laptops',{npuTops:0,muxSwitch:false},{});assert.equal(find(p,'NPU').getValue(p[0]),'0 TOPS');assert.equal(find(p,'MUX Switch').getValue(p[0]),'Yok');assert.equal(find(p,'MUX Switch').getValue(p[1]),'Bilinmiyor');});
check('Mixed categories never compare kg against grams or mAh against Wh',()=>{const products=[pair('laptops',{weightKg:2,batteryCapacityWh:50})[0],pair('smartphones',{}, {build:{weightGrams:180},battery:{capacitymAh:5000}})[1]];assert.equal(getComparisonRows(products).length,3);assert.ok(getComparisonRows(products).every(r=>getRowWinnerId(r,products)===null));});
check('Only two actual fresh offers can win a price comparison',()=>{const products=[{...base,storeOffers:[offer(42000)]},{...other,storeOffers:[offer(45000)]}];assert.equal(getMetricOutcome(find(products,'Güncel Mağaza Fiyatı'),products),1);assert.ok(generateRefereeVerdict(...products as [Product,Product]).scenarios.some(s=>s.winnerProductId===base.id&&s.label==='Güncel Mağaza Fiyatı'));});
check('Reference, stale, out-of-stock and search prices cannot claim current price advantage',()=>{
 for(const invalid of [[],[offer(10000,48)],[{...offer(10000),inStock:false}],[{...offer(10000),url:'https://example.com/?q=fixture'}]]){
  const products=[{...base,storeOffers:invalid},{...other,storeOffers:[offer(45000)]}];assert.equal(getMetricOutcome(find(products,'Güncel Mağaza Fiyatı'),products),'insufficient_data');
 }
});
check('Unknown panel, CPU, GPU and camera cannot become ideal-use or fabricated con claims',()=>{for(const c of ['smartphones','laptops','tvs','headphones']){const p=pair(c);const html=render(<CompareVerdictCard products={p}/>);assert.doesNotMatch(html,/85 \/ 100|Dahili Grafik|Yüksek yük altında fan|ses sızdırma|profesyonel|PS5|%50/i);assert.match(html,/Teknik özellik kaydı yok/);}});
check('Deep comparison renders unknown values without false section winner or tie',()=>{const p=pair('tvs');const html=render(<DeepCompareSections product1={p[0]} product2={p[1]}/>);assert.match(html,/Bilinmiyor/);assert.doesNotMatch(html,/4K Ultra HD|OLED \/ Mini|60 Hz|Dengeli|Lider|LABORATUVAR/);});
check('Full arena keeps RoboPengu but has no fake votes, live reference price or overall trophy',()=>{
 const p=pair('laptops');const html=render(<DuelArena product1={p[0]} product2={p[1]}/>);
 assert.match(html,/RoboPengu Düello Hakemi/);assert.match(html,/Genel kazananı belirlemek için yeterli doğrulanmış puan yok/);assert.match(html,/Katalog Referans Fiyatı/);assert.match(html,/yalnız bu tarayıcıda saklanır/);
 assert.doesNotMatch(html.replace(/<[^>]+>/g,' '),/54%|46%|1420|Canlı fiyat|Mağaza Teklifine Git|Live Comment|9\.0|8\.8|🏆|laboratuvar onaylı/);
});
check('No general product winner is invented even if catalog scores exist',()=>{const p=pair('smartphones');p[0].aceleEtmeScore=96;p[1].aceleEtmeScore=80;const html=render(<DuelArena product1={p[0]} product2={p[1]}/>);assert.match(html,/ölçüm yöntemi doğrulanmadı/);assert.match(html,/Genel kazananı belirlemek için yeterli doğrulanmış puan yok/);});
check('All public preset identifiers resolve to two real products in their declared category',()=>{
 for(const [category,preset] of Object.entries(DUEL_PRESETS)){
  const resolved=preset.ids.map(id=>getProductById(id));
  assert.ok(resolved.every(p=>p&&p.category===category),`Broken ${category} preset: ${preset.ids.join(', ')}`);
  assert.notEqual(resolved[0]!.id,resolved[1]!.id);
 }
});
check('Default comparison uses the exact preset model and capacity',()=>{
 assert.equal(DEFAULT_DUEL_P1.slug,'apple-iphone-16-pro-max-256-gb');
 assert.equal((DEFAULT_DUEL_P1 as Smartphone).specs.memory?.storageGb,256);
 assert.equal(DEFAULT_DUEL_P2.slug,'samsung-galaxy-s24-ultra');
 assert.deepEqual([DEFAULT_DUEL_P1.slug,DEFAULT_DUEL_P2.slug],DUEL_PRESETS.smartphones.ids);
});
check('Release years do not receive thousands separators',()=>{const p={...base,releaseYear:2024};assert.equal(find([p],'Çıkış Yılı').getValue(p),'2024');});
console.log(`\nComparison evidence: ${passed} PASS, 0 FAIL (pure functions + React server rendering, not browser E2E).`);
