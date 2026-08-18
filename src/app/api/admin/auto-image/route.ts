import { NextRequest, NextResponse } from 'next/server';
import { autoFetchAndSaveProductImage } from '@/lib/productImagePipeline';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, category, brand } = body;

    if (!id || !name || !category) {
      return NextResponse.json(
        { success: false, error: 'Eksik parametre: id, name ve category zorunludur.' },
        { status: 400 }
      );
    }

    const result = await autoFetchAndSaveProductImage({
      id: String(id),
      name: String(name),
      category: String(category),
      brand: String(brand || '')
    });

    return NextResponse.json({
      success: true,
      image: result.localPath,
      sourceUrl: result.sourceUrl,
      isFallback: result.isFallback
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Otomatik görsel alma hatası';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
