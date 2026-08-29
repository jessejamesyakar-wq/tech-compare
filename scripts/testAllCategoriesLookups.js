const fs = require('fs');
const path = require('path');

// Check adminData.ts and data.ts
const adminData = fs.readFileSync(path.join(__dirname, '../src/lib/adminData.ts'), 'utf8');

console.log('Checking all mock files and data lookup implementations...');

// Check if any category has products where slug and id are formatted differently or missing
const mockFiles = [
  'mockTVs.ts',
  'mockLaptops.ts',
  'mockAppliances.ts',
  'mockMonitors.ts',
  'mockSmartwatches.ts',
  'mockHeadphones.ts',
  'mockTablets.ts',
  'mockConsoles.ts'
];

mockFiles.forEach(file => {
  const content = fs.readFileSync(path.join(__dirname, '../src/lib', file), 'utf8');
  
  // Extract IDs
  const idRegex = /id:\s*['"]([^'"]+)['"]/g;
  const slugRegex = /slug:\s*['"]([^'"]+)['"]/g;
  
  const ids = [];
  const slugs = [];
  
  let m;
  while ((m = idRegex.exec(content)) !== null) ids.push(m[1]);
  while ((m = slugRegex.exec(content)) !== null) slugs.push(m[1]);
  
  console.log(`${file} => Found IDs: ${ids.length}, Slugs: ${slugs.length}`);
  
  // Check if any slug has spaces, uppercase, or special characters
  const malformedSlugs = slugs.filter(s => s.includes(' ') || s !== s.toLowerCase());
  if (malformedSlugs.length > 0) {
    console.log(`  ⚠️ Malformed slugs in ${file}:`, malformedSlugs.slice(0, 5));
  }
});
