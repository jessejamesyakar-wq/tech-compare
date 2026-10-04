/**
 * Product Identity Normalizer for Catalog Governance & Duplicate Detection
 * 
 * Preserves identity-significant commercial tokens:
 * - '+' (e.g., S21 vs S21+, Realme 16 Pro vs Pro+, Roborock S9 vs S9+)
 * - 'pro+', 'ultra', 'max', 'fe', 'se', 'plus', 'pro'
 * Converts Turkish diacritics to ASCII standard.
 * Strips non-identity punctuation while preserving commercial tokens.
 */

export function normalizeProductIdentity(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9+]/g, ' ')
    .replace(/\s*\+\s*/g, '+ ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildProductIdentityKey(brand: string, name: string, category: string): string {
  const normBrand = (brand || '').toLowerCase().trim();
  const normName = normalizeProductIdentity(name);
  const normCat = (category || '').toLowerCase().trim();
  return `${normBrand}|${normName}|${normCat}`;
}
