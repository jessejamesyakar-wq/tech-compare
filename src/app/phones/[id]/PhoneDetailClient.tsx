'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { useCompare } from '@/context/CompareContext';
import { Smartphone } from '@/lib/types';
import { StoreTable } from '@/components/detail/StoreTable';
import { PriceHistoryChart } from '@/components/detail/PriceHistoryChart';
import { SpecSheet } from '@/components/detail/SpecSheet';
import { PriceAlertModal } from '@/components/detail/PriceAlertModal';
import { BentoFeatureCards } from '@/components/detail/BentoFeatureCards';
import { StickyHeaderBar } from '@/components/detail/StickyHeaderBar';
import { BrandLogoBar } from '@/components/catalog/BrandLogoBar';
import { ProductImageGallery } from '@/components/detail/ProductImageGallery';
import { CompactStoreComparison } from '@/components/detail/CompactStoreComparison';
import { AIPriceForecastBadge } from '@/components/ai/AIPriceForecastBadge';
import { AIReviewSummaryCard } from '@/components/ai/AIReviewSummaryCard';
import { AIUpgradeAdvisor } from '@/components/ai/AIUpgradeAdvisor';
import { TechTermExplainer } from '@/components/ai/TechTermExplainer';
import {
  Star,
  Scale,
  Check,
  Bell,
  ChevronRight,
  Sparkles,
  Zap,
  ShoppingBag,
  Award
} from 'lucide-react';

export default function PhoneDetailClient({ initialPhone }: { initialPhone: Smartphone | null }) {
  const { t } = useI18n();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();

  const [phone] = useState<Smartphone | null>(initialPhone);
  const [alertModalOpen, setAlertModalOpen] = useState<boolean>(false);

  if (!phone) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-slate-900 text-xl font-bold">Ürün bulunamadı</h2>
        <Link href="/phones" className="text-emerald-600 font-bold text-xs underline">
          Kataloğa Dön
        </Link>
      </div>
    );
  }

  const inCompare = isInCompare(phone.id);
  const score100 = Math.round(phone.rating * 20);

  return (
    <div className="space-y-12 py-4">
      
      {/* Sticky Top Bar when scrolling */}
      <StickyHeaderBar phone={phone} />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-900 transition-colors">{t.navHome}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/phones" className="hover:text-slate-900 transition-colors">{t.smartphones}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-emerald-600 font-bold">{phone.name}</span>
      </div>

      {/* Hero Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 shadow-xs">
        
        {/* Left: Interactive Multi-Photo Gallery Stage */}
        <div className="lg:col-span-5">
          <ProductImageGallery product={phone} />
        </div>

        {/* Right: Info & Actions */}
        <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-bold text-slate-500 uppercase tracking-widest text-xs">
                {phone.brand} • {phone.releaseYear}
              </span>

              <div className="flex items-center gap-2">
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>{score100} / 100 Puan</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-slate-900 text-sm">{phone.rating}</span>
                  <span className="text-slate-400 text-xs">({phone.reviewCount})</span>
                </div>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-4">
              {phone.name}
            </h1>

            {/* Highlights Chips */}
            <div className="flex flex-wrap gap-2 mb-6">
              {(phone.highlights || []).map((h, idx) => (
                <span key={idx} className="bg-slate-50 text-slate-700 text-xs px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{h}</span>
                </span>
              ))}
            </div>

            {/* Base Lowest Price Box */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-500 block">{t.startingFrom}</span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-600">
                  {phone.basePrice > 0 ? `${phone.basePrice.toLocaleString()} ${phone.currency}` : 'Fiyat Güncelleniyor'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Price Alert Button */}
                <button
                  onClick={() => setAlertModalOpen(true)}
                  className="flex-1 sm:flex-initial bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-4 py-3 rounded-xl border border-emerald-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Bell className="w-4 h-4 text-emerald-600" />
                  <span>{t.setPriceAlert}</span>
                </button>

                {/* Compare Toggle Button */}
                <button
                  onClick={() => (inCompare ? removeFromCompare(phone.id) : addToCompare(phone))}
                  className={`flex-1 sm:flex-initial px-4 py-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    inCompare
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm font-bold'
                      : 'bg-slate-100 text-slate-900 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <Scale className="w-4 h-4" />
                  <span>{inCompare ? t.inCompareList : t.addToCompare}</span>
                </button>
              </div>
            </div>

            {/* Store Comparison Snapshot in Hero */}
            <CompactStoreComparison
              offers={phone.storeOffers}
              basePrice={phone.basePrice}
              currency={phone.currency}
            />

            {/* AI Module 2: AI Price Forecast Badge */}
            <AIPriceForecastBadge product={phone} />

          </div>

          {/* Quick Specs Bar */}
          <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-100 text-center text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Ekran</span>
              <span className="text-slate-900 font-bold">{phone.specs?.screen?.size || '6.7 inç'}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block">RAM</span>
              <span className="text-slate-900 font-bold">{phone.specs?.memory?.ramGb ? `${phone.specs.memory.ramGb} GB` : '12 GB'}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block">AnTuTu</span>
              <span className="text-emerald-600 font-bold">{(((phone.specs?.processor?.antutuScore || 1800000)) / 1000).toFixed(0)}k</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Batarya</span>
              <span className="text-slate-900 font-bold">{phone.specs?.battery?.capacitymAh ? `${phone.specs.battery.capacitymAh} mAh` : '5000 mAh'}</span>
            </div>
          </div>

        </div>

      </div>

      {/* Showcase Cards */}
      <BentoFeatureCards phone={phone} />

      {/* AI Module 3: AI Review Summary Card */}
      <AIReviewSummaryCard product={phone} />

      {/* AI Module 4: AI Upgrade Advisor */}
      <AIUpgradeAdvisor currentProduct={phone} />

      {/* Store Comparison Table (Full View) */}
      <div id="store-section">
        <StoreTable offers={phone.storeOffers} currency={phone.currency} />
      </div>

      {/* 6-Month Price History Chart */}
      <PriceHistoryChart data={phone.priceHistory} currency={phone.currency} />

      {/* Technical Specs Breakdown */}
      <div className="space-y-4">
        <h2 className="text-slate-900 text-xl font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <span>Tüm Teknik Özellikler</span>
        </h2>
        <SpecSheet specs={phone.specs} />
      </div>

      {/* AI Module 6: ELI5 Tech Term Explainer */}
      <TechTermExplainer />

      {/* Brand Logos Bar */}
      <div className="pt-8 border-t border-slate-200">
        <BrandLogoBar />
      </div>

      {/* Price Alert Subscription Modal */}
      <PriceAlertModal
        phone={phone}
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
            name: phone.name,
            image: [phone.image, ...(phone.images || [])],
            description: (phone.highlights || []).join('. '),
            brand: {
              '@type': 'Brand',
              name: phone.brand
            },
            offers: {
              '@type': 'AggregateOffer',
              priceCurrency: phone.currency || 'TL',
              lowPrice: phone.basePrice,
              offerCount: phone.storeOffers?.length || 8
            }
          })
        }}
      />

    </div>
  );
}
