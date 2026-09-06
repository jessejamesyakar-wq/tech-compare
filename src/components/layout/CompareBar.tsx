'use client';

import React from 'react';
import Link from 'next/link';
import { ProductImage } from '@/components/ui/ProductImage';
import { useCompare } from '@/context/CompareContext';
import { useI18n } from '@/lib/i18n/context';
import { Scale, X, ArrowRight, Trash2 } from 'lucide-react';

export function CompareBar() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { t } = useI18n();

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-4xl glass-panel bg-white/95 border border-emerald-500/40 rounded-2xl p-3 shadow-xl accent-glow animate-in slide-in-from-bottom-6 duration-300">
      <div className="flex items-center justify-between gap-4">
        
        {/* Thumbnails preview list */}
        <div className="flex items-center gap-3 overflow-x-auto py-1">
          {compareList.map((phone) => (
            <div
              key={phone.id}
              className="relative flex items-center gap-2 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200 shrink-0 group"
            >
              <div className="w-8 h-8 rounded bg-white p-0.5 overflow-hidden flex items-center justify-center border border-slate-200">
                <ProductImage src={phone.image} alt={phone.name} variant="card" className="w-full h-full" />
              </div>
              <span className="text-xs text-slate-900 font-semibold max-w-[100px] truncate">
                {phone.name}
              </span>
              <button
                onClick={() => removeFromCompare(phone.id)}
                className="text-slate-400 hover:text-red-500 transition-colors p-0.5"
                title={t.remove}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* Empty slots indicator */}
          {Array.from({ length: 4 - compareList.length }).map((_, idx) => (
            <div
              key={idx}
              className="hidden sm:flex items-center justify-center w-24 h-10 rounded-xl border border-dashed border-slate-300 text-[10px] text-slate-400 font-medium shrink-0"
            >
              + {t.addPhoneToCompare}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clearCompare}
            className="p-2 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer text-xs flex items-center gap-1"
            title={t.clearFilters}
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden md:inline">{t.close}</span>
          </button>

          <Link
            href="/compare"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all accent-glow-sm"
          >
            <Scale className="w-4 h-4" />
            <span>
              {t.navCompare} ({compareList.length}/4)
            </span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
