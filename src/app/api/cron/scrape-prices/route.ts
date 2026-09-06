// app/api/cron/scrape-prices/route.ts
//
// GÜNCELLEME: 87 ürünü tek seferde işlemek zaman aşımına yol açıyordu
// (~20 dakika, Vercel serverless fonksiyon limitlerini aşıyor). Bu yüzden
// artık ?offset= ve ?limit= query paramlarıyla küçük gruplar halinde
// çalışıyor. vercel.json'da her biri farklı offset ile birkaç dakika
// arayla tetiklenen birden fazla cron tanımlıyoruz.

import { NextResponse } from "next/server";
import { getProductsByFilter } from "@/lib/data";

export const dynamic = "force-dynamic";

const HEPSIBURADA_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept-Language": "tr-TR,tr;q=0.9",
};

// Bir batch'te kaç ürün işlenecek. Hepsiburada'nın gerçek yanıt
// süresine göre bu sayıyı ayarlayabilirsin — düşürürsen daha güvenli
// (zaman aşımı riski azalır) ama tüm kataloğu taramak daha uzun sürer.
const DEFAULT_BATCH_SIZE = 5;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);
  const limit = parseInt(searchParams.get("limit") ?? String(DEFAULT_BATCH_SIZE), 10);

  const allProducts2026 = getProductsByFilter(
    (p: any) => p.releaseYear === 2026 || p.modelYear === 2026
  );
  const batch = allProducts2026.slice(offset, offset + limit);

  const results: Array<{
    id: string;
    name: string;
    status: "ok" | "error" | "not_found";
    price?: number;
    productUrl?: string;
    error?: string;
  }> = [];

  for (const product of batch) {
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

      // TODO: veritabanına/KV store'a yazma mantığı buraya.
      results.push({ id: product.id, name: product.name, status: "ok", price, productUrl });
    } catch (err) {
      results.push({ id: product.id, name: product.name, status: "error", error: String(err) });
    }
  }

  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    batchOffset: offset,
    batchLimit: limit,
    totalProducts: allProducts2026.length,
    hasMore: offset + limit < allProducts2026.length,
    okCount: results.filter((r) => r.status === "ok").length,
    results,
  });
}

async function findHepsiburadaProductUrl(productName: string): Promise<string | null> {
  const searchUrl = `https://www.hepsiburada.com/ara?q=${encodeURIComponent(productName)}`;
  const res = await fetch(searchUrl, { headers: HEPSIBURADA_HEADERS });
  if (!res.ok) throw new Error(`Arama isteği başarısız: ${res.status}`);
  const html = await res.text();

  const productLinkPattern = /href="(https:\/\/www\.hepsiburada\.com\/[^"]+-p-[A-Za-z0-9]+)"/;
  const match = html.match(productLinkPattern);
  return match ? match[1] : null;
}

async function extractPriceFromProductPage(productUrl: string): Promise<number | null> {
  const res = await fetch(productUrl, { headers: HEPSIBURADA_HEADERS });
  if (!res.ok) throw new Error(`Ürün sayfası isteği başarısız: ${res.status}`);
  const html = await res.text();

  const jsonLdPrice = extractFromJsonLd(html);
  if (jsonLdPrice !== null) return jsonLdPrice;

  const metaMatch = html.match(/itemprop=["']price["']\s+content=["']([\d.,]+)["']/);
  if (metaMatch) return parseTurkishPrice(metaMatch[1]);

  const genericMatch = html.match(/([\d]{1,3}(?:\.[\d]{3})*,[\d]{2})\s*TL/);
  if (genericMatch) return parseTurkishPrice(genericMatch[1]);

  return null;
}

function extractFromJsonLd(html: string): number | null {
  const scriptMatches = html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
  for (const match of scriptMatches) {
    try {
      const data = JSON.parse(match[1]);
      const candidates = Array.isArray(data) ? data : [data];
      for (const item of candidates) {
        const offers = item?.offers;
        const price = offers?.price ?? offers?.[0]?.price;
        if (price) return typeof price === "number" ? price : parseFloat(String(price));
      }
    } catch {
      continue;
    }
  }
  return null;
}

function parseTurkishPrice(raw: string): number {
  return parseFloat(raw.replace(/\./g, "").replace(",", "."));
}
