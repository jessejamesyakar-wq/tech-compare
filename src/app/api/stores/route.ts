import { NextResponse } from 'next/server';
import { storeRegistry } from '@/integrations/stores/registry';

export async function GET() {
  try {
    const healthStatuses = await storeRegistry.getStoreHealthStatuses();

    return NextResponse.json({
      count: healthStatuses.length,
      stores: healthStatuses,
      activeCount: healthStatuses.filter((s) => s.status === 'CONNECTED').length,
      notConfiguredCount: healthStatuses.filter((s) => s.status === 'NOT_CONFIGURED').length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching store statuses:', error);
    return NextResponse.json(
      { error: 'Mağaza durumları alınırken hata oluştu', details: String(error) },
      { status: 500 }
    );
  }
}
