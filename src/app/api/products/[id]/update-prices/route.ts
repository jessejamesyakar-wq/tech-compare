import { NextRequest, NextResponse } from 'next/server';
import { getStoredProducts } from '@/lib/adminData';
import { PriceWorker } from '@/lib/workers/priceWorker';
import { priceQueue } from '@/lib/queue/priceQueue';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const all = getStoredProducts();
    const product = all.find((p) => p.id === id);

    if (!product) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    }

    // Enqueue job with high priority for on-demand user/admin triggers
    await priceQueue.enqueue({
      productId: id,
      priority: 'HIGH_PRIORITY',
    });

    const result = await PriceWorker.processProduct(product);

    return NextResponse.json({
      ok: true,
      productId: id,
      result,
    });
  } catch (error) {
    console.error('Error triggering price update:', error);
    return NextResponse.json(
      { error: 'Fiyat güncelleme başlatılamadı', details: String(error) },
      { status: 500 }
    );
  }
}
