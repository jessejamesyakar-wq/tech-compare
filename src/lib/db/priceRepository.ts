import { supabase } from '@/lib/supabase/client';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getStoredProducts } from '@/lib/adminData';
import { catalogPriceRecords, createPriceObservation, readPriceRecord } from '@/lib/pricing/priceRecordEvidence';
import {
  PriceSourceType,
  ProvenanceValidationError,
  ValidateWriteOptions,
  validatePriceProvenance,
} from '@/lib/pricing/priceProvenance';
import { RETAILER_CHANNEL_REGISTRY, RetailerAccessChannel } from '@/lib/pricing/retailerAccessChannel';

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
  channelId?: string | null;
  sourceType?: PriceSourceType | string | null;
  sourceIdentifier?: string | null;
  sourceUrl?: string | null;
  observedAt?: string | null;
  affiliateUrl?: string | null;
}

export interface DbPriceHistory {
  id?: number;
  productId: string;
  storeId: string;
  storeProductId?: string;
  oldPrice?: number | null;
  price: number;
  shippingPrice?: number | null;
  totalPrice: number;
  difference: number;
  percentageDifference: number;
  stockStatus: string;
  recordedAt: string;
  sourceUrl?: string | null;
  sourceType?: string | null;
  currency?: string;
  channelId?: string | null;
  channelType?: string | null;
  sourceIdentifier?: string | null;
  sellerName?: string | null;
  observedAt?: string | null;
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
          return data.map(readPriceRecord).filter((price): price is DbPrice => price !== null);
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

    // Never manufacture a check date, stock, shipping fee or store URL on read.
    const product = getStoredProducts().find((p) => p.id === productId);
    return catalogPriceRecords(productId, product?.storeOffers);
  }

  /**
   * Fiyat Kaydet veya Güncelle (Upsert) + Fiyat Geçmişi Oluştur
   * Enforces Price Provenance V2 write gates (FAIL_CLOSED on missing/invalid provenance).
   */
  static async upsertPrice(
    priceData: Omit<DbPrice, 'id' | 'createdAt' | 'updatedAt'>,
    options?: ValidateWriteOptions
  ): Promise<DbPrice> {
    // 1. Provenance V2 Write Gate: Fail closed if provenance is missing
    if (!priceData.channelId && !priceData.sourceType && !priceData.observedAt) {
      throw new ProvenanceValidationError(
        'PROVENANCE_REQUIRED',
        `Provenance metadata is required for price writes on store '${priceData.storeId}'. Missing channelId, sourceType, and observedAt.`
      );
    }

    if (!priceData.sourceType) {
      throw new ProvenanceValidationError(
        'INVALID_SOURCE_TYPE',
        'Explicit sourceType is required for price writes.'
      );
    }

    if (!priceData.channelId) {
      throw new ProvenanceValidationError(
        'CHANNEL_REQUIRED',
        'Explicit channelId is required for price writes.'
      );
    }

    if (!priceData.observedAt) {
      throw new ProvenanceValidationError(
        'OBSERVED_AT_REQUIRED',
        'Explicit observedAt is required for price writes.'
      );
    }

    // 2. Validate channel, readiness, safety, and source type
    const validated = validatePriceProvenance(
      priceData.storeId,
      {
        channelId: priceData.channelId,
        sourceType: priceData.sourceType as PriceSourceType,
        observedAt: priceData.observedAt,
        sourceIdentifier: priceData.sourceIdentifier,
        sourceUrl: priceData.sourceUrl ?? priceData.url,
        affiliateUrl: priceData.affiliateUrl,
      },
      options
    );

    // Derive channelType from registry
    const registryChannels = (RETAILER_CHANNEL_REGISTRY as Record<string, RetailerAccessChannel[]>)[priceData.storeId];
    const matchedChannel = registryChannels?.find(
      (c) => c.channelId === validated.normalizedChannelId || c.channelId === `${priceData.storeId}:${validated.normalizedChannelId}`
    );
    const channelType = matchedChannel?.channelType ?? null;

    const id = `pr_${priceData.productId}_${priceData.storeId}_${priceData.sellerName ? priceData.sellerName.replace(/\s+/g, '_') : 'direct'}`;
    const priceRecord: DbPrice = {
      ...priceData,
      id,
      channelId: validated.normalizedChannelId,
      sourceType: validated.normalizedSourceType,
      sourceIdentifier: validated.normalizedSourceIdentifier,
      sourceUrl: validated.normalizedSourceUrl,
      observedAt: validated.normalizedObservedAt,
      affiliateUrl: validated.normalizedAffiliateUrl,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Check previous price for history logging
    const existingList = inMemoryPrices.get(priceData.productId) || [];
    const prevIndex = existingList.findIndex(
      (p) => p.storeId === priceData.storeId && (p.sellerName === priceData.sellerName || (!p.sellerName && !priceData.sellerName))
    );
    const prev = prevIndex >= 0 ? existingList[prevIndex] : null;

    const historyEntry = createPriceObservation(priceRecord, prev);
    if (historyEntry) {
      historyEntry.channelType = channelType;
      const histList = inMemoryHistory.get(priceData.productId) || [];
      if (!histList.some((entry) => entry.storeId === historyEntry.storeId && entry.sourceUrl === historyEntry.sourceUrl && entry.recordedAt === historyEntry.recordedAt)) {
        histList.unshift(historyEntry);
      }
      inMemoryHistory.set(priceData.productId, histList);
    }

    if (prevIndex >= 0) {
      existingList[prevIndex] = priceRecord;
    } else {
      existingList.push(priceRecord);
    }
    inMemoryPrices.set(priceData.productId, existingList);

    // Persistent Supabase Server-side Write (Requires SUPABASE_SECRET_KEY / SERVICE_ROLE_KEY to bypass RLS)
    try {
      const serverClient = getSupabaseServerClient();
      if (serverClient) {
        await serverClient.from('prices').upsert({
          id,
          product_id: priceRecord.productId,
          store_id: priceRecord.storeId,
          store_product_id: priceRecord.storeProductId,
          price: priceRecord.price,
          shipping_price: priceRecord.shippingPrice,
          total_price: priceRecord.totalPrice,
          currency: priceRecord.currency,
          stock_status: priceRecord.stockStatus,
          seller_name: priceRecord.sellerName,
          url: priceRecord.url,
          is_anomaly: priceRecord.isAnomaly,
          checked_at: priceRecord.checkedAt,
          channel_id: validated.normalizedChannelId,
          source_type: validated.normalizedSourceType,
          source_identifier: validated.normalizedSourceIdentifier,
          source_url: validated.normalizedSourceUrl,
          observed_at: validated.normalizedObservedAt,
          affiliate_url: validated.normalizedAffiliateUrl,
        }, { onConflict: 'product_id,store_id,seller_name' });

        if (historyEntry) {
          await serverClient.from('price_history').insert({
            product_id: historyEntry.productId,
            store_id: historyEntry.storeId,
            store_product_id: historyEntry.storeProductId,
            old_price: historyEntry.oldPrice,
            price: historyEntry.price,
            shipping_price: historyEntry.shippingPrice,
            total_price: historyEntry.totalPrice,
            difference: historyEntry.difference,
            percentage_difference: historyEntry.percentageDifference,
            stock_status: historyEntry.stockStatus,
            recorded_at: historyEntry.recordedAt,
            source_url: historyEntry.sourceUrl,
            source_type: historyEntry.sourceType,
            currency: historyEntry.currency || 'TRY',
            channel_id: historyEntry.channelId,
            channel_type: historyEntry.channelType,
            source_identifier: historyEntry.sourceIdentifier,
            seller_name: historyEntry.sellerName,
            observed_at: historyEntry.observedAt,
          });
        }
      }
    } catch {
      // In-memory fallback remains robust and uninterrupted
    }

    return priceRecord;
  }

  /**
   * Fiyat Geçmişini Getir
   */
  static async getPriceHistory(productId: string): Promise<DbPriceHistory[]> {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('price_history')
          .select('*')
          .eq('product_id', productId)
          .order('recorded_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map((row: any) => ({
            id: row.id,
            productId: row.product_id ?? row.productId,
            storeId: row.store_id ?? row.storeId,
            storeProductId: row.store_product_id ?? row.storeProductId,
            oldPrice: row.old_price ?? row.oldPrice,
            price: row.price,
            shippingPrice: row.shipping_price ?? row.shippingPrice,
            totalPrice: row.total_price ?? row.totalPrice,
            difference: row.difference,
            percentageDifference: row.percentage_difference ?? row.percentageDifference,
            stockStatus: row.stock_status ?? row.stockStatus,
            recordedAt: row.recorded_at ?? row.recordedAt,
            sourceUrl: row.source_url ?? row.sourceUrl,
            sourceType: row.source_type ?? row.sourceType,
            currency: row.currency,
            channelId: row.channel_id ?? row.channelId ?? null,
            channelType: row.channel_type ?? row.channelType ?? null,
            sourceIdentifier: row.source_identifier ?? row.sourceIdentifier ?? null,
            sellerName: row.seller_name ?? row.sellerName ?? null,
            observedAt: row.observed_at ?? row.observedAt ?? null,
          }));
        }
      }
    } catch {
      // Fallback
    }
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
    try {
      const serverClient = getSupabaseServerClient();
      if (serverClient) {
        const { data, error } = await serverClient
          .from('price_update_jobs')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data as DbPriceUpdateJob[];
        }
      }
    } catch {
      // Fallback
    }
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
    try {
      const serverClient = getSupabaseServerClient();
      if (serverClient) {
        await serverClient.from('price_update_jobs').insert({
          id: fullJob.id,
          product_id: fullJob.productId,
          store_id: fullJob.storeId,
          priority: fullJob.priority,
          status: fullJob.status,
          attempts: fullJob.attempts,
          max_attempts: fullJob.maxAttempts,
          error_message: fullJob.errorMessage,
          started_at: fullJob.startedAt,
          completed_at: fullJob.completedAt,
        });
      }
    } catch {
      // Fallback
    }
    inMemoryJobs.set(id, fullJob);
    return fullJob;
  }
}
