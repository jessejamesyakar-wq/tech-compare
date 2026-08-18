'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronLeft, ChevronRight, Zap, Award, ArrowRight, ShieldCheck } from 'lucide-react';

export interface HeroSlideItem {
  id: string;
  type: 'phone' | 'tv' | 'laptop';
  slug: string;
  badgeText: string;
  scriptHighlight: string;
  mainHeadline: string;
  subHeadline: string;
  productName: string;
  productSpec: string;
  price: string;
  image: string;
}

export const HERO_CAROUSEL_DATA: HeroSlideItem[] = [
  {
    id: 'hero-1',
    type: 'laptop',
    slug: 'asus-vivobook-15-intel-core-3',
    badgeText: '✨ Yerleşik Yapay Zekâ Desteği',
    scriptHighlight: 'gün boyu',
    mainHeadline: 'Doyumsuz İzleme Ve Oyun Deneyimi',
    subHeadline: 'Kullanıcı dostu tasarım ve dikkat çekici performans',
    productName: 'Asus Vivobook 15',
    productSpec: 'Intel Seri 3 Core 7 350 İşlemcili',
    price: '38.799 TL',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'hero-2',
    type: 'phone',
    slug: 'apple-iphone-17-pro-max-2tb-1',
    badgeText: '⚡ 2026 Zirve Amiral Gemisi',
    scriptHighlight: 'kesintisiz',
    mainHeadline: 'A19 Pro Çip İle Geleceğin Gücü',
    subHeadline: 'Titanyum Armor gövde ve 30 saat pil ömrü',
    productName: 'Apple iPhone 17 Pro Max',
    productSpec: '48MP Pro Kamera & 2TB Depolama',
    price: '157.999 TL',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'hero-3',
    type: 'phone',
    slug: 'samsung-galaxy-s26-ultra',
    badgeText: '🔥 Galaxy AI 3.0 Lideri',
    scriptHighlight: 'büyüleyici',
    mainHeadline: 'Snapdragon 8 Gen 5 İle Sınırsız Hız',
    subHeadline: '200MP ISOCELL kamera ve 144Hz QHD+ OLED',
    productName: 'Samsung Galaxy S26 Ultra',
    productSpec: '200MP Kamera + 50MP 10x Periskop',
    price: '92.999 TL',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'hero-4',
    type: 'tv',
    slug: 'philips-65oled951-12',
    badgeText: '🖥️ Bowers & Wilkins Ses Sistemi',
    scriptHighlight: 'sinematik',
    mainHeadline: 'Ambilight 4-Taraflı QD-OLED Şöleni',
    subHeadline: '144Hz VRR oyun akıcılığı ve 2200 nits parlaklık',
    productName: 'Philips 65OLED951/12 65"',
    productSpec: 'META 2.0 QD-OLED & 80W Akustik Ses',
    price: '139.999 TL',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'hero-5',
    type: 'phone',
    slug: 'xiaomi-17-ultra',
    badgeText: '📸 Leica 3.0 Kamera Lideri',
    scriptHighlight: 'kusursuz',
    mainHeadline: 'Leica Dörtlü 200MP Periskop Gücü',
    subHeadline: '1 inç ana sensör ve 144Hz 2K LTPO ekran',
    productName: 'Xiaomi 17 Ultra',
    productSpec: '200MP Leica Periskop & Snapdragon 8 Gen 5',
    price: '97.999 TL',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'hero-6',
    type: 'phone',
    slug: 'oppo-find-x9-ultra',
    badgeText: '⭐ Hasselblad Şampiyonu',
    scriptHighlight: 'eşsiz',
    mainHeadline: 'Hasselblad Master 3.0 Fotoğrafçılık',
    subHeadline: 'Çift periskop lens sistemi ve 100W hızlı şarj',
    productName: 'Oppo Find X9 Ultra',
    productSpec: 'Hasselblad Quad 50MP & 2K LTPO',
    price: '99.999 TL',
    image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'hero-7',
    type: 'tv',
    slug: 'lg-oled65g56la',
    badgeText: '🏆 Micro Lens Array (MLA+)',
    scriptHighlight: 'kristal',
    mainHeadline: 'LG OLED evo G5 Galeri Serisi',
    subHeadline: 'Duvara sıfır tasarım ve α11 AI 4K işlemci',
    productName: 'LG OLED evo G5 65"',
    productSpec: 'MLA+ OLED evo & webOS 26',
    price: '119.999 TL',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'hero-8',
    type: 'tv',
    slug: 'sony-xr-75bravia9',
    badgeText: '🎬XR Master Drive Mini-LED',
    scriptHighlight: 'muazzam',
    mainHeadline: 'Sony Bravia 9 75" Mini-LED',
    subHeadline: 'Acoustic Multi-Audio+ ve 4000 nits tepe parlaklık',
    productName: 'Sony Bravia 9 75"',
    productSpec: 'XR Processor & QLED Mini-LED',
    price: '144.999 TL',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'hero-9',
    type: 'laptop',
    slug: 'macbook-pro-16-m4-max',
    badgeText: '💻 128GB Unified Memory',
    scriptHighlight: 'olağanüstü',
    mainHeadline: 'Apple MacBook Pro 16" M4 Max',
    subHeadline: 'Liquid Retina XDR ekran ve 24 saat pil ömrü',
    productName: 'MacBook Pro 16" M4 Max',
    productSpec: '16 Çekirdek CPU & 40 Çekirdek GPU',
    price: '169.999 TL',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'hero-10',
    type: 'tv',
    slug: 'samsung-75qn900d',
    badgeText: '🌌 Real 8K Resolution',
    scriptHighlight: 'derinlikli',
    mainHeadline: 'Samsung Neo QLED 8K 75"',
    subHeadline: 'NQ8 AI Gen3 İşlemci ile 8K Yapay Zekâ Yükseltme',
    productName: 'Samsung 75QN900D 8K',
    productSpec: 'Quantum Mini LED Pro & Infinity Air Design',
    price: '189.999 TL',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'hero-11',
    type: 'phone',
    slug: 'google-pixel-10-pro-xl',
    badgeText: '🤖 Tensor G5 AI Lideri',
    scriptHighlight: 'akıllı',
    mainHeadline: 'Google Pixel 10 Pro XL',
    subHeadline: 'Gemini Nano entegrasyonu ve Saf Android 16',
    productName: 'Google Pixel 10 Pro XL',
    productSpec: '50MP Dörtlü Kamera & Super Actua Ekran',
    price: '74.999 TL',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'hero-12',
    type: 'tv',
    slug: 'tcl-98c8k',
    badgeText: '🖥️ 248 cm Dev Ekran',
    scriptHighlight: 'büyüleyici',
    mainHeadline: 'TCL 98C8K 97.5" QD-Mini LED',
    subHeadline: '5000 nits tepe parlaklık ve Onkyo 2.1.2 ses',
    productName: 'TCL 98C8K Dev TV',
    productSpec: 'QD-Mini LED 144Hz VRR',
    price: '149.999 TL',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'hero-13',
    type: 'laptop',
    slug: 'asus-rog-strix-scar-18',
    badgeText: '🎮 RTX 5090 Mobile',
    scriptHighlight: 'canavar',
    mainHeadline: 'Asus ROG Strix Scar 18',
    subHeadline: 'Intel Core i9 14900HX & 240Hz Nebula HDR Ekran',
    productName: 'ROG Strix Scar 18',
    productSpec: 'NVIDIA RTX 5090 & 64GB DDR5',
    price: '154.999 TL',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'hero-14',
    type: 'phone',
    slug: 'oneplus-14-pro-5g',
    badgeText: '⚡ 150W SUPERVOOC Hızlı Şarj',
    scriptHighlight: 'akıcı',
    mainHeadline: 'OnePlus 14 Pro 5G',
    subHeadline: 'Hasselblad 4.0 ve 2K 144Hz ProXDR ekran',
    productName: 'OnePlus 14 Pro 5G',
    productSpec: 'Snapdragon 8 Gen 5 & 24GB RAM',
    price: '69.999 TL',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'
  }
];

export function HeroCarousel({
  activeIndex: controlledIndex,
  onIndexChange
}: {
  activeIndex?: number;
  onIndexChange?: (idx: number) => void;
}) {
  const [internalIndex, setInternalIndex] = useState(0);
  const currentIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;

  const setCurrentIndex = (index: number | ((prev: number) => number)) => {
    const nextIdx = typeof index === 'function' ? index(currentIndex) : index;
    setInternalIndex(nextIdx);
    if (onIndexChange) onIndexChange(nextIdx);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_CAROUSEL_DATA.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const slide = HERO_CAROUSEL_DATA[currentIndex];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-xl border border-slate-200/90 bg-gradient-to-br from-white/95 via-slate-50/90 to-emerald-50/40 backdrop-blur-xl text-slate-900">
      
      {/* Background Light Glow Orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 p-6 sm:p-8 lg:p-10 min-h-[360px] flex flex-col justify-between">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
          >
            
            {/* Left Content Side (Light Theme Text) */}
            <div className="lg:col-span-7 space-y-4 text-left">
              
              {/* Top Pill Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300/80 text-xs font-black px-3.5 py-1 rounded-full shadow-2xs uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 fill-emerald-700 text-emerald-700" />
                  <span>{slide.badgeText}</span>
                </div>

                <div className="bg-white/90 text-slate-700 border border-slate-200/90 text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>8 Mağaza Canlı Fiyatı</span>
                </div>
              </div>

              {/* Main Headline with Script Font Accent */}
              <div className="space-y-1">
                <div className="text-xs sm:text-sm font-extrabold text-slate-500 tracking-wide uppercase">
                  {slide.type === 'phone' ? 'AKILLI TELEFON PERFORMANSI' : slide.type === 'tv' ? 'DEV EKRAN SİNEMA DENEYİMİ' : 'BİLGİSAYAR & LAPTOP GÜCÜ'}
                </div>

                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight editorial-title">
                  <span className="font-light text-slate-700 block sm:inline">{slide.mainHeadline.split(' ')[0]} </span>
                  <span className="script-accent text-3xl sm:text-5xl lg:text-6xl font-normal text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 mx-1">
                    {slide.scriptHighlight}
                  </span>
                  <span className="font-black text-slate-900"> {slide.mainHeadline.split(' ').slice(1).join(' ')}</span>
                </h2>
              </div>

              {/* Subheadline Slogan & CTA Buttons */}
              <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl leading-relaxed">
                {slide.subHeadline}. <strong className="text-emerald-700 font-extrabold">100 puanlık algoritma analizi ve 6 aylık grafik takibiyle.</strong>
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href={slide.type === 'tv' ? `/tvs/${slide.slug}` : `/phones/${slide.slug}`}>
                  <button className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xs px-6 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer accent-glow-sm">
                    <span>Şimdi Satın Alın / İnceleyin</span>
                    <ArrowRight className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  </button>
                </Link>

                <Link href="/compare">
                  <button className="bg-white/90 hover:bg-slate-100 text-slate-800 font-extrabold text-xs px-5 py-3 rounded-xl border border-slate-300 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer shadow-2xs">
                    <span>Karşılaştırma Masası</span>
                  </button>
                </Link>
              </div>

            </div>

            {/* Right Side: Product Showcase Image & Price Tag (Light Theme Box) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              
              <Link href={slide.type === 'tv' ? `/tvs/${slide.slug}` : `/phones/${slide.slug}`} className="group relative w-full flex flex-col items-center">
                {/* Product Image Box */}
                <div className="w-full h-44 sm:h-52 bg-white/90 rounded-2xl p-4 flex items-center justify-center relative overflow-hidden border border-slate-200/90 shadow-lg group-hover:border-emerald-500/60 transition-colors">
                  <img
                    src={slide.image}
                    alt={slide.productName}
                    className="max-h-full max-w-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Top-Right Translucent Badge */}
                  <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 text-[10px] font-extrabold px-2.5 py-1 rounded-lg text-emerald-300 shadow-xs">
                    ⚡ Canlı Fiyat Takibi
                  </div>
                </div>

                {/* Product Info & Huge Price Label below Image */}
                <div className="mt-3 text-center space-y-1">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {slide.productName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{slide.productSpec}</p>

                  {/* HUGE 24-28px Extra Bold Price */}
                  <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight tabular-nums pt-1">
                    {slide.price}
                  </div>
                </div>
              </Link>

            </div>

          </motion.div>
        </AnimatePresence>

        {/* Footer Navigation Bar inside Banner */}
        <div className="mt-6 pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          
          {/* Dots & Nav Arrows */}
          <div className="flex items-center gap-5">
            {/* Sliding 5-Dot Window with generous gap */}
            <div className="flex items-center gap-2.5">
              {(() => {
                const total = HERO_CAROUSEL_DATA.length;
                let start = Math.max(0, Math.min(currentIndex - 2, total - 5));
                const end = Math.min(total, start + 5);
                if (end - start < 5) start = Math.max(0, end - 5);

                const visibleDots = [];
                for (let i = start; i < end; i++) {
                  visibleDots.push(i);
                }

                return visibleDots.map((idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2.5 rounded-full transition-all cursor-pointer ${
                      currentIndex === idx
                        ? 'w-7 bg-emerald-600 shadow-xs'
                        : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                    }`}
                    title={`Slayt ${idx + 1}`}
                  />
                ));
              })()}
            </div>

            {/* Slide Counter & Arrow Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold text-slate-500 tabular-nums">
                {currentIndex + 1} / {HERO_CAROUSEL_DATA.length}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentIndex((prev) => (prev - 1 + HERO_CAROUSEL_DATA.length) % HERO_CAROUSEL_DATA.length)}
                  className="p-1.5 rounded-lg bg-white hover:bg-emerald-600 hover:text-white text-slate-700 transition-colors border border-slate-200 cursor-pointer shadow-2xs"
                  title="Önceki"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentIndex((prev) => (prev + 1) % HERO_CAROUSEL_DATA.length)}
                  className="p-1.5 rounded-lg bg-white hover:bg-emerald-600 hover:text-white text-slate-700 transition-colors border border-slate-200 cursor-pointer shadow-2xs"
                  title="Sonraki"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Fine-print Copyright / Credit Notice */}
          <div className="text-[11px] text-slate-400 font-medium">
            © TechKıyas Veri Servisi. Tüm marka hakları ilgili üreticilere aittir.
          </div>

        </div>

      </div>

    </div>
  );
}
