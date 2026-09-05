'use client';

import React from 'react';
import { BaseProduct, Product, ProductVariant } from '@/lib/types';
import { getProductColorList, ResolvedColorOption } from '@/lib/colorVariantHelper';
import { Palette, Check } from 'lucide-react';

interface ProductColorPickerProps {
  product?: BaseProduct | Product;
  colorOptions?: { name: string; hex: string; image?: string; images?: string[] }[];
  variants?: ProductVariant[];
  selectedColor: string;
  onSelectColor: (colorName: string, colorImage?: string, colorImages?: string[], variantId?: string) => void;
  className?: string;
}

export function ProductColorPicker({
  product,
  colorOptions = [],
  variants = [],
  selectedColor,
  onSelectColor,
  className = ''
}: ProductColorPickerProps) {
  // If product is provided, use the robust color list extractor
  const colorList: ResolvedColorOption[] = product
    ? getProductColorList(product)
    : (variants.length > 0
        ? variants.map(v => ({
            name: v.colorName || v.name,
            hex: v.colorHex || '#334155',
            image: v.image,
            images: v.images || (v.image ? [v.image] : undefined),
            variantId: v.id,
            price: v.price
          }))
        : colorOptions.map(c => ({
            name: c.name,
            hex: c.hex,
            image: c.image,
            images: c.images || (c.image ? [c.image] : undefined)
          })));

  if (!colorList || colorList.length === 0) return null;

  return (
    <div className={`bg-slate-50/90 rounded-2xl p-4 border border-slate-200/90 space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
          <Palette className="w-4 h-4 text-emerald-600" />
          <span>Renk Seçenekleri</span>
        </div>
        {selectedColor && (
          <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
            {selectedColor}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
        {colorList.map((item, idx) => {
          const isSelected = selectedColor && (
            selectedColor.toLowerCase() === item.name.toLowerCase() ||
            selectedColor.toLowerCase().includes(item.name.toLowerCase()) ||
            item.name.toLowerCase().includes(selectedColor.toLowerCase())
          );

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectColor(item.name, item.image, item.images, item.variantId)}
              title={`${item.name} rengini seç`}
              className={`group flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-white border-emerald-600 text-slate-900 shadow-sm ring-2 ring-emerald-500/30 scale-102'
                  : 'bg-white/70 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300 hover:shadow-2xs'
              }`}
            >
              <span
                className="w-4 h-4 rounded-full border border-slate-300/80 shadow-xs shrink-0 flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: item.hex }}
              >
                {isSelected && (
                  <Check className={`w-2.5 h-2.5 stroke-[3] ${isLightColor(item.hex) ? 'text-slate-900' : 'text-white'}`} />
                )}
              </span>
              <span className="font-semibold text-[11.5px]">{item.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function isLightColor(hex: string): boolean {
  if (!hex || !hex.startsWith('#')) return false;
  const c = hex.substring(1);
  const rgb = parseInt(c.length === 3 ? c.split('').map(x => x + x).join('') : c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma > 160;
}
