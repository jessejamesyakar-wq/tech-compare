import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    if (!q || q.trim().length === 0) {
      return NextResponse.json([]);
    }

    const results = await searchProducts(q.trim(), limit);
    
    // Return lightweight product projections to maximize transfer speed and reduce memory
    const lightweight = results.map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      image: p.image,
      basePrice: p.basePrice,
      slug: p.slug,
      rating: p.rating,
      isPopular: p.isPopular,
    }));

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
