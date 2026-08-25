'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { LaptopProduct } from '@/lib/types';
import {
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  X,
  RotateCcw
} from 'lucide-react';

export interface LaptopFilterState {
  category?: string;
  brands: string[];
  productTypes?: string[];
  lenovoSeries?: string[];
  appleSeries?: string[];
  minPrice: number;
  maxPrice: number;
  minScreenInch: number;
  maxScreenInch: number;
  searchQuery: string;
}

interface LaptopFilterSidebarProps {
  laptops: LaptopProduct[];
  filters: LaptopFilterState;
  onFilterChange: (filters: LaptopFilterState) => void;
  totalProductsCount: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function LaptopFilterSidebar({
  laptops = [],
  filters,
  onFilterChange,
  totalProductsCount,
  isOpenMobile,
  onCloseMobile
}: LaptopFilterSidebarProps) {
  // Accordion Section Open States
  const [openSections, setOpenSections] = useState({
    brand: true,
    price: true,
    screenSize: true
  });

  // Local Search Inputs inside filters
  const [brandSearch, setBrandSearch] = useState('');

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Dynamic Brand Counts from actual products
  const brandCounts = useMemo(() => {
    const map: Record<string, number> = {};
    laptops.forEach((l) => {
      const b = l.brand;
      map[b] = (map[b] || 0) + 1;
    });
    return map;
  }, [laptops]);

  const brandOptions = useMemo(() => {
    return Object.keys(brandCounts)
      .sort()
      .map((name) => ({ name, count: brandCounts[name] }))
      .filter((b) => b.name.toLowerCase().includes(brandSearch.toLowerCase()));
  }, [brandCounts, brandSearch]);

  const handleBrandToggle = (brand: string) => {
    const exists = filters.brands.includes(brand);
    const updated = exists
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    onFilterChange({ ...filters, brands: updated });
  };

  const applyPriceFilter = () => {
    onFilterChange({
      ...filters,
      minPrice: Number(tempMinPrice) || 0,
      maxPrice: Number(tempMaxPrice) || 250000
    });
  };

  const applyScreenSizeFilter = () => {
    onFilterChange({
      ...filters,
      minScreenInch: Number(tempMinInch) || 0,
      maxScreenInch: Number(tempMaxInch) || 18
    });
  };

  const resetAllFilters = () => {
    onFilterChange({
      brands: [],
      productTypes: [],
      lenovoSeries: [],
      appleSeries: [],
      minPrice: 0,
      maxPrice: 250000,
      minScreenInch: 0,
      maxScreenInch: 18,
      searchQuery: ''
    });
    setTempMinPrice(0);
    setTempMaxPrice(250000);
    setTempMinInch(0);
    setTempMaxInch(18);
  };

  // Local Min/Max Inputs
  const [tempMinPrice, setTempMinPrice] = useState<number | string>(filters.minPrice || 0);
  const [tempMaxPrice, setTempMaxPrice] = useState<number | string>(filters.maxPrice || 250000);
  const [tempMinInch, setTempMinInch] = useState<number | string>(filters.minScreenInch || 0);
  const [tempMaxInch, setTempMaxInch] = useState<number | string>(filters.maxScreenInch || 18);

  const activeFiltersCount =
    filters.brands.length +
    (filters.minPrice > 0 || filters.maxPrice < 250000 ? 1 : 0) +
    (filters.minScreenInch > 0 || filters.maxScreenInch < 18 ? 1 : 0);

  const sidebarContent = (
    <div className="space-y-6">
      
      {/* Top Header & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Filtreler {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
        </h3>

        {activeFiltersCount > 0 && (
          <button
            onClick={resetAllFilters}
            className="text-[11px] font-extrabold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Temizle</span>
          </button>
        )}
      </div>

      {/* MARKA SECTION (Dynamic counts from products) */}
      <div className="border-b border-slate-200 pb-4">
        <button
          onClick={() => toggleSection('brand')}
          className="w-full flex items-center justify-between font-black text-xs text-slate-900 uppercase tracking-wider mb-2.5 cursor-pointer"
        >
          <span>Marka</span>
          {openSections.brand ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {openSections.brand && (
          <div className="space-y-3 pt-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Marka içinde ara"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl py-1.5 pl-3 pr-8 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {brandOptions.map((brand, idx) => {
                const isChecked = filters.brands.includes(brand.name);
                return (
                  <label key={idx} className="flex items-center justify-between text-xs text-slate-700 hover:text-slate-900 cursor-pointer select-none">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleBrandToggle(brand.name)}
                        className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className={`font-semibold uppercase ${isChecked ? 'font-black text-emerald-700' : ''}`}>
                        {brand.name}
                      </span>
                    </div>
                    <span className="text-slate-400 font-bold text-[11px]">({brand.count})</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 5. FİYAT SECTION */}
      <div className="border-b border-slate-200 pb-4">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between font-black text-xs text-slate-900 uppercase tracking-wider mb-2.5 cursor-pointer"
        >
          <span>Fiyat</span>
          {openSections.price ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {openSections.price && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">En az (TL)</label>
                <input
                  type="number"
                  value={tempMinPrice}
                  onChange={(e) => setTempMinPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl p-2 text-xs font-black text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">En fazla (TL)</label>
                <input
                  type="number"
                  value={tempMaxPrice}
                  onChange={(e) => setTempMaxPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl p-2 text-xs font-black text-slate-900 outline-none"
                />
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={250000}
              step={1000}
              value={Number(tempMaxPrice) || 250000}
              onChange={(e) => setTempMaxPrice(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />

            <button
              onClick={applyPriceFilter}
              className="w-full bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-extrabold text-xs py-2 rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              Uygula
            </button>
          </div>
        )}
      </div>

      {/* 6. EKRAN BOYUTU SECTION */}
      <div>
        <button
          onClick={() => toggleSection('screenSize')}
          className="w-full flex items-center justify-between font-black text-xs text-slate-900 uppercase tracking-wider mb-2.5 cursor-pointer"
        >
          <span>Ekran Boyutu (inç)</span>
          {openSections.screenSize ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {openSections.screenSize && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">En az (inç)</label>
                <input
                  type="number"
                  value={tempMinInch}
                  onChange={(e) => setTempMinInch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl p-2 text-xs font-black text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">En fazla (inç)</label>
                <input
                  type="number"
                  value={tempMaxInch}
                  onChange={(e) => setTempMaxInch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl p-2 text-xs font-black text-slate-900 outline-none"
                />
              </div>
            </div>

            <input
              type="range"
              min={10}
              max={18}
              step={0.5}
              value={Number(tempMaxInch) || 18}
              onChange={(e) => setTempMaxInch(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />

            <button
              onClick={applyScreenSizeFilter}
              className="w-full bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-extrabold text-xs py-2 rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              Uygula
            </button>
          </div>
        )}
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sticky Panel */}
      <div className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-24 bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-6">
          
          {/* Breadcrumb Header */}
          <div className="text-xs text-slate-500 font-bold flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <Link href="/" className="hover:text-emerald-700">Ana Sayfa</Link>
            <span>&gt;</span>
            <span className="text-slate-900 font-black">Bilgisayar & Laptop</span>
          </div>

          {sidebarContent}
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={onCloseMobile} />

          <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl p-5 overflow-y-auto flex flex-col justify-between ml-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                <h3 className="text-sm font-black text-slate-900 uppercase">Filtrele & Sırala</h3>
                <button onClick={onCloseMobile} className="p-1 rounded-full text-slate-500 hover:text-slate-900">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {sidebarContent}
            </div>

            <div className="pt-4 border-t border-slate-200 mt-6">
              <button
                onClick={onCloseMobile}
                className="w-full bg-emerald-600 text-white font-black text-xs py-3 rounded-xl shadow-md"
              >
                Sonuçları Göster ({totalProductsCount} Ürün)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
