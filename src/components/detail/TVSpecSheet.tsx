'use client';

import React, { useState } from 'react';
import { TVSpecs } from '@/lib/types';
import { Tv,Gamepad2,Volume2,Wifi,Maximize2 } from 'lucide-react';
import { formatSpecValue } from '@/lib/specFormatting';

export function TVSpecSheet({ specs }: {specs:TVSpecs}) {
  const [activeCategory,setActiveCategory]=useState('all');
  const s=specs || {} as TVSpecs;
  const categories = [
    { id:'screen',title:'Ekran & Panel',icon:Tv,color:'text-indigo-700',items:[
      ['Ekran Boyutu',formatSpecValue(s.screenSizeInches,'inç')],['Panel Teknolojisi',formatSpecValue(s.displayTech)],
      ['Çözünürlük',formatSpecValue(s.resolution)],['Yenileme Hızı',formatSpecValue(s.refreshRateHz,'Hz')],
      ['Görüntü İşlemcisi',formatSpecValue(s.processorEngine)],['Parlaklık',formatSpecValue(s.brightnessNits,'nits')],
      ['Kontrast Oranı',formatSpecValue(s.contrastRatio)],['Görüş Açısı',formatSpecValue(s.viewingAngle)],
      ['Renk Gamı',formatSpecValue(s.colorGamut)],['HDR Formatları',formatSpecValue(s.hdrSupport ?? s.hdrFormats)],
      ['Yerel Karartma Bölgeleri',formatSpecValue(s.localDimmingZones)],
    ]},
    { id:'gaming',title:'Oyun & Performans',icon:Gamepad2,color:'text-rose-700',items:[
      ['HDMI Standardı',formatSpecValue(s.hdmiVersion)],['Giriş Gecikmesi',formatSpecValue(s.inputLagMs,'ms')],
      ['VRR',formatSpecValue(s.vrrSupport)],['ALLM',formatSpecValue(s.allmSupport)],
    ]},
    { id:'audio',title:'Ses & Akustik',icon:Volume2,color:'text-purple-700',items:[
      ['Ses Gücü',formatSpecValue(s.audioPowerWatts,'W')],['Ses Kanalları',formatSpecValue(s.audioChannels)],
      ['Dolby Atmos',formatSpecValue(s.dolbyAtmos)],['DTS:X',formatSpecValue(s.dtsX)],
    ]},
    { id:'smart',title:'Smart TV & Bağlantı',icon:Wifi,color:'text-blue-700',items:[
      ['İşletim Sistemi',formatSpecValue(s.smartOs)],['Sesli Kontrol',formatSpecValue(s.voiceControl)],
      ['Wi-Fi',formatSpecValue(s.wifiVersion)],['Bluetooth',formatSpecValue(s.bluetoothVersion)],
      ['Apple AirPlay',formatSpecValue(s.appleAirplay)],['Chromecast',formatSpecValue(s.chromecastBuiltIn)],
    ]},
    { id:'design',title:'Tasarım & Boyutlar',icon:Maximize2,color:'text-emerald-700',items:[
      ['Stantlı Boyutlar',formatSpecValue(s.dimensionsWithStand)],['Ağırlık',formatSpecValue(s.weightKg,'kg')],
      ['VESA Montaj Ölçüsü',formatSpecValue(s.vesaMount)],['Çerçeve',formatSpecValue(s.bezelStyle)],['Enerji Sınıfı',formatSpecValue(s.energyClass)],
    ]},
  ];
  return <div className="min-w-0 bg-white border border-slate-200 rounded-3xl p-4 sm:p-8 space-y-6 shadow-xs">
    <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
      {[{id:'all',title:'Tüm Özellikler'},...categories].map(cat=><button key={cat.id} aria-pressed={activeCategory===cat.id} onClick={()=>setActiveCategory(cat.id)} className={`min-h-11 px-4 py-2 rounded-xl text-xs font-bold ${activeCategory===cat.id?'bg-emerald-700 text-white':'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{cat.title}</button>)}
    </div>
    {categories.filter(cat=>activeCategory==='all'||activeCategory===cat.id).map(({id,title,icon:Icon,color,items})=><section key={id} className="space-y-3">
      <h3 className={`flex items-center gap-2 text-sm font-black ${color}`}><Icon className="w-4 h-4"/>{title}</h3>
      <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map(([label,value])=><div key={label} className="min-w-0 bg-slate-50 border border-slate-200 rounded-2xl p-3"><dt className="text-xs text-slate-500">{label}</dt><dd className="text-sm font-bold text-slate-900 break-words mt-1">{value}</dd></div>)}
      </dl>
    </section>)}
  </div>;
}
