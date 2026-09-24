import { PostgresCommerceRepository, CommercePriceObservation, PriceObservationProvenanceClass, CommerceOffer, CommerceAnomalyRecord, CommerceAnomalyLifecycleState } from './postgresCommerceRepository';

export interface QualifiedPriceAnalytics {
  catalogRootId: string;
  historyStartAt: string;
  observationCoverage: string;
  eligibleSourceCount: number;
  totalObservationsEvaluated: number;
  eligibleObservationsCount: number;
  qualifiedLowestPrice: number | null;
  qualifiedLabel: string;
  eligibleProvenanceClasses: PriceObservationProvenanceClass[];
  analyticsQualityStatus: 'TRUSTED_LIVE' | 'QUALIFIED_SHADOW' | 'INSUFFICIENT_AUTHORIZED_DATA';
}

export interface CommerceAnomalyPolicyV1Config {
  policyVersion: 'commerce_anomaly_policy_v1';
  ruleId: string;
  ruleClassification: 'INITIAL_INTERNAL_ANOMALY_HEURISTIC';
  minimumPeerCount: number; // Minimum 3 matching peers required for median calculation
  varianceThresholdPercent: number; // 30%
  requireEffectiveTotalPrice: true;
  requireNewConditionOnly: true;
  excludeConditionalPrices: true;
}

export class PriceHistoryAndAnomalyEngine {
  public static readonly POLICY_V1: CommerceAnomalyPolicyV1Config = {
    policyVersion: 'commerce_anomaly_policy_v1',
    ruleId: 'CROSS_RETAILER_MEDIAN_30_PERCENT_HEURISTIC',
    ruleClassification: 'INITIAL_INTERNAL_ANOMALY_HEURISTIC',
    minimumPeerCount: 3,
    varianceThresholdPercent: 30,
    requireEffectiveTotalPrice: true,
    requireNewConditionOnly: true,
    excludeConditionalPrices: true
  };

  /**
   * Internal Price History Query: Returns all observations for a root in shadow state.
   */
  public static getShadowPriceHistoryForRoot(catalogRootId: string): CommercePriceObservation[] {
    const allObs = PostgresCommerceRepository.getAllObservations();
    return allObs.filter((o) => o.catalogRootId === catalogRootId);
  }

  /**
   * HISTORY ANALYTICS ELIGIBILITY FILTER:
   * Excludes LEGACY_UNVERIFIED_OBSERVATION and PERMISSION_UNVERIFIED_SHADOW_OBSERVATION
   * from default trusted public market analytics!
   */
  public static calculateQualifiedAnalytics(
    catalogRootId: string,
    allowedProvenanceClasses: PriceObservationProvenanceClass[] = ['VERIFIED_LIVE_OBSERVATION', 'AUTHORIZED_SOURCE_OBSERVATION']
  ): QualifiedPriceAnalytics {
    const history = this.getShadowPriceHistoryForRoot(catalogRootId);

    const eligible = history.filter((o) => allowedProvenanceClasses.includes(o.provenanceClass) && o.salePrice > 0);
    const eligibleSources = new Set(eligible.map((o) => o.retailerId)).size;

    const prices = eligible.map((o) => o.salePrice).sort((a, b) => a - b);
    const lowest = prices.length > 0 ? prices[0] : null;

    const earliestDate = history.length > 0 ? history[0].recordedAt.split('T')[0] : new Date().toISOString().split('T')[0];

    const label = lowest !== null
      ? `Lowest price observed by ACELEETME since ${earliestDate}`
      : 'No qualified authorized price history available';

    let status: 'TRUSTED_LIVE' | 'QUALIFIED_SHADOW' | 'INSUFFICIENT_AUTHORIZED_DATA' = 'INSUFFICIENT_AUTHORIZED_DATA';
    if (eligible.length > 0 && allowedProvenanceClasses.includes('VERIFIED_LIVE_OBSERVATION')) {
      status = 'TRUSTED_LIVE';
    } else if (eligible.length > 0) {
      status = 'QUALIFIED_SHADOW';
    }

    return {
      catalogRootId,
      historyStartAt: earliestDate,
      observationCoverage: `${history.length} total observations recorded`,
      eligibleSourceCount: eligibleSources,
      totalObservationsEvaluated: history.length,
      eligibleObservationsCount: eligible.length,
      qualifiedLowestPrice: lowest,
      qualifiedLabel: label,
      eligibleProvenanceClasses: allowedProvenanceClasses,
      analyticsQualityStatus: status
    };
  }

  /**
   * VERSIONED ANOMALY ENGINE (commerce_anomaly_policy_v1)
   */
  public static evaluateAnomaliesV1(catalogRootId: string): CommerceAnomalyRecord[] {
    const offers = PostgresCommerceRepository.getShadowOffersForRoot(catalogRootId);
    const anomalies: CommerceAnomalyRecord[] = [];

    // 1. Identity Anomaly Override Check
    for (const offer of offers) {
      const mapping = PostgresCommerceRepository.getMapping(offer.mappingId);
      if (mapping) {
        if (mapping.matchState === 'AMBIGUOUS' || mapping.matchState === 'MISMATCH') {
          const rec = PostgresCommerceRepository.quarantineOffer({
            anomalyId: `anom_id_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            offerId: offer.offerId,
            catalogRootId,
            retailerId: offer.retailerId,
            ruleId: 'IDENTITY_MATCH_OVERRIDE_RULE',
            policyVersion: this.POLICY_V1.policyVersion,
            reason: `IDENTITY_ANOMALY_OVERRIDE: Mapping state is ${mapping.matchState}. Identity quarantine overrides price analysis.`,
            observedValues: { matchState: mapping.matchState },
            lifecycleState: 'REVIEW_REQUIRED',
            status: 'QUARANTINED'
          });
          anomalies.push(rec);
          continue;
        }
      }

      // 2. Deterministic Price Parsing Anomaly Checks
      if (offer.salePrice <= 0) {
        const rec = PostgresCommerceRepository.quarantineOffer({
          anomalyId: `anom_parse_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          offerId: offer.offerId,
          catalogRootId,
          retailerId: offer.retailerId,
          ruleId: 'DETERMINISTIC_PRICE_PARSING_RULE',
          policyVersion: this.POLICY_V1.policyVersion,
          reason: 'PRICE_PARSING_ANOMALY: Sale price is non-positive',
          observedValues: { salePrice: offer.salePrice },
          lifecycleState: 'CONFIRMED_ANOMALY',
          status: 'QUARANTINED'
        });
        anomalies.push(rec);
        continue;
      }

      if (offer.salePrice > 10000000) {
        const rec = PostgresCommerceRepository.quarantineOffer({
          anomalyId: `anom_scale_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          offerId: offer.offerId,
          catalogRootId,
          retailerId: offer.retailerId,
          ruleId: 'PRICE_SCALE_PARSING_RULE',
          policyVersion: this.POLICY_V1.policyVersion,
          reason: 'PRICE_SCALE_ANOMALY: Unreasonably high price scale (e.g. missing decimal point)',
          observedValues: { salePrice: offer.salePrice },
          lifecycleState: 'CONFIRMED_ANOMALY',
          status: 'QUARANTINED'
        });
        anomalies.push(rec);
        continue;
      }
    }

    // 3. Shipping-Aware & Peer-Count-Aware Cross-Retailer Median Heuristic
    // Filter peers: NEW condition, effectiveTotalPrice != null (known shipping), non-conditional
    const peerOffers = offers.filter(
      (o) =>
        o.condition === 'NEW' &&
        o.effectiveTotalPrice !== null &&
        o.quarantineStatus !== 'CONDITIONAL_PRICE' &&
        o.salePrice > 0
    );

    if (peerOffers.length >= this.POLICY_V1.minimumPeerCount) {
      const peerPrices = peerOffers.map((o) => o.effectiveTotalPrice!).sort((a, b) => a - b);
      const mid = Math.floor(peerPrices.length / 2);
      const medianPrice = peerPrices.length % 2 !== 0 ? peerPrices[mid] : (peerPrices[mid - 1] + peerPrices[mid]) / 2;

      for (const offer of peerOffers) {
        const dev = Math.abs(offer.effectiveTotalPrice! - medianPrice) / medianPrice;
        if (dev > this.POLICY_V1.varianceThresholdPercent / 100) {
          const rec = PostgresCommerceRepository.quarantineOffer({
            anomalyId: `anom_v1_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            offerId: offer.offerId,
            catalogRootId,
            retailerId: offer.retailerId,
            ruleId: this.POLICY_V1.ruleId,
            policyVersion: this.POLICY_V1.policyVersion,
            reason: `INITIAL_INTERNAL_ANOMALY_HEURISTIC: Offer effective total price (${offer.effectiveTotalPrice} TRY) deviates by ${(dev * 100).toFixed(1)}% from median (${medianPrice.toFixed(2)} TRY)`,
            observedValues: { effectiveTotalPrice: offer.effectiveTotalPrice, salePrice: offer.salePrice },
            comparisonValues: { medianPrice, peerSampleCount: peerPrices.length },
            peerSampleCount: peerPrices.length,
            lifecycleState: 'REVIEW_REQUIRED',
            status: 'QUARANTINED'
          });
          anomalies.push(rec);
        }
      }
    }

    return anomalies;
  }
}
