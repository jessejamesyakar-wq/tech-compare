'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface ThumbnailItem {
  id: string;
  name: string;
  image: string;
  price: string;
}

interface HeroThumbnailStripProps {
  items: ThumbnailItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function HeroThumbnailStrip({ items, activeIndex, onSelect }: HeroThumbnailStripProps) {
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

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full bg-slate-100/90 border border-slate-200/80 rounded-2xl p-2.5 sm:p-3 shadow-2xs my-3 group/strip overflow-hidden">
      
      {/* Left Edge Fade Overlay (Appears when scrolled right) */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-16 sm:w-20 rounded-l-2xl bg-gradient-to-r from-slate-100 via-slate-100/80 to-transparent pointer-events-none z-10 transition-opacity duration-300 ${
          showLeftFade ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Right Edge Fade Overlay (Netflix/Apple style soft scroll fade overlay) */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-16 sm:w-24 rounded-r-2xl bg-gradient-to-l from-slate-100 via-slate-100/85 to-transparent pointer-events-none z-10 transition-opacity duration-300 ${
          showRightFade ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Scroll Left Arrow Button */}
      <button
        onClick={scrollLeft}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white hover:bg-emerald-600 hover:text-white text-slate-800 shadow-md border border-slate-200 flex items-center justify-center transition-all opacity-0 group-hover/strip:opacity-100 cursor-pointer"
        title="Sola Kaydır"
      >
        <ChevronLeft className="w-4 h-4 stroke-[3]" />
      </button>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth px-1"
      >
        {items.map((item, idx) => {
          const isActive = activeIndex === idx;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(idx)}
              className={`group relative flex flex-col items-center justify-between w-24 sm:w-28 h-24 sm:h-28 rounded-xl p-2 transition-all duration-200 shrink-0 cursor-pointer text-left ${
                isActive
                  ? 'bg-white border-2 border-emerald-500 shadow-md scale-105 z-10'
                  : 'bg-white/90 hover:bg-white border border-slate-200/90 hover:border-slate-300 shadow-2xs opacity-85 hover:opacity-100'
              }`}
              title={`${item.name} - ${item.price}`}
            >
              {/* Product Image Stage */}
              <div className="w-full h-12 sm:h-14 flex items-center justify-center overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                />
              </div>

              {/* Single Line Truncated Product Title & Price */}
              <div className="w-full text-center space-y-0.5 mt-1">
                <span className="text-[10px] font-bold text-slate-800 truncate block leading-tight px-0.5">
                  {item.name}
                </span>
                <span className={`text-[10px] font-black tracking-tight block tabular-nums ${
                  isActive ? 'text-emerald-700 font-black' : 'text-slate-900'
                }`}>
                  {item.price}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Scroll Right Arrow Button */}
      <button
        onClick={scrollRight}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white hover:bg-emerald-600 hover:text-white text-slate-800 shadow-md border border-slate-200 flex items-center justify-center transition-all opacity-0 group-hover/strip:opacity-100 cursor-pointer"
        title="Sağa Kaydır"
      >
        <ChevronRight className="w-4 h-4 stroke-[3]" />
      </button>

    </div>
  );
}
