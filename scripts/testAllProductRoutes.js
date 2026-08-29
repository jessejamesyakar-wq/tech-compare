const fs = require('fs');
const path = require('path');

// Load smartphonesData.json and other json / mock files
const smartphones = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/lib/smartphonesData.json'), 'utf8'));

// Mock categories
function parseExportArray(filePath, varName) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Simple extraction of objects or evaluate
  return [];
}

console.log('Testing total smartphones:', smartphones.length);

const failures = [];

smartphones.forEach(p => {
  const id = p.id;
  const slug = p.slug;

  // Let's test the lookup logic in data.ts
  const decodedSlug = decodeURIComponent(slug).toLowerCase().trim();
  const decodedId = decodeURIComponent(id).toLowerCase().trim();

  // Test slug matching
  const matchBySlug = smartphones.find(item =>
    item.id.toLowerCase() === decodedSlug ||
    item.slug.toLowerCase() === decodedSlug ||
    item.slug.toLowerCase().replace(/_/g, '-') === decodedSlug.replace(/_/g, '-') ||
    item.name.toLowerCase() === decodedSlug
  );

  if (!matchBySlug) {
    failures.push({ type: 'slug_mismatch', product: p.name, id, slug });
  }

  // Test ID matching
  const matchById = smartphones.find(item =>
    item.id.toLowerCase() === decodedId ||
    item.slug.toLowerCase() === decodedId ||
    item.slug.toLowerCase().replace(/_/g, '-') === decodedId.replace(/_/g, '-') ||
    item.name.toLowerCase() === decodedId
  );

  if (!matchById) {
    failures.push({ type: 'id_mismatch', product: p.name, id, slug });
  }
});

console.log('Smartphones lookup failures:', failures.length);

// Check if any product has missing slug or empty slug
const missingSlugs = smartphones.filter(p => !p.slug || p.slug.trim() === '');
console.log('Smartphones with missing/empty slug:', missingSlugs.length);

