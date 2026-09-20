import type { Product } from './types';
import { hasUnresolvedSpecField } from './specVerification';

export type ExtensionProductMatch =
  | { status: 'matched'; product: Product }
  | { status: 'not_found' | 'ambiguous' | 'variant_required'; product: null };

function normalize(text: string): string {
  return text.replace(/İ/g, 'i').replace(/ı/g, 'i').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[–—−]/g, '-').replace(/\s+/g, ' ').trim();
}

type TitleParts = { core: string; storage?: number; ram?: number; network?: string; invalid: boolean };

/** Parse only explicit units/roles. Unlabelled 8/256 or mixed capacity lists
 * must not become an invented storage/RAM selection. All other title words,
 * including Pro/Max/Plus/FE, colors, condition and bundles, remain identity. */
function parseTitle(title: string, brand: string): TitleParts {
  const capacities: { value: number; role: string }[] = [];
  let invalid = false;
  let text = normalize(title).replace(
    /\b(?:(ram|rom|ssd|hdd|depolama)\s*:?\s*)?(\d+(?:[.,]\d+)?)\s*(gb|tb)\s*(ram|rom|ssd|hdd|depolama)?\b/g,
    (_all, before: string | undefined, amount: string, unit: string, after: string | undefined) => {
      if (before && after && (before === 'ram') !== (after === 'ram')) invalid = true;
      const value = Number(amount.replace(',', '.')) * (unit === 'tb' ? 1024 : 1);
      if (!Number.isFinite(value) || value <= 0) invalid = true;
      capacities.push({ value, role: before || after || '' });
      return ' ';
    },
  );
  const ram = [...new Set(capacities.filter(c => c.role === 'ram').map(c => c.value))];
  const storage = [...new Set(capacities.filter(c => c.role !== 'ram').map(c => c.value))];
  if (ram.length > 1 || storage.length > 1) invalid = true;
  const networks = [...new Set(text.match(/\b[2345]g\b/g) || [])];
  if (networks.length > 1) invalid = true;
  text = text.replace(/\b[2345]g\b/g, ' ');
  // Category descriptions are not model identifiers. Do not remove warranty,
  // accessories, colors or technical values merely to force a title to match.
  text = text.replace(/\b(?:akilli telefon|cep telefonu|tablet bilgisayar|dizustu bilgisayar|oyuncu monitoru|oyun konsolu)\b/g, ' ');
  const tokenize = (value: string) => value.replace(/\+/g, ' plus ')
    .replace(/\bpromax\b/g, 'pro max')
    .replace(/([a-z])(\d)/g, '$1 $2').replace(/(\d)([a-z])/g, '$1 $2')
    .replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
  let core = tokenize(text);
  const brandKey = tokenize(normalize(brand));
  if (brandKey && (core === brandKey || core.startsWith(brandKey + ' '))) core = core.slice(brandKey.length).trim();
  return { core, storage: storage[0], ram: ram[0], network: networks[0], invalid };
}

function positiveNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : undefined;
}

function recordedMemory(product: Product, key: 'storageGb' | 'ramGb'): number | undefined {
  if (hasUnresolvedSpecField(product, `memory.${key}|${key}`)) return undefined;
  const specs = product.specs as unknown as Record<string, unknown>;
  const nested = specs?.memory as Record<string, unknown> | undefined;
  return positiveNumber(nested?.[key]) ?? positiveNumber(specs?.[key])
    ?? (key === 'storageGb' ? positiveNumber(product.storageGb) : undefined);
}

/** Identity is resolved against the entire catalog BEFORE looking at prices.
 * An available/cheap sibling must never win over an unavailable exact model.
 * Exact catalog identifiers are supported; title matching has no fuzzy score,
 * fallback flagship, default capacity or catalog-order tie breaker. */
export function matchExtensionProduct(query: string, products: readonly Product[]): ExtensionProductMatch {
  const input = query.trim();
  const exact = products.filter(p => [p.id, p.slug].some(id => id?.toLowerCase() === input.toLowerCase()));
  if (exact.length) return exact.length === 1 ? { status: 'matched', product: exact[0] } : { status: 'ambiguous', product: null };
  const candidates: Product[] = [];
  let needsVariant = false;
  for (const product of products) {
    const requested = parseTitle(input, product.brand);
    const named = parseTitle(product.name, product.brand);
    if (requested.invalid || named.invalid || !requested.core || requested.core !== named.core) continue;
    const storage = recordedMemory(product, 'storageGb');
    const ram = recordedMemory(product, 'ramGb');
    // Contradictory catalog title/specs cannot prove an exact capacity.
    if (named.storage !== undefined && storage !== undefined && named.storage !== storage) continue;
    if (named.ram !== undefined && ram !== undefined && named.ram !== ram) continue;
    const productStorage = named.storage ?? storage;
    const productRam = named.ram ?? ram;
    if (requested.storage === undefined && productStorage !== undefined) { needsVariant = true; continue; }
    if (requested.storage !== undefined && requested.storage !== productStorage) continue;
    if (requested.ram !== undefined && requested.ram !== productRam) continue;
    if (named.ram !== undefined && requested.ram === undefined) { needsVariant = true; continue; }
    if (named.network && requested.network !== named.network) { if (!requested.network) needsVariant = true; continue; }
    if (requested.network && !named.network) {
      const specs = product.specs as unknown as { connectivity?: { has5G?: boolean } };
      if (requested.network !== '5g' || specs?.connectivity?.has5G !== true || hasUnresolvedSpecField(product, 'connectivity.has5G')) continue;
    }
    candidates.push(product);
  }
  // A known underspecified sibling is also ambiguity, even if one base record
  // happened not to include the missing variant in its title.
  if (candidates.length > 1 || (candidates.length && needsVariant)) return { status: 'ambiguous', product: null };
  if (candidates.length === 1) return { status: 'matched', product: candidates[0] };
  return { status: needsVariant ? 'variant_required' : 'not_found', product: null };
}
