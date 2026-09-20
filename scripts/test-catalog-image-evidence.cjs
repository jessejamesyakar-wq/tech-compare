const assert=require('node:assert/strict'),fs=require('node:fs');
const {checkCatalogImageEvidence,checkPendingImageEvidence}=require('./catalogImageEvidence.cjs');
const products=JSON.parse(fs.readFileSync('src/lib/smartphonesData.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('data/catalog_image_sources.json','utf8'));
const archive=JSON.parse(fs.readFileSync('data/catalog_archives/samsung-image-facts-2026-09-20.json','utf8'));
let passed=0;const check=(label,fn)=>{fn();passed++;console.log('PASS: '+label);};
check('Manufacturer sourced images pass identity, source and byte checks',()=>{assert.equal(manifest.entries.length,9);assert.deepEqual(checkCatalogImageEvidence(products,manifest.entries,'public'),[]);assert.equal(new Set(manifest.entries.map(e=>e.sha256)).size,9);});
check('Samsung image changes retain identities and commercial records',()=>{for(const old of archive.original){const p=products.find(p=>p.id===old.id);const permitted=p.id==='samsung-samsung-galaxy-m53-5g-79'?['image','images','specs','highlights','fieldSources','specVerification']:['image','images'];for(const key of Object.keys(old))if(!permitted.includes(key))assert.deepEqual(p[key],old[key],`${p.id}:${key}`);assert.doesNotMatch(p.image,/m35/);}});
check('Wrong-model path cannot replace reviewed M51 image',()=>{const next=structuredClone(products),e=manifest.entries[0],p=next.find(p=>p.id===e.id);p.image='/images/phones/samsung/studio/samsung-samsung-galaxy-m35-5g-105.png';assert.ok(checkCatalogImageEvidence(next,[e],'public').some(e=>e.includes('Reviewed image changed')));});
check('Same path with modified bytes is rejected',()=>{const e={...manifest.entries[0],sha256:'0'.repeat(64)};assert.ok(checkCatalogImageEvidence(products,[e],'public').some(e=>e.includes('bytes changed')));});
check('Traversal, duplicate records and non-http source are rejected',()=>{
 const first=manifest.entries[0];
 assert.ok(checkCatalogImageEvidence(products,[{...first,imagePath:'/../../outside.png'}],'public').some(e=>e.includes('leaves public')));
 assert.ok(checkCatalogImageEvidence(products,[first,first],'public').some(e=>e.includes('Duplicate')));
 assert.ok(checkCatalogImageEvidence(products,[{...first,sourcePageUrl:'javascript:alert(1)'}],'public').some(e=>e.includes('Invalid image source')));
});
check('Retired cross-model image tools stop before any file or network access',()=>{
 const vm=require('node:vm');
 for(const file of ['assignAllUniquePhonePhotos.js','fixAllCrossBrandImages.js','fixBrokenPaths.js','buildCompleteHuaweiCatalog.js','enrichHuaweiCatalog.js','downloadAndLocalizeImages.js']){
  const code=fs.readFileSync('scripts/'+file,'utf8');let attemptedAccess=false;
  assert.throws(()=>vm.runInNewContext(code,{require(){attemptedAccess=true;throw new Error('Unexpected IO access');}}),/devre dışı/);
  assert.equal(attemptedAccess,false,file);
 }
});
check('Unverified image placeholders remain explicit open work and block wrong-photo restoration',()=>{
 assert.equal(manifest.pending.length,167);
 assert.deepEqual(checkPendingImageEvidence(products,manifest.entries,manifest.pending),[]);
 const first=manifest.pending[0],next=structuredClone(products),p=next.find(p=>p.id===first.id);
 p.images.push(first.previousImage);
 assert.ok(checkPendingImageEvidence(next,manifest.entries,manifest.pending).some(e=>e.includes('Unreviewed model photograph')));
 assert.ok(checkPendingImageEvidence(products,manifest.entries,manifest.pending.slice(1)).some(e=>e.includes('Missing pending')));
 assert.ok(checkPendingImageEvidence(products,[...manifest.entries,{id:first.id}],manifest.pending).some(e=>e.includes('both reviewed and pending')));
});
console.log(`\nImage evidence: ${passed} PASS, 0 FAIL (local catalog/source manifest checks).`);
