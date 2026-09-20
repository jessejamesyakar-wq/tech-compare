const fs = require('node:fs');
const path = require('node:path');
const { collectOffer, validateBinding, mergeObservation } = require('./observedStoreOffer.cjs');
const { checkPendingCatalogData } = require('./catalogDataReview.cjs');

const ROOT = path.resolve(__dirname, '..');
const CATALOGS = {
  smartphones: 'smartphonesData.json', tvs: 'mockTVs.ts', laptops: 'mockLaptops.ts', tablets: 'mockTablets.ts',
  smartwatches: 'mockSmartwatches.ts', headphones: 'mockHeadphones.ts', appliances: 'mockAppliances.ts', monitors: 'mockMonitors.ts', consoles: 'mockConsoles.ts',
};
function parseArgs(args) {
  const options = { apply: false, limit: 50, category: null, report: null };
  for (const arg of args) {
    if (arg === '--apply') options.apply = true;
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--all') options.limit = 5000;
    else if (/^--limit=\d+$/.test(arg)) options.limit = Number(arg.slice(8));
    else if (arg.startsWith('--category=') && CATALOGS[arg.slice(11)]) options.category = arg.slice(11);
    else if (arg.startsWith('--report=') && arg.slice(9)) options.report = path.resolve(arg.slice(9));
    else throw new Error(`Desteklenmeyen seçenek: ${arg}. Yayınlama ayrı bir işlemdir; --push desteklenmez.`);
  }
  if (!Number.isInteger(options.limit) || options.limit < 1 || options.limit > 5000) throw new Error('Limit 1–5000 arasında olmalı.');
  if (options.apply && options.dryRun) throw new Error('--apply ve --dry-run birlikte kullanılamaz.');
  if (options.report) {
    const relative = path.relative(ROOT, options.report);
    if (!relative.startsWith('..') && !path.isAbsolute(relative) && !relative.startsWith(`scratch${path.sep}`)) throw new Error('Proje içi raporları yalnız scratch/ altına yazın.');
  }
  return options;
}
function readCatalogs(root = ROOT) {
  return Object.entries(CATALOGS).map(([category, name]) => {
    const file = path.join(root, 'src/lib', name);
    const original = fs.readFileSync(file, 'utf8');
    const match = name.endsWith('.json') ? null : original.match(/export\s+const\s+\w+\s*:\s*\w+\[\]\s*=\s*(\[[\s\S]*\]);/);
    if (!name.endsWith('.json') && !match) throw new Error(`Katalog biçimi tanınmadı: ${name}`);
    const products = JSON.parse(match ? match[1] : original);
    return { category, file, original, arrayText: match?.[1], products };
  });
}
function writeCatalogChanges(catalogs, results, pendingEntries) {
  const changed = catalogs.map(catalog => {
    const products = catalog.products.map(product => results.reduce((current, result) => result.status === 'observed' && result.observation.productId === current.id ? mergeObservation(current, result) : current, product));
    const modified = products.some((product, index) => product !== catalog.products[index]);
    return { ...catalog, products, modified };
  });
  const errors = checkPendingCatalogData(changed.flatMap(catalog => catalog.products), pendingEntries);
  if (errors.length) throw new Error(errors.join('\n'));
  // Check all source snapshots before the first write; preserve concurrent/uncommitted changes.
  for (const catalog of changed.filter(item => item.modified)) {
    if (fs.readFileSync(catalog.file, 'utf8') !== catalog.original) throw new Error(`Katalog çalışma sırasında değişti: ${catalog.file}`);
  }
  for (const catalog of changed.filter(item => item.modified)) {
    const array = JSON.stringify(catalog.products, null, 2);
    const content = catalog.arrayText ? catalog.original.replace(catalog.arrayText, () => array) : array + '\n';
    const temporary = `${catalog.file}.offer-sync-${process.pid}.tmp`;
    fs.writeFileSync(temporary, content, { flag: 'wx' });
    fs.renameSync(temporary, catalog.file);
  }
  return changed.filter(item => item.modified).map(item => item.category);
}
async function main(args = process.argv.slice(2)) {
  const options = parseArgs(args); // Reject legacy --push before catalog/network access.
  const catalogs = readCatalogs();
  const products = catalogs.flatMap(catalog => catalog.products);
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/store_offer_sources.json'), 'utf8'));
  if (manifest.version !== 1 || !Array.isArray(manifest.bindings)) throw new Error('Geçersiz kaynak manifesti');
  const identities = new Set();
  const urls = new Set();
  for (const binding of manifest.bindings) {
    const matches = products.filter(product => product.id === binding.productId);
    if (matches.length !== 1) throw new Error('Kaynak tek bir katalog kimliğine bağlanmalı');
    validateBinding(binding, matches[0]);
    const key = `${binding.productId}|${binding.storeId}`;
    if (identities.has(key) || urls.has(binding.url)) throw new Error('Yinelenen ürün/mağaza kaynağı');
    identities.add(key); urls.add(binding.url);
  }
  const bindings = manifest.bindings.filter(binding => !options.category || binding.category === options.category).slice(0, options.limit);
  const results = [];
  for (const binding of bindings) {
    if (results.length) await new Promise(resolve => setTimeout(resolve, 1500));
    const result = await collectOffer(binding);
    results.push(result);
    console.log(`${binding.productId}: ${result.status}${result.reason ? ' — ' + result.reason : ''}`);
  }
  const verified = results.filter(result => result.status === 'observed').length;
  const report = {
    completedAt: new Date().toISOString(), mode: options.apply ? 'apply-local' : 'report-only',
    registeredSources: manifest.bindings.length, checked: results.length, observed: verified,
    unverified: results.length - verified, results, changedCategories: [],
  };
  if (options.apply) {
    const pending = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/catalog_data_reviews.json'), 'utf8'));
    report.changedCategories = writeCatalogChanges(catalogs, results, pending.entries);
  }
  if (options.report) {
    fs.mkdirSync(path.dirname(options.report), { recursive: true });
    fs.writeFileSync(options.report, JSON.stringify(report, null, 2) + '\n');
  }
  console.log(JSON.stringify({ mode: report.mode, checked: report.checked, observed: verified, unverified: report.unverified, changedCategories: report.changedCategories }));
  // A completed request with missing/blocked evidence is not a successful price refresh.
  if (report.unverified || report.checked === 0) process.exitCode = 2;
  return report;
}
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { parseArgs, readCatalogs, writeCatalogChanges, main };
