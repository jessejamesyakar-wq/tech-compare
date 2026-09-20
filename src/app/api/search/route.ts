import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/data';
import { evaluateProductPricing } from '@/lib/pricing/unifiedPriceEvaluator';
import { parseSearchLimit } from '@/lib/searchPresentation';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const limitParam = searchParams.get('limit');
    const limit = parseSearchLimit(limitParam);

    if (q.length > 200) return NextResponse.json({ error: 'Arama en fazla 200 karakter olabilir.' }, { status: 400 });

    if (!q || q.trim().length === 0) {
      return NextResponse.json([]);
    }

    const results = await searchProducts(q.trim(), limit);
    
    // Return lightweight product projections with unified pricing evaluation
    const lightweight = results.map((p) => {
      const evaluated = evaluateProductPricing(p);
      return {
        id: p.id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        image: p.image,
        slug: p.slug,
        rating: p.rating,
        isPopular: p.isPopular,
        basePrice: p.basePrice,
        currentPrice: evaluated.currentPrice,
        lastSeenPrice: evaluated.lastSeenPrice,
        displayPrice: evaluated.displayPrice,
        priceStatus: evaluated.priceStatus,
        statusLabel: evaluated.statusLabel,
        lastCheckedAt: evaluated.lastCheckedAt,
        activeStoreCount: evaluated.activeStoreCount,
        staleStoreCount: evaluated.staleStoreCount,
      };
    });

    return NextResponse.json(lightweight, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('API Search Error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
