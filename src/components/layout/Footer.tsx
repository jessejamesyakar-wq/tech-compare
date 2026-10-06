'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n/context';
import { ShieldCheck, ArrowUpRight } from 'lucide-react';

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-[#f8fafe] text-[#63748d] mt-16 sm:mt-20 border-t border-[#e5ebf4] transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12 lg:py-16">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-10">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group" aria-label="aceleEtme Ana Sayfa">
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                <Image src="/emblem.png" alt="aceleEtme" width={32} height={32} className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-extrabold text-slate-800 tracking-tight">
                acele<span className="text-cyan-600">Etme</span>
              </span>
            </Link>
            <p className="text-xs font-semibold text-[#475e7b] leading-relaxed">
              İhtiyacını anla. Seçeneklerini karşılaştır.<br className="hidden sm:inline" /> Kararını aceleye getirme.
            </p>
            <p className="text-[11px] leading-relaxed text-[#63748d]">
              Telefon, bilgisayar ve teknoloji ürünlerinin kayıtlı özelliklerini karşılaştırın. Güncel teklifler, son görülen fiyatlar ve katalog referansları ayrı etiketlerle sunulur.
            </p>
          </div>

          {/* Quick Links / Categories */}
          <div>
            <h4 className="text-xs font-bold text-[#475e7b] uppercase tracking-wider mb-3">
              Keşfet
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/phones" className="text-[#63748d] hover:text-cyan-700 transition-colors">
                  {t.catPhones || 'Akıllı Telefonlar'}
                </Link>
              </li>
              <li>
                <Link href="/laptops" className="text-[#63748d] hover:text-cyan-700 transition-colors">
                  {t.catLaptops || 'Laptop & PC'}
                </Link>
              </li>
              <li>
                <Link href="/tvs" className="text-[#63748d] hover:text-cyan-700 transition-colors">
                  {t.catTvs || 'Televizyonlar'}
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-[#63748d] hover:text-cyan-700 transition-colors">
                  Tüm Ürünler
                </Link>
              </li>
              <li>
                <Link href="/compare" className="text-[#63748d] hover:text-cyan-700 transition-colors">
                  {t.navCompare || 'Karşılaştırma'} Masası
                </Link>
              </li>
              <li>
                <Link href="/alerts" className="text-[#63748d] hover:text-cyan-700 transition-colors">
                  {t.navAlerts || 'Fiyat Hedeflerim'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div>
            <h4 className="text-xs font-bold text-[#475e7b] uppercase tracking-wider mb-3">
              Güven & Destek
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/iletisim?subject=hatali-bilgi" className="text-[#63748d] hover:text-cyan-700 transition-colors inline-flex items-center gap-1.5">
                  <span>Hatalı Bilgi Bildir</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link href="/yasal-uyari" className="text-[#63748d] hover:text-cyan-700 transition-colors">
                  Veri ve Fiyat Uyarıları
                </Link>
              </li>
              <li>
                <Link href="/gizlilik-politikasi" className="text-[#63748d] hover:text-cyan-700 transition-colors">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link href="/kullanim-kosullari" className="text-[#63748d] hover:text-cyan-700 transition-colors">
                  Kullanım Koşulları
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="text-[#63748d] hover:text-cyan-700 transition-colors">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* Transparency Promise */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-600 shrink-0" />
              <strong className="text-xs font-bold text-[#475e7b]">Bilmediğimizi de söyleriz.</strong>
            </div>
            <p className="text-[11px] leading-relaxed text-[#63748d]">
              Güncel teklif, son görülen fiyat ve katalog referansı aynı şey değildir.
            </p>
            <div className="p-3 bg-white/70 rounded-2xl border border-[#e5ebf4] text-[11px] leading-relaxed text-[#63748d] space-y-1 shadow-2xs">
              <p className="font-semibold text-slate-700">Bağımsız Fiyat Rehberliği</p>
              <p>
                aceleEtme doğrudan ürün satışı yapmayan bağımsız bir yönlendirme platformudur. Fiyatın güncellik etiketini kontrol ediniz; nihai ve geçerli bilgiler satıcı mağazasındadır.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 mt-8 border-t border-[#e5ebf4] text-xs text-[#63748d] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 aceleEtme (Kuruluş: 01.09.2026). Tüm hakları saklıdır. Ürün Karşılaştırma ve Fiyat Takibi.</p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px] font-medium text-[#63748d]">
            <Link href="/gizlilik-politikasi" className="hover:text-cyan-700 transition-colors">
              Gizlilik Politikası
            </Link>
            <span className="text-slate-300">•</span>
            <Link href="/kullanim-kosullari" className="hover:text-cyan-700 transition-colors">
              Kullanım Koşulları
            </Link>
            <span className="text-slate-300">•</span>
            <Link href="/yasal-uyari" className="hover:text-cyan-700 transition-colors">
              Yasal Uyarı
            </Link>
            <span className="text-slate-300">•</span>
            <Link href="/iletisim" className="hover:text-cyan-700 transition-colors">
              İletişim
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
