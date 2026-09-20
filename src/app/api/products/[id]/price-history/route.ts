import { NextRequest, NextResponse } from 'next/server';
import { PriceRepository } from '@/lib/db/priceRepository';
import { getProductById } from '@/lib/data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = getProductById(id);
    if (!product) return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    const history = await PriceRepository.getPriceHistory(product.id);

    return NextResponse.json({
      productId: product.id,
      count: history.length,
      history,
    });
  } catch (error) {
    console.error('Error fetching price history:', error);
    return NextResponse.json(
      { error: 'Fiyat geçmişi alınırken hata oluştu' },
      { status: 500 }
    );
  }
}
