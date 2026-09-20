import React from 'react';
import type { Product } from '@/lib/types';
import { getSpecVerificationNotice } from '@/lib/specVerification';

export function ProductSpecSources({ product }: { product: Product }) {
  const notice = getSpecVerificationNotice(product);
  const sources = (product.fieldSources || []).flatMap(source => {
    try {
      const url = new URL(source.sourceUrl);
      return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password
        ? [{ ...source, host: url.hostname.replace(/^www\./, '') }] : [];
    } catch { return []; }
  });
  if (!notice && !sources.length) return null;
  return <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-slate-700" data-testid="product-spec-sources">
    {notice && <p>{notice}</p>}
    {sources.length > 0 && <details className={notice ? 'mt-2' : ''}>
      <summary className="cursor-pointer font-semibold py-3 min-h-11 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">Teknik bilgi kaynakları</summary>
      <p className="mt-1">Kaynaklar yalnız belirtilen özellikler içindir; fiyat, stok ve tüm ürünün doğrulandığı anlamına gelmez.</p>
      <ul className="mt-2 space-y-2">
        {sources.map((source, index) => <li key={`${source.sourceUrl}-${index}`}>
          <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-block py-3 min-h-11 font-semibold underline break-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">{source.host} — kaynağı aç</a>
          {source.scopeNote && <p>{source.scopeNote}</p>}
        </li>)}
      </ul>
    </details>}
  </div>;
}
