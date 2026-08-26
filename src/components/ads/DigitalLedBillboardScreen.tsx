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
      badge: '🔥 CLUB ÖZEL FIRSATI',
      title: 'MediaMarkt Teknoloji Günleri',
      discount: "%25'E VARAN İNDİRİM",
      subtitle: 'Seçili iPhone, MacBook & Akıllı Saatlerde',
      tags: ['Peşin Fiyatına 6 Taksit', 'Aynı Gün Mağazadan Teslimat'],
      accentColor: '#E60000',
    },
    {
      badge: '🎧 SES & MÜZİK FESTİVALİ',
      title: 'Premium Kulaklık Düellosu',
      discount: '₺2.500 TAKAS DESTEĞİ',
      subtitle: 'Sony ANC, AirPods Pro 2 ve JBL Serisinde',
      tags: ['Orijinal Distribütör Garantili', 'Ücretsiz Kargo'],
      accentColor: '#B30000',
    },
    {
      badge: '💻 YILIN EN BÜYÜK İNDİRİMİ',
      title: 'Yapay Zekâ Destekli Laptoplar',
      discount: 'SEPETTE EK ₺3.000 İNDİRİM',
      subtitle: 'Yeni Nesil M4 MacBook ve RTX 4080 Canavarlarında',
      tags: ['Stoklarla Sınırlı', 'Club Üyelerine Özel'],
      accentColor: '#990000',
    },
  ];

  // Auto rotate slides every 5.5s like a real digital city billboard
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const current = slides[activeSlide];

  return (
    <section className="w-full py-4 sm:py-6 flex items-center justify-center select-none">
      <div className="w-full max-w-[1240px] flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-3.5 xs:p-5 sm:p-7 md:p-8 shadow-xl relative overflow-hidden">
        
        {/* Soft Ambient Red LED Wall Glow */}
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* ========================================================================= */}
        {/* 🏢 REALISTIC DIGITAL LED BILLBOARD SCREEN (Endüstriyel Çerçeveli LED Ekran) */}
        {/* ========================================================================= */}
        <div className="flex-1 w-full max-w-4xl">
          
          {/* Industrial Billboard Outer Housing (Metal Kasa) */}
          <div className="relative rounded-2xl bg-[#0d1117] border-[6px] sm:border-[8px] border-[#21262d] shadow-2xl overflow-hidden group">
            
            {/* Top Industrial Mounting Bar & Screws */}
            <div className="bg-[#161b22] px-3 py-1.5 border-b border-slate-700/60 flex items-center justify-between text-[9px] sm:text-[11px] text-slate-400 font-mono tracking-wider">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="font-bold text-red-400">LED PANEL #01 • 4K DIGITAL OUTDOOR</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 font-semibold">
                <span className="hidden sm:inline">P2.5 RGB MATRIX</span>
                <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[9px]">CANLI</span>
              </div>
            </div>

            {/* Clickable Active Digital LED Display */}
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="relative block w-full min-h-[220px] xs:min-h-[250px] sm:min-h-[290px] md:min-h-[320px] bg-gradient-to-br from-[#cc0000] via-[#b30000] to-[#800000] p-4 xs:p-6 sm:p-8 text-white overflow-hidden cursor-pointer"
            >
              {/* =================================================================== */}
              {/* 💡 VISIBLE PHYSICAL LED SUB-PIXEL DOT-MATRIX GRID (Belirgin LED Doku) */}
              {/* =================================================================== */}
              <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                  backgroundImage: `
                    radial-gradient(circle, rgba(0, 0, 0, 0.4) 1.2px, transparent 1.2px),
                    linear-gradient(0deg, rgba(0, 0, 0, 0.25) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 0, 0, 0.25) 1px, transparent 1px)
                  `,
                  backgroundSize: '4px 4px, 100% 4px, 4px 100%',
                }}
              />

              {/* LED Horizontal Scanline Beam Effect */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20 z-10 animate-pulse"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 2px, transparent 2px, transparent 4px)',
                }}
              />

              {/* Digital Billboard Screen Content */}
              <div className="relative z-20 h-full flex flex-col justify-between space-y-4">
                
                {/* Top Row: Brand & Live Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] font-sans">
                      Media<span className="text-white">Markt</span>
                    </span>
                    <span className="bg-black/60 backdrop-blur-xs text-yellow-300 text-[9px] xs:text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full border border-yellow-400/40 uppercase tracking-wider">
                      {current.badge}
                    </span>
                  </div>

                  {/* Slide Indicators */}
                  <div className="flex items-center gap-1.5">
                    {slides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveSlide(idx);
                        }}
                        className={`h-1.5 sm:h-2 rounded-full transition-all cursor-pointer ${
                          activeSlide === idx
                            ? 'w-6 sm:w-8 bg-white shadow-md'
                            : 'w-2 bg-white/40 hover:bg-white/70'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Main Headline & Discount Text (Glowing Neon LED Effect) */}
                <div className="space-y-1 sm:space-y-2">
                  <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                    {current.title}
                  </h2>

                  <div className="inline-block bg-black/80 backdrop-blur-xs px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl border border-white/20 shadow-lg">
                    <span className="text-yellow-300 font-black text-base xs:text-lg sm:text-2xl md:text-3xl tracking-tight drop-shadow-[0_0_12px_rgba(253,224,71,0.8)]">
                      {current.discount}
                    </span>
                  </div>

                  <p className="text-white/95 text-xs xs:text-sm sm:text-base font-semibold drop-shadow-sm">
                    {current.subtitle}
                  </p>
                </div>

                {/* Feature Tags & CTA Button */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/25">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {current.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="bg-black/50 text-white/90 text-[9px] xs:text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-md border border-white/15"
                      >
                        ✓ {tag}
                      </span>
                    ))}
                  </div>

                  <div className="bg-white text-[#cc0000] group-hover:bg-yellow-300 group-hover:text-black font-black text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-xl shadow-xl transition-all duration-200 transform group-hover:scale-105 flex items-center gap-1.5">
                    <span>FIRSATLARI İNCELE</span>
                    <span>→</span>
                  </div>
                </div>

              </div>

              {/* Bottom Scrolling LED Marquee Ticker */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/90 py-1 px-3 border-t border-white/20 text-[9px] sm:text-[10px] text-yellow-300 font-mono tracking-widest overflow-hidden whitespace-nowrap z-20 flex items-center">
                <span className="animate-marquee inline-block font-bold">
                  ⚡ GÜNÜN FIRSATLARI: Apple MacBook M4 ₺39.999 • Sony WH-1000XM5 ₺12.499 • Dyson V15 ₺23.999 • Vade Farksız 6 Taksit • MediaMarkt Club ile Sepette Ekstra Puan Kazan! ⚡
                </span>
              </div>
            </a>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT: PENGUIN MASCOT                                                     */}
        {/* ========================================================================= */}
        <div className="shrink-0 flex flex-col items-center justify-center z-10">
          <div className="relative w-[140px] xs:w-[170px] sm:w-[210px] md:w-[240px] drop-shadow-[0_16px_22px_rgba(0,0,0,0.15)]">
            <Image
              src="/penguin-mascot.png"
              alt="TechKıyas Pengi"
              width={1048}
              height={1219}
              priority
              draggable={false}
              className="w-full h-auto object-contain"
            />
          </div>

          <div className="mt-2.5 bg-slate-900 text-white border border-slate-700 shadow-md rounded-full px-3.5 py-1 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>Canlı Dijital LED Pano</span>
          </div>
        </div>

      </div>
    </section>
  );
}
