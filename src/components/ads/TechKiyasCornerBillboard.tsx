'use client';

import React from 'react';
import Link from 'next/link';
import PenguinMascot from '@/components/PenguinMascot';

export function TechKiyasCornerBillboard() {
  return (
    <section className="w-full py-2 sm:py-4 flex items-center justify-center select-none">
      <div className="w-full max-w-[1260px] flex flex-col lg:flex-row items-center justify-between gap-3 sm:gap-5 lg:gap-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 px-3 py-2.5 sm:px-6 sm:py-3.5 lg:px-7 lg:py-3 shadow-2xl relative overflow-hidden">
        
        {/* Soft Ambient Brand Glow (TechKıyas Blue & Emerald) */}
        <div className="absolute top-1/2 -left-10 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* ========================================================================= */}
        {/* 🏢 3D CORNER BILLBOARD STRUCTURE (TechKıyas Platform Vitrini)             */}
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
              {/* 1. SOL KARE CEPHE (YAPAY ZEKÂ FİYAT ALARMI & ANALİZ)                */}
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

                {/* Sol Panel: Akıllı Fiyat Analizi */}
                <Link
                  href="/phones"
                  className="relative w-full h-full overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-slate-900 cursor-pointer group flex flex-col justify-between p-3 xs:p-4 sm:p-5 text-white"
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

                  {/* Content */}
                  <div className="relative z-20 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg xs:text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-md flex items-center gap-1.5">
                          <span>⚡</span> TechKıyas
                        </span>
                        <span className="bg-emerald-500/90 text-white text-[8px] xs:text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                          CANLI
                        </span>
                      </div>
                      <div className="mt-1 xs:mt-2 text-[10px] xs:text-xs sm:text-sm font-bold text-blue-100 leading-tight">
                        Akıllı Fiyat Takipçisi
                      </div>
                    </div>

                    {/* Feature Highlight Capsule */}
                    <div className="my-auto py-1">
                      <div className="bg-white/95 text-blue-900 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl shadow-lg font-black text-xs xs:text-sm sm:text-base md:text-lg leading-none text-center">
                        100+ Mağaza
                      </div>
                      <p className="mt-1 text-[8px] xs:text-[9px] sm:text-[11px] text-blue-100 text-center font-semibold">
                        En Ucuz Fiyatı Yakala
                      </p>
                    </div>

                    {/* Footer CTA */}
                    <div className="mt-auto pt-1 sm:pt-2 border-t border-white/25 flex items-center justify-between">
                      <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-bold text-blue-200">
                        Anlık Alarm
                      </span>
                      <span className="text-[10px] sm:text-xs font-black bg-white text-blue-700 px-2 py-0.5 rounded-full group-hover:scale-105 transition-transform">
                        İncele →
                      </span>
                    </div>
                  </div>
                </Link>
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
              {/* 2. SAĞ DİKDÖRTGEN CEPHE (TECHKIYAS ANA KARAR VE KIYASLAMA REHBERİ)   */}
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

                {/* Sağ Panel: Tarafsız Karşılaştırma Rehberi */}
                <Link
                  href="/phones"
                  className="relative w-full h-full overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 cursor-pointer group flex flex-col justify-between p-4 xs:p-5 sm:p-7 md:p-8 text-white"
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

                  {/* Main Content */}
                  <div className="relative z-20 flex flex-col justify-between h-full space-y-2">
                    
                    {/* Top Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-md font-sans">
                          Akıllı <span className="text-blue-400">Karar Asistanı</span>
                        </span>
                        <span className="bg-blue-500/30 text-blue-300 text-[9px] xs:text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full border border-blue-400/40 uppercase tracking-wider">
                          TARAFSIZ & ŞEFFAF
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-xs font-mono text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                        %100 ÜCRETSİZ
                      </span>
                    </div>

                    {/* Headline */}
                    <div className="space-y-1">
                      <h2 className="text-base xs:text-lg sm:text-2xl md:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                        Hangi Cihaz Sana Uygun? Kıyasla, Karar Ver!
                      </h2>
                      
                      <div className="inline-block bg-black/60 backdrop-blur-xs px-3 sm:px-4 py-1 rounded-xl border border-white/20 shadow-md">
                        <span className="text-yellow-300 font-black text-sm xs:text-base sm:text-xl md:text-2xl tracking-tight">
                          Gerçek Kullanıcı Skorları & Fiyat Geçmişi
                        </span>
                      </div>
                      
                      <p className="text-slate-300 text-[11px] xs:text-xs sm:text-sm font-medium">
                        Binlerce teknolojik cihazı teknik özellikleri, bataryası, kamerası ve fiyatıyla yan yana incele.
                      </p>
                    </div>

                    {/* Footer Row */}
                    <div className="pt-2 border-t border-white/20 flex items-center justify-between gap-2">
                      <div className="hidden xs:flex items-center gap-2 text-[9px] sm:text-[11px] font-bold text-slate-300">
                        <span>✓ Canlı Fiyat Takibi</span>
                        <span>•</span>
                        <span>✓ Güvenilir Satıcılar</span>
                        <span>•</span>
                        <span>✓ Reklamsız Deneyim</span>
                      </div>

                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-xs sm:text-sm px-4 py-1.5 rounded-xl shadow-lg group-hover:scale-105 transition-transform flex items-center gap-1">
                        <span>Kıyaslamaya Başla</span>
                        <span>→</span>
                      </div>
                    </div>

                  </div>
                </Link>
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
