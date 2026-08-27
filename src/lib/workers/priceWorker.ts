import { storeRegistry } from '@/integrations/stores/registry';
import { Product } from '@/lib/types';
import { PriceRepository, DbPrice } from '@/lib/db/priceRepository';
import { PriceNormalizer } from '@/lib/pricing/priceNormalizer';
import { ProductMatcher } from '@/lib/matching/productMatcher';
import { priceQueue } from '@/lib/queue/priceQueue';

export interface WorkerProcessResult {
  productId: string;
  storesChecked: number;
  pricesUpdated: number;
  failedStores: string[];
  anomaliesDetected: number;
  durationMs: number;
}

export class PriceWorker {
  /**
   * Process a single product price update across store adapters
   */
  static async processProduct(
    product: Product,
    targetStoreId?: string
  ): Promise<WorkerProcessResult> {
    const startTime = Date.now();
    const failedStores: string[] = [];
    let pricesUpdated = 0;
    let anomaliesDetected = 0;

    const adapters = targetStoreId
      ? [storeRegistry.getAdapter(targetStoreId)].filter(Boolean)
      : storeRegistry.getAllAdapters();

    for (const adapter of adapters) {
      if (!adapter || !adapter.isEnabled()) {
        continue;
      }

      // If adapter is not configured, skip calling fake endpoints
      if (!adapter.isConfigured()) {
        continue;
      }

      try {
        // 1. Search product in store
        const candidates = await adapter.searchProduct(product);

        for (const candidate of candidates) {
          // 2. Validate product match
          const matchResult = ProductMatcher.evaluateMatch(product, candidate);

          if (matchResult.isMatch && matchResult.matchStatus === 'MATCHED') {
            // 3. Fetch live price
            const rawPrice = await adapter.getPrice(candidate);

            if (rawPrice) {
              // 4. Normalize price & check anomalies
              const normalized: DbPrice = PriceNormalizer.normalizeRawResult(
                product.id,
                adapter.id,
                rawPrice,
                undefined,
                product.basePrice
              );

              if (normalized.isAnomaly) {
                anomaliesDetected++;
              }

              // 5. Upsert price to repository
              await PriceRepository.upsertPrice(normalized);
              pricesUpdated++;
            }
          }
        }
      } catch (err) {
        console.error(`[PriceWorker] Error updating ${product.id} on ${adapter.name}:`, err);
        failedStores.push(adapter.id);
      }
    }

    priceQueue.releaseLock(product.id, targetStoreId);

    return {
      productId: product.id,
      storesChecked: adapters.length,
      pricesUpdated,
      failedStores,
      anomaliesDetected,
      durationMs: Date.now() - startTime,
    };
  }

  /**
   * Process a batch of products (e.g. for scheduled cron jobs)
   */
  static async processBatch(products: Product[]): Promise<{
    totalProcessed: number;
    totalPricesUpdated: number;
    totalAnomalies: number;
    failedProducts: string[];
  }> {
    let totalPricesUpdated = 0;
    let totalAnomalies = 0;
    const failedProducts: string[] = [];

    for (const product of products) {
      try {
        const res = await this.processProduct(product);
        totalPricesUpdated += res.pricesUpdated;
        totalAnomalies += res.anomaliesDetected;
      } catch {
        failedProducts.push(product.id);
      }
    }

    return {
      totalProcessed: products.length,
      totalPricesUpdated,
      totalAnomalies,
      failedProducts,
    };
  }
}
