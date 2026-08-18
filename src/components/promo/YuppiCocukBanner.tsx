'use client';

import React from 'react';
import { Sparkles, ExternalLink, Play } from 'lucide-react';

function YoutubeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

export function YuppiCocukBanner() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-amber-100 via-rose-100 to-indigo-100 border-2 border-amber-300 rounded-3xl p-6 sm:p-8 shadow-md">
      
      {/* Decorative stars and rainbow accents */}
      <div className="absolute top-2 right-4 text-amber-400 opacity-60 text-2xl animate-bounce">
        ⭐
      </div>
      <div className="absolute bottom-2 left-4 text-purple-400 opacity-60 text-xl">
        🌈
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Logo & Info */}
        <div className="flex items-center gap-4 text-center md:text-left">
          
          {/* Logo Badge */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border-4 border-amber-300 p-2 shadow-lg flex flex-col items-center justify-center text-center overflow-hidden group">
              <div className="text-xl sm:text-2xl font-black tracking-tight flex items-center justify-center">
                <span className="text-red-500">Y</span>
                <span className="text-amber-500">U</span>
                <span className="text-emerald-500">P</span>
                <span className="text-blue-500">P</span>
                <span className="text-purple-500">İ</span>
              </div>
              <span className="text-[10px] sm:text-xs font-extrabold text-purple-600 tracking-wider uppercase -mt-1">
                ÇOCUK
              </span>
              <div className="mt-1 bg-red-600 text-white rounded-full p-1 shadow-xs">
                <YoutubeIcon className="w-3 h-3 text-white fill-white" />
              </div>
            </div>

            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
              <YoutubeIcon className="w-2.5 h-2.5 text-white fill-white" /> YOUTUBE
            </span>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-xs text-slate-800 text-[11px] font-bold px-3 py-1 rounded-full border border-amber-200 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Özel Destekçi & Partner Kanal</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              YUPPİ ÇOCUK <span className="text-red-600 font-extrabold">YouTube Kanalı</span>
            </h3>

            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed max-w-lg">
              Çocuklar için eğlenceli, eğitici, rengarenk ve %100 güvenli YouTube videoları! Eğlence dolu dünyaya hemen katılın.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
              <span className="bg-white/90 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border border-amber-200">
                🎉 Eğlenceli İçerikler
              </span>
              <span className="bg-white/90 text-purple-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border border-purple-200">
                🎨 Eğitici Oyunlar
              </span>
              <span className="bg-white/90 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border border-emerald-200">
                🛡️ %100 Çocuk Dostu
              </span>
            </div>
          </div>

        </div>

        {/* Right: Subscribe Action Button */}
        <div className="shrink-0">
          <a
            href="https://www.youtube.com/@yuppicocuk"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-3 accent-glow-sm cursor-pointer border-2 border-red-500"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-4 h-4 fill-white ml-0.5 text-white" />
            </div>
            <div className="text-left">
              <span className="text-[10px] opacity-90 font-bold block uppercase tracking-wider">
                YUPPİ ÇOCUK
              </span>
              <span className="text-sm font-black flex items-center gap-1.5">
                Kanalı İzle & Abone Ol
                <ExternalLink className="w-4 h-4" />
              </span>
            </div>
          </a>
        </div>

      </div>

    </div>
  );
}
