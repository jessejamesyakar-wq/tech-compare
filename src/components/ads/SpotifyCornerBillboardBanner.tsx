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
      <div className="w-full max-w-[1240px] flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6 lg:gap-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-6 lg:p-8 shadow-xl relative overflow-hidden">
        
        {/* Soft Ambient Red Glow */}
        <div className="absolute top-1/2 -left-10 -translate-y-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Sol Alan: 3D Köşe Billboard (Şeffaf Arka Plan, Tam Oturan Boyut) */}
        <div className="flex-1 w-full flex items-center justify-center lg:justify-start">
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="relative block w-full max-w-[580px] xs:max-w-[640px] sm:max-w-[720px] md:max-w-[780px] transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
          >
            <Image
              src="/images/ads/spotify-corner-billboard-clean.png"
              alt="Spotify 3D Corner LED Billboard"
              width={1024}
              height={512}
              priority
              className="w-full h-auto max-h-[220px] xs:max-h-[260px] sm:max-h-[300px] md:max-h-[340px] object-contain drop-shadow-[0_18px_24px_rgba(0,0,0,0.18)]"
            />

            {/* Hover Floating Action Pill */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-black/85 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 shadow-lg flex items-center gap-1.5">
              <span>Spotify&apos;da Dinle</span>
              <span>→</span>
            </div>
          </a>
        </div>

        {/* Sağ Alan: Canlı Etkileşimli Pengi Maskotu */}
        <div className="shrink-0 flex items-center justify-center pt-2 lg:pt-0">
          <PenguinMascot />
        </div>

      </div>
    </section>
  );
}
