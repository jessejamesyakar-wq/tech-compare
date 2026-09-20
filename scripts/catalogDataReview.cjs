// Pending data is intentionally absent. A source review must explicitly release
// each field before an importer can populate it again.
function hasValue(value) {
  if (value == null || value === '') return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

function checkPendingCatalogData(products, entries) {
  const errors = [], seen = new Set();
  for (const entry of entries) {
    if (seen.has(entry.id)) errors.push(`Duplicate data review: ${entry.id}`);
    seen.add(entry.id);
    const matches = products.filter(p => p.id === entry.id);
    if (matches.length !== 1) { errors.push(`Data review needs one exact product: ${entry.id}`); continue; }
    if (!Array.isArray(entry.fieldsAwaitingSource) || !entry.fieldsAwaitingSource.length) {
      errors.push(`Data review needs explicit pending fields: ${entry.id}`); continue;
    }
    for (const field of entry.fieldsAwaitingSource) {
      const value = field.split('.').reduce((value, key) => value?.[key], matches[0]);
      if (hasValue(value)) errors.push(`Unverified field restored before source review: ${entry.id}:${field}`);
    }
  }
  return errors;
}
module.exports = { checkPendingCatalogData };
