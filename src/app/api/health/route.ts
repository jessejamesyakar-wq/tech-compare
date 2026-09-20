import { NextResponse } from 'next/server';
import { storeRegistry } from '@/integrations/stores/registry';
import { priceQueue } from '@/lib/queue/priceQueue';

export async function GET() {
  const startTime = Date.now();
  const queueStats = await priceQueue.getStats();
  const stores = await storeRegistry.getStoreHealthStatuses();

  return NextResponse.json({
    status: 'UP',
    scope: 'application_process',
    service: 'aceleEtme Price Aggregation Engine',
    uptimeSeconds: Math.floor(process.uptime()),
    responseTimeMs: Date.now() - startTime,
    components: {
      database: { status: 'NOT_CHECKED', message: 'Bu yanıt veritabanı bağlantısını doğrulamaz.' },
      redis: {
        status: process.env.KV_REST_API_URL || process.env.REDIS_URL ? 'CONFIGURED_UNVERIFIED' : 'NOT_CONFIGURED',
        message: 'Redis bağlantısı bu kontrolde sınanmadı.',
      },
      workers: {
        status: 'NOT_CHECKED',
        activeLocks: queueStats.activeLocks,
      },
      stores: {
        total: stores.length,
        connected: stores.filter((s) => s.status === 'CONNECTED').length,
        configuredUnverified: stores.filter((s) => s.status === 'CONFIGURED_UNVERIFIED').length,
        notConfigured: stores.filter((s) => s.status === 'NOT_CONFIGURED').length,
      },
    },
    timestamp: new Date().toISOString(),
  });
}
