'use client';

import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';

interface BrandPillBarProps {
  category?: 'smartphones' | 'tablets' | 'smartwatches' | 'laptops' | 'tvs' | 'appliances' | 'headphones' | 'consoles';
  selectedBrands: string[];
  onSelectBrand: (brandName: string | null) => void;
  brandCounts?: Record<string, number>;
}

const DEFAULT_POPULAR_BRANDS: Record<string, number> = {
  Apple: 412,
  Samsung: 685,
  Xiaomi: 390,
  TCL: 140,
  LG: 290,
  Philips: 310,
  Sony: 180,
  Asus: 195,
  Lenovo: 210,
  Dell: 145,
  HP: 170,
  Huawei: 120,
  MSI: 85,
  Acer: 110,
  Roborock: 95,
  Dyson: 65,
  Ecovacs: 80
};

export function BrandPillBar({ selectedBrands, onSelectBrand, brandCounts = DEFAULT_POPULAR_BRANDS }: BrandPillBarProps) {
  const isAllSelected = selectedBrands.length === 0;

  const { row1, row2, totalCount, brandsMap } = useMemo(() => {
    const map = brandCounts || DEFAULT_POPULAR_BRANDS;
    const sortedBrands = Object.keys(map).sort((a, b) => (map[b] || 0) - (map[a] || 0));
    const total = Object.values(map).reduce((a, b) => a + b, 0);
    const half = Math.ceil(sortedBrands.length / 2);
    return {
      row1: sortedBrands.slice(0, half),
      row2: sortedBrands.slice(half),
      totalCount: total,
      brandsMap: map
    };
  }, [brandCounts]);

  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-md hover:shadow-lg transition-all duration-300 space-y-2">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1">
        
        {/* All Brands Pill */}
        <button
          onClick={() => onSelectBrand(null)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 transition-all cursor-pointer ${
            isAllSelected
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tüm Markalar</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
            isAllSelected ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200 text-slate-600'
          }`}>
            {totalCount.toLocaleString('tr-TR')}
          </span>
        </button>

        {/* Brand Pills */}
        {[...row1, ...row2].map((brand) => {
          const isSelected = selectedBrands.includes(brand);
          const count = brandsMap[brand] || 0;
          return (
            <button
              key={brand}
              onClick={() => onSelectBrand(brand)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{brand}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                isSelected ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
