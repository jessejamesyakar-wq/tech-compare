import { BaseStoreAdapter } from '../base';
import { StoreProduct, PriceResult, StockResult } from '../types';
import { Product } from '@/lib/types';

export class TeknosaStoreAdapter extends BaseStoreAdapter {
  constructor() {
    super({
      id: 'teknosa',
      name: 'Teknosa',
      domain: 'teknosa.com',
      requestsPerSecond: 4,
      maxRetries: 3,
    });
  }

  isConfigured(): boolean {
    return Boolean(
      process.env.TEKNOSA_API_KEY ||
      process.env.TEKNOSA_FEED_URL
    );
  }

  async searchProduct(product: Product): Promise<StoreProduct[]> {
    if (!this.isConfigured()) {
      return [];
    }

    return this.executeWithRetry(async () => {
      // Official Teknosa Product Feed / API Lookup
      console.log(`[Teknosa] Searching: ${product.name}`);
      return [];
    }, 'searchProduct');
  }

  async getPrice(storeProduct: StoreProduct): Promise<PriceResult | null> {
    if (!this.isConfigured()) {
      return null;
    }

    return this.executeWithRetry(async () => {
      return null;
    }, 'getPrice');
  }

  async getStock(storeProduct: StoreProduct): Promise<StockResult | null> {
    if (!this.isConfigured()) {
      return null;
    }

    return {
      storeProductId: storeProduct.storeProductId,
      inStock: true,
      stockStatus: 'IN_STOCK',
      checkedAt: new Date().toISOString(),
    };
  }
}
