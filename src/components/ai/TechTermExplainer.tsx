'use client';

import React, { useState } from 'react';
import { Sparkles, HelpCircle, X, BookOpen } from 'lucide-react';

export const TECH_DICTIONARY: Record<string, { title: string; simpleDesc: string; whyMatters: string }> = {
  'Fast IPS': {
    title: 'Fast IPS / Rapid IPS Panel',
    simpleDesc: 'Geleneksel IPS panellerin zengin ve canlı renklerini korurken, tepki süresini 1ms veya altına indirerek oyunlarda bulanıklığı yok eden yeni nesil ekran teknolojisidir.',
    whyMatters: 'Hem göz alıcı grafikli filmleri hem de hızlı e-spor oyunlarını tek ekranda kusursuz oynamanızı sağlar.'
  },
  'OLED': {
    title: 'OLED / QD-OLED',
    simpleDesc: 'Her pikselin kendi ışığını ürettiği ve siyah renklerde pikselin tamamen söndüğü en gelişmiş panel türüdür.',
    whyMatters: 'Sonsuz kontrast, sıfır ışık sızması ve 0.03ms anlık tepki süresiyle dünyanın en iyi görüntü deneyimini sunar.'
  },
  'NPU TOPS': {
    title: 'Yapay Zekâ NPU Gücü (TOPS)',
    simpleDesc: 'Bilgisayarınızın yapay zekâ görevlerini (arka plan silme, gürültü engelleme, yerel AI modelleri) işlemciyi yormadan saniyede trilyonlarca işlemle yapmasını sağlayan özel çiptir.',
    whyMatters: 'Bilgisayarınızın geleceğin yapay zekâ uygulamalarına tam hazır olmasını ve pilden tasarruf etmesini sağlar.'
  },
  'KVM Switch': {
    title: 'Dahili KVM Anahtarı',
    simpleDesc: 'Monitöre takılı tek bir fare ve klavyeyi, aynı anda bağlı olan hem iş laptopunuzda hem de ev kasanızda tek tuşla kullanmanızı sağlayan donanımdır.',
    whyMatters: 'Masadaki kablo karmaşasını bitirir, iki bilgisayar arasında anında geçiş yapmanızı sağlar.'
  },
  'USB-C Power Delivery (PD)': {
    title: 'USB-C Power Delivery (90W / 65W)',
    simpleDesc: 'Tek bir Type-C kablosu ile laptopunuzun görüntüsünü monitöre aktarırken aynı anda laptopunuzu da şarj eden güç iletim teknolojisidir.',
    whyMatters: 'Laptop adaptörünü çantanızdan çıkarmanıza gerek kalmaz, tek kabloyla tüm masa istasyona dönüşür.'
  },
  'VESA DisplayHDR': {
    title: 'DisplayHDR Standartları (400/600/1000)',
    simpleDesc: 'Ekranın en parlak beyazlar ile en koyu gölgeler arasındaki ışık derinliğini gösteren resmi sertifikadır.',
    whyMatters: 'Güneş ışığı, patlama efektleri ve karanlık sahneler çok daha gerçekçi ve göz alıcı görünür.'
  },
  'ANC': {
    title: 'Aktif Gürültü Engelleme (ANC)',
    simpleDesc: 'Kulaklığın dışarıdaki ses dalgalarını mikrofonla dinleyip ters ses dalgası üreterek motor, uçak ve ofis uğultularını sıfırlamasıdır.',
    whyMatters: 'Dış dünyayı tamamen sessize alıp müziğinize veya işinize odaklanmanızı sağlar.'
  },
  'AnTuTu / DXOMARK': {
    title: 'AnTuTu ve DXOMARK Puanları',
    simpleDesc: 'Telefonların işlemci, grafik ve kamera donanımını dünya standardı ağır testlere sokarak verilen tarafsız performans karnesidir.',
    whyMatters: 'Telefonun günlük hayatta ve ağır oyunlarda ne kadar akıcı çalışacağını tek bir sayıyla özetler.'
  }
};

export function TechTermExplainer() {
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);

  const termKeys = Object.keys(TECH_DICTIONARY);

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-7 space-y-4 border border-slate-800 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Sade Dille Açıkla (ELI5)</span>
          </div>
          <h3 className="text-lg font-black text-white tracking-tight">
            Karmaşık Teknik Terimler Ne Anlama Geliyor?
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Özellik tablolarında gördüğünüz karmaşık kavramları günlük dille tek tıkla öğrenin.
          </p>
        </div>
      </div>

      {/* Term Chips */}
      <div className="flex flex-wrap gap-2 pt-1">
        {termKeys.map((term) => (
          <button
            key={term}
            onClick={() => setSelectedTerm(term)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedTerm === term
                ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            💡 {term}
          </button>
        ))}
      </div>

      {/* Explanation Box */}
      {selectedTerm && TECH_DICTIONARY[selectedTerm] && (
        <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-4 space-y-2 animate-in fade-in zoom-in-95 duration-150 relative">
          <button
            onClick={() => setSelectedTerm(null)}
            className="absolute top-3 right-3 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <h4 className="text-sm font-black text-emerald-400 flex items-center gap-2">
            <span>{TECH_DICTIONARY[selectedTerm].title}</span>
          </h4>

          <p className="text-xs text-slate-300 leading-relaxed">
            {TECH_DICTIONARY[selectedTerm].simpleDesc}
          </p>

          <div className="bg-emerald-950/40 border border-emerald-800/60 p-2.5 rounded-xl mt-2">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block mb-0.5">
              🎯 Sizin İçin Ne İfade Ediyor?
            </span>
            <p className="text-[11px] font-bold text-emerald-200">
              {TECH_DICTIONARY[selectedTerm].whyMatters}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
