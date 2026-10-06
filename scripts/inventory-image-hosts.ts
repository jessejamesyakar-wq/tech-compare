import fs from 'fs';
import path from 'path';
import { getStoredProducts } from '../src/lib/adminData';

const products = getStoredProducts();
const externalHosts = new Set<string>();
const protocols = new Set<string>();

const check = (val: unknown) => {
  if (typeof val === 'string' && val.startsWith('http')) {
    try {
      const u = new URL(val);
      externalHosts.add(u.hostname);
      protocols.add(u.protocol);
    } catch (e) {}
  }
};

for (const p of products) {
  check(p.image);
  check((p as any).imageUrl);
  if (Array.isArray((p as any).images)) {
    (p as any).images.forEach(check);
  }
  if ((p as any).specs && typeof (p as any).specs === 'object') {
    for (const v of Object.values((p as any).specs)) {
      check(v);
    }
  }
}

// Also scan all source files for any http/https image URLs
function scanDir(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !full.includes('node_modules') && !full.includes('.next') && !full.includes('.git')) {
      scanDir(full);
    } else if (entry.isFile() && /\.(ts|tsx|js|jsx|json)$/.test(entry.name)) {
      const content = fs.readFileSync(full, 'utf8');
      const matches = content.match(/https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s"'`)]*?\.(jpg|jpeg|png|webp|avif|svg|gif)/gi);
      if (matches) {
        for (const m of matches) {
          try {
            const u = new URL(m);
            externalHosts.add(u.hostname);
            protocols.add(u.protocol);
          } catch (e) {}
        }
      }
    }
  }
}

scanDir(path.join(process.cwd(), 'src'));
scanDir(path.join(process.cwd(), 'public'));

console.log('Total external hosts found:', externalHosts.size);
console.log('Hosts:', Array.from(externalHosts).sort());
console.log('Protocols:', Array.from(protocols).sort());
