'use client';

import React from 'react';
import { getComparisonRows } from '@/lib/comparisonEvidence';
import { getRecordedProductScore } from '@/lib/productEvidence';
import { Product } from '@/lib/types';
import { getSpecVerificationNotice } from '@/lib/specVerification';
import { Sparkles, Award, CheckCircle2, AlertCircle } from 'lucide-react';

interface CompareVerdictCardProps {
  products: Product[];
}

interface ProductVerdict {
  id: string;
  name: string;
  brand: string;
  score: number | null;
  pros: string[];
  cons: string;
  idealFor: string;
}

export function CompareVerdictCard({ products }: CompareVerdictCardProps) {
  if (!products || products.length < 2) return null;

  const verdicts: ProductVerdict[] = products.map(p => ({
    id:p.id,name:p.name,brand:p.brand,score:getRecordedProductScore(p),
    pros:getComparisonRows([p]).filter(row=>row.category!=='Fiyat ve Kayıt Bilgisi').map(row=>({label:row.label,value:row.getValue(p)})).filter(row=>row.value!=='Bilinmiyor').slice(0,3).map(row=>`${row.label}: ${row.value}`),
    cons:getSpecVerificationNotice(p) || 'Eksik özellikler ve ölçüm yöntemi bilinmeyen puanlar genel kazanan belirlemez.',
    idealFor:'İhtiyaç duyduğunuz özellikleri ve üretici bilgilerini kontrol ederek seçim yapın.',
  }));

  return (
    <div className="bg-gradient-to-br from-emerald-500/10 via-white to-indigo-500/10 border border-emerald-500/30 rounded-3xl p-5 sm:p-7 shadow-md space-y-6 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-[11px] font-black px-3 py-1 rounded-full border border-emerald-300 shadow-2xs mb-1.5 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Kayıtlı Ürün Özeti</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Modellerin Kayıtlı Özellikleri</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Bu özet katalog kaydıdır; bağımsız test veya kullanıcı değerlendirmesi değildir.
          </p>
        </div>
      </div>

      {/* Product Decision Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {verdicts.map((v) => (
          <div
            key={v.id}
            className="bg-white/90 backdrop-blur-md border border-slate-200/90 hover:border-emerald-500/50 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-sm space-y-3.5 transition-all"
          >
            {/* Top Name & Score */}
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                  {v.brand}
                </span>
                <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-black shadow-2xs">
                  <Award className="w-3 h-3 text-amber-600" />
                  <span>{v.score===null?'Puan yok':`${v.score} / 100 · Katalog`}</span>
                </div>
              </div>

              <h4 className="text-sm font-black text-slate-900 line-clamp-2 leading-snug pt-1">
                {v.name}
              </h4>
            </div>

            {/* Pros List */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Kayıtlı Özellikler:
              </span>
              {v.pros.length===0 && <p className="text-xs text-slate-500">Teknik özellik kaydı yok.</p>}
              <ul className="space-y-1">
                {v.pros.map((pro, pIdx) => (
                  <li key={pIdx} className="text-xs font-bold text-slate-800 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Con Note */}
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[11px] font-medium text-slate-600 flex items-start gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200/70">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span className="text-[10.5px]"><strong>Dikkat:</strong> {v.cons}</span>
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-emerald-50/70 border border-emerald-200/70 p-2.5 rounded-xl">
              <span className="text-[9.5px] font-black text-emerald-800 uppercase tracking-widest block mb-0.5">
                Seçim Notu
              </span>
              <p className="text-[11px] font-bold text-emerald-950 leading-relaxed">
                {v.idealFor}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
