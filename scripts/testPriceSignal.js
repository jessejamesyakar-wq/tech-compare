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
    return {
      status: 'insufficient_data',
      title: 'Henüz Yeterli Fiyat Geçmişi Yok',
      badgeText: 'Veri Birikiyor',
      badgeColor: 'bg-slate-100 text-slate-600 border-slate-200',
      iconType: 'info',
      explanation: 'Bu ürün için henüz yeterli tarihsel fiyat verisi bulunmuyor. Şeffaf sinyal üretebilmek için fiyat hareketlerini takip etmeye devam ediyoruz.',
      daysTracked: 0,
      dataPointsCount: rawHistory.length,
      dataSpanText: 'Yetersiz Geçmiş Verisi'
    };
  }

  // Sort chronological
  const sortedHistory = [...rawHistory].sort((a, b) => parseDateToMs(a.date) - parseDateToMs(b.date));
  const firstTime = parseDateToMs(sortedHistory[0].date);
  const lastTime = parseDateToMs(sortedHistory[sortedHistory.length - 1].date);

  let daysTracked = 30;
  if (firstTime > 0 && lastTime > 0 && lastTime >= firstTime) {
    daysTracked = Math.max(1, Math.round((lastTime - firstTime) / (1000 * 60 * 60 * 24)));
  }

  // RULE 3: If history is less than 14 days, return insufficient data
  if (daysTracked < 14) {
    return {
      status: 'insufficient_data',
      title: 'Henüz Yeterli Fiyat Geçmişi Yok',
      badgeText: 'Takipte (Yetersiz Gün)',
      badgeColor: 'bg-slate-100 text-slate-600 border-slate-200',
      iconType: 'info',
      explanation: `Bu ürün için kaydedilen fiyat geçmişi sadece ${daysTracked} günlük. Yanıltıcı tahmin yapmamak adına en az 14 günlük veri birikene kadar sinyal verilmemektedir.`,
      daysTracked,
      dataPointsCount: sortedHistory.length,
      dataSpanText: `Son ${daysTracked} günlük veri`
    };
  }

  const prices = sortedHistory.map(h => h.price);
  const minHistorical = Math.min(...prices);
  const maxHistorical = Math.max(...prices);
  const avgHistorical = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

  const diffAvgPercent = Math.round(((currentPrice - avgHistorical) / avgHistorical) * 100);
  const diffMinPercent = Math.round(((currentPrice - minHistorical) / minHistorical) * 100);
  const dropFromPeakPercent = Math.round(((maxHistorical - currentPrice) / maxHistorical) * 100);

  // Time-span label: if days > 90 show days, e.g. "Son 180 günlük fiyat verisine göre"
  const dataSpanText = `Son ${daysTracked} günlük fiyat verisine göre`;

  // RULE 2: Signal Classification
  // BUY NOW: Current price is within 5% of historical minimum OR at least 6% below average OR peak drop >= 8%
  if (currentPrice <= minHistorical * 1.05 || diffAvgPercent <= -6 || dropFromPeakPercent >= 8) {
    return {
      status: 'buy_now',
      title: 'Şimdi Al (Fırsat Seviyesi)',
      badgeText: '⚡ AI Sinyali: Şimdi Al',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs',
      iconType: 'trend_down',
      explanation: `Mevcut en düşük mağaza fiyatı (₺${currentPrice.toLocaleString('tr-TR')}), geçmiş dönemin dip bandında seyrediyor. ${daysTracked} günlük geçmiş ortalamaya (₺${avgHistorical.toLocaleString('tr-TR')}) kıyasla %${Math.abs(diffAvgPercent)} daha avantajlı.`,
      daysTracked,
      dataPointsCount: sortedHistory.length,
      currentPrice,
      minHistoricalPrice: minHistorical,
      avgHistoricalPrice: avgHistorical,
      maxHistoricalPrice: maxHistorical,
      diffPercentFromAvg: diffAvgPercent,
      diffPercentFromMin: diffMinPercent,
      dropPercentFromPeak: dropFromPeakPercent,
      dataSpanText
    };
  }

  // WAIT: Current price is at least 10% above historical average OR at the peak
  if (diffAvgPercent >= 10 || currentPrice >= maxHistorical * 0.98) {
    return {
      status: 'wait',
      title: 'Beklemek Mantıklı Olabilir',
      badgeText: '⏳ AI Sinyali: Bekle',
      badgeColor: 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs',
      iconType: 'trend_up',
      explanation: `Mevcut fiyat (₺${currentPrice.toLocaleString('tr-TR')}), ${daysTracked} günlük piyasa ortalamasının (₺${avgHistorical.toLocaleString('tr-TR')}) %${diffAvgPercent} üzerinde tepe seviyede. Kampanya veya indirim dönemlerini beklemek tasarruf sağlayabilir.`,
      daysTracked,
      dataPointsCount: sortedHistory.length,
      currentPrice,
      minHistoricalPrice: minHistorical,
      avgHistoricalPrice: avgHistorical,
      maxHistoricalPrice: maxHistorical,
      diffPercentFromAvg: diffAvgPercent,
      diffPercentFromMin: diffMinPercent,
      dropPercentFromPeak: dropFromPeakPercent,
      dataSpanText
    };
  }

  // NORMAL: In-between range
  return {
    status: 'normal',
    title: 'Normal Fiyat Aralığında',
    badgeText: '⚖️ AI Sinyali: Dengeli Fiyat',
    badgeColor: 'bg-blue-50 text-blue-900 border-blue-200 shadow-2xs',
    iconType: 'clock',
    explanation: `Mevcut fiyat (₺${currentPrice.toLocaleString('tr-TR')}), ${daysTracked} günlük piyasa ortalamasında (₺${avgHistorical.toLocaleString('tr-TR')}) istikrarlı ve dengeli seyrediyor. Acil ihtiyaç durumunda makul bir seviyede.`,
    daysTracked,
    dataPointsCount: sortedHistory.length,
    currentPrice,
    minHistoricalPrice: minHistorical,
    avgHistoricalPrice: avgHistorical,
    maxHistoricalPrice: maxHistorical,
    diffPercentFromAvg: diffAvgPercent,
    diffPercentFromMin: diffMinPercent,
    dropPercentFromPeak: dropFromPeakPercent,
    dataSpanText
  };
}

// Test on all datasets
const datasets = [
  { name: 'smartphones', file: 'smartphonesData.json', type: 'json' },
  { name: 'tvs', file: 'mockTVs.ts', type: 'ts' },
  { name: 'laptops', file: 'mockLaptops.ts', type: 'ts' },
  { name: 'tablets', file: 'mockTablets.ts', type: 'ts' }
];

datasets.forEach(d => {
  const filePath = path.join(__dirname, '../src/lib', d.file);
  let products = [];
  if (d.type === 'json') products = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  else {
    const match = fs.readFileSync(filePath, 'utf8').match(/export\s+const\s+(\w+)\s*:\s*(?:Product\[\]|Smartphone\[\]|TVProduct\[\]|LaptopProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
    if (match) products = JSON.parse(match[2]);
  }

  const counts = { buy_now: 0, wait: 0, normal: 0, insufficient_data: 0 };
  products.forEach(p => {
    const signal = calculatePriceSignal(p);
    counts[signal.status]++;
  });

  console.log(`\n=== Price Signals for ${d.name} (Total: ${products.length}) ===`);
  console.log('  🟢 Şimdi Al (Fırsat):', counts.buy_now);
  console.log('  🟡 Bekle (Yüksek):', counts.wait);
  console.log('  🔵 Normal (Dengeli):', counts.normal);
  console.log('  ⚪ Yetersiz Veri (<14 gün):', counts.insufficient_data);
});
