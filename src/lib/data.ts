import { mockSmartphones, popularComparisonsList } from './mockData';
import { mockTVs } from './mockTVs';
import { Product, Smartphone, TVProduct, LaptopProduct, ApplianceProduct, FilterOptions } from './types';
import { getStoredProducts } from './adminData';

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
  const decoded = decodeURIComponent(id).toLowerCase().trim();
  const all = getStoredProducts();
  return all.find(
    (p) =>
      p.id.toLowerCase() === decoded ||
      p.slug.toLowerCase() === decoded ||
      p.slug.toLowerCase().replace(/_/g, '-') === decoded.replace(/_/g, '-') ||
      p.name.toLowerCase() === decoded
  );
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
  // Fallback check if it's in all products
  const anyProduct = all.find(
    (p) =>
      p.id.toLowerCase() === decoded ||
      p.slug.toLowerCase() === decoded ||
      p.slug.toLowerCase().replace(/_/g, '-') === decoded.replace(/_/g, '-')
  );
  return anyProduct as Smartphone | undefined;
}

export async function getTabletById(id: string): Promise<Product | undefined> {
  const decoded = decodeURIComponent(id).toLowerCase().trim();
  const all = getStoredProducts();
  return all.find(
    (p) =>
      (p.id.toLowerCase() === decoded ||
        p.slug.toLowerCase() === decoded ||
        p.slug.toLowerCase().replace(/_/g, '-') === decoded.replace(/_/g, '-') ||
        p.name.toLowerCase() === decoded) &&
      p.category === 'tablets'
  );
}

export async function getSmartwatchById(id: string): Promise<Product | undefined> {
  const decoded = decodeURIComponent(id).toLowerCase().trim();
  const all = getStoredProducts();
  return all.find(
    (p) =>
      (p.id.toLowerCase() === decoded ||
        p.slug.toLowerCase() === decoded ||
        p.slug.toLowerCase().replace(/_/g, '-') === decoded.replace(/_/g, '-') ||
        p.name.toLowerCase() === decoded) &&
      p.category === 'smartwatches'
  );
}

export async function getHeadphoneById(id: string): Promise<Product | undefined> {
  const decoded = decodeURIComponent(id).toLowerCase().trim();
  const all = getStoredProducts();
  return all.find(
    (p) =>
      (p.id.toLowerCase() === decoded ||
        p.slug.toLowerCase() === decoded ||
        p.slug.toLowerCase().replace(/_/g, '-') === decoded.replace(/_/g, '-') ||
        p.name.toLowerCase() === decoded) &&
      p.category === 'headphones'
  );
}

export async function getConsoleById(id: string): Promise<Product | undefined> {
  const decoded = decodeURIComponent(id).toLowerCase().trim();
  const all = getStoredProducts();
  return all.find(
    (p) =>
      (p.id.toLowerCase() === decoded ||
        p.slug.toLowerCase() === decoded ||
        p.slug.toLowerCase().replace(/_/g, '-') === decoded.replace(/_/g, '-') ||
        p.name.toLowerCase() === decoded) &&
      p.category === 'consoles'
  );
}

export async function getTVById(id: string): Promise<TVProduct | undefined> {
  const decoded = decodeURIComponent(id).toLowerCase().trim();
  const all = getStoredProducts();
  return all.find(
    (p) =>
      (p.id.toLowerCase() === decoded ||
        p.slug.toLowerCase() === decoded ||
        p.slug.toLowerCase().replace(/_/g, '-') === decoded.replace(/_/g, '-') ||
        p.name.toLowerCase() === decoded) &&
      p.category === 'tvs'
  ) as TVProduct | undefined;
}

export async function getLaptopById(id: string): Promise<LaptopProduct | undefined> {
  const decoded = decodeURIComponent(id).toLowerCase().trim();
  const all = getStoredProducts();
  return all.find(
    (p) =>
      (p.id.toLowerCase() === decoded ||
        p.slug.toLowerCase() === decoded ||
        p.slug.toLowerCase().replace(/_/g, '-') === decoded.replace(/_/g, '-') ||
        p.name.toLowerCase() === decoded) &&
      p.category === 'laptops'
  ) as LaptopProduct | undefined;
}

export async function getApplianceById(id: string): Promise<ApplianceProduct | undefined> {
  const decoded = decodeURIComponent(id).toLowerCase().trim();
  const all = getStoredProducts();
  return all.find(
    (p) =>
      (p.id.toLowerCase() === decoded ||
        p.slug.toLowerCase() === decoded ||
        p.slug.toLowerCase().replace(/_/g, '-') === decoded.replace(/_/g, '-') ||
        p.name.toLowerCase() === decoded) &&
      p.category === 'appliances'
  ) as ApplianceProduct | undefined;
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
        phones.sort((a, b) => b.releaseYear - a.releaseYear);
        break;
      case 'rating':
      case 'popular':
      default:
        phones.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }
  } else {
    phones.sort((a, b) => (b.rating || 0) - (a.rating || 0));
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

export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const all = getStoredProducts();
  return all.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.highlights.some((h) => h.toLowerCase().includes(q))
  );
}

export async function searchSmartphones(query: string): Promise<Smartphone[]> {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const smartphones = await getAllSmartphones();
  return smartphones.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.highlights.some((h) => h.toLowerCase().includes(q))
  );
}
