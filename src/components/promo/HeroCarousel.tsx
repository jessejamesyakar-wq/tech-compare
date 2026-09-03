'use client';

import Image from 'next/image';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronLeft, ChevronRight, Zap, Award, ArrowRight, ShieldCheck } from 'lucide-react';
import { Product } from '@/lib/types';
import { HeroSlideItem, getDynamicHeroSlides } from '@/lib/heroSlides';
export type { HeroSlideItem };
export { getDynamicHeroSlides };
interface HeroCarouselProps {
  activeIndex?: number;
  onSelect: (index: number) => void;
  initialSlides?: HeroSlideItem[];
}

export function HeroCarousel({ activeIndex = 0, onSelect, initialSlides = [] }: HeroCarouselProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(activeIndex);
  const [isHovered, setIsHovered] = useState(false);

  const heroSlides = useMemo(() => {
    if (initialSlides && initialSlides.length > 0) return initialSlides;
    return getDynamicHeroSlides();
  }, [initialSlides]);

  // Sync with external activeIndex from thumbnail strip
  useEffect(() => {
    setCurrentSlideIndex(activeIndex);
  }, [activeIndex]);

  // Auto-play timer every 6.5 seconds
  useEffect(() => {
    if (isHovered || heroSlides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => {
        const nextIndex = (prev + 1) % heroSlides.length;
        onSelect(nextIndex);
        return nextIndex;
      });
    }, 6500);

    return () => clearInterval(timer);
  }, [isHovered, heroSlides.length, onSelect]);

  const slide = heroSlides[currentSlideIndex] || heroSlides[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIndex = (currentSlideIndex - 1 + heroSlides.length) % heroSlides.length;
    setCurrentSlideIndex(nextIndex);
    onSelect(nextIndex);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIndex = (currentSlideIndex + 1) % heroSlides.length;
    setCurrentSlideIndex(nextIndex);
    onSelect(nextIndex);
  };

  if (!slide) return null;

  const getProductHref = (category: string, slug: string) => {
    switch (category) {
      case 'tvs':
        return `/tvs/${slug}`;
      case 'laptops':
        return `/laptops/${slug}`;
      case 'appliances':
        return `/appliances/${slug}`;
      case 'tablets':
        return `/tablets/${slug}`;
      case 'smartwatches':
        return `/smartwatches/${slug}`;
      case 'headphones':
        return `/headphones/${slug}`;
      case 'monitors':
        return `/monitors/${slug}`;
      case 'consoles':
        return `/consoles/${slug}`;
      default:
        return `/phones/${slug}`;
    }
  };

  const targetHref = getProductHref(slide.category, slide.slug);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group/carousel relative bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/80 border border-emerald-500/25 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden"
    >
      {/* Vibrant Ambient Glow Orbs */}
      <div className="absolute -right-16 -top-16 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/25 via-teal-400/20 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-[450px] h-[450px] bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      <button
        onClick={handlePrev}
        aria-label="Önceki Slayt"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/95 hover:bg-emerald-600 hover:text-white text-slate-800 shadow-xl border border-slate-200/90 backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100 cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
      </button>

      <button
        onClick={handleNext}
        aria-label="Sonraki Slayt"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/95 hover:bg-emerald-600 hover:text-white text-slate-800 shadow-xl border border-slate-200/90 backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100 cursor-pointer"
      >
        <ChevronRight className="w-5 h-5 stroke-[2.5]" />
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Column: Headlines & Editorial Pitch */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-[11px] font-black px-3.5 py-1 rounded-full shadow-md tracking-wide uppercase">
              <Zap className="w-3.5 h-3.5 fill-current" />
              {slide.badgeText}
            </span>
            <span className="inline-flex items-center gap-1 bg-white/95 border border-slate-200/90 text-slate-700 text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              %100 Bağımsız Algoritmik Analiz
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Acele etme,{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent underline decoration-emerald-300 decoration-wavy decoration-2">
                {slide.scriptHighlight}
              </span>
              .
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-medium max-w-xl leading-relaxed">
              {slide.subHeadline}
            </p>
          </div>

          {/* Featured Product Mini-Card inside Hero */}
          <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-md hover:shadow-lg transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">
                ÖNE ÇIKAN MODEL
              </span>
              <h3 className="text-slate-900 font-extrabold text-base sm:text-lg hover:text-emerald-600 transition-colors line-clamp-1">
                {slide.productName}
              </h3>
              <p className="text-xs text-slate-500 font-medium line-clamp-1">
                {slide.productSpec}
              </p>
            </div>

            <div className="flex items-center gap-3 sm:border-l sm:border-slate-100 sm:pl-4 shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold block">En Düşük Fiyat</span>
                <span className="text-lg sm:text-xl font-black text-slate-900 tabular-nums">
                  {slide.price}
                </span>
              </div>
              <Link
                href={targetHref}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>İncele</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visual Showcase */}
        <div className="lg:col-span-5 flex justify-center items-center relative">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
            <div className="absolute inset-0 bg-radial from-emerald-500/30 via-teal-500/15 to-transparent rounded-full blur-2xl pointer-events-none" />
            
            <Link href={targetHref} className="relative z-10 block group/img cursor-pointer">
              <Image
                src={slide.image}
                alt={slide.productName}
                width={480}
                height={480}
                priority={true}
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 480px"
                className="max-h-60 sm:max-h-72 w-auto max-w-full object-contain filter drop-shadow-2xl group-hover/img:scale-105 transition-transform duration-300"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
