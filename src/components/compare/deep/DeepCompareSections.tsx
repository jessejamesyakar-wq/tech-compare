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
  CheckCircle2,
  Tv,
  Monitor,
  Gamepad2,
  Laptop,
  Zap,
  ShieldCheck,
  Speaker
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

  const category = (product1 as any).category || (product2 as any).category || 'smartphones';
  const isTV = category === 'tvs';
  const isLaptop = category === 'laptops';
  const isMonitor = category === 'monitors';
  const isAppliance = category === 'appliances';

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

  const nits1 = s1.screen?.brightnessNits || s1.screen?.brightness || s1.brightnessNits || null;
  const nits2 = s2.screen?.brightnessNits || s2.screen?.brightness || s2.brightnessNits || null;
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

  let sections: SectionData[] = [];

  // =========================================================================
  // 1. TV'LER İÇİN DERİN KARŞILAŞTIRMA SEKSİYONLARI (SIFIR TELEFON METRİĞİ)
  // =========================================================================
  if (isTV) {
    const tvSize1 = s1.screenSizeInches || null;
    const tvSize2 = s2.screenSizeInches || null;
    const tvHz1 = s1.refreshRateHz || 60;
    const tvHz2 = s2.refreshRateHz || 60;
    const tvAudio1 = s1.audioPowerWatts || null;
    const tvAudio2 = s2.audioPowerWatts || null;
    const tvHdmi1 = s1.hdmiPorts || null;
    const tvHdmi2 = s2.hdmiPorts || null;

    const tvPanelMetrics: MetricItem[] = [
      {
        label: 'Panel Mimarisi & Işık Kaynağı',
        p1Val: s1.displayTech || 'OLED / Mini-LED',
        p2Val: s2.displayTech || 'OLED / Mini-LED',
      },
      {
        label: 'Ekran Boyutu',
        p1Val: tvSize1 ? `${tvSize1} inç (${Math.round(tvSize1 * 2.54)} cm)` : 'Doğrulanmış veri yok',
        p2Val: tvSize2 ? `${tvSize2} inç (${Math.round(tvSize2 * 2.54)} cm)` : 'Doğrulanmış veri yok',
        winner: tvSize1 && tvSize2 ? (tvSize1 === tvSize2 ? 'tie' : (tvSize1 > tvSize2 ? 1 : 2)) : undefined,
        advantageText: tvSize1 && tvSize2 && tvSize1 !== tvSize2 ? `+${Math.abs(tvSize1 - tvSize2)}" Daha Geniş Panel` : undefined,
      },
      {
        label: 'Çözünürlük Standardı',
        p1Val: s1.resolution || '4K Ultra HD (3840x2160)',
        p2Val: s2.resolution || '4K Ultra HD (3840x2160)',
      },
      {
        label: 'Yapay Zekâ Görüntü İşlemcisi',
        p1Val: s1.processorEngine || `${product1.brand} AI Processor`,
        p2Val: s2.processorEngine || `${product2.brand} AI Processor`,
      },
      {
        label: 'HDR Format Desteği',
        p1Val: Array.isArray(s1.hdrFormats) ? s1.hdrFormats.join(', ') : (s1.hdrSupport ? 'HDR Destekli' : 'HDR10, HLG, Dolby Vision'),
        p2Val: Array.isArray(s2.hdrFormats) ? s2.hdrFormats.join(', ') : (s2.hdrSupport ? 'HDR Destekli' : 'HDR10, HLG, Dolby Vision'),
      }
    ];

    const tvGamingMetrics: MetricItem[] = [
      {
        label: 'Panel Doğal Yenileme Hızı',
        p1Val: `${tvHz1} Hz Gerçek Panel`,
        p2Val: `${tvHz2} Hz Gerçek Panel`,
        winner: tvHz1 === tvHz2 ? 'tie' : (tvHz1 > tvHz2 ? 1 : 2),
        advantageText: tvHz1 !== tvHz2 ? `+${Math.abs(tvHz1 - tvHz2)} Hz Daha Hızlı` : undefined,
      },
      {
        label: 'Oyun & Konsol Teknolojileri',
        p1Val: Array.isArray(s1.gamingFeatures) && s1.gamingFeatures.length > 0 ? s1.gamingFeatures.join(' • ') : 'VRR, ALLM, HGIG',
        p2Val: Array.isArray(s2.gamingFeatures) && s2.gamingFeatures.length > 0 ? s2.gamingFeatures.join(' • ') : 'VRR, ALLM, HGIG',
      },
      {
        label: 'HDMI 2.1 Port Sayısı',
        p1Val: tvHdmi1 ? `${tvHdmi1}x HDMI Girişi` : 'HDMI 2.1 (eARC Destekli)',
        p2Val: tvHdmi2 ? `${tvHdmi2}x HDMI Girişi` : 'HDMI 2.1 (eARC Destekli)',
        winner: tvHdmi1 && tvHdmi2 ? (tvHdmi1 === tvHdmi2 ? 'tie' : (tvHdmi1 > tvHdmi2 ? 1 : 2)) : undefined,
      },
      {
        label: 'Tepki & Giriş Gecikmesi (Input Lag)',
        p1Val: s1.inputLagMs ? `${s1.inputLagMs} ms` : '< 10 ms (Düşük Gecikme Modu)',
        p2Val: s2.inputLagMs ? `${s2.inputLagMs} ms` : '< 10 ms (Düşük Gecikme Modu)',
      }
    ];

    const tvAudioMetrics: MetricItem[] = [
      {
        label: 'Hoparlör Ses Çıkış Gücü (RMS)',
        p1Val: tvAudio1 ? `${tvAudio1}W Ses Çıkışı` : 'Doğrulanmış ses verisi yok',
        p2Val: tvAudio2 ? `${tvAudio2}W Ses Çıkışı` : 'Doğrulanmış ses verisi yok',
        winner: tvAudio1 && tvAudio2 ? (tvAudio1 === tvAudio2 ? 'tie' : (tvAudio1 > tvAudio2 ? 1 : 2)) : undefined,
        advantageText: tvAudio1 && tvAudio2 && tvAudio1 !== tvAudio2 ? `+${Math.abs(tvAudio1 - tvAudio2)}W Daha Güçlü` : undefined,
      },
      {
        label: 'Dolby Atmos & Çevresel Ses',
        p1Val: s1.dolbyAtmos !== false ? 'Dolby Atmos & AI Sound' : 'Dahili Stereo',
        p2Val: s2.dolbyAtmos !== false ? 'Dolby Atmos & AI Sound' : 'Dahili Stereo',
      },
      {
        label: 'Kanal Yapısı',
        p1Val: s1.audioChannels || '2.0 / 2.2 Kanal',
        p2Val: s2.audioChannels || '2.0 / 2.2 Kanal',
      }
    ];

    const tvSmartMetrics: MetricItem[] = [
      {
        label: 'Smart TV İşletim Sistemi',
        p1Val: s1.smartOs || 'Smart TV',
        p2Val: s2.smartOs || 'Smart TV',
      },
      {
        label: 'Sesli Asistan & Kumanda',
        p1Val: s1.voiceControl || 'Sesli Arama & Akıllı Kumanda',
        p2Val: s2.voiceControl || 'Sesli Arama & Akıllı Kumanda',
      },
      {
        label: 'Apple AirPlay & Chromecast',
        p1Val: s1.appleAirplay !== false ? 'AirPlay 2 & Ekran Paylaşımı Destekli' : 'Ekran Yansıtma',
        p2Val: s2.appleAirplay !== false ? 'AirPlay 2 & Ekran Paylaşımı Destekli' : 'Ekran Yansıtma',
      },
      {
        label: 'Enerji Sınıfı',
        p1Val: s1.energyClass ? `${String(s1.energyClass).toUpperCase()} Sınıfı` : 'Standart Verimlilik',
        p2Val: s2.energyClass ? `${String(s2.energyClass).toUpperCase()} Sınıfı` : 'Standart Verimlilik',
      }
    ];

    sections = [
      {
        id: 'tv_panel',
        title: 'Panel Mimarisi & Görüntü Mühendisliği',
        subtitle: 'Panel tipi, AI görüntü işlemcisi, çözünürlük ve HDR formatları',
        icon: Tv,
        winner: calcSectionWinner(tvPanelMetrics).winner,
        winnerSummary: calcSectionWinner(tvPanelMetrics).summary,
        metrics: tvPanelMetrics,
      },
      {
        id: 'tv_gaming',
        title: 'Konsol Uyumu & Yenileme Hızı (HDMI 2.1)',
        subtitle: '120Hz/144Hz panel hızı, VRR, ALLM ve yeni nesil portlar',
        icon: Gamepad2,
        winner: calcSectionWinner(tvGamingMetrics).winner,
        winnerSummary: calcSectionWinner(tvGamingMetrics).summary,
        metrics: tvGamingMetrics,
      },
      {
        id: 'tv_audio',
        title: 'Akustik & Ses Sistemi Mimarisi',
        subtitle: 'RMS hoparlör çıkış gücü (Watt), Dolby Atmos ve ses kanalları',
        icon: Speaker,
        winner: calcSectionWinner(tvAudioMetrics).winner,
        winnerSummary: calcSectionWinner(tvAudioMetrics).summary,
        metrics: tvAudioMetrics,
      },
      {
        id: 'tv_smart',
        title: 'Smart TV & Ekosistem Bağlantıları',
        subtitle: 'İşletim sistemi (webOS, Google TV), AirPlay, Bluetooth ve enerji',
        icon: Wifi,
        winner: calcSectionWinner(tvSmartMetrics).winner,
        winnerSummary: calcSectionWinner(tvSmartMetrics).summary,
        metrics: tvSmartMetrics,
      },
    ];
  } else if (isLaptop) {
    // =========================================================================
    // 2. LAPTOPLAR İÇİN DERİN KARŞILAŞTIRMA SEKSİYONLARI
    // =========================================================================
    const ram1 = s1.ramGb || null;
    const ram2 = s2.ramGb || null;
    const ssd1 = s1.storageGb || null;
    const ssd2 = s2.storageGb || null;
    const wh1 = s1.batteryCapacityWh || null;
    const wh2 = s2.batteryCapacityWh || null;
    const kg1 = s1.weightKg || null;
    const kg2 = s2.weightKg || null;

    const laptopCpuMetrics: MetricItem[] = [
      {
        label: 'İşlemci Modeli',
        p1Val: s1.processor || 'Çok Çekirdekli CPU',
        p2Val: s2.processor || 'Çok Çekirdekli CPU',
      },
      {
        label: 'Çekirdek & İzlek Yapısı',
        p1Val: s1.processorCores || 'Yüksek Performans Çekirdekleri',
        p2Val: s2.processorCores || 'Yüksek Performans Çekirdekleri',
      },
      {
        label: 'Yapay Zekâ NPU Gücü',
        p1Val: s1.npuTops ? `${s1.npuTops} TOPS NPU` : 'Entegre AI Hızlandırıcı',
        p2Val: s2.npuTops ? `${s2.npuTops} TOPS NPU` : 'Entegre AI Hızlandırıcı',
      }
    ];

    const laptopGpuMetrics: MetricItem[] = [
      {
        label: 'Grafik Kartı (GPU)',
        p1Val: s1.gpu || 'Dahili / Harici Grafik',
        p2Val: s2.gpu || 'Dahili / Harici Grafik',
      },
      {
        label: 'GPU Güç Tüketimi (TGP)',
        p1Val: s1.gpuTgpWatts ? `${s1.gpuTgpWatts}W Azami Güç` : 'Optimize Grafik Mimarisi',
        p2Val: s2.gpuTgpWatts ? `${s2.gpuTgpWatts}W Azami Güç` : 'Optimize Grafik Mimarisi',
      }
    ];

    const laptopMemoryMetrics: MetricItem[] = [
      {
        label: 'RAM Bellek Kapasitesi',
        p1Val: ram1 ? `${ram1} GB RAM` : '16 GB',
        p2Val: ram2 ? `${ram2} GB RAM` : '16 GB',
        winner: ram1 && ram2 ? (ram1 === ram2 ? 'tie' : (ram1 > ram2 ? 1 : 2)) : undefined,
        advantageText: ram1 && ram2 && ram1 !== ram2 ? `+${Math.abs(ram1 - ram2)} GB Daha Fazla RAM` : undefined,
      },
      {
        label: 'SSD Depolama Hacmi',
        p1Val: ssd1 ? (ssd1 >= 1000 ? `${ssd1 / 1000} TB SSD` : `${ssd1} GB SSD`) : '512 GB SSD',
        p2Val: ssd2 ? (ssd2 >= 1000 ? `${ssd2 / 1000} TB SSD` : `${ssd2} GB SSD`) : '512 GB SSD',
        winner: ssd1 && ssd2 ? (ssd1 === ssd2 ? 'tie' : (ssd1 > ssd2 ? 1 : 2)) : undefined,
      }
    ];

    const laptopDisplayMetrics: MetricItem[] = [
      {
        label: 'Ekran Boyutu & Panel',
        p1Val: s1.screenSizeInches ? `${s1.screenSizeInches}" Ekran` : 'Panel',
        p2Val: s2.screenSizeInches ? `${s2.screenSizeInches}" Ekran` : 'Panel',
      },
      {
        label: 'Ekran Çözünürlüğü',
        p1Val: s1.screenResolution || 'Yüksek Çözünürlüklü Ekran',
        p2Val: s2.screenResolution || 'Yüksek Çözünürlüklü Ekran',
      }
    ];

    const laptopMobilityMetrics: MetricItem[] = [
      {
        label: 'Batarya Kapasitesi',
        p1Val: wh1 ? `${wh1} Wh Batarya` : 'Mobil Batarya',
        p2Val: wh2 ? `${wh2} Wh Batarya` : 'Mobil Batarya',
        winner: wh1 && wh2 ? (wh1 === wh2 ? 'tie' : (wh1 > wh2 ? 1 : 2)) : undefined,
        advantageText: wh1 && wh2 && wh1 !== wh2 ? `+${Math.abs(wh1 - wh2)} Wh Daha Geniş Batarya` : undefined,
      },
      {
        label: 'Gövde Ağırlığı',
        p1Val: kg1 ? `${kg1} kg` : 'Taşınabilir Kasa',
        p2Val: kg2 ? `${kg2} kg` : 'Taşınabilir Kasa',
        winner: kg1 && kg2 ? (kg1 === kg2 ? 'tie' : (kg1 < kg2 ? 1 : 2)) : undefined,
        advantageText: kg1 && kg2 && kg1 !== kg2 ? `${Math.abs(kg1 - kg2).toFixed(1)} kg Daha Hafif` : undefined,
      },
      {
        label: 'İşletim Sistemi',
        p1Val: s1.os || 'Windows 11 / macOS',
        p2Val: s2.os || 'Windows 11 / macOS',
      }
    ];

    sections = [
      {
        id: 'laptop_cpu',
        title: 'İşlemci Mimarisi & Hesaplama Gücü',
        subtitle: 'Çok çekirdek performansı, frekans hızı ve yapay zekâ NPU',
        icon: Cpu,
        winner: calcSectionWinner(laptopCpuMetrics).winner,
        winnerSummary: calcSectionWinner(laptopCpuMetrics).summary,
        metrics: laptopCpuMetrics,
      },
      {
        id: 'laptop_gpu',
        title: 'Ekran Kartı & Grafik İşleme (GPU)',
        subtitle: 'Grafik birimi, TGP güç sınırı ve 3D modelleme/oyun kabiliyeti',
        icon: Zap,
        winner: calcSectionWinner(laptopGpuMetrics).winner,
        winnerSummary: calcSectionWinner(laptopGpuMetrics).summary,
        metrics: laptopGpuMetrics,
      },
      {
        id: 'laptop_mem',
        title: 'Bellek (RAM) & Hızlı SSD Depolama',
        subtitle: 'Çoklu görev akıcılığı ve yüksek hızlı NVMe SSD hacmi',
        icon: Award,
        winner: calcSectionWinner(laptopMemoryMetrics).winner,
        winnerSummary: calcSectionWinner(laptopMemoryMetrics).summary,
        metrics: laptopMemoryMetrics,
      },
      {
        id: 'laptop_display',
        title: 'Ekran & Panel Kalitesi',
        subtitle: 'Ekran boyutu, panel çözünürlüğü ve çalışma alanı',
        icon: Laptop,
        winner: calcSectionWinner(laptopDisplayMetrics).winner,
        winnerSummary: calcSectionWinner(laptopDisplayMetrics).summary,
        metrics: laptopDisplayMetrics,
      },
      {
        id: 'laptop_mob',
        title: 'Pil Kapasitesi & Gövde Taşınabilirliği',
        subtitle: 'Wh cinsinden batarya, kasa ağırlığı ve mobilite konforu',
        icon: BatteryCharging,
        winner: calcSectionWinner(laptopMobilityMetrics).winner,
        winnerSummary: calcSectionWinner(laptopMobilityMetrics).summary,
        metrics: laptopMobilityMetrics,
      },
    ];
  } else if (isMonitor) {
    // =========================================================================
    // 3. MONİTÖRLER İÇİN DERİN KARŞILAŞTIRMA SEKSİYONLARI
    // =========================================================================
    const monHz1 = s1.refreshRateHz || 60;
    const monHz2 = s2.refreshRateHz || 60;
    const monMs1 = s1.responseTimeMs || 5;
    const monMs2 = s2.responseTimeMs || 5;

    const monPanelMetrics: MetricItem[] = [
      {
        label: 'Panel Tipi',
        p1Val: s1.panelType || 'IPS',
        p2Val: s2.panelType || 'IPS',
      },
      {
        label: 'Ekran Boyutu & Çözünürlük',
        p1Val: s1.screenSizeInches ? `${s1.screenSizeInches}" • ${s1.resolution || ''}` : (s1.resolution || 'Doğrulanmış veri yok'),
        p2Val: s2.screenSizeInches ? `${s2.screenSizeInches}" • ${s2.resolution || ''}` : (s2.resolution || 'Doğrulanmış veri yok'),
      },
      {
        label: 'Parlaklık & Kontrast',
        p1Val: `${s1.brightnessNits || 300} nits • ${s1.contrastRatio || '1000:1'}`,
        p2Val: `${s2.brightnessNits || 300} nits • ${s2.contrastRatio || '1000:1'}`,
      }
    ];

    const monGamingMetrics: MetricItem[] = [
      {
        label: 'Yenileme Hızı',
        p1Val: `${monHz1} Hz`,
        p2Val: `${monHz2} Hz`,
        winner: monHz1 === monHz2 ? 'tie' : (monHz1 > monHz2 ? 1 : 2),
        advantageText: monHz1 !== monHz2 ? `+${Math.abs(monHz1 - monHz2)} Hz Daha Akıcı` : undefined,
      },
      {
        label: 'Tepki Süresi (GtG/MPRT)',
        p1Val: `${monMs1} ms`,
        p2Val: `${monMs2} ms`,
        winner: monMs1 === monMs2 ? 'tie' : (monMs1 < monMs2 ? 1 : 2),
      },
      {
        label: 'Senkronizasyon (VRR)',
        p1Val: s1.syncTechnology || 'Adaptive Sync / FreeSync',
        p2Val: s2.syncTechnology || 'Adaptive Sync / FreeSync',
      }
    ];

    sections = [
      {
        id: 'mon_panel',
        title: 'Panel Mimarisi & Renk Doğruluğu',
        subtitle: 'Panel teknolojisi, piksel çözünürlüğü ve parlaklık',
        icon: Monitor,
        winner: calcSectionWinner(monPanelMetrics).winner,
        winnerSummary: calcSectionWinner(monPanelMetrics).summary,
        metrics: monPanelMetrics,
      },
      {
        id: 'mon_gaming',
        title: 'E-Spor Akıcılığı & Tepki Hızı',
        subtitle: 'Yenileme hızı (Hz), piksel tepki süresi (ms) ve VRR',
        icon: Zap,
        winner: calcSectionWinner(monGamingMetrics).winner,
        winnerSummary: calcSectionWinner(monGamingMetrics).summary,
        metrics: monGamingMetrics,
      },
    ];
  } else {
    // =========================================================================
    // 4. AKILLI TELEFONLAR (VARSAYILAN DERİN SEKSİYONLAR)
    // =========================================================================
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

    sections = [
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
  }

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
