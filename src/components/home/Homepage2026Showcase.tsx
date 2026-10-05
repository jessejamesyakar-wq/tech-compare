'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import styles from './Showcase2026.module.css';
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
  const [category, setCategory] = useState('all');
  const railRef = useRef<HTMLDivElement>(null);
  const [railPosition, setRailPosition] = useState({ start: true, end: false });
  const isFocusedRef = useRef(false);
  const [rotatingSlots, setRotatingSlots] = useState<number[]>([]);
  const [isUserPaused, setIsUserPaused] = useState(false);

  // References to maintain current state without unnecessary effect churn
  const displayedRef = useRef<Showcase2026Product[]>(displayed);
  useEffect(() => { displayedRef.current = displayed; }, [displayed]);

  const poolRef = useRef<Showcase2026Product[]>(rotationPool);
  useEffect(() => { poolRef.current = rotationPool; }, [rotationPool]);

  const isUserPausedRef = useRef(isUserPaused);
  useEffect(() => { isUserPausedRef.current = isUserPaused; }, [isUserPaused]);

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
  const scheduleNextCycle = useCallback(function scheduleCycle() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Do not schedule if user paused, hovered, interacting, hidden, or prefers reduced motion
    if (isUserPausedRef.current) return;
    if (isHoveredRef.current || isInteractingRef.current || isFocusedRef.current) return;
    if (typeof document !== 'undefined' && document.hidden) return;
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) return;
    }

    timerRef.current = setTimeout(() => {
      // Safety checks before triggering rotation
      if (isUserPausedRef.current || isHoveredRef.current || isInteractingRef.current || isFocusedRef.current) {
        scheduleCycle();
        return;
      }
      if (typeof document !== 'undefined' && document.hidden) {
        scheduleCycle();
        return;
      }
      if (typeof window !== 'undefined') {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (mediaQuery.matches) {
          scheduleCycle();
          return;
        }
      }

      const currentVisible = displayedRef.current;
      const pool = poolRef.current;

      if (!currentVisible || currentVisible.length < 14 || pool.length === 0) {
        scheduleCycle();
        return;
      }

      const result = selectControlledRotation(
        currentVisible,
        pool,
        lastReplacedSlotsRef.current,
        historySetsRef.current
      );

      if (!result || result.replacedSlots.length === 0) {
        scheduleCycle();
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
        scheduleCycle();
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

  const categories = [
    { id: 'all', label: 'Tümü' },
    { id: 'smartphones', label: 'Telefon' },
    { id: 'laptops', label: 'Bilgisayar' },
    { id: 'tvs', label: 'TV' },
    { id: 'other', label: 'Diğer' },
  ];
  const visibleProducts = displayed.map((product, slot) => ({ product, slot })).filter(({ product }) =>
    category === 'all' || (category === 'other'
      ? !['smartphones', 'laptops', 'tvs'].includes(product.category)
      : product.category === category)
  );
  const updateRail = useCallback(() => {
    const rail = railRef.current;
    if (rail) setRailPosition({ start: rail.scrollLeft < 2, end: rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 2 });
  }, []);
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollTo({ left: 0, behavior: 'instant' });
    updateRail();
    const observer = new ResizeObserver(updateRail);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [category, displayed, updateRail]);
  const moveRail = (direction: number) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * rail.clientWidth, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };

  if (!displayed.length) return null;
  return (
    <section aria-label="2026 Teknoloji Vitrini" className={styles.showcase}
      onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
      onFocusCapture={() => { isFocusedRef.current = true; clearAllTimers(); setRotatingSlots([]); }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          isFocusedRef.current = false;
          scheduleNextCycle();
        }
      }}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>YENİ NESİL SEÇKİ</p>
        <h2>2026 Teknoloji Vitrini</h2>
        <p className={styles.subtitle}>Yeni nesli keşfet. Kararını aceleye getirme.</p>
      </header>
      <div className={styles.toolbar}>
        <div className={styles.filters} role="group" aria-label="Vitrin kategorileri">
          {categories.map((item) => <button key={item.id} type="button" aria-pressed={category === item.id}
            onClick={() => setCategory(item.id)}>{item.label}</button>)}
        </div>
        <div className={styles.controls}>
          <button type="button" onClick={togglePause} aria-label={isUserPaused ? 'Döngüyü Başlat' : 'Döngüyü Duraklat'}
            aria-pressed={isUserPaused} title={isUserPaused ? 'Döngüyü Başlat' : 'Döngüyü Duraklat'}>
            {isUserPaused ? <Play size={17} /> : <Pause size={17} />}
          </button>
          <button type="button" onClick={() => moveRail(-1)} disabled={railPosition.start} aria-label="Önceki ürünler"><ArrowLeft size={18} /></button>
          <button type="button" onClick={() => moveRail(1)} disabled={railPosition.end} aria-label="Sonraki ürünler"><ArrowRight size={18} /></button>
        </div>
      </div>
      <div ref={railRef} className={styles.rail} onScroll={updateRail}
        onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchEnd}
        role="group" aria-label="2026 ürün seçkisi" tabIndex={0}>
        {visibleProducts.map(({ product, slot }) => <div key={product.id} className={styles.slot}>
          <Showcase2026Card product={product} isRotating={rotatingSlots.includes(slot)} />
        </div>)}
        {!visibleProducts.length && <p className={styles.empty}>Bu seçkide henüz bu kategoriden model yok.</p>}
      </div>
      <div className={styles.footer}>
        <span>Seçkiyi kaydırarak keşfet <span aria-live="polite">· {visibleProducts.length} model</span></span>
        <p>Kayıtlı özellikleri kaynaklarıyla inceleyin. Güncel teklif doğrulanmamışsa fiyat önerisi verilmez.</p>
      </div>
    </section>
  );
}

export default Homepage2026Showcase;
