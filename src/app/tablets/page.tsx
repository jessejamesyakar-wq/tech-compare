'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getStoredProducts } from '@/lib/adminData';
import { Product } from '@/lib/types';
import { CompactProductCard } from '@/components/catalog/CompactProductCard';
import { CategoryBar } from '@/components/layout/CategoryBar';
import { CategoryIconStrip } from '@/components/layout/CategoryIconStrip';
import { Sparkles, ArrowLeft, Search, Filter } from 'lucide-react';

export default function CategoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    // Initial data hydration after mount
    const all = getStoredProducts();
    const filtered = all.filter((p) => p.category === 'tablets');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProducts(filtered);
  }, []);

  const displayProducts = products
    .filter((p) => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'priceAsc') return a.basePrice - b.basePrice;
      if (sortBy === 'priceDesc') return b.basePrice - a.basePrice;
      if (sortBy === 'rating') return b.rating - a.rating;
      return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
    });

  return (
    <div className="space-y-6 pb-12">
      <CategoryBar />

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500 font-bold flex items-center gap-1.5 mb-2">
            <Link href="/" className="hover:text-emerald-700">Ana Sayfa</Link>
            <span>&gt;</span>
            <span className="text-slate-900 font-black">Tabletler</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Tabletler</span>
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
              placeholder="Tabletler içinde ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl pl-9 pr-4 py-2 text-xs font-bold outline-none w-60"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayProducts.map((product) => (
          <CompactProductCard key={product.id} product={product} />
        ))}
      </div>

      <CategoryIconStrip />
    </div>
  );
}
