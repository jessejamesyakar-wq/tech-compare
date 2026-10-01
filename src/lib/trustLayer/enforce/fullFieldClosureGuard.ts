/**
 * FULL-FIELD CLOSURE GUARD & PRE-LAUNCH RUMOR POLLUTION DETECTOR
 *
 * PURPOSE:
 * Prevents premature / false "P1_BATCH_PASS" and "Remaining Issues = 0" claims
 * based solely on an empty original repair queue.
 *
 * Enforces independent, manufacturer-grounded full-field inspection across
 * all primary hardware domains before any P1 batch can be certified clean.
 */

export type ClosureClassification =
  | 'VERIFIED_CORRECT'
  | 'FILLED_VERIFIED'
  | 'DEMONSTRABLY_WRONG'
  | 'SCHEMA_LIMITATION'
  | 'BLOCKED_EVIDENCE'
  | 'THIRD_PARTY_PROVENANCE_DEBT'
  | 'NOT_APPLICABLE';

export type FieldDomain =
  | 'IDENTITY'
  | 'DISPLAY'
  | 'PROCESSOR'
  | 'MEMORY_STORAGE'
  | 'CAMERA'
  | 'BATTERY'
  | 'CONNECTIVITY'
  | 'BUILD'
  | 'SOFTWARE';

export interface ClosureAuditField {
  domain: FieldDomain;
  fieldPath: string;
  catalogValue: any;
  officialValue?: any;
  classification: ClosureClassification;
  evidenceUrl?: string;
  notes?: string;
}

export interface ClosureAuditRootResult {
  rootId: string;
  modelName: string;
  inspectedFields: ClosureAuditField[];
  counts: Record<ClosureClassification, number>;
  isClean: boolean;
}

export interface ClosureGateInput {
  batchId: string;
  targetRoots: ClosureAuditRootResult[];
  originalQueueIssuesRemaining: number;
  scopeLockPassed: boolean;
  unauthorizedMutationsCount: number;
  priceMutationCount: number;
  goldenMutationCount: number;
  goldenDatasetMutationAllowed?: boolean; // Human-authorized Golden mutations
  testsAndBuildPassed: boolean;
}

export interface ClosureGateResult {
  verdict: 'P1_BATCH_PASS' | 'P1_BATCH_BLOCKED_CLOSURE_FAIL';
  passed: boolean;
  reasons: string[];
  totalInspectedFields: number;
  counts: Record<ClosureClassification, number>;
  demonstrablyWrongFields: ClosureAuditField[];
  schemaLimitations: ClosureAuditField[];
  thirdPartyDebtCount: number;
}

export interface RumorPollutionDetection {
  isSuspicious: boolean;
  trigger?: 'REQUIRES_OFFICIAL_VERIFICATION';
  heuristicReason?: string;
}

/**
 * Pre-launch rumor pollution detector heuristics.
 * Flags suspicious legacy values surviving in catalog records.
 * NEVER auto-corrects; triggers REQUIRES_OFFICIAL_VERIFICATION.
 */
export class PreLaunchRumorPollutionDetector {
  public static detect(
    fieldPath: string,
    value: any,
    context?: { brand?: string; model?: string }
  ): RumorPollutionDetection {
    if (value === null || value === undefined || value === '') {
      return { isSuspicious: false };
    }

    const brand = (context?.brand || '').toLowerCase();
    const model = (context?.model || '').toLowerCase();

    // 1. Marketing strings / foundry / process assumptions embedded inside chip names
    if (
      fieldPath === 'specs.processor.chip' ||
      fieldPath === 'specs.processor' ||
      fieldPath === 'specs.chipset'
    ) {
      if (typeof value === 'string') {
        const hasProcessOrFoundry = /\b(tsmc|samsung|intel|\d+nm|\d+\s*nm|g[oö]vde|d[uü]z)\b/i.test(value);
        const hasParentheses = /\(.*\)/.test(value);
        if (hasProcessOrFoundry || hasParentheses) {
          return {
            isSuspicious: true,
            trigger: 'REQUIRES_OFFICIAL_VERIFICATION',
            heuristicReason: `Mixed semantic string inside chip field: "${value}". Foundry or chassis notes must not pollute chip identifier.`
          };
        }
      }
    }

    // 2. Suspicious refresh rate leaks (e.g. 144Hz on mainstream flagship that launches with 120Hz)
    if (
      fieldPath === 'specs.screen.refreshRate' ||
      fieldPath === 'specs.refreshRate'
    ) {
      if (value === 144 && (brand.includes('google') || brand.includes('apple') || model.includes('pixel') || model.includes('iphone'))) {
        return {
          isSuspicious: true,
          trigger: 'REQUIRES_OFFICIAL_VERIFICATION',
          heuristicReason: `Refresh rate 144 Hz on ${brand} ${model} is a typical pre-launch rumor artifact. Official flagships typically cap at 120 Hz.`
        };
      }
    }

    // 3. Sensor resolution inflation (e.g. 48MP ultrawide on Pixel 'a' series which uses 13MP)
    if (
      fieldPath === 'specs.camera.ultrawideMp' ||
      fieldPath === 'specs.ultrawide'
    ) {
      if (typeof value === 'string' && /48\s*mp/i.test(value) && model.includes('9a')) {
        return {
          isSuspicious: true,
          trigger: 'REQUIRES_OFFICIAL_VERIFICATION',
          heuristicReason: `Ultrawide camera "${value}" on Pixel 9a matches Pro sibling leak rumor; official specification is 13 MP.`
        };
      }
    }

    // 4. Stale pre-release OS version strings (e.g. Android 15 with beta tags when launched with Android 16)
    if (
      fieldPath === 'specs.software.osName' ||
      fieldPath === 'specs.os'
    ) {
      if (typeof value === 'string' && /\(gemini ai\)/i.test(value)) {
        return {
          isSuspicious: true,
          trigger: 'REQUIRES_OFFICIAL_VERIFICATION',
          heuristicReason: `Marketing tag "(Gemini AI)" embedded in OS name "${value}". Official OS name is pure version (e.g., Android 16).`
        };
      }
    }

    // 5. Battery capacity rumor discrepancy
    if (
      fieldPath === 'specs.battery.capacitymAh' ||
      fieldPath === 'specs.batteryCapacity'
    ) {
      if (value === 5300 && model.includes('pixel 10 pro xl')) {
        return {
          isSuspicious: true,
          trigger: 'REQUIRES_OFFICIAL_VERIFICATION',
          heuristicReason: `Battery capacity 5300 mAh on Pixel 10 Pro XL is a known leak rumor; official typical rating is 5200 mAh.`
        };
      }
      if (value === 4800 && model.includes('pixel 9a')) {
        return {
          isSuspicious: true,
          trigger: 'REQUIRES_OFFICIAL_VERIFICATION',
          heuristicReason: `Battery capacity 4800 mAh on Pixel 9a is a known rumor; official typical rating is 5100 mAh.`
        };
      }
    }

    return { isSuspicious: false };
  }
}

/**
 * Cross-Schema Spec Normalizer for audit operations.
 * Maps nested canonical schema paths to flat Icecat paths and vice versa.
 * READ-ONLY; DOES NOT MIGRATE SCHEMAS.
 */
export class CrossSchemaSpecNormalizer {
  private static readonly CANONICAL_TO_FLAT: Record<string, string[]> = {
    'specs.screen.size': ['specs.screenSize', 'specs.screen_size', 'specs.displaySize'],
    'specs.screen.type': ['specs.panelType', 'specs.displayType', 'specs.screenType'],
    'specs.screen.resolution': ['specs.resolution', 'specs.displayResolution'],
    'specs.screen.refreshRate': ['specs.refreshRate', 'specs.displayRefreshRate'],
    'specs.screen.ppi': ['specs.ppi', 'specs.pixelDensity'],
    'specs.screen.brightnessNits': ['specs.brightnessNits', 'specs.brightness', 'specs.peakBrightness'],
    'specs.processor.chip': ['specs.processor', 'specs.chipset', 'specs.cpu'],
    'specs.processor.cores': ['specs.cores', 'specs.cpuCores'],
    'specs.processor.process': ['specs.process', 'specs.processNode'],
    'specs.memory.ramGb': ['specs.ram', 'specs.ramGb', 'specs.memoryRam'],
    'specs.memory.storageGb': ['specs.storage', 'specs.storageGb', 'specs.internalStorage'],
    'specs.camera.mainMp': ['specs.mainCamera', 'specs.camera', 'specs.rearCamera'],
    'specs.camera.ultrawideMp': ['specs.ultrawideCamera', 'specs.ultrawide'],
    'specs.camera.telephotoMp': ['specs.telephotoCamera', 'specs.telephoto'],
    'specs.camera.selfieMp': ['specs.selfieCamera', 'specs.frontCamera'],
    'specs.camera.videoRes': ['specs.videoResolution', 'specs.videoRes'],
    'specs.battery.capacitymAh': ['specs.batteryCapacity', 'specs.battery', 'specs.batteryCapacityMah'],
    'specs.battery.chargingWatts': ['specs.chargingWatts', 'specs.chargingSpeed'],
    'specs.connectivity.has5G': ['specs.has5G', 'specs.cellular5g'],
    'specs.connectivity.wifiStandard': ['specs.wifi', 'specs.wifiStandard', 'specs.wifiVersion'],
    'specs.connectivity.bluetooth': ['specs.bluetooth', 'specs.bluetoothVersion'],
    'specs.build.weightGrams': ['specs.weightGrams', 'specs.weight'],
    'specs.build.waterResistance': ['specs.waterResistance', 'specs.ipRating'],
    'specs.software.osName': ['specs.osName', 'specs.os', 'specs.operatingSystem']
  };

  /**
   * Retrieves a field value from a product record respecting both nested and flat schemas.
   */
  public static getValue(product: any, canonicalPath: string): { value: any; foundPath: string } {
    // 1. Try exact canonical path first
    const nestedVal = this.getNestedProperty(product, canonicalPath);
    if (nestedVal !== undefined) {
      return { value: nestedVal, foundPath: canonicalPath };
    }

    // 2. Try mapped flat paths
    const flatPaths = this.CANONICAL_TO_FLAT[canonicalPath] || [];
    for (const flatPath of flatPaths) {
      const flatVal = this.getNestedProperty(product, flatPath);
      if (flatVal !== undefined) {
        return { value: flatVal, foundPath: flatPath };
      }
    }

    return { value: undefined, foundPath: canonicalPath };
  }

  private static getNestedProperty(obj: any, path: string): any {
    if (!obj || typeof obj !== 'object') return undefined;
    const parts = path.split('.');
    let curr = obj;
    for (const part of parts) {
      if (curr === null || curr === undefined || typeof curr !== 'object') {
        return undefined;
      }
      curr = curr[part];
    }
    return curr;
  }
}

/**
 * Reusable Full-Field Closure Guard Gatekeeper.
 */
export class FullFieldClosureGuard {
  /**
   * Evaluates whether a P1 batch can be granted P1_BATCH_PASS.
   */
  public static evaluateClosureGate(input: ClosureGateInput): ClosureGateResult {
    const reasons: string[] = [];
    const demonstrablyWrongFields: ClosureAuditField[] = [];
    const schemaLimitations: ClosureAuditField[] = [];

    const counts: Record<ClosureClassification, number> = {
      VERIFIED_CORRECT: 0,
      FILLED_VERIFIED: 0,
      DEMONSTRABLY_WRONG: 0,
      SCHEMA_LIMITATION: 0,
      BLOCKED_EVIDENCE: 0,
      THIRD_PARTY_PROVENANCE_DEBT: 0,
      NOT_APPLICABLE: 0
    };

    let totalInspectedFields = 0;

    // Aggregate counts across all target roots
    for (const root of input.targetRoots) {
      for (const field of root.inspectedFields) {
        totalInspectedFields++;
        counts[field.classification] = (counts[field.classification] || 0) + 1;

        if (field.classification === 'DEMONSTRABLY_WRONG') {
          demonstrablyWrongFields.push(field);
        } else if (field.classification === 'SCHEMA_LIMITATION') {
          schemaLimitations.push(field);
        }
      }
    }

    // 1. DEMONSTRABLY_WRONG check
    if (counts.DEMONSTRABLY_WRONG > 0) {
      reasons.push(
        `CLOSURE_FAIL: Found ${counts.DEMONSTRABLY_WRONG} demonstrably wrong fields across target roots despite original repair queue status.`
      );
    }

    // 2. Queue empty but hidden defects exist
    if (input.originalQueueIssuesRemaining === 0 && counts.DEMONSTRABLY_WRONG > 0) {
      reasons.push(
        `FALSE_COMPLETION_PREVENTED: Original repair queue has 0 remaining items, but full-field closure audit detected unaddressed hardware errors.`
      );
    }

    // 3. Scope Lock check
    if (!input.scopeLockPassed || input.unauthorizedMutationsCount > 0) {
      reasons.push(
        `SCOPE_LOCK_FAIL: Detected ${input.unauthorizedMutationsCount} unauthorized root/field mutations.`
      );
    }

    // 4. Price Firewall check
    if (input.priceMutationCount > 0) {
      reasons.push(
        `PRICE_FIREWALL_FAIL: Detected ${input.priceMutationCount} unauthorized price/commerce mutations.`
      );
    }

    // 5. Golden Dataset check
    if (input.goldenMutationCount > 0 && !input.goldenDatasetMutationAllowed) {
      reasons.push(
        `GOLDEN_DATASET_FAIL: Detected ${input.goldenMutationCount} unauthorized mutations on immutable Golden Dataset.`
      );
    }

    // 6. Test & Build check
    if (!input.testsAndBuildPassed) {
      reasons.push(`BUILD_FAIL: TypeScript typecheck or pre-deploy tests failed.`);
    }

    const passed = reasons.length === 0;
    const verdict: 'P1_BATCH_PASS' | 'P1_BATCH_BLOCKED_CLOSURE_FAIL' = passed
      ? 'P1_BATCH_PASS'
      : 'P1_BATCH_BLOCKED_CLOSURE_FAIL';

    return {
      verdict,
      passed,
      reasons,
      totalInspectedFields,
      counts,
      demonstrablyWrongFields,
      schemaLimitations,
      thirdPartyDebtCount: counts.THIRD_PARTY_PROVENANCE_DEBT
    };
  }
}
