'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Cpu, Pause, Play } from 'lucide-react';
import {
  Showcase2026Product,
  selectControlledRotation,
  ROTATION_INTERVAL_MS,
  ROTATION_TRANSITION_MS,
} from '@/lib/showcase2026';
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
  const [rotatingSlots, setRotatingSlots] = useState<number[]>([]);
  const [isUserPaused, setIsUserPaused] = useState(false);

  // References to maintain current state without unnecessary effect churn
  const displayedRef = useRef<Showcase2026Product[]>(displayed);
  displayedRef.current = displayed;

  const poolRef = useRef<Showcase2026Product[]>(rotationPool);
  poolRef.current = rotationPool;

  const isUserPausedRef = useRef(isUserPaused);
  isUserPausedRef.current = isUserPaused;

  const isHoveredRef = useRef(false);
  const isInteractingRef = useRef(false);
  const lastReplacedSlotsRef = useRef<number[]>([]);
  const historySetsRef = useRef<Set<string>[]>([
    new Set(initialProducts.slice(0, 14).map((p) => p.id))
  ]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear all pending timeouts
  const clearAllTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
  }, []);

  // Schedule the next cycle with clean 4-minute (240,000ms) delay
  const scheduleNextCycle = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Do not schedule if user paused, hovered, interacting, hidden, or prefers reduced motion
    if (isUserPausedRef.current) return;
    if (isHoveredRef.current || isInteractingRef.current) return;
    if (typeof document !== 'undefined' && document.hidden) return;
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) return;
    }

    timerRef.current = setTimeout(() => {
      // Safety checks before triggering rotation
      if (isUserPausedRef.current || isHoveredRef.current || isInteractingRef.current) {
        scheduleNextCycle();
        return;
      }
      if (typeof document !== 'undefined' && document.hidden) {
        scheduleNextCycle();
        return;
      }
      if (typeof window !== 'undefined') {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (mediaQuery.matches) {
          scheduleNextCycle();
          return;
        }
      }

      const currentVisible = displayedRef.current;
      const pool = poolRef.current;

      if (!currentVisible || currentVisible.length < 14 || pool.length === 0) {
        scheduleNextCycle();
        return;
      }

      const result = selectControlledRotation(
        currentVisible,
        pool,
        lastReplacedSlotsRef.current,
        historySetsRef.current
      );

      if (!result || result.replacedSlots.length === 0) {
        scheduleNextCycle();
        return;
      }

      // Save newly replaced slots
      lastReplacedSlotsRef.current = result.replacedSlots;

      // Track history (keep last 2 cycles)
      historySetsRef.current = [
        new Set(result.newVisible.map((p) => p.id)),
        ...historySetsRef.current.slice(0, 1)
      ];

      // 1. Trigger subtle fade-out on only the 5 replaced slots
      setRotatingSlots(result.replacedSlots);

      // 2. After transition duration (350ms), swap data and trigger fade back in
      transitionTimerRef.current = setTimeout(() => {
        setDisplayed(result.newVisible);

        fadeTimerRef.current = setTimeout(() => {
          setRotatingSlots([]);
        }, 50);

        // Cleanly schedule next 4-minute cycle
        scheduleNextCycle();
      }, ROTATION_TRANSITION_MS);
    }, ROTATION_INTERVAL_MS);
  }, []);

  // Handle User Pause / Resume Toggle
  const togglePause = useCallback(() => {
    setIsUserPaused((prev) => {
      const next = !prev;
      isUserPausedRef.current = next;
      if (next) {
        clearAllTimers();
      } else {
        // Clean restart of 4-minute countdown on resume (no instant rotation)
        scheduleNextCycle();
      }
      return next;
    });
  }, [clearAllTimers, scheduleNextCycle]);

  // Hover handlers
  const handleMouseEnter = useCallback(() => {
    isHoveredRef.current = true;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    isHoveredRef.current = false;
    // Clean restart of 4-minute countdown on mouse leave (no instant rotation)
    scheduleNextCycle();
  }, [scheduleNextCycle]);

  // Touch handlers for mobile swipe
  const handleTouchStart = useCallback(() => {
    isInteractingRef.current = true;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    isInteractingRef.current = false;
    // Clean restart of 4-minute countdown on touch end (no instant rotation)
    scheduleNextCycle();
  }, [scheduleNextCycle]);

  // Main lifecycle effect: initialize rotation after hydration, setup visibility & reduced-motion listeners
  useEffect(() => {
    // Sync initial products if changed
    if (initialProducts.length > 0) {
      setDisplayed(initialProducts.slice(0, 14));
      historySetsRef.current = [
        new Set(initialProducts.slice(0, 14).map((p) => p.id))
      ];
    }

    // Start 4-minute countdown after client hydration
    scheduleNextCycle();

    // Visibility change handler (tab switch)
    const handleVisibilityChange = () => {
      if (typeof document === 'undefined') return;
      if (document.hidden) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      } else {
        // Tab visible again: cleanly restart 4-minute countdown (no instant rotation)
        scheduleNextCycle();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Reduced motion media query listener
    let mediaQuery: MediaQueryList | null = null;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        clearAllTimers();
      } else {
        scheduleNextCycle();
      }
    };

    if (typeof window !== 'undefined') {
      mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      mediaQuery.addEventListener?.('change', handleMotionChange);
    }

    return () => {
      clearAllTimers();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (mediaQuery) {
        mediaQuery.removeEventListener?.('change', handleMotionChange);
      }
    };
  }, [initialProducts, scheduleNextCycle, clearAllTimers]);

  if (!displayed || displayed.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="2026 Teknoloji Vitrini"
      className="max-w-7xl mx-auto my-12 sm:my-16 px-4 sm:px-6 lg:px-8"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-800 text-[11px] font-bold border border-cyan-200/80 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-cyan-600" />
              <span>2026 Vitrini</span>
            </span>
            <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
              Yeni Nesil Donanımlar
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            2026 Teknoloji Vitrini
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Yeni nesil amiral gemisi modelleri keşfedin. Acele etmeden teknik detayları inceleyin ve yan yana karşılaştırın.
          </p>
        </div>

        {/* Controls / Info */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            type="button"
            onClick={togglePause}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors min-h-[44px] cursor-pointer"
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
            key={`showcase-slot-${idx}`}
            product={product}
            isRotating={rotatingSlots.includes(idx)}
          />
        ))}
      </div>

      {/* Mobile: Horizontal Swipe Carousel showing ~1.6 - 2.0 cards in viewport */}
      <div
        className="sm:hidden flex overflow-x-auto snap-x snap-mandatory gap-3 px-4 -mx-4 pb-4 no-scrollbar"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {displayed.map((product, idx) => (
          <div
            key={`mobile-slot-${idx}`}
            className="w-[62vw] max-w-[260px] min-w-[210px] shrink-0 snap-start"
          >
            <Showcase2026Card
              product={product}
              isRotating={rotatingSlots.includes(idx)}
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
