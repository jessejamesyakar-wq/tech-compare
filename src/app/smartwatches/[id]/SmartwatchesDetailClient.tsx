'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
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
  ShieldCheck,
  Watch,
  ChevronRight
} from 'lucide-react';

export default function SmartwatchesDetailClient({ initialProduct }: { initialProduct: Product | null }) {
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();

  const [product] = useState<Product | null>(initialProduct);
  const [alertModalOpen, setAlertModalOpen] = useState<boolean>(false);

  if (!product) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-slate-900 text-xl font-bold">Ürün bulunamadı</h2>
        <Link href="/smartwatches" className="text-emerald-600 font-bold text-xs underline">
          Akıllı Saatler Kataloğuna Dön
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
          <Link href="/smartwatches" className="hover:text-emerald-600 transition-colors">Akıllı Saatler</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-900 font-bold truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 flex items-center justify-center min-h-[380px] shadow-sm">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-[340px] w-auto object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="lg:col-span-6 space-y-6">
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
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-white/10"
                >
                  <Bell className="w-4 h-4 text-amber-400" />
                  Fiyat Alarmı Kur
                </button>
                <button
                  onClick={() => (inCompare ? removeFromCompare(product.id) : addToCompare(product))}
                  className={`flex-1 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors ${
                    inCompare ? 'bg-emerald-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }`}
                >
                  <Scale className="w-4 h-4" />
                  {inCompare ? 'Karşılaştırmada' : 'Karşılaştır'}
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Öne Çıkan Özellikler
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                {(product.highlights || []).map((h, i) => (
                  <li key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {Object.keys(specs).length > 0 && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Watch className="w-5 h-5 text-emerald-600" />
              Teknik Özellikler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {Object.entries(specs).map(([key, val]) => (
                <div key={key} className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-500 capitalize">{key}:</span>
                  <span className="font-bold text-slate-900 text-right">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <StoreTable offers={product.storeOffers} currency={product.currency}  product={product} />
        <PriceHistoryChart data={product.priceHistory} currency={product.currency} />
      </div>

      <PriceAlertModal
        phone={product}
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
      />
    </div>
  );
}
