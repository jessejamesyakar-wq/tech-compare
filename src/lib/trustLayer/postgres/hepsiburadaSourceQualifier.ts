import crypto from 'node:crypto';
import smartphonesData from '../../smartphonesData.json';

export type TechnicalSourceType = 'OFFICIAL_API' | 'AFFILIATE_FEED' | 'PARTNER_FEED' | 'STRUCTURED_WEB_SOURCE';
export type UsageAuthorizationStatus =
  | 'AUTHORIZED'
  | 'AUTHORIZED_WITH_LIMITATIONS'
  | 'PERMISSION_UNVERIFIED'
  | 'TEST_ONLY'
  | 'NOT_AUTHORIZED'
  | 'UNKNOWN';

export interface TargetRootManifestItem {
  catalogRootId: string;
  brand: string;
  model: string;
  capacity: string;
  variantIdentity: string;
  releaseStatus: string;
  trustCoreIdentityHash: string;
  preCommerceStateHash: string;
}

export interface OfficialApiScopeDoc {
  endpoint: string;
  endpointPurpose: string;
  authenticationModel: string;
  merchantIdRequirement: boolean;
  merchantScope: string;
  sellerScope: string;
  availablePriceFields: string[];
  availableStockFields: string[];
  availableShippingFields: string[];
  usageAuthorization: UsageAuthorizationStatus;
  rateLimitDocumentation: string;
  isRestrictedToMerchantListingsOnly: boolean;
}

export interface StructuredWebUsageGateDoc {
  robotsGuidance: string;
  siteTermsApplicable: string;
  approvedTargetUrlPatterns: string[];
  concurrencyRatePolicy: string;
  antiBotBypassAllowed: false;
}

export interface HepsiburadaSourceQualification {
  technicalSourceType: TechnicalSourceType;
  usageAuthorizationStatus: UsageAuthorizationStatus;
  rateCapRequestsPerSecond: number;
  rateCapClarification: string;
  officialApiScope: OfficialApiScopeDoc;
  structuredWebUsageGate: StructuredWebUsageGateDoc;
  targetManifest: TargetRootManifestItem[];
  identityExtractionCapabilities: {
    brand: boolean;
    model: boolean;
    variantCapacity: boolean;
    seller: boolean;
    price: boolean;
    stock: boolean;
    shipping: boolean;
  };
  shadowIngestionPlan: {
    retailerId: string;
    maxCatalogRootsCount: 10;
    targetCatalogRoots: string[];
    listingsPerRootRange: string;
    allowedCondition: 'NEW';
    allowedCurrency: 'TRY';
    initialPublicationStatus: 'LEGACY_SHADOW';
    publicQueryReachability: 0;
  };
}

export const FROZEN_10_TARGET_ROOT_IDS = [
  'samsung-samsung-galaxy-s24-93',
  'samsung-samsung-galaxy-s24-ultra-95',
  'samsung-samsung-galaxy-a55-5g-103',
  'apple-apple-iphone-16-pro-max-256-gb-952387',
  'apple-apple-iphone-16-pro-128-gb-952452',
  'apple-apple-iphone-16-128-gb-959779',
  'apple-apple-iphone-15-pro-max-256-gb-895852',
  'apple-apple-iphone-15-128-gb-895865',
  'apple-apple-iphone-14-pro-128-gb-802356',
  'apple-apple-iphone-11-64-gb-223976'
];

export class HepsiburadaSourceQualifier {
  public static qualifySourceAndPlanShadowIngestion(): HepsiburadaSourceQualification {
    const rawData = smartphonesData as any[];

    const targetManifest: TargetRootManifestItem[] = FROZEN_10_TARGET_ROOT_IDS.map((rootId) => {
      const p = rawData.find((item) => item.id === rootId);
      if (!p) {
        throw new Error(`CRITICAL: Frozen target catalog root ${rootId} not found in catalog!`);
      }

      const trustHash = crypto.createHash('sha256').update(JSON.stringify(p)).digest('hex');
      const preCommerceHash = crypto.createHash('sha256').update(`${p.id}_${p.name}_${p.brand}`).digest('hex');

      return {
        catalogRootId: p.id,
        brand: p.brand || 'Unknown',
        model: p.name || 'Unknown',
        capacity: p.specs?.storage?.internal || p.storage || '128 GB',
        variantIdentity: p.specs?.color || 'Standard',
        releaseStatus: 'RELEASED',
        trustCoreIdentityHash: trustHash,
        preCommerceStateHash: preCommerceHash
      };
    });

    const isApiConfigured = Boolean(
      process.env.HEPSIBURADA_USERNAME && process.env.HEPSIBURADA_PASSWORD && process.env.HEPSIBURADA_MERCHANT_ID
    );

    return {
      technicalSourceType: isApiConfigured ? 'OFFICIAL_API' : 'STRUCTURED_WEB_SOURCE',
      usageAuthorizationStatus: isApiConfigured ? 'AUTHORIZED_WITH_LIMITATIONS' : 'PERMISSION_UNVERIFIED',
      rateCapRequestsPerSecond: 4,
      rateCapClarification: 'INITIAL_INTERNAL_SAFETY_CAP (Not an official Hepsiburada provider SLA cap)',
      officialApiScope: {
        endpoint: 'https://mpop.hepsiburada.com/listings/merchantid/{merchantId}',
        endpointPurpose: 'Merchant inventory & pricing management',
        authenticationModel: 'Basic HTTP Auth (Username/Password) + Merchant ID header',
        merchantIdRequirement: true,
        merchantScope: 'RESTRICTED_TO_AUTHORIZED_MERCHANT_LISTINGS',
        sellerScope: 'AUTHORIZED_SELLER_ONLY',
        availablePriceFields: ['price', 'salePrice', 'listPrice'],
        availableStockFields: ['availableStockQuantity', 'dispatchTime'],
        availableShippingFields: ['cargoCompany', 'freeShippingThreshold'],
        usageAuthorization: isApiConfigured ? 'AUTHORIZED_WITH_LIMITATIONS' : 'PERMISSION_UNVERIFIED',
        rateLimitDocumentation: '10 requests/second per merchant API token',
        isRestrictedToMerchantListingsOnly: true
      },
      structuredWebUsageGate: {
        robotsGuidance: 'Respect /product/ disallow patterns and standard user agent limits',
        siteTermsApplicable: 'Hepsiburada Terms of Service for automated access',
        approvedTargetUrlPatterns: ['https://www.hepsiburada.com/[product-slug]-p-[hbSku]'],
        concurrencyRatePolicy: 'Max 4 req/sec safety cap; starting at 1 req/sec with exponential backoff',
        antiBotBypassAllowed: false
      },
      targetManifest,
      identityExtractionCapabilities: {
        brand: true,
        model: true,
        variantCapacity: true,
        seller: true,
        price: true,
        stock: true,
        shipping: true
      },
      shadowIngestionPlan: {
        retailerId: 'hepsiburada',
        maxCatalogRootsCount: 10,
        targetCatalogRoots: FROZEN_10_TARGET_ROOT_IDS,
        listingsPerRootRange: '1-3 verified listings per root',
        allowedCondition: 'NEW',
        allowedCurrency: 'TRY',
        initialPublicationStatus: 'LEGACY_SHADOW',
        publicQueryReachability: 0
      }
    };
  }
}
