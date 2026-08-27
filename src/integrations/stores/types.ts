import { Product } from '@/lib/types';

export type StoreStatus =
  | 'CONNECTED'
  | 'NOT_CONFIGURED'
  | 'AUTH_ERROR'
  | 'RATE_LIMITED'
  | 'TEMPORARY_ERROR'
  | 'DISABLED'
  | 'UNKNOWN_ERROR';

export interface StoreProduct {
  storeId: string;
  storeProductId: string;
  storeSku?: string;
  barcode?: string;
  title: string;
  url: string;
  imageUrl?: string;
  sellerName?: string;
  rating?: number;
  reviewCount?: number;
}

export interface PriceResult {
  storeProductId: string;
  price: number;
  shippingPrice: number | null;
  totalPrice: number;
  currency: string;
  inStock: boolean;
  stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK' | 'UNKNOWN' | 'PREORDER';
  sellerName: string;
  url: string;
  checkedAt: string;
  rawResponse?: Record<string, unknown>;
}

export interface StockResult {
  storeProductId: string;
  inStock: boolean;
  stockCount?: number;
  stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK' | 'UNKNOWN' | 'PREORDER';
  checkedAt: string;
}

export interface StoreHealthStatus {
  storeId: string;
  storeName: string;
  status: StoreStatus;
  isConfigured: boolean;
  isEnabled: boolean;
  responseTimeMs?: number;
  lastCheckedAt: string;
  message?: string;
}

export interface StoreAdapter {
  readonly id: string;
  readonly name: string;
  readonly domain: string;

  /**
   * API anahtarları veya Yetkili Feed bilgisi girilmiş mi?
   */
  isConfigured(): boolean;

  /**
   * Mağazanın aktif edilip edilmediği
   */
  isEnabled(): boolean;

  /**
   * Ürün arama / Eşleştirme listesi getirme
   */
  searchProduct(product: Product): Promise<StoreProduct[]>;

  /**
   * Güncel fiyat bilgisini çekme
   */
  getPrice(storeProduct: StoreProduct): Promise<PriceResult | null>;

  /**
   * Güncel stok bilgisini çekme
   */
  getStock(storeProduct: StoreProduct): Promise<StockResult | null>;

  /**
   * Mağaza API sağlık kontrolü
   */
  healthCheck(): Promise<StoreHealthStatus>;
}
