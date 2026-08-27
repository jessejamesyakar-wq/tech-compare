'use client';

import React from 'react';
import Image from 'next/image';
import PenguinMascot from '@/components/PenguinMascot';

interface DualBrandCorner3DBillboardProps {
  trendyolUrl?: string;
  mediaMarktUrl?: string;
}

export function DualBrandCorner3DBillboard({
  trendyolUrl = 'https://www.trendyol.com',
  mediaMarktUrl = 'https://www.mediamarkt.com.tr',
}: DualBrandCorner3DBillboardProps) {
  return (
    <section className="w-full py-2 sm:py-3 flex items-center justify-center select-none">
      <div className="w-full max-w-[1260px] flex flex-col lg:flex-row items-center justify-between gap-3 sm:gap-5 lg:gap-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 px-3 py-2 sm:px-6 sm:py-3 lg:px-7 lg:py-2.5 shadow-2xl relative overflow-hidden">
        
        {/* Soft Multi-Color Ambient Glow */}
        <div className="absolute top-1/2 -left-10 -translate-y-1/2 w-96 h-96 bg-[#F27A1A]/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-96 h-96 bg-[#E60000]/12 rounded-full blur-3xl pointer-events-none" />

        {/* ========================================================================= */}
        {/* 🏢 3D CORNER BILLBOARD STRUCTURE (Sol: Trendyol | Sağ: MediaMarkt)        */}
        {/* ========================================================================= */}
        <div className="flex-1 w-full max-w-[940px] flex items-center justify-center lg:justify-start">
          
          <div
            className="relative w-full h-[260px] xs:h-[290px] sm:h-[350px] md:h-[400px] lg:h-[430px] flex items-center justify-center"
            style={{
              perspective: '1300px',
              perspectiveOrigin: '50% 50%',
            }}
          >
            {/* Deep Ground Cast Shadow */}
            <div
              className="absolute -bottom-4 left-[8%] w-[84%] h-9 bg-slate-950/35 blur-2xl rounded-full pointer-events-none"
              style={{ transform: 'rotate(-2deg)' }}
            />

            <div
              className="relative w-full h-full flex items-center"
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              
              {/* =================================================================== */}
              {/* 1. SOL KARE CEPHE (TRENDYOL MARKA KAMPANYASI)                       */}
              {/* =================================================================== */}
              <div
                className="relative w-[34%] h-full flex flex-col justify-between"
                style={{
                  transformOrigin: 'right center',
                  transform: 'perspective(900px) rotateY(16deg) skewY(-4deg)',
                  transformStyle: 'preserve-3d',
                  zIndex: 2,
                }}
              >
                {/* Üst Metalik Pah Plakası (Sol Tavan) */}
                <div
                  className="absolute -top-[7px] left-0 right-0 h-[8px] bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 border-t border-white/90 shadow-2xs z-20"
                  style={{
                    transformOrigin: 'bottom center',
                    transform: 'rotateX(70deg)',
                  }}
                />

                {/* Alt Metalik Etek Plakası (Sol Taban) */}
                <div
                  className="absolute -bottom-[9px] left-0 right-0 h-[10px] bg-gradient-to-r from-slate-900 via-slate-700 to-slate-800 shadow-md border-b border-black/40 z-20"
                  style={{
                    transformOrigin: 'top center',
                    transform: 'rotateX(-70deg)',
                  }}
                />

                {/* Trendyol Reklam Paneli (Ürünsüz, Saf Kampanya) */}
                <a
                  href={trendyolUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="relative w-full h-full overflow-hidden bg-gradient-to-br from-[#F27A1A] via-[#E05D06] to-[#B34500] cursor-pointer group flex flex-col justify-between p-3 xs:p-4 sm:p-5 text-white"
                  style={{
                    border: '5px solid #8e9cae',
                    borderRight: 'none',
                    borderImage: 'linear-gradient(to bottom, #cbd5e1 0%, #64748b 50%, #334155 100%) 5',
                    boxShadow: 'inset 0 0 25px rgba(0,0,0,0.65), -14px 16px 28px rgba(0,0,0,0.3)',
                  }}
                >
                  {/* Subtle LED Matrix Texture */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-25 z-10"
                    style={{
                      backgroundImage: 'radial-gradient(rgba(255,255,255,.15) 0.8px, transparent 0.8px)',
                      backgroundSize: '4px 4px',
                    }}
                  />

                  {/* Metallic Inner Highlight Rim */}
                  <div className="absolute inset-0 border border-white/30 pointer-events-none z-10" />

                  {/* Trendyol Content */}
                  <div className="relative z-20 flex flex-col justify-between h-full">
                    {/* Brand Header */}
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-md">
                          trendyol
                        </span>
                        <span className="bg-black/70 text-yellow-300 text-[8px] xs:text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full border border-yellow-400/40">
                          FIRSAT
                        </span>
                      </div>
                      <div className="mt-1 xs:mt-2 text-[10px] xs:text-xs sm:text-sm font-bold text-white/90 leading-tight">
                        Büyük İndirim Günleri
                      </div>
                    </div>

                    {/* Big Discount Badge */}
                    <div className="my-auto py-1">
                      <div className="bg-white/95 text-[#E05D06] px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl shadow-lg font-black text-xs xs:text-sm sm:text-lg md:text-xl leading-none text-center">
                        ₺1.500 KUPON
                      </div>
                      <p className="mt-1 text-[8px] xs:text-[9px] sm:text-[11px] text-white/90 text-center font-semibold">
                        Tüm Alışverişlerde Geçerli
                      </p>
                    </div>

                    {/* Footer Button */}
                    <div className="mt-auto pt-1 sm:pt-2 border-t border-white/25 flex items-center justify-between">
                      <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-bold text-white/80">
                        Kuponu Kap
                      </span>
                      <span className="text-[10px] sm:text-xs font-black bg-white text-[#E05D06] px-2 py-0.5 rounded-full group-hover:scale-105 transition-transform">
                        İncele →
                      </span>
                    </div>
                  </div>
                </a>
              </div>

              {/* =================================================================== */}
              {/* ORTA DİKEY BİRLEŞİM DİREĞİ (PROTRUDING 3D CORNER APEX BEVEL)        */}
              {/* =================================================================== */}
              <div
                className="w-[8px] sm:w-[10px] md:w-[12px] -ml-[2px] h-full bg-gradient-to-r from-slate-400 via-slate-100 to-slate-500 shadow-2xl z-30 shrink-0 relative"
                style={{
                  boxShadow: '0 0 16px rgba(0,0,0,0.6)',
                  borderTop: '1px solid #ffffff',
                  borderBottom: '1px solid #1e293b',
                }}
              />

              {/* =================================================================== */}
              {/* 2. SAĞ DİKDÖRTGEN CEPHE (MEDIAMARKT MARKA KAMPANYASI)               */}
              {/* =================================================================== */}
              <div
                className="relative w-[66%] h-full -ml-[2px] flex flex-col justify-between"
                style={{
                  transformOrigin: 'left center',
                  transform: 'perspective(1400px) rotateY(-4deg) skewY(1deg)',
                  transformStyle: 'preserve-3d',
                  zIndex: 1,
                }}
              >
                {/* Üst Metalik Pah Plakası (Sağ Tavan) */}
                <div
                  className="absolute -top-[7px] left-0 right-0 h-[8px] bg-gradient-to-r from-slate-300 via-slate-100 to-slate-400 border-t border-white/90 shadow-2xs z-20"
                  style={{
                    transformOrigin: 'bottom center',
                    transform: 'rotateX(70deg)',
                  }}
                />

                {/* Alt Metalik Etek Plakası (Sağ Taban) */}
                <div
                  className="absolute -bottom-[9px] left-0 right-0 h-[10px] bg-gradient-to-r from-slate-800 via-slate-600 to-slate-700 shadow-md border-b border-black/40 z-20"
                  style={{
                    transformOrigin: 'top center',
                    transform: 'rotateX(-70deg)',
                  }}
                />

                {/* MediaMarkt Reklam Paneli (Ürünsüz, Saf Kampanya) */}
                <a
                  href={mediaMarktUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="relative w-full h-full overflow-hidden bg-gradient-to-br from-[#E60000] via-[#CC0000] to-[#990000] cursor-pointer group flex flex-col justify-between p-4 xs:p-5 sm:p-7 md:p-8 text-white"
                  style={{
                    border: '5px solid #8e9cae',
                    borderLeft: 'none',
                    borderImage: 'linear-gradient(to bottom, #cbd5e1 0%, #64748b 50%, #334155 100%) 5',
                    boxShadow: 'inset 0 0 30px rgba(0,0,0,0.4), 16px 20px 35px rgba(0,0,0,0.35)',
                  }}
                >
                  {/* Subtle LED Matrix Texture */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-25 z-10"
                    style={{
                      backgroundImage: 'radial-gradient(rgba(255,255,255,.15) 0.8px, transparent 0.8px)',
                      backgroundSize: '4px 4px',
                    }}
                  />

                  {/* Metallic Inner Highlight Rim */}
                  <div className="absolute inset-0 border border-white/30 pointer-events-none z-10" />

                  {/* MediaMarkt Screen Content */}
                  <div className="relative z-20 flex flex-col justify-between h-full space-y-2">
                    
                    {/* Top Row: MediaMarkt Brand & Club Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-md font-sans">
                          Media<span className="text-white">Markt</span>
                        </span>
                        <span className="bg-black/70 text-yellow-300 text-[9px] xs:text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full border border-yellow-400/40 uppercase tracking-wider">
                          CLUB GÜNLERİ
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-xs font-mono text-white/80 font-bold bg-black/40 px-2 py-0.5 rounded">
                        SPONSORLU
                      </span>
                    </div>

                    {/* Headline Offer */}
                    <div className="space-y-1">
                      <h2 className="text-base xs:text-lg sm:text-2xl md:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                        Büyük Teknoloji Festivali Başladı
                      </h2>
                      
                      <div className="inline-block bg-black/80 backdrop-blur-xs px-3 sm:px-4 py-1 rounded-xl border border-white/20 shadow-md">
                        <span className="text-yellow-300 font-black text-sm xs:text-base sm:text-xl md:text-2xl tracking-tight">
                          %25&apos;E VARAN İNDİRİM
                        </span>
                      </div>
                      
                      <p className="text-white/90 text-[11px] xs:text-xs sm:text-sm font-semibold">
                        Club Üyelerine Özel Avantajlar ve Sürpriz Fırsatlar
                      </p>
                    </div>

                    {/* Footer Row: Tags & CTA */}
                    <div className="pt-2 border-t border-white/25 flex items-center justify-between gap-2">
                      <div className="hidden xs:flex items-center gap-2 text-[9px] sm:text-[11px] font-bold text-white/90">
                        <span>✓ Peşin Fiyatına Taksit</span>
                        <span>•</span>
                        <span>✓ Aynı Gün Teslimat</span>
                      </div>

                      <div className="bg-white text-[#CC0000] font-black text-xs sm:text-sm px-4 py-1.5 rounded-xl shadow-lg group-hover:scale-105 transition-transform flex items-center gap-1">
                        <span>Fırsatları Yakala</span>
                        <span>→</span>
                      </div>
                    </div>

                  </div>
                </a>
              </div>

            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* SAĞ ALAN: CANLI ETKİLEŞİMLİ PENGİ MASKOTU                                 */}
        {/* ========================================================================= */}
        <div className="shrink-0 flex items-center justify-center pt-1 lg:pt-0">
          <PenguinMascot />
        </div>

      </div>
    </section>
  );
}
