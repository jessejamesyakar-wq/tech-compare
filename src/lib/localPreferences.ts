import type { PriceAlert, Product } from './types';

export const COMPARE_KEY = 'tech_compare_list_ids';
export const LEGACY_COMPARE_KEY = 'tech_compare_list';
export const ALERTS_KEY = 'tech_price_alerts';
export const MAX_COMPARE = 4;
export interface PreferenceStorage { getItem(key:string):string|null; setItem(key:string,value:string):void; }
export type SavedResult<T> = { ok:true; value:T } | { ok:false; error:string };
const error = <T>(message:string):SavedResult<T> => ({ok:false,error:message});
const validId = (value:unknown):value is string => typeof value==='string' && value.trim().length>0 && value.length<500;
export const isValidTargetPrice = (value:unknown):value is number => typeof value==='number' && Number.isFinite(value) && value>0;

export function readCompareIds(storage:PreferenceStorage):SavedResult<string[]> {
  try {
    const raw=storage.getItem(COMPARE_KEY),legacy=raw===null?storage.getItem(LEGACY_COMPARE_KEY):null;
    const value=JSON.parse(raw??legacy??'[]') as unknown;
    if(!Array.isArray(value))return error('Karşılaştırma kaydı okunamadı. Mevcut kayıt değiştirilmedi.');
    const ids=legacy===null?value:value.map(item=>item&&typeof item==='object'?item.id:undefined);
    if(!ids.every(validId))return error('Karşılaştırma kaydı geçersiz öğeler içeriyor. Mevcut kayıt değiştirilmedi.');
    return {ok:true,value:[...new Set(ids)]};
  } catch {return error('Tarayıcıdaki karşılaştırma kaydı okunamadı. Mevcut kayıt değiştirilmedi.');}
}

export function changeCompareIds(storage:PreferenceStorage,change:(ids:string[])=>string[]):SavedResult<string[]> {
  const current=readCompareIds(storage);if(!current.ok)return current;
  const next=[...new Set(change(current.value))];
  if(next.length>MAX_COMPARE)return error(`En fazla ${MAX_COMPARE} ürün seçebilirsiniz. Önce bir ürünü listeden çıkarın.`);
  if(!next.every(validId))return error('Ürün kimliği geçersiz. Karşılaştırma kaydedilmedi.');
  try {storage.setItem(COMPARE_KEY,JSON.stringify(next));return {ok:true,value:next};}
  catch {return error('Karşılaştırma kaydedilemedi. Tarayıcınızın yerel depolama iznini ve boş alanını kontrol edin.');}
}

export function readPriceTargets(storage:PreferenceStorage):SavedResult<PriceAlert[]> {
  try {
    const parsed=JSON.parse(storage.getItem(ALERTS_KEY)??'[]') as unknown;
    if(!Array.isArray(parsed)||!parsed.every(a=>a&&typeof a==='object'&&validId(a.id)&&validId(a.productId)&&isValidTargetPrice(a.targetPrice)&&['productName','productImage','productUrl'].every(key=>a[key]===undefined||typeof a[key]==='string')))
      return error('Fiyat hedefi kaydı okunamadı. Eski kayıtlar korunuyor; üzerlerine yazılmadı.');
    if(new Set(parsed.map(a=>a.id)).size!==parsed.length)return error('Fiyat hedeflerinde yinelenen kimlik var. Eski kayıtlar korunuyor.');
    // Keep legacy fields in memory and on later writes; only display code ignores old email.
    return {ok:true,value:parsed as PriceAlert[]};
  } catch {return error('Fiyat hedefleri okunamadı. Tarayıcınızın yerel depolama erişimini kontrol edin.');}
}

export function changePriceTargets(storage:PreferenceStorage,change:(targets:PriceAlert[])=>PriceAlert[]):SavedResult<PriceAlert[]> {
  const current=readPriceTargets(storage);if(!current.ok)return current;
  const next=change(current.value);
  if(!next.every(a=>validId(a.id)&&validId(a.productId)&&isValidTargetPrice(a.targetPrice))||new Set(next.map(a=>a.id)).size!==next.length)
    return error('Geçerli bir ürün ve sıfırdan büyük hedef fiyat girin. Kayıt oluşturulmadı.');
  try {storage.setItem(ALERTS_KEY,JSON.stringify(next));return {ok:true,value:next};}
  catch {return error('Fiyat hedefi kaydedilemedi. Tarayıcınızın yerel depolama iznini ve boş alanını kontrol edin.');}
}

export function mergeHydratedProducts(ids:readonly string[],current:Product[],loaded:Product[]):Product[] {
  const byId=new Map([...loaded,...current].map(p=>[p.id,p]));
  return ids.flatMap(id=>{const product=byId.get(id);return product?[product]:[];});
}

export function isStoredProduct(value:unknown):value is Product {
  if(!value||typeof value!=='object')return false;
  const p=value as Product;
  return validId(p.id)&&typeof p.name==='string'&&typeof p.category==='string';
}
