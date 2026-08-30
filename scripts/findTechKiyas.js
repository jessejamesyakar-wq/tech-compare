const fs = require('fs');
const path = require('path');

function searchAll(dir) {
  let count = 0;
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== '.next' && f !== '.git') count += searchAll(full);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.json') || f.endsWith('.js') || f.endsWith('.css') || f.endsWith('.html')) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, lineIdx) => {
        if (/techk[ıi]yas/i.test(line)) {
          console.log(full + ':' + (lineIdx + 1) + ': ' + line.trim());
          count++;
        }
      });
    }
  }
  return count;
}

console.log('--- Searching for TechKıyas / techkiyas ---');
const totalSrc = searchAll('./src');
const totalPublic = searchAll('./public');
console.log('Total matches in src:', totalSrc);
console.log('Total matches in public:', totalPublic);
