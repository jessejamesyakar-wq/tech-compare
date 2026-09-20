'use client';

import React, { useId } from 'react';
import { ExternalLink, X } from 'lucide-react';
import { useModalFocus } from '@/components/ui/useModalFocus';
import { getPriceFreshness, isSearchUrl } from '@/lib/priceFreshness';

interface OutboundPriceModalProps {
  isOpen: boolean; onClose: () => void; productName: string; storeName: string;
  price: number | null; targetUrl: string; lastCheckedAt?: string;
}

export function OutboundPriceModal({ isOpen,onClose,productName,storeName,price,targetUrl,lastCheckedAt }: OutboundPriceModalProps) {
  const ref=useModalFocus(isOpen,onClose), titleId=useId();
  if(!isOpen)return null;
  let safeUrl: string | null = null;
  try {const url=new URL(targetUrl);if(url.protocol==='https:'&&!url.username&&!url.password)safeUrl=url.href;}catch{}
  const search=isSearchUrl(targetUrl);
  const freshness=getPriceFreshness(lastCheckedAt);
  const showPrice=!search&&typeof price==='number'&&Number.isFinite(price)&&price>0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full max-h-[90dvh] overflow-y-auto shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 id={titleId} className="text-base font-black text-slate-900">{search?'Mağazada Ürün Ara':'Mağaza Sayfasına Git'}</h2>
          <button onClick={onClose} aria-label="Mağaza penceresini kapat" className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-sm font-bold text-slate-800 break-words">{productName}</p>
        <p className="text-sm text-slate-600">Mağaza: <strong>{storeName}</strong></p>
        {search ? <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Bu bağlantı mağazanın arama sonuçlarını açar. Ürünün modelini, fiyatını ve stok durumunu mağazada kontrol edin.</p> : <div className="rounded-xl bg-slate-50 p-4 space-y-1">
          <p className="text-xs text-slate-500">Kayıtlı teklif</p>
          <p className="text-xl font-black text-slate-900">{showPrice?`${price!.toLocaleString('tr-TR')} TL`:'Fiyat bilgisi yok'}</p>
          <p className="text-xs text-slate-600">{freshness.label}</p>
          <p className="text-xs text-slate-500">Bu pencere yeni bir fiyat veya stok kontrolü yapmaz.</p>
        </div>}
        {safeUrl ? <a href={safeUrl} target="_blank" rel="noopener noreferrer" onClick={onClose} className="min-h-11 w-full bg-slate-900 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-3 rounded-xl flex items-center justify-center gap-2"><span>{storeName} sitesini aç</span><ExternalLink className="w-4 h-4 shrink-0" /></a> : <p role="alert" className="text-sm text-rose-700">Mağaza bağlantısı geçersiz.</p>}
        <p className="text-xs text-slate-500">Satın almadan önce satıcı sayfasındaki güncel fiyat ve koşulları kontrol edin.</p>
      </div>
    </div>
  );
}
