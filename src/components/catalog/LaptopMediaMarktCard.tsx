'use client';

import React from 'react';
import Link from 'next/link';
import { LaptopProduct } from '@/lib/types';
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

  const specs = laptop.specs || {};

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

        {/* Product Image Stage */}
        <Link href={`/laptops/${laptop.slug}`} className="w-full h-44 sm:h-48 bg-slate-50 rounded-2xl p-3 sm:p-4 flex items-center justify-center relative overflow-hidden border border-slate-200/80 group-hover:bg-slate-100/80 group-hover:border-emerald-400 transition-all">
          <img
            src={laptop.image}
            alt={laptop.name}
            loading="lazy"
            className="max-h-full max-w-full w-auto h-auto object-contain group-hover:scale-105 transition-transform duration-300 ease-out drop-shadow-xs"
          />
        </Link>

        {/* Star Rating & Compare Checkbox */}
        <div className="w-full mt-3 flex items-center justify-between">
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
          <Link href={`/laptops/${laptop.slug}`}>
            <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
              {laptop.name}
            </h3>
          </Link>
        </div>

        {/* Key Technical Specs Grid (MediaMarkt style Key-Value pairs) */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
          <div>
            <span className="text-slate-400 font-medium block text-[10px] uppercase">Ürün Tipi</span>
            <span className="font-bold text-slate-800 block line-clamp-1">{specs.productType || laptop.productType || 'Laptop'}</span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block text-[10px] uppercase">İşlemci</span>
            <span className="font-bold text-slate-800 block line-clamp-1">{specs.processor || 'Belirtilmedi'}</span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block text-[10px] uppercase">RAM Bellek Boyutu</span>
            <span className="font-bold text-slate-800 block line-clamp-1">{specs.ramGb ? `${specs.ramGb} GB` : 'Belirtilmedi'} {specs.ramType ? `(${specs.ramType})` : ''}</span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block text-[10px] uppercase">Sabit Disk Kapasitesi</span>
            <span className="font-bold text-slate-800 block line-clamp-1">{specs.storageGb ? `${specs.storageGb} GB` : 'Belirtilmedi'} {specs.storageType ? `(${specs.storageType})` : ''}</span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block text-[10px] uppercase">Grafik Kartı</span>
            <span className="font-bold text-slate-800 block line-clamp-1">{specs.gpu || 'Dahili GPU'}</span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block text-[10px] uppercase">Ekran Boyutu</span>
            <span className="font-bold text-slate-800 block line-clamp-1">{specs.screenSizeInches ? `${specs.screenSizeInches} inç` : 'Belirtilmedi'}</span>
          </div>
        </div>

        {/* Highlights Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {(laptop.highlights || []).map((highlight, hIdx) => (
            <span
              key={hIdx}
              className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full"
            >
              ✓ {highlight}
            </span>
          ))}
        </div>

      </div>

      {/* RIGHT SECTION: Price, Stock Status & Action Buttons */}
      <div className="w-full md:w-64 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between space-y-4">
        
        {/* Discount & Price Box */}
        <div className="space-y-1.5 text-right md:text-right">
          {isDiscounted && oldPrice && (
            <div className="flex items-center justify-end gap-1.5">
              <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-2xs">
                -%{discountPercent}
              </span>
              <span className="text-xs text-slate-400 font-bold">En düşük fiyat (10 gün):</span>
              <span className="line-through text-slate-400 text-xs font-bold tabular-nums">
                ₺{oldPrice.toLocaleString()},-
              </span>
            </div>
          )}

          {/* Huge Price Tag */}
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight tabular-nums">
            ₺{laptop.basePrice.toLocaleString()},-
          </div>

          <div className="text-[11px] font-extrabold text-emerald-700">
            KDV dahil ücretsiz kargo
          </div>

          <div className="text-[11px] font-medium text-slate-500">
            3 taksitle ödeme <strong className="text-slate-800 font-bold">₺{monthly3x.toLocaleString()},-</strong>
          </div>
        </div>

        {/* Delivery & Store Pickup Status Lines */}
        <div className="space-y-1.5 text-xs border-t border-slate-100 pt-3">
          <div className="flex items-start gap-1.5 text-emerald-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0 animate-pulse" />
            <div>
              <span>Adrese teslimata uygun.</span>
              <span className="text-[10px] font-medium text-slate-500 block">
                Tahmini teslimat 18.08.2026 - 19.08.2026
              </span>
            </div>
          </div>

          <div className="flex items-start gap-1.5 text-amber-700 font-bold pt-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0" />
            <div>
              <span>Mağazadan teslim al</span>
              <button className="text-[10px] font-bold text-slate-800 hover:text-emerald-700 underline block cursor-pointer">
                Lütfen bir mağaza seçin: <strong>Mağaza seçin</strong>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom CTA Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <Link href={`/laptops/${laptop.slug}`} className="flex-1">
            <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-3.5 px-4 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>İncele & Fiyatları Kıyasla</span>
            </button>
          </Link>

          <button
            className="p-3.5 rounded-2xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-colors shadow-2xs cursor-pointer"
            title="Favorilere Ekle"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
