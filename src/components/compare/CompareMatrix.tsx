'use client';

import { ProductImage } from '@/components/ui/ProductImage';
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Product, Smartphone, TVProduct, LaptopProduct } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';
import { useCompare } from '@/context/CompareContext';
import { PriceDisclaimer } from '@/components/legal/PriceDisclaimer';
import { CompareVerdictCard } from './CompareVerdictCard';
import { getComparisonRows, getRowWinnerId as findRowWinner, ComparisonRow } from '@/lib/comparisonEvidence';
import { ProductPriceSummary } from '@/components/detail/ProductPriceSummary';
import {
  Scale,
  Sparkles,
  X,
  SlidersHorizontal,
  CheckCircle,
  Trophy
} from 'lucide-react';

interface CompareMatrixProps {
  products: Product[];
  onRemove?: (id:string)=>void;
  onClear?: ()=>void;
}

type SpecRow = ComparisonRow;

export function CompareMatrix({ products, onRemove, onClear }: CompareMatrixProps) {
  const { t } = useI18n();
  const savedCompare = useCompare();
  const removeFromCompare=onRemove||savedCompare.removeFromCompare;
  const clearCompare=onClear||savedCompare.clearCompare;

  const [highlightDiffs, setHighlightDiffs] = useState<boolean>(true);
  const [onlyDiffs, setOnlyDiffs] = useState<boolean>(false);

  if (!products || products.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-12 text-center max-w-xl mx-auto my-12 space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
          <Scale className="w-8 h-8" />
        </div>
        <h2 className="text-slate-900 text-xl font-black">{t.emptyCompareTitle}</h2>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">{t.emptyCompareDesc}</p>
        <Link
          href="/phones"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-all shadow-xs"
        >
          <span>{t.navCatalog}</span>
        </Link>
      </div>
    );
  }

  const specRows = getComparisonRows(products);
  const getRowWinnerId = (row: SpecRow) => findRowWinner(row, products);

  const isDiffRow = (row: SpecRow) => {
    if (products.length < 2) return false;
    const values = products.map((p) => String(row.getValue(p)).toLowerCase());
    const first = values[0];
    return values.some((v) => v !== first);
  };

  const diffCount = specRows.filter(isDiffRow).length;
  const categories = Array.from(new Set(specRows.map((r) => r.category)));

  const getItemUrl = (product: Product) => `/${product.category === 'smartphones' ? 'phones' : product.category}/${encodeURIComponent(product.slug || product.id)}`;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Ürün Karşılaştırması</h1>
      
      {/* 1. AI Decision / Verdict Card at Top */}
      <CompareVerdictCard products={products} />

      {/* 2. Controls bar */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Highlight Diffs Toggle */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-pressed={highlightDiffs}
            onClick={() => setHighlightDiffs(!highlightDiffs)}
            className={`flex-1 sm:flex-initial min-h-11 px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
              highlightDiffs
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-extrabold shadow-2xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Farkları Vurgula ({diffCount} Fark)</span>
          </motion.button>

          {/* Only Diffs Switch */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-pressed={onlyDiffs}
            onClick={() => setOnlyDiffs(!onlyDiffs)}
            className={`flex-1 sm:flex-initial min-h-11 px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
              onlyDiffs
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs font-extrabold'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Sadece Farkları Göster</span>
          </motion.button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
          <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            {products.length} / 4 Model Masada
          </span>
          <button
            onClick={clearCompare}
            className="text-rose-600 hover:underline font-extrabold cursor-pointer"
          >
            Tümünü Temizle
          </button>
        </div>

      </div>

      {/* 3. Comparison Table */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Karşılaştırma tablosu, yatay kaydırılabilir">
          <table className="w-full text-left border-collapse min-w-[600px]">
            
            {/* Header Row with Product Cards */}
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200">
                <th className="p-4 w-56 text-slate-700 text-xs font-black uppercase tracking-wider sticky left-0 bg-slate-50 z-20">
                  Teknik Özellikler
                </th>
                {products.map((product) => (
                  <th key={product.id} className="p-4 w-64 text-center align-top relative border-l border-slate-200/80">
                    <button
                      onClick={() => removeFromCompare(product.id)}
                      className="absolute top-2 right-2 min-w-11 min-h-11 flex items-center justify-center p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      aria-label={`${product.name} karşılaştırmadan çıkar`} title={t.remove}
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="mx-auto mb-2 flex items-center justify-center">
                      <ProductImage src={product.image} alt={product.name} variant="card" className="w-24 h-24 max-w-[96px] shadow-2xs border border-slate-200" />
                    </div>

                    <Link href={getItemUrl(product)} className="block">
                      <h4 className="text-slate-900 text-xs font-black hover:text-emerald-600 transition-colors line-clamp-2 leading-snug">
                        {product.name}
                      </h4>
                    </Link>

                    <div className="mt-2"><ProductPriceSummary product={product} compact /></div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Spec Sections */}
            <tbody>
              {categories.map((cat, cIdx) => {
                const catRows = specRows.filter((r) => r.category === cat);
                return (
                  <React.Fragment key={cIdx}>
                    {/* Category Title Header Row */}
                    <tr className="bg-slate-100/80 border-y border-slate-200">
                      <td
                        colSpan={products.length + 1}
                        className="px-4 py-2.5 text-[11px] font-black text-emerald-800 uppercase tracking-widest bg-emerald-50/60"
                      >
                        {cat}
                      </td>
                    </tr>

                    {/* Spec Rows */}
                    {catRows.map((row, rIdx) => {
                      const isDifferent = isDiffRow(row);
                      if (onlyDiffs && !isDifferent) return null;

                      const winnerId = getRowWinnerId(row);

                      return (
                        <tr
                          key={rIdx}
                          className={`border-b border-slate-100 transition-colors ${
                            highlightDiffs && isDifferent ? 'bg-amber-50/40' : 'hover:bg-slate-50/60'
                          }`}
                        >
                          <td className="p-4 text-slate-700 font-extrabold text-xs sticky left-0 bg-white shadow-2xs z-10">
                            {row.label}
                            {highlightDiffs && isDifferent && (
                              <span className="ml-2 text-[9px] bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded font-black">
                                FARK
                              </span>
                            )}
                          </td>

                          {products.map((product) => {
                            const val = row.getValue(product);
                            const isWinner = winnerId === product.id;

                            return (
                              <td
                                key={product.id}
                                className={`p-4 text-center text-xs font-bold border-l border-slate-200/60 transition-colors ${
                                  isWinner
                                    ? 'bg-emerald-50/70 text-emerald-950 font-black'
                                    : highlightDiffs && isDifferent
                                    ? 'text-slate-900'
                                    : 'text-slate-700'
                                }`}
                              >
                                <div className="flex flex-col items-center justify-center gap-1">
                                  <span>{val}</span>
                                  {isWinner && (
                                    <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[9.5px] font-black px-2 py-0.5 rounded-full shadow-2xs">
                                      <Trophy className="w-2.5 h-2.5" />
                                      <span>{row.direction === 'lower' ? 'DAHA DÜŞÜK' : 'DAHA YÜKSEK'}</span>
                                    </span>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legal & Price Transparency Disclaimer */}
      <PriceDisclaimer variant="card" />
    </div>
  );
}
