'use client';

import React, { useState } from 'react';
import {
  Cpu,
  Smartphone,
  Camera,
  BatteryCharging,
  Wifi,
  ChevronDown,
  ChevronUp,
  Award,
  Sparkles,
  Flame,
  CheckCircle2
} from 'lucide-react';
import {
  calculatePpiComparison,
  calculateWattComparison,
  getWirelessChargingText,
  getWirelessWinner
} from '@/lib/compareMetrics';

interface Product {
  id: string;
  name: string;
  brand: string;
  image: string;
  basePrice: number;
  rating?: number;
  specs?: {
    screen?: {
      size?: string;
      resolution?: string;
      refreshRate?: number;
      type?: string;
      brightness?: number;
      ppi?: number;
    };
    processor?: {
      chip?: string;
      cores?: string;
      antutuScore?: number;
      geekbenchSingle?: number;
      geekbenchMulti?: number;
      process?: string;
    };
    battery?: {
      capacitymAh?: number;
      chargingWatts?: number;
      wirelessCharging?: boolean;
    };
    camera?: {
      mainMp?: string;
      ultrawideMp?: string;
      telephotoMp?: string;
      frontMp?: string;
      ois?: boolean;
    };
  };
}

interface DeepCompareSectionsProps {
  product1: any;
  product2: any;
}

interface MetricItem {
  label: string;
  p1Val: string | number;
  p2Val: string | number;
  winner?: 1 | 2 | 'tie';
  p1BarPercent?: number;
  p2BarPercent?: number;
  advantageText?: string;
}

interface SectionData {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  winner: 1 | 2 | 'tie';
  winnerSummary: string;
  metrics: MetricItem[];
}

export function DeepCompareSections({ product1, product2 }: DeepCompareSectionsProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    soc: true,
    display: true,
    camera: true,
    battery: true,
    connectivity: false
  });

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAll = (open: boolean) => {
    setExpandedSections({
      soc: open,
      display: open,
      camera: open,
      battery: open,
      connectivity: open
    });
  };

  const s1 = product1.specs || {};
  const s2 = product2.specs || {};

  // Benchmark calculations - strictly sourced from verified specs
  const p1HasAntutu = typeof s1.processor?.antutuScore === 'number' && s1.processor.antutuScore > 0;
  const p2HasAntutu = typeof s2.processor?.antutuScore === 'number' && s2.processor.antutuScore > 0;
  const antutu1 = p1HasAntutu ? s1.processor.antutuScore : null;
  const antutu2 = p2HasAntutu ? s2.processor.antutuScore : null;
  const maxAntutu = Math.max(antutu1 || 0, antutu2 || 0, 2400000);

  const antutuWinner: 1 | 2 | 'tie' | undefined = (antutu1 && antutu2)
    ? (antutu1 === antutu2 ? 'tie' : (antutu1 > antutu2 ? 1 : 2))
    : undefined;
  const antutuAdvantage = (antutu1 && antutu2)
    ? (antutu1 === antutu2 ? 'Eşit Performans Skoru' : `+${Math.abs(Math.round(((antutu1 - antutu2) / Math.min(antutu1, antutu2)) * 100))}% Hız Farkı`)
    : undefined;

  const geekSingle1 = typeof s1.processor?.geekbenchSingle === 'number' ? s1.processor.geekbenchSingle : null;
  const geekSingle2 = typeof s2.processor?.geekbenchSingle === 'number' ? s2.processor.geekbenchSingle : null;
  const geekSingleWinner: 1 | 2 | 'tie' | undefined = (geekSingle1 && geekSingle2)
    ? (geekSingle1 === geekSingle2 ? 'tie' : (geekSingle1 > geekSingle2 ? 1 : 2))
    : undefined;

  const geekMulti1 = typeof s1.processor?.geekbenchMulti === 'number' ? s1.processor.geekbenchMulti : null;
  const geekMulti2 = typeof s2.processor?.geekbenchMulti === 'number' ? s2.processor.geekbenchMulti : null;
  const geekMultiWinner: 1 | 2 | 'tie' | undefined = (geekMulti1 && geekMulti2)
    ? (geekMulti1 === geekMulti2 ? 'tie' : (geekMulti1 > geekMulti2 ? 1 : 2))
    : undefined;

  const nits1 = s1.screen?.brightnessNits || s1.screen?.brightness || null;
  const nits2 = s2.screen?.brightnessNits || s2.screen?.brightness || null;
  const maxNits = Math.max(nits1 || 0, nits2 || 0, 3000);
  const nitsWinner: 1 | 2 | 'tie' | undefined = (nits1 && nits2)
    ? (nits1 === nits2 ? 'tie' : (nits1 > nits2 ? 1 : 2))
    : undefined;
  const nitsAdvantage = (nits1 && nits2)
    ? (nits1 === nits2 ? 'Eşit Parlaklık' : `+${Math.abs(nits1 - nits2)} Nit Daha Parlak`)
    : undefined;

  const ppi1 = s1.screen?.ppi || null;
  const ppi2 = s2.screen?.ppi || null;
  const ppiComp = calculatePpiComparison(ppi1, ppi2);
  const ppiWinner = ppiComp.winner;
  const ppiAdvantage = ppiComp.advantage;

  const bat1 = s1.battery?.capacitymAh || null;
  const bat2 = s2.battery?.capacitymAh || null;
  const batWinner: 1 | 2 | 'tie' | undefined = (bat1 && bat2)
    ? (bat1 === bat2 ? 'tie' : (bat1 > bat2 ? 1 : 2))
    : undefined;
  const batAdvantage = (bat1 && bat2)
    ? (bat1 === bat2 ? 'Eşit Kapasite' : `+${Math.abs(bat1 - bat2)} mAh Daha Yüksek Kapasite`)
    : undefined;

  const watt1 = s1.battery?.chargingWatts || null;
  const watt2 = s2.battery?.chargingWatts || null;
  const wattComp = calculateWattComparison(watt1, watt2);
  const wattWinner = wattComp.winner;
  const wattAdvantage = wattComp.advantage;

  // Wireless Charging Sourced Resolution
  const wc1 = s1.battery?.wirelessCharging;
  const wc2 = s2.battery?.wirelessCharging;
  const getWirelessText = (wc: boolean | undefined, watts?: number) => getWirelessChargingText(wc, watts);
  const wirelessWinner = getWirelessWinner(wc1, wc2);
  const wirelessAdvantage = wirelessWinner === 1
    ? `${product1.brand} Kablosuz Şarj Destekliyor`
    : (wirelessWinner === 2 ? `${product2.brand} Kablosuz Şarj Destekliyor` : undefined);

  const parseMp = (val: string | undefined): number => {
    if (!val) return 0;
    const match = String(val).match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const mainMp1 = parseMp(s1.camera?.mainMp);
  const mainMp2 = parseMp(s2.camera?.mainMp);
  const mainMpWinner: 1 | 2 | 'tie' | undefined = (mainMp1 > 0 && mainMp2 > 0)
    ? (mainMp1 === mainMp2 ? 'tie' : (mainMp1 > mainMp2 ? 1 : 2))
    : undefined;
  const mainMpAdvantage = (mainMp1 > 0 && mainMp2 > 0)
    ? (mainMp1 === mainMp2 ? 'Eşit Çözünürlük' : `${Math.max(mainMp1, mainMp2)} MP Daha Yüksek Çözünürlük`)
    : undefined;

  const calcSectionWinner = (metrics: MetricItem[]): { winner: 1 | 2 | 'tie'; summary: string } => {
    let w1 = 0;
    let w2 = 0;
    let ties = 0;
    for (const m of metrics) {
      if (m.winner === 1) w1++;
      else if (m.winner === 2) w2++;
      else if (m.winner === 'tie') ties++;
    }
    if (w1 > w2) {
      return { winner: 1, summary: `${product1.brand} doğrulanmış teknik kriterlerde önde` };
    }
    if (w2 > w1) {
      return { winner: 2, summary: `${product2.brand} doğrulanmış teknik kriterlerde önde` };
    }
    if (ties > 0 || (w1 > 0 && w1 === w2)) {
      return { winner: 'tie', summary: 'Her iki model de doğrulanmış kriterlerde dengeli performans sunuyor' };
    }
    return { winner: 'tie', summary: 'Karşılaştırma için doğrulanmış teknik veriler listeleniyor' };
  };

  const socMetrics: MetricItem[] = [
    {
      label: 'Yonga Seti (SoC)',
      p1Val: s1.processor?.chip || 'Doğrulanmış veri yok',
      p2Val: s2.processor?.chip || 'Doğrulanmış veri yok',
    },
    {
      label: 'Üretim Teknolojisi (Litografi)',
      p1Val: s1.processor?.process || 'Doğrulanmış veri yok',
      p2Val: s2.processor?.process || 'Doğrulanmış veri yok',
      winner: s1.processor?.process && s2.processor?.process
        ? (s1.processor.process === s2.processor.process ? 'tie' : (s1.processor.process.includes('3nm') ? 1 : (s2.processor.process.includes('3nm') ? 2 : undefined)))
        : undefined,
      advantageText: s1.processor?.process && s2.processor?.process && s1.processor.process !== s2.processor.process && (s1.processor.process.includes('3nm') || s2.processor.process.includes('3nm'))
        ? 'Daha Verimli Mimari'
        : undefined,
    },
    {
      label: 'Çekirdek Yapısı ve Azami Hız',
      p1Val: s1.processor?.cores || 'Doğrulanmış veri yok',
      p2Val: s2.processor?.cores || 'Doğrulanmış veri yok',
    },
    {
      label: 'AnTuTu v10 Genel Skoru',
      p1Val: antutu1 ? `${antutu1.toLocaleString('tr-TR')} Puan` : 'Doğrulanmış veri yok',
      p2Val: antutu2 ? `${antutu2.toLocaleString('tr-TR')} Puan` : 'Doğrulanmış veri yok',
      winner: antutuWinner,
      p1BarPercent: antutu1 ? Math.round((antutu1 / maxAntutu) * 100) : undefined,
      p2BarPercent: antutu2 ? Math.round((antutu2 / maxAntutu) * 100) : undefined,
      advantageText: antutuAdvantage,
    },
    ...(geekSingle1 || geekSingle2 ? [{
      label: 'Geekbench 6 Tek Çekirdek',
      p1Val: geekSingle1 ? `${geekSingle1} Puan` : 'Doğrulanmış veri yok',
      p2Val: geekSingle2 ? `${geekSingle2} Puan` : 'Doğrulanmış veri yok',
      winner: geekSingleWinner,
    }] : []),
    ...(geekMulti1 || geekMulti2 ? [{
      label: 'Geekbench 6 Çoklu Çekirdek',
      p1Val: geekMulti1 ? `${geekMulti1} Puan` : 'Doğrulanmış veri yok',
      p2Val: geekMulti2 ? `${geekMulti2} Puan` : 'Doğrulanmış veri yok',
      winner: geekMultiWinner,
    }] : []),
    {
      label: 'Yapay Zekâ NPU Motoru',
      p1Val: s1.memory?.ramType?.includes('Neural') ? s1.memory.ramType : (s1.processor?.chip ? `${s1.processor.chip} AI Motoru` : 'Doğrulanmış veri yok'),
      p2Val: s2.memory?.ramType?.includes('Neural') ? s2.memory.ramType : (s2.processor?.chip ? `${s2.processor.chip} AI Motoru` : 'Doğrulanmış veri yok'),
    },
  ];
  const socVerdict = calcSectionWinner(socMetrics);

  const displayMetrics: MetricItem[] = [
    {
      label: 'Panel Teknolojisi',
      p1Val: s1.screen?.type || 'Doğrulanmış veri yok',
      p2Val: s2.screen?.type || 'Doğrulanmış veri yok',
      winner: s1.screen?.type && s2.screen?.type && s1.screen.type === s2.screen.type ? 'tie' : undefined,
    },
    {
      label: 'Ekran Boyutu & Çözünürlük',
      p1Val: s1.screen?.size ? `${s1.screen.size} • ${s1.screen.resolution || ''}`.trim() : (s1.screen?.resolution || 'Doğrulanmış veri yok'),
      p2Val: s2.screen?.size ? `${s2.screen.size} • ${s2.screen.resolution || ''}`.trim() : (s2.screen?.resolution || 'Doğrulanmış veri yok'),
    },
    {
      label: 'Tepe Parlaklık (Peak Nits)',
      p1Val: nits1 ? `${nits1} nits` : 'Doğrulanmış veri yok',
      p2Val: nits2 ? `${nits2} nits` : 'Doğrulanmış veri yok',
      winner: nitsWinner,
      p1BarPercent: nits1 ? Math.round((nits1 / maxNits) * 100) : undefined,
      p2BarPercent: nits2 ? Math.round((nits2 / maxNits) * 100) : undefined,
      advantageText: nitsAdvantage,
    },
    {
      label: 'Piksel Yoğunluğu (PPI)',
      p1Val: ppi1 ? `${ppi1} ppi` : 'Doğrulanmış veri yok',
      p2Val: ppi2 ? `${ppi2} ppi` : 'Doğrulanmış veri yok',
      winner: ppiWinner,
      advantageText: ppiAdvantage,
    },
    {
      label: 'Yenileme Hızı',
      p1Val: s1.screen?.refreshRate ? `${s1.screen.refreshRate} Hz` : 'Doğrulanmış veri yok',
      p2Val: s2.screen?.refreshRate ? `${s2.screen.refreshRate} Hz` : 'Doğrulanmış veri yok',
      winner: s1.screen?.refreshRate && s2.screen?.refreshRate
        ? (s1.screen.refreshRate === s2.screen.refreshRate ? 'tie' : (s1.screen.refreshRate > s2.screen.refreshRate ? 1 : 2))
        : undefined,
      advantageText: s1.screen?.refreshRate && s2.screen?.refreshRate && s1.screen.refreshRate !== s2.screen.refreshRate
        ? `+${Math.abs(s1.screen.refreshRate - s2.screen.refreshRate)} Hz Daha Akıcı`
        : undefined,
    },
  ];
  const displayVerdict = calcSectionWinner(displayMetrics);

  const cameraMetrics: MetricItem[] = [
    {
      label: 'Ana Sensör Çözünürlüğü',
      p1Val: s1.camera?.mainMp || 'Doğrulanmış veri yok',
      p2Val: s2.camera?.mainMp || 'Doğrulanmış veri yok',
      winner: mainMpWinner,
      advantageText: mainMpAdvantage,
    },
    {
      label: 'Ultra Geniş Açı Sensörü',
      p1Val: s1.camera?.ultrawideMp || 'Doğrulanmış veri yok',
      p2Val: s2.camera?.ultrawideMp || 'Doğrulanmış veri yok',
    },
    {
      label: 'Telefoto / Periskop Zoom',
      p1Val: s1.camera?.telephotoMp || 'Doğrulanmış veri yok',
      p2Val: s2.camera?.telephotoMp || 'Doğrulanmış veri yok',
    },
    {
      label: 'Profesyonel Video Kaydı',
      p1Val: s1.camera?.videoRes || 'Doğrulanmış veri yok',
      p2Val: s2.camera?.videoRes || 'Doğrulanmış veri yok',
    },
    {
      label: 'Ön Kamera (Selfie)',
      p1Val: s1.camera?.selfieMp || s1.camera?.frontMp || 'Doğrulanmış veri yok',
      p2Val: s2.camera?.selfieMp || s2.camera?.frontMp || 'Doğrulanmış veri yok',
    },
  ];
  const cameraVerdict = calcSectionWinner(cameraMetrics);

  const batteryMetrics: MetricItem[] = [
    {
      label: 'Pil Kapasitesi',
      p1Val: bat1 ? `${bat1.toLocaleString('tr-TR')} mAh` : 'Doğrulanmış veri yok',
      p2Val: bat2 ? `${bat2.toLocaleString('tr-TR')} mAh` : 'Doğrulanmış veri yok',
      winner: batWinner,
      p1BarPercent: bat1 ? Math.round((bat1 / 5500) * 100) : undefined,
      p2BarPercent: bat2 ? Math.round((bat2 / 5500) * 100) : undefined,
      advantageText: batAdvantage,
    },
    {
      label: 'Kablolu Hızlı Şarj Gücü',
      p1Val: watt1 ? `${watt1}W Hızlı Şarj` : 'Doğrulanmış veri yok',
      p2Val: watt2 ? `${watt2}W Hızlı Şarj` : 'Doğrulanmış veri yok',
      winner: wattWinner,
      advantageText: wattAdvantage,
    },
    {
      label: 'Kablosuz Şarj Standardı',
      p1Val: getWirelessText(wc1, s1.battery?.wirelessWatts),
      p2Val: getWirelessText(wc2, s2.battery?.wirelessWatts),
      winner: wirelessWinner,
      advantageText: wirelessAdvantage,
    },
  ];
  const batteryVerdict = calcSectionWinner(batteryMetrics);

  const connectivityMetrics: MetricItem[] = [
    {
      label: 'Gövde & Çerçeve Malzemesi',
      p1Val: s1.build?.frameMaterial || s1.build?.frame || 'Doğrulanmış veri yok',
      p2Val: s2.build?.frameMaterial || s2.build?.frame || 'Doğrulanmış veri yok',
    },
    {
      label: 'Su ve Toz Dayanıklılığı',
      p1Val: s1.build?.waterResistance || s1.features?.waterResistance || 'Doğrulanmış veri yok',
      p2Val: s2.build?.waterResistance || s2.features?.waterResistance || 'Doğrulanmış veri yok',
      winner: s1.build?.waterResistance && s2.build?.waterResistance
        ? (s1.build.waterResistance === s2.build.waterResistance ? 'tie' : undefined)
        : undefined,
    },
    {
      label: 'Wi-Fi Standardı',
      p1Val: s1.connectivity?.wifiStandard || 'Doğrulanmış veri yok',
      p2Val: s2.connectivity?.wifiStandard || 'Doğrulanmış veri yok',
    },
    {
      label: 'Bluetooth Sürümü',
      p1Val: s1.connectivity?.bluetooth ? `Bluetooth ${s1.connectivity.bluetooth}` : 'Doğrulanmış veri yok',
      p2Val: s2.connectivity?.bluetooth ? `Bluetooth ${s2.connectivity.bluetooth}` : 'Doğrulanmış veri yok',
    },
    {
      label: '5G Desteği',
      p1Val: s1.connectivity?.has5G !== undefined ? (s1.connectivity.has5G ? '5G Destekleniyor' : '5G Yok') : 'Doğrulanmış veri yok',
      p2Val: s2.connectivity?.has5G !== undefined ? (s2.connectivity.has5G ? '5G Destekleniyor' : '5G Yok') : 'Doğrulanmış veri yok',
      winner: s1.connectivity?.has5G !== undefined && s2.connectivity?.has5G !== undefined
        ? (s1.connectivity.has5G === s2.connectivity.has5G ? 'tie' : (s1.connectivity.has5G ? 1 : 2))
        : undefined,
    },
  ];
  const connectivityVerdict = calcSectionWinner(connectivityMetrics);

  const sections: SectionData[] = [
    {
      id: 'soc',
      title: 'İşlemci, Çip & Grafik Mimarisi (SoC & GPU)',
      subtitle: 'Doğrulanmış AnTuTu skorları, NPU ve litografi mimarisi',
      icon: Cpu,
      winner: socVerdict.winner,
      winnerSummary: socVerdict.summary,
      metrics: socMetrics,
    },
    {
      id: 'display',
      title: 'Ekran & Panel Mühendisliği',
      subtitle: 'Tepe parlaklık (nits), panel tipi, yenileme hızı ve PPI',
      icon: Smartphone,
      winner: displayVerdict.winner,
      winnerSummary: displayVerdict.summary,
      metrics: displayMetrics,
    },
    {
      id: 'camera',
      title: 'Kamera Laboratuvar Verileri & Optik Güç',
      subtitle: 'Sensör çözünürlükleri, optik zoom ve video standartları',
      icon: Camera,
      winner: cameraVerdict.winner,
      winnerSummary: cameraVerdict.summary,
      metrics: cameraMetrics,
    },
    {
      id: 'battery',
      title: 'Batarya, Termal Yönetim ve Şarj Hızları',
      subtitle: 'Kapasite (mAh), kablolu Watt gücü ve doğrulanmış kablosuz şarj desteği',
      icon: BatteryCharging,
      winner: batteryVerdict.winner,
      winnerSummary: batteryVerdict.summary,
      metrics: batteryMetrics,
    },
    {
      id: 'connectivity',
      title: 'Bağlantı Standartları & Kasa Dayanıklılığı',
      subtitle: 'Wi-Fi, Bluetooth sürümü, 5G ve su geçirmezlik koruması',
      icon: Wifi,
      winner: connectivityVerdict.winner,
      winnerSummary: connectivityVerdict.summary,
      metrics: connectivityMetrics,
    },
  ];

  return (
    <div className="w-full space-y-5 pt-2">
      
      {/* Deep Section Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-200">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>VERSUS & ANTUTU DERİN LABORATUVAR KIYASLAMASI</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Flame className="w-5 h-5 text-emerald-600" />
            <span>Mühendislik & Donanım Detayları</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            İşlemci mimarisinden sensör mikron boyutuna, buhar odası soğutmasından su geçirmezlik derinliğine kadar tam döküm.
          </p>
        </div>

        {/* Expand / Collapse All Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleAll(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer"
          >
            Tümünü Aç
          </button>
          <button
            onClick={() => toggleAll(false)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer"
          >
            Tümünü Daralt
          </button>
        </div>
      </div>

      {/* Accordion Categories */}
      <div className="space-y-4">
        {sections.map((sec) => {
          const isOpen = expandedSections[sec.id] ?? false;
          const IconComp = sec.icon;

          return (
            <div
              key={sec.id}
              className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-shadow"
            >
              {/* Category Header Row (Clickable Accordion Trigger) */}
              <button
                onClick={() => toggleSection(sec.id)}
                className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-slate-50/70 via-white to-slate-50/30 hover:bg-slate-50 transition-colors text-left cursor-pointer border-b border-slate-100"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 shadow-xs shrink-0">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                      {sec.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                      {sec.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Winner Pill Badge */}
                  <span
                    className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${
                      sec.winner === 1
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : sec.winner === 2
                        ? 'bg-cyan-50 text-cyan-800 border-cyan-300'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>
                      {sec.winner === 1
                        ? `${product1.brand} Lider`
                        : sec.winner === 2
                        ? `${product2.brand} Lider`
                        : 'Dengeli'}
                    </span>
                  </span>

                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {/* Accordion Body Content */}
              {isOpen && (
                <div className="p-4 sm:p-6 space-y-4 bg-white divide-y divide-slate-100">
                  
                  {/* Category Summary Box */}
                  <div className="flex items-center justify-between gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{sec.winnerSummary}</span>
                    </div>
                  </div>

                  {/* Metrics Table / Rows */}
                  <div className="pt-3 space-y-3">
                    {sec.metrics.map((metric, idx) => (
                      <div
                        key={idx}
                        className="p-3 sm:p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-100/60 border border-slate-200/50 transition-colors"
                      >
                        {/* Metric Label & Optional Advantage Badge */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-black text-slate-700 tracking-wide uppercase">
                            {metric.label}
                          </span>
                          {metric.advantageText && (
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                                metric.winner === 1
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : metric.winner === 2
                                  ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
                                  : 'bg-amber-100 text-amber-800 border-amber-300'
                              }`}
                            >
                              ★ {metric.advantageText}
                            </span>
                          )}
                        </div>

                        {/* Two Device Values */}
                        <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-900">
                          {/* Product 1 Value */}
                          <div
                            className={`p-2.5 rounded-xl border transition-all ${
                              metric.winner === 1
                                ? 'bg-emerald-500/10 border-emerald-400 text-emerald-950 font-black ring-1 ring-emerald-300/60'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <div className="text-[10px] font-extrabold uppercase text-slate-400 mb-0.5">
                              {product1.brand}
                            </div>
                            <div>{metric.p1Val}</div>
                            {metric.p1BarPercent !== undefined && (
                              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                                <div
                                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${metric.p1BarPercent}%` }}
                                />
                              </div>
                            )}
                          </div>

                          {/* Product 2 Value */}
                          <div
                            className={`p-2.5 rounded-xl border transition-all ${
                              metric.winner === 2
                                ? 'bg-cyan-500/10 border-cyan-400 text-cyan-950 font-black ring-1 ring-cyan-300/60'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <div className="text-[10px] font-extrabold uppercase text-slate-400 mb-0.5">
                              {product2.brand}
                            </div>
                            <div>{metric.p2Val}</div>
                            {metric.p2BarPercent !== undefined && (
                              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                                <div
                                  className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${metric.p2BarPercent}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}

export default DeepCompareSections;
