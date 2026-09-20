'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Product, PriceAlert } from '@/lib/types';
import { ALERTS_KEY, COMPARE_KEY, LEGACY_COMPARE_KEY, readCompareIds, readPriceTargets, changeCompareIds, changePriceTargets, mergeHydratedProducts, isStoredProduct } from '@/lib/localPreferences';

interface CompareContextType {
  compareList: Product[];
  addToCompare: (product: Product) => boolean;
  removeFromCompare: (productId: string) => boolean;
  clearCompare: () => boolean;
  isInCompare: (productId: string) => boolean;
  alerts: PriceAlert[];
  addAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt'>) => boolean;
  removeAlert: (id: string) => boolean;
  storageError: string;
  alertsReady: boolean;
}
const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [alertsReady, setAlertsReady] = useState(false);
  const [storageError, setStorageError] = useState('');
  const compareRef = useRef<Product[]>([]);
  const idsRef = useRef<string[]>([]);

  useEffect(() => {
    let active=true;
    let controller:AbortController|undefined;
    const load=()=>{
      // Alerts are local and never wait for product network requests.
      try {
        const result=readPriceTargets(window.localStorage);
        if(result.ok)setAlerts(result.value);else setStorageError(result.error);
      } catch {setStorageError('Yerel kayıtlara erişilemiyor. Tarayıcı depolama iznini kontrol edin.');}
      setAlertsReady(true);
      controller?.abort();controller=new AbortController();
      const signal=controller.signal;
      let ids:string[];
      try {
        const result=readCompareIds(window.localStorage);
        if(!result.ok){setStorageError(result.error);return;}
        ids=result.value;idsRef.current=ids;
      } catch {setStorageError('Karşılaştırma kaydına erişilemiyor.');return;}
      compareRef.current=mergeHydratedProducts(ids,compareRef.current,[]);
      setCompareList(compareRef.current);
      Promise.all(ids.map(async id=>{
        try {
          const response=await fetch(`/api/products/${encodeURIComponent(id)}`,{signal});
          if(!response.ok)return null;
          const product:unknown=await response.json();
          return isStoredProduct(product)&&product.id===id?product:null;
        } catch {return null;}
      })).then(products=>{
        if(!active||signal.aborted)return;
        const loaded=products.filter((p):p is Product=>p!==null);
        // A late response may enrich the current selection, never restore removed items.
        compareRef.current=mergeHydratedProducts(idsRef.current,compareRef.current,loaded);
        setCompareList(compareRef.current);
        if(loaded.length<ids.length)setStorageError('Kaydedilen bazı ürünler yüklenemedi. Kayıtlarınız korundu; sayfayı yeniden açarak tekrar deneyebilirsiniz.');
      });
    };
    load();
    const storageChanged=(event:StorageEvent)=>{if(event.key===null||[ALERTS_KEY,COMPARE_KEY,LEGACY_COMPARE_KEY].includes(event.key))load();};
    window.addEventListener('storage',storageChanged);
    return()=>{active=false;controller?.abort();window.removeEventListener('storage',storageChanged);};
  },[]);

  const changeSelection=(change:(ids:string[])=>string[],newProduct?:Product):boolean=>{
    try {
      const result=changeCompareIds(window.localStorage,change);
      if(!result.ok){setStorageError(result.error);return false;}
      idsRef.current=result.value;
      compareRef.current=mergeHydratedProducts(result.value,newProduct?[...compareRef.current,newProduct]:compareRef.current,[]);
      setCompareList(compareRef.current);setStorageError('');return true;
    } catch {setStorageError('Karşılaştırma kaydedilemedi. Yerel depolama erişimini kontrol edin.');return false;}
  };
  const addToCompare=(product:Product)=>isStoredProduct(product)?changeSelection(ids=>ids.includes(product.id)?ids:[...ids,product.id],product):false;
  const removeFromCompare=(id:string)=>changeSelection(ids=>ids.filter(item=>item!==id));
  const clearCompare=()=>changeSelection(()=>[]);
  const isInCompare=(id:string)=>compareList.some(p=>p.id===id);

  const changeAlerts=(change:(previous:PriceAlert[])=>PriceAlert[]):boolean=>{
    try {
      const result=changePriceTargets(window.localStorage,change);
      if(!result.ok){setStorageError(result.error);return false;}
      setAlerts(result.value);setStorageError('');return true;
    } catch {setStorageError('Fiyat hedefi kaydedilemedi. Yerel depolama erişimini kontrol edin.');return false;}
  };
  const addAlert=(data:Omit<PriceAlert,'id'|'createdAt'>)=>{
    const record:PriceAlert={...data,id:`alert-${crypto.randomUUID()}`,createdAt:new Date().toISOString()};
    return changeAlerts(previous=>[record,...previous]);
  };
  const removeAlert=(id:string)=>changeAlerts(previous=>previous.filter(item=>item.id!==id));

  return <CompareContext.Provider value={{compareList,addToCompare,removeFromCompare,clearCompare,isInCompare,alerts,addAlert,removeAlert,storageError,alertsReady}}>
    {children}
    {storageError&&<div role="alert" className="fixed left-4 right-4 bottom-4 z-[120] mx-auto max-w-xl flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 shadow-xl">
      <p className="flex-1 min-w-0 break-words">{storageError}</p><button type="button" onClick={()=>setStorageError('')} aria-label="Kayıt uyarısını kapat" className="min-w-11 min-h-11 rounded-xl border border-amber-300">✕</button>
    </div>}
  </CompareContext.Provider>;
}
export function useCompare(){const context=useContext(CompareContext);if(!context)throw new Error('useCompare must be used within a CompareProvider');return context;}
