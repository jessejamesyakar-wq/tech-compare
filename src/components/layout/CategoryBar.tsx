'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n/context';
import {
  Smartphone,
  Tv,
  Laptop,
  Tablet,
  Watch,
  Headphones,
  Gamepad2,
  PlugZap,
  Monitor
} from 'lucide-react';

export function CategoryBar() {
  const pathname = usePathname();
  const { t } = useI18n();

  // 9 Core Product Categories with dynamic i18n translations
  const categories = [
    { id: 'phones', label: t.catPhones || 'Akıllı Telefonlar', href: '/phones', icon: Smartphone },
    { id: 'laptops', label: t.catLaptops || 'Laptop & PC', href: '/laptops', icon: Laptop },
    { id: 'tvs', label: t.catTvs || 'Televizyonlar', href: '/tvs', icon: Tv },
    { id: 'appliances', label: t.catAppliances || 'Ev ve Yaşam', href: '/appliances', icon: PlugZap },
    { id: 'tablets', label: t.catTablets || 'Tabletler', href: '/tablets', icon: Tablet },
    { id: 'smartwatches', label: t.catSmartwatches || 'Akıllı Saatler', href: '/smartwatches', icon: Watch },
    { id: 'headphones', label: t.catHeadphones || 'Ses & Kulaklık', href: '/headphones', icon: Headphones },
    { id: 'monitors', label: t.catMonitors || 'Monitörler', href: '/monitors', icon: Monitor },
    { id: 'consoles', label: t.catConsoles || 'Oyun Konsolları', href: '/consoles', icon: Gamepad2 }
  ];

  return (
    <div className="bg-white/80 dark:bg-[#090D16]/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/80 sticky top-16 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2">
        <div className="flex items-center justify-start md:justify-between gap-1 sm:gap-2 overflow-x-auto md:overflow-x-visible no-scrollbar flex-nowrap scroll-smooth py-0.5">
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
                className={`relative px-2.5 sm:px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs sm:text-[13px] font-semibold whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white font-bold shadow-xs shadow-emerald-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{cat.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CategoryBar;
