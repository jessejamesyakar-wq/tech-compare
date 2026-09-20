import type { Product } from './types';
import { formatSpecValue } from './specFormatting';
import { getRecordedProductScore } from './productEvidence';
import { evaluateProductPricing } from './pricing/unifiedPriceEvaluator';
import { PHONE_SPEC_FIELDS, readPhoneSpec, phoneSpecText } from './smartphoneSpecFields';
import { hasUnresolvedSpecField } from './specVerification';

export const UNKNOWN_SPEC = 'Bilinmiyor';
export interface ComparisonRow {
  id: string;
  category: string;
  label: string;
  unit?: string;
  direction?: 'higher' | 'lower';
  getValue: (product: Product) => string;
  getRawNumber?: (product: Product) => number | null;
}
export type MetricOutcome = 1 | 2 | 'tie' | 'insufficient_data' | 'not_comparable';

export function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}

function readSpec(product: Product, paths: string[]): unknown {
  for (const path of paths) {
    let value: unknown = product.specs;
    for (const part of path.split('.')) value = value && typeof value === 'object' ? (value as Record<string, unknown>)[part] : undefined;
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return undefined;
}

function field(category: string, label: string, paths: string, unit = '', direction?: 'higher' | 'lower'): ComparisonRow {
  const alternatives = paths.split('|');
  return {
    id: `${category}:${paths}`, category, label, unit, direction,
    getValue: p => formatSpecValue(readSpec(p, alternatives), unit),
    getRawNumber: direction ? p => hasUnresolvedSpecField(p, paths) ? null : finiteNumber(readSpec(p, alternatives)) : undefined,
  };
}

const priceRow: ComparisonRow = {
  id: 'price', category: 'Fiyat ve Kayıt Bilgisi', label: 'Güncel Mağaza Fiyatı', unit: 'TL', direction: 'lower',
  getRawNumber: p => evaluateProductPricing(p).currentPrice,
  getValue: p => {
    const price = evaluateProductPricing(p);
    return price.currentPrice === null ? 'Güncel teklif doğrulanmadı' : `${price.currentPrice.toLocaleString('tr-TR')} TL`;
  },
};
const commonRows: ComparisonRow[] = [priceRow,
  { id:'score',category:'Fiyat ve Kayıt Bilgisi',label:'Katalog Puanı (ölçüm yöntemi doğrulanmadı)',getValue:p=>{const score=getRecordedProductScore(p);return score===null?'Kayıtlı puan yok':`${score} / 100`; } },
  { id:'year',category:'Fiyat ve Kayıt Bilgisi',label:'Çıkış Yılı',getValue:p=>finiteNumber(p.releaseYear) === null ? 'Doğrulanmış veri yok' : String(p.releaseYear) },
];

const rowsByCategory: Record<string, ComparisonRow[]> = {
  smartphones: PHONE_SPEC_FIELDS.map(spec => ({
    id:`${spec.category}:${spec.paths}`, category:spec.category, label:spec.label,
    unit:spec.unit, direction:spec.direction,
    getValue:p => phoneSpecText(p.specs, spec),
    // Legacy imports contain unverified ranges and bundled variants. Display
    // the recorded text, but never turn it into a competitive numeric metric.
    getRawNumber:spec.direction ? p => {
      const read = readPhoneSpec(p.specs, spec);
      return read.legacy || hasUnresolvedSpecField(p, spec.paths) ? null : finiteNumber(read.value);
    } : undefined,
  })),
  laptops: [
    field('İşlemci ve Grafik','İşlemci','processor'),field('İşlemci ve Grafik','Çekirdek Yapısı','processorCores'),field('İşlemci ve Grafik','Grafik Birimi','gpu'),field('İşlemci ve Grafik','NPU','npuTops','TOPS'),field('İşlemci ve Grafik','MUX Switch','muxSwitch'),
    field('Bellek ve Depolama','RAM','ramGb','GB','higher'),field('Bellek ve Depolama','RAM Türü','ramType'),field('Bellek ve Depolama','Depolama','storageGb','GB','higher'),field('Bellek ve Depolama','Depolama Türü','storageType'),
    field('Ekran','Boyut','screenSizeInches','inç'),field('Ekran','Çözünürlük','screenResolution'),field('Ekran','Yenileme Hızı','refreshRateHz','Hz','higher'),field('Ekran','Parlaklık','screenBrightnessNits','nits','higher'),
    field('Batarya ve Kasa','Batarya Kapasitesi','batteryCapacityWh','Wh','higher'),field('Batarya ve Kasa','Ağırlık','weightKg','kg','lower'),field('Batarya ve Kasa','İşletim Sistemi','os'),field('Batarya ve Kasa','Bağlantılar','ports'),
  ],
  tvs: [
    field('Ekran','Panel Teknolojisi','displayTech'),field('Ekran','Boyut','screenSizeInches','inç'),field('Ekran','Çözünürlük','resolution'),field('Ekran','Yenileme Hızı','refreshRateHz','Hz','higher'),field('Ekran','Parlaklık','brightnessNits','nits','higher'),field('Ekran','HDR Formatları','hdrSupport|hdrFormats'),field('Ekran','Görüntü İşlemcisi','processorEngine'),
    field('Oyun ve Bağlantı','HDMI Port Sayısı','hdmiPorts','adet','higher'),field('Oyun ve Bağlantı','HDMI Standardı','hdmiVersion'),field('Oyun ve Bağlantı','Kayıtlı Oyun Özellikleri','gamingFeatures'),field('Oyun ve Bağlantı','Giriş Gecikmesi','inputLagMs','ms','lower'),
    field('Ses ve Sistem','Ses Gücü','audioPowerWatts','W'),field('Ses ve Sistem','Ses Kanalları','audioChannels'),field('Ses ve Sistem','Dolby Atmos','dolbyAtmos'),field('Ses ve Sistem','İşletim Sistemi','smartOs'),field('Ses ve Sistem','Enerji Sınıfı','energyClass'),
  ],
  monitors: [
    field('Ekran','Panel Tipi','panelType'),field('Ekran','Boyut','screenSizeInches','inç'),field('Ekran','Çözünürlük','resolution'),field('Ekran','Yenileme Hızı','refreshRateHz','Hz','higher'),field('Ekran','Tepki Süresi (katalog)','responseTimeMs','ms'),field('Ekran','Parlaklık','brightnessNits','nits','higher'),field('Ekran','HDR','hdrSupport'),field('Ekran','Kontrast','contrastRatio'),
    field('Bağlantı ve Ergonomi','Senkronizasyon','syncTechnology'),field('Bağlantı ve Ergonomi','Portlar','ports'),field('Bağlantı ve Ergonomi','Hoparlör','speakers|hasSpeakers'),field('Bağlantı ve Ergonomi','Yükseklik Ayarı','heightAdjustable'),field('Bağlantı ve Ergonomi','Pivot','pivot'),field('Bağlantı ve Ergonomi','VESA','vesaMount'),
  ],
  tablets: [
    field('Ekran','Boyut','screenSizeInches|displaySizeInch|screen.size','inç'),field('Ekran','Panel','displayType|screenType|screen.type'),field('Ekran','Çözünürlük','resolution|screen.resolution'),field('Ekran','Yenileme Hızı','refreshRateHz|screen.refreshRate','Hz','higher'),
    field('Donanım','İşlemci','processor.chip|processor|chipset'),field('Donanım','RAM','ramGb|memory.ramGb','GB','higher'),field('Donanım','Depolama','storageGb|memory.storageGb','GB','higher'),field('Donanım','İşletim Sistemi','os'),
    field('Batarya ve Bağlantı','Batarya Kapasitesi','batteryCapacityMah|batteryCapacitymAh|battery.capacitymAh','mAh','higher'),field('Batarya ve Bağlantı','Hücresel Bağlantı','hasCellular'),field('Batarya ve Bağlantı','Ağırlık','weightGrams','g','lower'),
  ],
  smartwatches: [
    field('Ekran ve Gövde','Ekran','displayType'),field('Ekran ve Gövde','Boyut','displaySizeInch','inç'),field('Ekran ve Gövde','Kasa Boyutu','caseSizeMm','mm'),field('Ekran ve Gövde','Ağırlık','weightGrams','g','lower'),field('Ekran ve Gövde','Dayanıklılık','waterResistance'),
    field('Özellikler','GPS','hasGps'),field('Özellikler','Hücresel Bağlantı','hasCellular'),field('Özellikler','EKG','hasECG'),field('Özellikler','NFC','hasNfc'),field('Özellikler','Sensörler','sensors'),field('Özellikler','Uyumluluk','compatibility'),field('Özellikler','İşletim Sistemi','os'),field('Özellikler','Kayıtlı Pil Süresi','batteryLifeDays','gün'),
  ],
  headphones: [
    field('Ses ve Özellikler','Tür','type|formFactor'),field('Ses ve Özellikler','Aktif Gürültü Engelleme','anc'),field('Ses ve Özellikler','Sürücü','driverSizeMm','mm'),field('Ses ve Özellikler','Frekans Aralığı','frequencyResponse'),
    field('Batarya ve Bağlantı','Kayıtlı Pil Süresi','batteryLife|batteryLifeHours'),field('Batarya ve Bağlantı','Bluetooth','bluetoothVersion'),field('Batarya ve Bağlantı','Ağırlık','weightGrams','g','lower'),field('Batarya ve Bağlantı','Dayanıklılık','waterResistance'),
  ],
  consoles: [
    field('Donanım','İşlemci','processor|cpu'),field('Donanım','Grafik Birimi','gpu'),field('Donanım','RAM','ramGb','GB','higher'),field('Donanım','Depolama','storageGb','GB','higher'),
    field('Oyun ve Bağlantı','Çözünürlük','resolution'),field('Oyun ve Bağlantı','Disk Sürücüsü','hasDiscDrive|opticalDrive'),field('Oyun ve Bağlantı','Bağlantılar','connectivity|ports'),field('Oyun ve Bağlantı','Tür','consoleType|type'),
  ],
  appliances: [
    // Wattage is consumption, not a performance ranking; never award a winner.
    field('Teknik Özellikler','Güç','powerWatts','W'),field('Teknik Özellikler','Kapasite','capacity'),field('Teknik Özellikler','Hacim','capacityLiters','L'),field('Teknik Özellikler','Enerji Sınıfı','energyClass'),field('Teknik Özellikler','Ses Seviyesi','noiseLevelDb','dB'),field('Teknik Özellikler','Boyutlar','dimensions'),field('Teknik Özellikler','Kayıtlı Garanti Süresi','warrantyYears','yıl'),
  ],
};

export function getComparisonRows(products: Product[]): ComparisonRow[] {
  const category=products[0]?.category;
  // Category-specific units/meanings must never be compared across categories.
  return [...commonRows,...(category && products.every(p=>p.category===category) ? rowsByCategory[category] || [] : [])];
}

export function getMetricOutcome(row: ComparisonRow, products: Product[]): MetricOutcome {
  if(products.length!==2 || products[0].category!==products[1].category || !row.direction || !row.getRawNumber)return 'not_comparable';
  const a=row.getRawNumber(products[0]),b=row.getRawNumber(products[1]);
  if(a===null||b===null||!Number.isFinite(a)||!Number.isFinite(b))return 'insufficient_data';
  if(a===b)return 'tie';
  return (row.direction==='higher'?a>b:a<b)?1:2;
}

export function getRowWinnerId(row:ComparisonRow,products:Product[]):string|null {
  if(products.length<2||!row.direction||!row.getRawNumber||!products.every(p=>p.category===products[0].category))return null;
  const values=products.map(row.getRawNumber);
  if(values.some(n=>n===null||!Number.isFinite(n)))return null;
  const numbers=values as number[],best=row.direction==='higher'?Math.max(...numbers):Math.min(...numbers);
  const winners=products.filter((_,i)=>numbers[i]===best);
  return winners.length===1?winners[0].id:null;
}

export function describeMetric(row:ComparisonRow,products:Product[]):string {
  const result=getMetricOutcome(row,products);
  if(result==='insufficient_data')return 'İki ürün için karşılaştırılabilir kayıtlı veri yok.';
  if(result==='not_comparable')return 'Katalog bilgisi; bu alandan kazanan çıkarılmaz.';
  if(result==='tie')return 'Kayıtlı değerler eşit.';
  const difference=Math.abs(row.getRawNumber!(products[0])!-row.getRawNumber!(products[1])!);
  return `${products[result-1].name}: ${difference.toLocaleString('tr-TR')} ${row.unit||''} daha ${row.direction==='higher'?'yüksek':'düşük'} kayıtlı değer.`;
}

export function getDuelRows(products:Product[]):ComparisonRow[] {
  const rows=getComparisonRows(products).filter(r=>!['score','year'].includes(r.id));
  const chosen:ComparisonRow[]=[],seen=new Set<string>();
  for(const row of rows.filter(r=>r.direction)){if(!seen.has(row.category)){chosen.push(row);seen.add(row.category);}}
  for(const row of rows){if(chosen.length>=4)break;if(!chosen.includes(row))chosen.push(row);}
  return chosen.slice(0,4);
}
