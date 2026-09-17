import { NextResponse } from 'next/server';
import { getDailyTechNews } from '@/lib/news/dailyTechNewsEngine';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query = searchParams.get('q')?.toLowerCase();

    const data = await getDailyTechNews();
    let items = [...data.articles];

    if (category && category !== 'all') {
      items = items.filter((item) => item.category === category);
    }

    if (query) {
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.summary.toLowerCase().includes(query) ||
          item.source.toLowerCase().includes(query) ||
          item.takeaway.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({
      success: true,
      dateStr: data.dateStr,
      scheduledTime: data.scheduledTime,
      lastUpdated: data.lastUpdated,
      count: items.length,
      articles: items,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Haberler yüklenirken bir hata oluştu: ' + (error?.message || '') },
      { status: 500 }
    );
  }
}
