const fs = require('fs');
const path = require('path');

function searchSchemas(dir) {
  let matched = [];
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    if (entry === 'node_modules' || entry === '.next' || entry === '.git') continue;
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      matched = matched.concat(searchSchemas(fullPath));
    } else if (entry.endsWith('.tsx') || entry.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (
        content.includes('application/ld+json') ||
        content.includes('priceCurrency') ||
        content.includes('schema.org')
      ) {
        matched.push({
          file: fullPath.replace(process.cwd(), ''),
          hasLdJson: content.includes('application/ld+json'),
          hasPriceCurrency: content.includes('priceCurrency'),
          hasTL: content.includes("'TL'") || content.includes('"TL"')
        });
      }
    }
  }
  return matched;
}

console.log('Files with Schema/PriceCurrency/LD+JSON:');
console.log(JSON.stringify(searchSchemas(path.join(process.cwd(), 'src')), null, 2));
