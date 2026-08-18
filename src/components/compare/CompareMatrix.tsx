'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Product, Smartphone, TVProduct, LaptopProduct } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';
import { useCompare } from '@/context/CompareContext';
import {
  Scale,
  Sparkles,
  X,
  SlidersHorizontal
} from 'lucide-react';

interface CompareMatrixProps {
  products: Product[];
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
          href="/laptops"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-all shadow-xs"
        >
          <span>{t.navCatalog}</span>
        </Link>
      </div>
    );
  }

  const isLaptopComparison = products.every((p) => p.category === 'laptops');
  const isTvComparison = products.every((p) => p.category === 'tvs');

  interface SpecRow {
    category: string;
    label: string;
    getValue: (p: Product) => string | number;
  }

  // Define rows dynamically based on product type
  let specRows: SpecRow[] = [];

  if (isLaptopComparison) {
    specRows = [
      { category: 'Fiyat & Puan', label: 'Başlangıç Fiyatı', getValue: (p) => `${p.basePrice.toLocaleString()} ${p.currency}` },
      { category: 'Fiyat & Puan', label: 'Kullanıcı Puanı', getValue: (p) => `⭐ ${p.rating} / 5 (${p.reviewCount})` },
      { category: 'Fiyat & Puan', label: 'Çıkış Yılı', getValue: (p) => p.releaseYear || '-' },

      { category: 'İşlemci & Performans', label: 'İşlemci Modeli', getValue: (p) => (p as LaptopProduct).specs?.processor || 'Belirtilmedi' },
      { category: 'İşlemci & Performans', label: 'Çekirdek & İzlek Yapısı', getValue: (p) => (p as LaptopProduct).specs?.processorCores || 'Belirtilmedi' },
      { category: 'İşlemci & Performans', label: 'Yapay Zekâ NPU', getValue: (p) => {
        const tops = (p as LaptopProduct).specs?.npuTops;
        return tops && tops > 0 ? `${tops} TOPS NPU` : 'Yok / Desteklenmiyor';
      }},

      { category: 'Bellek & Depolama', label: 'RAM Kapasitesi & Türü', getValue: (p) => {
        const spec = (p as LaptopProduct).specs;
        if (spec?.ramType) return spec.ramType;
        if (spec?.ramGb) return `${spec.ramGb} GB RAM`;
        return 'Belirtilmedi';
      }},
      { category: 'Bellek & Depolama', label: 'SSD Depolama', getValue: (p) => {
        const spec = (p as LaptopProduct).specs;
        if (spec?.storageType) return spec.storageType;
        if (spec?.storageGb) return `${spec.storageGb} GB SSD`;
        return 'Belirtilmedi';
      }},
      { category: 'Bellek & Depolama', label: 'M.2 / Genişletme Yuvası', getValue: (p) => (p as LaptopProduct).specs?.storageSlots || 'Tümleşik / M.2' },

      { category: 'Ekran & Ekran Kartı', label: 'Ekran Kartı (GPU)', getValue: (p) => (p as LaptopProduct).specs?.gpu || 'Dahili Grafik' },
      { category: 'Ekran & Ekran Kartı', label: 'Grafik Gücü (TGP Watts)', getValue: (p) => {
        const tgp = (p as LaptopProduct).specs?.gpuTgpWatts;
        return tgp ? `${tgp}W TGP` : 'Dahili / Standard TGP';
      }},
      { category: 'Ekran & Ekran Kartı', label: 'Ekran Boyutu & Çözünürlük', getValue: (p) => {
        const spec = (p as LaptopProduct).specs;
        if (spec?.screenResolution) return spec.screenResolution;
        if (spec?.screenSizeInches) return `${spec.screenSizeInches} inç Ekran`;
        return 'Belirtilmedi';
      }},
      { category: 'Ekran & Ekran Kartı', label: 'Parlaklık & Renk Gamı', getValue: (p) => {
        const spec = (p as LaptopProduct).specs;
        const parts = [
          spec?.screenBrightnessNits ? `${spec.screenBrightnessNits} nits` : null,
          spec?.colorGamut
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(' • ') : 'Belirtilmedi';
      }},

      { category: 'Batarya, Bağlantı & Kasa', label: 'Batarya & Şarj', getValue: (p) => {
        const spec = (p as LaptopProduct).specs;
        const parts = [];
        if (spec?.batteryCapacityWh) parts.push(`${spec.batteryCapacityWh} Wh`);
        if (spec?.batteryLifeHours) parts.push(`${spec.batteryLifeHours} Saat Pil`);
        if (spec?.chargerWatts) parts.push(`${spec.chargerWatts}W Şarj`);
        return parts.length > 0 ? parts.join(' • ') : 'Belirtilmedi';
      }},
      { category: 'Batarya, Bağlantı & Kasa', label: 'Kablosuz Bağlantı', getValue: (p) => {
        const spec = (p as LaptopProduct).specs;
        const parts = [spec?.wifiStandard, spec?.bluetooth].filter(Boolean);
        return parts.length > 0 ? parts.join(' • ') : 'Wi-Fi & Bluetooth';
      }},
      { category: 'Batarya, Bağlantı & Kasa', label: 'Portlar', getValue: (p) => {
        const ports = (p as LaptopProduct).specs?.ports;
        return ports && ports.length > 0 ? ports.join(', ') : 'Standart I/O Portları';
      }},
      { category: 'Batarya, Bağlantı & Kasa', label: 'Ağırlık & Kalınlık', getValue: (p) => {
        const spec = (p as LaptopProduct).specs;
        const parts = [];
        if (spec?.weightKg) parts.push(`${spec.weightKg} kg`);
        if (spec?.thicknessMm) parts.push(`${spec.thicknessMm} mm`);
        return parts.length > 0 ? parts.join(' / ') : 'Belirtilmedi';
      }},
      { category: 'Batarya, Bağlantı & Kasa', label: 'İşletim Sistemi', getValue: (p) => (p as LaptopProduct).specs?.os || 'Belirtilmedi' }
    ];
  } else if (isTvComparison) {
    specRows = [
      { category: 'Fiyat & Puan', label: 'Başlangıç Fiyatı', getValue: (p) => `${p.basePrice.toLocaleString()} ${p.currency}` },
      { category: 'Fiyat & Puan', label: 'Kullanıcı Puanı', getValue: (p) => `⭐ ${p.rating} / 5 (${p.reviewCount})` },
      { category: 'Fiyat & Puan', label: 'Çıkış Yılı', getValue: (p) => p.releaseYear || '-' },

      { category: 'Ekran & Donanım', label: 'Ekran Boyutu', getValue: (p) => {
        const tv = p as TVProduct;
        return `${tv.specs?.screenSizeInches || ''}" (${Math.round((tv.specs?.screenSizeInches || 0) * 2.54)} cm)`;
      }},
      { category: 'Ekran & Donanım', label: 'Panel Teknolojisi', getValue: (p) => (p as TVProduct).specs?.displayTech || '-' },
      { category: 'Ekran & Donanım', label: 'Çözünürlük', getValue: (p) => (p as TVProduct).specs?.resolution || '4K Ultra HD' },
      { category: 'Ekran & Donanım', label: 'Yenileme Hızı', getValue: (p) => `${(p as TVProduct).specs?.refreshRateHz || 60} Hz` },
      { category: 'Ekran & Donanım', label: 'Zirve Parlaklık (Nit)', getValue: (p) => `${(p as TVProduct).specs?.brightnessNits || 1000} nits` },

      { category: 'Akıllı Özellikler', label: 'İşletim Sistemi', getValue: (p) => (p as TVProduct).specs?.smartOs || 'Smart TV' },
      { category: 'Akıllı Özellikler', label: 'Görüntü İşlemcisi', getValue: (p) => (p as TVProduct).specs?.processorEngine || 'AI Engine' },
      { category: 'Akıllı Özellikler', label: 'Ses Gücü (Watt)', getValue: (p) => `${(p as TVProduct).specs?.audioPowerWatts || 20} W` },

      { category: 'Bağlantı & Enerji', label: 'HDMI Port Sayısı', getValue: (p) => `${(p as TVProduct).specs?.hdmiPorts || 3} Adet` },
      { category: 'Bağlantı & Enerji', label: 'USB Port Sayısı', getValue: (p) => `${(p as TVProduct).specs?.usbPorts || 2} Adet` },
      { category: 'Bağlantı & Enerji', label: 'Enerji Sınıfı', getValue: (p) => (p as TVProduct).specs?.energyClass || 'E' }
    ];
  } else {
    // Smartphone or Mixed comparison
    specRows = [
      { category: 'Fiyat & Puan', label: 'Başlangıç Fiyatı', getValue: (p) => `${p.basePrice.toLocaleString()} ${p.currency}` },
      { category: 'Fiyat & Puan', label: 'Kullanıcı Puanı', getValue: (p) => `⭐ ${p.rating} / 5 (${p.reviewCount})` },
      { category: 'Fiyat & Puan', label: 'AnTuTu Performans Puanı', getValue: (p) => {
        const phone = p as Smartphone;
        return phone.specs?.processor?.antutuScore ? phone.specs.processor.antutuScore.toLocaleString() : '-';
      }},
      { category: 'Fiyat & Puan', label: 'DXOMARK Kamera Puanı', getValue: (p) => {
        const phone = p as Smartphone;
        return phone.specs?.camera?.dxomarkScore ? String(phone.specs.camera.dxomarkScore) : '-';
      }},

      { category: 'Ekran', label: 'Ekran Boyutu', getValue: (p) => {
        if (p.category === 'tvs') return `${(p as TVProduct).specs?.screenSizeInches}"`;
        if (p.category === 'laptops') return `${(p as LaptopProduct).specs?.screenSizeInches}"`;
        return (p as Smartphone).specs?.screen?.size || '-';
      }},
      { category: 'Ekran', label: 'Panel Tipi / Çözünürlük', getValue: (p) => {
        if (p.category === 'tvs') return (p as TVProduct).specs?.displayTech || '-';
        if (p.category === 'laptops') return (p as LaptopProduct).specs?.screenResolution || '-';
        return (p as Smartphone).specs?.screen?.type || '-';
      }},
      { category: 'Ekran', label: 'Yenileme Hızı', getValue: (p) => {
        if (p.category === 'tvs') return `${(p as TVProduct).specs?.refreshRateHz || 60} Hz`;
        if (p.category === 'laptops') return '-';
        return (p as Smartphone).specs?.screen?.refreshRate ? `${(p as Smartphone).specs.screen.refreshRate} Hz` : '-';
      }},

      { category: 'Donanım & Performans', label: 'İşlemci / Yonga Seti', getValue: (p) => {
        if (p.category === 'tvs') return (p as TVProduct).specs?.processorEngine || '-';
        if (p.category === 'laptops') return (p as LaptopProduct).specs?.processor || '-';
        return (p as Smartphone).specs?.processor?.chip || '-';
      }},
      { category: 'Donanım & Performans', label: 'RAM / Bellek', getValue: (p) => {
        if (p.category === 'tvs') return '-';
        if (p.category === 'laptops') return (p as LaptopProduct).specs?.ramGb ? `${(p as LaptopProduct).specs.ramGb} GB` : '-';
        return (p as Smartphone).specs?.memory?.ramGb ? `${(p as Smartphone).specs.memory.ramGb} GB` : '-';
      }},
      { category: 'Donanım & Performans', label: 'Dahili Depolama', getValue: (p) => {
        if (p.category === 'tvs') return '-';
        if (p.category === 'laptops') return (p as LaptopProduct).specs?.storageGb ? `${(p as LaptopProduct).specs.storageGb} GB` : '-';
        return (p as Smartphone).specs?.memory?.storageGb ? `${(p as Smartphone).specs.memory.storageGb} GB` : '-';
      }},

      { category: 'Kamera / GPU', label: 'Grafik Kartı / Kamera', getValue: (p) => {
        if (p.category === 'tvs') return `${(p as TVProduct).specs?.audioPowerWatts || 20} W Ses`;
        if (p.category === 'laptops') return (p as LaptopProduct).specs?.gpu || '-';
        return (p as Smartphone).specs?.camera?.mainMp ? `${(p as Smartphone).specs.camera.mainMp} MP` : '-';
      }},
      { category: 'Batarya & Enerji', label: 'Batarya / Enerji', getValue: (p) => {
        if (p.category === 'tvs') return `Enerji Sınıfı: ${(p as TVProduct).specs?.energyClass || '-'}`;
        if (p.category === 'laptops') return (p as LaptopProduct).specs?.batteryCapacityWh ? `${(p as LaptopProduct).specs.batteryCapacityWh} Wh` : '-';
        return (p as Smartphone).specs?.battery?.capacitymAh ? `${(p as Smartphone).specs.battery.capacitymAh} mAh` : '-';
      }},
      { category: 'Yazılım', label: 'İşletim Sistemi', getValue: (p) => {
        if (p.category === 'tvs') return (p as TVProduct).specs?.smartOs || '-';
        if (p.category === 'laptops') return (p as LaptopProduct).specs?.os || '-';
        return (p as Smartphone).specs?.software?.osName || '-';
      }}
    ];
  }

  // Helper to check if a row has differing values across products
  const isDiffRow = (row: SpecRow) => {
    if (products.length < 2) return false;
    const values = products.map((p) => String(row.getValue(p)).toLowerCase());
    const first = values[0];
    return values.some((v) => v !== first);
  };

  // Group rows by category
  const categories = Array.from(new Set(specRows.map((r) => r.category)));

  const getItemUrl = (p: Product) => {
    if (p.category === 'tvs') return `/tvs/${p.slug}`;
    if (p.category === 'laptops') return `/laptops/${p.slug}`;
    return `/phones/${p.slug}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Controls bar */}
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
            <span>{t.highlightDiffs}</span>
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
            <span>{t.onlyDiffs}</span>
          </motion.button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
          <span>{products.length} / 4 Ürün Karşılaştırılıyor</span>
          <button
            onClick={clearCompare}
            className="text-rose-600 hover:underline font-extrabold cursor-pointer"
          >
            Tümünü Temizle
          </button>
        </div>

      </div>

      {/* Comparison Table */}
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

                    <div className="w-24 h-24 mx-auto mb-2 bg-white rounded-2xl p-2 border border-slate-200 flex items-center justify-center shadow-2xs">
                      <img src={product.image} alt={product.name} className="h-full object-contain" />
                    </div>

                    <Link href={getItemUrl(product)} className="block">
                      <h4 className="text-slate-900 text-xs font-black hover:text-emerald-600 transition-colors line-clamp-2">
                        {product.name}
                      </h4>
                    </Link>

                    <span className="text-emerald-600 font-black text-sm block mt-1">
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

                      return (
                        <tr
                          key={rIdx}
                          className={`border-b border-slate-100 transition-colors ${
                            highlightDiffs && isDifferent ? 'bg-amber-50/50' : 'hover:bg-slate-50/60'
                          }`}
                        >
                          <td className="p-4 text-slate-600 font-extrabold text-xs sticky left-0 bg-white shadow-2xs z-10">
                            {row.label}
                            {highlightDiffs && isDifferent && (
                              <span className="ml-2 text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-black">
                                FARKLI
                              </span>
                            )}
                          </td>

                          {products.map((product) => {
                            const val = row.getValue(product);
                            return (
                              <td
                                key={product.id}
                                className={`p-4 text-center text-xs font-bold border-l border-slate-200/60 ${
                                  highlightDiffs && isDifferent ? 'text-amber-950 font-black' : 'text-slate-800'
                                }`}
                              >
                                {val}
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
    </div>
  );
}
