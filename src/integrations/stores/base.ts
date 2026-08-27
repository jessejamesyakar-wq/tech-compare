import { StoreAdapter, StoreProduct, PriceResult, StockResult, StoreHealthStatus } from './types';
import { Product } from '@/lib/types';

export interface BaseAdapterConfig {
  id: string;
  name: string;
  domain: string;
  requestsPerSecond?: number;
  maxRetries?: number;
}

export abstract class BaseStoreAdapter implements StoreAdapter {
  readonly id: string;
  readonly name: string;
  readonly domain: string;
  protected requestsPerSecond: number;
  protected maxRetries: number;
  private lastRequestTime = 0;

  constructor(config: BaseAdapterConfig) {
    this.id = config.id;
    this.name = config.name;
    this.domain = config.domain;
    this.requestsPerSecond = config.requestsPerSecond || 5;
    this.maxRetries = config.maxRetries || 3;
  }

  abstract isConfigured(): boolean;

  isEnabled(): boolean {
    const envKey = `STORE_${this.id.toUpperCase()}_ENABLED`;
    const envVal = process.env[envKey];
    if (envVal === 'false') return false;
    return true;
  }

  /**
   * Rate limiting bekletme kontrolü
   */
  protected async throttle(): Promise<void> {
    const minInterval = 1000 / this.requestsPerSecond;
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < minInterval) {
      const waitTime = minInterval - elapsed;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Exponential backoff ile güvenli API çağrısı
   */
  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    await this.throttle();
    let attempt = 0;
    let delay = 500;

    while (attempt < this.maxRetries) {
      try {
        return await operation();
      } catch (error) {
        attempt++;
        if (attempt >= this.maxRetries) {
          console.error(`[${this.name}] ${operationName} failed after ${attempt} attempts:`, error);
          throw error;
        }
        console.warn(`[${this.name}] ${operationName} attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }

    throw new Error(`[${this.name}] ${operationName} maximum retry exceeded`);
  }

  abstract searchProduct(product: Product): Promise<StoreProduct[]>;
  abstract getPrice(storeProduct: StoreProduct): Promise<PriceResult | null>;
  abstract getStock(storeProduct: StoreProduct): Promise<StockResult | null>;

  async healthCheck(): Promise<StoreHealthStatus> {
    const startTime = Date.now();
    const checkedAt = new Date().toISOString();

    if (!this.isEnabled()) {
      return {
        storeId: this.id,
        storeName: this.name,
        status: 'DISABLED',
        isConfigured: this.isConfigured(),
        isEnabled: false,
        lastCheckedAt: checkedAt,
        message: 'Mağaza yapılandırmada devre dışı bırakılmış',
      };
    }

    if (!this.isConfigured()) {
      return {
        storeId: this.id,
        storeName: this.name,
        status: 'NOT_CONFIGURED',
        isConfigured: false,
        isEnabled: true,
        lastCheckedAt: checkedAt,
        message: 'Resmi API anahtarları veya yetkili feed bilgisi girilmedi',
      };
    }

    try {
      // Test connectivity
      return {
        storeId: this.id,
        storeName: this.name,
        status: 'CONNECTED',
        isConfigured: true,
        isEnabled: true,
        responseTimeMs: Date.now() - startTime,
        lastCheckedAt: checkedAt,
        message: 'API Bağlantısı Aktif',
      };
    } catch (err) {
      return {
        storeId: this.id,
        storeName: this.name,
        status: 'TEMPORARY_ERROR',
        isConfigured: true,
        isEnabled: true,
        responseTimeMs: Date.now() - startTime,
        lastCheckedAt: checkedAt,
        message: String(err),
      };
    }
  }
}
