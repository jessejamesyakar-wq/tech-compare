'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone } from '@/lib/types';
import { Sparkles, ShieldCheck, Camera, BatteryCharging, Radio } from 'lucide-react';

interface BentoFeatureCardsProps {
  phone: Smartphone;
}

export function BentoFeatureCards({ phone }: BentoFeatureCardsProps) {
  const chipName = phone.specs?.processor?.chip || 'A16 Bionic / Snapdragon';
  const antutu = (phone.specs?.processor?.antutuScore || 1400000).toLocaleString();
  const battery = phone.specs?.battery?.capacitymAh || 4500;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-900 text-xl font-black tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span>{phone.name} Öne Çıkan Özellikler</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Teknoloji ve tasarımda öne çıkan detaylar
          </p>
        </div>
      </div>

      {/* Bento Grid Layout with Motion Staggered Animations */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Card 1: Dynamic Island / Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.05 }}
          whileHover={{ y: -4 }}
          className="md:col-span-6 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-8 flex flex-col justify-between space-y-6 shadow-xs relative overflow-hidden group transition-all"
        >
          <div className="space-y-2 max-w-sm">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              Görsel şölen sunan ekran teknolojisi: <span className="text-emerald-600">{phone.specs?.screen?.type || 'OLED'}</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              {phone.specs?.screen?.size || '6.7 inç'} dev ekran, {phone.specs?.screen?.refreshRate || 120}Hz yenileme hızı ve {phone.specs?.screen?.brightnessNits || 2600} nits zirve parlaklık.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">
                {phone.brand.charAt(0)}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">ProMotion & Canlı Ekran</span>
                <span className="text-[10px] text-slate-400 font-medium">Ultra Yüksek Çözünürlük</span>
              </div>
            </div>
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-200">
              Yeni Nesil
            </span>
          </div>
        </motion.div>

        {/* Card 2: Design & Build */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.1 }}
          whileHover={{ y: -4 }}
          className="md:col-span-6 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-8 flex flex-col justify-between space-y-6 shadow-xs relative overflow-hidden group transition-all"
        >
          <div className="space-y-2 max-w-sm">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              Dayanıklı gövde ve <span className="text-emerald-600">{phone.specs?.build?.frameMaterial || 'Alüminyum'}</span> çerçeve.
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Ergonomik {phone.specs?.build?.weightGrams || 190} gram hafiflik ve {phone.specs?.build?.thicknessMm || 7.8}mm incelik.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Korumalı Ön Cam & {phone.specs?.build?.waterResistance || 'IP68'} Suya/Toza Dayanıklılık</span>
          </div>
        </motion.div>

        {/* Card 3: Chip / Processor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.15 }}
          whileHover={{ y: -4 }}
          className="md:col-span-4 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xs"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-md">
              ⚡ CHIP
            </div>
            <h3 className="text-lg font-black text-slate-900 leading-snug">
              Yüksek Performans: {chipName}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              İleri düzey yapay zeka performansı, akıcı oyun grafikleri ve enerji verimliliği.
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-900 flex justify-between">
            <span>AnTuTu Performansı:</span>
            <span className="text-emerald-600 font-black">{antutu}</span>
          </div>
        </motion.div>

        {/* Card 4: Connectivity & Fast Charging */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ y: -4 }}
          className="md:col-span-8 bg-gradient-to-r from-slate-50 via-slate-100 to-emerald-50/40 border border-slate-200/90 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs"
        >
          <div className="space-y-3 max-w-md">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-200">
              Yüksek Hızlı Şarj
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {phone.specs?.battery?.chargingWatts || 30}W Hızlı Şarj Teknolojisi.
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Kısa sürede bataryayı doldurma ve kablosuz şarj desteği ile her an kesintisiz iletişim.
            </p>
          </div>

          <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center p-3 text-center shrink-0 shadow-xs">
            <span className="text-2xl font-black text-slate-900">{phone.specs?.battery?.chargingWatts || 30}W</span>
            <span className="text-[10px] text-slate-400 font-bold mt-1">Hızlı Şarj</span>
          </div>
        </motion.div>

        {/* Card 5: Camera System */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.25 }}
          whileHover={{ y: -4 }}
          className="md:col-span-7 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-8 space-y-4 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {phone.specs?.camera?.mainMp || '50 MP'} Ana Kamera & Pro Çekim Modu
              </h3>
              <p className="text-xs text-slate-500 font-medium">Netlik dolu portreler ve geliştirilmiş gece modu</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {phone.specs?.camera?.videoRes || '4K @ 60fps'} video çekim gücü, DxOMark {phone.specs?.camera?.dxomarkScore || 140} puanı ile üst sınıf fotoğraf performansı.
          </p>
        </motion.div>

        {/* Card 6: Battery & 5G */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.3 }}
          whileHover={{ y: -4 }}
          className="md:col-span-5 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-8 flex flex-col justify-between space-y-4 shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <BatteryCharging className="w-5 h-5 text-white" />
            </div>
            <span className="bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full backdrop-blur-xs flex items-center gap-1">
              <Radio className="w-3.5 h-3.5" /> 5G Desteği
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black leading-tight text-white">
              Tüm gün süren harika pil ömrü.
            </h3>
            <p className="text-xs text-emerald-100 font-medium">
              {battery} mAh batarya kapasitesi ile kesintisiz kullanım.
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
