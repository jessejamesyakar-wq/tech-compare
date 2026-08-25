'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { CompactProductCard } from '@/components/catalog/CompactProductCard';
import { Sparkles, ArrowLeft, Search, Filter, Monitor, Zap, Award } from 'lucide-react';

const ITEMS_PER_PAGE = 24;

export default function MonitorsClient({ initialProducts }: { initialProducts: Product[] }) {
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
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      });
  }, [products, searchQuery, sortBy]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="text-xs text-slate-300 font-bold flex items-center gap-1.5 mb-1">
            <Link href="/" className="hover:text-emerald-400">Ana Sayfa</Link>
            <span>&gt;</span>
            <span className="text-white font-black">Monitörler</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <Monitor className="w-7 h-7 text-emerald-400" />
            <span>LG & Popüler Monitörler</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-extrabold px-3 py-1 rounded-full">
              {displayProducts.length} Model
            </span>
          </h1>
          <p className="text-xs text-slate-300 font-medium max-w-xl">
            LG UltraGear OLED, UltraWide, DualUp ve 4K profesyonel monitör modelleri. Canlı 8 mağaza fiyat takibi ve 100 puan üzerinden bağımsız kıyaslama.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Monitör ara (OLED, 240Hz, 4K)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-2xl pl-9 pr-4 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none w-56 sm:w-64"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white/10 border border-white/20 text-white rounded-2xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="popular" className="bg-slate-900 text-white">En Popüler</option>
            <option value="rating" className="bg-slate-900 text-white">En Yüksek Puan</option>
            <option value="priceAsc" className="bg-slate-900 text-white">Fiyat: Düşükten Yükseğe</option>
            <option value="priceDesc" className="bg-slate-900 text-white">Fiyat: Yüksekten Düşüğe</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {displayProducts.slice(0, visibleCount).map((product, idx) => (
          <CompactProductCard key={product.id} product={product} index={idx} />
        ))}
      </div>

      {visibleCount < displayProducts.length && (
        <div className="text-center pt-6">
          <button
            onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
            className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-black text-xs px-8 py-3.5 rounded-full shadow-xs hover:border-emerald-500 transition-all cursor-pointer"
          >
            Daha Fazla Monitör Göster ({displayProducts.length - visibleCount} kaldı)
          </button>
        </div>
      )}
    </div>
  );
}
