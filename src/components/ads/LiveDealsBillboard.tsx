'use client';

import React from 'react';
import Link from 'next/link';
import PenguinMascot from '@/components/PenguinMascot';
import { TrendingDown, Sparkles, ArrowRight, Scale, BarChart3, BellRing } from 'lucide-react';

export function LiveDealsBillboard() {
  return (
    <section className="w-full py-2 sm:py-4 flex items-center justify-center select-none">
      <div className="w-full max-w-7xl relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#061d15] via-[#081520] to-[#04090e] border border-emerald-500/20 shadow-xl p-5 sm:p-7 md:p-8 text-white">
        
        {/* Soft Ambient LED Glow Backlights */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none bg-emerald-500/15" />
        <div className="absolute -bottom-24 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none bg-cyan-500/10" />

        {/* 💡 LED Texture Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20 z-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 0.75px, transparent 0.75px)',
            backgroundSize: '4px 4px',
          }}
        />

        {/* 🏷️ TOP RIGHT: aceleEtme LIVE BADGE */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 flex items-center gap-2 font-mono">
          <span className="px-3 py-1 text-[10.5px] font-black uppercase tracking-wider bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 rounded-full backdrop-blur-md shadow-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>%100 Tarafsız & Ücretsiz</span>
          </span>
        </div>

        {/* Main Grid: Content on Left (Expanded Across) + Penguin on Right */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Left Column (spans 8 or 9 columns, expanding across to the Penguin) */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            
            {/* Header Ticker */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-black px-3 py-1 rounded-full text-white shadow-sm tracking-wider bg-emerald-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>RESMİ PLATFORM REHBERİ</span>
              </span>

              <span className="text-xs font-bold text-slate-300 tracking-wide">
                Türkiye&apos;nin En Gelişmiş Teknoloji & Canlı Fiyat Karşılaştırma Merkezi
              </span>
            </div>

            {/* Main Title & Subhead */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
                Acele Etme, Akıllı Karşılaştır!{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  En Doğru Zamanda En Uygun Fiyata Ulaş.
                </span>
              </h2>

              <div className="inline-flex items-center gap-2 bg-emerald-950/70 border border-emerald-400/30 text-emerald-300 text-xs sm:text-sm font-black px-3.5 py-1.5 rounded-xl shadow-xs">
                <TrendingDown className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>8 Büyük Mağazada 5.670+ Model Canlı Takipte • Sahte İndirimlere Son!</span>
              </div>
            </div>

            {/* 3 Value Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/40 rounded-2xl p-3 transition-colors flex items-center gap-3 backdrop-blur-xs">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-base shrink-0 border border-emerald-500/30">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-black text-white truncate">6 Aylık Fiyat Grafiği</span>
                  <span className="text-[10px] text-slate-300 font-medium truncate block">Gerçek dip fiyat geçmişi</span>
                </div>
              </div>

              <div className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/40 rounded-2xl p-3 transition-colors flex items-center gap-3 backdrop-blur-xs">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-base shrink-0 border border-cyan-500/30">
                  <Scale className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-black text-white truncate">Yapay Zekâ Düellosu</span>
                  <span className="text-[10px] text-slate-300 font-medium truncate block">100 puan üzerinden kıyaslama</span>
                </div>
              </div>

              <div className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/40 rounded-2xl p-3 transition-colors flex items-center gap-3 backdrop-blur-xs">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-base shrink-0 border border-amber-500/30">
                  <BellRing className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-black text-white truncate">Anlık Fiyat Alarmı</span>
                  <span className="text-[10px] text-slate-300 font-medium truncate block">Hedef fiyatta anında bildirim</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-300">
                <span className="text-emerald-400 animate-pulse">●</span>
                <span>Hepsiburada, Trendyol, MediaMarkt, Amazon, Teknosa, Vatan & İtopya Canlı Takipte</span>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/compare"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs px-5 py-2.5 rounded-full shadow-lg hover:scale-105 transition-all cursor-pointer"
                >
                  <Scale className="w-4 h-4" />
                  <span>Hemen Kıyaslamaya Başla</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/phones"
                  className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-full border border-white/15 transition-all cursor-pointer"
                >
                  <span>Modelleri Gör</span>
                </Link>
              </div>
            </div>

          </div>

          {/* Right Column: Penguin Mascot integrated into the banner */}
          <div className="lg:col-span-4 xl:col-span-3 flex items-center justify-center lg:justify-end">
            <PenguinMascot />
          </div>

        </div>

      </div>
    </section>
  );
}

export default LiveDealsBillboard;
