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
  PlugZap,
  Monitor
} from 'lucide-react';

type CategoryCounts = Partial<Record<'smartphones' | 'laptops' | 'tvs' | 'appliances' | 'tablets' | 'smartwatches' | 'headphones' | 'consoles' | 'monitors', number>>;

export function CategoryIconStrip({ customCounts }: { customCounts?: CategoryCounts }) {
  const counts = customCounts || {};
  const countLabel = (count?: number) => Number.isFinite(count) && count! >= 0 ? `${count} Model` : 'Kataloğu keşfet';

  const categories = [
    {
      name: 'Akıllı Telefonlar',
      href: '/phones',
      icon: Smartphone,
      count: countLabel(counts.smartphones)
    },
    {
      name: 'Bilgisayar & Laptop',
      href: '/laptops',
      icon: Laptop,
      count: countLabel(counts.laptops)
    },
    {
      name: 'Televizyonlar',
      href: '/tvs',
      icon: Tv,
      count: countLabel(counts.tvs)
    },
    {
      name: 'Ev & Yaşam',
      href: '/appliances',
      icon: PlugZap,
      count: countLabel(counts.appliances)
    },
    {
      name: 'Tabletler',
      href: '/tablets',
      icon: Tablet,
      count: countLabel(counts.tablets)
    },
    {
      name: 'Akıllı Saatler',
      href: '/smartwatches',
      icon: Watch,
      count: countLabel(counts.smartwatches)
    },
    {
      name: 'Kulaklıklar',
      href: '/headphones',
      icon: Headphones,
      count: countLabel(counts.headphones)
    },
    {
      name: 'Monitörler',
      href: '/monitors',
      icon: Monitor,
      count: countLabel(counts.monitors)
    },
    {
      name: 'Oyun Konsolları',
      href: '/consoles',
      icon: Gamepad2,
      count: countLabel(counts.consoles)
    }
  ];

  return (
    <div className="w-full bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-md hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-1 px-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.name}
              href={cat.href}
              className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200 shrink-0 group min-w-[90px] sm:min-w-[105px] text-center"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-100 group-hover:bg-emerald-50 text-slate-700 group-hover:text-emerald-600 flex items-center justify-center transition-colors mb-1.5 shadow-2xs">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                {cat.name}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                {cat.count}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
