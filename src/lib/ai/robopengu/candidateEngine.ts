// src/lib/ai/robopengu/candidateEngine.ts
/**
 * Worker 2: Product Candidate Engine
 * Deterministic candidate generation from real AceleEtme catalog (905 roots).
 * Guaranteed zero hallucinated IDs.
 */

import { ShoppingIntent } from './types';
import rawSmartphones from '@/lib/smartphonesData.json';

export interface CatalogProduct {
  id: string;
  name: string;
  brand: string;
  slug?: string;
  category?: string;
  price?: number;
  specs?: any;
  isCanonical?: boolean;
  isQuarantined?: boolean;
  identityHold?: boolean;
  [key: string]: any;
}

export class CandidateEngine {
  private static catalog: CatalogProduct[] = rawSmartphones as CatalogProduct[];

  public static getCatalog(): CatalogProduct[] {
    return this.catalog;
  }

  public static filterCandidates(
    intent: ShoppingIntent,
    options?: { customCatalog?: CatalogProduct[]; maxCandidates?: number }
  ): { candidates: CatalogProduct[]; totalMatched: number; filterLog: string[] } {
    const sourceCatalog = options?.customCatalog || this.catalog;
    const maxLimit = options?.maxCandidates || 50;
    const filterLog: string[] = [];

    // Step 1: Base Invariant Filtering (Canonical, not quarantined, valid ID)
    let filtered = sourceCatalog.filter(p => {
      if (!p || typeof p.id !== 'string' || !p.id.trim()) return false;
      if (p.isQuarantined || (p as any).quarantine) return false;
      if (p.identityHold) return false;
      if (p.isCanonical === false) return false;
      return true;
    });
    filterLog.push(`Baseline active canonical roots: ${filtered.length}`);

    // Step 2: Category Matching
    if (intent.category && intent.category !== 'unknown') {
      filtered = filtered.filter(p => {
        const cat = (p.category || 'smartphones').toLowerCase();
        return cat === intent.category || cat.includes(intent.category);
      });
      filterLog.push(`Category filtered (${intent.category}): ${filtered.length}`);
    }

    // Step 3: Brand Exclusion Filter (Strict)
    if (intent.excludedBrands && intent.excludedBrands.length > 0) {
      const lowerExcluded = intent.excludedBrands.map(b => b.toLowerCase());
      filtered = filtered.filter(p => {
        const brand = (p.brand || '').toLowerCase();
        const id = p.id.toLowerCase();
        const isExcluded = lowerExcluded.some(ex => brand === ex || brand.includes(ex) || id.startsWith(ex + '-'));
        return !isExcluded;
      });
      filterLog.push(`Excluded brands (${intent.excludedBrands.join(', ')}): ${filtered.length} remaining`);
    }

    // Step 4: Storage Minimum Filter
    if (intent.storageMinimumGb && intent.storageMinimumGb > 0) {
      const minGb = intent.storageMinimumGb;
      const storageFiltered = filtered.filter(p => {
        const cap = this.extractStorageGb(p);
        return cap !== null && cap >= minGb;
      });
      // If we found models meeting minimum storage, apply strictly.
      if (storageFiltered.length > 0) {
        filtered = storageFiltered;
        filterLog.push(`Storage filter (>= ${minGb} GB): ${filtered.length} remaining`);
      } else {
        filterLog.push(`Storage filter (>= ${minGb} GB): No direct match, retaining fallback set`);
      }
    }

    // Step 5: Budget Filtering
    if (intent.budget && intent.budget.max && intent.budget.max > 0) {
      const maxBudget = intent.budget.max;
      // Default to at least 35% of max budget so we suggest relevant modern models rather than legacy scrap
      const minBudget = intent.budget.min || Math.max(0, maxBudget * 0.35);

      let withinBudget = filtered.filter(p => {
        const price = this.getNumericPrice(p);
        if (price === null) return false;
        if (intent.budget!.isStrict) {
          return price <= maxBudget && price >= minBudget;
        } else {
          // Allow up to 10% tolerance if flexible
          return price <= maxBudget * 1.10 && price >= minBudget;
        }
      });

      if (withinBudget.length > 0) {
        filtered = withinBudget;
        filterLog.push(`Budget filtered (<= ${maxBudget} TL): ${filtered.length} remaining`);
      } else {
        filterLog.push(`Budget filter (<= ${maxBudget} TL): 0 within budget, keeping nearest affordable models`);
        // Sort by distance to budget
        filtered.sort((a, b) => {
          const pA = this.getNumericPrice(a) || 999999;
          const pB = this.getNumericPrice(b) || 999999;
          return Math.abs(pA - maxBudget) - Math.abs(pB - maxBudget);
        });
      }
    }

    // Step 6: Preferred Brand Prioritization
    if (intent.preferredBrands && intent.preferredBrands.length > 0) {
      const lowerPref = intent.preferredBrands.map(b => b.toLowerCase());
      const preferred = filtered.filter(p => {
        const brand = (p.brand || '').toLowerCase();
        return lowerPref.some(pf => brand === pf || brand.includes(pf));
      });
      if (preferred.length >= 3) {
        filtered = preferred;
        filterLog.push(`Preferred brand filter applied (${intent.preferredBrands.join(', ')}): ${filtered.length}`);
      }
    }

    const totalMatched = filtered.length;
    const finalCandidates = filtered.slice(0, maxLimit);

    return {
      candidates: finalCandidates,
      totalMatched,
      filterLog,
    };
  }

  public static extractStorageGb(p: CatalogProduct): number | null {
    if (p.specs?.storageGb) return Number(p.specs.storageGb);
    if (p.specs?.memory?.storageGb) return Number(p.specs.memory.storageGb);
    if (p.specs?.storage) {
      const m = String(p.specs.storage).match(/(\d+)\s*(?:gb|tb)/i);
      if (m) {
        let v = parseInt(m[1], 10);
        if (String(p.specs.storage).toLowerCase().includes('tb')) v *= 1024;
        return v;
      }
    }
    const nameMatch = p.name.match(/(\d+)\s*(GB|TB)/i) || p.id.match(/(\d+)-(?:gb|tb)/i);
    if (nameMatch) {
      let v = parseInt(nameMatch[1], 10);
      if (nameMatch[2]?.toUpperCase() === 'TB' || p.name.toLowerCase().includes('tb')) v *= 1024;
      return v;
    }
    return null;
  }

  public static getNumericPrice(p: CatalogProduct): number | null {
    if (typeof p.price === 'number' && p.price > 0) return p.price;
    if (typeof (p as any).currentPrice === 'number' && (p as any).currentPrice > 0) return (p as any).currentPrice;
    if (typeof (p as any).basePrice === 'number' && (p as any).basePrice > 0) return (p as any).basePrice;
    return null;
  }
}
