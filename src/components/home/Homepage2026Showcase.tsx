'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Cpu, Pause, Play } from 'lucide-react';
import { Showcase2026Product } from '@/lib/showcase2026';
import { Showcase2026Card } from './Showcase2026Card';

interface Homepage2026ShowcaseProps {
  initialProducts: Showcase2026Product[];
  rotationPool: Showcase2026Product[];
}

export function Homepage2026Showcase({
  initialProducts = [],
  rotationPool = []
}: Homepage2026ShowcaseProps) {
  const [displayed, setDisplayed] = useState<Showcase2026Product[]>(() => initialProducts.slice(0, 14));
  const poolRef = useRef<Showcase2026Product[]>([...rotationPool]);
  const [rotatingSlot, setRotatingSlot] = useState<number | null>(null);
  const [isUserPaused, setIsUserPaused] = useState(false);
  const isHoveredRef = useRef(false);
  const isInteractingRef = useRef(false);
  const nextSlotRef = useRef(0);

  // Sync if initialProducts changes
  useEffect(() => {
    if (initialProducts.length > 0) {
      setDisplayed(initialProducts.slice(0, 14));
    }
  }, [initialProducts]);

  useEffect(() => {
    poolRef.current = [...rotationPool];
  }, [rotationPool]);

  // Single-card rotation step
  const rotateNextSlot = useCallback(() => {
    if (poolRef.current.length === 0 || displayed.length === 0) return;

    const slotIndex = nextSlotRef.current % displayed.length;
    nextSlotRef.current = (slotIndex + 1) % displayed.length;

    // Trigger fade-out on this slot
    setRotatingSlot(slotIndex);

    // After fade-out (300ms), swap product and fade back in
    setTimeout(() => {
      setDisplayed((prev) => {
        if (!prev[slotIndex]) return prev;
        const nextPool = [...poolRef.current];
        const nextItem = nextPool.shift();
        if (!nextItem) return prev;

        // Old item goes to the end of the pool for infinite circular rotation
        const oldItem = prev[slotIndex];
        nextPool.push(oldItem);
        poolRef.current = nextPool;

        const updated = [...prev];
        updated[slotIndex] = nextItem;
        return updated;
      });

      // Clear rotating slot to trigger fade-in
      setTimeout(() => {
        setRotatingSlot(null);
      }, 50);
    }, 300);
  }, [displayed.length]);

  // Timer effect with hover, focus, blur, touch, and prefers-reduced-motion checks
  useEffect(() => {
    if (isUserPaused) return;

    // Check prefers-reduced-motion
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) return;
    }

    const interval = setInterval(() => {
      // Pause if hovered or touched
      if (isHoveredRef.current || isInteractingRef.current) return;

      // Pause if tab is hidden
      if (typeof document !== 'undefined' && document.hidden) return;

      rotateNextSlot();
    }, 2800);

    return () => clearInterval(interval);
  }, [isUserPaused, rotateNextSlot]);

  if (!displayed || displayed.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="2026 Teknoloji Vitrini"
      className="max-w-7xl mx-auto my-12 sm:my-16 px-4 sm:px-6 lg:px-8"
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
      }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-100/80 text-cyan-800 text-[11px] font-black border border-cyan-200">
              <Sparkles className="w-3 h-3 text-cyan-600" />
              <span>2026 VİTRİNİ</span>
            </span>
            <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
              Yeni Nesil Donanımlar
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            2026 Teknoloji Vitrini
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Yeni nesil amiral gemisi modelleri keşfedin. Acele etmeden teknik detayları inceleyin ve yan yana karşılaştırın.
          </p>
        </div>

        {/* Controls / Info */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setIsUserPaused((p) => !p)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors min-h-[36px]"
            title={isUserPaused ? 'Döngüyü Başlat' : 'Döngüyü Duraklat'}
            aria-label={isUserPaused ? 'Döngüyü Başlat' : 'Döngüyü Duraklat'}
          >
            {isUserPaused ? (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px]">Döngü Başlat</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px]">Duraklat</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Desktop / Tablet: Responsive Grid (xl: exactly 7 cols x 2 rows = 14 cards) */}
      <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3.5 sm:gap-4">
        {displayed.map((product, idx) => (
          <Showcase2026Card
            key={`${product.id}-${idx}`}
            product={product}
            isRotating={rotatingSlot === idx}
          />
        ))}
      </div>

      {/* Mobile: Horizontal Swipe Carousel showing ~1.6 - 2.0 cards in viewport */}
      <div
        className="sm:hidden flex overflow-x-auto snap-x snap-mandatory gap-3 px-4 -mx-4 pb-4 no-scrollbar"
        onTouchStart={() => {
          isInteractingRef.current = true;
        }}
        onTouchEnd={() => {
          isInteractingRef.current = false;
        }}
      >
        {displayed.map((product, idx) => (
          <div
            key={`mobile-${product.id}-${idx}`}
            className="w-[62vw] max-w-[260px] min-w-[210px] shrink-0 snap-start"
          >
            <Showcase2026Card
              product={product}
              isRotating={rotatingSlot === idx}
            />
          </div>
        ))}
      </div>

      {/* Footnote: Data Integrity Notice */}
      <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 px-1">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
          <span>Teknik veriler doğrulanmış katalog modelleridir. Canlı teklifler mağaza API&apos;leri ile güncellenir.</span>
        </div>
        <span className="hidden sm:inline font-semibold text-slate-400">
          Toplam 14 Seçkin Model
        </span>
      </div>
    </section>
  );
}

export default Homepage2026Showcase;
