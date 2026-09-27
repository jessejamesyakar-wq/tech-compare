import React from 'react';
import Link from 'next/link';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import type { Product } from '@/lib/types';

interface FieldSourcesEvidenceProps {
  product: Product;
}

export function FieldSourcesEvidence({ product }: FieldSourcesEvidenceProps) {
  const sources = product.fieldSources || [];
  const hasSources = sources.length > 0;

  const isValidHttpUrl = (url?: string) => {
    if (!url || typeof url !== 'string') return false;
    try {
      const u = new URL(url.trim());
      return (u.protocol === 'http:' || u.protocol === 'https:') && !u.username && !u.password;
    } catch {
      return false;
    }
  };

  return (
    <div className="pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-2">
      <div className="flex items-center gap-1.5 font-bold text-slate-900">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Teknik Özellik Kaynak Doğrulamaları</span>
      </div>

      {hasSources ? (
        <div className="space-y-2">
          {sources.map((src, idx) => (
            <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] font-semibold text-slate-500">
                <span>Kontrol Tarihi: {src.checkedAt}</span>
                {isValidHttpUrl(src.sourceUrl) && (
                  <a
                    href={src.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-600 hover:underline font-bold"
                  >
                    <span>Kaynağı Aç</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="text-slate-800 font-bold">
                Kapsanan Alanlar: <span className="font-normal text-slate-700">{src.fields.join(', ')}</span>
              </div>
              {src.scopeNote && (
                <div className="text-[11px] text-slate-500 italic">
                  Not: {src.scopeNote}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-slate-500 font-medium">
          Katalog kaynak doğrulaması bekliyor.
        </div>
      )}

      <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <span className="text-slate-400">
          Mağaza teklif kontrol tarihleri ürün teknik özellik doğrulaması yerine geçmez.
        </span>
        <Link
          href={`/iletisim?subject=hatali-bilgi&productId=${encodeURIComponent(product.id)}`}
          className="text-emerald-600 hover:text-emerald-700 font-bold underline"
        >
          Hatalı Bilgi Bildir
        </Link>
      </div>
    </div>
  );
}
