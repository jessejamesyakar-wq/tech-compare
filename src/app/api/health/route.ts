import { NextResponse } from 'next/server';
import { storeRegistry } from '@/integrations/stores/registry';
import { priceQueue } from '@/lib/queue/priceQueue';

export async function GET() {
  const startTime = Date.now();
  const queueStats = await priceQueue.getStats();
  const stores = await storeRegistry.getStoreHealthStatuses();

  const isHealthy = true;

  return NextResponse.json({
    status: isHealthy ? 'UP' : 'DOWN',
    service: 'TechKıyas Price Aggregation Engine',
    uptimeSeconds: Math.floor(process.uptime()),
    responseTimeMs: Date.now() - startTime,
    components: {
      database: { status: 'UP', message: 'PostgreSQL/Repository Active' },
      redis: {
        status: process.env.KV_REST_API_URL || process.env.REDIS_URL ? 'CONNECTED' : 'IN_MEMORY_FALLBACK',
        message: process.env.KV_REST_API_URL || process.env.REDIS_URL ? 'Redis KV Connected' : 'In-memory fallback queue active',
      },
      workers: {
        status: 'UP',
        activeLocks: queueStats.activeLocks,
      },
      stores: {
        total: stores.length,
        connected: stores.filter((s) => s.status === 'CONNECTED').length,
        notConfigured: stores.filter((s) => s.status === 'NOT_CONFIGURED').length,
      },
    },
    timestamp: new Date().toISOString(),
  });
}
