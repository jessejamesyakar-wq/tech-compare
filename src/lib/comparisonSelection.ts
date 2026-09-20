import type {Product} from './types';

export function comparisonPath(products:Pick<Product,'id'|'slug'>[]):string {
  if(!products.length)return '/compare?empty=1';
  const query=new URLSearchParams();products.slice(0,4).forEach((p,i)=>query.set(`d${i+1}`,p.slug||p.id));
  return `/compare?${query.toString()}`;
}
export function replaceComparisonProduct(current:Product[],index:0|1,product:Product):Product[]{
  const next=[...current];next[index]=product;return next;
}
export function completeComparison(current:Product,added:Product,missingFirst:boolean):Product[]{
  return missingFirst?[added,current]:[current,added];
}
