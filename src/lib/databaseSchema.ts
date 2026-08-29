/**
 * aceleEtme Enterprise Canonical Database Schema Blueprint & Data Normalization Engine
 * 3NF Normalized Relational Architecture (PostgreSQL / Prisma / Drizzle Compatible)
 */

export interface NormalizedBrand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  websiteUrl?: string;
}

export interface NormalizedCategory {
  id: string;
  name: string;
  slug: string;
  specSchemaKeys: string[];
}

export interface NormalizedStore {
  id: string;
  name: string;
  slug: string;
  domain: string;
  logoColor: string;
  affiliateCode?: string;
  reliabilityScore: number; // 0.0 - 5.0
  isActive: boolean;
}

export interface CanonicalSmartphoneSpecs {
  // Screen
  screenSizeInches: number;
  panelType: 'OLED' | 'AMOLED' | 'Super AMOLED' | 'IPS LCD' | 'LTPO OLED' | 'MicroLED';
  resolutionWidth: number;
  resolutionHeight: number;
  refreshRateHz: number;
  pixelDensityPpi: number;
  peakBrightnessNits: number;
  hdrSupport: boolean;

  // Processor & Performance
  chipsetName: string;
  processorBrand: 'Apple' | 'Qualcomm' | 'MediaTek' | 'Exynos' | 'Google Tensor' | 'Unisoc';
  cpuCores: number;
  manufacturingProcessNm: number;
  antutuScoreV10: number;

  // Memory & Storage
  ramGb: number;
  ramType: 'LPDDR4X' | 'LPDDR5' | 'LPDDR5X';
  storageGb: number;
  storageType: 'UFS 2.2' | 'UFS 3.1' | 'UFS 4.0' | 'NVMe';
  expandableStorage: boolean;

  // Battery & Charging
  batteryCapacitymAh: number;
  chargingWatts: number;
  wirelessChargingWatts?: number;
  reverseWirelessCharging: boolean;

  // Cameras
  mainCameraMp: number;
  ultrawideCameraMp?: number;
  telephotoCameraMp?: number;
  opticalZoomX?: number;
  selfieCameraMp: number;
  maxVideoResolution: '4K @ 60fps' | '4K @ 30fps' | '8K @ 24fps' | '1080p @ 60fps';
  dxomarkScore?: number;

  // Connectivity & Body
  has5G: boolean;
  wifiVersion: string;
  bluetoothVersion: string;
  hasNFC: boolean;
  hasesim: boolean;
  weightGrams: number;
  thicknessMm: number;
  ipRating: 'IP68' | 'IP67' | 'IP54' | 'Yok';
  frameMaterial: 'Alüminyum' | 'Titanyum' | 'Plastik' | 'Cam';
  osName: 'iOS' | 'Android';
  osVersion: string;
}

export interface CanonicalProduct {
  id: string;
  sku: string;
  slug: string;
  name: string;
  brandId: string;
  categoryId: string;
  releaseYear: number;
  basePrice: number;
  currency: 'TRY' | 'USD' | 'EUR';
  rating: number;
  reviewCount: number;
  isPopular: boolean;
  isFeatured: boolean;
  mainImage: string;
  galleryImages: string[];
  specs: CanonicalSmartphoneSpecs;
  createdAt: string;
  updatedAt: string;
}

export interface CanonicalStoreOffer {
  id: string;
  productId: string;
  storeId: string;
  storeName: string;
  price: number;
  currency: string;
  inStock: boolean;
  shippingDays: number;
  freeShipping: boolean;
  sellerRating: number;
  affiliateUrl: string;
  isBrokenLink: boolean;
  lastCheckedAt: string;
}

export interface CanonicalPriceHistoryTick {
  id: string;
  productId: string;
  storeId: string;
  price: number;
  timestamp: string;
}

/**
 * Data Normalization Helper Functions
 * Standardizes raw string entries into canonical numbers/enums
 */
export class DataNormalizer {
  static parseRamGb(raw: string | number): number {
    if (typeof raw === 'number') return raw;
    const match = raw.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 8;
  }

  static parseStorageGb(raw: string | number): number {
    if (typeof raw === 'number') return raw;
    if (raw.toLowerCase().includes('tb')) {
      const match = raw.match(/(\d+)/);
      return match ? parseInt(match[1], 10) * 1024 : 1024;
    }
    const match = raw.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 128;
  }

  static parseBatterymAh(raw: string | number): number {
    if (typeof raw === 'number') return raw;
    const match = raw.match(/(\d{4,5})/);
    return match ? parseInt(match[1], 10) : 5000;
  }

  static sanitizeSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}
