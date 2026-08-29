'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface DigitalLedBillboardScreenProps {
  targetUrl?: string;
}

export function DigitalLedBillboardScreen({
  targetUrl = 'https://www.mediamarkt.com.tr',
}: DigitalLedBillboardScreenProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      badge: '⚡ 2070 KUANTUM SERİSİ',
      code: 'NANO-CHIP #01',
      title: 'MediaMarkt Kuantum Günleri 2070',
      discount: '%35 KUANTUM İNDİRİMİ',
      subtitle: 'Yeni Nesil Nöral-AI Çipli Telefon ve Zihin-Bağlantılı Cihazlarda',
      tags: ['Işınlanma ile 3 Saniyede Teslimat', '120 Yıl Kuantum Garantisi'],
      primaryColor: '#00FFCC',
    },
    {
      badge: '🧠 NÖRO-SES & SİBERNETİK',
      code: 'AUDIO-MATRIX #02',
      title: 'Holografik Ses & Nöro-Kulaklık Festivali',
      discount: '₺50.000 SİBERNETİK TAKAS',
      subtitle: 'Telepatik Gürültü Engelleyici (ANC 9.0) ve 32K Retina Lenslerde',
      tags: ['Sıfır Enerji / Biyo-Şarj', 'Zihin Arayüzü Uyumlu'],
      primaryColor: '#FF0055',
    },
    {
      badge: '🚀 ANTİ-YERÇEKİMİ & ROBOTİK',
      code: 'CYBER-HOME #03',
      title: 'Fütüristik Yapay Zekâ Yaşam Teknolojileri',
      discount: 'IŞIK HIZINDA SEPET İNDİRİMİ',
      subtitle: 'Anti-Gravitasyonel Robot Asistanlar ve Kuantum İşlemcili Laptoplarda',
      tags: ['Club 2070 Özel Kripto Puan', 'Otonom Drone Servisi'],
      primaryColor: '#FFE600',
    },
  ];

  // Auto rotate slides every 5.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const current = slides[activeSlide];

  return (
    <section className="w-full py-4 sm:py-6 flex items-center justify-center select-none">
      <div className="w-full max-w-[1240px] flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 bg-[#05070c] rounded-3xl border border-cyan-500/30 p-3.5 xs:p-5 sm:p-7 md:p-8 shadow-[0_0_50px_rgba(0,255,204,0.15)] relative overflow-hidden">
        
        {/* Futuristic Cyberpunk Background Ambient Lights */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 right-1/3 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-80 h-80 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* ========================================================================= */}
        {/* 🏢 2070 HOLOGRAPHIC QUANTUM LED BILLBOARD SCREEN                          */}
        {/* ========================================================================= */}
        <div className="flex-1 w-full max-w-4xl relative z-10">
          
          {/* Cyber-Obsidian Outer Chassis with Neon Cyan Edge Piping */}
          <div className="relative rounded-2xl bg-[#090d16] border-[4px] sm:border-[6px] border-slate-800 shadow-[0_0_30px_rgba(230,0,0,0.35)] overflow-hidden group">
            
            {/* Top Futuristic Telemetry HUD Bar */}
            <div className="bg-[#030712] px-3.5 py-2 border-b border-cyan-500/30 flex items-center justify-between text-[9px] sm:text-[11px] font-mono tracking-widest text-cyan-400">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-extrabold text-cyan-300">
                  QUANTUM LED V8.4 • 1200 FPS • NEURAL MATRIX
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 font-bold">
                <span className="hidden sm:inline text-fuchsia-400 font-mono">LATENCY: 0.001ms</span>
                <span className="bg-cyan-950/90 text-cyan-300 border border-cyan-400/40 px-2 py-0.5 rounded text-[9px] shadow-[0_0_8px_rgba(0,255,204,0.5)]">
                  2070 CANLI
                </span>
              </div>
            </div>

            {/* Clickable Futuristic Quantum Display */}
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="relative block w-full min-h-[230px] xs:min-h-[260px] sm:min-h-[300px] md:min-h-[340px] bg-gradient-to-br from-[#800000] via-[#4d0000] to-[#1a0005] p-4 xs:p-6 sm:p-8 text-white overflow-hidden cursor-pointer"
            >
              {/* =================================================================== */}
              {/* 💡 2070 QUANTUM LED SUB-PIXEL MICRO-MATRIX & HOLOGRAPHIC SCANLINES  */}
              {/* =================================================================== */}
              <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                  backgroundImage: `
                    radial-gradient(circle, rgba(0, 255, 204, 0.25) 1px, transparent 1px),
                    linear-gradient(0deg, rgba(0, 0, 0, 0.4) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 0, 0, 0.4) 1px, transparent 1px)
                  `,
                  backgroundSize: '3px 3px, 100% 3px, 3px 100%',
                }}
              />

              {/* Holographic Beam Sweep Animation */}
              <div
                className="absolute inset-0 pointer-events-none opacity-25 z-10 animate-pulse"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, rgba(0,255,204,0.15) 0px, rgba(0,255,204,0.15) 2px, transparent 2px, transparent 5px)',
                }}
              />

              {/* Cyber Diagonal HUD Corner Notches */}
              <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-cyan-400/60 pointer-events-none z-10" />
              <div className="absolute bottom-6 left-0 w-16 h-16 border-b-2 border-l-2 border-fuchsia-400/60 pointer-events-none z-10" />

              {/* Digital Screen Content */}
              <div className="relative z-20 h-full flex flex-col justify-between space-y-4">
                
                {/* Top Row: Futuristic 2070 Brand & Quantum Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3.5">
                    {/* Glowing MediaMarkt 2070 Logo */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,0,0,0.9)] font-sans">
                        Media<span className="text-red-500 drop-shadow-[0_0_15px_rgba(255,0,0,1)]">Markt</span>
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400 font-extrabold bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-400/50">
                        2070
                      </span>
                    </div>

                    <span className="bg-black/80 backdrop-blur-xs text-cyan-300 text-[9px] xs:text-[10px] sm:text-xs font-black px-3 py-1 rounded-full border border-cyan-400/50 uppercase tracking-widest shadow-[0_0_12px_rgba(0,255,204,0.5)]">
                      {current.badge}
                    </span>
                  </div>

                  {/* Holographic Slide Indicators */}
                  <div className="flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded-full border border-slate-700">
                    {slides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveSlide(idx);
                        }}
                        className={`h-1.5 sm:h-2 rounded-full transition-all cursor-pointer ${
                          activeSlide === idx
                            ? 'w-6 sm:w-8 bg-cyan-400 shadow-[0_0_10px_rgba(0,255,204,0.9)]'
                            : 'w-2 bg-slate-600 hover:bg-slate-400'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Main 2070 Quantum Offer Headline */}
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-fuchsia-400 font-bold tracking-widest">
                      [{current.code}]
                    </span>
                    <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-[0_0_14px_rgba(255,255,255,0.7)]">
                      {current.title}
                    </h2>
                  </div>

                  {/* Glowing 2070 Neon Discount Capsule */}
                  <div className="inline-block bg-black/90 backdrop-blur-md px-3.5 sm:px-5 py-1 sm:py-2 rounded-xl border border-cyan-400/60 shadow-[0_0_20px_rgba(0,255,204,0.4)]">
                    <span className="text-cyan-300 font-black text-base xs:text-lg sm:text-2xl md:text-3xl tracking-tight drop-shadow-[0_0_15px_rgba(0,255,204,0.9)] font-mono">
                      {current.discount}
                    </span>
                  </div>

                  <p className="text-slate-200 text-xs xs:text-sm sm:text-base font-semibold drop-shadow-sm">
                    {current.subtitle}
                  </p>
                </div>

                {/* 2070 Feature Hologram Tags & Futuristic Cyber CTA */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-cyan-500/30">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {current.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="bg-black/70 text-cyan-200 text-[9px] xs:text-[10px] sm:text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-cyan-500/30 flex items-center gap-1 shadow-xs"
                      >
                        <span className="text-cyan-400">❖</span> {tag}
                      </span>
                    ))}
                  </div>

                  {/* Glowing Cyber CTA Button */}
                  <div className="bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-black font-black text-xs sm:text-sm px-5 sm:px-6 py-2.5 rounded-xl shadow-[0_0_20px_rgba(0,255,204,0.7)] transition-all duration-200 transform group-hover:scale-105 flex items-center gap-2 font-mono">
                    <span>KUANTUM FIRSATI İNCELE</span>
                    <span>⚡</span>
                  </div>
                </div>

              </div>

              {/* Bottom 2070 Quantum Data-Stream Marquee Ticker */}
              <div className="absolute bottom-0 left-0 right-0 bg-[#02050b] py-1 px-3 border-t border-cyan-500/40 text-[9px] sm:text-[10px] text-cyan-300 font-mono tracking-widest overflow-hidden whitespace-nowrap z-20 flex items-center shadow-inner">
                <span className="animate-marquee inline-block font-bold">
                  ⚡ 2070 KUANTUM FIRSATLARI: NEURAL-IPHONE 60 PRO ₺49.999 • QUANTUM AIRPODS ULTRA ₺9.999 • CYBER-DYSON V90 ₺34.999 • IŞINLANMA İLE 3 SANİYEDE TESLİMAT • MEDIAMARKT CLUB 2070 İLE BİYO-KRİPTO PUAN KAZAN! ⚡
                </span>
              </div>
            </a>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT: 2070 CYBER-PENGI COMPANION                                         */}
        {/* ========================================================================= */}
        <div className="shrink-0 flex flex-col items-center justify-center z-10">
          <div className="relative w-[140px] xs:w-[170px] sm:w-[210px] md:w-[240px] drop-shadow-[0_0_25px_rgba(0,255,204,0.35)]">
            <Image
              src="/penguin-mascot.png"
              alt="aceleEtme Pengi 2070"
              width={1048}
              height={1219}
              priority
              draggable={false}
              className="w-full h-auto object-contain"
            />
          </div>

          <div className="mt-2.5 bg-cyan-950/90 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(0,255,204,0.4)] rounded-full px-4 py-1 text-xs font-mono font-black flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>2070 Kuantum LED Pano</span>
          </div>
        </div>

      </div>
    </section>
  );
}
