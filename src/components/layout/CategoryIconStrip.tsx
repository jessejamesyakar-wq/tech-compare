'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Smartphone,
  Tv,
  Laptop,
  Tablet,
  Watch,
  Headphones,
  Gamepad2,
  Scale,
  PlugZap
} from 'lucide-react';
import { getStoredProducts } from '@/lib/adminData';

export function CategoryIconStrip() {
  const [counts, setCounts] = useState<{
    smartphones: number;
    laptops: number;
    tvs: number;
    appliances: number;
    tablets: number;
    smartwatches: number;
    headphones: number;
    consoles: number;
  }>({
    smartphones: 0,
    laptops: 0,
    tvs: 0,
    appliances: 0,
    tablets: 0,
    smartwatches: 0,
    headphones: 0,
    consoles: 0
  });

  useEffect(() => {
    function updateCounts() {
      const all = getStoredProducts();
      setCounts({
        smartphones: all.filter((p) => p.category === 'smartphones').length,
        laptops: all.filter((p) => p.category === 'laptops').length,
        tvs: all.filter((p) => p.category === 'tvs').length,
        appliances: all.filter((p) => p.category === 'appliances').length,
        tablets: all.filter((p) => p.category === 'tablets').length,
        smartwatches: all.filter((p) => p.category === 'smartwatches').length,
        headphones: all.filter((p) => p.category === 'headphones').length,
        consoles: all.filter((p) => p.category === 'consoles').length
      });
    }

    updateCounts();
    if (typeof window !== 'undefined') {
      window.addEventListener('tech_admin_data_updated', updateCounts);
      return () => window.removeEventListener('tech_admin_data_updated', updateCounts);
    }
  }, []);

  const categories = [
    {
      name: 'Akıllı Telefonlar',
      href: '/phones',
      icon: Smartphone,
      count: counts.smartphones > 0 ? `${counts.smartphones} Model` : ''
    },
    {
      name: 'Bilgisayar & Laptop',
      href: '/laptops',
      icon: Laptop,
      count: counts.laptops > 0 ? `${counts.laptops} Model` : ''
    },
    {
      name: 'Televizyonlar',
      href: '/tvs',
      icon: Tv,
      count: counts.tvs > 0 ? `${counts.tvs} Model` : ''
    },
    {
      name: 'Küçük Ev Aletleri',
      href: '/appliances',
      icon: PlugZap,
      count: counts.appliances > 0 ? `${counts.appliances} Model` : ''
    },
    {
      name: 'Tabletler',
      href: '/tablets',
      icon: Tablet,
      count: counts.tablets > 0 ? `${counts.tablets} Model` : ''
    },
    {
      name: 'Akıllı Saatler',
      href: '/smartwatches',
      icon: Watch,
      count: counts.smartwatches > 0 ? `${counts.smartwatches} Model` : ''
    },
    {
      name: 'Ses & Kulaklık',
      href: '/headphones',
      icon: Headphones,
      count: counts.headphones > 0 ? `${counts.headphones} Model` : ''
    },
    {
      name: 'Oyun Konsolları',
      href: '/consoles',
      icon: Gamepad2,
      count: counts.consoles > 0 ? `${counts.consoles} Model` : ''
    },
    {
      name: 'Karşılaştırma',
      href: '/compare',
      icon: Scale,
      count: 'Canlı Düello'
    }
  ];

  const totalProductCount = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <section className="pt-6 border-t border-slate-200/80 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-slate-900 text-sm font-black uppercase tracking-wider">
          Tüm Kategoriler & Hızlı Erişim
        </h4>
        <span className="text-xs text-slate-400 font-medium">
          {totalProductCount > 0 ? `${totalProductCount.toLocaleString()} Doğrulanmış Ürün Fiyat Takibi` : 'Canlı Fiyat Takibi'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <Link
              key={idx}
              href={cat.href}
              className="group bg-white border border-slate-200 hover:border-emerald-500 p-3 rounded-2xl transition-all shadow-2xs hover:shadow-md text-center space-y-1.5 flex flex-col items-center justify-center cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-2xs">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors block line-clamp-1">
                {cat.name}
              </span>
              {cat.count ? (
                <span className="text-[9px] font-semibold text-slate-400 block tabular-nums">
                  {cat.count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
