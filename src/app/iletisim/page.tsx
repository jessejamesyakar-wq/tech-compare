import React from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Building2, User, FileText, MapPin, MessageSquare, Info, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import { ContactForm } from './ContactForm';

export const metadata: Metadata = {
  title: 'İletişim | aceleEtme',
  description: 'aceleEtme iletişim ve kurumsal bilgileri. Sorularınız, öneri ve iş birlikleriniz için bizimle iletişime geçebilirsiniz.',
  alternates: {
    canonical: 'https://www.aceleetme.tech/iletisim',
  },
  openGraph: {
    title: 'İletişim | aceleEtme',
    description: 'aceleEtme iletişim ve kurumsal bilgileri. Sorularınız, öneri ve iş birlikleriniz için bizimle iletişime geçebilirsiniz.',
    url: 'https://www.aceleetme.tech/iletisim',
    siteName: 'aceleEtme',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'İletişim | aceleEtme',
    description: 'aceleEtme iletişim ve kurumsal bilgileri.',
  },
};

export default function IletisimPage() {
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
          <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>KURUMSAL & İLETİŞİM</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          İletişim
        </h1>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Sorularınız, öneri veya iş birlikleriniz için bize ulaşabilirsiniz.
        </p>
      </div>

      {/* Corporate Info Cards */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Kurumsal Bilgiler</span>
          </h2>
          <p className="text-xs text-slate-500">
            Platform sahibi ve yasal tebligat/iletişim bilgileri.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Ad Soyad */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5 text-emerald-500" />
              <span>Ad Soyad / Yetkili</span>
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Mehmet Yakar
            </p>
          </div>

          {/* E-Posta */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Mail className="w-3.5 h-3.5 text-emerald-500" />
              <span>Resmi İletişim E-Postası</span>
            </span>
            <p className="text-sm font-bold">
              <a
                href="mailto:info@aceleetme.tech"
                className="text-emerald-600 dark:text-emerald-400 hover:underline transition-colors"
              >
                info@aceleetme.tech
              </a>
            </p>
          </div>

          {/* Vergi Dairesi / No */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <FileText className="w-3.5 h-3.5 text-emerald-500" />
              <span>Vergi Dairesi & Vergi No</span>
            </span>
            <p className="text-sm font-mono font-medium text-slate-600 dark:text-slate-400">
              [Vergi Dairesi: __________ / Vergi No: __________]
            </p>
          </div>

          {/* Adres */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              <span>Yasal Tebligat Adresi</span>
            </span>
            <p className="text-sm font-mono font-medium text-slate-600 dark:text-slate-400">
              [Adres: __________]
            </p>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Bize Mesaj Gönderin</span>
          </h2>
          <p className="text-xs text-slate-500">
            Aşağıdaki formu doldurarak sorularınızı, hata bildirimlerinizi veya iş birliği taleplerinizi doğrudan iletebilirsiniz.
          </p>
        </div>

        <ContactForm />
      </div>

      {/* Important Notice */}
      <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs leading-relaxed space-y-2">
        <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-xs">
          <Info className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Sipariş ve Satın Alma Süreçleri Hakkında Önemli Hatırlatma:</span>
        </p>
        <p>
          aceleEtme, e-ticaret mağazalarının fiyatlarını tarafsız olarak listeleyen bir fiyat karşılaştırma portalıdır. Sitede doğrudan ürün satışı yapılmamaktadır. Satın aldığınız ürünlerin teslimatı, faturası, kargo takibi veya iadesi ile ilgili konularda lütfen doğrudan alışveriş yaptığınız satıcı mağaza ile iletişime geçiniz.
        </p>
      </div>
    </div>
  );
}
