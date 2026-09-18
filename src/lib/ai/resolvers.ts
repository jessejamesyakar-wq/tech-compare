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
  unresolved?: string[];
}

const SEARCH_STOP_WORDS = new Set([
  "nasil", "sence", "hakkinda", "bilgi", "ver", "onerir", "onerirsin", "oner", "tavsiye",
  "eder", "edersin", "elimde", "var", "alacagim", "almak", "istiyorum", "alinir", "mi",
  "mu", "hangisi", "hangileri", "ne", "kadar", "fiyat", "fiyati", "fiyatı", "fiyatlar", "fiyatlari", "fiyatları", "kac", "para",
  "tl", "lira", "butce", "bütçe", "butcem", "bütçem", "civari", "civarı", "bandi", "bandı", "arasi", "arası", "modelleri", "modeli", "modeller", "model",
  "goremiyorum", "göster", "goster", "bana", "icin", "için", "ile", "ve", "veya", "en", "iyi", "cok", "çok", "daha", "bir", "bu",
  "su", "şu", "o", "karsilastir", "karşılaştır", "kiyasla", "kıyasla", "merhaba", "selam", "dostum", "nerede", "bulamiyor",
  "telefon", "telefonu", "televizyon", "televizyonu", "cihaz", "cihazlar", "cihazlari", "kendime", "cocuguma", "esime", "anneme", "babama",
  "arkadasima", "kardesime", "hayali", "olan", "hediye", "hediyelik", "lik", "luk",
  "kaynak", "kaynagi", "kaynağı", "kaynaklar", "kaynaklari", "kaynakları", "kaynaklariyla", "kaynaklarıyla",
  "guncel", "güncel", "sitedeki", "katalogdaki", "katalog", "liste", "iki", "uc", "üç", "dort", "dört", "adet", "tane",
  "ozellik", "ozellikler", "ozellikleri", "özellik", "özellikler", "özellikleri", "pili", "bataryasi", "bataryası", "uzun", "giden"
]);

export function extractStorageFromQuery(query: string): string | null {
  if (!query || typeof query !== "string") return null;
  const match = query.match(/\b(\d{1,4})\s*(gb|tb)\b/i);
  if (match) {
    return `${match[1].toLowerCase()}${match[2].toLowerCase()}`;
  }
  return null;
}

export function extractModelCodes(query: string): string[] {
  if (!query || typeof query !== "string") return [];
  // Normalize Turkish characters and join separated letter-number combos e.g. "s 24" -> "s24", "s-24" -> "s24", "s 999" -> "s999"
  const norm = normalizeTr(query)
    .replace(/\b([a-z])\s*[-–]\s*(\d{1,4})\b/gi, "$1$2")
    .replace(/\b([a-z])\s+(\d{1,4})\b/gi, (match, letter, num) => {
      if (/^[sazmvg]$/i.test(letter)) {
        return `${letter}${num}`;
      }
      return match;
    });

  // Strip specs / units
  const stripped = norm
    .replace(/\b\d{1,4}\s*(?:gb|tb|mah|hz|w|mp|ram|rom)\b/gi, " ")
    .replace(/\b\d{1,2}(?:\.\d+)?\s*(?:inç|inch|''|")\b/gi, " ")
    .replace(/\b(?:4k|8k|2k|1080p|720p|5g|4g|3g|2g|oled|amoled)\b/gi, " ");

  const codes: string[] = [];

  // 1. Alphanumeric model codes: e.g. s999, s24, s20, a16, a54, gt7, 13t, 17e, note20, fold6
  const alphaNumMatches = stripped.match(/\b([a-z]{1,2}\d{1,4}[a-z]?|\d{1,4}[a-z]{1,2})\b/gi);
  if (alphaNumMatches) {
    for (const m of alphaNumMatches) {
      const lower = m.toLowerCase();
      if (!["am", "pm", "ai"].includes(lower) && !codes.includes(lower)) {
        codes.push(lower);
      }
    }
  }

  // 2. Pure numbers (2-4 digits): e.g. 16, 17, 999
  const numMatches = stripped.match(/\b(\d{2,4})\b/g);
  if (numMatches) {
    for (const m of numMatches) {
      if (!codes.includes(m)) {
        codes.push(m);
      }
    }
  }

  return codes;
}

export function extractModelSeriesNumber(query: string): string | null {
  const codes = extractModelCodes(query);
  return codes.length > 0 ? codes[0] : null;
}

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
  const qModelCodes = extractModelCodes(query);
  const qStorage = extractStorageFromQuery(query);

  const scoredProds = catalog
    .map((p) => {
      const pName = normalizeTr(p.name || "");
      const pBrand = normalizeTr(p.brand || "");
      const cleanP = cleanAlphanumeric(p.name || "");
      const haystack = `${pName} ${pBrand}`;
      const pCodes = extractModelCodes(p.name || "");

      // If query has model codes (e.g. s999, s24, 16), candidate MUST contain it!
      if (qModelCodes.length > 0) {
        const containsAnyCode = qModelCodes.some(
          (qc) => cleanP.includes(qc) || haystack.includes(qc) || pCodes.includes(qc)
        );
        if (!containsAnyCode) return null;

        // Model code collision guard: e.g. query has s999 or s24, candidate has s20
        for (const qc of qModelCodes) {
          if (/^[a-z]{1,2}\d+$/i.test(qc)) {
            const prefix = qc.replace(/\d+$/, "");
            const pAlphas = pCodes.filter((pc) => pc.startsWith(prefix));
            if (pAlphas.length > 0 && !pAlphas.includes(qc)) {
              return null;
            }
          } else if (/^\d{2,4}$/.test(qc)) {
            const pNums = pCodes.filter((pc) => /^\d{2,4}$/.test(pc));
            if (pNums.length > 0 && !pNums.includes(qc)) {
              return null;
            }
          }
        }
      }

      // If query explicitly specified storage (e.g. 8tb), candidate MUST have that storage!
      if (qStorage) {
        const pNameClean = (p.name || "").toLowerCase().replace(/\s+/g, "");
        const pStorageClean = ((p as any).storage || "").toLowerCase().replace(/\s+/g, "");
        const matchesStorage = pNameClean.includes(qStorage) || pStorageClean.includes(qStorage);
        if (!matchesStorage) {
          return null;
        }
      }

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

  // Deduplicate base models, while prioritizing matching storage variant if requested
  const seenBase = new Set<string>();
  const result: any[] = [];
  for (const s of scoredProds) {
    const pName = (s.product.name || "").toLowerCase();
    const matchesStorage = qStorage ? pName.replace(/\s+/g, "").includes(qStorage) : true;
    const baseName = pName
      .replace(/\s*\(\d+\s*(?:gb|tb)\)/i, "")
      .replace(/\s+\d+\s*(?:gb|tb)\b/i, "")
      .trim();

    if (qStorage && !matchesStorage) {
      const hasMatchingCapacity = scoredProds.some(
        (sp) =>
          (sp.product.name || "").toLowerCase().replace(/\s+/g, "").includes(qStorage) &&
          (sp.product.name || "")
            .toLowerCase()
            .replace(/\s*\(\d+\s*(?:gb|tb)\)/i, "")
            .replace(/\s+\d+\s*(?:gb|tb)\b/i, "")
            .trim() === baseName
      );
      if (hasMatchingCapacity) continue;
    }

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
  if (normalized.length < 2 || SEARCH_STOP_WORDS.has(normalized)) return null;

  // If query is composed exclusively of stop words, reject
  const rawWords = normalized.split(/\s+/).filter(Boolean);
  if (rawWords.length > 0 && rawWords.every((w) => SEARCH_STOP_WORDS.has(w))) {
    return null;
  }

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

  const qModelCodes = extractModelCodes(nameOrId);
  const qModelNum = extractModelSeriesNumber(nameOrId);
  const qStorage = extractStorageFromQuery(nameOrId);

  // If query contains a model code (e.g. s999, 999) that doesn't exist anywhere in catalog, reject immediately
  if (qModelCodes.length > 0) {
    const anyProductHasCode = products.some((p) => {
      const pClean = cleanAlphanumeric(p.name || "");
      const pId = (p.id || "").toLowerCase();
      const pCodes = extractModelCodes(p.name || "");
      return qModelCodes.some((qc) => pClean.includes(qc) || pId.includes(qc) || pCodes.includes(qc));
    });
    if (!anyProductHasCode) {
      return null;
    }
  }

  const candidateFilter = (p: any) => {
    if (qModelCodes.length > 0) {
      const pClean = cleanAlphanumeric(p.name || "");
      const pId = (p.id || "").toLowerCase();
      const pCodes = extractModelCodes(p.name || "");
      const matchesCode = qModelCodes.some(
        (qc) => pClean.includes(qc) || pId.includes(qc) || pCodes.includes(qc)
      );
      if (!matchesCode) {
        return false;
      }

      // Series collision guard: e.g. query has "s24" or "s999", candidate has "s20"
      for (const qc of qModelCodes) {
        if (/^[a-z]{1,2}\d+$/i.test(qc)) {
          const prefix = qc.replace(/\d+$/, "");
          const pAlphas = pCodes.filter((pc) => pc.startsWith(prefix));
          if (pAlphas.length > 0 && !pAlphas.includes(qc)) {
            return false;
          }
        } else if (/^\d{2,4}$/.test(qc)) {
          const pNums = pCodes.filter((pc) => /^\d{2,4}$/.test(pc));
          if (pNums.length > 0 && !pNums.includes(qc)) {
            return false;
          }
        }
      }
    }

    // Explicit storage capacity protection:
    // If a capacity (e.g. 8 TB) was explicitly requested, reject candidates with different capacities
    if (qStorage) {
      const pNameClean = (p.name || "").toLowerCase().replace(/\s+/g, "");
      const pStorageClean = (p.storage || "").toLowerCase().replace(/\s+/g, "");
      const pSpecsStorage = (p.specs?.storage || "").toLowerCase().replace(/\s+/g, "");
      const matchesStorage =
        pNameClean.includes(qStorage) ||
        pStorageClean.includes(qStorage) ||
        pSpecsStorage.includes(qStorage);
      if (!matchesStorage) {
        return false;
      }
    }

    return true;
  };

  const rankCandidates = (cands: any[]) => {
    const filtered = cands.filter(candidateFilter);
    if (filtered.length === 0) return null;

    const scored = [...filtered].sort((a, b) => {
      const aName = (a.name || "").toLowerCase().replace(/\s+/g, "");
      const bName = (b.name || "").toLowerCase().replace(/\s+/g, "");

      if (qStorage) {
        const aMatches = aName.includes(qStorage);
        const bMatches = bName.includes(qStorage);
        if (aMatches && !bMatches) return -1;
        if (bMatches && !aMatches) return 1;
      }

      const scoreA = a.aceleEtmeScore ?? a.epeyScore ?? 80;
      const scoreB = b.aceleEtmeScore ?? b.epeyScore ?? 80;
      if (scoreA !== scoreB) return scoreB - scoreA;

      const priceA = a.basePrice || a.price || 0;
      const priceB = b.basePrice || b.price || 0;
      // If storage was not specified, choose standard/base variant price (not the 2 TB max price)
      return priceA - priceB;
    });

    return scored[0];
  };

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

      const best = rankCandidates(exactRanked.length > 0 ? exactRanked : candidates);
      if (best) return best;
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

      const best = rankCandidates(exactRanked.length > 0 ? exactRanked : alphaMatches);
      if (best) return best;
    }
  }

  // Only fall back to catalog search if query is not purely common words and has at least 3 chars
  if (cleanQ.length >= 3) {
    const searched = searchProductsInCatalog(nameOrId, 5);
    const validSearched = searched.filter(candidateFilter);
    if (validSearched.length > 0) {
      const best = rankCandidates(validSearched);
      if (best) return best;
    }
  }

  return null;
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

  const unresolved: string[] = [];
  const matched: any[] = [];
  for (const idOrName of identifiers) {
    const prod = findProductByNameOrId(catalog, idOrName);
    if (prod) {
      matched.push(prod);
    } else {
      unresolved.push(idOrName);
    }
  }

  if (matched.length < 2) {
    if (unresolved.length > 0) {
      // Check if any unresolved item is a known base model with alternative capacities in catalog
      const capacityClarifications = unresolved
        .map((u) => {
          const uStorage = extractStorageFromQuery(u);
          if (uStorage) {
            const stripped = u.replace(/\b\d{1,4}\s*(?:gb|tb)\b/gi, "").trim();
            const baseMatches = catalog.filter((p) => {
              const pNorm = normalizeTr(p.name || "");
              const sNorm = normalizeTr(stripped);
              return (
                pNorm.includes(sNorm) ||
                cleanAlphanumeric(p.name || "").includes(cleanAlphanumeric(stripped))
              );
            });
            if (baseMatches.length > 0) {
              const availCaps = [
                ...new Set(
                  baseMatches
                    .map((p) => extractStorageFromQuery(p.name || ""))
                    .filter(Boolean)
                ),
              ];
              if (availCaps.length > 0) {
                return `'${u}' için ${uStorage.toUpperCase()} kapasite seçeneği katalogda bulunamadı. Mevcut alternatif kapasiteler: ${availCaps.join(", ").toUpperCase()}.`;
              }
            }
          }
          return null;
        })
        .filter(Boolean);

      let message = `Üzgünüm, belirttiğin ürünlerden '${unresolved.join("', '")}' modelini kataloğumuzda bulamadım. Tam model adını veya doğruluğunu kontrol edip tekrar yazar mısın? 🐧`;
      if (capacityClarifications.length > 0) {
        message = `${capacityClarifications.join(" ")} Lütfen geçerli bir kapasite seçerek tekrar deneyin. 🐧`;
      }

      return {
        ok: false,
        message,
        unresolved,
      };
    }
    return {
      ok: false,
      message: "Kıyaslamak için en az iki ürün ismi belirtir misin? Örneğin 'iPhone 17 Pro Max ile Galaxy S26 Ultra'yı kıyasla' gibi. 🐧",
    };
  }

  // Guard against duplicate / self comparison (e.g. comparing the same phone to itself)
  if (matched[0].id === matched[1].id) {
    return {
      ok: false,
      message: "Aynı ürünü kendisiyle kıyaslayamazsın. Lütfen iki farklı model belirt. 🐧",
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

  // Check for honest tie
  const p1Score = matched[0].aceleEtmeScore ?? matched[0].epeyScore ?? 80;
  const p2Score = matched[1].aceleEtmeScore ?? matched[1].epeyScore ?? 80;
  const isTie = winCounts.length >= 2 && winCounts[0] === winCounts[1] && p1Score === p2Score;

  if (isTie) {
    return {
      ok: true,
      data: {
        category,
        products: matched,
        rows,
        winner: null,
      },
    };
  }

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
): ResolverResult<{
  products: any[];
  category: CatalogCategory | "all";
  overBudgetAlternatives?: any[];
}> {
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

  // STRICT UPPER BUDGET BOUND:
  // Recommended products in the primary list MUST NOT exceed the budget limit!
  // No silent 20-30% price inflation.
  const maxPrice = numericBudget;
  const minPrice = Math.max(0, numericBudget * 0.40);

  let candidates = catalog.filter((p: any) => {
    const cat = p.category === "smartphones" ? "smartphones" : p.category;
    if ((resolvedCategory as string) !== "all" && cat !== resolvedCategory) return false;
    const price = p.basePrice || p.price || 0;
    return price > 0 && price <= maxPrice && price >= minPrice;
  });

  if (candidates.length === 0) {
    candidates = catalog.filter((p: any) => {
      const cat = p.category === "smartphones" ? "smartphones" : p.category;
      if ((resolvedCategory as string) !== "all" && cat !== resolvedCategory) return false;
      const price = p.basePrice || p.price || 0;
      return price > 0 && price <= maxPrice;
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

  // Over-budget alternatives (strictly separated and labeled)
  const overBudgetCandidates = catalog.filter((p: any) => {
    const cat = p.category === "smartphones" ? "smartphones" : p.category;
    if ((resolvedCategory as string) !== "all" && cat !== resolvedCategory) return false;
    const price = p.basePrice || p.price || 0;
    return price > numericBudget && price <= numericBudget * 1.20;
  });

  const seenOverBudget = new Set<string>();
  const dedupedOverBudget: any[] = [];
  for (const c of overBudgetCandidates) {
    const baseKey = (c.name || "")
      .replace(/\s*\(\d+\s*(?:gb|tb)\)/i, "")
      .replace(/\s+\d+\s*(?:gb|tb)\b/i, "")
      .trim()
      .toLowerCase();
    if (!seenOverBudget.has(baseKey) && !seenModels.has(baseKey)) {
      seenOverBudget.add(baseKey);
      dedupedOverBudget.push(c);
    }
  }

  if (deduped.length === 0 && dedupedOverBudget.length === 0) {
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

  // Labeled over-budget alternatives
  dedupedOverBudget.sort((a, b) => getProductModelScore(b) - getProductModelScore(a));
  const overBudgetAlternatives = dedupedOverBudget.slice(0, 2).map((p) => {
    const price = p.basePrice || p.price || 0;
    const diffTL = price - numericBudget;
    const diffPct = Math.round((diffTL / numericBudget) * 100);
    return {
      ...p,
      budgetDifferenceTL: diffTL,
      budgetDifferencePercent: diffPct,
      overBudgetBadge: `+₺${diffTL.toLocaleString("tr-TR")} (+%${diffPct}) Bütçe Üstü Alternatif`,
    };
  });

  return {
    ok: true,
    data: {
      products: finalPicks,
      category: resolvedCategory,
      ...(overBudgetAlternatives.length > 0 ? { overBudgetAlternatives } : {}),
    },
  };
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
  category: CatalogCategory;
  products: {
    id: string;
    slug: string;
    name: string;
    brand: string;
    category?: string;
    image: string;
    price: number;
    cheapestStore: string;
  }[];
  matrix: ComparisonMatrixRow[];
  winner: {
    productId: string;
    productName: string;
    scenario: string;
    reasons: string[];
    isTie?: boolean;
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
  data: {
    category: CatalogCategory;
    products: any[];
    rows: ReturnType<typeof buildComparisonRows>;
    winner: { id: string; reasons: string[] } | null;
  },
  scenario: string = "Detaylı Karşılaştırma"
): ComparisonPanelData {
  const products = data.products.map((p) => {
    const validOffers = Array.isArray(p.storeOffers)
      ? p.storeOffers.filter((o: any) => o && o.price > 0).sort((a: any, b: any) => a.price - b.price)
      : [];
    const cheapestPrice = validOffers[0]?.price || p.basePrice || p.price || 0;
    const cheapestStore = validOffers[0]?.storeName || "En Uygun Mağaza";

    return {
      id: p.id,
      slug: p.slug || p.id,
      name: p.name,
      brand: p.brand || "",
      category: p.category === "smartphones" ? "phones" : p.category,
      image: p.image || (Array.isArray(p.images) ? p.images[0] : "") || getFallbackProductImage(p.name, p.brand, p.category),
      price: cheapestPrice,
      cheapestStore: cheapestStore,
    };
  });

  const matrix: ComparisonMatrixRow[] = data.rows.map((r: any) => ({
    label: r.label,
    key: r.key,
    group: r.group,
    values: r.values,
    isDifferent: r.isDifferent,
    highlightIdx: r.superiorIdx,
    superiorIdx: r.superiorIdx,
  }));

  const winnerProduct = data.winner ? data.products.find((p) => p.id === data.winner!.id) : null;

  return {
    type: "comparison",
    scenario,
    category: data.category,
    products,
    matrix,
    winner: winnerProduct
      ? {
          productId: winnerProduct.id,
          productName: winnerProduct.name,
          scenario: "Donanım Üstünlüğü",
          reasons: data.winner!.reasons || ["Kategorisinde öne çıkan seçim"],
          isTie: false,
        }
      : {
          productId: "",
          productName: "Beraberlik",
          scenario: "Donanım Üstünlüğü",
          reasons: ["İki model donanım ve teknik kriterlerde dengeli bir performans sunuyor"],
          isTie: true,
        },
  };
}

export function tryExtractComparisonFromMessage(message: string): string[] | null {
  if (!message || typeof message !== "string") return null;

  // 1. Bilinen amiral gemisi veya popüler model adları
  // Uzun modeller önce eşleşsin diye anahtar uzunluğuna göre azalan sıralanır
  const rawKeywords = [
    { key: "iphone 18 pro max", label: "iPhone 18 Pro Max" },
    { key: "iphone 17 pro max", label: "iPhone 17 Pro Max" },
    { key: "iphone 16 pro max", label: "iPhone 16 Pro Max" },
    { key: "iphone 18 pro", label: "iPhone 18 Pro" },
    { key: "iphone 17 pro", label: "iPhone 17 Pro" },
    { key: "iphone 16 pro", label: "iPhone 16 Pro" },
    { key: "iphone duo", label: "iPhone Duo" },
    { key: "iphone 18", label: "iPhone 18" },
    { key: "iphone 17", label: "iPhone 17" },
    { key: "iphone 16", label: "iPhone 16" },
    { key: "iphone 15", label: "iPhone 15" },
    { key: "iphone 14", label: "iPhone 14" },
    { key: "iphone 13", label: "iPhone 13" },
    { key: "galaxy s26 ultra", label: "Galaxy S26 Ultra" },
    { key: "galaxy s25 ultra", label: "Galaxy S25 Ultra" },
    { key: "galaxy s24 ultra", label: "Galaxy S24 Ultra" },
    { key: "s26 ultra", label: "Galaxy S26 Ultra" },
    { key: "s25 ultra", label: "Galaxy S25 Ultra" },
    { key: "s24 ultra", label: "Galaxy S24 Ultra" },
    { key: "s24 fe", label: "Galaxy S24 FE" },
    { key: "s24", label: "Galaxy S24" },
    { key: "s23 ultra", label: "Galaxy S23 Ultra" },
    { key: "s23", label: "Galaxy S23" },
    { key: "xiaomi 15 ultra", label: "Xiaomi 15 Ultra" },
    { key: "xiaomi 14 ultra", label: "Xiaomi 14 Ultra" },
    { key: "roborock saros 20 sonic", label: "Roborock Saros 20 Sonic" },
    { key: "roborock saros 20", label: "Roborock Saros 20" },
    { key: "roborock qrevo curv", label: "Roborock Qrevo Curv" },
    { key: "roborock qrevo", label: "Roborock Qrevo Curv" },
    { key: "roborock", label: "Roborock Saros 20 Sonic" },
    { key: "dreame bot l20 ultra", label: "Dreame Bot L20 Ultra" },
    { key: "dreame l20 ultra", label: "Dreame Bot L20 Ultra" },
    { key: "dreame l20", label: "Dreame Bot L20 Ultra" },
    { key: "dreame bot l10s", label: "Dreame Bot L10S Ultra" },
    { key: "dreame", label: "Dreame Bot L20 Ultra" },
    { key: "dream", label: "Dreame Bot L20 Ultra" },
    { key: "dyson gen5detect", label: "Dyson Gen5detect" },
    { key: "dyson gen5", label: "Dyson Gen5detect" },
    { key: "dyson v15 detect", label: "Dyson V15 Detect" },
    { key: "dyson v15", label: "Dyson V15 Detect" },
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

  const sortedKeywords = [...rawKeywords].sort((a, b) => b.key.length - a.key.length);
  const lowerMsg = message.toLowerCase();
  const matchedSpans: { start: number; end: number; label: string }[] = [];

  // Non-overlapping keyword matching with word boundaries & capacity preservation
  for (const item of sortedKeywords) {
    let searchStart = 0;
    while (searchStart < lowerMsg.length) {
      const idx = lowerMsg.indexOf(item.key, searchStart);
      if (idx === -1) break;
      let endIdx = idx + item.key.length;
      let label = item.label;

      // Check if storage capacity immediately follows the model keyword
      // e.g. "iphone 17 pro max 256 gb" or " 256gb" or " 1 tb"
      const rest = lowerMsg.slice(endIdx);
      const storageMatch = rest.match(/^\s+(\d{1,4}\s*(?:gb|tb))\b/i);
      if (storageMatch) {
        endIdx += storageMatch[0].length;
        label = `${label} ${storageMatch[1].toUpperCase().replace(/\s+/g, " ")}`;
      }

      const charBefore = idx > 0 ? lowerMsg[idx - 1] : " ";
      const charAfter = endIdx < lowerMsg.length ? lowerMsg[endIdx] : " ";
      const boundaryBefore = /[\s\.,;:'"?!()\/\-_]/.test(charBefore);
      const boundaryAfter = /[\s\.,;:'"?!()\/\-_]/.test(charAfter);

      if (boundaryBefore && boundaryAfter) {
        const overlaps = matchedSpans.some(
          (span) => Math.max(idx, span.start) < Math.min(endIdx, span.end)
        );

        if (!overlaps) {
          matchedSpans.push({ start: idx, end: endIdx, label });
        }
      }
      searchStart = endIdx;
    }
  }

  matchedSpans.sort((a, b) => a.start - b.start);
  const foundFromKeywords = Array.from(new Set(matchedSpans.map((s) => s.label)));
  if (foundFromKeywords.length >= 2) {
    return [foundFromKeywords[0], foundFromKeywords[1]];
  }

  // 2. Doğrudan "A mu/mı/mi/mü B (mi/mu)?" veya "A'mı B'mi" kalıbı
  const questionParticleMatch = message.match(
    /\b([A-Za-z0-9\-_]{2,})\s*(?:['’]?(?:mu|mı|mi|mü))\s+([A-Za-z0-9\-_]{2,})(?:['’]?(?:mu|mı|mi|mü))?/i
  );
  if (questionParticleMatch) {
    const cand1 = questionParticleMatch[1].trim().replace(/['’](?:mu|mı|mi|mü)$/i, "").trim();
    const cand2 = questionParticleMatch[2].trim().replace(/['’](?:mu|mı|mi|mü)$/i, "").trim();

    if (!SEARCH_STOP_WORDS.has(normalizeTr(cand1)) && !SEARCH_STOP_WORDS.has(normalizeTr(cand2))) {
      return [cand1, cand2];
    }
  }

  // 3. Doğrudan "X vs Y" veya "X karşı Y" kalıbı
  const compactVsMatch = message.match(/\b([A-Za-z0-9\-_]{2,})\s+(?:vs\.?|karşı)\s+([A-Za-z0-9\-_]{2,})\b/i);
  if (compactVsMatch) {
    const c1 = compactVsMatch[1].trim();
    const c2 = compactVsMatch[2].trim();
    if (!SEARCH_STOP_WORDS.has(normalizeTr(c1)) && !SEARCH_STOP_WORDS.has(normalizeTr(c2))) {
      return [c1, c2];
    }
  }

  // 4. Açık kıyaslama niyeti kontrolü
  const hasComparisonIntent =
    /\b(vs\.?|karşı|kiyasla|kıyasla|karsilastir|karşılaştır|karsilastirmasi|karşılaştırması|kiyaslamasi|kıyaslaması|farklari|farkları|farki|farkı|hangisi\s+daha|daha\s+iyi|hangisi\s+alınır|hangisi\s+alinir|aralarındaki\s+fark|arasındaki\s+fark|mu\s+yoksa|mı\s+yoksa|mi\s+yoksa|mü\s+yoksa)\b/i.test(
      message
    );

  if (!hasComparisonIntent) {
    return null;
  }

  const clean = message
    .replace(/[,\?\!\.]+/g, " ")
    .replace(
      /\b(kiyasla|kıyasla|karsilastir|karşılaştır|karsilastirmasi|karşılaştırması|kiyaslamasi|kıyaslaması|farklari|farkları|farki|farkı|hangisi|daha|iyi|alinir|alınır|oner|öner|telefonu|televizyonu|modeli|modelleri)\b/gi,
      " "
    )
    .trim();

  const splitRegex = /\s+(?:(?:mu|mı|mi|mü)\s+yoksa|yoksa|\bvs\.?\b|\bkarşı\b|\b(?:mu|mı|mi|mü)\b|ile|ve|\/)\s+/i;
  if (splitRegex.test(clean)) {
    const parts = clean
      .split(splitRegex)
      .map((s) => s.trim().replace(/^[\s,]+|[\s,]+$/g, ""))
      .filter((s) => s.length >= 2);

    if (parts.length >= 2) {
      // Validate candidates: must not be stop words and must have actual brand or model characteristics
      const isValidCandidate = (p: string) => {
        const norm = normalizeTr(p);
        if (!norm || norm.length < 3) return false;
        if (SEARCH_STOP_WORDS.has(norm)) return false;
        const tokens = norm.split(/\s+/).filter(Boolean);
        if (tokens.length === 0 || tokens.every((t) => SEARCH_STOP_WORDS.has(t))) return false;
        const hasBrandOrModel =
          /(?:iphone|apple|samsung|galaxy|xiaomi|redmi|poco|huawei|sony|lg|philips|tcl|dyson|roborock|dreame|ps5|playstation|xbox|asus|lenovo|dell|hp|acer|macbook|ipad|watch|\d{2,})/i.test(
            norm
          );
        return hasBrandOrModel;
      };

      if (isValidCandidate(parts[0]) && isValidCandidate(parts[1])) {
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
  _categoryHint: string = "electronics"
): ComparisonPanelData | null {
  const catalog = getStoredProducts();
  const rawP1 = (productNames[0] || "").trim();
  const rawP2 = (productNames[1] || "").trim();

  const c1 = rawP1 ? findProductByNameOrId(catalog, rawP1) : null;
  const c2 = rawP2 ? findProductByNameOrId(catalog, rawP2) : null;

  // STRICT CATALOG GROUNDING:
  // Both products must be verified in catalog, distinct, and from the same category.
  // Never fabricate mock products or specs from conversational strings.
  if (!c1 || !c2 || c1.id === c2.id || c1.category !== c2.category) {
    return null;
  }

  const compResult = resolveCompareProducts([c1.id, c2.id]);
  if (compResult.ok && compResult.data) {
    return formatComparisonData(compResult.data, "Detaylı Karşılaştırma");
  }

  return null;
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
