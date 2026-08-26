'use client';

import React from 'react';
import Image from 'next/image';

interface MessageHeroBillboardProps {
  leftAdUrl?: string;
  rightAdUrl?: string;
}

export function MessageHeroBillboard({
  leftAdUrl = 'https://www.mediamarkt.com.tr',
  rightAdUrl = 'https://open.spotify.com',
}: MessageHeroBillboardProps) {
  return (
    <section className="w-full min-h-[460px] sm:min-h-[500px] flex items-center justify-center overflow-hidden bg-white py-6 px-2 sm:px-6 md:px-10 box-border select-none">
      <div className="w-full max-w-[1100px] h-[380px] sm:h-[430px] relative flex items-center justify-center">
        
        {/* ========================================================================= */}
        {/* 3D BILLBOARD CASING WITH REALISTIC TITANIUM / CHROME BEVELED FRAMES       */}
        {/* ========================================================================= */}
        <div
          className="absolute left-1 sm:left-4 md:left-[20px] top-[20px] sm:top-[30px] w-[94%] sm:w-[760px] md:w-[800px] h-[270px] xs:h-[300px] sm:h-[340px] flex"
          style={{
            perspective: '1400px',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Deep Ambient LED & Frame Shadow */}
          <div
            className="absolute -bottom-8 left-[6%] w-[88%] h-8 bg-slate-950/45 blur-2xl rounded-full pointer-events-none"
            style={{ transform: 'rotate(-2deg)' }}
          />

          {/* ======================================================================= */}
          {/* 1. SOL PANEL ÇERÇEVESİ (Left Panel with Metallic Bevel Frame)          */}
          {/* ======================================================================= */}
          <div
            className="relative w-[34%] h-full flex flex-col justify-between"
            style={{
              transformOrigin: 'right center',
              transform: 'perspective(900px) rotateY(7deg) skewY(-3deg)',
              transformStyle: 'preserve-3d',
              zIndex: 2,
            }}
          >
            {/* Top Metallic Bevel Rim (Sol Üst Pah) */}
            <div
              className="absolute -top-[7px] left-0 right-0 h-[8px] bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 border-t border-white/90 shadow-2xs z-20"
              style={{
                transformOrigin: 'bottom center',
                transform: 'rotateX(70deg)',
              }}
            />

            {/* Bottom Metallic Base Skirt (Sol Alt Taban Derinliği) */}
            <div
              className="absolute -bottom-[9px] left-0 right-0 h-[10px] bg-gradient-to-r from-slate-900 via-slate-700 to-slate-800 shadow-md border-b border-black/40 z-20"
              style={{
                transformOrigin: 'top center',
                transform: 'rotateX(-70deg)',
              }}
            />

            {/* Left Screen Box with Brushed Aluminum Multi-Layer Border */}
            <a
              href={leftAdUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="relative w-full h-full overflow-hidden bg-[#a4008d] cursor-pointer group flex flex-col justify-between"
              style={{
                border: '6px solid #8e9cae',
                borderRight: 'none',
                borderImage: 'linear-gradient(to bottom, #cbd5e1 0%, #64748b 50%, #334155 100%) 6',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.85), -12px 14px 26px rgba(0,0,0,0.35)',
              }}
            >
              {/* Purple / Magenta Graphic Artwork */}
              <div className="absolute inset-0 bg-[#a4008d] overflow-hidden">
                {/* Duotone Concert Crowd Silhouette */}
                <div
                  className="absolute inset-0 opacity-60 mix-blend-screen bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage:
                      'url("https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80")',
                    filter: 'contrast(1.4) saturate(1.8)',
                  }}
                />

                {/* Magenta Ambient Wave */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#E91E63] rounded-full blur-2xl opacity-80" />

                {/* Mint Green Wave Pattern */}
                <div
                  className="absolute -left-4 top-[38%] w-[130%] h-12 bg-[#69F0AE] transform -rotate-6 shadow-md"
                  style={{
                    clipPath:
                      'polygon(0% 20%, 15% 70%, 30% 15%, 45% 65%, 60% 25%, 75% 75%, 90% 20%, 100% 60%, 100% 100%, 0% 100%)',
                  }}
                />

                {/* MediaMarkt Pill */}
                <div className="absolute top-2 left-2 z-10">
                  <span className="bg-black/80 text-white text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/20 uppercase tracking-widest">
                    MediaMarkt
                  </span>
                </div>

                {/* Bottom Right Black Corner Triangle with Glowing Red Dots */}
                <div
                  className="absolute bottom-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-black"
                  style={{
                    clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
                  }}
                >
                  <div className="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 flex flex-col gap-1 items-end">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-xs" />
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-xs" />
                    </div>
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-xs" />
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-xs" />
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-xs" />
                    </div>
                  </div>
                </div>
              </div>

              {/* LED Pixel Grid Scanline */}
              <div
                className="absolute inset-0 pointer-events-none opacity-25"
                style={{
                  backgroundImage: 'radial-gradient(rgba(255,255,255,.12) 0.7px, transparent 0.7px)',
                  backgroundSize: '4px 4px',
                }}
              />

              {/* Metallic Inner Bevel Highlight Line */}
              <div className="absolute inset-0 border border-white/30 pointer-events-none" />
            </a>
          </div>

          {/* ======================================================================= */}
          {/* CENTRAL METALLIC BEVELED CORNER SEAM PILLAR (Orta Dikey Birleşim Direği) */}
          {/* ======================================================================= */}
          <div
            className="w-[8px] sm:w-[10px] -ml-[2px] bg-gradient-to-r from-slate-400 via-slate-100 to-slate-500 shadow-2xl z-30 shrink-0 relative"
            style={{
              boxShadow: '0 0 12px rgba(0,0,0,0.5)',
              borderTop: '1px solid #ffffff',
              borderBottom: '1px solid #1e293b',
            }}
          />

          {/* ======================================================================= */}
          {/* 2. SAĞ ANA PANEL ÇERÇEVESİ (Main Red Panel with Metallic Bevel Frame)   */}
          {/* ======================================================================= */}
          <div
            className="relative w-[66%] h-full -ml-[2px] flex flex-col justify-between"
            style={{
              transformOrigin: 'left center',
              transform: 'perspective(1400px) rotateY(-2deg) skewY(1deg)',
              transformStyle: 'preserve-3d',
              zIndex: 1,
            }}
          >
            {/* Top Metallic Bevel Rim (Sağ Üst Pah) */}
            <div
              className="absolute -top-[7px] left-0 right-0 h-[8px] bg-gradient-to-r from-slate-300 via-slate-100 to-slate-400 border-t border-white/90 shadow-2xs z-20"
              style={{
                transformOrigin: 'bottom center',
                transform: 'rotateX(70deg)',
              }}
            />

            {/* Bottom Metallic Base Skirt (Sağ Alt Taban Derinliği) */}
            <div
              className="absolute -bottom-[9px] left-0 right-0 h-[10px] bg-gradient-to-r from-slate-800 via-slate-600 to-slate-700 shadow-md border-b border-black/40 z-20"
              style={{
                transformOrigin: 'top center',
                transform: 'rotateX(-70deg)',
              }}
            />

            {/* Main Red Screen Box with Brushed Aluminum Multi-Layer Border */}
            <a
              href={rightAdUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="relative w-full h-full overflow-hidden bg-gradient-to-b from-[#ef1717] to-[#e91515] cursor-pointer group flex flex-col justify-between"
              style={{
                border: '6px solid #8e9cae',
                borderLeft: 'none',
                borderImage: 'linear-gradient(to bottom, #cbd5e1 0%, #64748b 50%, #334155 100%) 6',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.35), 14px 18px 30px rgba(0,0,0,0.35)',
              }}
            >
              {/* Subtle LED Screen Grid Texture */}
              <div
                className="absolute inset-0 pointer-events-none opacity-25 z-0"
                style={{
                  backgroundImage: 'radial-gradient(rgba(255,255,255,.12) 0.7px, transparent 0.7px)',
                  backgroundSize: '4px 4px',
                }}
              />

              {/* Metallic Inner Bevel Highlight Line */}
              <div className="absolute inset-0 border border-white/30 pointer-events-none z-10" />

              {/* Screen Content Box */}
              <div className="relative z-[2] w-full h-full box-border p-4 xs:p-5 sm:p-7 md:pt-[36px] md:px-[38px] md:pb-[24px] text-white flex flex-col justify-between">
                
                {/* Title */}
                <h1 className="m-0 max-w-[500px] font-sans font-bold text-base xs:text-xl sm:text-3xl md:text-[36px] leading-[1.08] tracking-[-1.5px] text-white">
                  Dear person who played<br />
                  &ldquo;Sorry&rdquo; 42 times on<br />
                  Valentine&apos;s Day,
                </h1>

                {/* Question (Düz Sans-Serif) */}
                <div className="mt-2 sm:mt-[18px] font-sans font-normal text-sm xs:text-base sm:text-xl md:text-[24px] leading-[1.2] text-white">
                  What did you do?
                </div>

                {/* Footer Bar */}
                <div className="mt-auto pt-2 sm:pt-[16px] border-t border-white/28 flex items-center justify-between">
                  
                  {/* Spotify */}
                  <div className="flex items-center gap-2 sm:gap-[10px] font-sans text-sm xs:text-base sm:text-[20px] font-bold text-[#050505]">
                    <span className="w-5 h-5 sm:w-[30px] sm:h-[30px] rounded-full flex items-center justify-center bg-[#050505] text-white text-[10px] sm:text-[13px]">
                      ●
                    </span>
                    <span>Spotify</span>
                  </div>

                  {/* Reply */}
                  <div className="text-left font-sans text-[11px] xs:text-xs sm:text-[15px] leading-[1.25] font-medium text-[#080808]">
                    Thanks, 2016.<br />
                    It&apos;s been weird.
                  </div>

                </div>

              </div>
            </a>
          </div>

        </div>

        {/* ======================================================================= */}
        {/* PENGUIN WRAPPER (Maskot Pozisyonu ve Ölçeği)                             */}
        {/* ======================================================================= */}
        <div className="absolute right-0 sm:right-[15px] bottom-[15px] sm:bottom-[25px] w-[130px] xs:w-[150px] sm:w-[190px] md:w-[220px] z-[5] flex items-end justify-center pointer-events-none">
          <Image
            src="/penguin-mascot.png"
            alt="Penguin"
            width={1048}
            height={1219}
            priority
            draggable={false}
            className="w-full h-auto object-contain drop-shadow-[0_12px_10px_rgba(0,0,0,0.12)]"
          />
        </div>

      </div>
    </section>
  );
}
