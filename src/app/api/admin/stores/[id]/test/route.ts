import { requireMaintenanceAccess } from '@/lib/security/maintenanceAuth';
import { NextRequest, NextResponse } from 'next/server';
import { storeRegistry } from '@/integrations/stores/registry';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireMaintenanceAccess(request);
  if (denied) return denied;
  try {
    const { id } = await params;
    const adapter = storeRegistry.getAdapter(id);

    if (!adapter) {
      return NextResponse.json({ error: 'Mağaza bulunamadı' }, { status: 404 });
    }

    const health = await adapter.healthCheck();

    return NextResponse.json({
      storeId: id,
      name: adapter.name,
      testResult: health,
      testedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error testing store adapter:', error);
    return NextResponse.json(
      { error: 'Mağaza testi başarısız oldu', details: String(error) },
      { status: 500 }
    );
  }
}
