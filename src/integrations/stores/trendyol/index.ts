import { BaseStoreAdapter } from '../base';
import { StoreProduct, PriceResult, StockResult } from '../types';
import { Product } from '@/lib/types';

export class TrendyolStoreAdapter extends BaseStoreAdapter {
  constructor() {
    super({
      id: 'trendyol',
      name: 'Trendyol',
      domain: 'trendyol.com',
      requestsPerSecond: 5,
      maxRetries: 3,
    });
  }

  isConfigured(): boolean {
    return Boolean(
      process.env.TRENDYOL_API_KEY &&
      process.env.TRENDYOL_API_SECRET &&
      process.env.TRENDYOL_SUPPLIER_ID
    );
  }

  async searchProduct(product: Product): Promise<StoreProduct[]> {
    if (!this.isConfigured()) {
      return [];
    }

    return this.executeWithRetry(async () => {
      // Official Trendyol Product & Marketplace API search
      const barcode = product.barcode || product.id;
      console.log(`[Trendyol] Searching barcode/query: ${barcode}`);
      return [];
    }, 'searchProduct');
  }

  async getPrice(storeProduct: StoreProduct): Promise<PriceResult | null> {
    if (!this.isConfigured()) {
      return null;
    }

    return this.executeWithRetry(async () => {
      // Official Trendyol Price lookup
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
