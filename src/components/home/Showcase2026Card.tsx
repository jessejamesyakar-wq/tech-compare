'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Scale, Sparkles, AlertCircle } from 'lucide-react';
import { ProductImage } from '@/components/ui/ProductImage';
import { Showcase2026Product } from '@/lib/showcase2026';

interface Showcase2026CardProps {
  product: Showcase2026Product;
  isRotating?: boolean;
}

export function Showcase2026Card({ product, isRotating = false }: Showcase2026CardProps) {
  return (
    <div
      className={`group relative flex flex-col justify-between h-full bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs hover:shadow-lg hover:border-blue-300 transition-all duration-300 ${
        isRotating ? 'opacity-0 scale-[0.97]' : 'opacity-100 scale-100'
      }`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-1.5 mb-2.5">
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] sm:text-[11px] font-bold truncate max-w-[120px]">
            {product.brand}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/10 to-teal-500/10 text-cyan-800 border border-cyan-200/80 text-[10px] font-black shrink-0">
            <Sparkles className="w-2.5 h-2.5 text-cyan-600" />
            <span>2026</span>
          </span>
        </div>

        {/* Product Image */}
        <div className="relative w-full h-32 sm:h-36 mb-3 p-2 bg-slate-50/70 rounded-xl flex items-center justify-center overflow-hidden">
          <ProductImage
            src={product.image}
            alt={product.name}
            variant="card"
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Product Title */}
        <Link
          href={product.detailHref}
          className="block text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[2.5rem] mb-2"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Spec Pills: Maximum 2 high-value pills for clear, editorial hierarchy */}
        <div className="flex flex-wrap gap-1.5 mb-3 min-h-[2rem] content-start">
          {product.specs.slice(0, 2).map((spec, i) => (
            <span
              key={i}
              className="inline-block px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 text-[10px] font-medium border border-slate-200/70 leading-tight"
            >
              {spec}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Footer: Price Integrity + Actions */}
      <div className="pt-2.5 border-t border-slate-100 mt-auto space-y-2.5">
        {/* Canonical Price Integrity State */}
        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-slate-500">
          <AlertCircle className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="leading-snug">{product.priceStatusLabel}</span>
        </div>

        {/* Action Buttons with accessible 44px min touch target */}
        <div className="flex items-center gap-1.5">
          <Link
            href={product.detailHref}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors min-h-[44px]"
          >
            <span>İncele</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href={product.compareHref}
            title={`${product.name} modelini karşılaştır`}
            aria-label={`${product.name} modelini karşılaştır`}
            className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors min-h-[44px] min-w-[44px]"
          >
            <Scale className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
export default Showcase2026Card;
