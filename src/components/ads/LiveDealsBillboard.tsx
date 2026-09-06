'use client';

import React from 'react';
import Link from 'next/link';
import PenguinMascot from '@/components/PenguinMascot';
import { TrendingDown, Sparkles, ArrowRight, Scale, BarChart3, BellRing } from 'lucide-react';
import { ACTIVE_STORE_COUNT, ACTIVE_RETAILERS } from '@/lib/activeStores';

export function LiveDealsBillboard() {
  return (
    <section className="w-full py-2 sm:py-4 flex items-center justify-center select-none">
      <div className="w-full max-w-7xl relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/60 border border-emerald-500/25 shadow-sm p-6 sm:p-8 lg:p-9 text-slate-900">
        
        {/* Soft Ambient Glow Backlights matching site colors */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none bg-emerald-500/10" />
        <div className="absolute -bottom-24 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none bg-teal-500/10" />

        {/* 🏷️ TOP RIGHT: aceleEtme LIVE BADGE */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 flex items-center gap-2 font-mono">
          <span className="px-3.5 py-1.5 text-[10.5px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full shadow-2xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>%100 Tarafsız & Ücretsiz</span>
          </span>
        </div>

        {/* Main Grid: Content on Left (Wide) + Penguin on Right */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Left Column (spans 8 or 9 columns, expanding across to the Penguin) */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            
            {/* Header Ticker */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-black px-3 py-1 rounded-full text-white shadow-xs tracking-wider bg-emerald-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>RESMİ PLATFORM REHBERİ</span>
              </span>

              <span className="text-xs font-bold text-slate-500 tracking-wide">
                Türkiye&apos;nin En Gelişmiş Teknoloji & Canlı Fiyat Karşılaştırma Merkezi
              </span>
            </div>

            {/* Main Title & Subhead */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tight">
                Acele Etme, Akıllı Karşılaştır!{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700">
                  En Doğru Zamanda En Uygun Fiyata Ulaş.
                </span>
              </h2>

              <div className="inline-flex items-center gap-2 bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-black px-3.5 py-1.5 rounded-2xl shadow-2xs">
                <TrendingDown className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  {ACTIVE_STORE_COUNT === 1
                    ? `${ACTIVE_RETAILERS[0]?.name || 'Hepsiburada'} Üzerinde 5.670+ Model Canlı Takipte • Sahte İndirimlere Son!`
                    : `${ACTIVE_STORE_COUNT} Büyük Mağazada 5.670+ Model Canlı Takipte • Sahte İndirimlere Son!`}
                </span>
              </div>
            </div>

            {/* 3 Value Pillars matching website color scheme */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              
              <div className="bg-white border border-slate-200/90 hover:border-emerald-500/60 rounded-2xl p-3.5 transition-all hover:shadow-md flex items-center gap-3 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-base shrink-0 border border-emerald-200">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-black text-slate-900 truncate">6 Aylık Fiyat Grafiği</span>
                  <span className="text-[10px] text-slate-500 font-semibold truncate block">Gerçek dip fiyat geçmişi</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 hover:border-teal-500/60 rounded-2xl p-3.5 transition-all hover:shadow-md flex items-center gap-3 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-black text-base shrink-0 border border-teal-200">
                  <Scale className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-black text-slate-900 truncate">Yapay Zekâ Düellosu</span>
                  <span className="text-[10px] text-slate-500 font-semibold truncate block">100 puan üzerinden kıyaslama</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 hover:border-amber-500/60 rounded-2xl p-3.5 transition-all hover:shadow-md flex items-center gap-3 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-black text-base shrink-0 border border-amber-200">
                  <BellRing className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-black text-slate-900 truncate">Anlık Fiyat Alarmı</span>
                  <span className="text-[10px] text-slate-500 font-semibold truncate block">Hedef fiyatta anında bildirim</span>
                </div>
              </div>

            </div>

            {/* Bottom Actions Row */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80">
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                <span className="text-emerald-600 animate-pulse">●</span>
                <span>Hepsiburada, Trendyol, MediaMarkt, Amazon, Teknosa, Vatan & İtopya Canlı Takipte</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Link
                  href="/compare"
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs px-5 py-2.5 rounded-full shadow-md hover:scale-105 transition-all cursor-pointer"
                >
                  <Scale className="w-4 h-4 text-emerald-400" />
                  <span>Hemen Kıyaslamaya Başla</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/phones"
                  className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-full border border-slate-200 shadow-2xs transition-all cursor-pointer"
                >
                  <span>Modelleri Gör</span>
                </Link>
              </div>
            </div>

          </div>

          {/* Right Column: Penguin Mascot integrated cleanly */}
          <div className="lg:col-span-4 xl:col-span-3 flex items-center justify-center lg:justify-end">
            <PenguinMascot />
          </div>

        </div>

      </div>
    </section>
  );
}

export default LiveDealsBillboard;
