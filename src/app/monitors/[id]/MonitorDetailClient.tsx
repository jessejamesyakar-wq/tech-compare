'use client';

import { ProductJsonLd } from '@/components/seo/ProductJsonLd';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { useCompare } from '@/context/CompareContext';
import { AIPriceForecastBadge } from '@/components/ai/AIPriceForecastBadge';
import { AIReviewSummaryCard } from '@/components/ai/AIReviewSummaryCard';
import { AIUpgradeAdvisor } from '@/components/ai/AIUpgradeAdvisor';
import { TechTermExplainer } from '@/components/ai/TechTermExplainer';
import {
  Sparkles,
  ArrowLeft,
  Scale,
  Check,
  Star,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Truck,
  Award,
  CheckCircle2,
  TrendingDown,
  Monitor,
  Zap
} from 'lucide-react';

export default function MonitorDetailClient({ initialProduct }: { initialProduct: Product | null }) {
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const [selectedImage, setSelectedImage] = useState(0);

  if (!initialProduct) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-black text-slate-900">Ürün Bulunamadı</h2>
        <p className="text-xs text-slate-500">Aradığınız monitör mevcut değil veya kaldırılmış olabilir.</p>
        <Link href="/monitors" className="inline-flex items-center gap-2 bg-emerald-600 text-white text-xs font-bold px-6 py-3 rounded-full">
          <ArrowLeft className="w-4 h-4" />
          <span>Monitörler Sayfasına Dön</span>
        </Link>
      </div>
    );
  }

  const inCompare = isInCompare(initialProduct.id);
  const images = initialProduct.images && initialProduct.images.length > 0 ? initialProduct.images : [initialProduct.image];
  const score100 = initialProduct.epeyScore || Math.round((initialProduct.rating || 4.8) * 20);
  const specs = (initialProduct.specs as Record<string, any>) || {};

  return (
    <div className="space-y-8 pb-16">
      {/* Breadcrumb */}
      <div className="text-xs text-slate-500 font-bold flex items-center gap-1.5">
        <Link href="/" className="hover:text-emerald-600">Ana Sayfa</Link>
        <span>&gt;</span>
        <Link href="/monitors" className="hover:text-emerald-600">Monitörler</Link>
        <span>&gt;</span>
        <span className="text-slate-900 font-black truncate max-w-xs">{initialProduct.name}</span>
      </div>

      {/* Main Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        {/* Left: Gallery (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="w-full h-80 sm:h-96 rounded-2xl bg-slate-50 border border-slate-100 p-6 flex items-center justify-center relative overflow-hidden">
            <Image src={images[selectedImage]} alt={initialProduct.name} width={420} height={420} priority={true} sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 420px" className="max-h-full max-w-full object-contain drop-shadow-md" />

            {/* Score Badge */}
            <div className="absolute top-3 left-3 bg-slate-900 text-white text-xs font-black px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-md">
              <Award className="w-4 h-4 text-amber-400" />
              <span>{score100} / 100 Tech Puanı</span>
            </div>
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-xl border p-1 bg-slate-50 flex items-center justify-center transition-all cursor-pointer ${
                    selectedImage === i ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="max-h-full max-w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Price Offers (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">{initialProduct.brand} Monitör Serisi</span>
              <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{initialProduct.rating}</span>
                <span className="text-slate-400">({initialProduct.reviewCount} kullanıcı incelemesi)</span>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {initialProduct.name}
            </h1>
          </div>

          {/* Highlights */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
            <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Öne Çıkan Özellikler</span>
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(initialProduct.highlights || []).map((h, i) => (
                <li key={i} className="text-xs text-slate-700 font-medium flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Price & Compare Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/50 rounded-2xl border border-emerald-200">
            <div>
              <span className="text-xs text-slate-500 font-bold block">En Düşük Piyasa Fiyatı</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                {initialProduct.basePrice.toLocaleString('tr-TR')} TL
              </span>
            </div>

            <button
              onClick={() => (inCompare ? removeFromCompare(initialProduct.id) : addToCompare(initialProduct))}
              className={`px-6 py-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                inCompare
                  ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {inCompare ? <Check className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
              <span>{inCompare ? 'Kıyaslama Listesinden Çıkar' : 'Karşılaştırma Listesine Ekle'}</span>
            </button>
          </div>

          {/* AI Module 2: AI Price Forecast Badge */}
          <AIPriceForecastBadge product={initialProduct} />

          {/* Store Offers */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>Satıcı ve Mağaza Fiyatları</span>
            </h3>

            <div className="space-y-2">
              {(initialProduct.storeOffers || []).map((offer, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg ${offer.storeLogoColor || 'bg-slate-800'} text-white font-black text-xs flex items-center justify-center`}>
                      {offer.storeName.charAt(0)}
                    </span>
                    <div>
                      <span className="text-xs font-black text-slate-900 block">{offer.storeName}</span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Truck className="w-3 h-3 text-emerald-600" />
                        <span>{offer.shippingDays || 1} günde kargoda • Ücretsiz Kargo</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm sm:text-base font-black text-slate-900">
                      {offer.price.toLocaleString('tr-TR')} TL
                    </span>
                    <a
                      href={offer.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1 shadow-xs"
                    >
                      <span>Mağazaya Git</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Module 3: AI Review Summary Card */}
          <AIReviewSummaryCard product={initialProduct} />

          {/* AI Module 4: AI Upgrade Advisor */}
          <AIUpgradeAdvisor currentProduct={initialProduct} />

          {/* Technical Specs Table */}
          {Object.keys(specs).length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-emerald-600" />
                <span>Detaylı Teknik Özellikler</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.entries(specs).map(([key, val]) => (
                  <div key={key} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex justify-between">
                    <span className="text-slate-500 font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                    <span className="text-slate-900 font-bold text-right">{Array.isArray(val) ? val.join(', ') : String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Module 6: ELI5 Tech Term Explainer */}
          <TechTermExplainer />
        </div>
      </div>
      <ProductJsonLd product={initialProduct as any} />
    </div>
  );
}
