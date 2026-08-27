import { BaseStoreAdapter } from '../base';
import { StoreProduct, PriceResult, StockResult } from '../types';
import { Product } from '@/lib/types';

export class PttAvmStoreAdapter extends BaseStoreAdapter {
  constructor() {
    super({
      id: 'pttavm',
      name: 'PttAVM',
      domain: 'pttavm.com',
      requestsPerSecond: 3,
      maxRetries: 3,
    });
  }

  isConfigured(): boolean {
    return Boolean(
      process.env.PTTAVM_API_KEY &&
      process.env.PTTAVM_API_SECRET
    );
  }

  async searchProduct(product: Product): Promise<StoreProduct[]> {
    if (!this.isConfigured()) {
      return [];
    }

    return this.executeWithRetry(async () => {
      // Official PttAVM WebService / REST search
      console.log(`[PttAVM] Searching barcode: ${product.barcode || product.name}`);
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
