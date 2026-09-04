import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    if (!q || q.trim().length === 0) {
      return NextResponse.json([]);
    }

    const results = await searchProducts(q.trim());
    return NextResponse.json(results);
  } catch (error) {
    console.error('API Search Error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
