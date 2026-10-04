import React from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { Sparkles, ArrowRight, Layers } from 'lucide-react';
import { ProductPriceSummary } from './ProductPriceSummary';
import { isCanonicalExcluded } from '@/lib/governance/canonicalExclusions';

interface RelatedModelsProps {
  products: Product[];
  currentBrand: string;
}

export function RelatedModels({ products, currentBrand }: RelatedModelsProps) {
  const safeProducts = (products || []).filter(
    (p) => p && !isCanonicalExcluded(p.id) && !isCanonicalExcluded(p.slug)
  );
  if (safeProducts.length === 0) return null;

  const getItemUrl = (p: Product) =>
    `/${p.category === 'smartphones' ? 'phones' : p.category}/${encodeURIComponent(p.slug || p.id)}`;

  return (
    <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <span>Benzer & İlgili Modeller</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {currentBrand} ve aynı segmentteki diğer popüler modelleri inceleyin.
          </p>
        </div>
        <Link
          href={`/phones?brand=${encodeURIComponent(currentBrand)}`}
          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors self-start sm:self-auto"
        >
          <span>Tüm {currentBrand} Modelleri</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {safeProducts.map((item) => {
          const itemUrl = getItemUrl(item);
          return (
            <div
              key={item.id}
              className="group bg-slate-50/60 hover:bg-white border border-slate-200/80 hover:border-emerald-300 rounded-2xl p-3.5 flex flex-col justify-between transition-all duration-200 hover:shadow-md"
            >
              <div>
                <div className="relative w-full h-28 sm:h-32 flex items-center justify-center bg-white rounded-xl p-2 border border-slate-100 mb-3 group-hover:border-emerald-100 transition-colors">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="max-h-24 sm:max-h-28 max-w-full object-contain drop-shadow-xs transition-transform duration-200 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                  {item.brand}
                </span>

                <Link href={itemUrl} className="block group/title">
                  <h3
                    className="text-xs sm:text-sm font-bold text-slate-900 group-hover/title:text-emerald-600 line-clamp-2 transition-colors min-h-[2.5rem]"
                    title={item.name}
                  >
                    {item.name}
                  </h3>
                </Link>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                <div className="text-[11px] font-semibold text-slate-700">
                  <ProductPriceSummary product={item} compact />
                </div>
                <Link
                  href={itemUrl}
                  className="w-full bg-white hover:bg-emerald-600 hover:text-white border border-slate-200 hover:border-emerald-600 text-slate-800 text-[11px] font-bold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-all text-center"
                >
                  <span>İncele</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
