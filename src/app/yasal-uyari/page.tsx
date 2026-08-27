import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Scale, ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Yasal Uyarı & Sorumluluk Reddi | aceleEtme',
  description: 'AceleEtme platformu yasal bilgilendirme, tarafsızlık ilkeleri ve üçüncü taraf satıcı sorumluluk reddi beyanı.',
};

export default function YasalUyariPage() {
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-black border border-amber-300 dark:border-amber-700">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          <span>HUKUKİ BİLGİLENDİRME</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Yasal Uyarı ve Sorumluluk Reddi Beyanı
        </h1>

        <p className="text-xs text-slate-400">Son Güncelleme: 27 Ağustos 2026</p>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        
        {/* Core Disclaimer Box */}
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-950 dark:text-amber-200 text-sm leading-relaxed font-medium">
          <p>
            <strong>AceleEtme</strong>, internet üzerindeki çeşitli e-ticaret mağazalarına ait fiyat, stok ve ürün özelliklerini derleyerek kullanıcıya sunan bağımsız bir fiyat karşılaştırma ve yönlendirme platformudur. AceleEtme, doğrudan ürün satışı gerçekleştiren bir mağaza veya e-ticaret sitesi değildir; kullanıcıları ilgili üçüncü taraf satıcılara yönlendirir. Sitede listelenen fiyat, stok ve kampanya bilgileri anlık olarak değişiklik gösterebileceğinden, nihai ve geçerli bilgiler ilgili mağazanın kendi web sitesindedir. Mağazalardan gerçekleştirilecek alışveriş süreçlerinde, kargo teslimatlarında veya fiyat uyumsuzluklarında doğabilecek her türlü sorumluluk ilgili satıcıya ait olup, AceleEtme bu süreçlerin tarafı veya sorumlusu değildir.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-600" />
            <span>1. Bağımsız Bilgi ve Yönlendirme Hizmeti</span>
          </h2>
          <p>
            AceleEtme, tüketicilerin piyasadaki en avantajlı fiyatlara ve doğru ürün teknik özelliklerine kolayca ulaşabilmesini sağlamak amacıyla kurulmuştur. Platform üzerinde yer alan ürün puanları, teknik özellik kıyaslamaları ve fiyat geçmişi grafikleri tamamen algoritmik ve tarafsız verilere dayanır.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-emerald-600" />
            <span>2. Üçüncü Taraf Satıcı ve Mağaza Bağlantıları</span>
          </h2>
          <p>
            Platformumuzdan harici mağaza web sitelerine (Amazon, Trendyol, Hepsiburada, n11, MediaMarkt, Vatan, Teknosa vb.) verilen linkler üzerinden gerçekleştirilen sipariş, ödeme, faturalandırma, kargo ve iade işlemleri doğrudan ilgili satıcı ile tüketici arasındaki mesafeli satış sözleşmesi kapsamında yürütülür. AceleEtme ödeme tahsilatı yapmaz ve sipariş taraflarından biri değildir.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            3. Fiyat ve Stok Değişiklikleri
          </h2>
          <p>
            Mağazalar anlık olarak kampanya, stok veya fiyat güncellemesi yapabilmektedir. Sistemimiz fiyatları düzenli aralıklarla otomatik güncellese de, alışveriş öncesinde yönlendirildiğiniz mağaza sayfasındaki son sepet tutarı ve stok durumunun teyit edilmesi kullanıcının sorumluluğundadır.
          </p>
        </section>

      </div>
    </div>
  );
}
