import { Product, PriceHistoryPoint, StoreOffer } from './types';

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
  // Yeni Nesil Akıllı Alanlar
  timingScore: number; // 0 - 100
  scoreLabel: string;
  needlePositionPercent: number; // 0 (en dip) ile 100 (en tepe)
  bestStoreName?: string;
  bestStorePrice?: number;
  bestStoreUrl?: string;
  marketSpreadTl: number;
  marketSpreadPercent: number;
  storeOffersCount: number;
  savingVersusAvgTl: number;
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

  const rawOffers: StoreOffer[] = (product.storeOffers || []).filter(
    (o) => o && typeof o.price === 'number' && o.price > 0
  );
  const sortedOffers = [...rawOffers].sort((a, b) => a.price - b.price);
  const bestOffer = sortedOffers[0];
  const highestOffer = sortedOffers[sortedOffers.length - 1];

  const currentPrice =
    sortedOffers.length > 0 ? bestOffer.price : product.basePrice > 0 ? product.basePrice : 0;

  const rawHistory: PriceHistoryPoint[] = (product.priceHistory || []).filter(
    (h) => h && typeof h.price === 'number' && h.price > 0
  );

  // Kural: En az 2 geçmiş veri noktası ve geçerli fiyat şart
  if (rawHistory.length < 2 || currentPrice === 0) {
    return createInsufficientDataResult(0, rawHistory.length, currentPrice, bestOffer?.storeName, bestOffer?.url);
  }

  // Kronolojik sırala
  const sortedHistory = [...rawHistory].sort((a, b) => parseDateToMs(a.date) - parseDateToMs(b.date));
  const firstTime = parseDateToMs(sortedHistory[0].date);
  const lastTime = parseDateToMs(sortedHistory[sortedHistory.length - 1].date);

  let daysTracked = 30;
  if (firstTime > 0 && lastTime > 0 && lastTime >= firstTime) {
    daysTracked = Math.max(1, Math.round((lastTime - firstTime) / (1000 * 60 * 60 * 24)));
  }

  // Güvenilirlik Eşiği: 14 günden az veri varsa yanıltıcı karar vermeme
  if (daysTracked < 14) {
    return createInsufficientDataResult(daysTracked, sortedHistory.length, currentPrice, bestOffer?.storeName, bestOffer?.url);
  }

  const prices = sortedHistory.map((h) => h.price);
  const minHistorical = Math.min(...prices);
  const maxHistorical = Math.max(...prices);
  const avgHistorical = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

  const diffAvgPercent = Math.round(((currentPrice - avgHistorical) / avgHistorical) * 100);
  const diffMinPercent = Math.round(((currentPrice - minHistorical) / minHistorical) * 100);
  const dropFromPeakPercent = Math.round(((maxHistorical - currentPrice) / maxHistorical) * 100);

  const dataSpanText = `Son ${daysTracked} günlük piyasa verisine göre (${sortedHistory.length} fiyat noktası)`;

  // Çoklu Mağaza Makası (Cross-Store Spread)
  const marketSpreadTl = highestOffer && highestOffer.price > currentPrice ? highestOffer.price - currentPrice : 0;
  const marketSpreadPercent = currentPrice > 0 && marketSpreadTl > 0 ? Math.round((marketSpreadTl / currentPrice) * 100) : 0;
  const savingVersusAvgTl = avgHistorical > currentPrice ? avgHistorical - currentPrice : 0;

  // Barometre İbre Konumu (0 = Tam Dip Fiyat, 100 = Zirve Fiyat)
  const priceRange = maxHistorical - minHistorical;
  const needlePositionPercent =
    priceRange > 0
      ? Math.min(100, Math.max(0, Math.round(((currentPrice - minHistorical) / priceRange) * 100)))
      : 50;

  // KURAL A: ŞİMDİ AL (Avantajlı Fırsat Seviyesi)
  // Mevcut fiyat dip fiyata çok yakın (<=%5) VEYA ortalamanın en az %6 altında VEYA tepeden %8 düşmüş
  if (currentPrice <= minHistorical * 1.05 || diffAvgPercent <= -6 || dropFromPeakPercent >= 8) {
    // 82 - 98 arası dinamik akıllı skor
    const bonusFromDip = Math.max(0, Math.min(10, Math.round((1 - diffMinPercent / 10) * 10)));
    const spreadBonus = Math.min(8, Math.round(marketSpreadPercent * 0.5));
    const timingScore = Math.min(98, Math.max(82, 82 + bonusFromDip + spreadBonus));

    const storeHighlight = bestOffer?.storeName ? ` en rekabetçi teklif ${bestOffer.storeName}'da` : '';
    const savingNote = savingVersusAvgTl > 0 ? ` Dönem ortalamasına göre ₺${savingVersusAvgTl.toLocaleString('tr-TR')} tasarruf sağlıyor.` : '';

    return {
      status: 'buy_now',
      title: 'Avantajlı Fiyat (Satın Alma Dönemi)',
      badgeText: '⚡ AI Sinyali: Fırsat Seviyesi',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs',
      badgeTextColor: 'text-emerald-700',
      iconType: 'trend_down',
      explanation: `Mevcut en iyi fiyat (₺${currentPrice.toLocaleString('tr-TR')}), ${daysTracked} günlük dönemin dip bandında seyrediyor;${storeHighlight}.${savingNote} Alım için oldukça elverişli bir zamanlama.`,
      daysTracked,
      dataPointsCount: sortedHistory.length,
      currentPrice,
      minHistoricalPrice: minHistorical,
      avgHistoricalPrice: avgHistorical,
      maxHistoricalPrice: maxHistorical,
      diffPercentFromAvg: diffAvgPercent,
      diffPercentFromMin: diffMinPercent,
      dropPercentFromPeak: dropFromPeakPercent,
      dataSpanText,
      timingScore,
      scoreLabel: 'Fırsat Seviyesi',
      needlePositionPercent,
      bestStoreName: bestOffer?.storeName,
      bestStorePrice: bestOffer?.price,
      bestStoreUrl: bestOffer?.url,
      marketSpreadTl,
      marketSpreadPercent,
      storeOffersCount: sortedOffers.length,
      savingVersusAvgTl
    };
  }

  // KURAL B: BEKLE / ACELE ETME (Dönemsel Üst Seviye)
  // Fiyat ortalamanın en az %10 üzerinde VEYA zirveye çok yakın (>=%98)
  if (diffAvgPercent >= 10 || currentPrice >= maxHistorical * 0.98) {
    // 20 - 44 arası skor
    const penalty = Math.min(20, Math.round(diffAvgPercent * 0.8));
    const timingScore = Math.max(22, Math.min(44, 44 - penalty));

    return {
      status: 'wait',
      title: 'Dönemsel Üst Seviye (Acele Etme)',
      badgeText: '⏳ AI Sinyali: Takibe Al',
      badgeColor: 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs',
      badgeTextColor: 'text-amber-800',
      iconType: 'trend_up',
      explanation: `Mevcut fiyat (₺${currentPrice.toLocaleString('tr-TR')}), ${daysTracked} günlük piyasa ortalamasının (₺${avgHistorical.toLocaleString('tr-TR')}) %${diffAvgPercent} üzerinde dönemsel üst seviyede. Acil bir ihtiyacınız yoksa kampanya döngüsünü bekleyebilir veya fiyat alarmı kurabilirsiniz.`,
      daysTracked,
      dataPointsCount: sortedHistory.length,
      currentPrice,
      minHistoricalPrice: minHistorical,
      avgHistoricalPrice: avgHistorical,
      maxHistoricalPrice: maxHistorical,
      diffPercentFromAvg: diffAvgPercent,
      diffPercentFromMin: diffMinPercent,
      dropPercentFromPeak: dropFromPeakPercent,
      dataSpanText,
      timingScore,
      scoreLabel: 'Dönemsel Üst Seviye',
      needlePositionPercent,
      bestStoreName: bestOffer?.storeName,
      bestStorePrice: bestOffer?.price,
      bestStoreUrl: bestOffer?.url,
      marketSpreadTl,
      marketSpreadPercent,
      storeOffersCount: sortedOffers.length,
      savingVersusAvgTl: 0
    };
  }

  // KURAL C: DENGELİ (Olağan Piyasa Seviyesi)
  // 52 - 78 arası skor
  const timingScore = Math.min(78, Math.max(52, 65 - Math.round(diffAvgPercent * 1.5)));

  return {
    status: 'normal',
    title: 'Olağan Piyasa Seviyesinde',
    badgeText: '⚖️ AI Sinyali: Dengeli Fiyat',
    badgeColor: 'bg-blue-50 text-blue-900 border-blue-200 shadow-2xs',
    badgeTextColor: 'text-blue-800',
    iconType: 'clock',
    explanation: `Mevcut fiyat (₺${currentPrice.toLocaleString('tr-TR')}), ${daysTracked} günlük piyasa ortalamasıyla (₺${avgHistorical.toLocaleString('tr-TR')}) uyumlu ve dengeli seyrediyor. Standart piyasa koşullarında makul bir alım seviyesi.`,
    daysTracked,
    dataPointsCount: sortedHistory.length,
    currentPrice,
    minHistoricalPrice: minHistorical,
    avgHistoricalPrice: avgHistorical,
    maxHistoricalPrice: maxHistorical,
    diffPercentFromAvg: diffAvgPercent,
    diffPercentFromMin: diffMinPercent,
    dropPercentFromPeak: dropFromPeakPercent,
    dataSpanText,
    timingScore,
    scoreLabel: 'Dengeli Seviye',
    needlePositionPercent,
    bestStoreName: bestOffer?.storeName,
    bestStorePrice: bestOffer?.price,
    bestStoreUrl: bestOffer?.url,
    marketSpreadTl,
    marketSpreadPercent,
    storeOffersCount: sortedOffers.length,
    savingVersusAvgTl
  };
}

function createInsufficientDataResult(
  daysTracked: number,
  dataPointsCount: number,
  currentPrice: number = 0,
  bestStoreName?: string,
  bestStoreUrl?: string
): PriceSignalResult {
  return {
    status: 'insufficient_data',
    title: 'Piyasa Verisi Toplanıyor',
    badgeText: 'Veri Analiz Ediliyor',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200 shadow-2xs',
    badgeTextColor: 'text-slate-600',
    iconType: 'info',
    explanation:
      daysTracked > 0
        ? `Bu ürün için kaydedilen fiyat geçmişi henüz ${daysTracked} günlük (${dataPointsCount} veri noktası). Şeffaflık ve kesinlik ilkemiz gereği, en az 14 günlük istikrarlı veri birikene kadar zamanlama skoru üretilmemektedir.`
        : 'Bu ürün için henüz yeterli tarihsel piyasa verisi birikmedi. Yanıltıcı tahmin yapmamak adına sinyal üretilmemektedir. Fiyatlar anlık taranmaktadır.',
    daysTracked,
    dataPointsCount,
    currentPrice,
    minHistoricalPrice: currentPrice,
    avgHistoricalPrice: currentPrice,
    maxHistoricalPrice: currentPrice,
    diffPercentFromAvg: 0,
    diffPercentFromMin: 0,
    dropPercentFromPeak: 0,
    dataSpanText: daysTracked > 0 ? `Son ${daysTracked} günlük veri` : 'Yetersiz Geçmiş Verisi',
    timingScore: 50,
    scoreLabel: 'Veri Birikiyor',
    needlePositionPercent: 50,
    bestStoreName,
    bestStorePrice: currentPrice,
    bestStoreUrl,
    marketSpreadTl: 0,
    marketSpreadPercent: 0,
    storeOffersCount: bestStoreName ? 1 : 0,
    savingVersusAvgTl: 0
  };
}
