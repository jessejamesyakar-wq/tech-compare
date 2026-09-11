// src/lib/ai/resolvers.ts
/**
 * Robust replacements for resolveCompareProducts / resolveBudgetRecommendation.
 * Pure catalog lookups — fast, deterministic, and unit testable.
 */

import { getStoredProducts } from "@/lib/adminData";
import { detectCategory, type CatalogCategory } from "./categoryMatcher";
import { buildComparisonRows } from "./specFields";

export interface ResolverResult<T> {
  ok: boolean;
  data?: T;
  message?: string;
}

function findProductByNameOrId(products: any[], nameOrId: string) {
  if (!nameOrId || typeof nameOrId !== "string") return null;
  const normalized = nameOrId.toLocaleLowerCase("tr-TR").trim();
  return (
    products.find((p) => p.id === nameOrId || p.slug === nameOrId) ??
    products.find((p) => p.name.toLocaleLowerCase("tr-TR").includes(normalized)) ??
    null
  );
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

  // Numeric winner logic based on score and price
  const sorted = [...matched].sort((a, b) => {
    const scoreA = (a.aceleEtmeScore ?? a.epeyScore ?? 0) / Math.max(a.basePrice, 1);
    const scoreB = (b.aceleEtmeScore ?? b.epeyScore ?? 0) / Math.max(b.basePrice, 1);
    return scoreB - scoreA;
  });

  const best = sorted[0];
  const reasons: string[] = [];

  const maxPrice = Math.max(...matched.map((p) => p.basePrice));
  const priceDiff = maxPrice - best.basePrice;
  if (priceDiff > 0) {
    reasons.push(`En ucuz fiyat: ₺${priceDiff.toLocaleString("tr-TR")} daha avantajlı`);
  }
  const bestScore = best.aceleEtmeScore ?? best.epeyScore;
  if (bestScore != null) {
    reasons.push(`aceleEtme puanı: ${bestScore}/100`);
  }
  if (best.releaseYear) {
    reasons.push(`Çıkış yılı: ${best.releaseYear} (daha güncel donanım)`);
  }

  return {
    ok: true,
    data: {
      category,
      products: matched,
      rows,
      winner: reasons.length > 0 ? { id: best.id, reasons } : null,
    },
  };
}

export function resolveBudgetRecommendation(
  budgetTL: any,
  category?: string,
  _scenario?: string
): ResolverResult<{ products: any[]; category: CatalogCategory | "all" }> {
  const numericBudget = typeof budgetTL === "number"
    ? budgetTL
    : parseInt(String(budgetTL || "").replace(/[^\d]/g, ""), 10) || 0;

  if (!numericBudget || numericBudget <= 0) {
    return {
      ok: false,
      message: "Bütçenin ne kadar olduğunu TL cinsinden yazar mısın? Örneğin '20000 TL'. 🐧",
    };
  }

  const catalog = getStoredProducts();

  let resolvedCategory: CatalogCategory | "all" = "all";
  if (category) {
    const detected = detectCategory(category);
    resolvedCategory = detected.category ?? "all";
  }

  const TOLERANCE = 0.15;
  const minPrice = numericBudget * (1 - TOLERANCE);
  const maxPrice = numericBudget * (1 + TOLERANCE);

  let candidates = catalog.filter(
    (p: any) => p.basePrice >= minPrice && p.basePrice <= maxPrice
  );

  if (resolvedCategory !== "all") {
    candidates = candidates.filter((p: any) => p.category === resolvedCategory);
  }

  if (candidates.length === 0) {
    candidates = catalog
      .filter((p: any) => (resolvedCategory === "all" ? true : p.category === resolvedCategory))
      .filter((p: any) => p.basePrice <= numericBudget * 1.3)
      .sort((a: any, b: any) => b.basePrice - a.basePrice)
      .slice(0, 5);
  }

  if (candidates.length === 0) {
    return {
      ok: false,
      message:
        "Bu bütçe ve kategoride kataloğumuzda uygun bir ürün bulamadım. Bütçeni biraz güncelleyebilir misin? 🐧",
    };
  }

  const ranked = candidates
    .sort((a: any, b: any) => {
      const scoreA = (a.aceleEtmeScore ?? a.epeyScore ?? 0) / Math.max(a.basePrice, 1);
      const scoreB = (b.aceleEtmeScore ?? b.epeyScore ?? 0) / Math.max(b.basePrice, 1);
      return scoreB - scoreA;
    })
    .slice(0, 5);

  return { ok: true, data: { products: ranked, category: resolvedCategory } };
}
