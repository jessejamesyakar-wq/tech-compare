import assert from 'node:assert/strict';
import { getStoredProducts } from '../src/lib/adminData';
import { getProductById } from '../src/lib/data';
const { findCatalogIdentityConflicts } = require('./catalogIdentityCheck.cjs');

let passed=0;
const check=(name:string,run:()=>void)=>{run();passed++;console.log(`PASS: ${name}`);};
check('Same ID across two different categories is an error',()=>{
 const errors=findCatalogIdentityConflicts([['headphones',[{id:'zone',slug:'zone'}]],['appliances',[{id:'zone',slug:'other'}]]]);
 assert.equal(errors.length,1);assert.match(errors[0],/Duplicate global id/);
});
check('Same slug across different IDs/categories is an error',()=>{
 const errors=findCatalogIdentityConflicts([['headphones',[{id:'one',slug:'zone'}]],['appliances',[{id:'two',slug:'zone'}]]]);
 assert.equal(errors.length,1);assert.match(errors[0],/Duplicate global slug/);
});
check('Different identities do not conflict',()=>{assert.deepEqual(findCatalogIdentityConflicts([['a',[{id:'one',slug:'one'}]],['b',[{id:'two',slug:'two'}]]]),[]);});
check('Dataset/category disagreement is rejected before publishing',()=>{
 const errors=findCatalogIdentityConflicts([['tvs',[{id:'wrong-folder',slug:'wrong-folder',category:'monitors'}]]]);
 assert.equal(errors.length,1);assert.match(errors[0],/Category mismatch/);
});
check('LG monitor families cannot silently return through the TV template',()=>{
 for(const family of ['UltraGear','UltraWide','UltraFine','MyView']) {
  const errors=findCatalogIdentityConflicts([['tvs',[{id:family,slug:family,brand:'LG',name:`LG ${family} Example`,category:'tvs'}]]]);
  assert.equal(errors.length,1);assert.match(errors[0],/requires category verification/);
 }
});
check('Genuine LG TV names and correctly categorized monitors remain allowed',()=>{
 assert.deepEqual(findCatalogIdentityConflicts([['tvs',[{id:'oled-tv',slug:'oled-tv',brand:'LG',name:'LG OLED C5',category:'tvs'}]],['monitors',[{id:'ultragear',slug:'ultragear',brand:'LG',name:'LG UltraGear Example',category:'monitors'}]]]),[]);
});
const catalog=getStoredProducts();
check('Actual catalog has no duplicate global IDs or slugs',()=>{
 const groups=new Map<string,typeof catalog>();for(const p of catalog)groups.set(p.category,[...(groups.get(p.category)||[]),p]);
 assert.deepEqual(findCatalogIdentityConflicts(groups),[]);
});
check('Dyson Zone has one canonical headphones record and both identities resolve to it',()=>{
 const products=catalog.filter(p=>p.id==='dyson-zone-air-purifying-headphones');assert.equal(products.length,1);assert.equal(products[0].category,'headphones');
 assert.equal(getProductById('dyson-zone')?.category,'headphones');assert.equal(getProductById('dyson-zone-air-purifying-headphones')?.slug,'dyson-zone');
 assert.deepEqual(products[0].fieldSources?.at(-1)?.fields,['category']);
 assert.equal(products[0].fieldSources?.at(-1)?.sourceUrl,'https://www.dyson.com/support/headphones/zone');
});
console.log(`\nCatalog identity: ${passed} PASS, 0 FAIL; ${catalog.length} catalog records. No catalog writes.`);
