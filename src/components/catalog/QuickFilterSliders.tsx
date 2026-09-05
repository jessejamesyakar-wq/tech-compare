'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Smartphone as PhoneIcon } from 'lucide-react';

export interface QuickFilterBrand {
  name: string;
  slug: string;
}

export interface QuickFilterModel {
  name: string;
  query: string;
  brand?: string;
}

const BRANDS: QuickFilterBrand[] = [
  { name: 'Apple', slug: 'Apple' },
  { name: 'Samsung', slug: 'Samsung' },
  { name: 'Xiaomi', slug: 'Xiaomi' },
  { name: 'Tecno', slug: 'Tecno' },
  { name: 'Oppo', slug: 'Oppo' },
  { name: 'Vivo', slug: 'Vivo' },
  { name: 'Honor', slug: 'Honor' },
  { name: 'General Mobile', slug: 'General Mobile' },
  { name: 'Infinix', slug: 'Infinix' },
  { name: 'TCL', slug: 'TCL' },
  { name: 'Omix', slug: 'Omix' },
  { name: 'Huawei', slug: 'Huawei' },
  { name: 'Bilicra', slug: 'Bilicra' },
];

const POPULAR_MODELS: QuickFilterModel[] = [
  { name: 'iPhone 17', query: 'iPhone 17', brand: 'Apple' },
  { name: 'iPhone 17 Pro', query: 'iPhone 17 Pro', brand: 'Apple' },
  { name: 'iPhone 17 Pro Max', query: 'iPhone 17 Pro Max', brand: 'Apple' },
  { name: 'iPhone Air', query: 'iPhone Air', brand: 'Apple' },
  { name: 'iPhone 16', query: 'iPhone 16', brand: 'Apple' },
  { name: 'iPhone 16 Pro Max', query: 'iPhone 16 Pro Max', brand: 'Apple' },
  { name: 'iPhone 15', query: 'iPhone 15', brand: 'Apple' },
  { name: 'iPhone 14', query: 'iPhone 14', brand: 'Apple' },
  { name: 'iPhone 13', query: 'iPhone 13', brand: 'Apple' },
  { name: 'Samsung Galaxy S25 FE', query: 'Galaxy S25 FE', brand: 'Samsung' },
  { name: 'Samsung Galaxy A57', query: 'Galaxy A57', brand: 'Samsung' },
  { name: 'Samsung Galaxy A37', query: 'Galaxy A37', brand: 'Samsung' },
  { name: 'Samsung Galaxy A27', query: 'Galaxy A27', brand: 'Samsung' },
  { name: 'Samsung Galaxy A17', query: 'Galaxy A17', brand: 'Samsung' },
  { name: 'Samsung Galaxy A07', query: 'Galaxy A07', brand: 'Samsung' },
  { name: 'Xiaomi Redmi 15', query: 'Redmi 15', brand: 'Xiaomi' },
  { name: 'Xiaomi Redmi 15C', query: 'Redmi 15C', brand: 'Xiaomi' },
  { name: 'Oppo Reno A6 Pro', query: 'Reno A6 Pro', brand: 'Oppo' },
  { name: 'Vivo Y29', query: 'Vivo Y29', brand: 'Vivo' },
];

interface QuickFilterSlidersProps {
  onSearchChange?: (query: string) => void;
  selectedBrand: string;
  onBrandSelect: (brand: string) => void;
  activeModelQuery?: string;
}

export function QuickFilterSliders({
  onSearchChange,
  selectedBrand,
  onBrandSelect,
  activeModelQuery = '',
}: QuickFilterSlidersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Scroll refs for drag-to-scroll
  const brandScrollRef = useRef<HTMLDivElement>(null);
  const modelScrollRef = useRef<HTMLDivElement>(null);

  const [isBrandDragging, setIsBrandDragging] = useState(false);
  const [brandStartX, setBrandStartX] = useState(0);
  const [brandScrollLeft, setBrandScrollLeft] = useState(0);

  const [isModelDragging, setIsModelDragging] = useState(false);
  const [modelStartX, setModelStartX] = useState(0);
  const [modelScrollLeft, setModelScrollLeft] = useState(0);

  // Drag-to-scroll handlers for Brand Slider
  const handleBrandMouseDown = (e: React.MouseEvent) => {
    if (!brandScrollRef.current) return;
    setIsBrandDragging(true);
    setBrandStartX(e.pageX - brandScrollRef.current.offsetLeft);
    setBrandScrollLeft(brandScrollRef.current.scrollLeft);
  };

  const handleBrandMouseMove = (e: React.MouseEvent) => {
    if (!isBrandDragging || !brandScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - brandScrollRef.current.offsetLeft;
    const walk = (x - brandStartX) * 1.5;
    brandScrollRef.current.scrollLeft = brandScrollLeft - walk;
  };

  const stopBrandDrag = () => {
    setIsBrandDragging(false);
  };

  // Drag-to-scroll handlers for Model Slider
  const handleModelMouseDown = (e: React.MouseEvent) => {
    if (!modelScrollRef.current) return;
    setIsModelDragging(true);
    setModelStartX(e.pageX - modelScrollRef.current.offsetLeft);
    setModelScrollLeft(modelScrollRef.current.scrollLeft);
  };

  const handleModelMouseMove = (e: React.MouseEvent) => {
    if (!isModelDragging || !modelScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - modelScrollRef.current.offsetLeft;
    const walk = (x - modelStartX) * 1.5;
    modelScrollRef.current.scrollLeft = modelScrollLeft - walk;
  };

  const stopModelDrag = () => {
    setIsModelDragging(false);
  };

  // Handle Model Chip Click
  const handleModelClick = (model: QuickFilterModel) => {
    if (onSearchChange) {
      onSearchChange(model.query);
    }
  };

  return (
    <div className="w-full space-y-2 py-1">
      {/* 🔹 1. Markalar Slider'ı */}
      <div className="relative group">
        <div
          ref={brandScrollRef}
          onMouseDown={handleBrandMouseDown}
          onMouseMove={handleBrandMouseMove}
          onMouseUp={stopBrandDrag}
          onMouseLeave={stopBrandDrag}
          className={`flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-0.5 select-none ${
            isBrandDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{ scrollBehavior: isBrandDragging ? 'auto' : 'smooth' }}
        >
          <button
            onClick={() => onBrandSelect('all')}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all shadow-2xs border ${
              selectedBrand === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Tüm Markalar
          </button>
          {BRANDS.map((b) => {
            const isSelected = selectedBrand.toLowerCase() === b.name.toLowerCase();
            return (
              <button
                key={b.slug}
                onClick={() => onBrandSelect(b.name)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all shadow-2xs border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {b.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 🔹 2. Popüler Modeller Slider'ı */}
      <div className="relative group">
        <div
          ref={modelScrollRef}
          onMouseDown={handleModelMouseDown}
          onMouseMove={handleModelMouseMove}
          onMouseUp={stopModelDrag}
          onMouseLeave={stopModelDrag}
          className={`flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-0.5 select-none ${
            isModelDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{ scrollBehavior: isModelDragging ? 'auto' : 'smooth' }}
        >
          {POPULAR_MODELS.map((m) => {
            const isMatch = activeModelQuery.toLowerCase() === m.query.toLowerCase();
            return (
              <button
                key={m.name}
                onClick={() => handleModelClick(m)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all shadow-2xs border ${
                  isMatch
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-semibold'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <PhoneIcon className="w-3 h-3 opacity-60" />
                <span>{m.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
