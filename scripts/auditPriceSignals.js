const fs = require('fs');
const path = require('path');

function parseDateToMs(dateStr) {
  if (!dateStr) return 0;
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  }
  const trMonths = {
    ocak: 0, subat: 1, şubat: 1, mart: 2, nisan: 3, mayıs: 4, mayis: 4, haziran: 5,
    temmuz: 6, ağustos: 7, agustos: 7, eylül: 8, eylul: 8, ekim: 9, kasım: 10, kasim: 10, aralık: 11, aralik: 11
  };
  const parts = dateStr.toLowerCase().trim().split(/[\s,.-]+/);
  if (parts.length >= 2) {
    let year = 2026;
    let month = 0;
    let day = 15;
    parts.forEach(p => {
      if (/^\d{4}$/.test(p)) year = parseInt(p, 10);
      else if (trMonths[p] !== undefined) month = trMonths[p];
      else if (/^\d{1,2}$/.test(p)) day = parseInt(p, 10);
    });
    return new Date(year, month, day).getTime();
  }
  const parsed = Date.parse(dateStr);
  return isNaN(parsed) ? 0 : parsed;
}

function calculatePriceSignal(product) {
  const offers = (product.storeOffers || []).filter(o => o && typeof o.price === 'number');
  const validStorePrices = offers.map(o => o.price).filter(p => p > 0);
  const currentPrice = validStorePrices.length > 0 ? Math.min(...validStorePrices) : product.basePrice || 0;

  const rawHistory = (product.priceHistory || []).filter(h => h && typeof h.price === 'number' && h.price > 0);

  if (rawHistory.length < 2 || currentPrice === 0) {
    return { status: 'insufficient_data' };
  }

  const sortedHistory = [...rawHistory].sort((a, b) => parseDateToMs(a.date) - parseDateToMs(b.date));
  const firstTime = parseDateToMs(sortedHistory[0].date);
  const lastTime = parseDateToMs(sortedHistory[sortedHistory.length - 1].date);

  let daysTracked = 30;
  if (firstTime > 0 && lastTime > 0 && lastTime >= firstTime) {
    daysTracked = Math.max(1, Math.round((lastTime - firstTime) / (1000 * 60 * 60 * 24)));
  }

  if (daysTracked < 14) {
    return { status: 'insufficient_data' };
  }

  const prices = sortedHistory.map(h => h.price);
  const minHistorical = Math.min(...prices);
  const maxHistorical = Math.max(...prices);
  const avgHistorical = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

  const diffAvgPercent = Math.round(((currentPrice - avgHistorical) / avgHistorical) * 100);
  const dropFromPeakPercent = Math.round(((maxHistorical - currentPrice) / maxHistorical) * 100);

  if (currentPrice <= minHistorical * 1.05 || diffAvgPercent <= -6 || dropFromPeakPercent >= 8) {
    return { status: 'buy_now' };
  }

  if (diffAvgPercent >= 10 || currentPrice >= maxHistorical * 0.98) {
    return { status: 'wait' };
  }

  return { status: 'normal' };
}

const datasets = [
  { name: 'smartphones', file: 'smartphonesData.json', type: 'json' },
  { name: 'tvs', file: 'mockTVs.ts', type: 'ts' },
  { name: 'laptops', file: 'mockLaptops.ts', type: 'ts' },
  { name: 'tablets', file: 'mockTablets.ts', type: 'ts' },
  { name: 'smartwatches', file: 'mockSmartwatches.ts', type: 'ts' },
  { name: 'headphones', file: 'mockHeadphones.ts', type: 'ts' },
  { name: 'appliances', file: 'mockAppliances.ts', type: 'ts' },
  { name: 'monitors', file: 'mockMonitors.ts', type: 'ts' },
  { name: 'consoles', file: 'mockConsoles.ts', type: 'ts' }
];

console.log('=== OVERALL PRICE SIGNAL AUDIT REPORT ===');
const grandTotals = { buy_now: 0, wait: 0, normal: 0, insufficient_data: 0, total: 0 };

datasets.forEach(d => {
  const filePath = path.join(__dirname, '../src/lib', d.file);
  let products = [];
  if (d.type === 'json') products = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  else {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/export\s+const\s+(\w+)\s*:\s*(?:Product\[\]|Smartphone\[\]|TVProduct\[\]|LaptopProduct\[\]|ApplianceProduct\[\]|GenericProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
    if (match) products = JSON.parse(match[2]);
  }

  const counts = { buy_now: 0, wait: 0, normal: 0, insufficient_data: 0 };
  products.forEach(p => {
    const signal = calculatePriceSignal(p);
    counts[signal.status]++;
    grandTotals[signal.status]++;
    grandTotals.total++;
  });

  console.log(`\nCategory: ${d.name.toUpperCase()} (Total: ${products.length})`);
  console.log(`  - 🟢 Şimdi Al (Fırsat Seviyesi): ${counts.buy_now}`);
  console.log(`  - 🟡 Beklemek Mantıklı: ${counts.wait}`);
  console.log(`  - 🔵 Normal / Dengeli Fiyat: ${counts.normal}`);
  console.log(`  - ⚪ Yetersiz Veri (<14 gün / takipte): ${counts.insufficient_data}`);
});

console.log('\n========================================');
console.log('GRAND TOTALS ACROSS ALL CATEGORIES:');
console.log(`Total Products Analyzed: ${grandTotals.total}`);
console.log(`  🟢 Şimdi Al: ${grandTotals.buy_now} (%${((grandTotals.buy_now / grandTotals.total) * 100).toFixed(1)})`);
console.log(`  🟡 Beklemek Mantıklı: ${grandTotals.wait} (%${((grandTotals.wait / grandTotals.total) * 100).toFixed(1)})`);
console.log(`  🔵 Normal / Dengeli: ${grandTotals.normal} (%${((grandTotals.normal / grandTotals.total) * 100).toFixed(1)})`);
console.log(`  ⚪ Yetersiz Veri (<14 gün): ${grandTotals.insufficient_data} (%${((grandTotals.insufficient_data / grandTotals.total) * 100).toFixed(1)})`);
