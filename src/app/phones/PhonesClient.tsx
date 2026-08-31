'use client';

import React, { useState, useMemo, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Smartphone } from '@/lib/types';
import { CompactProductCard } from '@/components/catalog/CompactProductCard';
import { CategoryIconStrip } from '@/components/layout/CategoryIconStrip';
import {
  Search,
  ChevronDown,
  X,
  Sparkles,
  Layers,
  ArrowRight,
  Zap,
  ShoppingBag,
  ExternalLink,
  Flame
} from 'lucide-react';

const ITEMS_PER_PAGE = 24;

const TABS = [
  { id: 'all', label: 'Tüm Telefonlar', desc: 'Tüm segmentler ve bütçeler' },
  { id: 'flagship', label: 'Amiral Gemisi & Pro', desc: 'En güçlü işlemci ve ekranlar' },
  { id: 'foldable', label: 'Katlanabilir Modeller', desc: 'Fold ve Flip form faktörü' },
  { id: 'performance', label: 'Fiyat / Performans', desc: 'Bütçe dostu yüksek güç' },
  { id: 'camera', label: 'Kamera Odaklı', desc: '108MP+, periskop ve leica optik' },
  { id: 'budget', label: 'Giriş & Bütçe Dostu', desc: 'Temel günlük kullanım' }
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

  // Hover Popover States
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [tabDropdownOpen, setTabDropdownOpen] = useState(false);

  const brandTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tabTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      .map(([brand, count]) => ({ name: brand, count }))
      .slice(0, 16);
  }, [products]);

  const handleSelectBrand = (brandName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (brandName === 'all') {
      params.delete('brand');
    } else {
      params.set('brand', brandName);
    }
    setVisibleCount(ITEMS_PER_PAGE);
    setBrandDropdownOpen(false);
    router.push(`/phones?${params.toString()}`, { scroll: false });
  };

  // Hover Handlers with safety delay
  const handleBrandMouseEnter = () => {
    if (brandTimeoutRef.current) clearTimeout(brandTimeoutRef.current);
    setBrandDropdownOpen(true);
  };
  const handleBrandMouseLeave = () => {
    brandTimeoutRef.current = setTimeout(() => {
      setBrandDropdownOpen(false);
    }, 180);
  };

  const handleTabMouseEnter = () => {
    if (tabTimeoutRef.current) clearTimeout(tabTimeoutRef.current);
    setTabDropdownOpen(true);
  };
  const handleTabMouseLeave = () => {
    tabTimeoutRef.current = setTimeout(() => {
      setTabDropdownOpen(false);
    }, 180);
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

  const activeTabObj = TABS.find((t) => t.id === activeTab) || TABS[0];

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      
      {/* 🌿 TOP CONTROLS & SPONSORED BANNER ROW */}
      <div className="pt-2 space-y-3">
        
        {/* Main Title & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Akıllı Telefonlar
            </h1>
            <span className="text-xs font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-300/80 dark:border-emerald-800 shadow-2xs">
              {displayProducts.length} Model
            </span>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Model, marka veya kamera ara..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(ITEMS_PER_PAGE);
              }}
              className="w-full bg-white dark:bg-slate-900 hover:bg-slate-50 focus:bg-white border border-slate-200 dark:border-slate-800 focus:border-emerald-600 rounded-full pl-9 pr-8 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none transition-all shadow-xs placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>

        {/* 🎯 HOVER FLYOUT FILTERS & MONETIZED SPONSORED DEAL BANNER ROW */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
          
          {/* Left: Hoverable Pill Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap relative z-30">
            
            {/* 1. Brand Hover Pill & Flyout Popover */}
            <div
              className="relative"
              onMouseEnter={handleBrandMouseEnter}
              onMouseLeave={handleBrandMouseLeave}
            >
              <button
                onClick={() => setBrandDropdownOpen((prev) => !prev)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border shadow-2xs ${
                  selectedBrand !== 'all'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-emerald-500'
                }`}
              >
                <span>{selectedBrand === 'all' ? 'Tüm Markalar' : selectedBrand}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${brandDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Floating Frosted-Glass Brand Popover */}
              {brandDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3 grid grid-cols-2 gap-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => handleSelectBrand('all')}
                    className={`col-span-2 text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                      selectedBrand === 'all'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-black'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    Tüm Markaları Göster ({products.length})
                  </button>

                  {brands.map((b) => {
                    const isSelected = selectedBrand.toLowerCase() === b.name.toLowerCase();
                    return (
                      <button
                        key={b.name}
                        onClick={() => handleSelectBrand(b.name)}
                        className={`text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate">{b.name}</span>
                        <span className="text-[10px] opacity-60 ml-1">{b.count}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Category Segment Hover Pill & Flyout Popover */}
            <div
              className="relative"
              onMouseEnter={handleTabMouseEnter}
              onMouseLeave={handleTabMouseLeave}
            >
              <button
                onClick={() => setTabDropdownOpen((prev) => !prev)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border shadow-2xs ${
                  activeTab !== 'all'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-emerald-500'
                }`}
              >
                <span>{activeTabObj.label}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${tabDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Floating Frosted-Glass Segment Popover */}
              {tabDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 sm:w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setVisibleCount(ITEMS_PER_PAGE);
                          setTabDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors ${
                          isActive
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="font-bold">{tab.label}</div>
                        <div className={`text-[10px] ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                          {tab.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setVisibleCount(ITEMS_PER_PAGE);
              }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 rounded-full px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer transition-all shadow-2xs"
            >
              <option value="popular">Sırala: Öne Çıkanlar</option>
              <option value="priceAsc">Fiyat: Düşükten Yükseğe</option>
              <option value="priceDesc">Fiyat: Yüksekten Düşüğe</option>
              <option value="rating">En Yüksek Puanlılar</option>
              <option value="newest">En Yeni Çıkanlar</option>
            </select>

            {/* Active Filters Clear Button */}
            {(selectedBrand !== 'all' || activeTab !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  handleSelectBrand('all');
                  setActiveTab('all');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-full border border-rose-200 dark:border-rose-900 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Temizle</span>
                <X className="w-3 h-3" />
              </button>
            )}

          </div>

          {/* 💎 HIGH-VALUE SPONSORED DEAL & MONETIZATION BANNER (Freed Space) */}
          <Link
            href="/phones?sortBy=popular"
            className="group flex items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 hover:to-indigo-900 text-white px-4 py-2.5 rounded-2xl border border-slate-700 shadow-md transition-all hover:scale-[1.01] cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <span className="text-[11px] font-black tracking-wide text-emerald-300 block uppercase">
                  Günün Süper Fırsatları
                </span>
                <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                  Hepsiburada & MediaMarkt Canlı İndirimleri
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-black text-amber-400 bg-white/10 px-2.5 py-1 rounded-lg shrink-0">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>%35&apos;e Varan</span>
            </div>
          </Link>

        </div>

      </div>

      {/* 🛍️ PRODUCT CARDS GRID (Immediately Visible with Zero Clutter) */}
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
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs px-8 py-3.5 rounded-full shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
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
