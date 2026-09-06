'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProductImage } from '@/components/ui/ProductImage';
import { LaptopProduct } from '@/lib/types';
import { getProductColorList, ResolvedColorOption } from '@/lib/colorVariantHelper';
import { ACTIVE_STORE_COUNT, ACTIVE_RETAILERS } from '@/lib/activeStores';
import { useCompare } from '@/context/CompareContext';
import {
  Star,
  ShoppingBag,
  Heart,
  Info,
  CheckCircle,
  MapPin,
  Check,
  Award,
  Zap,
  Scale
} from 'lucide-react';

interface LaptopMediaMarktCardProps {
  laptop: LaptopProduct;
  index?: number;
}

export function LaptopMediaMarktCard({ laptop, index = 0 }: LaptopMediaMarktCardProps) {
  const router = useRouter();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const inCompare = isInCompare(laptop.id);

  const handleCompareClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (inCompare) {
      removeFromCompare(laptop.id);
    } else {
      addToCompare(laptop);
    }
  };

  // Score calculation out of 100
  const score100 = Math.round(laptop.rating * 20);

  // Computed installment monthly price
  const monthly3x = Math.round(laptop.basePrice / 3);
  const monthly9x = Math.round(laptop.basePrice / 9);

  // Computed fake old price for discount badge demo
  const isDiscounted = index % 3 === 0;
  const oldPrice = isDiscounted ? Math.round(laptop.basePrice * 1.12 / 100) * 100 : undefined;
  const discountPercent = oldPrice ? Math.round((1 - laptop.basePrice / oldPrice) * 100) : 0;

  const fallbackImg = '/images/products/laptops/apple-macbook-air-m3.jpg';
  const availableColors = React.useMemo(() => getProductColorList(laptop), [laptop]);
  const [activeColor, setActiveColor] = useState<ResolvedColorOption | null>(availableColors[0] || null);
  const [imgSrc, setImgSrc] = useState<string>(availableColors[0]?.image || laptop.image || fallbackImg);

  const handleColorClick = (e: React.MouseEvent, color: ResolvedColorOption) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveColor(color);
    if (color.image) {
      setImgSrc(color.image);
    }
    router.push(`/laptops/${laptop.slug}?color=${encodeURIComponent(color.name)}`);
  };

  const handleColorHover = (color: ResolvedColorOption) => {
    setActiveColor(color);
    if (color.image) {
      setImgSrc(color.image);
    }
  };

  const targetHref = `/laptops/${laptop.slug}${activeColor ? `?color=${encodeURIComponent(activeColor.name)}` : ''}`;

  return (
    <div className="bg-white border border-slate-200 hover:border-emerald-500/60 rounded-3xl p-5 sm:p-6 transition-all duration-300 shadow-2xs hover:shadow-xl relative flex flex-col md:flex-row gap-6 justify-between group">
      
      {/* LEFT SECTION: Image & Top Badges */}
      <div className="w-full md:w-56 shrink-0 flex flex-col items-center justify-between relative">
        
        {/* Top Badges (Sponsorlu / Web'e Özel) */}
        <div className="w-full flex items-center justify-between gap-1.5 mb-2">
          <div className="flex items-center gap-1.5">
            {laptop.isSponsored && (
              <span className="bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                <span>Sponsorlu</span>
                <Info className="w-3 h-3 text-slate-400" />
              </span>
            )}
            {laptop.isWebExclusive && (
              <span className="bg-cyan-50 border border-cyan-200 text-cyan-700 text-[10px] font-black px-2 py-0.5 rounded">
                Web&apos;e Özel
              </span>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
            <Award className="w-3 h-3 text-amber-600" />
            <span>{score100} / 100</span>
          </div>
        </div>

        {/* Standart 1:1 Kare Ürün Görseli Container */}
        <Link href={targetHref} className="block w-full flex justify-center">
          <ProductImage
            key={imgSrc}
            src={imgSrc}
            alt={laptop.name}
            variant="card"
            className="group-hover:scale-105 drop-shadow-xs transition-all duration-300"
          />
        </Link>

        {/* Color Variant Dots on Laptop Card */}
        {availableColors.length > 0 && (
          <div className="flex items-center gap-1.5 my-2">
            {availableColors.slice(0, 4).map((c, cIdx) => {
              const isCurrent = activeColor?.name.toLowerCase() === c.name.toLowerCase();
              return (
                <button
                  key={cIdx}
                  type="button"
                  onClick={(e) => handleColorClick(e, c)}
                  onMouseEnter={() => handleColorHover(c)}
                  title={c.name}
                  className={`w-3 h-3 rounded-full border transition-all cursor-pointer ${
                    isCurrent
                      ? 'ring-2 ring-emerald-500 border-white scale-110 shadow-xs'
                      : 'border-slate-300/80 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              );
            })}
            {activeColor && (
              <span className="text-[9px] text-slate-400 font-medium truncate ml-1">
                {activeColor.name.split(' ')[0]}
              </span>
            )}
          </div>
        )}

        {/* Star Rating & Compare Checkbox */}
        <div className="w-full mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(laptop.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-600">({laptop.reviewCount})</span>
          </div>

          {/* Compare Checkbox */}
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer hover:text-emerald-700 select-none">
            <input
              type="checkbox"
              checked={inCompare}
              onChange={handleCompareClick}
              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <span>Karşılaştır</span>
          </label>
        </div>

      </div>

      {/* CENTER SECTION: Title & Technical Specs List */}
      <div className="flex-1 space-y-3 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
        
        <div>
          <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest block">
            {laptop.brand} • {laptop.specs?.productType || 'Laptop'}
          </span>
          <Link href={targetHref}>
            <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
              {laptop.name}
            </h3>
          </Link>
        </div>

        {/* Key Technical Specs Grid (MediaMarkt style Key-Value pairs) */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
          <div>
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">İşlemci</span>
            <span className="font-bold text-slate-800 truncate block">{laptop.specs?.processor || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">RAM Bellek</span>
            <span className="font-bold text-slate-800">{laptop.specs?.ramGb} GB RAM</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Depolama (SSD)</span>
            <span className="font-bold text-slate-800">{laptop.specs?.storageGb} GB SSD</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Ekran Kartı</span>
            <span className="font-bold text-slate-800 truncate block">{laptop.specs?.gpu || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Ekran Boyutu</span>
            <span className="font-bold text-slate-800">{laptop.specs?.screenSizeInches} inç</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">İşletim Sistemi</span>
            <span className="font-bold text-slate-800 truncate block">{laptop.specs?.os || 'FreeDOS'}</span>
          </div>
        </div>

        {/* MediaMarkt Club & Stock Status Highlights */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Kulüp Üyelerine Özel Ücretsiz Kargo &amp; Hızlı Teslimat</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>İstanbul / Mağazadan 30 dakikada teslim al</span>
          </div>
        </div>

      </div>

      {/* RIGHT SECTION: Price Box & CTA Buttons */}
      <div className="w-full md:w-64 shrink-0 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
        
        <div>
          {/* Discount Badge */}
          {oldPrice && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-slate-400 line-through">
                {oldPrice.toLocaleString()} TL
              </span>
              <span className="bg-red-50 text-red-600 text-[10px] font-black px-1.5 py-0.5 rounded border border-red-100">
                %{discountPercent} İndirim
              </span>
            </div>
          )}

          {/* Main Price */}
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {laptop.basePrice.toLocaleString()}
            </span>
            <span className="text-base font-bold text-slate-700">TL</span>
          </div>

          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
            KDV Dahildir • {ACTIVE_STORE_COUNT === 1 ? `${ACTIVE_RETAILERS[0]?.name || 'Hepsiburada'} Fiyatı` : `${ACTIVE_STORE_COUNT} Mağaza Fiyatı`}
          </p>

          {/* Installment Badge Options */}
          <div className="mt-3 p-2 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-[11px]">
            <div className="flex justify-between font-bold text-slate-700">
              <span>Peşin Fiyatına 3 Taksit:</span>
              <span className="text-emerald-700">{monthly3x.toLocaleString()} TL / ay</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[10px]">
              <span>9 Aya Varan Taksitle:</span>
              <span>{monthly9x.toLocaleString()} TL / ay</span>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-4 space-y-2">
          <Link href={targetHref} className="block w-full">
            <button className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-xs py-3 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer">
              <ShoppingBag className="w-4 h-4" />
              <span>Mağaza Fiyatlarını İncele</span>
            </button>
          </Link>

          <Link href={targetHref} className="block w-full">
            <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 px-4 rounded-2xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
              <span>Tüm Özellikleri Gör</span>
            </button>
          </Link>
        </div>

      </div>

    </div>
  );
}
