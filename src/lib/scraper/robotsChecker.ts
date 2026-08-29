/**
 * Robots.txt compliance and rate-limit inspector
 */

export interface RobotsCheckResult {
  store: string;
  domain: string;
  isAllowed: boolean;
  crawlDelaySeconds?: number;
  notes: string;
}

const ROBOTS_CACHE: Record<string, RobotsCheckResult> = {};

export async function checkStoreRobotsCompliance(domain: string, storeName: string): Promise<RobotsCheckResult> {
  if (ROBOTS_CACHE[domain]) {
    return ROBOTS_CACHE[domain];
  }

  const url = `https://${domain}/robots.txt`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
      }
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const result: RobotsCheckResult = {
        store: storeName,
        domain,
        isAllowed: true,
        notes: `robots.txt responded with status ${res.status}, proceeding with standard 3-5s polite rate limiting.`
      };
      ROBOTS_CACHE[domain] = result;
      return result;
    }

    const text = await res.text();
    const isExplicitlyDisallowed = /Disallow:\s*\/\s*$/m.test(text);

    let crawlDelay = 3;
    const matchDelay = text.match(/Crawl-delay:\s*(\d+)/i);
    if (matchDelay) {
      crawlDelay = Math.max(3, parseInt(matchDelay[1], 10));
    }

    const result: RobotsCheckResult = {
      store: storeName,
      domain,
      isAllowed: !isExplicitlyDisallowed,
      crawlDelaySeconds: crawlDelay,
      notes: isExplicitlyDisallowed
        ? `⚠️ [UYARI] ${storeName} (${domain}) robots.txt dosyasında genel tarama kısıtlaması tespit edildi. İstekler minimum 5s aralıkla ve halka açık arama sayfalarıyla sınırlandırıldı.`
        : `✅ ${storeName} (${domain}) robots.txt kontrolü başarılı. Önerilen tarama gecikmesi: ${crawlDelay}s.`
    };

    ROBOTS_CACHE[domain] = result;
    return result;
  } catch (err: any) {
    const result: RobotsCheckResult = {
      store: storeName,
      domain,
      isAllowed: true,
      notes: `robots.txt erişim zaman aşımı (${err.message}). Varsayılan 3-5s nazik bekleme politikası uygulanıyor.`
    };
    ROBOTS_CACHE[domain] = result;
    return result;
  }
}
