'use client';

import React, { useState, useMemo, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Smartphone } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';
import { CompactProductCard } from '@/components/catalog/CompactProductCard';
import { CategoryIconStrip } from '@/components/layout/CategoryIconStrip';
import { evaluateProductPricing } from '@/lib/pricing/unifiedPriceEvaluator';
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

function PhonesContent({  initialPhones  }: PhonesContentProps) {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products] = useState<Smartphone[]>(initialPhones);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const requestedSort = searchParams.get('sortBy') || 'popular';
  const sortBy = ['popular', 'priceAsc', 'priceDesc', 'rating', 'newest'].includes(requestedSort) ? requestedSort : 'popular';
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Click/keyboard controlled disclosures also work on touch devices.
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [tabDropdownOpen, setTabDropdownOpen] = useState(false);
  const [menuMaxHeight, setMenuMaxHeight] = useState(320);

  const filtersRef = useRef<HTMLDivElement>(null);
  const brandButtonRef = useRef<HTMLButtonElement>(null);
  const tabButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!brandDropdownOpen && !tabDropdownOpen) return;
    const fitMenu = () => {
      const rowBottom = filtersRef.current?.getBoundingClientRect().bottom || 0;
      setMenuMaxHeight(Math.max(96, Math.min(window.innerHeight / 2, window.innerHeight - rowBottom - 24)));
    };
    fitMenu();
    const closeOutside = (event: PointerEvent) => {
      if (!filtersRef.current?.contains(event.target as Node)) {
        setBrandDropdownOpen(false); setTabDropdownOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      (brandDropdownOpen ? brandButtonRef : tabButtonRef).current?.focus();
      setBrandDropdownOpen(false); setTabDropdownOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    window.addEventListener('resize', fitMenu);
    window.addEventListener('scroll', fitMenu, true);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('resize', fitMenu);
      window.removeEventListener('scroll', fitMenu, true);
    };
  }, [brandDropdownOpen, tabDropdownOpen]);

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
      .map(([brand, count]) => ({ name: brand, count }));
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
    brandButtonRef.current?.focus();
    router.push(`/phones?${params.toString()}`, { scroll: false });
  };

  const prices = useMemo(() => new Map(products.map((product) => [product.id, evaluateProductPricing(product).displayPrice])), [products]);

  const displayProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Brand filter
        if (selectedBrand !== 'all' && p.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
          return false;
        }

        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLocaleLowerCase('tr-TR');
          const searchable = `${p.name} ${p.brand} ${JSON.stringify(p.specs?.camera || {})}`.toLocaleLowerCase('tr-TR');
          if (!searchable.includes(q)) return false;
        }

        // Tab filter
        const pName = p.name.toLowerCase();
        const price = prices.get(p.id) ?? Infinity;
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
            (Number.isFinite(price) && price >= 50000)
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
        if (sortBy === 'priceAsc' || sortBy === 'priceDesc') {
          const first = prices.get(a.id), second = prices.get(b.id);
          if (first == null) return second == null ? 0 : 1;
          if (second == null) return -1;
          return sortBy === 'priceAsc' ? first - second : second - first;
        }
        if (sortBy === 'rating') return (Number.isFinite(b.rating) ? b.rating! : -1) - (Number.isFinite(a.rating) ? a.rating! : -1);
        if (sortBy === 'newest') return (b.releaseYear || 0) - (a.releaseYear || 0);
        return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      });
  }, [products, prices, selectedBrand, searchQuery, activeTab, sortBy]);

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
              aria-label="Telefon kataloğunda ara"
              placeholder="Model, marka veya kamera ara..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(ITEMS_PER_PAGE);
              }}
              className="w-full min-h-11 bg-white dark:bg-slate-900 hover:bg-slate-50 focus:bg-white border border-slate-200 dark:border-slate-800 focus:border-emerald-600 rounded-full pl-9 pr-12 py-2.5 text-base sm:text-sm font-semibold text-slate-800 dark:text-slate-200 outline-none transition-all shadow-xs placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Katalog aramasını temizle"
                className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>

        {/* 🎯 HOVER FLYOUT FILTERS & MONETIZED SPONSORED DEAL BANNER ROW */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
          
          {/* Left: Hoverable Pill Dropdowns */}
          <div ref={filtersRef} onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
              setBrandDropdownOpen(false); setTabDropdownOpen(false);
            }
          }} className="flex items-center gap-2 flex-wrap relative z-30">
            
            {/* 1. Brand Hover Pill & Flyout Popover */}
            <div
              className="sm:relative"
            >
              <button
                ref={brandButtonRef}
                aria-expanded={brandDropdownOpen}
                aria-controls="phone-brand-options"
                onClick={() => { setBrandDropdownOpen((prev) => !prev); setTabDropdownOpen(false); }}
                className={`min-h-11 px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border shadow-2xs ${
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
                <div id="phone-brand-options" style={{ maxHeight: menuMaxHeight }} className="absolute top-full left-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-3.5rem)] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3 grid grid-cols-2 gap-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => handleSelectBrand('all')}
                    className={`min-h-11 col-span-2 text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
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
                        className={`min-h-11 text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
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
              className="sm:relative"
            >
              <button
                ref={tabButtonRef}
                aria-expanded={tabDropdownOpen}
                aria-controls="phone-segment-options"
                onClick={() => { setTabDropdownOpen((prev) => !prev); setBrandDropdownOpen(false); }}
                className={`min-h-11 px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border shadow-2xs ${
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
                <div id="phone-segment-options" style={{ maxHeight: menuMaxHeight }} className="absolute top-full left-0 mt-2 w-72 max-w-[calc(100vw-3.5rem)] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setVisibleCount(ITEMS_PER_PAGE);
                          setTabDropdownOpen(false);
                          tabButtonRef.current?.focus();
                        }}
                        className={`min-h-11 w-full text-left px-3 py-2 rounded-xl text-xs transition-colors ${
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
              aria-label="Telefonları sırala"
              value={sortBy}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('sortBy', e.target.value);
                router.push(`/phones?${params.toString()}`, { scroll: false });
                setVisibleCount(ITEMS_PER_PAGE);
              }}
              className="min-h-11 max-w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 rounded-full px-4 py-2 text-base sm:text-sm font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer transition-all shadow-2xs"
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
                className="min-h-11 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-full border border-rose-200 dark:border-rose-900 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Temizle</span>
                <X className="w-3 h-3" />
              </button>
            )}

          </div>

          {/* 💎 HIGH-VALUE SPONSORED DEAL & MONETIZATION BANNER (Freed Space) */}
          <Link
            href="/compare"
            className="group flex items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 hover:to-indigo-900 text-white px-4 py-2.5 rounded-2xl border border-slate-700 shadow-md transition-all hover:scale-[1.01] cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <span className="text-[11px] font-black tracking-wide text-emerald-300 block uppercase">
                  Karşılaştırma Masası
                </span>
                <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                  Modelleri yan yana incele
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-black text-amber-400 bg-white/10 px-2.5 py-1 rounded-lg shrink-0">
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Keşfet</span>
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
