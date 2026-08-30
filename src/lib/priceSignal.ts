import { Product, PriceHistoryPoint } from './types';

export interface PriceSignalResult {
  status: 'buy_now' | 'wait' | 'normal' | 'insufficient_data';
  title: string;
  badgeText: string;
  badgeColor: string;
  badgeTextColor: string;
  iconType: 'trend_down' | 'trend_up' | 'clock' | 'info';
  explanation: string;
  daysTracked: number;
  dataPointsCount: number;
  currentPrice: number;
  minHistoricalPrice: number;
  avgHistoricalPrice: number;
  maxHistoricalPrice: number;
  diffPercentFromAvg: number;
  diffPercentFromMin: number;
  dropPercentFromPeak: number;
  dataSpanText: string;
}

export function parseDateToMs(dateStr: string): number {
  if (!dateStr) return 0;
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  }

  const trMonths: Record<string, number> = {
    ocak: 0,
    subat: 1,
    şubat: 1,
    mart: 2,
    nisan: 3,
    mayıs: 4,
    mayis: 4,
    haziran: 5,
    temmuz: 6,
    ağustos: 7,
    agustos: 7,
    eylül: 8,
    eylul: 8,
    ekim: 9,
    kasım: 10,
    kasim: 10,
    aralık: 11,
    aralik: 11
  };

  const parts = dateStr.toLowerCase().trim().split(/[\s,.-]+/);
  if (parts.length >= 2) {
    let year = 2026;
    let month = 0;
    let day = 15;

    parts.forEach((p) => {
      if (/^\d{4}$/.test(p)) year = parseInt(p, 10);
      else if (trMonths[p] !== undefined) month = trMonths[p];
      else if (/^\d{1,2}$/.test(p)) day = parseInt(p, 10);
    });

    return new Date(year, month, day).getTime();
  }

  const parsed = Date.parse(dateStr);
  return isNaN(parsed) ? 0 : parsed;
}

export function calculatePriceSignal(product: Product): PriceSignalResult {
  if (!product) {
    return createInsufficientDataResult(0, 0);
  }

  const offers = (product.storeOffers || []).filter((o) => o && typeof o.price === 'number');
  const validStorePrices = offers.map((o) => o.price).filter((p) => p > 0);
  const currentPrice =
    validStorePrices.length > 0 ? Math.min(...validStorePrices) : product.basePrice > 0 ? product.basePrice : 0;

  const rawHistory: PriceHistoryPoint[] = (product.priceHistory || []).filter(
    (h) => h && typeof h.price === 'number' && h.price > 0
  );

  // RULE: Need at least 2 distinct data points and valid current price
  if (rawHistory.length < 2 || currentPrice === 0) {
    return createInsufficientDataResult(0, rawHistory.length);
  }

  // Sort chronologically
  const sortedHistory = [...rawHistory].sort((a, b) => parseDateToMs(a.date) - parseDateToMs(b.date));
  const firstTime = parseDateToMs(sortedHistory[0].date);
  const lastTime = parseDateToMs(sortedHistory[sortedHistory.length - 1].date);

  let daysTracked = 30;
  if (firstTime > 0 && lastTime > 0 && lastTime >= firstTime) {
    daysTracked = Math.max(1, Math.round((lastTime - firstTime) / (1000 * 60 * 60 * 24)));
  }

  // RULE 3: Minimum 14 days of data threshold
  if (daysTracked < 14) {
    return createInsufficientDataResult(daysTracked, sortedHistory.length);
  }

  const prices = sortedHistory.map((h) => h.price);
  const minHistorical = Math.min(...prices);
  const maxHistorical = Math.max(...prices);
  const avgHistorical = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

  const diffAvgPercent = Math.round(((currentPrice - avgHistorical) / avgHistorical) * 100);
  const diffMinPercent = Math.round(((currentPrice - minHistorical) / minHistorical) * 100);
  const dropFromPeakPercent = Math.round(((maxHistorical - currentPrice) / maxHistorical) * 100);

  const dataSpanText = `Son ${daysTracked} günlük fiyat verisine göre (${sortedHistory.length} veri noktası)`;

  // RULE 2A: BUY NOW (Şimdi Al)
  // Current price is within 5% of historical minimum OR at least 6% below average OR peak drop >= 8%
  if (currentPrice <= minHistorical * 1.05 || diffAvgPercent <= -6 || dropFromPeakPercent >= 8) {
    return {
      status: 'buy_now',
      title: 'Şimdi Al (Fırsat Seviyesi)',
      badgeText: '⚡ AI Sinyali: Şimdi Al',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs',
      badgeTextColor: 'text-emerald-700',
      iconType: 'trend_down',
      explanation: `Mevcut en düşük mağaza fiyatı (₺${currentPrice.toLocaleString('tr-TR')}), ${daysTracked} günlük dönemin dip seviyesine yakın seyrediyor. Dönem ortalamasına (₺${avgHistorical.toLocaleString('tr-TR')}) kıyasla %${Math.abs(diffAvgPercent)} daha avantajlı. Alım için uygun bir dönem.`,
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

  // RULE 2B: WAIT (Beklemek Mantıklı Olabilir)
  // Current price is at least 10% above historical average OR at the peak (>98% of max)
  if (diffAvgPercent >= 10 || currentPrice >= maxHistorical * 0.98) {
    return {
      status: 'wait',
      title: 'Beklemek Mantıklı Olabilir',
      badgeText: '⏳ AI Sinyali: Bekle',
      badgeColor: 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs',
      badgeTextColor: 'text-amber-800',
      iconType: 'trend_up',
      explanation: `Mevcut fiyat (₺${currentPrice.toLocaleString('tr-TR')}), ${daysTracked} günlük piyasa ortalamasının (₺${avgHistorical.toLocaleString('tr-TR')}) %${diffAvgPercent} üzerinde tepe bantta. Acil değilse yaklaşan kampanya ve indirim dönemlerini beklemek tasarruf sağlayabilir.`,
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

  // RULE 2C: NORMAL (Normal Fiyat Aralığında)
  return {
    status: 'normal',
    title: 'Normal Fiyat Aralığında',
    badgeText: '⚖️ AI Sinyali: Dengeli Fiyat',
    badgeColor: 'bg-blue-50 text-blue-900 border-blue-200 shadow-2xs',
    badgeTextColor: 'text-blue-800',
    iconType: 'clock',
    explanation: `Mevcut fiyat (₺${currentPrice.toLocaleString('tr-TR')}), ${daysTracked} günlük piyasa ortalamasında (₺${avgHistorical.toLocaleString('tr-TR')}) istikrarlı ve dengeli seyrediyor. Olağan piyasa bandında bir alım yapılabilir.`,
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

function createInsufficientDataResult(daysTracked: number, dataPointsCount: number): PriceSignalResult {
  return {
    status: 'insufficient_data',
    title: 'Henüz Yeterli Fiyat Geçmişi Yok',
    badgeText: 'Veri Birikiyor',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200 shadow-2xs',
    badgeTextColor: 'text-slate-600',
    iconType: 'info',
    explanation:
      daysTracked > 0
        ? `Bu ürün için kaydedilen fiyat geçmişi sadece ${daysTracked} günlük (${dataPointsCount} veri noktası). Şeffaflık ve güvenilirlik ilkemiz gereği, en az 14 günlük veri birikene kadar sinyal gösterilmemektedir. Fiyatları takip etmeye devam ediyoruz.`
        : 'Bu ürün için henüz yeterli tarihsel fiyat verisi birikmedi. Yanıltıcı tahmin yapmamak adına sinyal üretilmemektedir. Fiyat hareketlerini anlık takip etmeye devam ediyoruz.',
    daysTracked,
    dataPointsCount,
    currentPrice: 0,
    minHistoricalPrice: 0,
    avgHistoricalPrice: 0,
    maxHistoricalPrice: 0,
    diffPercentFromAvg: 0,
    diffPercentFromMin: 0,
    dropPercentFromPeak: 0,
    dataSpanText: daysTracked > 0 ? `Son ${daysTracked} günlük veri` : 'Yetersiz Geçmiş Verisi'
  };
}
