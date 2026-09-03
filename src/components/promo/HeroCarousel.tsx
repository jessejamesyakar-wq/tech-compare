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

      {/* Prev / Next Arrows */}
      <button
        onClick={handlePrev}
        aria-label="Önceki Slayt"
        className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-30 w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-white/95 hover:bg-emerald-600 hover:text-white text-slate-800 shadow-xl border border-slate-200/90 backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100 cursor-pointer"
      >
        <ChevronLeft className="w-4 sm:w-5 h-4 sm:h-5 stroke-[2.5]" />
      </button>

      <button
        onClick={handleNext}
        aria-label="Sonraki Slayt"
        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-30 w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-white/95 hover:bg-emerald-600 hover:text-white text-slate-800 shadow-xl border border-slate-200/90 backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100 cursor-pointer"
      >
        <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5 stroke-[2.5]" />
      </button>

      {/* 📱 MOBILE VIEW (< lg): Compact Side-by-Side without vertical bloat */}
      <div className="block lg:hidden relative z-10 space-y-3">
        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-900 border border-emerald-300/80 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-2xs uppercase tracking-wide">
            <span>{slide.badgeText}</span>
          </span>
          <span className="inline-flex items-center gap-1 bg-white/90 border border-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs backdrop-blur-sm">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Resmi Mağaza Garantili</span>
          </span>
        </div>

        {/* Side-by-Side: Text on Left (7 cols) + Hero Image on Right (5 cols) */}
        <div className="grid grid-cols-12 gap-3 items-center">
          <div className="col-span-7 space-y-2">
            <div>
              <h1 className="text-sm sm:text-base font-black text-slate-950 tracking-tight leading-snug line-clamp-2">
                {slide.mainHeadline}
              </h1>
              <p className="text-[10.5px] text-slate-500 font-semibold line-clamp-1 mt-0.5">
                {slide.subHeadline}
              </p>
            </div>

            <div className="inline-flex items-baseline gap-1.5 bg-white/95 border border-emerald-300/80 px-2.5 py-1 rounded-xl shadow-2xs backdrop-blur-sm">
              <span className="text-[9px] text-slate-400 font-bold uppercase">EN İYİ FİYAT:</span>
              <span className="text-xs sm:text-sm font-black text-emerald-700 tabular-nums">
                {slide.price}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-0.5">
              <Link
                href={targetHref}
                className="bg-slate-950 hover:bg-black text-white font-black text-[10.5px] px-3 py-1.5 rounded-xl shadow-sm transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>İncele</span>
                <ArrowRight className="w-3 h-3 text-emerald-400" />
              </Link>
              <Link
                href={`/compare?p1=${slide.slug}`}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-[10.5px] px-2.5 py-1.5 rounded-xl shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
              >
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>Kıyasla</span>
              </Link>
            </div>
          </div>

          {/* Right Image Stage */}
          <div className="col-span-5 flex items-center justify-center">
            <Link href={targetHref} className="relative w-full h-28 sm:h-36 bg-white/90 rounded-2xl p-2 border border-slate-200/90 shadow-sm flex flex-col items-center justify-center group/img cursor-pointer">
              <Image
                src={slide.image}
                alt={slide.productName}
                width={200}
                height={200}
                priority={true}
                sizes="40vw"
                className="max-h-20 sm:max-h-28 w-auto object-contain filter drop-shadow-md group-hover/img:scale-105 transition-transform duration-300"
              />
              <span className="text-[9.5px] font-extrabold text-slate-800 truncate block w-full text-center mt-1">
                {slide.productName}
              </span>
            </Link>
          </div>
        </div>

        {/* Bottom Ticker & Dots */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/70 text-[10px] text-slate-500 font-bold">
          <span className="flex items-center gap-1 text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>8 Büyük Mağaza Canlı Takipte</span>
          </span>

          <div className="flex items-center gap-1">
            {heroSlides.slice(0, 8).map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentSlideIndex(idx);
                  onSelect(idx);
                }}
                aria-label={`Slayt ${idx + 1}`}
                className={`transition-all rounded-full cursor-pointer ${
                  currentSlideIndex === idx
                    ? 'w-4 h-1 bg-emerald-600'
                    : 'w-1 h-1 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 🖥️ DESKTOP VIEW (lg+): Exact Ultra-Premium Layout from Reference Screenshot */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4 text-left">
          
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-900 border border-emerald-300/90 text-xs font-black px-3.5 py-1 rounded-full shadow-2xs uppercase tracking-wider">
              <span>{slide.badgeText}</span>
            </div>
            <div className="bg-white/90 text-slate-700 border border-slate-200/90 text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Resmi Mağaza Garantili</span>
            </div>
          </div>

          {/* Main Title & Subhead */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-slate-950 tracking-tight leading-[1.18]">
              {slide.mainHeadline}
            </h1>
            <p className="text-sm sm:text-base font-semibold text-slate-600 line-clamp-2 leading-relaxed">
              {slide.subHeadline}
            </p>
          </div>

          {/* Price Badge */}
          <div className="inline-flex items-baseline gap-2 bg-white/95 border border-slate-200/90 px-4 py-2 rounded-2xl backdrop-blur-md shadow-2xs">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">EN İYİ FİYAT:</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight tabular-nums">
              {slide.price}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={targetHref}
              className="bg-slate-950 hover:bg-black text-white font-black text-xs px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Ürünü İncele</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </Link>
            <Link
              href="/compare"
              className="bg-white/95 hover:bg-slate-50 text-slate-800 font-extrabold text-xs px-5 py-3.5 rounded-xl border border-slate-200 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer shadow-2xs hover:shadow-sm"
            >
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Kıyaslamaya Başla</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Elevated White Card with Phone Inside (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          <Link href={targetHref} className="group/card w-full block cursor-pointer">
            <div className="w-full bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-md group-hover/card:shadow-xl group-hover/card:border-emerald-500/40 transition-all duration-300 text-center flex flex-col items-center">
              <div className="w-full h-44 sm:h-52 flex items-center justify-center relative overflow-hidden">
                <Image
                  src={slide.image}
                  alt={slide.productName}
                  width={400}
                  height={400}
                  priority={true}
                  sizes="(max-width: 1024px) 50vw, 400px"
                  className="max-h-full max-w-full object-contain filter drop-shadow-md group-hover/card:scale-105 transition-transform duration-500 ease-out"
                />
              </div>
              <div className="mt-3 text-center w-full px-2">
                <h2 className="text-sm sm:text-base font-black text-slate-900 group-hover/card:text-emerald-700 transition-colors line-clamp-1">
                  {slide.productName}
                </h2>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-500 line-clamp-1 mt-0.5">
                  {slide.productSpec}
                </p>
              </div>
            </div>
          </Link>
        </div>

      </div>

      {/* Bottom Ticker & Dots */}
      <div className="hidden lg:flex mt-6 pt-4 border-t border-slate-200/80 items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-extrabold text-slate-700">8 Büyük Mağaza Canlı Takipte</span>
        </div>

        {/* Slide Dots */}
        <div className="flex items-center gap-1.5">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentSlideIndex(idx);
                onSelect(idx);
              }}
              aria-label={`Slayt ${idx + 1}`}
              className={`transition-all rounded-full cursor-pointer ${
                currentSlideIndex === idx
                  ? 'w-6 h-1.5 bg-emerald-600'
                  : 'w-2 h-1.5 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
