'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { CompactProductCard } from '@/components/catalog/CompactProductCard';
import { CategoryIconStrip } from '@/components/layout/CategoryIconStrip';
import { Search, ChevronDown, SlidersHorizontal, Sparkles, Check } from 'lucide-react';

const ITEMS_PER_PAGE = 24;

const TABS = [
  { id: 'all', label: 'Tümü' },
  { id: 'tws', label: 'Kulak İçi TWS' },
  { id: 'over_ear', label: 'Kulak Üstü' },
  { id: 'gaming', label: 'Oyuncu' },
  { id: 'speaker', label: 'Hoparlör' }
];

export default function HeadphonesClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products] = useState<Product[]>(initialProducts);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Available brands derived dynamically
  const brands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.brand) set.add(p.brand);
    });
    return Array.from(set);
  }, [products]);

  // Filter products by tab, brand, search, and sort
  const displayProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search filter
        const matchesSearch =
          !searchQuery ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase());

        // Brand filter
        const matchesBrand = selectedBrand === 'all' || p.brand === selectedBrand;

        // Form factor tab filter
        const formFactor = ((p.specs as any)?.formFactor || '').toLowerCase();
        const pName = p.name.toLowerCase();

        let matchesTab = true;
        if (activeTab === 'tws') {
          matchesTab =
            formFactor.includes('tws') ||
            formFactor.includes('kulak içi') ||
            pName.includes('airpods pro') ||
            pName.includes('buds') ||
            pName.includes('wf-') ||
            pName.includes('tat');
        } else if (activeTab === 'over_ear') {
          matchesTab =
            formFactor.includes('kulak üstü') ||
            formFactor.includes('over-ear') ||
            formFactor.includes('on-ear') ||
            pName.includes('max') ||
            pName.includes('wh-') ||
            pName.includes('quietcomfort') ||
            pName.includes('momentum 4') ||
            pName.includes('major');
        } else if (activeTab === 'gaming') {
          matchesTab =
            formFactor.includes('pc') ||
            formFactor.includes('oyuncu') ||
            pName.includes('gaming') ||
            pName.includes('arctis') ||
            pName.includes('blackshark') ||
            pName.includes('logitech g');
        } else if (activeTab === 'speaker') {
          matchesTab =
            formFactor.includes('hoparlör') ||
            formFactor.includes('soundbar') ||
            pName.includes('speaker') ||
            pName.includes('charge') ||
            pName.includes('stanmore') ||
            pName.includes('soundlink');
        }

        return matchesSearch && matchesBrand && matchesTab;
      })
      .sort((a, b) => {
        if (sortBy === 'priceAsc') return a.basePrice - b.basePrice;
        if (sortBy === 'priceDesc') return b.basePrice - a.basePrice;
        if (sortBy === 'rating') return b.rating - a.rating;
        return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      });
  }, [products, searchQuery, selectedBrand, activeTab, sortBy]);

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Header Section - Minimalist & Centered */}
      <div className="pt-4 pb-2 text-center space-y-3">
        <div className="text-xs text-slate-400 font-semibold flex items-center justify-center gap-1.5">
          <Link href="/" className="hover:text-slate-900 transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">Ses & Kulaklık</span>
        </div>

        <div className="flex items-center justify-center gap-2.5">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Ses & Kulaklık
          </h1>
          <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
            {displayProducts.length} Model
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto">
          En popüler kablosuz kulaklıklar, ses sistemleri ve canlı mağaza fiyat karşılaştırmaları
        </p>

        {/* Minimalist Search & Sort Bar */}
        <div className="max-w-xl mx-auto pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ses ve kulaklık ara (model, marka, özellik)..."
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
            className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200/90 rounded-full px-4 py-2.5 text-xs font-bold text-slate-800 outline-none cursor-pointer transition-all shadow-2xs shrink-0"
          >
            <option value="popular">Öne Çıkanlar</option>
            <option value="priceAsc">Fiyat: Düşükten Yükseğe</option>
            <option value="priceDesc">Fiyat: Yüksekten Düşüğe</option>
            <option value="rating">En Yüksek Puanlılar</option>
          </select>
        </div>
      </div>

      {/* Segmented Form Factor Tabs (Apple / B&O Style) */}
      <div className="border-b border-slate-200/80 flex items-center justify-start sm:justify-center gap-2 sm:gap-8 overflow-x-auto scrollbar-none pb-0.5 px-2 -mx-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setVisibleCount(ITEMS_PER_PAGE);
              }}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold tracking-tight transition-all relative cursor-pointer whitespace-nowrap shrink-0 ${
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
      <div className="flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto sm:flex-wrap pb-1 scrollbar-none px-2 -mx-2">
        <button
          onClick={() => {
            setSelectedBrand('all');
            setVisibleCount(ITEMS_PER_PAGE);
          }}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            selectedBrand === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          Tüm Markalar
        </button>
        {brands.map((b) => (
          <button
            key={b}
            onClick={() => {
              setSelectedBrand(b);
              setVisibleCount(ITEMS_PER_PAGE);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              selectedBrand === b
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {displayProducts.length > 0 ? (
        <div className="space-y-10">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
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
                <span>Daha Fazla Kulaklık Göster ({displayProducts.length - visibleCount} model kaldı)</span>
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
          <p className="text-sm font-bold text-slate-700">Seçilen filtrelere uygun ses ürünü bulunamadı.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedBrand('all');
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
