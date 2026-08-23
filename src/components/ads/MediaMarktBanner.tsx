'use client';

import React from 'react';
import { Sparkles, ArrowUpRight, Zap } from 'lucide-react';

interface MediaMarktBannerProps {
  customImage?: string;
  targetUrl?: string;
}

export function MediaMarktBanner({
  customImage,
  targetUrl = 'https://www.mediamarkt.com.tr'
}: MediaMarktBannerProps) {
  if (customImage) {
    return (
      <a
        href={targetUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="relative block w-full overflow-hidden rounded-3xl border border-red-500/30 shadow-lg group transition-all duration-300 hover:scale-[1.01]"
      >
        <span className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider z-10 border border-white/20">
          Sponsorlu • Reklam
        </span>
        <img
          src={customImage}
          alt="MediaMarkt Kampanyası"
          className="w-full h-auto object-cover rounded-3xl"
        />
      </a>
    );
  }

  return (
    <a
      href={targetUrl}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#DF0000] via-[#C40000] to-[#8A0000] text-white p-5 sm:p-7 shadow-xl border border-red-400/40 group transition-all duration-300 hover:shadow-2xl hover:shadow-red-900/30 hover:border-red-300 w-full min-h-[240px]"
    >
      {/* Background Decorative Ambient Elements */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/20 rounded-full blur-xl pointer-events-none" />
      <div className="absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />

      {/* Top Bar: Logo / Brand & Sponsor Badge */}
      <div className="flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2">
          {/* MediaMarkt Text Logo Representation */}
          <div className="bg-white text-[#DF0000] font-black italic text-lg sm:text-xl tracking-tighter px-3 py-1 rounded-lg shadow-md flex items-center gap-1 leading-none">
            <span>Media</span>
            <span className="text-black">Markt</span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 bg-black/30 backdrop-blur-xs text-red-100 text-[10px] font-extrabold px-2.5 py-1 rounded-md border border-white/10">
            <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
            <span>CLUB FIRSATLARI</span>
          </span>
        </div>

        <span className="bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/20 uppercase tracking-wider">
          Sponsorlu • Reklam
        </span>
      </div>

      {/* Main Campaign Message */}
      <div className="space-y-1.5 my-3 relative z-10">
        <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide shadow-xs">
          <Sparkles className="w-3 h-3" />
          <span>Günün Teknoloji İndirimleri</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-xs leading-tight">
          Laptop, Telefon ve TV&apos;lerde Dev İndirim Günleri!
        </h3>
        <p className="text-xs sm:text-sm text-red-100 font-medium leading-relaxed max-w-lg">
          MediaMarkt Club üyelerine özel seçili binlerce üründe anında sepette indirim ve aynı gün mağazadan ücretsiz teslimat avantajı.
        </p>
      </div>

      {/* Bottom CTA Row */}
      <div className="pt-2 flex items-center justify-between gap-3 border-t border-white/15 relative z-10">
        <div className="flex items-center gap-2 text-[11px] text-red-100 font-semibold">
          <span className="bg-white/15 px-2.5 py-1 rounded-md text-white font-bold">Faizsiz Taksit</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline bg-white/15 px-2.5 py-1 rounded-md text-white font-bold">Ücretsiz Kargo</span>
        </div>

        <div className="inline-flex items-center gap-1.5 bg-white text-[#DF0000] group-hover:bg-slate-950 group-hover:text-white text-xs font-black px-4 py-2 rounded-xl shadow-md transition-all duration-200 shrink-0">
          <span>Fırsatları Keşfet</span>
          <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </a>
  );
}
