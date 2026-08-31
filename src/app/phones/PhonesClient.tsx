'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Smartphone } from '@/lib/types';
import { CompactProductCard } from '@/components/catalog/CompactProductCard';
import { CategoryIconStrip } from '@/components/layout/CategoryIconStrip';
import { Search, ChevronDown, SlidersHorizontal, X, Sparkles, Filter } from 'lucide-react';

const ITEMS_PER_PAGE = 24;

const TABS = [
  { id: 'all', label: 'Tümü' },
  { id: 'flagship', label: 'Amiral Gemisi & Pro' },
  { id: 'foldable', label: 'Katlanabilir' },
  { id: 'performance', label: 'Fiyat / Performans' },
  { id: 'camera', label: 'Kamera Odaklı' },
  { id: 'budget', label: 'Bütçe Dostu' }
];

interface PhonesContentProps {
  initialPhones: Smartphone[];
  initialBrands?: string[];
  initialBrandCounts?: Record<string, number>;
}

function PhonesContent({ initialPhones }: PhonesContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products] = useState<Smartphone[]>(initialPhones);
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
      .slice(0, 14);
  }, [products]);

  const handleSelectBrand = (brandName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (brandName === 'all') {
      params.delete('brand');
    } else {
      params.set('brand', brandName);
    }
    setVisibleCount(ITEMS_PER_PAGE);
    router.push(`/phones?${params.toString()}`, { scroll: false });
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
        const price = p.basePrice || 0;
        const mainMp = parseInt(p.specs?.camera?.mainMp || '0', 10);

        if (activeTab === 'flagship') {
          return (
            pName.includes('pro max') ||
            pName.includes('ultra') ||
            pName.includes('pro+') ||
            pName.includes('pura 70') ||
            pName.includes('mate 60') ||
            pName.includes('iphone 17') ||
            pName.includes('iphone 16 pro') ||
            pName.includes('s26') ||
            pName.includes('s25') ||
            pName.includes('s24 ultra') ||
            price >= 50000
          );
        } else if (activeTab === 'foldable') {
          return (
            pName.includes('fold') ||
            pName.includes('flip') ||
            pName.includes('magic v') ||
            pName.includes('mate x') ||
            pName.includes('razr')
          );
        } else if (activeTab === 'performance') {
          return (
            pName.includes('poco') ||
            pName.includes('redmi note') ||
            pName.includes('nova 12') ||
            pName.includes('galaxy a5') ||
            pName.includes('nothing phone') ||
            pName.includes('gt') ||
            (price >= 14000 && price <= 38000)
          );
        } else if (activeTab === 'camera') {
          return (
            mainMp >= 108 ||
            pName.includes('ultra') ||
            pName.includes('pro max') ||
            pName.includes('pixel') ||
            pName.includes('leica') ||
            pName.includes('xmage') ||
            pName.includes('hasselblad')
          );
        } else if (activeTab === 'budget') {
          return price < 15000 || pName.includes('galaxy a1') || pName.includes('redmi 1') || pName.includes('enjoy') || pName.includes('realme');
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priceAsc') return a.basePrice - b.basePrice;
        if (sortBy === 'priceDesc') return b.basePrice - a.basePrice;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return (b.releaseYear || 2024) - (a.releaseYear || 2024);
        return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      });
  }, [products, selectedBrand, searchQuery, activeTab, sortBy]);

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
      
      {/* 🌿 AIRY & REFINED CONTROL HUB (Single-Row Header on Desktop, Minimal on Mobile) */}
      <div className="pt-2 space-y-3">
        
        {/* Main Title & Search/Sort Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-2xs">
          
          {/* Left: Clean Heading & Badge */}
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Akıllı Telefonlar
            </h1>
            <span className="text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-700">
              {displayProducts.length} Model
            </span>
          </div>

          {/* Right: Integrated Search Input & Sort Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Telefon ara (model, marka)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(ITEMS_PER_PAGE);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100/80 focus:bg-white dark:focus:bg-slate-900 border border-slate-200/80 dark:border-slate-700 focus:border-emerald-600 rounded-full pl-9 pr-7 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setVisibleCount(ITEMS_PER_PAGE);
              }}
              className="bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100/80 border border-slate-200/80 dark:border-slate-700 rounded-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer transition-all shrink-0"
            >
              <option value="popular">Öne Çıkanlar</option>
              <option value="priceAsc">Fiyat: Düşükten Yükseğe</option>
              <option value="priceDesc">Fiyat: Yüksekten Düşüğe</option>
              <option value="rating">En Yüksek Puanlılar</option>
              <option value="newest">En Yeni Çıkanlar</option>
            </select>
          </div>

        </div>

        {/* 🏷️ STREAMLINED HORIZONTAL FILTER STRIP (Single Line Swipeable) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 scroll-smooth">
          
          {/* Segment Tags */}
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setVisibleCount(ITEMS_PER_PAGE);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            );
          })}

          <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 shrink-0 mx-1" />

          {/* All Brands Pill */}
          <button
            onClick={() => handleSelectBrand('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              selectedBrand === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-800'
            }`}
          >
            Tüm Markalar
          </button>

          {/* Dynamic Brand Pills */}
          {brands.map((b) => {
            const isSelected = selectedBrand.toLowerCase() === b.toLowerCase();
            return (
              <button
                key={b}
                onClick={() => handleSelectBrand(isSelected ? 'all' : b)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {b}
              </button>
            );
          })}

        </div>

      </div>

      {/* 🛍️ PRODUCT CARDS GRID (Directly Visible Above the Fold) */}
      {displayProducts.length > 0 ? (
        <div className="space-y-10 pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {displayProducts.slice(0, visibleCount).map((product, idx) => (
              <CompactProductCard key={product.id} product={product} index={idx} />
            ))}
          </div>

          {/* Load More Button */}
          {visibleCount < displayProducts.length && (
            <div className="text-center pt-4">
              <button
                onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs px-7 py-3 rounded-full shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <span>Daha Fazla Telefon Göster ({displayProducts.length - visibleCount} model kaldı)</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-slate-400 mt-2 font-medium">
                {visibleCount} / {displayProducts.length} model listeleniyor
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3 shadow-xs">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Seçilen filtrelere uygun telefon modeli bulunamadı.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              handleSelectBrand('all');
              setActiveTab('all');
            }}
            className="text-xs text-emerald-600 dark:text-emerald-400 font-bold underline cursor-pointer hover:text-emerald-700"
          >
            Filtreleri Temizle
          </button>
        </div>
      )}

      <CategoryIconStrip />
    </div>
  );
}

export function PhonesClient({ initialPhones, initialBrands, initialBrandCounts }: PhonesContentProps) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Yükleniyor...</div>}>
      <PhonesContent
        initialPhones={initialPhones}
        initialBrands={initialBrands}
        initialBrandCounts={initialBrandCounts}
      />
    </Suspense>
  );
}

export default PhonesClient;
