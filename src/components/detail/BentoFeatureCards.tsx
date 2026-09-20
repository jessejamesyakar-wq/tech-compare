import React from 'react';
import { Smartphone } from '@/lib/types';
import { Sparkles,ShieldCheck,Camera,BatteryCharging,Cpu,Monitor } from 'lucide-react';
import { formatSpecValue as format } from '@/lib/specFormatting';
import { phoneSpecText, hasLegacyPhoneSpecs, LEGACY_PHONE_SPEC_NOTICE } from '@/lib/smartphoneSpecFields';

export function BentoFeatureCards({phone}:{phone:Smartphone}) {
  const s=phone.specs;
  const text=(path:string)=>phoneSpecText(s,path);
  const mainCamera=text('camera.mainMp'), cameraSummary=text('camera.summary');
  const cards=[
    {title:'Ekran',icon:Monitor,span:'md:col-span-6',items:[['Panel',text('screen.type')],['Boyut',text('screen.size')],['Yenileme Hızı',text('screen.refreshRate')],['Parlaklık',text('screen.brightnessNits')]]},
    {title:'Gövde',icon:ShieldCheck,span:'md:col-span-6',items:[['Çerçeve',format(s?.build?.frameMaterial)],['Ağırlık',text('build.weightGrams')],['Kalınlık',format(s?.build?.thicknessMm,'mm')],['Dayanıklılık',text('build.waterResistance')]]},
    {title:'İşlemci',icon:Cpu,span:'md:col-span-4',items:[['Yonga',text('processor.chip')],['Kayıtlı AnTuTu Puanı',text('processor.antutuScore')]]},
    {title:'Şarj',icon:BatteryCharging,span:'md:col-span-8',items:[['Kablolu Şarj Gücü',text('battery.chargingWatts')],['Kablosuz Şarj Desteği',text('battery.wirelessCharging')]]},
    {title:'Kamera',icon:Camera,span:'md:col-span-7',items:[mainCamera==='Bilinmiyor' && cameraSummary!=='Bilinmiyor' ? ['Arka Kamera Kaydı',cameraSummary] : ['Ana Kamera',mainCamera],['Video',text('camera.videoRes')],['Kayıtlı DxOMark Puanı',format(s?.camera?.dxomarkScore)]]},
    {title:'Batarya',icon:BatteryCharging,span:'md:col-span-5',items:[['Kapasite',text('battery.capacitymAh')]]},
  ];
  return <section className="space-y-6">
    <h2 className="text-slate-900 text-xl font-black flex items-center gap-2"><Sparkles className="w-5 h-5 shrink-0 text-emerald-700"/>{phone.name} Özellik Özeti</h2>
    {hasLegacyPhoneSpecs(s) && <p className="text-xs text-amber-900 rounded-xl bg-amber-50 border border-amber-200 p-3">{LEGACY_PHONE_SPEC_NOTICE}</p>}
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {cards.map(({title,icon:Icon,span,items})=><div key={title} className={`${span} min-w-0 ${title==='Batarya'?'bg-gradient-to-br from-emerald-600 to-teal-700 text-white':'bg-white text-slate-900'} border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4`}>
        <h3 className="text-xl font-black flex items-center gap-2"><Icon className="w-5 h-5"/>{title}</h3>
        <dl className="space-y-3">{items.map(([label,value])=><div key={label} className="flex flex-wrap justify-between gap-x-3 gap-y-1 border-b border-current/10 pb-2"><dt className="text-xs opacity-80">{label}</dt><dd className="text-sm font-bold break-words">{value}</dd></div>)}</dl>
      </div>)}
    </div>
  </section>;
}
