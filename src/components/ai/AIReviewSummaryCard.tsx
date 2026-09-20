import React from 'react';
import { Product } from '@/lib/types';
import { MessageSquare } from 'lucide-react';

export function AIReviewSummaryCard({ product }: { product: Product }) {
  if (!product) return null;
  return (
    <section className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-3">
      <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-emerald-600" />Kullanıcı Deneyimleri</h3>
      <p className="text-sm text-slate-600">Bu ürün için kaynakları doğrulanmış yorum verisi henüz bulunmuyor.</p>
      <p className="text-xs text-slate-500">Yorum özeti ve memnuniyet oranı, yeterli yorum verisi olduğunda gösterilecek.</p>
    </section>
  );
}
