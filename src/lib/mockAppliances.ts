import { ApplianceProduct } from './types';

export const mockAppliances: ApplianceProduct[] = [
  // ==================== ROBOT SÜPÜRGELER ====================
  {
    id: 'dreame-l20-ultra',
    slug: 'dreame-l20-ultra',
    name: 'Dreame L20 Ultra Robot Süpürge & Paspas',
    brand: 'Dreame',
    category: 'appliances',
    subCategory: 'robot_vacuum',
    basePrice: 35999,
    currency: 'TL',
    rating: 4.8,
    reviewCount: 640,
    releaseYear: 2024,
    isPopular: true,
    isFeatured: false,
    highlights: [
      '7000 Pa Vormax Emiş Gücü & MopExtend Kenar Temizliği',
      'Tam Otomatik Temizleme İstasyonu (Otomatik Su Ekleme ve Tahliye Uyumlu)',
      'Pathfinder Akıllı Navigasyon ve 3D Yapay Zekâ Engel Tanıma',
      'Döner Paspas Sistemi ve Otomatik Paspas Çıkarma / Yükseltme'
    ],
    image: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=800&auto=format&fit=crop&q=80'],
    storeOffers: [
      {
        id: 'st-hb-app-3',
        storeName: 'Hepsiburada',
        storeLogoColor: 'bg-orange-600',
        price: 35499,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Distribütör'],
        sellerRating: 4.9,
        sellerReviews: 11000,
        url: 'https://www.hepsiburada.com/'
      },
      {
        id: 'st-ty-app-3',
        storeName: 'Trendyol',
        storeLogoColor: 'bg-amber-600',
        price: 35799,
        inStock: true,
        shippingDays: 1,
        badges: ['Fırsat Ürünü'],
        sellerRating: 4.8,
        sellerReviews: 14000,
        url: 'https://www.trendyol.com/'
      },
      {
        id: 'st-vt-app-3',
        storeName: 'Vatan Bilgisayar',
        storeLogoColor: 'bg-blue-800',
        price: 35999,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Garanti'],
        sellerRating: 4.9,
        sellerReviews: 9500,
        url: 'https://www.vatanbilgisayar.com/'
      },
      {
        id: 'st-mm-app-3',
        storeName: 'MediaMarkt',
        storeLogoColor: 'bg-red-600',
        price: 36499,
        inStock: true,
        shippingDays: 1,
        badges: ['Mağazadan Teslim'],
        sellerRating: 4.8,
        sellerReviews: 7600,
        url: 'https://www.mediamarkt.com.tr/'
      }
    ],
    priceHistory: [
      { date: 'Ekim 2025', price: 39999, store: 'Dreame TR' },
      { date: 'Aralık 2025', price: 37999, store: 'Hepsiburada' },
      { date: 'Şubat 2026', price: 36499, store: 'Trendyol' },
      { date: 'Mart 2026', price: 35999, store: 'Vatan Bilgisayar' }
    ],
    specs: {
      subCategory: 'robot_vacuum',
      subCategoryLabel: 'Robot Süpürge',
      powerWatts: 75,
      suctionPowerPa: 7000,
      batteryRuntimeMin: 260,
      noiseLevelDb: 65,
      capacity: '300 ml toz, 4.5 L temiz su',
      autoCleanDock: true,
      appControl: true,
      programsCount: 4,
      weightKg: 4.3,
      warrantyYears: 2,
      color: 'Beyaz'
    }
  },
  {
    id: 'xiaomi-robot-vacuum-x20-plus',
    slug: 'xiaomi-robot-vacuum-x20-plus',
    name: 'Xiaomi Robot Vacuum X20+ Akıllı Süpürge',
    brand: 'Xiaomi',
    category: 'appliances',
    subCategory: 'robot_vacuum',
    basePrice: 19999,
    currency: 'TL',
    rating: 4.7,
    reviewCount: 1850,
    releaseYear: 2024,
    isPopular: true,
    isFeatured: true,
    highlights: [
      '6000 Pa Güçlü Emiş & Akıllı Döner Paspas Sistemi',
      'Hepsi Bir Arada Akıllı İstasyon (Otomatik Toz Boşaltma ve Paspas Yıkama)',
      'LDS Lazer Navigasyon & Milimetrik Hassas Engelden Kaçınma',
      'Mi Home / Xiaomi Home ve Google Assistant Entegrasyonu'
    ],
    image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&auto=format&fit=crop&q=80'],
    storeOffers: [
      {
        id: 'st-hb-app-4',
        storeName: 'Hepsiburada',
        storeLogoColor: 'bg-orange-600',
        price: 19499,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Distribütör', 'Hızlı Teslimat'],
        sellerRating: 4.9,
        sellerReviews: 22000,
        url: 'https://www.hepsiburada.com/'
      },
      {
        id: 'st-ty-app-4',
        storeName: 'Trendyol',
        storeLogoColor: 'bg-amber-600',
        price: 19799,
        inStock: true,
        shippingDays: 1,
        badges: ['Kuponlu Ürün'],
        sellerRating: 4.8,
        sellerReviews: 31000,
        url: 'https://www.trendyol.com/'
      },
      {
        id: 'st-vt-app-4',
        storeName: 'Vatan Bilgisayar',
        storeLogoColor: 'bg-blue-800',
        price: 19999,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Garanti'],
        sellerRating: 4.9,
        sellerReviews: 14500,
        url: 'https://www.vatanbilgisayar.com/'
      },
      {
        id: 'st-mm-app-4',
        storeName: 'MediaMarkt',
        storeLogoColor: 'bg-red-600',
        price: 20499,
        inStock: true,
        shippingDays: 1,
        badges: ['Mağazadan Teslim'],
        sellerRating: 4.8,
        sellerReviews: 12000,
        url: 'https://www.mediamarkt.com.tr/'
      }
    ],
    priceHistory: [
      { date: 'Ekim 2025', price: 22999, store: 'Xiaomi TR' },
      { date: 'Aralık 2025', price: 21499, store: 'Hepsiburada' },
      { date: 'Şubat 2026', price: 20499, store: 'Trendyol' },
      { date: 'Mart 2026', price: 19999, store: 'Vatan Bilgisayar' }
    ],
    specs: {
      subCategory: 'robot_vacuum',
      subCategoryLabel: 'Robot Süpürge',
      powerWatts: 55,
      suctionPowerPa: 6000,
      batteryRuntimeMin: 140,
      noiseLevelDb: 65,
      capacity: '350 ml toz, 4 L temiz su haznesi',
      autoCleanDock: true,
      appControl: true,
      programsCount: 4,
      weightKg: 3.8,
      warrantyYears: 2,
      color: 'Beyaz'
    }
  },
  {
    id: 'dyson-360-vis-nav',
    slug: 'dyson-360-vis-nav',
    name: 'Dyson 360 Vis Nav Akıllı Robot Süpürge',
    brand: 'Dyson',
    category: 'appliances',
    subCategory: 'robot_vacuum',
    basePrice: 49999,
    currency: 'TL',
    rating: 4.9,
    reviewCount: 310,
    releaseYear: 2024,
    isPopular: true,
    isFeatured: true,
    highlights: [
      '110.000 rpm Dyson Hyperdymium Motor ile 2 Kat Emiş Gücü',
      '360° Balıkgözü Kamera ve SLAM Görsel Navigasyon',
      'Gövde Boyunda Fırça Çubuğu & Otomatik Açılan Kenar Kanalı',
      'Akıllı Piezo Sensör ile Toz Yoğunluğuna Göre Otomatik Güç Artışı'
    ],
    image: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=800&auto=format&fit=crop&q=80'],
    storeOffers: [
      {
        id: 'st-hb-app-5',
        storeName: 'Hepsiburada',
        storeLogoColor: 'bg-orange-600',
        price: 49499,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Distribütör'],
        sellerRating: 4.9,
        sellerReviews: 9500,
        url: 'https://www.hepsiburada.com/'
      },
      {
        id: 'st-ty-app-5',
        storeName: 'Trendyol',
        storeLogoColor: 'bg-amber-600',
        price: 49850,
        inStock: true,
        shippingDays: 1,
        badges: ['Fırsat Ürünü'],
        sellerRating: 4.8,
        sellerReviews: 12000,
        url: 'https://www.trendyol.com/'
      },
      {
        id: 'st-vt-app-5',
        storeName: 'Vatan Bilgisayar',
        storeLogoColor: 'bg-blue-800',
        price: 49999,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Garanti'],
        sellerRating: 4.9,
        sellerReviews: 8200,
        url: 'https://www.vatanbilgisayar.com/'
      },
      {
        id: 'st-mm-app-5',
        storeName: 'MediaMarkt',
        storeLogoColor: 'bg-red-600',
        price: 50499,
        inStock: true,
        shippingDays: 1,
        badges: ['Mağazadan Teslim'],
        sellerRating: 4.8,
        sellerReviews: 6900,
        url: 'https://www.mediamarkt.com.tr/'
      }
    ],
    priceHistory: [
      { date: 'Ekim 2025', price: 54999, store: 'Dyson TR' },
      { date: 'Aralık 2025', price: 52499, store: 'Hepsiburada' },
      { date: 'Şubat 2026', price: 50499, store: 'Trendyol' },
      { date: 'Mart 2026', price: 49999, store: 'Vatan Bilgisayar' }
    ],
    specs: {
      subCategory: 'robot_vacuum',
      subCategoryLabel: 'Robot Süpürge',
      powerWatts: 65,
      suctionPowerPa: 8000,
      batteryRuntimeMin: 65,
      noiseLevelDb: 74,
      capacity: '500 ml toz haznesi',
      autoCleanDock: false,
      appControl: true,
      programsCount: 4,
      weightKg: 4.5,
      warrantyYears: 2,
      color: 'Mavi / Nikel'
    }
  },

  // ==================== DİKEY ŞARJLI SÜPÜRGELER ====================
  {
    id: 'dyson-v15-detect-absolute',
    slug: 'dyson-v15-detect-absolute',
    name: 'Dyson V15 Detect Absolute Şarjlı Dikey Süpürge',
    brand: 'Dyson',
    category: 'appliances',
    subCategory: 'stick_vacuum',
    basePrice: 29999,
    currency: 'TL',
    rating: 4.9,
    reviewCount: 3250,
    releaseYear: 2024,
    isPopular: true,
    isFeatured: true,
    highlights: [
      '240 AW Güçlü Emiş & Fluffy Optic™ Lazer Aydınlatmalı Başlık',
      'Akıllı Piezo Sensör: Toz Sayımı ve Emiş Gücünü Otomatik Ayarlama',
      'LCD Ekranda Gerçek Zamanlı Toz Raporu ve Kalan Çalışma Süresi',
      '60 Dakikaya Kadar Kesintisiz Güç ve Değiştirilebilir Batarya'
    ],
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80'],
    storeOffers: [
      {
        id: 'st-hb-app-6',
        storeName: 'Hepsiburada',
        storeLogoColor: 'bg-orange-600',
        price: 29499,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Distribütör', 'Hızlı Teslimat'],
        sellerRating: 4.9,
        sellerReviews: 28000,
        url: 'https://www.hepsiburada.com/'
      },
      {
        id: 'st-ty-app-6',
        storeName: 'Trendyol',
        storeLogoColor: 'bg-amber-600',
        price: 29799,
        inStock: true,
        shippingDays: 1,
        badges: ['Kuponlu Ürün'],
        sellerRating: 4.8,
        sellerReviews: 35000,
        url: 'https://www.trendyol.com/'
      },
      {
        id: 'st-vt-app-6',
        storeName: 'Vatan Bilgisayar',
        storeLogoColor: 'bg-blue-800',
        price: 29999,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Garanti'],
        sellerRating: 4.9,
        sellerReviews: 19000,
        url: 'https://www.vatanbilgisayar.com/'
      },
      {
        id: 'st-mm-app-6',
        storeName: 'MediaMarkt',
        storeLogoColor: 'bg-red-600',
        price: 30499,
        inStock: true,
        shippingDays: 1,
        badges: ['Mağazadan Teslim'],
        sellerRating: 4.8,
        sellerReviews: 14000,
        url: 'https://www.mediamarkt.com.tr/'
      }
    ],
    priceHistory: [
      { date: 'Ekim 2025', price: 33999, store: 'Dyson TR' },
      { date: 'Aralık 2025', price: 31999, store: 'Hepsiburada' },
      { date: 'Şubat 2026', price: 30499, store: 'Trendyol' },
      { date: 'Mart 2026', price: 29999, store: 'Vatan Bilgisayar' }
    ],
    specs: {
      subCategory: 'stick_vacuum',
      subCategoryLabel: 'Dikey Şarjlı Süpürge',
      powerWatts: 660,
      suctionPowerPa: 24000,
      batteryRuntimeMin: 60,
      noiseLevelDb: 76,
      capacity: '0.77 L toz haznesi',
      weightKg: 3.0,
      warrantyYears: 2,
      color: 'Sarı / Demir'
    }
  },
  {
    id: 'dyson-gen5detect-absolute',
    slug: 'dyson-gen5detect-absolute',
    name: 'Dyson Gen5detect Absolute Kablosuz Dikey Süpürge',
    brand: 'Dyson',
    category: 'appliances',
    subCategory: 'stick_vacuum',
    basePrice: 38999,
    currency: 'TL',
    rating: 4.9,
    reviewCount: 1120,
    releaseYear: 2024,
    isPopular: true,
    isFeatured: true,
    highlights: [
      '280 AW ile Dyson’ın En Güçlü Kablosuz Emiş Performansı',
      'Tüm Makinede HEPA Filtrasyon: 0.1 Mikrona Kadar Virüsleri Yakalar',
      'Dahili Toz ve Aralık Temizleme Başlığı (Teleskopik Boru İçi)',
      '70 Dakikaya Kadar Kesintisiz Çalışma Süresi'
    ],
    image: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=800&auto=format&fit=crop&q=80'],
    storeOffers: [
      {
        id: 'st-hb-app-7',
        storeName: 'Hepsiburada',
        storeLogoColor: 'bg-orange-600',
        price: 38499,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Distribütör'],
        sellerRating: 4.9,
        sellerReviews: 15000,
        url: 'https://www.hepsiburada.com/'
      },
      {
        id: 'st-ty-app-7',
        storeName: 'Trendyol',
        storeLogoColor: 'bg-amber-600',
        price: 38799,
        inStock: true,
        shippingDays: 1,
        badges: ['Fırsat Ürünü'],
        sellerRating: 4.8,
        sellerReviews: 18000,
        url: 'https://www.trendyol.com/'
      },
      {
        id: 'st-vt-app-7',
        storeName: 'Vatan Bilgisayar',
        storeLogoColor: 'bg-blue-800',
        price: 38999,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Garanti'],
        sellerRating: 4.9,
        sellerReviews: 9800,
        url: 'https://www.vatanbilgisayar.com/'
      },
      {
        id: 'st-mm-app-7',
        storeName: 'MediaMarkt',
        storeLogoColor: 'bg-red-600',
        price: 39499,
        inStock: true,
        shippingDays: 1,
        badges: ['Mağazadan Teslim'],
        sellerRating: 4.8,
        sellerReviews: 8200,
        url: 'https://www.mediamarkt.com.tr/'
      }
    ],
    priceHistory: [
      { date: 'Ekim 2025', price: 42999, store: 'Dyson TR' },
      { date: 'Aralık 2025', price: 40999, store: 'Hepsiburada' },
      { date: 'Şubat 2026', price: 39499, store: 'Trendyol' },
      { date: 'Mart 2026', price: 38999, store: 'Vatan Bilgisayar' }
    ],
    specs: {
      subCategory: 'stick_vacuum',
      subCategoryLabel: 'Dikey Şarjlı Süpürge',
      powerWatts: 752,
      suctionPowerPa: 28000,
      batteryRuntimeMin: 70,
      noiseLevelDb: 77,
      capacity: '0.77 L toz haznesi',
      weightKg: 3.5,
      warrantyYears: 2,
      color: 'Mor / Demir'
    }
  },
  {
    id: 'philips-aquatrio-9000-xc9049',
    slug: 'philips-aquatrio-9000-xc9049',
    name: 'Philips AquaTrio 9000 3ü 1 Arada Islak ve Kuru Süpürge',
    brand: 'Philips',
    category: 'appliances',
    subCategory: 'stick_vacuum',
    basePrice: 26999,
    currency: 'TL',
    rating: 4.7,
    reviewCount: 890,
    releaseYear: 2024,
    isPopular: true,
    isFeatured: false,
    highlights: [
      '3’ü 1 Arada: Islak Silme, Kuru Süpürme ve El Süpürgesi',
      'AquaSpin Başlık ile İki Yönlü Eş Zamanlı Süpürme ve Paspas',
      'Patentli Kendi Kendini Temizleyen Çift Güçlü Fırça',
      'Temiz ve Kirli Su Ayrımı ile Daima Temiz Suyla Yıkama'
    ],
    image: 'https://images.philips.com/is/image/philipsconsumer/55pus8108_12-ims-tr?wid=960',
    images: ['https://images.philips.com/is/image/philipsconsumer/55pus8108_12-ims-tr?wid=960'],
    storeOffers: [
      {
        id: 'st-hb-app-8',
        storeName: 'Hepsiburada',
        storeLogoColor: 'bg-orange-600',
        price: 26499,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Distribütör'],
        sellerRating: 4.9,
        sellerReviews: 14000,
        url: 'https://www.hepsiburada.com/'
      },
      {
        id: 'st-ty-app-8',
        storeName: 'Trendyol',
        storeLogoColor: 'bg-amber-600',
        price: 26799,
        inStock: true,
        shippingDays: 1,
        badges: ['Fırsat Ürünü'],
        sellerRating: 4.8,
        sellerReviews: 17500,
        url: 'https://www.trendyol.com/'
      },
      {
        id: 'st-vt-app-8',
        storeName: 'Vatan Bilgisayar',
        storeLogoColor: 'bg-blue-800',
        price: 26999,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Garanti'],
        sellerRating: 4.9,
        sellerReviews: 9200,
        url: 'https://www.vatanbilgisayar.com/'
      },
      {
        id: 'st-mm-app-8',
        storeName: 'MediaMarkt',
        storeLogoColor: 'bg-red-600',
        price: 27499,
        inStock: true,
        shippingDays: 1,
        badges: ['Mağazadan Teslim'],
        sellerRating: 4.8,
        sellerReviews: 8100,
        url: 'https://www.mediamarkt.com.tr/'
      }
    ],
    priceHistory: [
      { date: 'Ekim 2025', price: 29999, store: 'Philips TR' },
      { date: 'Aralık 2025', price: 28499, store: 'Hepsiburada' },
      { date: 'Şubat 2026', price: 27499, store: 'Trendyol' },
      { date: 'Mart 2026', price: 26999, store: 'Vatan Bilgisayar' }
    ],
    specs: {
      subCategory: 'stick_vacuum',
      subCategoryLabel: 'Dikey Şarjlı Süpürge',
      powerWatts: 500,
      batteryRuntimeMin: 45,
      noiseLevelDb: 80,
      capacity: '450 ml temiz su, 400 ml kirli su haznesi',
      weightKg: 4.2,
      warrantyYears: 2,
      color: 'Koyu Gri / Mavi'
    }
  },

  // ==================== AIRFRYER & FRİTÖZLER ====================
  {
    id: 'philips-airfryer-xxl-smart-sensing-hd9867',
    slug: 'philips-airfryer-xxl-smart-sensing-hd9867',
    name: 'Philips Airfryer XXL Smart Sensing (HD9867/90)',
    brand: 'Philips',
    category: 'appliances',
    subCategory: 'airfryer',
    basePrice: 12999,
    currency: 'TL',
    rating: 4.9,
    reviewCount: 4890,
    releaseYear: 2024,
    isPopular: true,
    isFeatured: true,
    highlights: [
      'Smart Sensing Teknolojisi: Pişirme Süresi ve Sıcaklığı Otomatik Ayarlar',
      'Fat Removal Teknolojisi ile %90’a Kadar Daha Az Yağlı Çıtır Lezzetler',
      '7.3 Litre / 1.4 kg XXL Kapasite (Bütün Tavuk & 6 Porsiyon)',
      'Rapid Air Çift Yönlü Hava Akımı ve Sıcak Tutma Fonksiyonu'
    ],
    image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80'],
    storeOffers: [
      {
        id: 'st-hb-app-9',
        storeName: 'Hepsiburada',
        storeLogoColor: 'bg-orange-600',
        price: 12699,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Distribütör', 'Hızlı Teslimat'],
        sellerRating: 4.9,
        sellerReviews: 45000,
        url: 'https://www.hepsiburada.com/'
      },
      {
        id: 'st-ty-app-9',
        storeName: 'Trendyol',
        storeLogoColor: 'bg-amber-600',
        price: 12850,
        inStock: true,
        shippingDays: 1,
        badges: ['Çok Satan'],
        sellerRating: 4.8,
        sellerReviews: 62000,
        url: 'https://www.trendyol.com/'
      },
      {
        id: 'st-vt-app-9',
        storeName: 'Vatan Bilgisayar',
        storeLogoColor: 'bg-blue-800',
        price: 12999,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Garanti'],
        sellerRating: 4.9,
        sellerReviews: 18000,
        url: 'https://www.vatanbilgisayar.com/'
      },
      {
        id: 'st-mm-app-9',
        storeName: 'MediaMarkt',
        storeLogoColor: 'bg-red-600',
        price: 13299,
        inStock: true,
        shippingDays: 1,
        badges: ['Mağazadan Teslim'],
        sellerRating: 4.8,
        sellerReviews: 16000,
        url: 'https://www.mediamarkt.com.tr/'
      }
    ],
    priceHistory: [
      { date: 'Ekim 2025', price: 14999, store: 'Philips TR' },
      { date: 'Aralık 2025', price: 13799, store: 'Hepsiburada' },
      { date: 'Şubat 2026', price: 13299, store: 'Trendyol' },
      { date: 'Mart 2026', price: 12999, store: 'Vatan Bilgisayar' }
    ],
    specs: {
      subCategory: 'airfryer',
      subCategoryLabel: 'Airfryer / Sıcak Hava Fritözü',
      powerWatts: 2225,
      capacity: '7.3 Litre (1.4 kg)',
      programsCount: 5,
      appControl: true,
      material: 'BPA-Free Plastik & Çelik',
      weightKg: 7.99,
      warrantyYears: 2,
      color: 'Siyah / Bakır Detay'
    }
  },
  {
    id: 'cosori-dual-blaze-6-4l',
    slug: 'cosori-dual-blaze-6-4l',
    name: 'Cosori Dual Blaze 6.4L Çift Isıtıcılı Akıllı Airfryer',
    brand: 'Cosori',
    category: 'appliances',
    subCategory: 'airfryer',
    basePrice: 7999,
    currency: 'TL',
    rating: 4.8,
    reviewCount: 3100,
    releaseYear: 2024,
    isPopular: true,
    isFeatured: true,
    highlights: [
      '360 ThermoIQ Çift Isıtıcı ile Yiyecekleri Çevirmeye Gerek Yok',
      '6.4 Litre Geniş Kare Sepet Kapasitesi',
      'VeSync Mobil Uygulama ile Wi-Fi Uzaktan Kontrol ve Tarifler',
      '12 Özelleştirilebilir Pişirme Programı ve Bulaşık Makinesinde Yıkanabilir'
    ],
    image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80'],
    storeOffers: [
      {
        id: 'st-hb-app-10',
        storeName: 'Hepsiburada',
        storeLogoColor: 'bg-orange-600',
        price: 7799,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Distribütör'],
        sellerRating: 4.9,
        sellerReviews: 21000,
        url: 'https://www.hepsiburada.com/'
      },
      {
        id: 'st-ty-app-10',
        storeName: 'Trendyol',
        storeLogoColor: 'bg-amber-600',
        price: 7899,
        inStock: true,
        shippingDays: 1,
        badges: ['Fırsat Ürünü'],
        sellerRating: 4.8,
        sellerReviews: 29000,
        url: 'https://www.trendyol.com/'
      },
      {
        id: 'st-vt-app-10',
        storeName: 'Vatan Bilgisayar',
        storeLogoColor: 'bg-blue-800',
        price: 7999,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Garanti'],
        sellerRating: 4.9,
        sellerReviews: 8900,
        url: 'https://www.vatanbilgisayar.com/'
      },
      {
        id: 'st-mm-app-10',
        storeName: 'MediaMarkt',
        storeLogoColor: 'bg-red-600',
        price: 8299,
        inStock: true,
        shippingDays: 1,
        badges: ['Mağazadan Teslim'],
        sellerRating: 4.8,
        sellerReviews: 7400,
        url: 'https://www.mediamarkt.com.tr/'
      }
    ],
    priceHistory: [
      { date: 'Ekim 2025', price: 9499, store: 'Cosori TR' },
      { date: 'Aralık 2025', price: 8599, store: 'Hepsiburada' },
      { date: 'Şubat 2026', price: 8299, store: 'Trendyol' },
      { date: 'Mart 2026', price: 7999, store: 'Vatan Bilgisayar' }
    ],
    specs: {
      subCategory: 'airfryer',
      subCategoryLabel: 'Airfryer / Sıcak Hava Fritözü',
      powerWatts: 1750,
      capacity: '6.4 Litre',
      programsCount: 12,
      appControl: true,
      material: 'Alüminyum & Yapışmaz Seramik',
      weightKg: 6.22,
      warrantyYears: 2,
      color: 'Koyu Gri / Mat Siyah'
    }
  },
  {
    id: 'tefal-dual-easy-fry-and-grill',
    slug: 'tefal-dual-easy-fry-and-grill',
    name: 'Tefal Dual Easy Fry & Grill Çift Hazneli Sıcak Hava Fritözü',
    brand: 'Tefal',
    category: 'appliances',
    subCategory: 'airfryer',
    basePrice: 8499,
    currency: 'TL',
    rating: 4.7,
    reviewCount: 1250,
    releaseYear: 2024,
    isPopular: true,
    isFeatured: false,
    highlights: [
      'İki Farklı Yemeği Aynı Anda Pişiren 8.3L Çift Hazne (5.2L + 3.1L)',
      'SYNC Senkronize Pişirme ile Her İki Yemeği Aynı Anda Sıcak Servis Eder',
      'Döküm Alüminyum Izgara Plakası ile Dumansız Izgara Deneyimi',
      '8 Otomatik Program & %70 Enerji Tasarrufu'
    ],
    image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80'],
    storeOffers: [
      {
        id: 'st-hb-app-11',
        storeName: 'Hepsiburada',
        storeLogoColor: 'bg-orange-600',
        price: 8299,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Distribütör'],
        sellerRating: 4.9,
        sellerReviews: 18000,
        url: 'https://www.hepsiburada.com/'
      },
      {
        id: 'st-ty-app-11',
        storeName: 'Trendyol',
        storeLogoColor: 'bg-amber-600',
        price: 8399,
        inStock: true,
        shippingDays: 1,
        badges: ['Fırsat Ürünü'],
        sellerRating: 4.8,
        sellerReviews: 22000,
        url: 'https://www.trendyol.com/'
      },
      {
        id: 'st-vt-app-11',
        storeName: 'Vatan Bilgisayar',
        storeLogoColor: 'bg-blue-800',
        price: 8499,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Garanti'],
        sellerRating: 4.9,
        sellerReviews: 10500,
        url: 'https://www.vatanbilgisayar.com/'
      },
      {
        id: 'st-mm-app-11',
        storeName: 'MediaMarkt',
        storeLogoColor: 'bg-red-600',
        price: 8799,
        inStock: true,
        shippingDays: 1,
        badges: ['Mağazadan Teslim'],
        sellerRating: 4.8,
        sellerReviews: 8900,
        url: 'https://www.mediamarkt.com.tr/'
      }
    ],
    priceHistory: [
      { date: 'Ekim 2025', price: 9999, store: 'Tefal TR' },
      { date: 'Aralık 2025', price: 8999, store: 'Hepsiburada' },
      { date: 'Şubat 2026', price: 8699, store: 'Trendyol' },
      { date: 'Mart 2026', price: 8499, store: 'Vatan Bilgisayar' }
    ],
    specs: {
      subCategory: 'airfryer',
      subCategoryLabel: 'Airfryer / Sıcak Hava Fritözü',
      powerWatts: 2700,
      capacity: '8.3 Litre (5.2L + 3.1L)',
      programsCount: 8,
      appControl: false,
      material: 'Paslanmaz Çelik & Döküm Izgara',
      weightKg: 7.8,
      warrantyYears: 2,
      color: 'Inox Paslanmaz Çelik'
    }
  },

  // ==================== KAHVE MAKİNELERİ ====================
  {
    id: 'delonghi-magnifica-s-ecam22110b',
    slug: 'delonghi-magnifica-s-ecam22110b',
    name: 'DeLonghi Magnifica S Tam Otomatik Çekirdekten Kahve Makinesi',
    brand: 'DeLonghi',
    category: 'appliances',
    subCategory: 'coffee_machine',
    basePrice: 16999,
    currency: 'TL',
    rating: 4.9,
    reviewCount: 2900,
    releaseYear: 2024,
    isPopular: true,
    isFeatured: true,
    highlights: [
      '15 Bar Pompa Basıncı & 13 Kademeli Çelik Konik Öğütücü',
      'Manuel Cappuccino Sistemi ile Kremsi ve Yoğun Süt Köpüğü',
      'Tek Tuşla Espresso & Long Coffee Hazırlama',
      'Çıkarılabilir Demleme Ünitesi ile Kolay ve Hijyenik Temizlik'
    ],
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80'],
    storeOffers: [
      {
        id: 'st-hb-app-12',
        storeName: 'Hepsiburada',
        storeLogoColor: 'bg-orange-600',
        price: 16499,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Distribütör', 'Hızlı Teslimat'],
        sellerRating: 4.9,
        sellerReviews: 31000,
        url: 'https://www.hepsiburada.com/'
      },
      {
        id: 'st-ty-app-12',
        storeName: 'Trendyol',
        storeLogoColor: 'bg-amber-600',
        price: 16750,
        inStock: true,
        shippingDays: 1,
        badges: ['Çok Satan'],
        sellerRating: 4.8,
        sellerReviews: 38000,
        url: 'https://www.trendyol.com/'
      },
      {
        id: 'st-vt-app-12',
        storeName: 'Vatan Bilgisayar',
        storeLogoColor: 'bg-blue-800',
        price: 16999,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Garanti'],
        sellerRating: 4.9,
        sellerReviews: 12000,
        url: 'https://www.vatanbilgisayar.com/'
      },
      {
        id: 'st-mm-app-12',
        storeName: 'MediaMarkt',
        storeLogoColor: 'bg-red-600',
        price: 17399,
        inStock: true,
        shippingDays: 1,
        badges: ['Mağazadan Teslim'],
        sellerRating: 4.8,
        sellerReviews: 10500,
        url: 'https://www.mediamarkt.com.tr/'
      }
    ],
    priceHistory: [
      { date: 'Ekim 2025', price: 18999, store: 'DeLonghi TR' },
      { date: 'Aralık 2025', price: 17499, store: 'Hepsiburada' },
      { date: 'Şubat 2026', price: 17199, store: 'Trendyol' },
      { date: 'Mart 2026', price: 16999, store: 'Vatan Bilgisayar' }
    ],
    specs: {
      subCategory: 'coffee_machine',
      subCategoryLabel: 'Tam Otomatik Kahve Makinesi',
      powerWatts: 1450,
      pressureBar: 15,
      capacity: '1.8 Litre su, 250 g çekirdek haznesi',
      programsCount: 4,
      material: 'Paslanmaz Çelik & Termoblok',
      weightKg: 9.0,
      warrantyYears: 2,
      color: 'Siyah'
    }
  },
  {
    id: 'philips-lattego-5400-ep5447',
    slug: 'philips-lattego-5400-ep5447',
    name: 'Philips LatteGo 5400 Serisi Tam Otomatik Espresso Makinesi',
    brand: 'Philips',
    category: 'appliances',
    subCategory: 'coffee_machine',
    basePrice: 24999,
    currency: 'TL',
    rating: 4.9,
    reviewCount: 1650,
    releaseYear: 2024,
    isPopular: true,
    isFeatured: true,
    highlights: [
      '12 Farklı Kahve Çeşidi: Tek Dokunuşla Latte Macchiato, Flat White, Espresso',
      'LatteGo Süt Sistemi: Borusuz Yapısıyla Sadece 15 Saniyede Temizlenir',
      'Renkli TFT Dokunmatik Ekran & 4 Kullanıcı Profili',
      '100% Seramik Öğütücüler ile 20.000 Fincana Kadar Dayanıklılık'
    ],
    image: 'https://images.philips.com/is/image/philipsconsumer/55oled808_12-ims-tr?wid=960',
    images: ['https://images.philips.com/is/image/philipsconsumer/55oled808_12-ims-tr?wid=960'],
    storeOffers: [
      {
        id: 'st-hb-app-13',
        storeName: 'Hepsiburada',
        storeLogoColor: 'bg-orange-600',
        price: 24499,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Distribütör', 'Hızlı Teslimat'],
        sellerRating: 4.9,
        sellerReviews: 24000,
        url: 'https://www.hepsiburada.com/'
      },
      {
        id: 'st-ty-app-13',
        storeName: 'Trendyol',
        storeLogoColor: 'bg-amber-600',
        price: 24799,
        inStock: true,
        shippingDays: 1,
        badges: ['Fırsat Ürünü'],
        sellerRating: 4.8,
        sellerReviews: 31000,
        url: 'https://www.trendyol.com/'
      },
      {
        id: 'st-vt-app-13',
        storeName: 'Vatan Bilgisayar',
        storeLogoColor: 'bg-blue-800',
        price: 24999,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Garanti'],
        sellerRating: 4.9,
        sellerReviews: 13000,
        url: 'https://www.vatanbilgisayar.com/'
      },
      {
        id: 'st-mm-app-13',
        storeName: 'MediaMarkt',
        storeLogoColor: 'bg-red-600',
        price: 25499,
        inStock: true,
        shippingDays: 1,
        badges: ['Mağazadan Teslim'],
        sellerRating: 4.8,
        sellerReviews: 11000,
        url: 'https://www.mediamarkt.com.tr/'
      }
    ],
    priceHistory: [
      { date: 'Ekim 2025', price: 27999, store: 'Philips TR' },
      { date: 'Aralık 2025', price: 25999, store: 'Hepsiburada' },
      { date: 'Şubat 2026', price: 25299, store: 'Trendyol' },
      { date: 'Mart 2026', price: 24999, store: 'Vatan Bilgisayar' }
    ],
    specs: {
      subCategory: 'coffee_machine',
      subCategoryLabel: 'Tam Otomatik Kahve Makinesi',
      powerWatts: 1500,
      pressureBar: 15,
      capacity: '1.8 Litre su, 275 g çekirdek, 0.26 L LatteGo süt',
      programsCount: 12,
      material: 'Krom Kaplama & Seramik Değirmen',
      weightKg: 8.0,
      warrantyYears: 2,
      color: 'Piano Siyah / Krom'
    }
  },
  {
    id: 'arzum-okka-grandio-duo',
    slug: 'arzum-okka-grandio-duo',
    name: 'Arzum OKKA Grandio Duo Dokunmatik Türk Kahvesi Makinesi',
    brand: 'Arzum',
    category: 'appliances',
    subCategory: 'coffee_machine',
    basePrice: 7499,
    currency: 'TL',
    rating: 4.8,
    reviewCount: 920,
    releaseYear: 2024,
    isPopular: true,
    isFeatured: false,
    highlights: [
      'Aynı Anda 10 Fincana Kadar Bol Köpüklü Türk Kahvesi',
      'Közde Pişirme Teknolojisi ile Geleneksel Ağır Pişirme Lezzeti',
      'Akıllı Su Teknolojisi: Fincan Boyutunu Seçin, Suyu Otomatik Alsın',
      'Taşma Önleyici Akıllı Pişirme Sensörü & Dokunmatik Panel'
    ],
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80'],
    storeOffers: [
      {
        id: 'st-hb-app-14',
        storeName: 'Hepsiburada',
        storeLogoColor: 'bg-orange-600',
        price: 7299,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Distribütör'],
        sellerRating: 4.9,
        sellerReviews: 12000,
        url: 'https://www.hepsiburada.com/'
      },
      {
        id: 'st-ty-app-14',
        storeName: 'Trendyol',
        storeLogoColor: 'bg-amber-600',
        price: 7399,
        inStock: true,
        shippingDays: 1,
        badges: ['Kuponlu Ürün'],
        sellerRating: 4.8,
        sellerReviews: 16000,
        url: 'https://www.trendyol.com/'
      },
      {
        id: 'st-vt-app-14',
        storeName: 'Vatan Bilgisayar',
        storeLogoColor: 'bg-blue-800',
        price: 7499,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Garanti'],
        sellerRating: 4.9,
        sellerReviews: 7500,
        url: 'https://www.vatanbilgisayar.com/'
      },
      {
        id: 'st-mm-app-14',
        storeName: 'MediaMarkt',
        storeLogoColor: 'bg-red-600',
        price: 7799,
        inStock: true,
        shippingDays: 1,
        badges: ['Mağazadan Teslim'],
        sellerRating: 4.8,
        sellerReviews: 6800,
        url: 'https://www.mediamarkt.com.tr/'
      }
    ],
    priceHistory: [
      { date: 'Ekim 2025', price: 8499, store: 'Arzum TR' },
      { date: 'Aralık 2025', price: 7899, store: 'Hepsiburada' },
      { date: 'Şubat 2026', price: 7599, store: 'Trendyol' },
      { date: 'Mart 2026', price: 7499, store: 'Vatan Bilgisayar' }
    ],
    specs: {
      subCategory: 'coffee_machine',
      subCategoryLabel: 'Türk Kahvesi Makinesi',
      powerWatts: 1400,
      capacity: '10 Fincan (2.3 Litre su tankı)',
      programsCount: 3,
      material: 'Paslanmaz Çelik & Dokunmatik Cam Panel',
      weightKg: 4.1,
      warrantyYears: 3,
      color: 'Krom / Bakır / Siyah'
    }
  },

  // ==================== MUTFAK ŞEFLERİ & BLENDER ====================
  {
    id: 'kitchenaid-artisan-4-8l',
    slug: 'kitchenaid-artisan-4-8l',
    name: 'KitchenAid Artisan 4.8L Stand Mikser & Mutfak Şefi',
    brand: 'KitchenAid',
    category: 'appliances',
    subCategory: 'blender',
    basePrice: 28999,
    currency: 'TL',
    rating: 4.9,
    reviewCount: 880,
    releaseYear: 2024,
    isPopular: true,
    isFeatured: true,
    highlights: [
      'Tamamen Döküm Metal Gövde & İkonik Zamansız Tasarım',
      'Orijinal Gezegensel Dönme Hareketi ile Kusursuz Karıştırma',
      '4.8 Litre ve 3 Litre İkili Paslanmaz Çelik Kase',
      'Hamur Çengeli, Düz Çırpıcı ve Tel Çırpıcı Dahil'
    ],
    image: 'https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?w=800&auto=format&fit=crop&q=80'],
    storeOffers: [
      {
        id: 'st-hb-app-15',
        storeName: 'Hepsiburada',
        storeLogoColor: 'bg-orange-600',
        price: 28499,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Distribütör'],
        sellerRating: 4.9,
        sellerReviews: 9200,
        url: 'https://www.hepsiburada.com/'
      },
      {
        id: 'st-ty-app-15',
        storeName: 'Trendyol',
        storeLogoColor: 'bg-amber-600',
        price: 28799,
        inStock: true,
        shippingDays: 1,
        badges: ['Fırsat Ürünü'],
        sellerRating: 4.8,
        sellerReviews: 11000,
        url: 'https://www.trendyol.com/'
      },
      {
        id: 'st-vt-app-15',
        storeName: 'Vatan Bilgisayar',
        storeLogoColor: 'bg-blue-800',
        price: 28999,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Garanti'],
        sellerRating: 4.9,
        sellerReviews: 6500,
        url: 'https://www.vatanbilgisayar.com/'
      },
      {
        id: 'st-mm-app-15',
        storeName: 'MediaMarkt',
        storeLogoColor: 'bg-red-600',
        price: 29499,
        inStock: true,
        shippingDays: 1,
        badges: ['Mağazadan Teslim'],
        sellerRating: 4.8,
        sellerReviews: 5400,
        url: 'https://www.mediamarkt.com.tr/'
      }
    ],
    priceHistory: [
      { date: 'Ekim 2025', price: 31999, store: 'KitchenAid TR' },
      { date: 'Aralık 2025', price: 29999, store: 'Hepsiburada' },
      { date: 'Şubat 2026', price: 29299, store: 'Trendyol' },
      { date: 'Mart 2026', price: 28999, store: 'Vatan Bilgisayar' }
    ],
    specs: {
      subCategory: 'blender',
      subCategoryLabel: 'Stand Mikser / Mutfak Şefi',
      powerWatts: 300,
      capacity: '4.8 Litre & 3.0 Litre Kase',
      programsCount: 10,
      material: 'Tam Döküm Çinko Metal',
      weightKg: 10.98,
      warrantyYears: 5,
      color: 'Empire Kırmızı / Mat Siyah'
    }
  },
  {
    id: 'nutribullet-pro-900w',
    slug: 'nutribullet-pro-900w',
    name: 'Nutribullet Pro 900W Kişisel Blender ve Smoothie Makinesi',
    brand: 'Nutribullet',
    category: 'appliances',
    subCategory: 'blender',
    basePrice: 3999,
    currency: 'TL',
    rating: 4.8,
    reviewCount: 3890,
    releaseYear: 2024,
    isPopular: true,
    isFeatured: false,
    highlights: [
      '900W Güçlü Motor & Siklonik Bıçak Hareketi',
      'Buz Kırma, Sert Kuruyemiş & Pürüzsüz Smoothie Uzmanı',
      'BPA-Free 900 ml & 700 ml Taşınabilir Seyahat Bardakları',
      'Kolay Temizlenebilir, Saniyeler İçinde Karıştır ve Çık'
    ],
    image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop&q=80'],
    storeOffers: [
      {
        id: 'st-hb-app-16',
        storeName: 'Hepsiburada',
        storeLogoColor: 'bg-orange-600',
        price: 3849,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Distribütör', 'Hızlı Teslimat'],
        sellerRating: 4.9,
        sellerReviews: 32000,
        url: 'https://www.hepsiburada.com/'
      },
      {
        id: 'st-ty-app-16',
        storeName: 'Trendyol',
        storeLogoColor: 'bg-amber-600',
        price: 3899,
        inStock: true,
        shippingDays: 1,
        badges: ['Çok Satan'],
        sellerRating: 4.8,
        sellerReviews: 44000,
        url: 'https://www.trendyol.com/'
      },
      {
        id: 'st-vt-app-16',
        storeName: 'Vatan Bilgisayar',
        storeLogoColor: 'bg-blue-800',
        price: 3999,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Garanti'],
        sellerRating: 4.9,
        sellerReviews: 12000,
        url: 'https://www.vatanbilgisayar.com/'
      },
      {
        id: 'st-mm-app-16',
        storeName: 'MediaMarkt',
        storeLogoColor: 'bg-red-600',
        price: 4199,
        inStock: true,
        shippingDays: 1,
        badges: ['Mağazadan Teslim'],
        sellerRating: 4.8,
        sellerReviews: 9500,
        url: 'https://www.mediamarkt.com.tr/'
      }
    ],
    priceHistory: [
      { date: 'Ekim 2025', price: 4799, store: 'Nutribullet TR' },
      { date: 'Aralık 2025', price: 4299, store: 'Hepsiburada' },
      { date: 'Şubat 2026', price: 4099, store: 'Trendyol' },
      { date: 'Mart 2026', price: 3999, store: 'Vatan Bilgisayar' }
    ],
    specs: {
      subCategory: 'blender',
      subCategoryLabel: 'Smoothie & Kişisel Blender',
      powerWatts: 900,
      capacity: '900 ml ve 700 ml Bardak',
      programsCount: 1,
      material: 'Paslanmaz Çelik Bıçak & Tritan Bardak',
      weightKg: 2.7,
      warrantyYears: 2,
      color: 'Şampanya / Gümüş'
    }
  },

  // ==================== BUHARLI & KAZANLI ÜTÜLER ====================
  {
    id: 'philips-perfectcare-elite-plus-gc9682',
    slug: 'philips-perfectcare-elite-plus-gc9682',
    name: 'Philips PerfectCare Elite Plus Akıllı Kazanlı Ütü',
    brand: 'Philips',
    category: 'appliances',
    subCategory: 'iron',
    basePrice: 15999,
    currency: 'TL',
    rating: 4.9,
    reviewCount: 1740,
    releaseYear: 2024,
    isPopular: true,
    isFeatured: true,
    highlights: [
      'OptimalTEMP Teknolojisi: Sıfır Yanık Riski ve Sıcaklık Ayarı Gerektirmez',
      '8 Bar Basınç & 600 g Şok Buhar ile En İnatçı Kırışıklıkları Tek Geçişte Açar',
      'DynamiQ Akıllı Sensör: Ütünün Hareketini Algılayıp Otomatik Buhar Verir',
      'T-ionicGlide Titanyum Taban & Ultra Hafif 800 g Ütü Gövdesi'
    ],
    image: 'https://images.philips.com/is/image/philipsconsumer/55pus8818_12-ims-tr?wid=960',
    images: ['https://images.philips.com/is/image/philipsconsumer/55pus8818_12-ims-tr?wid=960'],
    storeOffers: [
      {
        id: 'st-hb-app-17',
        storeName: 'Hepsiburada',
        storeLogoColor: 'bg-orange-600',
        price: 15599,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Distribütör', 'Hızlı Teslimat'],
        sellerRating: 4.9,
        sellerReviews: 19000,
        url: 'https://www.hepsiburada.com/'
      },
      {
        id: 'st-ty-app-17',
        storeName: 'Trendyol',
        storeLogoColor: 'bg-amber-600',
        price: 15799,
        inStock: true,
        shippingDays: 1,
        badges: ['Fırsat Ürünü'],
        sellerRating: 4.8,
        sellerReviews: 24000,
        url: 'https://www.trendyol.com/'
      },
      {
        id: 'st-vt-app-17',
        storeName: 'Vatan Bilgisayar',
        storeLogoColor: 'bg-blue-800',
        price: 15999,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Garanti'],
        sellerRating: 4.9,
        sellerReviews: 11000,
        url: 'https://www.vatanbilgisayar.com/'
      },
      {
        id: 'st-mm-app-17',
        storeName: 'MediaMarkt',
        storeLogoColor: 'bg-red-600',
        price: 16399,
        inStock: true,
        shippingDays: 1,
        badges: ['Mağazadan Teslim'],
        sellerRating: 4.8,
        sellerReviews: 8900,
        url: 'https://www.mediamarkt.com.tr/'
      }
    ],
    priceHistory: [
      { date: 'Ekim 2025', price: 17999, store: 'Philips TR' },
      { date: 'Aralık 2025', price: 16799, store: 'Hepsiburada' },
      { date: 'Şubat 2026', price: 16299, store: 'Trendyol' },
      { date: 'Mart 2026', price: 15999, store: 'Vatan Bilgisayar' }
    ],
    specs: {
      subCategory: 'iron',
      subCategoryLabel: 'Buhar Kazanlı Ütü',
      powerWatts: 2700,
      pressureBar: 8,
      steamOutputGpm: 600,
      capacity: '1.8 Litre Çıkarılabilir Su Tankı',
      material: 'T-ionicGlide Titanyum Taban',
      weightKg: 5.1,
      warrantyYears: 2,
      color: 'Siyah / Altın Sarısı'
    }
  },
  {
    id: 'tefal-pro-express-ultimate-ii',
    slug: 'tefal-pro-express-ultimate-ii',
    name: 'Tefal Pro Express Ultimate II Yüksek Basınçlı Buhar Kazanlı Ütü',
    brand: 'Tefal',
    category: 'appliances',
    subCategory: 'iron',
    basePrice: 12999,
    currency: 'TL',
    rating: 4.8,
    reviewCount: 950,
    releaseYear: 2024,
    isPopular: true,
    isFeatured: false,
    highlights: [
      '7.7 Bar Yüksek Basınç & 590 g/dk Şok Buhar Gücü',
      'Çıkarılabilir Kireç Avcısı ile Uzun Ömürlü Buhar Performansı',
      'Durilium AirGlide Autoclean Taban ile Zahmetsiz Kayganlık',
      '%100 Güvenli: Tüm Kumaşlarda Yanma Riski Olmadan Ütüleme'
    ],
    image: 'https://images.philips.com/is/image/philipsconsumer/55pus8508_12-ims-tr?wid=960',
    images: ['https://images.philips.com/is/image/philipsconsumer/55pus8508_12-ims-tr?wid=960'],
    storeOffers: [
      {
        id: 'st-hb-app-18',
        storeName: 'Hepsiburada',
        storeLogoColor: 'bg-orange-600',
        price: 12699,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Distribütör'],
        sellerRating: 4.9,
        sellerReviews: 14000,
        url: 'https://www.hepsiburada.com/'
      },
      {
        id: 'st-ty-app-18',
        storeName: 'Trendyol',
        storeLogoColor: 'bg-amber-600',
        price: 12850,
        inStock: true,
        shippingDays: 1,
        badges: ['Fırsat Ürünü'],
        sellerRating: 4.8,
        sellerReviews: 18000,
        url: 'https://www.trendyol.com/'
      },
      {
        id: 'st-vt-app-18',
        storeName: 'Vatan Bilgisayar',
        storeLogoColor: 'bg-blue-800',
        price: 12999,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Garanti'],
        sellerRating: 4.9,
        sellerReviews: 8900,
        url: 'https://www.vatanbilgisayar.com/'
      },
      {
        id: 'st-mm-app-18',
        storeName: 'MediaMarkt',
        storeLogoColor: 'bg-red-600',
        price: 13399,
        inStock: true,
        shippingDays: 1,
        badges: ['Mağazadan Teslim'],
        sellerRating: 4.8,
        sellerReviews: 7200,
        url: 'https://www.mediamarkt.com.tr/'
      }
    ],
    priceHistory: [
      { date: 'Ekim 2025', price: 14499, store: 'Tefal TR' },
      { date: 'Aralık 2025', price: 13499, store: 'Hepsiburada' },
      { date: 'Şubat 2026', price: 13199, store: 'Trendyol' },
      { date: 'Mart 2026', price: 12999, store: 'Vatan Bilgisayar' }
    ],
    specs: {
      subCategory: 'iron',
      subCategoryLabel: 'Buhar Kazanlı Ütü',
      powerWatts: 2700,
      pressureBar: 7.7,
      steamOutputGpm: 590,
      capacity: '1.2 Litre Su Tankı',
      material: 'Durilium AirGlide Autoclean Taban',
      weightKg: 4.8,
      warrantyYears: 2,
      color: 'Mavi / Beyaz'
    }
  },

  // ==================== TOST & ÇAY MAKİNELERİ ====================
  {
    id: 'tefal-optigrill-elite-akilli-izgara',
    slug: 'tefal-optigrill-elite-akilli-izgara',
    name: 'Tefal OptiGrill Elite Akıllı Izgara ve Tost Makinesi',
    brand: 'Tefal',
    category: 'appliances',
    subCategory: 'toaster',
    basePrice: 9999,
    currency: 'TL',
    rating: 4.9,
    reviewCount: 2150,
    releaseYear: 2024,
    isPopular: true,
    isFeatured: true,
    highlights: [
      'Et Kalınlığını ve Porsiyonunu Otomatik Ölçen Akıllı Sensör',
      'Geri Sayımlı Pişirme Asistanı: Az, Orta, Çok Pişmiş Hassas Bildirim',
      'Mühürleme Takviyesi (Searing Boost) ile Restoran Kalitesinde Izgara Çizgileri',
      '12 Otomatik Program: Kırmızı Et, Tavuk, Burger, Balık, Tost, Sebze'
    ],
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80'],
    storeOffers: [
      {
        id: 'st-hb-app-19',
        storeName: 'Hepsiburada',
        storeLogoColor: 'bg-orange-600',
        price: 9799,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Distribütör', 'Hızlı Teslimat'],
        sellerRating: 4.9,
        sellerReviews: 24000,
        url: 'https://www.hepsiburada.com/'
      },
      {
        id: 'st-ty-app-19',
        storeName: 'Trendyol',
        storeLogoColor: 'bg-amber-600',
        price: 9899,
        inStock: true,
        shippingDays: 1,
        badges: ['Çok Satan'],
        sellerRating: 4.8,
        sellerReviews: 32000,
        url: 'https://www.trendyol.com/'
      },
      {
        id: 'st-vt-app-19',
        storeName: 'Vatan Bilgisayar',
        storeLogoColor: 'bg-blue-800',
        price: 9999,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Garanti'],
        sellerRating: 4.9,
        sellerReviews: 11000,
        url: 'https://www.vatanbilgisayar.com/'
      },
      {
        id: 'st-mm-app-19',
        storeName: 'MediaMarkt',
        storeLogoColor: 'bg-red-600',
        price: 10299,
        inStock: true,
        shippingDays: 1,
        badges: ['Mağazadan Teslim'],
        sellerRating: 4.8,
        sellerReviews: 9500,
        url: 'https://www.mediamarkt.com.tr/'
      }
    ],
    priceHistory: [
      { date: 'Ekim 2025', price: 11999, store: 'Tefal TR' },
      { date: 'Aralık 2025', price: 10599, store: 'Hepsiburada' },
      { date: 'Şubat 2026', price: 10199, store: 'Trendyol' },
      { date: 'Mart 2026', price: 9999, store: 'Vatan Bilgisayar' }
    ],
    specs: {
      subCategory: 'toaster',
      subCategoryLabel: 'Elektrikli Izgara & Tost Makinesi',
      powerWatts: 2000,
      capacity: '4-6 Kişilik Geniş Plaka (600 cm²)',
      programsCount: 12,
      material: 'Döküm Alüminyum Yapışmaz Plaka & Paslanmaz Çelik',
      weightKg: 5.2,
      warrantyYears: 2,
      color: 'Inox / Siyah'
    }
  },
  {
    id: 'karaca-caysever-robotea-connect',
    slug: 'karaca-caysever-robotea-connect',
    name: 'Karaca Çaysever Robotea Connect Akıllı Çay Makinesi',
    brand: 'Karaca',
    category: 'appliances',
    subCategory: 'tea_maker',
    basePrice: 5999,
    currency: 'TL',
    rating: 4.8,
    reviewCount: 1420,
    releaseYear: 2024,
    isPopular: true,
    isFeatured: true,
    highlights: [
      'Otomatik Çay Demleme: Suyu Kaynatır, Yaprakları Kendi Demler ve Sesli Bildirir',
      'Distilasyon Tekniği ile Çayın Acılaşmasını Önleyen Tazelik Koruması',
      'Karaca Connect Uygulaması ile Yataktan veya İşten Çayı Hazırlama',
      'Biberon Maması ve Filtre Kahve için Özel Sıcaklık Kademeleri'
    ],
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80'],
    storeOffers: [
      {
        id: 'st-hb-app-20',
        storeName: 'Hepsiburada',
        storeLogoColor: 'bg-orange-600',
        price: 5799,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Distribütör'],
        sellerRating: 4.9,
        sellerReviews: 18000,
        url: 'https://www.hepsiburada.com/'
      },
      {
        id: 'st-ty-app-20',
        storeName: 'Trendyol',
        storeLogoColor: 'bg-amber-600',
        price: 5899,
        inStock: true,
        shippingDays: 1,
        badges: ['Çok Satan'],
        sellerRating: 4.8,
        sellerReviews: 26000,
        url: 'https://www.trendyol.com/'
      },
      {
        id: 'st-vt-app-20',
        storeName: 'Vatan Bilgisayar',
        storeLogoColor: 'bg-blue-800',
        price: 5999,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Garanti'],
        sellerRating: 4.9,
        sellerReviews: 7800,
        url: 'https://www.vatanbilgisayar.com/'
      },
      {
        id: 'st-mm-app-20',
        storeName: 'MediaMarkt',
        storeLogoColor: 'bg-red-600',
        price: 6199,
        inStock: true,
        shippingDays: 1,
        badges: ['Mağazadan Teslim'],
        sellerRating: 4.8,
        sellerReviews: 6900,
        url: 'https://www.mediamarkt.com.tr/'
      }
    ],
    priceHistory: [
      { date: 'Ekim 2025', price: 6999, store: 'Karaca TR' },
      { date: 'Aralık 2025', price: 6399, store: 'Hepsiburada' },
      { date: 'Şubat 2026', price: 6099, store: 'Trendyol' },
      { date: 'Mart 2026', price: 5999, store: 'Vatan Bilgisayar' }
    ],
    specs: {
      subCategory: 'tea_maker',
      subCategoryLabel: 'Otomatik Çay Makinesi & Kettle',
      powerWatts: 2500,
      capacity: '1.5 Litre Su Isıtıcı + 0.8 Litre Cam Demlik',
      programsCount: 4,
      appControl: true,
      material: 'Borosilikat Cam & Paslanmaz Çelik',
      weightKg: 2.8,
      warrantyYears: 2,
      color: 'Siyah / Rose Gold'
    }
  }
];
