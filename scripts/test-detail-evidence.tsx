import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';
import { ProductPriceSummary } from '../src/components/detail/ProductPriceSummary';
import { ReviewAvailability } from '../src/components/detail/ReviewAvailability';
import { TVSpecSheet } from '../src/components/detail/TVSpecSheet';
import { LaptopSpecSheet } from '../src/components/detail/LaptopSpecSheet';
import { BentoFeatureCards } from '../src/components/detail/BentoFeatureCards';
import { AIReviewSummaryCard } from '../src/components/ai/AIReviewSummaryCard';
import { AIUpgradeAdvisor } from '../src/components/ai/AIUpgradeAdvisor';
import { OutboundPriceModal } from '../src/components/outbound/OutboundPriceModal';
import { calculateTVScore } from '../src/lib/tvScoring';
import { getRecordedProductScore } from '../src/lib/productEvidence';
import { formatSpecValue } from '../src/lib/specFormatting';
import { formatObservedDate } from '../src/lib/dateParsing';
import type { Product, Smartphone, TVProduct, TVSpecs, LaptopSpecs, StoreOffer } from '../src/lib/types';

// Pure functions and actual React server rendering. No browser/HTTP claim,
// catalog mutation, injected route, or external store request is involved.
let passed=0;
function check(name:string,run:()=>void){run();passed++;console.log(`PASS: ${name}`);}
const ago=(h:number)=>new Date(Date.now()-h*3600000).toISOString();
const offer:StoreOffer={storeName:'Fixture Store',price:42000,url:'https://example.com/products/fixture',inStock:true,lastCheckedAt:ago(2)};
const product={id:'fixture',slug:'fixture-512-gb',name:'Fixture (512 GB)',category:'smartphones',basePrice:50000,sourceType:'unverified',specs:{},storeOffers:[offer]} as unknown as Product;
const priceHtml=(p:Partial<Product>,dark=false)=>render(<ProductPriceSummary product={p} dark={dark}/>);
check('Fresh actual component shows current price and actual eligible store count',()=>{
 const h=priceHtml(product);assert.match(h,/42\.000 TL/);assert.match(h,/Güncel Fiyat/);assert.match(h,/1 mağazada/);assert.doesNotMatch(h,/50\.000|Katalog Referans/);
});
check('48-hour offer shows historical price/date without an active store count',()=>{
 const date=ago(48),h=priceHtml({...product,storeOffers:[{...offer,lastCheckedAt:date}]});assert.match(h,/42\.000 TL/);assert.ok(h.includes(formatObservedDate(date)));assert.match(h,/Son Görülen Fiyat/);assert.doesNotMatch(h,/Güncel Fiyat|mağazada doğrulanmış/);
});
check('No offer is explicitly a reference price in light and dark themes',()=>{
 for(const dark of [false,true]){const h=priceHtml({...product,storeOffers:[]},dark);assert.match(h,/50\.000 TL/);assert.match(h,/Katalog Referans Fiyatı/);assert.match(h,/Fiyat doğrulanmadı/);}
});
check('Missing and non-finite prices never fabricate a displayed number',()=>{
 for(const value of [undefined,NaN,Infinity,0,-1]){const h=priceHtml({basePrice:value,storeOffers:[]});assert.match(h,/Fiyat bilgisi yok/);assert.doesNotMatch(h,/NaN|Infinity|30\.000|40\.000/);}
});
check('Unknown stock and search URLs cannot make detail price current',()=>{
 for(const changed of [{...offer,inStock:undefined},{...offer,url:'https://www.amazon.com.tr/s?k=fixture'}]){const h=priceHtml({...product,storeOffers:[changed]});assert.match(h,/Katalog Referans Fiyatı/);assert.doesNotMatch(h,/Güncel Fiyat/);}
});
check('Review availability cannot expose unsourced star/count ratings',()=>{const h=render(<ReviewAvailability/>);assert.match(h,/henüz yok/);assert.doesNotMatch(h,/4\.8|120\+|yorum sayısı/);});
check('Empty TV specs do not imply premium features or numeric specs',()=>{const h=render(<TVSpecSheet specs={{} as TVSpecs}/>);assert.match(h,/Bilinmiyor/);assert.doesNotMatch(h,/2\.000 nits|4 Adet|6E|2\.1|120 Hz|22 kg/);});
check('TV true/false/missing are distinct and recorded values survive',()=>{const h=render(<TVSpecSheet specs={{dolbyAtmos:false,dtsX:true,refreshRateHz:144,brightnessNits:650} as TVSpecs}/>);assert.match(h,/Dolby Atmos<\/dt><dd[^>]*>Yok/);assert.match(h,/DTS:X<\/dt><dd[^>]*>Var/);assert.match(h,/VRR<\/dt><dd[^>]*>Bilinmiyor/);assert.match(h,/144 Hz/);assert.match(h,/650 nits/);});
check('Phone features no longer manufacture ProMotion, IP68, 30W or OLED',()=>{const h=render(<BentoFeatureCards phone={product as Smartphone}/>);assert.match(h,/Bilinmiyor/);assert.doesNotMatch(h,/ProMotion|IP68|30 W|OLED|2\.600|50 MP|5G/);});
check('Phone wireless false stays no and missing stays unknown',()=>{
 for(const [value,label] of [[false,'Yok'],[undefined,'Bilinmiyor'],[true,'Var']] as const){const h=render(<BentoFeatureCards phone={{...product,specs:{battery:{wirelessCharging:value}}} as Smartphone}/>);assert.ok(h.includes(`Kablosuz Şarj Desteği</dt><dd class="text-sm font-bold break-words">${label}`));}
});
check('Laptop capacity remains visible alongside storage/RAM types',()=>{const h=render(<LaptopSpecSheet specs={{ramGb:32,ramType:'DDR5',storageGb:1024,storageType:'NVMe',muxSwitch:false} as LaptopSpecs}/>);assert.match(h,/32 GB • DDR5/);assert.match(h,/1024 GB • NVMe/);assert.match(h,/>Yok</);assert.doesNotMatch(h,/Lehimli|Optimus\)|NPU yok|DOĞRULANMIŞ/);});
check('Missing laptop specs are not permanently loading',()=>{assert.match(render(<LaptopSpecSheet/>),/henüz bulunmuyor/);});
check('AI reviews do not derive fictional sentiment from catalog rating/count',()=>{const h=render(<AIReviewSummaryCard product={{...product,rating:4.9,reviewCount:999} as Product}/>);assert.match(h,/yorum verisi henüz bulunmuyor/);assert.doesNotMatch(h,/999|120\+|%98|%85/);});
check('Upgrade advice links to actual selected product without invented uplift',()=>{const h=render(<AIUpgradeAdvisor currentProduct={product}/>);assert.match(h,/\/compare\?d1=fixture-512-gb/);assert.doesNotMatch(h,/9\.1|%50|%75|Kesinlikle/);});
check('Unknown TV specs cannot invent any category or overall score',()=>{const result=calculateTVScore({...product,category:'tvs'} as TVProduct);assert.equal(result.totalScore,null);for(const c of Object.values(result.categories)){assert.equal(c.score,null);assert.equal(c.details,'Katalogda bilgi yok');}});
check('Recorded scores are finite, bounded, preserve zero, never derived from stars',()=>{assert.equal(getRecordedProductScore({}),null);assert.equal(getRecordedProductScore({aceleEtmeScore:0}),0);assert.equal(getRecordedProductScore({aceleEtmeScore:Infinity,epeyScore:84}),84);assert.equal(getRecordedProductScore({aceleEtmeScore:101,epeyScore:-1}),null);});
check('Recorded TV fields survive without invented game/audio capabilities',()=>{const r=calculateTVScore({...product,category:'tvs',epeyScore:81,specs:{displayTech:'OLED',resolution:'4K',refreshRateHz:144}} as TVProduct);assert.equal(r.totalScore,81);assert.equal(r.categories.display.details,'OLED • 4K');assert.equal(r.categories.gaming.details,'144 Hz');assert.equal(r.categories.audio.details,'Katalogda bilgi yok');});
const outbound=(url:string,price:number|null=42000)=>render(<OutboundPriceModal isOpen onClose={()=>{}} productName="Fixture" storeName="Fixture Store" price={price} targetUrl={url} lastCheckedAt={ago(48)}/>);
check('Store search dialog cannot display an apparent verified product price',()=>{const h=outbound('https://www.amazon.com.tr/s?k=fixture');assert.match(h,/arama sonuçlarını/);assert.doesNotMatch(h,/42\.000|teyit edildi|Fiyat Doğrulandı/);assert.match(h,/role="dialog"/);assert.match(h,/aria-modal="true"/);});
check('Direct dialog labels its recorded price and explicitly does not run verification',()=>{const h=outbound(offer.url!);assert.match(h,/42\.000 TL/);assert.match(h,/Son görülen fiyat/);assert.match(h,/yeni bir fiyat veya stok kontrolü yapmaz/);assert.match(h,/target="_blank"/);});
check('Unsafe outbound links cannot produce a navigable anchor',()=>{for(const u of ['javascript:alert(1)','http://example.com/product','https://user:pass@example.com/product','invalid']){const h=outbound(u);assert.match(h,/bağlantısı geçersiz/);assert.doesNotMatch(h,/<a /);}});
check('Spec formatting preserves false/zero and handles nested data without object text',()=>{assert.equal(formatSpecValue(false),'Yok');assert.equal(formatSpecValue(0,'W'),'0 W');assert.equal(formatSpecValue(undefined),'Bilinmiyor');assert.equal(formatSpecValue(Infinity),'Bilinmiyor');assert.equal(formatSpecValue({chip:'Fixture',cores:8}),'chip: Fixture • cores: 8');});
console.log(`\nDetail evidence: ${passed} PASS, 0 FAIL (React server rendering + pure functions; not browser E2E).`);
