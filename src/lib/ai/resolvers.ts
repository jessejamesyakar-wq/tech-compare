// src/lib/ai/resolvers.ts
/**
 * Robust replacements for resolveCompareProducts / resolveBudgetRecommendation.
 * Pure catalog lookups — fast, deterministic, and unit testable.
 */

import { getStoredProducts } from "@/lib/adminData";
import { detectCategory, type CatalogCategory } from "./categoryMatcher";
import { buildComparisonRows } from "./specFields";
import { getFallbackProductImage } from "./fallbackImages";

export interface ResolverResult<T> {
  ok: boolean;
  data?: T;
  message?: string;
}

const SEARCH_STOP_WORDS = new Set([
  "nasil", "sence", "hakkinda", "bilgi", "ver", "onerir", "onerirsin", "oner", "tavsiye",
  "eder", "edersin", "elimde", "var", "alacagim", "almak", "istiyorum", "alinir", "mi",
  "mu", "hangisi", "hangileri", "ne", "kadar", "fiyat", "fiyati", "kac", "para",
  "tl", "lira", "butce", "butcem", "civari", "bandi", "arasi", "modelleri", "goremiyorum",
  "goster", "bana", "icin", "ile", "ve", "veya", "en", "iyi", "cok", "daha", "bir", "bu",
  "su", "o", "karsilastir", "kiyasla", "merhaba", "selam", "dostum", "nerede", "bulamiyor",
  "telefon", "cihaz", "model", "kendime", "cocuguma", "esime", "anneme", "babama",
  "arkadasima", "kardesime", "hayali", "olan", "hediye", "hediyelik", "lik", "luk"
]);

export function searchProductsInCatalog(
  query: string,
  limit: number = 3
): any[] {
  if (!query || typeof query !== "string") return [];
  const catalog = getStoredProducts();
  const normMsg = normalizeTr(query);
  const expandedMsg = normMsg
    .replace(/(\d+)([a-z]+)/g, "$1 $2")
    .replace(/([a-z]+)(\d+)/g, "$1 $2")
    .replace(/promax/g, "pro max");

  const rawTokens = [...new Set([...normMsg.split(/\s+/), ...expandedMsg.split(/\s+/)])];
  const words = rawTokens.filter((w) => w.length >= 2 && !SEARCH_STOP_WORDS.has(w));
  if (words.length === 0) return [];

  const cleanQ = cleanAlphanumeric(query);

  const scoredProds = catalog
    .map((p) => {
      const pName = normalizeTr(p.name || "");
      const pBrand = normalizeTr(p.brand || "");
      const cleanP = cleanAlphanumeric(p.name || "");
      const haystack = `${pName} ${pBrand}`;

      let score = 0;

      // Exact clean substring match (e.g. "galaxy a16" in "samsung galaxy a16 5g")
      if (cleanQ.length >= 4 && cleanP.includes(cleanQ)) {
        score += 150;
      }

      // Word matches
      let matchedCount = 0;
      for (const w of words) {
        if (haystack.includes(w)) {
          matchedCount++;
          if (/\d+/.test(w)) score += 30; // Model number match boost
          else score += 15;
        }
      }

      const matchRatio = words.length > 0 ? matchedCount / words.length : 0;
      if (matchRatio < 0.4 && score < 50) return null;

      score += matchRatio * 60;

      return { product: p, score, matchedCount };
    })
    .filter((entry): entry is { product: any; score: number; matchedCount: number } => entry !== null)
    .sort((a, b) => b.score - a.score || b.matchedCount - a.matchedCount);

  // Deduplicate base models
  const seenBase = new Set<string>();
  const result: any[] = [];
  for (const s of scoredProds) {
    const baseName = (s.product.name || "")
      .replace(/\s*\(\d+\s*(?:gb|tb)\)/i, "")
      .replace(/\s+\d+\s*(?:gb|tb)\b/i, "")
      .trim()
      .toLowerCase();
    if (!seenBase.has(baseName)) {
      seenBase.add(baseName);
      result.push(s.product);
      if (result.length >= limit) break;
    }
  }

  return result;
}

export function extractExplicitTargetProduct(text: string): any | null {
  if (!text || typeof text !== "string") return null;
  const catalog = getStoredProducts();
  const norm = normalizeTr(text);

  const explicitRules = [
    { regex: /\bapple\s*watch\s*se\b/i, idPrefix: "apple-watch-se" },
    { regex: /\bapple\s*watch\s*ultra\b/i, idPrefix: "apple-watch-ultra" },
    { regex: /\bapple\s*watch\s*s(?:eries)?\s*10\b/i, idPrefix: "apple-watch-s10" },
    { regex: /\bapple\s*watch\b/i, idPrefix: "apple-watch" },
    { regex: /\bgalaxy\s*watch\b/i, idPrefix: "samsung-galaxy-watch" },
    { regex: /\biphone\s*18\b/i, idPrefix: "iphone-18" },
    { regex: /\biphone\s*17\b/i, idPrefix: "iphone-17" },
    { regex: /\biphone\s*16\b/i, idPrefix: "iphone-16" },
    { regex: /\b(?:galaxy\s*)?s26\b/i, idPrefix: "samsung-galaxy-s26" },
    { regex: /\b(?:galaxy\s*)?s25\b/i, idPrefix: "samsung-galaxy-s25" },
    { regex: /\b(?:galaxy\s*)?s24\b/i, idPrefix: "samsung-galaxy-s24" },
  ];

  for (const rule of explicitRules) {
    if (rule.regex.test(norm)) {
      const match = catalog.find((p) => p.id && p.id.startsWith(rule.idPrefix));
      if (match) return match;
    }
  }

  return null;
}

export function formatProductRecommendations(products: any[]): any[] {
  return products.map((p) => {
    const validOffers = Array.isArray(p.storeOffers)
      ? p.storeOffers.filter((o: any) => o && o.price > 0).sort((a: any, b: any) => a.price - b.price)
      : [];
    const cheapestPrice = validOffers[0]?.price || p.basePrice || p.price || 0;
    const cheapestStore = validOffers[0]?.storeName || "En Uygun Mağaza";

    return {
      productId: p.id,
      slug: p.slug || p.id,
      productName: p.name,
      category: p.category === "smartphones" ? "phones" : p.category,
      price: cheapestPrice,
      image: p.image || (Array.isArray(p.images) ? p.images[0] : "") || getFallbackProductImage(p.name, p.brand, p.category),
      reason: `${p.brand || "Katalog"} güncel modeli`,
      cheapestStore: cheapestStore,
    };
  });
}

export function normalizeTr(text: string): string {
  if (!text) return "";
  let s = text
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .trim();

  // Strip common Turkish grammatical inflection suffixes attached to model keywords
  // e.g. "promaxi" -> "promax", "proyu" -> "pro", "ultrayı" -> "ultra", "s24'e" -> "s24"
  s = s.replace(/\b([a-z0-9]+?)(?:yi|yı|yu|yü|ye|ya|de|da|te|ta|den|dan|ten|tan|[iuüea])\b/gi, (match, base) => {
    if (/(?:max|pro|ultra|plus|mini|air|fe|lite|fold|flip|tab|note|\d+)$/i.test(base)) {
      return base;
    }
    return match;
  });

  return s;
}

export function cleanAlphanumeric(text: string): string {
  if (!text) return "";
  return normalizeTr(text).replace(/[^a-z0-9]/g, "");
}

export function findProductByNameOrId(products: any[], nameOrId: string) {
  if (!nameOrId || typeof nameOrId !== "string") return null;
  const normalized = normalizeTr(nameOrId);
  const directId = products.find((p) => p.id === nameOrId || p.slug === nameOrId);
  if (directId) return directId;

  // Direct brand synonyms to flagship products
  const brandFlagships: Record<string, string> = {
    dream: "dreame-bot-l20-ultra",
    dreame: "dreame-bot-l20-ultra",
    roborock: "roborock-saros-20-sonic",
    playstation: "console-960253", // PS5 Pro
    ps5: "console-960253",
    xbox: "console-447547", // Xbox Series X
    dyson: "dyson-v15-detect",
  };

  if (brandFlagships[normalized]) {
    const flagship = products.find((p) => p.id === brandFlagships[normalized]);
    if (flagship) return flagship;
  }

  const directExactName = products.find((p) => normalizeTr(p.name) === normalized);
  if (directExactName) return directExactName;

  if (normalized.length >= 3) {
    const candidates = products.filter((p) => normalizeTr(p.name).includes(normalized));
    if (candidates.length > 0) {
      const hasMax = normalized.includes("max");
      const hasPlus = normalized.includes("plus");
      const hasUltra = normalized.includes("ultra");
      const hasPro = normalized.includes("pro");

      const exactRanked = candidates.filter((p) => {
        const pNorm = normalizeTr(p.name);
        if (!hasMax && pNorm.includes("max")) return false;
        if (!hasPlus && pNorm.includes("plus")) return false;
        if (!hasUltra && pNorm.includes("ultra")) return false;
        if (!hasPro && pNorm.includes("pro")) return false;
        return true;
      });

      const listToSort = exactRanked.length > 0 ? exactRanked : candidates;
      const sorted = [...listToSort].sort((a, b) => {
        const scoreA = a.aceleEtmeScore ?? a.epeyScore ?? 80;
        const scoreB = b.aceleEtmeScore ?? b.epeyScore ?? 80;
        const priceA = a.basePrice || a.price || 0;
        const priceB = b.basePrice || b.price || 0;
        return (scoreB * 1000 + priceB) - (scoreA * 1000 + priceA);
      });

      return sorted[0];
    }
  }

  // Space-insensitive alphanumeric search (e.g. "iphone 18promax" matches "Apple iPhone 18 Pro Max")
  const cleanQ = cleanAlphanumeric(nameOrId);
  if (cleanQ.length >= 3) {
    const alphaMatches = products.filter((p) => cleanAlphanumeric(p.name).includes(cleanQ));
    if (alphaMatches.length > 0) {
      const hasMax = cleanQ.includes("max");
      const hasPlus = cleanQ.includes("plus");
      const hasUltra = cleanQ.includes("ultra");
      const hasPro = cleanQ.includes("pro");

      const exactRanked = alphaMatches.filter((p) => {
        const cleanP = cleanAlphanumeric(p.name);
        if (!hasMax && cleanP.includes("max")) return false;
        if (!hasPlus && cleanP.includes("plus")) return false;
        if (!hasUltra && cleanP.includes("ultra")) return false;
        if (!hasPro && cleanP.includes("pro")) return false;
        return true;
      });

      const listToSort = exactRanked.length > 0 ? exactRanked : alphaMatches;
      const sorted = [...listToSort].sort((a, b) => {
        const scoreA = a.aceleEtmeScore ?? a.epeyScore ?? 80;
        const scoreB = b.aceleEtmeScore ?? b.epeyScore ?? 80;
        const priceA = a.basePrice || a.price || 0;
        const priceB = b.basePrice || b.price || 0;
        return (scoreB * 1000 + priceB) - (scoreA * 1000 + priceA);
      });

      return sorted[0];
    }
  }

  const searched = searchProductsInCatalog(nameOrId, 1);
  return searched[0] ?? null;
}

export function resolveCompareProducts(
  productNames: string[] = [],
  productIds: string[] = [],
  _scenario?: string
): ResolverResult<{
  category: CatalogCategory;
  products: any[];
  rows: ReturnType<typeof buildComparisonRows>;
  winner: { id: string; reasons: string[] } | null;
}> {
  const catalog = getStoredProducts();

  const safeNames = Array.isArray(productNames)
    ? productNames
    : (typeof productNames === "string" ? (productNames as string).split(/(?:,|ve|ile|\/|vs\.?)\s+/).filter(Boolean) : []);
  const safeIds = Array.isArray(productIds) ? productIds : [];
  const identifiers = [...safeIds, ...safeNames].filter(Boolean);

  if (identifiers.length < 2) {
    return {
      ok: false,
      message:
        "Kıyaslamak için en az iki ürün ismi belirtir misin? Örneğin 'iPhone 17 Pro Max ile Galaxy S26 Ultra'yı kıyasla' gibi. 🐧",
    };
  }

  const matched = identifiers
    .map((idOrName) => findProductByNameOrId(catalog, idOrName))
    .filter(Boolean) as any[];

  if (matched.length < 2) {
    const missingCount = identifiers.length - matched.length;
    return {
      ok: false,
      message: `Üzgünüm, belirttiğin ürünlerden ${missingCount} tanesini kataloğumuzda bulamadım. Tam model adını tekrar yazar mısın? 🐧`,
    };
  }

  // Guard against mismatched-category comparisons (e.g. TV vs headphones)
  const categories = new Set(matched.map((p) => p.category));
  if (categories.size > 1) {
    return {
      ok: false,
      message:
        "Bu ürünler farklı kategorilerden (" +
        [...categories].join(", ") +
        "), doğrudan kıyaslamak yanıltıcı olur. Aynı kategoriden ürünlerle tekrar dener misin? 🐧",
    };
  }

  const category = matched[0].category as CatalogCategory;
  const rows = buildComparisonRows(matched, category);

  // Pure Technology & Hardware Superiority winner logic (Not price-based)
  const winCounts = matched.map(() => 0);
  const techVictories: string[][] = matched.map(() => []);

  rows.forEach((row: any) => {
    if (typeof row.superiorIdx === "number" && row.superiorIdx >= 0 && row.superiorIdx < matched.length) {
      winCounts[row.superiorIdx]++;
      techVictories[row.superiorIdx].push(`${row.label}`);
    }
  });

  const sorted = matched
    .map((p, idx) => ({
      product: p,
      idx,
      wins: winCounts[idx],
      victories: techVictories[idx],
      rawScore: p.aceleEtmeScore ?? p.epeyScore ?? 80,
      totalTechPower: winCounts[idx] * 12 + (p.aceleEtmeScore ?? p.epeyScore ?? 80),
    }))
    .sort((a, b) => b.totalTechPower - a.totalTechPower);

  const bestEntry = sorted[0];
  const best = bestEntry.product;
  const reasons: string[] = [];

  if (bestEntry.wins > 0) {
    reasons.push(`${bestEntry.wins} kritik donanım testinde üstünlük sağladı`);
  }
  if (bestEntry.victories.length > 0) {
    reasons.push(`Öne Çıkanlar: ${bestEntry.victories.slice(0, 3).join(", ")}`);
  }
  const bestScore = best.aceleEtmeScore ?? best.epeyScore;
  if (bestScore != null) {
    reasons.push(`aceleEtme Donanım Skoru: ${bestScore}/100`);
  }

  return {
    ok: true,
    data: {
      category,
      products: matched,
      rows,
      winner: { id: best.id, reasons },
    },
  };
}

export function isFollowUpQuery(text: string): boolean {
  if (!text || typeof text !== "string") return false;
  const norm = normalizeTr(text);
  return (
    norm.includes("goremiyorum") ||
    norm.includes("goremıyorum") ||
    norm.includes("hangileri") ||
    norm.includes("hangi telefon") ||
    norm.includes("hangi model") ||
    norm.includes("modeller nerede") ||
    norm.includes("modelleri goster") ||
    norm.includes("kartlar nerede") ||
    norm.includes("kartlari goremiyorum") ||
    norm.includes("tavsiyelerin nerede") ||
    norm.includes("bulamadim") ||
    norm.includes("onerilerini goster") ||
    norm.includes("linklerini ver") ||
    norm.includes("listele") ||
    norm === "hangisi" ||
    norm === "neler" ||
    norm === "hangilerini sectin" ||
    norm === "hangi 3 model"
  );
}

export function extractBudgetFromText(text: string): { budget: number } | null {
  if (!text || typeof text !== "string") return null;
  const lower = text.toLowerCase().replace(/['’]/g, "");

  // 1. Range e.g. '30-40 bin', '30.000 - 40.000 tl'
  const rangeMatch = lower.match(/(\d+(?:[.,]\d{3})*|\d+)\s*(?:-|ile|\/)\s*(\d+(?:[.,]\d{3})*|\d+)\s*(?:bin|k\b|tl|lira|₺)/i);
  if (rangeMatch) {
    let n2 = parseInt(rangeMatch[2].replace(/[.,]/g, ""), 10);
    if (/bin|k\b/i.test(lower) && n2 < 1000) n2 *= 1000;
    if (n2 >= 1000 && n2 <= 500000) return { budget: n2 };
  }

  // 2. 'bin' or 'k' format: '40 bin', '40bin', '40 k', '40k', '40.5 bin'
  const binMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:bin|k\b)(?:\s*(?:tl|lira|₺))?/i);
  if (binMatch) {
    const rawNum = parseFloat(binMatch[1].replace(",", "."));
    if (!isNaN(rawNum) && rawNum > 0 && rawNum < 1000) {
      return { budget: Math.round(rawNum * 1000) };
    }
  }

  // 3. Full numeric format: '40.000 TL', '40000 TL', '40.000₺', '40.000 civarı', 'bütçem 40.000'
  const tlMatch = lower.match(/(\d{1,3}(?:\.\d{3})+|\d{4,6})\s*(?:tl|lira|₺|civarı|civari|bandı|bandinda|arasi|arası|\bbutce\b|\bbütçe\b|\bfiyat\b)/i)
    || lower.match(/(?:bütçe\w*|fiyat\w*|civarı|bandında|arası)\s*(?:en fazla|maksimum)?\s*[:\s]*(\d{1,3}(?:\.\d{3})+|\d{4,6})/i);

  if (tlMatch) {
    const num = parseInt(tlMatch[1].replace(/\./g, "").replace(/,/g, ""), 10);
    if (!isNaN(num) && num >= 1000 && num <= 500000) {
      return { budget: num };
    }
  }

  return null;
}

export function resolveBudgetRecommendation(
  budgetTL: any,
  category?: string,
  preferredBrand?: string
): ResolverResult<{ products: any[]; category: CatalogCategory | "all" }> {
  const numericBudget = typeof budgetTL === "number"
    ? budgetTL
    : parseInt(String(budgetTL || "").replace(/[^\d]/g, ""), 10) || 0;

  if (!numericBudget || numericBudget <= 0) {
    return {
      ok: false,
      message: "Bütçenin ne kadar olduğunu TL cinsinden yazar mısın? Örneğin '40.000 TL'. 🐧",
    };
  }

  const catalog = getStoredProducts();

  let resolvedCategory: CatalogCategory | "all" = category === "all" ? "all" : "smartphones";
  if (category && category !== "all") {
    const detected = detectCategory(category);
    resolvedCategory = detected.category ?? "smartphones";
  }

  const TOLERANCE = 0.20;
  const minPrice = numericBudget * (1 - TOLERANCE);
  const maxPrice = numericBudget * (1 + TOLERANCE);

  let candidates = catalog.filter((p: any) => {
    const cat = p.category === "smartphones" ? "smartphones" : p.category;
    if ((resolvedCategory as string) !== "all" && cat !== resolvedCategory) return false;
    const price = p.basePrice || p.price || 0;
    return price >= minPrice && price <= maxPrice;
  });

  if (candidates.length === 0) {
    candidates = catalog.filter((p: any) => {
      const cat = p.category === "smartphones" ? "smartphones" : p.category;
      if ((resolvedCategory as string) !== "all" && cat !== resolvedCategory) return false;
      const price = p.basePrice || p.price || 0;
      return price <= numericBudget * 1.3 && price >= numericBudget * 0.5;
    });
  }

  // Deduplicate base models (e.g. don't show multiple storage variants of the same phone)
  const seenModels = new Set<string>();
  const deduped: any[] = [];
  for (const c of candidates) {
    const baseKey = (c.name || "")
      .replace(/\s*\(\d+\s*(?:gb|tb)\)/i, "")
      .replace(/\s+\d+\s*(?:gb|tb)\b/i, "")
      .trim()
      .toLowerCase();
    if (!seenModels.has(baseKey)) {
      seenModels.add(baseKey);
      deduped.push(c);
    }
  }

  if (deduped.length === 0) {
    return {
      ok: false,
      message:
        "Bu bütçe ve kategoride kataloğumuzda uygun bir ürün bulamadım. Bütçeni biraz güncelleyebilir misin? 🐧",
    };
  }

  const getProductModelScore = (p: any) => {
    if (p.aceleEtmeScore) return p.aceleEtmeScore;
    if (p.epeyScore) return p.epeyScore;
    const name = (p.name || "").toLowerCase();
    let base = 80;
    if (/(?:s26|iphone 18|iphone 17|m5|gen 5)/i.test(name)) base = 95;
    else if (/(?:s25|iphone 16|iphone air|gen 4|k90|f8)/i.test(name)) base = 92;
    else if (/(?:s24|iphone 15|k80|f7)/i.test(name)) base = 88;
    else if (/(?:s23|iphone 14|fold 5|flip 5)/i.test(name)) base = 84;
    else if (/(?:s22|iphone 13|fold 4|flip 4)/i.test(name)) base = 79;
    else if (/(?:fold 3|flip 3|iphone 12)/i.test(name)) base = 75;
    else if (/(?:fold 2|iphone 11)/i.test(name)) base = 70;
    return base;
  };

  // Sort all candidates by model score
  deduped.sort((a, b) => getProductModelScore(b) - getProductModelScore(a));

  const normPreferredBrand = preferredBrand ? normalizeTr(preferredBrand) : "";
  const finalPicks: any[] = [];
  const pickedBrands = new Set<string>();

  // 1. If preferred brand specified, take the best model of that brand
  if (normPreferredBrand) {
    const preferredPick = deduped.find((p) => normalizeTr(p.brand || "").includes(normPreferredBrand));
    if (preferredPick) {
      finalPicks.push(preferredPick);
      pickedBrands.add(normalizeTr(preferredPick.brand || ""));
    }
  }

  // 2. Add top models from distinct other brands to ensure diversity
  for (const c of deduped) {
    if (finalPicks.includes(c)) continue;
    const b = normalizeTr(c.brand || "");
    if (!pickedBrands.has(b)) {
      finalPicks.push(c);
      pickedBrands.add(b);
      if (finalPicks.length >= 3) break;
    }
  }

  // 3. If still fewer than 3, fill from remaining top candidates
  for (const c of deduped) {
    if (!finalPicks.includes(c)) {
      finalPicks.push(c);
      if (finalPicks.length >= 3) break;
    }
  }

  return { ok: true, data: { products: finalPicks, category: resolvedCategory } };
}

// ---- Panel Types & Helpers ------------------------------------------

export interface ComparisonMatrixRow {
  label: string;
  key?: string;
  group?: string;
  values: string[];
  isDifferent: boolean;
  highlightIdx?: number | null;
  superiorIdx?: number | null;
}

export interface ComparisonPanelData {
  type: "comparison";
  scenario: string;
  category?: string;
  products: {
    id: string;
    slug: string;
    name: string;
    brand: string;
    category: string;
    image?: string;
    price: number;
    cheapestStore: string;
    secondCheapestStore?: string;
    secondCheapestPrice?: number;
    marketSaving?: number;
  }[];
  matrix: ComparisonMatrixRow[];
  winner: {
    productId: string;
    productName: string;
    scenario: string;
    reasons: string[];
  };
}

export interface TechNewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  tag: string;
  url?: string;
}

export interface TechNewsPanelData {
  type: "news";
  topic: string;
  articles: TechNewsArticle[];
}

export function formatComparisonData(
  data: NonNullable<ReturnType<typeof resolveCompareProducts>["data"]>,
  scenario: string = "Fiyat / Donanım Kıyaslaması"
): ComparisonPanelData {
  const winnerProduct = data.products.find((p) => p.id === data.winner?.id) || data.products[0];
  return {
    type: "comparison",
    scenario,
    category: data.category,
    products: data.products.map((p) => {
      const validOffers = Array.isArray(p.storeOffers)
        ? p.storeOffers
            .filter((o: any) => typeof o.price === "number" && o.price > 0 && o.inStock !== false)
            .sort((a: any, b: any) => a.price - b.price)
        : [];
      const cheapestStore = validOffers[0]?.storeName || "Hepsiburada";
      const cheapestPrice = validOffers[0]?.price || p.basePrice || 0;
      const secondCheapestStore = validOffers[1]?.storeName;
      const secondCheapestPrice = validOffers[1]?.price;
      const avgPrice =
        validOffers.length > 0
          ? Math.round(validOffers.reduce((acc: number, o: any) => acc + o.price, 0) / validOffers.length)
          : cheapestPrice;
      const marketSaving = avgPrice > cheapestPrice ? avgPrice - cheapestPrice : 0;

      return {
        id: p.id,
        slug: p.slug || p.id,
        name: p.name,
        brand: p.brand,
        category: p.category === "smartphones" ? "phones" : p.category || "phones",
        image: p.image || (Array.isArray(p.images) ? p.images[0] : "") || getFallbackProductImage(p.name, p.brand, p.category),
        price: cheapestPrice,
        cheapestStore,
        secondCheapestStore,
        secondCheapestPrice,
        marketSaving,
      };
    }),
    matrix: data.rows.map((r: any) => ({
      label: r.label,
      key: r.key,
      group: r.group,
      values: r.values,
      isDifferent: r.isDifferent ?? (new Set(r.values).size > 1),
      highlightIdx: r.superiorIdx,
      superiorIdx: r.superiorIdx,
    })),
    winner: {
      productId: winnerProduct.id,
      productName: winnerProduct.name,
      scenario: "Fiyat / Donanım",
      reasons: data.winner?.reasons || ["Kategorisinde öne çıkan seçim"],
    },
  };
}

export function tryExtractComparisonFromMessage(message: string): string[] | null {
  if (!message || typeof message !== "string") return null;

  // 1. İki bilinen amiral gemisi veya popüler model adı yan yana yazılmışsa (örn: "iphone 16 pro s24 ultra", "roborock saros dreame l20")
  const knownKeywords = [
    { key: "iphone 18 pro max", label: "iPhone 18 Pro Max" },
    { key: "iphone 18 pro", label: "iPhone 18 Pro" },
    { key: "iphone duo", label: "iPhone Duo" },
    { key: "iphone 17 pro max", label: "iPhone 17 Pro Max" },
    { key: "iphone 17 pro", label: "iPhone 17 Pro" },
    { key: "iphone 17", label: "iPhone 17" },
    { key: "iphone 16 pro max", label: "iPhone 16 Pro Max" },
    { key: "iphone 16 pro", label: "iPhone 16 Pro" },
    { key: "iphone 16", label: "iPhone 16" },
    { key: "s26 ultra", label: "Galaxy S26 Ultra" },
    { key: "s25 ultra", label: "Galaxy S25 Ultra" },
    { key: "s24 ultra", label: "Galaxy S24 Ultra" },
    { key: "s24 fe", label: "Galaxy S24 FE" },
    { key: "s24", label: "Galaxy S24" },
    { key: "xiaomi 15 ultra", label: "Xiaomi 15 Ultra" },
    { key: "xiaomi 14 ultra", label: "Xiaomi 14 Ultra" },
    { key: "roborock saros 20 sonic", label: "Roborock Saros 20 Sonic" },
    { key: "roborock saros 20", label: "Roborock Saros 20" },
    { key: "roborock qrevo", label: "Roborock Qrevo Curv" },
    { key: "roborock", label: "Roborock Saros 20 Sonic" },
    { key: "dreame bot l20 ultra", label: "Dreame Bot L20 Ultra" },
    { key: "dreame l20 ultra", label: "Dreame Bot L20 Ultra" },
    { key: "dreame l20", label: "Dreame Bot L20 Ultra" },
    { key: "dreame bot l10s", label: "Dreame Bot L10S Ultra" },
    { key: "dreame", label: "Dreame Bot L20 Ultra" },
    { key: "dream", label: "Dreame Bot L20 Ultra" },
    { key: "dyson v15", label: "Dyson V15 Detect" },
    { key: "dyson gen5", label: "Dyson Gen5detect" },
    { key: "dyson", label: "Dyson V15 Detect" },
    { key: "playstation 5 pro", label: "PlayStation 5 Pro" },
    { key: "playstation 5 slim", label: "PlayStation 5 Slim" },
    { key: "playstation 5", label: "PlayStation 5 Pro" },
    { key: "ps5 pro", label: "PlayStation 5 Pro" },
    { key: "ps5 slim", label: "PlayStation 5 Slim" },
    { key: "ps5", label: "PlayStation 5 Pro" },
    { key: "xbox series x", label: "Xbox Series X" },
    { key: "xbox series s", label: "Xbox Series S" },
  ];

  // 2. Doğrudan "A mu/mı/mi/mü B (mi/mu)?" veya "A'mı B'mi" kalıbı (örn: "Roborock mu Dream'mi", "PS5 mi Xbox mı")
  const questionParticleMatch = message.match(
    /\b([A-Za-z0-9\-_]{2,})\s*(?:['’]?(?:mu|mı|mi|mü))\s+([A-Za-z0-9\-_]{2,})(?:['’]?(?:mu|mı|mi|mü))?/i
  );
  if (questionParticleMatch) {
    let cand1 = questionParticleMatch[1].trim();
    let cand2 = questionParticleMatch[2].trim();
    cand1 = cand1.replace(/['’](?:mu|mı|mi|mü)$/i, "").trim();
    cand2 = cand2.replace(/['’](?:mu|mı|mi|mü)$/i, "").trim();

    const stopWords = new Set(["bu", "su", "o", "ne", "var", "yok", "kim", "sen", "ben", "bana", "bize", "icin", "için"]);
    if (!stopWords.has(cand1.toLowerCase()) && !stopWords.has(cand2.toLowerCase())) {
      return [cand1, cand2];
    }
  }

  const lowerMsg = message.toLowerCase();
  const foundModels: string[] = [];
  for (const item of knownKeywords) {
    if (lowerMsg.includes(item.key) && !foundModels.includes(item.label)) {
      foundModels.push(item.label);
      if (foundModels.length === 2) {
        return foundModels;
      }
    }
  }

  // 3. Doğrudan "X vs Y" veya "X karşı Y" kalıbı (Mutlaka kelime sınırıyla \b, örn: "tavsiye" içindeki "vs"yi eşleştirme!)
  const compactVsMatch = message.match(/\b([A-Za-z0-9\-_]{2,})\s+(?:vs\.?|karşı)\s+([A-Za-z0-9\-_]{2,})\b/i);
  if (compactVsMatch) {
    return [compactVsMatch[1].trim(), compactVsMatch[2].trim()];
  }

  // 4. Açık kıyaslama niyeti kontrolü (kiyasla, karsilastir, mu yoksa, hangisi daha iyi, mu, mı, mi vb.)
  const hasComparisonIntent =
    /\b(vs\.?|karşı|kiyasla|kıyasla|karsilastir|karşılaştır|karsilastirmasi|karşılaştırması|kiyaslamasi|kıyaslaması|farklari|farkları|farki|farkı|hangisi\s+daha|daha\s+iyi|hangisi\s+alınır|hangisi\s+alinir|aralarındaki\s+fark|arasındaki\s+fark|mu\s+yoksa|mı\s+yoksa|mi\s+yoksa|mü\s+yoksa|mu|mı|mi|mü)\b/i.test(
      message
    );

  // Açık bir kıyaslama niyeti yoksa sohbet cümlelerindeki "ve/ile" bağlaçlarını kıyaslama sanma!
  if (!hasComparisonIntent) {
    return null;
  }

  const clean = message
    .replace(/[,\?\!\.]+/g, " ")
    .replace(
      /\b(kiyasla|kıyasla|karsilastir|karşılaştır|karsilastirmasi|karşılaştırması|kiyaslamasi|kıyaslaması|farklari|farkları|farki|farkı|hangisi|daha|iyi|alinir|alınır|oner|öner|telefonu|televizyonu|modeli)\b/gi,
      " "
    )
    .trim();

  const splitRegex = /\s+(?:(?:mu|mı|mi|mü)\s+yoksa|yoksa|\bvs\.?\b|\bkarşı\b|\b(?:mu|mı|mi|mü)\b|ile|ve|\/)\s+/i;
  if (splitRegex.test(clean)) {
    const parts = clean
      .split(splitRegex)
      .map((s) => s.trim().replace(/^[\s,]+|[\s,]+$/g, ""))
      .filter((s) => s.length >= 3);

    if (parts.length >= 2) {
      const blacklist = new Set([
        "ta", "iye", "bana", "kendime", "kadar", "olan", "para", "butce", "bütçe",
        "telefon", "model", "hediye", "icin", "için", "urun", "ürün", "senin",
        "kardesime", "dogum", "gunu", "tavsiye", "edersin"
      ]);
      const p1 = parts[0].toLowerCase();
      const p2 = parts[1].toLowerCase();
      if (!blacklist.has(p1) && !blacklist.has(p2) && p1.length >= 3 && p2.length >= 3) {
        return [parts[0], parts[1]];
      }
    }
  }

  return null;
}

export function detectSetupOrPackageQuery(prompt: string): ComparisonPanelData | null {
  if (!prompt || typeof prompt !== "string") return null;
  const norm = normalizeTr(prompt);

  const isSalonOrSetup =
    norm.includes("playstation salon") ||
    norm.includes("ps salon") ||
    norm.includes("oyun salon") ||
    norm.includes("playstation kafe") ||
    norm.includes("konsol salon") ||
    norm.includes("gaming salon") ||
    (norm.includes("playstation") && (norm.includes("salon") || norm.includes("yenile") || norm.includes("10 adet") || norm.includes("toplu"))) ||
    (norm.includes("ps5") && (norm.includes("salon") || norm.includes("kafe") || norm.includes("yenile") || norm.includes("10 adet")));

  if (!isSalonOrSetup) return null;

  const catalog = getStoredProducts();
  const ps5Pro =
    catalog.find((p) => p.id === "console-960253") ||
    catalog.find((p) => p.name.includes("PlayStation 5 Pro")) ||
    catalog.find((p) => p.category === "consoles");

  const gamingTv =
    catalog.find((p) => p.id === "lg-oled65b46la") ||
    catalog.find((p) => p.id === "lg-oled55c34la") ||
    catalog.find((p) => p.name.includes("LG OLED") && p.name.includes("120Hz")) ||
    catalog.find((p) => p.category === "tvs" && p.name.includes("120Hz"));

  if (!ps5Pro || !gamingTv) return null;

  const ps5Price = ps5Pro.basePrice || (ps5Pro as any).price || 46759;
  const tvPrice = gamingTv.basePrice || (gamingTv as any).price || 89999;

  return {
    type: "comparison",
    scenario: "🎮 Pro PlayStation Salon & Gaming Ekipman Paketi",
    category: "consoles",
    products: [
      {
        id: ps5Pro.id,
        slug: ps5Pro.slug || ps5Pro.id,
        name: ps5Pro.name,
        brand: ps5Pro.brand || "Sony",
        category: "consoles",
        image: ps5Pro.image || (Array.isArray(ps5Pro.images) ? ps5Pro.images[0] : "") || getFallbackProductImage(ps5Pro.name, "Sony", "consoles"),
        price: ps5Price,
        cheapestStore: ps5Pro.storeOffers?.[0]?.storeName || "En Uygun Mağaza",
      },
      {
        id: gamingTv.id,
        slug: gamingTv.slug || gamingTv.id,
        name: gamingTv.name,
        brand: gamingTv.brand || "LG",
        category: "tvs",
        image: gamingTv.image || (Array.isArray(gamingTv.images) ? gamingTv.images[0] : "") || getFallbackProductImage(gamingTv.name, "LG", "tvs"),
        price: tvPrice,
        cheapestStore: gamingTv.storeOffers?.[0]?.storeName || "En Uygun Mağaza",
      },
    ],
    matrix: [
      {
        label: "İşlemci & Grafik Gücü (Hesaplama)",
        group: "processor",
        values: ["16.7 TFLOPs RDNA Grafiği & PSSR AI Yükseltme", "Ultra Hızlı α8 AI 4K Görüntü İşlemcisi"],
        isDifferent: true,
        highlightIdx: 0,
        superiorIdx: 0,
      },
      {
        label: "Ekran Yenileme & Gecikme Hızı",
        group: "screen",
        values: ["4K 120Hz & 8K VRR Akıcı Çıkış", "120Hz Native OLED evo Panel & 0.1ms GtG Tepki"],
        isDifferent: true,
        highlightIdx: 1,
        superiorIdx: 1,
      },
      {
        label: "Depolama & Oyun Kapasitesi",
        group: "processor",
        values: ["2 TB Yüksek Hızlı NVMe SSD (5.5 GB/s)", "webOS Akıllı Arayüz & Hızlı Uygulama Alanı"],
        isDifferent: true,
        highlightIdx: 0,
        superiorIdx: 0,
      },
      {
        label: "Giriş Portları & Eşzamanlılık",
        group: "build",
        values: ["HDMI 2.1 Ultra High Speed Çıkış", "4x HDMI 2.1 (ALLM, eARC, VRR, G-Sync)"],
        isDifferent: true,
        highlightIdx: 1,
        superiorIdx: 1,
      },
      {
        label: "Salon Dayanıklılığı & Soğutma",
        group: "build",
        values: ["Optimize Sıvı Metal & Sessiz Fan Mimarisi", "OLED evo Piksel Koruyucu & Düşük Mavi Işık"],
        isDifferent: false,
      },
      {
        label: "Ticari Salon & Müşteri Deneyimi",
        group: "battery",
        values: ["Maksimum Müşteri Sadakati & Kesintisiz 60-120 FPS", "Yansıma Önleyici Kaplama & 178° Geniş Görüş Açısı"],
        isDifferent: false,
      },
    ],
    winner: {
      productId: ps5Pro.id,
      productName: ps5Pro.name,
      scenario: "Ticari Salon Standartı",
      reasons: [
        "PSSR AI yükseltme ile GTA 6 ve EA Sports FC oyunlarında müşterilere gerçek 4K 60-120 FPS akıcılık",
        "2 TB dev dahili NVMe depolama ile 20+ AAA oyunu silmeden aynı anda hazır tutma",
        "LG OLED 120Hz VRR eşleşmesiyle sıfır giriş gecikmesi (0.1ms GtG) ve üst düzey müşteri deneyimi",
      ],
    },
  };
}

export function createDynamicComparisonPanel(
  productNames: string[],
  categoryHint: string = "electronics"
): ComparisonPanelData {
  const catalog = getStoredProducts();
  const rawP1 = (productNames[0] || "").trim();
  const rawP2 = (productNames[1] || "").trim();

  const c1 = rawP1 ? findProductByNameOrId(catalog, rawP1) : null;
  const c2 = rawP2 ? findProductByNameOrId(catalog, rawP2) : null;

  const finalP1Name = c1 ? c1.name : (rawP1 || "Amiral Gemisi A");
  const finalP2Name = c2 ? c2.name : (rawP2 || "Amiral Gemisi B");

  const extractBrand = (name: string) => {
    const brands = [
      "apple", "samsung", "xiaomi", "lg", "philips", "sony", "huawei", "tcl",
      "asus", "dell", "lenovo", "hp", "msi", "acer", "dyson", "vestel", "beko", "arcelik"
    ];
    const lower = name.toLowerCase();
    const found = brands.find((b) => lower.includes(b));
    return found ? found.charAt(0).toUpperCase() + found.slice(1) : name.split(" ")[0] || "Teknoloji";
  };

  const b1 = c1 ? c1.brand : extractBrand(finalP1Name);
  const b2 = c2 ? c2.brand : extractBrand(finalP2Name);

  const img1 = c1?.image || (Array.isArray(c1?.images) ? c1.images[0] : "") || getFallbackProductImage(finalP1Name, b1, categoryHint);
  const img2 = c2?.image || (Array.isArray(c2?.images) ? c2.images[0] : "") || getFallbackProductImage(finalP2Name, b2, categoryHint);

  const price1 = c1 ? (c1.basePrice || c1.price || 0) : 0;
  const price2 = c2 ? (c2.basePrice || c2.price || 0) : 0;
  const store1 = c1?.storeOffers?.[0]?.storeName || (price1 > 0 ? "En Uygun Mağaza" : "Piyasa Fiyatı");
  const store2 = c2?.storeOffers?.[0]?.storeName || (price2 > 0 ? "En Uygun Mağaza" : "Piyasa Fiyatı");

  const detectedCat = (c1?.category || c2?.category || (categoryHint !== "electronics" ? categoryHint : null) || (
    finalP1Name.toLowerCase().includes("tv") || finalP2Name.toLowerCase().includes("tv") ||
    finalP1Name.toLowerCase().includes("oled") || finalP2Name.toLowerCase().includes("qned") ? "tvs" : "smartphones"
  )) as CatalogCategory;

  // If both products are in catalog, build actual Versus/AnTuTu comparison rows!
  let matrixRows: ComparisonMatrixRow[] = [];
  if (c1 && c2) {
    const realRows = buildComparisonRows([c1, c2], detectedCat);
    if (realRows.length > 0) {
      matrixRows = realRows.map((r) => ({
        label: r.label,
        key: r.key,
        group: r.group,
        values: r.values,
        isDifferent: new Set(r.values).size > 1,
        highlightIdx: r.superiorIdx,
        superiorIdx: r.superiorIdx,
      }));
    }
  }

  // Fallback to high-level benchmark rows if catalog rows not available
  if (matrixRows.length === 0) {
    if (detectedCat === "tvs") {
      matrixRows = [
        { label: "Panel Teknolojisi", group: "screen", values: ["4K Ultra HD OLED / Mini-LED", "4K Ultra HD OLED / Mini-LED"], isDifferent: false },
        { label: "Panel Yenileme Hızı", group: "screen", values: ["120Hz / 144Hz VRR Destekli", "120Hz / 144Hz VRR Destekli"], isDifferent: false },
        { label: "Zirve Parlaklık (Nits)", group: "screen", values: ["1.500+ Nits Tepe Değeri", "1.200+ Nits Tepe Değeri"], isDifferent: true, highlightIdx: 0, superiorIdx: 0 },
        { label: "HDR & Renk Formatları", group: "screen", values: ["Dolby Vision, HDR10+, HLG", "Dolby Vision, HDR10+, HLG"], isDifferent: false },
        { label: "Yapay Zeka Görüntü İşlemcisi", group: "processor", values: [`${b1} Neural AI Processor 4K`, `${b2} AI Processor 4K`], isDifferent: false },
        { label: "Akıllı TV İşletim Sistemi", group: "processor", values: ["Google TV / webOS Akıllı Arayüz", "Google TV / webOS Akıllı Arayüz"], isDifferent: false },
        { label: "Ses Sistemi Gücü", group: "camera", values: ["40W Dolby Atmos Çok Kanallı", "20W Dolby Atmos Çok Kanallı"], isDifferent: true, highlightIdx: 0, superiorIdx: 0 },
        { label: "HDMI 2.1 & Oyun Portları", group: "build", values: ["4x HDMI 2.1 (VRR & ALLM)", "3x HDMI 2.1 (VRR & ALLM)"], isDifferent: true, highlightIdx: 0, superiorIdx: 0 },
        { label: "Enerji Verimliliği", group: "battery", values: ["F Sınıfı Eko Tasarım", "G Sınıfı Eko Tasarım"], isDifferent: false },
      ];
    } else if (detectedCat === "appliances") {
      matrixRows = [
        { label: "Maksimum Emiş Gücü (Pa)", group: "processor", values: ["18.500 Pa HyperForce Emiş Gücü", "7.000 Pa Vormax Emiş Gücü"], isDifferent: true, highlightIdx: 0, superiorIdx: 0 },
        { label: "Haritalama & AI Engel Tanıma", group: "screen", values: ["LiDAR + 3D Yapay Zeka Engel Kaçınma", "Pathfinder™ AI RGB + 3D LiDAR"], isDifferent: true, highlightIdx: 0, superiorIdx: 0 },
        { label: "Paspas & Sıcak Su Yıkama İstasyonu", group: "build", values: ["60°C Sıcak Su & Sıcak Hava Kurutma İstasyonu", "58°C Sıcak Su & Otomatik Temizleme İstasyonu"], isDifferent: false },
        { label: "Çalışma Süresi & Pil Kapasitesi", group: "battery", values: ["220 Dk Kesintisiz Temizlik", "260 Dk Kesintisiz Temizlik"], isDifferent: true, highlightIdx: 1, superiorIdx: 1 },
        { label: "Toz & Temiz Su Hazne Hacmi", group: "build", values: ["400ml Toz / 4.5L Temiz Su Tankı", "350ml Toz / 4.5L Temiz Su Tankı"], isDifferent: false },
        { label: "Çalışma Ses Seviyesi (dB)", group: "build", values: ["62 dB Sessiz Akustik Tasarım", "63 dB Sessiz Akustik Tasarım"], isDifferent: true, highlightIdx: 0, superiorIdx: 0 },
      ];
    } else if (detectedCat === "consoles") {
      matrixRows = [
        { label: "Grafik Hesaplama Gücü (TFLOPs)", group: "processor", values: ["16.7 TFLOPs RDNA Grafiği & PSSR", "10.3 TFLOPs Standart Grafik"], isDifferent: true, highlightIdx: 0, superiorIdx: 0 },
        { label: "Hedeflenen Çözünürlük & FPS", group: "screen", values: ["4K 60-120 FPS (Ray Tracing Aktif)", "Dinamik 4K 30-60 FPS"], isDifferent: true, highlightIdx: 0, superiorIdx: 0 },
        { label: "Dahili Yüksek Hızlı SSD", group: "processor", values: ["2 TB Ultra Hızlı NVMe (5.5 GB/s)", "1 TB Ultra Hızlı NVMe"], isDifferent: true, highlightIdx: 0, superiorIdx: 0 },
        { label: "HDMI 2.1 & VRR Çıkışı", group: "build", values: ["HDMI 2.1 VRR & 8K Desteği", "HDMI 2.1 VRR 4K Desteği"], isDifferent: false },
        { label: "Yapay Zeka Yükseltme Teknolojisi", group: "processor", values: ["PSSR (PlayStation Spectral Super Resolution)", "Standart Çözünürlük Ölçekleyici"], isDifferent: true, highlightIdx: 0, superiorIdx: 0 },
      ];
    } else {
      matrixRows = [
        { label: "AnTuTu v10 Benchmark Skoru", group: "processor", values: ["~2.350.000+ Puan (Amiral)", "~2.150.000+ Puan (Amiral)"], isDifferent: true, highlightIdx: 0, superiorIdx: 0 },
        { label: "İşlemci & Çip Mimarisi", group: "processor", values: [`${b1} Yeni Nesil 2-3nm Çip`, `${b2} Yeni Nesil 2-3nm Çip`], isDifferent: false },
        { label: "Ekran & Panel Teknolojisi", group: "screen", values: ["1-120Hz Dinamik LTPO OLED", "1-120Hz Dinamik LTPO OLED"], isDifferent: false },
        { label: "Tepe Parlaklık (Nits)", group: "screen", values: ["3.000+ Nits Dış Mekan", "2.800+ Nits Dış Mekan"], isDifferent: true, highlightIdx: 0, superiorIdx: 0 },
        { label: "Kamera & Optik Zoom", group: "camera", values: ["Gelişmiş Sensör & OIS", "Gelişmiş Sensör & OIS"], isDifferent: false },
        { label: "Batarya & Hızlı Şarj", group: "battery", values: ["Optimize Güç Tüketimi & Hızlı Şarj", "Yüksek Kapasite & Hızlı Şarj"], isDifferent: false },
      ];
    }
  }

  const defaultWinnerReasons =
    detectedCat === "appliances"
      ? [
          "Maksimum emiş gücü ve halı derinlemesine temizlik performansı",
          "Sıcak su paspas yıkama ve kurutma istasyonunun hijyen verimliliği",
          "3D LiDAR ve yapay zeka nesne tanıma kabiliyeti",
        ]
      : detectedCat === "consoles"
      ? [
          "16.7 TFLOPs grafik hesaplama gücü ve PSSR yapay zeka yükseltme desteği",
          "2 TB yüksek hızlı NVMe SSD depolama alanı",
          "Kararlı 4K 60-120 FPS akıcılık ve Ray Tracing performansı",
        ]
      : detectedCat === "tvs"
      ? [
          "Panel tepe parlaklığı ve HDR kontrast derinliği",
          "120Hz/144Hz VRR ve düşük giriş gecikmesi performansı",
          "Görüntü işlemcisi ve akıllı TV arayüz akıcılığı",
        ]
      : [
          "AnTuTu benchmark ve grafik performansında daha kararlı termal yönetim",
          "Kamera sensör boyutu ve optik zoom kalibrasyonu",
          "Kullanıcı memnuniyeti ve fiyat/performans değeri",
        ];

  return {
    type: "comparison",
    scenario: "Detaylı Karşılaştırma",
    category: detectedCat,
    products: [
      {
        id: c1 ? c1.id : `dyn-1`,
        slug: c1 ? (c1.slug || c1.id) : finalP1Name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: finalP1Name,
        brand: b1,
        category: c1?.category === "smartphones" ? "phones" : (c1?.category || categoryHint),
        image: img1,
        price: price1,
        cheapestStore: store1,
      },
      {
        id: c2 ? c2.id : `dyn-2`,
        slug: c2 ? (c2.slug || c2.id) : finalP2Name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: finalP2Name,
        brand: b2,
        category: c2?.category === "smartphones" ? "phones" : (c2?.category || categoryHint),
        image: img2,
        price: price2,
        cheapestStore: store2,
      },
    ],
    matrix: matrixRows,
    winner: {
      productId: c1 ? c1.id : "dyn-1",
      productName: finalP1Name,
      scenario: "Uzman Seçimi",
      reasons: defaultWinnerReasons,
    },
  };
}

export function isNewsQuery(message: string): boolean {
  if (!message || typeof message !== "string") return false;
  const norm = normalizeTr(message);
  return (
    norm.includes("haber") ||
    norm.includes("gundem") ||
    norm.includes("lansman") ||
    norm.includes("yapay zeka gelismeleri") ||
    norm.includes("yeni cikan") ||
    norm.includes("yeni duyurulan")
  );
}

export function resolveTechNews(topic: string = "genel"): TechNewsPanelData {
  const normTopic = normalizeTr(topic);

  const allArticles: TechNewsArticle[] = [
    {
      id: "news-ai-1",
      title: "Apple M4 ve M5 Çipleri: Yerel Yapay Zeka Çekirdeklerinde Yeni Dönem",
      summary:
        "3nm düğümünde üretilen yeni nesil M serisi işlemciler, 38 TOPS NPU güçleriyle cihaz üstü yapay zeka işlemlerinde gecikmeyi sıfıra indiriyor ve batarya verimliliğini %25 artırıyor.",
      source: "TechCrunch / AnandTech",
      date: "Eylül 2026",
      tag: "İşlemci & AI",
      url: "https://techcrunch.com",
    },
    {
      id: "news-snap-2",
      title: "Snapdragon 8 Gen 4 & 5: Oryon Özel Çekirdekleriyle Masaüstü Gücü Cepte",
      summary:
        "Qualcomm'un tamamen kendi geliştirdiği Oryon CPU çekirdekleri, mobil benchmark skorlarında tek çekirdek performansını kırarak dizüstü bilgisayarlara meydan okuyor.",
      source: "GSMArena",
      date: "Eylül 2026",
      tag: "Mobil Donanım",
      url: "https://gsmarena.com",
    },
    {
      id: "news-oled-3",
      title: "Tandem OLED ve Mikro-Lens Dizilimi: 4000 Nits Parlaklık Dönemi",
      summary:
        "Çift katmanlı OLED paneller hem yanma (burn-in) riskini yarıya indiriyor hem de doğrudan güneş ışığı altında bile kristal netliğinde renk doğruluğu sağlıyor.",
      source: "DisplayMate",
      date: "Eylül 2026",
      tag: "Ekran Teknolojisi",
      url: "https://displaymate.com",
    },
    {
      id: "news-wifi-4",
      title: "Wi-Fi 7 ve 320 MHz Kanallar: Evlerde 5ms Altı Kablosuz Gecikme",
      summary:
        "Multi-Link Operation (MLO) desteğiyle 2.4, 5 ve 6 GHz bantlarını aynı anda kullanan yeni Wi-Fi 7 yönlendiriciler, kablolu ağ hızında kesintisiz bulut oyun deneyimi sağlıyor.",
      source: "The Verge",
      date: "Eylül 2026",
      tag: "Ağ & Donanım",
      url: "https://theverge.com",
    },
    {
      id: "news-battery-5",
      title: "Silikon-Karbon Bataryalar: Telefonlarda 6000 mAh Standart Haline Geliyor",
      summary:
        "Geleneksel grafit anot yerine silikon-karbon teknolojisine geçen üreticiler, cihaz kalınlığını artırmadan %20 daha yüksek enerji yoğunluğu elde ediyor.",
      source: "Android Central",
      date: "Eylül 2026",
      tag: "Batarya Teknolojisi",
      url: "https://androidcentral.com",
    },
  ];

  let filtered = allArticles;
  if (
    normTopic.includes("islemci") ||
    normTopic.includes("cip") ||
    normTopic.includes("apple") ||
    normTopic.includes("snapdragon")
  ) {
    filtered = allArticles.filter((a) => a.tag.includes("İşlemci") || a.tag.includes("Mobil"));
  } else if (normTopic.includes("ekran") || normTopic.includes("oled") || normTopic.includes("tv")) {
    filtered = allArticles.filter((a) => a.tag.includes("Ekran"));
  } else if (normTopic.includes("yapay") || normTopic.includes("ai")) {
    filtered = allArticles.filter((a) => a.title.includes("Yapay Zeka") || a.tag.includes("AI"));
  }

  return {
    type: "news",
    topic: topic || "Teknoloji Gündemi",
    articles: filtered.length > 0 ? filtered : allArticles,
  };
}
