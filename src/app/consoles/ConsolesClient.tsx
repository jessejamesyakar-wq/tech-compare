'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product } from '@/lib/types';
import { CompactProductCard } from '@/components/catalog/CompactProductCard';
import { CategoryIconStrip } from '@/components/layout/CategoryIconStrip';
import { Search, ChevronDown } from 'lucide-react';

const ITEMS_PER_PAGE = 24;

const TABS = [
  { id: 'all', label: 'Tümü' },
  { id: 'home', label: 'Ev Konsolları' },
  { id: 'handheld', label: 'El Konsolları' },
  { id: 'retro', label: 'Retro & Mini Konsollar' },
  { id: 'vr', label: 'VR Başlıkları' }
];

function ConsolesContent({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products] = useState<Product[]>(initialProducts);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const brandParam = searchParams.get('brand');
  const selectedBrand = brandParam || 'all';

  // Available top brands derived dynamically
  const brands = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((p) => {
      if (p.brand) counts.set(p.brand, (counts.get(p.brand) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([brand]) => brand)
      .slice(0, 10);
  }, [products]);

  const handleSelectBrand = (brandName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (brandName === 'all') {
      params.delete('brand');
    } else {
      params.set('brand', brandName);
    }
    setVisibleCount(ITEMS_PER_PAGE);
    router.push(`/consoles?${params.toString()}`, { scroll: false });
  };

  const displayProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Brand filter
        if (selectedBrand !== 'all' && p.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
          return false;
        }

        // Search filter
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchesName = p.name.toLowerCase().includes(q);
          const matchesBrand = p.brand.toLowerCase().includes(q);
          if (!matchesName && !matchesBrand) return false;
        }

        // Tab filter
        const pName = p.name.toLowerCase();
        const pType = ((p.specs as any)?.deviceType || '').toLowerCase();

        if (activeTab === 'home') {
          return (
            pName.includes('playstation 5') ||
            pName.includes('ps5') ||
            pName.includes('xbox series') ||
            pType.includes('sabit') ||
            (!pName.includes('el konsolu') && !pName.includes('retro') && !pName.includes('vr'))
          );
        } else if (activeTab === 'handheld') {
          return (
            pName.includes('el konsolu') ||
            pName.includes('switch') ||
            pName.includes('deck') ||
            pName.includes('ally') ||
            pName.includes('legion go') ||
            pName.includes('claw') ||
            pName.includes('ayaneo') ||
            pType.includes('taşınabilir') ||
            pType.includes('el konsolu')
          );
        } else if (activeTab === 'retro') {
          return (
            pName.includes('anbernic') ||
            pName.includes('retro') ||
            pName.includes('atari') ||
            pName.includes('classic') ||
            pName.includes('miyoo') ||
            pName.includes('nostalji')
          );
        } else if (activeTab === 'vr') {
          return (
            pName.includes('vr') ||
            pName.includes('quest') ||
            pName.includes('sanal gerçeklik') ||
            pName.includes('vision')
          );
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priceAsc') return a.basePrice - b.basePrice;
        if (sortBy === 'priceDesc') return b.basePrice - a.basePrice;
        if (sortBy === 'rating') return b.rating - a.rating;
        return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      });
  }, [products, selectedBrand, searchQuery, activeTab, sortBy]);

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Header Section - Minimalist & Centered */}
      <div className="pt-4 pb-2 text-center space-y-3">
        <div className="text-xs text-slate-400 font-semibold flex items-center justify-center gap-1.5">
          <Link href="/" className="hover:text-slate-900 transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">Oyun Konsolları</span>
        </div>

        <div className="flex items-center justify-center gap-2.5">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Oyun Konsolları
          </h1>
          <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
            {displayProducts.length} Model
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto">
          PlayStation, Xbox, Nintendo Switch, Steam Deck ve el konsolları ile canlı mağaza fiyat karşılaştırmaları
        </p>

        {/* Minimalist Search & Sort Bar */}
        <div className="max-w-xl mx-auto pt-2 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Konsol ara (model, marka, SSD kapasitesi)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(ITEMS_PER_PAGE);
              }}
              className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200/90 focus:border-slate-800 rounded-full pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 outline-none transition-all shadow-2xs placeholder:text-slate-400"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setVisibleCount(ITEMS_PER_PAGE);
            }}
            className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200/90 rounded-full px-4 py-2.5 text-xs font-bold text-slate-800 outline-none cursor-pointer transition-all shadow-2xs"
          >
            <option value="popular">Öne Çıkanlar</option>
            <option value="priceAsc">Fiyat: Düşükten Yükseğe</option>
            <option value="priceDesc">Fiyat: Yüksekten Düşüğe</option>
            <option value="rating">En Yüksek Puanlılar</option>
          </select>
        </div>
      </div>

      {/* Segmented Form Factor Tabs (Apple / Scandinavian Style) */}
      <div className="border-b border-slate-200/80 flex items-center justify-center gap-2 sm:gap-8 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setVisibleCount(ITEMS_PER_PAGE);
              }}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold tracking-tight transition-all relative cursor-pointer whitespace-nowrap ${
                isActive ? 'text-slate-900' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <span>{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Minimalist Brand Chips */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1">
        <button
          onClick={() => handleSelectBrand('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            selectedBrand === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          Tüm Markalar
        </button>
        {brands.map((b) => {
          const isSelected = selectedBrand.toLowerCase() === b.toLowerCase();
          return (
            <button
              key={b}
              onClick={() => handleSelectBrand(isSelected ? 'all' : b)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {b}
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      {displayProducts.length > 0 ? (
        <div className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {displayProducts.slice(0, visibleCount).map((product, idx) => (
              <CompactProductCard key={product.id} product={product} index={idx} />
            ))}
          </div>

          {/* Load More Button */}
          {visibleCount < displayProducts.length && (
            <div className="text-center pt-6">
              <button
                onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-8 py-3.5 rounded-full shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <span>Daha Fazla Konsol Göster ({displayProducts.length - visibleCount} model kaldı)</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-slate-400 mt-2 font-medium">
                {visibleCount} / {displayProducts.length} model listeleniyor
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-12 text-center space-y-3">
          <p className="text-sm font-bold text-slate-700">Seçilen filtrelere uygun oyun konsolu modeli bulunamadı.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              handleSelectBrand('all');
              setActiveTab('all');
            }}
            className="text-xs text-emerald-700 font-bold underline cursor-pointer hover:text-emerald-800"
          >
            Filtreleri Temizle
          </button>
        </div>
      )}

      <CategoryIconStrip />
    </div>
  );
}

export default function ConsolesClient({ initialProducts }: { initialProducts: Product[] }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Yükleniyor...</div>}>
      <ConsolesContent initialProducts={initialProducts} />
    </Suspense>
  );
}
