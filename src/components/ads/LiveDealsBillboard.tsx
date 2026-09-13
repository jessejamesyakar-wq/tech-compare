'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Scale, CheckCircle2 } from 'lucide-react';
import { ACTIVE_STORE_COUNT } from '@/lib/activeStores';

export function LiveDealsBillboard() {
  return (
    <section className="w-full py-3 sm:py-5 flex items-center justify-center select-none">
      <div className="w-full max-w-7xl relative overflow-hidden rounded-3xl sm:rounded-4xl bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 border border-slate-200/90 shadow-lg hover:shadow-xl transition-all p-6 sm:p-9 lg:p-10 text-slate-900">
        
        {/* Soft Ambient Glow Backlights */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none bg-emerald-500/10" />
        <div className="absolute -bottom-24 -right-10 w-96 h-96 rounded-full blur-3xl pointer-events-none bg-teal-500/10" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* LEFT 7 COLS: Ultra-Premium Clean Typography & Values */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            
            {/* Header Ticker Badge */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>aceleEtme</span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400 font-extrabold">RESMİ PLATFORM REHBERİ</span>
              </div>

              <span className="px-3 py-1 text-[10.5px] font-bold text-slate-500 bg-white border border-slate-200/90 rounded-full shadow-2xs hidden sm:inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>%100 Tarafsız & Şeffaf</span>
              </span>
            </div>

            {/* Main Headline & Subtitle */}
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                Acele Etme, <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700">
                  Akıllı Karşılaştır
                </span>
              </h2>
              <p className="text-sm sm:text-base font-semibold text-slate-600 tracking-normal">
                En Doğru Zamanda En Uygun Fiyata Ulaş.
              </p>
            </div>

            {/* 3 Value Pillars (Approved checkmarks) */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-2.5 text-slate-800 text-xs sm:text-sm font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                <span>6 Aylık Gerçek Fiyat Grafiği <span className="text-slate-500 font-medium text-xs hidden sm:inline">— Piyasa dip seviyelerini gör</span></span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-800 text-xs sm:text-sm font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                <span>Yapay Zekâ Destekli 100 Puan Düellosu <span className="text-slate-500 font-medium text-xs hidden sm:inline">— Donanım algoritmalarıyla tarafsız skor</span></span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-800 text-xs sm:text-sm font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                <span>{ACTIVE_STORE_COUNT === 1 ? 'Hepsiburada Üzerinde' : `${ACTIVE_STORE_COUNT} Büyük Mağazada`} Canlı Fiyat Takibi <span className="text-slate-500 font-medium text-xs hidden sm:inline">— Sahte indirimlere son</span></span>
              </div>
            </div>

            {/* Premium Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/compare"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <span>Hemen Başla</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </Link>

              <Link
                href="/compare"
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs sm:text-sm px-6 py-3 rounded-2xl border border-slate-300 shadow-2xs hover:border-emerald-500 hover:text-emerald-700 transition-all cursor-pointer"
              >
                <Scale className="w-4 h-4 text-emerald-600" />
                <span>Kıyasla</span>
              </Link>
            </div>

          </div>

          {/* RIGHT 5 COLS: Exact Approved iPhone 18 Pro Visor Design & Screen Showcase */}
          <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-[420px] rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 bg-white group">
              <img
                src="/images/banners/iphone18-pro-mockup-right.webp"
                alt="Apple iPhone 18 Pro"
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Subtle ambient gradient overlay on edge */}
              <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-3xl pointer-events-none" />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

export default LiveDealsBillboard;

