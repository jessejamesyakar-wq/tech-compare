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
    <div className="w-full bg-white border border-slate-200/80 rounded-3xl p-3 sm:p-4 shadow-xs">
      <div className="flex md:grid md:grid-cols-9 gap-2 sm:gap-2.5 overflow-x-auto md:overflow-visible no-scrollbar py-1 px-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.name}
              href={cat.href}
              className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-slate-50/50 md:bg-transparent hover:bg-slate-50 transition-all border border-slate-200/50 md:border-transparent hover:border-slate-200 shrink-0 md:shrink group min-w-[95px] sm:min-w-[110px] md:min-w-0 text-center min-h-[44px]"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white md:bg-slate-100/80 group-hover:bg-cyan-50 text-slate-700 group-hover:text-cyan-600 border border-slate-200/60 group-hover:border-cyan-200/80 flex items-center justify-center transition-all mb-2 shadow-2xs group-hover:scale-105 duration-200">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-900 group-hover:text-cyan-600 transition-colors line-clamp-1">
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
