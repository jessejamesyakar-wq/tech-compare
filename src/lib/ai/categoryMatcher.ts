// src/lib/ai/categoryMatcher.ts
/**
 * Maps free-text user queries to a real catalog category BEFORE any
 * product search/matching runs.
 */

export type CatalogCategory =
  | "smartphones"
  | "tvs"
  | "laptops"
  | "tablets"
  | "smartwatches"
  | "headphones"
  | "appliances"
  | "monitors"
  | "consoles";

const CATEGORY_KEYWORDS: Record<CatalogCategory, string[]> = {
  smartphones: ["akıllı telefon", "cep telefonu", "telefon", "iphone", "smartphone", "phone"],
  tvs: ["televizyon", "smart tv", "oled tv", "qled", "tv"],
  laptops: ["dizüstü bilgisayar", "dizüstü", "notebook", "laptop", "ultrabook"],
  tablets: ["tablet", "ipad"],
  smartwatches: ["akıllı saat", "smartwatch", "kol saati"],
  headphones: ["kulaklık", "kulaklik", "headphone", "earbud", "kulak içi", "airpods"],
  appliances: ["beyaz eşya", "ev aleti", "süpürge", "blender", "ütü", "fırın"],
  monitors: ["monitör", "monitor"],
  consoles: ["oyun konsolu", "konsol", "playstation", "xbox", "nintendo"],
};

const ADJECTIVE_MODIFIERS = [
  "oyuncu",
  "gaming",
  "ucuz",
  "pahalı",
  "hafif",
  "güçlü",
  "ince",
  "büyük",
  "küçük",
  "en iyi",
  "profesyonel",
  "başlangıç seviyesi",
  "amiral gemisi",
];

export interface CategoryMatchResult {
  category: CatalogCategory | null;
  modifiers: string[];
  matchedKeyword: string | null;
}

export function detectCategory(query: string): CategoryMatchResult {
  const normalized = query.toLocaleLowerCase("tr-TR");

  let bestCategory: CatalogCategory | null = null;
  let bestKeyword: string | null = null;
  let bestKeywordLength = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as [
    CatalogCategory,
    string[]
  ][]) {
    for (const keyword of keywords) {
      if (normalized.includes(keyword) && keyword.length > bestKeywordLength) {
        bestCategory = category;
        bestKeyword = keyword;
        bestKeywordLength = keyword.length;
      }
    }
  }

  const modifiers = ADJECTIVE_MODIFIERS.filter((mod) => normalized.includes(mod));

  return { category: bestCategory, modifiers, matchedKeyword: bestKeyword };
}
