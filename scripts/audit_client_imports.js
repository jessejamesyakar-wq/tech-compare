const fs = require('fs');
const path = require('path');

function check(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      if (f !== 'node_modules' && f !== '.next') check(p);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      const content = fs.readFileSync(p, 'utf8');
      const isClient = content.startsWith("'use client'") || content.startsWith('"use client"');
      if (isClient) {
        const lines = content.split('\n');
        for (const line of lines) {
          if (line.includes('from') && (line.includes('/data') || line.includes('/adminData') || line.includes('mock'))) {
            console.log('CLIENT IMPORT:', p, '-->', line.trim());
          }
        }
      }
    }
  }
}
check('src');
