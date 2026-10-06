import { NextResponse } from 'next/server';
import { priceQueue } from '@/lib/queue/priceQueue';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const queueStats = await priceQueue.getStats();

  return NextResponse.json(
    {
      status: 'healthy',
      application: 'aceleEtme Tech Compare',
      scope: 'public_health',
      uptimeSeconds: Math.floor(process.uptime()),
      responseTimeMs: Date.now() - startTime,
      components: {
        database: {
          connectivityClass: isSupabaseConfigured ? 'PERSISTENT_DATA_LAYER' : 'FALLBACK_DATA_LAYER',
        },
        queue: {
          status: 'OPERATIONAL',
          activeLocks: queueStats.activeLocks,
        },
      },
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: { 'Cache-Control': 'no-store' }
    }
  );
}
