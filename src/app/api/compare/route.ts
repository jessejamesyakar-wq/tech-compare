// app/api/compare/route.ts
//
// aceleEtme Fiyat Kıyaslayıcı - Tarayıcı Uzantısı Backend Endpoint'i
//
// Tarayıcı uzantısı, kullanıcının gezdiği ürün sayfasındaki ürün adını
// buraya GET isteğiyle gönderir (?q=...). Bu endpoint, kataloğumuzdaki
// tam model/varyant eşleşmesi varsa güncel mağaza fiyatlarını döner.

import { NextRequest, NextResponse } from "next/server";
import { getStoredProducts } from "@/lib/adminData";
import { getEligibleDirectOffers } from '@/lib/pricing/unifiedPriceEvaluator';
import { matchExtensionProduct } from '@/lib/extensionProductMatcher';
import { parseOfferDateToMs } from '@/lib/dateParsing';

interface StorePrice {
  store: string;
  price: number;
  inStock?: boolean;
  lastCheckedAt?: string;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Cache-Control": "no-store",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");

  if (!query || query.trim().length < 3 || query.length > 500 || /[\u0000-\u001f\u007f]/.test(query) || req.nextUrl.searchParams.getAll('q').length !== 1) {
    return NextResponse.json(
      { match: null, error: "Geçersiz arama sorgusu." },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const resolved = matchExtensionProduct(query, getStoredProducts());
  const product = resolved.product;

  if (!product) {
    return NextResponse.json({ match: null, reason: resolved.status }, { headers: CORS_HEADERS });
  }

  const { freshDirectOffers } = getEligibleDirectOffers(product.storeOffers);
  const allPrices: StorePrice[] = freshDirectOffers.map(offer => ({
    store: offer.storeName,
    price: offer.price,
    inStock: true,
    lastCheckedAt: new Date(parseOfferDateToMs(offer.lastCheckedAt)).toISOString(),
  }));

  if (allPrices.length === 0) {
    return NextResponse.json({ match: null, reason: 'no_fresh_offer' }, { headers: CORS_HEADERS });
  }

  // En ucuz fiyatı bul
  const cheapest = allPrices.reduce((min, p) => (p.price < min.price ? p : min), allPrices[0]);

  const category = product.category === "smartphones" ? "phones" : product.category || "phones";
  const slug = encodeURIComponent(product.slug || product.id);
  const aceleetmeUrl = `https://www.aceleetme.tech/${category}/${slug}`;

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
        lastCheckedAt: cheapest.lastCheckedAt,
        statusLabel: 'Güncel Fiyat',
        allPrices,
        aceleetmeUrl,
      },
    },
    { headers: CORS_HEADERS }
  );
}
