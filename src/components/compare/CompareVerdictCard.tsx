'use client';

import React from 'react';
import { Product } from '@/lib/types';
import { Sparkles, Award, CheckCircle2, AlertCircle } from 'lucide-react';

interface CompareVerdictCardProps {
  products: Product[];
}

interface ProductVerdict {
  id: string;
  name: string;
  brand: string;
  score: number;
  pros: string[];
  cons: string;
  idealFor: string;
}

export function CompareVerdictCard({ products }: CompareVerdictCardProps) {
  if (!products || products.length < 2) return null;

  const verdicts: ProductVerdict[] = products.map((p) => {
    const pros: string[] = [];
    let con = 'Temel segment özellikleri';
    let idealFor = 'Günlük kullanım ve multimedya için dengeli tercih.';
    const specs = (p.specs || {}) as Record<string, any>;
    const score = p.epeyScore || (p.rating ? Math.round(p.rating * 20) : 85);

    if (p.category === 'monitors') {
      const hz = specs.refreshRateHz || 60;
      const ms = specs.responseTimeMs || 4;
      const res = specs.resolution || '1080p';
      const panel = specs.panelType || 'IPS';
      const hdr = specs.hdrSupport || '';

      if (hz >= 240) pros.push(`${hz}Hz Ultra Yüksek Yenileme Hızı`);
      else if (hz >= 144) pros.push(`${hz}Hz Akıcı E-Spor Paneli`);
      
      if (ms <= 1) pros.push(`${ms}ms Ultra Düşük Gecikme`);
      if (res.includes('3840') || res.includes('4K')) pros.push('4K UHD Ultra Net Çözünürlük');
      else if (res.includes('2560') || res.includes('1440') || res.includes('WQHD')) pros.push('2K WQHD Yüksek Detay');
      
      if (panel.includes('IPS') || panel.includes('OLED')) pros.push(`${panel} Geniş Görüş ve Canlı Renkler`);
      if (hdr && hdr !== 'Yok') pros.push(`${hdr} Dinamik Aralık Desteği`);

      if (hz < 144) con = 'Rekabetçi e-spor oyunları için standart yenileme hızı';
      else if (!hdr || hdr === 'Yok') con = 'Temel seviye parlaklık ve HDR aralığı';
      else con = 'Yüksek güç tüketimi gereksinimi';

      idealFor = hz >= 240
        ? 'Profesyonel CS2, Valorant ve hızlı e-spor oyuncuları için ideal.'
        : res.includes('4K') || panel.includes('IPS')
        ? 'İçerik üreticileri, video kurgu ve yüksek çözünürlüklü grafik çalışmaları için ideal.'
        : 'Oyun ve ofis kullanımını dengeli birleştirmek isteyenler için ideal.';
    } else if (p.category === 'laptops') {
      const cpu = specs.processor || '';
      const gpu = specs.gpu || '';
      const ram = specs.ramGb || 16;
      const npu = specs.npuTops || 0;

      if (cpu) pros.push(`${cpu.split(' ')[0]} Yüksek Performans İşlemci`);
      if (gpu && !gpu.toLowerCase().includes('intel') && !gpu.toLowerCase().includes('iris')) pros.push(`${gpu} Harici Grafik Kartı`);
      if (ram >= 32) pros.push(`${ram}GB Yüksek Kapasiteli RAM`);
      if (npu > 0) pros.push(`${npu} TOPS Yapay Zekâ NPU Birimi`);

      con = specs.weightKg && specs.weightKg > 2.2 ? 'Ağır gövde, taşınabilirlik sınırlı' : 'Yüksek yük altında fan sesi';
      idealFor = gpu && !gpu.toLowerCase().includes('intel')
        ? '3D render, yazılım geliştirme ve AAA oyunlar için ideal güç.'
        : 'Ofis, üniversite ve uzun pil ömrü odaklı mobil çalışma için ideal.';
    } else if (p.category === 'tvs') {
      const tech = specs.displayTech || 'LED';
      const hz = specs.refreshRateHz || 60;
      const audio = specs.audioPowerWatts || 20;

      if (tech.toLowerCase().includes('oled')) pros.push('Sonsuz Kontrast ve Kusursuz Siyah Seviyesi');
      else if (tech.toLowerCase().includes('mini')) pros.push('Yüksek Zirve Parlaklık & Mini-LED Hassasiyeti');
      
      if (hz >= 120) pros.push(`${hz}Hz PS5 & Xbox Yeni Nesil Konsol Desteği`);
      if (audio >= 40) pros.push(`${audio}W Güçlü Sinema Ses Sistemi`);

      con = hz < 120 ? 'Yeni nesil konsollarda 120 FPS desteği bulunmuyor' : 'Geniş oda aydınlatmasında yansıma yönetimi';
      idealFor = tech.toLowerCase().includes('oled')
        ? 'Karanlık oda sinema keyfi ve film tutkunları için zirve görüntü.'
        : 'Aydınlık salonlar, spor yayınları ve konsol oyunları için ideal.';
    } else if (p.category === 'headphones') {
      const anc = specs.anc;
      const battery = specs.batteryLife;
      const driver = specs.driverSizeMm;

      if (anc && anc !== 'Yok') pros.push('Aktif Gürültü Engelleme (ANC)');
      if (battery) pros.push(`${battery} Uzun Pil Ömrü`);
      if (driver) pros.push(`${driver}mm Geniş Akustik Sürücüler`);

      con = 'Yüksek ses seviyesinde dışarı ses sızdırma';
      idealFor = 'Müzik dinleme, seyahat ve odaklanma için yüksek konfor.';
    } else if (p.category === 'smartwatches') {
      const gps = specs.gps;
      const water = specs.waterResistance;
      const bat = specs.batteryLife;

      if (gps) pros.push('Dahili Hassas Konum GPS Desteği');
      if (water) pros.push(`${water} Suya ve Toza Dayanıklılık`);
      if (bat) pros.push(`${bat} Pil Süresi`);

      con = 'Ekran her zaman açık modunda hızlı pil tüketimi';
      idealFor = 'Spor, fitness ve sağlık takibi odaklı kullanıcılar için ideal.';
    } else {
      // Smartphones or Generic
      const chip = specs.processor?.chip || specs.processor || '';
      const cam = specs.camera?.mainMp || specs.camera || '';
      const bat = specs.battery?.capacitymAh || specs.battery || '';

      if (chip) pros.push(`${chip.split(' ')[0]} Zirve İşlemci Gücü`);
      if (cam) pros.push(`${cam.split(' ')[0]} Yüksek Çözünürlüklü Kamera Sistemi`);
      if (bat) pros.push(`${bat.split(' ')[0]} Uzun Ömürlü Batarya Kapasitesi`);
      if (p.highlights?.[0]) pros.push(p.highlights[0]);

      con = p.basePrice > 60000 ? 'Yüksek amiral gemisi fiyat segmenti' : 'Standart kutu içeriği ve şarj hızı';
      idealFor = p.basePrice > 60000
        ? 'En üst düzey kamera, malzeme kalitesi ve uzun vadeli güncelleme isteyenler için ideal.'
        : 'Fiyat/performans dengesini gözeten günlük ve multimedya kullanıcıları için ideal.';
    }

    return {
      id: p.id,
      name: p.name,
      brand: p.brand,
      score,
      pros: pros.slice(0, 3),
      cons: con,
      idealFor
    };
  });

  return (
    <div className="bg-gradient-to-br from-emerald-500/10 via-white to-indigo-500/10 border border-emerald-500/30 rounded-3xl p-5 sm:p-7 shadow-md space-y-6 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-[11px] font-black px-3 py-1 rounded-full border border-emerald-300 shadow-2xs mb-1.5 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Yapay Zekâ Destekli Karşılaştırma Kararı</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Hangi Modeli Seçmelisiniz?</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Teknik donanım, fiyat ve kullanım senaryosu analizine göre anlık özet karar tablosu.
          </p>
        </div>
      </div>

      {/* Product Decision Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {verdicts.map((v) => (
          <div
            key={v.id}
            className="bg-white/90 backdrop-blur-md border border-slate-200/90 hover:border-emerald-500/50 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-sm space-y-3.5 transition-all"
          >
            {/* Top Name & Score */}
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                  {v.brand}
                </span>
                <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-black shadow-2xs">
                  <Award className="w-3 h-3 text-amber-600" />
                  <span>{v.score} / 100</span>
                </div>
              </div>

              <h4 className="text-sm font-black text-slate-900 line-clamp-2 leading-snug pt-1">
                {v.name}
              </h4>
            </div>

            {/* Pros List */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Öne Çıkan Güçlü Yönler:
              </span>
              <ul className="space-y-1">
                {v.pros.map((pro, pIdx) => (
                  <li key={pIdx} className="text-xs font-bold text-slate-800 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Con Note */}
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[11px] font-medium text-slate-600 flex items-start gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200/70">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span className="text-[10.5px]"><strong>Dikkat:</strong> {v.cons}</span>
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-emerald-50/70 border border-emerald-200/70 p-2.5 rounded-xl">
              <span className="text-[9.5px] font-black text-emerald-800 uppercase tracking-widest block mb-0.5">
                🎯 Kime Göre?
              </span>
              <p className="text-[11px] font-bold text-emerald-950 leading-relaxed">
                {v.idealFor}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
