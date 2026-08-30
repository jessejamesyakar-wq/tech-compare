const fs = require('fs');
const path = require('path');

const staging = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/icecat_staging_preview.json'), 'utf8'));

// Categorize all items
const byCategory = {};
staging.items.forEach(it => {
  if (!byCategory[it.category]) {
    byCategory[it.category] = { total: 0, staged: 0 };
  }
  byCategory[it.category].total++;
  if (it.extractedCode) byCategory[it.category].staged++;
});

console.log('=== KATEGORİ BAZLI TAM DAĞILIM ===');
console.table(byCategory);
