/**
 * The retired scraper read the first search-result price, assumed stock,
 * generated prices on network failures and wrote a fixed August 2026 history.
 * It cannot safely update real product data. Use configured store adapters
 * with exact product matching, source URLs and successful check timestamps.
 */
export const LEGACY_SCRAPER_DISABLED_MESSAGE =
  'Bu eski tarama yolu devre dışı: ürün eşleşmesi ve gerçek fiyat gözlemi doğrulanamıyor. Katalog değiştirilmedi.';

export async function execute2026PriceScrape(_maxProductsLimit?: number): Promise<never> {
  throw new Error(LEGACY_SCRAPER_DISABLED_MESSAGE);
}
