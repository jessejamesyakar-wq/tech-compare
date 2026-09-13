import { NextResponse } from 'next/server';
import { GLOBAL_AI_NEWS } from '@/lib/ai/aiNewsData';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query = searchParams.get('q')?.toLowerCase();

    let items = [...GLOBAL_AI_NEWS];

    if (category && category !== 'all') {
      items = items.filter((item) => item.category === category);
    }

    if (query) {
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.summary.toLowerCase().includes(query) ||
          item.source.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({
      success: true,
      lastUpdated: new Date().toISOString(),
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
