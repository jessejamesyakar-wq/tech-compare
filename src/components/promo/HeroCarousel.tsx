'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronLeft, ChevronRight, Zap, Award, ArrowRight, ShieldCheck } from 'lucide-react';
import { getStoredProducts } from '@/lib/adminData';

export interface HeroSlideItem {
  id: string;
  category: string;
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

export function getDynamicHeroSlides(): HeroSlideItem[] {
  const all = getStoredProducts();

  // Filter top products across smartphones, tvs, laptops, tablets, headphones, monitors, etc.
  const featured = all
    .filter((p) => p.basePrice > 0 && p.image && !p.image.includes('placeholder'))
    .sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount))
    .slice(0, 15);

  if (featured.length === 0) {
    return [
      {
        id: 'default-1',
        category: 'phones',
        slug: 'phones',
        badgeText: '✨ Zirve Performans',
        scriptHighlight: 'gün boyu',
        mainHeadline: 'En Çok Karşılaştırılan Modeller',
        subHeadline: 'Fiyat ve donanım analizleri tek ekranda',
        productName: 'Akıllı Telefonlar',
        productSpec: 'Yapay Zeka & Çoklu Mağaza Karşılaştırma',
        price: '0 ₺',
        image: '/images/phones/apple/iphone-16-pro-natural.jpg'
      }
    ];
  }

  return featured.map((p, idx) => {
    const highlights = p.highlights || [];

    const badges = [
      '⚡ 2026 Zirve Amiral Gemisi',
      '🔥 En Çok Karşılaştırılan',
      '📸 Profesyonel Kamera & Donanım',
      '✨ Yapay Zekâ Destekli',
      '🏆 Fiyat/Performans Şampiyonu',
      '⭐ Yılın Öne Çıkan Modeli'
    ];

    return {
      id: p.id,
      category: p.category || 'phones',
      slug: p.slug,
      badgeText: badges[idx % badges.length],
      scriptHighlight: idx % 2 === 0 ? 'kesintisiz' : 'kusursuz',
      mainHeadline: highlights[0] || `${p.brand} ${p.name} İle Zirve Güç`,
      subHeadline: highlights[1] || `${p.releaseYear} modeli orijinal garantili ürün`,
      productName: p.name,
      productSpec: highlights[2] || `${p.brand} Ekosistem Teknolojisi`,
      price: `${p.basePrice.toLocaleString()} ₺`,
      image: p.image
    };
  });
}

// Fallback exported constant for backward compatibility
export const HERO_CAROUSEL_DATA = getDynamicHeroSlides();

interface HeroCarouselProps {
  activeIndex: number;
  onSelect: (index: number) => void;
  slides?: HeroSlideItem[];
}

export function HeroCarousel({ activeIndex, onSelect, slides }: HeroCarouselProps) {
  const heroSlides = useMemo(() => {
    return slides && slides.length > 0 ? slides : getDynamicHeroSlides();
  }, [slides]);

  const [currentSlideIndex, setCurrentSlideIndex] = useState(activeIndex);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setCurrentSlideIndex(activeIndex);
  }, [activeIndex]);

  const slide = heroSlides[currentSlideIndex] || heroSlides[0];

  useEffect(() => {
    if (isHovered || heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      const nextIndex = (currentSlideIndex + 1) % heroSlides.length;
      setCurrentSlideIndex(nextIndex);
      onSelect(nextIndex);
    }, 6000);

    return () => clearInterval(interval);
  }, [currentSlideIndex, isHovered, heroSlides.length, onSelect]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prevIndex = (currentSlideIndex - 1 + heroSlides.length) % heroSlides.length;
    setCurrentSlideIndex(prevIndex);
    onSelect(prevIndex);
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
      className="group/carousel relative bg-gradient-to-br from-emerald-50/80 via-white to-slate-50/80 border border-emerald-500/20 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm overflow-hidden"
    >
      <div className="absolute -right-24 -top-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <button
        onClick={handlePrev}
        aria-label="Önceki Slayt"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 hover:bg-emerald-600 hover:text-white text-slate-800 shadow-lg border border-slate-200 backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100 cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
      </button>

      <button
        onClick={handleNext}
        aria-label="Sonraki Slayt"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 hover:bg-emerald-600 hover:text-white text-slate-800 shadow-lg border border-slate-200 backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100 cursor-pointer"
      >
        <ChevronRight className="w-5 h-5 stroke-[2.5]" />
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
        >
          <div className="lg:col-span-7 space-y-4 text-left z-10">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300/80 text-xs font-black px-3.5 py-1 rounded-full shadow-2xs uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>{slide.badgeText}</span>
              </div>
              <div className="bg-white/90 text-slate-700 border border-slate-200/90 text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs backdrop-blur-md">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Resmi Mağaza Garantili</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {slide.mainHeadline}
              </h1>
              <p className="text-sm sm:text-base font-semibold text-slate-600 line-clamp-2">
                {slide.subHeadline}
              </p>
            </div>

            <div className="inline-flex items-baseline gap-2 bg-white/80 border border-slate-200/80 px-4 py-2 rounded-2xl backdrop-blur-sm shadow-2xs">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">En İyi Fiyat:</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight tabular-nums">
                {slide.price}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href={targetHref}
                className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xs px-6 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Ürünü İncele</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </Link>
              <Link
                href="/compare"
                className="bg-white/90 hover:bg-slate-100 text-slate-800 font-extrabold text-xs px-5 py-3 rounded-xl border border-slate-300 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Kıyaslamaya Başla</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <Link href={targetHref} className="group relative w-full flex flex-col items-center">
              <div className="w-full h-48 sm:h-56 bg-white/90 rounded-2xl p-4 flex items-center justify-center relative overflow-hidden border border-slate-200/90 shadow-lg group-hover:border-emerald-500/60 transition-colors">
                <img
                  src={slide.image}
                  alt={slide.productName}
                  className="max-h-40 sm:max-h-48 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="mt-2.5 text-center">
                <h2 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                  {slide.productName}
                </h2>
                <p className="text-[11px] font-semibold text-slate-500 line-clamp-1">
                  {slide.productSpec}
                </p>
              </div>
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-extrabold text-slate-700">8 Büyük Mağaza Canlı Takipte</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentSlideIndex(idx);
                onSelect(idx);
              }}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentSlideIndex
                  ? 'w-6 bg-emerald-600'
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Slayt ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
