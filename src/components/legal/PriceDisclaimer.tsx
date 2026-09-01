'use client';

import React from 'react';
import { Info, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface PriceDisclaimerProps {
  variant?: 'inline' | 'card' | 'compact';
  className?: string;
}

export function PriceDisclaimer({ variant = 'card', className = '' }: PriceDisclaimerProps) {
  if (variant === 'compact') {
    return (
      <div className={`flex items-start gap-2 bg-slate-50/80 border border-slate-200/80 rounded-xl p-2.5 text-[11px] text-slate-500 font-medium ${className}`}>
        <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
        <span>
          <strong>Yasal Bilgilendirme:</strong> aceleEtme, anlık fiyat değişikliklerini 3üncü parti kaynaklardan toplar. Satın alma aşamasında fiyatı satıcının sitesinden teyit ediniz.
        </span>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-1.5 text-[11px] text-slate-400 font-medium ${className}`}>
        <Info className="w-3 h-3 text-slate-400 shrink-0" />
        <span>aceleEtme, anlık fiyat değişikliklerini 3üncü parti kaynaklardan toplar. Satın alma aşamasında fiyatı satıcının sitesinden teyit ediniz.</span>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-slate-50/90 via-emerald-50/30 to-slate-50/90 border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-2xs ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
          <Info className="w-4 h-4" />
        </div>

        <div className="space-y-0.5">
          <h5 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <span>Şeffaf Fiyat ve Veri Sorumluluk Reddi</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.2 rounded-full">
              Teyit Uyarısı
            </span>
          </h5>
          <p className="text-[11.5px] leading-relaxed text-slate-600 font-medium">
            aceleEtme, anlık fiyat değişikliklerini 3üncü parti kaynaklardan toplar. Satın alma aşamasında fiyatı satıcının sitesinden teyit ediniz.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PriceDisclaimer;
