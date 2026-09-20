// IDs and slugs are resolved globally by the public API, not within one dataset.
function findCatalogIdentityConflicts(datasets) {
  const ids = new Map(), slugs = new Map(), errors = [];
  for (const [category, products] of datasets) {
    for (const product of products) {
      if (product.category && product.category !== category) {
        errors.push(`[${category}] Category mismatch for "${product.id}": record declares "${product.category}".`);
      }
      // These LG monitor families were previously imported through a TV template.
      // Stop for source review instead of silently moving or inventing specifications.
      if (category === 'tvs' && /^lg$/i.test(product.brand || '') && /\b(?:UltraGear|UltraWide|UltraFine|MyView)\b/i.test(product.name || '')) {
        errors.push(`[tvs] LG monitor-family record "${product.id}" requires category verification before import.`);
      }
      for (const [field, seen] of [['id', ids], ['slug', slugs]]) {
        const value = product[field];
        if (!value) continue; // Missing fields are reported by the existing record checks.
        const previous = seen.get(value);
        if (previous) errors.push(`[${category}] Duplicate global ${field}: "${value}"; already used in [${previous}].`);
        else seen.set(value, category);
      }
    }
  }
  return errors;
}
module.exports = { findCatalogIdentityConflicts };
