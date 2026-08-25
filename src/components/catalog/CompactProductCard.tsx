'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { ArrowRight, Store } from 'lucide-react';

export interface CompactProductCardProps {
  product: Product;
  index?: number;
  badgeType?: 'discount' | 'featured' | 'new' | 'none';
  customBadgeText?: string;
  oldPrice?: number;
}

export function CompactProductCard({
  product
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

  const offers = product.storeOffers || [];
  const offerCount = offers.length > 0 ? offers.length : 3;
  const prices = offers.map((o) => o.price).filter((p) => p > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : product.basePrice;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : Math.round(product.basePrice * 1.08);

  const fallbackImg =
    product.category === 'appliances'
      ? 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=800&q=80'
      : product.category === 'tvs'
      ? 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=80'
      : product.category === 'laptops'
      ? 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'
      : 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80';

  const [imgSrc, setImgSrc] = React.useState(product.image || fallbackImg);

  React.useEffect(() => {
    setImgSrc(product.image || fallbackImg);
  }, [product.image, fallbackImg]);

  // Clean Unified Card Layout for all categories
  const specs = (product.specs || {}) as Record<string, any>;
  let subInfo = '';

  if (product.category === 'smartphones') {
    const screen = specs.screen?.size ? `${specs.screen.size}"` : (specs.screenSize ? `${specs.screenSize}"` : '');
    const chipRaw = specs.processor?.chip || specs.processor || '';
    const chip = chipRaw.split(' ')[0] + (chipRaw.split(' ')[1] ? ' ' + chipRaw.split(' ')[1] : '');
    const cam = specs.camera?.mainMp ? `${specs.camera.mainMp.split(' ')[0]} MP` : '';
    const storage = specs.memory?.storageGb ? `${specs.memory.storageGb} GB` : (specs.storage ? `${specs.storage} GB` : '');
    subInfo = [screen, chip, cam, storage].filter(Boolean).slice(0, 3).join(' • ') || (product.highlights?.[0] || '');
  } else if (product.category === 'headphones') {
    const formFactor = specs.formFactor || '';
    const anc = specs.anc && specs.anc !== 'Yok' ? 'Gürültü Engelleme' : '';
    const battery = specs.batteryLife ? `${specs.batteryLife} Pil` : '';
    subInfo = [anc, battery, formFactor].filter(Boolean).slice(0, 2).join(' • ') || (product.highlights?.[0] || '');
  } else if (product.category === 'smartwatches') {
    const caseSize = specs.caseSize || specs.size || '';
    const material = specs.caseMaterial || specs.material || '';
    const gps = specs.gps || specs.connectivity || '';
    const battery = specs.batteryLife ? `${specs.batteryLife} Pil` : '';
    subInfo = [caseSize, material, gps, battery].filter(Boolean).slice(0, 2).join(' • ') || (product.highlights?.[0] || '');
  } else if (product.category === 'tablets') {
    const screen = specs.screenSize ? `${specs.screenSize}"` : (specs.screen?.size ? `${specs.screen.size}"` : '');
    const chip = specs.processor?.chip || specs.processor || specs.chipset || '';
    const storage = specs.storage || (specs.memory?.storageGb ? `${specs.memory.storageGb} GB` : '');
    subInfo = [screen, chip, storage].filter(Boolean).slice(0, 3).join(' • ') || (product.highlights?.[0] || '');
  } else if (product.category === 'tvs') {
    const sizeMatch = product.name.match(/\b(\d+(?:\.\d+)?)"/);
    const inch = sizeMatch ? `${sizeMatch[1]}"` : (specs.screenSizeInches ? `${specs.screenSizeInches}"` : '');
    const tech = specs.displayTech || '';
    const refresh = specs.refreshRateHz ? `${specs.refreshRateHz}Hz` : '';
    const os = specs.smartOs || '';
    subInfo = [inch, tech, refresh, os].filter(Boolean).slice(0, 3).join(' • ') || (product.highlights?.[0] || '');
  } else if (product.category === 'laptops') {
    const inch = specs.screenSizeInches ? `${specs.screenSizeInches}"` : '';
    const cpu = specs.processor ? (specs.processor.includes('Apple') ? specs.processor.split(' (')[0] : specs.processor.split(' ')[0] + ' ' + (specs.processor.split(' ')[1] || '')) : '';
    const ram = specs.ramGb ? `${specs.ramGb}GB RAM` : '';
    const storage = specs.storageGb ? `${specs.storageGb >= 1000 ? (specs.storageGb / 1000) + 'TB' : specs.storageGb + 'GB'}` : '';
    const gpu = specs.gpu && !specs.gpu.toLowerCase().includes('intel') && !specs.gpu.toLowerCase().includes('iris') ? specs.gpu.split(' ')[0] + ' ' + (specs.gpu.split(' ')[1] || '') : '';
    subInfo = [inch, cpu, gpu || ram, storage].filter(Boolean).slice(0, 3).join(' • ') || (product.highlights?.[0] || '');
  } else {
    // Appliances and generic
    const suction = specs.suctionPowerPa ? `${Number(specs.suctionPowerPa).toLocaleString()} Pa Emiş` : '';
    const power = specs.powerWatts ? `${specs.powerWatts}W` : '';
    const cap = specs.capacity || (specs.capacityLiters ? `${specs.capacityLiters} L` : '');
    const subLabel = specs.subCategoryLabel || '';
    subInfo = [suction, power, cap, subLabel].filter(Boolean).slice(0, 2).join(' • ') || (product.highlights?.[0] || '');
  }

  return (
    <div className="group relative bg-white border border-slate-200/90 hover:border-slate-400/80 rounded-3xl p-4 sm:p-4.5 transition-all duration-300 shadow-xs hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between overflow-hidden">
      {/* Product Image Box */}
      <Link href={href} className="block relative mb-2">
        <div className="w-full h-48 sm:h-52 bg-slate-50/90 rounded-2xl p-4 flex items-center justify-center overflow-hidden border border-slate-100 group-hover:bg-slate-100/60 transition-colors">
          <img
            src={imgSrc}
            alt={product.name}
            loading="lazy"
            onError={() => setImgSrc(fallbackImg)}
            className="max-h-full max-w-full w-auto h-auto object-contain group-hover:scale-105 transition-transform duration-300 ease-out drop-shadow-xs"
          />
        </div>
      </Link>

      {/* Product Brand & Title */}
      <div className="space-y-1">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          {product.brand}
        </span>

        <Link href={href} className="block">
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h4>
        </Link>

        {subInfo && (
          <p className="text-xs text-slate-500 font-medium line-clamp-1 pt-0.5">
            {subInfo}
          </p>
        )}
      </div>

      {/* Seller & Price Comparison Info */}
      <div className="mt-3 pt-2.5 border-t border-slate-100/90 space-y-2">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>En Düşük Fiyat</span>
            <span className="text-emerald-700 font-bold lowercase flex items-center gap-1">
              <Store className="w-3 h-3" />
              {offerCount} satıcıda fiyat
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight tabular-nums">
              ₺{minPrice.toLocaleString()}
            </div>
            {maxPrice > minPrice && (
              <span className="text-[11px] font-medium text-slate-400 tabular-nums">
                ₺{maxPrice.toLocaleString()}&apos;ye kadar
              </span>
            )}
          </div>
        </div>

        {/* Top 2 Stores Comparison Chips */}
        {offers.length > 0 ? (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {offers.slice(0, 2).map((offer, oIdx) => (
              <span
                key={oIdx}
                className="text-[10px] font-semibold bg-slate-100/80 text-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="font-bold">{offer.storeName.replace('.com.tr', '')}</span>: ₺{offer.price.toLocaleString()}
              </span>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium pt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Yetkili Satıcı Fiyatları</span>
          </div>
        )}

        {/* Compare Prices Link */}
        <Link
          href={href}
          className="w-full bg-slate-900 hover:bg-emerald-600 text-white text-[11px] font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all mt-1"
        >
          <span>Fiyatları Karşılaştır ({offerCount} Mağaza)</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
