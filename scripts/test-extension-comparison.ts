import assert from 'node:assert/strict';
import {NextRequest} from 'next/server';
import {matchExtensionProduct} from '../src/lib/extensionProductMatcher';
import {GET,OPTIONS} from '../src/app/api/compare/route';
import {getStoredProducts,saveProduct,deleteProduct} from '../src/lib/adminData';
import type {Product,StoreOffer} from '../src/lib/types';

let passed=0;
const check=async(name:string,run:()=>unknown)=>{await run();passed++;console.log('PASS: '+name);};
const product=(id:string,name:string,storage?:number,ram?:number):Product=>({id,slug:id,name,brand:'Auditora',category:'smartphones',currency:'TL',image:'',highlights:[],storeOffers:[],priceHistory:[],specs:{memory:{storageGb:storage,ramGb:ram}}} as unknown as Product);
const rows=[
 product('s20','Auditora Galaxy S20 Ultra (128 GB)',128,8),product('s24','Auditora Galaxy S24 (128 GB)',128,8),product('s24ultra','Auditora Galaxy S24 Ultra (256 GB)',256,12),
 product('pro128','Auditora Phone 16 Pro (128 GB)',128,8),product('pro256','Auditora Phone 16 Pro (256 GB)',256,8),product('max256','Auditora Phone 16 Pro Max (256 GB)',256,8),
 product('max1024','Auditora Phone 16 Pro Max (1 TB)',1024,8),product('plus','Auditora Phone 16 Plus (128 GB)',128,8),product('base','Auditora Phone 16 (128 GB)',128,8),
 product('13t','Auditora Phone 13T (256 GB)',256,8),product('13','Auditora Phone 13 (256 GB)',256,8),
 product('plus-sign','Auditora Phone 12 Pro+ (256 GB)',256,8),product('12pro','Auditora Phone 12 Pro (256 GB)',256,8),
 product('four-g','Auditora Note 10 4G (128 GB)',128,4),product('five-g','Auditora Note 10 5G (128 GB)',128,8),
 product('ram8','Auditora Pad 11 8 GB RAM 256 GB',256,8),product('ram12','Auditora Pad 11 12 GB RAM 256 GB',256,12),
 product('claw088','Auditora Claw A1M-088TR (512 GB)',512,16),product('claw089','Auditora Claw A1M-089TR (1 TB)',1024,16),
 product('monitor','Auditora UltraGear 27GX790A-B'),product('monitor-b','Auditora UltraGear 27GX790B-B'),
 product('tb330','Auditora Tab M11 TB330 (128 GB)',128,4),product('black','Auditora Phone 10 128 GB Siyah',128,8),product('white','Auditora Phone 10 128 GB Beyaz',128,8),
];
async function main(){
for(const [query,id] of [
 ['Auditora Galaxy S 24 128GB Akıllı Telefon','s24'],['Galaxy S24 128 GB','s24'],['AUDITORA PHONE 16 PRO 128GB','pro128'],
 ['Auditora Phone 16 ProMax 256 GB','max256'],['Auditora Phone 16 Pro Max 1024GB','max1024'],['Auditora Phone 16 Pro Max 1 TB','max1024'],
 ['Auditora Phone 16 128 GB','base'],['Auditora Phone 13T 256 GB','13t'],['Auditora Phone 13 256 GB','13'],['Auditora Phone 12 Pro+ 256 GB','plus-sign'],
 ['Auditora Note 10 4G 128GB','four-g'],['Auditora Note 10 5G 128GB','five-g'],['Auditora Pad 11 8GB RAM 256GB','ram8'],['Auditora Pad 11 12GB RAM 256GB','ram12'],
 ['Auditora Claw A1M-089TR 1024GB','claw089'],['Auditora UltraGear 27GX790A-B Oyuncu Monitörü','monitor'],['Auditora Tab M11 TB330 128GB','tb330'],['Auditora Phone 10 128GB SİYAH','black'],
] as const)await check(query,()=>assert.equal(matchExtensionProduct(query,rows).product?.id,id));
for(const query of ['Auditora Galaxy S999 Ultra 128 GB','Auditora Galaxy S2 Ultra 128 GB','Auditora Phone 16 Pro 8 TB','Auditora Phone 16 Pro Max 2 TB','Auditora Phone 13 Ultra 256 GB','Auditora Phone 12 Pro Ultra 256 GB','Auditora Claw A1M-090TR 1 TB','Auditora UltraGear 27GX790A-Z','Auditora Tab M11 TB330 1 TB','Auditora Phone 16 Pro 128GB Kılıf','Auditora Phone 16 Pro 128GB Yenilenmiş','Auditora Phone 16 Pro 128GB + Kulaklık','Otherbrand Phone 16 Pro 128GB','Auditora','Phone 16 Pro 8GB RAM 128GB 256GB'])await check('Reject '+query,()=>assert.equal(matchExtensionProduct(query,rows).product,null));
await check('Pro never falls back to Pro Max when the exact model is missing',()=>assert.equal(matchExtensionProduct('Auditora Phone 16 Pro 256GB',rows.filter(p=>!p.id.startsWith('pro'))).product,null));
for(const query of ['Auditora Phone 16 Pro','Auditora Phone 16 Pro Max','Auditora Note 10 128GB','Auditora Pad 11 256GB'])await check('Require variant: '+query,()=>assert.equal(matchExtensionProduct(query,rows).status,'variant_required'));
await check('Duplicate identities are ambiguous regardless of order, price or available offer',()=>{
 const twins=[rows[3],{...rows[3],id:'duplicate',slug:'duplicate',basePrice:1}];
 for(const list of [twins,[...twins].reverse()])assert.equal(matchExtensionProduct('Auditora Phone 16 Pro 128GB',list).status,'ambiguous');
});
await check('Contradictory name/storage and unknown explicit RAM cannot match',()=>{
 assert.equal(matchExtensionProduct('Auditora Phone 16 Pro 128GB',[{...rows[3],specs:{memory:{storageGb:512}}} as Product]).product,null);
 assert.equal(matchExtensionProduct('Auditora Unknown 8GB RAM 256GB',[product('unknown','Auditora Unknown (256GB)',256)]).product,null);
});
await check('Known 5G metadata can qualify an explicit network; unknown/4G never inferred',()=>{
 const p={...rows[1],specs:{...rows[1].specs,connectivity:{has5G:true}}} as Product;
 assert.equal(matchExtensionProduct('Auditora Galaxy S24 5G 128GB',[p]).product?.id,'s24');
 for(const candidate of [rows[1],{...p,specVerification:{note:'pending',unresolvedFields:['specs.connectivity.has5G']}}])assert.equal(matchExtensionProduct('Auditora Galaxy S24 5G 128GB',[candidate]).product,null);
 assert.equal(matchExtensionProduct('Auditora Galaxy S24 4G 128GB',[p]).product,null);
});
await check('Real catalog identity examples preserve suffixes and storage',()=>{
 const catalog=getStoredProducts();
 assert.equal(matchExtensionProduct('Apple iPhone 16 Pro 128 GB',catalog).product?.slug,'apple-iphone-16-pro-128-gb');
 assert.equal(matchExtensionProduct('iPhone 16 Pro 8 TB',catalog).product,null);
 assert.equal(matchExtensionProduct('Samsung Galaxy S999 Ultra 512 GB',catalog).product,null);
 assert.equal(matchExtensionProduct('Samsung Galaxy S2',catalog).product,null);
 for(const category of new Set(catalog.map(p=>p.category))){const p=catalog.find(p=>p.category===category)!;assert.equal(matchExtensionProduct(p.id,catalog).product?.id,p.id);assert.equal(matchExtensionProduct(p.slug,catalog).product?.id,p.id);}
});
await check('HTTP boundary rejects missing/huge/control/duplicate queries and keeps CORS',async()=>{
 for(const query of ['', '?q=aa','?q='+('x'.repeat(501)),'?q=hello%00world','?q=one&q=two']){
  const res=await GET(new NextRequest('http://localhost/api/compare'+query));assert.equal(res.status,400);assert.equal(res.headers.get('Access-Control-Allow-Origin'),'*');assert.equal(res.headers.get('Cache-Control'),'no-store');assert.equal((await res.json()).match,null);
 }
 assert.equal((await OPTIONS()).headers.get('Access-Control-Allow-Methods'),'GET, OPTIONS');
});
const before=JSON.stringify(getStoredProducts());
const ids=['test-extension-exact','test-extension-sibling'];
assert.ok(ids.every(id=>!getStoredProducts().some(p=>p.id===id)));
const current:StoreOffer={storeName:'Audit Merchant',price:42000,inStock:true,url:'https://merchant.example/product/fixture',lastCheckedAt:new Date(Date.now()-3600000).toISOString()};
const exact=product(ids[0],'Fixturebrand Phone 22 Pro (256 GB)',256,8);exact.brand='Fixturebrand';
const sibling={...exact,id:ids[1],slug:ids[1],name:'Fixturebrand Phone 22 Pro Max (256 GB)',storeOffers:[{...current,price:1}]};
try{
 await saveProduct(sibling);
 for(const [name,offers,match] of [
  ['fresh direct stock',[current],true],['no offers',[],false],['unknown stock',[{...current,inStock:undefined}],false],['out of stock',[{...current,inStock:false}],false],['stale',[{...current,lastCheckedAt:new Date(Date.now()-48*3600000).toISOString()}],false],['future',[{...current,lastCheckedAt:'2099-01-01'}],false],['search link',[{...current,url:'https://merchant.example/search?q=test'}],false],
 ] as [string,StoreOffer[],boolean][]){
  await check('API '+name+' cannot fall back to available Pro Max',async()=>{
   await saveProduct({...exact,storeOffers:offers});const res=await GET(new NextRequest('http://localhost/api/compare?q=Fixturebrand%20Phone%2022%20Pro%20256GB'));assert.equal(res.status,200);
   const result=await res.json();if(match){assert.equal(result.match.productId,exact.id);assert.equal(result.match.bestPrice,42000);assert.equal(result.match.lastCheckedAt,current.lastCheckedAt);assert.equal(result.match.statusLabel,'Güncel Fiyat');assert.equal(result.match.allPrices.length,1);assert.match(result.match.aceleetmeUrl,/\/phones\/test-extension-exact$/);}else{assert.equal(result.match,null);assert.equal(result.reason,'no_fresh_offer');}
  });
 }
 await check('API dates preserve the observation instant and emit canonical UTC',async()=>{
  const instant=Date.now()-3600000;
  const offsetDate=new Date(instant+3*3600000).toISOString().replace('Z','+03:00');
  await saveProduct({...exact,storeOffers:[{...current,lastCheckedAt:offsetDate}]});
  const result=await (await GET(new NextRequest('http://localhost/api/compare?q='+encodeURIComponent(exact.id)))).json();
  assert.equal(result.match.lastCheckedAt,new Date(instant).toISOString());
  assert.equal(result.match.allPrices[0].lastCheckedAt,new Date(instant).toISOString());
 });
 await check('Unknown model/unsupported storage still return no match with an available sibling',async()=>{
  for(const query of ['Fixturebrand Phone 23 Pro 256GB','Fixturebrand Phone 22 Pro 8TB']){const res=await GET(new NextRequest('http://localhost/api/compare?q='+encodeURIComponent(query)));assert.equal((await res.json()).match,null);}
 });
}finally{for(const id of ids)await deleteProduct(id);assert.equal(JSON.stringify(getStoredProducts()),before);}
console.log(`\nExtension identity and API: ${passed} PASS. Real functions/HTTP handler with local process fixtures; no production writes or browser E2E.`);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
