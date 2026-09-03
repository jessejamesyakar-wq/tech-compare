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

const STATIC_CATEGORY_COUNTS = {
  smartphones: 823,
  laptops: 831,
  tvs: 938,
  appliances: 956,
  tablets: 557,
  smartwatches: 136,
  headphones: 823,
  consoles: 70,
  monitors: 634
};

export function CategoryIconStrip({ customCounts }: { customCounts?: typeof STATIC_CATEGORY_COUNTS }) {
  const counts = customCounts || STATIC_CATEGORY_COUNTS;

  const categories = [
    {
      name: 'Akıllı Telefonlar',
      href: '/phones',
      icon: Smartphone,
      count: `${counts.smartphones} Model`
    },
    {
      name: 'Bilgisayar & Laptop',
      href: '/laptops',
      icon: Laptop,
      count: `${counts.laptops} Model`
    },
    {
      name: 'Televizyonlar',
      href: '/tvs',
      icon: Tv,
      count: `${counts.tvs} Model`
    },
    {
      name: 'Ev & Yaşam',
      href: '/appliances',
      icon: PlugZap,
      count: `${counts.appliances} Model`
    },
    {
      name: 'Tabletler',
      href: '/tablets',
      icon: Tablet,
      count: `${counts.tablets} Model`
    },
    {
      name: 'Akıllı Saatler',
      href: '/smartwatches',
      icon: Watch,
      count: `${counts.smartwatches} Model`
    },
    {
      name: 'Kulaklıklar',
      href: '/headphones',
      icon: Headphones,
      count: `${counts.headphones} Model`
    },
    {
      name: 'Monitörler',
      href: '/monitors',
      icon: Monitor,
      count: `${counts.monitors} Model`
    },
    {
      name: 'Oyun Konsolları',
      href: '/consoles',
      icon: Gamepad2,
      count: `${counts.consoles} Model`
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
