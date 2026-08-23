'use client';

import React from 'react';

interface MediaMarktBannerProps {
  customImage?: string;
  targetUrl?: string;
}

export function MediaMarktBanner({
  customImage = '/images/ads/mediamarkt-club-banner.jpg',
  targetUrl = 'https://www.mediamarkt.com.tr'
}: MediaMarktBannerProps) {
  return (
    <a
      href={targetUrl}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="relative block w-full overflow-hidden rounded-3xl border border-red-500/40 shadow-xl group transition-all duration-300 hover:shadow-2xl hover:border-red-400 hover:scale-[1.01]"
    >
      {/* Sponsorlu Reklam Etiketi */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-black/75 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-white/20 uppercase tracking-wider shadow-md">
        <span>Sponsorlu • Reklam</span>
      </div>

      {/* Banner Görseli */}
      <div className="relative w-full overflow-hidden rounded-3xl bg-red-600 aspect-[2/1] sm:aspect-[2.1/1] max-h-[300px] flex items-center justify-center">
        <img
          src={customImage}
          alt="MediaMarkt Club İndirim Kampanyası"
          className="w-full h-full object-cover sm:object-contain object-center transition-transform duration-500 group-hover:scale-105"
        />
        {/* Subtle Ambient Hover Glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </a>
  );
}
