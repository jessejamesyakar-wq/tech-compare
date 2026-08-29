import { NextRequest, NextResponse } from 'next/server';
import { execute2026PriceScrape } from '@/lib/scraper/livePriceScraper2026';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max duration for scraping task

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Optional authorization check for production security
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;

    const report = await execute2026PriceScrape(limit);

    return NextResponse.json({
      success: true,
      message: '2026 Model Fiyat Tarama Sistemi başarıyla tamamlandı.',
      totalProducts: report.total2026ProductsFound,
      updated: report.successfullyUpdatedCount,
      report
    });
  } catch (error: any) {
    console.error('[API Scrape 2026] Hata:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
