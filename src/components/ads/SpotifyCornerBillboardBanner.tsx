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
    <section className="w-full py-2 sm:py-4 flex items-center justify-center select-none">
      <div className="w-full max-w-[1200px] flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6 lg:gap-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-6 lg:p-8 shadow-xl relative overflow-hidden">
        
        {/* Ambient Soft Red / Magenta Glow */}
        <div className="absolute top-1/2 -left-10 -translate-y-1/2 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-80 h-80 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Left: 3D Corner Billboard (Sized to not exceed the Penguin height) */}
        <div className="flex-1 w-full flex items-center justify-center lg:justify-start">
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="relative block w-full max-w-[640px] sm:max-w-[700px] md:max-w-[760px] rounded-xl overflow-hidden shadow-2xl transition-all duration-300 hover:scale-[1.015] hover:shadow-[0_20px_35px_rgba(230,0,0,0.25)] cursor-pointer group"
          >
            <Image
              src="/images/ads/spotify-corner-billboard-clean.png"
              alt="Spotify 3D Corner LED Billboard"
              width={1024}
              height={512}
              priority
              className="w-full h-auto max-h-[250px] xs:max-h-[280px] sm:max-h-[310px] md:max-h-[330px] object-contain drop-shadow-[0_15px_20px_rgba(0,0,0,0.2)]"
            />

            {/* Subtle Hover Action Badge */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/80 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full border border-white/20 shadow-md flex items-center gap-1">
              <span>Spotify&apos;da Dinle</span>
              <span>→</span>
            </div>
          </a>
        </div>

        {/* Right: Live Interactive Penguin Mascot */}
        <div className="shrink-0 flex items-center justify-center pt-2 lg:pt-0">
          <PenguinMascot />
        </div>

      </div>
    </section>
  );
}
