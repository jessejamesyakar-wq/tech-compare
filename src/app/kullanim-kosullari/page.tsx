import React from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft, CheckCircle2, Shield, AlertCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kullanım Koşulları | aceleEtme',
  description: 'aceleEtme web sitesi kullanım şartları, kuralları ve hizmet kapsamı.',
};

export default function KullanimKosullariPage() {
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-xs font-black border border-blue-300 dark:border-blue-700">
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          <span>KULLANIM SÖZLEŞMESİ</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Kullanım Koşulları
        </h1>

        <p className="text-xs text-slate-400">Son Güncelleme: 27 Ağustos 2026</p>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>1. Hizmetin Niteliği ve Kapsamı</span>
          </h2>
          <p>
            <strong>aceleEtme</strong>, kullanıcılara akıllı telefon, bilgisayar, televizyon ve elektronik cihazlar hakkında teknik özellik kıyaslaması, puanlama ve mağaza fiyat listeleme hizmeti sunar. Sitede yer alan içerikler bilgilendirme amaçlıdır.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>2. Fikri Mülkiyet ve İçerik Hakları</span>
          </h2>
          <p>
            Platform tasarımı, puanlama algoritmaları, yazılım kodları ve derlenmiş veritabanı aceleEtme&apos;ye aittir. Ürün görselleri ve marka logoları ilgili üretici ve tescil sahiplerine aittir.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-emerald-600" />
            <span>3. Değişiklik Hakkı</span>
          </h2>
          <p>
            aceleEtme, site özelliklerini, listelenen ürünleri ve bu koşulları dilediği zaman önceden bildirmeksizin güncelleme veya değiştirme hakkını saklı tutar.
          </p>
        </section>

      </div>
    </div>
  );
}
