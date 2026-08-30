const fs = require('fs');
const path = require('path');

function searchUnsplash(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== '.next' && f !== '.git') searchUnsplash(full);
    } else if (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.json')) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes('unsplash.com')) {
        const lines = content.split('\n');
        lines.forEach((l, i) => {
          if (l.includes('unsplash.com')) {
            console.log(`${full}:${i+1}: ${l.trim().slice(0, 100)}`);
          }
        });
      }
      if (content.includes('520BT') || content.includes('520bt')) {
        const lines = content.split('\n');
        lines.forEach((l, i) => {
          if (l.includes('520BT') || l.includes('520bt')) {
            console.log(`[JBL FOUND] ${full}:${i+1}: ${l.trim()}`);
          }
        });
      }
    }
  }
}

searchUnsplash('./src');
