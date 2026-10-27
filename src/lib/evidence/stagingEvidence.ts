/**
 * ASTERION PHASE 3.7 — STAGING PILOT EVIDENCE REGISTRY
 * 
 * Provides official manufacturer evidence source mappings for pilot products
 * in the staging environment without mutating baseline production catalog JSON files.
 * 
 * Strict immutable rules:
 * - Zero catalog JSON mutations
 * - Zero price mutations
 * - Zero Golden dataset mutations
 * - Zero unverified / contradictory field elevations
 */

export interface StagingSourceEntry {
  fields: string[];
  sourceUrl: string;
  checkedAt: string;
  scopeNote: string;
  verificationStatus?: 'VERIFIED' | 'UNVERIFIED' | 'CONFLICTED';
  trustClassification?: string;
}

const STAGING_PILOT_SOURCES: Record<string, StagingSourceEntry[]> = {
  'tv-tcl-85-85p8l-85-inc': [
    {
      fields: ['specs.displayTech', 'specs.refreshRateHz', 'specs.smartOs', 'specs.resolution'],
      sourceUrl: 'https://www.tcl.com/tr/tr/tvs/p8l',
      checkedAt: '2026-10-11T19:29:44.000Z',
      scopeNote: 'TCL Türkiye resmi P8L serisi ürün sayfası: QD-Mini LED ekran, 144Hz panel, Google TV ve 4K Ultra HD doğrulanmıştır.'
    }
  ],
  'tv-tcl-75-75p8l-75-inc': [
    {
      fields: ['specs.displayTech', 'specs.refreshRateHz', 'specs.smartOs', 'specs.resolution'],
      sourceUrl: 'https://www.tcl.com/tr/tr/tvs/p8l',
      checkedAt: '2026-10-11T19:29:44.000Z',
      scopeNote: 'TCL Türkiye resmi P8L serisi ürün sayfası: QD-Mini LED ekran, 144Hz panel, Google TV ve 4K Ultra HD doğrulanmıştır.'
    }
  ],
  'tv-tcl-75-75p89k-75-inc': [
    {
      fields: ['specs.displayTech', 'specs.refreshRateHz', 'specs.smartOs', 'specs.resolution'],
      sourceUrl: 'https://www.tcl.com/tr/tr/tvs/p89k',
      checkedAt: '2026-10-11T19:30:06.000Z',
      scopeNote: 'TCL Türkiye resmi P89K serisi ürün sayfası: QLED ekran, 144Hz panel, Google TV ve 4K Ultra HD doğrulanmıştır.'
    }
  ],
  'huawei-huawei-pura-70-ultra': [
    {
      fields: ['specs.screen.size', 'specs.battery.capacitymAh', 'specs.screen.refreshRate', 'specs.battery.chargingWatts'],
      sourceUrl: 'https://consumer.huawei.com/tr/phones/pura70-ultra/specs/',
      checkedAt: '2026-10-14T02:00:00.000Z',
      scopeNote: 'Huawei Türkiye resmi Pura 70 Ultra teknik özellikleri: 6.8 inç LTPO OLED ekran, 5200 mAh batarya, 120Hz yenileme hızı ve 100W SuperCharge doğrulanmıştır.'
    }
  ],
  'asus-rog-strix-scar-18-g835lxg-tq378w': [
    {
      fields: ['specs.screenSizeInches', 'specs.batteryCapacityWh'],
      sourceUrl: 'https://rog.asus.com/tr/laptops/rog-strix/rog-strix-scar-18-2026/spec/',
      checkedAt: '2026-10-12T20:00:00.000Z',
      scopeNote: 'ASUS Türkiye resmi ROG Strix SCAR 18 (2026) G835LXG-TQ378W teknik özellikleri. 18 inç ekran ve 90 WHrs batarya teyit edilmiştir.'
    },
    {
      fields: ['specs.chargerWatts', 'specs.weightKg'],
      sourceUrl: 'https://rog.asus.com/tr/laptops/rog-strix/rog-strix-scar-18-2026/spec/',
      checkedAt: '2026-10-12T20:00:00.000Z',
      scopeNote: 'Resmi teknik doküman 450W adaptör ve 3.73 kg ağırlık belirtmektedir. Katalog değerleri güncellenerek doğrulanmıştır.'
    }
  ],
  'tv-tcl-65-65p8l-65-inc': [
    {
      fields: ['specs.displayTech', 'specs.refreshRateHz', 'specs.audioChannels', 'specs.smartOs', 'specs.resolution'],
      sourceUrl: 'https://www.tcl.com/tr/tr/tvs/p8l',
      checkedAt: '2026-10-11T19:29:44.000Z',
      scopeNote: 'TCL Türkiye resmi P8L serisi ürün sayfası ve teknik özellikleri. 65 inç model için 144Hz, ONKYO 2.1 kanal ses sistemi, Google TV ve 4K Ultra HD teyit edilmiştir.'
    }
  ],
  'tv-tcl-55-55p8l-55-inc': [
    {
      fields: ['specs.displayTech', 'specs.refreshRateHz', 'specs.smartOs', 'specs.resolution'],
      sourceUrl: 'https://www.tcl.com/tr/tr/tvs/p8l',
      checkedAt: '2026-10-11T19:29:44.000Z',
      scopeNote: 'TCL Türkiye resmi P8L serisi ürün sayfası ve teknik özellikleri. 55 inç model için 144Hz, Google TV ve 4K Ultra HD teyit edilmiştir.'
    },
    {
      fields: ['specs.audioChannels'],
      sourceUrl: 'https://www.tcl.com/tr/tr/tvs/p8l',
      checkedAt: '2026-10-11T19:29:44.000Z',
      scopeNote: 'Resmi üretici dipnotu 55 inç model için 2.0 hoparlör belirtmektedir. Katalog değeri güncellenerek doğrulanmıştır.'
    }
  ],
  'tv-tcl-98-98p8l-98-inc': [
    {
      fields: ['specs.displayTech', 'specs.refreshRateHz', 'specs.audioChannels', 'specs.smartOs', 'specs.resolution'],
      sourceUrl: 'https://www.tcl.com/tr/tr/tvs/98p8l',
      checkedAt: '2026-10-11T19:29:44.000Z',
      scopeNote: 'TCL Türkiye resmi 98P8L ürün sayfası. 98 inç model için QD-Mini LED, 144Hz, ONKYO 2.1 kanal ses sistemi, Google TV ve 4K Ultra HD teyit edilmiştir.'
    }
  ],
  'samsung-samsung-galaxy-s24-93': [
    {
      fields: ['specs.screen.size', 'specs.battery.capacitymAh', 'specs.connectivity.has5G'],
      sourceUrl: 'https://www.samsung.com/tr/smartphones/galaxy-s24/specs/',
      checkedAt: '2026-10-12T20:00:00.000Z',
      scopeNote: 'Samsung Türkiye resmi SM-S921B teknik özellikleri. 6.2 inç ekran, 4000 mAh batarya ve 5G desteği teyit edilmiştir.'
    }
  ],
  'samsung-samsung-galaxy-s9-1': [
    {
      fields: ['specs.screen.size', 'specs.processor.chip', 'specs.battery.capacitymAh', 'specs.camera.mainMp'],
      sourceUrl: 'https://www.samsung.com/tr/support/model/SM-G960FZKDATO/',
      checkedAt: '2026-10-13T22:50:00.000Z',
      scopeNote: 'Samsung TR resmi SM-G960F/DS teknik özellikleri: 5.8 inç Quad HD+ Super AMOLED, Exynos 9810, 3000 mAh batarya ve 12 MP kamera teyit edilmiştir.'
    }
  ],
  'samsung-samsung-galaxy-s9-2': [
    {
      fields: ['specs.screen.size', 'specs.processor.chip', 'specs.battery.capacitymAh', 'specs.camera.mainMp'],
      sourceUrl: 'https://www.samsung.com/tr/support/model/SM-G965FZBDATO/',
      checkedAt: '2026-10-13T22:50:00.000Z',
      scopeNote: 'Samsung TR resmi SM-G965F/DS teknik özellikleri: 6.2 inç Quad HD+ Super AMOLED, Exynos 9810, 3500 mAh batarya ve 12 MP kamera teyit edilmiştir.'
    }
  ],
  'samsung-samsung-galaxy-note-9-3': [
    {
      fields: ['specs.screen.size', 'specs.processor.chip', 'specs.battery.capacitymAh', 'specs.camera.mainMp'],
      sourceUrl: 'https://www.samsung.com/tr/support/model/SM-N960FZBDATO/',
      checkedAt: '2026-10-13T22:50:00.000Z',
      scopeNote: 'Samsung TR resmi SM-N960F/DS teknik özellikleri: 6.4 inç Quad HD+ Super AMOLED, Exynos 9810, 4000 mAh batarya ve 12 MP kamera teyit edilmiştir.'
    }
  ],
  'samsung-samsung-galaxy-a8-2018-4': [
    {
      fields: ['specs.screen.size', 'specs.processor.chip', 'specs.battery.capacitymAh', 'specs.camera.mainMp'],
      sourceUrl: 'https://www.samsung.com/tr/support/model/SM-A530FZKDATO/',
      checkedAt: '2026-10-13T22:50:00.000Z',
      scopeNote: 'Samsung TR resmi SM-A530F teknik özellikleri: 5.6 inç FHD+ Super AMOLED, Exynos 7885, 3000 mAh batarya ve 16 MP kamera teyit edilmiştir.'
    }
  ],
  'samsung-samsung-galaxy-a8-2018-5': [
    {
      fields: ['specs.screen.size', 'specs.processor.chip', 'specs.battery.capacitymAh', 'specs.camera.mainMp'],
      sourceUrl: 'https://www.samsung.com/tr/support/model/SM-A730FZKDATO/',
      checkedAt: '2026-10-13T22:50:00.000Z',
      scopeNote: 'Samsung TR resmi SM-A730F teknik özellikleri: 6.0 inç FHD+ Super AMOLED, Exynos 7885, 3500 mAh batarya ve 16 MP kamera teyit edilmiştir.'
    }
  ],
  'samsung-samsung-galaxy-s10e-13': [
    {
      fields: ['specs.screen.size', 'specs.processor.chip', 'specs.battery.capacitymAh'],
      sourceUrl: 'https://www.samsung.com/tr/support/model/SM-G970FZKDATO/',
      checkedAt: '2026-10-13T22:50:00.000Z',
      scopeNote: 'Samsung TR resmi SM-G970F/DS teknik özellikleri: 5.8 inç FHD+ Dynamic AMOLED, Exynos 9820 ve 3100 mAh batarya teyit edilmiştir.'
    }
  ],
  'samsung-samsung-galaxy-s10-14': [
    {
      fields: ['specs.screen.size', 'specs.processor.chip', 'specs.battery.capacitymAh'],
      sourceUrl: 'https://www.samsung.com/tr/support/model/SM-G973FZKDATO/',
      checkedAt: '2026-10-13T22:50:00.000Z',
      scopeNote: 'Samsung TR resmi SM-G973F/DS teknik özellikleri: 6.1 inç Quad HD+ Dynamic AMOLED, Exynos 9820 ve 3400 mAh batarya teyit edilmiştir.'
    }
  ],
  'samsung-samsung-galaxy-s10-15': [
    {
      fields: ['specs.screen.size', 'specs.processor.chip', 'specs.battery.capacitymAh'],
      sourceUrl: 'https://www.samsung.com/tr/support/model/SM-G975FZKDATO/',
      checkedAt: '2026-10-13T22:50:00.000Z',
      scopeNote: 'Samsung TR resmi SM-G975F/DS teknik özellikleri: 6.4 inç Quad HD+ Dynamic AMOLED, Exynos 9820 ve 4100 mAh batarya teyit edilmiştir.'
    }
  ],
  'samsung-samsung-galaxy-s25-107': [
    {
      fields: ['specs.screen.size', 'specs.screen.refreshRate', 'specs.connectivity.has5G', 'specs.build.waterResistance', 'specs.battery.capacitymAh'],
      sourceUrl: 'https://www.samsung.com/tr/smartphones/galaxy-s25/specs/',
      checkedAt: '2026-10-14T02:00:00.000Z',
      scopeNote: 'Samsung TR resmi SM-S931B/DS teknik özellikleri: 6.2 inç FHD+ Dynamic AMOLED 2X 120Hz ekran, IP68 suya dayanıklılık, 4000 mAh batarya ve 5G desteği doğrulanmıştır.'
    }
  ],
  'huawei-huawei-pura-70-pro': [
    {
      fields: ['specs.screen.size', 'specs.battery.capacitymAh', 'specs.battery.chargingWatts'],
      sourceUrl: 'https://consumer.huawei.com/tr/phones/pura70-pro/specs/',
      checkedAt: '2026-10-14T02:00:00.000Z',
      scopeNote: 'Huawei Türkiye resmi Pura 70 Pro teknik özellikleri: 6.8 inç LTPO OLED ekran, 5050 mAh batarya ve 100W SuperCharge doğrulanmıştır.'
    }
  ],
  'huawei-huawei-y5ii': [
    {
      fields: ['specs.screen.size', 'specs.battery.capacitymAh'],
      sourceUrl: 'https://consumer.huawei.com/tr/support/phones/y5-2/',
      checkedAt: '2026-10-14T02:00:00.000Z',
      scopeNote: 'Huawei resmi tüketici arşiv özellikleri: 5.0 inç HD IPS ekran ve 2200 mAh lityum polimer batarya doğrulanmıştır.'
    }
  ],
  'apple-ipad-pro-13-m5-wi-fi-plus-cellular-nano-texture-cam-16-gb-2048-gb': [
    {
      fields: ['specs.processor', 'specs.screenSizeInches', 'specs.storageGb'],
      sourceUrl: 'https://www.apple.com/tr/newsroom/2025/10/apple-unveils-groundbreaking-new-ipad-pro-with-m5-chip/',
      checkedAt: '2026-10-15T20:00:00.000Z',
      scopeNote: 'Apple Türkiye resmi M5 iPad Pro teknik özellikleri (15 Ekim 2025): Apple M5 çip, 13 inç Ultra Retina Tandem OLED ekran ve 2048 GB depolama teyit edilmiştir.'
    }
  ],
  'apple-apple-iphone-17-pro-max-256-gb-1023353': [
    {
      fields: [
        'specs.screen.size', 'specs.screen.refreshRate', 'specs.processor.chip', 'specs.processor.cores',
        'specs.memory.storageGb', 'specs.camera.mainMp', 'specs.camera.ultrawideMp', 'specs.camera.telephotoMp',
        'specs.camera.selfieMp', 'specs.camera.videoRes', 'specs.battery.wirelessCharging', 'specs.battery.wirelessWatts',
        'specs.connectivity.has5G', 'specs.connectivity.wifiStandard', 'specs.build.waterResistance', 'specs.screen.brightnessNits'
      ],
      sourceUrl: 'https://support.apple.com/tr-tr/125091',
      checkedAt: '2026-10-15T20:00:00.000Z',
      scopeNote: 'Apple Türkiye resmi teknik belgesi (Doküman 125091, 9 Eylül 2025 lansmanı). 6.9 inç 120Hz ProMotion OLED, A19 Pro, 48MP kamera sistemi, 18MP selfie, 4K120fps video, MagSafe, Wi-Fi 7, 5G ve IP68 doğrulanmıştır.'
    }
  ],
  'apple-apple-iphone-17-pro-max-512-gb-1027078': [
    {
      fields: [
        'specs.screen.size', 'specs.screen.refreshRate', 'specs.processor.chip', 'specs.memory.storageGb',
        'specs.connectivity.has5G', 'specs.build.waterResistance', 'specs.screen.brightnessNits'
      ],
      sourceUrl: 'https://support.apple.com/tr-tr/125091',
      checkedAt: '2026-10-15T20:00:00.000Z',
      scopeNote: 'Apple Türkiye resmi teknik belgesi (Doküman 125091, 9 Eylül 2025 lansmanı). 6.9 inç 120Hz ekran, A19 Pro çip, 512GB depolama, 5G ve IP68 doğrulanmıştır.'
    }
  ],
  'apple-apple-iphone-17-pro-max-1-tb-1027079': [
    {
      fields: [
        'specs.screen.size', 'specs.screen.refreshRate', 'specs.processor.chip', 'specs.memory.storageGb',
        'specs.connectivity.has5G', 'specs.build.waterResistance', 'specs.screen.brightnessNits'
      ],
      sourceUrl: 'https://support.apple.com/tr-tr/125091',
      checkedAt: '2026-10-15T20:00:00.000Z',
      scopeNote: 'Apple Türkiye resmi teknik belgesi (Doküman 125091, 9 Eylül 2025 lansmanı). 6.9 inç 120Hz ekran, A19 Pro çip, 1024GB (1TB) depolama, 5G ve IP68 doğrulanmıştır.'
    }
  ],
  'apple-apple-iphone-17-pro-max-2-tb-1027080': [
    {
      fields: [
        'specs.screen.size', 'specs.screen.refreshRate', 'specs.processor.chip', 'specs.memory.storageGb',
        'specs.connectivity.has5G', 'specs.build.waterResistance', 'specs.screen.brightnessNits'
      ],
      sourceUrl: 'https://support.apple.com/tr-tr/125091',
      checkedAt: '2026-10-15T20:00:00.000Z',
      scopeNote: 'Apple Türkiye resmi teknik belgesi (Doküman 125091, 9 Eylül 2025 lansmanı). 6.9 inç 120Hz ekran, A19 Pro çip, 2048GB (2TB) depolama, 5G ve IP68 doğrulanmıştır.'
    }
  ]
};

export function getStagingPilotSources(productId?: string): StagingSourceEntry[] {
  if (!productId || typeof productId !== 'string') return [];
  const trimmed = productId.trim().toLowerCase();
  return STAGING_PILOT_SOURCES[trimmed] || [];
}
