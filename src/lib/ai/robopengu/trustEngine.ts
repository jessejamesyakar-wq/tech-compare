// src/lib/ai/robopengu/trustEngine.ts
/**
 * Worker 6: Trust / Evidence Engine
 * Wires TrustLayer & provenance into recommendations.
 * Flags unverified/blocked attributes with honest transparency: "Bu bilgi doğrulanmadı".
 */

import { TrustEvaluation } from './types';
import { CatalogProduct } from './candidateEngine';
import { GoldenCorrectionRegistry } from '@/lib/trustLayer/observe/goldenCorrectionRegistry';
import fs from 'fs';
import path from 'path';

// Cache blocked sets in memory
let processBlockedSet: Set<string> | null = null;
let ramBlockedSet: Set<string> | null = null;

function loadBlockedRegistries() {
  if (processBlockedSet && ramBlockedSet) return;

  processBlockedSet = new Set<string>();
  ramBlockedSet = new Set<string>();

  try {
    const processPath = path.resolve(process.cwd(), 'MEGA_WAVE/WAVE9_CLOSURE/worker_07_process_blocked_registry.json');
    if (fs.existsSync(processPath)) {
      const data = JSON.parse(fs.readFileSync(processPath, 'utf8'));
      if (Array.isArray(data.registry)) {
        data.registry.forEach((r: any) => processBlockedSet!.add(r.rootId));
      }
    }
  } catch (err) {
    // Graceful fallback
  }

  try {
    const ramPath = path.resolve(process.cwd(), 'MEGA_WAVE/WAVE9_CLOSURE/worker_06_ram_blocked_registry.json');
    if (fs.existsSync(ramPath)) {
      const data = JSON.parse(fs.readFileSync(ramPath, 'utf8'));
      if (Array.isArray(data.registry)) {
        data.registry.forEach((r: any) => ramBlockedSet!.add(r.rootId));
      }
    }
  } catch (err) {
    // Graceful fallback
  }
}

export class TrustEngine {
  public static evaluate(product: CatalogProduct, userFocusFields: string[] = []): TrustEvaluation {
    loadBlockedRegistries();

    const rootId = product.id;
    const unverifiedFields: string[] = [];
    const blockedFields: string[] = [];
    const warnings: string[] = [];
    const verifiedProvenances: string[] = [];

    // 1. Process Check
    const isProcessBlocked = processBlockedSet?.has(rootId);
    const processValue = product.specs?.processor?.process || product.specs?.process;
    if (isProcessBlocked) {
      blockedFields.push('specs.processor.process');
      warnings.push('İşlemci üretim süreci (nm) üretici tarafından resmi olarak açıklanmamış veya doğrulanmamıştır.');
    } else if (!processValue) {
      unverifiedFields.push('specs.processor.process');
    }

    // 2. RAM Type Check
    const isRamBlocked = ramBlockedSet?.has(rootId);
    const ramTypeValue = product.specs?.memory?.ramType || product.specs?.ramType;
    if (isRamBlocked) {
      blockedFields.push('specs.memory.ramType');
      warnings.push('RAM bellek tipi (LPDDR standardı) resmi tüketici spesifikasyonunda belirtilmemiştir.');
    } else if (!ramTypeValue) {
      unverifiedFields.push('specs.memory.ramType');
    }

    // 3. Brightness Check
    const brightnessPeak = product.specs?.screen?.brightnessPeakNits;
    const brightnessHbm = product.specs?.screen?.brightnessHbmNits;
    const brightnessManual = product.specs?.screen?.brightnessManualNits;
    const hasBrightnessV2 = brightnessPeak !== undefined || brightnessHbm !== undefined || brightnessManual !== undefined;

    if (!hasBrightnessV2 && !product.specs?.screen?.brightness) {
      unverifiedFields.push('specs.screen.brightness');
      if (userFocusFields.includes('brightness') || userFocusFields.includes('display')) {
        warnings.push('Ekran tepe parlaklık değeri (nits) bağımsız laboratuvar veya üretici testleriyle henüz doğrulanmadı.');
      }
    }

    // 4. Golden Correction Check
    const approvedCorrections = GoldenCorrectionRegistry.getAllCorrections().filter(
      c => c.rootId === rootId && c.status === 'APPROVED'
    );

    for (const corr of approvedCorrections) {
      verifiedProvenances.push(`${corr.fieldPath} (Golden Doğrulaması: ${corr.reason})`);
    }

    // 5. Calculate overall trust score
    let baseTrust = 1.0;
    if (blockedFields.length > 0) baseTrust -= blockedFields.length * 0.15;
    if (unverifiedFields.length > 0) baseTrust -= unverifiedFields.length * 0.05;
    if (verifiedProvenances.length > 0) baseTrust = Math.min(1.0, baseTrust + 0.10);

    const overallTrustScore = Math.max(0.1, Math.min(1.0, Number(baseTrust.toFixed(2))));

    return {
      hasUnverifiedFields: unverifiedFields.length > 0,
      unverifiedFields,
      hasBlockedFields: blockedFields.length > 0,
      blockedFields,
      warnings,
      verifiedProvenances,
      overallTrustScore,
    };
  }

  public static formatTrustNotice(trust: TrustEvaluation): string {
    if (trust.warnings.length === 0) return 'Tüm temel donanım verileri doğrulanmıştır.';
    return `⚠️ Doğruluk Notu: ${trust.warnings.join(' ')}`;
  }
}
