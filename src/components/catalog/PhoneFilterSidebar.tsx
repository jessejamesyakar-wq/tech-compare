'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';
import { FilterOptions } from '@/lib/types';
import { SlidersHorizontal, RotateCcw, X, Check } from 'lucide-react';

interface PhoneFilterSidebarProps {
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  availableBrands?: string[];
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const BRANDS = [
  'Apple',
  'Samsung',
  'Xiaomi',
  'Vivo',
  'Oppo',
  'Tecno',
  'Honor',
  'OnePlus',
  'Nothing',
  'Huawei',
  'Google',
  'Realme',
  'Motorola',
  'Sony',
  'General Mobile',
  'Reeder',
  'Casper'
];

export function PhoneFilterSidebar({
  filters,
  setFilters,
  availableBrands = BRANDS,
  isMobileOpen,
  onCloseMobile
}: PhoneFilterSidebarProps) {
  const { t } = useI18n();

  const toggleBrand = (b: string) => {
    const current = filters.brands || [];
    const updated = current.includes(b)
      ? current.filter((item) => item !== b)
      : [...current, b];
    setFilters({ ...filters, brands: updated });
  };

  const handleReset = () => {
    setFilters({
      brands: [],
      minPrice: undefined,
      maxPrice: undefined,
      minRam: undefined,
      minStorage: undefined,
      only5G: false,
      sortBy: 'popular'
    });
  };

  const filterContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-sm">{t.filterTitle}</h3>
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1 font-medium cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>{t.resetFilters}</span>
        </button>
      </div>

      {/* Brand Selection Checklist */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
          {t.brand}
        </label>
        <div className="max-h-48 overflow-y-auto space-y-1 pr-1 border border-slate-100 rounded-2xl p-2 bg-slate-50">
          {availableBrands.map((b) => {
            const selected = filters.brands?.includes(b);
            return (
              <div
                key={b}
                onClick={() => toggleBrand(b)}
                className={`flex items-center justify-between p-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                  selected
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                <span>{b}</span>
                {selected && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Price Range Inputs */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
          Fiyat Aralığı (TL)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min TL"
            value={filters.minPrice || ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                minPrice: e.target.value ? Number(e.target.value) : undefined
              })
            }
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
          />
          <input
            type="number"
            placeholder="Max TL"
            value={filters.maxPrice || ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                maxPrice: e.target.value ? Number(e.target.value) : undefined
              })
            }
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* RAM Choice */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
          {t.minRam}
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[4, 8, 12, 16].map((ram) => (
            <button
              key={ram}
              onClick={() =>
                setFilters({
                  ...filters,
                  minRam: filters.minRam === ram ? undefined : ram
                })
              }
              className={`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                filters.minRam === ram
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {ram} GB+
            </button>
          ))}
        </div>
      </div>

      {/* Storage Choice */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
          {t.minStorage}
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[128, 256, 512].map((stg) => (
            <button
              key={stg}
              onClick={() =>
                setFilters({
                  ...filters,
                  minStorage: filters.minStorage === stg ? undefined : stg
                })
              }
              className={`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                filters.minStorage === stg
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {stg} GB+
            </button>
          ))}
        </div>
      </div>

      {/* Battery Capacity Choice */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
          Min Batarya Kapasitesi
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[4500, 5000, 6000].map((bat) => (
            <button
              key={bat}
              onClick={() =>
                setFilters({
                  ...filters,
                  minBattery: filters.minBattery === bat ? undefined : bat
                })
              }
              className={`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                filters.minBattery === bat
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {bat} mAh+
            </button>
          ))}
        </div>
      </div>

      {/* AnTuTu Score Choice */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
          AnTuTu Performans
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: '500k+', val: 500000 },
            { label: '1M+', val: 1000000 },
            { label: '1.5M+', val: 1500000 }
          ].map((item) => (
            <button
              key={item.val}
              onClick={() =>
                setFilters({
                  ...filters,
                  minAntutu: filters.minAntutu === item.val ? undefined : item.val
                })
              }
              className={`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                filters.minAntutu === item.val
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5G Switcher */}
      <div className="pt-2">
        <label className="flex items-center justify-between cursor-pointer p-3 bg-slate-50 rounded-2xl border border-slate-200">
          <span className="text-xs font-bold text-slate-800">{t.only5G}</span>
          <input
            type="checkbox"
            checked={!!filters.only5G}
            onChange={(e) => setFilters({ ...filters, only5G: e.target.checked })}
            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
          />
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Always Follows Scroll / Sticky Fixed in View) */}
      <div className="hidden lg:block sticky top-24 z-30 max-h-[calc(100vh-7rem)] overflow-y-auto no-scrollbar bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm shadow-slate-200/50">
        {filterContent}
      </div>

      {/* Mobile Drawer (Only visible on mobile when open) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm lg:hidden flex justify-end">
          <div className="w-full max-w-xs bg-white h-full p-6 overflow-y-auto animate-in slide-in-from-right duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-900 text-base">{t.filterTitle}</h2>
                <button
                  onClick={onCloseMobile}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 text-xs font-bold"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {filterContent}
            </div>

            <button
              onClick={onCloseMobile}
              className="mt-6 w-full bg-emerald-600 text-white font-bold text-xs py-3 rounded-xl shadow-xs"
            >
              Filtreleri Uygula
            </button>
          </div>
        </div>
      )}
    </>
  );
}
