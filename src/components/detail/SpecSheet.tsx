'use client';

import React from 'react';
import { SmartphoneSpecs } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';
import {
  Smartphone as ScreenIcon,
  Cpu,
  HardDrive,
  BatteryCharging,
  Camera,
  Wifi
} from 'lucide-react';

interface SpecSheetProps {
  specs?: SmartphoneSpecs;
}

export function SpecSheet({ specs }: SpecSheetProps) {
  const { t } = useI18n();

  if (!specs) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-500 text-xs font-bold">
        Teknik özellik bilgisi mevcut değil.
      </div>
    );
  }

  const sections = [
    {
      title: t.display,
      icon: ScreenIcon,
      iconColor: 'text-emerald-600',
      items: [
        { label: t.screenSizeLabel, value: specs.screen?.size || '6.7 inç' },
        { label: t.panelTypeLabel, value: specs.screen?.type || 'OLED' },
        { label: t.resolutionLabel, value: specs.screen?.resolution || '1.5K' },
        { label: t.refreshRateLabel, value: `${specs.screen?.refreshRate || 120} Hz` },
        { label: 'Piksel Yoğunluğu', value: `${specs.screen?.ppi || 460} ppi` },
        { label: 'Maks Parlaklık', value: `${specs.screen?.brightnessNits || 2000} nits` }
      ]
    },
    {
      title: t.processor,
      icon: Cpu,
      iconColor: 'text-purple-600',
      items: [
        { label: t.chipsetLabel, value: specs.processor?.chip || 'A18 / Snapdragon' },
        { label: t.cpuCoresLabel, value: specs.processor?.cores || '8 Çekirdek' },
        { label: t.processNodeLabel, value: specs.processor?.process || '3nm / 4nm' },
        { label: t.antutuScore, value: `${(specs.processor?.antutuScore || 1500000).toLocaleString()} Puan` }
      ]
    },
    {
      title: t.memoryStorage,
      icon: HardDrive,
      iconColor: 'text-blue-600',
      items: [
        { label: t.ramCapacityLabel, value: `${specs.memory?.ramGb || 8} GB (${specs.memory?.ramType || 'LPDDR5X'})` },
        { label: t.storageCapacityLabel, value: `${specs.memory?.storageGb || 128} GB` },
        { label: 'Depolama Seçenekleri', value: (specs.memory?.storageOptions || [128, 256]).map((s) => `${s}GB`).join(', ') },
        { label: 'Hafıza Kartı Desteği', value: specs.memory?.expandableStorage ? t.yes : t.no }
      ]
    },
    {
      title: t.cameraSystem,
      icon: Camera,
      iconColor: 'text-rose-600',
      items: [
        { label: t.mainCameraLabel, value: specs.camera?.mainMp || '48 MP' },
        { label: t.ultrawideLabel, value: specs.camera?.ultrawideMp || '12 MP' },
        { label: t.telephotoLabel, value: specs.camera?.telephotoMp || '12 MP' },
        { label: t.selfieCameraLabel, value: specs.camera?.selfieMp || '12 MP' },
        { label: 'Video Kayıt', value: specs.camera?.videoRes || '4K @ 60fps' },
        { label: t.dxomarkScore, value: `${specs.camera?.dxomarkScore || 140} Puan` }
      ]
    },
    {
      title: t.batteryPower,
      icon: BatteryCharging,
      iconColor: 'text-amber-600',
      items: [
        { label: t.batteryCapacityLabel, value: `${specs.battery?.capacitymAh || 4500} mAh` },
        { label: t.chargingSpeedLabel, value: `${specs.battery?.chargingWatts || 30} W` },
        { label: t.wirelessChargingLabel, value: specs.battery?.wirelessCharging ? t.yes : t.no },
        { label: 'Ters Şarj', value: specs.battery?.reverseWireless ? t.yes : t.no }
      ]
    },
    {
      title: t.connectivityBuild,
      icon: Wifi,
      iconColor: 'text-teal-600',
      items: [
        { label: '5G Desteği', value: specs.connectivity?.has5G ? t.yes : t.no },
        { label: 'Wi-Fi Standardı', value: specs.connectivity?.wifiStandard || 'Wi-Fi 6E' },
        { label: 'Bluetooth', value: specs.connectivity?.bluetooth || '5.3' },
        { label: 'NFC', value: specs.connectivity?.hasNFC ? t.yes : t.no },
        { label: 'eSIM', value: specs.connectivity?.hasesim ? t.yes : t.no },
        { label: t.weightLabel, value: `${specs.build?.weightGrams || 190} g` },
        { label: t.waterResistLabel, value: specs.build?.waterResistance || 'IP68' },
        { label: t.frameMaterialLabel, value: specs.build?.frameMaterial || 'Alüminyum' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {sections.map((section, idx) => {
        const IconComponent = section.icon;
        return (
          <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
              <IconComponent className={`w-5 h-5 ${section.iconColor}`} />
              <h3 className="text-slate-900 font-bold text-base">{section.title}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-xs">
              {section.items.map((item, iIdx) => (
                <div key={iIdx} className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">{item.label}</span>
                  <span className="text-slate-900 font-bold text-right">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
