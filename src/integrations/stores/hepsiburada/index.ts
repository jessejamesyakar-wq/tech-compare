import { BaseStoreAdapter } from '../base';
import { StoreProduct, PriceResult, StockResult } from '../types';
import { Product } from '@/lib/types';

export class HepsiburadaStoreAdapter extends BaseStoreAdapter {
  constructor() {
    super({
      id: 'hepsiburada',
      name: 'Hepsiburada',
      domain: 'hepsiburada.com',
      requestsPerSecond: 4,
      maxRetries: 3,
    });
  }

  isConfigured(): boolean {
    return Boolean(
      process.env.HEPSIBURADA_USERNAME &&
      process.env.HEPSIBURADA_PASSWORD &&
      process.env.HEPSIBURADA_MERCHANT_ID
    );
  }

  async searchProduct(product: Product): Promise<StoreProduct[]> {
    if (!this.isConfigured()) {
      return [];
    }

    return this.executeWithRetry(async () => {
      // Official Hepsiburada Merchant / Listing API
      const skuOrBarcode = product.barcode || product.id;
      console.log(`[Hepsiburada] Searching: ${skuOrBarcode}`);
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
