'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { Truck, CheckCircle2, Zap, Tag } from 'lucide-react';

export interface CompactProductCardProps {
  product: Product;
  index?: number;
  badgeType?: 'discount' | 'featured' | 'new' | 'none';
  customBadgeText?: string;
  oldPrice?: number;
}

export function CompactProductCard({
  product,
  index = 0,
  badgeType,
  customBadgeText,
  oldPrice
}: CompactProductCardProps) {
  const href =
    product.category === 'tvs'
      ? `/tvs/${product.slug}`
      : product.category === 'laptops'
      ? `/laptops/${product.slug}`
      : product.category === 'appliances'
      ? `/appliances/${product.slug}`
      : product.category === 'tablets'
      ? `/tablets/${product.slug}`
      : product.category === 'smartwatches'
      ? `/smartwatches/${product.slug}`
      : product.category === 'headphones'
      ? `/headphones/${product.slug}`
      : product.category === 'consoles'
      ? `/consoles/${product.slug}`
      : product.category === 'monitors'
      ? `/monitors/${product.slug}`
      : `/phones/${product.slug}`;

  // Calculated fake old price for demo discount look if not provided
  const computedOldPrice = oldPrice || (index % 2 === 0 ? Math.round(product.basePrice * 1.12 / 100) * 100 : undefined);
  const isDiscounted = Boolean(computedOldPrice && computedOldPrice > product.basePrice);

  // Badge logic
  const showBadge = badgeType !== 'none';
  const isRedDiscount = badgeType === 'discount' || (isDiscounted && badgeType !== 'featured');

  const fallbackImg = 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=80';
  const [imgSrc, setImgSrc] = React.useState(product.image || fallbackImg);

  return (
    <div className="group relative bg-white border border-slate-200 hover:border-emerald-500/60 rounded-2xl p-3 sm:p-3.5 transition-all duration-200 shadow-2xs hover:shadow-lg flex flex-col justify-between overflow-hidden">
      
      {/* Top Badges */}
      {showBadge && (
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1">
          {isRedDiscount ? (
            <div className="bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-2.5 h-2.5" />
              <span>{customBadgeText || '%12 İNDİRİM'}</span>
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-[8px] font-black uppercase tracking-tighter shadow-md border border-slate-700">
              <span>{customBadgeText || 'YENİ'}</span>
            </div>
          )}
        </div>
      )}

      {/* Product Image Box */}
      <Link href={href} className="block relative my-1">
        <div className="w-full h-44 sm:h-48 bg-slate-50 rounded-xl p-3 sm:p-4 flex items-center justify-center overflow-hidden border border-slate-200/80 group-hover:bg-slate-100/80 group-hover:border-emerald-400 transition-all">
          <img
            src={imgSrc}
            alt={product.name}
            loading="lazy"
            onError={() => setImgSrc(fallbackImg)}
            className="max-h-full max-w-full w-auto h-auto object-contain group-hover:scale-105 transition-transform duration-300 ease-out drop-shadow-xs"
          />
        </div>
      </Link>

      {/* Product Title & Brand */}
      <div className="space-y-1 mt-1">
        <span className="text-[9px] font-extrabold text-emerald-700 uppercase tracking-widest block">
          {product.brand}
        </span>

        <Link href={href} className="block">
          <h4 className="text-xs font-black text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h4>
        </Link>
      </div>

      {/* Price & Strikethrough Area */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
        {computedOldPrice && computedOldPrice > product.basePrice ? (
          <div className="flex items-center gap-1.5">
            <span className="line-through text-slate-400 text-[11px] font-bold tabular-nums">
              {computedOldPrice.toLocaleString()} ₺
            </span>
            <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-1 rounded">
              -{(100 - Math.round((product.basePrice / computedOldPrice) * 100))}%
            </span>
          </div>
        ) : (
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            En Ucuz Mağaza
          </div>
        )}

        <div className="text-sm sm:text-base font-black text-emerald-700 tracking-tight tabular-nums">
          {product.basePrice.toLocaleString()} ₺
        </div>

        {/* Thin Stock/Fast Delivery Status Bar */}
        <div className="pt-1.5 flex items-center gap-1.5">
          <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${index % 2 === 0 ? 'bg-emerald-500 w-4/5' : 'bg-blue-500 w-full'}`}
            />
          </div>
          <span className="text-[9px] font-bold text-slate-500 flex items-center gap-0.5 shrink-0">
            <Truck className="w-2.5 h-2.5 text-emerald-600" />
            <span>{index % 2 === 0 ? 'Hızlı Kargo' : 'Aynı Gün'}</span>
          </span>
        </div>
      </div>

    </div>
  );
}
