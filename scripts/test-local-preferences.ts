import assert from 'node:assert/strict';
import {ALERTS_KEY,COMPARE_KEY,LEGACY_COMPARE_KEY,readCompareIds,changeCompareIds,readPriceTargets,changePriceTargets,mergeHydratedProducts,isValidTargetPrice} from '../src/lib/localPreferences';
import {comparisonPath,completeComparison,replaceComparisonProduct} from '../src/lib/comparisonSelection';
import type {Product,PriceAlert} from '../src/lib/types';

class MemoryStorage {
  values=new Map<string,string>(); writes=0;failRead=false;failWrite=false;
  getItem(key:string){if(this.failRead)throw new Error('denied');return this.values.get(key)??null;}
  setItem(key:string,value:string){if(this.failWrite)throw new Error('quota');this.writes++;this.values.set(key,value);}
}
let passed=0;const check=(name:string,test:()=>void)=>{test();passed++;console.log('PASS: '+name);};
const product=(id:string)=>({id,slug:id,name:id,category:'smartphones',basePrice:50000,specs:{}} as Product);
const target=(id:string):PriceAlert=>({id,productId:'fixture-product',targetPrice:42000,currentPrice:null,createdAt:'2026-09-19T00:00:00Z'});
check('Empty browser storage reads without any write',()=>{const s=new MemoryStorage();assert.deepEqual(readCompareIds(s),{ok:true,value:[]});assert.deepEqual(readPriceTargets(s),{ok:true,value:[]});assert.equal(s.writes,0);});
check('Legacy object selection becomes IDs in memory without deleting or rewriting the old key',()=>{const s=new MemoryStorage();const raw=JSON.stringify([product('a'),product('b')]);s.values.set(LEGACY_COMPARE_KEY,raw);assert.deepEqual(readCompareIds(s),{ok:true,value:['a','b']});assert.equal(s.writes,0);assert.equal(changeCompareIds(s,ids=>[...ids,'c']).ok,true);assert.equal(s.values.get(LEGACY_COMPARE_KEY),raw);});
check('Empty modern list does not resurrect legacy objects',()=>{const s=new MemoryStorage();s.values.set(LEGACY_COMPARE_KEY,JSON.stringify([product('a')]));s.values.set(COMPARE_KEY,'[]');assert.deepEqual(readCompareIds(s),{ok:true,value:[]});});
check('Corrupt or non-array lists block mutation and preserve exact original bytes',()=>{for(const raw of ['{broken','{}','[null]','[123]']){const s=new MemoryStorage();s.values.set(COMPARE_KEY,raw);assert.equal(changeCompareIds(s,()=>['new']).ok,false);assert.equal(s.values.get(COMPARE_KEY),raw);assert.equal(s.writes,0);}});
check('Comparison rejects a fifth product without losing existing four',()=>{const s=new MemoryStorage();s.values.set(COMPARE_KEY,'["a","b","c","d"]');assert.equal(changeCompareIds(s,ids=>[...ids,'e']).ok,false);assert.equal(s.values.get(COMPARE_KEY),'["a","b","c","d"]');});
check('Rapid successive selections read the most recent storage, not stale React state',()=>{const s=new MemoryStorage();assert.equal(changeCompareIds(s,ids=>[...ids,'a']).ok,true);assert.equal(changeCompareIds(s,ids=>[...ids,'b']).ok,true);assert.deepEqual(readCompareIds(s),{ok:true,value:['a','b']});});
check('Duplicate comparison IDs do not duplicate products',()=>{const s=new MemoryStorage();assert.deepEqual(changeCompareIds(s,()=>['a','a']),{ok:true,value:['a']});});
check('Storage read denial yields explicit failure',()=>{const s=new MemoryStorage();s.failRead=true;assert.equal(readCompareIds(s).ok,false);assert.equal(readPriceTargets(s).ok,false);});
check('Storage write denial does not change either saved list',()=>{const s=new MemoryStorage();s.values.set(COMPARE_KEY,'["a"]');s.values.set(ALERTS_KEY,'[]');s.failWrite=true;assert.equal(changeCompareIds(s,()=>[]).ok,false);assert.equal(changePriceTargets(s,()=>[target('t')]).ok,false);assert.equal(s.values.get(COMPARE_KEY),'["a"]');assert.equal(s.values.get(ALERTS_KEY),'[]');});
check('Late hydration cannot resurrect removed items or erase a new selection',()=>{assert.deepEqual(mergeHydratedProducts(['b','c'],[product('c')],[product('a'),product('b')]).map(p=>p.id),['b','c']);});
check('Clearing while hydration is pending remains empty after it finishes',()=>{assert.deepEqual(mergeHydratedProducts([],[],[product('a')]),[]);});
check('User-selected current product wins over an older hydration copy',()=>{assert.equal(mergeHydratedProducts(['a'],[{...product('a'),name:'current'}],[{...product('a'),name:'old'}])[0].name,'current');});
check('Legacy email and unknown extra fields survive another saved target',()=>{const s=new MemoryStorage();const legacy={...target('old'),email:'legacy@example.invalid',extra:'retain'};s.values.set(ALERTS_KEY,JSON.stringify([legacy]));assert.equal(changePriceTargets(s,old=>[target('new'),...old]).ok,true);assert.deepEqual(JSON.parse(s.values.get(ALERTS_KEY)!)[1],legacy);});
check('Only explicitly selected target is removed',()=>{const s=new MemoryStorage();s.values.set(ALERTS_KEY,JSON.stringify([target('a'),target('b')]));assert.deepEqual(changePriceTargets(s,old=>old.filter(t=>t.id!=='a')),{ok:true,value:[target('b')]});});
check('Targets reject zero, negatives, NaN, infinity and numeric strings',()=>{for(const amount of [0,-10,NaN,Infinity,'42',''])assert.equal(isValidTargetPrice(amount),false);assert.equal(isValidTargetPrice(0.01),true);});
check('Invalid target cannot reach storage',()=>{const s=new MemoryStorage();assert.equal(changePriceTargets(s,()=>[{...target('bad'),targetPrice:Infinity}]).ok,false);assert.equal(s.writes,0);});
check('Corrupt target JSON blocks overwrite',()=>{const s=new MemoryStorage();const raw='[{"id":"old","targetPrice":0}]';s.values.set(ALERTS_KEY,raw);assert.equal(changePriceTargets(s,old=>[target('new'),...old]).ok,false);assert.equal(s.values.get(ALERTS_KEY),raw);});
check('Duplicate target identity is rejected',()=>{const s=new MemoryStorage();assert.equal(changePriceTargets(s,()=>[target('a'),target('a')]).ok,false);});
check('Malformed display fields cannot crash a target card or overwrite legacy data',()=>{for(const field of ['productName','productImage','productUrl']){const s=new MemoryStorage();const raw=JSON.stringify([{...target('bad'),[field]:{invalid:true}}]);s.values.set(ALERTS_KEY,raw);assert.equal(readPriceTargets(s).ok,false);assert.equal(changePriceTargets(s,()=>[]).ok,false);assert.equal(s.values.get(ALERTS_KEY),raw);}});
check('Four selected products survive in the comparison URL',()=>{const query=new URL('https://example.invalid'+comparisonPath(['a','b','c','d'].map(product))).searchParams;assert.deepEqual([...query.entries()],[['d1','a'],['d2','b'],['d3','c'],['d4','d']]);});
check('Shared URL encodes unusual identifier characters',()=>{assert.equal(new URL('https://example.invalid'+comparisonPath([{id:'a&b',slug:'a&b'}])).searchParams.get('d1'),'a&b');});
check('Single d2 completion preserves the original second side',()=>{assert.deepEqual(completeComparison(product('second'),product('first'),true).map(p=>p.id),['first','second']);assert.deepEqual(completeComparison(product('first'),product('second'),false).map(p=>p.id),['first','second']);});
check('Two successive side changes preserve both current selections',()=>{const first=replaceComparisonProduct([product('a'),product('b')],0,product('c'));assert.deepEqual(replaceComparisonProduct(first,1,product('d')).map(p=>p.id),['c','d']);});
check('Explicitly empty comparison never links to the default duel',()=>{assert.equal(comparisonPath([]),'/compare?empty=1');});
console.log(`Local preferences and comparison selection: ${passed} PASS, 0 FAIL (pure functions; no browser storage or external messages changed).`);
