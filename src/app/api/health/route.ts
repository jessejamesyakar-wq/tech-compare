import { NextResponse } from 'next/server';
import { storeRegistry } from '@/integrations/stores/registry';
import { priceQueue } from '@/lib/queue/priceQueue';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { isSupabaseServerConfigured } from '@/lib/supabase/server';

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
      database: {
        status: isSupabaseConfigured ? 'CONFIGURED' : 'FALLBACK_ONLY',
        provider: isSupabaseConfigured ? 'SUPABASE' : 'NONE',
        mode: isSupabaseConfigured ? 'PERSISTED' : 'IN_MEMORY_FALLBACK',
        serverWrites: isSupabaseServerConfigured ? 'AUTHORIZED_SECRET_KEY' : 'READ_ONLY_OR_FALLBACK',
        message: isSupabaseConfigured
          ? (isSupabaseServerConfigured
              ? 'Supabase istemcisi ve sunucu yazma anahtarı (secret key) tam yapılandırılmış.'
              : 'Supabase genel okuma yapılandırılmış; sunucu yazma anahtarı fallback modunda.')
          : 'Üretim veritabanı kimlik bilgileri tanımlı değil; in-memory fallback devrede.',
      },
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
      platforms: {
        supabase: {
          status: isSupabaseConfigured ? 'READY' : 'MOCK_FALLBACK',
          mode: isSupabaseConfigured ? 'PERSISTED' : 'IN_MEMORY_FALLBACK',
          serverClient: isSupabaseServerConfigured ? 'ACTIVE' : 'INACTIVE',
        },
        amazon: {
          status: process.env.AMAZON_ACCESS_KEY ? 'READY' : 'MOCK_FALLBACK',
          mode: process.env.AMAZON_ACCESS_KEY ? 'LIVE_API' : 'CATALOG_FALLBACK',
        },
        hepsiburada: {
          status: process.env.HEPSIBURADA_USERNAME ? 'READY' : 'MOCK_FALLBACK',
          mode: process.env.HEPSIBURADA_USERNAME ? 'LIVE_API' : 'CATALOG_FALLBACK',
        },
        trendyol: {
          status: process.env.TRENDYOL_API_KEY ? 'READY' : 'MOCK_FALLBACK',
          mode: process.env.TRENDYOL_API_KEY ? 'LIVE_API' : 'CATALOG_FALLBACK',
        },
      },
    },
    timestamp: new Date().toISOString(),
  });
}
