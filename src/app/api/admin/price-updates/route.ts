import { NextResponse } from 'next/server';
import { PriceRepository } from '@/lib/db/priceRepository';
import { priceQueue } from '@/lib/queue/priceQueue';
import { storeRegistry } from '@/integrations/stores/registry';

export async function GET() {
  try {
    const jobs = await PriceRepository.getJobs();
    const anomalies = await PriceRepository.getPriceAnomalies();
    const queueStats = await priceQueue.getStats();
    const storeStatuses = await storeRegistry.getStoreHealthStatuses();

    return NextResponse.json({
      summary: {
        totalJobs: jobs.length,
        anomaliesCount: anomalies.length,
        activeStoresCount: storeStatuses.filter((s) => s.status === 'CONNECTED').length,
        totalStoresCount: storeStatuses.length,
        queue: queueStats,
      },
      anomalies,
      recentJobs: jobs.slice(0, 20),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching admin price update overview:', error);
    return NextResponse.json(
      { error: 'Yönetim verileri alınırken hata oluştu', details: String(error) },
      { status: 500 }
    );
  }
}
