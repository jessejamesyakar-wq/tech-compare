'use client';

import React from 'react';
import { Product, SmartphoneSpecs } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';
import { PHONE_SPEC_FIELDS, hasLegacyPhoneSpecs, phoneSpecText, LEGACY_PHONE_SPEC_NOTICE } from '@/lib/smartphoneSpecFields';
import { hasUnresolvedSpecField } from '@/lib/specVerification';
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
  productId?: string;
  specVerification?: Product['specVerification'];
  extraSpecs?: Array<{ featureId: number; name: string; group: string; value: string; unit?: string }>;
}

export function SpecSheet({ specs, productId, specVerification, extraSpecs }: SpecSheetProps) {
  const { t } = useI18n();
  const mockProduct = { id: productId || '', specVerification } as Product;
  const isUnresolved = (paths: string | string[]) => hasUnresolvedSpecField(mockProduct, paths);
  const gateVal = (paths: string | string[], formattedValue: string) =>
    isUnresolved(paths) ? 'Doğrulama bekliyor' : formattedValue;

  if (!specs) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-500 text-xs font-bold">
        Teknik özellik bilgisi mevcut değil.
      </div>
    );
  }

  // Older flat records must remain readable in the detail view too. Keep
  // ranges as text and do not infer unsupported metrics from descriptions.
  if (hasLegacyPhoneSpecs(specs)) {
    const recorded = PHONE_SPEC_FIELDS.map(field => ({
      ...field,
      value: isUnresolved(field.paths) ? 'Doğrulama bekliyor' : phoneSpecText(specs, field),
    })).filter(field => field.value !== 'Bilinmiyor');
    const categories = [...new Set(recorded.map(field => field.category))];
    return (
      <div className="space-y-6">
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">{LEGACY_PHONE_SPEC_NOTICE}</p>
        {categories.map(category => (
          <section key={category} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h3 className="text-slate-900 font-bold text-base mb-4">{category}</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-xs">
              {recorded.filter(field => field.category === category).map(field => (
                <div key={field.paths} className="grid grid-cols-2 min-w-0 gap-3 border-b border-slate-100 py-2">
                  <dt className="text-slate-500 font-medium break-words">{field.label}</dt>
                  <dd className="text-slate-900 font-bold text-right break-words">{field.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    );
  }

  const sections = [
    {
      title: t.display,
      icon: ScreenIcon,
      iconColor: 'text-emerald-600',
      items: [
        { label: t.screenSizeLabel, value: gateVal('screen.size', specs.screen?.size || 'Belirtilmemiş') },
        { label: t.panelTypeLabel, value: gateVal('screen.type', specs.screen?.type || 'Belirtilmemiş') },
        { label: t.resolutionLabel, value: gateVal('screen.resolution', specs.screen?.resolution || 'Belirtilmemiş') },
        { label: t.refreshRateLabel, value: gateVal('screen.refreshRate', specs.screen?.refreshRate ? `${specs.screen.refreshRate} Hz` : 'Belirtilmemiş') },
        { label: 'Piksel Yoğunluğu', value: gateVal('screen.ppi', specs.screen?.ppi ? `${specs.screen.ppi} ppi` : 'Belirtilmemiş') },
        { label: 'Parlaklık (katalog)', value: gateVal('screen.brightnessNits', specs.screen?.brightnessNits ? `${specs.screen.brightnessNits} nits` : 'Belirtilmemiş') }
      ]
    },
    {
      title: t.processor,
      icon: Cpu,
      iconColor: 'text-purple-600',
      items: [
        { label: t.chipsetLabel, value: gateVal('processor.chip', specs.processor?.chip || 'Belirtilmemiş') },
        { label: t.cpuCoresLabel, value: gateVal('processor.cores', specs.processor?.cores || 'Belirtilmemiş') },
        { label: t.processNodeLabel, value: gateVal('processor.process', specs.processor?.process || 'Belirtilmemiş') },
        { label: t.antutuScore, value: gateVal('processor.antutuScore', specs.processor?.antutuScore ? `${specs.processor.antutuScore.toLocaleString('tr-TR')} Puan` : 'Doğrulanmış veri yok') }
      ]
    },
    {
      title: t.memoryStorage,
      icon: HardDrive,
      iconColor: 'text-blue-600',
      items: [
        { label: t.ramCapacityLabel, value: gateVal('memory.ramGb', specs.memory?.ramGb ? `${specs.memory.ramGb} GB ${!isUnresolved('memory.ramType') && specs.memory?.ramType ? `(${specs.memory.ramType})` : ''}`.trim() : 'Belirtilmemiş') },
        { label: t.storageCapacityLabel, value: gateVal('memory.storageGb', specs.memory?.storageGb ? `${specs.memory.storageGb} GB` : 'Belirtilmemiş') },
        { label: 'Depolama Seçenekleri', value: gateVal('memory.storageGb', specs.memory?.storageOptions && specs.memory.storageOptions.length > 0 ? specs.memory.storageOptions.map((s) => `${s}GB`).join(', ') : 'Belirtilmemiş') },
        { label: 'Hafıza Kartı Desteği', value: gateVal('memory.expandableStorage', specs.memory?.expandableStorage === true ? t.yes : (specs.memory?.expandableStorage === false ? t.no : 'Belirtilmemiş')) }
      ]
    },
    {
      title: t.cameraSystem,
      icon: Camera,
      iconColor: 'text-rose-600',
      items: [
        { label: t.mainCameraLabel, value: gateVal('camera.mainMp', specs.camera?.mainMp || 'Belirtilmemiş') },
        { label: t.ultrawideLabel, value: gateVal('camera.ultrawideMp', specs.camera?.ultrawideMp || 'Belirtilmemiş') },
        { label: t.telephotoLabel, value: gateVal('camera.telephotoMp', specs.camera?.telephotoMp || 'Belirtilmemiş') },
        { label: t.selfieCameraLabel, value: gateVal('camera.selfieMp', specs.camera?.selfieMp || 'Belirtilmemiş') },
        { label: 'Video Kayıt', value: gateVal('camera.videoRes', specs.camera?.videoRes || 'Belirtilmemiş') },
        { label: t.dxomarkScore, value: gateVal('camera.dxomarkScore', specs.camera?.dxomarkScore ? `${specs.camera.dxomarkScore} Puan` : 'Doğrulanmış veri yok') }
      ]
    },
    {
      title: t.batteryPower,
      icon: BatteryCharging,
      iconColor: 'text-amber-600',
      items: [
        { label: t.batteryCapacityLabel, value: gateVal('battery.capacitymAh', specs.battery?.capacitymAh ? `${specs.battery.capacitymAh} mAh` : 'Belirtilmemiş') },
        { label: t.chargingSpeedLabel, value: gateVal('battery.chargingWatts', specs.battery?.chargingWatts ? `${specs.battery.chargingWatts} W` : 'Doğrulanmış veri yok') },
        { label: t.wirelessChargingLabel, value: gateVal('battery.wirelessCharging', specs.battery?.wirelessCharging === true ? (specs.battery.wirelessWatts ? `${specs.battery.wirelessWatts}W Kablosuz Şarj` : t.yes) : (specs.battery?.wirelessCharging === false ? t.no : 'Doğrulanmış veri yok')) },
        { label: 'Ters Şarj', value: gateVal('battery.reverseWireless', specs.battery?.reverseWireless === true ? t.yes : (specs.battery?.reverseWireless === false ? t.no : 'Doğrulanmış veri yok')) }
      ]
    },
    {
      title: t.connectivityBuild,
      icon: Wifi,
      iconColor: 'text-teal-600',
      items: [
        { label: '5G Desteği', value: gateVal('connectivity.has5G', specs.connectivity?.has5G === true ? t.yes : (specs.connectivity?.has5G === false ? t.no : 'Belirtilmemiş')) },
        { label: 'Wi-Fi Standardı', value: gateVal('connectivity.wifiStandard', specs.connectivity?.wifiStandard || 'Belirtilmemiş') },
        { label: 'Bluetooth', value: gateVal('connectivity.bluetooth', specs.connectivity?.bluetooth || 'Belirtilmemiş') },
        { label: 'NFC', value: gateVal('connectivity.hasNFC', specs.connectivity?.hasNFC === true ? t.yes : (specs.connectivity?.hasNFC === false ? t.no : 'Belirtilmemiş')) },
        { label: 'eSIM', value: gateVal('connectivity.hasesim', specs.connectivity?.hasesim === true ? t.yes : (specs.connectivity?.hasesim === false ? t.no : 'Belirtilmemiş')) },
        { label: t.weightLabel, value: gateVal('build.weightGrams', specs.build?.weightGrams ? `${specs.build.weightGrams} g` : 'Belirtilmemiş') },
        { label: t.waterResistLabel, value: gateVal('build.waterResistance', specs.build?.waterResistance || 'Belirtilmemiş') },
        { label: t.frameMaterialLabel, value: gateVal('build.frameMaterial', specs.build?.frameMaterial || 'Belirtilmemiş') }
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
      {extraSpecs && extraSpecs.length > 0 && (() => {
        const groups: Record<string, typeof extraSpecs> = {};
        for (const spec of extraSpecs) {
          const g = spec.group || 'Diğer Özellikler';
          if (!groups[g]) groups[g] = [];
          groups[g].push(spec);
        }
        return (
          <div className="space-y-6 pt-4 border-t border-slate-200">
            <h3 className="text-slate-900 font-bold text-base flex items-center gap-2">
              <span>Doğrulanmış Ek Katalog Özellikleri (Icecat)</span>
            </h3>
            {Object.entries(groups).map(([grpName, items]) => (
              <div key={grpName} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <h4 className="text-slate-800 font-bold text-sm mb-4 pb-2 border-b border-slate-100">{grpName}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-xs">
                  {items.map((item, iIdx) => (
                    <div key={iIdx} className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">{item.name}</span>
                      <span className="text-slate-900 font-bold text-right">{item.value} {item.unit || ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
}
