/**
 * src/lib/pricing/priceProvenance.ts
 *
 * ACELEETME.TECH — PRICE PROVENANCE V2 DOMAIN CONTRACT & GUARDS
 * Enforces strict provenance validation, credential isolation, and source-specific freshness.
 */

import { RETAILER_CHANNEL_REGISTRY, RetailerAccessChannel } from '@/lib/pricing/retailerAccessChannel';
import type { SupportedStoreId } from '@/lib/pricing/retailerQuantumScheduler';

// ============================================================================
// 1. CANONICAL PROVENANCE TAXONOMY
// ============================================================================

export type PriceSourceType =
  | 'OFFICIAL_API'
  | 'AFFILIATE_API'
  | 'PARTNER_API'
  | 'PARTNER_FEED'
  | 'APPROVED_FEED'
  | 'DIRECT_WEB'
  | 'OBSERVED'
  | 'MANUAL_VERIFIED';

export const CANONICAL_SOURCE_TYPES: readonly PriceSourceType[] = [
  'OFFICIAL_API',
  'AFFILIATE_API',
  'PARTNER_API',
  'PARTNER_FEED',
  'APPROVED_FEED',
  'DIRECT_WEB',
  'OBSERVED',
  'MANUAL_VERIFIED',
] as const;

export interface PriceProvenanceInput {
  channelId: string;
  sourceType: PriceSourceType;
  observedAt: Date | string;
  sourceIdentifier?: string | null;
  sourceUrl?: string | null;
  affiliateUrl?: string | null;
}

// ============================================================================
// 2. ERROR CODES & DOMAIN EXCEPTION
// ============================================================================

export type ProvenanceErrorCode =
  | 'PROVENANCE_REQUIRED'
  | 'CHANNEL_REQUIRED'
  | 'OBSERVED_AT_REQUIRED'
  | 'UNSAFE_SOURCE_URL'
  | 'UNSAFE_SOURCE_IDENTIFIER'
  | 'CHANNEL_NOT_PRODUCTION_READY'
  | 'CHANNEL_DISABLED'
  | 'CHANNEL_NOT_FOUND'
  | 'INVALID_SOURCE_TYPE';

export class ProvenanceValidationError extends Error {
  public readonly code: ProvenanceErrorCode;

  constructor(code: ProvenanceErrorCode, message: string) {
    super(`[${code}] ${message}`);
    this.name = 'ProvenanceValidationError';
    this.code = code;
    Object.setPrototypeOf(this, ProvenanceValidationError.prototype);
  }
}

// ============================================================================
// 3. CREDENTIAL & TOKEN SECURITY GUARDS
// ============================================================================

const FORBIDDEN_CREDENTIAL_PATTERNS = [
  /access_token/i,
  /token=/i,
  /secret=/i,
  /api_key=/i,
  /apikey=/i,
  /signature=/i,
  /x-amz-signature/i,
  /authorization=/i,
  /session=/i,
  /credential=/i,
];

const FORBIDDEN_IDENTIFIER_PATTERNS = [
  /token/i,
  /secret/i,
  /bearer/i,
  /session/i,
  /credential/i,
  /auth/i,
  /signature/i,
];

/**
 * Validates that URLs do not leak credentials or authentication tokens.
 * Throws UNSAFE_SOURCE_URL if any prohibited pattern is detected.
 */
export function validateProvenanceUrlSafety(url: string | null | undefined, fieldName = 'sourceUrl'): void {
  if (!url) return;

  for (const pattern of FORBIDDEN_CREDENTIAL_PATTERNS) {
    if (pattern.test(url)) {
      throw new ProvenanceValidationError(
        'UNSAFE_SOURCE_URL',
        `Forbidden credential pattern detected in ${fieldName}: url must not contain access tokens or authentication parameters.`
      );
    }
  }
}

/**
 * Validates that sourceIdentifier contains only public identifiers (SKU, ASIN, listing ID)
 * and never secret or session tokens.
 */
export function validateProvenanceIdentifierSafety(identifier: string | null | undefined): void {
  if (!identifier) return;

  if (identifier.length > 128) {
    throw new ProvenanceValidationError(
      'UNSAFE_SOURCE_IDENTIFIER',
      `sourceIdentifier length exceeds 128 characters (${identifier.length})`
    );
  }

  for (const pattern of FORBIDDEN_IDENTIFIER_PATTERNS) {
    if (pattern.test(identifier)) {
      throw new ProvenanceValidationError(
        'UNSAFE_SOURCE_IDENTIFIER',
        'Forbidden token or credential pattern detected in sourceIdentifier.'
      );
    }
  }
}

// ============================================================================
// 4. WRITE GATE VALIDATION
// ============================================================================

export interface ValidateWriteOptions {
  bypassChannelReadyCheck?: boolean; // For explicit grandfathered historical records
}

/**
 * Validates price provenance input prior to persistence.
 * Enforces FAIL_CLOSED policy on missing, unready, or malformed provenance.
 */
export function validatePriceProvenance(
  storeId: string,
  provenance: PriceProvenanceInput | null | undefined,
  options: ValidateWriteOptions = {}
): {
  normalizedChannelId: string;
  normalizedSourceType: PriceSourceType;
  normalizedObservedAt: string;
  normalizedSourceIdentifier: string | null;
  normalizedSourceUrl: string | null;
  normalizedAffiliateUrl: string | null;
} {
  if (
    !provenance ||
    (!provenance.channelId && !provenance.sourceType && !provenance.observedAt)
  ) {
    throw new ProvenanceValidationError(
      'PROVENANCE_REQUIRED',
      `Provenance metadata is required for price writes on store '${storeId}'. Missing provenance input.`
    );
  }

  const { channelId, sourceType, observedAt, sourceIdentifier, sourceUrl, affiliateUrl } = provenance;

  // 1. Source type required and must match canonical taxonomy
  if (!sourceType || !CANONICAL_SOURCE_TYPES.includes(sourceType)) {
    throw new ProvenanceValidationError(
      'INVALID_SOURCE_TYPE',
      `sourceType '${sourceType}' is invalid. Allowed: ${CANONICAL_SOURCE_TYPES.join(', ')}`
    );
  }

  // 2. Channel required
  if (!channelId || typeof channelId !== 'string' || !channelId.trim()) {
    throw new ProvenanceValidationError('CHANNEL_REQUIRED', 'channelId is required for trusted price persistence.');
  }

  // 3. Observed at required
  if (!observedAt) {
    throw new ProvenanceValidationError('OBSERVED_AT_REQUIRED', 'observedAt timestamp is required.');
  }

  const observedMs = observedAt instanceof Date ? observedAt.getTime() : Date.parse(observedAt);
  if (!Number.isFinite(observedMs) || observedMs <= 0) {
    throw new ProvenanceValidationError('OBSERVED_AT_REQUIRED', `observedAt timestamp '${observedAt}' is invalid.`);
  }

  // Reject future timestamps
  if (observedMs > Date.now() + 60000) { // 1m clock skew tolerance
    throw new ProvenanceValidationError('OBSERVED_AT_REQUIRED', `observedAt cannot be in the future: ${observedAt}`);
  }

  // 4. URL and Identifier safety guards
  validateProvenanceUrlSafety(sourceUrl, 'sourceUrl');
  validateProvenanceUrlSafety(affiliateUrl, 'affiliateUrl');
  validateProvenanceIdentifierSafety(sourceIdentifier);

  // 5. Channel readiness verification
  if (!options.bypassChannelReadyCheck) {
    const registryChannels = (RETAILER_CHANNEL_REGISTRY as Record<string, RetailerAccessChannel[]>)[storeId];
    if (!registryChannels || registryChannels.length === 0) {
      throw new ProvenanceValidationError(
        'CHANNEL_NOT_FOUND',
        `No registered channels found for store '${storeId}'.`
      );
    }

    // Match channel by channelId or short id or creators_api alias
    const targetChannel = registryChannels.find(
      (c) =>
        c.channelId === channelId ||
        c.channelId === `${storeId}:${channelId}` ||
        (storeId === 'amazon' && (channelId === 'creators_api' || channelId === 'amazon:creators_api') && c.channelType === 'AFFILIATE_API')
    );

    if (!targetChannel) {
      throw new ProvenanceValidationError(
        'CHANNEL_NOT_FOUND',
        `Channel '${channelId}' is not registered for store '${storeId}'.`
      );
    }

    if (!targetChannel.productionReady) {
      throw new ProvenanceValidationError(
        'CHANNEL_NOT_PRODUCTION_READY',
        `Channel '${targetChannel.channelId}' is not production ready. Unready channels cannot create price observations.`
      );
    }

    if (!targetChannel.enabled) {
      throw new ProvenanceValidationError(
        'CHANNEL_DISABLED',
        `Channel '${targetChannel.channelId}' is disabled in control plane.`
      );
    }
  }

  return {
    normalizedChannelId: channelId.trim(),
    normalizedSourceType: sourceType,
    normalizedObservedAt: new Date(observedMs).toISOString(),
    normalizedSourceIdentifier: sourceIdentifier?.trim() || null,
    normalizedSourceUrl: sourceUrl?.trim() || null,
    normalizedAffiliateUrl: affiliateUrl?.trim() || null,
  };
}

// ============================================================================
// 5. USER-FACING TRUST FORMATTER (Section 20)
// ============================================================================

export function getProvenanceTrustLabel(
  sourceType?: string | null,
  channelId?: string | null,
  storeId?: string | null
): string {
  if (!sourceType) return 'Doğrulanmamış kaynak';

  // SOURCE LABEL SAFETY: Do not display "Resmî affiliate API" for Amazon while commercial access is not established
  if ((storeId === 'amazon' || channelId?.startsWith('amazon')) && sourceType.toUpperCase() === 'AFFILIATE_API') {
    return 'Affiliate entegrasyonu (onay bekleniyor)';
  }

  switch (sourceType.toUpperCase()) {
    case 'AFFILIATE_API':
      return 'Resmî affiliate API';
    case 'PARTNER_FEED':
      return 'Onaylı partner veri akışı';
    case 'PARTNER_API':
      return 'Onaylı partner API';
    case 'OFFICIAL_API':
      return 'Resmî mağaza API';
    case 'APPROVED_FEED':
      return 'Onaylı veri akışı';
    case 'DIRECT_WEB':
    case 'OBSERVED':
      return channelId?.includes('direct_web') ? 'Doğrudan gözlem' : 'Doğrulanmış gözlem';
    case 'MANUAL_VERIFIED':
      return 'Manuel doğrulanmış';
    default:
      return 'Harici kaynak';
  }
}

// ============================================================================
// 6. SOURCE-SPECIFIC FRESHNESS RESOLVER (Section 19)
// ============================================================================

const ONE_HOUR_MS = 60 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

/**
 * Returns source-specific observation TTL.
 * Example: Amazon Creators API has 1h offer TTL; other channels have standard 24h.
 */
export function getSourceFreshnessTtlMs(
  storeId: string,
  channelId?: string | null,
  sourceType?: string | null
): number {
  if (storeId === 'amazon' && (channelId?.includes('creators') || sourceType === 'AFFILIATE_API')) {
    return ONE_HOUR_MS;
  }
  return TWENTY_FOUR_HOURS_MS;
}

// ============================================================================
// 7. AMAZON CREATORS COMPATIBILITY (Section 8)
// ============================================================================

export interface AmazonCreatorsProvenanceMapping {
  storeId: 'amazon';
  channelId: 'creators_api';
  sourceType: 'AFFILIATE_API';
  observedAt: string;
  sourceIdentifier: string;
  sourceUrl: string;
  affiliateUrl: string | null;
  sellerName: string | null;
  freshnessTtlMs: number;
}

/**
 * Maps Amazon Creators API normalized offer to Price Provenance V2 envelope.
 * Keeps Amazon disabled and not production ready (Section 8).
 */
export function mapAmazonCreatorsOfferToProvenance(offer: {
  storeProductId: string;
  sourceIdentifier?: string | null;
  observedAt: string | Date;
  affiliateUrl?: string | null;
  merchantName?: string | null;
  title?: string | null;
}): AmazonCreatorsProvenanceMapping {
  const asin = offer.sourceIdentifier || offer.storeProductId;
  const observedAtStr = typeof offer.observedAt === 'string'
    ? offer.observedAt
    : offer.observedAt.toISOString();

  // Validate URL and ID safety on mapping
  validateProvenanceIdentifierSafety(asin);
  validateProvenanceUrlSafety(offer.affiliateUrl, 'affiliateUrl');

  return {
    storeId: 'amazon',
    channelId: 'creators_api',
    sourceType: 'AFFILIATE_API',
    observedAt: observedAtStr,
    sourceIdentifier: asin,
    sourceUrl: `https://www.amazon.com.tr/dp/${asin}`,
    affiliateUrl: offer.affiliateUrl || null,
    sellerName: offer.merchantName || null,
    freshnessTtlMs: ONE_HOUR_MS,
  };
}

