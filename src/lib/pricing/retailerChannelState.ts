import type { SupabaseClient } from '@supabase/supabase-js';
import { RETAILER_CHANNEL_REGISTRY, type RetailerAccessChannel, type RetailerChannelHealth } from './retailerAccessChannel';
import type { SupportedStoreId } from './retailerQuantumScheduler';

/** Server caller supplies its existing client. No credentials, writes or snapshot fallback. */
export async function loadRetailerChannelState(client: SupabaseClient, storeId: SupportedStoreId) {
  const [registry, health] = await Promise.all([
    client.from('retailer_access_channels').select('*').eq('store_id', storeId),
    client.from('retailer_channel_health').select('*').eq('store_id', storeId),
  ]);
  if (registry.error || health.error || !registry.data || !health.data) {
    throw new Error('CHANNEL_STATE_UNAVAILABLE');
  }
  const channels: RetailerAccessChannel[] = [];
  const healthRows: RetailerChannelHealth[] = [];
  for (const row of registry.data) {
    const channelId = `${storeId}:${row.channel_id}`;
    const contract = RETAILER_CHANNEL_REGISTRY[storeId].find(c => c.channelId === channelId);
    if (!contract || row.store_id !== storeId || contract.channelType !== row.channel_type) continue;
    // DB can disable a verified adapter; it cannot turn a stub into an approved implementation.
    channels.push({ ...contract, enabled: contract.enabled && row.enabled === true,
      productionReady: contract.productionReady && row.production_ready === true });
    const h = health.data.find(h => h.store_id === storeId && h.channel_id === row.channel_id);
    if (h) healthRows.push({ storeId, channelId, healthStatus: h.health_status,
      circuitBreakerState: h.circuit_breaker_state, circuitBreakerTrippedAt: null,
      circuitBreakerReason: null, rateLimitUntil: h.rate_limit_until,
      recent403Count: h.recent_403_count, recent429Count: h.recent_429_count,
      recent5xxCount: h.recent_5xx_count, lastSuccessAt: h.last_success_at,
      lastFailureAt: h.last_failure_at, lastErrorCode: h.last_error_code });
  }
  return { channels, health: healthRows };
}
