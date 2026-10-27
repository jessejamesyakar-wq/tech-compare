import fs from 'fs';

const manifest = JSON.parse(fs.readFileSync('reports/icecat-phones-400/manifest.json', 'utf8'));

const resolvedMpnMap: Record<string, string> = {
  'samsung-samsung-galaxy-a16-5g-114': 'SM-A166BZKDEUB',
  'samsung-samsung-galaxy-a20-21': 'SM-A202FZKDITV',
  'samsung-samsung-galaxy-a21s-41': 'SM-A217FZKNEUA',
  'samsung-samsung-galaxy-a30-22': 'SM-A307FN/DS',
  'samsung-samsung-galaxy-a40-23': 'SM-A405FN/DS',
  'samsung-samsung-galaxy-a41-43': 'SM-A415FZKDEUE',
  'samsung-samsung-galaxy-a50-24': 'SM-A505FZWSITV',
  'samsung-samsung-galaxy-a80-27': 'SM-A805FZKDITV',
  'samsung-samsung-galaxy-m51-49': 'SM-M515FZKDEUE',
  'samsung-samsung-galaxy-note-20-36': 'SM-N981BZAGEUE',
  'samsung-samsung-galaxy-z-flip-4-69': 'SM-F721BZAGEUE',
  'samsung-samsung-galaxy-z-fold-4-70': 'SM-F936BZABEUB',
  'samsung-samsung-galaxy-z-flip-3-54': 'SM-F711BZEEEUE',
  'samsung-samsung-galaxy-z-flip-38': 'SM-F700FZKDITV',
  'samsung-samsung-galaxy-fold-19': 'SM-F900FZKDITV',
  'samsung-samsung-galaxy-a12-57': 'SM-A125FZKKEUB',
  'samsung-samsung-galaxy-a14-86': 'SM-A146PZKDEUB'
};

console.log('Location of the 17 resolved models in manifest (400 items):');
for (const [id, mpn] of Object.entries(resolvedMpnMap)) {
  const idx = manifest.items.findIndex((item: any) => item.canonicalId === id);
  const batchNum = Math.floor(idx / 20) + 1;
  console.log(`Index ${idx + 1} (Batch ${batchNum}): ${id} -> ${mpn}`);
}
