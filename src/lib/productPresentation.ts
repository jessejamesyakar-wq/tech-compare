import type { Product } from './types';
import { formatSpecValue } from './specFormatting';

const CONSOLE_SPEC_LABELS: Record<string, [string, string?]> = {
  deviceType:['Cihaz Türü'], subCategory:['Konsol Türü'], storageGb:['Depolama','GB'], storage:['Depolama'],
  storageExpandable:['Depolama Genişletme'], ramGb:['RAM','GB'], ram:['RAM'], ramType:['Bellek Türü'],
  processor:['İşlemci'], gpu:['Grafik Birimi'], tflops:['Kayıtlı İşlem Gücü','TFLOPs'], fps:['Kayıtlı Kare Hızı'],
  resolution:['Çözünürlük / Ekran'], maxResolution:['Desteklenen Çözünürlük'], hdr:['HDR'],
  wifi:['Wi-Fi'], bluetooth:['Bluetooth'], hdmi:['HDMI'], ports:['Bağlantı Noktaları'], connectivity:['Bağlantılar'],
  weightKg:['Ağırlık','kg'], batteryCapacityWh:['Batarya Kapasitesi','Wh'], batteryWh:['Batarya Kapasitesi','Wh'],
  adapterWatts:['Güç Adaptörü','W'], os:['İşletim Sistemi'], operatingSystem:['İşletim Sistemi'],
  opticalDrive:['Disk Sürücüsü'], audioTech:['Ses Teknolojisi'], controllerIncluded:['Kutudaki Kontrolcü'],
  displaySizeInch:['Ekran Boyutu','inç'], displayResolution:['Ekran Çözünürlüğü'],
};

export function getConsoleSpecRows(specs: Record<string, unknown>) {
  return Object.entries(specs).filter(([,value])=>value!==undefined && value!==null && value!=='').map(([key,value])=>{
    const [label,unit]=CONSOLE_SPEC_LABELS[key] || [key.replace(/([A-Z])/g,' $1').replace(/[_-]/g,' ').trim()];
    const categoryNames:Record<string,string>={home_console:'Ev Konsolu',handheld_console:'Taşınabilir Konsol'};
    return {key,label,value:key==='subCategory' && typeof value==='string' ? categoryNames[value] || value : formatSpecValue(value,unit)};
  });
}

/** Only catalog fields can supply console specifications; a model name cannot. */
export function getConsoleSpecSummary(product: Product): string {
  const specs = (product.specs || {}) as Record<string, unknown>;
  const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';
  const capacity = specs.storageGb;
  const storage = typeof capacity === 'number' && Number.isFinite(capacity) && capacity > 0
    ? `${capacity} GB`
    : text(specs.storage) || text(specs.capacity);
  return [storage, text(specs.resolution) || text(specs.outputResolution), text(specs.deviceType)]
    .filter(Boolean).join(' • ') || product.highlights?.[0] || '';
}
