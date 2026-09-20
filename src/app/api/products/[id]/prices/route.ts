import { NextRequest, NextResponse } from 'next/server';
import { PriceRepository } from '@/lib/db/priceRepository';
import { PriceNormalizer } from '@/lib/pricing/priceNormalizer';
import { getProductById } from '@/lib/data';
import { parseOfferDateToMs } from '@/lib/dateParsing';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = getProductById(id);
    if (!product) return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    const rawPrices = await PriceRepository.getPricesForProduct(product.id);
    const viewList = PriceNormalizer.preparePriceViewList(rawPrices);
    const checkTimes = viewList.map((p) => parseOfferDateToMs(p.checkedAt)).filter((time) => time > 0 && time <= Date.now());

    return NextResponse.json({
      productId: product.id,
      count: viewList.length,
      offers: viewList,
      lowestPrice: viewList.find((p) => p.isCheapest)?.price ?? null,
      updatedAt: checkTimes.length ? new Date(Math.max(...checkTimes)).toISOString() : null,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching product prices:', error);
    return NextResponse.json(
      { error: 'Fiyatlar alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}
