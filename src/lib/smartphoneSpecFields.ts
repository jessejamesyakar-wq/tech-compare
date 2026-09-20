import { formatSpecValue } from './specFormatting';

export interface PhoneSpecField {
  category: string;
  label: string;
  paths: string;
  legacy?: string;
  unit?: string;
  direction?: 'higher' | 'lower';
}

// Imported phone records have two older flat formats. Read their values without
// rewriting the catalog or guessing one number from a range/variant list.
export const PHONE_SPEC_FIELDS: PhoneSpecField[] = [
  {category:'Ekran',label:'Panel Tipi',paths:'screen.type',legacy:'displayType|display'},
  {category:'Ekran',label:'Ekran Boyutu',paths:'screen.size',legacy:'screenSize',unit:'inç'},
  {category:'Ekran',label:'Çözünürlük',paths:'screen.resolution',legacy:'screenResolution'},
  {category:'Ekran',label:'Yenileme Hızı',paths:'screen.refreshRate',unit:'Hz',direction:'higher'},
  {category:'Ekran',label:'Parlaklık',paths:'screen.brightnessNits|screen.brightness',unit:'nits',direction:'higher'},
  {category:'Ekran',label:'Piksel Yoğunluğu',paths:'screen.ppi',unit:'PPI',direction:'higher'},
  {category:'İşlemci ve Bellek',label:'İşlemci',paths:'processor.chip',legacy:'chipset|processor'},
  {category:'İşlemci ve Bellek',label:'Çekirdek Yapısı',paths:'processor.cores',legacy:'cpuCores'},
  {category:'İşlemci ve Bellek',label:'Üretim Teknolojisi',paths:'processor.process'},
  {category:'İşlemci ve Bellek',label:'Kayıtlı AnTuTu Puanı (yöntem doğrulanmadı)',paths:'processor.antutuScore'},
  {category:'İşlemci ve Bellek',label:'RAM Kapasitesi',paths:'memory.ramGb',legacy:'ram',unit:'GB',direction:'higher'},
  {category:'İşlemci ve Bellek',label:'Depolama',paths:'memory.storageGb',legacy:'storage',unit:'GB',direction:'higher'},
  {category:'Kamera',label:'Ana Kamera',paths:'camera.mainMp',unit:'MP'},
  {category:'Kamera',label:'Ultra Geniş Kamera',paths:'camera.ultrawideMp',unit:'MP'},
  {category:'Kamera',label:'Telefoto',paths:'camera.telephotoMp',unit:'MP'},
  {category:'Kamera',label:'Ön Kamera',paths:'camera.selfieMp|camera.frontMp',legacy:'frontCamera',unit:'MP'},
  {category:'Kamera',label:'Video',paths:'camera.videoRes'},
  // A combined rear-camera description must not masquerade as one main sensor.
  {category:'Kamera',label:'Arka Kamera Sistemi (katalog kaydı)',paths:'camera.summary',legacy:'mainCamera'},
  {category:'Batarya ve Şarj',label:'Batarya Kapasitesi',paths:'battery.capacitymAh',legacy:'batteryCapacity|battery',unit:'mAh',direction:'higher'},
  {category:'Batarya ve Şarj',label:'Kablolu Şarj Gücü',paths:'battery.chargingWatts',legacy:'chargingSpeed',unit:'W',direction:'higher'},
  {category:'Batarya ve Şarj',label:'Kablosuz Şarj',paths:'battery.wirelessCharging'},
  {category:'Batarya ve Şarj',label:'Kablosuz Şarj Gücü',paths:'battery.wirelessWatts',unit:'W',direction:'higher'},
  {category:'Gövde ve Bağlantı',label:'Ağırlık',paths:'build.weightGrams',legacy:'weight',unit:'g',direction:'lower'},
  {category:'Gövde ve Bağlantı',label:'Su / Toz Dayanıklılığı',paths:'build.waterResistance',legacy:'waterResistance'},
  {category:'Gövde ve Bağlantı',label:'5G',paths:'connectivity.has5G',legacy:'has5G'},
  {category:'Gövde ve Bağlantı',label:'NFC',paths:'connectivity.hasNFC'},
  {category:'Gövde ve Bağlantı',label:'Wi-Fi',paths:'connectivity.wifiStandard'},
  {category:'Gövde ve Bağlantı',label:'Bluetooth',paths:'connectivity.bluetooth'},
  {category:'Gövde ve Bağlantı',label:'İşletim Sistemi',paths:'software.osName',legacy:'operatingSystem|os'},
];

function readScalar(specs: unknown, paths?: string): unknown {
  for (const path of paths?.split('|') || []) {
    let value = specs;
    for (const key of path.split('.')) {
      value = value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined;
    }
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return value;
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

export function readPhoneSpec(specs: unknown, field: PhoneSpecField) {
  const canonical = readScalar(specs, field.paths);
  if (canonical !== undefined) return {value:canonical, legacy:false};
  const value = readScalar(specs, field.legacy);
  return {value, legacy:value !== undefined};
}

export function phoneSpecText(specs: unknown, field: PhoneSpecField | string): string {
  const definition = typeof field === 'string'
    ? PHONE_SPEC_FIELDS.find(item => item.paths.split('|').includes(field))
    : field;
  return definition ? formatSpecValue(readPhoneSpec(specs, definition).value, definition.unit) : 'Bilinmiyor';
}

export function hasLegacyPhoneSpecs(specs: unknown): boolean {
  return PHONE_SPEC_FIELDS.some(field => readPhoneSpec(specs, field).legacy);
}

/** Keep only the small, known scalar aliases when projecting a listing card. */
export function legacyPhoneSpecScalars(specs: unknown): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const field of PHONE_SPEC_FIELDS) {
    for (const key of field.legacy?.split('|') || []) {
      const value = readScalar(specs,key);
      if (value !== undefined) result[key] = value;
    }
  }
  return result;
}

/** Preserve readable fields in mixed records; never convert aliases into verified metrics. */
export function projectPhoneSpecs(specs: unknown): Record<string, unknown> {
  const result: Record<string, any> = {};
  for (const field of PHONE_SPEC_FIELDS) {
    for (const path of field.paths.split('|')) {
      const value = readScalar(specs, path);
      if (value === undefined) continue;
      const parts = path.split('.');
      let target = result;
      for (const part of parts.slice(0, -1)) target = target[part] ??= {};
      target[parts[parts.length - 1]] = value;
    }
  }
  return Object.assign(result, legacyPhoneSpecScalars(specs));
}

export const LEGACY_PHONE_SPEC_NOTICE = 'Bu üründe kaynak doğrulaması bekleyen katalog bilgileri var. Bu bilgilerden üstünlük veya kazanan sonucu çıkarılmaz.';
