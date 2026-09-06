export type Language = 'tr' | 'en' | 'de' | 'ru' | 'es' | 'it' | string;

export interface PriceAlert {
  id: string;
  productId: string;
  productName?: string;
  productImage?: string;
  currentPrice: number;
  targetPrice: number;
  email: string;
  createdAt: string;
  active?: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  colorName?: string;
  colorHex?: string;
  image: string;
  images?: string[];
  price?: number;
  priceOffset?: number;
  inStock?: boolean;
  sku?: string;
}

export interface BaseProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: 'smartphones' | 'tvs' | 'laptops' | 'tablets' | 'smartwatches' | 'headphones' | 'consoles' | 'appliances' | 'monitors';
  image: string;
  images?: string[];
  rating: number;
  aceleEtmeScore?: number;
  epeyScore?: number;
  reviewCount: number;
  basePrice: number;
  currency: 'TL';
  releaseYear: number;
  isLatestModel?: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
  barcode?: string;
  ean?: string;
  gtin?: string;
  sku?: string;
  model?: string;
  highlights: string[];
  tags?: string[];
  storeOffers: StoreOffer[];
  priceHistory: PriceHistoryPoint[];
  colorOptions?: { name: string; hex: string }[];
  variants?: ProductVariant[];
}

export interface ApplianceSpecs {
  masterCategory?: string;
  masterCategoryLabel?: string;
  subCategory: 'robot_vacuum' | 'stick_vacuum' | 'personal_care' | 'cosmetics' | 'air_purifier' | 'airfryer' | 'coffee_machine' | 'blender' | 'iron' | 'tea_maker' | 'toaster' | string;
  subCategoryLabel: string;
  powerWatts?: number;
  capacity?: string;
  capacityLiters?: number;
  suctionPowerPa?: number;
  batteryRuntimeMin?: number;
  chargeTimeHours?: number;
  quickChargeMin?: number;
  wetDryUsage?: boolean;
  bladeMaterial?: string;
  dishwasherSafeParts?: boolean;
  batteryCapacityMah?: number;
  noiseLevelDb?: number;
  autoCleanDock?: boolean;
  autoEmptyStation?: boolean;
  mappingTechnology?: string;
  appControl?: boolean;
  keepWarmHours?: number;
  programsCount?: number;
  ionicConditioning?: boolean;
  coldShot?: boolean;
  batteryLifeMinutes?: number;
  chargingTimeHours?: number;
  wetAndDry?: boolean;
  pressureBar?: number;
  steamOutputGpm?: number;
  steamOutputGramsPerMin?: number;
  steamBoostGramsPerMin?: number;
  waterTankCapacityLiters?: number;
  continuousSteam?: boolean;
  autoShutOff?: boolean;
  antiCalcSystem?: boolean;
  material?: string;
  weightKg?: number;
  speedSettings?: number;
  turboFunction?: boolean;
  warrantyYears?: number;
  brand?: string;
  model?: string;
  color?: string;
  volumeLiters?: number;
  capacityKg?: number;
  energyClass?: string;
  energyClassCooling?: string;
  energyClassHeating?: string;
  spinSpeedRpm?: number;
  quickWashMin?: number;
  placeSettings?: number;
  programCount?: number;
  drawerCount?: number;
  btuCapacity?: number;
  gasType?: string;
  motorType?: string;
  noiseDb?: number;
  noFrost?: boolean;
  coolingType?: string;
  refrigeratorType?: string;
  freezerType?: string;
  dryingType?: string;
  inverter?: boolean;
  inverterMotor?: boolean;
  steamFunction?: boolean;
  smartConnect?: boolean;
  autoDoorOpen?: boolean;
  autoDry?: boolean;
  waterConsumptionLiters?: number;
  [key: string]: unknown;
}

export interface ApplianceProduct extends BaseProduct {
  category: 'appliances';
  specs: ApplianceSpecs;
  subCategory?: string;
  subCategoryLabel?: string;
  minPrice?: number;
  maxPrice?: number;
  storeCount?: number;
  inStock?: boolean;
  pros?: string[];
  cons?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SmartphoneSpecs {
  screen: {
    size: string;
    type: string;
    resolution: string;
    refreshRate: number;
    ppi?: number;
    brightnessNits?: number;
  };
  processor: {
    chip: string;
    cores: string;
    process?: string;
    antutuScore?: number;
  };
  memory: {
    ramGb: number;
    ramType?: string;
    storageGb: number;
    storageOptions?: number[];
    expandableStorage?: boolean;
  };
  camera: {
    mainMp: string;
    ultrawideMp?: string;
    telephotoMp?: string;
    selfieMp: string;
    videoRes: string;
    dxomarkScore?: number;
  };
  battery: {
    capacitymAh: number;
    chargingWatts?: number;
    wirelessCharging?: boolean;
    reverseWireless?: boolean;
  };
  connectivity: {
    has5G: boolean;
    wifiStandard?: string;
    bluetooth?: string;
    hasNFC?: boolean;
    hasesim?: boolean;
  };
  build: {
    weightGrams?: number;
    thicknessMm?: number;
    waterResistance?: string;
    frameMaterial?: string;
  };
  software: {
    osName: string;
    updateYears?: number;
  };
}

export interface Smartphone extends BaseProduct {
  category: 'smartphones';
  specs: SmartphoneSpecs;
}

export interface TVSpecs {
  screenSizeInches: number;
  displayTech: 'OLED' | 'OLED+' | 'OLED EX' | 'OLED evo' | 'QD-OLED' | 'QLED' | 'Mini-LED' | 'QD-Mini LED' | 'LED' | 'Micro-LED' | 'Neo QLED' | 'Neo QLED 8K' | '8K QLED' | 'Curved QLED' | 'Curved UHD' | 'Crystal UHD' | 'UHD LCD' | 'Micro RGB' | string;
  resolution: '4K Ultra HD' | '8K Ultra HD' | 'Full HD' | string;
  refreshRateHz: number;
  smartOs: 'Google TV' | 'webOS' | 'Tizen' | 'Android TV' | 'Vidaa' | 'Titan OS' | string;
  audioPowerWatts: number;
  hdrSupport?: string[];
  hdrFormats?: string[];
  gamingFeatures?: string[];
  hdmiPorts?: number;
  usbPorts?: number;
  energyClass?: string;
  // Expanded exhaustive specifications
  processorEngine?: string;
  brightnessNits?: number;
  contrastRatio?: string;
  viewingAngle?: string;
  colorGamut?: string;
  localDimmingZones?: number;
  inputLagMs?: number;
  vrrSupport?: boolean;
  allmSupport?: boolean;
  hdmiVersion?: string;
  audioChannels?: string;
  dolbyAtmos?: boolean;
  dtsX?: boolean;
  voiceControl?: string;
  wifiVersion?: string;
  bluetoothVersion?: string;
  appleAirplay?: boolean;
  chromecastBuiltIn?: boolean;
  dimensionsWithStand?: string;
  weightKg?: number;
  vesaMount?: string;
  bezelStyle?: string;
}

export interface TVProduct extends BaseProduct {
  category: 'tvs';
  specs: TVSpecs;
  ssIndexRatio?: number;
  bundlePromotions?: string[];
}

export interface LaptopSpecs {
  productType: string;
  processor: string;
  processorCores?: string;
  npuTops?: number;
  ramGb: number;
  ramType?: string;
  maxRamGb?: number;
  storageGb: number;
  storageType?: string;
  storageSlots?: string;
  gpu: string;
  gpuTgpWatts?: number;
  muxSwitch?: boolean;
  screenSizeInches: number;
  screenResolution?: string;
  screenBrightnessNits?: number;
  colorGamut?: string;
  batteryCapacityWh?: number;
  batteryLifeHours?: number;
  chargerWatts?: number;
  wifiStandard?: string;
  bluetooth?: string;
  ports?: string[];
  weightKg?: number;
  thicknessMm?: number;
  bodyMaterial?: string;
  keyboard?: string;
  webcam?: string;
  audio?: string;
  os?: string;
}

export interface LaptopProduct extends BaseProduct {
  category: 'laptops';
  specs: LaptopSpecs;
  productType: 'Laptop' | 'Gaming Laptop' | 'Masaüstü Bilgisayar' | 'Laptop+Çanta' | 'Tablet' | string;
  isSponsored?: boolean;
  isWebExclusive?: boolean;
}

export interface GenericProduct extends BaseProduct {
  category: 'tablets' | 'smartwatches' | 'headphones' | 'consoles' | 'monitors';
  specs?: Record<string, unknown>;
}

export type Product = Smartphone | TVProduct | LaptopProduct | ApplianceProduct | GenericProduct;

export interface StoreOffer {
  id?: string;
  storeName: string;
  storeLogo?: string;
  storeLogoColor?: string;
  price: number;
  subsidyPrice?: number;
  bundlePromotion?: string;
  inStock: boolean;
  shippingDays?: number;
  badges?: string[];
  sellerRating?: number;
  sellerReviews?: number;
  merchantRating?: number;
  rating?: number;
  reviewCount?: number;
  shippingFee?: number;
  freeShipping?: boolean;
  warrantyType?: string;
  sellerName?: string;
  isOfficialSeller?: boolean;
  affiliateUrl?: string;
  url?: string;
  updatedAt?: string;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
  store?: string;
}

export interface FilterOptions {
  category?: 'smartphones' | 'tvs';
  brand?: string[];
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  has5GOnly?: boolean;
  only5G?: boolean;
  minRamGb?: number;
  minRam?: number;
  minStorageGb?: number;
  minStorage?: number;
  minBattery?: number;
  minBatteryMah?: number;
  minAntutu?: number;
  minAntutuScore?: number;
  sortBy?: 'popular' | 'priceAsc' | 'priceDesc' | 'antutu' | 'rating' | 'releaseYear';
}
