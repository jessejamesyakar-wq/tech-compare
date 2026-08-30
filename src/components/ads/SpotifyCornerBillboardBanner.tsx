'use client';

import React from 'react';
import Image from 'next/image';
import PenguinMascot from '@/components/PenguinMascot';

interface SpotifyCornerBillboardBannerProps {
  targetUrl?: string;
}

export function SpotifyCornerBillboardBanner({
  targetUrl = 'https://open.spotify.com',
}: SpotifyCornerBillboardBannerProps) {
  return (
    <section className="w-full py-2 sm:py-3 flex items-center justify-center select-none">
      <div className="w-full max-w-[1240px] flex flex-col lg:flex-row items-center justify-between gap-2 sm:gap-4 lg:gap-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 px-3 py-1.5 xs:px-4 xs:py-2 sm:px-6 sm:py-3 lg:px-6 lg:py-2 shadow-xl relative overflow-hidden">
        
        {/* Soft Ambient Red / Magenta Glow */}
        <div className="absolute top-1/2 -left-10 -translate-y-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Sol Alan: Kırmızı Çizgilere Kadar Büyütülmüş 3D Köşe Billboard */}
        <div className="flex-1 w-full flex items-center justify-center lg:justify-start -ml-0 lg:-ml-2">
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="relative block w-full max-w-[720px] sm:max-w-[820px] md:max-w-[920px] lg:max-w-[940px] transition-all duration-300 hover:scale-[1.015] cursor-pointer group"
          >
            <Image
              src="/images/ads/spotify-corner-billboard-clean.png"
              alt="Spotify 3D Corner LED Billboard"
              width={1024}
              height={512}
              priority
              className="w-full h-auto max-h-[300px] xs:max-h-[350px] sm:max-h-[420px] md:max-h-[460px] lg:max-h-[490px] object-contain drop-shadow-[0_20px_28px_rgba(0,0,0,0.18)]"
            />

            {/* Top Right Sponsorlu / Reklam Badge */}
            <div className="absolute top-3 right-4 z-20 flex items-center gap-1.5 bg-black/75 backdrop-blur-md text-amber-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-amber-400/40 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Sponsorlu Reklam</span>
            </div>

            {/* Hover Floating Action Pill */}
            <div className="absolute bottom-3 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-black/85 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 shadow-lg flex items-center gap-1.5">
              <span>Spotify&apos;da Dinle</span>
              <span>→</span>
            </div>
          </a>
        </div>

        {/* Sağ Alan: Canlı Etkileşimli Pengi Maskotu */}
        <div className="shrink-0 flex items-center justify-center pt-1 lg:pt-0">
          <PenguinMascot />
        </div>

      </div>
    </section>
  );
}
