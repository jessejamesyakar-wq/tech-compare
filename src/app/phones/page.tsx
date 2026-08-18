'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n/context';
import { filterSmartphones, getAllBrands, getAllSmartphones } from '@/lib/data';
import { Smartphone, FilterOptions } from '@/lib/types';
import { PhoneCard } from '@/components/catalog/PhoneCard';
import { PhoneFilterSidebar } from '@/components/catalog/PhoneFilterSidebar';
import { BrandPillBar } from '@/components/catalog/BrandPillBar';
import { SlidersHorizontal, ArrowUpDown, Sparkles } from 'lucide-react';

function PhoneCatalogContent() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const brandParam = searchParams.get('brand');

  const [phones, setPhones] = useState<Smartphone[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [brandCounts, setBrandCounts] = useState<Record<string, number>>({});
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState<FilterOptions>({
    brands: brandParam ? [brandParam] : [],
    minPrice: undefined,
    maxPrice: undefined,
    minRam: undefined,
    minStorage: undefined,
    only5G: false,
    sortBy: 'rating'
  });

  useEffect(() => {
    getAllBrands().then((res) => setAvailableBrands(res));
    getAllSmartphones().then((all) => {
      const counts: Record<string, number> = {};
      all.forEach((p) => {
        if (p.brand) {
          counts[p.brand] = (counts[p.brand] || 0) + 1;
        }
      });
      setBrandCounts(counts);
    });
  }, []);

  useEffect(() => {
    if (brandParam) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilters((prev) => ({ ...prev, brands: [brandParam] }));
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilters((prev) => ({ ...prev, brands: [] }));
    }
  }, [brandParam]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    filterSmartphones({
      brand: filters.brands,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minRamGb: filters.minRam,
      minStorageGb: filters.minStorage,
      has5GOnly: filters.only5G,
      sortBy: filters.sortBy
    }).then((res) => {
      setPhones(res);
      setIsLoading(false);
    });
  }, [filters]);

  const handlePillSelect = (brandName: string | null) => {
    if (!brandName) {
      router.push('/phones');
      setFilters({ ...filters, brands: [] });
    } else {
      router.push(`/phones?brand=${encodeURIComponent(brandName)}`);
      setFilters({ ...filters, brands: [brandName] });
    }
  };

  const ITEMS_PER_PAGE = 24;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [prevFilters, setPrevFilters] = useState(filters);

  // Reset pagination during render if filters changed
  if (filters !== prevFilters) {
    setPrevFilters(filters);
    setVisibleCount(ITEMS_PER_PAGE);
  }

  const displayedPhones = phones.slice(0, visibleCount);

  return (
    <div className="max-w-[1440px] mx-auto space-y-6 py-4">
      {/* Premium Catalog Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative bg-gradient-to-br from-white via-slate-50/60 to-emerald-50/20 backdrop-blur-xl border border-slate-200/80 p-6 sm:p-8 rounded-[24px] shadow-lg shadow-slate-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-6 overflow-hidden"
      >
        {/* Subtle Ambient Glow Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1.5 relative z-10">
          {/* Animated Pulsing Live Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-50/90 text-emerald-800 text-xs font-extrabold px-3.5 py-1.5 rounded-full border border-emerald-200/80 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Canlı Fiyat Kıyaslama Kataloğu</span>
          </div>

          {/* Premium High-End Editorial Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight editorial-title">
            {brandParam ? `${brandParam} Akıllı Telefon Kataloğu` : `Akıllı Telefon Kataloğu & Canlı Fiyat Takibi`}
          </h1>

          {/* Styled Dynamic Data Count Subtitle */}
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-2xl editorial-sub">
            AnTuTu v10 performans skorları, DXOMark kamera metrikleri ve 8 mağazanın anlık canlı fiyatlarıyla analiz edilen <strong className="font-black text-emerald-700">{phones.length}</strong> akıllı telefon modelini keşfedin.
          </p>
        </div>

        {/* Mobile Filter Toggle & Restyled Sort Dropdown */}
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden bg-white/90 hover:bg-slate-50 text-slate-800 text-xs font-extrabold px-4 py-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <span>Filtrele ({filters.brands?.length || 0})</span>
          </button>

          {/* Polished Sort Dropdown */}
          <div className="relative group/sort flex items-center gap-2 bg-white/90 hover:bg-slate-50/90 border border-slate-200/90 hover:border-emerald-500/50 rounded-2xl px-4 py-2.5 shadow-xs transition-all duration-200 text-xs">
            <ArrowUpDown className="w-4 h-4 text-emerald-600 shrink-0" />
            <select
              value={filters.sortBy || 'rating'}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as FilterOptions['sortBy'] })}
              className="bg-transparent text-slate-900 font-extrabold focus:outline-none cursor-pointer pr-1"
            >
              <option value="rating">Puan Durumu (Önce En Yüksek)</option>
              <option value="popular">Öne Çıkanlar</option>
              <option value="priceAsc">Fiyat (Önce En Düşük)</option>
              <option value="priceDesc">Fiyat (Önce En Yüksek)</option>
              <option value="antutu">AnTuTu Performansı</option>
              <option value="releaseYear">En Yeni Modeller</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Reference Brand Pills Horizontal Scroll Bar */}
      <BrandPillBar
        selectedBrands={filters.brands || []}
        onSelectBrand={handlePillSelect}
        brandCounts={brandCounts}
      />

      {/* Main Grid & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative items-stretch">
        
        {/* Sidebar Column (Stretches Full Height of Grid to Keep Sticky Filter Always Pinned) */}
        <div className="lg:col-span-3 self-stretch">
          <PhoneFilterSidebar
            filters={filters}
            setFilters={setFilters}
            availableBrands={availableBrands}
            isMobileOpen={isMobileFilterOpen}
            onCloseMobile={() => setIsMobileFilterOpen(false)}
          />
        </div>

        {/* Product Grid Column with Ultra-Fast Batch Rendering */}
        <div className="lg:col-span-9">
          {phones.length === 0 && !isLoading ? (
            <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-12 text-center space-y-4 shadow-xs">
              <h3 className="text-slate-900 text-lg font-bold">Kriterlerinize uygun telefon bulunamadı</h3>
              <p className="text-xs text-slate-500">Lütfen filtrelerinizi esnetmeyi deneyin.</p>
              <button
                onClick={() => handlePillSelect(null)}
                className="bg-emerald-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs cursor-pointer"
              >
                Filtreleri Temizle
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="product-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
                {displayedPhones.map((phone, idx) => (
                  <PhoneCard key={phone.id} phone={phone} index={idx} />
                ))}
              </div>

              {/* Load More Button for 60fps Performance */}
              {visibleCount < phones.length && (
                <div className="pt-4 text-center">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 24)}
                    className="bg-slate-900 hover:bg-emerald-600 text-white font-black text-xs px-8 py-4 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>Daha Fazla Telefon Göster ({displayedPhones.length} / {phones.length})</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function PhoneCatalogPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-slate-500 font-bold">Yükleniyor...</div>}>
      <PhoneCatalogContent />
    </Suspense>
  );
}
