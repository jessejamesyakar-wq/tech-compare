import assert from 'node:assert/strict';
import { compareListingProducts, getCatalogDisplayPrices, getCatalogSearchText, normalizeCatalogQuery } from '../src/lib/catalogListing';
import { matchesApplianceSegment, matchesConsoleSegment, matchesMonitorSegment } from '../src/lib/catalogSegments';
import { mockAppliances } from '../src/lib/mockAppliances';
import { mockConsoles } from '../src/lib/mockConsoles';
import { mockMonitors } from '../src/lib/mockMonitors';
import type { StoreOffer } from '../src/lib/types';
import { toCatalogProduct } from '../src/lib/data';

let passed = 0;
function check(name: string, fn: () => void) { fn(); passed++; console.log(`PASS ${name}`); }
const product = (id: string, basePrice?: number, storeOffers?: StoreOffer[]) => ({ id, name: id, brand: 'Test', basePrice, storeOffers });
const offer = (price: number, hours: number) => ({ storeName: 'Test Store', price, inStock: true, url: 'https://example.com/product/1', lastCheckedAt: new Date(Date.now() - hours * 3600000).toISOString() } as StoreOffer);
const products = [product('fresh',90000,[offer(42000,2)]),product('reference',50000),product('stale',10000,[offer(65000,48)]),product('missing')];
const prices = getCatalogDisplayPrices(products);
check('sort uses displayed fresh/stale prices, not base price',()=>assert.deepEqual([...products].sort((a,b)=>compareListingProducts(a,b,'priceAsc',prices)).map(p=>p.id),['fresh','reference','stale','missing']));
check('missing price remains last when descending',()=>assert.deepEqual([...products].sort((a,b)=>compareListingProducts(a,b,'priceDesc',prices)).map(p=>p.id),['stale','reference','fresh','missing']));
check('two missing prices compare equally',()=>assert.equal(compareListingProducts(product('none1'),product('none2'),'priceDesc',prices),0));
check('Turkish search normalizes dotted and dotless I',()=>assert.equal(normalizeCatalogQuery('  IŞIK   İŞLEMCİ '),'isik islemci'));
const nestedText=getCatalogSearchText({...product('nested'),specs:{processor:{name:'Intel Core Ultra'},gpu:{name:'NVIDIA RTX 5070'},ramGb:32,refreshRateHz:144}});
for(const query of ['intel core','rtx 5070','32gb','144hz']) check(`nested specification search: ${query}`,()=>assert.ok(nestedText.includes(query)));
const airfryers=mockAppliances.filter(p=>(p.specs as any).subCategory==='airfryer');
check('catalog contains airfryer regression cases',()=>assert.ok(airfryers.length>0));
check('no airfryer enters climate results',()=>assert.ok(airfryers.every(p=>!matchesApplianceSegment(p,'climate'))));
check('catalog projection preserves all appliance subtypes',()=>assert.ok(mockAppliances.every(p=>(toCatalogProduct(p).specs as any).subCategory===(p.specs as any).subCategory)));
check('projected airfryers do not enter climate results',()=>assert.ok(airfryers.every(p=>!matchesApplianceSegment(toCatalogProduct(p),'climate'))));
check('projected cosmetics do not enter climate results',()=>{const rows=mockAppliances.filter(p=>(p.specs as any).subCategory==='cosmetics');assert.ok(rows.length>0);assert.ok(rows.every(p=>!matchesApplianceSegment(toCatalogProduct(p),'climate')));});
check('all explicit airfryers enter airfryer results',()=>assert.ok(airfryers.every(p=>matchesApplianceSegment(p,'airfryer'))));
for(const [sub,segment] of [['air_conditioner','climate'],['air_purifier','climate'],['coffee_machine','coffee'],['robot_vacuum','robot_vacuum'],['stick_vacuum','stick_vacuum']]) {
  check(`actual ${sub} catalog classification`,()=>{const rows=mockAppliances.filter(p=>(p.specs as any).subCategory===sub); assert.ok(rows.length>0); assert.ok(rows.every(p=>matchesApplianceSegment(p,segment)));});
}
check('brand alone does not imply coffee maker',()=>assert.equal(matchesApplianceSegment({name:'Delonghi Klima',specs:{subCategory:'air_conditioner'}},'coffee'),false));
check('unknown Dreame model is not assumed to be a robot vacuum',()=>assert.equal(matchesApplianceSegment({name:'Dreame Hair Dryer'},'robot_vacuum'),false));
const portables=mockConsoles.filter(p=>/Taşınabilir/.test((p.specs as any).deviceType||''));
check('catalog contains portable console cases',()=>assert.ok(portables.length>0));
check('portable and hybrid consoles do not enter home results',()=>assert.ok(portables.every(p=>!matchesConsoleSegment(p,'home'))));
check('portable consoles enter handheld results',()=>assert.ok(portables.every(p=>matchesConsoleSegment(p,'handheld'))));
check('stationary consoles preserved',()=>{const rows=mockConsoles.filter(p=>(p.specs as any).deviceType==='Sabit');assert.ok(rows.length>0);assert.ok(rows.every(p=>matchesConsoleSegment(p,'home')));});
for(const name of ['Meta Quest 3','PlayStation VR2','Unknown Console'])check(`home exclusion ${name}`,()=>assert.equal(matchesConsoleSegment({name},'home'),false));
check('VR2 correctly identified',()=>assert.equal(matchesConsoleSegment({name:'PlayStation VR2'},'vr'),true));
const wide=mockMonitors.filter(p=>(p.specs as any).screenSizeInches>34);
check('wide monitors no longer disappear above 34 inches',()=>{assert.ok(wide.length>0);assert.ok(wide.every(p=>matchesMonitorSegment(p,'32inch')));});
check('gaming brand alone does not imply 144Hz',()=>assert.equal(matchesMonitorSegment({name:'Odyssey Gaming',specs:{refreshRateHz:60}},'gaming'),false));
check('144Hz threshold is inclusive',()=>assert.equal(matchesMonitorSegment({name:'Monitor',specs:{refreshRateHz:144}},'gaming'),true));
check('missing display size not assigned a size group',()=>assert.equal(matchesMonitorSegment({name:'Monitor'},'32inch'),false));
console.log(`CATALOG LISTING: ${passed} PASS, 0 FAIL`);
