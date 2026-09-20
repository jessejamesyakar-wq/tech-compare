import type { Product } from '@/lib/types';
import { getDuelRows, getMetricOutcome, describeMetric } from '@/lib/comparisonEvidence';

export interface ScenarioVerdict {
  category: 'features' | 'value';
  iconName: 'Camera' | 'BatteryCharging' | 'Coins' | 'Cpu' | 'Monitor' | 'Tv' | 'Gamepad' | 'Headphones' | 'Watch' | 'Sparkles' | 'Zap';
  label: string;
  winnerProductId: string | null;
  winnerProductName: string;
  winnerBrand: string;
  winnerAdvantage: string;
  reason: string;
}
export interface RefereeVerdictResult {
  headline:string; summary:string; scenarios:ScenarioVerdict[];
  recommendation1:string; recommendation2:string;
}

/** Factual per-field comparison, not a generated quality or suitability score. */
export function generateRefereeVerdict(p1:Product,p2:Product):RefereeVerdictResult {
  const products=[p1,p2];
  return {
    headline:'Kayıtlı Özelliklerin Karşılaştırması',
    summary:'Katalogdaki sayısal farklar genel ürün kalitesi veya kullanım deneyimi sonucu değildir.',
    scenarios:getDuelRows(products).slice(0,3).map(row=>{
      const outcome=getMetricOutcome(row,products);
      const winner=outcome===1?p1:outcome===2?p2:null;
      return {category:row.id==='price'?'value':'features',iconName:row.id==='price'?'Coins':'Sparkles',label:row.label,
        winnerProductId:winner?.id??null,winnerProductName:winner?.name??(outcome==='tie'?'Kayıtlı değerler eşit':'Kazanan belirlenmedi'),winnerBrand:winner?.brand??'',
        winnerAdvantage:winner?(row.direction==='lower'?'Daha düşük kayıtlı değer':'Daha yüksek kayıtlı değer'):(outcome==='tie'?'Eşit değer':'Yeterli karşılaştırılabilir veri yok'),
        reason:describeMetric(row,products)};
    }),
    recommendation1:`${p1.name}: seçiminizi sizin için önemli olan özelliklere göre yapın. Eksik özellikler destek var veya yok şeklinde yorumlanmaz.`,
    recommendation2:`${p2.name}: katalog bilgilerini üreticiyle, güncel fiyat ve stok durumunu satıcıyla kontrol edin. Genel kazananı belirleyen doğrulanmış ortak bir puanlama yöntemi yok.`,
  };
}
