'use client';
import React from 'react';
import Link from 'next/link';
import { ProductImage } from '@/components/ui/ProductImage';
import { useCompare } from '@/context/CompareContext';
import { Bell, Trash2, ArrowRight } from 'lucide-react';
import { isValidTargetPrice } from '@/lib/localPreferences';

export default function AlertsClient(){
  const {alerts,removeAlert,alertsReady,storageError}=useCompare();
  return <div className="space-y-6 py-4">
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-xs">
      <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 mb-2"><Bell className="w-4 h-4"/>Bu tarayıcıda saklanır</div>
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Fiyat Hedeflerim</h1>
      <p className="text-sm text-slate-600 mt-2 leading-relaxed">Kaydettiğiniz hedefleri burada görebilirsiniz. Otomatik fiyat kontrolü veya e-posta bildirimi gönderilmez. Güncel fiyatı ürün sayfasından kontrol edin.</p>
    </div>
    {!alertsReady?<p role="status" className="p-6 text-slate-600">Fiyat hedefleri yükleniyor…</p>:storageError&&alerts.length===0?<p role="alert" className="rounded-2xl bg-amber-50 border border-amber-300 p-5 text-sm text-amber-900">{storageError}</p>:alerts.length===0?<div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
      <Bell className="w-12 h-12 text-emerald-600 mx-auto"/><h2 className="text-slate-900 text-lg font-bold">Henüz kaydedilmiş fiyat hedefiniz yok</h2>
      <p className="text-sm text-slate-600">Ürün sayfasındaki “Fiyat Hedefi Kaydet” düğmesini kullanabilirsiniz. Tarayıcı verileri temizlenirse yerel kayıtlar da silinir.</p>
      <Link href="/phones" className="min-h-11 inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white text-sm font-bold px-5 py-3">Ürünleri İncele<ArrowRight className="w-4 h-4"/></Link>
    </div>:<div className="grid grid-cols-1 md:grid-cols-2 gap-4">{alerts.map(alert=>{
      const href=alert.productUrl&&/^\/(phones|laptops|tvs|tablets|smartwatches|headphones|monitors|consoles|appliances)\/[^/]+$/.test(alert.productUrl)?alert.productUrl:`/search?q=${encodeURIComponent(alert.productName||alert.productId)}`;
      return <article key={alert.id} className="min-w-0 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 shrink-0 rounded-xl bg-slate-50 border border-slate-200 p-1 overflow-hidden"><ProductImage src={alert.productImage||''} alt={alert.productName||'Ürün'} variant="card" className="w-full h-full"/></div>
          <h2 className="min-w-0 flex-1 text-sm font-bold text-slate-900 break-words leading-relaxed">{alert.productName||alert.productId}</h2>
          <button onClick={()=>removeAlert(alert.id)} aria-label={`${alert.productName||'Ürün'} fiyat hedefini sil`} className="w-11 h-11 shrink-0 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:text-red-700 hover:bg-red-50"><Trash2 className="w-4 h-4"/></button>
        </div>
        <p className="mt-4 text-sm text-slate-600">Hedef: <strong className="text-lg text-emerald-700">{alert.targetPrice.toLocaleString('tr-TR')} TL</strong></p>
        <p className="mt-2 text-xs text-slate-600 leading-relaxed">{isValidTargetPrice(alert.currentPrice)?`Kaydetme anındaki fiyat: ${alert.currentPrice.toLocaleString('tr-TR')} TL · Güncel fiyat değildir`:'Kaydetme anında güncel fiyat doğrulanmadı'}</p>
        <Link href={href} className="mt-3 min-h-11 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">Ürün ve fiyat durumunu incele<ArrowRight className="w-4 h-4"/></Link>
      </article>;
    })}</div>}
  </div>;
}
