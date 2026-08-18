'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Sparkles } from 'lucide-react';

export interface BannerItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  image: string;
  href: string;
}

interface CategoryBannerGridProps {
  items: BannerItem[];
  variant?: 'quad' | 'wide';
  sectionTitle?: string;
}

export function CategoryBannerGrid({
  items,
  variant = 'quad',
  sectionTitle
}: CategoryBannerGridProps) {
  const isWide = variant === 'wide';

  return (
    <section className="space-y-4">
      {sectionTitle && (
        <h3 className="text-slate-900 text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <span>{sectionTitle}</span>
        </h3>
      )}

      <div
        className={`grid gap-4 ${
          isWide
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        }`}
      >
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`group relative rounded-2xl overflow-hidden shadow-md border border-slate-200 block ${
              isWide ? 'h-52 sm:h-64' : 'h-48 sm:h-56'
            }`}
          >
            {/* Background Lifestyle Image */}
            <img
              src={item.image}
              alt={item.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent transition-opacity group-hover:opacity-95" />

            {/* Badge Top Left */}
            {item.badge && (
              <div className="absolute top-3 left-3 z-10 bg-emerald-500/90 backdrop-blur-md text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-md uppercase tracking-wider">
                {item.badge}
              </div>
            )}

            {/* Content Bottom Left */}
            <div className="absolute bottom-4 left-4 right-4 z-10 space-y-2 text-white">
              {item.subtitle && (
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest block drop-shadow-xs">
                  {item.subtitle}
                </span>
              )}

              <h4 className="text-base sm:text-lg font-black leading-tight drop-shadow-md group-hover:text-emerald-300 transition-colors">
                {item.title}
              </h4>

              <div>
                <span className="bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full px-3.5 py-1 text-xs font-bold shadow-xs group-hover:bg-emerald-600 group-hover:border-emerald-500 transition-colors inline-flex items-center gap-1">
                  <span>Keşfet</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
