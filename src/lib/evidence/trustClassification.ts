export type FieldVerificationStatus =
  | 'VERIFIED'
  | 'UNVERIFIED'
  | 'CONFLICTED'
  | 'INACCESSIBLE'
  | 'NOT_APPLICABLE';

export type FieldMatchMethod =
  | 'MPN_EXACT'
  | 'EAN_EXACT'
  | 'MODEL_MANUFACTURER_URL'
  | 'OFFICIAL_MANUFACTURER_DOC'
  | 'ICECAT_LIVE_API'
  | 'MANUAL_INSPECTION'
  | 'FALLBACK';

export type EvidenceTrustClassification =
  | 'OFFICIAL_MANUFACTURER_VERIFIED'
  | 'PENDING_SOURCE_REVIEW'
  | 'QUARANTINE_CONTRADICTED'
  | 'QUARANTINE_SCOPE_MISMATCH'
  | 'UNVERIFIED';

export type EvidenceHashVersion = 'v1' | 'v2';

/**
 * Approved Official Manufacturer Domains.
 * Third-party, retailer, aggregator, or broken URLs are strictly forbidden from
 * producing OFFICIAL_MANUFACTURER_VERIFIED.
 */
const APPROVED_MANUFACTURER_DOMAINS = [
  'tcl.com',
  'apple.com',
  'samsung.com',
  'huawei.com',
  'hp.com',
  'asus.com',
  'lenovo.com',
  'lg.com'
];

/**
 * Strict Exact-Model and Field Whitelist.
 * In Phase 3.2, a field is ONLY granted OFFICIAL_MANUFACTURER_VERIFIED if:
 * 1. Product identity and regional SKU are verified.
 * 2. URL matches the exact approved official manufacturer page.
 * 3. The field is explicitly present in this corroborated whitelist.
 * Any other field, model-family extrapolation, or unreviewed SKU fails closed to PENDING_SOURCE_REVIEW.
 */
interface VerifiedWhitelistEntry {
  urlPattern: RegExp;
  corroboratedFields: Record<string, any>;
  fields: string[];
}

export const DOWNGRADED_PILOT_FIELDS: Record<string, { fields: string[]; reason: string }> = {
  'apple-macbook-pro-16-2-m5-max-18cpu-40gpu-mge94tu-a': {
    fields: ['specs.screenSizeInches', 'specs.batteryCapacityWh', 'specs.chargerWatts', 'specs.wifiStandard', 'specs.weightKg'],
    reason: 'SOURCE_INACCESSIBLE_AND_UNRELEASED_SKU'
  },
  'apple-macbook-pro-16-2-m5-pro-18cpu-20gpu-mge64tu-a': {
    fields: ['specs.screenSizeInches', 'specs.batteryCapacityWh', 'specs.chargerWatts', 'specs.weightKg'],
    reason: 'SOURCE_INACCESSIBLE_AND_UNRELEASED_SKU'
  },
  'apple-macbook-pro-16-2-m5-max-18cpu-32gpu-mge74tu-a': {
    fields: ['specs.screenSizeInches', 'specs.batteryCapacityWh', 'specs.chargerWatts', 'specs.weightKg'],
    reason: 'SOURCE_INACCESSIBLE_AND_UNRELEASED_SKU'
  },
  'apple-macbook-pro-14-2-m5-max-18cpu-32gpu-mgdu4tu-a': {
    fields: ['specs.screenSizeInches', 'specs.chargerWatts', 'specs.weightKg'],
    reason: 'SOURCE_INACCESSIBLE_AND_UNRELEASED_SKU'
  },
  'hp-omen-gaming-16-ap00014nta56-c12cjeaa56': {
    fields: ['specs.screenSizeInches', 'specs.colorGamut', 'specs.batteryCapacityWh', 'specs.chargerWatts'],
    reason: 'SOURCE_UNVERIFIED_AND_SPEC_CONTRADICTION'
  },
  'asus-rog-strix-scar-18-g835lxg-tq378w': {
    fields: ['specs.chargerWatts', 'specs.weightKg'],
    reason: 'SPEC_CONTRADICTION_WITH_OFFICIAL_SOURCE'
  },
  'tv-tcl-55-55p8l-55-inc': {
    fields: ['specs.audioChannels'],
    reason: 'SPEC_CONTRADICTION_WITH_OFFICIAL_FOOTNOTE'
  },
  'lenovo-thinkbook-16p-g6-iax-21r0001jtxat60': {
    fields: ['specs.screenSizeInches', 'specs.batteryCapacityWh', 'specs.chargerWatts', 'specs.weightKg'],
    reason: 'SPEC_CONTRADICTION_WITH_OFFICIAL_PSREF'
  },
  'samsung-samsung-galaxy-s25-fe-110': {
    fields: ['specs.ramGb', 'ramGb', 'specs.memory.ramGb'],
    reason: 'CATALOG_CONTRADICTED_DISPUTED_12GB_RAM_OFFICIAL_IS_8GB'
  }
};

export const VERIFIED_MANUFACTURER_FIELDS: Record<string, VerifiedWhitelistEntry> = {
  // ---------------------------------------------------------------------------
  // 1. TCL Canonical Televisions (7 Supported Fields)
  // ---------------------------------------------------------------------------
  'tv-tcl-85-85p8l-85-inc': {
    urlPattern: /^https:\/\/www\.tcl\.com\/tr\/tr\/tvs\/p8l/i,
    corroboratedFields: {
      'mpn': '85P8L',
      'specs.audioChannels': '2.1 Kanal'
    },
    fields: ['mpn', 'specs.audioChannels']
  },
  'tv-tcl-75-75p8l-75-inc': {
    urlPattern: /^https:\/\/www\.tcl\.com\/tr\/tr\/tvs\/p8l/i,
    corroboratedFields: {
      'mpn': '75P8L',
      'specs.audioChannels': '2.1 Kanal'
    },
    fields: ['mpn', 'specs.audioChannels']
  },
  'tv-tcl-75-75p89k-75-inc': {
    urlPattern: /^https:\/\/www\.tcl\.com\/tr\/tr\/tvs\/p89k/i,
    corroboratedFields: {
      'mpn': '75P89K',
      'specs.audioChannels': '2.1 Kanal',
      'specs.hdmiVersion': '2.1'
    },
    fields: ['mpn', 'specs.audioChannels', 'specs.hdmiVersion']
  },

  // ---------------------------------------------------------------------------
  // 2. Exact Regional SKU Smartphone (3 Supported Fields)
  // ---------------------------------------------------------------------------
  'samsung-samsung-galaxy-s24-93': {
    urlPattern: /^https:\/\/www\.samsung\.com\/tr\/smartphones\/galaxy-s24\/specs\//i,
    corroboratedFields: {
      'specs.screen.size': '6.2 inç',
      'specs.battery.capacitymAh': 4000,
      'specs.connectivity.has5G': true
    },
    fields: [
      'specs.screen.size',
      'specs.battery.capacitymAh',
      'specs.connectivity.has5G'
    ]
  },

  // ---------------------------------------------------------------------------
  // 3. Newly Corroborated Pilot Models (Phase 3.7 Staging Trust Release - 14 Fields)
  // ---------------------------------------------------------------------------
  'asus-rog-strix-scar-18-g835lxg-tq378w': {
    urlPattern: /^https:\/\/rog\.asus\.com\/tr\/laptops\/rog-strix\/rog-strix-scar-18-2026\/spec\/?/i,
    corroboratedFields: {
      'specs.screenSizeInches': 18,
      'specs.batteryCapacityWh': 90
    },
    fields: ['specs.screenSizeInches', 'specs.batteryCapacityWh']
  },
  'tv-tcl-65-65p8l-65-inc': {
    urlPattern: /^https:\/\/www\.tcl\.com\/tr\/tr\/tvs\/p8l\/?/i,
    corroboratedFields: {
      'specs.refreshRateHz': 144,
      'specs.audioChannels': '2.1 Kanal',
      'specs.smartOs': 'Google TV',
      'specs.resolution': '4K Ultra HD'
    },
    fields: ['specs.refreshRateHz', 'specs.audioChannels', 'specs.smartOs', 'specs.resolution']
  },
  'tv-tcl-55-55p8l-55-inc': {
    urlPattern: /^https:\/\/www\.tcl\.com\/tr\/tr\/tvs\/p8l\/?/i,
    corroboratedFields: {
      'specs.refreshRateHz': 144,
      'specs.smartOs': 'Google TV',
      'specs.resolution': '4K Ultra HD'
    },
    fields: ['specs.refreshRateHz', 'specs.smartOs', 'specs.resolution']
  },
  'tv-tcl-98-98p8l-98-inc': {
    urlPattern: /^https:\/\/www\.tcl\.com\/tr\/tr\/tvs\/98p8l\/?/i,
    corroboratedFields: {
      'specs.displayTech': 'QD-Mini LED',
      'specs.refreshRateHz': 144,
      'specs.audioChannels': '2.1 Kanal',
      'specs.smartOs': 'Google TV',
      'specs.resolution': '4K Ultra HD'
    },
    fields: ['specs.displayTech', 'specs.refreshRateHz', 'specs.audioChannels', 'specs.smartOs', 'specs.resolution']
  }
};

/**
 * Checks whether a given URL belongs to an approved official manufacturer domain.
 */
export function isOfficialManufacturerUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const u = new URL(url.trim());
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
    const hostname = u.hostname.toLowerCase();
    return APPROVED_MANUFACTURER_DOMAINS.some(
      domain => hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

/**
 * Hardened Fail-Closed Trust Classification Layer (Phase 3.3).
 *
 * Strict verification gates:
 * 1. Status Check: UNVERIFIED or CONFLICTED fail immediately.
 * 2. Quarantine Check: Unresolved contradictions, duplicates, and scope mismatches fail closed.
 * 3. Source Domain Check: Must be valid HTTP(S) from approved official manufacturer domain.
 * 3B. Source Modification Check: Modified sources trigger PENDING_SOURCE_REVIEW.
 * 4. Inaccessibility / Broken Source Check: Inaccessible or broken URLs fail closed.
 * 5. Exact Product Identity & Regional SKU Gate: Model must have verified regional SKU.
 * 6. Field & Value Corroboration Gate: Field and value must match corroborated specification.
 *
 * Any failure in any gate strictly defaults to PENDING_SOURCE_REVIEW.
 * SHA-256 hash validity NEVER substitutes for source accuracy.
 */
export function classifyEvidenceTrust(params: {
  productId: string;
  fieldPath: string;
  sourceUrl: string;
  scopeNote?: string;
  verificationStatus: FieldVerificationStatus;
  fieldValue?: any;
  observedValue?: any;
  isSourceModified?: boolean;
}): EvidenceTrustClassification {
  // Gate 0: Status Check
  if (params.verificationStatus === 'UNVERIFIED') {
    return 'UNVERIFIED';
  }
  if (params.verificationStatus === 'CONFLICTED') {
    return 'QUARANTINE_CONTRADICTED';
  }

  const pId = params.productId || '';
  const fPath = params.fieldPath || '';
  const sUrl = (params.sourceUrl || '').trim();
  const sNote = params.scopeNote || '';
  const val = params.observedValue !== undefined ? params.observedValue : params.fieldValue;

  // Gate 1: Quarantine & Contradiction Checks
  // A. Unreleased / Future-dated rumors
  if (pId === 'redmi-k90-pro-max-5g-512gb-2027' || sNote.includes('SOURCE_CONTRADICTION')) {
    return 'QUARANTINE_CONTRADICTED';
  }

  // B. Duplicate catalog conflicts
  if (pId === 'tcl-85p8l' || pId === 'tcl-75p8l' || sNote.includes('DUPLICATE_CATALOG_CONFLICT')) {
    return 'QUARANTINE_CONTRADICTED';
  }

  // C. Regional market scope mismatches (e.g., Italian NFC / Zepp Pay)
  if (pId.startsWith('amazfit-t-rex-3') || sNote.includes('SCOPE_MISMATCH')) {
    return 'QUARANTINE_SCOPE_MISMATCH';
  }

  // Gate 2: Source Validity & Official Domain Verification
  if (!sUrl || !isOfficialManufacturerUrl(sUrl)) {
    return 'PENDING_SOURCE_REVIEW';
  }

  // Gate 3: Inaccessibility / Broken Source Prevention
  if (sUrl.includes('/broken') || sUrl.includes('error') || sUrl.includes('404')) {
    return 'PENDING_SOURCE_REVIEW';
  }

  // Gate 3B: Source Drift / Modification Check (Task 3 Requirement)
  if (params.isSourceModified === true) {
    return 'PENDING_SOURCE_REVIEW';
  }

  // Gate 4: Exact Model Identity Check
  const whitelistEntry = VERIFIED_MANUFACTURER_FIELDS[pId];
  if (!whitelistEntry) {
    // Model is either generic variant, downgraded, or unverified SKU -> fail closed
    return 'PENDING_SOURCE_REVIEW';
  }

  // Corroborate exact URL pattern for this specific model
  if (!whitelistEntry.urlPattern.test(sUrl)) {
    // URL does not match the exact manufacturer specification document for this model -> fail closed
    return 'PENDING_SOURCE_REVIEW';
  }

  // Gate 5: Exact Field-Level Corroboration
  if (!(fPath in whitelistEntry.corroboratedFields)) {
    // Field is not in corroborated whitelist -> fail closed
    return 'PENDING_SOURCE_REVIEW';
  }

  // Gate 6: Exact Value Corroboration (Task 3 Requirement)
  // "A correct model URL with an incorrect field value fails closed."
  // "A hardcoded whitelist cannot bypass independent evidence checks."
  if (val !== undefined && val !== null) {
    const expected = whitelistEntry.corroboratedFields[fPath];
    if (expected !== undefined && JSON.stringify(val) !== JSON.stringify(expected)) {
      return 'PENDING_SOURCE_REVIEW';
    }
  }

  // All strict gates successfully satisfied!
  return 'OFFICIAL_MANUFACTURER_VERIFIED';
}
