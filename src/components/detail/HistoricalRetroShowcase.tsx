'use client';

import React from 'react';
import Link from 'next/link';
import {
  History,
  Archive,
  Sparkles,
  Calendar,
  Layers,
  Award,
  ArrowRight,
  ShieldAlert,
  Cpu,
  Smartphone,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { ProductLike, getHistoricalRetroContext, getProductReleaseYear } from '@/lib/releaseYearFilter';

interface HistoricalRetroShowcaseProps {
  product: ProductLike;
  compact?: boolean;
}

export function HistoricalRetroShowcase({ product, compact = false }: HistoricalRetroShowcaseProps) {
  const context = getHistoricalRetroContext(product);
  const releaseYear = getProductReleaseYear(product) || context.releaseYear;

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-amber-50/90 via-slate-50 to-amber-100/40 border border-amber-300/80 rounded-2xl p-4 space-y-3 shadow-xs my-4 relative overflow-hidden">
        {/* Retro Ambient Accent */}
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-amber-200/80 pb-2.5 relative z-10">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-amber-700" />
            <h3 className="text-slate-900 text-xs font-black uppercase tracking-wider">
              Nostalji & Tarihi Model Arşivi
            </h3>
          </div>

          <span className="bg-amber-200/80 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1 shadow-2xs">
            <Calendar className="w-3 h-3 text-amber-800" />
            <span>{releaseYear} KLASİK</span>
          </span>
        </div>

        <div className="space-y-2 relative z-10 text-xs">
          <div className="flex items-start gap-2.5 bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-amber-200/70">
            <History className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-slate-900 text-xs">{context.eraTitle}</p>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{context.eraDescription}</p>
            </div>
          </div>

          <div className="bg-amber-100/60 text-amber-950 p-2.5 rounded-xl border border-amber-200/80 text-[11px] font-medium leading-relaxed">
            <span className="font-bold">🏛️ Arşiv Statüsü: </span>
            {context.availabilityNotice}
          </div>
        </div>

        <div className="pt-1 flex items-center justify-between relative z-10">
          <Link
            href="/phones"
            className="inline-flex items-center gap-1.5 text-amber-800 hover:text-amber-950 font-black text-[11px] transition-colors"
          >
            <span>Güncel {product.brand} Modellerini İncele</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white via-amber-50/40 to-slate-50 border border-amber-300/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md my-6 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badge & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/80 pb-5 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 text-[11px] font-black px-3 py-1 rounded-full border border-amber-300 mb-2 shadow-2xs">
            <Archive className="w-3.5 h-3.5 text-amber-700" />
            <span>TARİHİ & NOSTALJİK TEKNOLOJİ ARŞİVİ</span>
          </div>
          <h3 className="text-slate-900 text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-amber-700" />
            <span>{product.name} — Dönem & Tarihçe Analizi</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            2018 öncesi tarihi modeller, canlı mağaza fiyat havuzu yerine teknoloji tarihi ve nostalji arşivi olarak sergilenmektedir.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-white/90 backdrop-blur-md border border-amber-300 rounded-2xl px-4 py-2 text-center shadow-xs">
            <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Çıkış Yılı</span>
            <span className="text-amber-800 font-black text-base">{releaseYear}</span>
          </div>
        </div>
      </div>

      {/* Era Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        {/* Era Context Card */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl p-4.5 space-y-2 shadow-2xs hover:border-amber-400 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
            <Layers className="w-4.5 h-4.5" />
          </div>
          <h4 className="text-slate-900 text-sm font-black">{context.eraTitle}</h4>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            {context.eraDescription}
          </p>
        </div>

        {/* Tech Milestone Card */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl p-4.5 space-y-2 shadow-2xs hover:border-amber-400 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
            <Cpu className="w-4.5 h-4.5" />
          </div>
          <h4 className="text-slate-900 text-sm font-black">Dönem Teknolojisi</h4>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            {context.techMilestone}
          </p>
        </div>

        {/* Archive & Museum Status Card */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl p-4.5 space-y-2 shadow-2xs hover:border-amber-400 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black">
            <Award className="w-4.5 h-4.5" />
          </div>
          <h4 className="text-slate-900 text-sm font-black">Koleksiyon Kaydı</h4>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            Bu cihaz günümüzde sıfır ticari satışta yer almamakta olup, ürün gelişim kronolojisi için arşivlenmiştir.
          </p>
        </div>
      </div>

      {/* Info Banner & Modern Recommendation */}
      <div className="bg-amber-100/70 border border-amber-300/90 rounded-2xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-amber-950 font-black text-xs">Arşiv Bilgilendirmesi</h5>
            <p className="text-[11px] text-amber-900 mt-0.5 leading-relaxed">
              {context.availabilityNotice}
            </p>
          </div>
        </div>

        <Link
          href={`/phones?brand=${encodeURIComponent(product.brand || '')}`}
          className="inline-flex items-center justify-center gap-2 bg-amber-800 hover:bg-amber-900 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
        >
          <span>Güncel {product.brand} Telefonları</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
