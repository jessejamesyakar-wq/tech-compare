import { useI18n } from '@/lib/i18n/context';
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ChevronRight, X } from 'lucide-react';

export function WeeklyPromoStrip() {
  const { t } = useI18n();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="w-full bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-3 sm:px-6 flex items-center justify-between gap-4 shadow-xl border border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
      
      {/* Left: Brand Badge */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
          <Sparkles className="w-5 h-5 text-slate-950 fill-slate-950" />
        </div>

        <div className="hidden sm:block">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block leading-tight">ÖZEL SEÇİM</span>
          <span className="text-sm font-black tracking-tight text-white italic">Haftanın Ürünü</span>
        </div>
      </div>

      {/* Center: Product Title & Huge Price */}
      <div className="flex items-center gap-3 text-xs sm:text-sm font-bold min-w-0 truncate">
        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs sm:text-sm font-black px-2.5 py-0.5 rounded-lg shrink-0 tabular-nums">
          59.999 TL
        </span>
        <span className="text-slate-100 font-extrabold truncate">
          Apple iPhone 17 Pro 256GB - A18 Pro Yapay Zekâ Çipi
        </span>
      </div>

      {/* Right: CTA & Close Button */}
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/phones/apple-iphone-17-pro-256-gb"
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
        >
          <span>Şimdi Keşfet</span>
          <ChevronRight className="w-4 h-4" />
        </Link>

        <button
          onClick={() => setIsVisible(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
          title="Şeridi Gizle"
        >
          <span className="hidden md:inline text-slate-400">Gizle</span>
          <X className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
