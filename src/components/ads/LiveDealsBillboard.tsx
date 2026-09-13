'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Scale } from 'lucide-react';

export function LiveDealsBillboard() {
  return (
    <section className="w-full py-3 sm:py-5 flex items-center justify-center select-none">
      <div className="w-full max-w-7xl relative overflow-hidden rounded-3xl sm:rounded-4xl border border-slate-200/90 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white group">
        
        {/* Unified Artwork Container */}
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] lg:aspect-[24/9] max-h-[480px] overflow-hidden">
          <img
            src="/images/banners/resmi-platform-rehberi-full.webp"
            alt="aceleEtme Resmi Platform Rehberi - Apple iPhone 18 Pro"
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.01]"
          />

          {/* Interactive Clickable Hotspots overlay matching the visual buttons */}
          <div className="absolute left-[4%] sm:left-[5%] bottom-[8%] sm:bottom-[10%] z-20 flex items-center gap-3">
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 bg-slate-900/90 hover:bg-slate-900 text-white font-black text-xs sm:text-sm px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer backdrop-blur-xs"
              title="Hemen Başla"
            >
              <span>Hemen Başla</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </Link>

            <Link
              href="/compare"
              className="inline-flex items-center gap-2 bg-white/90 hover:bg-white text-slate-900 font-extrabold text-xs sm:text-sm px-5 sm:px-6 py-2.5 sm:py-3.5 rounded-full border border-slate-300/80 shadow-md hover:border-emerald-500 hover:text-emerald-700 hover:scale-105 active:scale-95 transition-all cursor-pointer backdrop-blur-xs"
              title="Kıyasla"
            >
              <Scale className="w-4 h-4 text-emerald-600" />
              <span>Kıyasla</span>
            </Link>
          </div>

          {/* Subtle Ambient Vignette / Edge Ring */}
          <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-3xl sm:rounded-4xl pointer-events-none" />
        </div>

      </div>
    </section>
  );
}

export default LiveDealsBillboard;

