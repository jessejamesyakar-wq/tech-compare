import type { CatalogCategory } from './categoryMatcher';
import type { Product } from '../types';
import { getComparisonRows, getRowWinnerId } from '../comparisonEvidence';

// Chat and the duel use the same unit, missing-data and comparison rules.
export function buildComparisonRows(products: Product[], category: CatalogCategory) {
  if (products.some(p => p.category !== category)) return [];
  return getComparisonRows(products).map(row => {
    const values = products.map(row.getValue);
    const winnerId = getRowWinnerId(row, products);
    const superiorIdx = winnerId ? products.findIndex(p => p.id === winnerId) : null;
    const label = row.category.toLocaleLowerCase('tr-TR');
    const group = /ekran/.test(label) ? 'screen' : /işlemci|bellek|depolama/.test(label) ? 'processor'
      : /kamera|ses/.test(label) ? 'camera' : /batarya|enerji/.test(label) ? 'battery'
      : /gövde|kasa/.test(label) ? 'build' : 'general';
    return { key: row.id, label: row.label, group, values,
      isDifferent: values.some(v => v !== values[0]),
      superiorIdx, highlightIdx: superiorIdx };
  });
}
