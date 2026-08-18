'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getLaptopById } from '@/lib/data';
import { LaptopProduct } from '@/lib/types';
import { StoreTable } from '@/components/detail/StoreTable';
import { PriceHistoryChart } from '@/components/detail/PriceHistoryChart';
import { PriceAlertModal } from '@/components/detail/PriceAlertModal';
import { StickyHeaderBar } from '@/components/detail/StickyHeaderBar';
import { BrandLogoBar } from '@/components/catalog/BrandLogoBar';
import { useCompare } from '@/context/CompareContext';
import { LaptopSpecSheet } from '@/components/detail/LaptopSpecSheet';
import {
  Star,
  Scale,
  Check,
  Bell,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Award
} from 'lucide-react';

export default function LaptopDetailPage() {
  const params = useParams();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();

  const [laptop, setLaptop] = useState<LaptopProduct | null>(null);
  const [alertModalOpen, setAlertModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      getLaptopById(id as string).then((res) => setLaptop(res || null));
    }
  }, [id]);

  if (!laptop) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-slate-900 text-xl font-bold">Laptop bulunamadı</h2>
        <Link href="/laptops" className="text-emerald-600 font-bold text-xs underline">
          Bilgisayar Kataloğuna Dön
        </Link>
      </div>
    );
  }

  const inCompare = isInCompare(laptop.id);
  const score100 = Math.round(laptop.rating * 20);

  return (
    <div className="space-y-8 py-4">
      {/* Sticky Top Header Bar */}
      <StickyHeaderBar phone={laptop} />

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-bold text-slate-500">
        <Link href="/" className="hover:text-emerald-600 transition-colors">Ana Sayfa</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/laptops" className="hover:text-emerald-600 transition-colors">Bilgisayar</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-black truncate max-w-xs">{laptop.name}</span>
      </nav>

      {/* Hero Overview Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Product Image Stage */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-50/80 rounded-3xl p-8 border border-slate-100 relative group">
          <img
            src={laptop.image}
            alt={laptop.name}
            className="max-h-72 object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Info & CTA Panel */}
        <div className="lg:col-span-7 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {laptop.brand} • {laptop.specs?.productType || 'Laptop'}
              </span>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-600" />
                <span>{score100} / 100 Performans Puanı</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {laptop.name}
            </h1>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span>{laptop.rating}</span>
              <span className="text-slate-400">({laptop.reviewCount} kullanıcı değerlendirmesi)</span>
            </div>
          </div>

          {/* Key Specs Summary Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 font-medium block text-[10px] uppercase">İşlemci</span>
              <span className="font-bold text-slate-900 block truncate">{laptop.specs?.processor || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[10px] uppercase">RAM</span>
              <span className="font-bold text-slate-900 block truncate">{laptop.specs?.ramGb} GB RAM</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[10px] uppercase">Depolama</span>
              <span className="font-bold text-slate-900 block truncate">{laptop.specs?.storageGb} GB SSD</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[10px] uppercase">Ekran Kartı</span>
              <span className="font-bold text-slate-900 block truncate">{laptop.specs?.gpu || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[10px] uppercase">Ekran Boyutu</span>
              <span className="font-bold text-slate-900 block truncate">{laptop.specs?.screenSizeInches} inç</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[10px] uppercase">İşletim Sistemi</span>
              <span className="font-bold text-slate-900 block truncate">{laptop.specs?.os || 'FreeDOS'}</span>
            </div>
          </div>

          {/* Pricing & Store CTA Row */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100">
            <div>
              <span className="text-xs text-slate-400 font-bold block">En Düşük Mağaza Fiyatı</span>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                ₺{laptop.basePrice.toLocaleString()},-
              </div>
              <span className="text-[11px] font-bold text-emerald-700 block">8 Mağazada Stokta Mevcut</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setAlertModalOpen(true)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs px-4 py-3 rounded-2xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4 text-slate-600" />
                <span>Fiyat Alarmı Kur</span>
              </button>

              <button
                onClick={() => (inCompare ? removeFromCompare(laptop.id) : addToCompare(laptop))}
                className={`font-black text-xs px-5 py-3 rounded-2xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                  inCompare
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                <Scale className="w-4 h-4 text-emerald-400" />
                <span>{inCompare ? 'Kıyaslamada Eklendi' : '+ Kıyaslamaya Ekle'}</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Detailed Technical Spec Sheet */}
      <LaptopSpecSheet specs={laptop.specs} />

      {/* 8 Retailers Store Offers Table */}
      <section className="space-y-4">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-emerald-600" />
          <span>Canlı Mağaza Fiyat Karşılaştırması ({(laptop.storeOffers || []).length} Mağaza)</span>
        </h2>
        <StoreTable offers={laptop.storeOffers || []} currency="TL" />
      </section>

      {/* Price History Chart */}
      <section className="space-y-4">
        <PriceHistoryChart data={laptop.priceHistory || []} currency="TL" />
      </section>

      {/* Top Brands Logo Bar */}
      <section className="pt-6 border-t border-slate-200">
        <BrandLogoBar />
      </section>

      {/* Price Alert Modal */}
      <PriceAlertModal
        phone={laptop}
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
      />
    </div>
  );
}
