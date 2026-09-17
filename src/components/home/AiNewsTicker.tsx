'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ChevronRight, Zap, ExternalLink } from 'lucide-react';
import { GLOBAL_AI_NEWS } from '@/lib/ai/aiNewsData';

export function AiNewsTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % GLOBAL_AI_NEWS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const currentNews = GLOBAL_AI_NEWS[currentIndex] || GLOBAL_AI_NEWS[0];

  return (
    <section className="relative w-full overflow-hidden rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-white dark:from-slate-900 dark:via-blue-950/40 dark:to-slate-900 p-2.5 sm:p-3 shadow-xs transition-all">
      <div 
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Left Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <Sparkles className="w-3 h-3 text-cyan-200" />
            <span>AI Gündemi</span>
          </div>
          <span className="hidden md:inline-block text-[11px] font-bold text-slate-400 dark:text-slate-500">
            Küresel Analiz
          </span>
        </div>

        {/* Center: Live Headline Rotator */}
        <div className="flex-1 min-w-0 flex items-center gap-2 overflow-hidden py-0.5">
          <div 
            key={currentNews.id}
            className="flex items-center gap-2 text-xs sm:text-[13px] font-medium text-slate-700 dark:text-slate-200 truncate transition-all duration-300 animate-in fade-in slide-in-from-right-4"
          >
            <span className="hidden sm:inline-block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-md shrink-0">
              {currentNews.source}
            </span>

            <Link 
              href={`/ai-haberleri`}
              className="font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate underline-offset-2 hover:underline cursor-pointer"
            >
              {currentNews.title}
            </Link>

            {currentNews.deviceImpact && (
              <span className="hidden lg:inline-flex items-center gap-1 bg-amber-100/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/80 text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
                <Zap className="w-2.5 h-2.5 text-amber-600 fill-amber-500" />
                <span>{currentNews.deviceImpact.badge}</span>
              </span>
            )}
          </div>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold mr-1 hidden sm:flex">
            {currentIndex + 1} / {GLOBAL_AI_NEWS.length}
          </div>
          <Link
            href="/ai-haberleri"
            className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-black text-blue-700 dark:text-blue-400 hover:text-blue-800 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded-full border border-blue-200 dark:border-slate-700 shadow-2xs transition-all hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <span>Tüm AI Haberleri</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default AiNewsTicker;
