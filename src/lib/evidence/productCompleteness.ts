/**
 * ASTERION MASTER-01 — PRODUCT COMPLETENESS ENGINE
 *
 * Implements product-level completeness measurement, transitioning the evidence
 * platform from flat field-count expansion to holistic, manufacturer-supported product coverage.
 *
 * Requirements:
 * - Define mandatory critical specifications per category
 * - Classify products into 5 completeness states:
 *   COMPLETE_VERIFIED, PARTIALLY_VERIFIED, UNVERIFIED, CONFLICTED, QUARANTINED
 * - Compute critical specification coverage ratios and top missing fields
 * - Generate a prioritized verification queue for next-batch expansion
 */

import fs from 'fs';
import path from 'path';

import { mockSmartphones } from '../mockData';
import { mockTVs } from '../mockTVs';
import { mockAppliances } from '../mockAppliances';
import { mockTablets } from '../mockTablets';
import { mockSmartwatches } from '../mockSmartwatches';
import { mockHeadphones } from '../mockHeadphones';
import { mockLaptops } from '../mockLaptops';
import { mockMonitors } from '../mockMonitors';
import { mockConsoles } from '../mockConsoles';
import { CANONICAL_EXCLUDED_ID_SET } from '../governance/canonicalExclusions';

import { PROMOTED_BACKLOG_EVIDENCE } from './promotedBacklogEvidence';
import { VERIFIED_MANUFACTURER_FIELDS } from './trustClassification';

export type ProductCompletenessStatus =
  | 'COMPLETE_VERIFIED'
  | 'PARTIALLY_VERIFIED'
  | 'UNVERIFIED'
  | 'CONFLICTED'
  | 'QUARANTINED';

export interface CriticalDimension {
  id: string;
  name: string;
  acceptedFields: string[];
  description: string;
}

/**
 * Mandatory critical specification dimensions per product category.
 * A product achieves COMPLETE_VERIFIED only when every critical dimension
 * has at least one manufacturer-backed verified field.
 */
export const CATEGORY_CRITICAL_REQUIREMENTS: Record<string, CriticalDimension[]> = {
  smartphones: [
    {
      id: 'screen',
      name: 'Screen',
      acceptedFields: ['specs.screen.size', 'specs.screen.resolution', 'specs.screen.refreshRate'],
      description: 'Display physical diagonal, native resolution, and panel refresh rate.'
    },
    {
      id: 'processor',
      name: 'Processor',
      acceptedFields: ['specs.processor.chip', 'specs.processor.cores'],
      description: 'Silicon chipset identity and CPU architecture.'
    },
    {
      id: 'memory',
      name: 'RAM / Storage',
      acceptedFields: ['specs.memory.ramGb', 'specs.memory.storageGb', 'specs.ramGb', 'specs.storageGb'],
      description: 'System memory capacity and onboard non-volatile storage tier.'
    },
    {
      id: 'camera',
      name: 'Camera',
      acceptedFields: ['specs.camera.mainMp', 'specs.camera.selfieMp', 'specs.camera.ultrawideMp', 'specs.camera.telephotoMp'],
      description: 'Primary camera sensor resolution and optical capture capabilities.'
    },
    {
      id: 'battery',
      name: 'Battery',
      acceptedFields: ['specs.battery.capacitymAh', 'specs.battery.chargingWatts', 'specs.batteryMah'],
      description: 'Internal battery cell capacity (mAh) and charging wattage.'
    },
    {
      id: 'connectivity',
      name: 'Connectivity',
      acceptedFields: ['specs.connectivity.has5G', 'specs.connectivity.wifiStandard'],
      description: 'Cellular generation (5G) and Wi-Fi standard.'
    }
  ],
  tvs: [
    {
      id: 'screenSize',
      name: 'Screen Size',
      acceptedFields: ['specs.screenSizeInches'],
      description: 'Physical screen diagonal in inches.'
    },
    {
      id: 'displayTech',
      name: 'Panel / Backlight Tech',
      acceptedFields: ['specs.displayTech', 'specs.panelType'],
      description: 'Display panel and illumination technology (QD-Mini LED, OLED, QLED, etc.).'
    },
    {
      id: 'resolution',
      name: 'Resolution',
      acceptedFields: ['specs.resolution'],
      description: 'Native display resolution (4K Ultra HD, 8K, Full HD).'
    },
    {
      id: 'refreshRate',
      name: 'Refresh Rate',
      acceptedFields: ['specs.refreshRateHz'],
      description: 'Native display panel refresh rate (Hz).'
    },
    {
      id: 'smartOs',
      name: 'Smart OS',
      acceptedFields: ['specs.smartOs'],
      description: 'Smart television operating system platform (Google TV, webOS, Tizen).'
    },
    {
      id: 'audio',
      name: 'Audio System',
      acceptedFields: ['specs.audioPowerWatts', 'specs.audioChannels'],
      description: 'Integrated speaker output wattage and channel configuration.'
    }
  ],
  laptops: [
    {
      id: 'processor',
      name: 'Processor',
      acceptedFields: ['specs.processor', 'specs.processorCores'],
      description: 'CPU model and core configuration.'
    },
    {
      id: 'gpu',
      name: 'GPU',
      acceptedFields: ['specs.gpu'],
      description: 'Dedicated or integrated graphics processing unit.'
    },
    {
      id: 'ram',
      name: 'RAM',
      acceptedFields: ['specs.ramGb'],
      description: 'Installed system memory in gigabytes.'
    },
    {
      id: 'storage',
      name: 'Storage',
      acceptedFields: ['specs.storageGb'],
      description: 'Primary internal SSD/storage capacity in gigabytes.'
    },
    {
      id: 'display',
      name: 'Display',
      acceptedFields: ['specs.screenSizeInches', 'specs.screenResolution', 'specs.screenBrightnessNits'],
      description: 'Display size, native resolution, and panel brightness.'
    },
    {
      id: 'battery',
      name: 'Battery',
      acceptedFields: ['specs.batteryCapacityWh', 'specs.chargerWatts'],
      description: 'Battery energy capacity in watt-hours (Wh) and power adapter wattage.'
    }
  ],
  tablets: [
    {
      id: 'screen',
      name: 'Screen',
      acceptedFields: ['specs.screenSizeInches', 'specs.screenResolution', 'specs.panelType'],
      description: 'Display diagonal, native resolution, and panel architecture.'
    },
    {
      id: 'processor',
      name: 'Processor',
      acceptedFields: ['specs.processor'],
      description: 'Main system-on-chip (SoC) processor.'
    },
    {
      id: 'memory',
      name: 'RAM / Storage / Refresh',
      acceptedFields: ['specs.ramGb', 'specs.storageGb', 'specs.refreshRateHz'],
      description: 'Memory capacity, internal storage, or panel refresh rate.'
    },
    {
      id: 'battery',
      name: 'Battery',
      acceptedFields: ['specs.batteryMah', 'specs.batteryWh'],
      description: 'Internal battery capacity directly supported in milliampere-hours (mAh) or watt-hours (Wh).'
    },
    {
      id: 'connectivity',
      name: 'Connectivity / OS',
      acceptedFields: ['specs.cellular', 'specs.cellularSupport', 'specs.os', 'specs.wifiStandard'],
      description: 'Network connectivity tier (Wi-Fi Only vs 5G) and operating system.'
    }
  ],
  monitors: [
    {
      id: 'screenSize',
      name: 'Screen Size',
      acceptedFields: ['specs.screenSizeInches'],
      description: 'Physical panel diagonal in inches.'
    },
    {
      id: 'resolution',
      name: 'Resolution',
      acceptedFields: ['specs.resolution'],
      description: 'Native display resolution (4K UHD, QHD, FHD).'
    },
    {
      id: 'panelType',
      name: 'Panel Technology',
      acceptedFields: ['specs.panelType'],
      description: 'Panel structure (OLED, Fast IPS, Nano IPS, VA).'
    },
    {
      id: 'refreshRate',
      name: 'Refresh Rate',
      acceptedFields: ['specs.refreshRateHz'],
      description: 'Peak refresh rate in Hertz (144Hz, 240Hz, 300Hz, 480Hz).'
    },
    {
      id: 'responseTime',
      name: 'Response Time / Aspect',
      acceptedFields: ['specs.responseTimeMs', 'specs.aspectRatio'],
      description: 'Pixel response time (GtG) or aspect ratio.'
    },
    {
      id: 'connectivity',
      name: 'Connectivity',
      acceptedFields: ['specs.hdmiPorts', 'specs.hdmiVersion'],
      description: 'Input video interfaces (HDMI ports / HDMI version).'
    }
  ],
  smartwatches: [
    {
      id: 'display',
      name: 'Display',
      acceptedFields: ['specs.displaySizeInch', 'specs.displayType', 'specs.resolution'],
      description: 'Screen size and display technology.'
    },
    {
      id: 'battery',
      name: 'Battery',
      acceptedFields: ['specs.batteryLifeDays', 'specs.batteryCapacityMah'],
      description: 'Battery endurance in days or capacity in mAh.'
    },
    {
      id: 'sensors',
      name: 'Sensors / Health',
      acceptedFields: ['specs.hasHeartRate', 'specs.hasSpO2', 'specs.sensors'],
      description: 'Biometric sensors (Heart Rate, SpO2, ECG).'
    },
    {
      id: 'connectivity',
      name: 'Connectivity / GPS',
      acceptedFields: ['specs.hasGps', 'specs.connectivity', 'specs.hasCellular'],
      description: 'Integrated GNSS/GPS, Bluetooth/Wi-Fi, or cellular support.'
    },
    {
      id: 'waterResistance',
      name: 'Water Resistance',
      acceptedFields: ['specs.waterResistance'],
      description: 'Ingress protection and water depth rating.'
    }
  ],
  headphones: [
    {
      id: 'formFactor',
      name: 'Form Factor',
      acceptedFields: ['specs.formFactor'],
      description: 'Physical acoustic form factor (Over-ear, In-ear, On-ear).'
    },
    {
      id: 'connectivity',
      name: 'Connectivity',
      acceptedFields: ['specs.connectivityType', 'specs.wirelessRange'],
      description: 'Wireless transmission protocol and operating range.'
    },
    {
      id: 'battery',
      name: 'Battery / Playtime',
      acceptedFields: ['specs.batteryLife'],
      description: 'Continuous playback battery life in hours.'
    },
    {
      id: 'driver',
      name: 'Driver / Frequency',
      acceptedFields: ['specs.driverSize', 'specs.frequencyResponse'],
      description: 'Acoustic transducer diameter and frequency range.'
    },
    {
      id: 'acoustic',
      name: 'Acoustic / Channels',
      acceptedFields: ['specs.acousticSystem', 'specs.channels'],
      description: 'Acoustic design (Closed/Open back) and channel layout.'
    }
  ],
  appliances: [
    {
      id: 'energyClass',
      name: 'Energy Class',
      acceptedFields: ['specs.energyClassCooling', 'specs.energyClassHeating', 'specs.energyClass'],
      description: 'Official EU/TR energy efficiency class rating.'
    },
    {
      id: 'capacity',
      name: 'Capacity / Rating',
      acceptedFields: ['specs.btuCapacity', 'specs.capacityKg', 'specs.volumeLitres'],
      description: 'Cooling/Heating BTU, wash capacity (kg), or storage volume.'
    },
    {
      id: 'inverter',
      name: 'Inverter Technology',
      acceptedFields: ['specs.inverter'],
      description: 'Compressor / motor variable-speed inverter capability.'
    },
    {
      id: 'noise',
      name: 'Noise Level',
      acceptedFields: ['specs.noiseDb'],
      description: 'Operational acoustic noise output in decibels (dB).'
    }
  ],
  consoles: [
    {
      id: 'processor',
      name: 'Processor',
      acceptedFields: ['specs.processor'],
      description: 'Central processing unit architecture.'
    },
    {
      id: 'gpu',
      name: 'GPU / Compute',
      acceptedFields: ['specs.gpu', 'specs.tflops'],
      description: 'Graphics processing unit and compute throughput in TFLOPS.'
    },
    {
      id: 'storage',
      name: 'Storage',
      acceptedFields: ['specs.storageGb'],
      description: 'Internal solid-state drive capacity in gigabytes.'
    },
    {
      id: 'ram',
      name: 'RAM',
      acceptedFields: ['specs.ramGb'],
      description: 'Unified high-bandwidth system memory.'
    },
    {
      id: 'video',
      name: 'Video / FPS',
      acceptedFields: ['specs.resolution', 'specs.fps'],
      description: 'Target gaming resolution and refresh/framerate capabilities.'
    }
  ]
};

export type HeadphoneSubtype = 'WIRED' | 'WIRELESS_BLUETOOTH' | 'WIRELESS_2_4GHZ' | 'HYBRID';

export const HEADPHONE_SUBTYPE_CRITICAL_REQUIREMENTS: Record<HeadphoneSubtype, CriticalDimension[]> = {
  WIRED: [
    {
      id: 'formFactor',
      name: 'Form Factor',
      acceptedFields: ['specs.formFactor'],
      description: 'Physical acoustic form factor (Over-ear, In-ear, On-ear).'
    },
    {
      id: 'connectivity',
      name: 'Connectivity / Interface',
      acceptedFields: ['specs.connectivityType'],
      description: 'Wired physical interface (3.5mm analog jack, USB-C, USB-A).'
    },
    {
      id: 'driver',
      name: 'Driver / Frequency',
      acceptedFields: ['specs.driverSize', 'specs.frequencyResponse'],
      description: 'Acoustic transducer diameter and frequency range.'
    },
    {
      id: 'acoustic',
      name: 'Acoustic / Channels',
      acceptedFields: ['specs.acousticSystem', 'specs.channels'],
      description: 'Acoustic design (Closed/Open back) and channel layout.'
    }
  ],
  WIRELESS_BLUETOOTH: [
    {
      id: 'formFactor',
      name: 'Form Factor',
      acceptedFields: ['specs.formFactor'],
      description: 'Physical acoustic form factor (Over-ear, In-ear, On-ear).'
    },
    {
      id: 'connectivity',
      name: 'Connectivity',
      acceptedFields: ['specs.connectivityType', 'specs.bluetoothVersion'],
      description: 'Bluetooth transmission protocol and version.'
    },
    {
      id: 'battery',
      name: 'Battery / Playtime',
      acceptedFields: ['specs.batteryLife'],
      description: 'Continuous playback battery life in hours.'
    },
    {
      id: 'driver',
      name: 'Driver / Frequency',
      acceptedFields: ['specs.driverSize', 'specs.frequencyResponse'],
      description: 'Acoustic transducer diameter and frequency range.'
    },
    {
      id: 'acoustic',
      name: 'Acoustic / Channels',
      acceptedFields: ['specs.acousticSystem', 'specs.channels'],
      description: 'Acoustic design (Closed/Open back) and channel layout.'
    }
  ],
  WIRELESS_2_4GHZ: [
    {
      id: 'formFactor',
      name: 'Form Factor',
      acceptedFields: ['specs.formFactor'],
      description: 'Physical acoustic form factor (Over-ear, In-ear, On-ear).'
    },
    {
      id: 'connectivity',
      name: 'Connectivity / RF',
      acceptedFields: ['specs.connectivityType', 'specs.wirelessRange'],
      description: '2.4GHz RF wireless transmission protocol and operating range.'
    },
    {
      id: 'battery',
      name: 'Battery / Playtime',
      acceptedFields: ['specs.batteryLife'],
      description: 'Continuous playback battery life in hours.'
    },
    {
      id: 'driver',
      name: 'Driver / Frequency',
      acceptedFields: ['specs.driverSize', 'specs.frequencyResponse'],
      description: 'Acoustic transducer diameter and frequency range.'
    },
    {
      id: 'acoustic',
      name: 'Acoustic / Channels',
      acceptedFields: ['specs.acousticSystem', 'specs.channels'],
      description: 'Acoustic design (Closed/Open back) and channel layout.'
    }
  ],
  HYBRID: [
    {
      id: 'formFactor',
      name: 'Form Factor',
      acceptedFields: ['specs.formFactor'],
      description: 'Physical acoustic form factor (Over-ear, In-ear, On-ear).'
    },
    {
      id: 'connectivity',
      name: 'Connectivity',
      acceptedFields: ['specs.connectivityType', 'specs.bluetoothVersion'],
      description: 'Wireless and wired hybrid transmission interfaces.'
    },
    {
      id: 'battery',
      name: 'Battery / Playtime',
      acceptedFields: ['specs.batteryLife'],
      description: 'Continuous playback battery life in hours.'
    },
    {
      id: 'driver',
      name: 'Driver / Frequency',
      acceptedFields: ['specs.driverSize', 'specs.frequencyResponse'],
      description: 'Acoustic transducer diameter and frequency range.'
    },
    {
      id: 'acoustic',
      name: 'Acoustic / Channels',
      acceptedFields: ['specs.acousticSystem', 'specs.channels'],
      description: 'Acoustic design (Closed/Open back) and channel layout.'
    }
  ]
};

export function resolveHeadphoneSubtype(product: { id?: string; productId?: string; name?: string; specs?: any }): HeadphoneSubtype {
  const id = product.id || product.productId || '';
  // Exact model / SKU mapping for audited headphones
  if (
    id === 'steelseries-arctis-1' ||
    id === 'steelseries-arctis-nova-3' ||
    id === 'jbl-quantum-50'
  ) {
    return 'WIRED';
  }

  if (
    id === 'apple-airpods-pro-2-usb-c' ||
    id === 'anker-soundcore-liberty-4-pro'
  ) {
    return 'WIRELESS_BLUETOOTH';
  }

  if (
    id === 'apple-airpods-max-2' ||
    id === 'apple-airpods-max' ||
    id === 'sony-wh-xb910n' ||
    id === 'soundcore-space-one' ||
    id === 'anker-soundcore-life-q30'
  ) {
    return 'HYBRID';
  }

  // Heuristic based on specs / title
  const text = `${id} ${product.name || ''} ${JSON.stringify(product.specs || {})}`.toLowerCase();
  
  const isTws = text.includes('tws') || text.includes('kulak içi') || text.includes('in-ear') || text.includes('earbuds');
  const hasBt = text.includes('bluetooth') || !!product.specs?.bluetoothVersion;
  const hasRf = text.includes('2.4g') || text.includes('2.4 ghz') || text.includes('rf ') || text.includes('dongle') || text.includes('telsiz');
  const hasAuxWired = text.includes('3.5 mm') || text.includes('3.5mm') || text.includes('aux') || text.includes('ses kablosu');
  const hasBattery = !!product.specs?.batteryLife || !!product.specs?.batteryMah;

  if (isTws && hasBt) {
    return 'WIRELESS_BLUETOOTH';
  }
  if ((hasBt || hasRf) && hasAuxWired) {
    return 'HYBRID';
  }
  if (hasBt) {
    return 'WIRELESS_BLUETOOTH';
  }
  if (hasRf) {
    return 'WIRELESS_2_4GHZ';
  }
  if (!hasBt && !hasRf && !hasBattery) {
    return 'WIRED';
  }
  return 'WIRELESS_BLUETOOTH';
}

export function getCriticalRequirementsForProduct(
  category: string,
  product?: { id: string; name?: string; specs?: any }
): CriticalDimension[] {
  if (category === 'headphones' && product) {
    const subtype = resolveHeadphoneSubtype(product);
    return HEADPHONE_SUBTYPE_CRITICAL_REQUIREMENTS[subtype] || CATEGORY_CRITICAL_REQUIREMENTS.headphones;
  }
  return CATEGORY_CRITICAL_REQUIREMENTS[category] || [];
}

export interface ProductCompletenessEvaluation {
  productId: string;
  name: string;
  category: string;
  status: ProductCompletenessStatus;
  criticalFieldCoverageRatio: number; // 0.0 to 1.0
  criticalFieldCoveragePercent: number; // 0 to 100
  totalCriticalDimensions: number;
  satisfiedDimensionsCount: number;
  satisfiedDimensions: string[];
  missingDimensions: string[];
  verifiedFieldCount: number;
  verifiedFieldPaths: string[];
  isCanonicalExcluded: boolean;
  quarantineOrConflictReason?: string;
  releaseYear?: number;
}

export interface CategoryCompletenessSummary {
  category: string;
  totalProducts: number;
  canonicalActiveProducts: number;
  completeVerifiedCount: number;
  partiallyVerifiedCount: number;
  unverifiedCount: number;
  quarantinedCount: number;
  conflictedCount: number;
  distinctProductsWithEvidence: number;
  averageCriticalCoveragePercent: number;
  topMissingCriticalDimensions: Array<{ dimensionName: string; missingProductCount: number }>;
}

export interface CatalogCompletenessReport {
  meta: {
    generatedAt: string;
    environment: 'STAGING ONLY';
    productionStatus: 'FROZEN';
    engineVersion: 'ASTERION-COMPLETENESS-V1';
    totalCatalogProducts: number;
    canonicalActiveProducts: number;
    totalDistinctProductsWithEvidence: number;
    totalVerifiedFieldsBaseline: number;
    averageCriticalCoverageOverallPercent: number;
    evidenceBearingAverageCoveragePercent: number;
  };
  statusTotals: Record<ProductCompletenessStatus, number>;
  categorySummaries: Record<string, CategoryCompletenessSummary>;
  completeVerifiedProducts: Array<{
    productId: string;
    name: string;
    category: string;
    verifiedFieldCount: number;
    satisfiedDimensions: string[];
  }>;
  verificationPriorityQueue: Array<{
    productId: string;
    name: string;
    category: string;
    releaseYear?: number;
    currentCoveragePercent: number;
    missingCriticalDimensions: string[];
    priorityScore: number;
    actionableReason: string;
  }>;
}

/**
 * Builds the comprehensive set of all verified field paths by product ID.
 */
export function buildVerifiedEvidenceMap(): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();

  const add = (pId: string, fPath: string) => {
    if (!map.has(pId)) map.set(pId, new Set());
    map.get(pId)!.add(fPath);
  };

  // Phase 3 baseline
  for (const [prodId, entry] of Object.entries(VERIFIED_MANUFACTURER_FIELDS)) {
    for (const f of (entry as any).fields) add(prodId, f);
  }

  // Wave 1 retained
  try {
    const p41Audit = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../reports/phase41-wave1-verified-field-audit.json'), 'utf8'));
    for (const e of p41Audit.auditLedger) {
      if (e.forensicAuditVerdict === 'RETAINED_VERIFIED') add(e.productId, e.fieldPath);
    }
  } catch {
    // Staging fallback if running from alternative cwd
  }

  // Wave 2 newly verified
  try {
    const p46Audit = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../reports/phase46-verified-field-audit.json'), 'utf8'));
    for (const e of p46Audit.newlyVerifiedFieldsLedger) add(e.productId, e.fieldPath);
  } catch {}

  // Retained audit rows are not necessarily verified after a source review.
  for (const e of PROMOTED_BACKLOG_EVIDENCE) {
    if (e.verificationStatus === 'VERIFIED' && e.trustClassification === 'OFFICIAL_MANUFACTURER_VERIFIED') {
      add(e.productId, e.fieldPath);
    }
  }

  return map;
}

/**
 * Helper to check if specs.connectivity.has5G was explicitly verified as false (negative claim).
 * Negative claims (e.g. lacks 5G) cannot satisfy the connectivity dimension alone without
 * positive connectivity evidence (such as specs.connectivity.wifiStandard).
 */
export function isHas5gFalseVerified(productId: string): boolean {
  const entry = PROMOTED_BACKLOG_EVIDENCE.find(
    e => e.productId === productId &&
         e.fieldPath === 'specs.connectivity.has5G' &&
         e.verificationStatus === 'VERIFIED'
  );
  return entry?.verifiedValue === false;
}

/**
 * Evaluates completeness for a single catalog product.
 */
export function evaluateProductCompleteness(
  product: { id: string; name?: string; category?: string; releaseYear?: number; specs?: any },
  category: string,
  verifiedFields: Set<string>,
  quarantineSet: Set<string>,
  conflictMap: Map<string, string>
): ProductCompletenessEvaluation {
  const dims = getCriticalRequirementsForProduct(category, product);
  const satisfied: string[] = [];
  const missing: string[] = [];

  for (const d of dims) {
    let isDimensionSatisfied = false;

    if (category === 'smartphones' && d.id === 'connectivity') {
      // Bounded Regression Check 1: specs.connectivity.has5G: false alone cannot satisfy
      // the complete smartphone connectivity requirement without positive Wi-Fi standard verification.
      const hasWifi = verifiedFields.has('specs.connectivity.wifiStandard');
      const has5g = verifiedFields.has('specs.connectivity.has5G');
      const is5gFalse = isHas5gFalseVerified(product.id);

      if (hasWifi) {
        isDimensionSatisfied = true;
      } else if (has5g && !is5gFalse) {
        isDimensionSatisfied = true;
      } else {
        isDimensionSatisfied = false;
      }
    } else {
      isDimensionSatisfied = d.acceptedFields.some((f: string) => verifiedFields.has(f));
    }

    if (isDimensionSatisfied) {
      satisfied.push(d.name);
    } else {
      missing.push(d.name);
    }
  }

  const coverageRatio = dims.length > 0 ? satisfied.length / dims.length : 0;
  const coveragePercent = Math.round(coverageRatio * 1000) / 10;

  let status: ProductCompletenessStatus;
  let reason: string | undefined;

  if (quarantineSet.has(product.id)) {
    status = 'QUARANTINED';
    reason = 'QUARANTINE_SPECULATIVE_CONCEPT: Product flagged in speculative concept quarantine ledger.';
  } else if (conflictMap.has(product.id)) {
    status = 'CONFLICTED';
    reason = conflictMap.get(product.id);
  } else if (verifiedFields.size === 0) {
    status = 'UNVERIFIED';
  } else if (satisfied.length === dims.length) {
    status = 'COMPLETE_VERIFIED';
  } else {
    status = 'PARTIALLY_VERIFIED';
  }

  return {
    productId: product.id,
    name: product.name || product.id,
    category,
    status,
    criticalFieldCoverageRatio: coverageRatio,
    criticalFieldCoveragePercent: coveragePercent,
    totalCriticalDimensions: dims.length,
    satisfiedDimensionsCount: satisfied.length,
    satisfiedDimensions: satisfied,
    missingDimensions: missing,
    verifiedFieldCount: verifiedFields.size,
    verifiedFieldPaths: Array.from(verifiedFields).sort(),
    isCanonicalExcluded: CANONICAL_EXCLUDED_ID_SET.has(product.id),
    quarantineOrConflictReason: reason,
    releaseYear: product.releaseYear
  };
}

/**
 * Generates the full Catalog Completeness Report across all 5,820 products.
 */
export function generateCatalogCompletenessReport(): CatalogCompletenessReport {
  const verifiedMap = buildVerifiedEvidenceMap();

  // Read backlog for quarantine and conflict detection
  const backlogPath = path.resolve(__dirname, '../../../reports/master-unified-backlog.json');
  let backlogData: any = { backlog: [] };
  try {
    backlogData = JSON.parse(fs.readFileSync(backlogPath, 'utf8'));
  } catch {}

  const quarantineSet = new Set<string>();
  const conflictMap = new Map<string, string>();

  for (const b of backlogData.backlog) {
    if (b.taxonomyClassification === 'QUARANTINE_SPECULATIVE_CONCEPT') {
      quarantineSet.add(b.productId);
    } else if (
      b.reason?.includes('UNRELEASED') ||
      b.reason?.includes('CONTRADICTION') ||
      b.taxonomyClassification === 'QUARANTINE_CONTRADICTED'
    ) {
      conflictMap.set(b.productId, b.reason);
    }
  }

  const allRawCatalog: Record<string, any[]> = {
    smartphones: mockSmartphones,
    tvs: mockTVs,
    laptops: mockLaptops,
    tablets: mockTablets,
    monitors: mockMonitors,
    smartwatches: mockSmartwatches,
    headphones: mockHeadphones,
    appliances: mockAppliances,
    consoles: mockConsoles
  };

  const statusTotals: Record<ProductCompletenessStatus, number> = {
    COMPLETE_VERIFIED: 0,
    PARTIALLY_VERIFIED: 0,
    UNVERIFIED: 0,
    CONFLICTED: 0,
    QUARANTINED: 0
  };

  const categorySummaries: Record<string, CategoryCompletenessSummary> = {};
  const completeProductsList: CatalogCompletenessReport['completeVerifiedProducts'] = [];
  const allEvaluations: ProductCompletenessEvaluation[] = [];

  let totalActiveProducts = 0;
  let totalRawProducts = 0;
  let sumCoverageRatioActive = 0;
  let sumCoverageRatioEvidenceBearing = 0;
  let evidenceBearingCount = 0;

  for (const [catName, products] of Object.entries(allRawCatalog)) {
    const missingDimTally: Record<string, number> = {};
    let catComplete = 0;
    let catPartial = 0;
    let catUnverified = 0;
    let catQuarantine = 0;
    let catConflicted = 0;
    let catActive = 0;
    let catSumCoverage = 0;
    let catEvidenceCount = 0;

    for (const p of products) {
      totalRawProducts++;
      const isExcluded = CANONICAL_EXCLUDED_ID_SET.has(p.id);
      if (!isExcluded) {
        totalActiveProducts++;
        catActive++;
      }

      const evSet = verifiedMap.get(p.id) || new Set<string>();
      const evalResult = evaluateProductCompleteness(p, catName, evSet, quarantineSet, conflictMap);
      allEvaluations.push(evalResult);

      statusTotals[evalResult.status]++;

      if (evalResult.status === 'COMPLETE_VERIFIED') {
        catComplete++;
        completeProductsList.push({
          productId: evalResult.productId,
          name: evalResult.name,
          category: catName,
          verifiedFieldCount: evalResult.verifiedFieldCount,
          satisfiedDimensions: evalResult.satisfiedDimensions
        });
      } else if (evalResult.status === 'PARTIALLY_VERIFIED') {
        catPartial++;
        for (const m of evalResult.missingDimensions) {
          missingDimTally[m] = (missingDimTally[m] || 0) + 1;
        }
      } else if (evalResult.status === 'UNVERIFIED') {
        catUnverified++;
      } else if (evalResult.status === 'QUARANTINED') {
        catQuarantine++;
      } else if (evalResult.status === 'CONFLICTED') {
        catConflicted++;
      }

      if (!isExcluded) {
        catSumCoverage += evalResult.criticalFieldCoverageRatio;
        sumCoverageRatioActive += evalResult.criticalFieldCoverageRatio;
      }

      if (evSet.size > 0 && evalResult.status !== 'QUARANTINED' && evalResult.status !== 'CONFLICTED') {
        catEvidenceCount++;
        evidenceBearingCount++;
        sumCoverageRatioEvidenceBearing += evalResult.criticalFieldCoverageRatio;
      }
    }

    const topMissing = Object.entries(missingDimTally)
      .map(([dimensionName, missingProductCount]) => ({ dimensionName, missingProductCount }))
      .sort((a, b) => b.missingProductCount - a.missingProductCount);

    categorySummaries[catName] = {
      category: catName,
      totalProducts: products.length,
      canonicalActiveProducts: catActive,
      completeVerifiedCount: catComplete,
      partiallyVerifiedCount: catPartial,
      unverifiedCount: catUnverified,
      quarantinedCount: catQuarantine,
      conflictedCount: catConflicted,
      distinctProductsWithEvidence: catComplete + catPartial,
      averageCriticalCoveragePercent: catActive > 0 ? Math.round((catSumCoverage / catActive) * 1000) / 10 : 0,
      topMissingCriticalDimensions: topMissing
    };
  }

  // Generate Verification Priority Queue
  // Select partially verified products with the highest coverage (e.g. 80%+ complete),
  // prioritizing 2026/2025 releases and high consumer value.
  const priorityQueue = allEvaluations
    .filter(e => e.status === 'PARTIALLY_VERIFIED' && !e.isCanonicalExcluded)
    .map(e => {
      const year = e.releaseYear || 2024;
      const yearWeight = year >= 2026 ? 30 : year === 2025 ? 20 : 10;
      const coverageWeight = Math.round(e.criticalFieldCoverageRatio * 60);
      const priorityScore = coverageWeight + yearWeight;

      return {
        productId: e.productId,
        name: e.name,
        category: e.category,
        releaseYear: e.releaseYear,
        currentCoveragePercent: e.criticalFieldCoveragePercent,
        missingCriticalDimensions: e.missingDimensions,
        priorityScore,
        actionableReason: `Requires ${e.missingDimensions.length} field(s) [${e.missingDimensions.join(', ')}] to achieve COMPLETE_VERIFIED status.`
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore || b.currentCoveragePercent - a.currentCoveragePercent)
    .slice(0, 25);

  const distinctTotal = statusTotals.COMPLETE_VERIFIED + statusTotals.PARTIALLY_VERIFIED +
    (allEvaluations.some(e => e.status === 'CONFLICTED' && e.verifiedFieldCount > 0) ? 1 : 0);

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      environment: 'STAGING ONLY',
      productionStatus: 'FROZEN',
      engineVersion: 'ASTERION-COMPLETENESS-V1',
      totalCatalogProducts: totalRawProducts,
      canonicalActiveProducts: totalActiveProducts,
      totalDistinctProductsWithEvidence: distinctTotal,
      totalVerifiedFieldsBaseline: Array.from(verifiedMap.values()).reduce((sum, fields) => sum + fields.size, 0),
      averageCriticalCoverageOverallPercent: Math.round((sumCoverageRatioActive / totalActiveProducts) * 1000) / 10,
      evidenceBearingAverageCoveragePercent: evidenceBearingCount > 0 ? Math.round((sumCoverageRatioEvidenceBearing / evidenceBearingCount) * 1000) / 10 : 0
    },
    statusTotals,
    categorySummaries,
    completeVerifiedProducts: completeProductsList.sort((a, b) => a.category.localeCompare(b.category) || a.productId.localeCompare(b.productId)),
    verificationPriorityQueue: priorityQueue
  };
}
