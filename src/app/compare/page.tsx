'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
  Check
} from 'lucide-react';

function CompareContent() {
  const searchParams = useSearchParams();
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([DEFAULT_DUEL_P1, DEFAULT_DUEL_P2]);
  const [copiedLink, setCopiedLink] = useState(false);

  // URL Query Sync
  const p1 = searchParams.get('d1') || searchParams.get('p1') || searchParams.get('phone1') || searchParams.get('product1') || searchParams.get('id1');
  const p2 = searchParams.get('d2') || searchParams.get('p2') || searchParams.get('phone2') || searchParams.get('product2') || searchParams.get('id2');

  const fetchProduct = async (id: string): Promise<Product | null> => {
    try {
      const res = await fetch(`/api/products/${id}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('Failed to fetch product for comparison', id, e);
    }
    return null;
  };

  // Instant Parallel Sync if query parameters exist
  useEffect(() => {
    if (!p1 && !p2) return;
    let isMounted = true;
    async function loadFromUrl() {
      const [item1, item2] = await Promise.all([
        p1 ? fetchProduct(p1) : Promise.resolve(null),
        p2 ? fetchProduct(p2) : Promise.resolve(null)
      ]);
      if (!isMounted) return;
      setSelectedProducts((prev) => [
        item1 || prev[0] || DEFAULT_DUEL_P1,
        item2 || prev[1] || DEFAULT_DUEL_P2
      ]);
    }
    loadFromUrl();
    return () => {
      isMounted = false;
    };
  }, [p1, p2]);

  const handleSelectPreset = async (id1: string, id2: string) => {
    const [item1, item2] = await Promise.all([fetchProduct(id1), fetchProduct(id2)]);
    if (item1 && item2) {
      setSelectedProducts([item1, item2]);
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('d1', item1.slug || item1.id);
        url.searchParams.set('d2', item2.slug || item2.id);
        window.history.replaceState({}, '', url.toString());
      }
    }
  };

  const handleProductChange = (index: 0 | 1, newProduct: Product) => {
    setSelectedProducts((prev) => {
      const updated = [...prev];
      updated[index] = newProduct;
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (updated[0]) url.searchParams.set('d1', updated[0].slug || updated[0].id);
        if (updated[1]) url.searchParams.set('d2', updated[1].slug || updated[1].id);
        window.history.replaceState({}, '', url.toString());
      }
      return updated;
    });
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
            onClick={() => handleSelectPreset('iphone-16-pro-max', 'samsung-galaxy-s24-ultra')}
            className="bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
          >
            <PhoneIcon className="w-3 h-3 text-emerald-600" />
            <span>iPhone 16 Pro Max vs S24 Ultra</span>
          </button>
          <button
            onClick={() => handleSelectPreset('macbook-pro-16-m4-max-2024', 'lenovo-legion-pro-7i-gen9')}
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
          className="bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-3.5 py-1.5 rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
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

      {/* Main Duel Arena - Instant Zero Latency Paint */}
      {selectedProducts.length >= 2 && (
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
