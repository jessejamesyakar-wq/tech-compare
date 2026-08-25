'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { LaptopProduct } from '@/lib/types';
import { LaptopFilterSidebar, LaptopFilterState } from '@/components/catalog/LaptopFilterSidebar';
import { LaptopMediaMarktCard } from '@/components/catalog/LaptopMediaMarktCard';
import {
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Laptop as LaptopIcon,
  Search,
  RotateCcw
} from 'lucide-react';

const ITEMS_PER_PAGE = 20;

export default function LaptopsClient({ initialLaptops }: { initialLaptops: LaptopProduct[] }) {
  const [laptops] = useState<LaptopProduct[]>(initialLaptops);
  const [loading, setLoading] = useState<boolean>(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);

  // Filter State
  const [filters, setFilters] = useState<LaptopFilterState>({
    brands: [],
    productTypes: [],
    lenovoSeries: [],
    appleSeries: [],
    minPrice: 0,
    maxPrice: 250000,
    minScreenInch: 0,
    maxScreenInch: 18,
    searchQuery: ''
  });

  // Sort State
  const [sortBy, setSortBy] = useState<string>('best');

  // Filter Logic
  const filteredLaptops = useMemo(() => {
    return laptops.filter((laptop) => {
      // Brand filter
      if (filters.brands.length > 0) {
        if (!filters.brands.some((b) => b.toLowerCase() === laptop.brand.toLowerCase())) {
          return false;
        }
      }

      // Apple Series filter
      if (filters.appleSeries && filters.appleSeries.length > 0) {
        const matchApple = filters.appleSeries.some((s) =>
          laptop.brand.toLowerCase() === 'apple' &&
          (laptop.name.toLowerCase().includes(s.toLowerCase()) ||
           laptop.slug.toLowerCase().includes(s.toLowerCase().replace(' ', '-')))
        );
        if (!matchApple) return false;
      }

      // Lenovo Series filter
      if (filters.lenovoSeries && filters.lenovoSeries.length > 0) {
        const matchSeries = filters.lenovoSeries.some((s) =>
          laptop.name.toLowerCase().includes(s.toLowerCase()) ||
          laptop.slug.toLowerCase().includes(s.toLowerCase())
        );
        if (!matchSeries) return false;
      }

      // Product Type filter
      if (filters.productTypes.length > 0) {
        if (!filters.productTypes.includes(laptop.specs?.productType || laptop.productType)) {
          return false;
        }
      }

      // Price filter
      if (laptop.basePrice < filters.minPrice || laptop.basePrice > filters.maxPrice) {
        return false;
      }

      // Screen size filter
      const inch = laptop.specs?.screenSizeInches || 15.6;
      if (inch < filters.minScreenInch || inch > filters.maxScreenInch) {
        return false;
      }

      // Search query
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchName = laptop.name.toLowerCase().includes(q);
        const matchBrand = laptop.brand.toLowerCase().includes(q);
        const matchChip = (laptop.specs?.processor || '').toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchChip) return false;
      }

      return true;
    });
  }, [laptops, filters]);

  // Sort Logic
  const sortedLaptops = useMemo(() => {
    return [...filteredLaptops].sort((a, b) => {
      if (sortBy === 'priceAsc') return a.basePrice - b.basePrice;
      if (sortBy === 'priceDesc') return b.basePrice - a.basePrice;
      if (sortBy === 'newest') return (b.releaseYear || 2025) - (a.releaseYear || 2025);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      // 'best' default sort: combination of rating score and isPopular/isFeatured
      return (b.rating || 0) * 100 + (b.reviewCount || 0) - ((a.rating || 0) * 100 + (a.reviewCount || 0));
    });
  }, [filteredLaptops, sortBy]);

  const paginatedLaptops = useMemo(() => {
    return sortedLaptops.slice(0, visibleCount);
  }, [sortedLaptops, visibleCount]);

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Sticky Accordion Filter Sidebar */}
        <LaptopFilterSidebar
          laptops={laptops}
          filters={filters}
          onFilterChange={setFilters}
          totalProductsCount={sortedLaptops.length}
          isOpenMobile={mobileFilterOpen}
          onCloseMobile={() => setMobileFilterOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 w-full space-y-6">
          
          {/* Top Bar Header (MediaMarkt style Title & Sort Dropdown) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <LaptopIcon className="w-6 h-6 text-emerald-600" />
                <span>Bilgisayar & Laptop ({sortedLaptops.length} ürün)</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Lenovo (ThinkPad, Yoga, IdeaPad, Legion, LOQ, ThinkBook), Apple, Asus, HP ve Dell modellerinde 8 mağaza canlı fiyat takibi
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Toggle Button */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden bg-slate-900 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                <span>Filtrele ({sortedLaptops.length})</span>
              </button>

              {/* Sort Dropdown (MediaMarkt Style "Sırala") */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2">
                <label htmlFor="sort-select" className="text-xs font-bold text-slate-500 whitespace-nowrap">
                  Sırala
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-xs font-black text-slate-900 outline-none cursor-pointer pr-1"
                >
                  <option value="best">En iyi sonuçlar</option>
                  <option value="priceAsc">Fiyat: Düşükten Yükseğe</option>
                  <option value="priceDesc">Fiyat: Yüksekten Düşüğe</option>
                  <option value="rating">En Yüksek Puanlılar</option>
                  <option value="newest">En Yeniler (2026)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Search & Filter Tags Bar */}
          {(filters.brands.length > 0 || (filters.appleSeries || []).length > 0 || (filters.lenovoSeries || []).length > 0 || filters.productTypes.length > 0 || filters.searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 bg-emerald-50/60 border border-emerald-200/80 p-3 rounded-2xl">
              <span className="text-xs font-bold text-emerald-800">Aktif Filtreler:</span>

              {filters.brands.map((b) => (
                <span
                  key={b}
                  className="bg-white border border-emerald-300 text-emerald-800 font-extrabold text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-2xs"
                >
                  <span>Marka: {b}</span>
                  <button
                    onClick={() =>
                      setFilters({ ...filters, brands: filters.brands.filter((x) => x !== b) })
                    }
                    className="hover:text-rose-600 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}

              {(filters.appleSeries || []).map((s) => (
                <span
                  key={s}
                  className="bg-slate-900 text-white font-extrabold text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-2xs"
                >
                  <span>MacBook: {s}</span>
                  <button
                    onClick={() =>
                      setFilters({
                        ...filters,
                        appleSeries: (filters.appleSeries || []).filter((x) => x !== s)
                      })
                    }
                    className="hover:text-rose-300 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}

              {(filters.lenovoSeries || []).map((s) => (
                <span
                  key={s}
                  className="bg-emerald-600 text-white font-extrabold text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-2xs"
                >
                  <span>Lenovo: {s}</span>
                  <button
                    onClick={() =>
                      setFilters({
                        ...filters,
                        lenovoSeries: (filters.lenovoSeries || []).filter((x) => x !== s)
                      })
                    }
                    className="hover:text-rose-200 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}

              {filters.productTypes.map((t) => (
                <span
                  key={t}
                  className="bg-white border border-emerald-300 text-emerald-800 font-extrabold text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-2xs"
                >
                  <span>Tip: {t}</span>
                  <button
                    onClick={() =>
                      setFilters({
                        ...filters,
                        productTypes: filters.productTypes.filter((x) => x !== t)
                      })
                    }
                    className="hover:text-rose-600 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}

              <button
                onClick={() =>
                  setFilters({
                    brands: [],
                    productTypes: [],
                    lenovoSeries: [],
                    appleSeries: [],
                    minPrice: 0,
                    maxPrice: 250000,
                    minScreenInch: 0,
                    maxScreenInch: 18,
                    searchQuery: ''
                  })
                }
                className="text-xs font-extrabold text-rose-600 hover:underline ml-auto"
              >
                Filtreleri Temizle
              </button>
            </div>
          )}

          {/* Product List Stack (MediaMarkt List View Format) */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : sortedLaptops.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Aradığınız kriterlere uygun bilgisayar bulunamadı</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
                Filtre kriterlerinizi genişleterek veya arama teriminizi değiştirerek tekrar deneyebilirsiniz.
              </p>
              <button
                onClick={() =>
                  setFilters({
                    brands: [],
                    productTypes: [],
                    lenovoSeries: [],
                    appleSeries: [],
                    minPrice: 0,
                    maxPrice: 250000,
                    minScreenInch: 0,
                    maxScreenInch: 18,
                    searchQuery: ''
                  })
                }
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-6 py-3 rounded-full shadow-md"
              >
                Tüm Filtreleri Temizle
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                {paginatedLaptops.map((laptop, idx) => (
                  <LaptopMediaMarktCard key={laptop.id} laptop={laptop} index={idx} />
                ))}
              </div>

              {/* Load More Button */}
              {visibleCount < sortedLaptops.length && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
                    className="inline-flex items-center gap-2 bg-slate-900 hover:bg-emerald-600 text-white font-extrabold text-xs px-8 py-3.5 rounded-2xl shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <span>Daha Fazla Laptop Göster ({sortedLaptops.length - visibleCount} model kaldı)</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <p className="text-[11px] text-slate-400 mt-2 font-semibold">
                    {visibleCount} / {sortedLaptops.length} model listeleniyor
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
