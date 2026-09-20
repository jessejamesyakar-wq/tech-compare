import { writeFileSync } from 'node:fs';
import { getStoredProducts } from '../src/lib/adminData';
import { getEligibleDirectOffers } from '../src/lib/pricing/unifiedPriceEvaluator';
import { isSearchUrl } from '../src/lib/priceFreshness';
import { hasLegacyPhoneSpecs } from '../src/lib/smartphoneSpecFields';

// Read-only catalog inspection. A source entry's presence is NOT factual verification.
const now=Date.now(), products=getStoredProducts();
const categories:Record<string,ReturnType<typeof counters>>={};
function counters(){return {products:0,withFieldSourceMetadata:0,withProductSourceMetadata:0,sourceMetadataIssues:0,withExplicitUnresolvedFields:0,withAnyLegacyPhoneField:0,flatPhoneRecords:0,emptyPhoneSpecs:0,withEligibleFreshOffer:0,withEligibleStaleOffer:0};}
const findings:{id:string;name:string;issues:string[]}[]=[];
for(const product of products) {
 const count=categories[product.category]??=(counters());count.products++;
 const issues:string[]=[];
 if(product.fieldSources?.length)count.withFieldSourceMetadata++;
 if(product.sourceUrl)count.withProductSourceMetadata++;
 if(product.specVerification?.unresolvedFields.length) {count.withExplicitUnresolvedFields++;issues.push('explicit_unresolved_fields');}
 if(product.category==='smartphones') {
  if(hasLegacyPhoneSpecs(product.specs))count.withAnyLegacyPhoneField++;
  const specs=product.specs as unknown as Record<string,unknown>;
  if(hasLegacyPhoneSpecs(specs) && !specs.screen && !specs.memory)count.flatPhoneRecords++;
  if(!Object.keys(specs).length)count.emptyPhoneSpecs++;
 }
 for(const source of product.fieldSources || []) {
  if(isSearchUrl(source.sourceUrl))issues.push('field_source_not_direct');
  const date=Date.parse(source.checkedAt);
  if(!Number.isFinite(date)||date>now)issues.push('field_source_invalid_date');
  for(const field of source.fields) {
   let value:unknown=product;
   for(const key of field.split('.'))value=value&&typeof value==='object'?(value as Record<string,unknown>)[key]:undefined;
   if(value===undefined||value===null||value==='')issues.push(`source_points_to_missing_field:${field}`);
  }
 }
 if(issues.some(i=>i!=='explicit_unresolved_fields'))count.sourceMetadataIssues++;
 const offers=getEligibleDirectOffers(product.storeOffers,now);
 if(offers.freshDirectOffers.length)count.withEligibleFreshOffer++;
 if(offers.staleDirectOffers.length)count.withEligibleStaleOffer++;
 if(issues.length)findings.push({id:product.id,name:product.name,issues:[...new Set(issues)]});
}
const total=counters();for(const count of Object.values(categories))for(const key of Object.keys(total) as (keyof typeof total)[])total[key]+=count[key];
const report={checkedAt:new Date(now).toISOString(),scope:'Catalog metadata and application pricing eligibility only. No remote price fetch, no claim of factually verified products, no browser checks.',total,categories,findings};
console.log(JSON.stringify(report,null,2));
if(process.argv.includes('--write'))writeFileSync('docs/CATALOG-READINESS-2026-09-20.json',JSON.stringify(report,null,2)+'\n');
