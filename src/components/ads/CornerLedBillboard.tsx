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

  // Mouse tilt physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 140, damping: 18 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const tiltY = useTransform(smoothX, [-0.5, 0.5], [-4, 4]);
  const tiltX = useTransform(smoothY, [-0.5, 0.5], [2.5, -2.5]);

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
      className="relative w-full py-3 sm:py-6 flex items-center justify-center select-none"
      style={{ perspective: '1400px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 3D Master Billboard Container */}
      <motion.div
        style={{
          rotateY: tiltY,
          rotateX: tiltX,
          transformStyle: 'preserve-3d',
        }}
        className="relative w-full max-w-[820px] h-[190px] xs:h-[220px] sm:h-[270px] md:h-[310px] flex items-center justify-center"
      >
        {/* Soft Ambient LED Glow */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[92%] h-14 bg-red-600/25 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-6 left-1/4 w-1/3 h-10 bg-fuchsia-600/20 blur-2xl rounded-full pointer-events-none" />

        {/* 3D Deep Ground Shadow Under the Protruding Wedge */}
        <div
          className="absolute -bottom-6 left-[8%] w-[84%] h-7 bg-slate-950/40 blur-2xl rounded-full pointer-events-none"
          style={{ transform: 'rotate(-2deg)' }}
        />

        {/* ========================================================================= */}
        {/* 3D CONVEX WEDGE STRUCTURE (Dışa Fırlayan Köşe - Corner Points TO USER)    */}
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
            className="relative w-[34%] h-full flex flex-col justify-between cursor-pointer group"
            style={{
              transformOrigin: 'right center',
              transform: 'rotateY(-46deg) translateZ(0px)', // Negative angle pulls left edge backward, pushes center seam forward!
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Top Metallic Bevel for Left Face */}
            <div
              className="absolute -top-[7px] sm:-top-[9px] left-0 right-0 h-[8px] sm:h-[10px] bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 shadow-xs border-t border-white/80"
              style={{
                transformOrigin: 'bottom center',
                transform: 'rotateX(75deg)',
              }}
            />

            {/* Bottom Metallic Bevel for Left Face */}
            <div
              className="absolute -bottom-[7px] sm:-bottom-[9px] left-0 right-0 h-[8px] sm:h-[10px] bg-gradient-to-r from-slate-800 via-slate-600 to-slate-700 shadow-md"
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
              className="relative w-full h-full overflow-hidden border-[3px] sm:border-[5px] border-r-0 border-slate-300 bg-slate-950 flex flex-col justify-between rounded-l-sm shadow-xl"
              style={{
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8), -12px 14px 24px rgba(0,0,0,0.4)',
                borderImage: 'linear-gradient(to bottom, #f8fafc, #94a3b8, #475569) 1',
              }}
            >
              {/* Spotify Graphic Pattern Artwork */}
              <div className="absolute inset-0 bg-[#8E24AA] overflow-hidden">
                {/* Duotone Crowd Silhouette */}
                <div
                  className="absolute inset-0 opacity-55 mix-blend-screen bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage:
                      'url("https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80")',
                    filter: 'contrast(1.5) saturate(1.8)',
                  }}
                />

                {/* Magenta Ambient Wave */}
                <div className="absolute top-0 right-0 w-28 sm:w-36 h-28 sm:h-36 bg-[#E91E63] rounded-full blur-2xl opacity-80" />

                {/* Mint Green / Cyan Shark-Tooth Wave */}
                <div
                  className="absolute -left-3 top-[38%] w-[130%] h-9 sm:h-13 bg-[#69F0AE] transform -rotate-6 shadow-md"
                  style={{
                    clipPath:
                      'polygon(0% 20%, 15% 70%, 30% 15%, 45% 65%, 60% 25%, 75% 75%, 90% 20%, 100% 60%, 100% 100%, 0% 100%)',
                  }}
                />

                {/* MediaMarkt Brand Pill on Left Face */}
                <div className="absolute top-2 left-2 z-10">
                  <span className="bg-black/80 backdrop-blur-xs text-white text-[8px] sm:text-[9px] font-black px-1.5 sm:px-2 py-0.5 rounded-full border border-white/20 uppercase tracking-widest">
                    MediaMarkt
                  </span>
                </div>

                {/* Promo Text */}
                <div className="absolute top-7 sm:top-8 left-2 sm:left-3 z-10 max-w-[90%]">
                  <p className="text-white font-black text-[9px] xs:text-[10px] sm:text-xs leading-tight tracking-tight drop-shadow-sm">
                    CLUB GÜNLERİ
                  </p>
                  <p className="text-[#69F0AE] font-bold text-[8px] xs:text-[9px] sm:text-[10px] drop-shadow-xs">
                    Kulaklıklarda %20 İndirim
                  </p>
                </div>

                {/* Bottom Right Black Corner Triangle with Glowing Red Dots */}
                <div
                  className="absolute bottom-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-black"
                  style={{
                    clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
                  }}
                >
                  <div className="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 flex flex-col gap-0.5 sm:gap-1 items-end">
                    <div className="flex gap-1 sm:gap-1.5">
                      <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-red-500 shadow-xs" />
                      <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-red-500 shadow-xs" />
                    </div>
                    <div className="flex gap-1 sm:gap-1.5">
                      <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-red-500 shadow-xs" />
                      <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-red-500 shadow-xs" />
                      <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-red-500 shadow-xs" />
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

              {/* Hover Badge */}
              <div className="absolute bottom-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="bg-white/90 text-black text-[8px] sm:text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shadow-sm flex items-center gap-0.5">
                  İncele →
                </span>
              </div>
            </a>
          </div>

          {/* =================================================================== */}
          {/* CENTRAL PROTRUDING METALLIC CORNER BEVEL (Closest point to camera!) */}
          {/* =================================================================== */}
          <div
            className="w-[8px] sm:w-[10px] bg-gradient-to-r from-slate-200 via-white to-slate-400 shadow-2xl z-30 shrink-0 relative"
            style={{
              transform: 'translateZ(1px)',
              boxShadow: '0 0 16px rgba(0,0,0,0.5)',
            }}
          />

          {/* ========================================================= */}
          {/* 2. SAĞ CEPHE (Dış Köşe / Right Face - Rotates AWAY to Right) */}
          {/* ========================================================= */}
          <div
            className="relative w-[66%] h-full flex flex-col justify-between cursor-pointer group"
            style={{
              transformOrigin: 'left center',
              transform: 'rotateY(16deg) translateZ(0px)', // Positive angle pulls right edge backward, keeps center seam forward!
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Top Metallic Bevel for Right Face */}
            <div
              className="absolute -top-[7px] sm:-top-[9px] left-0 right-0 h-[8px] sm:h-[10px] bg-gradient-to-r from-slate-300 via-slate-100 to-slate-400 shadow-xs border-t border-white/80"
              style={{
                transformOrigin: 'bottom center',
                transform: 'rotateX(75deg)',
              }}
            />

            {/* Bottom Metallic Bevel for Right Face */}
            <div
              className="absolute -bottom-[7px] sm:-bottom-[9px] left-0 right-0 h-[8px] sm:h-[10px] bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 shadow-md"
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
              className="relative w-full h-full overflow-hidden border-[3px] sm:border-[5px] border-l-0 border-slate-300 bg-[#E62B1E] flex flex-col justify-between p-3 xs:p-4 sm:p-6 md:p-7 rounded-r-sm shadow-2xl"
              style={{
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.35), 14px 16px 28px rgba(0,0,0,0.35)',
                borderImage: 'linear-gradient(to bottom, #f8fafc, #94a3b8, #475569) 1',
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

              {/* Main Headline Copy */}
              <div className="relative z-10 space-y-1 xs:space-y-1.5 sm:space-y-2.5">
                <h2 className="text-white font-black text-xs xs:text-sm sm:text-xl md:text-2xl lg:text-[27px] leading-[1.1] tracking-tight drop-shadow-sm font-sans">
                  Dear person who played
                  <br />
                  &ldquo;Sorry&rdquo; 42 times on
                  <br />
                  Valentine&apos;s Day,
                </h2>

                <p className="text-white/95 font-serif italic text-[11px] xs:text-xs sm:text-base md:text-lg font-bold tracking-normal drop-shadow-xs">
                  What did you do?
                </p>
              </div>

              {/* Bottom Brand Bar */}
              <div className="relative z-10 flex items-end justify-between pt-1 sm:pt-2 mt-auto border-t border-white/20">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Spotify Logo */}
                  <svg
                    className="w-4 h-4 xs:w-5 xs:h-5 sm:w-7 sm:h-7 text-black fill-current drop-shadow-sm shrink-0"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.494 17.306c-.216.353-.676.467-1.029.252-2.82-1.722-6.37-2.112-10.55-1.157-.404.093-.812-.159-.904-.564-.093-.405.16-.813.564-.905 4.582-1.047 8.508-.598 11.666 1.345.354.215.468.675.253 1.029zm1.467-3.262c-.272.441-.85.58-1.291.308-3.229-1.984-8.151-2.559-11.97-1.399-.499.151-1.029-.133-1.18-.632-.152-.499.133-1.029.632-1.18 4.364-1.325 9.789-.684 13.501 1.612.442.272.58.85.308 1.291zm.127-3.398c-3.871-2.298-10.258-2.51-13.97-1.382-.594.18-1.226-.156-1.406-.75-.181-.594.156-1.226.75-1.406 4.271-1.297 11.32-1.043 15.78 1.605.534.317.709 1.011.392 1.545-.317.534-1.011.709-1.546.388z" />
                  </svg>
                  <span className="text-black font-black text-xs xs:text-sm sm:text-base md:text-lg tracking-tight font-sans">
                    Spotify
                  </span>
                </div>

                <div className="text-right text-[9px] xs:text-[10px] sm:text-xs text-black font-semibold leading-tight">
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
