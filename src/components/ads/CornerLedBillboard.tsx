'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface CornerLedBillboardProps {
  leftAdUrl?: string;
  rightAdUrl?: string;
}

export function CornerLedBillboard({
  leftAdUrl = 'https://www.mediamarkt.com.tr',
  rightAdUrl = 'https://open.spotify.com',
}: CornerLedBillboardProps) {
  const [hoveredFace, setHoveredFace] = useState<'left' | 'right' | null>(null);

  // Mouse tilt physics for interactive realism
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 140, damping: 18 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const tiltY = useTransform(smoothX, [-0.5, 0.5], [-3.5, 3.5]);
  const tiltX = useTransform(smoothY, [-0.5, 0.5], [2, -2]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setHoveredFace(null);
  };

  return (
    <div
      className="relative w-full py-4 sm:py-8 flex items-center justify-center select-none"
      style={{ perspective: '1600px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 3D Master Billboard Container - Enlarged Size */}
      <motion.div
        style={{
          rotateY: tiltY,
          rotateX: tiltX,
          transformStyle: 'preserve-3d',
        }}
        className="relative w-full max-w-[960px] h-[230px] xs:h-[270px] sm:h-[350px] md:h-[400px] lg:h-[430px] flex items-center justify-center transition-transform duration-200 ease-out"
      >
        {/* Soft Ambient LED Screen Floor/Wall Glow */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[94%] h-20 bg-red-600/30 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-8 left-1/4 w-2/5 h-16 bg-fuchsia-600/25 blur-3xl rounded-full pointer-events-none" />

        {/* 3D Deep Ground Shadow Under the Protruding Wedge */}
        <div
          className="absolute -bottom-8 left-[5%] w-[90%] h-10 bg-slate-950/50 blur-2xl rounded-full pointer-events-none"
          style={{ transform: 'rotate(-2deg)' }}
        />

        {/* ========================================================================= */}
        {/* 3D CONVEX WEDGE STRUCTURE (Dışa Fırlayan Köşe Billboard)                  */}
        {/* ========================================================================= */}
        <div
          className="relative w-full h-full flex items-stretch justify-center"
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {/* ========================================================= */}
          {/* 1. SOL CEPHE (İç Köşe / Left Face - Rotates AWAY to Left) */}
          {/* ========================================================= */}
          <div
            className="relative w-[35%] h-full flex flex-col justify-between cursor-pointer group"
            style={{
              transformOrigin: 'right center',
              transform: 'rotateY(-52deg) translateZ(0px)', // Steeper slant matching red outline
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Top Metallic Bevel for Left Face */}
            <div
              className="absolute -top-[10px] sm:-top-[14px] left-0 right-0 h-[10px] sm:h-[14px] bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 shadow-sm border-t border-white/90"
              style={{
                transformOrigin: 'bottom center',
                transform: 'rotateX(75deg)',
              }}
            />

            {/* Bottom Metallic Under-Floor Skirt Plate (Visible Bevel) */}
            <div
              className="absolute -bottom-[12px] sm:-bottom-[16px] left-0 right-0 h-[12px] sm:h-[16px] bg-gradient-to-r from-slate-800 via-slate-600 to-slate-700 shadow-xl border-b border-black/40"
              style={{
                transformOrigin: 'top center',
                transform: 'rotateX(-75deg)',
              }}
            />

            {/* Clickable Screen Box */}
            <a
              href={leftAdUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              onMouseEnter={() => setHoveredFace('left')}
              onMouseLeave={() => setHoveredFace(null)}
              className="relative w-full h-full overflow-hidden border-[4px] sm:border-[6px] border-r-0 border-slate-300 bg-slate-950 flex flex-col justify-between rounded-l-sm shadow-2xl"
              style={{
                boxShadow: 'inset 0 0 24px rgba(0,0,0,0.85), -16px 18px 30px rgba(0,0,0,0.45)',
                borderImage: 'linear-gradient(to bottom, #ffffff, #94a3b8, #334155) 1',
              }}
            >
              {/* Spotify Graphic Pattern Artwork */}
              <div className="absolute inset-0 bg-[#8E24AA] overflow-hidden">
                {/* Duotone Crowd Silhouette */}
                <div
                  className="absolute inset-0 opacity-60 mix-blend-screen bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage:
                      'url("https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80")',
                    filter: 'contrast(1.5) saturate(1.9)',
                  }}
                />

                {/* Magenta Ambient Wave */}
                <div className="absolute top-0 right-0 w-36 sm:w-48 h-36 sm:h-48 bg-[#E91E63] rounded-full blur-2xl opacity-85" />

                {/* Mint Green / Cyan Shark-Tooth Wave */}
                <div
                  className="absolute -left-3 top-[36%] w-[130%] h-12 sm:h-18 bg-[#69F0AE] transform -rotate-6 shadow-md"
                  style={{
                    clipPath:
                      'polygon(0% 20%, 15% 70%, 30% 15%, 45% 65%, 60% 25%, 75% 75%, 90% 20%, 100% 60%, 100% 100%, 0% 100%)',
                  }}
                />

                {/* MediaMarkt Brand Pill on Left Face */}
                <div className="absolute top-2.5 sm:top-3.5 left-2.5 sm:left-3.5 z-10">
                  <span className="bg-black/85 backdrop-blur-xs text-white text-[9px] xs:text-[10px] sm:text-xs font-black px-2 sm:px-3 py-1 rounded-full border border-white/20 uppercase tracking-widest shadow-md">
                    MediaMarkt
                  </span>
                </div>

                {/* Promo Text */}
                <div className="absolute top-10 xs:top-12 sm:top-16 left-2.5 sm:left-3.5 z-10 max-w-[90%] space-y-0.5 sm:space-y-1">
                  <p className="text-white font-black text-[11px] xs:text-xs sm:text-base md:text-lg leading-tight tracking-tight drop-shadow-md">
                    CLUB GÜNLERİ
                  </p>
                  <p className="text-[#69F0AE] font-bold text-[9px] xs:text-[10px] sm:text-xs md:text-sm drop-shadow-xs">
                    Kulaklıklarda %20 İndirim
                  </p>
                </div>

                {/* Bottom Right Black Corner Triangle with Glowing Red Dots */}
                <div
                  className="absolute bottom-0 right-0 w-20 sm:w-28 h-20 sm:h-28 bg-black"
                  style={{
                    clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
                  }}
                >
                  <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 flex flex-col gap-1 sm:gap-1.5 items-end">
                    <div className="flex gap-1 sm:gap-1.5">
                      <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-red-500 shadow-xs" />
                      <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-red-500 shadow-xs" />
                    </div>
                    <div className="flex gap-1 sm:gap-1.5">
                      <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-red-500 shadow-xs" />
                      <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-red-500 shadow-xs" />
                      <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-red-500 shadow-xs" />
                    </div>
                  </div>
                </div>
              </div>

              {/* LED Pixel Grid Scanline */}
              <div
                className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, #fff 1px, transparent 1px), linear-gradient(0deg, rgba(0,0,0,0.3) 1px, transparent 1px)',
                  backgroundSize: '3px 3px, 100% 2px',
                }}
              />

              {/* Hover Action Badge */}
              <div className="absolute bottom-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="bg-white/95 text-black text-[9px] sm:text-xs font-black px-2 py-1 rounded-md shadow-md flex items-center gap-1">
                  İncele →
                </span>
              </div>
            </a>
          </div>

          {/* =================================================================== */}
          {/* CENTRAL PROTRUDING METALLIC CORNER SEAM (Apex closest to camera)    */}
          {/* =================================================================== */}
          <div
            className="w-[10px] sm:w-[14px] bg-gradient-to-r from-slate-200 via-white to-slate-400 shadow-2xl z-30 shrink-0 relative"
            style={{
              transform: 'translateZ(2px)',
              boxShadow: '0 0 20px rgba(0,0,0,0.6)',
            }}
          />

          {/* ========================================================= */}
          {/* 2. SAĞ CEPHE (Dış Köşe / Right Face - Rotates to Right)   */}
          {/* ========================================================= */}
          <div
            className="relative w-[65%] h-full flex flex-col justify-between cursor-pointer group"
            style={{
              transformOrigin: 'left center',
              transform: 'rotateY(16deg) translateZ(0px)', // Gentle slant matching red outline
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Top Metallic Bevel for Right Face */}
            <div
              className="absolute -top-[10px] sm:-top-[14px] left-0 right-0 h-[10px] sm:h-[14px] bg-gradient-to-r from-slate-300 via-slate-100 to-slate-400 shadow-sm border-t border-white/90"
              style={{
                transformOrigin: 'bottom center',
                transform: 'rotateX(75deg)',
              }}
            />

            {/* Bottom Metallic Under-Floor Skirt Plate */}
            <div
              className="absolute -bottom-[12px] sm:-bottom-[16px] left-0 right-0 h-[12px] sm:h-[16px] bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 shadow-xl border-b border-black/40"
              style={{
                transformOrigin: 'top center',
                transform: 'rotateX(-75deg)',
              }}
            />

            {/* Clickable Screen Box */}
            <a
              href={rightAdUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              onMouseEnter={() => setHoveredFace('right')}
              onMouseLeave={() => setHoveredFace(null)}
              className="relative w-full h-full overflow-hidden border-[4px] sm:border-[6px] border-l-0 border-slate-300 bg-[#E62B1E] flex flex-col justify-between p-4 xs:p-5 sm:p-7 md:p-9 rounded-r-sm shadow-2xl"
              style={{
                boxShadow: 'inset 0 0 24px rgba(0,0,0,0.35), 18px 20px 34px rgba(0,0,0,0.4)',
                borderImage: 'linear-gradient(to bottom, #ffffff, #94a3b8, #334155) 1',
              }}
            >
              {/* LED Pixel Grid Pattern Overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, #fff 1px, transparent 1px), linear-gradient(0deg, rgba(0,0,0,0.2) 1px, transparent 1px)',
                  backgroundSize: '3px 3px, 100% 2px',
                }}
              />

              {/* Main Headline Copy - Enlarged and Proportioned */}
              <div className="relative z-10 space-y-1.5 xs:space-y-2 sm:space-y-3 md:space-y-4">
                <h2 className="text-white font-black text-sm xs:text-base sm:text-2xl md:text-3xl lg:text-[36px] leading-[1.08] tracking-tight drop-shadow-sm font-sans">
                  Dear person who played
                  <br />
                  &ldquo;Sorry&rdquo; 42 times on
                  <br />
                  Valentine&apos;s Day,
                </h2>

                <p className="text-white/95 font-serif italic text-xs xs:text-sm sm:text-xl md:text-2xl font-bold tracking-normal drop-shadow-xs">
                  What did you do?
                </p>
              </div>

              {/* Bottom Brand Bar */}
              <div className="relative z-10 flex items-end justify-between pt-2 sm:pt-3 mt-auto border-t border-white/25">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  {/* Spotify Logo */}
                  <svg
                    className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 text-black fill-current drop-shadow-sm shrink-0"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.494 17.306c-.216.353-.676.467-1.029.252-2.82-1.722-6.37-2.112-10.55-1.157-.404.093-.812-.159-.904-.564-.093-.405.16-.813.564-.905 4.582-1.047 8.508-.598 11.666 1.345.354.215.468.675.253 1.029zm1.467-3.262c-.272.441-.85.58-1.291.308-3.229-1.984-8.151-2.559-11.97-1.399-.499.151-1.029-.133-1.18-.632-.152-.499.133-1.029.632-1.18 4.364-1.325 9.789-.684 13.501 1.612.442.272.58.85.308 1.291zm.127-3.398c-3.871-2.298-10.258-2.51-13.97-1.382-.594.18-1.226-.156-1.406-.75-.181-.594.156-1.226.75-1.406 4.271-1.297 11.32-1.043 15.78 1.605.534.317.709 1.011.392 1.545-.317.534-1.011.709-1.546.388z" />
                  </svg>
                  <span className="text-black font-black text-sm xs:text-base sm:text-xl md:text-2xl tracking-tight font-sans">
                    Spotify
                  </span>
                </div>

                <div className="text-right text-[10px] xs:text-xs sm:text-sm md:text-base text-black font-semibold leading-tight">
                  <span className="block font-bold">Thanks, 2016.</span>
                  <span className="text-black/80 font-medium">It&apos;s been weird.</span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
