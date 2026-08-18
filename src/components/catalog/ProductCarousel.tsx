'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Smartphone, TVProduct } from '@/lib/types';
import { CompactProductCard } from './CompactProductCard';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: (Smartphone | TVProduct)[];
}

export function ProductCarousel({ title, subtitle, products }: ProductCarouselProps) {
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
  }, [products]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <section className="space-y-4">
      {/* Header with Title and Scroll Arrows */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <div>
          <h3 className="text-slate-900 text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
            <Flame className="w-5 h-5 text-emerald-600" />
            <span>{title}</span>
          </h3>
          {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={scrollLeft}
            className="p-1.5 rounded-xl bg-white hover:bg-emerald-600 hover:text-white text-slate-700 transition-colors border border-slate-200 shadow-2xs cursor-pointer"
            title="Sola Kaydır"
          >
            <ChevronLeft className="w-4 h-4 stroke-[3]" />
          </button>
          <button
            onClick={scrollRight}
            className="p-1.5 rounded-xl bg-white hover:bg-emerald-600 hover:text-white text-slate-700 transition-colors border border-slate-200 shadow-2xs cursor-pointer"
            title="Sağa Kaydır"
          >
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Track with Soft Right Edge Fade Overlay */}
      <div className="relative w-full overflow-hidden group/carousel">
        {/* Left Fade */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-slate-100 via-slate-100/70 to-transparent pointer-events-none z-10 transition-opacity duration-300 ${
            showLeftFade ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Right Edge Fade Overlay (Apple/Netflix style) */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-100 via-slate-100/80 to-transparent pointer-events-none z-10 transition-opacity duration-300 ${
            showRightFade ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex items-stretch gap-4 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5"
        >
          {products.map((product, idx) => (
            <div key={product.id} className="w-48 sm:w-56 shrink-0">
              <CompactProductCard product={product} index={idx} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
