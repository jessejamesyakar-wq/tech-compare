// app/api/cron/scrape-prices/route.ts
//
// KAPSAM: Sadece Hepsiburada. Trendyol ve Amazon TR robots.txt ile
// otomatik erişimi engelliyor (test ettik, ikisi de reddetti) — bu
// yüzden şimdilik kapsam dışı bırakıldı. İleride bu iki site için
// resmi affiliate/partner API'lerine geçilecek.
//
// DÜRÜST NOT: Bu kodu gerçek Hepsiburada sunucusuna karşı test
// edemedim (bu ortamın ağ erişimi hepsiburada.com'a kapalı). Bu yüzden
// TEK bir sabit selector'a güvenmek yerine, sırayla üç farklı çıkarma
// stratejisi deniyor (JSON-LD -> meta tag -> regex). Yine de canlıya
// almadan önce MUTLAKA gerçek ortamda (Vercel preview'da, cron'u elle
// tetikleyerek) test etmen gerekiyor. İlk denemede sonuç boş/hatalı
// gelirse, bana o ürünün gerçek HTML kaynağını (tarayıcıda sağ tık >
// "Sayfa Kaynağını Görüntüle") gönder, kodu ona göre kesinleştiririm.

import { NextResponse } from "next/server";
import { getProductsByFilter } from "@/lib/data";

export const dynamic = "force-dynamic";

const HEPSIBURADA_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept-Language": "tr-TR,tr;q=0.9",
};

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Kullanıcı kararı: önce sadece 2026 model ürünler.
  // Projedeki gerçek model yılı alanı: releaseYear (geriye dönük uyumluluk için modelYear kontrolü de dahil)
  const products2026 = getProductsByFilter((p: any) => p.releaseYear === 2026 || p.modelYear === 2026);

  const results: Array<{
    id: string;
    name: string;
    status: "ok" | "error" | "not_found";
    price?: number;
    productUrl?: string;
    error?: string;
  }> = [];

  for (const product of products2026) {
    try {
      const productUrl = await findHepsiburadaProductUrl(product.name);
      if (!productUrl) {
        results.push({ id: product.id, name: product.name, status: "not_found" });
        continue;
      }

      const price = await extractPriceFromProductPage(productUrl);
      if (price === null) {
        results.push({
          id: product.id,
          name: product.name,
          status: "error",
          productUrl,
          error: "Fiyat sayfadan çıkarılamadı",
        });
        continue;
      }

      // TODO: buraya veritabanına/KV store'a yazma mantığını ekle.
      // Örn: await savePriceToDb(product.id, "hepsiburada", price);

      results.push({ id: product.id, name: product.name, status: "ok", price, productUrl });
    } catch (err) {
      results.push({
        id: product.id,
        name: product.name,
        status: "error",
        error: String(err),
      });
    }
  }

  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    totalChecked: products2026.length,
    okCount: results.filter((r) => r.status === "ok").length,
    results,
  });
}

/**
 * ADIM 1: Ürün adını Hepsiburada'da arayıp ilk ürün sonucunun linkini bulur.
 * Hepsiburada ürün linkleri "-p-HB..." formatıyla bitiyor (örnek:
 * apple-iphone-17-pro-256-gb-abis-p-HBCV00009Z3YPK gibi).
 */
async function findHepsiburadaProductUrl(productName: string): Promise<string | null> {
  const searchUrl = `https://www.hepsiburada.com/ara?q=${encodeURIComponent(productName)}`;

  const res = await fetch(searchUrl, { headers: HEPSIBURADA_HEADERS });
  if (!res.ok) {
    throw new Error(`Arama isteği başarısız: ${res.status}`);
  }
  const html = await res.text();

  // Ürün sayfası linklerini yakalayan regex. Hepsiburada'nın arama
  // sonucu HTML yapısı değişirse bu regex'in güncellenmesi gerekebilir.
  const productLinkPattern = /href="(https:\/\/www\.hepsiburada\.com\/[^"]+-p-[A-Za-z0-9]+)"/;
  const match = html.match(productLinkPattern);

  return match ? match[1] : null;
}

/**
 * ADIM 2: Ürün sayfasından fiyatı çıkarır. Üç strateji sırayla denenir:
 * 1) JSON-LD structured data (schema.org Product/Offer) — en stabil yöntem,
 *    çoğu e-ticaret sitesi SEO için bunu ekler.
 * 2) <meta itemprop="price" content="..."> gibi mikro-veri etiketleri.
 * 3) Genel regex ile "123.456,78 TL" formatındaki ilk fiyatı yakalama
 *    (en kırılgan yöntem, sadece diğer ikisi başarısız olursa devreye girer).
 */
async function extractPriceFromProductPage(productUrl: string): Promise<number | null> {
  const res = await fetch(productUrl, { headers: HEPSIBURADA_HEADERS });
  if (!res.ok) {
    throw new Error(`Ürün sayfası isteği başarısız: ${res.status}`);
  }
  const html = await res.text();

  // Strateji 1: JSON-LD
  const jsonLdPrice = extractFromJsonLd(html);
  if (jsonLdPrice !== null) return jsonLdPrice;

  // Strateji 2: meta itemprop="price"
  const metaMatch = html.match(/itemprop=["']price["']\s+content=["']([\d.,]+)["']/);
  if (metaMatch) {
    return parseTurkishPrice(metaMatch[1]);
  }

  // Strateji 3: genel "X.XXX,XX TL" regex fallback
  const genericMatch = html.match(/([\d]{1,3}(?:\.[\d]{3})*,[\d]{2})\s*TL/);
  if (genericMatch) {
    return parseTurkishPrice(genericMatch[1]);
  }

  return null;
}

function extractFromJsonLd(html: string): number | null {
  const scriptMatches = html.matchAll(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
  );

  for (const match of scriptMatches) {
    try {
      const data = JSON.parse(match[1]);
      const candidates = Array.isArray(data) ? data : [data];

      for (const item of candidates) {
        const offers = item?.offers;
        const price = offers?.price ?? offers?.[0]?.price;
        if (price) {
          return typeof price === "number" ? price : parseFloat(String(price));
        }
      }
    } catch {
      // Bu script bloğu geçerli JSON değil, bir sonrakine geç.
      continue;
    }
  }

  return null;
}

/**
 * Türkçe fiyat formatını ("105.315,07") sayıya çevirir.
 * Binlik ayracı nokta, ondalık ayracı virgül olduğu için standart
 * parseFloat kullanılamaz.
 */
function parseTurkishPrice(raw: string): number {
  const normalized = raw.replace(/\./g, "").replace(",", ".");
  return parseFloat(normalized);
}
