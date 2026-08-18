'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface BrandPillBarProps {
  selectedBrands: string[];
  onSelectBrand: (brandName: string | null) => void;
  brandCounts?: Record<string, number>;
}

const ROW_1_BRANDS = [
  'Apple',
  'Samsung',
  'Xiaomi',
  'Tecno',
  'Oppo',
  'Vivo',
  'Honor',
  'General Mobile',
  'Infinix'
];

const ROW_2_BRANDS = [
  'TCL',
  'Omix',
  'Huawei',
  'Bilicra',
  'OnePlus',
  'Nothing',
  'Realme',
  'Casper',
  'Reeder',
  'Sony',
  'Google'
];

export function BrandPillBar({ selectedBrands, onSelectBrand, brandCounts = {} }: BrandPillBarProps) {
  const isAllSelected = selectedBrands.length === 0;

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
          {/* Row 1: Tüm Markalar is #1 at position 1, followed by Apple, Samsung, etc. */}
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

            {ROW_1_BRANDS.map((brand) => {
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

          {/* Row 2: Remaining Brands */}
          <div className="flex items-center gap-2">
            {ROW_2_BRANDS.map((brand) => {
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
        </div>
      </div>
    </div>
  );
}
