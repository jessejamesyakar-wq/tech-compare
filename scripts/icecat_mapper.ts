import crypto from 'crypto';

export interface ExtraSpecItem {
  featureId: number;
  name: string;
  group: string;
  value: string;
  unit?: string;
}

export interface NormalizedPhoneSpecs {
  screen?: {
    size?: string;
    type?: string;
    resolution?: string;
    refreshRate?: number;
    brightnessNits?: number;
    ppi?: number;
  };
  processor?: {
    chip?: string;
    cores?: string;
    process?: string;
  };
  memory?: {
    ramGb?: number;
    storageGb?: number;
    expandableStorage?: boolean;
  };
  camera?: {
    mainMp?: string;
    ultrawideMp?: string;
    telephotoMp?: string;
    selfieMp?: string;
    videoRes?: string;
  };
  battery?: {
    capacitymAh?: number;
    chargingWatts?: number;
    wirelessCharging?: boolean;
  };
  connectivity?: {
    has5G?: boolean;
    wifiStandard?: string;
    bluetooth?: string;
    hasNFC?: boolean;
    hasesim?: boolean;
  };
  build?: {
    weightGrams?: number;
    thicknessMm?: number;
    waterResistance?: string;
  };
  software?: {
    osName?: string;
  };
}

export interface MappedIcecatResult {
  icecatId?: number;
  title: string;
  brand: string;
  productCode: string;
  gtin?: string;
  language: string;
  specs: NormalizedPhoneSpecs;
  extraSpecs: ExtraSpecItem[];
  rawFeaturesCount: number;
  mappedFieldsCount: number;
}

export function parseIcecatPayload(data: any, lang: string = 'tr'): MappedIcecatResult | null {
  if (!data || !data.data) return null;
  const d = data.data;
  const general = d.GeneralInfo || {};
  const featureGroups = Array.isArray(d.FeaturesGroups) ? d.FeaturesGroups : [];

  const title = general.Title || general.ProductName || '';
  const brand = general.Brand || '';
  const productCode = general.ProductCode || '';
  const gtin = Array.isArray(general.GTIN) ? general.GTIN[0] : general.GTIN;
  const icecatId = general.IcecatId || general.ProductID;

  const specs: NormalizedPhoneSpecs = {
    screen: {},
    processor: {},
    memory: {},
    camera: {},
    battery: {},
    connectivity: {},
    build: {},
    software: {}
  };

  const extraSpecs: ExtraSpecItem[] = [];
  let rawCount = 0;
  let mappedCount = 0;

  for (const group of featureGroups) {
    const groupName = group.FeatureGroup?.Name?.Value || group.FeatureGroup?.Name || 'Genel';
    const features = Array.isArray(group.Features) ? group.Features : [];

    for (const feat of features) {
      rawCount++;
      const fId = parseInt(String(feat.Feature?.ID), 10);
      const fName = feat.Feature?.Name?.Value || feat.Feature?.Name || '';
      const fVal = feat.PresentationValue || feat.Value || '';
      const fRaw = feat.Value;
      const fMeasure = feat.Feature?.Measure?.Signs?.[0]?.Value || feat.Feature?.Measure?.Value || '';

      if (!fName || !fVal) continue;

      const fNameLower = fName.toLowerCase();
      let isMapped = false;

      // 1. Ekran / Screen
      if (fId === 944) { // Ekran boyutu
        const num = parseFloat(String(fRaw));
        if (!isNaN(num) && num > 0) {
          specs.screen!.size = `${num} inç`;
          isMapped = true;
          mappedCount++;
        }
      } else if (fId === 15285 || fId === 46952 || (fNameLower.includes('panel tipi') && !specs.screen!.type)) { // Panel tipi
        if (!specs.screen!.type) {
          specs.screen!.type = fVal;
          isMapped = true;
          mappedCount++;
        }
      } else if (fId === 1585 || fNameLower === 'ekran çözünürlüğü') { // Ekran çözünürlüğü
        const m = fVal.match(/(\d+\s*x\s*\d+)/i);
        if (m) {
          specs.screen!.resolution = m[1].replace(/\s+/g, ' ');
          isMapped = true;
          mappedCount++;
        }
      } else if (fId === 7450 || fId === 21491 || fNameLower.includes('yenileme hızı')) { // Yenileme hızı
        const hz = parseInt(String(fRaw).match(/\d+/)?.[0] || '', 10);
        if (!isNaN(hz) && hz > 0) {
          specs.screen!.refreshRate = hz;
          isMapped = true;
          mappedCount++;
        }
      } else if (fId === 45970 || (fNameLower.includes('parlaklık') && fVal.includes('cd/m²'))) { // Parlaklık
        const nits = parseInt(String(fRaw).match(/\d+/)?.[0] || '', 10);
        if (!isNaN(nits) && nits > 0 && !specs.screen!.brightnessNits) {
          specs.screen!.brightnessNits = nits;
          isMapped = true;
          mappedCount++;
        }
      } else if (fId === 2133 || fNameLower.includes('piksel yoğunluğu')) { // PPI
        const ppi = parseInt(String(fRaw).match(/\d+/)?.[0] || '', 10);
        if (!isNaN(ppi) && ppi > 0) {
          specs.screen!.ppi = ppi;
          isMapped = true;
          mappedCount++;
        }
      }

      // 2. İşlemci / Processor
      else if (fId === 2196 || fId === 47 || fNameLower === 'işlemci ailesi') { // İşlemci ailesi
        if (!specs.processor!.chip) {
          specs.processor!.chip = fVal;
          isMapped = true;
          mappedCount++;
        }
      } else if (fId === 6089 || fNameLower.includes('çekirdek sayısı')) { // Çekirdek sayısı
        const cores = parseInt(String(fRaw).match(/\d+/)?.[0] || '', 10);
        if (!isNaN(cores) && cores > 0) {
          specs.processor!.cores = `${cores} Çekirdek`;
          isMapped = true;
          mappedCount++;
        }
      }

      // 3. Bellek / Memory
      else if (fId === 7861 || fNameLower === 'ram kapasitesi') { // RAM
        const ram = parseInt(String(fRaw).match(/\d+/)?.[0] || '', 10);
        if (!isNaN(ram) && ram > 0) {
          specs.memory!.ramGb = ram;
          isMapped = true;
          mappedCount++;
        }
      } else if (fId === 8730 || fNameLower === 'dahili hafıza') { // Depolama
        const storage = parseInt(String(fRaw).match(/\d+/)?.[0] || '', 10);
        if (!isNaN(storage) && storage > 0) {
          specs.memory!.storageGb = storage;
          isMapped = true;
          mappedCount++;
        }
      } else if (fId === 730 || fNameLower.includes('hafıza kart')) { // Uyumlu hafıza kartları
        specs.memory!.expandableStorage = !fVal.toLowerCase().includes('destekle') && !fVal.toLowerCase().includes('hayır');
        isMapped = true;
        mappedCount++;
      }

      // 4. Kamera / Camera
      else if (fId === 12435 || fNameLower === 'arka kamera çözünürlüğü') { // Arka kamera
        const mp = fVal.match(/(\d+)\s*MP/i) || fVal.match(/(\d+)/);
        if (mp) {
          specs.camera!.mainMp = `${mp[1]} MP`;
          isMapped = true;
          mappedCount++;
        }
      } else if (fId === 27588 || fNameLower.includes('ikinci arka kamera çözünürlüğü')) { // Ultra geniş
        const mp = fVal.match(/(\d+)\s*MP/i) || fVal.match(/(\d+)/);
        if (mp) {
          specs.camera!.ultrawideMp = `${mp[1]} MP`;
          isMapped = true;
          mappedCount++;
        }
      } else if (fId === 27587 || fNameLower.includes('üçüncü arka kamera çözünürlüğü')) { // Telefoto / Makro
        const mp = fVal.match(/(\d+)\s*MP/i) || fVal.match(/(\d+)/);
        if (mp) {
          specs.camera!.telephotoMp = `${mp[1]} MP`;
          isMapped = true;
          mappedCount++;
        }
      } else if (fId === 12437 || fId === 12436 || fNameLower === 'ön kamera çözünürlüğü') { // Ön kamera
        const mp = fVal.match(/(\d+)\s*MP/i) || fVal.match(/(\d+)/);
        if (mp) {
          specs.camera!.selfieMp = `${mp[1]} MP`;
          isMapped = true;
          mappedCount++;
        }
      } else if (fId === 8745 || fNameLower.includes('video kaydetme çözünürlüğü')) { // Video
        specs.camera!.videoRes = fVal;
        isMapped = true;
        mappedCount++;
      }

      // 5. Batarya / Battery
      else if (fId === 909 || fNameLower === 'pil performansı') { // Pil (mAh)
        const mah = parseInt(String(fRaw).match(/\d+/)?.[0] || '', 10);
        if (!isNaN(mah) && mah > 0) {
          specs.battery!.capacitymAh = mah;
          isMapped = true;
          mappedCount++;
        }
      } else if (fId === 38337 || fNameLower.includes('kablosuz şarj')) { // Kablosuz şarj
        specs.battery!.wirelessCharging = fRaw === 'Y' || fVal.toLowerCase() === 'evet';
        isMapped = true;
        mappedCount++;
      }

      // 6. Bağlantı / Connectivity
      else if (fId === 40629 || fNameLower === 'mobil ağ oluşturma') { // Mobil ağ
        specs.connectivity!.has5G = fVal.includes('5G') || fRaw === '5G';
        isMapped = true;
        mappedCount++;
      } else if (fId === 24993 || fId === 249 || (fNameLower === 'wi-fi standardı' && !specs.connectivity!.wifiStandard)) {
        specs.connectivity!.wifiStandard = fVal;
        isMapped = true;
        mappedCount++;
      } else if (fId === 1208 || fNameLower.includes('bluetooth versiyonu')) {
        specs.connectivity!.bluetooth = fVal;
        isMapped = true;
        mappedCount++;
      } else if (fId === 10157 || fId === 10159 || fNameLower.includes('yakın alan iletişimi') || fNameLower === 'nfc') {
        specs.connectivity!.hasNFC = fRaw === 'Y' || fVal.toLowerCase() === 'evet';
        isMapped = true;
        mappedCount++;
      } else if (fId === 9166 || fNameLower.includes('sim kart türü')) {
        specs.connectivity!.hasesim = fVal.toLowerCase().includes('esim');
        isMapped = true;
        mappedCount++;
      }

      // 7. Gövde & Boyutlar / Build
      else if (fId === 94 || fNameLower === 'ağırlık') {
        const grams = parseFloat(String(fRaw));
        if (!isNaN(grams) && grams > 0) {
          specs.build!.weightGrams = Math.round(grams);
          isMapped = true;
          mappedCount++;
        }
      } else if (fId === 1650 || fNameLower === 'derinlik') {
        const th = parseFloat(String(fRaw));
        if (!isNaN(th) && th > 0) {
          specs.build!.thicknessMm = th;
          isMapped = true;
          mappedCount++;
        }
      } else if (fId === 7900 || fNameLower.includes('uluslar arası koruma kodu') || fNameLower.includes('ip kodu')) {
        specs.build!.waterResistance = fVal;
        isMapped = true;
        mappedCount++;
      }

      // 8. Yazılım / Software
      else if (fId === 3233 || fNameLower === 'işletim sistemi yazılımı') {
        specs.software!.osName = fVal;
        isMapped = true;
        mappedCount++;
      }

      // ALWAYS retain in extraSpecs so no data is lost!
      extraSpecs.push({
        featureId: fId,
        name: fName,
        group: groupName,
        value: fVal,
        unit: fMeasure || undefined
      });
    }
  }

  // Clean empty nested specs
  if (Object.keys(specs.screen!).length === 0) delete specs.screen;
  if (Object.keys(specs.processor!).length === 0) delete specs.processor;
  if (Object.keys(specs.memory!).length === 0) delete specs.memory;
  if (Object.keys(specs.camera!).length === 0) delete specs.camera;
  if (Object.keys(specs.battery!).length === 0) delete specs.battery;
  if (Object.keys(specs.connectivity!).length === 0) delete specs.connectivity;
  if (Object.keys(specs.build!).length === 0) delete specs.build;
  if (Object.keys(specs.software!).length === 0) delete specs.software;

  return {
    icecatId,
    title,
    brand,
    productCode,
    gtin,
    language: lang,
    specs,
    extraSpecs,
    rawFeaturesCount: rawCount,
    mappedFieldsCount: mappedCount
  };
}
