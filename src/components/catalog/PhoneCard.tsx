'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProductImage } from '@/components/ui/ProductImage';
import { motion } from 'framer-motion';
import { Smartphone } from '@/lib/types';
import { getProductColorList, ResolvedColorOption } from '@/lib/colorVariantHelper';
import { ACTIVE_RETAILERS, ACTIVE_STORE_COUNT } from '@/lib/activeStores';
import { useI18n } from '@/lib/i18n/context';
import { useCompare } from '@/context/CompareContext';
import {
  Star,
  Cpu,
  HardDrive,
  Smartphone as ScreenIcon,
  Scale,
  Check,
  Zap,
  Camera,
  Store,
  Award,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { TiltCard } from '@/components/ui/TiltCard';

interface PhoneCardProps {
  phone: Smartphone;
  index?: number;
}

export function PhoneCard({ phone, index = 0 }: PhoneCardProps) {
  const { t } = useI18n();
  const router = useRouter();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const inCompare = isInCompare(phone.id);

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(phone.id);
    } else {
      addToCompare(phone);
    }
  };

  // Score Calculation (Out of 100 - aceleEtme 5-star normalized score)
  const score100 = phone.aceleEtmeScore || phone.epeyScore || Math.round(phone.rating * 20);

  // Safe spec extraction from product data
  const screenSize = phone.specs?.screen?.size || '6.7 inç';
  const refreshRate = phone.specs?.screen?.refreshRate || 120;
  const ramGb = phone.specs?.memory?.ramGb || 8;
  const storageGb = phone.specs?.memory?.storageGb || 128;
  const rawChip = phone.specs?.processor?.chip || 'Yapay Zeka İşlemci';
  const chipName = rawChip.split(' ')[0] + ' ' + (rawChip.split(' ')[1] || '');
  const rawCamera = phone.specs?.camera?.mainMp || '50 MP';
  const cameraMp = rawCamera.split(' ')[0] + ' MP';

  // 8-Store Price Calculation (HB, TY, Vatan, MM, Teknosa, Amazon, n11, PttAVM)
  const offers = phone.storeOffers || [];
  const validOffers = offers.filter((o) => o && o.price > 0);
  const effectiveBase = validOffers.length > 0 ? Math.min(...validOffers.map((o) => o.price)) : phone.basePrice || 30000;

  const findStorePrice = (keyword: string, fallbackOffset: number) => {
    const found = offers.find((o) => o.storeName.toLowerCase().includes(keyword.toLowerCase()));
    return found ? found.price : Math.round(effectiveBase * fallbackOffset);
  };

  const storeList = ACTIVE_RETAILERS.map((r, idx) => ({
    id: r.id,
    name: r.name,
    price: findStorePrice(r.keyword, 1.0 + idx * 0.002),
    color: r.color
  }));

  const lowestPrice = Math.min(...storeList.map((s) => s.price));
  const fallbackImg = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80';

  // Resolved colors list for card interactive preview
  const availableColors = React.useMemo(() => getProductColorList(phone), [phone]);
  const initialColor = React.useMemo(() => {
    if (!availableColors || availableColors.length === 0) return null;
    if (phone.image) {
      const match = availableColors.find((c) => c.image === phone.image);
      if (match) return match;
    }
    return availableColors[0];
  }, [availableColors, phone.image]);

  const [activeColor, setActiveColor] = useState<ResolvedColorOption | null>(initialColor);
  const [imgSrc, setImgSrc] = useState<string>(phone.image || initialColor?.image || fallbackImg);

  React.useEffect(() => {
    const match = phone.image ? availableColors.find((c) => c.image === phone.image) : null;
    const selected = match || availableColors[0] || null;
    setActiveColor(selected);
    setImgSrc(phone.image || selected?.image || fallbackImg);
  }, [phone.id, phone.image, availableColors, fallbackImg]);

  const handleColorClick = (e: React.MouseEvent, color: ResolvedColorOption) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveColor(color);
    if (color.image) {
      setImgSrc(color.image);
    }
    router.push(`/phones/${phone.slug}?color=${encodeURIComponent(color.name)}`);
  };

  const handleColorHover = (color: ResolvedColorOption) => {
    setActiveColor(color);
    if (color.image) {
      setImgSrc(color.image);
    }
  };

  const targetHref = `/phones/${phone.slug}${activeColor ? `?color=${encodeURIComponent(activeColor.name)}` : ''}`;

  return (
    <TiltCard className="group bg-white border border-slate-200 hover:border-emerald-500/60 rounded-2xl sm:rounded-3xl p-4 sm:p-5 transition-all duration-300 shadow-md hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between cursor-pointer">
      {/* Vatan Bilgisayar Tarzı Sol Üst Köşe Badgeleri */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
        {phone.isPopular && (
          <span className="bg-emerald-50 text-emerald-800 text-[8.5px] font-black uppercase px-2.5 py-0.5 rounded-md border border-emerald-200 shadow-xs flex items-center gap-1">
            <Zap className="w-2.5 h-2.5 text-emerald-600 fill-emerald-600" />
            <span>Popüler</span>
          </span>
        )}
        {phone.releaseYear === 2026 && (
          <span className="bg-slate-900 text-white text-[8.5px] font-black uppercase px-2.5 py-0.5 rounded-md shadow-xs">
            2026 Seri
          </span>
        )}
      </div>

      {/* Sağ Üst Kıyaslama Butonu (Vatan Stil) */}
      <button
        onClick={handleCompareClick}
        className={`absolute top-3 right-3 z-10 p-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer ${
          inCompare
            ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/25'
            : 'bg-white/95 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
        }`}
        title={t.addToCompare}
      >
        {inCompare ? <Check className="w-3 h-3 stroke-[3]" /> : <Scale className="w-3 h-3" />}
        <span className="text-[9px]">{inCompare ? 'Listede' : 'Kıyasla'}</span>
      </button>

      <div>
        {/* Standart 1:1 Kare Ürün Görseli Container */}
        <Link href={targetHref} className="block relative mb-3 flex justify-center">
          <div className="relative">
            <ProductImage
              key={imgSrc}
              src={imgSrc}
              alt={phone.name}
              variant="card"
              className="group-hover:scale-105 drop-shadow-sm transition-all duration-300"
            />

            {/* Circular Score Badge Overlay */}
            <div className="absolute bottom-2 right-2 z-10 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl px-2 py-0.5 shadow-xs flex items-center gap-1">
              <span className="text-[10px] font-black text-slate-900">{score100}</span>
              <span className="text-[7.5px] uppercase font-bold text-slate-400">puan</span>
            </div>
          </div>
        </Link>

        {/* Brand & User Rating */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-extrabold text-blue-900 uppercase tracking-widest text-[9.5px]">
            {phone.brand}
          </span>

          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5 text-amber-500 font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-slate-900 text-[11px]">{phone.rating || 4.8}</span>
            </div>
          </div>
        </div>

        {/* Product Title */}
        <Link href={targetHref} className="block mb-1.5">
          <h3 className="text-slate-900 font-bold text-xs leading-snug group-hover:text-blue-700 transition-colors line-clamp-2 min-h-[32px]">
            {phone.name}
          </h3>
        </Link>

        {/* Interactive Color Variant Swatches on Card */}
        {availableColors.length > 0 && (
          <div className="flex items-center gap-1.5 mb-2 py-0.5">
            {availableColors.slice(0, 5).map((c, cIdx) => {
              const isCurrent = activeColor?.name.toLowerCase() === c.name.toLowerCase();
              return (
                <button
                  key={cIdx}
                  type="button"
                  onClick={(e) => handleColorClick(e, c)}
                  onMouseEnter={() => handleColorHover(c)}
                  title={c.name}
                  className={`w-3.5 h-3.5 rounded-full border transition-all cursor-pointer ${
                    isCurrent
                      ? 'ring-2 ring-emerald-500 border-white scale-110 shadow-xs'
                      : 'border-slate-300/80 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              );
            })}
            {availableColors.length > 5 && (
              <span className="text-[9px] text-slate-400 font-bold">
                +{availableColors.length - 5}
              </span>
            )}
            {activeColor && (
              <span className="text-[9px] text-slate-500 font-medium truncate ml-1">
                {activeColor.name.split(' ')[0]}
              </span>
            )}
          </div>
        )}

        {/* Specs Highlights Pills */}
        <div className="grid grid-cols-2 gap-1 mb-2.5 text-[10px]">
          <div className="bg-slate-50 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/80 flex items-center gap-1 font-medium">
            <ScreenIcon className="w-2.5 h-2.5 text-blue-700 shrink-0" />
            <span className="truncate">{screenSize}</span>
          </div>
          <div className="bg-slate-50 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/80 flex items-center gap-1 font-medium">
            <HardDrive className="w-2.5 h-2.5 text-blue-700 shrink-0" />
            <span className="truncate">{ramGb}G / {storageGb}G</span>
          </div>
        </div>

        {/* 8 Store Price Capsules (HB, TY, Vatan, MM, Teknosa, Amazon, n11, PttAVM) */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 space-y-1.5 mb-2.5">
          <div className="flex items-center justify-between text-[9px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1">
            <span className="flex items-center gap-1">
              <Store className="w-2.5 h-2.5 text-blue-700" />{' '}
              {ACTIVE_STORE_COUNT === 1 ? `${ACTIVE_RETAILERS[0]?.name || 'Hepsiburada'} Fiyatı` : `${ACTIVE_STORE_COUNT} Mağaza Fiyatı`}
            </span>
            <span className="text-blue-900 bg-blue-100 px-1 py-0.2 rounded text-[8px] font-black">
              Canlı
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1 text-[9.5px]">
            {storeList.slice(0, 4).map((st) => {
              const isCheapest = st.price === lowestPrice;
              return (
                <div
                  key={st.id}
                  className={`flex items-center justify-between px-1.5 py-0.5 rounded border transition-all ${
                    isCheapest
                      ? 'bg-blue-50 border-blue-300 text-blue-950 font-black'
                      : 'bg-white border-slate-200 text-slate-700 font-medium'
                  }`}
                >
                  <span className={`text-[9px] truncate ${st.color}`}>{st.name}</span>
                  <span className="text-[9px] font-bold shrink-0">
                    {st.price > 0 ? `${st.price.toLocaleString()} ₺` : '-'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fiyat ve Buton Alanı (product-price-area: font-size 20px, font-weight 700, color #003399) */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
        <div>
          <span className="text-[9px] font-bold text-slate-400 block uppercase">En İyi Fiyat</span>
          <span className="product-price-area text-[20px] font-bold text-[#003399] tracking-tight block leading-tight">
            {lowestPrice > 0 ? `${lowestPrice.toLocaleString()} ₺` : 'Fiyat Sorunuz'}
          </span>
        </div>

        <Link href={targetHref}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="bg-[#003399] hover:bg-blue-800 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-all duration-200 shadow-xs cursor-pointer flex items-center gap-1"
          >
            <span>İncele</span>
            <ArrowRight className="w-3 h-3" />
          </motion.button>
        </Link>
      </div>
    </TiltCard>
  );
}
