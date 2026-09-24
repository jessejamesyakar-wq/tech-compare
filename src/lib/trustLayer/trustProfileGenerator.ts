import {
  ProductTrustProfile,
  ProductIdentityEvidence,
  IdentityTrustStatus,
  VariantTrustStatus,
  SpecCoverageTrustStatus,
  PriceFreshnessStatus,
  PriceHistoryTrustStatus,
  SourceScope
} from './types';

export function generateProductTrustProfile(product: any): ProductTrustProfile {
  if (!product) {
    return {
      productId: 'unknown',
      productName: 'Unknown Product',
      brand: 'Unknown',
      identity: 'UNVERIFIED',
      variant: 'NO_EXACT_VARIANT',
      specCoverage: 'PARTIAL',
      priceFreshness: 'NO_CURRENT_OFFER',
      priceHistory: 'NO_HISTORY',
      openConflictsCount: 0,
      evidence: {
        productId: 'unknown',
        brand: 'Unknown',
        modelFamily: 'Unknown',
        verifiedSkuCount: 0,
        skus: [],
        officialSourceUrls: [],
        identityStatus: 'UNVERIFIED',
        variantStatus: 'NO_EXACT_VARIANT',
        sourceScope: 'GENERIC_MODEL'
      }
    };
  }

  const brand = product.brand || (product.id.includes('samsung') ? 'Samsung' : (product.id.includes('apple') ? 'Apple' : 'Unknown'));
  const name = product.name || 'Unknown Product';
  const skus = product.variants ? product.variants.map((v: any) => v.modelCode || v.sku).filter(Boolean) : [product.modelCode].filter(Boolean);

  const officialSourceUrls: string[] = [];
  let sourceScope: SourceScope = 'FAMILY';

  if (brand === 'Samsung') {
    officialSourceUrls.push(`https://www.samsung.com/tr/smartphones/${name.toLowerCase().replace(/\s+/g, '-')}/specs/`);
  } else if (brand === 'Apple') {
    officialSourceUrls.push(`https://www.apple.com/tr/${name.toLowerCase().replace(/\s*\(\d+\s*(gb|tb)\)/i, '').replace(/\s+/g, '-')}/specs/`);
  }

  let identity: IdentityTrustStatus = 'UNVERIFIED';
  let variant: VariantTrustStatus = 'NO_EXACT_VARIANT';

  if (skus.length > 0 || product.modelCode) {
    identity = 'VERIFIED';
    variant = 'EXACT_SKU';
    sourceScope = 'EXACT_VARIANT';
  } else if (product.name) {
    identity = 'PARTIAL';
    variant = 'GENERIC_FAMILY';
    sourceScope = 'FAMILY';
  }

  const hasSpecs = product.specs && Object.keys(product.specs).length > 0;
  const hasConflicts = product.conflicts && product.conflicts.length > 0;

  let specCoverage: SpecCoverageTrustStatus = 'PARTIAL';
  if (hasConflicts) {
    specCoverage = 'CONFLICT_PRESENT';
  } else if (hasSpecs) {
    specCoverage = 'MANUFACTURER_VERIFIED';
  }

  const hasOffers = product.storeOffers && product.storeOffers.length > 0;
  const priceFreshness: PriceFreshnessStatus = hasOffers ? 'LIVE' : 'NO_CURRENT_OFFER';

  const historyLength = product.priceHistory ? product.priceHistory.length : 0;
  const priceHistoryStatus: PriceHistoryTrustStatus = historyLength >= 10 ? 'REAL_HISTORY_AVAILABLE' : (historyLength > 0 ? 'COLLECTING' : 'NO_HISTORY');

  const evidence: ProductIdentityEvidence = {
    productId: product.id,
    brand,
    modelFamily: name.replace(/\s*\(\d+\s*(GB|TB)\)/i, '').trim(),
    storageGb: product.storageGb || 128,
    verifiedSkuCount: skus.length,
    skus,
    officialSourceUrls,
    identityStatus: identity,
    variantStatus: variant,
    sourceScope
  };

  return {
    productId: product.id,
    productName: name,
    brand,
    identity,
    variant,
    specCoverage,
    priceFreshness,
    priceHistory: priceHistoryStatus,
    openConflictsCount: hasConflicts ? product.conflicts.length : 0,
    evidence
  };
}

export function projectUserFacingTrustPayload(profile: ProductTrustProfile) {
  return {
    productId: profile.productId,
    productName: profile.productName,
    brand: profile.brand,
    identity: profile.identity,
    variant: profile.variant,
    specCoverage: profile.specCoverage,
    priceFreshness: profile.priceFreshness,
    priceHistory: profile.priceHistory,
    openConflictsCount: profile.openConflictsCount,
    verifiedSkuCount: profile.evidence.verifiedSkuCount,
    officialSourcesCount: profile.evidence.officialSourceUrls.length
  };
}
