import { DbPriceUpdateJob, PriceRepository } from '@/lib/db/priceRepository';

export interface EnqueueJobOptions {
  productId: string;
  storeId?: string;
  priority?: 'HIGH_PRIORITY' | 'NORMAL' | 'LOW_PRIORITY';
}

class PriceQueue {
  private inFlightJobKeys: Set<string> = new Set();

  /**
   * Enqueue a product price update job with deduplication
   */
  async enqueue(options: EnqueueJobOptions): Promise<DbPriceUpdateJob | null> {
    const dedupeKey = `${options.productId}_${options.storeId || 'all'}`;

    // Prevent concurrent duplicate jobs for the same product+store
    if (this.inFlightJobKeys.has(dedupeKey)) {
      console.log(`[PriceQueue] Job for ${dedupeKey} is already active or in-flight, skipping duplicate.`);
      return null;
    }

    this.inFlightJobKeys.add(dedupeKey);

    const job = await PriceRepository.createJob({
      productId: options.productId,
      storeId: options.storeId,
      priority: options.priority || 'NORMAL',
      status: 'PENDING',
      maxAttempts: 3,
    });

    return job;
  }

  /**
   * Mark job finished and release lock
   */
  releaseLock(productId: string, storeId?: string) {
    const dedupeKey = `${productId}_${storeId || 'all'}`;
    this.inFlightJobKeys.delete(dedupeKey);
  }

  /**
   * Get queue statistics
   */
  async getStats() {
    const jobs = await PriceRepository.getJobs();
    const pending = jobs.filter((j) => j.status === 'PENDING').length;
    const processing = jobs.filter((j) => j.status === 'PROCESSING').length;
    const completed = jobs.filter((j) => j.status === 'COMPLETED').length;
    const failed = jobs.filter((j) => j.status === 'FAILED').length;

    return {
      totalJobs: jobs.length,
      pending,
      processing,
      completed,
      failed,
      activeLocks: this.inFlightJobKeys.size,
    };
  }
}

export const priceQueue = new PriceQueue();
