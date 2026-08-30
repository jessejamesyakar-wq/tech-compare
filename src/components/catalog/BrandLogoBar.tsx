'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getAllSmartphones,
  getAllTVs,
  getAllLaptops,
  getAllAppliances,
  getAllTablets,
  getAllSmartwatches,
  getAllHeadphones,
  getAllConsoles,
  getAllMonitors,
} from '@/lib/data';
import { saveBrandLogoToIDB, getAllBrandLogosFromIDB, deleteBrandLogoFromIDB } from '@/lib/idbBrandLogos';
import { Sparkles, ArrowRight, Upload, Image as ImageIcon, RotateCcw, X, Edit3, Check, AlertCircle } from 'lucide-react';

export interface BrandConfig {
  name: string;
  categoryTag: string;
  isMultiCategory: boolean;
  searchFilter: string;
  href: string;
  renderDefaultLogo: () => React.ReactNode;
}

// Compact & Clean Crisp Default Logos
const BRAND_CONFIGS: BrandConfig[] = [
  {
    name: 'Apple',
    categoryTag: 'Mobil Ekosistem',
    isMultiCategory: false,
    searchFilter: 'Apple',
    href: '/phones?brand=Apple',
    renderDefaultLogo: () => (
      <svg className="h-6 w-auto text-slate-900 dark:text-white" viewBox="0 0 170 170" fill="currentColor">
        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.82.25-9.69-1.85-14.6-6.35-3.3-3.03-7.24-7.85-11.83-14.44-6.44-9.23-11.39-19.82-14.86-31.77-3.47-11.95-5.2-23.5-5.2-34.65 0-14.7 3.65-26.6 10.96-35.7 7.31-9.1 16.5-13.76 27.57-13.98 4.17 0 8.94 1.1 14.32 3.3 5.38 2.2 9.07 3.35 11.07 3.45 2.5 0 6.38-1.25 11.64-3.75 5.26-2.5 9.87-3.7 13.84-3.6 11.6.85 20.73 5.3 27.38 13.35-10.3 6.25-15.35 15.1-15.15 26.55.25 8.9 3.6 16.35 10.05 22.35 6.45 6 14.15 9.25 23.1 9.75-2.6 7.6-6.15 15.15-10.65 22.65zM119.22 31.55c0-6.65 2.4-13.05 7.2-19.2 5.3-6.65 11.95-10.55 19.95-11.7.2 1.35.3 2.5.3 3.45 0 6.8-2.55 13.4-7.65 19.8-5.1 6.4-11.75 10.25-19.95 11.55-.25-1.05-.38-2.02-.38-2.9-1.47-3.55-1.47-3.55-1.47-3.55z" />
      </svg>
    )
  },
  {
    name: 'Samsung',
    categoryTag: 'Telefon & TV Ekosistemi',
    isMultiCategory: true,
    searchFilter: 'Samsung',
    href: '/phones?brand=Samsung',
    renderDefaultLogo: () => (
      <span className="text-sm font-black text-[#1428A0] dark:text-blue-400 tracking-wider">
        SAMSUNG
      </span>
    )
  },
  {
    name: 'Xiaomi',
    categoryTag: 'Telefon & TV Ekosistemi',
    isMultiCategory: true,
    searchFilter: 'Xiaomi',
    href: '/phones?brand=Xiaomi',
    renderDefaultLogo: () => (
      <div className="w-7 h-7 rounded-md bg-[#FF6900] flex items-center justify-center text-white font-black">
        <span className="text-xs font-black tracking-tighter">mi</span>
      </div>
    )
  },
  {
    name: 'TCL',
    categoryTag: 'Telefon & TV Ekosistemi',
    isMultiCategory: true,
    searchFilter: 'TCL',
    href: '/tvs?brand=TCL',
    renderDefaultLogo: () => (
      <span className="text-sm font-black text-[#E2001A] tracking-wider">
        TCL
      </span>
    )
  },
  {
    name: 'LG',
    categoryTag: 'Televizyon Ekosistemi',
    isMultiCategory: true,
    searchFilter: 'LG',
    href: '/tvs?brand=LG',
    renderDefaultLogo: () => (
      <div className="flex items-center gap-1.5">
        <svg className="h-5 w-auto text-[#A50034]" viewBox="0 0 40 40" fill="currentColor">
          <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="4" />
          <circle cx="14" cy="14" r="2.5" />
          <path d="M26 14v12h-12" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-sm font-black text-slate-900 dark:text-white">LG</span>
      </div>
    )
  },
  {
    name: 'Philips',
    categoryTag: 'Televizyon Ekosistemi',
    isMultiCategory: true,
    searchFilter: 'Philips',
    href: '/tvs?brand=Philips',
    renderDefaultLogo: () => (
      <span className="text-xs font-black text-[#006699] dark:text-cyan-400 tracking-wider">
        PHILIPS
      </span>
    )
  },
  {
    name: 'Sony',
    categoryTag: 'Telefon & TV Ekosistemi',
    isMultiCategory: true,
    searchFilter: 'Sony',
    href: '/phones?brand=Sony',
    renderDefaultLogo: () => (
      <span className="text-xs font-black text-slate-900 dark:text-white tracking-widest">
        SONY
      </span>
    )
  },
  {
    name: 'Google',
    categoryTag: 'Pixel & AI Ekosistemi',
    isMultiCategory: false,
    searchFilter: 'Google',
    href: '/phones?brand=Google',
    renderDefaultLogo: () => (
      <div className="flex items-center gap-1.5">
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        <span className="text-xs font-black text-slate-900 dark:text-white">Google</span>
      </div>
    )
  },
  {
    name: 'Huawei',
    categoryTag: 'Mobil Ekosistem',
    isMultiCategory: false,
    searchFilter: 'Huawei',
    href: '/phones?brand=Huawei',
    renderDefaultLogo: () => (
      <span className="text-xs font-black text-[#CF0A2C] tracking-wider">
        HUAWEI
      </span>
    )
  },
  {
    name: 'Honor',
    categoryTag: 'Mobil Ekosistem',
    isMultiCategory: false,
    searchFilter: 'Honor',
    href: '/phones?brand=Honor',
    renderDefaultLogo: () => (
      <span className="text-xs font-black text-slate-900 dark:text-white tracking-widest">
        HONOR
      </span>
    )
  },
  {
    name: 'Oppo',
    categoryTag: 'Mobil Ekosistem',
    isMultiCategory: false,
    searchFilter: 'Oppo',
    href: '/phones?brand=Oppo',
    renderDefaultLogo: () => (
      <span className="text-xs font-black text-[#008B5E] dark:text-emerald-400 tracking-wider">
        OPPO
      </span>
    )
  },
  {
    name: 'Vivo',
    categoryTag: 'Mobil Ekosistem',
    isMultiCategory: false,
    searchFilter: 'Vivo',
    href: '/phones?brand=Vivo',
    renderDefaultLogo: () => (
      <span className="text-xs font-black text-[#415FFF] dark:text-blue-400 tracking-wider">
        VIVO
      </span>
    )
  },
  {
    name: 'Realme',
    categoryTag: 'Mobil Ekosistem',
    isMultiCategory: false,
    searchFilter: 'Realme',
    href: '/phones?brand=Realme',
    renderDefaultLogo: () => (
      <div className="bg-[#FFC600] px-2.5 py-1 rounded text-black font-black text-xs tracking-tight">
        realme
      </div>
    )
  },
  {
    name: 'OnePlus',
    categoryTag: 'Mobil Ekosistem',
    isMultiCategory: false,
    searchFilter: 'OnePlus',
    href: '/phones?brand=OnePlus',
    renderDefaultLogo: () => (
      <span className="text-xs font-black text-[#F3031B] tracking-wider">
        ONEPLUS
      </span>
    )
  },
  {
    name: 'Casper',
    categoryTag: 'Excalibur & Nirvana',
    isMultiCategory: true,
    searchFilter: 'Casper',
    href: '/laptops?brand=Casper',
    renderDefaultLogo: () => (
      <span className="text-xs font-black text-[#0066B3] dark:text-sky-400 tracking-wider">
        CASPER
      </span>
    )
  },
  {
    name: 'MSI',
    categoryTag: 'Titan & Raider & Stealth',
    isMultiCategory: false,
    searchFilter: 'MSI',
    href: '/laptops?brand=MSI',
    renderDefaultLogo: () => (
      <span className="text-xs font-black text-[#E2001A] dark:text-red-500 tracking-wider font-mono">
        MSI
      </span>
    )
  },
  {
    name: 'Ecovacs',
    categoryTag: 'Deebot & Winbot Ekosistemi',
    isMultiCategory: false,
    searchFilter: 'Ecovacs',
    href: '/appliances?brand=Ecovacs',
    renderDefaultLogo: () => (
      <span className="text-xs font-black text-[#144782] dark:text-blue-400 tracking-widest uppercase">
        ECOVACS
      </span>
    )
  },
  {
    name: 'Roborock',
    categoryTag: 'Saros & Qrevo Ekosistemi',
    isMultiCategory: false,
    searchFilter: 'Roborock',
    href: '/appliances?brand=Roborock',
    renderDefaultLogo: () => (
      <span className="text-xs font-black text-[#FF3B30] dark:text-red-400 tracking-widest uppercase">
        roborock
      </span>
    )
  },
  {
    name: 'Dreame',
    categoryTag: 'X & L Serisi Ekosistemi',
    isMultiCategory: false,
    searchFilter: 'Dreame',
    href: '/appliances?brand=Dreame',
    renderDefaultLogo: () => (
      <span className="text-xs font-black text-[#C69214] dark:text-amber-400 tracking-widest uppercase">
        dreame
      </span>
    )
  },
];

export function BrandLogoBar({ onSelectBrand }: { onSelectBrand?: (brand: string) => void }) {
  const [brandCounts, setBrandCounts] = useState<{ [brandName: string]: number }>({});
  const [totalCatalogCount, setTotalCatalogCount] = useState<number>(0);

  // Custom Uploaded Logos stored in IndexedDB (Unlimited capacity, zero localStorage quota issues)
  const [customLogos, setCustomLogos] = useState<{ [brandName: string]: string }>({});
  const [editingBrand, setEditingBrand] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  const activeBrandConfigs = BRAND_CONFIGS;

  useEffect(() => {
    // Load custom brand logos safely from IndexedDB
    getAllBrandLogosFromIDB().then(setCustomLogos).catch(console.warn);

    Promise.all([
      getAllSmartphones(),
      getAllTVs(),
      getAllLaptops(),
      getAllAppliances(),
      getAllTablets(),
      getAllSmartwatches(),
      getAllHeadphones(),
      getAllConsoles(),
      getAllMonitors(),
    ]).then(([phones, tvs, laptops, appliances, tablets, smartwatches, headphones, consoles, monitors]) => {
      const counts: { [b: string]: number } = {};
      const allProducts = [
        ...phones,
        ...tvs,
        ...laptops,
        ...appliances,
        ...tablets,
        ...smartwatches,
        ...headphones,
        ...consoles,
        ...monitors,
      ];

      allProducts.forEach((p) => {
        if (p.brand) {
          counts[p.brand] = (counts[p.brand] || 0) + 1;
        }
      });

      setBrandCounts(counts);
      setTotalCatalogCount(allProducts.length);
    });
  }, []);

  const saveCustomLogo = async (brandName: string, logoDataUrl: string) => {
    setStorageError(null);
    try {
      await saveBrandLogoToIDB(brandName, logoDataUrl);
      setCustomLogos((prev) => ({ ...prev, [brandName]: logoDataUrl }));
      setIsModalOpen(false);
      setEditingBrand(null);
    } catch (err) {
      console.error(err);
      setStorageError('Resim kaydedilirken bir hata oluştu.');
    }
  };

  const removeCustomLogo = async (brandName: string) => {
    setStorageError(null);
    await deleteBrandLogoFromIDB(brandName);
    setCustomLogos((prev) => {
      const updated = { ...prev };
      delete updated[brandName];
      return updated;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, brandName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result) {
        await saveCustomLogo(brandName, event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSave = async (brandName: string) => {
    if (!urlInput.trim()) return;
    await saveCustomLogo(brandName, urlInput.trim());
    setUrlInput('');
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Prestigious Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-2 shadow-xs">
            <Sparkles className="w-3 h-3 text-emerald-400 dark:text-emerald-600" />
            <span>GLOBAL EKOSİSTEM MERKEZİ</span>
          </div>

          <h2 className="text-slate-900 dark:text-white text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
            <span>Global Teknoloji Markaları</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Telefon, televizyon ve akıllı cihaz ekosisteminde tarafsız kıyaslama.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/phones"
            className="inline-flex items-center gap-2 text-xs font-black text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer group"
          >
            <span>Tüm Kataloğu İncele ({totalCatalogCount > 0 ? totalCatalogCount.toLocaleString('tr-TR') : '1.050+'} Model)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Grid of Ultra-Minimalist Pure Logo Cards (No Text Below) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {activeBrandConfigs.map((brand) => {
          const modelCount = brandCounts[brand.name] || 0;
          const displayLabel = brand.isMultiCategory
            ? (modelCount > 0 ? `Telefon & TV (${modelCount} Model)` : 'Çoklu Ekosistem')
            : (modelCount > 0 ? `${modelCount} Model` : brand.categoryTag);

          const hasCustomLogo = Boolean(customLogos[brand.name]);

          return (
            <div
              key={brand.name}
              title={`${brand.name} (${displayLabel})`}
              className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 p-4 rounded-2xl transition-all duration-300 ease-out shadow-xs hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 flex items-center justify-center min-h-[72px] sm:min-h-[80px] overflow-hidden"
            >
              {/* Custom Upload Trigger Button (Top-Right Action) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setEditingBrand(brand.name);
                  setStorageError(null);
                  setIsModalOpen(true);
                }}
                title={`${brand.name} için kendi logonuzu yükleyin`}
                className="absolute top-1.5 right-1.5 z-20 w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-400 dark:text-slate-400 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-xs"
              >
                <Edit3 className="w-2.5 h-2.5" />
              </button>

              {/* Multi-Category Indicator Pill */}
              {brand.isMultiCategory && !hasCustomLogo && (
                <span className="absolute top-2 left-2 flex h-2 w-2 z-10" title="Çoklu Ekosistem (Telefon & TV)">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}

              {/* Clickable Card link - Pure Logo Display */}
              <Link
                href={brand.href}
                onClick={() => onSelectBrand && onSelectBrand(brand.name)}
                className="w-full h-full flex items-center justify-center my-auto"
              >
                {hasCustomLogo ? (
                  <img
                    src={customLogos[brand.name]}
                    alt={`${brand.name} Logosu`}
                    className="max-h-7 sm:max-h-8 max-w-[85%] object-contain transition-transform group-hover:scale-110 duration-300"
                  />
                ) : (
                  <div className="transition-transform group-hover:scale-110 duration-300 flex items-center justify-center max-h-7 sm:max-h-8 max-w-[85%] overflow-hidden">
                    {brand.renderDefaultLogo()}
                  </div>
                )}
              </Link>
            </div>
          );
        })}
      </div>

      {/* Modal for Custom Brand Logo Upload */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingBrand(null);
                setStorageError(null);
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <Upload className="w-3 h-3" />
                <span>ÖZEL MARKA LOGOSU YÜKLE</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Marka Logosu Yükleme & Düzenleme
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Yüklediğiniz logo güvenli tarayıcı veritabanında saklanır ve anında sitede görüntülenir.
              </p>
            </div>

            {/* Error Message */}
            {storageError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{storageError}</span>
              </div>
            )}

            {/* Select Brand Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Marka Seçin:
              </label>
              <select
                value={editingBrand || BRAND_CONFIGS[0].name}
                onChange={(e) => setEditingBrand(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {activeBrandConfigs.map((b) => (
                  <option key={b.name} value={b.name}>
                    {b.name} {customLogos[b.name] ? ' (Özel Logo Yüklü)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload Stage */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Bilgisayarınızdan Resim Dosyası Seçin:
              </label>
              <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center">
                <ImageIcon className="w-6 h-6 text-emerald-600" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Logo Dosyasını Yükle (PNG, SVG, JPG, WebP)
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Sınırsız boyut kapasitesi (IndexedDB)
                </span>
                <input
                  type="file"
                  accept="image/png, image/svg+xml, image/jpeg, image/webp"
                  onChange={(e) => editingBrand && handleFileUpload(e, editingBrand)}
                  className="hidden"
                />
              </label>
            </div>

            {/* OR URL Input */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                veya Doğrudan Resim Bağlantı (URL) Adresi Girin:
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={() => editingBrand && handleUrlSave(editingBrand)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
                >
                  Kaydet
                </button>
              </div>
            </div>

            {/* Existing Custom Logo Actions */}
            {editingBrand && customLogos[editingBrand] && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Özel logo aktif!
                </span>
                <button
                  onClick={async () => {
                    if (editingBrand) {
                      await removeCustomLogo(editingBrand);
                      setIsModalOpen(false);
                      setEditingBrand(null);
                    }
                  }}
                  className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Varsayılan Logoya Dön
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
