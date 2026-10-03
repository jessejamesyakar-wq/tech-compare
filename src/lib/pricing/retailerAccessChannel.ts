/**
 * src/lib/pricing/retailerAccessChannel.ts
 *
 * PHASE H-C: RETAILER ACCESS CHANNEL CONTROL PLANE
 * Multi-Channel Health & Quantum Route Safety Architecture
 *
 * CRITICAL ARCHITECTURAL SEPARATION:
 * - Store Health != Channel Health (A channel failure must not blindly corrupt store-level health)
 * - Strict Hard Gates: CHANNEL_NOT_PRODUCTION_READY, CHANNEL_CIRCUIT_OPEN, CHANNEL_RATE_LIMITED
 * - Generic 8-Store Channel Resolver & Capability Registry
 * - Multi-Channel Quantum Routing & Approved Channel Fallback
 * - Zero Network Requests / Zero Database Mutations / Zero Price Mutations
 */

import type { SupportedStoreId, RetailerHealthState } from '@/lib/pricing/retailerQuantumScheduler';
type CircuitBreakerState = RetailerHealthState['circuitBreakerState'];

// ============================================================================
// 1. TYPES & CONTRACTS
// ============================================================================

export type AccessChannelType =
  | 'DIRECT_WEB'
  | 'OFFICIAL_API'
  | 'AFFILIATE_API'
  | 'PARTNER_FEED'
  | 'APPROVED_FEED';

export type ChannelHealthStatus =
  | 'UNKNOWN'
  | 'HEALTHY'
  | 'DEGRADED'
  | 'UNHEALTHY'
  | 'CIRCUIT_OPEN';

export type ChannelCapability =
  | 'PRODUCT_IDENTITY'
  | 'PRICE'
  | 'STOCK'
  | 'SHIPPING'
  | 'SELLER'
  | 'HISTORY_SOURCE';

export type AccessTransportType =
  | 'PUBLIC_HTTP'
  | 'AUTHENTICATED_REST'
  | 'AUTHENTICATED_SOAP'
  | 'SIGNED_FEED_INGEST';

export interface ChannelComplianceMetadata {
  accessType: AccessTransportType;
  requiresCredential: boolean;
  approvedForAutomation: boolean;
  ratePolicyKnown: boolean;
  termsReviewStatus: 'REVIEWED' | 'PENDING' | 'UNKNOWN';
}

export interface RetailerAccessChannel {
  storeId: SupportedStoreId;
  channelId: string; // e.g. "vatan:direct_web", "vatan:partner_feed"
  channelType: AccessChannelType;
  enabled: boolean;
  productionReady: boolean;
  capabilities: ChannelCapability[];
  compliance: ChannelComplianceMetadata;
  rateCapRps: number;
}

export interface RetailerChannelHealth {
  storeId: string;
  channelId: string;
  healthStatus: ChannelHealthStatus;
  circuitBreakerState: CircuitBreakerState;
  circuitBreakerTrippedAt: string | null;
  circuitBreakerReason: string | null;
  rateLimitUntil: string | null;
  recent403Count: number;
  recent429Count: number;
  recent5xxCount: number;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  lastErrorCode: string | null;
}

export type ChannelHardGateReason =
  | 'CHANNEL_DISABLED'
  | 'CHANNEL_NOT_PRODUCTION_READY'
  | 'CHANNEL_CIRCUIT_OPEN'
  | 'CHANNEL_RATE_LIMITED'
  | 'CHANNEL_UNHEALTHY'
  | 'CHANNEL_STATE_MISSING'
  | 'CHANNEL_STATE_INVALID'
  | 'CHANNEL_NOT_APPROVED';

export interface ChannelGateEvaluationResult {
  passed: boolean;
  reason?: ChannelHardGateReason;
  channelId: string;
  storeId: string;
}

export interface ChannelTelemetryPayload {
  storeId: string;
  channelId: string;
  channelType: AccessChannelType;
  attemptCount: number;
  successCount: number;
  count403: number;
  count429: number;
  count5xx: number;
  latencyMs: number | null;
  lastSuccess: string | null;
  lastFailure: string | null;
  healthBefore: ChannelHealthStatus;
  healthAfter: ChannelHealthStatus;
  productionReady: boolean;
  solverSelectionCount: number;
}

// ============================================================================
// 2. GENERIC 8-STORE CHANNEL REGISTRY (EVIDENCED CODE CONTRACTS)
// ============================================================================

export const RETAILER_CHANNEL_REGISTRY: Record<SupportedStoreId, RetailerAccessChannel[]> = {
  vatan: [
    {
      storeId: 'vatan',
      channelId: 'vatan:direct_web',
      channelType: 'DIRECT_WEB',
      enabled: true,
      productionReady: false, // Vercel origin returned 403; not production ready
      capabilities: ['PRODUCT_IDENTITY', 'PRICE', 'STOCK'],
      compliance: {
        accessType: 'PUBLIC_HTTP',
        requiresCredential: false,
        approvedForAutomation: false,
        ratePolicyKnown: false,
        termsReviewStatus: 'UNKNOWN',
      },
      rateCapRps: 2,
    },
    {
      storeId: 'vatan',
      channelId: 'vatan:partner_feed',
      channelType: 'PARTNER_FEED',
      enabled: false, // Contract exists (VATAN_FEED_URL), but unconfigured
      productionReady: false,
      capabilities: ['PRICE', 'STOCK'],
      compliance: {
        accessType: 'SIGNED_FEED_INGEST',
        requiresCredential: true,
        approvedForAutomation: false,
        ratePolicyKnown: false,
        termsReviewStatus: 'PENDING',
      },
      rateCapRps: 1,
    },
    {
      storeId: 'vatan',
      channelId: 'vatan:official_api',
      channelType: 'OFFICIAL_API',
      enabled: false,
      productionReady: false,
      capabilities: ['PRODUCT_IDENTITY', 'PRICE', 'STOCK'],
      compliance: {
        accessType: 'AUTHENTICATED_REST',
        requiresCredential: true,
        approvedForAutomation: false,
        ratePolicyKnown: false,
        termsReviewStatus: 'UNKNOWN',
      },
      rateCapRps: 4,
    },
  ],
  teknosa: [
    {
      storeId: 'teknosa',
      channelId: 'teknosa:direct_web',
      channelType: 'DIRECT_WEB',
      enabled: true,
      productionReady: false,
      capabilities: ['PRODUCT_IDENTITY', 'PRICE', 'STOCK'],
      compliance: {
        accessType: 'PUBLIC_HTTP',
        requiresCredential: false,
        approvedForAutomation: false,
        ratePolicyKnown: false,
        termsReviewStatus: 'UNKNOWN',
      },
      rateCapRps: 2,
    },
    {
      storeId: 'teknosa',
      channelId: 'teknosa:partner_feed',
      channelType: 'PARTNER_FEED',
      enabled: false,
      productionReady: false,
      capabilities: ['PRICE', 'STOCK'],
      compliance: {
        accessType: 'SIGNED_FEED_INGEST',
        requiresCredential: true,
        approvedForAutomation: false,
        ratePolicyKnown: false,
        termsReviewStatus: 'PENDING',
      },
      rateCapRps: 1,
    },
  ],
  amazon: [
    {
      storeId: 'amazon',
      channelId: 'amazon:direct_web',
      channelType: 'DIRECT_WEB',
      enabled: true,
      productionReady: false,
      capabilities: ['PRODUCT_IDENTITY', 'PRICE', 'STOCK'],
      compliance: {
        accessType: 'PUBLIC_HTTP',
        requiresCredential: false,
        approvedForAutomation: false,
        ratePolicyKnown: false,
        termsReviewStatus: 'UNKNOWN',
      },
      rateCapRps: 1,
    },
    {
      storeId: 'amazon',
      channelId: 'amazon:affiliate_api',
      channelType: 'AFFILIATE_API',
      enabled: false, // PA-API contract exists (AMAZON_PARTNER_TAG), unconfigured
      productionReady: false,
      capabilities: ['PRODUCT_IDENTITY', 'PRICE', 'STOCK', 'SHIPPING', 'SELLER'],
      compliance: {
        accessType: 'AUTHENTICATED_REST',
        requiresCredential: true,
        approvedForAutomation: false,
        ratePolicyKnown: false,
        termsReviewStatus: 'UNKNOWN',
      },
      rateCapRps: 2,
    },
  ],
  trendyol: [
    {
      storeId: 'trendyol',
      channelId: 'trendyol:direct_web',
      channelType: 'DIRECT_WEB',
      enabled: true,
      productionReady: false,
      capabilities: ['PRODUCT_IDENTITY', 'PRICE', 'STOCK'],
      compliance: {
        accessType: 'PUBLIC_HTTP',
        requiresCredential: false,
        approvedForAutomation: false,
        ratePolicyKnown: false,
        termsReviewStatus: 'UNKNOWN',
      },
      rateCapRps: 2,
    },
    {
      storeId: 'trendyol',
      channelId: 'trendyol:official_api',
      channelType: 'OFFICIAL_API',
      enabled: false,
      productionReady: false,
      capabilities: ['PRODUCT_IDENTITY', 'PRICE', 'STOCK', 'SELLER'],
      compliance: {
        accessType: 'AUTHENTICATED_REST',
        requiresCredential: true,
        approvedForAutomation: false,
        ratePolicyKnown: false,
        termsReviewStatus: 'PENDING',
      },
      rateCapRps: 4,
    },
  ],
  hepsiburada: [
    {
      storeId: 'hepsiburada',
      channelId: 'hepsiburada:direct_web',
      channelType: 'DIRECT_WEB',
      enabled: true,
      productionReady: false,
      capabilities: ['PRODUCT_IDENTITY', 'PRICE', 'STOCK'],
      compliance: {
        accessType: 'PUBLIC_HTTP',
        requiresCredential: false,
        approvedForAutomation: false,
        ratePolicyKnown: false,
        termsReviewStatus: 'UNKNOWN',
      },
      rateCapRps: 2,
    },
    {
      storeId: 'hepsiburada',
      channelId: 'hepsiburada:official_api',
      channelType: 'OFFICIAL_API',
      enabled: false,
      productionReady: false,
      capabilities: ['PRODUCT_IDENTITY', 'PRICE', 'STOCK', 'SELLER'],
      compliance: {
        accessType: 'AUTHENTICATED_REST',
        requiresCredential: true,
        approvedForAutomation: false,
        ratePolicyKnown: false,
        termsReviewStatus: 'PENDING',
      },
      rateCapRps: 4,
    },
  ],
  n11: [
    {
      storeId: 'n11',
      channelId: 'n11:direct_web',
      channelType: 'DIRECT_WEB',
      enabled: true,
      productionReady: false,
      capabilities: ['PRODUCT_IDENTITY', 'PRICE', 'STOCK'],
      compliance: {
        accessType: 'PUBLIC_HTTP',
        requiresCredential: false,
        approvedForAutomation: false,
        ratePolicyKnown: false,
        termsReviewStatus: 'UNKNOWN',
      },
      rateCapRps: 2,
    },
    {
      storeId: 'n11',
      channelId: 'n11:official_api',
      channelType: 'OFFICIAL_API',
      enabled: false,
      productionReady: false,
      capabilities: ['PRODUCT_IDENTITY', 'PRICE', 'STOCK', 'SELLER'],
      compliance: {
        accessType: 'AUTHENTICATED_SOAP',
        requiresCredential: true,
        approvedForAutomation: false,
        ratePolicyKnown: false,
        termsReviewStatus: 'PENDING',
      },
      rateCapRps: 3,
    },
  ],
  pttavm: [
    {
      storeId: 'pttavm',
      channelId: 'pttavm:direct_web',
      channelType: 'DIRECT_WEB',
      enabled: true,
      productionReady: false,
      capabilities: ['PRODUCT_IDENTITY', 'PRICE', 'STOCK'],
      compliance: {
        accessType: 'PUBLIC_HTTP',
        requiresCredential: false,
        approvedForAutomation: false,
        ratePolicyKnown: false,
        termsReviewStatus: 'UNKNOWN',
      },
      rateCapRps: 2,
    },
    {
      storeId: 'pttavm',
      channelId: 'pttavm:official_api',
      channelType: 'OFFICIAL_API',
      enabled: false,
      productionReady: false,
      capabilities: ['PRODUCT_IDENTITY', 'PRICE', 'STOCK'],
      compliance: {
        accessType: 'AUTHENTICATED_REST',
        requiresCredential: true,
        approvedForAutomation: false,
        ratePolicyKnown: false,
        termsReviewStatus: 'PENDING',
      },
      rateCapRps: 3,
    },
  ],
  mediamarkt: [
    {
      storeId: 'mediamarkt',
      channelId: 'mediamarkt:direct_web',
      channelType: 'DIRECT_WEB',
      enabled: true,
      productionReady: false,
      capabilities: ['PRODUCT_IDENTITY', 'PRICE', 'STOCK'],
      compliance: {
        accessType: 'PUBLIC_HTTP',
        requiresCredential: false,
        approvedForAutomation: false,
        ratePolicyKnown: false,
        termsReviewStatus: 'UNKNOWN',
      },
      rateCapRps: 2,
    },
    {
      storeId: 'mediamarkt',
      channelId: 'mediamarkt:affiliate_feed',
      channelType: 'AFFILIATE_API',
      enabled: false,
      productionReady: false,
      capabilities: ['PRICE', 'STOCK'],
      compliance: {
        accessType: 'SIGNED_FEED_INGEST',
        requiresCredential: true,
        approvedForAutomation: false,
        ratePolicyKnown: false,
        termsReviewStatus: 'PENDING',
      },
      rateCapRps: 1,
    },
  ],
};

// ============================================================================
// 3. CHANNEL HARD SAFETY GATES & RESOLVER
// ============================================================================

export class RetailerAccessChannelControlPlane {
  /**
   * Evaluates hard safety gates for an access channel prior to scheduling.
   * If any gate fails, the channel is strictly ineligible for Quantum scheduling.
   */
  public static evaluateChannelGate(
    channel: RetailerAccessChannel,
    health?: RetailerChannelHealth,
    now: number = Date.now()
  ): ChannelGateEvaluationResult {
    // 1. Channel enabled check
    if (!channel.enabled) {
      return {
        passed: false,
        reason: 'CHANNEL_DISABLED',
        channelId: channel.channelId,
        storeId: channel.storeId,
      };
    }

    // 2. Production readiness check
    if (!channel.productionReady || channel.channelType === 'DIRECT_WEB') {
      return {
        passed: false,
        reason: 'CHANNEL_NOT_PRODUCTION_READY',
        channelId: channel.channelId,
        storeId: channel.storeId,
      };
    }

    const reject = (reason: ChannelHardGateReason): ChannelGateEvaluationResult => ({ passed: false, reason, storeId: channel.storeId, channelId: channel.channelId });
    if (!health) return reject('CHANNEL_STATE_MISSING');
    if (!Number.isFinite(now) || health.storeId !== channel.storeId || health.channelId !== channel.channelId ||
        !['CLOSED', 'HALF_OPEN', 'OPEN'].includes(health.circuitBreakerState) ||
        !['UNKNOWN', 'HEALTHY', 'DEGRADED', 'UNHEALTHY', 'CIRCUIT_OPEN'].includes(health.healthStatus) ||
        (health.rateLimitUntil !== null && !Number.isFinite(Date.parse(health.rateLimitUntil)))) {
      return reject('CHANNEL_STATE_INVALID');
    }
    if (health.circuitBreakerState === 'HALF_OPEN' || health.healthStatus === 'CIRCUIT_OPEN') return reject('CHANNEL_CIRCUIT_OPEN');
    if (health.healthStatus === 'UNKNOWN') return reject('CHANNEL_STATE_MISSING');
    if (!channel.compliance.approvedForAutomation || !channel.compliance.ratePolicyKnown ||
        channel.compliance.termsReviewStatus !== 'REVIEWED') return reject('CHANNEL_NOT_APPROVED');
    if (health) {
      // 3. Circuit breaker state check
      if (health.circuitBreakerState === 'OPEN') {
        return {
          passed: false,
          reason: 'CHANNEL_CIRCUIT_OPEN',
          channelId: channel.channelId,
          storeId: channel.storeId,
        };
      }

      // 4. Rate limit check
      if (health.rateLimitUntil && new Date(health.rateLimitUntil).getTime() > now) {
        return {
          passed: false,
          reason: 'CHANNEL_RATE_LIMITED',
          channelId: channel.channelId,
          storeId: channel.storeId,
        };
      }

      // 5. Unhealthy status check
      if (health.healthStatus === 'UNHEALTHY') {
        return {
          passed: false,
          reason: 'CHANNEL_UNHEALTHY',
          channelId: channel.channelId,
          storeId: channel.storeId,
        };
      }
    }

    return {
      passed: true,
      channelId: channel.channelId,
      storeId: channel.storeId,
    };
  }

  /**
   * Resolves all registered access channels for a store.
   */
  public static resolveAvailableChannels(storeId: string): RetailerAccessChannel[] {
    const list = RETAILER_CHANNEL_REGISTRY[storeId as SupportedStoreId];
    return list ? [...list] : [];
  }

  /**
   * Selects the safest active channel for a retailer mapping.
   * Prioritizes approved partner/affiliate feeds, falling back to direct web only if production ready.
   */
  public static chooseSafeChannel(
    storeId: string,
    channelHealthMap: Map<string, RetailerChannelHealth>,
    now: number = Date.now()
  ): {
    selectedChannel: RetailerAccessChannel | null;
    rejectedChannels: { channel: RetailerAccessChannel; reason: ChannelHardGateReason }[];
  } {
    const channels = this.resolveAvailableChannels(storeId);
    const rejectedChannels: { channel: RetailerAccessChannel; reason: ChannelHardGateReason }[] = [];

    // Channel priority preference: PARTNER_FEED > OFFICIAL_API > AFFILIATE_API > DIRECT_WEB
    const channelPriority: Record<AccessChannelType, number> = {
      APPROVED_FEED: 1,
      PARTNER_FEED: 2,
      OFFICIAL_API: 3,
      AFFILIATE_API: 4,
      DIRECT_WEB: 5,
    };

    const sorted = [...channels].sort(
      (a, b) => channelPriority[a.channelType] - channelPriority[b.channelType]
    );

    let selectedChannel: RetailerAccessChannel | null = null;

    for (const channel of sorted) {
      const health = channelHealthMap.get(channel.channelId);
      const gate = this.evaluateChannelGate(channel, health, now);

      if (gate.passed) {
        if (!selectedChannel) {
          selectedChannel = channel;
        }
      } else {
        rejectedChannels.push({
          channel,
          reason: gate.reason!,
        });
      }
    }

    return {
      selectedChannel,
      rejectedChannels,
    };
  }

  /**
   * Derives aggregate store health from individual channel healths.
   * Prevents a single channel failure from marking an entire merchant as UNHEALTHY.
   */
  public static deriveStoreHealthFromChannels(
    channels: RetailerAccessChannel[],
    healths: RetailerChannelHealth[]
  ): ChannelHealthStatus {
    const healthMap = new Map(healths.map(h => [h.channelId, h]));
    const enabledChannels = channels.filter(c => c.enabled);

    if (enabledChannels.length === 0) {
      return 'UNKNOWN';
    }

    let hasHealthy = false;
    let hasDegraded = false;
    let allOpen = true;

    for (const ch of enabledChannels) {
      const h = healthMap.get(ch.channelId);
      if (!h || h.healthStatus === 'UNKNOWN') { allOpen = false; continue; }

      if (h.healthStatus === 'HEALTHY') hasHealthy = true;
      if (h.healthStatus === 'DEGRADED') hasDegraded = true;
      if (h.circuitBreakerState !== 'OPEN') allOpen = false;
    }

    if (allOpen && enabledChannels.length > 0) {
      return 'CIRCUIT_OPEN';
    }
    if (hasHealthy && !hasDegraded) {
      return 'HEALTHY';
    }
    if (hasDegraded) {
      return 'DEGRADED';
    }

    return 'UNKNOWN';
  }
}
