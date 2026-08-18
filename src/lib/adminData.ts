import { Product } from './types';
import { mockSmartphones } from './mockData';
import { mockTVs } from './mockTVs';
import { mockLaptops } from './mockLaptops';
import { mockTablets } from './mockTablets';
import { mockSmartwatches } from './mockSmartwatches';
import { mockHeadphones } from './mockHeadphones';
import { mockConsoles } from './mockConsoles';
import { mockAppliances } from './mockAppliances';

const allMockProducts: Product[] = [
  ...mockSmartphones,
  ...mockTVs,
  ...mockLaptops,
  ...mockTablets,
  ...mockSmartwatches,
  ...mockHeadphones,
  ...mockConsoles,
  ...mockAppliances
];

// In-memory product store initialized strictly from mockData files
let memoryProductsCache: Product[] = allMockProducts;

// 1. Get all stored products directly from mock data
export function getStoredProducts(): Product[] {
  return memoryProductsCache;
}

// 2. Save / Update Product in memory
export async function saveProduct(product: Product): Promise<void> {
  const idx = memoryProductsCache.findIndex((p) => p.id === product.id);
  if (idx >= 0) {
    memoryProductsCache[idx] = product;
  } else {
    memoryProductsCache.push(product);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('tech_admin_data_updated'));
  }
}

// 3. Delete Product from memory
export async function deleteProduct(productId: string): Promise<void> {
  memoryProductsCache = memoryProductsCache.filter((p) => p.id !== productId);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('tech_admin_data_updated'));
  }
}

// 4. Reset to Factory Default from mock data
export async function resetToFactoryDefault(): Promise<void> {
  memoryProductsCache = [...allMockProducts];

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('tech_admin_data_updated'));
  }
}

// 5. Export Backup JSON
export function exportBackupJSON(): void {
  if (typeof window === 'undefined') return;
  const products = getStoredProducts();
  const jsonStr = JSON.stringify(products, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `TechKiyas_Urun_Yedegi_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// 6. Import Backup JSON
export function importBackupJSON(jsonStr: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const importedProducts: Product[] = JSON.parse(jsonStr);
    if (!Array.isArray(importedProducts)) throw new Error('Geçersiz yedek dosyası');

    importedProducts.forEach((p) => {
      if (p.id && p.name) {
        saveProduct(p);
      }
    });

    window.dispatchEvent(new Event('tech_admin_data_updated'));
    return importedProducts.length;
  } catch (e) {
    console.error('Import failed', e);
    alert('Yedek dosyası okunamadı. Lütfen geçerli bir .json dosyası seçiniz.');
    return 0;
  }
}
