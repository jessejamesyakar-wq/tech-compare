import { StoreAdapter, StoreHealthStatus } from './types';
import { AmazonStoreAdapter } from './amazon';
import { TrendyolStoreAdapter } from './trendyol';
import { HepsiburadaStoreAdapter } from './hepsiburada';
import { N11StoreAdapter } from './n11';
import { PttAvmStoreAdapter } from './pttavm';
import { MediaMarktStoreAdapter } from './mediamarkt';
import { VatanStoreAdapter } from './vatan';
import { TeknosaStoreAdapter } from './teknosa';

class StoreRegistry {
  private adapters: Map<string, StoreAdapter> = new Map();

  constructor() {
    this.register(new AmazonStoreAdapter());
    this.register(new TrendyolStoreAdapter());
    this.register(new HepsiburadaStoreAdapter());
    this.register(new N11StoreAdapter());
    this.register(new PttAvmStoreAdapter());
    this.register(new MediaMarktStoreAdapter());
    this.register(new VatanStoreAdapter());
    this.register(new TeknosaStoreAdapter());
  }

  register(adapter: StoreAdapter) {
    this.adapters.set(adapter.id, adapter);
  }

  getAdapter(storeId: string): StoreAdapter | undefined {
    return this.adapters.get(storeId.toLowerCase());
  }

  getAllAdapters(): StoreAdapter[] {
    return Array.from(this.adapters.values());
  }

  getConfiguredAdapters(): StoreAdapter[] {
    return this.getAllAdapters().filter((a) => a.isConfigured() && a.isEnabled());
  }

  async getStoreHealthStatuses(): Promise<StoreHealthStatus[]> {
    const promises = this.getAllAdapters().map((adapter) => adapter.healthCheck());
    return Promise.all(promises);
  }
}

export const storeRegistry = new StoreRegistry();
