import { BaseStoreAdapter } from '../base';
import { StoreProduct, PriceResult, StockResult } from '../types';
import { Product } from '@/lib/types';

export class N11StoreAdapter extends BaseStoreAdapter {
  constructor() {
    super({
      id: 'n11',
      name: 'n11',
      domain: 'n11.com',
      requestsPerSecond: 3,
      maxRetries: 3,
    });
  }

  isConfigured(): boolean {
    return Boolean(
      process.env.N11_API_KEY &&
      process.env.N11_API_SECRET
    );
  }

  async searchProduct(product: Product): Promise<StoreProduct[]> {
    if (!this.isConfigured()) {
      return [];
    }

    return this.executeWithRetry(async () => {
      // Official n11 SOAP/REST ProductService GetProductBySellerCode / SearchProduct
      console.log(`[n11] Searching: ${product.name}`);
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
