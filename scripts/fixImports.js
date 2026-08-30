const fs = require('fs');
const path = require('path');

const files = [
  'src/lib/mockAppliances.ts',
  'src/lib/mockLaptops.ts',
  'src/lib/mockTVs.ts',
  'src/lib/mockMonitors.ts'
];

files.forEach(f => {
  const full = path.join(__dirname, '..', f);
  if (!fs.existsSync(full)) return;
  let content = fs.readFileSync(full, 'utf8');
  content = content.replace(/import\s*\{([^}]+)\}\s*from\s*["'](?:\.\/types|@\/lib\/types)["'];?/, (m, p1) => {
    const existing = p1.split(',').map(s => s.trim()).filter(Boolean);
    if (!existing.includes('Product')) existing.push('Product');
    return `import { ${existing.join(', ')} } from "./types";`;
  });
  fs.writeFileSync(full, content, 'utf8');
  console.log('Fixed types in:', f);
});
