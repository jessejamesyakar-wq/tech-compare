'use client';

import React from 'react';
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

export function CategoryIconStrip() {
  const categories = [
    { name: 'Akıllı Telefonlar', href: '/phones', icon: Smartphone, count: '1.066+ Model' },
    { name: 'Bilgisayar & Laptop', href: '/laptops', icon: Laptop, count: '35+ Model' },
    { name: 'Televizyonlar', href: '/tvs', icon: Tv, count: '1.430+ Model' },
    { name: 'Küçük Ev Aletleri', href: '/appliances', icon: PlugZap, count: 'Dyson & Robot' },
    { name: 'Tabletler', href: '/tablets', icon: Tablet, count: 'iPad & Tab S10' },
    { name: 'Akıllı Saatler', href: '/smartwatches', icon: Watch, count: 'Watch Ultra 2' },
    { name: 'Ses & Kulaklık', href: '/headphones', icon: Headphones, count: 'AirPods & Sony' },
    { name: 'Oyun Konsolları', href: '/consoles', icon: Gamepad2, count: 'PS5 Pro & Xbox' },
    { name: 'Karşılaştırma', href: '/compare', icon: Scale, count: 'Canlı Düello' }
  ];

  return (
    <section className="pt-6 border-t border-slate-200/80 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-slate-900 text-sm font-black uppercase tracking-wider">
          Tüm Kategoriler & Hızlı Erişim
        </h4>
        <span className="text-xs text-slate-400 font-medium">10.000+ Doğrulanmış Ürün Fiyat Takibi</span>
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
              <span className="text-[9px] font-semibold text-slate-400 block">
                {cat.count}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
