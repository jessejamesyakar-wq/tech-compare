import { NextRequest, NextResponse } from 'next/server';
import { PriceRepository } from '@/lib/db/priceRepository';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const history = await PriceRepository.getPriceHistory(id);

    return NextResponse.json({
      productId: id,
      count: history.length,
      history,
    });
  } catch (error) {
    console.error('Error fetching price history:', error);
    return NextResponse.json(
      { error: 'Fiyat geçmişi alınırken hata oluştu', details: String(error) },
      { status: 500 }
    );
  }
}
