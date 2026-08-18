'use client';

import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { useCompare } from '@/context/CompareContext';
import { Product } from '@/lib/types';
import { Bell, X, CheckCircle, Mail } from 'lucide-react';

interface PriceAlertModalProps {
  phone: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function PriceAlertModal({ phone, isOpen, onClose }: PriceAlertModalProps) {
  const { t } = useI18n();
  const { addAlert } = useCompare();

  const [targetPrice, setTargetPrice] = useState<number>(Math.round((phone?.basePrice || 30000) * 0.95));
  const [email, setEmail] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen || !phone) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !targetPrice) return;

    addAlert({
      productId: phone.id,
      productName: phone.name,
      productImage: phone.image,
      targetPrice,
      currentPrice: phone.basePrice,
      email
    });

    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-slate-900 text-lg font-bold">
              {t.alertSuccessTitle}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t.alertSuccessDesc}
            </p>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
              Target: <span className="text-emerald-600 font-bold">{targetPrice.toLocaleString()} {phone.currency}</span> • Email: <span className="text-slate-900 font-medium">{email}</span>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl transition-all accent-glow-sm cursor-pointer"
            >
              {t.close}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-slate-900 text-base font-bold">
                  {t.setPriceAlert}
                </h3>
                <p className="text-xs text-slate-500">
                  {phone.name}
                </p>
              </div>
            </div>

            {/* Current Price Reference */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">Mevcut En Uygun Fiyat:</span>
              <span className="text-emerald-600 font-extrabold text-sm">
                {phone.basePrice ? phone.basePrice.toLocaleString() : ''} {phone.currency || 'TL'}
              </span>
            </div>

            {/* Target Price Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                {t.targetPriceLabel}
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(Number(e.target.value))}
                  className="w-full bg-slate-50 text-slate-900 text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-bold"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold">
                  {phone.currency || 'TL'}
                </span>
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                {t.emailLabel}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="ornek@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-xs pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-md accent-glow-sm cursor-pointer"
            >
              {t.createAlertBtn}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
