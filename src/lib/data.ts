import { mockSmartphones, popularComparisonsList } from './mockData';
import { mockTVs } from './mockTVs';
import { Product, Smartphone, TVProduct, LaptopProduct, ApplianceProduct, FilterOptions } from './types';
import { getStoredProducts } from './adminData';
import { isEligibleForLivePriceComparison, isHistoricalRetroModel, getProductReleaseYear } from './releaseYearFilter';

export { isEligibleForLivePriceComparison, isHistoricalRetroModel, getProductReleaseYear };

// Deduplicate products by unique ID to prevent duplicate React keys
function deduplicateProducts<T extends Product>(list: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of list) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      result.push(item);
    }
  }
  return result;
}

// Aggregate all products across categories with local storage override support
export async function getAllProducts(): Promise<Product[]> {
  return deduplicateProducts(getStoredProducts());
}

export async function getAllSmartphones(): Promise<Smartphone[]> {
  const all = deduplicateProducts(getStoredProducts());
  return all.filter((p) => p.category === 'smartphones') as Smartphone[];
}

export async function getAllTVs(): Promise<TVProduct[]> {
  const all = deduplicateProducts(getStoredProducts());
  return all.filter((p) => p.category === 'tvs') as TVProduct[];
}

export async function getAllLaptops(): Promise<LaptopProduct[]> {
  const all = deduplicateProducts(getStoredProducts());
  return all.filter((p) => p.category === 'laptops') as LaptopProduct[];
}

export async function getAllAppliances(): Promise<ApplianceProduct[]> {
  const all = deduplicateProducts(getStoredProducts());
  return all.filter((p) => p.category === 'appliances') as ApplianceProduct[];
}

export async function getProductById(id: string): Promise<Product | undefined> {
  if (!id) return undefined;
  const decoded = decodeURIComponent(id).toLowerCase().trim();
  const all = getStoredProducts();

  // 1. Direct exact matches
  const exact = all.find(
    (p) =>
      p.id.toLowerCase() === decoded ||
      p.slug.toLowerCase() === decoded ||
      p.slug.toLowerCase().replace(/_/g, '-') === decoded.replace(/_/g, '-') ||
      p.name.toLowerCase() === decoded
  );
  if (exact) return exact;

  // 2. Normalized prefix/suffix matching (e.g. brand duplicated prefix or trailing numeric ID)
  const stripNumbers = (str: string) => str.replace(/-[0-9]+$/, '');
  const stripPrefix = (str: string) => str.replace(/^[a-z0-9]+-([a-z0-9]+-)/, '$1');

  const normalized = all.find(
    (p) =>
      stripNumbers(p.slug.toLowerCase()) === stripNumbers(decoded) ||
      stripNumbers(p.id.toLowerCase()) === stripNumbers(decoded) ||
      stripPrefix(p.slug.toLowerCase()) === stripPrefix(decoded) ||
      stripPrefix(p.id.toLowerCase()) === stripPrefix(decoded) ||
      p.slug.toLowerCase().includes(decoded) ||
      decoded.includes(p.slug.toLowerCase())
  );
  if (normalized) return normalized;

  // 3. Name fuzzy match
  return all.find((p) => p.name.toLowerCase().includes(decoded) || decoded.includes(p.name.toLowerCase()));
}

export async function getSmartphoneById(id: string): Promise<Smartphone | undefined> {
  const decoded = decodeURIComponent(id).toLowerCase().trim();
  const all = getStoredProducts();
  const found = all.find(
    (p) =>
      (p.id.toLowerCase() === decoded ||
        p.slug.toLowerCase() === decoded ||
        p.slug.toLowerCase().replace(/_/g, '-') === decoded.replace(/_/g, '-') ||
        p.name.toLowerCase() === decoded) &&
      p.category === 'smartphones'
  );
  if (found) return found as Smartphone;
  return (await getProductById(id)) as Smartphone | undefined;
}

export async function getTabletById(id: string): Promise<Product | undefined> {
  const decoded = decodeURIComponent(id).toLowerCase().trim();
  const all = getStoredProducts();
  const found = all.find(
    (p) =>
      (p.id.toLowerCase() === decoded ||
        p.slug.toLowerCase() === decoded ||
        p.slug.toLowerCase().replace(/_/g, '-') === decoded.replace(/_/g, '-') ||
        p.name.toLowerCase() === decoded) &&
      p.category === 'tablets'
  );
  if (found) return found;
  return getProductById(id);
}

export async function getSmartwatchById(id: string): Promise<Product | undefined> {
  const decoded = decodeURIComponent(id).toLowerCase().trim();
  const all = getStoredProducts();
  const found = all.find(
    (p) =>
      (p.id.toLowerCase() === decoded ||
        p.slug.toLowerCase() === decoded ||
        p.slug.toLowerCase().replace(/_/g, '-') === decoded.replace(/_/g, '-') ||
        p.name.toLowerCase() === decoded) &&
      p.category === 'smartwatches'
  );
  if (found) return found;
  return getProductById(id);
}

export async function getHeadphoneById(id: string): Promise<Product | undefined> {
  const decoded = decodeURIComponent(id).toLowerCase().trim();
  const all = getStoredProducts();
  const found = all.find(
    (p) =>
      (p.id.toLowerCase() === decoded ||
        p.slug.toLowerCase() === decoded ||
        p.slug.toLowerCase().replace(/_/g, '-') === decoded.replace(/_/g, '-') ||
        p.name.toLowerCase() === decoded) &&
      p.category === 'headphones'
  );
  if (found) return found;
  return getProductById(id);
}

export async function getConsoleById(id: string): Promise<Product | undefined> {
  const decoded = decodeURIComponent(id).toLowerCase().trim();
  const all = getStoredProducts();
  const found = all.find(
    (p) =>
      (p.id.toLowerCase() === decoded ||
        p.slug.toLowerCase() === decoded ||
        p.slug.toLowerCase().replace(/_/g, '-') === decoded.replace(/_/g, '-') ||
        p.name.toLowerCase() === decoded) &&
      p.category === 'consoles'
  );
  if (found) return found;
  return getProductById(id);
}

export async function getMonitorById(id: string): Promise<Product | undefined> {
  const decoded = decodeURIComponent(id).toLowerCase().trim();
  const all = getStoredProducts();
  const found = all.find(
    (p) =>
      (p.id.toLowerCase() === decoded ||
        p.slug.toLowerCase() === decoded ||
        p.slug.toLowerCase().replace(/_/g, '-') === decoded.replace(/_/g, '-') ||
        p.name.toLowerCase() === decoded) &&
      p.category === 'monitors'
  );
  if (found) return found;
  return getProductById(id);
}

export async function getTVById(id: string): Promise<TVProduct | undefined> {
  const decoded = decodeURIComponent(id).toLowerCase().trim();
  const all = getStoredProducts().filter((p) => p.category === 'tvs') as TVProduct[];

  // 1. Exact match by id, slug, or name
  const exact = all.find(
    (p) =>
      p.id.toLowerCase() === decoded ||
      p.slug.toLowerCase() === decoded ||
      p.slug.toLowerCase().replace(/_/g, '-') === decoded.replace(/_/g, '-') ||
      p.name.toLowerCase() === decoded
  );
  if (exact) return exact;

  // 2. Fallback match for model code like '98p8l', '98c7l', '115x955', 'c8l'
  const modelMatch = all.find(
    (p) =>
      p.slug.toLowerCase().includes(decoded) ||
      p.id.toLowerCase().includes(decoded) ||
      p.name.toLowerCase().includes(decoded)
  );
  if (modelMatch) return modelMatch;

  return (await getProductById(id)) as TVProduct | undefined;
}

export async function getLaptopById(id: string): Promise<LaptopProduct | undefined> {
  const decoded = decodeURIComponent(id).toLowerCase().trim();
  const all = getStoredProducts();
  const found = all.find(
    (p) =>
      (p.id.toLowerCase() === decoded ||
        p.slug.toLowerCase() === decoded ||
        p.slug.toLowerCase().replace(/_/g, '-') === decoded.replace(/_/g, '-') ||
        p.name.toLowerCase() === decoded) &&
      p.category === 'laptops'
  ) as LaptopProduct | undefined;
  if (found) return found;
  return (await getProductById(id)) as LaptopProduct | undefined;
}

export async function getApplianceById(id: string): Promise<ApplianceProduct | undefined> {
  const decoded = decodeURIComponent(id).toLowerCase().trim();
  const all = getStoredProducts();
  const found = all.find(
    (p) =>
      (p.id.toLowerCase() === decoded ||
        p.slug.toLowerCase() === decoded ||
        p.slug.toLowerCase().replace(/_/g, '-') === decoded.replace(/_/g, '-') ||
        p.name.toLowerCase() === decoded) &&
      p.category === 'appliances'
  ) as ApplianceProduct | undefined;
  if (found) return found;
  return (await getProductById(id)) as ApplianceProduct | undefined;
}

export async function getFeaturedSmartphones(): Promise<Smartphone[]> {
  const smartphones = await getAllSmartphones();
  return smartphones.filter((p) => p.isFeatured || p.isPopular);
}

export async function getFeaturedAppliances(): Promise<ApplianceProduct[]> {
  const appliances = await getAllAppliances();
  return appliances.filter((p) => p.isFeatured || p.isPopular);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const all = getStoredProducts();
  return all.filter((p) => p.isFeatured || p.isPopular);
}

export async function getAllBrands(): Promise<string[]> {
  const smartphones = await getAllSmartphones();
  const brands = new Set(smartphones.map((p) => p.brand));
  return Array.from(brands);
}

export async function filterSmartphones(options: FilterOptions): Promise<Smartphone[]> {
  let phones = await getAllSmartphones();

  if (options.brand && options.brand.length > 0) {
    phones = phones.filter((p) => options.brand?.includes(p.brand));
  }

  if (options.minPrice !== undefined) {
    phones = phones.filter((p) => p.basePrice >= (options.minPrice || 0));
  }

  if (options.maxPrice !== undefined) {
    phones = phones.filter((p) => p.basePrice <= (options.maxPrice || Infinity));
  }

  if (options.has5GOnly) {
    phones = phones.filter((p) => p.specs?.connectivity?.has5G);
  }

  if (options.minRamGb) {
    phones = phones.filter((p) => (p.specs?.memory?.ramGb || 0) >= (options.minRamGb || 0));
  }

  if (options.minStorageGb || options.minStorage) {
    const minStg = options.minStorageGb || options.minStorage || 0;
    phones = phones.filter((p) => (p.specs?.memory?.storageGb || 0) >= minStg);
  }

  if (options.minBattery || options.minBatteryMah) {
    const minBat = options.minBattery || options.minBatteryMah || 0;
    phones = phones.filter((p) => (p.specs?.battery?.capacitymAh || 0) >= minBat);
  }

  if (options.minAntutu || options.minAntutuScore) {
    const minAnt = options.minAntutu || options.minAntutuScore || 0;
    phones = phones.filter((p) => (p.specs?.processor?.antutuScore || 0) >= minAnt);
  }

  if (options.sortBy) {
    switch (options.sortBy) {
      case 'priceAsc':
        phones.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case 'priceDesc':
        phones.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'antutu':
        phones.sort((a, b) => (b.specs?.processor?.antutuScore || 0) - (a.specs?.processor?.antutuScore || 0));
        break;
      case 'releaseYear':
      case 'rating':
      case 'popular':
      default:
        phones.sort((a, b) => {
          const yearDiff = (b.releaseYear || 2024) - (a.releaseYear || 2024);
          if (yearDiff !== 0) return yearDiff;
          return (b.rating || 0) - (a.rating || 0);
        });
        break;
    }
  } else {
    phones.sort((a, b) => {
      const yearDiff = (b.releaseYear || 2024) - (a.releaseYear || 2024);
      if (yearDiff !== 0) return yearDiff;
      return (b.rating || 0) - (a.rating || 0);
    });
  }

  return phones;
}

export async function getPopularComparisonsData(): Promise<typeof popularComparisonsList> {
  return popularComparisonsList;
}

export async function filterProducts(options: FilterOptions): Promise<Product[]> {
  let products = getStoredProducts();

  if (options.category) {
    products = products.filter((p) => p.category === options.category);
  }

  if (options.brand && options.brand.length > 0) {
    products = products.filter((p) => options.brand?.includes(p.brand));
  }

  if (options.minPrice !== undefined) {
    products = products.filter((p) => p.basePrice >= (options.minPrice || 0));
  }

  if (options.maxPrice !== undefined) {
    products = products.filter((p) => p.basePrice <= (options.maxPrice || Infinity));
  }

  return products;
}

interface SearchIndexEntry {
  product: Product;
  nameLower: string;
  brandLower: string;
  catLower: string;
  slugLower: string;
  corpus: string;
}

let cachedSearchIndex: SearchIndexEntry[] | null = null;
let lastProductsRef: Product[] | null = null;

function getSearchIndex(): SearchIndexEntry[] {
  const currentProducts = getStoredProducts();
  if (cachedSearchIndex && lastProductsRef === currentProducts) {
    return cachedSearchIndex;
  }
  
  lastProductsRef = currentProducts;
  cachedSearchIndex = currentProducts.map((p) => {
    const nameLower = (p.name || '').toLowerCase();
    const brandLower = (p.brand || '').toLowerCase();
    const catLower = (p.category || '').toLowerCase();
    const slugLower = (p.slug || '').toLowerCase();
    const tagsLower = (p.tags || []).join(' ').toLowerCase();
    const corpus = `${nameLower} ${brandLower} ${catLower} ${slugLower} ${tagsLower}`;

    return {
      product: p,
      nameLower,
      brandLower,
      catLower,
      slugLower,
      corpus,
    };
  });

  return cachedSearchIndex;
}

export async function searchProducts(query: string, limit?: number): Promise<Product[]> {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const index = getSearchIndex();
  const scoredResults: { product: Product; score: number }[] = [];

  for (let i = 0; i < index.length; i++) {
    const entry = index[i];
    
    // Quick token match against corpus
    let matchesAll = true;
    for (let t = 0; t < tokens.length; t++) {
      if (!entry.corpus.includes(tokens[t])) {
        matchesAll = false;
        break;
      }
    }
    if (!matchesAll) continue;

    let score = 0;
    if (entry.nameLower === q) score += 100;
    else if (entry.nameLower.startsWith(q)) score += 80;
    else if (entry.nameLower.includes(q)) score += 60;

    for (let t = 0; t < tokens.length; t++) {
      const tok = tokens[t];
      if (entry.nameLower.includes(tok)) score += 20;
      if (entry.brandLower.includes(tok)) score += 15;
      if (entry.catLower.includes(tok)) score += 10;
    }

    if (entry.product.isPopular) score += 5;
    if (entry.product.rating) score += entry.product.rating;

    scoredResults.push({ product: entry.product, score });
  }

  scoredResults.sort((a, b) => b.score - a.score);
  const results = scoredResults.map((r) => r.product);
  return limit ? results.slice(0, limit) : results;
}

export async function getAllTablets(): Promise<Product[]> {
  const all = deduplicateProducts(getStoredProducts());
  return all
    .filter((p) => p.category === 'tablets')
    .sort((a, b) => {
      const yearDiff = (b.releaseYear || 0) - (a.releaseYear || 0);
      if (yearDiff !== 0) return yearDiff;
      const ratingDiff = (b.rating || 0) - (a.rating || 0);
      if (ratingDiff !== 0) return ratingDiff;
      return (b.basePrice || 0) - (a.basePrice || 0);
    });
}

export async function getAllSmartwatches(): Promise<Product[]> {
  const all = deduplicateProducts(getStoredProducts());
  return all.filter((p) => p.category === 'smartwatches');
}

export async function getAllHeadphones(): Promise<Product[]> {
  const all = deduplicateProducts(getStoredProducts());
  return all.filter((p) => p.category === 'headphones');
}

export async function getAllConsoles(): Promise<Product[]> {
  const all = deduplicateProducts(getStoredProducts());
  return all.filter((p) => p.category === 'consoles');
}

export async function getAllMonitors(): Promise<Product[]> {
  const all = deduplicateProducts(getStoredProducts());
  return all.filter((p) => p.category === 'monitors');
}

export interface DynamicCategoryDistribution {
  total: number;
  items: Product[];
  categoryBreakdown: Record<string, { count: number; ratio: number; items: Product[] }>;
}

export async function getDynamicCategoryDistributionProducts(total: number = 20): Promise<DynamicCategoryDistribution> {
  const all = getStoredProducts();
  const phones = await getAllSmartphones();
  const tvs = await getAllTVs();
  const appliances = await getAllAppliances();
  const tablets = await getAllTablets();
  const smartwatches = await getAllSmartwatches();
  const headphones = await getAllHeadphones();

  // Helper score calculator for flagship & popularity sorting
  const getPopularityScore = (p: Product) => {
    let score = 0;
    if (p.isPopular) score += 40;
    if (p.isFeatured) score += 30;
    score += (p.rating || 4.5) * 20;
    // Boost ultra-flagships by name and price tier
    const nameLower = p.name.toLowerCase();
    if (nameLower.includes('pro max') || nameLower.includes('ultra') || nameLower.includes('fold') || nameLower.includes('oled evo') || nameLower.includes('neo qled') || nameLower.includes('ambilight')) {
      score += 50;
    }
    if (p.basePrice >= 90000) score += 40;
    else if (p.basePrice >= 50000) score += 25;
    else if (p.basePrice >= 25000) score += 15;
    score += Math.min(20, (p.reviewCount || 0) / 50);
    return score;
  };

  const sortPopular = <T extends Product>(list: T[]): T[] => {
    return [...list].sort((a, b) => getPopularityScore(b) - getPopularityScore(a));
  };

  // Exact Ratios Required:
  // 40% Phones, 20% TVs, 10% Appliances, 10% Tablets, 10% Smartwatches, 10% Headphones
  const phoneCount = Math.round(total * 0.40); // 8 for 20
  const tvCount = Math.round(total * 0.20); // 4 for 20
  const applianceCount = Math.round(total * 0.10); // 2 for 20
  const tabletCount = Math.round(total * 0.10); // 2 for 20
  const smartwatchCount = Math.round(total * 0.10); // 2 for 20
  const headphoneCount = Math.round(total * 0.10); // 2 for 20

  // 1. Curated Top Phones: Apple, Samsung, Xiaomi, Oppo (2 from each brand for 8 total)
  const targetPhoneBrands = ['Apple', 'Samsung', 'Xiaomi', 'Oppo'];
  const curatedPhones: Product[] = [];
  targetPhoneBrands.forEach((brandName) => {
    const brandPhones = sortPopular(
      phones.filter((p) => p.brand.toLowerCase() === brandName.toLowerCase())
    );
    curatedPhones.push(...brandPhones.slice(0, 2));
  });

  // If any brand was missing, fill up from sorted popular phones
  if (curatedPhones.length < phoneCount) {
    const existingSlugs = new Set(curatedPhones.map((p) => p.slug));
    const remaining = sortPopular(phones).filter((p) => !existingSlugs.has(p.slug));
    curatedPhones.push(...remaining.slice(0, phoneCount - curatedPhones.length));
  }
  const topPhones = curatedPhones.slice(0, phoneCount);

  // 2. Curated Top TVs: Samsung, LG, Philips (Flagship OLED / Neo QLED / Ambilight models)
  const curatedTVs: Product[] = [];
  const targetTVBrands = ['Samsung', 'LG', 'Philips'];
  targetTVBrands.forEach((brandName) => {
    const brandTVs = sortPopular(
      tvs.filter((t) => t.brand.toLowerCase() === brandName.toLowerCase())
    );
    // Grab top 1 from each brand first
    if (brandTVs[0]) curatedTVs.push(brandTVs[0]);
  });
  // Add 1 more top flagship TV from Samsung/LG/Philips to reach tvCount (4)
  const existingTVSlugs = new Set(curatedTVs.map((t) => t.slug));
  const remainingTargetTVs = sortPopular(
    tvs.filter((t) => targetTVBrands.map((b) => b.toLowerCase()).includes(t.brand.toLowerCase()) && !existingTVSlugs.has(t.slug))
  );
  if (remainingTargetTVs.length > 0) {
    curatedTVs.push(remainingTargetTVs[0]);
  }
  const topTVs = curatedTVs.slice(0, tvCount);

  const topLaptops = sortPopular(all.filter((p) => p.category === 'laptops')).slice(0, 4);
  const topConsoles = sortPopular(all.filter((p) => p.category === 'consoles')).slice(0, 3);
  const topMonitors = sortPopular(all.filter((p) => p.category === 'monitors')).slice(0, 3);
  const topAppliances = sortPopular(appliances).slice(0, 4);
  const topTablets = sortPopular(tablets).slice(0, 3);
  const topSmartwatches = sortPopular(smartwatches).slice(0, 3);
  const topHeadphones = sortPopular(headphones).slice(0, 4);

  // Fallbacks: if any list is empty, borrow from top products or provide safe defaults
  const fallbackProduct = (cat: string, fallbackName: string): Product => ({
    id: `fallback-${cat}`,
    slug: `fallback-${cat}`,
    name: fallbackName,
    brand: 'Popüler Marka',
    category: cat as any,
    basePrice: 19999,
    currency: 'TL',
    rating: 4.8,
    reviewCount: 500,
    releaseYear: 2025,
    isPopular: true,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
    highlights: ['Popüler Trend Ürün', 'Resmi Distribütör Garantili', 'Yüksek Performans'],
    storeOffers: [],
    priceHistory: []
  });

  const safePhones = topPhones.length > 0 ? topPhones : [fallbackProduct('smartphones', 'Samsung Galaxy S26 Ultra')];
  const safeLaptops = topLaptops.length > 0 ? topLaptops : [fallbackProduct('laptops', 'Apple MacBook Pro 14" M3 Pro')];
  const safeTVs = topTVs.length > 0 ? topTVs : [fallbackProduct('tvs', 'LG OLED55C4 55" 4K OLED evo TV')];
  const safeAppliances = topAppliances.length > 0 ? topAppliances : [fallbackProduct('appliances', 'Dyson Gen5detect Kablosuz Süpürge')];
  const safeConsoles = topConsoles.length > 0 ? topConsoles : [fallbackProduct('consoles', 'Sony PlayStation 5 Pro 2TB')];
  const safeHeadphones = topHeadphones.length > 0 ? topHeadphones : [fallbackProduct('headphones', 'Sony WH-1000XM5 ANC Kulaklık')];
  const safeSmartwatches = topSmartwatches.length > 0 ? topSmartwatches : [fallbackProduct('smartwatches', 'Apple Watch Series 10 46mm')];
  const safeTablets = topTablets.length > 0 ? topTablets : [fallbackProduct('tablets', 'Apple iPad Pro 13" M4 OLED')];
  const safeMonitors = topMonitors.length > 0 ? topMonitors : [fallbackProduct('monitors', 'ASUS ROG Swift OLED 240Hz')];

  // Interleave harmoniously across all 9 categories:
  // Phone -> Laptop -> TV -> Appliance -> Console -> Headphone -> Watch -> Tablet -> Monitor
  const interleaved: Product[] = [];
  const pools = [
    { list: [...safePhones] },
    { list: [...safeLaptops] },
    { list: [...safeTVs] },
    { list: [...safeAppliances] },
    { list: [...safeConsoles] },
    { list: [...safeHeadphones] },
    { list: [...safeSmartwatches] },
    { list: [...safeTablets] },
    { list: [...safeMonitors] }
  ];

  while (interleaved.length < total) {
    let addedAny = false;
    for (const pool of pools) {
      if (pool.list.length > 0) {
        interleaved.push(pool.list.shift()!);
        addedAny = true;
        if (interleaved.length >= total) break;
      }
    }
    if (!addedAny) break;
  }

  return {
    total: interleaved.length,
    items: interleaved,
    categoryBreakdown: {
      smartphones: { count: safePhones.length, ratio: 0.25, items: safePhones },
      laptops: { count: safeLaptops.length, ratio: 0.15, items: safeLaptops },
      tvs: { count: safeTVs.length, ratio: 0.15, items: safeTVs },
      appliances: { count: safeAppliances.length, ratio: 0.10, items: safeAppliances },
      consoles: { count: safeConsoles.length, ratio: 0.10, items: safeConsoles },
      headphones: { count: safeHeadphones.length, ratio: 0.10, items: safeHeadphones },
      smartwatches: { count: safeSmartwatches.length, ratio: 0.05, items: safeSmartwatches },
      tablets: { count: safeTablets.length, ratio: 0.05, items: safeTablets },
      monitors: { count: safeMonitors.length, ratio: 0.05, items: safeMonitors }
    }
  };
}

/**
 * Returns products eligible for the 8-Store Live Price Comparison pool.
 * (Excludes non-Samsung/Apple products released before 2018).
 */
export async function getLivePriceComparisonProducts(): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter(isEligibleForLivePriceComparison);
}

/**
 * Returns historical/retro models (pre-2018 non-Samsung/Apple products).
 */
export async function getHistoricalRetroProducts(): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter(isHistoricalRetroModel);
}

