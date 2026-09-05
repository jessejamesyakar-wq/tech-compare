'use client';

import { ProductJsonLd } from '@/components/seo/ProductJsonLd';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LaptopProduct } from '@/lib/types';
import { resolveActiveColor } from '@/lib/colorVariantHelper';
import { StoreTable } from '@/components/detail/StoreTable';
import { StickyHeaderBar } from '@/components/detail/StickyHeaderBar';
import { ProductImageGallery } from '@/components/detail/ProductImageGallery';
import { ProductColorPicker } from '@/components/detail/ProductColorPicker';
import { useCompare } from '@/context/CompareContext';

const PriceHistoryChart = dynamic(() => import('@/components/detail/PriceHistoryChart').then(m => m.PriceHistoryChart), { loading: () => <div className="h-64 bg-slate-50 rounded-3xl animate-pulse" /> });
const PriceAlertModal = dynamic(() => import('@/components/detail/PriceAlertModal').then(m => m.PriceAlertModal), { ssr: false });
const BrandLogoBar = dynamic(() => import('@/components/catalog/BrandLogoBar').then(m => m.BrandLogoBar));
const LaptopSpecSheet = dynamic(() => import('@/components/detail/LaptopSpecSheet').then(m => m.LaptopSpecSheet), { loading: () => <div className="h-64 bg-slate-50 rounded-3xl animate-pulse" /> });

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

export default function LaptopDetailClient({ initialLaptopProduct }: { initialLaptopProduct: LaptopProduct | null }) {
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const searchParams = useSearchParams();

  const [laptop] = useState<LaptopProduct | null>(initialLaptopProduct);
  const [alertModalOpen, setAlertModalOpen] = useState<boolean>(false);

  const colorParam = searchParams.get('color');
  const variantIdParam = searchParams.get('variantId');

  const initialResolved = resolveActiveColor(initialLaptopProduct || ({} as any), colorParam, variantIdParam);
  const [selectedColor, setSelectedColor] = useState<string>(initialResolved.selectedColor);
  const [selectedColorImage, setSelectedColorImage] = useState<string>(initialResolved.selectedColorImage);
  const [selectedColorImages, setSelectedColorImages] = useState<string[]>(initialResolved.selectedColorImages);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(initialResolved.selectedVariantId);

  useEffect(() => {
    if (laptop) {
      const resolved = resolveActiveColor(laptop, colorParam, variantIdParam);
      if (resolved.selectedColor) {
        setSelectedColor(resolved.selectedColor);
        setSelectedColorImage(resolved.selectedColorImage);
        setSelectedColorImages(resolved.selectedColorImages);
        setSelectedVariantId(resolved.selectedVariantId);
      }
    }
  }, [colorParam, variantIdParam, laptop]);

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
        
        {/* Left: Interactive Multi-Photo Gallery Stage (Strict 500x500 Square) */}
        <div className="lg:col-span-5">
          <ProductImageGallery
            product={laptop}
            activeColorImage={selectedColorImage}
            activeColorImages={selectedColorImages}
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

          {/* Interactive Color Variant Picker */}
          {(laptop.colorOptions || laptop.variants) && (
            <ProductColorPicker
              product={laptop}
              selectedColor={selectedColor}
              onSelectColor={handleSelectColor}
            />
          )}

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
                <span>Fiyat Alarmı</span>
              </button>

              <button
                onClick={() => (inCompare ? removeFromCompare(laptop.id) : addToCompare(laptop))}
                className={`font-extrabold text-xs px-5 py-3 rounded-2xl flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer ${
                  inCompare
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <Scale className="w-4 h-4" />
                <span>{inCompare ? 'Listede' : 'Karşılaştır'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Store Offers Comparison Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-emerald-600" />
          <span>Mağaza Fiyat Karşılaştırması</span>
        </h2>
        <StoreTable offers={laptop.storeOffers} currency={laptop.currency} product={laptop} />
      </div>

      {/* Price History Section */}
      <PriceHistoryChart data={laptop.priceHistory} currency={laptop.currency} product={laptop} />

      {/* Comprehensive Spec Sheet */}
      <LaptopSpecSheet specs={laptop.specs} />

      {/* Price Alert Modal */}
      <PriceAlertModal
        phone={laptop as any}
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
      />

      <ProductJsonLd product={laptop as any} />
    </div>
  );
}
