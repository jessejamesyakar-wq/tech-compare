import { NextRequest, NextResponse } from 'next/server';
import { PriceRepository } from '@/lib/db/priceRepository';
import { PriceNormalizer } from '@/lib/pricing/priceNormalizer';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rawPrices = await PriceRepository.getPricesForProduct(id);
    const viewList = PriceNormalizer.preparePriceViewList(rawPrices);

    return NextResponse.json({
      productId: id,
      count: viewList.length,
      offers: viewList,
      lowestPrice: viewList.find((p) => p.isCheapest)?.totalPrice || null,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching product prices:', error);
    return NextResponse.json(
      { error: 'Fiyatlar alınırken bir hata oluştu', details: String(error) },
      { status: 500 }
    );
  }
}
