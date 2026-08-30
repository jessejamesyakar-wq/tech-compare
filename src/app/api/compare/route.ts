// app/api/compare/route.ts
//
// aceleEtme Fiyat Kıyaslayıcı - Tarayıcı Uzantısı Backend Endpoint'i
//
// Tarayıcı uzantısı, kullanıcının gezdiği ürün sayfasındaki ürün adını
// buraya GET isteğiyle gönderir (?q=...). Bu endpoint, kataloğumuzdaki
// en yakın eşleşen ürünü bulur ve mağaza fiyatlarını döner.

import { NextRequest, NextResponse } from "next/server";
import { getStoredProducts } from "@/lib/adminData";
import { Product } from "@/lib/types";

interface StorePrice {
  store: string;
  price: number;
  inStock?: boolean;
}

// Gelişmiş benzerlik skoru: tam model adı, depolama ve çoklu kelime öbeklerine göre akıllı puanlama
function similarityScore(query: string, product: Product): number {
  const cleanQ = query.toLowerCase().replace(/[^\w\sğüşıöç]/g, " ").trim();
  const qTokens = cleanQ.split(/\s+/).filter((w) => w.length > 1);

  const pName = product.name.toLowerCase();
  const pBrand = product.brand.toLowerCase();
  const pSlug = product.slug.toLowerCase().replace(/-/g, " ");

  let score = 0;

  // 1. Doğrudan alt dize eşleşmesi
  if (pName.includes(cleanQ) || cleanQ.includes(pName)) {
    score += 40;
  }

  // 2. Kelime bazlı eşleşmeler
  let tokenMatches = 0;
  for (const token of qTokens) {
    if (pBrand === token) {
      score += 5;
      tokenMatches++;
    } else if (pName.includes(token)) {
      score += token.length >= 4 ? 6 : 3;
      tokenMatches++;
    } else if (pSlug.includes(token)) {
      score += 2;
      tokenMatches++;
    }
  }

  // 3. İkili öbek eşleşmesi (örn. '16 pro max', 's24 ultra', 'poco c81', 'oled tv')
  for (let i = 0; i < qTokens.length - 1; i++) {
    const phrase = `${qTokens[i]} ${qTokens[i + 1]}`;
    if (pName.includes(phrase) || pSlug.includes(phrase)) {
      score += 15;
    }
  }

  // 4. Birebir depolama / RAM eşleşmesi (örn. 256 gb, 512 gb, 1 tb)
  const qStorage = cleanQ.match(/(\d+)\s*(?:gb|tb)/);
  const pStorage = pName.match(/(\d+)\s*(?:gb|tb)/);
  if (qStorage && pStorage) {
    if (qStorage[0].replace(/\s+/g, "") === pStorage[0].replace(/\s+/g, "")) {
      score += 25;
    } else {
      score -= 10;
    }
  }

  return tokenMatches >= 2 ? score : 0;
}

function findBestMatch(query: string): Product | null {
  const allProducts = getStoredProducts();
  let best: { product: Product; score: number } | null = null;

  for (const product of allProducts) {
    const score = similarityScore(query, product);
    if (score > 10 && (!best || score > best.score)) {
      best = { product, score };
    }
  }

  return best ? best.product : null;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");

  if (!query || query.trim().length < 3) {
    return NextResponse.json(
      { match: null, error: "Geçersiz arama sorgusu." },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const product = findBestMatch(query.trim());

  if (!product) {
    return NextResponse.json({ match: null }, { headers: CORS_HEADERS });
  }

  // Gerçek storeOffers verisi
  const offers = product.storeOffers || [];
  let allPrices: StorePrice[] = [];

  if (offers.length > 0) {
    allPrices = offers
      .filter((o) => o.price > 0)
      .map((o) => ({
        store: o.storeName,
        price: o.price,
        inStock: o.inStock !== false,
      }));
  }

  if (allPrices.length === 0 && product.basePrice > 0) {
    allPrices = [{ store: "En İyi Fiyat", price: product.basePrice, inStock: true }];
  }

  if (allPrices.length === 0) {
    return NextResponse.json({ match: null }, { headers: CORS_HEADERS });
  }

  // En ucuz fiyatı bul
  const cheapest = allPrices.reduce((min, p) => (p.price < min.price ? p : min), allPrices[0]);

  const category = product.category === "smartphones" ? "phones" : product.category || "phones";
  const slug = product.slug || product.id;
  const aceleetmeUrl = `https://aceleetme.com/${category}/${slug}`;

  return NextResponse.json(
    {
      match: {
        productId: product.id,
        productName: product.name,
        brand: product.brand,
        category: product.category,
        image: product.image,
        bestPrice: cheapest.price,
        bestStore: cheapest.store,
        allPrices,
        aceleetmeUrl,
      },
    },
    { headers: CORS_HEADERS }
  );
}
