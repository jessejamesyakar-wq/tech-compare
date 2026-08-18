'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getTVById } from '@/lib/data';
import { TVProduct } from '@/lib/types';
import { useCompare } from '@/context/CompareContext';
import { StoreTable } from '@/components/detail/StoreTable';
import { PriceHistoryChart } from '@/components/detail/PriceHistoryChart';
import { CompactStoreComparison } from '@/components/detail/CompactStoreComparison';
import { ProductImageGallery } from '@/components/detail/ProductImageGallery';
import { StickyHeaderBar } from '@/components/detail/StickyHeaderBar';
import { PriceAlertModal } from '@/components/detail/PriceAlertModal';
import { BrandLogoBar } from '@/components/catalog/BrandLogoBar';
import { TVSpecSheet } from '@/components/detail/TVSpecSheet';
import { TVScoreBreakdown } from '@/components/detail/TVScoreBreakdown';
import { calculateTVScore } from '@/lib/tvScoring';
import {
  Tv,
  Star,
  Scale,
  Check,
  Bell,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Gamepad2,
  Volume2,
  Tv2,
  Award
} from 'lucide-react';

export default function TVDetailPage() {
  const params = useParams();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();

  const [tv, setTv] = useState<TVProduct | null>(null);
  const [alertModalOpen, setAlertModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      getTVById(id as string).then((res) => setTv(res || null));
    }
  }, [id]);

  if (!tv) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-slate-900 text-xl font-bold">Televizyon bulunamadı</h2>
        <Link href="/tvs" className="text-emerald-600 font-bold text-xs underline">
          Televizyon Kataloğuna Dön
        </Link>
      </div>
    );
  }

  const inCompare = isInCompare(tv.id);
  const score100 = calculateTVScore(tv).totalScore;

  return (
    <div className="space-y-12 py-4">
      {/* Sticky Top Bar when scrolling */}
      <StickyHeaderBar phone={tv} />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-900 transition-colors">Ana Sayfa</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/tvs" className="hover:text-slate-900 transition-colors">Televizyonlar</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-emerald-600 font-bold">{tv.name}</span>
      </div>

      {/* Hero Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 shadow-xs">
        
        {/* Left: Interactive Multi-Photo Gallery Stage */}
        <div className="lg:col-span-5">
          <ProductImageGallery product={tv} />
        </div>

        {/* Right: Info & Actions */}
        <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-extrabold text-slate-500 uppercase tracking-widest text-xs">
                {tv.brand} • {tv.releaseYear}
              </span>

              <div className="flex items-center gap-2">
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>{score100} / 100 Puan</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-slate-900 text-sm">{tv.rating}</span>
                  <span className="text-slate-400 text-xs">({tv.reviewCount})</span>
                </div>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-4">
              {tv.name}
            </h1>

            {/* Highlights Chips */}
            <div className="flex flex-wrap gap-2 mb-6">
              {tv.highlights.map((h, idx) => (
                <span key={idx} className="bg-slate-50 text-slate-700 text-xs px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{h}</span>
                </span>
              ))}
            </div>

            {/* Base Lowest Price Box */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-500 block">Başlangıç Fiyatı</span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-600">
                  {tv.basePrice > 0 ? `${tv.basePrice.toLocaleString()} ₺` : 'Fiyat Güncelleniyor'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Price Alert Button */}
                <button
                  onClick={() => setAlertModalOpen(true)}
                  className="flex-1 sm:flex-initial bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-4 py-3 rounded-xl border border-emerald-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Bell className="w-4 h-4 text-emerald-600" />
                  <span>Fiyat Alarmı Kur</span>
                </button>

                {/* Compare Toggle Button */}
                <button
                  onClick={() => (inCompare ? removeFromCompare(tv.id) : addToCompare(tv))}
                  className={`flex-1 sm:flex-initial px-4 py-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    inCompare
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm font-bold'
                      : 'bg-slate-100 text-slate-900 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <Scale className="w-4 h-4" />
                  <span>{inCompare ? 'Karşılaştırma Listesinde' : 'Karşılaştırmaya Ekle'}</span>
                </button>
              </div>
            </div>

            {/* Store Price Comparison Box */}
            <CompactStoreComparison
              offers={tv.storeOffers}
              basePrice={tv.basePrice}
              currency={tv.currency}
            />

          </div>

          {/* Quick Specs Bar */}
          <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-100 text-center text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Ekran Boyutu</span>
              <span className="text-slate-900 font-bold">{tv.specs.screenSizeInches} inç</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Panel Tipi</span>
              <span className="text-slate-900 font-bold">{tv.specs.displayTech}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Yenileme Hızı</span>
              <span className="text-emerald-600 font-bold">{tv.specs.refreshRateHz} Hz</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Akıllı İşletim</span>
              <span className="text-slate-900 font-bold">{tv.specs.smartOs}</span>
            </div>
          </div>

        </div>

      </div>

      {/* 📊 Dedicated 100-Point TV Performance Score Breakdown Component */}
      <TVScoreBreakdown tv={tv} />

      {/* TV Specific Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
            <Tv2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Ekran ve Görüntü Teknolojisi</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {tv.specs.screenSizeInches} inç {tv.specs.displayTech} paneli, {tv.specs.resolution} çözünürlük ve {tv.specs.refreshRateHz}Hz yenileme hızı.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-2">
            {tv.specs.hdrSupport.map((hdr, idx) => (
              <span key={idx} className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded">
                {hdr}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Oyun & HDMI 2.1 Performansı</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {tv.specs.hdmiPorts} adet HDMI girişi ile PlayStation 5 / Xbox Series X konsolları için mükemmel oyun desteği.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-2">
            {tv.specs.gamingFeatures.map((gf, idx) => (
              <span key={idx} className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded">
                {gf}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
            <Volume2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Ses Gücü & Akıllı İşletim Sistemi</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {tv.specs.audioPowerWatts} Watt yüksek ses çıkışı ve {tv.specs.smartOs} akıllı TV işletim sistemi entegrasyonu.
          </p>
          <div className="bg-slate-50 p-2 rounded-xl text-xs font-bold text-slate-700 flex justify-between">
            <span>Enerji Sınıfı:</span>
            <span className="text-emerald-600 font-extrabold">{tv.specs.energyClass}</span>
          </div>
        </div>
      </div>

      {/* Store Comparison Table (8 Stores) */}
      <StoreTable offers={tv.storeOffers} currency={tv.currency} />

      {/* 6-Month Price History Chart */}
      <PriceHistoryChart data={tv.priceHistory} currency={tv.currency} />

      {/* Exhaustive Technical Specifications Table */}
      <div className="space-y-4">
        <h2 className="text-slate-900 text-xl font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <span>Tüm Detaylı Teknik Özellikler</span>
        </h2>
        <TVSpecSheet specs={tv.specs} />
      </div>

      {/* Brand Logos Bar */}
      <div className="pt-8 border-t border-slate-200">
        <BrandLogoBar />
      </div>

      {/* Price Alert Subscription Modal */}
      <PriceAlertModal
        phone={tv}
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
      />

      {/* Schema.org Product Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org/',
            '@type': 'Product',
            name: tv.name,
            image: [tv.image, ...(tv.images || [])],
            description: tv.highlights.join('. '),
            brand: {
              '@type': 'Brand',
              name: tv.brand
            },
            offers: {
              '@type': 'AggregateOffer',
              priceCurrency: tv.currency || 'TL',
              lowPrice: tv.basePrice,
              offerCount: tv.storeOffers?.length || 8
            }
          })
        }}
      />

    </div>
  );
}
