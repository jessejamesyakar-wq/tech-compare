'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { getStoredProducts } from '@/lib/adminData';

interface BrandPillBarProps {
  selectedBrands: string[];
  onSelectBrand: (brandName: string | null) => void;
  brandCounts?: Record<string, number>;
}

export function BrandPillBar({ selectedBrands, onSelectBrand, brandCounts }: BrandPillBarProps) {
  const isAllSelected = selectedBrands.length === 0;

  // Dynamically compute brands that actually exist in the smartphone dataset
  const { row1, row2 } = useMemo(() => {
    const all = getStoredProducts();
    const phoneBrandsMap: Record<string, number> = {};

    all
      .filter((p) => p.category === 'smartphones')
      .forEach((p) => {
        if (p.brand) {
          phoneBrandsMap[p.brand] = (phoneBrandsMap[p.brand] || 0) + 1;
        }
      });

    // Sort brands by product count descending
    const sortedBrands = Object.keys(phoneBrandsMap).sort(
      (a, b) => phoneBrandsMap[b] - phoneBrandsMap[a]
    );

    const half = Math.ceil(sortedBrands.length / 2);
    return {
      row1: sortedBrands.slice(0, half),
      row2: sortedBrands.slice(half)
    };
  }, []);

  return (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-3 sm:p-4 shadow-xs space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Marka Filtreleme Barı
        </span>
        <span className="text-[10px] text-slate-400 font-bold">Yana kaydırın →</span>
      </div>

      <div className="overflow-x-auto py-1 px-0.5 no-scrollbar scrollbar-none scroll-smooth">
        <div className="flex flex-col gap-2 min-w-max">
          {/* Row 1: Tüm Markalar is #1 at position 1, followed by top brands */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectBrand(null)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs transition-all cursor-pointer border ${
                isAllSelected
                  ? 'bg-emerald-600 text-white font-extrabold border-emerald-500 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border-slate-200/80'
              }`}
            >
              Tüm Markalar
            </motion.button>

            {row1.map((brand) => {
              const isSelected = selectedBrands.includes(brand);
              return (
                <motion.button
                  key={brand}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onSelectBrand(brand)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs transition-all cursor-pointer border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-extrabold border-emerald-500 shadow-xs'
                      : 'bg-slate-100/90 hover:bg-slate-200 text-slate-800 font-semibold border-slate-200/90'
                  }`}
                >
                  <span>{brand}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Row 2: Remaining Active Brands */}
          {row2.length > 0 && (
            <div className="flex items-center gap-2">
              {row2.map((brand) => {
                const isSelected = selectedBrands.includes(brand);
                return (
                  <motion.button
                    key={brand}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onSelectBrand(brand)}
                    className={`shrink-0 px-4 py-2 rounded-full text-xs transition-all cursor-pointer border flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-extrabold border-emerald-500 shadow-xs'
                        : 'bg-slate-100/90 hover:bg-slate-200 text-slate-800 font-semibold border-slate-200/90'
                    }`}
                  >
                    <span>{brand}</span>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
