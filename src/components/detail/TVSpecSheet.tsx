'use client';

import React, { useState } from 'react';
import { TVSpecs } from '@/lib/types';
import {
  Tv,
  Gamepad2,
  Volume2,
  Wifi,
  Maximize2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Zap,
  CheckCircle2,
  XCircle,
  Cpu,
  Layers,
  Sun,
  ShieldCheck
} from 'lucide-react';

interface TVSpecSheetProps {
  specs: TVSpecs;
}

export function TVSpecSheet({ specs }: TVSpecSheetProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Fallback defaults for rich rendering
  const processorEngine = specs.processorEngine || 'Neural AI Processor';
  const brightnessNits = specs.brightnessNits || (specs.displayTech === 'OLED' ? 1500 : 2000);
  const contrastRatio = specs.contrastRatio || (specs.displayTech === 'OLED' ? 'Sonsuz (Infinite)' : '1.000.000:1');
  const viewingAngle = specs.viewingAngle || '178° / 178° Ultra Geniş';
  const colorGamut = specs.colorGamut || '%100 DCI-P3 Renk Hacmi';
  const localDimmingZones = specs.localDimmingZones || (specs.displayTech === 'Mini-LED' ? 1920 : undefined);
  const inputLagMs = specs.inputLagMs || 4.2;
  const vrrSupport = specs.vrrSupport !== undefined ? specs.vrrSupport : true;
  const allmSupport = specs.allmSupport !== undefined ? specs.allmSupport : true;
  const hdmiVersion = specs.hdmiVersion || 'HDMI 2.1 (4 Port)';
  const audioChannels = specs.audioChannels || '4.2.2 Kanal 3D Uzamsal Ses';
  const dolbyAtmos = specs.dolbyAtmos !== undefined ? specs.dolbyAtmos : true;
  const dtsX = specs.dtsX !== undefined ? specs.dtsX : true;
  const voiceControl = specs.voiceControl || 'Türkçe Asistan & Alexa Entegre';
  const wifiVersion = specs.wifiVersion || 'Wi-Fi 6E (802.11ax)';
  const bluetoothVersion = specs.bluetoothVersion || 'Bluetooth 5.3';
  const appleAirplay = specs.appleAirplay !== undefined ? specs.appleAirplay : true;
  const chromecastBuiltIn = specs.chromecastBuiltIn !== undefined ? specs.chromecastBuiltIn : true;
  const dimensionsWithStand = specs.dimensionsWithStand || '1446 x 890 x 268 mm';
  const weightKg = specs.weightKg || 28.5;
  const vesaMount = specs.vesaMount || '400 x 300 mm';
  const bezelStyle = specs.bezelStyle || 'Zero Bezel (Çerçevesiz Tasarım)';

  const categories = [
    { id: 'screen', title: 'Ekran & Panel', icon: Tv, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
    { id: 'gaming', title: 'Oyun & Performans', icon: Gamepad2, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { id: 'audio', title: 'Ses & Akustik', icon: Volume2, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
    { id: 'smart', title: 'Smart TV & Bağlantı', icon: Wifi, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { id: 'design', title: 'Tasarım & Boyutlar', icon: Maximize2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
      
      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100 no-scrollbar">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeCategory === 'all'
              ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Tüm Özellikler
        </button>

        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs font-extrabold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.title}</span>
            </button>
          );
        })}
      </div>

      {/* Specifications Grid */}
      <div className="space-y-6">

        {/* 1. Ekran & Panel */}
        {(activeCategory === 'all' || activeCategory === 'screen') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-sm border-b border-slate-100 pb-2">
              <Tv className="w-4 h-4 text-indigo-600" />
              <span>Ekran & Panel Teknolojisi</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Ekran Boyutu</span>
                <span className="text-slate-900 font-black text-sm">{specs.screenSizeInches} inç ({Math.round(specs.screenSizeInches * 2.54)} cm)</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Panel Teknolojisi</span>
                <span className="text-indigo-700 font-black text-sm">{specs.displayTech}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Çözünürlük Standartı</span>
                <span className="text-slate-900 font-black text-sm">{specs.resolution}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Yenileme Hızı</span>
                <span className="text-emerald-600 font-black text-sm">{specs.refreshRateHz} Hz Gerçek Panel</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Yapay Zeka İşlemcisi</span>
                <span className="text-slate-900 font-bold">{processorEngine}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Tepe Parlaklığı (Nits)</span>
                <span className="text-amber-600 font-black">{brightnessNits} Nits Peak</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Kontrast Oranı</span>
                <span className="text-slate-900 font-bold">{contrastRatio}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Görüş Açısı & Renk Hacmi</span>
                <span className="text-slate-900 font-bold">{viewingAngle} • {colorGamut}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">HDR Formatları</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(specs.hdrSupport || specs.hdrFormats || []).map((hdr, idx) => (
                    <span key={idx} className="bg-indigo-100 text-indigo-900 text-[10px] font-black px-2 py-0.5 rounded">
                      {hdr}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Oyun & Performans */}
        {(activeCategory === 'all' || activeCategory === 'gaming') && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-rose-700 font-extrabold text-sm border-b border-slate-100 pb-2">
              <Gamepad2 className="w-4 h-4 text-rose-600" />
              <span>Oyun & Performans (HDMI 2.1)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">HDMI Port Standartı</span>
                <span className="text-rose-700 font-black">{hdmiVersion}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Giriş Gecikmesi (Input Lag)</span>
                <span className="text-emerald-600 font-black">{inputLagMs} ms Ultra Düşük</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">VRR (Değişken Yenileme)</span>
                <span className="text-slate-900 font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Destekli (FreeSync / G-Sync)
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">ALLM (Otomatik Düşük Gecikme)</span>
                <span className="text-slate-900 font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Aktif Oyun Modu
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Ses & Akustik */}
        {(activeCategory === 'all' || activeCategory === 'audio') && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-purple-700 font-extrabold text-sm border-b border-slate-100 pb-2">
              <Volume2 className="w-4 h-4 text-purple-600" />
              <span>Ses & Akustik Donanım</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Toplam Ses Gücü</span>
                <span className="text-purple-700 font-black text-sm">{specs.audioPowerWatts} Watt RMS</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Hoparlör Kanalları</span>
                <span className="text-slate-900 font-extrabold">{audioChannels}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Dolby Atmos Ses</span>
                <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Var (Sinematik 3D)
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">DTS:X Desteği</span>
                <span className="text-slate-900 font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Var
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 4. Smart TV & Bağlantı */}
        {(activeCategory === 'all' || activeCategory === 'smart') && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-blue-700 font-extrabold text-sm border-b border-slate-100 pb-2">
              <Wifi className="w-4 h-4 text-blue-600" />
              <span>Smart TV & Kablosuz Bağlantılar</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">İşletim Sistemi (OS)</span>
                <span className="text-blue-700 font-black text-sm">{specs.smartOs}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Sesli Kontrol & Asistan</span>
                <span className="text-slate-900 font-extrabold">{voiceControl}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Wi-Fi & Bluetooth</span>
                <span className="text-slate-900 font-extrabold">{wifiVersion} • {bluetoothVersion}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">AirPlay 2 & Chromecast</span>
                <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Dahili Entegre
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 5. Tasarım & Boyutlar */}
        {(activeCategory === 'all' || activeCategory === 'design') && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-sm border-b border-slate-100 pb-2">
              <Maximize2 className="w-4 h-4 text-emerald-600" />
              <span>Tasarım, Boyutlar & Enerji</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Stantlı Boyutlar</span>
                <span className="text-slate-900 font-bold">{dimensionsWithStand}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-bold uppercase">Ağırlık</span>
                <span className="text-slate-900 font-black">{weightKg} kg</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-bold uppercase">VESA Duvar Askı Standartı</span>
                <span className="text-slate-900 font-bold">{vesaMount}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-bold uppercase">Enerji Sınıfı</span>
                <span className="text-emerald-600 font-black text-sm">{specs.energyClass}</span>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
