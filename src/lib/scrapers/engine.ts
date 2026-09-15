import * as cheerio from 'cheerio';

export type StoreKey =
  | 'hepsiburada' | 'trendyol' | 'amazon' | 'n11' | 'pttavm'
  | 'vatan' | 'mediamarkt' | 'teknosa' | 'incehesap' | 'itopya'
  | 'sinerji' | 'gaminggen' | 'gamegaraj' | 'tebilon' | 'ebrar';

export interface ScrapeOutput {
  store: StoreKey;
  price: number | null;
  inStock: boolean;
  title: string | null;
  currency: string;
  isValid: boolean;
  error?: string;
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:129.0) Gecko/20100101 Firefox/129.0'
];

export function resolveStore(url: string): StoreKey | null {
  if (!url || typeof url !== 'string') return null;
  const lower = url.toLowerCase();
  if (lower.includes('hepsiburada.com')) return 'hepsiburada';
  if (lower.includes('trendyol.com')) return 'trendyol';
  if (lower.includes('amazon.com.tr') || lower.includes('amazon.tr')) return 'amazon';
  if (lower.includes('n11.com')) return 'n11';
  if (lower.includes('pttavm.com')) return 'pttavm';
  if (lower.includes('vatanbilgisayar.com')) return 'vatan';
  if (lower.includes('mediamarkt.com.tr') || lower.includes('mediamarkt.com')) return 'mediamarkt';
  if (lower.includes('teknosa.com')) return 'teknosa';
  if (lower.includes('incehesap.com')) return 'incehesap';
  if (lower.includes('itopya.com')) return 'itopya';
  if (lower.includes('sinerji.gen.tr') || lower.includes('sinerji.com')) return 'sinerji';
  if (lower.includes('gaming.gen.tr') || lower.includes('gaminggen')) return 'gaminggen';
  if (lower.includes('gamegaraj.com')) return 'gamegaraj';
  if (lower.includes('tebilon.com')) return 'tebilon';
  if (lower.includes('ebrarbilgisayar.com') || lower.includes('ebrar.com')) return 'ebrar';
  return null;
}

// Türkçe para formatını kusursuz float'a çevirici (örn: "54.999,90 TL" -> 54999.90)
export function cleanTurkishPrice(raw: string): number | null {
  if (!raw) return null;
  const sanitized = raw.replace(/[^\d.,]/g, '').trim();
  if (!sanitized) return null;

  if (sanitized.includes(',') && sanitized.includes('.')) {
    // 54.999,90 formatı
    const standard = sanitized.replace(/\./g, '').replace(',', '.');
    const val = parseFloat(standard);
    return isNaN(val) ? null : val;
  } else if (sanitized.includes(',')) {
    // 54999,90 formatı
    const val = parseFloat(sanitized.replace(',', '.'));
    return isNaN(val) ? null : val;
  } else if (sanitized.includes('.')) {
    // 54999.90 veya binlik nokta
    const parts = sanitized.split('.');
    if (parts.length > 1 && parts[parts.length - 1].length === 3) {
      return parseFloat(sanitized.replace(/\./g, ''));
    }
    return parseFloat(sanitized);
  }
  const val = parseFloat(sanitized);
  return isNaN(val) ? null : val;
}

export async function scrapeTargetStore(url: string): Promise<ScrapeOutput> {
  const store = resolveStore(url);
  if (!store) {
    return {
      store: 'hepsiburada',
      price: null,
      inStock: false,
      title: null,
      currency: 'TRY',
      isValid: false,
      error: 'Bilinmeyen Mağaza URL'
    };
  }

  const randomUA = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  const headers = {
    'User-Agent': randomUA,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8',
    'Sec-Ch-Ua': '"Chromium";v="128", "Not;A=Brand";v="24"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0'
  };

  try {
    const res = await fetch(url, { headers, next: { revalidate: 0 } });
    if (!res.ok) throw new Error(`HTTP Durum Kodu: ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);

    let price: number | null = null;
    let inStock = true;
    let title: string | null = null;

    // 1. AŞAMA: JSON-LD Schema Doğrulaması
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).html() || '{}');
        const nodes = Array.isArray(json) ? json : [json];

        for (const item of nodes) {
          if (item['@type'] === 'Product' || item.offers) {
            title = title || item.name || null;
            const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers;
            if (offer) {
              const rawPrice = offer.price || offer.lowPrice;
              if (rawPrice) {
                price = typeof rawPrice === 'number' ? rawPrice : cleanTurkishPrice(String(rawPrice));
              }
              if (offer.availability) {
                inStock = offer.availability.toLowerCase().includes('instock');
              }
            }
          }
        }
      } catch {}
    });

    // 2. AŞAMA: Mağazaya Özel DOM Fallback Seçicileri
    if (!price) {
      let rawText = '';
      switch (store) {
        case 'hepsiburada':
          rawText = $('[data-test-id="price-current-price"]').first().text() ||
                    $('.price-current-price').first().text() ||
                    $('[data-bind*="currentPriceBeforePoint"]').first().text();
          break;
        case 'trendyol':
          rawText = $('.prc-dsc').first().text() || $('.product-price-container').first().text();
          break;
        case 'amazon':
          const whole = $('.a-price-whole').first().text().replace(/[^\d]/g, '');
          const fraction = $('.a-price-fraction').first().text().replace(/[^\d]/g, '') || '00';
          if (whole) price = parseFloat(`${whole}.${fraction}`);
          inStock = !$('#outOfStock').length;
          break;
        case 'n11':
          rawText = $('.newPrice ins').first().text() || $('.unf-p-detail-price').first().text();
          break;
        case 'pttavm':
          rawText = $('.product-price').first().text() || $('[data-test="price"]').first().text();
          break;
        case 'vatan':
          rawText = $('.product-list__price').first().text() || $('.price').first().text();
          break;
        case 'mediamarkt':
          rawText = $('[data-test="product-price"]').first().text() || $('.price').first().text();
          break;
        case 'teknosa':
          rawText = $('.prc-first').first().text() || $('.pdp-price').first().text();
          break;
        case 'incehesap':
          rawText = $('.cur-price').first().text() || $('#satistutar').first().text();
          break;
        case 'itopya':
          rawText = $('.price strong').first().text() || $('.product-price').first().text();
          break;
        case 'sinerji':
          rawText = $('.fiyat-deger').first().text() || $('.product-price').first().text();
          break;
        case 'gaminggen':
          rawText = $('.woocommerce-Price-amount').first().text() || $('.price-now').first().text();
          break;
        case 'gamegaraj':
          rawText = $('.current-price').first().text() || $('.price').first().text();
          break;
        case 'tebilon':
          rawText = $('.product-details-price').first().text() || $('.price').first().text();
          break;
        case 'ebrar':
          rawText = $('.urun-fiyat-detay').first().text() || $('.fiyat').first().text();
          break;
      }

      if (rawText && !price) {
        price = cleanTurkishPrice(rawText);
      }
    }

    if (!title) {
      title = $('h1').first().text().trim() || null;
    }

    // 3. AŞAMA: Veri Sağlama & Güvenlik Kontrolü (Sanity Check)
    const isValid = price !== null && price > 100 && price < 500000;

    return {
      store,
      price: isValid ? price : null,
      inStock,
      title,
      currency: 'TRY',
      isValid,
      error: !isValid ? 'Fiyat okunamadı veya aralık dışı' : undefined
    };
  } catch (err: any) {
    return {
      store,
      price: null,
      inStock: false,
      title: null,
      currency: 'TRY',
      isValid: false,
      error: err.message || 'Scrape başarısız oldu'
    };
  }
}
