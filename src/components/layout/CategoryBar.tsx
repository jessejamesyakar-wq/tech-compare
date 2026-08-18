'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Smartphone,
  Tv,
  Laptop,
  Tablet,
  Watch,
  Headphones,
  Gamepad2,
  Sliders,
  Sparkles,
  PlugZap
} from 'lucide-react';

export function CategoryBar() {
  const pathname = usePathname();
  const [activeCategory, setActiveCategory] = useState<string>('phones');

  const categories = [
    { id: 'phones', label: 'Akıllı Telefonlar', href: '/phones', icon: Smartphone },
    { id: 'laptops', label: 'Bilgisayar & Laptop', href: '/laptops', icon: Laptop },
    { id: 'tvs', label: 'Televizyonlar', href: '/tvs', icon: Tv },
    { id: 'appliances', label: 'Küçük Ev Aletleri', href: '/appliances', icon: PlugZap },
    { id: 'tablets', label: 'Tabletler', href: '/tablets', icon: Tablet },
    { id: 'smartwatches', label: 'Akıllı Saatler', href: '/smartwatches', icon: Watch },
    { id: 'headphones', label: 'Ses & Kulaklık', href: '/headphones', icon: Headphones },
    { id: 'consoles', label: 'Oyun Konsolları', href: '/consoles', icon: Gamepad2 },
    { id: 'compare', label: 'Karşılaştırma Masası', href: '/compare', icon: Sliders }
  ];

  return (
    <div className="bg-white border-b border-slate-200/90 shadow-2xs -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2.5 overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 text-[14px] font-medium text-slate-600 whitespace-nowrap">
        <div className="flex items-center gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive =
              pathname === cat.href ||
              (cat.id === 'phones' && pathname.startsWith('/phones')) ||
              (cat.id === 'laptops' && pathname.startsWith('/laptops')) ||
              (cat.id === 'tvs' && pathname.startsWith('/tvs')) ||
              (cat.id === 'appliances' && pathname.startsWith('/appliances')) ||
              (cat.id === 'tablets' && pathname.startsWith('/tablets')) ||
              (cat.id === 'smartwatches' && pathname.startsWith('/smartwatches')) ||
              (cat.id === 'headphones' && pathname.startsWith('/headphones')) ||
              (cat.id === 'consoles' && pathname.startsWith('/consoles'));

            return (
              <Link
                key={cat.id}
                href={cat.href}
                onClick={() => setActiveCategory(cat.id)}
                className={`relative py-1 flex items-center gap-2 transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? 'text-emerald-700 font-extrabold nav-underline-active'
                    : 'text-slate-700 hover:text-slate-900 font-medium'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-500'}`} />
                <span>{cat.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Canlı Fiyat Takibi Aktif</span>
        </div>
      </div>
    </div>
  );
}
