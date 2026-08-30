'use client';

import React from 'react';
import { ProductVariant } from '@/lib/types';
import { Palette, Check } from 'lucide-react';

interface ProductColorPickerProps {
  colorOptions?: { name: string; hex: string; image?: string }[];
  variants?: ProductVariant[];
  selectedColor: string;
  onSelectColor: (colorName: string, colorImage?: string) => void;
  className?: string;
}

export function ProductColorPicker({
  colorOptions = [],
  variants = [],
  selectedColor,
  onSelectColor,
  className = ''
}: ProductColorPickerProps) {
  // If variants exist with color details, use them; otherwise use colorOptions
  const colorList = variants.length > 0
    ? variants.map(v => ({
        name: v.colorName || v.name,
        hex: v.colorHex || '#334155',
        image: v.image
      }))
    : colorOptions;

  if (!colorList || colorList.length === 0) return null;

  return (
    <div className={`bg-slate-50/80 rounded-2xl p-4 border border-slate-200/90 space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
          <Palette className="w-3.5 h-3.5 text-emerald-600" />
          <span>Renk Seçenekleri</span>
        </div>
        {selectedColor && (
          <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {selectedColor}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        {colorList.map((item, idx) => {
          const isSelected = selectedColor.toLowerCase() === item.name.toLowerCase();
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectColor(item.name, item.image)}
              title={item.name}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white border-emerald-600 text-slate-900 shadow-sm ring-2 ring-emerald-500/30'
                  : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
              }`}
            >
              <span
                className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs shrink-0 flex items-center justify-center"
                style={{ backgroundColor: item.hex }}
              >
                {isSelected && (
                  <Check className={`w-2.5 h-2.5 ${isLightColor(item.hex) ? 'text-slate-900' : 'text-white'}`} />
                )}
              </span>
              <span>{item.name}</span>
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
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma > 160;
}
