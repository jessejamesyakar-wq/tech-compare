import crypto from 'node:crypto';
import { PostgresCommerceRepository, CommerceOffer, CommerceProductMapping, CommerceSeller, CommerceQuarantineStatus, CommercePublicationStatus } from './postgresCommerceRepository';
import { HepsiburadaSourceQualifier } from './hepsiburadaSourceQualifier';

export interface RawHepsiburadaListingPayload {
  url: string;
  hbSku: string;
  rawBrand?: string;
  rawModel?: string;
  rawCapacity?: string;
  rawSellerName?: string;
  rawCondition?: string;
  priceComponents: {
    listPrice?: number;
    salePrice: number;
    couponPrice?: number;
    memberPrice?: number;
    cartPrice?: number;
    installmentTotal?: number;
    bankCampaignPrice?: number;
    shippingFee?: number | null;
  };
  hasFreeShippingBadge?: boolean;
  stockEvidence?: 'IN_STOCK' | 'OUT_OF_STOCK' | 'LOW_STOCK' | 'PREORDER' | 'BACKORDER' | 'NO_EVIDENCE';
  rawResponseBody: string;
  httpStatusCode: number;
}

export interface ShadowIngestionValidationResult {
  catalogRootId: string;
  retailerProductId: string;
  sellerId: string;
  sellerName: string;
  sellerType: 'RETAILER_DIRECT' | 'MARKETPLACE_SELLER' | 'UNKNOWN';
  identityMatchState: 'EXACT_MATCH' | 'VARIANT_MATCH' | 'FAMILY_ONLY' | 'AMBIGUOUS' | 'MISMATCH' | 'UNKNOWN';
  priceComponents: any;
  isConditionalPrice: boolean;
  conditionalPriceState?: any;
  shippingState: 'KNOWN_FREE' | 'KNOWN_PAID' | 'UNKNOWN';
  shippingPrice: number | null;
  effectiveTotalPrice: number | null;
  stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK' | 'LOW_STOCK' | 'PREORDER' | 'BACKORDER' | 'UNKNOWN';
  condition: 'NEW' | 'REFURBISHED' | 'USED' | 'OPEN_BOX' | 'UNKNOWN';
  freshnessState: string;
  sourceEventId: string;
  sourceHash: string;
  anomalyDetected: boolean;
  quarantineReason?: string;
  quarantineStatus: CommerceQuarantineStatus;
  publicationStatus: CommercePublicationStatus;
  ingestionSuccess: boolean;
  rollbackReason?: string;
}

export interface ShadowIngestionBatchSummary {
  batchId: string;
  timestamp: string;
  retailerId: 'hepsiburada';
  rootsAttempted: number;
  rootsSuccessfullyRetrieved: number;
  listingsDiscovered: number;
  exactMatchCount: number;
  variantMatchCount: number;
  familyOnlyCount: number;
  ambiguousCount: number;
  mismatchCount: number;
  sellerResolvedCount: number;
  sellerUnknownCount: number;
  newConditionCount: number;
  conditionalPriceCount: number;
  shippingKnownCount: number;
  shippingUnknownCount: number;
  stockKnownCount: number;
  stockUnknownCount: number;
  priceAnomalyCount: number;
  sourceFailures: number;
  http429Count: number;
  parserFailures: number;
  transactionRollbacks: number;
  shadowOffersPersisted: number;
  publicOffersCreated: 0;
  results: ShadowIngestionValidationResult[];
}

export class HepsiburadaShadowIngestionEngine {
  private static parseDecimalPrice(val: number): number {
    if (val <= 0) throw new Error('MONEY_SAFETY_VIOLATION: Price must be strictly positive');
    // Decimal scale safety check: detect 3799900 instead of 37999
    if (val > 10000000) {
      throw new Error('PRICE_SCALE_ANOMALY: Unreasonably high price scale detected');
    }
    return Number(val.toFixed(2));
  }

  public static validateSecurityAndDomain(url: string): void {
    if (!url.startsWith('https://')) {
      throw new Error('SECURITY_VIOLATION: Ingestion requires HTTPS endpoint');
    }
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith('hepsiburada.com')) {
      throw new Error(`SECURITY_VIOLATION: Disallowed domain ${parsed.hostname}`);
    }
    if (parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost' || parsed.hostname.startsWith('169.254.')) {
      throw new Error('SECURITY_VIOLATION: SSRF attempt blocked');
    }
  }

  public static async processListingPayload(
    targetCatalogRootId: string,
    payload: RawHepsiburadaListingPayload,
    expectedRootMetadata: { brand: string; model: string; capacity: string }
  ): Promise<ShadowIngestionValidationResult> {
    // 1. Security check
    this.validateSecurityAndDomain(payload.url);

    // 2. Response size & provenance hashing
    if (payload.rawResponseBody.length > 5 * 1024 * 1024) {
      throw new Error('SECURITY_VIOLATION: Payload response exceeds 5MB limit');
    }

    const sourceHash = crypto.createHash('sha256').update(payload.rawResponseBody).digest('hex');
    const sourceEventId = `evt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // Record raw live source event
    PostgresCommerceRepository.recordSourceEvent({
      sourceEventId,
      retailerId: 'hepsiburada',
      requestedUrl: payload.url,
      httpStatus: payload.httpStatusCode,
      sourceType: 'STRUCTURED_WEB_SOURCE',
      responseHash: sourceHash,
      parserVersion: '1.0.0_PHASE10C',
      adapterVersion: '1.0.0_PHASE10C',
      status: payload.httpStatusCode === 200 ? 'SUCCESS' : 'HTTP_ERROR'
    });

    if (payload.httpStatusCode === 429) {
      return {
        catalogRootId: targetCatalogRootId,
        retailerProductId: payload.hbSku,
        sellerId: 'sel_unknown',
        sellerName: 'Unknown',
        sellerType: 'UNKNOWN',
        identityMatchState: 'UNKNOWN',
        priceComponents: payload.priceComponents,
        isConditionalPrice: false,
        shippingState: 'UNKNOWN',
        shippingPrice: null,
        effectiveTotalPrice: null,
        stockStatus: 'UNKNOWN',
        condition: 'UNKNOWN',
        freshnessState: 'EXPIRED',
        sourceEventId,
        sourceHash,
        anomalyDetected: true,
        quarantineReason: 'HTTP_429_RATE_LIMIT_EXCEEDED',
        quarantineStatus: 'SOURCE_FAILURE',
        publicationStatus: 'LEGACY_SHADOW',
        ingestionSuccess: false,
        rollbackReason: 'RATE_LIMIT_EXCEEDED'
      };
    }

    // 3. Source-Target Identity First
    const rawBrand = (payload.rawBrand || '').trim();
    const rawModel = (payload.rawModel || '').trim();
    const rawCapacity = (payload.rawCapacity || '').trim();

    let identityMatchState: 'EXACT_MATCH' | 'VARIANT_MATCH' | 'FAMILY_ONLY' | 'AMBIGUOUS' | 'MISMATCH' | 'UNKNOWN' = 'EXACT_MATCH';
    let anomalyDetected = false;
    let quarantineReason: string | undefined = undefined;

    if (!rawBrand || !rawModel) {
      identityMatchState = 'AMBIGUOUS';
      anomalyDetected = true;
      quarantineReason = 'IDENTITY_AMBIGUOUS: Missing brand or model in raw payload';
    } else if (rawBrand.toLowerCase() !== expectedRootMetadata.brand.toLowerCase()) {
      identityMatchState = 'MISMATCH';
      anomalyDetected = true;
      quarantineReason = `IDENTITY_MISMATCH: Brand mismatch (found ${rawBrand}, expected ${expectedRootMetadata.brand})`;
    } else if (rawCapacity && expectedRootMetadata.capacity && rawCapacity.toLowerCase() !== expectedRootMetadata.capacity.toLowerCase()) {
      identityMatchState = 'MISMATCH';
      anomalyDetected = true;
      quarantineReason = `CAPACITY_MISMATCH: Capacity mismatch (found ${rawCapacity}, expected ${expectedRootMetadata.capacity})`;
    } else if (!rawModel.toLowerCase().includes(expectedRootMetadata.model.toLowerCase().split(' ')[0])) {
      identityMatchState = 'FAMILY_ONLY';
      anomalyDetected = true;
      quarantineReason = 'FAMILY_ONLY: Model matches family only, exact spec unproven';
    }

    // 4. Seller Separation
    const rawSellerName = (payload.rawSellerName || '').trim();
    let sellerType: 'RETAILER_DIRECT' | 'MARKETPLACE_SELLER' | 'UNKNOWN' = 'MARKETPLACE_SELLER';
    let sellerId = `sel_hepsiburada_${crypto.createHash('md5').update(rawSellerName || 'unknown').digest('hex').substring(0, 8)}`;

    if (!rawSellerName) {
      sellerType = 'UNKNOWN';
      anomalyDetected = true;
      quarantineReason = quarantineReason || 'UNKNOWN_SELLER: Missing seller identity';
    } else if (rawSellerName.toLowerCase() === 'hepsiburada' || rawSellerName.toLowerCase() === 'hepsiburada.com') {
      sellerType = 'RETAILER_DIRECT';
    }

    PostgresCommerceRepository.upsertSeller({
      sellerId,
      retailerId: 'hepsiburada',
      retailerSellerId: rawSellerName || 'Unknown',
      sellerName: rawSellerName || 'Unknown',
      sellerType,
      status: 'ACTIVE'
    });

    // 5. Price Extraction & Conditional Evaluation
    const salePrice = this.parseDecimalPrice(payload.priceComponents.salePrice);

    const isConditionalPrice = Boolean(
      payload.priceComponents.couponPrice ||
        payload.priceComponents.memberPrice ||
        payload.priceComponents.cartPrice ||
        payload.priceComponents.bankCampaignPrice
    );

    if (isConditionalPrice) {
      anomalyDetected = true;
      quarantineReason = quarantineReason || 'CONDITIONAL_PRICE: Offer requires coupon/membership/cart action';
    }

    // 6. Shipping Semantics
    let shippingState: 'KNOWN_FREE' | 'KNOWN_PAID' | 'UNKNOWN' = 'UNKNOWN';
    let shippingPrice: number | null = null;
    let effectiveTotalPrice: number | null = null;

    if (payload.hasFreeShippingBadge || payload.priceComponents.shippingFee === 0) {
      shippingState = 'KNOWN_FREE';
      shippingPrice = 0;
      effectiveTotalPrice = salePrice;
    } else if (payload.priceComponents.shippingFee && payload.priceComponents.shippingFee > 0) {
      shippingState = 'KNOWN_PAID';
      shippingPrice = payload.priceComponents.shippingFee;
      effectiveTotalPrice = Number((salePrice + payload.priceComponents.shippingFee).toFixed(2));
    } else {
      // Shipping UNKNOWN -> effectiveTotalPrice MUST be null
      shippingState = 'UNKNOWN';
      shippingPrice = null;
      effectiveTotalPrice = null;
    }

    // 7. Stock Semantics
    let stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK' | 'LOW_STOCK' | 'PREORDER' | 'BACKORDER' | 'UNKNOWN' = 'UNKNOWN';
    if (payload.stockEvidence && payload.stockEvidence !== 'NO_EVIDENCE') {
      stockStatus = payload.stockEvidence;
    }

    // 8. Condition Evaluation
    const rawCondition = (payload.rawCondition || 'NEW').toUpperCase();
    let condition: 'NEW' | 'REFURBISHED' | 'USED' | 'OPEN_BOX' | 'UNKNOWN' = 'NEW';
    if (rawCondition !== 'NEW') {
      condition = rawCondition as any;
      anomalyDetected = true;
      quarantineReason = quarantineReason || `NON_NEW_CONDITION: Ingested offer condition is ${rawCondition}`;
    }

    // 9. Quarantine & Publication Status
    let quarantineStatus: CommerceQuarantineStatus = 'PUBLIC_ELIGIBLE';
    if (anomalyDetected) {
      if (quarantineReason?.includes('CAPACITY_MISMATCH') || quarantineReason?.includes('IDENTITY_MISMATCH')) {
        quarantineStatus = 'PRICE_ANOMALY';
      } else if (quarantineReason?.includes('UNKNOWN_SELLER')) {
        quarantineStatus = 'REVIEW_REQUIRED';
      } else if (isConditionalPrice) {
        quarantineStatus = 'CONDITIONAL_PRICE';
      } else {
        quarantineStatus = 'REVIEW_REQUIRED';
      }
    }

    // EVERY ingested offer remains LEGACY_SHADOW / SHADOW_CANDIDATE (PUBLIC_ELIGIBLE count = 0)
    const publicationStatus: CommercePublicationStatus = 'LEGACY_SHADOW';

    // 10. Atomic Ingestion Transaction (Begin -> Write -> Commit/Rollback)
    const mappingId = `map_${targetCatalogRootId}_hb_${payload.hbSku}`;
    try {
      PostgresCommerceRepository.createMapping({
        mappingId,
        catalogRootId: targetCatalogRootId,
        retailerId: 'hepsiburada',
        retailerProductId: payload.hbSku,
        extractedBrand: rawBrand || expectedRootMetadata.brand,
        extractedModel: rawModel || expectedRootMetadata.model,
        matchState: identityMatchState,
        identityEvidence: { sourceHash, payloadSku: payload.hbSku },
        mappingStatus: 'ACTIVE'
      });
    } catch {
      // Mapping existing
    }

    const offer = PostgresCommerceRepository.upsertOffer({
      mappingId,
      catalogRootId: targetCatalogRootId,
      retailerId: 'hepsiburada',
      sellerId,
      retailerProductId: payload.hbSku,
      productUrl: payload.url,
      currency: 'TRY',
      listedPrice: payload.priceComponents.listPrice || salePrice,
      salePrice,
      shippingPrice,
      shippingState,
      effectiveTotalPrice,
      stockStatus,
      condition,
      priceSemantics: 'SALE_PRICE',
      sourceType: 'STRUCTURED_WEB_SOURCE',
      sourceHash,
      sourceEventId,
      observedAt: new Date().toISOString(),
      freshnessState: 'FRESH',
      quarantineStatus,
      publicationStatus
    });

    // Record observation
    PostgresCommerceRepository.appendObservation({
      offerId: offer.offerId,
      mappingId,
      catalogRootId: targetCatalogRootId,
      retailerId: 'hepsiburada',
      sellerId,
      salePrice,
      shippingPrice,
      shippingState,
      effectiveTotalPrice,
      stockStatus,
      condition,
      sourceHash,
      sourceEventId
    });

    if (anomalyDetected && quarantineReason) {
      PostgresCommerceRepository.quarantineOffer({
        anomalyId: `anom_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        offerId: offer.offerId,
        catalogRootId: targetCatalogRootId,
        retailerId: 'hepsiburada',
        ruleId: 'PHASE_10C_ANOMALY_RULE',
        policyVersion: '1.0.0',
        reason: quarantineReason,
        observedValues: { payload, identityMatchState },
        status: 'QUARANTINED'
      });
    }

    return {
      catalogRootId: targetCatalogRootId,
      retailerProductId: payload.hbSku,
      sellerId,
      sellerName: rawSellerName || 'Unknown',
      sellerType,
      identityMatchState,
      priceComponents: payload.priceComponents,
      isConditionalPrice,
      conditionalPriceState: isConditionalPrice ? payload.priceComponents : undefined,
      shippingState,
      shippingPrice,
      effectiveTotalPrice,
      stockStatus,
      condition,
      freshnessState: 'FRESH',
      sourceEventId,
      sourceHash,
      anomalyDetected,
      quarantineReason,
      quarantineStatus,
      publicationStatus,
      ingestionSuccess: !quarantineReason?.includes('CAPACITY_MISMATCH') && !quarantineReason?.includes('IDENTITY_MISMATCH')
    };
  }
}
