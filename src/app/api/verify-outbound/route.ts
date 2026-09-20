import { NextRequest, NextResponse } from 'next/server';
import { PriceVerificationEngine } from '@/lib/security/priceVerification';
import { getProductById } from '@/lib/data';
import { readLimitedJson } from '@/lib/security/requestBody';

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await readLimitedJson(req, 8192);
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
    if (typeof body.productId !== 'string' || !body.productId.trim() || body.productId.length > 300) throw new Error();
    if (typeof body.storeName !== 'string' || !body.storeName.trim() || body.storeName.length > 120) throw new Error();
    if (body.targetUrl !== undefined && (typeof body.targetUrl !== 'string' || body.targetUrl.length > 2048)) throw new Error();
  } catch {
    return NextResponse.json({ success: false, error: 'Geçerli ürün ve mağaza bilgisi gerekli.' }, { status: 400 });
  }
  const product = getProductById(body.productId);
  if (!product) return NextResponse.json({ success: false, error: 'Ürün bulunamadı.' }, { status: 404 });
  const matching = (product.storeOffers || []).filter((offer) =>
    offer.storeName.trim().toLocaleLowerCase('tr-TR') === body.storeName.trim().toLocaleLowerCase('tr-TR')
    && (body.targetUrl === undefined || offer.url === body.targetUrl));
  if (!matching.length) return NextResponse.json({ success: false, error: 'Kayıtlı mağaza bağlantısı bulunamadı.' }, { status: 404 });
  // Client-supplied prices, stock and dates are never treated as evidence.
  const results = matching.map((offer) => PriceVerificationEngine.verifyOffer(offer));
  results.sort((a, b) => Number(b.verified) - Number(a.verified) || (a.currentPrice ?? Infinity) - (b.currentPrice ?? Infinity));
  return NextResponse.json({ success: true, verification: results[0] }, { headers: { 'Cache-Control': 'no-store' } });
}
