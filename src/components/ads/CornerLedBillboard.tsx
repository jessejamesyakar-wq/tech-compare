'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export function CornerLedBillboard() {
  const [isHovered, setIsHovered] = useState(false);

  // Mouse tilt physics for 3D realism
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 120, damping: 14 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const tiltY = useTransform(smoothX, [-0.5, 0.5], [-6, 6]);
  const tiltX = useTransform(smoothY, [-0.5, 0.5], [4, -4]);

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
    setIsHovered(false);
  };

  return (
    <div
      className="relative w-full py-4 sm:py-6 flex items-center justify-center select-none"
      style={{ perspective: '1600px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* 3D Corner Billboard Container */}
      <motion.div
        style={{
          rotateY: tiltY,
          rotateX: tiltX,
          transformStyle: 'preserve-3d',
        }}
        className="relative w-full max-w-[940px] h-[220px] xs:h-[250px] sm:h-[300px] md:h-[340px] flex items-center justify-center transition-transform duration-200 ease-out"
      >
        {/* Soft Ambient LED Screen Floor / Wall Glow */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[90%] h-14 bg-red-600/25 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-6 left-1/4 w-1/3 h-12 bg-fuchsia-600/20 blur-2xl rounded-full pointer-events-none" />

        {/* 3D Deep Ground Shadow */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[85%] h-6 bg-slate-900/30 blur-xl rounded-full transform -rotate-1" />

        {/* === 3D CORNER STRUCTURE (2 Angled Connected Faces) === */}
        <div
          className="relative w-full h-full flex items-stretch shadow-2xl rounded-sm"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* ========================================================= */}
          {/* 1. SOL CEPHE (İç Köşe / Left Face - Angled 3D Plane)      */}
          {/* ========================================================= */}
          <div
            className="relative w-[34%] h-full overflow-hidden border-t-2 border-b-2 border-l-2 border-slate-700/80 bg-slate-950 flex flex-col justify-between"
            style={{
              transformOrigin: 'right center',
              transform: 'rotateY(34deg) translateZ(8px)',
              boxShadow: 'inset -8px 0 20px rgba(0,0,0,0.85), -12px 16px 28px rgba(0,0,0,0.35)',
            }}
          >
            {/* Spotify 'Sorry' Graphic Pattern Background */}
            <div className="absolute inset-0 bg-[#7B1FA2] overflow-hidden">
              {/* Cyan / Mint Wave Pattern */}
              <div
                className="absolute -left-6 top-1/3 w-[140%] h-20 bg-[#4DD0E1] transform -rotate-12 opacity-95"
                style={{
                  clipPath: 'polygon(0 30%, 25% 65%, 50% 20%, 75% 70%, 100% 35%, 100% 100%, 0% 100%)',
                }}
              />
              
              {/* Magenta / Pink Waves */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#9C27B0]/90 via-[#E91E63]/80 to-transparent mix-blend-multiply" />

              {/* Crowd / Concert Silhouette Image Overlay */}
              <div
                className="absolute inset-0 opacity-40 mix-blend-screen bg-cover bg-center"
                style={{
                  backgroundImage:
                    'url("https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80")',
                }}
              />

              {/* Geometric Memphis Dots / Zigzag */}
              <div className="absolute top-2 left-2 text-black/60 font-mono text-[10px] tracking-widest leading-none font-bold">
                ▲ ▼ ▲ ▼ ▲<br />▲ ▼ ▲ ▼ ▲
              </div>
              <div className="absolute bottom-2 right-2 text-black/40 font-mono text-[9px] tracking-tighter font-bold">
                ••••••••••<br />••••••••••
              </div>

              {/* Corner Shadow Crease where the 2 faces meet */}
              <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/85 via-black/40 to-transparent pointer-events-none" />
            </div>

            {/* LED Pixel Grid Scanline Texture */}
            <div
              className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #fff 1px, transparent 1px), linear-gradient(0deg, rgba(0,0,0,0.3) 1px, transparent 1px)',
                backgroundSize: '4px 4px, 100% 3px',
              }}
            />

            {/* Subtle LED Scanline Sweep Animation */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent animate-pulse pointer-events-none" />
          </div>

          {/* ========================================================= */}
          {/* 2. SAĞ CEPHE (Dış Köşe / Right Face - Facing Penguin)     */}
          {/* ========================================================= */}
          <div
            className="relative w-[66%] h-full overflow-hidden border-t-2 border-b-2 border-r-2 border-slate-700/80 bg-[#E62B1E] flex flex-col justify-between p-4 sm:p-6 md:p-8"
            style={{
              transformOrigin: 'left center',
              transform: 'rotateY(-10deg) translateZ(16px)',
              boxShadow: 'inset 8px 0 24px rgba(0,0,0,0.45), 14px 18px 32px rgba(0,0,0,0.3)',
            }}
          >
            {/* LED Pixel Grid Pattern Overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #fff 1px, transparent 1px), linear-gradient(0deg, rgba(0,0,0,0.2) 1px, transparent 1px)',
                backgroundSize: '4px 4px, 100% 3px',
              }}
            />

            {/* Corner Inner Shadow Seam */}
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none z-10" />

            {/* Main Headline Copy (Spotify 'Sorry' Campaign) */}
            <div className="relative z-10 space-y-2 sm:space-y-3">
              <h2 className="text-white font-black text-lg xs:text-xl sm:text-2xl md:text-[28px] lg:text-[32px] leading-[1.12] tracking-tight drop-shadow-sm font-sans">
                Dear person who played &ldquo;Sorry&rdquo; 42 times on Valentine&apos;s Day,
              </h2>

              <p className="text-white/95 font-serif italic text-sm xs:text-base sm:text-lg md:text-xl font-bold tracking-normal drop-shadow-xs">
                What did you do?
              </p>
            </div>

            {/* Bottom Brand Bar (Spotify Logo & Sign-off) */}
            <div className="relative z-10 flex items-end justify-between pt-2 border-t border-white/20 mt-auto">
              <div className="flex items-center gap-2">
                {/* Spotify Icon (White on Red) */}
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-current drop-shadow-sm"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.494 17.306c-.216.353-.676.467-1.029.252-2.82-1.722-6.37-2.112-10.55-1.157-.404.093-.812-.159-.904-.564-.093-.405.16-.813.564-.905 4.582-1.047 8.508-.598 11.666 1.345.354.215.468.675.253 1.029zm1.467-3.262c-.272.441-.85.58-1.291.308-3.229-1.984-8.151-2.559-11.97-1.399-.499.151-1.029-.133-1.18-.632-.152-.499.133-1.029.632-1.18 4.364-1.325 9.789-.684 13.501 1.612.442.272.58.85.308 1.291zm.127-3.398c-3.871-2.298-10.258-2.51-13.97-1.382-.594.18-1.226-.156-1.406-.75-.181-.594.156-1.226.75-1.406 4.271-1.297 11.32-1.043 15.78 1.605.534.317.709 1.011.392 1.545-.317.534-1.011.709-1.546.388z" />
                </svg>
                <span className="text-white font-black text-sm sm:text-base tracking-tight">
                  Spotify
                </span>
              </div>

              <div className="text-right text-[10px] sm:text-xs text-white/90 font-medium">
                <span className="block font-bold">Thanks, 2016.</span>
                <span className="text-white/80">It&apos;s been weird.</span>
              </div>
            </div>

            {/* Subtle Screen Bevel Glare on Edge */}
            <div className="absolute inset-0 border border-white/20 pointer-events-none" />
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          </div>
        </div>

        {/* 3D Top Metallic Bevel Edge */}
        <div
          className="absolute -top-2 left-0 right-0 h-2 bg-gradient-to-r from-slate-800 via-slate-600 to-slate-700 rounded-t-sm"
          style={{
            transform: 'rotateX(90deg) translateZ(4px)',
          }}
        />
      </motion.div>
    </div>
  );
}
