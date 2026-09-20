import {formatSpecValue} from './specFormatting';
import type {Product} from './types';
import {hasUnresolvedSpecField} from './specVerification';

export interface SmartwatchSpecField {
  category: string;
  label: string;
  paths: string;
  unit?: string;
  boolean?: boolean;
  direction?: 'higher' | 'lower';
}

// Both imported watch formats remain readable without rewriting or validating
// catalog facts. Equivalent keys are aliases; IP ratings and ATM remain distinct.
export const SMARTWATCH_SPEC_FIELDS: SmartwatchSpecField[] = [
  {category:'Ekran ve Gövde',label:'Ekran',paths:'displayType'},
  {category:'Ekran ve Gövde',label:'Ekran Boyutu',paths:'displaySizeInch|displaySizeInches',unit:'inç'},
  {category:'Ekran ve Gövde',label:'Çözünürlük',paths:'resolution'},
  {category:'Ekran ve Gövde',label:'Kasa Boyutu',paths:'caseSizeMm',unit:'mm'},
  {category:'Ekran ve Gövde',label:'Ağırlık',paths:'weightGrams',unit:'g',direction:'lower'},
  {category:'Ekran ve Gövde',label:'Kasa Malzemesi',paths:'casingMaterial|material'},
  {category:'Ekran ve Gövde',label:'Kordon Malzemesi',paths:'strapMaterial'},
  {category:'Ekran ve Gövde',label:'Renk',paths:'color'},
  {category:'Ekran ve Gövde',label:'Su Dayanıklılığı',paths:'waterResistance|waterResistanceAtm',unit:'ATM'},
  {category:'Ekran ve Gövde',label:'IP / Dayanıklılık Notu',paths:'ipRating'},
  {category:'Sistem ve Bellek',label:'İşlemci',paths:'processor'},
  {category:'Sistem ve Bellek',label:'RAM',paths:'ramGb',unit:'GB'},
  {category:'Sistem ve Bellek',label:'Depolama',paths:'storageGb|internalStorageGB',unit:'GB'},
  {category:'Sistem ve Bellek',label:'İşletim Sistemi',paths:'os'},
  {category:'Sistem ve Bellek',label:'Uyumluluk',paths:'compatibility'},
  {category:'Özellikler',label:'GPS',paths:'hasGps|hasGPS',boolean:true},
  {category:'Özellikler',label:'NFC',paths:'hasNfc|hasNFC',boolean:true},
  {category:'Özellikler',label:'NFC Bölgesel Kapsamı',paths:'nfcSupportNote'},
  {category:'Özellikler',label:'Hücresel Bağlantı',paths:'hasCellular',boolean:true},
  {category:'Özellikler',label:'EKG',paths:'hasECG',boolean:true},
  {category:'Özellikler',label:'Nabız Ölçümü',paths:'hasHeartRate',boolean:true},
  {category:'Özellikler',label:'SpO₂ Ölçümü',paths:'hasSpO2',boolean:true},
  {category:'Özellikler',label:'Mikrofon',paths:'hasMicrophone',boolean:true},
  {category:'Özellikler',label:'Hoparlör',paths:'hasSpeaker',boolean:true},
  {category:'Özellikler',label:'Sesli Arama',paths:'voiceCalling',boolean:true},
  {category:'Özellikler',label:'Sensörler',paths:'sensors'},
  {category:'Özellikler',label:'Bağlantılar',paths:'connectivity'},
  {category:'Pil',label:'Kayıtlı Pil Süresi',paths:'batteryLifeDays',unit:'gün'},
  {category:'Pil',label:'Pil Süresi Koşulları',paths:'batteryLifeNote'},
  {category:'Pil',label:'Batarya Türü',paths:'batteryType'},
  {category:'Pil',label:'Batarya Kapasitesi',paths:'batteryCapacityMah',unit:'mAh'},
];

const scalar = (value:unknown): boolean => (typeof value === 'number' && Number.isFinite(value) && value >= 0) ||
  (typeof value === 'string' && value.trim().length > 0);

export function readSmartwatchSpec(specs:unknown, field:SmartwatchSpecField) {
  const data = specs && typeof specs === 'object' ? specs as Record<string,unknown> : {};
  const recorded = field.paths.split('|').map(key=>data[key]).filter(value=>value !== undefined && value !== null && value !== '');
  const values = recorded.filter(value=>field.boolean ? typeof value === 'boolean' : scalar(value) ||
    (Array.isArray(value) && value.length > 0 && value.every(scalar)));
  // Compare original precision; locale display rounding cannot make two
  // different recorded numbers agree. Text with an explicit identical unit is
  // accepted (e.g. 10 and "10 ATM"), without converting units or parsing ranges.
  const fingerprints = values.map(value=>typeof value === 'number' ? `${value}${field.unit ? ` ${field.unit}` : ''}` :
    typeof value === 'string' ? value.trim() : JSON.stringify(value));
  // Conflicting aliases cannot silently choose whichever happens to come first.
  const conflict = new Set(fingerprints).size > 1;
  return {value:conflict ? undefined : values[0],conflict};
}

export function smartwatchSpecText(specs:unknown, field:SmartwatchSpecField): string {
  const result=readSmartwatchSpec(specs,field);
  return result.conflict ? 'Çelişkili katalog verisi' : formatSpecValue(result.value,field.unit);
}

/** Review status also applies to runtime/admin projections, before a build guard. */
export function smartwatchProductSpecText(product:Product, field:SmartwatchSpecField): string {
  return hasUnresolvedSpecField(product,field.paths) ? 'Bilinmiyor' : smartwatchSpecText(product.specs,field);
}
