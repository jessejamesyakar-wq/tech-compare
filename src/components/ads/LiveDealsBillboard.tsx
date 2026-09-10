'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingDown, Sparkles, ArrowRight, Scale, BarChart3, BellRing } from 'lucide-react';
import { ACTIVE_STORE_COUNT, ACTIVE_RETAILERS } from '@/lib/activeStores';

export function LiveDealsBillboard() {
  return (
    <section className="w-full py-2 sm:py-4 flex items-center justify-center select-none">
      <div className="w-full max-w-7xl relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/60 border border-emerald-500/25 shadow-sm p-6 sm:p-8 lg:p-9 text-slate-900">
        
        {/* Soft Ambient Glow Backlights matching site colors */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none bg-emerald-500/10" />
        <div className="absolute -bottom-24 -right-10 w-96 h-96 rounded-full blur-3xl pointer-events-none bg-teal-500/12" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full blur-3xl pointer-events-none bg-emerald-400/8" />

        {/* 📈 Decorative Abstract Tech & Price Trend Graphic on Right (eliminates blank space seamlessly) */}
        <div className="absolute right-0 top-0 bottom-0 w-80 lg:w-[440px] pointer-events-none opacity-[0.07] select-none overflow-hidden hidden sm:block">
          <svg className="w-full h-full" viewBox="0 0 500 320" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="80" x2="500" y2="80" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" className="text-emerald-900" />
            <line x1="0" y1="160" x2="500" y2="160" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" className="text-emerald-900" />
            <line x1="0" y1="240" x2="500" y2="240" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" className="text-emerald-900" />
            <line x1="120" y1="0" x2="120" y2="320" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" className="text-emerald-900" />
            <line x1="260" y1="0" x2="260" y2="320" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" className="text-emerald-900" />
            <line x1="400" y1="0" x2="400" y2="320" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" className="text-emerald-900" />
            
            <path d="M20 270 C 100 250, 160 280, 240 180 C 320 80, 390 120, 480 50" stroke="currentColor" strokeWidth="5" strokeLinecap="round" className="text-emerald-700" />
            <path d="M20 270 C 100 250, 160 280, 240 180 C 320 80, 390 120, 480 50 L 480 320 L 20 320 Z" fill="url(#emerald-chart-grad)" opacity="0.3" />
            <path d="M20 295 C 120 280, 200 230, 290 200 C 360 175, 410 140, 480 90" stroke="currentColor" strokeWidth="3" strokeDasharray="8 8" className="text-teal-600" />

            <circle cx="240" cy="180" r="7" className="text-emerald-600" fill="currentColor" />
            <circle cx="480" cy="50" r="9" className="text-teal-500" fill="currentColor" />

            <defs>
              <linearGradient id="emerald-chart-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#059669" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* 🏷️ TOP RIGHT: aceleEtme LIVE BADGE */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 flex items-center gap-2 font-mono">
          <span className="px-3.5 py-1.5 text-[10.5px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full shadow-2xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>%100 Tarafsız & Ücretsiz</span>
          </span>
        </div>

        {/* Main Content: Full-width expanded layout with balanced typography */}
        <div className="relative z-10 w-full space-y-4">
          
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
          <div className="space-y-2 max-w-4xl">
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

          {/* 3 Value Pillars matching website color scheme - Spanning all 3 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1.5">
            
            <div className="bg-white/90 backdrop-blur-xs border border-slate-200/90 hover:border-emerald-500/60 rounded-2xl p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex items-center gap-3.5 shadow-2xs group">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-base shrink-0 border border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="block text-sm font-black text-slate-900 truncate">6 Aylık Fiyat Grafiği</span>
                <span className="text-xs text-slate-500 font-semibold truncate block">Gerçek dip fiyat geçmişi</span>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-xs border border-slate-200/90 hover:border-teal-500/60 rounded-2xl p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex items-center gap-3.5 shadow-2xs group">
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-black text-base shrink-0 border border-teal-200 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <Scale className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="block text-sm font-black text-slate-900 truncate">Yapay Zekâ Düellosu</span>
                <span className="text-xs text-slate-500 font-semibold truncate block">100 puan üzerinden kıyaslama</span>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-xs border border-slate-200/90 hover:border-amber-500/60 rounded-2xl p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex items-center gap-3.5 shadow-2xs group">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-black text-base shrink-0 border border-amber-200 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <BellRing className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="block text-sm font-black text-slate-900 truncate">Anlık Fiyat Alarmı</span>
                <span className="text-xs text-slate-500 font-semibold truncate block">Hedef fiyatta anında bildirim</span>
              </div>
            </div>

          </div>

          {/* Bottom Actions Row */}
          <div className="pt-2.5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80">
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

      </div>
    </section>
  );
}

export default LiveDealsBillboard;
