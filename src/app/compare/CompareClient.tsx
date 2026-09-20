'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { DuelArena } from '@/components/compare/DuelArena';
import { CompareMatrix } from '@/components/compare/CompareMatrix';
import { ProductPriceSummary } from '@/components/detail/ProductPriceSummary';
import { comparisonPath, completeComparison, replaceComparisonProduct } from '@/lib/comparisonSelection';
import { isStoredProduct } from '@/lib/localPreferences';
import { DUEL_PRESETS } from '@/lib/duelPresets';
import {
  Sparkles,
  Smartphone as PhoneIcon,
  Laptop as LaptopIcon,
  Tv,
  Monitor,
  Share2,
  Check,
  AlertTriangle,
  Loader2,
  RefreshCw,
  PlusCircle,
  Search
} from 'lucide-react';

interface CompareClientProps {
  defaultProducts: [Product, Product];
}

function CompareContent({ defaultProducts }: CompareClientProps) {
  const searchParams = useSearchParams();
  const [selectedProducts, updateSelectedProducts] = useState<Product[]>([]);
  const selectedRef=useRef<Product[]>([]);
  const setSelectedProducts=(products:Product[])=>{selectedRef.current=products;updateSelectedProducts(products);};
  const writeSelection=(products:Product[])=>{setSelectedProducts(products);setSingleProductPrompt(null);window.history.replaceState({},'',comparisonPath(products));};
  const [loading, setLoading] = useState(true);
  const [product1Error, setProduct1Error] = useState<string | null>(null);
  const [product2Error, setProduct2Error] = useState<string | null>(null);
  const [singleProductPrompt, setSingleProductPrompt] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copyError, setCopyError] = useState('');

  const requestIdRef = useRef<number>(0);

  const [promptSearch, setPromptSearch] = useState('');
  const [promptResults, setPromptResults] = useState<Product[]>([]);
  const [promptLoading, setPromptLoading] = useState(false);
  const [promptError,setPromptError]=useState('');

  const p1 = searchParams.get('d1') || searchParams.get('p1') || searchParams.get('phone1') || searchParams.get('product1') || searchParams.get('id1');
  const p2 = searchParams.get('d2') || searchParams.get('p2') || searchParams.get('phone2') || searchParams.get('product2') || searchParams.get('id2');

  const p3=searchParams.get('d3'),p4=searchParams.get('d4');
  const explicitlyEmpty=searchParams.get('empty')==='1';
  const missingFirst=!!p2&&!p1;

  const fetchProduct = async (id: string): Promise<Product | null> => {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(id)}`);
      if (res.ok) {const product:unknown=await res.json();return isStoredProduct(product)?product:null;}
    } catch (e) {
      console.error('Failed to fetch product for comparison', id, e);
    }
    return null;
  };

  useEffect(() => {
    let isMounted = true;
    const currentReqId = ++requestIdRef.current;

    async function loadFromUrl() {
      const requested=[p1,p2,p3,p4].filter((id):id is string=>!!id);
      // Internal selection changes already hold complete products; keep pending side requests alive.
      if(requested.length===selectedRef.current.length && requested.length>0 && requested.every((id,index)=>[selectedRef.current[index].id,selectedRef.current[index].slug].includes(id))){setLoading(false);return;}
      setLoading(true);setProduct1Error(null);setProduct2Error(null);setSingleProductPrompt(null);
      if(!requested.length){
        setSelectedProducts(explicitlyEmpty?[]:defaultProducts);setLoading(false);return;
      }
      const products=await Promise.all(requested.map(fetchProduct));
      if(!isMounted||currentReqId!==requestIdRef.current)return;
      const missing=requested.filter((_,index)=>!products[index]);
      if(missing.length){setSelectedProducts([]);setProduct1Error('Karşılaştırma ürünü bulunamadı: '+missing.join(', '));}
      else {
        const resolved=products as Product[];
        if(new Set(resolved.map(p=>p.id)).size!==resolved.length){setSelectedProducts([]);setProduct1Error('Karşılaştırmak için farklı ürünler seçin.');}
        else {setSelectedProducts(resolved);if(resolved.length===1)setSingleProductPrompt(missingFirst?'Birinci ürün seçilmedi. Karşılaştırmayı görmek için bir cihaz seçin.':'İkinci ürün seçilmedi. Karşılaştırmayı görmek için bir cihaz seçin.');}
      }
      setLoading(false);
    }

    loadFromUrl();
    return () => {
      isMounted = false;
    };
  }, [p1, p2, p3, p4, explicitlyEmpty, defaultProducts]);

  useEffect(()=>{
    const controller=new AbortController();setPromptResults([]);setPromptError('');
    if(promptSearch.trim().length<2){setPromptLoading(false);return()=>controller.abort();}
    setPromptLoading(true);
    const timer=setTimeout(async()=>{
      try {
        const response=await fetch('/api/search?q='+encodeURIComponent(promptSearch.trim())+'&limit=6',{signal:controller.signal});
        if(!response.ok)throw new Error('Search failed');
        const result=await response.json();
        if(!controller.signal.aborted)setPromptResults(Array.isArray(result)?result.filter(isStoredProduct):[]);
      }catch {if(!controller.signal.aborted)setPromptError('Arama tamamlanamadı. Yeniden deneyin.');}
      finally {if(!controller.signal.aborted)setPromptLoading(false);}
    },200);
    return()=>{clearTimeout(timer);controller.abort();};
  },[promptSearch]);

  const handleSelectPreset = async (id1: string, id2: string) => {
    const currentReqId = ++requestIdRef.current;
    setLoading(true);
    setProduct1Error(null);
    setProduct2Error(null);
    setSingleProductPrompt(null);
    setSelectedProducts([]);

    const [item1, item2] = await Promise.all([fetchProduct(id1), fetchProduct(id2)]);

    if (currentReqId !== requestIdRef.current) return;

    if (!item1 || !item2) {
      setSelectedProducts([]);
      if (!item1) setProduct1Error(`Seçilen düellodaki 1. ürün ("${id1}") veritabanında bulunamadı.`);
      if (!item2) setProduct2Error(`Seçilen düellodaki 2. ürün ("${id2}") veritabanında bulunamadı.`);
      setLoading(false);
      return;
    }

    writeSelection([item1,item2]);
    setLoading(false);
  };

  const handleProductChange=(index:0|1,product:Product)=>{
    writeSelection(replaceComparisonProduct(selectedRef.current,index,product));
  };
  const handleAddSecondProduct=async(product:Pick<Product,'id'>)=>{
    const current=selectedRef.current[0];if(!current)return;
    const selectionRequest=++requestIdRef.current;setPromptLoading(true);setPromptError('');
    const fullProduct=await fetchProduct(product.id);
    if(selectionRequest!==requestIdRef.current)return;
    setPromptLoading(false);
    if(!fullProduct){setPromptError('Seçilen ürün yüklenemedi. Yeniden deneyin.');return;}
    if(fullProduct.id===current.id){setPromptError('Karşılaştırmak için farklı bir ürün seçin.');return;}
    writeSelection(completeComparison(current,fullProduct,missingFirst));setPromptSearch('');setPromptResults([]);
  };

  const handleCopyLink = async () => {
    if (typeof window === 'undefined') return;
    const url = new URL(comparisonPath(selectedRef.current),window.location.origin);
    setCopyError('');
    try {await navigator.clipboard.writeText(url.toString());setCopiedLink(true);setTimeout(()=>setCopiedLink(false),2500);}
    catch {setCopiedLink(false);setCopyError('Bağlantı kopyalanamadı. Tarayıcının pano iznini kontrol edin.');}
  };

  return (
    <div className="space-y-6 py-2 sm:py-4">
      {copyError && <p role="alert" className="text-sm text-rose-700">{copyError}</p>}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/95 backdrop-blur-md border border-slate-200/90 p-3 sm:p-4 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 text-xs">
          <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Popüler Düellolar:</span>
          </div>
          <button
            onClick={() => handleSelectPreset(...DUEL_PRESETS.monitors.ids)}
            className="bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-700 border border-slate-200 min-h-11 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
          >
            <Monitor className="w-3 h-3 text-cyan-600" />
            <span>{DUEL_PRESETS.monitors.label}</span>
          </button>
          <button
            onClick={() => handleSelectPreset(...DUEL_PRESETS.smartphones.ids)}
            className="bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-700 border border-slate-200 min-h-11 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
          >
            <PhoneIcon className="w-3 h-3 text-emerald-600" />
            <span>{DUEL_PRESETS.smartphones.label}</span>
          </button>
          <button
            onClick={() => handleSelectPreset(...DUEL_PRESETS.laptops.ids)}
            className="bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-700 border border-slate-200 min-h-11 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
          >
            <LaptopIcon className="w-3 h-3 text-purple-600" />
            <span>{DUEL_PRESETS.laptops.label}</span>
          </button>
          <button
            onClick={() => handleSelectPreset(...DUEL_PRESETS.tvs.ids)}
            className="bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-700 border border-slate-200 min-h-11 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
          >
            <Tv className="w-3 h-3 text-indigo-600" />
            <span>{DUEL_PRESETS.tvs.label}</span>
          </button>
        </div>

        <button
          onClick={handleCopyLink}
          disabled={selectedProducts.length < 2}
          className="bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-xs font-bold min-h-11 px-3.5 py-1.5 rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
          title="Bu düellonun bağlantısını kopyala"
        >
          {copiedLink ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-extrabold">Kopyalandı!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Düelloyu Paylaş</span>
            </>
          )}
        </button>
      </div>

      {loading && (
        <div className="py-20 flex flex-col items-center justify-center space-y-4 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-sm">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
          <p className="text-slate-700 font-extrabold text-sm tracking-wide">
            Karşılaştırma ürünleri yükleniyor ve doğrulanıyor...
          </p>
        </div>
      )}

      {!loading && (product1Error || product2Error) && (
        <div className="py-12 px-6 bg-amber-50/90 border border-amber-200/90 rounded-3xl text-center space-y-4 shadow-sm my-4">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto text-amber-600">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Aradığınız Karşılaştırma Ürünü Bulunamadı</h2>
          <div className="max-w-md mx-auto space-y-1.5 text-sm font-semibold text-amber-900">
            {product1Error && <p className="bg-amber-100/60 py-2 px-3 rounded-xl">{product1Error}</p>}
            {product2Error && <p className="bg-amber-100/60 py-2 px-3 rounded-xl">{product2Error}</p>}
          </div>
          <p className="text-xs text-slate-600 max-w-sm mx-auto font-medium">
            İstenen ürün veritabanında bulunamadı. Lütfen URL&apos;deki parametreleri kontrol edin veya kataloğumuzdaki modelleri seçin.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.history.replaceState({}, '', '/compare');
                }
                setSelectedProducts(defaultProducts);
                setProduct1Error(null);
                setProduct2Error(null);
                setSingleProductPrompt(null);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Varsayılan Düelloya Dön</span>
            </button>
            <Link
              href="/search"
              className="bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs px-5 py-2.5 rounded-xl border border-slate-300 transition shadow-xs"
            >
              Katalogda Ürün Ara
            </Link>
          </div>
        </div>
      )}

      {!loading && !product1Error && !product2Error && selectedProducts.length === 1 && (
        <div className="space-y-6">
          <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs sm:text-sm font-bold shadow-2xs">
            <PlusCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{singleProductPrompt || 'Karşılaştırmayı başlatmak için lütfen ikinci bir cihaz seçin.'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm text-center space-y-3">
              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">{missingFirst?'2. Seçili Ürün':'1. Seçili Ürün'}</span>
              <h3 className="text-base font-black text-slate-900">{selectedProducts[0].name}</h3>
              <div className="h-40 flex items-center justify-center p-2 bg-slate-50 rounded-2xl border border-slate-100">
                <img src={selectedProducts[0].image} alt={selectedProducts[0].name} className="max-h-36 max-w-full object-contain" />
              </div>
              <div className="text-sm font-extrabold text-slate-900">
                <ProductPriceSummary product={selectedProducts[0]} compact/>
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4 border border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                <Search className="w-4 h-4" />
                <span>{missingFirst?'1. Ürünü Seçin':'2. Ürünü Seçin'}</span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                {selectedProducts[0].name} ile kıyaslamak istediğiniz cihazın adını yazın veya aşağıdaki popüler alternatiflerden birine tıklayın:
              </p>

              <div className="relative">
                <input
                  type="text"
                  value={promptSearch}
                  onChange={(e) => setPromptSearch(e.target.value)}
                  aria-label="Eksik karşılaştırma cihazını ara" placeholder="Cihaz adı arayın (örn. S24 Ultra)..."
                  className="w-full py-2.5 px-3.5 bg-slate-800 border border-slate-700 rounded-xl min-h-11 text-base font-semibold text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                />
                {promptLoading && <Loader2 className="absolute right-3 top-3 w-4 h-4 text-emerald-400 animate-spin" />}
              </div>

              {promptError&&<p role="alert" className="text-sm text-rose-300">{promptError}</p>}
              {promptResults.length > 0 && (
                <div className="bg-slate-800 rounded-xl divide-y divide-slate-700/60 max-h-48 overflow-y-auto">
                  {promptResults.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleAddSecondProduct(p)}
                      className="w-full min-h-11 p-3 hover:bg-emerald-600/30 text-left text-sm font-bold transition space-y-2 cursor-pointer"
                    >
                      <span className="block break-words">{p.name}</span>
                      <ProductPriceSummary product={p} compact dark/>
                    </button>
                  ))}
                </div>
              )}

              <div className="pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Popüler Seçenekler:</span>
                <div className="flex flex-wrap gap-2 text-xs font-bold">
                  <button
                    onClick={() => handleAddSecondProduct({id:'samsung-galaxy-s24-ultra'})}
                    className="bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white px-3 py-1.5 rounded-xl border border-slate-700 transition cursor-pointer"
                  >
                    + Galaxy S24 Ultra
                  </button>
                  <button
                    onClick={() => handleAddSecondProduct({id:'iphone-16-pro-max'})}
                    className="bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white px-3 py-1.5 rounded-xl border border-slate-700 transition cursor-pointer"
                  >
                    + iPhone 16 Pro Max
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && !product1Error && !product2Error && (selectedProducts.length>2 || (explicitlyEmpty&&selectedProducts.length===0)) && <CompareMatrix products={selectedProducts} onRemove={id=>writeSelection(selectedRef.current.filter(p=>p.id!==id))} onClear={()=>writeSelection([])}/>}
      {!loading && selectedProducts.length === 2 && !product1Error && !product2Error && (
        <DuelArena
          product1={selectedProducts[0]}
          product2={selectedProducts[1]}
          onProductChange={handleProductChange}
        />
      )}
    </div>
  );
}

export default function CompareClient({ defaultProducts }: CompareClientProps) {
  return (
    <Suspense fallback={<div className="py-24 text-center text-slate-500 font-bold">Yükleniyor...</div>}>
      <CompareContent defaultProducts={defaultProducts} />
    </Suspense>
  );
}
