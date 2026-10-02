// src/lib/ai/robopengu/intentEngine.ts
/**
 * Worker 1: RoboPengu Intent Engine
 * Deterministic NLP extraction of structured ShoppingIntent from Turkish user queries.
 * Zero external LLM provider lock-in.
 */

import { ShoppingIntent, BudgetConstraint, UsagePriorities, PriorityLevel, PurchaseTiming } from './types';

const KNOWN_BRANDS = [
  'apple', 'samsung', 'xiaomi', 'redmi', 'poco', 'huawei', 'honor',
  'oppo', 'realme', 'vivo', 'oneplus', 'google', 'nothing', 'motorola',
  'infinix', 'tecno', 'sony', 'asus', 'tcl', 'zte'
];

export class IntentEngine {
  public static parse(query: string, history: Array<{ role: string; content: string }> = []): ShoppingIntent {
    const rawQuery = query.trim();
    const lower = rawQuery.toLowerCase();

    // 1. Budget extraction
    const budget = this.extractBudget(lower);

    // 2. Category detection
    const category = this.detectCategory(lower);

    // 3. Brand preferences (preferred & excluded)
    const { preferredBrands, excludedBrands } = this.extractBrandPreferences(lower);

    // 4. Feature and Usage Priorities
    const priorities = this.extractPriorities(lower);

    // 5. Storage and RAM minimums
    const storageMinimumGb = this.extractStorageMinimum(lower);
    const ramMinimumGb = this.extractRamMinimum(lower);

    // 6. Purchase Timing
    const purchaseTiming = this.extractPurchaseTiming(lower);

    // 7. Must-have and Avoid features
    const { mustHaveFeatures, avoidFeatures } = this.extractFeatures(lower);

    // 8. Conflict Detection (e.g., 10000 TL with flagship SoC / 200MP camera)
    const conflict = this.detectConflicts(budget, priorities, mustHaveFeatures, storageMinimumGb);

    // 9. Follow-up Check (is query too underspecified?)
    const followUp = this.evaluateFollowUpNecessity(rawQuery, budget, priorities, preferredBrands);

    return {
      rawQuery,
      category,
      budget,
      preferredBrands,
      excludedBrands,
      usagePriorities: priorities,
      cameraPriority: priorities.camera,
      batteryPriority: priorities.battery,
      gamingPriority: priorities.gaming,
      displayPriority: priorities.display,
      performancePriority: priorities.performance,
      storageMinimumGb,
      ramMinimumGb,
      purchaseTiming,
      mustHaveFeatures,
      avoidFeatures,
      hasConflictingConstraints: conflict.hasConflict,
      conflictExplanation: conflict.explanation,
      requiresFollowUp: followUp.needed,
      followUpQuestions: followUp.questions,
    };
  }

  private static extractBudget(text: string): BudgetConstraint | undefined {
    // Matches patterns like "30000 tl", "30.000 tl", "30 bin tl", "maksimum 40000", "20000 - 30000 tl", "30k"
    const rangeMatch = text.match(/(\d+[\d\.]*)\s*(?:bin)?\s*(?:-|ile|\/)\s*(\d+[\d\.]*)\s*(?:bin)?\s*(?:tl|₺|lira)?/i);
    if (rangeMatch) {
      const minVal = this.normalizeNumber(rangeMatch[1]);
      const maxVal = this.normalizeNumber(rangeMatch[2]);
      if (maxVal > 0) {
        return {
          min: minVal,
          max: maxVal,
          target: Math.round((minVal + maxVal) / 2),
          currency: 'TRY',
          isStrict: true,
        };
      }
    }

    const singleMatch = text.match(/(?:bütçe[m|si]?\s*(?:civarı|kadar|en fazla|maksimum|maks|yaklaşık)?\s*[:=]?\s*)?(\d+[\d\.]*)\s*(bin|k)?\s*(?:tl|₺|lira|civarı|kadar|altında|maksimum|maks)?/i);
    // Find numeric candidates with "tl" or "bütçe"
    const budgetSpecificMatch = text.match(/(\d+[\d\.]*)\s*(bin|k)?\s*(?:tl|₺|lira)\s*(?:bütçe|civarı|kadar|maksimum|altında)?/i) ||
      text.match(/(?:bütçe[m]?\s*)(\d+[\d\.]*)\s*(bin|k)?/i);

    const matchToUse = budgetSpecificMatch || singleMatch;

    if (matchToUse) {
      let num = parseFloat(matchToUse[1].replace(/\./g, ''));
      const unit = matchToUse[2] ? matchToUse[2].toLowerCase() : '';
      if (unit === 'bin' || unit === 'k' || num < 100) {
        num = num * 1000;
      }
      if (num >= 1000 && num <= 300000) {
        const isStrict = text.includes('aşmasın') || text.includes('maksimum') || text.includes('en fazla') || text.includes('altında');
        return {
          max: num,
          target: num,
          currency: 'TRY',
          isStrict,
        };
      }
    }
    return undefined;
  }

  private static normalizeNumber(str: string): number {
    let clean = str.replace(/\./g, '').trim();
    let num = parseFloat(clean);
    if (num < 100) num *= 1000;
    return num;
  }

  private static detectCategory(text: string): ShoppingIntent['category'] {
    if (text.includes('tablet') || text.includes('ipad')) return 'tablets';
    if (text.includes('laptop') || text.includes('bilgisayar') || text.includes('dizüstü') || text.includes('macbook')) return 'laptops';
    if (text.includes('saat') || text.includes('watch') || text.includes('bileklik')) return 'smartwatches';
    if (text.includes('kulaklık') || text.includes('airpods') || text.includes('buds')) return 'headphones';
    if (text.includes('telefon') || text.includes('cep') || text.includes('smartphone') || text.includes('iphone') || text.includes('galaxy') || text.includes('redmi') || text.includes('xiaomi')) {
      return 'smartphones';
    }
    return 'smartphones'; // Default primary domain
  }

  private static extractBrandPreferences(text: string): { preferredBrands: string[]; excludedBrands: string[] } {
    const preferredBrands: string[] = [];
    const excludedBrands: string[] = [];

    for (const brand of KNOWN_BRANDS) {
      // Look for exclusions: "apple istemiyorum", "samsung hariç", "xiaomi olmasın", "apple dışında"
      const excludeRegex = new RegExp(`(?:${brand}|${brand}'[a-z]+)\\s*(?:istemiyorum|hariç|olmasın|dışında|almam|tercih\\s*etmiyorum|istemem)`, 'i');
      const negativeRegex = new RegExp(`(?:asla|kesinlikle|hiç)?\\s*(?:${brand})\\s*(?:olmasın|istemiyorum)`, 'i');
      const exceptRegex = new RegExp(`(?:${brand}\\s*hariç)`, 'i');

      if (excludeRegex.test(text) || negativeRegex.test(text) || exceptRegex.test(text)) {
        if (!excludedBrands.includes(brand)) excludedBrands.push(brand);
        continue;
      }

      // Look for inclusions: "apple istiyorum", "samsung düşünüyorum", "xiaomi tarafında", "samsung öncelikli"
      const includeRegex = new RegExp(`(?:${brand}|${brand}'[a-z]+)(?:\\s*(?:istiyorum|olsun|tercihim|tarafında|öncelikli|düşünüyorum|severim|markası))?`, 'i');
      if (includeRegex.test(text) && !text.includes(`${brand} istemiyorum`) && !text.includes(`${brand} hariç`)) {
        // Double check not part of a negative clause
        if (!excludedBrands.includes(brand) && text.includes(brand)) {
          if (!preferredBrands.includes(brand)) preferredBrands.push(brand);
        }
      }
    }

    return { preferredBrands, excludedBrands };
  }

  private static extractPriorities(text: string): UsagePriorities {
    const p: UsagePriorities = {
      camera: 'none',
      battery: 'none',
      gaming: 'none',
      display: 'none',
      performance: 'none',
      compactSize: 'none',
      storage: 'none',
    };

    // Camera
    if (text.includes('kamera') || text.includes('fotoğraf') || text.includes('video çekim') || text.includes('lens')) {
      if (text.includes('çok iyi kamera') || text.includes('kamera odaklı') || text.includes('profesyonel kamera') || text.includes('kamera çok iyi')) {
        p.camera = 'critical';
      } else {
        p.camera = 'high';
      }
    }

    // Battery
    if (text.includes('pil') || text.includes('batarya') || text.includes('şarj') || text.includes('kullanım süresi')) {
      if (text.includes('şarjı uzun') || text.includes('batarya canavarı') || text.includes('2 gün')) {
        p.battery = 'critical';
      } else {
        p.battery = 'high';
      }
    }

    // Gaming
    if (text.includes('oyun') || text.includes('pubg') || text.includes('gamer') || text.includes('fps')) {
      if (text.includes('oyun odaklı değilim') || text.includes('oyun oynamam') || text.includes('oyun oynamıyorum') || text.includes('oyunsuz')) {
        p.gaming = 'none';
      } else if (text.includes('ağır oyun') || text.includes('oyun canavarı') || text.includes('sadece oyun')) {
        p.gaming = 'critical';
      } else {
        p.gaming = 'high';
      }
    }

    // Display
    if (text.includes('ekran') || text.includes('amoled') || text.includes('oled') || text.includes('120hz') || text.includes('parlaklık')) {
      p.display = text.includes('ekranı çok iyi') || text.includes('film dizi') ? 'critical' : 'high';
    }

    // Performance
    if (text.includes('işlemci') || text.includes('hızlı') || text.includes('donmasın') || text.includes('kasmayan') || text.includes('amiral gemisi')) {
      p.performance = text.includes('en güçlü') || text.includes('amiral gemisi') ? 'critical' : 'high';
    }

    // Compact
    if (text.includes('küçük') || text.includes('kompakt') || text.includes('tek elle') || text.includes('hafif')) {
      p.compactSize = 'high';
    }

    return p;
  }

  private static extractStorageMinimum(text: string): number | undefined {
    const match = text.match(/(?:en az|minimum|en azından)?\s*(\d{2,4})\s*(?:gb|tb)\s*(?:depolama|hafıza|alan)?/i);
    if (match) {
      let val = parseInt(match[1], 10);
      if (text.includes('1 tb') || text.includes('1tb')) return 1024;
      if (val >= 64 && val <= 2048) {
        return val;
      }
    }
    return undefined;
  }

  private static extractRamMinimum(text: string): number | undefined {
    const match = text.match(/(\d{1,2})\s*gb\s*ram/i);
    if (match) {
      let val = parseInt(match[1], 10);
      if (val >= 4 && val <= 32) return val;
    }
    return undefined;
  }

  private static extractPurchaseTiming(text: string): PurchaseTiming {
    if (text.includes('hemen') || text.includes('acil') || text.includes('bugün')) return 'immediate';
    if (text.includes('bekleyebilirim') || text.includes('acelesi yok') || text.includes('yeni modelleri beklesem')) return 'can_wait';
    if (text.includes('indirim') || text.includes('kampanya') || text.includes('fırsat')) return 'looking_for_deals';
    return 'uncertain';
  }

  private static extractFeatures(text: string): { mustHaveFeatures: string[]; avoidFeatures: string[] } {
    const mustHaveFeatures: string[] = [];
    const avoidFeatures: string[] = [];

    if (text.includes('kablosuz şarj')) mustHaveFeatures.push('wireless_charging');
    if (text.includes('suya dayanıklı') || text.includes('ip68')) mustHaveFeatures.push('water_resistance');
    if (text.includes('nfc')) mustHaveFeatures.push('nfc');
    if (text.includes('esim')) mustHaveFeatures.push('esim');
    if (text.includes('5g')) mustHaveFeatures.push('5g');
    if (text.includes('kulaklık girişi') || text.includes('3.5mm') || text.includes('jack')) mustHaveFeatures.push('headphone_jack');
    if (text.includes('sd kart') || text.includes('hafıza kartı')) mustHaveFeatures.push('sd_card');

    return { mustHaveFeatures, avoidFeatures };
  }

  private static detectConflicts(
    budget: BudgetConstraint | undefined,
    priorities: UsagePriorities,
    mustHave: string[],
    storageMin?: number
  ): { hasConflict: boolean; explanation?: string } {
    if (!budget || !budget.max) return { hasConflict: false };

    // Example 1: 10,000 TL with flagship processor or 200MP camera
    if (budget.max <= 12000 && (priorities.performance === 'critical' || priorities.camera === 'critical')) {
      return {
        hasConflict: true,
        explanation: `${budget.max.toLocaleString('tr-TR')} TL bütçe seviyesinde amiral gemisi işlemci veya 200MP profesyonel kamera donanımı bulunmamaktadır. Bu bütçede giriş-orta segment dengeli cihazlar veya önceki nesil fiyat/performans alternatifleri hedeflenecektir.`,
      };
    }

    // Example 2: 15,000 TL with 512GB or 1TB storage
    if (budget.max <= 15000 && storageMin && storageMin >= 512) {
      return {
        hasConflict: true,
        explanation: `${budget.max.toLocaleString('tr-TR')} TL bütçe sınırında en az ${storageMin} GB dahili depolama sunan güncel model seçeneği son derece kısıtlıdır. 256 GB veya SD kart destekli alternatifler önerilebilir.`,
      };
    }

    return { hasConflict: false };
  }

  private static evaluateFollowUpNecessity(
    rawQuery: string,
    budget?: BudgetConstraint,
    priorities?: UsagePriorities,
    preferredBrands?: string[]
  ): { needed: boolean; questions: string[] } {
    const questions: string[] = [];

    // If query is fewer than 4 words and has no budget or clear priority
    const words = rawQuery.split(/\s+/).filter(Boolean);
    const hasAnyPriority = Object.values(priorities || {}).some(v => v !== 'none');

    if (words.length <= 3 && !budget && !hasAnyPriority) {
      questions.push('Bütçen için yaklaşık bir üst sınır (örneğin 20.000 TL, 40.000 TL) var mı?');
      questions.push('Telefonu en çok hangi amaçla kullanacaksın? (Kamera/Fotoğraf, Oyun, Uzun Pil Ömrü, Günlük Kullanım)');
      return { needed: true, questions };
    }

    if (!budget && words.length <= 5) {
      questions.push('Senin için en uygun modelleri listelemek adına yaklaşık bütçeni belirtebilir misin?');
      return { needed: true, questions };
    }

    return { needed: false, questions: [] };
  }
}
