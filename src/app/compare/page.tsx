'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { DuelArena } from '@/components/compare/DuelArena';
import { DEFAULT_DUEL_P1, DEFAULT_DUEL_P2 } from '@/lib/defaultDuelProducts';
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

function CompareContent() {
  const searchParams = useSearchParams();
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [product1Error, setProduct1Error] = useState<string | null>(null);
  const [product2Error, setProduct2Error] = useState<string | null>(null);
  const [singleProductPrompt, setSingleProductPrompt] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Request counter for race condition protection (fast consecutive preset clicks or URL changes)
  const requestIdRef = useRef<number>(0);

  // Search Combobox for Single-Product prompt
  const [promptSearch, setPromptSearch] = useState('');
  const [promptResults, setPromptResults] = useState<Product[]>([]);
  const [promptLoading, setPromptLoading] = useState(false);

  // URL Query Sync
  const p1 = searchParams.get('d1') || searchParams.get('p1') || searchParams.get('phone1') || searchParams.get('product1') || searchParams.get('id1');
  const p2 = searchParams.get('d2') || searchParams.get('p2') || searchParams.get('phone2') || searchParams.get('product2') || searchParams.get('id2');

  const fetchProduct = async (id: string): Promise<Product | null> => {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(id)}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('Failed to fetch product for comparison', id, e);
    }
    return null;
  };

  useEffect(() => {
    let isMounted = true;
    const currentReqId = ++requestIdRef.current;

    async function loadFromUrl() {
      setLoading(true);
      setProduct1Error(null);
      setProduct2Error(null);
      setSingleProductPrompt(null);

      // Default behavior if NO query params are provided
      if (!p1 && !p2) {
        if (isMounted && currentReqId === requestIdRef.current) {
          setSelectedProducts([DEFAULT_DUEL_P1, DEFAULT_DUEL_P2]);
          setLoading(false);
        }
        return;
      }

      // If query params exist, fetch requested products independently (do NOT auto-fill missing side with defaults)
      const [item1, item2] = await Promise.all([
        p1 ? fetchProduct(p1) : Promise.resolve(null),
        p2 ? fetchProduct(p2) : Promise.resolve(null)
      ]);

      if (!isMounted || currentReqId !== requestIdRef.current) return;

      let err1: string | null = null;
      let err2: string | null = null;
      let singlePrompt: string | null = null;

      if (p1 && !item1) {
        err1 = `Karşılaştırılmak istenen 1. ürün ("${p1}") veritabanında bulunamadı.`;
      }
      if (p2 && !item2) {
        err2 = `Karşılaştırılmak istenen 2. ürün ("${p2}") veritabanında bulunamadı.`;
      }

      setProduct1Error(err1);
      setProduct2Error(err2);

      if (err1 || err2) {
        // Clear selection on error
        setSelectedProducts([]);
      } else if (item1 && item2) {
        // Both products are valid
        setSelectedProducts([item1, item2]);
      } else if (item1 && !p2) {
        // Only 1st product was requested in URL; prompt for 2nd product
        setSelectedProducts([item1]);
        singlePrompt = 'İkinci ürün seçilmedi. Karşılaştırmayı ve düello puanlarını görmek için lütfen ikinci bir cihaz seçin.';
      } else if (item2 && !p1) {
        // Only 2nd product was requested in URL; prompt for 1st product
        setSelectedProducts([item2]);
        singlePrompt = 'Birinci ürün seçilmedi. Karşılaştırmayı ve düello puanlarını görmek için lütfen birinci bir cihaz seçin.';
      } else {
        setSelectedProducts([]);
      }

      setSingleProductPrompt(singlePrompt);
      setLoading(false);
    }

    loadFromUrl();
    return () => {
      isMounted = false;
    };
  }, [p1, p2]);

  // Prompt search effect for single product missing side
  useEffect(() => {
    if (!promptSearch.trim() || promptSearch.trim().length < 2) {
      setPromptResults([]);
      setPromptLoading(false);
      return;
    }
    setPromptLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(promptSearch.trim())}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          setPromptResults(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error('Prompt search failed', e);
      } finally {
        setPromptLoading(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [promptSearch]);

  const handleSelectPreset = async (id1: string, id2: string) => {
    const currentReqId = ++requestIdRef.current;
    setLoading(true);
    setProduct1Error(null);
    setProduct2Error(null);
    setSingleProductPrompt(null);
    setSelectedProducts([]); // Clear existing duel during fetch to prevent displaying stale state

    const [item1, item2] = await Promise.all([fetchProduct(id1), fetchProduct(id2)]);

    // Guard against race conditions from fast consecutive clicks
    if (currentReqId !== requestIdRef.current) return;

    if (!item1 || !item2) {
      setSelectedProducts([]);
      if (!item1) setProduct1Error(`Seçilen düellodaki 1. ürün ("${id1}") veritabanında bulunamadı.`);
      if (!item2) setProduct2Error(`Seçilen düellodaki 2. ürün ("${id2}") veritabanında bulunamadı.`);
      setLoading(false);
      return;
    }

    setSelectedProducts([item1, item2]);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('d1', item1.slug || item1.id);
      url.searchParams.set('d2', item2.slug || item2.id);
      window.history.replaceState({}, '', url.toString());
    }
    setLoading(false);
  };

  const handleProductChange = (index: 0 | 1, newProduct: Product) => {
    const updated = [...selectedProducts];
    updated[index] = newProduct;
    setSelectedProducts(updated);
    setSingleProductPrompt(null);

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (updated[0]) url.searchParams.set('d1', updated[0].slug || updated[0].id);
      if (updated[1]) url.searchParams.set('d2', updated[1].slug || updated[1].id);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleAddSecondProduct = (product: Product) => {
    if (selectedProducts.length === 1) {
      handleProductChange(1, product);
    } else {
      handleProductChange(0, product);
    }
    setPromptSearch('');
    setPromptResults([]);
  };

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (selectedProducts[0]) url.searchParams.set('d1', selectedProducts[0].slug || selectedProducts[0].id);
    if (selectedProducts[1]) url.searchParams.set('d2', selectedProducts[1].slug || selectedProducts[1].id);
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6 py-2 sm:py-4">
      {/* Top Shortcuts & Share Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/95 backdrop-blur-md border border-slate-200/90 p-3 sm:p-4 rounded-2xl shadow-2xs">
        {/* Preset Fast Comparisons */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 text-xs">
          <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Popüler Düellolar:</span>
          </div>
          <button
            onClick={() => handleSelectPreset('msi-mag-255pxf', 'dell-g2524h')}
            className="bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
          >
            <Monitor className="w-3 h-3 text-cyan-600" />
            <span>MSI vs Dell 280Hz</span>
          </button>
          <button
            onClick={() => handleSelectPreset('apple-iphone-16-pro-max-256-gb', 'samsung-galaxy-s24-ultra')}
            className="bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
          >
            <PhoneIcon className="w-3 h-3 text-emerald-600" />
            <span>iPhone 16 Pro Max vs S24 Ultra</span>
          </button>
          <button
            onClick={() => handleSelectPreset('apple-macbook-pro-16-2-m5-max-18cpu-40gpu', 'lenovo-legion-5-pro-83lt005rtr')}
            className="bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
          >
            <LaptopIcon className="w-3 h-3 text-purple-600" />
            <span>M4 Max vs Legion Pro 7i</span>
          </button>
          <button
            onClick={() => handleSelectPreset('philips-65oled951-12', 'tcl-98c8k-2025')}
            className="bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
          >
            <Tv className="w-3 h-3 text-indigo-600" />
            <span>Philips vs TCL 98&quot;</span>
          </button>
        </div>

        {/* Share Button */}
        <button
          onClick={handleCopyLink}
          disabled={selectedProducts.length < 2}
          className="bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-xs font-bold px-3.5 py-1.5 rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
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

      {/* Loading State */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center space-y-4 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-sm">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
          <p className="text-slate-700 font-extrabold text-sm tracking-wide">
            Karşılaştırma ürünleri yükleniyor ve doğrulanıyor...
          </p>
        </div>
      )}

      {/* Explicit Error State */}
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
                setSelectedProducts([DEFAULT_DUEL_P1, DEFAULT_DUEL_P2]);
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

      {/* Single Product URL State (Only 1 product specified in URL, requesting 2nd selection) */}
      {!loading && !product1Error && !product2Error && selectedProducts.length === 1 && (
        <div className="space-y-6">
          <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs sm:text-sm font-bold shadow-2xs">
            <PlusCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{singleProductPrompt || 'Karşılaştırmayı başlatmak için lütfen ikinci bir cihaz seçin.'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Loaded 1st Product Preview */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm text-center space-y-3">
              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">1. Seçili Ürün</span>
              <h3 className="text-base font-black text-slate-900">{selectedProducts[0].name}</h3>
              <div className="h-40 flex items-center justify-center p-2 bg-slate-50 rounded-2xl border border-slate-100">
                <img src={selectedProducts[0].image} alt={selectedProducts[0].name} className="max-h-36 max-w-full object-contain" />
              </div>
              <div className="text-sm font-extrabold text-slate-900">
                {selectedProducts[0].basePrice ? `₺${selectedProducts[0].basePrice.toLocaleString('tr-TR')}` : '—'}
              </div>
            </div>

            {/* Prompt Card to Search / Select 2nd Product */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4 border border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                <Search className="w-4 h-4" />
                <span>2. Ürünü Seçin</span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                {selectedProducts[0].name} ile kıyaslamak istediğiniz cihazın adını yazın veya aşağıdaki popüler alternatiflerden birine tıklayın:
              </p>

              {/* Search input */}
              <div className="relative">
                <input
                  type="text"
                  value={promptSearch}
                  onChange={(e) => setPromptSearch(e.target.value)}
                  placeholder="İkinci cihaz adı arayın (örn. S24 Ultra, iPhone 16 Pro)..."
                  className="w-full py-2.5 px-3.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                />
                {promptLoading && <Loader2 className="absolute right-3 top-3 w-4 h-4 text-emerald-400 animate-spin" />}
              </div>

              {/* Search results dropdown/list */}
              {promptResults.length > 0 && (
                <div className="bg-slate-800 rounded-xl divide-y divide-slate-700/60 max-h-48 overflow-y-auto">
                  {promptResults.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleAddSecondProduct(p)}
                      className="w-full p-2.5 hover:bg-emerald-600/30 text-left text-xs font-bold transition flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate">{p.name}</span>
                      <span className="text-emerald-400 shrink-0 ml-2">₺{p.basePrice?.toLocaleString('tr-TR')}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Preset quick buttons */}
              <div className="pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Popüler Seçenekler:</span>
                <div className="flex flex-wrap gap-2 text-xs font-bold">
                  <button
                    onClick={() => handleSelectPreset(selectedProducts[0].slug || selectedProducts[0].id, 'samsung-galaxy-s24-ultra')}
                    className="bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white px-3 py-1.5 rounded-xl border border-slate-700 transition cursor-pointer"
                  >
                    + Galaxy S24 Ultra
                  </button>
                  <button
                    onClick={() => handleSelectPreset(selectedProducts[0].slug || selectedProducts[0].id, 'iphone-16-pro-max')}
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

      {/* Main Duel Arena - Rendered ONLY when both products are fully verified */}
      {!loading && selectedProducts.length >= 2 && !product1Error && !product2Error && (
        <DuelArena
          product1={selectedProducts[0]}
          product2={selectedProducts[1]}
          onProductChange={handleProductChange}
        />
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-slate-500 font-bold">Yükleniyor...</div>}>
      <CompareContent />
    </Suspense>
  );
}
