import { NextRequest, NextResponse } from 'next/server';
import { storeRegistry } from '@/integrations/stores/registry';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adapter = storeRegistry.getAdapter(id);

    if (!adapter) {
      return NextResponse.json({ error: 'Mağaza bulunamadı' }, { status: 404 });
    }

    const health = await adapter.healthCheck();
    return NextResponse.json(health);
  } catch (error) {
    console.error('Error fetching store status:', error);
    return NextResponse.json(
      { error: 'Mağaza durumu kontrol edilirken hata oluştu', details: String(error) },
      { status: 500 }
    );
  }
}
