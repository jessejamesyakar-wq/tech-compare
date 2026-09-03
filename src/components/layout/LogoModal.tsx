'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useLogo } from '@/context/LogoContext';
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Sparkles,
  Scale,
  Cpu,
  Shield,
  Zap,
  Flame,
  Rocket,
  Crown,
  Folder,
  Sliders,
  CheckCircle2
} from 'lucide-react';

const PRESET_ICONS = [
  { id: 'scale', label: 'Terazi (Kıyas)', icon: Scale },
  { id: 'cpu', label: 'İşlemci (Tech)', icon: Cpu },
  { id: 'zap', label: 'Hızlı Yıldırım', icon: Zap },
  { id: 'shield', label: 'Güvenli Kalkan', icon: Shield },
  { id: 'flame', label: 'Popüler Alev', icon: Flame },
  { id: 'rocket', label: 'Performans Roketi', icon: Rocket },
  { id: 'crown', label: 'Premium Taç', icon: Crown },
  { id: 'sparkles', label: 'Yapay Zeka', icon: Sparkles },
];

const PRESET_GRADIENTS = [
  { id: 'emerald', name: 'Zümrüt Yeşil', class: 'from-emerald-600 via-teal-600 to-emerald-500' },
  { id: 'indigo', name: 'Koyu İndigo', class: 'from-indigo-600 via-violet-600 to-purple-600' },
  { id: 'sunset', name: 'Gün Batımı Amber', class: 'from-amber-500 via-orange-600 to-red-600' },
  { id: 'cyan', name: 'Siber Mavi', class: 'from-cyan-500 via-blue-600 to-indigo-600' },
  { id: 'rose', name: 'Neon Pembe', class: 'from-rose-500 via-pink-600 to-purple-600' },
  { id: 'dark', name: 'Mat Siyah Gold', class: 'from-slate-900 via-slate-800 to-amber-500' },
];

export function LogoModal() {
  const { logoConfig, updateLogoConfig, uploadCustomLogo, resetLogo, isModalOpen, setIsModalOpen } = useLogo();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'upload' | 'preset' | 'code'>('upload');
  const [urlInput, setUrlInput] = useState(logoConfig.imageUrl || '');
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  if (!isModalOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadStatus('Lütfen geçerli bir görsel dosyası seçin (.png, .svg, .jpg, .webp)');
      return;
    }

    try {
      setUploadStatus('Görsel işleniyor ve yükleniyor...');
      await uploadCustomLogo(file);
      setUploadStatus('Amblem başarıyla güncellendi!');
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (err) {
      setUploadStatus('Görsel yüklenirken bir hata oluştu.');
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    updateLogoConfig({
      type: 'image',
      imageUrl: urlInput.trim(),
    });
    setUploadStatus('URL Amblemi uygulandı!');
    setTimeout(() => setUploadStatus(null), 3000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  Sitenin Amblemini Değiştir
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Tam Yetki Aktif
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Kendi logonuzu yükleyin veya sitenin amblem tasarımını özelleştirin.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Live Preview Bar */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Canlı Önizleme:
            </span>
            <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800 shadow-inner">
              {logoConfig.type === 'image' && logoConfig.imageUrl ? (
                <Image
                  src={logoConfig.imageUrl}
                  alt="Custom Emblem"
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain rounded-xl border border-slate-700 bg-slate-900 p-1"
                />
              ) : (
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${logoConfig.bgGradient} flex items-center justify-center text-white shadow-md`}>
                  {React.createElement(PRESET_ICONS.find(i => i.id === logoConfig.presetIcon)?.icon || Scale, {
                    className: 'w-5 h-5 text-white stroke-[2.2]'
                  })}
                </div>
              )}
              <div className="flex flex-col leading-none">
                <span className="text-base font-black text-white">
                  {logoConfig.titleText || 'aceleEtme'}
                </span>
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">
                  {logoConfig.subtitleText || 'Akıllı Karşılaştırma Portalı'}
                </span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 p-1.5 gap-1">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2.5 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4 text-emerald-500" />
              1. Kendi Görselini / Logonı Yükle
            </button>
            <button
              onClick={() => setActiveTab('preset')}
              className={`flex-1 py-2.5 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'preset'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4 text-indigo-500" />
              2. İkon & Renk Tasarla
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex-1 py-2.5 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Folder className="w-4 h-4 text-amber-500" />
              3. Proje Klasörü Yolu
            </button>
          </div>

          {/* Content Area */}
          <div className="p-6 overflow-y-auto space-y-6">
            {uploadStatus && (
              <div className="p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{uploadStatus}</span>
              </div>
            )}

            {/* TAB 1: UPLOAD CUSTOM FILE OR URL */}
            {activeTab === 'upload' && (
              <div className="space-y-6">
                {/* File Dropzone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-3xl p-8 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-800/30 group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/svg+xml, image/webp"
                    className="hidden"
                  />
                  <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-md">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white mb-1">
                    Bilgisayarınızdan Amblem Görseli Seçin
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
                    Tıklayın veya amblem / logo dosyanızı buraya sürükleyin. PNG, SVG, JPG veya WEBP formatları desteklenmektedir.
                  </p>
                </div>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
                  <span className="bg-white dark:bg-slate-900 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest absolute">
                    veya Web Bağlantısı (URL)
                  </span>
                </div>

                {/* URL Input */}
                <form onSubmit={handleUrlSubmit} className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://site.com/logo.png"
                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-md cursor-pointer transition-colors"
                  >
                    URL Kullan
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: PRESET ICON & GRADIENT CUSTOMIZER */}
            {activeTab === 'preset' && (
              <div className="space-y-6">
                {/* Icon Selection */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 dark:text-slate-400 mb-3">
                    Amblem İkonu Seçin:
                  </label>
                  <div className="grid grid-cols-4 gap-2.5">
                    {PRESET_ICONS.map((item) => {
                      const IconComp = item.icon;
                      const isSelected = logoConfig.type === 'presetIcon' && logoConfig.presetIcon === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() =>
                            updateLogoConfig({
                              type: 'presetIcon',
                              presetIcon: item.id,
                            })
                          }
                          className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-black shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <IconComp className="w-6 h-6 stroke-[2]" />
                          <span className="text-[11px] font-extrabold">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color Gradients */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 dark:text-slate-400 mb-3">
                    Renk Teması / Gradyan:
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {PRESET_GRADIENTS.map((grad) => {
                      const isSelected = logoConfig.bgGradient === grad.class;
                      return (
                        <button
                          key={grad.id}
                          onClick={() => updateLogoConfig({ bgGradient: grad.class })}
                          className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-emerald-500 bg-slate-50 dark:bg-slate-800 ring-2 ring-emerald-500/30'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${grad.class} shadow-sm shrink-0`} />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {grad.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PROJECT CODE & DIRECTORY FILE LOCATION */}
            {activeTab === 'code' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl space-y-3 border border-slate-800">
                  <h4 className="font-black text-emerald-400 text-sm flex items-center gap-2">
                    <Folder className="w-4 h-4" />
                    Proje Dosya Konumları (Kod / Dosya Seviyesinde Değişim):
                  </h4>
                  <p className="text-slate-400 leading-relaxed">
                    Sitenin logosunu veya amblemini doğrudan bilgisayarınızdaki proje klasöründen kalıcı olarak değiştirmek isterseniz aşağıdaki dosya yollarını kullanabilirsiniz:
                  </p>

                  <div className="space-y-2 font-mono text-[11px] bg-slate-950 p-3 rounded-xl border border-slate-800 select-all">
                    <div>
                      <span className="text-amber-400 font-bold">Amblem Resmi Dosya Yolu:</span>
                      <br />
                      <code className="text-emerald-300">
                        C:\Users\Alpdeniz\.gemini\antigravity\scratch\tech-compare\public\emblem.png
                      </code>
                    </div>
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-amber-400 font-bold">Logo Komponent Kod Yolu:</span>
                      <br />
                      <code className="text-emerald-300">
                        C:\Users\Alpdeniz\.gemini\antigravity\scratch\tech-compare\src\components\layout\Logo.tsx
                      </code>
                    </div>
                  </div>

                  <p className="text-slate-400 text-[11px]">
                    💡 <strong>İpucu:</strong> Kendi hazırladığınız logonuzu <code className="text-emerald-300">emblem.png</code> ismiyle yukarıdaki <code className="text-emerald-300">public/</code> klasörüne yapıştırırsanız, sitenin orijinal amblemi tamamen sizin logonuz olur!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
            <button
              onClick={resetLogo}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Varsayılana Sıfırla
            </button>

            <button
              onClick={() => setIsModalOpen(false)}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-md cursor-pointer transition-colors"
            >
              <Check className="w-4 h-4" />
              Tamamlandı & Kaydet
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
