import React from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { ArrowRight, Scale } from 'lucide-react';

export function AIUpgradeAdvisor({ currentProduct }: { currentProduct: Product }) {
  if (!currentProduct) return null;
  return (
    <section className="bg-gradient-to-br from-indigo-50/80 via-white to-emerald-50/80 border border-indigo-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
      <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><Scale className="w-5 h-5 text-indigo-600" />Cihazınızı Karşılaştırın</h3>
      <p className="text-sm text-slate-600">{currentProduct.name} ile kullandığınız cihazın özelliklerini yan yana inceleyin.</p>
      <p className="text-xs text-slate-500">Yükseltmenin size uygunluğunu değerlendirmek için mevcut cihazınızın tam modelini seçin.</p>
      <Link href={`/compare?d1=${encodeURIComponent(currentProduct.slug || currentProduct.id)}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white hover:bg-indigo-700">
        Mevcut Cihazımı Seç <ArrowRight className="w-4 h-4" />
      </Link>
    </section>
  );
}
