import React from 'react';
import { TVProduct } from '@/lib/types';
import { calculateTVScore } from '@/lib/tvScoring';
import { Tv, Gamepad2, Volume2, Cpu, Sparkles } from 'lucide-react';

export function TVScoreBreakdown({ tv }: { tv: TVProduct }) {
  const { totalScore, categories } = calculateTVScore(tv);
  const rows = [
    { icon: Tv, data: categories.display }, { icon: Gamepad2, data: categories.gaming },
    { icon: Volume2, data: categories.audio }, { icon: Cpu, data: categories.smart },
    { icon: Sparkles, data: categories.design },
  ];
  return (
    <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      <div className="space-y-2 border-b border-slate-100 pb-4">
        <h2 className="text-xl font-black text-slate-900">Katalogdaki Teknik Özet</h2>
        <p className="text-xs text-slate-500">Özellikler katalog kayıtlarından gösterilir; bağımsız performans ölçümü değildir.</p>
        {totalScore !== null && <p className="text-xs text-slate-600">Kayıtlı katalog puanı: {totalScore} / 100. Puanın ölçüm yöntemi doğrulanmadı.</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rows.map(({icon:Icon,data})=><div key={data.title} className="min-w-0 flex items-start gap-3 rounded-2xl bg-slate-50 border border-slate-200 p-4">
          <Icon className="w-5 h-5 shrink-0 text-emerald-700" />
          <div className="min-w-0"><h3 className="text-xs font-black text-slate-900">{data.title}</h3><p className="text-xs text-slate-600 break-words mt-1">{data.details}</p></div>
        </div>)}
      </div>
    </section>
  );
}
