/**
 * Release Year & Historical Product Filtering Utilities
 *
 * Rules:
 * 1. For all brands except Samsung and Apple:
 *    - If release year is before 2018 (< 2018), it must NOT be included in the "8 Store Live Price Comparison" calculations or data pool.
 * 2. Samsung and Apple products are exempt from this rule (handled normally regardless of release year).
 * 3. Pre-2018 non-exempt products are designated as Historical / Retro Models and display the dedicated Legacy Archive UI.
 */

export interface ProductLike {
  id?: string;
  name?: string;
  brand?: string;
  releaseYear?: number;
  releaseDate?: string;
  slug?: string;
  specs?: any;
  category?: string;
}

/**
 * Extracts or infers the product release year.
 */
export function getProductReleaseYear(product?: ProductLike | null): number | null {
  if (!product) return null;

  // 1. Direct releaseYear field
  if (typeof product.releaseYear === 'number' && product.releaseYear > 1990 && product.releaseYear <= 2030) {
    return product.releaseYear;
  }

  // 2. From releaseDate string (e.g., "2016-04", "Ekim 2015", "2012")
  if (product.releaseDate) {
    const yearMatch = product.releaseDate.match(/\b(19\d\d|20\d\d)\b/);
    if (yearMatch) {
      return parseInt(yearMatch[1], 10);
    }
  }

  // 3. From specs.releaseDate or specs.year
  if (product.specs) {
    if (typeof product.specs.releaseYear === 'number') return product.specs.releaseYear;
    if (typeof product.specs.year === 'number') return product.specs.year;
    if (typeof product.specs.releaseDate === 'string') {
      const yearMatch = product.specs.releaseDate.match(/\b(19\d\d|20\d\d)\b/);
      if (yearMatch) return parseInt(yearMatch[1], 10);
    }
  }

  // 4. From product name or slug regex (e.g., "(2016)", "2015")
  const text = `${product.name || ''} ${product.slug || ''}`;
  const nameYearMatch = text.match(/\b(19\d\d|20\d\d)\b/);
  if (nameYearMatch) {
    const y = parseInt(nameYearMatch[1], 10);
    if (y >= 1990 && y <= 2030) return y;
  }

  // 5. Inferred from classic/retro legacy model families
  const lowerName = (product.name || '').toLowerCase();
  if (
    lowerName.includes('ascend') ||
    lowerName.includes('sonic') ||
    lowerName.includes('vision u8850') ||
    lowerName.includes('g300') ||
    lowerName.includes('g510') ||
    lowerName.includes('g610') ||
    lowerName.includes('g700') ||
    lowerName.includes('mate 7') ||
    lowerName.includes('mate 8') ||
    lowerName.includes('mate 9') ||
    lowerName.includes('mate s') ||
    lowerName.includes('p6') ||
    lowerName.includes('p7') ||
    lowerName.includes('p8') ||
    lowerName.includes('p9') ||
    lowerName.includes('y5ii') ||
    lowerName.includes('y6ii') ||
    lowerName.includes('y3')
  ) {
    return 2015; // Inferred pre-2018 retro
  }

  return null;
}

/**
 * Determines whether a product is eligible for the 8 Store Live Price Comparison pool.
 * - Samsung and Apple: ALWAYS ELIGIBLE (Exempt from the pre-2018 exclusion).
 * - Other brands: ELIGIBLE ONLY IF release year is 2018 or newer (or unknown modern).
 * - Other brands before 2018 (< 2018): INELIGIBLE (Excluded from live price comparison).
 */
export function isEligibleForLivePriceComparison(product?: ProductLike | null): boolean {
  if (!product) return false;

  const brand = (product.brand || '').trim().toLowerCase();

  // Rule: Samsung and Apple products are exempt from this exclusion
  if (brand.includes('samsung') || brand.includes('apple')) {
    return true;
  }

  const year = getProductReleaseYear(product);

  // If release year is known and before 2018, exclude from live price comparison
  if (year !== null && year < 2018) {
    return false;
  }

  return true;
}

/**
 * Checks if a product is a historical/retro model that should display the dedicated Retro Archive UI.
 */
export function isHistoricalRetroModel(product?: ProductLike | null): boolean {
  if (!product) return false;
  return !isEligibleForLivePriceComparison(product);
}

/**
 * Returns structured historical & retro context for a legacy product.
 */
export function getHistoricalRetroContext(product?: ProductLike | null) {
  const year = getProductReleaseYear(product) || 2014;
  const brand = product?.brand || 'Huawei';
  const name = product?.name || 'Klasik Model';

  let eraTitle = `${year} Yılı Klasik Teknoloji Çağı`;
  let eraDescription = `Bu model ${year} yılında piyasaya sunulmuş olup, dönemin mobil teknoloji standartlarını ve tasarım anlayışını yansıtmaktadır.`;
  let techMilestone = '3G / 4G Geçiş Dönemi & Klasik Android/EMUI Arayüzü';

  if (year <= 2012) {
    eraTitle = 'Akıllı Telefonların İlk Dönemi (2010-2012)';
    eraDescription = 'Kapasitif dokunmatik ekranlara ve ilk nesil akıllı işlemcilere geçiş döneminin öncü modellerinden biri.';
    techMilestone = 'Android 2.x Froyo/Gingerbread & 3G HSDPA Mobil Bağlantı';
  } else if (year <= 2015) {
    eraTitle = 'Tasarım ve İncelik Çağı (2013-2015)';
    eraDescription = 'Ultra ince alüminyum gövde, IPS ekran teknolojisi ve ilk nesil çok çekirdekli mobil işlemcilerin yükseliş dönemi.';
    techMilestone = 'Full HD Ekranlar, 4G LTE Desteği & İlk Çift Kamera Deneyleri';
  } else if (year <= 2017) {
    eraTitle = 'Çift Kamera ve Yapay Zekâ Başlangıcı (2016-2017)';
    eraDescription = 'Mobil fotoğrafçılıkta Leica işbirliklerinin ve yapay zekâ destekli NPU işlemcilerin ilk kez sahneye çıktığı dönem.';
    techMilestone = 'Leica Çift Kamera Optiği, Parmak İzi Sensörleri & Hızlı Şarj Standartları';
  }

  return {
    releaseYear: year,
    brand,
    name,
    eraTitle,
    eraDescription,
    techMilestone,
    archiveStatus: 'Tarihi Teknoloji ve Koleksiyon Arşivi',
    availabilityNotice: 'Bu modelin yetkili perakendecilerde sıfır piyasa satışı tamamlanmıştır. Bilgi bankamızda tarihsel referans, koleksiyon kaydı ve teknoloji müzesi niteliğinde sergilenmektedir.',
    modernSuccessorRecommendation: `${brand}'nin güncel amiral gemisi ve yeni nesil modellerini canlı fiyat karşılaştırmalarıyla inceleyebilirsiniz.`
  };
}
