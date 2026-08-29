import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock, Eye, Cookie } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası | aceleEtme',
  description: 'aceleEtme kullanıcı verileri gizlilik politikası, çerezler ve KVKK uyumluluk bildirimi.',
};

export default function GizlilikPolitikasiPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Back to Home */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Ana Sayfaya Dön</span>
      </Link>

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-black border border-emerald-300 dark:border-emerald-700">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>GÜVENLİK & KVKK</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Gizlilik Politikası ve Kişisel Verilerin Korunması
        </h1>

        <p className="text-xs text-slate-400">Son Güncelleme: 27 Ağustos 2026</p>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>1. Veri Güvenliği Taahhüdü</span>
          </h2>
          <p>
            <strong>aceleEtme</strong> olarak kullanıcılarımızın kişisel gizliliğine ve güvenliğine en üst düzeyde önem veriyoruz. Platformumuz, kullanıcı deneyimini iyileştirmek, fiyat alarmlarını iletmek ve teknik analiz sunmak haricinde hiçbir kişisel veriyi üçüncü taraflarla paylaşmaz veya satmaz.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cookie className="w-4 h-4 text-emerald-600" />
            <span>2. Çerezler (Cookies) ve Yerel Tercihler</span>
          </h2>
          <p>
            Sitemizde tema tercihleriniz (koyu/açık mod), dil seçeneğiniz ve karşılaştırma listesine eklediğiniz ürünler tarayıcınızın yerel hafızasında (localStorage/IndexedDB) saklanır. Bu bilgiler anonim olup harici sunucularda depolanmaz.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-600" />
            <span>3. Fiyat Alarmı & E-Posta Bildirimleri</span>
          </h2>
          <p>
            Fiyat alarmı kurduğunuzda girdiğiniz e-posta adresi yalnızca hedef fiyat seviyesine ulaşıldığında bilgilendirme yapmak amacıyla kullanılır; spam veya ticari tanıtım bültenlerine dahil edilmez.
          </p>
        </section>

      </div>
    </div>
  );
}
