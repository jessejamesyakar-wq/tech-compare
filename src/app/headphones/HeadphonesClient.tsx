'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { CompactProductCard } from '@/components/catalog/CompactProductCard';
import { CategoryBar } from '@/components/layout/CategoryBar';
import { CategoryIconStrip } from '@/components/layout/CategoryIconStrip';
import { Sparkles, ArrowLeft, Search, Filter, ChevronDown } from 'lucide-react';

const ITEMS_PER_PAGE = 24;

export default function HeadphonesClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const displayProducts = useMemo(() => {
    return products
      .filter((p) => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'priceAsc') return a.basePrice - b.basePrice;
        if (sortBy === 'priceDesc') return b.basePrice - a.basePrice;
        if (sortBy === 'rating') return b.rating - a.rating;
        return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      });
  }, [products, searchQuery, sortBy]);

  return (
    <div className="space-y-6 pb-12">
      <CategoryBar />

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500 font-bold flex items-center gap-1.5 mb-2">
            <Link href="/" className="hover:text-emerald-700">Ana Sayfa</Link>
            <span>&gt;</span>
            <span className="text-slate-900 font-black">Ses & Kulaklık</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Ses & Kulaklık</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1 rounded-full">
              {displayProducts.length} Model
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Canlı mağaza fiyatları ve detaylı teknik karşılaştırma
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ses & Kulaklık içinde ara..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(ITEMS_PER_PAGE);
              }}
              className="bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl pl-9 pr-4 py-2 text-xs font-bold outline-none w-60"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setVisibleCount(ITEMS_PER_PAGE);
            }}
            className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 outline-none cursor-pointer"
          >
            <option value="popular">Öne Çıkanlar</option>
            <option value="priceAsc">Fiyat: Düşükten Yükseğe</option>
            <option value="priceDesc">Fiyat: Yüksekten Düşüğe</option>
            <option value="rating">En Yüksek Puanlılar</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayProducts.slice(0, visibleCount).map((product, idx) => (
            <CompactProductCard key={product.id} product={product} index={idx} />
          ))}
        </div>

        {/* Load More Button */}
        {visibleCount < displayProducts.length && (
          <div className="text-center pt-4">
            <button
              onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-emerald-600 text-white font-extrabold text-xs px-8 py-3.5 rounded-2xl shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>Daha Fazla Kulaklık Göster ({displayProducts.length - visibleCount} model kaldı)</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-slate-400 mt-2 font-semibold">
              {visibleCount} / {displayProducts.length} model listeleniyor
            </p>
          </div>
        )}
      </div>

      <CategoryIconStrip />
    </div>
  );
}
