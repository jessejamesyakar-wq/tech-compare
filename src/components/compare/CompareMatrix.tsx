'use client';

import { ProductImage } from '@/components/ui/ProductImage';
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Product, Smartphone, TVProduct, LaptopProduct } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';
import { useCompare } from '@/context/CompareContext';
import { PriceDisclaimer } from '@/components/legal/PriceDisclaimer';
import { CompareVerdictCard } from './CompareVerdictCard';
import {
  Scale,
  Sparkles,
  X,
  SlidersHorizontal,
  CheckCircle,
  Trophy
} from 'lucide-react';

interface CompareMatrixProps {
  products: Product[];
}

interface SpecRow {
  category: string;
  label: string;
  isNumericHigherBetter?: boolean;
  isNumericLowerBetter?: boolean;
  getRawNumber?: (p: Product) => number | null;
  getValue: (p: Product) => string | number;
}

export function CompareMatrix({ products }: CompareMatrixProps) {
  const { t } = useI18n();
  const { removeFromCompare, clearCompare } = useCompare();

  const [highlightDiffs, setHighlightDiffs] = useState<boolean>(true);
  const [onlyDiffs, setOnlyDiffs] = useState<boolean>(false);

  if (!products || products.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-12 text-center max-w-xl mx-auto my-12 space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
          <Scale className="w-8 h-8" />
        </div>
        <h2 className="text-slate-900 text-xl font-black">{t.emptyCompareTitle}</h2>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">{t.emptyCompareDesc}</p>
        <Link
          href="/phones"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-all shadow-xs"
        >
          <span>{t.navCatalog}</span>
        </Link>
      </div>
    );
  }

  const primaryCategory = products[0]?.category || 'smartphones';
  const isSameCategory = products.every((p) => p.category === primaryCategory);

  let specRows: SpecRow[] = [];

  if (isSameCategory && primaryCategory === 'monitors') {
    specRows = [
      {
        category: 'Fiyat & Puan',
        label: 'Başlangıç Fiyatı',
        isNumericLowerBetter: true,
        getRawNumber: (p) => p.basePrice,
        getValue: (p) => `${p.basePrice.toLocaleString()} ${p.currency}`
      },
      { category: 'Fiyat & Puan', label: 'Epey Puanı', isNumericHigherBetter: true, getRawNumber: (p) => p.epeyScore || Math.round(p.rating * 20), getValue: (p) => `${p.epeyScore || Math.round(p.rating * 20)} / 100` },
      { category: 'Fiyat & Puan', label: 'Kullanıcı Puanı', getValue: (p) => `⭐ ${p.rating} / 5 (${p.reviewCount})` },
      { category: 'Fiyat & Puan', label: 'Çıkış Yılı', getValue: (p) => p.releaseYear || '-' },

      {
        category: 'Ekran & Panel',
        label: 'Ekran Boyutu',
        getValue: (p) => {
          const s = (p.specs || {}) as Record<string, any>;
          return s.screenSizeInches ? `${s.screenSizeInches} inç` : '-';
        }
      },
      {
        category: 'Ekran & Panel',
        label: 'Çözünürlük Standardı',
        getValue: (p) => {
          const s = (p.specs || {}) as Record<string, any>;
          return s.resolution || '-';
        }
      },
      {
        category: 'Ekran & Panel',
        label: 'Yenileme Hızı (Hz)',
        isNumericHigherBetter: true,
        getRawNumber: (p) => ((p.specs || {}) as Record<string, any>).refreshRateHz || 60,
        getValue: (p) => `${((p.specs || {}) as Record<string, any>).refreshRateHz || 60} Hz`
      },
      {
        category: 'Ekran & Panel',
        label: 'Tepki Süresi (ms)',
        isNumericLowerBetter: true,
        getRawNumber: (p) => ((p.specs || {}) as Record<string, any>).responseTimeMs || 5,
        getValue: (p) => `${((p.specs || {}) as Record<string, any>).responseTimeMs || 5} ms`
      },
      {
        category: 'Ekran & Panel',
        label: 'Panel Teknolojisi',
        getValue: (p) => ((p.specs || {}) as Record<string, any>).panelType || 'IPS'
      },
      {
        category: 'Ekran & Panel',
        label: 'HDR Desteği',
        getValue: (p) => ((p.specs || {}) as Record<string, any>).hdrSupport || 'Yok'
      },
      {
        category: 'Ekran & Panel',
        label: 'Parlaklık (Nit)',
        isNumericHigherBetter: true,
        getRawNumber: (p) => ((p.specs || {}) as Record<string, any>).brightnessNits || 300,
        getValue: (p) => `${((p.specs || {}) as Record<string, any>).brightnessNits || 300} nits`
      },
      {
        category: 'Ekran & Panel',
        label: 'Kontrast Oranı',
        getValue: (p) => ((p.specs || {}) as Record<string, any>).contrastRatio || '1000:1'
      },

      {
        category: 'Oyun & Senkronizasyon',
        label: 'Senkronizasyon (VRR)',
        getValue: (p) => ((p.specs || {}) as Record<string, any>).syncTechnology || 'Adaptive-Sync'
      },
      {
        category: 'Oyun & Senkronizasyon',
        label: 'Öne Çıkan Oyuncu Özelliği',
        getValue: (p) => p.highlights?.[0] || 'Düşük Giriş Gecikmesi'
      },

      {
        category: 'Gövde & Bağlantı',
        label: 'USB-C & Güç İletimi (PD)',
        getValue: (p) => {
          const h = p.highlights?.find((hl) => hl.includes('USB-C') || hl.includes('PD'));
          return h ? h.split(',')[0] : 'Standart HDMI/DP';
        }
      },
      {
        category: 'Gövde & Bağlantı',
        label: 'Dahili Hoparlör',
        getValue: (p) => {
          const h = p.highlights?.find((hl) => hl.includes('Hoparlör'));
          return h ? 'Var (Dahili Stereo)' : 'Yok (Kulaklık Çıkışı)';
        }
      },
      {
        category: 'Gövde & Bağlantı',
        label: 'Pivot / Yükseklik Ayarı',
        getValue: (p) => {
          const h = p.highlights?.find((hl) => hl.includes('Pivot') || hl.includes('Yükseklik'));
          return h ? 'Var (Ergonomik Stand)' : 'Yalnızca Eğim (Tilt)';
        }
      }
    ];
  } else if (isSameCategory && primaryCategory === 'laptops') {
    specRows = [
      { category: 'Fiyat & Puan', label: 'Başlangıç Fiyatı', isNumericLowerBetter: true, getRawNumber: (p) => p.basePrice, getValue: (p) => `${p.basePrice.toLocaleString()} ${p.currency}` },
      { category: 'Fiyat & Puan', label: 'Kullanıcı Puanı', getValue: (p) => `⭐ ${p.rating} / 5 (${p.reviewCount})` },
      { category: 'Fiyat & Puan', label: 'Çıkış Yılı', getValue: (p) => p.releaseYear || '-' },

      { category: 'İşlemci & Performans', label: 'İşlemci Modeli', getValue: (p) => (p as LaptopProduct).specs?.processor || 'Belirtilmedi' },
      { category: 'İşlemci & Performans', label: 'Çekirdek & İzlek Yapısı', getValue: (p) => (p as LaptopProduct).specs?.processorCores || 'Belirtilmedi' },
      { category: 'İşlemci & Performans', label: 'Yapay Zekâ NPU', getValue: (p) => {
        const tops = (p as LaptopProduct).specs?.npuTops;
        return tops && tops > 0 ? `${tops} TOPS NPU` : 'Yok / Desteklenmiyor';
      }},

      { category: 'Bellek & Depolama', label: 'RAM Kapasitesi', isNumericHigherBetter: true, getRawNumber: (p) => (p as LaptopProduct).specs?.ramGb || 16, getValue: (p) => {
        const spec = (p as LaptopProduct).specs;
        return spec?.ramGb ? `${spec.ramGb} GB RAM` : (spec?.ramType || '16 GB');
      }},
      { category: 'Bellek & Depolama', label: 'SSD Depolama', isNumericHigherBetter: true, getRawNumber: (p) => (p as LaptopProduct).specs?.storageGb || 512, getValue: (p) => {
        const spec = (p as LaptopProduct).specs;
        return spec?.storageGb ? (spec.storageGb >= 1000 ? `${spec.storageGb / 1000} TB SSD` : `${spec.storageGb} GB SSD`) : '512 GB SSD';
      }},

      { category: 'Ekran & Grafik', label: 'Ekran Kartı (GPU)', getValue: (p) => (p as LaptopProduct).specs?.gpu || 'Dahili Grafik' },
      { category: 'Ekran & Grafik', label: 'Ekran Boyutu & Çözünürlük', getValue: (p) => {
        const spec = (p as LaptopProduct).specs;
        return spec?.screenResolution ? `${spec.screenSizeInches || ''}" ${spec.screenResolution}` : `${spec?.screenSizeInches || ''} inç`;
      }},

      { category: 'Batarya & Kasa', label: 'Batarya Kapasitesi', isNumericHigherBetter: true, getRawNumber: (p) => (p as LaptopProduct).specs?.batteryCapacityWh || 50, getValue: (p) => {
        const spec = (p as LaptopProduct).specs;
        return spec?.batteryCapacityWh ? `${spec.batteryCapacityWh} Wh` : '-';
      }},
      { category: 'Batarya & Kasa', label: 'Ağırlık', isNumericLowerBetter: true, getRawNumber: (p) => (p as LaptopProduct).specs?.weightKg || 1.8, getValue: (p) => {
        const spec = (p as LaptopProduct).specs;
        return spec?.weightKg ? `${spec.weightKg} kg` : '-';
      }},
      { category: 'Batarya & Kasa', label: 'İşletim Sistemi', getValue: (p) => (p as LaptopProduct).specs?.os || 'Windows 11 / macOS' }
    ];
  } else if (isSameCategory && primaryCategory === 'tvs') {
    specRows = [
      { category: 'Fiyat & Puan', label: 'Başlangıç Fiyatı', isNumericLowerBetter: true, getRawNumber: (p) => p.basePrice, getValue: (p) => `${p.basePrice.toLocaleString()} ${p.currency}` },
      { category: 'Fiyat & Puan', label: 'Kullanıcı Puanı', getValue: (p) => `⭐ ${p.rating} / 5 (${p.reviewCount})` },
      { category: 'Fiyat & Puan', label: 'Çıkış Yılı', getValue: (p) => p.releaseYear || '-' },

      { category: 'Ekran & Donanım', label: 'Ekran Boyutu', getValue: (p) => `${(p as TVProduct).specs?.screenSizeInches || ''}" (${Math.round(((p as TVProduct).specs?.screenSizeInches || 55) * 2.54)} cm)` },
      { category: 'Ekran & Donanım', label: 'Panel Teknolojisi', getValue: (p) => (p as TVProduct).specs?.displayTech || 'LED' },
      { category: 'Ekran & Donanım', label: 'Çözünürlük', getValue: (p) => (p as TVProduct).specs?.resolution || '4K Ultra HD' },
      { category: 'Ekran & Donanım', label: 'Yenileme Hızı', isNumericHigherBetter: true, getRawNumber: (p) => (p as TVProduct).specs?.refreshRateHz || 60, getValue: (p) => `${(p as TVProduct).specs?.refreshRateHz || 60} Hz` },
      { category: 'Ekran & Donanım', label: 'Zirve Parlaklık', isNumericHigherBetter: true, getRawNumber: (p) => (p as TVProduct).specs?.brightnessNits || 800, getValue: (p) => `${(p as TVProduct).specs?.brightnessNits || 800} nits` },

      { category: 'Ses & Akıllı Sistem', label: 'İşletim Sistemi', getValue: (p) => (p as TVProduct).specs?.smartOs || 'Google TV / Tizen' },
      { category: 'Ses & Akıllı Sistem', label: 'Ses Gücü (Watt)', isNumericHigherBetter: true, getRawNumber: (p) => (p as TVProduct).specs?.audioPowerWatts || 20, getValue: (p) => `${(p as TVProduct).specs?.audioPowerWatts || 20} W` },
      { category: 'Ses & Akıllı Sistem', label: 'HDMI Port Sayısı', getValue: (p) => `${(p as TVProduct).specs?.hdmiPorts || 3} Adet` }
    ];
  } else {
    // Smartphone or Mixed comparison
    specRows = [
      { category: 'Fiyat & Puan', label: 'Başlangıç Fiyatı', isNumericLowerBetter: true, getRawNumber: (p) => p.basePrice, getValue: (p) => `${p.basePrice.toLocaleString()} ${p.currency}` },
      { category: 'Fiyat & Puan', label: 'Epey Puanı', isNumericHigherBetter: true, getRawNumber: (p) => p.epeyScore || Math.round(p.rating * 20), getValue: (p) => `${p.epeyScore || Math.round(p.rating * 20)} / 100` },
      { category: 'Fiyat & Puan', label: 'Kullanıcı Puanı', getValue: (p) => `⭐ ${p.rating} / 5 (${p.reviewCount})` },
      { category: 'Fiyat & Puan', label: 'AnTuTu Performans', isNumericHigherBetter: true, getRawNumber: (p) => ((p as Smartphone).specs?.processor?.antutuScore) || null, getValue: (p) => {
        const score = (p as Smartphone).specs?.processor?.antutuScore;
        return score ? score.toLocaleString() : '-';
      }},
      { category: 'Fiyat & Puan', label: 'DXOMARK Kamera', isNumericHigherBetter: true, getRawNumber: (p) => ((p as Smartphone).specs?.camera?.dxomarkScore) || null, getValue: (p) => {
        const score = (p as Smartphone).specs?.camera?.dxomarkScore;
        return score ? String(score) : '-';
      }},

      { category: 'Ekran', label: 'Ekran Boyutu', getValue: (p) => {
        if (p.category === 'tvs') return `${(p as TVProduct).specs?.screenSizeInches}"`;
        if (p.category === 'laptops') return `${(p as LaptopProduct).specs?.screenSizeInches}"`;
        if (p.category === 'monitors') return `${((p.specs || {}) as Record<string, any>).screenSizeInches}"`;
        return (p as Smartphone).specs?.screen?.size || '-';
      }},
      { category: 'Ekran', label: 'Panel Tipi / Çözünürlük', getValue: (p) => {
        if (p.category === 'tvs') return (p as TVProduct).specs?.displayTech || '-';
        if (p.category === 'laptops') return (p as LaptopProduct).specs?.screenResolution || '-';
        if (p.category === 'monitors') return ((p.specs || {}) as Record<string, any>).panelType || 'IPS';
        return (p as Smartphone).specs?.screen?.type || '-';
      }},
      { category: 'Ekran', label: 'Yenileme Hızı', isNumericHigherBetter: true, getRawNumber: (p) => {
        if (p.category === 'monitors') return ((p.specs || {}) as Record<string, any>).refreshRateHz || 60;
        if (p.category === 'tvs') return (p as TVProduct).specs?.refreshRateHz || 60;
        return (p as Smartphone).specs?.screen?.refreshRate || 60;
      }, getValue: (p) => {
        if (p.category === 'monitors') return `${((p.specs || {}) as Record<string, any>).refreshRateHz || 60} Hz`;
        if (p.category === 'tvs') return `${(p as TVProduct).specs?.refreshRateHz || 60} Hz`;
        return (p as Smartphone).specs?.screen?.refreshRate ? `${(p as Smartphone).specs.screen.refreshRate} Hz` : '60 Hz';
      }},

      { category: 'Donanım & Performans', label: 'İşlemci / Yonga Seti', getValue: (p) => {
        if (p.category === 'tvs') return (p as TVProduct).specs?.processorEngine || '-';
        if (p.category === 'laptops') return (p as LaptopProduct).specs?.processor || '-';
        return (p as Smartphone).specs?.processor?.chip || '-';
      }},
      { category: 'Donanım & Performans', label: 'RAM / Bellek', isNumericHigherBetter: true, getRawNumber: (p) => {
        if (p.category === 'laptops') return (p as LaptopProduct).specs?.ramGb || null;
        return (p as Smartphone).specs?.memory?.ramGb || null;
      }, getValue: (p) => {
        if (p.category === 'laptops') return (p as LaptopProduct).specs?.ramGb ? `${(p as LaptopProduct).specs.ramGb} GB` : '-';
        return (p as Smartphone).specs?.memory?.ramGb ? `${(p as Smartphone).specs.memory.ramGb} GB` : '-';
      }},
      { category: 'Donanım & Performans', label: 'Dahili Depolama', isNumericHigherBetter: true, getRawNumber: (p) => {
        if (p.category === 'laptops') return (p as LaptopProduct).specs?.storageGb || null;
        return (p as Smartphone).specs?.memory?.storageGb || null;
      }, getValue: (p) => {
        if (p.category === 'laptops') return (p as LaptopProduct).specs?.storageGb ? `${(p as LaptopProduct).specs.storageGb} GB` : '-';
        return (p as Smartphone).specs?.memory?.storageGb ? `${(p as Smartphone).specs.memory.storageGb} GB` : '-';
      }},

      { category: 'Kamera / Ses', label: 'Ana Kamera / Ses Gücü', isNumericHigherBetter: true, getRawNumber: (p) => {
        const mpStr = (p as Smartphone).specs?.camera?.mainMp;
        return mpStr ? parseFloat(mpStr) : null;
      }, getValue: (p) => {
        if (p.category === 'tvs') return `${(p as TVProduct).specs?.audioPowerWatts || 20} W Ses`;
        if (p.category === 'laptops') return (p as LaptopProduct).specs?.gpu || '-';
        return (p as Smartphone).specs?.camera?.mainMp ? `${(p as Smartphone).specs.camera.mainMp} MP` : '-';
      }},
      { category: 'Batarya & Şarj', label: 'Batarya Kapasitesi', isNumericHigherBetter: true, getRawNumber: (p) => {
        if (p.category === 'laptops') return (p as LaptopProduct).specs?.batteryCapacityWh || null;
        return (p as Smartphone).specs?.battery?.capacitymAh || null;
      }, getValue: (p) => {
        if (p.category === 'tvs') return `Enerji Sınıfı: ${(p as TVProduct).specs?.energyClass || '-'}`;
        if (p.category === 'laptops') return (p as LaptopProduct).specs?.batteryCapacityWh ? `${(p as LaptopProduct).specs.batteryCapacityWh} Wh` : '-';
        return (p as Smartphone).specs?.battery?.capacitymAh ? `${(p as Smartphone).specs.battery.capacitymAh} mAh` : '-';
      }},
      { category: 'Yazılım & Ekosistem', label: 'İşletim Sistemi', getValue: (p) => {
        if (p.category === 'tvs') return (p as TVProduct).specs?.smartOs || '-';
        if (p.category === 'laptops') return (p as LaptopProduct).specs?.os || '-';
        return (p as Smartphone).specs?.software?.osName || '-';
      }}
    ];
  }

  // Calculate winner id for a given row
  const getRowWinnerId = (row: SpecRow): string | null => {
    if (!row.getRawNumber || products.length < 2) return null;

    const values = products.map((p) => ({
      id: p.id,
      num: row.getRawNumber ? row.getRawNumber(p) : null
    })).filter((v) => v.num !== null && !isNaN(v.num!)) as { id: string; num: number }[];

    if (values.length < 2) return null;

    if (row.isNumericHigherBetter) {
      const maxVal = Math.max(...values.map((v) => v.num));
      const winners = values.filter((v) => v.num === maxVal);
      if (winners.length === 1 && winners[0].num > Math.min(...values.map((v) => v.num))) {
        return winners[0].id;
      }
    } else if (row.isNumericLowerBetter) {
      const minVal = Math.min(...values.map((v) => v.num));
      const winners = values.filter((v) => v.num === minVal);
      if (winners.length === 1 && winners[0].num < Math.max(...values.map((v) => v.num))) {
        return winners[0].id;
      }
    }

    return null;
  };

  const isDiffRow = (row: SpecRow) => {
    if (products.length < 2) return false;
    const values = products.map((p) => String(row.getValue(p)).toLowerCase());
    const first = values[0];
    return values.some((v) => v !== first);
  };

  const diffCount = specRows.filter(isDiffRow).length;
  const categories = Array.from(new Set(specRows.map((r) => r.category)));

  const getItemUrl = (p: Product) => {
    if (p.category === 'tvs') return `/tvs/${p.slug}`;
    if (p.category === 'laptops') return `/laptops/${p.slug}`;
    if (p.category === 'monitors') return `/monitors/${p.slug}`;
    if (p.category === 'headphones') return `/headphones/${p.slug}`;
    if (p.category === 'smartwatches') return `/smartwatches/${p.slug}`;
    if (p.category === 'tablets') return `/tablets/${p.slug}`;
    if (p.category === 'appliances') return `/appliances/${p.slug}`;
    if (p.category === 'consoles') return `/consoles/${p.slug}`;
    return `/phones/${p.slug}`;
  };

  return (
    <div className="space-y-6">
      
      {/* 1. AI Decision / Verdict Card at Top */}
      <CompareVerdictCard products={products} />

      {/* 2. Controls bar */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Highlight Diffs Toggle */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setHighlightDiffs(!highlightDiffs)}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
              highlightDiffs
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-extrabold shadow-2xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Farkları Vurgula ({diffCount} Fark)</span>
          </motion.button>

          {/* Only Diffs Switch */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setOnlyDiffs(!onlyDiffs)}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
              onlyDiffs
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs font-extrabold'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Sadece Farkları Göster</span>
          </motion.button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
          <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            {products.length} / 4 Model Masada
          </span>
          <button
            onClick={clearCompare}
            className="text-rose-600 hover:underline font-extrabold cursor-pointer"
          >
            Tümünü Temizle
          </button>
        </div>

      </div>

      {/* 3. Comparison Table */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            
            {/* Header Row with Product Cards */}
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200">
                <th className="p-4 w-56 text-slate-700 text-xs font-black uppercase tracking-wider sticky left-0 bg-slate-50 z-20">
                  Teknik Özellikler
                </th>
                {products.map((product) => (
                  <th key={product.id} className="p-4 w-64 text-center align-top relative border-l border-slate-200/80">
                    <button
                      onClick={() => removeFromCompare(product.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      title={t.remove}
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="mx-auto mb-2 flex items-center justify-center">
                      <ProductImage src={product.image} alt={product.name} variant="card" className="w-24 h-24 max-w-[96px] shadow-2xs border border-slate-200" />
                    </div>

                    <Link href={getItemUrl(product)} className="block">
                      <h4 className="text-slate-900 text-xs font-black hover:text-emerald-600 transition-colors line-clamp-2 leading-snug">
                        {product.name}
                      </h4>
                    </Link>

                    <span className="text-emerald-700 font-black text-sm block mt-1.5 tabular-nums">
                      {product.basePrice.toLocaleString()} {product.currency}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Spec Sections */}
            <tbody>
              {categories.map((cat, cIdx) => {
                const catRows = specRows.filter((r) => r.category === cat);
                return (
                  <React.Fragment key={cIdx}>
                    {/* Category Title Header Row */}
                    <tr className="bg-slate-100/80 border-y border-slate-200">
                      <td
                        colSpan={products.length + 1}
                        className="px-4 py-2.5 text-[11px] font-black text-emerald-800 uppercase tracking-widest bg-emerald-50/60"
                      >
                        {cat}
                      </td>
                    </tr>

                    {/* Spec Rows */}
                    {catRows.map((row, rIdx) => {
                      const isDifferent = isDiffRow(row);
                      if (onlyDiffs && !isDifferent) return null;

                      const winnerId = getRowWinnerId(row);

                      return (
                        <tr
                          key={rIdx}
                          className={`border-b border-slate-100 transition-colors ${
                            highlightDiffs && isDifferent ? 'bg-amber-50/40' : 'hover:bg-slate-50/60'
                          }`}
                        >
                          <td className="p-4 text-slate-700 font-extrabold text-xs sticky left-0 bg-white shadow-2xs z-10">
                            {row.label}
                            {highlightDiffs && isDifferent && (
                              <span className="ml-2 text-[9px] bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded font-black">
                                FARK
                              </span>
                            )}
                          </td>

                          {products.map((product) => {
                            const val = row.getValue(product);
                            const isWinner = winnerId === product.id;

                            return (
                              <td
                                key={product.id}
                                className={`p-4 text-center text-xs font-bold border-l border-slate-200/60 transition-colors ${
                                  isWinner
                                    ? 'bg-emerald-50/70 text-emerald-950 font-black'
                                    : highlightDiffs && isDifferent
                                    ? 'text-slate-900'
                                    : 'text-slate-700'
                                }`}
                              >
                                <div className="flex flex-col items-center justify-center gap-1">
                                  <span>{val}</span>
                                  {isWinner && (
                                    <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[9.5px] font-black px-2 py-0.5 rounded-full shadow-2xs">
                                      <Trophy className="w-2.5 h-2.5" />
                                      <span>ÜSTÜN</span>
                                    </span>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legal & Price Transparency Disclaimer */}
      <PriceDisclaimer variant="card" />
    </div>
  );
}
