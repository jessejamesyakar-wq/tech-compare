import { Product } from '@/lib/types';
import { StoreProduct } from '@/integrations/stores/types';

export interface MatchEvaluationResult {
  isMatch: boolean;
  confidenceScore: number; // 0 to 100
  matchStatus: 'MATCHED' | 'MATCH_REVIEW_REQUIRED' | 'REJECTED';
  matchedBy: 'GTIN' | 'EAN' | 'BARCODE' | 'SKU' | 'MODEL_VARIANT' | 'FUZZY_REVIEW';
  reason: string;
}

export class ProductMatcher {
  /**
   * Normalize barcode / GTIN / EAN string
   */
  static cleanBarcode(code?: string): string {
    if (!code) return '';
    return code.trim().replace(/[^0-9]/g, '');
  }

  /**
   * Normalize text tokens for fuzzy matching
   */
  static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extract key variant specs (e.g. 128GB, 256GB, 8GB RAM, Pro, Plus, Ultra, Max)
   */
  static extractVariantTokens(text: string): Set<string> {
    const norm = this.normalizeText(text);
    const tokens = new Set<string>();

    // Storage / RAM matches
    const storageMatches = norm.match(/(\d+)\s*(gb|tb|mb)/g);
    if (storageMatches) {
      storageMatches.forEach((m) => tokens.add(m.replace(/\s+/g, '')));
    }

    // Model differentiators
    const subModels = ['pro max', 'pro', 'plus', 'ultra', 'max', 'mini', 'fe', 'lite', 'se', 'ti', 'super', 'oled', 'qled'];
    for (const sub of subModels) {
      if (norm.includes(sub)) {
        tokens.add(sub);
      }
    }

    return tokens;
  }

  /**
   * Match a canonical product with a store product listing
   */
  static evaluateMatch(
    canonical: Product,
    candidate: StoreProduct
  ): MatchEvaluationResult {
    const canBarcode = this.cleanBarcode(canonical.barcode);
    const candBarcode = this.cleanBarcode(candidate.barcode);

    // 1. Direct GTIN / EAN / Barcode Exact Match
    if (canBarcode && candBarcode && canBarcode === candBarcode && canBarcode.length >= 8) {
      return {
        isMatch: true,
        confidenceScore: 100,
        matchStatus: 'MATCHED',
        matchedBy: 'BARCODE',
        reason: `Birebir Barkod/GTIN/EAN Eşleşmesi (${canBarcode})`,
      };
    }

    // 2. Direct SKU Exact Match
    if (candidate.storeSku && canonical.id.toLowerCase() === candidate.storeSku.toLowerCase()) {
      return {
        isMatch: true,
        confidenceScore: 98,
        matchStatus: 'MATCHED',
        matchedBy: 'SKU',
        reason: `Birebir SKU Eşleşmesi (${candidate.storeSku})`,
      };
    }

    // 3. Brand & Model Strict Verification
    const canTitleNorm = this.normalizeText(`${canonical.brand} ${canonical.name}`);
    const candTitleNorm = this.normalizeText(candidate.title);
    const canBrandNorm = this.normalizeText(canonical.brand);

    // Must match brand first
    if (!candTitleNorm.includes(canBrandNorm)) {
      return {
        isMatch: false,
        confidenceScore: 0,
        matchStatus: 'REJECTED',
        matchedBy: 'MODEL_VARIANT',
        reason: 'Marka uyuşmazlığı',
      };
    }

    // Check variant differences (e.g. Pro vs Non-Pro, 128GB vs 256GB)
    const canVariants = this.extractVariantTokens(canonical.name);
    const candVariants = this.extractVariantTokens(candidate.title);

    let variantConflict = false;
    for (const v of canVariants) {
      if (v.includes('pro') && !candVariants.has(v)) variantConflict = true;
      if (v.includes('ultra') && !candVariants.has(v)) variantConflict = true;
      if (v.includes('max') && !candVariants.has(v)) variantConflict = true;
      if (v.includes('gb') && !candVariants.has(v)) variantConflict = true;
    }

    if (variantConflict) {
      return {
        isMatch: false,
        confidenceScore: 20,
        matchStatus: 'REJECTED',
        matchedBy: 'MODEL_VARIANT',
        reason: 'Model varyant veya depolama uyuşmazlığı (örn: Pro vs Standart veya GB farkı)',
      };
    }

    // 4. Token Overlap Scoring
    const canWords = canTitleNorm.split(' ').filter((w) => w.length > 1);
    let matchedWords = 0;

    for (const word of canWords) {
      if (candTitleNorm.includes(word)) {
        matchedWords++;
      }
    }

    const overlapRatio = matchedWords / canWords.length;

    if (overlapRatio >= 0.85) {
      return {
        isMatch: true,
        confidenceScore: Math.round(overlapRatio * 100),
        matchStatus: 'MATCHED',
        matchedBy: 'MODEL_VARIANT',
        reason: `Yüksek model başlık uyumu (%${Math.round(overlapRatio * 100)})`,
      };
    }

    if (overlapRatio >= 0.65) {
      return {
        isMatch: true,
        confidenceScore: Math.round(overlapRatio * 100),
        matchStatus: 'MATCH_REVIEW_REQUIRED',
        matchedBy: 'FUZZY_REVIEW',
        reason: `Orta seviye uyum (%${Math.round(overlapRatio * 100)}), admin onayı gerekiyor`,
      };
    }

    return {
      isMatch: false,
      confidenceScore: Math.round(overlapRatio * 100),
      matchStatus: 'REJECTED',
      matchedBy: 'MODEL_VARIANT',
      reason: 'Yetersiz başlık benzerliği',
    };
  }
}
