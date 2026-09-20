const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');

// Deliberately scoped to manually reviewed source records. A valid file name,
// image hash or product count alone is not evidence of the right model.
function checkCatalogImageEvidence(products,entries,publicDir){
 const errors=[],seen=new Set(),root=path.resolve(publicDir);
 for(const entry of entries){
  if(seen.has(entry.id)){errors.push(`Duplicate image evidence: ${entry.id}`);continue;}seen.add(entry.id);
  const matches=products.filter(p=>p.id===entry.id);
  if(matches.length!==1){errors.push(`Image evidence needs one exact product: ${entry.id}`);continue;}
  const product=matches[0];
  if(product.imageSource && (product.imageSource.imagePath!==entry.imagePath || product.imageSource.sourceUrl!==entry.sourcePageUrl || product.imageSource.scopeNote!==entry.scope || product.imageSource.checkedAt!==entry.checkedAt))errors.push(`Displayed image source differs from reviewed evidence: ${entry.id}`);
  if(product.image!==entry.imagePath || !product.images?.includes(entry.imagePath))errors.push(`Reviewed image changed without updated source evidence: ${entry.id}`);
  if(entry.reviewedColorName){
   const colors=product.colorOptions||[],pendingColors=entry.unverifiedColorNames||[];
   const names=[entry.reviewedColorName,...pendingColors];
   if(new Set(names).size!==names.length || colors.length!==names.length || colors.some(c=>!names.includes(c.name)))errors.push(`Reviewed color scope changed: ${entry.id}`);
   for(const color of colors){
    const expected=color.name===entry.reviewedColorName?entry.imagePath:'/images/product-unverified.svg';
    if(color.image!==expected || color.images?.length!==1 || color.images[0]!==expected)errors.push(`Unreviewed color photograph: ${entry.id}:${color.name}`);
   }
  }
  for(const value of [entry.sourcePageUrl,entry.sourceImageUrl]){
   try{const u=new URL(value);if(!['https:','http:'].includes(u.protocol)||u.username||u.password)throw new Error();}
   catch{errors.push(`Invalid image source URL: ${entry.id}`);}
  }
  if(!Number.isFinite(Date.parse(entry.checkedAt))||Date.parse(entry.checkedAt)>Date.now())errors.push(`Invalid image evidence date: ${entry.id}`);
  const target=path.resolve(root,entry.imagePath?.replace(/^[/\\]+/,'')||'');
  if(!target.startsWith(root+path.sep)){errors.push(`Image source path leaves public directory: ${entry.id}`);continue;}
  if(!fs.existsSync(target)){errors.push(`Reviewed image missing: ${entry.id}`);continue;}
  const hash=crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex');
  if(hash!==entry.sha256)errors.push(`Reviewed image bytes changed without updated source evidence: ${entry.id}`);
 }
 return errors;
}
function checkPendingImageEvidence(products,entries,pending){
 const errors=[],seen=new Set(),reviewed=new Set(entries.map(e=>e.id));
 for(const entry of pending){
  if(seen.has(entry.id))errors.push(`Duplicate pending image: ${entry.id}`);
  seen.add(entry.id);
  if(reviewed.has(entry.id))errors.push(`Image is both reviewed and pending: ${entry.id}`);
  const matches=products.filter(p=>p.id===entry.id);
  if(matches.length!==1){errors.push(`Pending image needs one exact product: ${entry.id}`);continue;}
  const p=matches[0];
  const images=[p.image,...(p.images||[]),...(p.variants||[]).flatMap(v=>[v.image,...(v.images||[])]),...(p.colorOptions||[]).flatMap(c=>[c.image,...(c.images||[])].filter(Boolean))];
  if(entry.placeholderPath!=='/images/product-unverified.svg' || !p.images?.length || images.some(image=>image!==entry.placeholderPath)){
   errors.push(`Unreviewed model photograph restored while source is pending: ${entry.id}`);
  }
 }
 // A new placeholder also needs an explicit open work item, never a silent success.
 for(const p of products)if(p.image==='/images/product-unverified.svg'&&!seen.has(p.id))errors.push(`Missing pending image record: ${p.id}`);
 return errors;
}
module.exports={checkCatalogImageEvidence,checkPendingImageEvidence};
