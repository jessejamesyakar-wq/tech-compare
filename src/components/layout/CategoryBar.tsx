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
    <div className="bg-white/95 dark:bg-[#090D16]/95 border-b border-slate-200/90 dark:border-slate-800 shadow-2xs px-4 sm:px-6 lg:px-8 py-2.5 overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto flex items-center justify-center text-[13px] sm:text-[13.5px] font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
        <div className="flex items-center justify-center gap-4 sm:gap-5 md:gap-6 lg:gap-7 mx-auto">
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
                className={`relative py-1 flex items-center gap-1.5 transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'text-emerald-700 dark:text-emerald-400 font-extrabold border-b-2 border-emerald-600 dark:border-emerald-400 pb-0.5'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{cat.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
