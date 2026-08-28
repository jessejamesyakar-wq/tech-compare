'use client';

import React from 'react';
import Link from 'next/link';
import PenguinMascot from '@/components/PenguinMascot';

export function TechKiyasCornerBillboard() {
  return (
    <section className="w-full py-3 sm:py-5 flex items-center justify-center select-none">
      <div className="w-full max-w-[1260px] flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-3 sm:p-5 lg:p-6 shadow-2xl relative overflow-hidden">
        
        {/* Soft Ambient LED Glow radiating behind the screen */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[550px] h-[350px] bg-blue-600/15 dark:bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-y-1/2 w-[450px] h-[300px] bg-emerald-500/15 dark:bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* ========================================================================= */}
        {/* 📺 SINGLE SEAMLESS DIGITAL LED BILLBOARD SCREEN                           */}
        {/* ========================================================================= */}
        <div className="flex-1 w-full flex items-center justify-center">
          
          {/* Outer Heavy-Duty Metallic Bezel Frame */}
          <div className="relative w-full rounded-2xl sm:rounded-3xl p-1 sm:p-1.5 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 shadow-[0_20px_50px_rgba(0,0,0,0.35),0_0_30px_rgba(37,99,235,0.18)] border border-slate-600/60 overflow-hidden group">
            
            {/* Top Metallic Chamfer Bar */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-80 z-30 pointer-events-none" />
            
            {/* Corner LED Screen Mounting Accents */}
            <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-slate-500 border border-slate-400/50 shadow-xs z-30 pointer-events-none" />
            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-slate-500 border border-slate-400/50 shadow-xs z-30 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-slate-500 border border-slate-400/50 shadow-xs z-30 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-slate-500 border border-slate-400/50 shadow-xs z-30 pointer-events-none" />

            {/* Inner Single Screen Container */}
            <Link
              href="/phones"
              className="relative block w-full rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-slate-950 via-[#0a1228] to-[#04091a] p-4 sm:p-6 md:p-7 text-white cursor-pointer transition-all duration-300"
            >
              {/* =================================================================== */}
              {/* 💡 ULTRA-REALISTIC LED DIODE MATRIX & SCANLINE TEXTURE LAYERS        */}
              {/* =================================================================== */}
              
              {/* 1. Micro-LED Diode Dot Grid (Authentic LED Screen Look) */}
              <div
                className="absolute inset-0 pointer-events-none opacity-30 z-10"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 0.75px, transparent 0.75px)',
                  backgroundSize: '3.5px 3.5px',
                }}
              />

              {/* 2. LED Horizontal Raster / Scanlines */}
              <div
                className="absolute inset-0 pointer-events-none opacity-15 z-10"
                style={{
                  backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%)',
                  backgroundSize: '100% 4px',
                }}
              />

              {/* 3. Diagonal Glass Reflection Sheen */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none z-10" />

              {/* 4. Active Internal LED Ambient Glow Blobs */}
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-blue-500/25 rounded-full blur-2xl pointer-events-none z-10 animate-pulse" />
              <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none z-10" />

              {/* =================================================================== */}
              {/* 🖥️ LED SCREEN DISPLAY CONTENT                                       */}
              {/* =================================================================== */}
              <div className="relative z-20 flex flex-col justify-between h-full space-y-4 sm:space-y-5">
                
                {/* Header Ticker Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  
                  {/* Brand & Live Indicator */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-1.5 bg-red-600/90 text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.6)] tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
                      <span>CANLI LED EKRAN</span>
                    </div>

                    <span className="text-xs sm:text-sm font-black text-blue-300 tracking-wider font-mono">
                      TECHKIYAS RADAR
                    </span>
                  </div>

                  {/* Right Status Pill */}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      100+ Mağaza Çevrimiçi
                    </span>
                    <span className="hidden xs:inline-block bg-blue-950/80 text-blue-200 text-[10px] font-mono px-2 py-0.5 rounded border border-blue-800/60">
                      %100 TARAFSIZ
                    </span>
                  </div>
                </div>

                {/* Main Illuminated Headlines */}
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/40 to-emerald-600/40 border border-blue-400/30 px-3 py-1 rounded-xl shadow-inner backdrop-blur-xs">
                    <span className="text-amber-300 text-xs sm:text-sm font-black tracking-wide flex items-center gap-1">
                      <span>⚡</span> Akıllı Karar & Fiyat Alarm Radarı
                    </span>
                  </div>

                  <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
                    Hangi Cihaz Sana Uygun? <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400">Kıyasla, Doğru Karar Ver!</span>
                  </h2>

                  <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed max-w-3xl">
                    Binlerce akıllı telefon, televizyon, laptop ve ev aletini; gerçek kullanıcı puanları, 100 puanlık performans skorları ve 8 büyük mağazanın şeffaf 6 aylık fiyat geçmişiyle canlı incele.
                  </p>
                </div>

                {/* 3 Interactive LED Stat Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 py-1">
                  
                  <div className="bg-slate-900/80 hover:bg-slate-800/90 border border-blue-500/30 hover:border-blue-400 rounded-xl p-2.5 sm:p-3 transition-colors shadow-inner flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/50 flex items-center justify-center text-blue-300 font-black text-sm shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                      📈
                    </div>
                    <div>
                      <span className="block text-[11px] sm:text-xs font-black text-white">6 Aylık Fiyat Analizi</span>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">En dip fiyat alarmı</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 hover:bg-slate-800/90 border border-emerald-500/30 hover:border-emerald-400 rounded-xl p-2.5 sm:p-3 transition-colors shadow-inner flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-400/50 flex items-center justify-center text-emerald-300 font-black text-sm shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                      ⭐
                    </div>
                    <div>
                      <span className="block text-[11px] sm:text-xs font-black text-white">100 Puan Derecesi</span>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">Bağımsız donanım testi</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 hover:bg-slate-800/90 border border-amber-500/30 hover:border-amber-400 rounded-xl p-2.5 sm:p-3 transition-colors shadow-inner flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-600/30 border border-amber-400/50 flex items-center justify-center text-amber-300 font-black text-sm shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                      ⚖️
                    </div>
                    <div>
                      <span className="block text-[11px] sm:text-xs font-black text-white">Canlı Düello Masası</span>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">Birebir teknik karşılaştırma</span>
                    </div>
                  </div>

                </div>

                {/* Footer Action Strip */}
                <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-400">
                    <span className="text-emerald-400">●</span>
                    <span>Anlık Mağaza Senkronizasyonu: Hepsiburada • Trendyol • Amazon • MediaMarkt</span>
                  </div>

                  <div className="self-end sm:self-auto inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] group-hover:scale-105 transition-all">
                    <span>Kıyaslamaya Başla</span>
                    <span>→</span>
                  </div>

                </div>

              </div>
            </Link>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT AREA: INTERACTIVE PENGUIN MASCOT (PENGİ)                            */}
        {/* ========================================================================= */}
        <div className="shrink-0 flex items-center justify-center pt-2 lg:pt-0">
          <PenguinMascot />
        </div>

      </div>
    </section>
  );
}
