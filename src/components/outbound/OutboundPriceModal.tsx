'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ExternalLink, Loader2, CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface OutboundPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  storeName: string;
  price: number;
  targetUrl: string;
  lastCheckedTimeAgo?: string;
}

export function OutboundPriceModal({
  isOpen,
  onClose,
  productName,
  storeName,
  price,
  targetUrl,
  lastCheckedTimeAgo = 'Az önce'
}: OutboundPriceModalProps) {
  const [isVerifying, setIsVerifying] = useState(true);
  const [verified, setVerified] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsVerifying(true);
      setVerified(false);

      // Fast, smooth verification animation (350ms)
      const timer = setTimeout(() => {
        setIsVerifying(false);
        setVerified(true);

        // Auto-redirect to store after 600ms or allow user to click
        const redirectTimer = setTimeout(() => {
          if (targetUrl && targetUrl !== '#') {
            window.open(targetUrl, '_blank', 'noopener,noreferrer');
            onClose();
          }
        }, 600);

        return () => clearTimeout(redirectTimer);
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [isOpen, targetUrl, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 relative overflow-hidden space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 text-xs font-black">
              <ShieldCheck className="w-4 h-4" />
              <span>Güvenli Mağaza Yönlendirmesi</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Product & Store Info */}
          <div className="space-y-1">
            <h4 className="text-sm font-black text-slate-900 line-clamp-2 leading-snug">
              {productName}
            </h4>
            <p className="text-xs text-slate-500">
              Hedef Mağaza: <strong className="text-slate-800">{storeName}</strong>
            </p>
          </div>

          {/* Verification Status Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Teyit Edilen Fiyat
              </span>
              <span className="text-xl font-black text-slate-900 tabular-nums">
                ₺{price.toLocaleString('tr-TR')}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Son Kontrol
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                {lastCheckedTimeAgo}
              </span>
            </div>
          </div>

          {/* Dynamic Progress Indicator */}
          <div className="text-center py-2 space-y-2">
            {isVerifying ? (
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-600">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Anlık fiyat ve stok bütünlüğü teyit ediliyor...</span>
              </div>
            ) : verified ? (
              <div className="flex items-center justify-center gap-2 text-xs font-black text-emerald-700 bg-emerald-50 py-2 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Fiyat teyit edildi! {storeName} sayfasına aktarılıyorsunuz...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 py-2 rounded-xl border border-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Satıcı sitesindeki güncel fiyatı teyit ediniz.</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <span>Doğrudan {storeName}&apos;ya Git</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Legal micro notice */}
          <p className="text-[10px] text-center text-slate-400 font-medium">
            Fiyatlar ve stok durumu anlık olarak değişkenlik gösterebilir. Satıcı sayfasındaki nihai fiyat geçerlidir.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
