/**
 * ASTERION ICECAT PHASE 4.5 — HIERARCHICAL PRODUCT IDENTITY & VERIFICATION POLICY
 *
 * Defines the 3-Level Product Identity Architecture and Field-Specific Verification Requirements.
 * Resolves the flat "retail SKU required for all specs" bottleneck by establishing clear,
 * mathematically sound proof boundaries without guessing or fabricating retail SKUs.
 */

export enum IdentityLevel {
  LEVEL_1_MODEL_FAMILY = 'LEVEL_1_MODEL_FAMILY',
  LEVEL_2_HARDWARE_VARIANT = 'LEVEL_2_HARDWARE_VARIANT',
  LEVEL_3_RETAIL_SKU = 'LEVEL_3_RETAIL_SKU'
}

export interface ModelFamilyIdentity {
  level: IdentityLevel.LEVEL_1_MODEL_FAMILY;
  manufacturer: string;
  productFamily: string;
  generation: string;
  publicModelIdentity: string;
}

export interface HardwareVariantIdentity {
  level: IdentityLevel.LEVEL_2_HARDWARE_VARIANT;
  manufacturer: string;
  productFamily: string;
  manufacturerModelNumber: string; // e.g. A3296, SM-S921B/DS
  regionalHardwareIdentifier: string; // e.g. TR/EU Global, Sub-6 GHz, Dual SIM
  ramConfig?: string | number;
  storageConfig?: string | number;
  processorVariant?: string; // e.g. Exynos 2400 vs Snapdragon 8 Gen 3
  documentedTechnicalDifferences: string[];
}

export interface RetailSkuIdentity {
  level: IdentityLevel.LEVEL_3_RETAIL_SKU;
  manufacturer: string;
  productFamily: string;
  regionalMPN: string; // e.g. SM-S921BZKDTUR, MYWW3TU/A, QE77S95HATXTK, MGE64TU/A
  commercialColor: string; // e.g. Onyx Black, Space Black, Desert Titanium
  commercialCapacity: string; // e.g. 256 GB, 1 TB
  eanOrGtin?: string;
  retailOfferIdentity?: {
    merchant: string;
    price: number;
    currency: string;
  };
}

export type ProductIdentity =
  | ModelFamilyIdentity
  | HardwareVariantIdentity
  | RetailSkuIdentity;

/**
 * Minimum Required Identity Level for Technical Fields.
 */
export const FIELD_IDENTITY_REQUIREMENTS: Record<string, {
  minLevel: IdentityLevel;
  allowFamilyIfUniform: boolean;
  rationale: string;
}> = {
  // --- DISPLAY ATTRIBUTES (Level 1: Uniform across model family) ---
  'specs.screenSizeInches': {
    minLevel: IdentityLevel.LEVEL_1_MODEL_FAMILY,
    allowFamilyIfUniform: true,
    rationale: 'Screen physical diagonal is uniform across all color and storage variants of a model family.'
  },
  'specs.screenSize': {
    minLevel: IdentityLevel.LEVEL_1_MODEL_FAMILY,
    allowFamilyIfUniform: true,
    rationale: 'Display size is uniform across model family.'
  },
  'specs.panelType': {
    minLevel: IdentityLevel.LEVEL_1_MODEL_FAMILY,
    allowFamilyIfUniform: true,
    rationale: 'OLED / AMOLED / IPS panel architecture is uniform across model family.'
  },
  'specs.displayTechnology': {
    minLevel: IdentityLevel.LEVEL_1_MODEL_FAMILY,
    allowFamilyIfUniform: true,
    rationale: 'Display tech is uniform across model family.'
  },
  'specs.refreshRateHz': {
    minLevel: IdentityLevel.LEVEL_1_MODEL_FAMILY,
    allowFamilyIfUniform: true,
    rationale: 'Display refresh rate (e.g. 120Hz Promotion) is architectural and family-uniform.'
  },
  'specs.refreshRate': {
    minLevel: IdentityLevel.LEVEL_1_MODEL_FAMILY,
    allowFamilyIfUniform: true,
    rationale: 'Display refresh rate is uniform across model family.'
  },
  'specs.resolution': {
    minLevel: IdentityLevel.LEVEL_1_MODEL_FAMILY,
    allowFamilyIfUniform: true,
    rationale: 'Native pixel resolution is architectural and uniform across model family.'
  },
  'specs.aspectRatio': {
    minLevel: IdentityLevel.LEVEL_1_MODEL_FAMILY,
    allowFamilyIfUniform: true,
    rationale: 'Display aspect ratio is uniform across model family.'
  },
  'specs.pixelDensityPpi': {
    minLevel: IdentityLevel.LEVEL_1_MODEL_FAMILY,
    allowFamilyIfUniform: true,
    rationale: 'Pixel density is fixed for physical panel dimensions across model family.'
  },

  // --- CAMERA ATTRIBUTES (Level 1: Base family sensor architecture) ---
  'specs.cameraFeatures': {
    minLevel: IdentityLevel.LEVEL_1_MODEL_FAMILY,
    allowFamilyIfUniform: true,
    rationale: 'Camera module layout and optical sensor types are uniform across family.'
  },
  'specs.mainCameraMp': {
    minLevel: IdentityLevel.LEVEL_1_MODEL_FAMILY,
    allowFamilyIfUniform: true,
    rationale: 'Main camera megapixel resolution is uniform across model family.'
  },
  'specs.videoResolutionMax': {
    minLevel: IdentityLevel.LEVEL_1_MODEL_FAMILY,
    allowFamilyIfUniform: true,
    rationale: 'Max video capture resolution is uniform across model family.'
  },

  // --- PROCESSOR & CHIPSET (Level 2: Region/Hardware Variant Dependent) ---
  'specs.cpu': {
    minLevel: IdentityLevel.LEVEL_2_HARDWARE_VARIANT,
    allowFamilyIfUniform: false,
    rationale: 'Chipset may differ by region (e.g. Exynos 2400 for TR vs Snapdragon 8 Gen 3 for US). Requires Level 2 regional model proof.'
  },
  'specs.chipset': {
    minLevel: IdentityLevel.LEVEL_2_HARDWARE_VARIANT,
    allowFamilyIfUniform: false,
    rationale: 'Chipset requires hardware/regional variant confirmation.'
  },
  'specs.gpu': {
    minLevel: IdentityLevel.LEVEL_2_HARDWARE_VARIANT,
    allowFamilyIfUniform: false,
    rationale: 'GPU is bound to chipset architecture / hardware core configuration.'
  },

  // --- MEMORY & STORAGE (Level 2: Configuration Tier Dependent) ---
  'specs.ram': {
    minLevel: IdentityLevel.LEVEL_2_HARDWARE_VARIANT,
    allowFamilyIfUniform: false,
    rationale: 'RAM capacity depends on specific configuration tier. Cannot extrapolate from family.'
  },
  'specs.ramGb': {
    minLevel: IdentityLevel.LEVEL_2_HARDWARE_VARIANT,
    allowFamilyIfUniform: false,
    rationale: 'RAM capacity requires configuration-specific proof.'
  },
  'specs.storage': {
    minLevel: IdentityLevel.LEVEL_2_HARDWARE_VARIANT,
    allowFamilyIfUniform: false,
    rationale: 'Internal storage capacity varies across tiers (128GB, 256GB, 512GB, 1TB). Requires Level 2 proof.'
  },
  'specs.storageGb': {
    minLevel: IdentityLevel.LEVEL_2_HARDWARE_VARIANT,
    allowFamilyIfUniform: false,
    rationale: 'Internal storage tier requires Level 2 proof.'
  },

  // --- CONNECTIVITY & NETWORKING (Level 2: Regional Variant Dependent) ---
  'specs.simType': {
    minLevel: IdentityLevel.LEVEL_2_HARDWARE_VARIANT,
    allowFamilyIfUniform: false,
    rationale: 'SIM configuration (dual physical nano-SIM vs eSIM only) varies regionally.'
  },
  'specs.cellularBands': {
    minLevel: IdentityLevel.LEVEL_2_HARDWARE_VARIANT,
    allowFamilyIfUniform: false,
    rationale: 'Cellular LTE/5G frequency bands depend on regional hardware model (e.g. A3296 vs A3106).'
  },
  'specs.wifiStandard': {
    minLevel: IdentityLevel.LEVEL_1_MODEL_FAMILY,
    allowFamilyIfUniform: true,
    rationale: 'Wi-Fi capability is uniform across model family silicon.'
  },

  // --- BATTERY & CHARGING (Level 2 / Level 1) ---
  'specs.batteryCapacityMah': {
    minLevel: IdentityLevel.LEVEL_1_MODEL_FAMILY,
    allowFamilyIfUniform: true,
    rationale: 'Internal battery cell capacity is uniform for a given chassis/screen size.'
  },
  'specs.chargerWatts': {
    minLevel: IdentityLevel.LEVEL_2_HARDWARE_VARIANT,
    allowFamilyIfUniform: false,
    rationale: 'Charger wattage may depend on specific bundled SKU or regional configuration.'
  },
  'specs.weightKg': {
    minLevel: IdentityLevel.LEVEL_2_HARDWARE_VARIANT,
    allowFamilyIfUniform: false,
    rationale: 'Weight can vary slightly by finish/material or configuration.'
  },

  // --- RETAIL SKU ATTRIBUTES (Level 3: Exact Commercial Sellable SKU) ---
  'color': {
    minLevel: IdentityLevel.LEVEL_3_RETAIL_SKU,
    allowFamilyIfUniform: false,
    rationale: 'Color is an exact commercial retail variant attribute. Requires Level 3 SKU proof.'
  },
  'colorOptions': {
    minLevel: IdentityLevel.LEVEL_3_RETAIL_SKU,
    allowFamilyIfUniform: false,
    rationale: 'Specific retail color requires Level 3 SKU proof.'
  },
  'regionalMPN': {
    minLevel: IdentityLevel.LEVEL_3_RETAIL_SKU,
    allowFamilyIfUniform: false,
    rationale: 'Regional MPN is the Level 3 SKU itself.'
  },
  'ean': {
    minLevel: IdentityLevel.LEVEL_3_RETAIL_SKU,
    allowFamilyIfUniform: false,
    rationale: 'EAN/GTIN is unique to retail SKU.'
  },
  'gtin': {
    minLevel: IdentityLevel.LEVEL_3_RETAIL_SKU,
    allowFamilyIfUniform: false,
    rationale: 'GTIN is unique to retail packaging.'
  },
  'basePrice': {
    minLevel: IdentityLevel.LEVEL_3_RETAIL_SKU,
    allowFamilyIfUniform: false,
    rationale: 'Price offer is legally and commercially bound to a specific sellable SKU.'
  },
  'storeOffers': {
    minLevel: IdentityLevel.LEVEL_3_RETAIL_SKU,
    allowFamilyIfUniform: false,
    rationale: 'Store offers must bind to a sellable SKU.'
  }
};

/**
 * Evaluates whether evidence at a given identity level satisfies the proof requirement for a specific field.
 */
export function evaluateFieldProofEligibility(
  fieldPath: string,
  providedEvidenceLevel: IdentityLevel,
  isDocumentedFamilyUniform: boolean = true
): {
  isEligible: boolean;
  requiredLevel: IdentityLevel;
  verdict: 'SATISFIED' | 'INSUFFICIENT_LEVEL' | 'UNIFORMITY_VIOLATION' | 'UNKNOWN_FIELD';
  rationale: string;
} {
  const req = FIELD_IDENTITY_REQUIREMENTS[fieldPath];
  if (!req) {
    // If not explicitly mapped, fail closed to LEVEL_2_HARDWARE_VARIANT
    const isEligible = providedEvidenceLevel === IdentityLevel.LEVEL_2_HARDWARE_VARIANT ||
                       providedEvidenceLevel === IdentityLevel.LEVEL_3_RETAIL_SKU;
    return {
      isEligible,
      requiredLevel: IdentityLevel.LEVEL_2_HARDWARE_VARIANT,
      verdict: isEligible ? 'SATISFIED' : 'INSUFFICIENT_LEVEL',
      rationale: 'Unmapped field defaults to LEVEL_2_HARDWARE_VARIANT verification requirement.'
    };
  }

  // Check hierarchy: LEVEL_3 satisfies LEVEL_2 and LEVEL_1.
  // LEVEL_2 satisfies LEVEL_2 and LEVEL_1.
  // LEVEL_1 only satisfies LEVEL_1 (and only if family-uniform).
  if (req.minLevel === IdentityLevel.LEVEL_1_MODEL_FAMILY) {
    if (providedEvidenceLevel === IdentityLevel.LEVEL_1_MODEL_FAMILY) {
      if (!req.allowFamilyIfUniform || !isDocumentedFamilyUniform) {
        return {
          isEligible: false,
          requiredLevel: req.minLevel,
          verdict: 'UNIFORMITY_VIOLATION',
          rationale: `Field ${fieldPath} has documented configuration differences; Level 1 evidence is insufficient.`
        };
      }
      return {
        isEligible: true,
        requiredLevel: req.minLevel,
        verdict: 'SATISFIED',
        rationale: req.rationale
      };
    }
    // Provided Level 2 or Level 3
    return {
      isEligible: true,
      requiredLevel: req.minLevel,
      verdict: 'SATISFIED',
      rationale: req.rationale
    };
  }

  if (req.minLevel === IdentityLevel.LEVEL_2_HARDWARE_VARIANT) {
    if (providedEvidenceLevel === IdentityLevel.LEVEL_1_MODEL_FAMILY) {
      return {
        isEligible: false,
        requiredLevel: req.minLevel,
        verdict: 'INSUFFICIENT_LEVEL',
        rationale: `Field ${fieldPath} requires LEVEL_2_HARDWARE_VARIANT evidence; Level 1 model family evidence is insufficient.`
      };
    }
    return {
      isEligible: true,
      requiredLevel: req.minLevel,
      verdict: 'SATISFIED',
      rationale: req.rationale
    };
  }

  if (req.minLevel === IdentityLevel.LEVEL_3_RETAIL_SKU) {
    if (providedEvidenceLevel !== IdentityLevel.LEVEL_3_RETAIL_SKU) {
      return {
        isEligible: false,
        requiredLevel: req.minLevel,
        verdict: 'INSUFFICIENT_LEVEL',
        rationale: `Field ${fieldPath} strictly requires LEVEL_3_RETAIL_SKU evidence (e.g. exact commercial SKU/color/price).`
      };
    }
    return {
      isEligible: true,
      requiredLevel: req.minLevel,
      verdict: 'SATISFIED',
      rationale: req.rationale
    };
  }

  return {
    isEligible: false,
    requiredLevel: req.minLevel,
    verdict: 'INSUFFICIENT_LEVEL',
    rationale: 'Unmet identity criteria.'
  };
}

/**
 * Hardware Identity Binding Architecture (Asterion Master-01)
 *
 * Separates stable internal product catalog IDs (which cannot be mutated due to
 * price offer linkages, consumer URLs, and foreign key integrity) from verified
 * manufacturer hardware identities (model numbers, MPNs, and connectivity tiers).
 */

export interface ProductHardwareIdentityBinding {
  internalProductId: string;
  publicCanonicalSlug?: string;
  publicTitle: string;
  manufacturer: string;
  productFamily: string;
  hardwareModelCode: string; // e.g. "SM-X520"
  regionalMPN: string; // e.g. "SM-X520NZAPTUR"
  connectivityType: 'WIFI_ONLY' | 'CELLULAR_5G' | 'CELLULAR_LTE';
  ramConfig: string | number;
  storageConfig: string | number;
  identityLevel: IdentityLevel;
  officialSourceUrl: string;
  bindingStatus: 'VERIFIED_HARDWARE_BOUND' | 'PENDING_REVIEW';
}

export const PRODUCT_HARDWARE_IDENTITY_BINDINGS: Record<string, ProductHardwareIdentityBinding> = {
  'samsung-galaxy-tab-s10-fe-wi-fi-sm-x526': {
    internalProductId: 'samsung-galaxy-tab-s10-fe-wi-fi-sm-x526',
    publicCanonicalSlug: 'samsung-galaxy-tab-s10-fe-wi-fi-12gb-256gb',
    publicTitle: 'Samsung Galaxy Tab S10 FE Wi-Fi (SM-X520NZAPTUR) 12 GB / 256 GB',
    manufacturer: 'Samsung',
    productFamily: 'Galaxy Tab S10 FE',
    hardwareModelCode: 'SM-X520',
    regionalMPN: 'SM-X520NZAPTUR',
    connectivityType: 'WIFI_ONLY',
    ramConfig: 12,
    storageConfig: 256,
    identityLevel: IdentityLevel.LEVEL_2_HARDWARE_VARIANT,
    officialSourceUrl: 'https://www.samsung.com/tr/tablets/galaxy-tab-s10-fe/',
    bindingStatus: 'VERIFIED_HARDWARE_BOUND'
  },
  'samsung-galaxy-tab-s10-fe-2': {
    internalProductId: 'samsung-galaxy-tab-s10-fe-2',
    publicCanonicalSlug: 'samsung-galaxy-tab-s10-fe-2',
    publicTitle: 'Samsung Galaxy Tab S10 FE 5G 8 GB / 128 GB / 5G',
    manufacturer: 'Samsung',
    productFamily: 'Galaxy Tab S10 FE 5G',
    hardwareModelCode: 'SM-X526',
    regionalMPN: 'SM-X526BZADTUK',
    connectivityType: 'CELLULAR_5G',
    ramConfig: 8,
    storageConfig: 128,
    identityLevel: IdentityLevel.LEVEL_2_HARDWARE_VARIANT,
    officialSourceUrl: 'https://www.samsung.com/tr/tablets/galaxy-tab-s10-fe/',
    bindingStatus: 'VERIFIED_HARDWARE_BOUND'
  }
};

/**
 * Resolves the verified hardware identity for an internal product ID.
 * Decouples internal database key/slug tokens from verified manufacturer hardware models.
 */
export function getHardwareIdentityBinding(productId: string): ProductHardwareIdentityBinding | undefined {
  return PRODUCT_HARDWARE_IDENTITY_BINDINGS[productId];
}

/**
 * Evaluates whether an evidence source model matches the verified hardware identity of a catalog product.
 * Uses the hardware identity binding layer instead of raw legacy ID string matching.
 */
export function validateProductHardwareSku(
  catalogProduct: { id: string; name?: string; specs?: any },
  sourceModelCode: string
): { isValid: boolean; reason?: string } {
  const binding = getHardwareIdentityBinding(catalogProduct.id);
  
  // If an explicit verified hardware identity binding exists, validate against it
  if (binding) {
    if (binding.connectivityType === 'WIFI_ONLY' && sourceModelCode.includes('SM-X526')) {
      return { isValid: false, reason: 'REJECT_5G_SOURCE_FOR_WIFI_PRODUCT: SM-X526 (5G) source cannot verify Wi-Fi only tablet' };
    }
    if (binding.connectivityType === 'CELLULAR_5G' && sourceModelCode.includes('SM-X520')) {
      return { isValid: false, reason: 'REJECT_WIFI_SOURCE_FOR_5G_PRODUCT: SM-X520 (Wi-Fi) source cannot verify 5G cellular tablet' };
    }
    // Verify source model code matches bound hardware model
    if (sourceModelCode.includes(binding.hardwareModelCode)) {
      return { isValid: true };
    }
  }

  // Fallback to catalog attributes inspection
  const isWifiOnly = catalogProduct.specs?.cellularSupport === 'Wi-Fi Only' || catalogProduct.name?.includes('Wi-Fi');
  const is5G = catalogProduct.specs?.cellularSupport?.includes('5G') || catalogProduct.name?.includes('5G');
  
  if (isWifiOnly && sourceModelCode.includes('SM-X526')) {
    return { isValid: false, reason: 'REJECT_5G_SOURCE_FOR_WIFI_PRODUCT: SM-X526 (5G) source cannot verify Wi-Fi only tablet' };
  }
  if (is5G && sourceModelCode.includes('SM-X520')) {
    return { isValid: false, reason: 'REJECT_WIFI_SOURCE_FOR_5G_PRODUCT: SM-X520 (Wi-Fi) source cannot verify 5G cellular tablet' };
  }
  
  // If unbound and contains contradiction, fail closed
  if (!binding && catalogProduct.id.includes('sm-x526') && isWifiOnly) {
    return { isValid: false, reason: 'REJECT_INTERNAL_SKU_CONTRADICTION: Catalog slug implies SM-X526 but product claims Wi-Fi Only' };
  }

  return { isValid: true };
}
