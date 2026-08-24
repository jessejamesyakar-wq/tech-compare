import { Product } from './types';

export const mockHeadphones: Product[] = [
  {
    id: 'apple-airpods-pro-2-usbc',
    slug: 'apple-airpods-pro-2-usbc',
    name: 'Apple AirPods Pro (2. Nesil) USB-C MagSafe Şarj Kutulu TWS Kulaklık',
    brand: 'Apple',
    category: 'headphones',
    rating: 4.97,
    reviewCount: 3840,
    basePrice: 11499,
    currency: 'TL',
    releaseYear: 2024,
    isPopular: true,
    isFeatured: true,
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MTJV3?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1694014871985',
    highlights: ['H2 Kulaklık Çipi & Pro Seviye ANC', 'Kişiselleştirilmiş Uzamsal Ses', 'Toza, Tere ve Suya Dayanıklılık (IP54)', '30 Saate Kadar Toplam Dinleme Süresi'],
    specs: {
      formFactor: 'Kulak İçi (TWS)',
      anc: 'Var (Pro Seviye Aktif Gürültü Engelleme)',
      batteryLife: '30 Saat (Kutu ile)',
      bluetoothVersion: '5.3',
      driverSize: 'Apple Özel Yüksek Gezinimli Sürücü',
      frequencyResponse: '20 Hz - 20 kHz',
      weightGrams: 50.8
    },
    storeOffers: [
      { id: 'hb-hp-1', storeName: 'Hepsiburada', storeLogoColor: 'bg-orange-500', price: 11299, inStock: true, shippingDays: 1, badges: ['Resmi Distribütör'], sellerRating: 4.9, sellerReviews: 12400, url: 'https://www.hepsiburada.com' },
      { id: 'ty-hp-1', storeName: 'Trendyol', storeLogoColor: 'bg-amber-600', price: 11399, inStock: true, shippingDays: 1, badges: ['Hızlı Teslimat'], sellerRating: 4.8, sellerReviews: 18900, url: 'https://www.trendyol.com' },
      { id: 'vt-hp-1', storeName: 'Vatan Bilgisayar', storeLogoColor: 'bg-blue-800', price: 11499, inStock: true, shippingDays: 1, badges: ['Apple Yetkili Satıcı'], sellerRating: 4.9, sellerReviews: 5400, url: 'https://www.vatanbilgisayar.com' }
    ],
    priceHistory: [
      { date: '2026-05-01', price: 11999, store: 'Vatan' },
      { date: '2026-06-01', price: 11699, store: 'Vatan' },
      { date: '2026-07-01', price: 11499, store: 'Vatan' }
    ]
  },
  {
    id: 'dyson-ontrac-cnc-copper',
    slug: 'dyson-ontrac-cnc-bakir',
    name: 'Dyson OnTrac™ Aktif Gürültü Engelleyici (ANC) Kablosuz Kulaklık (CNC Bakır)',
    brand: 'Dyson',
    category: 'headphones',
    rating: 4.95,
    epeyScore: 97,
    reviewCount: 42,
    basePrice: 19999,
    currency: 'TL',
    releaseYear: 2024,
    isPopular: true,
    isFeatured: true,
    image: '/images/appliances/dyson-963152.jpg',
    images: ['/images/appliances/dyson-963152.jpg'],
    highlights: [
      'Gelişmiş 8 Mikrofonlu Aktif Gürültü Engelleme (ANC) ile 40dB\'e Kadar Dış Ses Bloklama',
      'ANC Açıkken 55 Saate Varan Olağanüstü Pil Ömrü',
      '6 Hz - 21 kHz Genişletilmiş Frekans Aralığı ve 40 mm Neodimyum Sürücüler',
      'Değiştirilebilir CNC İşlemeli Alüminyum Dış Kapaklar ve Ergonomik Kulak Yastıkları',
      'MyDyson Uygulaması ile Canlı Ses Maruziyeti ve Ekolayzır Takibi'
    ],
    tags: ['Dyson', 'OnTrac', 'ANC', 'Hi-Res Audio', 'Kulak Üstü Kulaklık', '55 Saat Pil'],
    specs: {
      formFactor: 'Kulak Üstü (Over-Ear)',
      anc: 'Var (8 Mikrofonlu Özel ANC, 40dB Sönümleme)',
      batteryLife: '55 Saat (ANC Açıkken)',
      bluetoothVersion: '5.3 (LHDC, AAC, SBC)',
      driverSize: '40 mm 16-ohm Neodimyum',
      frequencyResponse: '6 Hz - 21 kHz',
      weightGrams: 451,
      quickCharge: '10 dk şarj ile 2.5 saat kullanım',
      material: 'Havacılık Sınıfı Alüminyum & CNC İşleme'
    },
    storeOffers: [
      { id: 'dy-hp-1', storeName: 'Dyson TR', storeLogoColor: 'bg-black', price: 19999, inStock: true, shippingDays: 1, badges: ['Resmi Dyson Garantili', 'Ücretsiz Kargo'], sellerRating: 5.0, sellerReviews: 890, url: 'https://www.dyson.com.tr' },
      { id: 'ty-hp-dy-1', storeName: 'Trendyol', storeLogoColor: 'bg-amber-600', price: 20499, inStock: true, shippingDays: 1, badges: ['Hızlı Gönderi'], sellerRating: 4.9, sellerReviews: 320, url: 'https://www.trendyol.com' }
    ],
    priceHistory: [
      { date: '2026-05-01', price: 21999, store: 'Dyson' },
      { date: '2026-06-01', price: 20999, store: 'Dyson' },
      { date: '2026-07-01', price: 19999, store: 'Dyson' }
    ]
  },
  {
    id: 'dyson-ontrac-cnc-aluminum',
    slug: 'dyson-ontrac-cnc-aluminyum',
    name: 'Dyson OnTrac™ ANC Kablosuz Kulak Üstü Kulaklık (CNC Alüminyum / Gümüş)',
    brand: 'Dyson',
    category: 'headphones',
    rating: 4.94,
    epeyScore: 96,
    reviewCount: 36,
    basePrice: 19999,
    currency: 'TL',
    releaseYear: 2024,
    isPopular: true,
    image: '/images/appliances/dyson-963152.jpg',
    images: ['/images/appliances/dyson-963152.jpg'],
    highlights: [
      'Gümüş CNC Alüminyum ve Sarı Kulak Yastığı Tasarımı',
      'ANC ile 55 Saat Kesintisiz Çalma Süresi',
      'Ultra Geniş 6 Hz - 21 kHz Frekans Aralığı',
      'Kristal Netliğinde Görüşmeler İçin Çift Hüzmeleme Mikrofonu',
      'Kafa Bandında Ağırlık Dengeleyici Batarya Mimarisi'
    ],
    tags: ['Dyson', 'OnTrac', 'Alüminyum', 'ANC', 'Gümüş'],
    specs: {
      formFactor: 'Kulak Üstü (Over-Ear)',
      anc: 'Var (8 Mikrofonlu Aktif Gürültü Engelleme)',
      batteryLife: '55 Saat',
      bluetoothVersion: '5.3',
      driverSize: '40 mm',
      frequencyResponse: '6 Hz - 21 kHz',
      weightGrams: 451,
      material: 'CNC Alüminyum'
    },
    storeOffers: [
      { id: 'dy-hp-2', storeName: 'Dyson TR', storeLogoColor: 'bg-black', price: 19999, inStock: true, shippingDays: 1, badges: ['Dyson Türkiye Garantili'], sellerRating: 5.0, sellerReviews: 640, url: 'https://www.dyson.com.tr' }
    ],
    priceHistory: [
      { date: '2026-05-01', price: 21999, store: 'Dyson' },
      { date: '2026-07-01', price: 19999, store: 'Dyson' }
    ]
  },
  {
    id: 'dyson-zone-air-purifying-headphones',
    slug: 'dyson-zone',
    name: 'Dyson Zone™ Kişisel Hava Temizleyicili ANC Kulaklık (Ultra Mavi / Bakır)',
    brand: 'Dyson',
    category: 'headphones',
    rating: 4.88,
    epeyScore: 94,
    reviewCount: 32,
    basePrice: 23999,
    currency: 'TL',
    releaseYear: 2023,
    isPopular: true,
    isFeatured: true,
    image: '/images/appliances/dyson-924840.jpg',
    images: ['/images/appliances/dyson-924840.jpg'],
    highlights: [
      'Manyetik Temassız Vizör ile Burun ve Ağza %99 Saf Arıtılmış Hava Akımı',
      'Elektrostatik İki Kademeli Filtre ile 0.1 Mikron Partikül ve Gaz Temizleme',
      'Gelişmiş Aktif Gürültü Engelleme (ANC) ile 38dB Dış Ses İzolasyonu',
      'Sadece Müzik Modunda 50 Saat, Hava Temizleme Modunda 4 Saate Kadar Pil Ömrü',
      'MyDyson Uygulaması ile Gerçek Zamanlı Hava Kalitesi ve Ses Analizi'
    ],
    tags: ['Dyson', 'Dyson Zone', 'Hava Temizleyici Kulaklık', 'ANC', 'Fütüristik', 'Hi-Fi'],
    specs: {
      formFactor: 'Kulak Üstü (Over-Ear) + Temassız Hava Vizörü',
      anc: 'Var (8 ANC Mikrofonu, 38dB İzolasyon)',
      batteryLife: '50 Saat (Yalnızca Ses) / 4 Saat (Ses + Düşük Hava Akımı)',
      bluetoothVersion: '5.0 (LHDC, AAC, SBC)',
      driverSize: '40 mm 16-ohm Neodimyum',
      frequencyResponse: '6 Hz - 21 kHz',
      weightGrams: 670,
      airPurification: 'Elektrostatik Kömür Filtresi (%99 0.1 Mikron Tutma)'
    },
    storeOffers: [
      { id: 'dy-hp-3', storeName: 'Dyson TR', storeLogoColor: 'bg-black', price: 23999, inStock: true, shippingDays: 1, badges: ['Dyson Resmi Distribütör'], sellerRating: 5.0, sellerReviews: 450, url: 'https://www.dyson.com.tr' },
      { id: 'hb-hp-zone', storeName: 'Hepsiburada', storeLogoColor: 'bg-orange-500', price: 24499, inStock: true, shippingDays: 1, badges: ['Hızlı Kargo'], sellerRating: 4.8, sellerReviews: 190, url: 'https://www.hepsiburada.com' }
    ],
    priceHistory: [
      { date: '2026-05-01', price: 26999, store: 'Dyson' },
      { date: '2026-06-01', price: 24999, store: 'Dyson' },
      { date: '2026-07-01', price: 23999, store: 'Dyson' }
    ]
  },
  {
    id: 'sony-wh-1000xm5-siyah',
    slug: 'sony-wh-1000xm5-siyah',
    name: 'Sony WH-1000XM5 Kablosuz Gürültü Engelleme Özellikli Kulak Üstü Kulaklık',
    brand: 'Sony',
    category: 'headphones',
    rating: 4.95,
    reviewCount: 2150,
    basePrice: 15499,
    currency: 'TL',
    releaseYear: 2024,
    isPopular: true,
    isFeatured: true,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    highlights: ['Sektör Lideri Çift İşlemcili ANC', 'LDAC Yüksek Çözünürlüklü Ses', '30 Saat Pil Ömrü & Hızlı Şarj', 'Ultra Konforlu Hafif Tasarım'],
    specs: {
      formFactor: 'Kulak Üstü (Over-Ear)',
      anc: 'Var (HD Gürültü Engelleme İşlemcisi QN1)',
      batteryLife: '30 Saat',
      bluetoothVersion: '5.2 (LDAC, AAC, SBC)',
      driverSize: '30 mm Karbon Fiber Kompozit',
      frequencyResponse: '4 Hz - 40 kHz',
      weightGrams: 250
    },
    storeOffers: [
      { id: 'hb-hp-2', storeName: 'Hepsiburada', storeLogoColor: 'bg-orange-500', price: 15299, inStock: true, shippingDays: 1, badges: ['Sony Eurasia Garantili'], sellerRating: 4.9, sellerReviews: 6100, url: 'https://www.hepsiburada.com' },
      { id: 'vt-hp-2', storeName: 'Vatan Bilgisayar', storeLogoColor: 'bg-blue-800', price: 15499, inStock: true, shippingDays: 1, badges: ['Mağazadan Teslim'], sellerRating: 4.9, sellerReviews: 2900, url: 'https://www.vatanbilgisayar.com' }
    ],
    priceHistory: [
      { date: '2026-05-01', price: 16499, store: 'Hepsiburada' },
      { date: '2026-06-01', price: 15999, store: 'Hepsiburada' },
      { date: '2026-07-01', price: 15499, store: 'Hepsiburada' }
    ]
  },
  {
    id: 'apple-airpods-max-usbc-2024',
    slug: 'apple-airpods-max-usbc-2024',
    name: 'Apple AirPods Max USB-C Gece Yarısı Kulak Üstü Bluetooth Kulaklık',
    brand: 'Apple',
    category: 'headphones',
    rating: 4.93,
    reviewCount: 980,
    basePrice: 26999,
    currency: 'TL',
    releaseYear: 2024,
    isPopular: true,
    isFeatured: true,
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-max-select-202409-midnight?fmt=jpeg&qlt=95',
    highlights: ['Yüksek Düzey Aktif Gürültü Engelleme', 'Kişiselleştirilmiş Uzamsal Ses', 'USB-C Şarj Desteği', 'Özel Akustik Tasarım'],
    specs: {
      formFactor: 'Kulak Üstü (Over-Ear)',
      anc: 'Var (Apple H1 Çipli Hesaplamalı Ses ANC)',
      batteryLife: '20 Saat',
      bluetoothVersion: '5.0',
      driverSize: '40 mm Dinamik Sürücü',
      frequencyResponse: '20 Hz - 20 kHz',
      weightGrams: 384.8
    },
    storeOffers: [
      { id: 'vt-hp-3', storeName: 'Vatan Bilgisayar', storeLogoColor: 'bg-blue-800', price: 26999, inStock: true, shippingDays: 1, badges: ['Resmi Apple Garantili'], sellerRating: 4.9, sellerReviews: 1450, url: 'https://www.vatanbilgisayar.com' }
    ],
    priceHistory: [
      { date: '2026-05-01', price: 27999, store: 'Vatan' },
      { date: '2026-06-01', price: 26999, store: 'Vatan' }
    ]
  },
  {
    id: 'jbl-tune-520bt-siyah',
    slug: 'jbl-tune-520bt-siyah',
    name: 'JBL Tune 520BT Multi Connect Kablosuz Kulak Üstü Kulaklık',
    brand: 'JBL',
    category: 'headphones',
    rating: 4.88,
    reviewCount: 8900,
    basePrice: 1799,
    currency: 'TL',
    releaseYear: 2024,
    isPopular: true,
    isFeatured: false,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
    highlights: ['JBL Pure Bass Ses Teknolojisi', '57 Saate Kadar Pil Ömrü', 'Bluetooth 5.3 & Çoklu Bağlantı', 'Hafif ve Katlanabilir Tasarım'],
    specs: {
      formFactor: 'Kulak Üstü (On-Ear)',
      anc: 'Yok (Pasif İzolasyon)',
      batteryLife: '57 Saat',
      bluetoothVersion: '5.3',
      driverSize: '33 mm Dinamik Sürücü',
      frequencyResponse: '20 Hz - 20 kHz',
      weightGrams: 157
    },
    storeOffers: [
      { id: 'hb-hp-4', storeName: 'Hepsiburada', storeLogoColor: 'bg-orange-500', price: 1749, inStock: true, shippingDays: 1, badges: ['Fiyat / Performans Şampiyonu'], sellerRating: 4.8, sellerReviews: 32000, url: 'https://www.hepsiburada.com' },
      { id: 'ty-hp-4', storeName: 'Trendyol', storeLogoColor: 'bg-amber-600', price: 1779, inStock: true, shippingDays: 1, badges: ['Çok Satan'], sellerRating: 4.8, sellerReviews: 45000, url: 'https://www.trendyol.com' }
    ],
    priceHistory: [
      { date: '2026-05-01', price: 1999, store: 'Trendyol' },
      { date: '2026-06-01', price: 1849, store: 'Trendyol' },
      { date: '2026-07-01', price: 1799, store: 'Trendyol' }
    ]
  },
  {
    id: 'samsung-galaxy-buds-3-pro',
    slug: 'samsung-galaxy-buds-3-pro',
    name: 'Samsung Galaxy Buds 3 Pro ANC Kablosuz Kulaklık',
    brand: 'Samsung',
    category: 'headphones',
    rating: 4.91,
    reviewCount: 1450,
    basePrice: 6999,
    currency: 'TL',
    releaseYear: 2025,
    isPopular: true,
    isFeatured: true,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
    highlights: ['Galaxy AI Akıllı Gürültü Kontrolü', '2 Yollu Hoparlör (Hi-Fi Ses)', 'Blade Lights Tasarım', '30 Saat Toplam Kullanım'],
    specs: {
      formFactor: 'Kulak İçi (TWS)',
      anc: 'Var (Akıllı Adaptif ANC & Ambiyans)',
      batteryLife: '30 Saat (Kutu ile)',
      bluetoothVersion: '5.4 (SSC, AAC, SBC)',
      driverSize: '2 Yollu (Dinamik Woofer + Düzlemsel Tweeter)',
      frequencyResponse: '20 Hz - 40 kHz (24-bit/96kHz)',
      weightGrams: 46.5
    },
    storeOffers: [
      { id: 'hb-hp-5', storeName: 'Hepsiburada', storeLogoColor: 'bg-orange-500', price: 6799, inStock: true, shippingDays: 1, badges: ['Samsung Türkiye Garantili'], sellerRating: 4.9, sellerReviews: 4300, url: 'https://www.hepsiburada.com' }
    ],
    priceHistory: [
      { date: '2026-05-01', price: 7499, store: 'Samsung' },
      { date: '2026-06-01', price: 6999, store: 'Samsung' }
    ]
  },
  {
    id: 'marshall-major-iv-bluetooth',
    slug: 'marshall-major-iv-bluetooth',
    name: 'Marshall Major IV Kablosuz Kulak Üstü Kulaklık Siyah',
    brand: 'Marshall',
    category: 'headphones',
    rating: 4.92,
    reviewCount: 3100,
    basePrice: 5499,
    currency: 'TL',
    releaseYear: 2024,
    isPopular: true,
    isFeatured: false,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
    highlights: ['80+ Saat Kablosuz Çalma Süresi', 'İkonik Marshall Vintage Tasarımı', 'Kablosuz Şarj Desteği', 'Çok Yönlü Kontrol Düğmesi'],
    specs: {
      formFactor: 'Kulak Üstü (On-Ear)',
      anc: 'Yok (Pasif İzolasyon)',
      batteryLife: '80+ Saat',
      bluetoothVersion: '5.0',
      driverSize: '40 mm Özel Ayarlanmış Sürücüler',
      frequencyResponse: '20 Hz - 20 kHz',
      weightGrams: 165
    },
    storeOffers: [
      { id: 'ty-hp-6', storeName: 'Trendyol', storeLogoColor: 'bg-amber-600', price: 5399, inStock: true, shippingDays: 1, badges: ['Resmi İthalatçı'], sellerRating: 4.9, sellerReviews: 7600, url: 'https://www.trendyol.com' }
    ],
    priceHistory: [
      { date: '2026-05-01', price: 5899, store: 'Trendyol' },
      { date: '2026-06-01', price: 5499, store: 'Trendyol' }
    ]
  }
];
