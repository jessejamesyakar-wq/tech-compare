const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== '.next' && f !== '.git') searchDir(full);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes('bulunamadı') || content.includes('Bulunamadı')) {
        const lines = content.split('\n');
        lines.forEach((l, i) => {
          if (l.includes('bulunamadı') || l.includes('Bulunamadı')) {
            console.log(full + ':' + (i + 1) + ': ' + l.trim());
          }
        });
      }
    }
  }
}

searchDir('./src');
