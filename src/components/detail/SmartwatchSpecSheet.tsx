import React from 'react';
import type {Product} from '@/lib/types';
import {SMARTWATCH_SPEC_FIELDS,smartwatchProductSpecText} from '@/lib/smartwatchSpecFields';

export function SmartwatchSpecSheet({product}:{product:Product}) {
  return <div data-testid="smartwatch-spec-sheet" className="space-y-4">
    <p className="text-xs leading-relaxed text-slate-500">Kayıtlı katalog bilgileri gösterilir. Eksik değerler bilinmiyor olarak belirtilir; görselin kaynaklı olması teknik özelliklerin doğrulandığı anlamına gelmez.</p>
    <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {SMARTWATCH_SPEC_FIELDS.map(field=><div key={field.paths} className="min-w-0 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <dt className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{field.label}</dt>
        <dd className="mt-1 text-xs font-black text-slate-900 break-words">{smartwatchProductSpecText(product,field)}</dd>
      </div>)}
    </dl>
  </div>;
}
