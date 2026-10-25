import type { Product } from '../types';
import type { ConversationTurn } from './conversation';

const normalize = (s: string) => s.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i');
const comparisonIntent = (s: string) => /kiyas|karsilastir|\bvs\b|fark|hangisi/.test(normalize(s));
const tvIntent = (s: string) => /televizyon|\btv\b|\boled\b|\bqled\b|\bqned\b/.test(normalize(s));

/** Require unique TV model codes; do not silently substitute a screen size or regional SKU. */
export function televisionComparisonRequest(prompt: string, history: ConversationTurn[], catalog: Product[]): { products?: Product[]; message?: string } | null {
  const input = normalize(prompt), tokens = input.match(/[a-z0-9-]+/g) || [];
  const identifiers = new Set(tokens);
  const televisions = catalog.filter(p => p.category === 'tvs');
  const explicitIdentifiers = new Set(televisions.flatMap(p => [p.id, p.slug]).filter(id => id && identifiers.has(id.toLowerCase())).map(id => id.toLowerCase()));
  const words = new Set(tokens.filter(token => !explicitIdentifiers.has(token)).join(' ').match(/[a-z0-9]+/g) || []);
  const candidates = televisions.map(p => {
    const explicit = [p.id, p.slug].find(id => id && identifiers.has(id.toLowerCase()));
    if (explicit) return { product: p, codes: [explicit.toLowerCase()] };
    const codes = [p.model, p.mpn, p.sku, ...p.name.split(/[^a-zA-Z0-9]+/)].filter((v): v is string => !!v)
      .map(normalize).filter(v => v.length >= 4 && /[a-z]/.test(v) && /\d.*\d/.test(v) && !/^(?:hdmi|webos|android|gen|hdr)\d|^\d+(?:hz|khz|w|nit|nits|gb|inch)$/.test(v));
    return { product: p, codes: codes.filter(code => words.has(code)) };
  }).filter(match => match.codes.length).sort((a, b) => Math.min(...a.codes.map(code => input.indexOf(code))) - Math.min(...b.codes.map(code => input.indexOf(code))));
  const hits = candidates.map(match => match.product);
  const prior = history.filter(t => t.role === 'user').at(-1)?.content || '';
  const continuation = comparisonIntent(prior) && tvIntent(prior) && hits.length > 0;
  if (!comparisonIntent(prompt) && !continuation) return null;
  if (!tvIntent(prompt) && !hits.length && !continuation) return null;
  if (candidates.some(match => match.codes.every(code => candidates.filter(other => other.codes.includes(code)).length > 1))) return { message: 'Bu model kodu katalogda birden fazla kayıtla eşleşiyor. Yanlış özellikleri karıştırmamak için iki ürünün aceleEtme ürün bağlantısını paylaşır mısın?' };
  if (hits.length !== 2) return { message: hits.length > 2
    ? 'Birden fazla televizyon eşleşti. Ekran boyutu ve tam model koduyla iki modeli netleştirelim; farklı varyantları senin yerine seçmeyeyim.'
    : 'Hangi iki televizyonu kıyaslayalım? İkisinin tam model kodunu ve varsa ekran boyutunu yaz. Fotoğraflarını ve özelliklerini yan yana açacağım.' };
  return { products: hits };
}
