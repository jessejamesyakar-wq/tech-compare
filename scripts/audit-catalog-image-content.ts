import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { getStoredProducts } from '../src/lib/adminData';

// Read-only byte identity audit: equal bytes are a review signal, not proof
// that storage/color variants may or may not share a model photo.
const products=getStoredProducts(),cache=new Map<string,string>();
const groups=new Map<string,{id:string;name:string;category:string;image:string}[]>();
for(const product of products){
 if(!product.image?.startsWith('/'))continue;
 const file=join('public',product.image);if(!existsSync(file))continue;
 let hash=cache.get(file);if(!hash){hash=createHash('sha256').update(readFileSync(file)).digest('hex');cache.set(file,hash);}
 const group=groups.get(hash)||[];group.push({id:product.id,name:product.name,category:product.category,image:product.image});groups.set(hash,group);
}
const repeated=[...groups].filter(([,items])=>items.length>1).map(([sha256,items])=>({sha256,productCount:items.length,pathCount:new Set(items.map(i=>i.image)).size,products:items})).sort((a,b)=>b.productCount-a.productCount);
const report={checkedAt:new Date().toISOString(),scope:'Primary image byte identity only; no factual model or color verification.',products:products.length,uniqueFiles:cache.size,repeatedGroups:repeated.length,groupsWithDifferentPaths:repeated.filter(g=>g.pathCount>1).length,groups:repeated};
console.log(JSON.stringify({...report,groups:repeated.slice(0,10).map(g=>({...g,products:g.products.slice(0,4)}))},null,2));
if(process.argv.includes('--write'))writeFileSync('docs/CATALOG-IMAGE-CONTENT-2026-09-20.json',JSON.stringify(report,null,2)+'\n');
