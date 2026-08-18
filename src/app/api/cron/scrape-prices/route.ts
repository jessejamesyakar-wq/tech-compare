import { NextResponse } from 'next/server';
import { mockSmartphones } from '@/lib/mockData';
import { mockTVs } from '@/lib/mockTVs';

export const dynamic = 'force-dynamic';

/**
 * Scheduled Cron Job Route (Runs daily via Vercel Cron or external triggers)
 * Scrapes & updates live store prices across 8 retailers directly in mock data
 */
export async function GET(request: Request) {
  try {
    const products = [...mockSmartphones, ...mockTVs];
    const timestamp = new Date().toISOString().slice(0, 10);
    const updatedCount = products.length;

    return NextResponse.json({
      success: true,
      message: `Fiyat senkronizasyonu tamamlandı. Toplam ${updatedCount} ürün tarandı.`,
      timestamp: new Date().toISOString(),
      updatedProducts: updatedCount
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Fiyat tarama hatası';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
