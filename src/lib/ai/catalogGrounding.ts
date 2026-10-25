import type { Product } from '../types';
import { getComparisonRows } from '../comparisonEvidence';

const normalize = (value: string) => value.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i').replace(/['’]/g, '').replace(/([a-z])(\d)/g, '$1 $2').replace(/(\d)([a-z])/g, '$1 $2').replace(/promax/g, 'pro max').replace(/\b(pro|max|ultra|plus|mini|air)(?:yu|yi|nun|nin|ya|ye|da|de|dan|den)\b/g, '$1').replace(/[^a-z0-9]+/g, ' ').trim();
const iphoneIdentity = /\biphone\s+(\d+)\s*(pro\s+max|pro|plus|mini|air|e)?\b/g;

/** Exact named families, never a fuzzy substitution of Pro Max for Pro. */
export function namedCatalogLookup(query: string, catalog: Product[]) {
  const input = normalize(query);
  const phones = [...input.matchAll(iphoneIdentity)];
  const storage = input.match(/\b(\d+)\s+(gb|tb)\b/)?.slice(1).join(' ');
  if (phones.length > 1) return null; // Leave multi-product questions to comparison resolution.
  if (phones.length === 1) {
    const identity = `iphone ${phones[0][1]}${phones[0][2] ? ` ${phones[0][2]}` : ''}`;
    const products = catalog.filter(p => {
      const name = normalize(p.name);
      const match = [...name.matchAll(iphoneIdentity)][0];
      return p.category === 'smartphones' && match && `iphone ${match[1]}${match[2] ? ` ${match[2]}` : ''}` === identity
        && (!storage || (` ${name} `).includes(` ${storage} `));
    });
    return { name: identity, products };
  }
  // Read aliases from catalog names rather than maintaining a list of current releases.
  const matches = catalog.flatMap(product => {
    const name = normalize(product.name.split('(')[0]).replace(/\s+\d+\s+(?:gb|tb)\b.*$/, '').trim();
    const brand = normalize(product.brand || '');
    const alias = brand && name.startsWith(`${brand} `) ? name.slice(brand.length + 1) : name;
    if (alias.length < 5 || !/\d/.test(alias) || !(` ${input} `).includes(` ${alias} `)) return [];
    return [{ product, alias }];
  });
  const families = [...new Set(matches.map(m => m.alias))].filter(alias => !matches.some(m => m.alias !== alias && m.alias.startsWith(`${alias} `)));
  if (families.length !== 1) return null;
  return { name: families[0], products: matches.filter(m => m.alias === families[0]).map(m => m.product) };
}

export function isCatalogPresenceQuestion(query: string): boolean {
  const input = normalize(query);
  // "Telefoto var mı?" asks about a feature, not whether the product is listed.
  if (/kamera|telefoto|ekran|batarya|pil|islemci|ozellik|hdmi|oled|nfc|esim|stok|satista|satis|cikti|duyuru|piyasa|fiyat/.test(input)) return false;
  return /\b(?:var mi|yok|yok mu|katalogda|katalog|bulamiyorum|goremiyorum|mevcut mu|listeleniyor mu)\b/.test(input);
}

/** Only record presence is asserted; it does not prove launch, stock or verified specifications. */
export function catalogPresenceReply(lookup: NonNullable<ReturnType<typeof namedCatalogLookup>>) {
  if (!lookup.products.length) return `${lookup.name} için bu ad ve kapasiteyle eşleşen bir katalog kaydı bulamadım. Bu, ürünün hiç olmadığı veya piyasaya çıkmadığı anlamına gelmez. Tam model adını ya da ürün bağlantısını paylaşabilir misin?`;
  const names = [...new Set(lookup.products.map(p => p.name))];
  return `Evet, aceleEtme kataloğunda kayıtlı:\n${names.slice(0, 6).map(name => `• ${name}`).join('\n')}${names.length > 6 ? '\nDiğer varyantlar da katalogda bulunuyor.' : ''}\n\nKatalogda bulunması, satışta olduğunu veya özelliklerinin bağımsız olarak doğrulandığını tek başına göstermez.${names.length > 1 ? '\nHangi kapasiteyi inceleyelim?' : '\nHangi özelliğini inceleyelim?'}`;
}

export function catalogTechnicalContext(products: Product[]) {
  return products.slice(0, 4).map(product => ({
    id: product.id, name: product.name, category: product.category,
    recordStatus: 'PRESENT_IN_CATALOG_NOT_PROOF_OF_RELEASE_OR_STOCK',
    specifications: getComparisonRows([product]).filter(row => !['price', 'score', 'year'].includes(row.id))
      .slice(0, 40).map(row => ({ label: row.label, recordedValue: row.getValue(product) })),
  }));
}
