'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Scale } from 'lucide-react';

export function LiveDealsBillboard() {
  return (
    <section className="w-full py-2 sm:py-4 flex items-center justify-center select-none">
      <div className="w-full max-w-7xl relative overflow-hidden rounded-3xl sm:rounded-4xl border border-slate-200/90 shadow-xl hover:shadow-2xl transition-all duration-300 bg-[#F5F5F7] group">
        
        {/* SPONSORLU REKLAM Badge (Top Right) */}
        <div className="absolute top-3 right-3 sm:top-5 sm:right-6 z-30 flex items-center gap-2 bg-slate-950/85 backdrop-blur-md text-white text-[10px] sm:text-xs font-black px-3.5 sm:px-4 py-1.5 rounded-full border border-white/20 shadow-lg tracking-wider uppercase select-none pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>SPONSORLU REKLAM</span>
        </div>

        {/* Unified Artwork Container (Single Canvas, Not Split) */}
        <div className="relative w-full aspect-[16/7] sm:aspect-[21/7] md:aspect-[32/9] max-h-[360px] min-h-[150px] overflow-hidden flex items-center justify-center bg-[#F5F5F7]">
          
          {/* Main Clean Banner Image (Without 'Ön Sipariş') */}
          <img
            src="/images/banners/apple-iphone-18-pro-banner.png"
            alt="Sponsorlu Reklam - Apple iPhone 18 Pro"
            className="w-full h-full object-contain object-center transition-transform duration-700 group-hover:scale-[1.01]"
          />

          {/* Full Banner Click Target */}
          <Link
            href="/phones/apple-iphone-18-pro-max-256-gb"
            className="absolute inset-0 z-10 cursor-pointer"
            aria-label="Apple iPhone 18 Pro İncele"
          />

          {/* Interactive Action Buttons (Positioned under the bold 'PRO' lettering) */}
          <div className="absolute left-[4.5%] sm:left-[6%] bottom-[7%] sm:bottom-[11%] z-20 flex items-center gap-2 sm:gap-3">
            <Link
              href="/phones/apple-iphone-18-pro-max-256-gb"
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-slate-950 hover:bg-slate-900 text-white font-black text-[11px] sm:text-sm px-3.5 sm:px-6 py-2 sm:py-3.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Fiyatları İncele"
            >
              <span>Fiyatları İncele</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
            </Link>

            <Link
              href="/compare?p1=apple-apple-iphone-18-pro-max-256-gb-1071187"
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/95 hover:bg-white text-slate-900 font-extrabold text-[11px] sm:text-sm px-3.5 sm:px-5 py-2 sm:py-3.5 rounded-full border border-slate-300 shadow-md hover:border-emerald-500 hover:text-emerald-700 hover:scale-105 active:scale-95 transition-all cursor-pointer backdrop-blur-xs"
              title="Kıyasla"
            >
              <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
              <span>Kıyasla</span>
            </Link>
          </div>

          {/* Ambient Edge Ring */}
          <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-3xl sm:rounded-4xl pointer-events-none" />
        </div>

      </div>
    </section>
  );
}

export default LiveDealsBillboard;


