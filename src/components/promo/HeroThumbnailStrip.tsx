'use client';

import Image from 'next/image';
import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface ThumbnailItem {
  id: string;
  name: string;
  image: string;
  price: string;
  priceLabel: string;
}

interface HeroThumbnailStripProps {
  items: ThumbnailItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
  className?: string;
}

export function HeroThumbnailStrip({ items, activeIndex, onSelect, className = '' }: HeroThumbnailStripProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftFade(scrollLeft > 10);
    setShowRightFade(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      checkScroll();
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
    };
  }, []);

  // Auto-scroll active thumbnail inside local container ONLY (never scrolls the window / page)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const activeEl = container.children[activeIndex] as HTMLElement | undefined;
    if (activeEl) {
      const containerWidth = container.clientWidth;
      const elOffsetLeft = activeEl.offsetLeft;
      const elWidth = activeEl.offsetWidth;
      const targetScrollLeft = elOffsetLeft - (containerWidth / 2) + (elWidth / 2);

      container.scrollTo({
        left: Math.max(0, targetScrollLeft),
        behavior: 'smooth',
      });
    }
  }, [activeIndex]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className={`relative w-full bg-white/80 backdrop-blur-md border border-emerald-500/15 rounded-xl sm:rounded-2xl p-1 sm:p-1.5 shadow-2xs hover:shadow-xs transition-all duration-300 group/strip overflow-hidden ${className}`}>
      
      {/* Left Edge Fade Overlay */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-8 sm:w-14 rounded-l-xl sm:rounded-l-2xl bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-10 transition-opacity duration-300 ${
          showLeftFade ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Right Edge Fade Overlay */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-8 sm:w-14 rounded-r-xl sm:rounded-r-2xl bg-gradient-to-l from-white via-white/85 to-transparent pointer-events-none z-10 transition-opacity duration-300 ${
          showRightFade ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Scroll Left Arrow Button */}
      <button
        onClick={scrollLeft}
        className="absolute left-1 sm:left-1.5 top-1/2 -translate-y-1/2 z-20 w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-white hover:bg-emerald-600 hover:text-white text-slate-800 shadow-md border border-slate-200 hidden sm:flex items-center justify-center transition-all opacity-0 group-hover/strip:opacity-100 cursor-pointer"
        title="Sola Kaydır"
      >
        <ChevronLeft className="w-3.5 h-3.5 stroke-[3]" />
      </button>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth px-1"
      >
        {items.map((item, idx) => {
          const isActive = activeIndex === idx;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(idx)}
              className={`group relative flex flex-col items-center justify-between w-20 sm:w-24 h-16 sm:h-[68px] rounded-lg sm:rounded-xl p-1 sm:p-1.5 transition-all duration-200 shrink-0 cursor-pointer text-left ${
                isActive
                  ? 'bg-emerald-50 border-2 border-emerald-500 shadow-xs ring-1 ring-emerald-500/30'
                  : 'bg-white/90 hover:bg-white border border-slate-200/80 hover:border-emerald-400 shadow-2xs opacity-85 hover:opacity-100'
              }`}
              title={`${item.name} - ${item.priceLabel}: ${item.price}`}
            >
              {/* Product Image Stage */}
              <div className="w-full h-8 sm:h-9 flex items-center justify-center overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={48}
                  height={48}
                  loading="lazy"
                  className="w-auto h-auto max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                />
              </div>

              {/* Single Line Truncated Product Title & Price */}
              <div className="w-full text-center space-y-0 mt-0.5">
                <span className="text-[8.5px] sm:text-[9.5px] font-bold text-slate-800 truncate block leading-tight px-0.5">
                  {item.name}
                </span>
                <span className={`text-[8.5px] sm:text-[9.5px] font-black tracking-tight block tabular-nums ${
                  isActive ? 'text-emerald-700' : 'text-slate-900'
                }`}>
                  {item.priceLabel === 'Güncel Fiyat' ? item.price : item.priceLabel === 'Son Görülen Fiyat' ? 'Son: ' + item.price : 'Ref: ' + item.price}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Scroll Right Arrow Button */}
      <button
        onClick={scrollRight}
        className="absolute right-1 sm:right-1.5 top-1/2 -translate-y-1/2 z-20 w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-white hover:bg-emerald-600 hover:text-white text-slate-800 shadow-md border border-slate-200 flex items-center justify-center transition-all opacity-0 group-hover/strip:opacity-100 cursor-pointer"
        title="Sağa Kaydır"
      >
        <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
      </button>

    </div>
  );
}
