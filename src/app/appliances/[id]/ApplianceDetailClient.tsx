'use client';

import { ProductJsonLd } from '@/components/seo/ProductJsonLd';
import React, { useState } from 'react';
import Link from 'next/link';
import { ApplianceProduct } from '@/lib/types';
import { StoreTable } from '@/components/detail/StoreTable';
import { PriceHistoryChart } from '@/components/detail/PriceHistoryChart';
import { PriceAlertModal } from '@/components/detail/PriceAlertModal';
import { StickyHeaderBar } from '@/components/detail/StickyHeaderBar';
import { useCompare } from '@/context/CompareContext';
import {
  Star,
  Scale,
  Check,
  Bell,
  Sparkles,
  Award,
  Zap,
  ShieldCheck,
  TrendingDown,
  Clock,
  Gauge,
  Volume2,
  PlugZap,
  Layers
} from 'lucide-react';

export default function ApplianceDetailClient({ initialApplianceProduct }: { initialApplianceProduct: ApplianceProduct | null }) {
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();

  const [product] = useState<ApplianceProduct | null>(initialApplianceProduct);
  const [alertModalOpen, setAlertModalOpen] = useState<boolean>(false);

  if (!product) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-slate-900 text-xl font-bold">Ürün bulunamadı</h2>
        <Link href="/appliances" className="text-emerald-600 font-bold text-xs underline">
          Ev ve Yaşam Teknolojileri Kataloğuna Dön
        </Link>
      </div>
    );
  }

  const inCompare = isInCompare(product.id);
  const score100 = Math.round(product.rating * 20);

  return (
    <div className="space-y-8 py-4">
      {/* Sticky Header Bar */}
      <StickyHeaderBar phone={product} />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-bold text-slate-500">
        <Link href="/" className="hover:text-emerald-600 transition-colors">Ana Sayfa</Link>
        <span>&gt;</span>
        <Link href="/appliances" className="hover:text-emerald-600 transition-colors">Ev ve Yaşam Teknolojileri</Link>
        <span>&gt;</span>
        <span className="text-slate-800">{product.brand}</span>
        <span>&gt;</span>
        <span className="text-slate-900 font-black line-clamp-1">{product.name}</span>
      </nav>

      {/* Main Product Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Product Image */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full aspect-4/3 max-h-[380px] bg-slate-50 rounded-2xl p-6 flex items-center justify-center border border-slate-100 overflow-hidden shadow-2xs">
              <img
                src={product.image}
                alt={product.name}
                className="max-h-[300px] w-auto object-contain hover:scale-105 transition-transform duration-300 drop-shadow-sm"
              />
              <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-xs">
                {product.specs.subCategoryLabel}
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-3 text-xs text-slate-500 font-semibold">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {product.specs.warrantyYears || 2} Yıl Resmi Garanti
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Orijinal Türkiye Ürünü
              </span>
            </div>
          </div>

          {/* Right: Product Info & Highlights */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-black bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  {product.brand}
                </span>
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.rating}</span>
                  <span className="text-slate-400 font-normal">({product.reviewCount} Değerlendirme)</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Price & Score Highlight Card */}
            <div className="bg-gradient-to-br from-emerald-50/70 via-slate-50 to-teal-50/50 border border-emerald-100/80 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
                  En Düşük Piyasa Fiyatı
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {(product.basePrice || product.minPrice || 0).toLocaleString('tr-TR')}
                  </span>
                  <span className="text-base font-bold text-emerald-700">TL</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  4 Mağazada Canlı Fiyat Karşılaştırması
                </span>
              </div>

              {/* Quality Score */}
              <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-emerald-200/80 shadow-2xs">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tech Puanı</span>
                  <span className="text-lg font-black text-emerald-700">{score100} / 100</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  <Award className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Key Highlights */}
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Öne Çıkan Özellikler
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(product.highlights || []).map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs font-medium text-slate-700 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                    <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => (inCompare ? removeFromCompare(product.id) : addToCompare(product))}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs shadow-xs transition-all cursor-pointer ${
                  inCompare
                    ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                <Scale className="w-4 h-4" />
                <span>{inCompare ? 'Karşılaştırma Listesinde' : 'Karşılaştırmaya Ekle'}</span>
              </button>

              <button
                onClick={() => setAlertModalOpen(true)}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 shadow-2xs transition-all cursor-pointer"
              >
                <Bell className="w-4 h-4 text-emerald-600" />
                <span>Fiyat Alarmı Kur</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Specifications Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <Layers className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Teknik Özellikler Tablosu</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {product.specs.powerWatts && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
              <PlugZap className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Motor / Güç</span>
                <span className="text-xs font-black text-slate-900">{product.specs.powerWatts} Watt</span>
              </div>
            </div>
          )}

          {product.specs.capacity && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
              <Layers className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kapasite / Hacim</span>
                <span className="text-xs font-black text-slate-900">{product.specs.capacity}</span>
              </div>
            </div>
          )}

          {product.specs.capacityLiters && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
              <Layers className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Net İç Hacim</span>
                <span className="text-xs font-black text-slate-900">{product.specs.capacityLiters} Litre</span>
              </div>
            </div>
          )}

          {product.specs.energyClass && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Enerji Sınıfı</span>
                <span className="text-xs font-black text-emerald-700">{product.specs.energyClass} Sınıfı</span>
              </div>
            </div>
          )}

          {product.specs.volumeLiters && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
              <Layers className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Net Hacim</span>
                <span className="text-xs font-black text-slate-900">{product.specs.volumeLiters} Litre</span>
              </div>
            </div>
          )}

          {product.specs.capacityKg && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
              <Layers className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kapasite</span>
                <span className="text-xs font-black text-slate-900">{product.specs.capacityKg} kg</span>
              </div>
            </div>
          )}

          {product.specs.spinSpeedRpm && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
              <Gauge className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sıkma Hızı</span>
                <span className="text-xs font-black text-slate-900">{product.specs.spinSpeedRpm} Devir / Dakika</span>
              </div>
            </div>
          )}

          {product.specs.btuCapacity && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
              <Zap className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Klima Kapasitesi</span>
                <span className="text-xs font-black text-slate-900">{product.specs.btuCapacity.toLocaleString('tr-TR')} BTU/h</span>
              </div>
            </div>
          )}

          {product.specs.placeSettings && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
              <Layers className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Yıkama Kapasitesi</span>
                <span className="text-xs font-black text-slate-900">{product.specs.placeSettings} Kişilik Yemek Takımı</span>
              </div>
            </div>
          )}

          {product.specs.drawerCount && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
              <Layers className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bölme Düzeni</span>
                <span className="text-xs font-black text-slate-900">{product.specs.drawerCount} Çekmeceli</span>
              </div>
            </div>
          )}

          {product.specs.motorType && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
              <PlugZap className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Motor Teknolojisi</span>
                <span className="text-xs font-black text-slate-900">{product.specs.motorType}</span>
              </div>
            </div>
          )}

          {product.specs.noiseDb && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ses Seviyesi</span>
                <span className="text-xs font-black text-slate-900">{product.specs.noiseDb} dB</span>
              </div>
            </div>
          )}

          {product.specs.refrigeratorType && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
              <Layers className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dolap Tipi</span>
                <span className="text-xs font-black text-slate-900">{product.specs.refrigeratorType}</span>
              </div>
            </div>
          )}

          {product.specs.color && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Renk & Kaplama</span>
                <span className="text-xs font-black text-slate-900">{product.specs.color}</span>
              </div>
            </div>
          )}

          {product.specs.suctionPowerPa && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
              <Gauge className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Emiş Gücü</span>
                <span className="text-xs font-black text-slate-900">{product.specs.suctionPowerPa.toLocaleString('tr-TR')} Pa</span>
              </div>
            </div>
          )}

          {product.specs.batteryRuntimeMin && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
              <Clock className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Çalışma Süresi</span>
                <span className="text-xs font-black text-slate-900">{product.specs.batteryRuntimeMin} Dakika</span>
              </div>
            </div>
          )}

          {product.specs.noiseLevelDb && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ses Seviyesi</span>
                <span className="text-xs font-black text-slate-900">{product.specs.noiseLevelDb} dB</span>
              </div>
            </div>
          )}

          {product.specs.pressureBar && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
              <Gauge className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pompa Basıncı</span>
                <span className="text-xs font-black text-slate-900">{product.specs.pressureBar} Bar</span>
              </div>
            </div>
          )}

          {product.specs.steamOutputGpm && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Şok Buhar Gücü</span>
                <span className="text-xs font-black text-slate-900">{product.specs.steamOutputGpm} g/dk</span>
              </div>
            </div>
          )}

          {product.specs.material && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gövde Malzemesi</span>
                <span className="text-xs font-black text-slate-900">{product.specs.material}</span>
              </div>
            </div>
          )}

          {product.specs.warrantyYears && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
              <Check className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Garanti Süresi</span>
                <span className="text-xs font-black text-slate-900">{product.specs.warrantyYears} Yıl Resmi Distribütör</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stores Price Comparison Table */}
      <StoreTable offers={product.storeOffers} currency={product.currency || 'TL'} />

      {/* 6-Month Price History Chart */}
      <PriceHistoryChart data={product.priceHistory} currency={product.currency || 'TL'} />

      {/* Price Alert Modal */}
      <PriceAlertModal
        phone={product as any}
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
      />
      <ProductJsonLd product={product as any} />
    </div>
  );
}
