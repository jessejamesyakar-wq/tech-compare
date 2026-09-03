'use client';

import Image from 'next/image';
import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { useCompare } from '@/context/CompareContext';
import { Bell, Trash2, Mail, ArrowRight } from 'lucide-react';

export default function AlertsPage() {
  const { t } = useI18n();
  const { alerts, removeAlert } = useCompare();

  return (
    <div className="space-y-8 py-4">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 mb-2">
            <Bell className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.myAlerts}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {t.activeAlerts}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Hedef fiyatınıza ulaşıldığında e-posta ile anında bilgilendirileceksiniz
          </p>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4 my-8 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <Bell className="w-8 h-8" />
          </div>
          <h2 className="text-slate-900 text-lg font-bold">{t.noAlertsYet}</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Telefon detay sayfalarındaki &quot;Fiyat Alarmı Kur&quot; butonunu kullanarak hedef fiyat takibi başlatabilirsiniz.
          </p>
          <Link
            href="/phones"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white font-bold text-xs px-6 py-3 rounded-xl accent-glow-sm"
          >
            <span>{t.smartphones} İncele</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-emerald-400 transition-all shadow-xs"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-slate-50 p-2 overflow-hidden flex items-center justify-center border border-slate-200 shrink-0">
                  <Image src={alert.productImage || '/icon.png'} alt={alert.productName || 'Ürün'} width={64} height={64} className="h-full w-auto object-contain" />
                </div>
                <div>
                  <h4 className="text-slate-900 text-sm font-bold">{alert.productName}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <Mail className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{alert.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs mt-2">
                    <span className="text-slate-500">Hedef: <strong className="text-emerald-600 font-extrabold">{alert.targetPrice.toLocaleString()} TL</strong></span>
                    <span>•</span>
                    <span className="text-slate-500">Mevcut: <strong className="text-slate-900">{alert.currentPrice.toLocaleString()} TL</strong></span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => removeAlert(alert.id)}
                className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                title={t.deleteAlert}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
