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
    <section className="w-full min-h-[440px] sm:min-h-[470px] flex items-center justify-center overflow-hidden bg-white py-4 px-2 sm:px-6 md:px-10 box-border select-none">
      <div className="w-full max-w-[1100px] h-[360px] sm:h-[410px] relative flex items-center justify-center">
        
        {/* === 3D FOLDED SCREEN (24.png Birebir Geometri) === */}
        <div
          className="absolute left-1 sm:left-4 md:left-[20px] top-[20px] sm:top-[35px] w-[92%] sm:w-[740px] md:w-[780px] h-[260px] xs:h-[290px] sm:h-[330px] flex drop-shadow-[0_22px_22px_rgba(0,0,0,0.18)] drop-shadow-[0_5px_5px_rgba(0,0,0,0.12)]"
          style={{
            perspective: '1200px',
          }}
        >
          {/* ========================================================= */}
          {/* LEFT PURPLE PANEL (Sol Katlanmış Cephe)                    */}
          {/* ========================================================= */}
          <a
            href={leftAdUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="relative w-[28%] sm:w-[220px] h-full shrink-0 overflow-hidden bg-[#a4008d] border-2 border-[#333] box-border z-[2] cursor-pointer group"
            style={{
              transformOrigin: 'right center',
              transform: 'perspective(900px) rotateY(7deg) skewY(-3deg)',
            }}
          >
            {/* Purple Graphic Art */}
            <div className="absolute inset-0 bg-[#a4008d] overflow-hidden">
              {/* Duotone Concert Silhouette */}
              <div
                className="absolute inset-0 opacity-60 mix-blend-screen bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{
                  backgroundImage:
                    'url("https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80")',
                  filter: 'contrast(1.4) saturate(1.8)',
                }}
              />

              {/* Magenta / Pink Waves */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#E91E63] rounded-full blur-2xl opacity-80" />

              {/* Mint Green Wave */}
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

            {/* LED Screen Scanline Texture */}
            <div
              className="absolute inset-0 pointer-events-none opacity-25"
              style={{
                backgroundImage: 'radial-gradient(rgba(255,255,255,.12) 0.7px, transparent 0.7px)',
                backgroundSize: '4px 4px',
              }}
            />
          </a>

          {/* ========================================================= */}
          {/* MAIN RED PANEL (Sağ Ana Trapez/Perspektif Cephe)           */}
          {/* ========================================================= */}
          <a
            href={rightAdUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="relative w-[72%] sm:w-[560px] md:w-[610px] h-full -ml-[4px] bg-gradient-to-b from-[#ef1717] to-[#e91515] border-2 border-[#333] box-border overflow-hidden z-[1] cursor-pointer group flex flex-col"
            style={{
              transformOrigin: 'left center',
              transform: 'perspective(1400px) rotateY(-2deg) skewY(1deg)',
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

            {/* Screen Content Box */}
            <div className="relative z-[2] w-full h-full box-border p-4 xs:p-6 sm:p-8 md:pt-[38px] md:px-[40px] md:pb-[25px] text-white flex flex-col justify-between">
              
              {/* Title (24.png: Büyük Beyaz Sans-Serif) */}
              <h1 className="m-0 max-w-[500px] font-sans font-bold text-base xs:text-xl sm:text-3xl md:text-[38px] leading-[1.08] tracking-[-1.5px] text-white">
                Dear person who played<br />
                &ldquo;Sorry&rdquo; 42 times on<br />
                Valentine&apos;s Day,
              </h1>

              {/* Question (24.png: Kesinlikle Sans-Serif / Düz Normal Font) */}
              <div className="mt-2 sm:mt-[22px] font-sans font-normal text-sm xs:text-base sm:text-xl md:text-[25px] leading-[1.2] text-white">
                What did you do?
              </div>

              {/* Footer Bar (24.png) */}
              <div className="mt-auto pt-2 sm:pt-[18px] border-t border-white/28 flex items-center justify-between">
                
                {/* Spotify (Sol Alt) */}
                <div className="flex items-center gap-2 sm:gap-[10px] font-sans text-sm xs:text-base sm:text-[20px] font-bold text-[#050505]">
                  <span className="w-5 h-5 sm:w-[31px] sm:h-[31px] rounded-full flex items-center justify-center bg-[#050505] text-white text-[10px] sm:text-[13px]">
                    ●
                  </span>
                  <span>Spotify</span>
                </div>

                {/* Reply (Sağ Alt) */}
                <div className="text-left font-sans text-[11px] xs:text-xs sm:text-[16px] leading-[1.25] font-medium text-[#080808]">
                  Thanks, 2016.<br />
                  It&apos;s been weird.
                </div>

              </div>

            </div>
          </a>

        </div>

        {/* ========================================================= */}
        {/* PENGUIN WRAPPER (24.png Konumu ve Ölçeği)                  */}
        {/* ========================================================= */}
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
