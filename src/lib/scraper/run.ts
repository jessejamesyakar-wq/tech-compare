export interface CatalogProduct {
  id: string;
  searchQuery: string;
  category?: string;
  currentPrice?: number;
}

export interface ScrapedPriceItem {
  productId: string;
  source: string;
  sourceName: string;
  price: number;
  currency: string;
  inStock: boolean;
  url: string;
  title: string;
  updatedAt: string;
}

export interface ScrapeRunResult {
  startedAt: string;
  finishedAt: string;
  totalAttempts: number;
  failedCount: number;
  results: ScrapedPriceItem[];
}

/**
 * Scrapes or updates prices across major stores (MediaMarkt, Amazon, Trendyol, Hepsiburada, Vatan, Teknosa)
 */
export async function runPriceScrape(
  catalog: CatalogProduct[]
): Promise<ScrapeRunResult> {
  throw new Error('UNVERIFIED_PRICE_GENERATOR_DISABLED: approved observation with identity and provenance required');
}
