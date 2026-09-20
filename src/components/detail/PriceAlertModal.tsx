'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { useCompare } from '@/context/CompareContext';
import { Product } from '@/lib/types';
import { Bell, X, CheckCircle } from 'lucide-react';
import { ProductPriceSummary } from './ProductPriceSummary';
import { useModalFocus } from '@/components/ui/useModalFocus';
import { evaluateProductPricing } from '@/lib/pricing/unifiedPriceEvaluator';
import { isValidTargetPrice } from '@/lib/localPreferences';

interface PriceAlertModalProps {phone:Product;isOpen:boolean;onClose:()=>void;}

export function PriceAlertModal({phone,isOpen,onClose}:PriceAlertModalProps){
  const {t}=useI18n();
  const {addAlert}=useCompare();
  const [targetPrice,setTargetPrice]=useState('');
  const [submitted,setSubmitted]=useState(false);
  const [error,setError]=useState('');
  const dialogRef=useModalFocus(isOpen,onClose);
  useEffect(()=>{if(isOpen){setTargetPrice('');setSubmitted(false);setError('');}},[isOpen,phone?.id]);
  if(!isOpen||!phone)return null;
  const handleSubmit=(event:React.FormEvent)=>{
    event.preventDefault();
    const value=Number(targetPrice);
    if(!targetPrice.trim()||!isValidTargetPrice(value)){setError('Sıfırdan büyük, geçerli bir hedef fiyat girin.');return;}
    const price=evaluateProductPricing(phone);
    const productUrl=`/${phone.category==='smartphones'?'phones':phone.category}/${encodeURIComponent(phone.slug||phone.id)}`;
    const saved=addAlert({productId:phone.id,productName:phone.name,productImage:phone.image,productUrl,targetPrice:value,currentPrice:price.currentPrice,priceStatusLabel:price.statusLabel});
    if(saved){setError('');setSubmitted(true);}else setError('Hedef kaydedilemedi. Tarayıcınızın yerel depolama erişimini kontrol edin.');
  };
  return <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="price-target-title" aria-describedby="price-target-notice" tabIndex={-1} className="w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-2xl relative">
      <button onClick={onClose} aria-label="Fiyat hedefi penceresini kapat" className="absolute top-2 right-2 w-11 h-11 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100"><X className="w-5 h-5"/></button>
      {submitted?<div className="text-center pt-10 pb-3 space-y-4">
        <CheckCircle className="w-12 h-12 mx-auto text-emerald-600"/>
        <h2 id="price-target-title" className="text-slate-900 text-lg font-bold">Fiyat hedefi bu tarayıcıya kaydedildi</h2>
        <p id="price-target-notice" className="text-sm text-slate-600">Bu kayıt yalnız bu tarayıcıda saklanır. Otomatik fiyat kontrolü veya e-posta bildirimi gönderilmez.</p>
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">Hedef: <strong>{Number(targetPrice).toLocaleString('tr-TR')} TL</strong></p>
        <Link href="/alerts" onClick={onClose} className="min-h-11 flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white">Fiyat hedeflerime git</Link>
        <button onClick={onClose} className="min-h-11 w-full rounded-xl border border-slate-200 text-sm font-semibold">{t.close}</button>
      </div>:<form onSubmit={handleSubmit} noValidate className="space-y-5 pt-8">
        <div className="flex items-start gap-3"><Bell className="w-6 h-6 text-emerald-600 shrink-0"/><div className="min-w-0"><h2 id="price-target-title" className="text-slate-900 text-lg font-bold">{t.setPriceAlert}</h2><p className="text-xs leading-relaxed text-slate-600 break-words">{phone.name}</p></div></div>
        <p id="price-target-notice" className="text-sm text-slate-600">Hedefinizi bu tarayıcıya kaydedin. Otomatik fiyat kontrolü veya e-posta bildirimi gönderilmez.</p>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3"><ProductPriceSummary product={phone} compact/></div>
        <div className="space-y-2"><label htmlFor="price-target-amount" className="text-sm font-bold text-slate-700">Hedef fiyat (TL)</label>
          <input id="price-target-amount" type="number" inputMode="decimal" min="0.01" step="any" required value={targetPrice} onChange={event=>{setTargetPrice(event.target.value);setError('');}} aria-invalid={!!error} aria-describedby={error?'price-target-error':undefined} className="w-full min-h-11 bg-slate-50 text-slate-900 text-base px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
        </div>
        {error&&<p id="price-target-error" role="alert" className="text-sm text-rose-700">{error}</p>}
        <button type="submit" className="min-h-11 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-3 rounded-xl">Hedefi Kaydet</button>
      </form>}
    </div>
  </div>;
}
