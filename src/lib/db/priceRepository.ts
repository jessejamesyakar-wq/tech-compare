import { supabase } from '@/lib/supabase/client';
import { getStoredProducts } from '@/lib/adminData';

export interface DbStore {
  id: string;
  name: string;
  slug: string;
  domain: string;
  logoUrl?: string;
  enabled: boolean;
  supportsApi: boolean;
  reliabilityScore: number;
}

export interface DbProduct {
  id: string;
  name: string;
  brand: string;
  model?: string;
  categoryId: string;
  barcode?: string;
  ean?: string;
  gtin?: string;
  sku?: string;
  description?: string;
  imageUrl?: string;
  priority: 'HIGH_PRIORITY' | 'NORMAL' | 'LOW_PRIORITY';
  createdAt?: string;
  updatedAt?: string;
}

export interface DbStoreProduct {
  id: string;
  productId: string;
  storeId: string;
  storeProductId: string;
  storeSku?: string;
  barcode?: string;
  url: string;
  title: string;
  imageUrl?: string;
  matchConfidence: number;
  matchStatus: 'MATCHED' | 'MATCH_REVIEW_REQUIRED' | 'REJECTED';
  active: boolean;
  lastCheckedAt?: string;
}

export interface DbPrice {
  id: string;
  productId: string;
  storeId: string;
  storeProductId: string;
  price: number;
  shippingPrice?: number | null;
  totalPrice: number;
  currency: string;
  stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK' | 'UNKNOWN' | 'PREORDER';
  sellerName: string;
  url: string;
  isAnomaly: boolean;
  checkedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DbPriceHistory {
  id?: number;
  productId: string;
  storeId: string;
  storeProductId?: string;
  oldPrice?: number;
  price: number;
  shippingPrice?: number | null;
  totalPrice: number;
  difference: number;
  percentageDifference: number;
  stockStatus: string;
  recordedAt: string;
}

export interface DbPriceUpdateJob {
  id: string;
  productId: string;
  storeId?: string;
  priority: 'HIGH_PRIORITY' | 'NORMAL' | 'LOW_PRIORITY';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'RETRYING';
  attempts: number;
  maxAttempts: number;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

// In-Memory Fallback Cache for Local Dev and Fast SSR
const inMemoryStores: Map<string, DbStore> = new Map([
  ['amazon', { id: 'amazon', name: 'Amazon TR', slug: 'amazon', domain: 'amazon.com.tr', enabled: true, supportsApi: true, reliabilityScore: 4.9 }],
  ['trendyol', { id: 'trendyol', name: 'Trendyol', slug: 'trendyol', domain: 'trendyol.com', enabled: true, supportsApi: true, reliabilityScore: 4.8 }],
  ['hepsiburada', { id: 'hepsiburada', name: 'Hepsiburada', slug: 'hepsiburada', domain: 'hepsiburada.com', enabled: true, supportsApi: true, reliabilityScore: 4.8 }],
  ['n11', { id: 'n11', name: 'n11', slug: 'n11', domain: 'n11.com', enabled: true, supportsApi: true, reliabilityScore: 4.6 }],
  ['pttavm', { id: 'pttavm', name: 'PttAVM', slug: 'pttavm', domain: 'pttavm.com', enabled: true, supportsApi: true, reliabilityScore: 4.4 }],
  ['mediamarkt', { id: 'mediamarkt', name: 'MediaMarkt', slug: 'mediamarkt', domain: 'mediamarkt.com.tr', enabled: true, supportsApi: true, reliabilityScore: 4.7 }],
  ['vatan', { id: 'vatan', name: 'Vatan Bilgisayar', slug: 'vatan', domain: 'vatanbilgisayar.com', enabled: true, supportsApi: true, reliabilityScore: 4.7 }],
  ['teknosa', { id: 'teknosa', name: 'Teknosa', slug: 'teknosa', domain: 'teknosa.com', enabled: true, supportsApi: true, reliabilityScore: 4.6 }],
]);

const inMemoryPrices: Map<string, DbPrice[]> = new Map();
const inMemoryHistory: Map<string, DbPriceHistory[]> = new Map();
const inMemoryJobs: Map<string, DbPriceUpdateJob> = new Map();

export class PriceRepository {
  /**
   * Tüm Mağazaları Listele
   */
  static async getStores(): Promise<DbStore[]> {
    try {
      if (supabase) {
        const { data, error } = await supabase.from('stores').select('*').order('name');
        if (!error && data && data.length > 0) {
          return data as DbStore[];
        }
      }
    } catch {
      // Fallback
    }
    return Array.from(inMemoryStores.values());
  }

  /**
   * Ürünün Güncel Fiyatlarını Getir (En Ucuz Sıralı)
   */
  static async getPricesForProduct(productId: string): Promise<DbPrice[]> {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('prices')
          .select('*')
          .eq('product_id', productId)
          .eq('is_anomaly', false)
          .order('total_price', { ascending: true });
        if (!error && data && data.length > 0) {
          return data as DbPrice[];
        }
      }
    } catch {
      // Fallback
    }

    if (inMemoryPrices.has(productId)) {
      return (inMemoryPrices.get(productId) || [])
        .filter((p) => !p.isAnomaly)
        .sort((a, b) => a.totalPrice - b.totalPrice);
    }

    // Seed initial prices from local stored product catalog if available
    const product = getStoredProducts().find((p) => p.id === productId);
    if (product && product.storeOffers) {
      const seeded: DbPrice[] = product.storeOffers.map((offer, idx) => ({
        id: `pr_${productId}_${idx}`,
        productId,
        storeId: offer.storeName.toLowerCase().replace(/[^a-z0-9]/g, ''),
        storeProductId: `sp_${productId}_${idx}`,
        price: offer.price,
        shippingPrice: offer.freeShipping ? 0 : 49,
        totalPrice: offer.price + (offer.freeShipping ? 0 : 49),
        currency: 'TRY',
        stockStatus: offer.inStock ? 'IN_STOCK' : 'OUT_OF_STOCK',
        sellerName: offer.sellerName || offer.storeName,
        url: offer.affiliateUrl || `https://www.${offer.storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        isAnomaly: false,
        checkedAt: new Date().toISOString(),
      }));

      inMemoryPrices.set(productId, seeded);
      return seeded.sort((a, b) => a.totalPrice - b.totalPrice);
    }

    return [];
  }

  /**
   * Fiyat Kaydet veya Güncelle (Upsert) + Fiyat Geçmişi Oluştur
   */
  static async upsertPrice(priceData: Omit<DbPrice, 'id' | 'createdAt' | 'updatedAt'>): Promise<DbPrice> {
    const id = `pr_${priceData.productId}_${priceData.storeId}_${priceData.sellerName.replace(/\s+/g, '_')}`;
    const priceRecord: DbPrice = {
      ...priceData,
      id,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Check previous price for history logging
    const existingList = inMemoryPrices.get(priceData.productId) || [];
    const prevIndex = existingList.findIndex((p) => p.storeId === priceData.storeId && p.sellerName === priceData.sellerName);
    const prev = prevIndex >= 0 ? existingList[prevIndex] : null;

    if (prev && prev.price !== priceData.price) {
      const diff = Number((priceData.price - prev.price).toFixed(2));
      const pctDiff = Number(((diff / prev.price) * 100).toFixed(2));

      const historyEntry: DbPriceHistory = {
        productId: priceData.productId,
        storeId: priceData.storeId,
        storeProductId: priceData.storeProductId,
        oldPrice: prev.price,
        price: priceData.price,
        shippingPrice: priceData.shippingPrice,
        totalPrice: priceData.totalPrice,
        difference: diff,
        percentageDifference: pctDiff,
        stockStatus: priceData.stockStatus,
        recordedAt: new Date().toISOString(),
      };

      const histList = inMemoryHistory.get(priceData.productId) || [];
      histList.unshift(historyEntry);
      inMemoryHistory.set(priceData.productId, histList);
    }

    if (prevIndex >= 0) {
      existingList[prevIndex] = priceRecord;
    } else {
      existingList.push(priceRecord);
    }
    inMemoryPrices.set(priceData.productId, existingList);

    return priceRecord;
  }

  /**
   * Fiyat Geçmişini Getir
   */
  static async getPriceHistory(productId: string): Promise<DbPriceHistory[]> {
    return inMemoryHistory.get(productId) || [];
  }

  /**
   * Fiyat Anomalilerini (Şüpheli Fiyatlar) Getir
   */
  static async getPriceAnomalies(): Promise<DbPrice[]> {
    const anomalies: DbPrice[] = [];
    for (const list of inMemoryPrices.values()) {
      for (const item of list) {
        if (item.isAnomaly) {
          anomalies.push(item);
        }
      }
    }
    return anomalies;
  }

  /**
   * Kuyruk Görevlerini Listele
   */
  static async getJobs(): Promise<DbPriceUpdateJob[]> {
    return Array.from(inMemoryJobs.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Kuyruğa Yeni Görev Ekle
   */
  static async createJob(job: Omit<DbPriceUpdateJob, 'id' | 'createdAt' | 'attempts'>): Promise<DbPriceUpdateJob> {
    const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullJob: DbPriceUpdateJob = {
      ...job,
      id,
      attempts: 0,
      createdAt: new Date().toISOString(),
    };
    inMemoryJobs.set(id, fullJob);
    return fullJob;
  }
}
