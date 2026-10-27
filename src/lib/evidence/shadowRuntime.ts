/**
 * ASTERION PHASE 3.5 — RUNTIME TRUST INTEGRATION (SHADOW MODE)
 * 
 * Safe, read-only shadow evaluation engine for evidence trust classification.
 * Evaluates live evidence against the Phase 3.4 hardened source accuracy gate
 * side-by-side with active legacy classification.
 * 
 * STRICT IMMUTABLE SAFETY RULES:
 * 1. Zero Price Mutation: Pricing data is never read or mutated by shadow mode.
 * 2. Zero Catalog Mutation: Product specs and catalog records remain unmodified.
 * 3. Zero User View Mutation: Active UI badges strictly depend on gateTrust.
 * 4. Zero False Verified Publication: Shadow decisions are never published to UI or production.
 * 5. Quarantine Precedence: Quarantined entities are unconditionally intercepted first.
 */

import {
  classifyEvidenceTrust,
  VERIFIED_MANUFACTURER_FIELDS,
  EvidenceTrustClassification,
  FieldVerificationStatus,
  isOfficialManufacturerUrl
} from './trustClassification';

export interface ShadowEvaluationInput {
  productId: string;
  fieldPath: string;
  sourceUrl: string;
  scopeNote?: string;
  verificationStatus: FieldVerificationStatus;
  observedValue?: any;
  fieldValue?: any;
  isSourceModified?: boolean;
  httpStatus?: number;
  robotsAllowed?: boolean;
  networkError?: string | null;
  rawBodySha256?: string;
  expectedModel?: string;
  expectedRegion?: string;
  now?: number;
}

export interface ShadowEvaluationResult {
  productId: string;
  fieldPath: string;
  activeClassification: EvidenceTrustClassification;
  shadowClassification: EvidenceTrustClassification;
  hasDifference: boolean;
  shadowReason: string;
  sourceDriftStatus: 'UNCHANGED' | 'HTML_OR_NONTECHNICAL_CHANGE' | 'TECHNICAL_CHANGE_REVIEW_REQUIRED' | 'UNCLASSIFIED_CONTENT_CHANGE_REVIEW_REQUIRED' | 'NETWORK_ERROR_OR_BLOCKED' | 'NOT_EVALUATED_OFFLINE';
  networkError: string | null;
  isTechnicalValueConflict: boolean;
  isPublished: boolean; // Always false in shadow mode
  latencyMs: number;
  evaluatedAt: string;
}

export interface ShadowTelemetrySummary {
  totalFieldsExamined: number;
  identicalDecisionsCount: number;
  differentDecisionsCount: number;
  activeVerifiedCount: number;
  shadowVerifiedCount: number;
  activePendingCount: number;
  shadowPendingCount: number;
  quarantinePreservedCount: number;
  falseVerifiedBlockedCount: number;
  technicalValueConflictsCount: number;
  sourceAccessIssuesCount: number;
  averageLatencyMs: number;
  runtimeExceptionsCount: number;
}

/**
 * Corroborated Wave 1 facts from Phase 3.4 official manufacturer source captures.
 * (ASUS G835LXG-TQ378W, TCL 65P8L, TCL 55P8L, TCL 98P8L)
 */
export const SHADOW_WAVE1_CORROBORATED_FACTS: Record<string, {
  model: string;
  url: string;
  fields: Record<string, any>;
}> = {
  'asus-rog-strix-scar-18-g835lxg-tq378w': {
    model: 'G835LXG-TQ378W',
    url: 'https://rog.asus.com/tr/laptops/rog-strix/rog-strix-scar-18-2026/spec/',
    fields: {
      'specs.screenSizeInches': 18,
      'specs.batteryCapacityWh': 90
    }
  },
  'tv-tcl-65-65p8l-65-inc': {
    model: '65P8L',
    url: 'https://www.tcl.com/tr/tr/tvs/p8l',
    fields: {
      'specs.refreshRateHz': 144,
      'specs.audioChannels': '2.1 Kanal',
      'specs.smartOs': 'Google TV',
      'specs.resolution': '4K Ultra HD'
    }
  },
  'tv-tcl-55-55p8l-55-inc': {
    model: '55P8L',
    url: 'https://www.tcl.com/tr/tr/tvs/p8l',
    fields: {
      'specs.refreshRateHz': 144,
      'specs.smartOs': 'Google TV',
      'specs.resolution': '4K Ultra HD'
    }
  },
  'tv-tcl-98-98p8l-98-inc': {
    model: '98P8L',
    url: 'https://www.tcl.com/tr/tr/tvs/98p8l',
    fields: {
      'specs.displayTech': 'QD-Mini LED',
      'specs.refreshRateHz': 144,
      'specs.audioChannels': '2.1 Kanal',
      'specs.smartOs': 'Google TV',
      'specs.resolution': '4K Ultra HD'
    }
  }
};

/**
 * Known empirical technical value conflicts identified during source audits.
 * Kept in separate review queue, never promoted to VERIFIED.
 */
export const SHADOW_TECHNICAL_VALUE_CONFLICTS: Record<string, Record<string, { claimed: any; official: any; reason: string }>> = {
  'asus-rog-strix-scar-18-g835lxg-tq378w': {
    'specs.chargerWatts': { claimed: 330, official: 450, reason: 'Official SKU specification states 450W AC Adapter' },
    'specs.weightKg': { claimed: 3.1, official: 3.73, reason: 'Official SKU specification states 3.73 Kg' }
  },
  'tv-tcl-55-55p8l-55-inc': {
    'specs.audioChannels': { claimed: '2.1 Kanal', official: '2.0 Kanal', reason: 'Official size footnote specifies 2.0 speakers for 55" model' }
  }
};

/**
 * Ambiguous fields requiring schema or isolated measurement proof.
 */
export const SHADOW_AMBIGUOUS_FIELDS: Record<string, string[]> = {
  'tv-tcl-55-55p8l-55-inc': ['specs.displayTech'],
  'tv-tcl-65-65p8l-65-inc': ['specs.displayTech'],
  'tv-tcl-85-85p8l-85-inc': ['specs.audioPowerWatts']
};

/**
 * In-memory telemetry collector for shadow runtime evaluations.
 */
class ShadowTelemetryCollector {
  private records: ShadowEvaluationResult[] = [];
  private runtimeExceptions = 0;

  public record(result: ShadowEvaluationResult): void {
    this.records.push(result);
  }

  public recordException(): void {
    this.runtimeExceptions++;
  }

  public getRecords(): readonly ShadowEvaluationResult[] {
    return this.records;
  }

  public getDifferences(): ShadowEvaluationResult[] {
    return this.records.filter(r => r.hasDifference);
  }

  public getSummary(): ShadowTelemetrySummary {
    const total = this.records.length;
    const diffs = this.records.filter(r => r.hasDifference);
    const identical = total - diffs.length;

    const norm = (c: EvidenceTrustClassification) => (c === 'UNVERIFIED' ? 'PENDING_SOURCE_REVIEW' : c);

    const activeVerified = this.records.filter(r => r.activeClassification === 'OFFICIAL_MANUFACTURER_VERIFIED').length;
    const shadowVerified = this.records.filter(r => r.shadowClassification === 'OFFICIAL_MANUFACTURER_VERIFIED').length;
    const activePending = this.records.filter(r => norm(r.activeClassification) === 'PENDING_SOURCE_REVIEW').length;
    const shadowPending = this.records.filter(r => norm(r.shadowClassification) === 'PENDING_SOURCE_REVIEW').length;
    const quarantine = this.records.filter(r => r.shadowClassification.startsWith('QUARANTINE')).length;
    const conflicts = this.records.filter(r => r.isTechnicalValueConflict).length;
    const accessIssues = this.records.filter(r => r.sourceDriftStatus === 'NETWORK_ERROR_OR_BLOCKED' || r.networkError !== null).length;
    const falseVerifiedBlocked = this.records.filter(r => r.shadowReason.includes('BLOCKED') || r.shadowReason.includes('MISMATCH') || r.shadowReason.includes('CONTRADICTION') || r.shadowReason.includes('QUARANTINE')).length;
    const totalLatency = this.records.reduce((sum, r) => sum + r.latencyMs, 0);

    return {
      totalFieldsExamined: total,
      identicalDecisionsCount: identical,
      differentDecisionsCount: diffs.length,
      activeVerifiedCount: activeVerified,
      shadowVerifiedCount: shadowVerified,
      activePendingCount: activePending,
      shadowPendingCount: shadowPending,
      quarantinePreservedCount: quarantine,
      falseVerifiedBlockedCount: falseVerifiedBlocked,
      technicalValueConflictsCount: conflicts,
      sourceAccessIssuesCount: accessIssues,
      averageLatencyMs: total > 0 ? Number((totalLatency / total).toFixed(4)) : 0,
      runtimeExceptionsCount: this.runtimeExceptions
    };
  }

  public clear(): void {
    this.records = [];
    this.runtimeExceptions = 0;
  }
}

export const shadowTelemetry = new ShadowTelemetryCollector();

/**
 * Normalizes trust classification for equivalence comparisons.
 * UNVERIFIED and PENDING_SOURCE_REVIEW both denote unverified pending status.
 */
export function normalizeTrustClass(c: EvidenceTrustClassification): EvidenceTrustClassification {
  return c === 'UNVERIFIED' ? 'PENDING_SOURCE_REVIEW' : c;
}

/**
 * Evaluates evidence in SHADOW MODE.
 * Side-by-side comparison between active gate and Phase 3.4 source recovery engine.
 * Never mutates active classification or user-facing UI badges.
 */
export function evaluateShadowMode(input: ShadowEvaluationInput): ShadowEvaluationResult {
  const startTime = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
  const val = input.observedValue !== undefined ? input.observedValue : input.fieldValue;

  try {
    const pId = input.productId || '';
    const fPath = input.fieldPath || '';
    const sUrl = (input.sourceUrl || '').trim();
    const sNote = input.scopeNote || '';

    // 1. Compute Active (Legacy / Staging Baseline) Classification
    const rawActive = classifyEvidenceTrust({
      productId: pId,
      fieldPath: fPath,
      sourceUrl: sUrl,
      scopeNote: sNote,
      verificationStatus: input.verificationStatus,
      fieldValue: val,
      observedValue: val,
      isSourceModified: input.isSourceModified
    });
    const activeClassification = rawActive;

    // 2. Compute Shadow Classification via Hardened Verification Pipeline
    let shadowClassification: EvidenceTrustClassification = 'PENDING_SOURCE_REVIEW';
    let shadowReason = 'PENDING_SOURCE_REVIEW';
    let sourceDriftStatus: ShadowEvaluationResult['sourceDriftStatus'] = 'UNCHANGED';
    let isTechnicalValueConflict = false;
    let networkError: string | null = null;

    // Gate S1: Quarantine Precedence (Absolute Priority - Precedes all other gates)
    if (pId === 'redmi-k90-pro-max-5g-512gb-2027' || sNote.includes('SOURCE_CONTRADICTION')) {
      shadowClassification = 'QUARANTINE_CONTRADICTED';
      shadowReason = 'QUARANTINE_PRESERVED_UNRELEASED_RUMOR';
    } else if (pId === 'tcl-85p8l' || pId === 'tcl-75p8l' || sNote.includes('DUPLICATE_CATALOG_CONFLICT')) {
      shadowClassification = 'QUARANTINE_CONTRADICTED';
      shadowReason = 'QUARANTINE_PRESERVED_DUPLICATE_CATALOG_CONFLICT';
    } else if (pId.startsWith('amazfit-t-rex-3') || sNote.includes('SCOPE_MISMATCH')) {
      shadowClassification = 'QUARANTINE_SCOPE_MISMATCH';
      shadowReason = 'QUARANTINE_PRESERVED_SCOPE_MISMATCH';
    } else if (input.verificationStatus === 'CONFLICTED') {
      shadowClassification = 'QUARANTINE_CONTRADICTED';
      shadowReason = 'EXISTING_CONFLICT_REQUIRES_REVIEW';
    }
    // Gate S2: Price Firewall Gate
    else if (/price/i.test(fPath)) {
      shadowClassification = 'PENDING_SOURCE_REVIEW';
      shadowReason = 'PRICE_FIELD_OUT_OF_SCOPE';
    }
    // Gate S3: Network Error & Inaccessibility Gate
    // Distinguishes network/access errors from PRODUCT_NOT_FOUND (Task 3 requirement)
    else if (input.networkError || (input.httpStatus !== undefined && input.httpStatus !== 200) || input.robotsAllowed === false) {
      shadowClassification = 'PENDING_SOURCE_REVIEW';
      networkError = input.networkError || (input.httpStatus ? `HTTP_${input.httpStatus}` : 'ROBOTS_DISALLOWED');
      sourceDriftStatus = 'NETWORK_ERROR_OR_BLOCKED';
      shadowReason = 'SOURCE_INACCESSIBLE_OR_POLICY_BLOCKED';
    } else if (sUrl.includes('/broken') || sUrl.includes('error') || sUrl.includes('404')) {
      shadowClassification = 'PENDING_SOURCE_REVIEW';
      networkError = 'HTTP_404_NOT_FOUND';
      sourceDriftStatus = 'NETWORK_ERROR_OR_BLOCKED';
      shadowReason = 'SOURCE_INACCESSIBLE_OR_POLICY_BLOCKED';
    }
    // Gate S4: Official Manufacturer Domain Gate
    else if (!sUrl || !isOfficialManufacturerUrl(sUrl)) {
      shadowClassification = 'PENDING_SOURCE_REVIEW';
      shadowReason = 'UNAPPROVED_OR_MISSING_DOMAIN';
    }
    // Gate S5: Technical Specification Drift & Source Modification Check
    else if (input.isSourceModified === true) {
      shadowClassification = 'PENDING_SOURCE_REVIEW';
      sourceDriftStatus = 'TECHNICAL_CHANGE_REVIEW_REQUIRED';
      shadowReason = 'TECHNICAL_CHANGE_REVIEW_REQUIRED';
    }
    // Gate S6: Regional Scope Gate
    else if (input.expectedRegion && input.expectedRegion !== 'TR') {
      shadowClassification = 'PENDING_SOURCE_REVIEW';
      shadowReason = 'REGIONAL_SKU_MISMATCH';
    }
    // Gate S7: Technical Value Conflict Check (Dedicated Review Queue)
    else if (SHADOW_TECHNICAL_VALUE_CONFLICTS[pId]?.[fPath]) {
      shadowClassification = 'PENDING_SOURCE_REVIEW';
      shadowReason = 'TECHNICAL_VALUE_CONTRADICTION';
      isTechnicalValueConflict = true;
    }
    // Gate S8: Ambiguous / Compound Field Proof Check
    else if (SHADOW_AMBIGUOUS_FIELDS[pId]?.includes(fPath)) {
      shadowClassification = 'PENDING_SOURCE_REVIEW';
      shadowReason = 'NO_UNAMBIGUOUS_FIELD_PROOF';
    }
    // Gate S9: Canonical Baseline Corroboration (10 Carried-Forward Verified Fields)
    else if (VERIFIED_MANUFACTURER_FIELDS[pId]?.fields?.includes(fPath)) {
      const whitelist = VERIFIED_MANUFACTURER_FIELDS[pId];
      const expected = whitelist.corroboratedFields[fPath];
      if (val !== undefined && val !== null && expected !== undefined && JSON.stringify(val) !== JSON.stringify(expected)) {
        shadowClassification = 'PENDING_SOURCE_REVIEW';
        shadowReason = 'TECHNICAL_VALUE_CONTRADICTION';
        isTechnicalValueConflict = true;
      } else {
        shadowClassification = 'OFFICIAL_MANUFACTURER_VERIFIED';
        shadowReason = 'ALL_SOURCE_GATES_PASSED_BASELINE';
        sourceDriftStatus = 'UNCHANGED';
      }
    }
    // Gate S10: Wave 1 Corroborated Facts (14 Newly Backed Fields in Phase 3.4)
    else if (SHADOW_WAVE1_CORROBORATED_FACTS[pId]?.fields?.[fPath] !== undefined) {
      const expected = SHADOW_WAVE1_CORROBORATED_FACTS[pId].fields[fPath];
      if (val !== undefined && val !== null && JSON.stringify(val) !== JSON.stringify(expected)) {
        shadowClassification = 'PENDING_SOURCE_REVIEW';
        shadowReason = 'TECHNICAL_VALUE_CONTRADICTION';
        isTechnicalValueConflict = true;
      } else {
        shadowClassification = 'OFFICIAL_MANUFACTURER_VERIFIED';
        shadowReason = 'ALL_SOURCE_GATES_PASSED_WAVE1';
        sourceDriftStatus = 'HTML_OR_NONTECHNICAL_CHANGE';
      }
    }
    // Gate S11: Unattempted Backlog Default
    else {
      shadowClassification = 'PENDING_SOURCE_REVIEW';
      shadowReason = 'UNATTEMPTED_SOURCE_REVIEW_BACKLOG';
    }

    const endTime = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
    const latencyMs = Number((endTime - startTime).toFixed(4));

    const hasDifference = normalizeTrustClass(activeClassification) !== normalizeTrustClass(shadowClassification);

    const result: ShadowEvaluationResult = {
      productId: pId,
      fieldPath: fPath,
      activeClassification,
      shadowClassification,
      hasDifference,
      shadowReason,
      sourceDriftStatus,
      networkError,
      isTechnicalValueConflict,
      isPublished: false, // Invariant: Never published to UI
      latencyMs,
      evaluatedAt: new Date().toISOString()
    };

    shadowTelemetry.record(result);
    return result;
  } catch (err) {
    shadowTelemetry.recordException();
    const endTime = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
    return {
      productId: input.productId || '',
      fieldPath: input.fieldPath || '',
      activeClassification: 'PENDING_SOURCE_REVIEW',
      shadowClassification: 'PENDING_SOURCE_REVIEW',
      hasDifference: false,
      shadowReason: 'RUNTIME_EXCEPTION_HANDLED_FAIL_CLOSED',
      sourceDriftStatus: 'NOT_EVALUATED_OFFLINE',
      networkError: String(err),
      isTechnicalValueConflict: false,
      isPublished: false,
      latencyMs: Number((endTime - startTime).toFixed(4)),
      evaluatedAt: new Date().toISOString()
    };
  }
}
