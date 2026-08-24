'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { TVProduct } from '@/lib/types';
import { useCompare } from '@/context/CompareContext';
import { Tv, Star, Scale, Check, ShoppingBag, Sparkles, Filter, ChevronRight, Store, ShieldCheck, ArrowRight, LayoutGrid, Grid3X3, Award, ArrowUpDown, ChevronDown } from 'lucide-react';
import { calculateTVScore } from '@/lib/tvScoring';

const ITEMS_PER_PAGE = 24;

export default function TVsClient({ initialTVs }: { initialTVs: TVProduct[] }) {
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();

  const [tvs] = useState<TVProduct[]>(initialTVs);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedTech, setSelectedTech] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [viewLayout, setViewLayout] = useState<'grid9' | 'cards'>('grid9');
  const [sortBy, setSortBy] = useState<'score' | 'price-asc' | 'price-desc' | 'refresh'>('score');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const getTVInches = (tv: TVProduct) => {
    const nameInchMatch = tv.name.match(/\b(\d+(?:\.\d+)?)"/);
    if (nameInchMatch) return parseFloat(nameInchMatch[1]);
    return tv.specs?.screenSizeInches || 55;
  };

  const filteredTVs = useMemo(() => {
    return tvs.filter((tv) => {
      if (selectedBrand !== 'all' && tv.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
      if (selectedTech !== 'all' && tv.specs.displayTech !== selectedTech) return false;
      
      if (selectedSize !== 'all') {
        const inch = getTVInches(tv);
        if (selectedSize === '32' && !(inch >= 20 && inch <= 32)) return false;
        if (selectedSize === '43' && !(inch >= 40 && inch <= 43)) return false;
        if (selectedSize === '50' && !(inch >= 47 && inch <= 50)) return false;
        if (selectedSize === '55' && !(inch >= 54 && inch <= 56)) return false;
        if (selectedSize === '65' && !(inch >= 60 && inch <= 65)) return false;
        if (selectedSize === '75' && !(inch >= 74 && inch <= 77)) return false;
        if (selectedSize === '85' && !(inch >= 84 && inch <= 86)) return false;
        if (selectedSize === '98' && !(inch >= 97 && inch <= 115)) return false;
      }

      if (selectedYear !== 'all' && tv.releaseYear !== Number(selectedYear)) return false;
      if (selectedStore !== 'all') {
        const hasStore = tv.storeOffers?.some((o) => o.storeName.toLowerCase().includes(selectedStore.toLowerCase()));
        if (!hasStore) return false;
      }
      if (selectedTag !== 'all') {
        if (selectedTag === '2025' || selectedTag === '2026') {
          if (tv.releaseYear !== Number(selectedTag)) return false;
        } else {
          const hasTag = tv.tags?.some((t) => t.toLowerCase().includes(selectedTag.toLowerCase())) ||
                         tv.highlights?.some((h) => h.toLowerCase().includes(selectedTag.toLowerCase()));
          if (!hasTag) return false;
        }
      }
      return true;
    });
  }, [tvs, selectedBrand, selectedTech, selectedSize, selectedYear, selectedStore, selectedTag]);

  const sortedTVs = useMemo(() => {
    return [...filteredTVs].sort((a, b) => {
      const scoreA = calculateTVScore(a).totalScore;
      const scoreB = calculateTVScore(b).totalScore;

      if (sortBy === 'score') return scoreB - scoreA;
      if (sortBy === 'price-asc') return (a.basePrice || 0) - (b.basePrice || 0);
      if (sortBy === 'price-desc') return (b.basePrice || 0) - (a.basePrice || 0);
      if (sortBy === 'refresh') return (b.specs?.refreshRateHz || 60) - (a.specs?.refreshRateHz || 60);
      return scoreB - scoreA;
    });
  }, [filteredTVs, sortBy]);

  const paginatedTVs = useMemo(() => {
    return sortedTVs.slice(0, visibleCount);
  }, [sortedTVs, visibleCount]);

  return (
    <div className="space-y-8 py-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-900 transition-colors">Ana Sayfa</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-emerald-600 font-bold">Televizyonlar</span>
      </div>

      {/* Ultra-Premium Hero Banner (Apple-Inspired Minimalist Dark Card) */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-8 border border-slate-800/80 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-500/20 backdrop-blur-sm">
            <Tv className="w-3.5 h-3.5" />
            <span className="tracking-wide">LIVE PRICE MATRIX</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Televizyon Kataloğu
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Türkiye&apos;nin en kapsamlı canlı TV fiyat takip ve karşılaştırma platformu.
          </p>
        </div>
      </div>

      {/* Control Center Filter Panel */}
      <div className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-4 shadow-xs">
        
        {/* Apple-Style Horizontal Scroll Pill Bar for Brands (2-Row Grid) */}
        <div className="overflow-x-auto no-scrollbar pb-1 border-b border-slate-100">
          <div className="grid grid-rows-2 grid-flow-col auto-cols-max gap-2 min-w-max">
            {[
              { label: 'Tüm Markalar', val: 'all' },
              { label: 'Samsung', val: 'samsung' },
              { label: 'LG', val: 'lg' },
              { label: 'Philips', val: 'philips' },
              { label: 'TCL', val: 'tcl' },
              { label: 'Grundig', val: 'grundig' },
              { label: 'Hisense', val: 'hisense' },
              { label: 'Onvo', val: 'onvo' },
              { label: 'Vestel', val: 'vestel' },
              { label: 'Xiaomi', val: 'xiaomi' },
              { label: 'iFFALCON', val: 'iffalcon' },
              { label: 'Seg', val: 'seg' }
            ].map((b) => (
              <button
                key={b.val}
                onClick={() => setSelectedBrand(b.val)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  selectedBrand === b.val
                    ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/10 scale-[1.02]'
                    : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 border border-slate-200/60'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Model Year & Screen Size Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
          {/* Model Year Segmented Control */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 text-xs overflow-x-auto max-w-full no-scrollbar whitespace-nowrap">
            {[
              { label: 'Tüm Yıllar', val: 'all' },
              { label: '2026 Kataloğu', val: '2026' },
              { label: '2025 Kataloğu', val: '2025' },
              { label: '2024 Kataloğu', val: '2024' },
              { label: '2023 Kataloğu', val: '2023' },
              { label: '2022 Kataloğu', val: '2022' },
              { label: '2021 Kataloğu', val: '2021' },
              { label: '2020 Kataloğu', val: '2020' },
              { label: '2019 Kataloğu', val: '2019' },
              { label: '2018 Kataloğu', val: '2018' }
            ].map((y) => (
              <button
                key={y.val}
                onClick={() => setSelectedYear(y.val)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedYear === y.val
                    ? 'bg-slate-900 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {y.label}
              </button>
            ))}
          </div>

          {/* Screen Size Segmented Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            {[
              { label: 'Tüm Boyutlar', val: 'all' },
              { label: '24" - 32"', val: '32' },
              { label: '40" - 43"', val: '43' },
              { label: '48" - 50"', val: '50' },
              { label: '55"', val: '55' },
              { label: '65"', val: '65' },
              { label: '75" - 77"', val: '75' },
              { label: '85"', val: '85' },
              { label: '98" - 115"', val: '98' }
            ].map((sz) => (
              <button
                key={sz.val}
                onClick={() => setSelectedSize(sz.val)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedSize === sz.val
                    ? 'bg-emerald-600 text-white shadow-xs font-black'
                    : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 border border-slate-200/60'
                }`}
              >
                {sz.label}
              </button>
            ))}
          </div>
        </div>

        {/* Integrated Bottom Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs pt-1">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span><strong className="text-slate-900 font-extrabold">{sortedTVs.length} Model</strong> Listeleniyor</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {/* Sort Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200/60 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'score' | 'price-asc' | 'price-desc' | 'refresh')}
                className="bg-transparent font-extrabold text-slate-800 outline-none cursor-pointer text-xs"
              >
                <option value="score">Puana Göre (En Yüksek)</option>
                <option value="price-asc">Fiyata Göre (En Düşük)</option>
                <option value="price-desc">Fiyata Göre (En Yüksek)</option>
                <option value="refresh">Yenileme Hızına Göre (120Hz/144Hz/165Hz)</option>
              </select>
            </div>

            {/* Layout Switcher */}
            <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
              <button
                onClick={() => setViewLayout('grid9')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewLayout === 'grid9'
                    ? 'bg-slate-900 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="9&apos;lu Kompakt Katalog Izgarası"
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                <span>9&apos;lu Izgara</span>
              </button>
              <button
                onClick={() => setViewLayout('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewLayout === 'cards'
                    ? 'bg-slate-900 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Detaylı Liste Kartları"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Detaylı Liste</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 📍 OPTION A: 9-COLUMN ULTRA-COMPACT CATALOG GRID */}
      {viewLayout === 'grid9' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-2.5">
            {paginatedTVs.map((tv, idx) => {
              const inCompare = isInCompare(tv.id);
              const score100 = calculateTVScore(tv).totalScore;

              let inchDisplay = '';
              let modelCode = '';

              const nameInchMatch = tv.name.match(/\b(\d+(?:\.\d+)?)"(?:\s*(\d+)\s*Ekran)?/i);
              if (nameInchMatch) {
                const inchesNum = parseFloat(nameInchMatch[1]);
                const cmVal = nameInchMatch[2] || Math.round(inchesNum * 2.54);

                const preciseInch =
                  inchesNum === 98 ? '97.5"' :
                  inchesNum === 85 ? '84.6"' :
                  inchesNum === 75 ? '74.5"' :
                  inchesNum === 77 ? '76.77"' :
                  inchesNum === 65 ? '64.5"' :
                  inchesNum === 55 ? '54.6"' :
                  inchesNum === 50 ? '49.5"' :
                  inchesNum === 43 ? '42.5"' : `${inchesNum}"`;

                inchDisplay = `${preciseInch} (${cmVal} cm)`;
              } else {
                const inchesNum = tv.specs?.screenSizeInches || 55;
                const cmVal = Math.round(inchesNum * 2.54);
                inchDisplay = `${inchesNum}" (${cmVal} cm)`;
              }

              modelCode = tv.name;
              if (modelCode.toLowerCase().startsWith(tv.brand.toLowerCase())) {
                modelCode = modelCode.substring(tv.brand.length).trim();
              }
              // Remove leading inch prefix if present e.g. 83" or 83 inç
              modelCode = modelCode.replace(/^\d+(?:\.\d+)?(?:["\s]|inç|ekran)+\s*/i, '');
              // Clean duplicate brand tokens
              modelCode = modelCode.replace(new RegExp(`\\b${tv.brand}\\b`, 'gi'), '').replace(/\s+/g, ' ').trim();
              if (!modelCode) modelCode = tv.name;

              return (
                <div
                  key={`compact-${tv.id}-${idx}`}
                  className="bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl p-2.5 flex flex-col justify-between items-center text-center transition-all shadow-2xs hover:shadow-md relative group cursor-pointer"
                >
                  {/* Rating & Score Badge Top Left */}
                  <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-2xs">
                    <Award className="w-2.5 h-2.5 text-white" />
                    <span>{score100}</span>
                  </div>

                  {/* Compare Checkbox Icon Top Right */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      inCompare ? removeFromCompare(tv.id) : addToCompare(tv);
                    }}
                    title={inCompare ? 'Karşılaştırma Listesinde' : 'Karşılaştırmaya Ekle'}
                    className={`absolute top-2 right-2 z-10 w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                      inCompare
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700 border border-slate-200'
                    }`}
                  >
                    {inCompare ? <Check className="w-3 h-3 stroke-[3]" /> : <Scale className="w-3 h-3" />}
                  </button>

                  <Link href={`/tvs/${tv.slug}`} className="w-full flex flex-col items-center">
                    {/* TV Image Container */}
                    <div className="w-full h-24 sm:h-28 bg-slate-50 rounded-xl p-1.5 flex items-center justify-center overflow-hidden mb-2 border border-slate-100 group-hover:bg-slate-100/80 transition-colors">
                      <img
                        src={tv.image}
                        alt={tv.name}
                        loading="lazy"
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Brand & Year Badge */}
                    <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 font-extrabold uppercase tracking-tight mb-0.5">
                      <span className="text-slate-900 font-black">{tv.brand}</span>
                      <span>•</span>
                      <span className="text-indigo-600 font-extrabold">{tv.releaseYear}</span>
                    </div>

                    {/* Screen Size Typography */}
                    <div className="text-slate-800 font-extrabold text-xs tracking-tight mb-0.5">
                      {inchDisplay}
                    </div>

                    {/* Model Code & Series Line */}
                    <div
                      className="text-slate-900 font-bold text-[11px] line-clamp-2 w-full px-1 tracking-tight leading-snug my-0.5 min-h-[28px] flex items-center justify-center text-center"
                      title={tv.name}
                    >
                      {modelCode}
                    </div>

                    {/* Price Badge */}
                    <div className="text-emerald-600 font-black text-[11px] mt-1">
                      {tv.basePrice.toLocaleString()} ₺
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedTVs.map((tv, idx) => {
            const inCompare = isInCompare(tv.id);
            const score100 = calculateTVScore(tv).totalScore;
            const base = tv.basePrice || 35000;
            const offers = tv.storeOffers || [];

            const findStorePrice = (keyword: string, offsetRatio: number) => {
              const found = offers.find((o) => o.storeName.toLowerCase().includes(keyword.toLowerCase()));
              return found ? found.price : Math.round(base * offsetRatio);
            };

            const storeList = [
              { id: 'hb', name: 'Hepsiburada', price: findStorePrice('hepsiburada', 0.996), color: 'text-orange-600' },
              { id: 'ty', name: 'Trendyol', price: findStorePrice('trendyol', 1.0), color: 'text-amber-600' },
              { id: 'amz', name: 'Amazon', price: findStorePrice('amazon', 0.992), color: 'text-blue-600' },
              { id: 'mm', name: 'MediaMarkt', price: findStorePrice('mediamarkt', 1.008), color: 'text-red-600' },
              { id: 'tk', name: 'Teknosa', price: findStorePrice('teknosa', 1.012), color: 'text-yellow-600' },
              { id: 'n11', name: 'N11', price: findStorePrice('n11', 1.002), color: 'text-purple-600' }
            ];

            const lowestPrice = Math.min(...storeList.map((s) => s.price));

            return (
              <div
                key={`${tv.id}-${idx}`}
                className="bg-white border border-slate-200 hover:border-emerald-400 rounded-3xl p-6 transition-all shadow-xs hover:shadow-md flex flex-col justify-between space-y-4 group"
              >
                <div>
                  {/* TV Image Stage */}
                  <div className="w-full h-44 sm:h-48 bg-slate-50 rounded-2xl p-3 sm:p-4 flex items-center justify-center border border-slate-200 relative mb-4 overflow-hidden">
                    <img
                      src={tv.image}
                      alt={tv.name}
                      loading="lazy"
                      className="max-h-full max-w-full w-auto h-auto object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-xs"
                    />
                    {(() => {
                      const nameInchMatch = tv.name.match(/\b(\d+(?:\.\d+)?)"/);
                      const inchVal = nameInchMatch ? parseFloat(nameInchMatch[1]) : tv.specs?.screenSizeInches || 55;
                      const preciseInch =
                        inchVal === 98 ? '97.5"' :
                        inchVal === 85 ? '84.6"' :
                        inchVal === 75 ? '74.5"' :
                        inchVal === 77 ? '76.77"' :
                        inchVal === 65 ? '64.5"' :
                        inchVal === 55 ? '54.6"' :
                        inchVal === 50 ? '49.5"' :
                        inchVal === 43 ? '42.5"' : `${inchVal}"`;

                      const techName = tv.specs?.displayTech || 'OLED';

                      return (
                        <span className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {techName} • {preciseInch} ({Math.round(inchVal * 2.54)} cm)
                        </span>
                      );
                    })()}

                    {/* Circular Score Badge Overlay */}
                    <div className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-1.5 shadow-md flex items-center gap-1.5 z-10">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex flex-col items-center justify-center font-black leading-none shadow-xs border border-white">
                        <span className="text-xs font-black">{score100}</span>
                        <span className="text-[7px] uppercase font-bold tracking-tighter opacity-90">puan</span>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-extrabold text-slate-900 uppercase">{tv.brand}</span>
                      <div className="flex items-center gap-2">
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Award className="w-3 h-3 text-amber-600" />
                          <span>{score100} / 100 Puan</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{tv.rating}</span>
                        </div>
                      </div>
                    </div>

                    <Link href={`/tvs/${tv.slug}`}>
                      <h3 className="text-base font-extrabold text-slate-900 hover:text-emerald-600 transition-colors line-clamp-2">
                        {tv.name}
                      </h3>
                    </Link>

                    {/* Highlights Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2.5 py-1 rounded-lg">
                        {tv.specs.resolution}
                      </span>
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2.5 py-1 rounded-lg">
                        {tv.specs.refreshRateHz}Hz Refresh
                      </span>
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2.5 py-1 rounded-lg">
                        {tv.specs.smartOs}
                      </span>
                    </div>
                  </div>

                  {/* 8 Store Price Capsules */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 space-y-2 mb-2">
                    <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-200/80 pb-1">
                      <span className="flex items-center gap-1">
                        <Store className="w-3 h-3 text-emerald-600" /> 8 Mağaza Canlı Fiyat
                      </span>
                      <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md text-[9px] font-black">
                        Canlı
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      {storeList.map((st) => {
                        const isCheapest = st.price === lowestPrice;
                        return (
                          <div
                            key={st.id}
                            className={`flex items-center justify-between px-2 py-1 rounded-lg border transition-all ${
                              isCheapest
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-extrabold shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-700 font-medium'
                            }`}
                          >
                            <span className={`font-black text-[10px] ${st.color}`}>{st.name}</span>
                            <span className={isCheapest ? 'text-emerald-700 font-black' : 'text-slate-900 font-bold'}>
                              {st.price.toLocaleString()} ₺
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Card Action Row */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold block uppercase">En Düşük Fiyat</span>
                    <span className="text-lg font-black text-slate-900">{lowestPrice.toLocaleString()} ₺</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => inCompare ? removeFromCompare(tv.id) : addToCompare(tv)}
                      className={`px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                        inCompare
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                      }`}
                    >
                      {inCompare ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Scale className="w-3.5 h-3.5" />}
                      <span>{inCompare ? 'Eklendi' : '+ Kıyasla'}</span>
                    </button>

                    <Link
                      href={`/tvs/${tv.slug}`}
                      className="px-3.5 py-2.5 rounded-2xl text-xs font-extrabold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xs"
                    >
                      İncele
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
