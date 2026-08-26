'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export function CornerLedBillboard() {
  const [isHovered, setIsHovered] = useState(false);

  // Mouse tilt physics for realistic 3D perspective
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 140, damping: 16 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const tiltY = useTransform(smoothX, [-0.5, 0.5], [-5, 5]);
  const tiltX = useTransform(smoothY, [-0.5, 0.5], [3, -3]);

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
      className="relative w-full py-2 sm:py-4 flex items-center justify-center select-none"
      style={{ perspective: '1800px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* 3D Corner Billboard Structure */}
      <motion.div
        style={{
          rotateY: tiltY,
          rotateX: tiltX,
          transformStyle: 'preserve-3d',
        }}
        className="relative w-full max-w-[840px] h-[240px] xs:h-[270px] sm:h-[310px] md:h-[340px] flex items-center justify-center transition-transform duration-200 ease-out"
      >
        {/* Soft Ambient LED Screen Glow */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[90%] h-14 bg-red-600/30 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-6 left-1/4 w-1/3 h-12 bg-fuchsia-600/25 blur-2xl rounded-full pointer-events-none" />

        {/* 3D Deep Ground Shadow */}
        <div className="absolute -bottom-8 left-[10%] w-[80%] h-8 bg-slate-950/40 blur-2xl rounded-full transform -rotate-1 pointer-events-none" />

        {/* ================================================================= */}
        {/* 3D CORNER BOX PRISM (Metallic Brushed Aluminum Beveled Exterior)  */}
        {/* ================================================================= */}
        <div
          className="relative w-full h-full flex items-stretch"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Top Metallic Bevel Roof Plate */}
          <div
            className="absolute -top-[10px] left-0 right-0 h-[12px] bg-gradient-to-b from-slate-200 via-slate-400 to-slate-500 rounded-t-sm shadow-md border-t border-white/60"
            style={{
              transformOrigin: 'bottom center',
              transform: 'rotateX(80deg) translateZ(6px)',
            }}
          />

          {/* Bottom Metallic Bevel Floor Plate */}
          <div
            className="absolute -bottom-[10px] left-0 right-0 h-[12px] bg-gradient-to-t from-slate-900 via-slate-700 to-slate-600 rounded-b-sm shadow-lg"
            style={{
              transformOrigin: 'top center',
              transform: 'rotateX(-80deg) translateZ(6px)',
            }}
          />

          {/* ========================================================= */}
          {/* 1. SOL CEPHE (İç Köşe / Left Face - Angled 3D Plane)      */}
          {/* ========================================================= */}
          <div
            className="relative w-[34%] h-full overflow-hidden border-[5px] sm:border-[6px] border-r-0 border-slate-300 bg-slate-950 flex flex-col justify-between shadow-2xl rounded-l-sm"
            style={{
              transformOrigin: 'right center',
              transform: 'rotateY(36deg) translateZ(10px)',
              boxShadow: 'inset -12px 0 24px rgba(0,0,0,0.85), -14px 18px 30px rgba(0,0,0,0.4)',
              borderImage: 'linear-gradient(to bottom, #f1f5f9, #94a3b8, #475569) 1',
            }}
          >
            {/* Spotify 'Sorry' Graphic Pattern Background */}
            <div className="absolute inset-0 bg-[#8E24AA] overflow-hidden">
              {/* Duotone Concert Crowd Silhouette */}
              <div
                className="absolute inset-0 opacity-45 mix-blend-screen bg-cover bg-center"
                style={{
                  backgroundImage:
                    'url("https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80")',
                  filter: 'contrast(1.4) saturate(1.8)',
                }}
              />

              {/* Magenta / Purple Wave Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#E91E63] rounded-full blur-2xl opacity-80" />

              {/* Mint Green / Cyan Shark-Tooth Wave Pattern (As in Spotify Billboard) */}
              <div
                className="absolute -left-4 top-[40%] w-[130%] h-16 bg-[#69F0AE] transform -rotate-6 shadow-md"
                style={{
                  clipPath:
                    'polygon(0% 20%, 15% 70%, 30% 15%, 45% 65%, 60% 25%, 75% 75%, 90% 20%, 100% 60%, 100% 100%, 0% 100%)',
                }}
              />

              {/* Bottom Right Black Corner Triangle with Glowing Red Dots */}
              <div
                className="absolute bottom-0 right-0 w-24 h-24 bg-black"
                style={{
                  clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
                }}
              >
                <div className="absolute bottom-2 right-2 flex flex-col gap-1 items-end">
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-xs" />
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-xs" />
                  </div>
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-xs" />
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-xs" />
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-xs" />
                  </div>
                </div>
              </div>

              {/* Corner Shadow Seam on Left Face */}
              <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black/90 via-black/50 to-transparent pointer-events-none" />
            </div>

            {/* LED Pixel Grid Pattern Overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #fff 1px, transparent 1px), linear-gradient(0deg, rgba(0,0,0,0.3) 1px, transparent 1px)',
                backgroundSize: '3px 3px, 100% 2px',
              }}
            />
          </div>

          {/* ========================================================= */}
          {/* CENTRAL METALLIC BEVELED CORNER SEAM PILLAR               */}
          {/* ========================================================= */}
          <div
            className="w-[8px] bg-gradient-to-r from-slate-400 via-slate-100 to-slate-500 shadow-xl z-20 shrink-0"
            style={{
              transform: 'translateZ(14px)',
            }}
          />

          {/* ========================================================= */}
          {/* 2. SAĞ CEPHE (Dış Köşe / Right Face - Facing Penguin)     */}
          {/* ========================================================= */}
          <div
            className="relative w-[66%] h-full overflow-hidden border-[5px] sm:border-[6px] border-l-0 border-slate-300 bg-[#E62B1E] flex flex-col justify-between p-4 sm:p-6 md:p-8 shadow-2xl rounded-r-sm"
            style={{
              transformOrigin: 'left center',
              transform: 'rotateY(-10deg) translateZ(14px)',
              boxShadow: 'inset 12px 0 28px rgba(0,0,0,0.4), 16px 20px 36px rgba(0,0,0,0.35)',
              borderImage: 'linear-gradient(to bottom, #f1f5f9, #94a3b8, #475569) 1',
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

            {/* Corner Inner Shadow Seam */}
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none z-10" />

            {/* Main Headline Copy (Spotify 'Sorry' Campaign Exact Typography) */}
            <div className="relative z-10 space-y-3 sm:space-y-4">
              <h2 className="text-white font-black text-xl xs:text-2xl sm:text-3xl md:text-[34px] leading-[1.08] tracking-tight drop-shadow-sm font-sans">
                Dear person who played
                <br />
                &ldquo;Sorry&rdquo; 42 times on
                <br />
                Valentine&apos;s Day,
              </h2>

              <p className="text-white/95 font-serif italic text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-normal drop-shadow-xs">
                What did you do?
              </p>
            </div>

            {/* Bottom Brand Bar (Spotify Logo & Sign-off) */}
            <div className="relative z-10 flex items-end justify-between pt-3 mt-auto">
              <div className="flex items-center gap-2">
                {/* Spotify Logo Icon */}
                <svg
                  className="w-7 h-7 sm:w-9 sm:h-9 text-black fill-current drop-shadow-sm"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.494 17.306c-.216.353-.676.467-1.029.252-2.82-1.722-6.37-2.112-10.55-1.157-.404.093-.812-.159-.904-.564-.093-.405.16-.813.564-.905 4.582-1.047 8.508-.598 11.666 1.345.354.215.468.675.253 1.029zm1.467-3.262c-.272.441-.85.58-1.291.308-3.229-1.984-8.151-2.559-11.97-1.399-.499.151-1.029-.133-1.18-.632-.152-.499.133-1.029.632-1.18 4.364-1.325 9.789-.684 13.501 1.612.442.272.58.85.308 1.291zm.127-3.398c-3.871-2.298-10.258-2.51-13.97-1.382-.594.18-1.226-.156-1.406-.75-.181-.594.156-1.226.75-1.406 4.271-1.297 11.32-1.043 15.78 1.605.534.317.709 1.011.392 1.545-.317.534-1.011.709-1.546.388z" />
                </svg>
                <span className="text-black font-black text-lg sm:text-xl tracking-tight font-sans">
                  Spotify
                </span>
              </div>

              <div className="text-right text-xs sm:text-sm text-black font-semibold leading-tight">
                <span className="block font-bold">Thanks, 2016.</span>
                <span className="text-black/80 font-medium">It&apos;s been weird.</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
