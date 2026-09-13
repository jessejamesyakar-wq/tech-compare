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

export function searchProductsInCatalog(
  query: string,
  limit: number = 3
): any[] {
  if (!query || typeof query !== "string") return [];
  const catalog = getStoredProducts();
  const normQuery = query.toLocaleLowerCase("tr-TR").trim();
  const tokens = normQuery.split(/\s+/).filter((t) => t.length >= 2);
  if (tokens.length === 0) return [];

  const genericTokens = new Set([
    "pro", "max", "ultra", "plus", "mini", "air", "lite", "se", "5g", "4g",
    "smart", "series", "gb", "tb", "inc", "inch", "hz", "oled", "tv", "telefon"
  ]);
  const keyTokens = tokens.filter((t) => !genericTokens.has(t));

  const scored: Array<{ product: any; score: number }> = [];

  for (const p of catalog) {
    const pName = (p.name || "").toLocaleLowerCase("tr-TR");
    const pBrand = (p.brand || "").toLocaleLowerCase("tr-TR");
    const combined = `${pBrand} ${pName}`;

    let score = 0;
    if (pName.includes(normQuery)) score += 200;
    else if (combined.includes(normQuery)) score += 150;

    let matchedKeyTokens = 0;
    let matchedTotalTokens = 0;

    for (const tok of tokens) {
      if (combined.includes(tok)) {
        matchedTotalTokens++;
        if (!genericTokens.has(tok)) {
          matchedKeyTokens++;
          score += 40;
        } else {
          score += 10;
        }
      }
    }

    if (keyTokens.length > 0 && matchedKeyTokens === 0) {
      continue;
    }

    if (keyTokens.length > 1 && matchedKeyTokens >= keyTokens.length) {
      score += 60;
    }

    const matchRatio = matchedTotalTokens / tokens.length;
    score += Math.round(matchRatio * 50);

    if (score >= 40) {
      scored.push({ product: p, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.product);
}

export function normalizeTr(text: string): string {
  if (!text) return "";
  return text
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
    .trim();
}

export function findProductByNameOrId(products: any[], nameOrId: string) {
  if (!nameOrId || typeof nameOrId !== "string") return null;
  const normalized = normalizeTr(nameOrId);
  const directId = products.find((p) => p.id === nameOrId || p.slug === nameOrId);
  if (directId) return directId;

  const directExactName = products.find((p) => normalizeTr(p.name) === normalized);
  if (directExactName) return directExactName;

  const candidates = products.filter((p) => normalizeTr(p.name).includes(normalized));
  if (candidates.length > 0) {
    const hasMax = normalized.includes("max");
    const hasPlus = normalized.includes("plus");
    const hasUltra = normalized.includes("ultra");

    const exactRanked = candidates.filter((p) => {
      const pNorm = normalizeTr(p.name);
      if (!hasMax && pNorm.includes("max")) return false;
      if (!hasPlus && pNorm.includes("plus")) return false;
      if (!hasUltra && pNorm.includes("ultra")) return false;
      return true;
    });

    if (exactRanked.length > 0) return exactRanked[0];
    return candidates[0];
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

// ---- Panel Types & Helpers ------------------------------------------

export interface ComparisonMatrixRow {
  label: string;
  values: string[];
  isDifferent: boolean;
  highlightIdx?: number;
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
        image: p.image || (Array.isArray(p.images) ? p.images[0] : undefined),
        price: cheapestPrice,
        cheapestStore,
        secondCheapestStore,
        secondCheapestPrice,
        marketSaving,
      };
    }),
    matrix: data.rows.map((r) => ({
      label: r.label,
      values: r.values,
      isDifferent: new Set(r.values).size > 1,
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
  const clean = message
    .replace(/[,\?\!\.]+/g, " ")
    .replace(
      /\b(kiyasla|kıyasla|karsilastir|karşılaştır|karsilastirmasi|karşılaştırması|kiyaslamasi|kıyaslaması|farklari|farkları|farki|farkı|hangisi|daha|iyi|alinir|alınır|oner|öner|mi|mu|yoksa|telefonu|televizyonu|modeli|yi|yı|yu|yü)\b/gi,
      " "
    )
    .trim();

  const splitRegex = /\s+(?:vs\.?|ile|ve|\/|karşı)\s+/i;
  if (splitRegex.test(clean)) {
    const parts = clean
      .split(splitRegex)
      .map((s) => s.trim().replace(/^[\s,]+|[\s,]+$/g, ""))
      .filter((s) => s.length >= 2);
    if (parts.length >= 2) {
      return [parts[0], parts[1]];
    }
  }

  const compactVsMatch = message.match(/([A-Za-z0-9\-_]+)\s*vs\.?\s*([A-Za-z0-9\-_]+)/i);
  if (compactVsMatch) {
    return [compactVsMatch[1].trim(), compactVsMatch[2].trim()];
  }
  return null;
}

export function createDynamicComparisonPanel(
  productNames: string[],
  categoryHint: string = "electronics"
): ComparisonPanelData {
  const p1Name = productNames[0] || "Ürün 1";
  const p2Name = productNames[1] || "Ürün 2";

  const extractBrand = (name: string) => {
    const brands = [
      "apple", "samsung", "xiaomi", "lg", "philips", "sony", "huawei", "tcl",
      "asus", "dell", "lenovo", "hp", "msi", "acer", "dyson", "vestel", "beko", "arcelik"
    ];
    const lower = name.toLowerCase();
    const found = brands.find((b) => lower.includes(b));
    return found ? found.charAt(0).toUpperCase() + found.slice(1) : name.split(" ")[0] || "Teknoloji";
  };

  const b1 = extractBrand(p1Name);
  const b2 = extractBrand(p2Name);

  return {
    type: "comparison",
    scenario: "Detaylı Karşılaştırma",
    category: categoryHint,
    products: [
      {
        id: `dyn-1`,
        slug: p1Name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: p1Name,
        brand: b1,
        category: categoryHint,
        price: 0,
        cheapestStore: "Piyasa Fiyatı",
      },
      {
        id: `dyn-2`,
        slug: p2Name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: p2Name,
        brand: b2,
        category: categoryHint,
        price: 0,
        cheapestStore: "Piyasa Fiyatı",
      },
    ],
    matrix: [
      { label: "Segment & Donanım Seviyesi", values: ["Premium Donanım", "Premium Donanım"], isDifferent: false },
      { label: "Mimari & Çipset", values: ["Yüksek Performans", "Yüksek Performans"], isDifferent: false },
      { label: "Ekran & Görüntü Kalitesi", values: ["Gelişmiş Panel Teknolojisi", "Gelişmiş Panel Teknolojisi"], isDifferent: false },
      { label: "Güncel Standartlar", values: ["Yeni Nesil Destek", "Yeni Nesil Destek"], isDifferent: false },
    ],
    winner: {
      productId: "dyn-2",
      productName: p2Name,
      scenario: "Uzman Seçimi",
      reasons: [
        "Kullanım senaryosuna göre öne çıkan panel ve donanım dengesi",
        "Daha güçlü optimizasyon ve verimlilik avantajı",
        "Kullanıcı memnuniyeti ve fiyat/performans değeri",
      ],
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
