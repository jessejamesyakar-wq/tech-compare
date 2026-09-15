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

  // Estimated/Real benchmarks
  const antutu1 = s1.processor?.antutuScore || (product1.brand === 'Apple' ? 2085000 : 1850000);
  const antutu2 = s2.processor?.antutuScore || (product2.brand === 'Samsung' ? 2120000 : 1950000);
  const maxAntutu = Math.max(antutu1, antutu2, 2300000);

  const geekSingle1 = s1.processor?.geekbenchSingle || (product1.brand === 'Apple' ? 3420 : 2210);
  const geekSingle2 = s2.processor?.geekbenchSingle || (product2.brand === 'Samsung' ? 2280 : 2190);

  const geekMulti1 = s1.processor?.geekbenchMulti || (product1.brand === 'Apple' ? 8650 : 7100);
  const geekMulti2 = s2.processor?.geekbenchMulti || (product2.brand === 'Samsung' ? 7350 : 6950);

  const antutuCpu1 = Math.round(antutu1 * 0.28);
  const antutuCpu2 = Math.round(antutu2 * 0.26);
  const antutuGpu1 = Math.round(antutu1 * 0.38);
  const antutuGpu2 = Math.round(antutu2 * 0.42);

  const nits1 = s1.screen?.brightness || (product1.brand === 'Apple' ? 2000 : 1600);
  const nits2 = s2.screen?.brightness || (product2.brand === 'Samsung' ? 2600 : 2000);
  const maxNits = Math.max(nits1, nits2, 3000);

  const bat1 = s1.battery?.capacitymAh || (product1.brand === 'Apple' ? 4685 : 4500);
  const bat2 = s2.battery?.capacitymAh || (product2.brand === 'Samsung' ? 5000 : 5000);

  const watt1 = s1.battery?.chargingWatts || (product1.brand === 'Apple' ? 30 : 25);
  const watt2 = s2.battery?.chargingWatts || (product2.brand === 'Samsung' ? 45 : 67);

  const sections: SectionData[] = [
    // -------------------------------------------------------------
    // SECTION 1: SoC, GPU & AI ARCHITECTURE
    // -------------------------------------------------------------
    {
      id: 'soc',
      title: 'İşlemci, Çip & Grafik Mimarisi (SoC & GPU)',
      subtitle: 'AnTuTu v10 kırılımları, Geekbench 6 testleri, NPU ve litografi',
      icon: Cpu,
      winner: antutu1 >= antutu2 ? 1 : 2,
      winnerSummary:
        antutu1 >= antutu2
          ? `${product1.brand} tek çekirdek ve yapay zeka hızında önde`
          : `${product2.brand} grafik ve çoklu çekirdekte önde`,
      metrics: [
        {
          label: 'Yonga Seti (SoC)',
          p1Val: s1.processor?.chip || (product1.brand === 'Apple' ? 'Apple A18 Pro' : 'Flagship 8-Core'),
          p2Val: s2.processor?.chip || (product2.brand === 'Samsung' ? 'Snapdragon 8 Gen 3 for Galaxy' : 'Flagship SoC')
        },
        {
          label: 'Üretim Teknolojisi (Litografi)',
          p1Val: s1.processor?.process || (product1.brand === 'Apple' ? '3nm (TSMC N3E)' : '4nm'),
          p2Val: s2.processor?.process || '4nm (TSMC N4P)',
          winner: s1.processor?.process?.includes('3nm') || product1.brand === 'Apple' ? 1 : 'tie',
          advantageText: s1.processor?.process?.includes('3nm') || product1.brand === 'Apple' ? 'Daha Verimli 3nm Mimari' : undefined
        },
        {
          label: 'Çekirdek Yapısı ve Azami Hız',
          p1Val: s1.processor?.cores || '6 Çekirdek (2x 4.04 GHz + 4x 2.20 GHz)',
          p2Val: s2.processor?.cores || '8 Çekirdek (1x 3.39 GHz + 5x 3.1 GHz + 2x 2.2 GHz)',
          winner: product2.brand === 'Samsung' ? 2 : 1,
          advantageText: '+2 Çekirdek Avantajı'
        },
        {
          label: 'AnTuTu v10 Genel Skoru',
          p1Val: `${antutu1.toLocaleString('tr-TR')} Puan`,
          p2Val: `${antutu2.toLocaleString('tr-TR')} Puan`,
          winner: antutu1 >= antutu2 ? 1 : 2,
          p1BarPercent: Math.round((antutu1 / maxAntutu) * 100),
          p2BarPercent: Math.round((antutu2 / maxAntutu) * 100),
          advantageText: `+${Math.abs(Math.round(((antutu1 - antutu2) / antutu2) * 100))}% Hız Farkı`
        },
        {
          label: 'AnTuTu CPU Skoru',
          p1Val: `${antutuCpu1.toLocaleString('tr-TR')} Puan`,
          p2Val: `${antutuCpu2.toLocaleString('tr-TR')} Puan`,
          winner: antutuCpu1 >= antutuCpu2 ? 1 : 2
        },
        {
          label: 'AnTuTu GPU Skoru',
          p1Val: `${antutuGpu1.toLocaleString('tr-TR')} Puan`,
          p2Val: `${antutuGpu2.toLocaleString('tr-TR')} Puan`,
          winner: antutuGpu2 >= antutuGpu1 ? 2 : 1,
          advantageText: antutuGpu2 >= antutuGpu1 ? 'Daha Yüksek Grafik Gücü' : undefined
        },
        {
          label: 'Geekbench 6 Tek Çekirdek',
          p1Val: `${geekSingle1} Puan`,
          p2Val: `${geekSingle2} Puan`,
          winner: geekSingle1 >= geekSingle2 ? 1 : 2,
          p1BarPercent: Math.round((geekSingle1 / 3800) * 100),
          p2BarPercent: Math.round((geekSingle2 / 3800) * 100),
          advantageText: geekSingle1 > geekSingle2 ? `+${Math.round(((geekSingle1 - geekSingle2) / geekSingle2) * 100)}% Tek Çekirdek Lideri` : undefined
        },
        {
          label: 'Geekbench 6 Çoklu Çekirdek',
          p1Val: `${geekMulti1} Puan`,
          p2Val: `${geekMulti2} Puan`,
          winner: geekMulti1 >= geekMulti2 ? 1 : 2,
          p1BarPercent: Math.round((geekMulti1 / 10000) * 100),
          p2BarPercent: Math.round((geekMulti2 / 10000) * 100)
        },
        {
          label: 'Yapay Zekâ NPU Motoru',
          p1Val: '16-Core Neural Engine (35 TOPS)',
          p2Val: 'Hexagon NPU (45 TOPS AI Engine)',
          winner: 2,
          advantageText: '+10 TOPS NPU Gücü'
        },
        {
          label: 'Donanımsal Ray Tracing',
          p1Val: 'Var (Donanım Hızlandırmalı Metal)',
          p2Val: 'Var (Adreno HW Ray Tracing)',
          winner: 'tie'
        }
      ]
    },

    // -------------------------------------------------------------
    // SECTION 2: DISPLAY & PANEL ENGINEERING
    // -------------------------------------------------------------
    {
      id: 'display',
      title: 'Ekran & Panel Mühendisliği',
      subtitle: 'Tepe parlaklık (nits), panel tipi, değişken yenileme ve cam dayanımı',
      icon: Smartphone,
      winner: nits2 >= nits1 ? 2 : 1,
      winnerSummary:
        nits2 >= nits1
          ? `${product2.brand} 2600 nits tepe parlaklık ve yansıma önleyici Gorilla Armor ile önde`
          : `${product1.brand} Super Retina XDR OLED ve renk doğruluğu ile önde`,
      metrics: [
        {
          label: 'Panel Teknolojisi',
          p1Val: s1.screen?.type || 'LTPO Super Retina XDR OLED',
          p2Val: s2.screen?.type || 'Dynamic LTPO AMOLED 2X',
          winner: 'tie'
        },
        {
          label: 'Ekran Boyutu & Çözünürlük',
          p1Val: `${s1.screen?.size || '6.9 inç'} • 1320 x 2868 px`,
          p2Val: `${s2.screen?.size || '6.8 inç'} • 1440 x 3120 px (QHD+)`,
          winner: 2,
          advantageText: 'QHD+ Daha Yüksek Çözünürlük'
        },
        {
          label: 'Tepe Parlaklık (Peak Nits)',
          p1Val: `${nits1} nits`,
          p2Val: `${nits2} nits`,
          winner: nits2 >= nits1 ? 2 : 1,
          p1BarPercent: Math.round((nits1 / maxNits) * 100),
          p2BarPercent: Math.round((nits2 / maxNits) * 100),
          advantageText: `${Math.abs(nits1 - nits2)} Nit Daha Parlak`
        },
        {
          label: 'Piksel Yoğunluğu (PPI)',
          p1Val: `${s1.screen?.ppi || 460} ppi`,
          p2Val: `${s2.screen?.ppi || 505} ppi`,
          winner: 2,
          advantageText: '+45 PPI Daha Keskin'
        },
        {
          label: 'Değişken Yenileme Hızı (VRR)',
          p1Val: '1 - 120 Hz (Adaptif ProMotion)',
          p2Val: '1 - 120 Hz (LTPO Adaptif Akıcılık)',
          winner: 'tie'
        },
        {
          label: 'Ön Cam Koruma Teknolojisi',
          p1Val: 'Ceramic Shield (En Yeni Nesil)',
          p2Val: 'Corning Gorilla Armor (%75 Azaltılmış Yansıma)',
          winner: 2,
          advantageText: 'Yansıma Önleyici Kaplama'
        },
        {
          label: 'Ekran / Gövde Oranı',
          p1Val: '~%91.4 (İnce Çerçeve)',
          p2Val: '~%89.8 (Düz Panel Çerçeve)',
          winner: 1,
          advantageText: '+%1.6 Daha Geniş Ekran Alanı'
        }
      ]
    },

    // -------------------------------------------------------------
    // SECTION 3: CAMERA LAB & SENSORS
    // -------------------------------------------------------------
    {
      id: 'camera',
      title: 'Kamera Laboratuvar Verileri & Optik Güç',
      subtitle: 'Sensör boyutları, diyafram değerleri, optik zoom ve video standartları',
      icon: Camera,
      winner: 1,
      winnerSummary: `${product1.brand} 4K 120fps ProRes LOG video ve DxOMark renk doğruluğuyla stüdyo lideri`,
      metrics: [
        {
          label: 'Ana Sensör Çözünürlüğü',
          p1Val: s1.camera?.mainMp || '48 MP Fusion (f/1.78, 24mm)',
          p2Val: s2.camera?.mainMp || '200 MP Ultra (f/1.7, 24mm)',
          winner: 2,
          advantageText: '200 MP Devasa Detay Çözünürlüğü'
        },
        {
          label: 'Ana Sensör Boyutu',
          p1Val: '1/1.28 inç (1.22µm piksel)',
          p2Val: '1/1.3 inç (0.6µm piksel)',
          winner: 1,
          advantageText: 'Daha Büyük Fiziksel Sensör Alanı'
        },
        {
          label: 'Optik Görüntü Sabitleme (OIS)',
          p1Val: 'İkinci Nesil Sensör-Shift OIS',
          p2Val: 'Gelişmiş Çift Eksenli Optik OIS',
          winner: 1,
          advantageText: 'Sensör Düzleminde Mekanik Denge'
        },
        {
          label: 'Ultra Geniş Açı Sensörü',
          p1Val: '48 MP (f/2.2, 120˚, Hibrit Odak)',
          p2Val: '12 MP (f/2.2, 120˚, Çift Piksel PDAF)',
          winner: 1,
          advantageText: '4x Daha Yüksek Ultra Geniş Çözünürlük'
        },
        {
          label: 'Telefoto / Periskop Zoom',
          p1Val: '12 MP (5x Optik Zoom, Tetraprism)',
          p2Val: '50 MP (5x Optik Zoom) + 10 MP (3x Zoom)',
          winner: 2,
          advantageText: 'Çift Telefoto (3x + 5x Optik)'
        },
        {
          label: 'Profesyonel Video Kaydı',
          p1Val: '4K@120fps Dolby Vision, ProRes LOG, ACES',
          p2Val: '8K@30fps, 4K@120fps, HDR10+',
          winner: 1,
          advantageText: '4K 120fps Dolby Vision & ProRes LOG'
        },
        {
          label: 'Ön Kamera (Selfie)',
          p1Val: '12 MP (f/1.9, PDAF, SL 3D Derinlik)',
          p2Val: '12 MP (f/2.2, Çift Piksel PDAF)',
          winner: 1,
          advantageText: 'Face ID 3D Biyometrik Sensör'
        }
      ]
    },

    // -------------------------------------------------------------
    // SECTION 4: BATTERY, THERMALS & CHARGING
    // -------------------------------------------------------------
    {
      id: 'battery',
      title: 'Batarya, Termal Yönetim ve Şarj Hızları',
      subtitle: 'Kapasite (mAh), kablolu Watt gücü, buhar odası soğutması ve kablosuz şarj',
      icon: BatteryCharging,
      winner: bat2 >= bat1 ? 2 : 1,
      winnerSummary: `${product2.brand} 5000 mAh batarya ve 45W hızlı şarj desteği ile pil kategorisinde önde`,
      metrics: [
        {
          label: 'Pil Kapasitesi',
          p1Val: `${bat1.toLocaleString('tr-TR')} mAh`,
          p2Val: `${bat2.toLocaleString('tr-TR')} mAh`,
          winner: bat2 >= bat1 ? 2 : 1,
          p1BarPercent: Math.round((bat1 / 5500) * 100),
          p2BarPercent: Math.round((bat2 / 5500) * 100),
          advantageText: `+${Math.abs(bat1 - bat2)} mAh Daha Yüksek Kapasite`
        },
        {
          label: 'Kablolu Hızlı Şarj Gücü',
          p1Val: `${watt1}W PD Şarj`,
          p2Val: `${watt2}W Süper Hızlı Şarj 2.0`,
          winner: watt2 >= watt1 ? 2 : 1,
          advantageText: `+${Math.abs(watt1 - watt2)}W Daha Yüksek Şarj Gücü`
        },
        {
          label: '0 - %50 Dolum Süresi',
          p1Val: '~30 Dakika',
          p2Val: '~20 Dakika',
          winner: 2,
          advantageText: '10 Dakika Daha Hızlı İlk Dolum'
        },
        {
          label: 'Kablosuz Şarj Standardı',
          p1Val: '25W MagSafe / 15W Qi2 Kablosuz',
          p2Val: '15W Fast Wireless Charging 2.0',
          winner: 1,
          advantageText: '25W Manyetik MagSafe Şarj'
        },
        {
          label: 'Ters Kablosuz Şarj',
          p1Val: 'Desteklenmiyor (Sadece Kablolu 4.5W Çıkış)',
          p2Val: 'Var (4.5W Wireless PowerShare)',
          winner: 2,
          advantageText: 'Kulaklık/Saat Şarj Edebilme'
        },
        {
          label: 'Termal Soğutma Mimarisi',
          p1Val: 'Grafen Kaplamalı Lazer Kaynaklı Alüminyum Alt Çerçeve',
          p2Val: '1.9x Büyütülmüş Çift Katmanlı Buhar Odası (Vapor Chamber)',
          winner: 2,
          advantageText: 'Geniş Buhar Odası Termal Soğutma'
        }
      ]
    },

    // -------------------------------------------------------------
    // SECTION 5: CONNECTIVITY & BUILD DURABILITY
    // -------------------------------------------------------------
    {
      id: 'connectivity',
      title: 'Bağlantı Standartları & Kasa Dayanıklılığı',
      subtitle: 'Wi-Fi 7, Bluetooth sürümü, IP68 su geçirmezlik derinliği ve titanyum kasa',
      icon: Wifi,
      winner: 'tie',
      winnerSummary: 'Her iki amiral gemisi de Grade 5 Havacılık Titanyumu ve Wi-Fi 7 ile zirvede',
      metrics: [
        {
          label: 'Gövde & Çerçeve Malzemesi',
          p1Val: 'Havacılık Sınıfı Grade 5 Titanyum',
          p2Val: 'Havacılık Sınıfı Grade 5 Titanyum',
          winner: 'tie'
        },
        {
          label: 'Su ve Toz Dayanıklılığı',
          p1Val: 'IP68 (6 Metreye Kadar 30 Dk)',
          p2Val: 'IP68 (1.5 Metreye Kadar 30 Dk)',
          winner: 1,
          advantageText: '4.5 Metre Daha Derin Su Koruması'
        },
        {
          label: 'Wi-Fi Standardı',
          p1Val: 'Wi-Fi 7 (802.11be, 2x2 MIMO)',
          p2Val: 'Wi-Fi 7 (802.11be, 2x2 MIMO)',
          winner: 'tie'
        },
        {
          label: 'Bluetooth Sürümü',
          p1Val: 'Bluetooth 5.3 (A2DP, LE)',
          p2Val: 'Bluetooth 5.3 (A2DP, LE Audio)',
          winner: 'tie'
        },
        {
          label: 'USB Portu ve Veri Aktarım Hızı',
          p1Val: 'USB Type-C 3.2 Gen 2 (10 Gbps) • DisplayPort 4K',
          p2Val: 'USB Type-C 3.2 Gen 1 (5 Gbps) • DisplayPort & DeX',
          winner: 1,
          advantageText: '2x Daha Yüksek Kablolu Veri Aktarımı'
        },
        {
          label: 'Dahili Kalem (Stylus) Desteği',
          p1Val: 'Desteklenmiyor',
          p2Val: 'Entegre S-Pen (2.8ms Gecikme, Bluetooth)',
          winner: 2,
          advantageText: 'Kasa İçi Dahili S-Pen Kalem'
        }
      ]
    }
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
