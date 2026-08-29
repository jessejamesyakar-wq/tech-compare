'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import PenguinMascot from '@/components/PenguinMascot';

interface ChannelAd {
  id: string;
  channelNumber: string;
  channelName: string;
  brand: string;
  logoText: string;
  tagline: string;
  headline: string;
  highlightWords: string;
  description: string;
  badge: string;
  themeColor: string;
  bgGradient: string;
  accentGradient: string;
  glowColor: string;
  borderColor: string;
  stats: {
    icon: string;
    title: string;
    desc: string;
  }[];
  ctaText: string;
  ctaGradient: string;
  targetHref: string;
}

const CHANNEL_ADS: ChannelAd[] = [
  {
    id: 'mediamarkt',
    channelNumber: 'CH 01',
    channelName: 'MEDIAMARKT HD',
    brand: 'MediaMarkt',
    logoText: 'MediaMarkt',
    tagline: 'Elektroniğin Uzmanı MediaMarkt',
    headline: 'MediaMarkt Kulüp Günleri &',
    highlightWords: 'Canlı Fiyat Koruma Garantisi!',
    description: 'En yeni akıllı telefonlar, OLED televizyonlar, laptoplar ve Dyson & Philips ev aletlerinde kulübe özel anlık fiyat düşüşleri.',
    badge: '🔥 GÜNÜN YILDIZ FIRSATLARI',
    themeColor: '#df0000',
    bgGradient: 'from-[#380000] via-[#1f0202] to-[#0a0000]',
    accentGradient: 'from-red-600 via-rose-500 to-amber-500',
    glowColor: 'rgba(223, 0, 0, 0.35)',
    borderColor: 'border-red-500/50',
    stats: [
      { icon: '🏷️', title: 'Kulüp Özel İndirim', desc: 'Anında sepette ek avantaj' },
      { icon: '🚚', title: 'Mağazadan 29 Dk Teslim', desc: 'Türkiye geneli 100+ mağaza' },
      { icon: '🛡️', title: 'Uzatılmış Garanti', desc: 'Kapsamlı koruma paketi' }
    ],
    ctaText: 'MediaMarkt Tekliflerini İncele',
    ctaGradient: 'from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600',
    targetHref: '/phones?sortBy=popular'
  },
  {
    id: 'teknosa',
    channelNumber: 'CH 02',
    channelName: 'TEKNOSA HD',
    brand: 'Teknosa',
    logoText: 'TEKNOSA',
    tagline: 'Herkes İçin Teknoloji',
    headline: 'Teknosa ile Harika Fırsatlar &',
    highlightWords: 'TeknoClub Özel Puan Yağmuru!',
    description: 'Yüzlerce Android ve iPhone modeli, oyuncu bilgisayarları, robot süpürgeler ve akıllı saatlerde peşin fiyatına taksit avantajı.',
    badge: '⚡ TEKNOCLUB KAMPANYASI',
    themeColor: '#ff6600',
    bgGradient: 'from-[#3a1500] via-[#1f0b00] to-[#0a0400]',
    accentGradient: 'from-orange-500 via-amber-500 to-yellow-400',
    glowColor: 'rgba(255, 102, 0, 0.35)',
    borderColor: 'border-orange-500/50',
    stats: [
      { icon: '🟧', title: 'TeknoClub Puanı', desc: 'Her alışverişte nakit puan' },
      { icon: '📦', title: 'Hızlı & Ücretsiz Kargo', desc: 'Kapına kadar güvenli teslim' },
      { icon: '🔧', title: 'TeknoGaranti & Kasko', desc: 'Kırılma ve çalınmaya karşı' }
    ],
    ctaText: 'Teknosa Fırsatlarını Keşfet',
    ctaGradient: 'from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500',
    targetHref: '/laptops'
  },
  {
    id: 'trendyol',
    channelNumber: 'CH 03',
    channelName: 'TRENDYOL MEGA HD',
    brand: 'Trendyol',
    logoText: 'trendyol',
    tagline: 'Mega Teknoloji Günleri',
    headline: 'Milyonların Tercihi Trendyol’da',
    highlightWords: 'Süper İndirimler & Hızlı Teslimat!',
    description: 'Resmi distribütör garantili akıllı cihazlar, yetkili satıcı güvencesi, kullanıcı yorumları ve anlık kupon indirimleriyle cebini koru.',
    badge: '🧡 TRENDYOL MEGA GÜNLER',
    themeColor: '#f27a1a',
    bgGradient: 'from-[#2e0e02] via-[#170600] to-[#080200]',
    accentGradient: 'from-amber-500 via-orange-500 to-rose-500',
    glowColor: 'rgba(242, 122, 26, 0.35)',
    borderColor: 'border-orange-400/50',
    stats: [
      { icon: '💳', title: 'Peşin Fiyatına Taksit', desc: '6 aya varan sıfır faiz' },
      { icon: '🚀', title: 'Trendyol Hızlı Teslim', desc: '24 saatte adresinde' },
      { icon: '⭐', title: 'Orijinal Ürün Güvencesi', desc: 'Onaylı yetkili satıcılar' }
    ],
    ctaText: 'Trendyol İndirimlerini Yakala',
    ctaGradient: 'from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500',
    targetHref: '/tvs'
  },
  {
    id: 'vatan',
    channelNumber: 'CH 04',
    channelName: 'VATAN BİLGİSAYAR HD',
    brand: 'Vatan Bilgisayar',
    logoText: 'VATAN',
    tagline: 'Türkiye’nin Teknoloji Devi',
    headline: 'Vatan Bilgisayar Gece Kuşu &',
    highlightWords: 'Hafta Sonu Donanım Çılgınlığı!',
    description: 'Yüksek performanslı ekran kartları, gaming monitörler, amiral gemisi telefonlar ve 4K Smart TV’lerde internete özel dip fiyatlar.',
    badge: '🔵 GECE KUŞU İNDİRİMİ',
    themeColor: '#004b93',
    bgGradient: 'from-[#001b3a] via-[#000d1f] to-[#00050a]',
    accentGradient: 'from-blue-500 via-cyan-400 to-emerald-400',
    glowColor: 'rgba(0, 75, 147, 0.35)',
    borderColor: 'border-blue-500/50',
    stats: [
      { icon: '🌙', title: 'Web Özel Gece Fiyatı', desc: '22:00 - 08:00 arası dip fiyat' },
      { icon: '🎮', title: 'OEM & Gaming Merkezi', desc: 'Hazır sistemler ve donanım' },
      { icon: '🛠️', title: 'Yerinde Kurulum Desteği', desc: 'Teknik uzman yardımı' }
    ],
    ctaText: 'Vatan Bilgisayar Tekliflerine Git',
    ctaGradient: 'from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500',
    targetHref: '/appliances'
  }
];

export function TechKiyasCornerBillboard() {
  const [currentChannelIndex, setCurrentChannelIndex] = useState(0);
  const [isZapping, setIsZapping] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [osdVisible, setOsdVisible] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Switch channel with authentic TV zap animation
  const changeChannel = (newIndex: number) => {
    if (newIndex === currentChannelIndex && !isZapping) return;
    
    // Trigger TV zap glitch/static
    setIsZapping(true);
    setOsdVisible(true);

    setTimeout(() => {
      setCurrentChannelIndex(newIndex);
    }, 180);

    setTimeout(() => {
      setIsZapping(false);
    }, 420);
  };

  // 5-second automatic channel rotation
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      const nextIndex = (currentChannelIndex + 1) % CHANNEL_ADS.length;
      changeChannel(nextIndex);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentChannelIndex, isPaused]);

  // Hide OSD banner after 2.5 seconds on channel change
  useEffect(() => {
    const osdTimer = setTimeout(() => {
      setOsdVisible(false);
    }, 2800);
    return () => clearTimeout(osdTimer);
  }, [currentChannelIndex]);

  const activeAd = CHANNEL_ADS[currentChannelIndex];

  return (
    <section className="w-full py-3 sm:py-5 flex items-center justify-center select-none">
      <div
        className="w-full max-w-[1260px] flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-3 sm:p-5 lg:p-6 shadow-2xl relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        
        {/* Dynamic Soft Ambient LED Backlight based on current active brand */}
        <div
          className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[600px] h-[380px] rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-30"
          style={{ backgroundColor: activeAd.themeColor }}
        />

        {/* ========================================================================= */}
        {/* 📺 SINGLE SEAMLESS DIGITAL LED TV SCREEN WITH CHANNEL ZAPPING             */}
        {/* ========================================================================= */}
        <div className="flex-1 w-full flex flex-col items-center justify-center">
          
          {/* Outer Heavy-Duty Metallic TV Bezel Frame */}
          <div
            className="relative w-full rounded-2xl sm:rounded-3xl p-1 sm:p-1.5 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-slate-600/70 overflow-hidden group transition-all duration-500"
            style={{
              boxShadow: `0 20px 50px rgba(0,0,0,0.45), 0 0 35px ${activeAd.glowColor}`
            }}
          >
            
            {/* Top Metallic Chamfer Bar */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-80 z-30 pointer-events-none" />
            
            {/* Corner Mounting Screws */}
            <div className="absolute top-2.5 left-2.5 w-1.5 h-1.5 rounded-full bg-slate-500 border border-slate-400/60 shadow-xs z-30 pointer-events-none" />
            <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-slate-500 border border-slate-400/60 shadow-xs z-30 pointer-events-none" />
            <div className="absolute bottom-2.5 left-2.5 w-1.5 h-1.5 rounded-full bg-slate-500 border border-slate-400/60 shadow-xs z-30 pointer-events-none" />
            <div className="absolute bottom-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-slate-500 border border-slate-400/60 shadow-xs z-30 pointer-events-none" />

            {/* Inner Screen Display */}
            <Link
              href={activeAd.targetHref}
              className={`relative block w-full rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br ${activeAd.bgGradient} p-4 sm:p-6 md:p-7 text-white cursor-pointer transition-all duration-500 ${
                isZapping ? 'brightness-150 contrast-125 scale-[0.995]' : 'brightness-100 scale-100'
              }`}
            >
              {/* =================================================================== */}
              {/* ⚡ TV CHANNEL CHANGE / STATIC ZAP GLITCH OVERLAY                     */}
              {/* =================================================================== */}
              {isZapping && (
                <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden flex flex-col justify-between">
                  {/* CRT Zap Line Flash */}
                  <div className="w-full h-1 bg-white shadow-[0_0_20px_#fff] animate-pulse my-auto" />
                  
                  {/* Static Noise Overlay */}
                  <div
                    className="absolute inset-0 opacity-40 mix-blend-screen animate-pulse"
                    style={{
                      backgroundImage: 'radial-gradient(circle, #fff 10%, transparent 11%), radial-gradient(circle, #000 10%, transparent 11%)',
                      backgroundSize: '3px 3px',
                    }}
                  />
                  
                  {/* Horizontal Glitch Scanline Bars */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent h-8 w-full animate-bounce" />
                </div>
              )}

              {/* =================================================================== */}
              {/* 💡 AUTHENTIC LED DIODE MATRIX & SCANLINE TEXTURE LAYERS              */}
              {/* =================================================================== */}
              
              {/* 1. Micro-LED Diode Dot Matrix */}
              <div
                className="absolute inset-0 pointer-events-none opacity-25 z-10"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.35) 0.75px, transparent 0.75px)',
                  backgroundSize: '3.5px 3.5px',
                }}
              />

              {/* 2. TV Horizontal Scanlines */}
              <div
                className="absolute inset-0 pointer-events-none opacity-15 z-10"
                style={{
                  backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.45) 50%)',
                  backgroundSize: '100% 4px',
                }}
              />

              {/* 3. Diagonal Glass Glare */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none z-10" />

              {/* =================================================================== */}
              {/* 📺 TV OSD (ON SCREEN DISPLAY) CHANNEL BADGE (Top-Right Indicator)    */}
              {/* =================================================================== */}
              <div
                className={`absolute top-3.5 right-3.5 z-40 transition-all duration-300 font-mono flex items-center gap-1.5 ${
                  osdVisible || isZapping ? 'opacity-100 translate-y-0 scale-100' : 'opacity-60 translate-y-0 scale-95'
                }`}
              >
                <div className="bg-black/80 backdrop-blur-md border border-emerald-400/60 text-emerald-400 text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-lg shadow-[0_0_12px_rgba(16,185,129,0.5)] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  <span>{activeAd.channelNumber}</span>
                  <span className="text-white/60">•</span>
                  <span className="text-white">{activeAd.channelName}</span>
                </div>
              </div>

              {/* =================================================================== */}
              {/* 🖥️ LED SCREEN DISPLAY CONTENT                                       */}
              {/* =================================================================== */}
              <div className="relative z-20 flex flex-col justify-between h-full space-y-4 sm:space-y-5">
                
                {/* Header Ticker Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 pr-32 sm:pr-40">
                  
                  {/* Brand & Badge */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span
                      className="text-xs sm:text-sm font-black px-3 py-1 rounded-full text-white shadow-lg tracking-wider"
                      style={{ backgroundColor: activeAd.themeColor }}
                    >
                      {activeAd.badge}
                    </span>

                    <span className="text-[11px] sm:text-xs font-bold text-slate-300 font-sans tracking-wide">
                      {activeAd.tagline}
                    </span>
                  </div>

                  {/* Timer 5s Auto-Rotation Status */}
                  <div className="hidden md:flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                    <span>5 sn Otomatik Geçiş</span>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                </div>

                {/* Main Illuminated Brand Headlines */}
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 bg-black/40 border border-white/15 px-3 py-0.5 rounded-lg shadow-inner backdrop-blur-xs">
                    <span className="text-xs sm:text-sm font-black tracking-wider text-white flex items-center gap-1">
                      <span>📺</span> {activeAd.brand} Özel Kampanyası
                    </span>
                  </div>

                  <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
                    {activeAd.headline}{' '}
                    <span className={`text-transparent bg-clip-text bg-gradient-to-r ${activeAd.accentGradient}`}>
                      {activeAd.highlightWords}
                    </span>
                  </h2>

                  <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed max-w-3xl">
                    {activeAd.description}
                  </p>
                </div>

                {/* 3 Interactive LED Brand Stat Capsules */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 py-1">
                  {activeAd.stats.map((stat, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950/70 hover:bg-slate-900/90 border border-white/15 hover:border-white/40 rounded-xl p-2.5 sm:p-3 transition-colors shadow-inner flex items-center gap-2.5"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-base shrink-0 shadow-md border border-white/20"
                        style={{ backgroundColor: `${activeAd.themeColor}33` }}
                      >
                        {stat.icon}
                      </div>
                      <div>
                        <span className="block text-[11px] sm:text-xs font-black text-white">{stat.title}</span>
                        <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">{stat.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Action Strip */}
                <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-400">
                    <span className="text-emerald-400 animate-ping">●</span>
                    <span>aceleEtme Canlı Mağaza Fiyat Doğrulama Sistemi</span>
                  </div>

                  <div className={`self-end sm:self-auto inline-flex items-center gap-2 bg-gradient-to-r ${activeAd.ctaGradient} text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg group-hover:scale-105 transition-all`}>
                    <span>{activeAd.ctaText}</span>
                    <span>→</span>
                  </div>

                </div>

              </div>
            </Link>

          </div>

          {/* ======================================================================= */}
          {/* 🎛️ TV REMOTE CHANNEL SELECTOR BUTTONS (4 BRANDS QUICK SELECTOR)          */}
          {/* ======================================================================= */}
          <div className="w-full mt-3 flex flex-wrap items-center justify-between gap-2 px-1">
            
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
              {CHANNEL_ADS.map((channel, idx) => {
                const isActive = idx === currentChannelIndex;
                return (
                  <button
                    key={channel.id}
                    onClick={(e) => {
                      e.preventDefault();
                      changeChannel(idx);
                    }}
                    className={`px-3 sm:px-4 py-1.5 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      isActive
                        ? 'text-white shadow-md scale-[1.03] border-transparent'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                    style={{
                      backgroundColor: isActive ? channel.themeColor : undefined,
                      boxShadow: isActive ? `0 4px 15px ${channel.glowColor}` : undefined
                    }}
                  >
                    <span className="opacity-80 font-mono text-[9px] sm:text-[10px]">{channel.channelNumber}</span>
                    <span>{channel.brand}</span>
                  </button>
                );
              })}
            </div>

            {/* Progress Bar Indicator (5 Seconds Cycle) */}
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-400">
              <span>KANAL</span>
              <div className="flex gap-1">
                {CHANNEL_ADS.map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => changeChannel(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === currentChannelIndex ? 'w-6 bg-emerald-500' : 'w-2 bg-slate-300 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT AREA: INTERACTIVE PENGUIN MASCOT (PENGİ)                            */}
        {/* ========================================================================= */}
        <div className="shrink-0 flex items-center justify-center pt-2 lg:pt-0">
          <PenguinMascot />
        </div>

      </div>
    </section>
  );
}
