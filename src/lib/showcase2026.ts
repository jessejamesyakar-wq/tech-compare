import { Product } from '@/lib/types';
import { getProductReleaseYear } from '@/lib/releaseYearFilter';

export interface Showcase2026Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  detailHref: string;
  compareHref: string;
  specs: string[];
  priceStatusLabel: string;
  modelFamilyKey?: string;
}

export interface Showcase2026Data {
  initialProducts: Showcase2026Product[];
  rotationPool: Showcase2026Product[];
}

export function getProductDetailHref(p: Product): string {
  const cat = p.category;
  const slug = p.slug || p.id;
  if (cat === 'smartphones') return `/phones/${encodeURIComponent(slug)}`;
  if (cat === 'laptops') return `/laptops/${encodeURIComponent(slug)}`;
  if (cat === 'tvs') return `/tvs/${encodeURIComponent(slug)}`;
  if (cat === 'tablets') return `/tablets/${encodeURIComponent(slug)}`;
  if (cat === 'monitors') return `/monitors/${encodeURIComponent(slug)}`;
  return `/${cat}/${encodeURIComponent(slug)}`;
}

export function extractShowcaseSpecs(p: Product): string[] {
  const specs: string[] = [];
  const cat = p.category;
  const s = (p.specs || {}) as any;

  if (cat === 'smartphones') {
    const chip = s.chipset || s.processor?.chip || (typeof s.processor === 'string' ? s.processor : '');
    if (chip) {
      specs.push(String(chip).replace(/\(.*?\)/g, '').replace(/Qualcomm\s*/i, '').trim());
    }
    const sz = s.screenSize ? `${s.screenSize}"` : (s.screen?.size ? s.screen.size.split('(')[0].replace(/inç/i, '"').trim() : '');
    let type = s.displayType ? s.displayType.split('(')[0].trim() : (s.screen?.type ? s.screen.type.split('(')[0].trim().replace(/Katlanabilir\s*/i, '') : '');
    type = type.replace(/Dört\s*Kavisli\s*Ekran/i, '').replace(/Ekran/i, '').trim();
    if (sz || type) {
      const fullDisp = `${sz} ${type}`.trim();
      specs.push(fullDisp.length > 28 ? fullDisp.slice(0, 28).trim() : fullDisp);
    }
    let cam = s.mainCamera ? s.mainCamera.split('+')[0].split('(')[0].trim() : (s.camera?.mainMp ? s.camera.mainMp.split(',')[0].trim() : '');
    if (cam) {
      cam = cam.replace(/\s*MP\s*MP/gi, ' MP');
      if (!cam.toLowerCase().includes('mp')) cam = `${cam} MP`;
      if (cam.length > 20) cam = cam.slice(0, 20).trim();
      specs.push(cam);
    } else {
      const bat = s.batteryCapacity ? `${s.batteryCapacity} mAh` : (s.battery?.capacitymAh ? `${s.battery.capacitymAh} mAh` : '');
      if (bat) specs.push(bat);
    }
  } else if (cat === 'laptops') {
    if (s.processor) {
      specs.push(String(s.processor).replace(/\(.*?\)/g, '').trim());
    }
    if (s.ramGb && s.storageGb) {
      const stg = s.storageGb >= 1024 ? `${s.storageGb / 1024}TB` : `${s.storageGb}GB`;
      specs.push(`${s.ramGb}GB / ${stg} SSD`);
    }
    if (s.gpu) {
      const cleanGpu = String(s.gpu).replace(/NVIDIA\s*/i, '').replace(/Laptop\s*GPU/i, 'Mobile').replace(/\(.*?\)/g, '').trim();
      specs.push(cleanGpu.length > 25 ? cleanGpu.slice(0, 25).trim() : cleanGpu);
    } else if (s.screenSizeInches) {
      specs.push(`${s.screenSizeInches}" Ekran`);
    }
  } else if (cat === 'tvs') {
    if (s.screenSizeInches && s.displayTech) {
      specs.push(`${s.screenSizeInches}" ${s.displayTech}`);
    } else if (s.screenSizeInches) {
      specs.push(`${s.screenSizeInches}" TV`);
    }
    if (s.resolution) {
      const res = s.resolution.includes('8K') ? '8K Ultra HD' : s.resolution.includes('4K') ? '4K Ultra HD' : s.resolution;
      specs.push(res);
    }
    if (s.refreshRateHz) {
      specs.push(`${s.refreshRateHz}Hz Yenileme`);
    } else if (s.smartOs) {
      specs.push(s.smartOs);
    }
  } else if (cat === 'tablets') {
    if (s.processor) {
      specs.push(String(s.processor).replace(/\(.*?\)/g, '').trim());
    }
    if (s.screenSizeInches) {
      specs.push(`${s.screenSizeInches}" ${s.panelType ? s.panelType.split('(')[0].trim() : 'Ekran'}`);
    }
    if (s.ramGb && s.storageGb) {
      specs.push(`${s.ramGb}GB / ${s.storageGb}GB`);
    }
  } else if (cat === 'monitors') {
    if (s.screenSizeInches && s.panelType) {
      specs.push(`${s.screenSizeInches}" ${s.panelType}`);
    }
    if (s.refreshRateHz) {
      specs.push(`${s.refreshRateHz}Hz / ${s.responseTimeMs || '0.03'}ms`);
    }
    if (s.resolution) {
      specs.push(String(s.resolution).split('(')[0].trim());
    }
  }

  return specs.filter(Boolean).slice(0, 3);
}

export function getModelFamilyKey(p: { brand?: string; name?: string }): string {
  const brand = (p.brand || '').toLowerCase().trim();
  const cleanName = (p.name || '')
    .toLowerCase()
    .replace(/\b(64|128|256|512)\s*(gb)?\b/gi, '')
    .replace(/\b(1|2)\s*tb\b/gi, '')
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return `${brand}::${cleanName}`;
}

export function transformToShowcaseProduct(p: Product): Showcase2026Product {
  return {
    id: p.id,
    slug: p.slug || p.id,
    name: p.name,
    brand: p.brand || '',
    category: p.category,
    image: p.image,
    detailHref: getProductDetailHref(p),
    compareHref: `/compare?d1=${encodeURIComponent(p.slug || p.id)}`,
    specs: extractShowcaseSpecs(p),
    priceStatusLabel: 'Güncel teklif doğrulanmadı',
    modelFamilyKey: getModelFamilyKey(p)
  };
}

export const ROTATION_INTERVAL_MS = 240000; // 4 minutes exact interval
export const ROTATION_CARDS_COUNT = 5; // Exactly 5 cards changed per cycle
export const ROTATION_TRANSITION_MS = 350; // Fade animation duration

/**
 * Controlled Random Rotation Selection
 * Replaces exactly 5 visible slots per cycle from rotationPool while strictly enforcing:
 * 1. Zero duplicate products across all 14 visible cards.
 * 2. Zero duplicate model families across all 14 visible cards.
 * 3. Recent-history exclusion (avoiding items shown in the previous 2 cycles where alternatives exist).
 * 4. Preservation of category diversity.
 * 5. Brand clustering <= 2 visible products per brand.
 * 6. Alternation of replacement slots between cycles.
 */
export function selectControlledRotation(
  currentVisible: Showcase2026Product[],
  rotationPool: Showcase2026Product[],
  lastReplacedSlots: number[] = [],
  historySets: Set<string>[] = []
): {
  newVisible: Showcase2026Product[];
  replacedSlots: number[];
} {
  const totalSlots = currentVisible.length;
  if (totalSlots === 0 || rotationPool.length === 0) {
    return { newVisible: currentVisible, replacedSlots: [] };
  }

  // Shuffle helper
  const shuffle = <T>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Group current slots by category (0..3 phones, 4..7 laptops, 8..10 tvs, 11..12 tablets, 13 monitor)
  const slotsByCategory: Record<string, number[]> = {};
  currentVisible.forEach((p, idx) => {
    if (!slotsByCategory[p.category]) slotsByCategory[p.category] = [];
    slotsByCategory[p.category].push(idx);
  });

  // Current active IDs and Model Families
  const activeIds = new Set<string>(currentVisible.map((p) => p.id));
  const activeModelFamilies = new Set<string>(
    currentVisible.map((p) => p.modelFamilyKey || getModelFamilyKey(p))
  );

  // Combined recent history from the previous 2 cycles
  const recentHistoryIds = new Set<string>();
  for (const set of historySets) {
    for (const id of set) {
      recentHistoryIds.add(id);
    }
  }

  // Brand frequency tracker
  const brandCounts: Record<string, number> = {};
  for (const p of currentVisible) {
    const b = (p.brand || '').toLowerCase();
    brandCounts[b] = (brandCounts[b] || 0) + 1;
  }

  const chosenSlots: number[] = [];
  const newVisible = [...currentVisible];

  // Prioritize slots that were NOT replaced in the previous cycle
  const getPrioritizedSlots = (cat: string, maxPick: number): number[] => {
    const slots = slotsByCategory[cat] || [];
    const notRecent = slots.filter((s) => !lastReplacedSlots.includes(s));
    const recent = slots.filter((s) => lastReplacedSlots.includes(s));
    return [...shuffle(notRecent), ...shuffle(recent)].slice(0, maxPick);
  };

  // Build candidate slot order spanning categories:
  // Phones: up to 2, Laptops: up to 2, TVs: up to 2, Tablets: up to 1
  const candidateSlotQueue = [
    ...getPrioritizedSlots('smartphones', 2),
    ...getPrioritizedSlots('laptops', 2),
    ...getPrioritizedSlots('tvs', 2),
    ...getPrioritizedSlots('tablets', 1),
    ...getPrioritizedSlots('smartphones', 4), // overflow fallbacks
    ...getPrioritizedSlots('laptops', 4),
    ...getPrioritizedSlots('tvs', 3)
  ];

  // Deduplicate queue preserving order
  const uniqueCandidateSlots = Array.from(new Set(candidateSlotQueue));

  for (const slotIdx of uniqueCandidateSlots) {
    if (chosenSlots.length >= ROTATION_CARDS_COUNT) break;

    const oldProduct = currentVisible[slotIdx];
    const targetCategory = oldProduct.category;

    // Temporarily release old product to check replacements
    activeIds.delete(oldProduct.id);
    const oldFam = oldProduct.modelFamilyKey || getModelFamilyKey(oldProduct);
    activeModelFamilies.delete(oldFam);
    const oldBrand = (oldProduct.brand || '').toLowerCase();
    brandCounts[oldBrand] = Math.max(0, (brandCounts[oldBrand] || 1) - 1);

    // Candidates must match category, not be active, and not share active model family
    const candidates = rotationPool.filter((p) => {
      if (p.category !== targetCategory) return false;
      if (activeIds.has(p.id)) return false;
      const fam = p.modelFamilyKey || getModelFamilyKey(p);
      if (activeModelFamilies.has(fam)) return false;
      return true;
    });

    if (candidates.length === 0) {
      // Revert release and continue
      activeIds.add(oldProduct.id);
      activeModelFamilies.add(oldFam);
      brandCounts[oldBrand] = (brandCounts[oldBrand] || 0) + 1;
      continue;
    }

    // Tier 1: Not in recent history AND brand count < 2
    let tiered = candidates.filter((p) => {
      const b = (p.brand || '').toLowerCase();
      const notInHistory = !recentHistoryIds.has(p.id);
      const brandOk = (brandCounts[b] || 0) < 2;
      return notInHistory && brandOk;
    });

    // Tier 2: Not in recent history (relax brand count)
    if (tiered.length === 0) {
      tiered = candidates.filter((p) => !recentHistoryIds.has(p.id));
    }

    // Tier 3: Brand count < 2 (relax recent history)
    if (tiered.length === 0) {
      tiered = candidates.filter((p) => {
        const b = (p.brand || '').toLowerCase();
        return (brandCounts[b] || 0) < 2;
      });
    }

    // Tier 4: Any candidate matching category & family uniqueness
    if (tiered.length === 0) {
      tiered = candidates;
    }

    // Pick random candidate from best tier
    const selected = tiered[Math.floor(Math.random() * tiered.length)];

    // Apply replacement
    newVisible[slotIdx] = selected;
    activeIds.add(selected.id);
    const fam = selected.modelFamilyKey || getModelFamilyKey(selected);
    activeModelFamilies.add(fam);

    const b = (selected.brand || '').toLowerCase();
    brandCounts[b] = (brandCounts[b] || 0) + 1;

    chosenSlots.push(slotIdx);
  }

  return {
    newVisible,
    replacedSlots: chosenSlots
  };
}

export function get2026ShowcaseData(allProducts: Product[]): Showcase2026Data {
  // Deduplicate products by id/slug
  const seenIds = new Set<string>();
  const uniqueProducts: Product[] = [];
  for (const p of allProducts) {
    const key = p.slug || p.id;
    if (!seenIds.has(key)) {
      seenIds.add(key);
      uniqueProducts.push(p);
    }
  }

  // Filter valid 2026 items with verified images
  const valid2026 = uniqueProducts.filter((p) => {
    const yr = getProductReleaseYear(p);
    if (yr !== 2026) return false;
    if (!p.name || p.name.trim().length === 0) return false;
    if (!p.image || p.image.trim().length === 0) return false;
    if (p.image.includes('placeholder') || p.image === '/images/product-placeholder.png') return false;
    return true;
  });

  const byCategory: Record<string, Product[]> = {
    smartphones: [],
    laptops: [],
    tvs: [],
    tablets: [],
    monitors: []
  };

  for (const p of valid2026) {
    if (byCategory[p.category]) {
      byCategory[p.category].push(p);
    }
  }

  function pickByCategory(items: Product[], quota: number, maxPerBrand: number = 1, preferredBrands?: string[]): Product[] {
    const byBrand: Record<string, Product[]> = {};
    const sorted = [...items].sort((a, b) => {
      const rA = a.rating || 0;
      const rB = b.rating || 0;
      if (rB !== rA) return rB - rA;
      return (b.reviewCount || 0) - (a.reviewCount || 0);
    });

    for (const p of sorted) {
      const b = p.brand || 'Other';
      if (!byBrand[b]) byBrand[b] = [];
      const fam = getModelFamilyKey(p);
      const alreadyHasFamily = byBrand[b].some((existing) => getModelFamilyKey(existing) === fam);
      if (!alreadyHasFamily) {
        byBrand[b].push(p);
      }
    }

    const brands = Object.keys(byBrand);
    if (preferredBrands && preferredBrands.length > 0) {
      brands.sort((a, b) => {
        const ia = preferredBrands.indexOf(a) !== -1 ? preferredBrands.indexOf(a) : 999;
        const ib = preferredBrands.indexOf(b) !== -1 ? preferredBrands.indexOf(b) : 999;
        return ia - ib;
      });
    }

    const result: Product[] = [];
    let round = 0;
    let added = true;

    while (added && result.length < quota) {
      added = false;
      for (const b of brands) {
        if (byBrand[b][round] && result.length < quota) {
          const brandCount = result.filter((p) => p.brand === b).length;
          if (brandCount < maxPerBrand || round > 2) {
            result.push(byBrand[b][round]);
            added = true;
          }
        }
      }
      round++;
    }
    return result;
  }

  const preferredPhoneBrands = ['Apple', 'Samsung', 'Xiaomi', 'Honor', 'Google', 'Vivo', 'OnePlus', 'Oppo', 'Sony'];
  const preferredLaptopBrands = ['Apple', 'ASUS', 'MSI', 'Casper'];
  const preferredTVBrands = ['LG', 'Samsung', 'TCL', 'Philips', 'Vestel', 'Grundig', 'Xiaomi', 'iFFALCON'];

  // Initial 14:
  // 4 phones, 4 laptops, 3 tvs, 2 tablets, 1 monitor
  const initPhones = pickByCategory(byCategory.smartphones, 4, 1, preferredPhoneBrands);
  const initLaptops = pickByCategory(byCategory.laptops, 4, 1, preferredLaptopBrands);
  const initTVs = pickByCategory(byCategory.tvs, 3, 1, preferredTVBrands);
  const initTablets = pickByCategory(byCategory.tablets, 2, 1);
  const initMonitors = pickByCategory(byCategory.monitors, 1, 1);

  const initialRaw = [
    ...initPhones,
    ...initLaptops,
    ...initTVs,
    ...initTablets,
    ...initMonitors
  ];

  const initialIds = new Set(initialRaw.map((p) => p.id));

  // Rotation pool: ~35-40 items from remaining products
  const remainingPhones = pickByCategory(byCategory.smartphones.filter((p) => !initialIds.has(p.id)), 12, 2);
  const remainingLaptops = pickByCategory(byCategory.laptops.filter((p) => !initialIds.has(p.id)), 12, 3);
  const remainingTVs = pickByCategory(byCategory.tvs.filter((p) => !initialIds.has(p.id)), 10, 2);
  const remainingTablets = pickByCategory(byCategory.tablets.filter((p) => !initialIds.has(p.id)), 4, 2);

  const poolRaw = [
    ...remainingPhones,
    ...remainingLaptops,
    ...remainingTVs,
    ...remainingTablets
  ];

  return {
    initialProducts: initialRaw.map(transformToShowcaseProduct),
    rotationPool: poolRaw.map(transformToShowcaseProduct)
  };
}
