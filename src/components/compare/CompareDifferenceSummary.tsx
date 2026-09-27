import React from 'react';
import { Sparkles } from 'lucide-react';
import { Product } from '@/lib/types';
import { getComparisonRows, ComparisonRow } from '@/lib/comparisonEvidence';

interface CompareDifferenceSummaryProps {
  products: Product[];
}

export function CompareDifferenceSummary({ products }: CompareDifferenceSummaryProps) {
  if (!products || products.length < 2) return null;

  const specRows = getComparisonRows(products);

  const isDiffRow = (row: ComparisonRow) => {
    const values = products.map((p) => {
      const v = row.getValue(p);
      if (v === null || v === undefined || v === '') return 'bilinmiyor';
      return String(v).trim().toLowerCase();
    });
    const first = values[0];
    return values.some((v) => v !== first);
  };

  const diffRows = specRows.filter(isDiffRow);
  if (diffRows.length === 0) return null;

  return (
    <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 space-y-3 text-xs my-4">
      <div className="flex items-center gap-2 font-black text-emerald-950">
        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Karşılaştırma Fark Özeti (Gösterilen katalog değerleri farklı)</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700 font-medium">
        {diffRows.slice(0, 4).map((row) => (
          <div key={row.label} className="p-2.5 bg-white/80 rounded-xl border border-emerald-100 space-y-1">
            <div className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">{row.label}</div>
            <ul className="space-y-0.5 text-slate-700 text-xs">
              {products.map((p) => {
                const rawVal = row.getValue(p);
                const displayVal = (rawVal === null || rawVal === undefined || rawVal === '') ? 'Bilinmiyor' : String(rawVal);
                return (
                  <li key={p.id} className="break-words">
                    <span className="font-semibold text-slate-900">{p.name}:</span> {displayVal}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-slate-500 font-normal">
        Gösterilen kayıtlı teknik özellik değerleri farklıdır. Bilinmeyen veya eksik veriler teknik üstünlük olarak değerlendirilmez.
      </p>
    </div>
  );
}
