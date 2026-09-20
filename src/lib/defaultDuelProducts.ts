import rawSmartphones from './smartphonesData.json';
import type { Product } from './types';
import { DUEL_PRESETS } from './duelPresets';

// Imported by the server page only: never ship the complete catalog to the browser.
const list = rawSmartphones as unknown as Product[];

function exactDefault(slug: string): Product {
  const matches = list.filter(product => product.slug === slug);
  if (matches.length !== 1) throw new Error(`Default comparison product is missing or ambiguous: ${slug}`);
  return matches[0];
}

export const DEFAULT_DUEL_P1 = exactDefault(DUEL_PRESETS.smartphones.ids[0]);
export const DEFAULT_DUEL_P2 = exactDefault(DUEL_PRESETS.smartphones.ids[1]);
