/**
 * Canonical Catalog Governance Exclusions Registry (Single Source of Truth)
 * 
 * Defines the authoritative set of quarantined and excluded product IDs:
 * 1. Legacy Duplicate Ghost Roots (Huawei raw catalog trailing-space duplicate roots)
 * 2. Future Unreleased Quarantine Roots (Oppo 2027 future lineup quarantined pending launch)
 * 
 * Total Canonical Exclusions: EXACTLY 6
 * Raw Source Count: 5,820
 * Canonical Safe Count: 5,814
 */

export interface CanonicalExclusionRecord {
  id: string;
  category: 'smartphones';
  reason: 'LEGACY_DUPLICATE_GHOST' | 'FUTURE_PRODUCT_QUARANTINE';
  description: string;
}

export const CANONICAL_EXCLUSIONS_REGISTRY: CanonicalExclusionRecord[] = [
  // 1. Quarantined Future Products (2 items)
  {
    id: 'oppo-k14-turbo-pro-512gb-2027',
    category: 'smartphones',
    reason: 'FUTURE_PRODUCT_QUARANTINE',
    description: 'Quarantined future 2027 unreleased lineup'
  },
  {
    id: 'oppo-k14-turbo-256gb-2027',
    category: 'smartphones',
    reason: 'FUTURE_PRODUCT_QUARANTINE',
    description: 'Quarantined future 2027 unreleased lineup'
  },
  // 2. Legacy Duplicate Ghost Records (4 items)
  {
    id: 'huawei-huawei-y9-1',
    category: 'smartphones',
    reason: 'LEGACY_DUPLICATE_GHOST',
    description: 'Legacy raw catalog trailing-space duplicate root for Huawei Y9'
  },
  {
    id: 'huawei-huawei-mate-60-pro-1',
    category: 'smartphones',
    reason: 'LEGACY_DUPLICATE_GHOST',
    description: 'Legacy raw catalog trailing-space duplicate root for Huawei Mate 60 Pro'
  },
  {
    id: 'huawei-huawei-p40-pro-1',
    category: 'smartphones',
    reason: 'LEGACY_DUPLICATE_GHOST',
    description: 'Legacy raw catalog trailing-space duplicate root for Huawei P40 Pro'
  },
  {
    id: 'huawei-huawei-pura-70-pro-1',
    category: 'smartphones',
    reason: 'LEGACY_DUPLICATE_GHOST',
    description: 'Legacy raw catalog trailing-space duplicate root for Huawei Pura 70 Pro'
  }
];

export const CANONICAL_EXCLUDED_ID_SET: ReadonlySet<string> = new Set(
  CANONICAL_EXCLUSIONS_REGISTRY.map((r) => r.id)
);

export function isCanonicalExcluded(id?: string | null): boolean {
  if (!id) return false;
  return CANONICAL_EXCLUDED_ID_SET.has(id);
}

export function filterCanonicalSafeProducts<T extends { id: string }>(products: T[]): T[] {
  return products.filter((p) => !isCanonicalExcluded(p.id));
}
