'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product } from '@/lib/types';
import { CompactProductCard } from '@/components/catalog/CompactProductCard';
import { CategoryBar } from '@/components/layout/CategoryBar';
import { CategoryIconStrip } from '@/components/layout/CategoryIconStrip';
import { BrandPillBar } from '@/components/catalog/BrandPillBar';
import { Search, Tablet, X, ChevronDown } from 'lucide-react';

const ITEMS_PER_PAGE = 24;

function TabletsContent({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [products] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const brandParam = searchParams.get('brand');
  const selectedBrands = useMemo(() => {
    return brandParam ? brandParam.split(',').filter(Boolean) : [];
  }, [brandParam]);

  const handleSelectBrand = (brandName: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!brandName) {
      params.delete('brand');
    } else {
      if (selectedBrands.includes(brandName)) {
        const next = selectedBrands.filter((b) => b !== brandName);
        if (next.length === 0) params.delete('brand');
        else params.set('brand', next.join(','));
      } else {
        // Toggle or set brand
        params.set('brand', brandName);
      }
    }
    router.push(`/tablets?${params.toString()}`, { scroll: false });
  };

  const displayProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Brand filter
        if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) {
          return false;
        }
        // Search query filter
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchesName = p.name.toLowerCase().includes(q);
          const matchesBrand = p.brand.toLowerCase().includes(q);
          return matchesName || matchesBrand;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priceAsc') return a.basePrice - b.basePrice;
        if (sortBy === 'priceDesc') return b.basePrice - a.basePrice;
        if (sortBy === 'rating') {
          const ratingDiff = (b.rating || 0) - (a.rating || 0);
          if (ratingDiff !== 0) return ratingDiff;
          return (b.releaseYear || 0) - (a.releaseYear || 0);
        }
        if (sortBy === 'popular') {
          const popDiff = (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
          if (popDiff !== 0) return popDiff;
          const yearDiff = (b.releaseYear || 0) - (a.releaseYear || 0);
          if (yearDiff !== 0) return yearDiff;
          return (b.rating || 0) - (a.rating || 0);
        }
        // Default / 'newest': Yeniden Eskiye (En Yeni Çıkış Yılı En Üstte)
        const yearDiff = (b.releaseYear || 0) - (a.releaseYear || 0);
        if (yearDiff !== 0) return yearDiff;
        const ratingDiff = (b.rating || 0) - (a.rating || 0);
        if (ratingDiff !== 0) return ratingDiff;
        return (b.basePrice || 0) - (a.basePrice || 0);
      });
  }, [products, selectedBrands, searchQuery, sortBy]);

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
            {selectedBrands.length > 0 && (
              <>
                <span>&gt;</span>
                <span className="text-emerald-700 font-black">{selectedBrands.join(', ')}</span>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Tabletler</span>
            {selectedBrands.length > 0 && (
              <span className="text-emerald-600">({selectedBrands.join(', ')})</span>
            )}
            <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1 rounded-full">
              {displayProducts.length} Model
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Canlı mağaza fiyatları, teknik özellikler ve marka filtreleme
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
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 outline-none cursor-pointer"
          >
            <option value="newest">En Yeniler (Çıkış Yılı)</option>
            <option value="popular">Öne Çıkanlar</option>
            <option value="rating">En Yüksek Puanlılar</option>
            <option value="priceAsc">Fiyat: Düşükten Yükseğe</option>
            <option value="priceDesc">Fiyat: Yüksekten Düşüğe</option>
          </select>
        </div>
      </div>

      {/* Brand Pill Bar */}
      <BrandPillBar
        category="tablets"
        selectedBrands={selectedBrands}
        onSelectBrand={handleSelectBrand}
      />

      {/* Active Brand Filter Tag */}
      {selectedBrands.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-bold">Aktif Marka Filtresi:</span>
          {selectedBrands.map((b) => (
            <button
              key={b}
              onClick={() => handleSelectBrand(b)}
              className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-bold hover:bg-emerald-100 transition-colors"
            >
              <span>{b}</span>
              <X className="w-3 h-3" />
            </button>
          ))}
          <button
            onClick={() => handleSelectBrand(null)}
            className="text-xs text-rose-600 hover:text-rose-700 font-bold ml-2 underline"
          >
            Tümünü Temizle
          </button>
        </div>
      )}

      {/* Grid */}
      {displayProducts.length > 0 ? (
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
                <span>Daha Fazla Tablet Göster ({displayProducts.length - visibleCount} model kaldı)</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-slate-400 mt-2 font-semibold">
                {visibleCount} / {displayProducts.length} model listeleniyor
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
          <Tablet className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Seçilen kriterlere uygun tablet bulunamadı</h3>
          <p className="text-xs text-slate-500">Farklı bir marka veya arama terimi deneyebilirsiniz.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              handleSelectBrand(null);
            }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
          >
            Filtreleri Sıfırla
          </button>
        </div>
      )}

      <CategoryIconStrip />
    </div>
  );
}

export default function TabletsClient({ initialProducts }: { initialProducts: Product[] }) {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400 font-bold">Yükleniyor...</div>}>
      <TabletsContent initialProducts={initialProducts} />
    </Suspense>
  );
}
