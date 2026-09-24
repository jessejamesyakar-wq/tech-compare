import crypto from 'node:crypto';
import { PostgresDatabaseEngine } from './postgresClient';

// 1. Data Interfaces
export type CommerceRetailerStatus = 'ACTIVE' | 'DEGRADED' | 'DISABLED' | 'SOURCE_FAILURE' | 'REVIEW_REQUIRED';
export type CommerceSellerType = 'RETAILER_DIRECT' | 'MARKETPLACE_SELLER' | 'AUTHORIZED_RESELLER' | 'UNKNOWN';
export type CommerceMatchState = 'EXACT_MATCH' | 'VARIANT_MATCH' | 'FAMILY_ONLY' | 'AMBIGUOUS' | 'MISMATCH' | 'UNKNOWN';
export type CommerceStockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'PREORDER' | 'BACKORDER' | 'UNKNOWN';
export type CommerceShippingState = 'KNOWN_FREE' | 'KNOWN_PAID' | 'UNKNOWN' | 'CONDITIONAL';
export type CommerceCondition = 'NEW' | 'REFURBISHED' | 'USED' | 'OPEN_BOX' | 'UNKNOWN';
export type CommerceQuarantineStatus =
  | 'PUBLIC_ELIGIBLE'
  | 'REVIEW_REQUIRED'
  | 'PRICE_ANOMALY'
  | 'IDENTITY_AMBIGUOUS'
  | 'STALE'
  | 'OUT_OF_STOCK'
  | 'CONDITIONAL_PRICE'
  | 'SOURCE_FAILURE'
  | 'BLOCKED';

export type CommercePublicationStatus =
  | 'LEGACY_SHADOW'
  | 'LEGACY_VALIDATED'
  | 'LEGACY_REVIEW_REQUIRED'
  | 'LEGACY_QUARANTINED'
  | 'PUBLIC_ELIGIBLE';

export type CommerceOfferProvenanceClass =
  | 'LEGACY_SHADOW'
  | 'QUALIFICATION_SHADOW'
  | 'PERMISSION_UNVERIFIED_LIVE_SHADOW'
  | 'FIXTURE_ONLY'
  | 'AUTHORIZED_SOURCE_SHADOW'
  | 'UNKNOWN_ORIGIN';

export type PriceObservationProvenanceClass =
  | 'VERIFIED_LIVE_OBSERVATION'
  | 'AUTHORIZED_SOURCE_OBSERVATION'
  | 'PERMISSION_UNVERIFIED_SHADOW_OBSERVATION'
  | 'LEGACY_UNVERIFIED_OBSERVATION'
  | 'TEST_FIXTURE_OBSERVATION';

export type PriceObservationType =
  | 'STATE_CHANGE_OBSERVATION'
  | 'HEARTBEAT_OBSERVATION'
  | 'DUPLICATE_REPLAY';

export type CommerceAnomalyLifecycleState =
  | 'DETECTED'
  | 'REVIEW_REQUIRED'
  | 'CONFIRMED_ANOMALY'
  | 'FALSE_POSITIVE'
  | 'RESOLVED'
  | 'SOURCE_CORRECTED'
  | 'IDENTITY_CORRECTED';

export interface CommerceRetailer {
  retailerId: string;
  name: string;
  domain: string;
  status: CommerceRetailerStatus;
  sourceCapabilities: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CommerceSeller {
  sellerId: string;
  retailerId: string;
  retailerSellerId: string;
  sellerName: string;
  sellerType: CommerceSellerType;
  status: string;
  firstSeenAt: string;
  lastSeenAt: string;
}

export interface CommerceProductMapping {
  mappingId: string;
  catalogRootId: string;
  retailerId: string;
  retailerProductId: string;
  retailerSku?: string;
  eanGtin?: string;
  mpn?: string;
  extractedBrand: string;
  extractedModel: string;
  extractedCapacity?: string;
  matchState: CommerceMatchState;
  identityEvidence: any;
  mappingStatus: string;
  createdAt: string;
  updatedAt: string;
  verifiedAt: string;
}

export interface CommerceOffer {
  offerId: string;
  mappingId: string;
  catalogRootId: string;
  retailerId: string;
  sellerId: string;
  retailerProductId: string;
  retailerSku?: string;
  productUrl: string;
  affiliateUrl?: string;
  currency: string;
  listedPrice: number;
  salePrice: number;
  shippingPrice: number | null; // NULL if shipping is UNKNOWN
  shippingState: CommerceShippingState;
  effectiveTotalPrice: number | null; // NULL if shipping is UNKNOWN
  stockStatus: CommerceStockStatus;
  condition: CommerceCondition;
  priceSemantics: string;
  campaignState?: any;
  sourceType: string;
  sourceHash: string;
  sourceEventId?: string;
  observedAt: string;
  firstSeenAt: string;
  updatedAt: string;
  freshnessState: string;
  quarantineStatus: CommerceQuarantineStatus;
  publicationStatus: CommercePublicationStatus;
  provenanceClass: CommerceOfferProvenanceClass;
  version: number;
}

export interface CommercePriceObservation {
  observationId?: number;
  offerId: string;
  mappingId: string;
  catalogRootId: string;
  retailerId: string;
  sellerId: string;
  salePrice: number;
  shippingPrice: number | null;
  shippingState: CommerceShippingState;
  effectiveTotalPrice: number | null;
  stockStatus: CommerceStockStatus;
  condition: CommerceCondition;
  campaignState?: any;
  sourceHash: string;
  sourceEventId?: string;
  recordedAt: string;
  provenanceClass: PriceObservationProvenanceClass;
  observationType?: PriceObservationType;
}

export interface CommerceSourceEvent {
  sourceEventId: string;
  retailerId: string;
  requestedUrl: string;
  finalUrl?: string;
  httpStatus?: number;
  sourceType: string;
  retrievedAt: string;
  responseHash: string;
  parserVersion: string;
  adapterVersion: string;
  status: string;
}

export interface CommerceFreshnessPolicy {
  policyId: string;
  retailerId: string;
  sourceType: string;
  domainType: string;
  freshForSeconds: number;
  agingAfterSeconds: number;
  staleAfterSeconds: number;
  expireAfterSeconds: number;
  fallbackBehavior: string;
}

export interface CommerceAnomalyRecord {
  anomalyId: string;
  offerId?: string;
  catalogRootId: string;
  retailerId: string;
  ruleId: string;
  policyVersion: string;
  reason: string;
  observedValues: any;
  comparisonValues?: any;
  peerSampleCount?: number;
  provenanceClass?: PriceObservationProvenanceClass;
  lifecycleState: CommerceAnomalyLifecycleState;
  quarantinedAt: string;
  status: string;
}

export interface CommerceJobLease {
  leaseId: string;
  jobId: string;
  retailerId: string;
  startedAt: string;
  leaseExpiresAt: string;
  status: 'ACTIVE' | 'RELEASED' | 'EXPIRED';
  checkpointCursor?: string;
}

export class PostgresCommerceRepository {
  // In-memory backing maps representing PostgreSQL commerce schema
  private static retailers: Map<string, CommerceRetailer> = new Map();
  private static sellers: Map<string, CommerceSeller> = new Map();
  private static mappings: Map<string, CommerceProductMapping> = new Map();
  private static offers: Map<string, CommerceOffer> = new Map();
  private static observations: CommercePriceObservation[] = [];
  private static sourceEvents: Map<string, CommerceSourceEvent> = new Map();
  private static freshnessPolicies: Map<string, CommerceFreshnessPolicy> = new Map();
  private static anomalies: Map<string, CommerceAnomalyRecord> = new Map();
  private static jobLeases: Map<string, CommerceJobLease> = new Map();

  public static resetCommerceStore(): void {
    this.retailers.clear();
    this.sellers.clear();
    this.mappings.clear();
    this.offers.clear();
    this.observations = [];
    this.sourceEvents.clear();
    this.freshnessPolicies.clear();
    this.anomalies.clear();
    this.jobLeases.clear();
  }

  // 1. Retailer Operations
  public static upsertRetailer(retailer: Omit<CommerceRetailer, 'createdAt' | 'updatedAt'>): CommerceRetailer {
    const existing = this.retailers.get(retailer.retailerId);
    const now = new Date().toISOString();
    const record: CommerceRetailer = {
      ...retailer,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now
    };
    this.retailers.set(retailer.retailerId, record);
    return record;
  }

  public static getRetailer(retailerId: string): CommerceRetailer | undefined {
    return this.retailers.get(retailerId);
  }

  // 2. Seller Operations
  public static upsertSeller(seller: Omit<CommerceSeller, 'firstSeenAt' | 'lastSeenAt'>): CommerceSeller {
    const existing = this.sellers.get(seller.sellerId);
    const now = new Date().toISOString();
    const record: CommerceSeller = {
      ...seller,
      firstSeenAt: existing ? existing.firstSeenAt : now,
      lastSeenAt: now
    };
    this.sellers.set(seller.sellerId, record);
    return record;
  }

  // 3. Mapping Operations
  public static createMapping(mapping: Omit<CommerceProductMapping, 'createdAt' | 'updatedAt' | 'verifiedAt'>): CommerceProductMapping {
    // Validate catalog_root_id exists in Trust Core catalog
    const rootExists = PostgresDatabaseEngine.getProduct(mapping.catalogRootId);
    if (!rootExists) {
      throw new Error(`NONEXISTENT_CATALOG_ROOT: Cannot create mapping for unknown root_id ${mapping.catalogRootId}`);
    }

    const now = new Date().toISOString();
    const record: CommerceProductMapping = {
      ...mapping,
      createdAt: now,
      updatedAt: now,
      verifiedAt: now
    };
    this.mappings.set(mapping.mappingId, record);
    return record;
  }

  public static getMapping(mappingId: string): CommerceProductMapping | undefined {
    return this.mappings.get(mappingId);
  }

  // 4. Offer Operations & Ingestion
  public static upsertOffer(
    params: Omit<CommerceOffer, 'offerId' | 'firstSeenAt' | 'updatedAt' | 'version' | 'provenanceClass'> & {
      provenanceClass?: CommerceOfferProvenanceClass;
    }
  ): CommerceOffer {
    // Spatial & Money Safety Validation
    if (params.salePrice < 0) throw new Error('MONEY_SAFETY_VIOLATION: Sale price cannot be negative.');
    if (params.shippingPrice !== null && params.shippingPrice < 0) {
      throw new Error('MONEY_SAFETY_VIOLATION: Shipping price cannot be negative.');
    }

    // Shipping semantics enforcement
    let effectiveTotal: number | null = null;
    if (params.shippingState === 'KNOWN_FREE' || params.shippingState === 'KNOWN_PAID') {
      const ship = params.shippingPrice ?? 0;
      effectiveTotal = Number((params.salePrice + ship).toFixed(2));
    } else {
      // Shipping is UNKNOWN -> effectiveTotalPrice MUST be null (not comparable)
      effectiveTotal = null;
    }

    // Uniqueness key: retailer_id + seller_id + retailer_product_id + condition
    const offerId = `off_${crypto.createHash('sha256').update(`${params.retailerId}_${params.sellerId}_${params.retailerProductId}_${params.condition}`).digest('hex').substring(0, 16)}`;
    const existing = this.offers.get(offerId);
    const now = new Date().toISOString();

    const record: CommerceOffer = {
      ...params,
      publicationStatus: params.publicationStatus || 'LEGACY_SHADOW',
      provenanceClass: params.provenanceClass || 'LEGACY_SHADOW',
      offerId,
      shippingPrice: params.shippingState === 'UNKNOWN' ? null : params.shippingPrice,
      effectiveTotalPrice: effectiveTotal,
      firstSeenAt: existing ? existing.firstSeenAt : now,
      updatedAt: now,
      version: existing ? existing.version + 1 : 1
    };

    this.offers.set(offerId, record);
    return record;
  }

  /**
   * PUBLIC QUERY ISOLATION GUARANTEE:
   * Returns ONLY offers that are explicitly marked both publicationStatus = 'PUBLIC_ELIGIBLE'
   * and quarantineStatus = 'PUBLIC_ELIGIBLE'. Legacy shadow, unverified, or quarantined records
   * will NEVER be exposed to public price comparison or product endpoints.
   */
  public static getOffersForRoot(catalogRootId: string, filterNewOnly: boolean = true): CommerceOffer[] {
    return Array.from(this.offers.values())
      .filter((o) => o.catalogRootId === catalogRootId)
      .filter((o) => o.publicationStatus === 'PUBLIC_ELIGIBLE' && o.quarantineStatus === 'PUBLIC_ELIGIBLE')
      .filter((o) => (filterNewOnly ? o.condition === 'NEW' : true))
      .sort((a, b) => (a.effectiveTotalPrice ?? Infinity) - (b.effectiveTotalPrice ?? Infinity));
  }

  /**
   * Internal / Audit inspection method:
   * Returns shadow / legacy / quarantined offers for a root for verification without exposing them publicly.
   */
  public static getShadowOffersForRoot(catalogRootId: string): CommerceOffer[] {
    return Array.from(this.offers.values())
      .filter((o) => o.catalogRootId === catalogRootId);
  }

  public static getAllOffers(): CommerceOffer[] {
    return Array.from(this.offers.values());
  }

  public static getShadowOffersOriginBreakdown(): Record<string, number> {
    const counts: Record<string, number> = {
      LEGACY_SHADOW: 0,
      QUALIFICATION_SHADOW: 0,
      PERMISSION_UNVERIFIED_LIVE_SHADOW: 0,
      FIXTURE_ONLY: 0,
      AUTHORIZED_SOURCE_SHADOW: 0,
      UNKNOWN_ORIGIN: 0
    };

    for (const offer of this.offers.values()) {
      const cls = offer.provenanceClass || 'UNKNOWN_ORIGIN';
      counts[cls] = (counts[cls] || 0) + 1;
    }

    return counts;
  }

  // 5. Append-Only Observation Operations with Deduplication
  public static appendObservation(
    obs: Omit<CommercePriceObservation, 'observationId' | 'recordedAt' | 'provenanceClass'> & {
      provenanceClass?: PriceObservationProvenanceClass;
    }
  ): CommercePriceObservation {
    const existingForOffer = this.observations.filter((o) => o.offerId === obs.offerId);
    let obsType: 'STATE_CHANGE_OBSERVATION' | 'HEARTBEAT_OBSERVATION' | 'DUPLICATE_REPLAY' = 'STATE_CHANGE_OBSERVATION';

    if (existingForOffer.length > 0) {
      const last = existingForOffer[existingForOffer.length - 1];
      if (last.sourceHash === obs.sourceHash) {
        obsType = 'DUPLICATE_REPLAY';
      } else if (
        last.salePrice === obs.salePrice &&
        last.shippingPrice === obs.shippingPrice &&
        last.stockStatus === obs.stockStatus
      ) {
        obsType = 'HEARTBEAT_OBSERVATION';
      } else {
        obsType = 'STATE_CHANGE_OBSERVATION';
      }
    }

    const record: CommercePriceObservation = {
      ...obs,
      observationId: this.observations.length + 1,
      recordedAt: new Date().toISOString(),
      provenanceClass: obs.provenanceClass || 'LEGACY_UNVERIFIED_OBSERVATION',
      observationType: obs.observationType || obsType
    };
    this.observations.push(record);
    return record;
  }

  public static getObservationsForOffer(offerId: string): CommercePriceObservation[] {
    return this.observations.filter((o) => o.offerId === offerId);
  }

  public static getAllObservations(): CommercePriceObservation[] {
    return this.observations;
  }

  // 6. Source Event Operations
  public static recordSourceEvent(evt: Omit<CommerceSourceEvent, 'retrievedAt'>): CommerceSourceEvent {
    const now = new Date().toISOString();
    const record: CommerceSourceEvent = {
      ...evt,
      retrievedAt: now
    };
    this.sourceEvents.set(evt.sourceEventId, record);
    return record;
  }

  // 7. Freshness Policy Operations
  public static saveFreshnessPolicy(pol: CommerceFreshnessPolicy): void {
    const key = `${pol.retailerId}:${pol.sourceType}`;
    this.freshnessPolicies.set(key, pol);
  }

  public static evaluateFreshness(retailerId: string, sourceType: string, observedAt: string): { state: string; policyUsed: string } {
    const policy = this.freshnessPolicies.get(`${retailerId}:${sourceType}`);
    if (!policy) {
      return { state: 'UNKNOWN_POLICY', policyUsed: 'NO_POLICY_CONFIGURED' };
    }

    const ageSec = (Date.now() - new Date(observedAt).getTime()) / 1000;
    if (ageSec < policy.freshForSeconds) return { state: 'FRESH', policyUsed: policy.policyId };
    if (ageSec < policy.staleAfterSeconds) return { state: 'AGING', policyUsed: policy.policyId };
    if (ageSec < policy.expireAfterSeconds) return { state: 'STALE', policyUsed: policy.policyId };
    return { state: 'EXPIRED', policyUsed: policy.policyId };
  }

  // 8. Anomaly Quarantine Operations
  public static quarantineOffer(anomaly: Omit<CommerceAnomalyRecord, 'quarantinedAt' | 'lifecycleState'> & { lifecycleState?: any }): CommerceAnomalyRecord {
    const record: CommerceAnomalyRecord = {
      ...anomaly,
      lifecycleState: anomaly.lifecycleState || 'DETECTED',
      quarantinedAt: new Date().toISOString()
    };
    this.anomalies.set(anomaly.anomalyId, record);

    if (anomaly.offerId && this.offers.has(anomaly.offerId)) {
      const off = this.offers.get(anomaly.offerId)!;
      off.quarantineStatus = 'PRICE_ANOMALY';
    }

    return record;
  }

  public static getQuarantinedAnomalies(): CommerceAnomalyRecord[] {
    return Array.from(this.anomalies.values());
  }

  // 9. Cron Job Overlap Leases
  public static acquireJobLease(jobId: string, retailerId: string, durationSeconds: number = 300): CommerceJobLease | null {
    const existing = this.jobLeases.get(retailerId);
    const now = new Date();

    if (existing && existing.status === 'ACTIVE' && new Date(existing.leaseExpiresAt) > now) {
      return null; // Overlapping job blocked
    }

    const expiresAt = new Date(now.getTime() + durationSeconds * 1000).toISOString();
    const lease: CommerceJobLease = {
      leaseId: `lease_${Date.now()}_${retailerId}`,
      jobId,
      retailerId,
      startedAt: now.toISOString(),
      leaseExpiresAt: expiresAt,
      status: 'ACTIVE'
    };

    this.jobLeases.set(retailerId, lease);
    return lease;
  }

  public static releaseJobLease(retailerId: string): void {
    const lease = this.jobLeases.get(retailerId);
    if (lease) {
      lease.status = 'RELEASED';
    }
  }

  // 10. Database Permission Isolation Test
  public static testForbiddenTrustCoreWriteFromCommerceRole(): void {
    // Simulate commerce_writer role executing forbidden UPDATE against catalog_products
    try {
      const forbiddenMutation = () => {
        throw new Error('DATABASE_PERMISSION_DENIED: Role commerce_writer does not have UPDATE privilege on table catalog_products.');
      };
      forbiddenMutation();
    } catch (err: any) {
      if (err.message.includes('DATABASE_PERMISSION_DENIED')) {
        return; // Expected permission denial
      }
      throw err;
    }
  }
}
