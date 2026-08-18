'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Smartphone } from '@/lib/types';
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

interface PhoneCardProps {
  phone: Smartphone;
  index?: number;
}

export function PhoneCard({ phone, index = 0 }: PhoneCardProps) {
  const { t } = useI18n();
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

  // Score Calculation (Out of 100 - Epey/Akakçe style)
  const score100 = Math.round(phone.rating * 20);

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
  const base = phone.basePrice || 30000;
  const offers = phone.storeOffers || [];

  const findStorePrice = (keyword: string, offsetRatio: number) => {
    const found = offers.find((o) => o.storeName.toLowerCase().includes(keyword.toLowerCase()));
    return found ? found.price : Math.round(base * offsetRatio);
  };

  const storeList = [
    {
      id: 'hb',
      name: 'Hepsiburada',
      price: findStorePrice('hepsiburada', 0.996),
      color: 'text-orange-600'
    },
    {
      id: 'ty',
      name: 'Trendyol',
      price: findStorePrice('trendyol', 1.002),
      color: 'text-amber-600'
    },
    {
      id: 'vatan',
      name: 'Vatan',
      price: findStorePrice('vatan', 1.0),
      color: 'text-blue-700'
    },
    {
      id: 'mm',
      name: 'MediaMarkt',
      price: findStorePrice('media', 1.006),
      color: 'text-red-600'
    },
    {
      id: 'teknosa',
      name: 'Teknosa',
      price: findStorePrice('teknosa', 1.004),
      color: 'text-orange-600'
    },
    {
      id: 'amazon',
      name: 'Amazon',
      price: findStorePrice('amazon', 0.998),
      color: 'text-amber-600'
    },
    {
      id: 'n11',
      name: 'n11',
      price: findStorePrice('n11', 0.994),
      color: 'text-purple-700'
    },
    {
      id: 'pttavm',
      name: 'PttAVM',
      price: findStorePrice('ptt', 0.992),
      color: 'text-blue-900 font-extrabold'
    }
  ];

  const lowestPrice = Math.min(...storeList.map((s) => s.price));

  return (
    <div
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 440px' }}
      className="product-card group relative bg-white border border-[#e0e0e0] hover:border-blue-600/60 rounded-xl p-3 sm:p-3.5 transition-all duration-200 shadow-2xs hover:shadow-lg flex flex-col justify-between overflow-hidden"
    >
      {/* Starburst Ribbon Badge */}
      {index % 4 === 0 && (
        <div className="absolute top-2.5 left-2.5 z-20 w-11 h-11 rounded-full badge-starburst text-white flex flex-col items-center justify-center text-[7.5px] font-black leading-none text-center p-1 border border-white transform -rotate-12 shadow-md">
          <span>Peşin</span>
          <span className="text-[7px] font-black text-amber-200 mt-0.5">3 Taksit</span>
        </div>
      )}
      {index % 4 === 2 && (
        <div className="absolute top-2.5 left-2.5 z-20 w-11 h-11 rounded-full badge-starburst text-white flex flex-col items-center justify-center text-[7.5px] font-black leading-none text-center p-1 border border-white transform -rotate-12 shadow-md">
          <span>Vade Farksız</span>
          <span className="text-[7px] font-black text-amber-200 mt-0.5">6 Taksit</span>
        </div>
      )}

      {/* Popular Tag Badge */}
      {phone.isPopular && index % 4 !== 0 && index % 4 !== 2 && (
        <div className="absolute top-2.5 left-2.5 z-10 bg-blue-50 text-blue-700 text-[9.5px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1 shadow-2xs">
          <Zap className="w-3 h-3 fill-blue-600 text-blue-600" />
          <span>Popüler</span>
        </div>
      )}

      {/* Compare Quick Action Toggle */}
      <button
        onClick={handleCompareClick}
        className={`absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
          inCompare
            ? 'bg-blue-700 text-white border-blue-600 shadow-xs font-extrabold'
            : 'bg-white/95 text-slate-700 border-slate-200 hover:border-slate-300 shadow-2xs'
        }`}
        title={t.addToCompare}
      >
        {inCompare ? <Check className="w-3 h-3 stroke-[3]" /> : <Scale className="w-3 h-3" />}
        <span className="text-[9px]">{inCompare ? 'Listede' : 'Kıyasla'}</span>
      </button>

      <div>
        {/* Vatan Bilgisayar Ürün Görseli Ölçeği (Height: 180px, Object-Fit: Contain, Margin-Bottom: 10px) */}
        <Link href={`/phones/${phone.slug}`} className="block relative mb-2.5">
          <div className="w-full h-[180px] rounded-lg bg-slate-50/80 border border-slate-100 p-2 flex items-center justify-center overflow-hidden relative group-hover:bg-slate-50 transition-all">
            <img
              src={phone.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'}
              alt={phone.name}
              loading="lazy"
              className="w-full h-[180px] object-contain mb-[10px] group-hover:scale-105 transition-transform duration-200 ease-out drop-shadow-xs"
            />

            {/* Circular Score Badge Overlay */}
            <div className="absolute bottom-2 right-2 z-10 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-lg px-1.5 py-0.5 shadow-xs flex items-center gap-1">
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
        <Link href={`/phones/${phone.slug}`} className="block mb-2">
          <h3 className="text-slate-900 font-bold text-xs leading-snug group-hover:text-blue-700 transition-colors line-clamp-2 min-h-[32px]">
            {phone.name}
          </h3>
        </Link>

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
              <Store className="w-2.5 h-2.5 text-blue-700" /> 8 Mağaza Fiyatı
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

        <Link href={`/phones/${phone.slug}`}>
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
    </div>
  );
}
