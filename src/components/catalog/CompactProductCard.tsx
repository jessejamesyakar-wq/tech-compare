'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { ArrowRight, Store } from 'lucide-react';
import { TiltCard } from '@/components/ui/TiltCard';

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
  const slug = product.slug || product.id;
  const href =
    product.category === 'tvs'
      ? `/tvs/${slug}`
      : product.category === 'laptops'
      ? `/laptops/${slug}`
      : product.category === 'appliances'
      ? `/appliances/${slug}`
      : product.category === 'tablets'
      ? `/tablets/${slug}`
      : product.category === 'smartwatches'
      ? `/smartwatches/${slug}`
      : product.category === 'headphones'
      ? `/headphones/${slug}`
      : product.category === 'consoles'
      ? `/consoles/${slug}`
      : product.category === 'monitors'
      ? `/monitors/${slug}`
      : `/phones/${slug}`;

  const offers = product.storeOffers || [];
  const offerCount = offers.length > 0 ? offers.length : 3;
  const prices = offers.map((o) => o.price).filter((p) => p > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : product.basePrice;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : Math.round(product.basePrice * 1.08);

  // Real deal calculation: strictly requires price drop in history (>=8%) or real multi-store spread (>=7%)
  const historyPrices = (product.priceHistory || []).map((h) => h.price).filter((p) => p > 0);
  const maxHistory = historyPrices.length > 0 ? Math.max(...historyPrices) : 0;
  const isHistoryDeal = maxHistory > minPrice && ((maxHistory - minPrice) / maxHistory) >= 0.08;
  const isSpreadDeal = prices.length > 1 && maxPrice > minPrice && ((maxPrice - minPrice) / maxPrice) >= 0.07;
  const isRealDeal = isHistoryDeal || isSpreadDeal;

  const fallbackImg =
    product.category === 'appliances'
      ? '/images/products/appliances/dyson-v15-detect.jpg'
      : product.category === 'tvs'
      ? '/images/products/tvs/lg-55qned81b6a-1.jpg'
      : product.category === 'laptops'
      ? '/images/products/laptops/apple-macbook-air-m3.jpg'
      : '/images/products/smartphones/apple/iphone-16-pro-natural.jpg';

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
  } else if (product.category === 'consoles') {
    const storage = specs.storage || specs.capacity || (product.name.includes('2TB') ? '2 TB SSD' : product.name.includes('1TB') ? '1 TB SSD' : product.name.includes('825GB') ? '825 GB SSD' : '');
    const res = specs.resolution || specs.outputResolution || (product.name.includes('Pro') ? '4K 120 FPS' : '4K HDR');
    const type = specs.deviceType || (product.name.toLowerCase().includes('el konsolu') ? 'Taşınabilir El Konsolu' : 'Sabit Ev Konsolu');
    subInfo = [storage, res, type].filter(Boolean).slice(0, 3).join(' • ') || (product.highlights?.[0] || '');
  } else {
    // Appliances and generic
    const suction = specs.suctionPowerPa ? `${Number(specs.suctionPowerPa).toLocaleString()} Pa Emiş` : '';
    const power = specs.powerWatts ? `${specs.powerWatts}W` : '';
    const cap = specs.capacity || (specs.capacityLiters ? `${specs.capacityLiters} L` : '');
    const subLabel = specs.subCategoryLabel || '';
    subInfo = [suction, power, cap, subLabel].filter(Boolean).slice(0, 2).join(' • ') || (product.highlights?.[0] || '');
  }

  return (
    <TiltCard className="group bg-white border border-slate-200/90 hover:border-emerald-500/50 rounded-2xl sm:rounded-3xl p-3 sm:p-4.5 transition-all duration-300 shadow-xs hover:shadow-xl flex flex-col justify-between">
      {/* Product Image Box */}
      <Link href={href} className="block relative mb-1.5 sm:mb-2">
        <div className="w-full h-36 xs:h-40 sm:h-52 bg-slate-50/90 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex items-center justify-center overflow-hidden border border-slate-100 group-hover:bg-slate-100/60 transition-colors">
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
      <div className="space-y-0.5 sm:space-y-1">
        <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          {product.brand}
        </span>

        <Link href={href} className="block">
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h4>
        </Link>

        {subInfo && (
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium line-clamp-1 pt-0.5">
            {subInfo}
          </p>
        )}

        {/* Color Swatches */}
        {product.colorOptions && product.colorOptions.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1.5">
            {product.colorOptions.slice(0, 4).map((c, cIdx) => (
              <span
                key={cIdx}
                title={c.name}
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-slate-300 shadow-2xs shrink-0"
                style={{ backgroundColor: c.hex }}
              />
            ))}
            {product.colorOptions.length > 4 && (
              <span className="text-[9px] text-slate-400 font-bold">
                +{product.colorOptions.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Seller & Price Comparison Info */}
      <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-slate-100/90 space-y-1.5 sm:space-y-2">
        <div>
          <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>En Düşük</span>
            <span className="text-emerald-700 font-bold lowercase flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px]">
              <Store className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              {offerCount} satıcı
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <div className="text-sm sm:text-lg font-black text-slate-900 tracking-tight tabular-nums">
              ₺{minPrice.toLocaleString()}
            </div>
            {isRealDeal ? (
              <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                ⚡ AI: Fırsat Fiyat
              </span>
            ) : (
              <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                Piyasa Fiyatı
              </span>
            )}
          </div>
        </div>

        {/* Top 2 Stores Comparison Chips */}
        {offers.length > 0 ? (
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap pt-0.5">
            {offers.slice(0, 2).map((offer, oIdx) => (
              <span
                key={oIdx}
                className="text-[9px] sm:text-[10px] font-semibold bg-slate-100/80 text-slate-700 px-1.5 sm:px-2 py-0.5 rounded-md flex items-center gap-0.5 sm:gap-1 truncate max-w-full"
              >
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-bold truncate">{offer.storeName.replace('.com.tr', '')}</span>: ₺{offer.price.toLocaleString()}
              </span>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-500 font-medium pt-0.5">
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500" />
            <span>Yetkili Satıcılar</span>
          </div>
        )}

        {/* Compare Prices Link */}
        <Link
          href={href}
          className="w-full bg-slate-900 hover:bg-emerald-600 text-white text-[10px] sm:text-[11px] font-bold py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl flex items-center justify-center gap-1 sm:gap-1.5 transition-all mt-1"
        >
          <span>Fiyatları Karşılaştır ({offerCount})</span>
          <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        </Link>
      </div>
    </TiltCard>
  );
}
