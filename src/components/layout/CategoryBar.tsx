'use client';

import React from 'react';
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
  PlugZap,
  Monitor
} from 'lucide-react';

export function CategoryBar() {
  const pathname = usePathname();

  const categories = [
    { id: 'phones', label: 'Akıllı Telefonlar', href: '/phones', icon: Smartphone },
    { id: 'laptops', label: 'Bilgisayar & Laptop', href: '/laptops', icon: Laptop },
    { id: 'tvs', label: 'Televizyonlar', href: '/tvs', icon: Tv },
    { id: 'appliances', label: 'Ev ve Yaşam Teknolojileri', href: '/appliances', icon: PlugZap },
    { id: 'tablets', label: 'Tabletler', href: '/tablets', icon: Tablet },
    { id: 'smartwatches', label: 'Akıllı Saatler', href: '/smartwatches', icon: Watch },
    { id: 'headphones', label: 'Ses & Kulaklık', href: '/headphones', icon: Headphones },
    { id: 'monitors', label: 'Monitörler', href: '/monitors', icon: Monitor },
    { id: 'consoles', label: 'Oyun Konsolları', href: '/consoles', icon: Gamepad2 },
    { id: 'compare', label: 'Karşılaştırma Masası', href: '/compare', icon: Sliders }
  ];

  return (
    <div className="bg-white/95 dark:bg-[#090D16]/95 border-b border-slate-200/90 dark:border-slate-800 shadow-2xs px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto flex items-center justify-center text-[13px] sm:text-[13.5px] font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
        <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 mx-auto flex-wrap">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive =
              pathname === cat.href ||
              (cat.href !== '/' && pathname.startsWith(`${cat.href}/`)) ||
              (cat.id === 'phones' && pathname.startsWith('/phones')) ||
              (cat.id === 'tvs' && pathname.startsWith('/tvs'));

            return (
              <Link
                key={cat.id}
                href={cat.href}
                className={`relative px-3 py-1.5 rounded-xl flex items-center gap-2 transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-extrabold shadow-2xs border border-emerald-200/80 dark:border-emerald-800'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-semibold'
                }`}
              >
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700'}`} />
                <span>{cat.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
