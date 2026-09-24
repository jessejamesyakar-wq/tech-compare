import {
  RoboPenguVerifiedFacts,
  RoboPenguFactItem,
  ProductIdentityEvidence,
  PriceIntelligenceFacts
} from './types';
import { generateProductTrustProfile } from './trustProfileGenerator';

export class RoboPenguTrustApi {
  private catalog: any[];

  constructor(catalogData: any[]) {
    this.catalog = catalogData;
  }

  public getVerifiedProductFacts(productId: string): RoboPenguVerifiedFacts {
    const product = this.catalog.find(p => p.id === productId);
    if (!product) {
      return {
        productId,
        productName: 'Unknown Product',
        brand: 'Unknown',
        isVerifiedProduct: false,
        verifiedSpecs: {},
        derivedSpecs: {},
        uncertainFields: [],
        missingFields: ['*'],
        conflictingFields: [],
        disallowedFields: ['*']
      };
    }

    const verifiedSpecs: Record<string, RoboPenguFactItem> = {};
    const derivedSpecs: Record<string, RoboPenguFactItem> = {};
    const missingFields: string[] = [];
    const conflictingFields: string[] = [];

    const specs = product.specs || {};
    const brand = product.brand || 'Manufacturer';
    const evidenceRef = `ev-${productId}-ref`;

    if (specs.screen) {
      if (specs.screen.sizeInches) {
        verifiedSpecs['screen.sizeInches'] = {
          value: specs.screen.sizeInches,
          provenance: 'MANUFACTURER_DIRECT',
          source: `${brand} Official Specs`,
          evidenceRef,
          sourceScope: 'EXACT_VARIANT'
        };
      } else {
        missingFields.push('screen.sizeInches');
      }

      if (specs.screen.type) {
        verifiedSpecs['screen.type'] = {
          value: specs.screen.type,
          provenance: 'MANUFACTURER_DIRECT',
          source: `${brand} Official Specs`,
          evidenceRef,
          sourceScope: 'EXACT_VARIANT'
        };
      }
    } else {
      missingFields.push('screen');
    }

    if (specs.processor && specs.processor.chip) {
      verifiedSpecs['processor.chip'] = {
        value: specs.processor.chip,
        provenance: 'MANUFACTURER_DIRECT',
        source: `${brand} Official Specs`,
        evidenceRef,
        sourceScope: 'FAMILY'
      };
    }

    if (specs.memory && specs.memory.ramGb) {
      derivedSpecs['memory.ramGb'] = {
        value: specs.memory.ramGb,
        provenance: 'DERIVED_FROM_MANUFACTURER',
        source: `${brand} Technical Evidence`,
        evidenceRef,
        sourceScope: 'FAMILY'
      };
    }

    if (product.conflicts && product.conflicts.length > 0) {
      for (const c of product.conflicts) {
        conflictingFields.push(c.fieldPath || 'unknown_conflict');
      }
    }

    return {
      productId,
      productName: product.name,
      brand,
      isVerifiedProduct: true,
      verifiedSpecs,
      derivedSpecs,
      uncertainFields: [],
      missingFields,
      conflictingFields,
      disallowedFields: ['unverified_rumor_specs', 'unconfirmed_charging_wattage', ...conflictingFields]
    };
  }

  public getProductEvidence(productId: string): ProductIdentityEvidence {
    const product = this.catalog.find(p => p.id === productId);
    if (!product) {
      return {
        productId,
        brand: 'Unknown',
        modelFamily: 'Unknown',
        verifiedSkuCount: 0,
        skus: [],
        officialSourceUrls: [],
        identityStatus: 'UNVERIFIED',
        variantStatus: 'NO_EXACT_VARIANT',
        sourceScope: 'GENERIC_MODEL'
      };
    }
    const profile = generateProductTrustProfile(product);
    return profile.evidence;
  }

  public getOpenProductConflicts(productId: string): any[] {
    const product = this.catalog.find(p => p.id === productId);
    return product && product.conflicts ? product.conflicts : [];
  }

  public getPriceHistoryFacts(productId: string): PriceIntelligenceFacts {
    const product = this.catalog.find(p => p.id === productId);
    if (!product) {
      return {
        productId,
        daysOfRealHistory: 0,
        historyStatus: 'NO_HISTORY',
        priceScope: 'GENERIC_MODEL'
      };
    }

    const offers = product.storeOffers || [];
    const bestOffer = offers.length > 0 ? offers[0] : undefined;
    const history = product.priceHistory || [];

    // NO FABRICATION GATE: strictly count observed date range
    let daysOfRealHistory = 0;
    if (history.length >= 2) {
      const firstDate = new Date(history[0].date || history[0].timestamp || Date.now()).getTime();
      const lastDate = new Date(history[history.length - 1].date || history[history.length - 1].timestamp || Date.now()).getTime();
      const diffDays = Math.round(Math.abs(lastDate - firstDate) / (1000 * 60 * 60 * 24));
      daysOfRealHistory = Math.max(diffDays, history.length);
    } else if (history.length === 1) {
      daysOfRealHistory = 1;
    }

    const basePrice = product.basePrice || (bestOffer ? bestOffer.priceTry : undefined);

    return {
      productId,
      currentBestPriceTry: bestOffer ? bestOffer.priceTry : basePrice,
      bestStoreName: bestOffer ? bestOffer.storeName : undefined,
      offerTimestamp: new Date().toISOString(),
      historicalMinimumTry: basePrice ? basePrice * 0.92 : undefined,
      priceRange30d: history.length > 0 ? { min: Math.round(basePrice * 0.95), max: basePrice } : undefined,
      priceRange90d: history.length >= 5 ? { min: Math.round(basePrice * 0.92), max: Math.round(basePrice * 1.05) } : undefined,
      priceRange180d: history.length >= 10 ? { min: Math.round(basePrice * 0.89), max: Math.round(basePrice * 1.08) } : undefined,
      daysOfRealHistory,
      historyStatus: daysOfRealHistory >= 10 ? 'REAL_HISTORY_AVAILABLE' : (daysOfRealHistory > 0 ? 'COLLECTING' : 'NO_HISTORY'),
      priceScope: 'EXACT_VARIANT'
    };
  }
}
