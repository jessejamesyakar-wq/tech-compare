'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApplianceProduct } from '@/lib/types';
import { CompactProductCard } from '@/components/catalog/CompactProductCard';
import { CategoryBar } from '@/components/layout/CategoryBar';
import { CategoryIconStrip } from '@/components/layout/CategoryIconStrip';
import { Search, Sparkles, SlidersHorizontal, Check } from 'lucide-react';

const SUB_CATEGORIES = [
  { id: 'all', label: 'Tüm Ürünler' },
  { id: 'roborock', label: 'Roborock' },
  { id: 'robot_vacuum', label: 'Robot Süpürgeler' },
  { id: 'airfryer', label: 'Airfryer & Fritöz' },
  { id: 'coffee_machine', label: 'Kahve Makineleri' },
  { id: 'stick_vacuum', label: 'Dikey Süpürgeler' },
  { id: 'blender', label: 'Mutfak Şefi & Blender' },
  { id: 'iron', label: 'Buharlı Ütüler' },
  { id: 'tea_maker', label: 'Çay & Su Isıtıcı' },
  { id: 'toaster', label: 'Tost & Izgara' }
];

export default function AppliancesClient({ initialProducts }: { initialProducts: ApplianceProduct[] }) {
  const [products] = useState<ApplianceProduct[]>(initialProducts);
  const [selectedSubCat, setSelectedSubCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState<number>(60000);

  const allBrands = Array.from(new Set(products.map((p) => p.brand)));

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const displayProducts = products
    .filter((p) => {
      // Subcategory filter
      if (selectedSubCat !== 'all') {
        if (selectedSubCat === 'roborock') {
          if (p.brand !== 'Roborock' && p.specs?.subCategory !== 'roborock') return false;
        } else if (p.specs?.subCategory !== selectedSubCat) {
          return false;
        }
      }
      // Search query filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        const matchesSubCat = p.specs?.subCategoryLabel?.toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesSubCat) return false;
      }
      // Brand filter
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;
      // Price filter
      if (p.basePrice > priceRange) return false;
      return true;
    })
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
      <div className="bg-gradient-to-br from-white via-slate-50 to-emerald-50/40 border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="text-xs text-slate-500 font-bold flex items-center gap-1.5 mb-2">
            <Link href="/" className="hover:text-emerald-700">Ana Sayfa</Link>
            <span>&gt;</span>
            <span className="text-slate-900 font-black">Küçük Ev Aletleri</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Küçük Ev Aletleri</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1 rounded-full shadow-2xs">
              {displayProducts.length} Model
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1.5 max-w-2xl">
            Robot süpürgeler, airfryer modelleri, tam otomatik espresso makineleri ve akıllı mutfak gereçlerinde 8 mağaza canlı fiyat takibi
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Robot süpürge, airfryer, kahve ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-200 focus:border-emerald-500 rounded-2xl pl-9 pr-4 py-2 text-xs font-bold outline-none w-full sm:w-64 shadow-2xs transition-all"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 outline-none cursor-pointer shadow-2xs hover:border-slate-300 transition-all"
          >
            <option value="popular">Öne Çıkanlar & Popüler</option>
            <option value="priceAsc">Fiyat: Düşükten Yükseğe</option>
            <option value="priceDesc">Fiyat: Yüksekten Düşüğe</option>
            <option value="rating">En Yüksek Müşteri Puanı</option>
          </select>
        </div>
      </div>

      {/* Subcategory Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {SUB_CATEGORIES.map((cat) => {
          const isSelected = selectedSubCat === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedSubCat(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-2xs ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Brand Filters Bar */}
      {allBrands.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs flex flex-wrap items-center gap-2">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider mr-2 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
            Marka:
          </span>
          {allBrands.map((brand) => {
            const isChecked = selectedBrands.includes(brand);
            return (
              <button
                key={brand}
                onClick={() => toggleBrand(brand)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                  isChecked
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-extrabold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {isChecked && <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />}
                <span>{brand}</span>
              </button>
            );
          })}
          {selectedBrands.length > 0 && (
            <button
              onClick={() => setSelectedBrands([])}
              className="text-xs text-red-600 hover:text-red-700 font-bold ml-auto cursor-pointer"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>
      )}

      {/* Product Grid */}
      {displayProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayProducts.map((product) => (
            <CompactProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
          <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Aramanıza uygun ürün bulunamadı</h3>
          <p className="text-xs text-slate-500">Lütfen filtreleri sıfırlamayı veya farklı bir arama terimi denemeyi düşünün.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedSubCat('all');
              setSelectedBrands([]);
            }}
            className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs cursor-pointer hover:bg-emerald-700 transition-all"
          >
            Tüm Ürünleri Göster
          </button>
        </div>
      )}

      <CategoryIconStrip />
    </div>
  );
}
