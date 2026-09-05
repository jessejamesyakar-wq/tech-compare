'use client';

import { ProductJsonLd } from '@/components/seo/ProductJsonLd';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Product } from '@/lib/types';
import { resolveActiveColor } from '@/lib/colorVariantHelper';
import { StoreTable } from '@/components/detail/StoreTable';
import { StickyHeaderBar } from '@/components/detail/StickyHeaderBar';
import { ProductImageGallery } from '@/components/detail/ProductImageGallery';
import { ProductColorPicker } from '@/components/detail/ProductColorPicker';
import { useCompare } from '@/context/CompareContext';

const PriceHistoryChart = dynamic(() => import('@/components/detail/PriceHistoryChart').then(m => m.PriceHistoryChart), { loading: () => <div className="h-64 bg-slate-50 rounded-3xl animate-pulse" /> });
const PriceAlertModal = dynamic(() => import('@/components/detail/PriceAlertModal').then(m => m.PriceAlertModal), { ssr: false });

import {
  Star,
  Scale,
  Check,
  Bell,
  Sparkles,
  ShieldCheck,
  Tablet,
  ChevronRight
} from 'lucide-react';

export default function TabletsDetailClient({ initialProduct }: { initialProduct: Product | null }) {
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const searchParams = useSearchParams();

  const [product] = useState<Product | null>(initialProduct);
  const [alertModalOpen, setAlertModalOpen] = useState<boolean>(false);

  const colorParam = searchParams.get('color');
  const variantIdParam = searchParams.get('variantId');

  const initialResolved = resolveActiveColor(initialProduct || ({} as any), colorParam, variantIdParam);
  const [selectedColor, setSelectedColor] = useState<string>(initialResolved.selectedColor);
  const [selectedColorImage, setSelectedColorImage] = useState<string>(initialResolved.selectedColorImage);
  const [selectedColorImages, setSelectedColorImages] = useState<string[]>(initialResolved.selectedColorImages);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(initialResolved.selectedVariantId);

  useEffect(() => {
    if (product) {
      const resolved = resolveActiveColor(product, colorParam, variantIdParam);
      if (resolved.selectedColor) {
        setSelectedColor(resolved.selectedColor);
        setSelectedColorImage(resolved.selectedColorImage);
        setSelectedColorImages(resolved.selectedColorImages);
        setSelectedVariantId(resolved.selectedVariantId);
      }
    }
  }, [colorParam, variantIdParam, product]);

  const handleSelectColor = (
    colorName: string,
    colorImg?: string,
    colorImages?: string[],
    variantId?: string
  ) => {
    setSelectedColor(colorName);
    if (colorImg) setSelectedColorImage(colorImg);
    if (colorImages && colorImages.length > 0) {
      setSelectedColorImages(colorImages);
    } else if (colorImg) {
      setSelectedColorImages([colorImg]);
    }
    setSelectedVariantId(variantId);

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('color', colorName);
      if (variantId) {
        url.searchParams.set('variantId', variantId);
      } else {
        url.searchParams.delete('variantId');
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

  if (!product) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-slate-900 text-xl font-bold">Ürün bulunamadı</h2>
        <Link href="/tablets" className="text-emerald-600 font-bold text-xs underline">
          Tabletler Kataloğuna Dön
        </Link>
      </div>
    );
  }

  const inCompare = isInCompare(product.id);
  const specs = (product.specs as Record<string, string>) || {};

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-4">
      <StickyHeaderBar phone={product} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto py-1">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Ana Sayfa</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <Link href="/tablets" className="hover:text-emerald-600 transition-colors">Tabletler</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-900 font-bold truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <ProductImageGallery
              product={product}
              activeColorImage={selectedColorImage}
              activeColorImages={selectedColorImages}
            />
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {product.brand}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 text-xs pt-1">
                <div className="flex items-center gap-1 font-bold text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-slate-900">{product.rating}</span>
                  <span className="text-slate-400">({product.reviewCount} inceleme)</span>
                </div>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500 font-semibold">{product.releaseYear} Modeli</span>
              </div>
            </div>

            {/* Interactive Color Variant Picker */}
            {(product.colorOptions || product.variants) && (
              <ProductColorPicker
                product={product}
                selectedColor={selectedColor}
                onSelectColor={handleSelectColor}
              />
            )}

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-medium">En Düşük Piyasa Fiyatı</div>
                  <div className="text-3xl font-black tracking-tight text-emerald-400">
                    {product.basePrice.toLocaleString()} {product.currency}
                  </div>
                </div>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Resmi Distribütör
                </span>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setAlertModalOpen(true)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Bell className="w-4 h-4 text-amber-400" />
                  <span>Fiyat Alarmı Kur</span>
                </button>
                <button
                  onClick={() => (inCompare ? removeFromCompare(product.id) : addToCompare(product))}
                  className={`flex-1 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    inCompare
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }`}
                >
                  <Scale className="w-4 h-4" />
                  <span>{inCompare ? 'Karşılaştırmada' : 'Karşılaştır'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Öne Çıkan Özellikler</h3>
              <div className="grid grid-cols-2 gap-2">
                {(product.highlights || []).map((highlight, index) => (
                  <div key={index} className="flex items-start gap-2 bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs font-semibold text-slate-700">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Store Comparison Table */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span>Fiyat Karşılaştırması & Satıcılar</span>
          </h2>
          <StoreTable offers={product.storeOffers} currency={product.currency} product={product} />
        </div>

        {/* 6-Month Price History Chart */}
        <PriceHistoryChart data={product.priceHistory} currency={product.currency} product={product} />

        {/* Technical Specs Breakdown */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-4">
            <Tablet className="w-5 h-5 text-emerald-600" />
            <span>Teknik Özellikler</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(specs).map(([key, value]) => {
              if (!value || typeof value === 'object') return null;
              return (
                <div key={key} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{key}</span>
                  <span className="text-xs font-black text-slate-900">{String(value)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <PriceAlertModal
        phone={product as any}
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
      />

      <ProductJsonLd product={product as any} />
    </div>
  );
}
