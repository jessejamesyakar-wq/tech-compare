const fs = require('fs');
const path = require('path');

function search(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== '.next' && f !== '.git') search(full);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, lineIdx) => {
        if (line.includes('href=') && (line.includes('/phones/') || line.includes('/tvs/') || line.includes('/laptops/') || line.includes('/appliances/') || line.includes('/smartwatches/') || line.includes('/headphones/') || line.includes('/tablets/') || line.includes('/consoles/') || line.includes('/monitors/'))) {
          console.log(`${full}:${lineIdx + 1}: ${line.trim()}`);
        }
      });
    }
  }
}

search('./src');
