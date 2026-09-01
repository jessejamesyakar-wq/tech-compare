'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { Scale, CheckCircle2, ShieldCheck, FileText, ShieldAlert } from 'lucide-react';

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-slate-900 text-slate-400 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5" aria-label="aceleEtme Ana Sayfa">
              <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                <img src="/emblem.png" alt="aceleEtme" className="w-full h-full object-contain" />
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">
                acele<span className="text-emerald-500">Etme</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              Türkiye&apos;nin reklamsız, %100 bağımsız ve algoritmik akıllı telefon, bilgisayar ve teknoloji karşılaştırma kılavuzu. Piyasadaki tüm fırsatları şeffaf bir şekilde analiz eder.
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
                <Link href="/laptops" className="hover:text-emerald-400 transition-colors">
                  Laptop & Bilgisayar
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
                <span>Canlı Çoklu Mağaza Fiyat Kıyaslaması</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Fiyat Değişim & Grafik Analizi</span>
              </li>
            </ul>
          </div>

          {/* Legal & Corporate Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Kurumsal & Yasal
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/gizlilik-politikasi" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Gizlilik Politikası</span>
                </Link>
              </li>
              <li>
                <Link href="/kullanim-kosullari" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>Kullanım Koşulları</span>
                </Link>
              </li>
              <li>
                <Link href="/yasal-uyari" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>Yasal Uyarı & Sorumluluk Reddi</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Full Legal Disclaimer Box */}
        <div className="pt-6 pb-6 border-t border-slate-800 text-[11px] leading-relaxed text-slate-400 space-y-1.5 bg-slate-950/40 p-4 sm:p-5 rounded-2xl border border-slate-800/80">
          <p className="font-bold text-slate-300 text-xs">
            Yasal Bilgilendirme ve Sorumluluk Reddi Beyanı:
          </p>
          <p className="text-slate-400 text-justify sm:text-left">
            aceleEtme, internet üzerindeki çeşitli e-ticaret mağazalarına ait fiyat, stok ve ürün özelliklerini derleyerek kullanıcıya sunan bağımsız bir fiyat karşılaştırma ve yönlendirme platformudur. aceleEtme, doğrudan ürün satışı gerçekleştiren bir mağaza veya e-ticaret sitesi değildir; kullanıcıları ilgili üçüncü taraf satıcılara yönlendirir. Sitede listelenen fiyat, stok ve kampanya bilgileri anlık olarak değişiklik gösterebileceğinden, nihai ve geçerli bilgiler ilgili mağazanın kendi web sitesindedir. Mağazalardan gerçekleştirilecek alışveriş süreçlerinde, kargo teslimatlarında veya fiyat uyumsuzluklarında doğabilecek her türlü sorumluluk ilgili satıcıya ait olup, aceleEtme bu süreçlerin tarafı veya sorumlusu değildir.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 mt-4 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 aceleEtme. Tüm hakları saklıdır. Tarafsız Ürün Karşılaştırma & Canlı Piyasa Analizi.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-medium text-slate-400">
            <Link href="/gizlilik-politikasi" className="hover:text-emerald-400 transition-colors">
              Gizlilik Politikası
            </Link>
            <span>•</span>
            <Link href="/kullanim-kosullari" className="hover:text-emerald-400 transition-colors">
              Kullanım Koşulları
            </Link>
            <span>•</span>
            <Link href="/yasal-uyari" className="hover:text-emerald-400 transition-colors">
              Yasal Uyarı
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
