'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { Scale, ShieldCheck, CheckCircle2, RefreshCw, Zap } from 'lucide-react';

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-slate-900 text-slate-400 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black shadow-md">
                <Scale className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">
                acele<span className="text-emerald-500">Etme</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              Türkiye&apos;nin reklamsız, %100 bağımsız ve algoritmik akıllı telefon ile televizyon karşılaştırma kılavuzu. Piyasadaki tüm fırsatları şeffaf bir şekilde analiz eder.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              {t.categories}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/phones" className="hover:text-emerald-400 transition-colors">
                  {t.smartphones} Kataloğu
                </Link>
              </li>
              <li>
                <Link href="/tvs" className="hover:text-emerald-400 transition-colors">
                  {t.tvs} Kataloğu
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-emerald-400 transition-colors">
                  {t.navCompare} Masası
                </Link>
              </li>
              <li>
                <Link href="/alerts" className="hover:text-emerald-400 transition-colors">
                  {t.navAlerts} Takip Merkezi
                </Link>
              </li>
            </ul>
          </div>

          {/* Transparency Principles */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Şeffaflık Standartları
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>%100 Algoritmik & Objektif Puanlama</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Sponsor Yönlendirmesiz Katalog</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Canlı 6 Aylık Fiyat Değişim Grafikleri</span>
              </li>
            </ul>
          </div>



        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 aceleEtme. Tüm hakları saklıdır. Tarafsız Ürün Karşılaştırma & Canlı Piyasa Analizi.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/phones" className="hover:text-emerald-400 font-bold">Katalog</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
