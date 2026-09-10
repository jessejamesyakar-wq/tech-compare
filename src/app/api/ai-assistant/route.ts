import { NextRequest, NextResponse } from "next/server";
import { getStoredProducts } from "@/lib/adminData";

export const dynamic = "force-dynamic";

// ---- Tipler ----------------------------------------------------------

export interface CatalogItem {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  image?: string;
  specsSummary?: string;
  releaseYear?: number;
  cheapestStore: string;
  cheapestPrice: number;
  secondCheapestStore?: string;
  secondCheapestPrice?: number;
  priceDiffWithSecond?: number;
  marketSaving?: number;
  alternativeStoresFormatted?: string;
}

export interface AssistantRecommendation {
  productId: string;
  slug: string;
  productName: string;
  category: string;
  price: number;
  image?: string;
  reason: string;
  cheapestStore?: string;
  secondCheapestStore?: string;
  secondCheapestPrice?: number;
  marketSaving?: number;
  alternativeStores?: string;
}

export interface ComparisonMatrixRow {
  label: string;
  values: string[];
  isDifferent: boolean;
  highlightIdx?: number;
}

export interface ComparisonPanelData {
  type: "comparison";
  scenario: string;
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

export type SidePanelData = ComparisonPanelData | TechNewsPanelData;

// ---- Yardımcı Fonksiyonlar ------------------------------------------

function normalizeTr(text: string): string {
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

// Akıllı Katalog Ön Filtreleme
export function preFilterProducts(userMessage: string, limit = 25): CatalogItem[] {
  const allProducts = getStoredProducts();
  const normMessage = normalizeTr(userMessage);

  let targetBudget = 0;
  const kMatch = normMessage.match(/\b([0-9]{1,3})\s*k\b/i);
  const binMatch = normMessage.match(/\b([0-9]{1,3})\s*bin\b/i);
  const numMatch = normMessage.match(/\b([0-9]{1,3}(?:\.[0-9]{3})+|[0-9]{4,6})\b/);

  if (kMatch) {
    targetBudget = parseInt(kMatch[1], 10) * 1000;
  } else if (binMatch) {
    targetBudget = parseInt(binMatch[1], 10) * 1000;
  } else if (numMatch) {
    targetBudget = parseInt(numMatch[1].replace(/\./g, ""), 10);
  }

  const isPhone = /telefon|iphone|samsung|galaxy|xiaomi|redmi|poco|honor|oppo|vivo|realme|akilli telefon/i.test(normMessage);
  const isTv = /tv|televizyon|oled|qled|uhd|ekran|4k|55 inc|65 inc/i.test(normMessage);
  const isLaptop = /laptop|bilgisayar|macbook|dizustu|gaming laptop|asus|lenovo|dell/i.test(normMessage);
  const isAppliance = /supurge|robot supurge|dyson|kahve|camasir|bulasik|buzdolabi|ev aleti/i.test(normMessage);
  const isHeadphone = /kulaklik|tws|airpods|buds|bluetooth kulaklik|kulakici|kulakustu/i.test(normMessage);
  const isWatch = /saat|akilli saat|watch|apple watch|galaxy watch/i.test(normMessage);
  const isTablet = /tablet|ipad|galaxy tab/i.test(normMessage);
  const isMonitor = /monitor|144hz|165hz|240hz|ips monitor/i.test(normMessage);
  const isConsole = /ps5|playstation|xbox|nintendo|konsol/i.test(normMessage);

  const hasSpecificCategory = isPhone || isTv || isLaptop || isAppliance || isHeadphone || isWatch || isTablet || isMonitor || isConsole;
  const queryTokens = normMessage.split(/\s+/).filter(t => t.length > 1);

  const scored = allProducts.map((p) => {
    let score = 0;
    const cat = (p.category || "").toLowerCase();
    const normBrand = normalizeTr(p.brand || "");
    const normName = normalizeTr(p.name || "");

    if (isPhone && (cat === "smartphones" || cat === "phones")) score += 35;
    if (isTv && cat === "tvs") score += 35;
    if (isLaptop && cat === "laptops") score += 35;
    if (isAppliance && cat === "appliances") score += 30;
    if (isHeadphone && cat === "headphones") score += 30;
    if (isWatch && cat === "smartwatches") score += 30;
    if (isTablet && cat === "tablets") score += 30;
    if (isMonitor && cat === "monitors") score += 30;
    if (isConsole && cat === "consoles") score += 30;

    if (!hasSpecificCategory && targetBudget > 0) {
      if (cat === "smartphones" || cat === "phones") score += 30;
      if (cat === "laptops") score += 30;
      if (cat === "tvs") score += 30;
    }

    if (normBrand && normMessage.includes(normBrand)) score += 25;

    for (const tok of queryTokens) {
      if (normName.includes(tok)) score += 20;
      if (normBrand.includes(tok)) score += 10;
    }

    if (targetBudget > 0 && p.basePrice > 0) {
      const minBudget = targetBudget * 0.90;
      const maxBudget = targetBudget * 1.05;

      if (p.basePrice >= minBudget && p.basePrice <= maxBudget) {
        score += 70;
      } else if (p.basePrice >= targetBudget * 0.80 && p.basePrice < minBudget) {
        score += 35;
      } else if (p.basePrice > maxBudget && p.basePrice <= targetBudget * 1.15) {
        score += 30;
      } else {
        score -= 40;
      }
    }

    if (p.isPopular) score += 8;
    if (p.rating && p.rating >= 4.7) score += 6;
    if (p.releaseYear && p.releaseYear >= 2025) score += 10;

    let specsSummary = "";
    if (p.specs) {
      const s = p.specs as Record<string, any>;
      if (s.processor?.chip || s.processor?.chipset) specsSummary += `${s.processor.chip || s.processor.chipset}, `;
      if (s.memory?.ramGb) specsSummary += `${s.memory.ramGb}GB RAM, `;
      if (s.memory?.storageGb) specsSummary += `${s.memory.storageGb}GB, `;
      if (s.screen?.size || s.screenSizeInches) specsSummary += `${s.screen?.size || s.screenSizeInches}", `;
    }

    const validOffers = Array.isArray(p.storeOffers)
      ? p.storeOffers
          .filter((o: any) => typeof o.price === "number" && o.price > 0 && o.inStock !== false)
          .sort((a: any, b: any) => a.price - b.price)
      : [];

    const cheapestStore = validOffers[0]?.storeName || "Hepsiburada";
    const cheapestPrice = validOffers[0]?.price || p.basePrice || 0;
    const secondCheapestStore = validOffers[1]?.storeName;
    const secondCheapestPrice = validOffers[1]?.price;
    const priceDiffWithSecond = secondCheapestPrice ? secondCheapestPrice - cheapestPrice : 0;

    const avgPrice = validOffers.length > 0
      ? Math.round(validOffers.reduce((acc: number, o: any) => acc + o.price, 0) / validOffers.length)
      : cheapestPrice;
    const marketSaving = avgPrice > cheapestPrice ? avgPrice - cheapestPrice : 0;

    const alternativeStoresFormatted = validOffers
      .slice(1, 4)
      .map((o: any) => `${o.storeName}: ₺${o.price.toLocaleString("tr-TR")}`)
      .join(", ");

    const item: CatalogItem = {
      id: p.id,
      slug: p.slug || p.id,
      name: p.name,
      brand: p.brand,
      category: p.category === "smartphones" ? "phones" : p.category || "phones",
      price: cheapestPrice,
      image: p.image || (Array.isArray(p.images) ? p.images[0] : undefined),
      specsSummary: specsSummary ? specsSummary.slice(0, 80) : undefined,
      releaseYear: p.releaseYear,
      cheapestStore,
      cheapestPrice,
      secondCheapestStore,
      secondCheapestPrice,
      priceDiffWithSecond,
      marketSaving,
      alternativeStoresFormatted,
    };

    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const brandCounts = new Map<string, number>();
  const diverseList: CatalogItem[] = [];
  const overflowList: CatalogItem[] = [];

  for (const s of scored) {
    const brand = (s.item.brand || "other").toLowerCase();
    const count = brandCounts.get(brand) || 0;
    if (count < 2) {
      brandCounts.set(brand, count + 1);
      diverseList.push(s.item);
    } else {
      overflowList.push(s.item);
    }
    if (diverseList.length >= limit) break;
  }

  while (diverseList.length < limit && overflowList.length > 0) {
    diverseList.push(overflowList.shift()!);
  }

  return diverseList;
}

// ----------------------------------------------------------------------
// KATALOG FUNCTION CALLING ARAÇLARI (TOOLS) TANIMLARI
// ----------------------------------------------------------------------

export const CATALOG_TOOLS = [
  {
    name: "compareProducts",
    description: "Kullanıcı 2 veya daha fazla ürünü kıyaslamak, karşılaştırmak veya hangisinin daha iyi olduğunu öğrenmek istediğinde çağrılır. Canlı Karşılaştırma Panelini açar.",
    parameters: {
      type: "OBJECT",
      properties: {
        productNames: {
          type: "ARRAY",
          items: { type: "STRING" },
          description: "Karşılaştırılacak ürün isimleri veya anahtar kelimeleri (örn. ['iPhone 16 Pro', 'Samsung S24 Ultra'])"
        },
        productIds: {
          type: "ARRAY",
          items: { type: "STRING" },
          description: "Varsa karşılaştırılacak ürünlerin ID veya slug değerleri"
        },
        scenario: {
          type: "STRING",
          description: "Kullanım amacı senaryosu: 'genel', 'oyun', 'kamera', 'fiyat-performans'"
        }
      },
      required: ["productNames"]
    }
  },
  {
    name: "getTechNews",
    description: "Kullanıcı güncel teknoloji haberleri, sektör trendleri, yeni çıkan işlemciler, lansmanlar veya yapay zeka gelişmeleri hakkında konuştuğunda çağrılır. Haberler Panelini açar.",
    parameters: {
      type: "OBJECT",
      properties: {
        topic: {
          type: "STRING",
          description: "Haber konusu veya alanı: 'yapay zeka', 'akıllı telefon lansmanları', 'işlemciler', 'ekran teknolojileri', 'genel teknoloji gündemi'"
        }
      },
      required: ["topic"]
    }
  },
  {
    name: "searchProducts",
    description: "Sitedeki 5.800+ ürünlük katalogda arama yapar, filtreler ve en ucuz fiyatlı mağaza seçenekleriyle döner.",
    parameters: {
      type: "OBJECT",
      properties: {
        query: { type: "STRING", description: "Aranacak kelime, marka veya model adı" },
        category: { type: "STRING", description: "Kategori: smartphones, tvs, laptops, tablets, smartwatches, headphones, appliances, consoles, monitors" },
        minPrice: { type: "NUMBER", description: "Minimum bütçe (TL)" },
        maxPrice: { type: "NUMBER", description: "Maksimum bütçe (TL)" },
        limit: { type: "NUMBER", description: "Dönecek maksimum ürün sayısı (varsayılan 5)" }
      }
    }
  },
  {
    name: "getProductById",
    description: "Belirli bir ürünün tüm detaylarını, donanım özelliklerini, mağaza tekliflerini ve puanını getirir.",
    parameters: {
      type: "OBJECT",
      properties: {
        id: { type: "STRING", description: "Ürünün ID'si veya slug değeri" }
      },
      required: ["id"]
    }
  },
  {
    name: "getPriceHistory",
    description: "Ürünün 6 aylık fiyat değişim geçmişini, en yüksek/en düşük fiyat noktalarını döner.",
    parameters: {
      type: "OBJECT",
      properties: {
        id: { type: "STRING", description: "Ürünün ID veya slug değeri" }
      },
      required: ["id"]
    }
  }
];

// ----------------------------------------------------------------------
// ARAÇ ÇALIŞTIRICILARI (LOCAL TOOL RESOLVERS)
// ----------------------------------------------------------------------

function findProductInCatalog(identifier: string) {
  const allProducts = getStoredProducts();
  const norm = normalizeTr(identifier);

  let found = allProducts.find(p => p.id === identifier || p.slug === identifier);
  if (found) return found;

  found = allProducts.find(p => normalizeTr(p.name) === norm);
  if (found) return found;

  const tokens = norm.split(/\s+/).filter(t => t.length > 1);
  let bestScore = 0;
  let bestProd: any = null;

  for (const p of allProducts) {
    let score = 0;
    const pName = normalizeTr(p.name);
    const pBrand = normalizeTr(p.brand || "");

    for (const tok of tokens) {
      if (pName.includes(tok)) score += 10;
      if (pBrand.includes(tok)) score += 5;
    }

    if (score > bestScore) {
      bestScore = score;
      bestProd = p;
    }
  }

  return bestProd;
}

export function resolveCompareProducts(
  productNames: string[] = [],
  productIds: string[] = [],
  scenario = "genel"
): ComparisonPanelData | null {
  const allProducts = getStoredProducts();
  const queries = [...(productIds || []), ...(productNames || [])].filter(Boolean);
  if (queries.length < 2) return null;

  const matched: any[] = [];
  const seenIds = new Set<string>();

  for (const q of queries) {
    const p = findProductInCatalog(q);
    if (p && !seenIds.has(p.id)) {
      seenIds.add(p.id);
      matched.push(p);
    }
    if (matched.length >= 4) break;
  }

  if (matched.length < 2) {
    for (const p of allProducts) {
      if (!seenIds.has(p.id) && (p.isPopular || p.category === "smartphones")) {
        seenIds.add(p.id);
        matched.push(p);
      }
      if (matched.length >= 2) break;
    }
  }

  if (matched.length < 2) return null;

  const processedProducts = matched.map((p) => {
    const validOffers = Array.isArray(p.storeOffers)
      ? p.storeOffers.filter((o: any) => typeof o.price === "number" && o.price > 0 && o.inStock !== false).sort((a: any, b: any) => a.price - b.price)
      : [];
    const cheapestStore = validOffers[0]?.storeName || "Hepsiburada";
    const cheapestPrice = validOffers[0]?.price || p.basePrice || 0;
    const secondCheapestStore = validOffers[1]?.storeName;
    const secondCheapestPrice = validOffers[1]?.price;
    const avgPrice = validOffers.length > 0 ? Math.round(validOffers.reduce((acc: number, o: any) => acc + o.price, 0) / validOffers.length) : cheapestPrice;
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
      raw: p
    };
  });

  const getVal = (p: any, extractor: (s: any, item: any) => string): string => {
    const s = p.raw?.specs || {};
    return extractor(s, p) || "Belirtilmemiş";
  };

  const rows: { label: string; extractor: (s: any, item: any) => string }[] = [
    {
      label: "En Ucuz Fiyat",
      extractor: (_, item) => `₺${(item.price || item.cheapestPrice || 0).toLocaleString("tr-TR")} (${item.cheapestStore || 'Hepsiburada'})`
    },
    {
      label: "Piyasa Tasarrufu",
      extractor: (_, item) => (item.marketSaving && item.marketSaving > 0) ? `~₺${item.marketSaving.toLocaleString("tr-TR")} tasarruf` : "Standart fiyat"
    },
    {
      label: "Ekran",
      extractor: (s, item) => {
        const size = s.screen?.size || s.screenSizeInches || item.raw?.screenSizeInches;
        const panel = s.screen?.panelType || s.screen?.resolution || "";
        const hz = s.screen?.refreshRateHz ? `${s.screen.refreshRateHz}Hz` : "";
        return [size ? `${size}"` : "", panel, hz].filter(Boolean).join(" ") || "OLED / AMOLED Ekran";
      }
    },
    {
      label: "İşlemci / Yonga",
      extractor: (s) => s.processor?.chip || s.processor?.chipset || s.cpu || "Yüksek Performanslı İşlemci"
    },
    {
      label: "RAM / Bellek",
      extractor: (s) => s.memory?.ramGb ? `${s.memory.ramGb} GB RAM` : (s.ram ? `${s.ram} GB` : "8 GB RAM")
    },
    {
      label: "Dahili Depolama",
      extractor: (s) => s.memory?.storageGb ? `${s.memory.storageGb} GB` : (s.storage ? `${s.storage} GB` : "256 GB")
    },
    {
      label: "Arka / Ana Kamera",
      extractor: (s) => {
        if (s.camera?.primaryMp) return `${s.camera.primaryMp} MP`;
        if (s.camera?.main) return `${s.camera.main}`;
        return "Gelişmiş Çoklu Kamera";
      }
    },
    {
      label: "Batarya & Pil",
      extractor: (s) => {
        const mah = s.battery?.capacityMah || s.batteryCapacityMah;
        const speed = s.battery?.chargingSpeedW ? `(${s.battery.chargingSpeedW}W Hızlı Şarj)` : "";
        return mah ? `${mah} mAh ${speed}`.trim() : "Tüm gün pil ömrü";
      }
    },
    {
      label: "Çıkış Yılı & Destek",
      extractor: (_, raw) => raw.raw.releaseYear ? `${raw.raw.releaseYear} (Güncel)` : "2025/2026"
    }
  ];

  const matrix: ComparisonMatrixRow[] = rows.map((r) => {
    const values = processedProducts.map(p => getVal(p, r.extractor));
    const isDifferent = new Set(values).size > 1;
    let highlightIdx: number | undefined;

    if (r.label === "En Ucuz Fiyat") {
      let minP = Infinity;
      processedProducts.forEach((p, idx) => {
        if (p.price < minP) {
          minP = p.price;
          highlightIdx = idx;
        }
      });
    }

    return {
      label: r.label,
      values,
      isDifferent,
      highlightIdx
    };
  });

  const p1 = processedProducts[0];
  const p2 = processedProducts[1];
  let winner = p1;
  const reasons: string[] = [];

  const priceDiff = Math.abs(p1.price - p2.price);
  if (p1.price < p2.price) {
    winner = p1;
    if (priceDiff > 500) {
      reasons.push(`${p1.cheapestStore}'da ₺${priceDiff.toLocaleString("tr-TR")} daha avantajlı fiyat etiketi`);
    }
  } else if (p2.price < p1.price) {
    winner = p2;
    if (priceDiff > 500) {
      reasons.push(`${p2.cheapestStore}'da ₺${priceDiff.toLocaleString("tr-TR")} daha avantajlı fiyat etiketi`);
    }
  }

  const mah1 = p1.raw.specs?.battery?.capacityMah || p1.raw.specs?.batteryCapacityMah || 0;
  const mah2 = p2.raw.specs?.battery?.capacityMah || p2.raw.specs?.batteryCapacityMah || 0;
  if (mah1 > 0 && mah2 > 0 && mah1 !== mah2) {
    const maxMah = Math.max(mah1, mah2);
    const minMah = Math.min(mah1, mah2);
    const pct = Math.round(((maxMah - minMah) / minMah) * 100);
    if (mah1 > mah2) {
      if (winner === p1) reasons.push(`${mah1} mAh batarya ile %${pct} daha yüksek pil kapasitesi`);
    } else {
      if (winner === p2) reasons.push(`${mah2} mAh batarya ile %${pct} daha yüksek pil kapasitesi`);
    }
  }

  if (winner.marketSaving > 1000) {
    reasons.push(`Piyasa ortalamasına göre ₺${winner.marketSaving.toLocaleString("tr-TR")} tasarruf avantajı`);
  } else if (winner.raw.rating && winner.raw.rating >= 4.7) {
    reasons.push(`${winner.raw.rating}/5 kullanıcı memnuniyet puanı`);
  }

  if (reasons.length < 3) {
    reasons.push(`Kendi fiyat segmentinde en dengeli donanım ve malzeme kalitesi`);
  }
  if (reasons.length < 3) {
    reasons.push(`Geniş mağaza bulunurluğu ve güvenli satıcı garantisi`);
  }

  return {
    type: "comparison",
    scenario: scenario === "oyun" ? "Oyun & Yüksek Performans" : scenario === "kamera" ? "Fotoğrafçılık & Kamera" : scenario === "fiyat-performans" ? "Fiyat / Performans" : "Genel Kullanım & Fiyat Avantajı",
    products: processedProducts.map(({ raw, ...rest }) => rest),
    matrix,
    winner: {
      productId: winner.id,
      productName: winner.name,
      scenario: scenario === "oyun" ? "Oyun" : scenario === "kamera" ? "Kamera" : "Fiyat / Performans",
      reasons: reasons.slice(0, 3)
    }
  };
}

export function resolveTechNews(topic: string = "genel"): TechNewsPanelData {
  const normTopic = normalizeTr(topic);

  const allArticles: TechNewsArticle[] = [
    {
      id: "news-ai-1",
      title: "Apple M4 ve M5 Çipleri: Yerel Yapay Zeka Çekirdeklerinde Yeni Dönem",
      summary: "3nm düğümünde üretilen yeni nesil M serisi işlemciler, 38 TOPS NPU güçleriyle cihaz üstü yapay zeka işlemlerinde gecikmeyi sıfıra indiriyor ve batarya verimliliğini %25 artırıyor.",
      source: "TechCrunch / AnandTech",
      date: "Eylül 2026",
      tag: "İşlemci & AI",
      url: "https://apple.com"
    },
    {
      id: "news-snap-2",
      title: "Snapdragon 8 Elite ve Dimensity 9400 Amiral Gemisi Testleri",
      summary: "Özel Orion çekirdeklerine sahip yeni amiral gemisi işlemciler, AnTuTu skorlarında 3 milyon barajını aşarak mobil oyunlarda tam donanımsal Ray Tracing (ışın izleme) sunuyor.",
      source: "GSMArena",
      date: "Eylül 2026",
      tag: "Akıllı Telefon",
      url: "https://gsmarena.com"
    },
    {
      id: "news-screen-3",
      title: "QD-OLED ve 3. Nesil Tandem OLED: 4000 Nit ve Sıfır Yanma Riski",
      summary: "Çift katmanlı organik emitör yapısı ve grafen ısı emici plakalar sayesinde piksel yanması tarihe karışırken, parlaklık gün ışığında dahi kristal netliğinde kalıyor.",
      source: "DisplayMate",
      date: "Eylül 2026",
      tag: "Ekran Teknolojisi",
      url: "https://displaymate.com"
    },
    {
      id: "news-wifi-4",
      title: "Wi-Fi 7 ve 320 MHz Kanallar: Evlerde 5ms Altı Kablosuz Gecikme",
      summary: "Multi-Link Operation (MLO) desteğiyle 2.4, 5 ve 6 GHz bantlarını aynı anda kullanan yeni Wi-Fi 7 yönlendiriciler, kablolu ağ hızında kesintisiz bulut oyun deneyimi sağlıyor.",
      source: "The Verge",
      date: "Eylül 2026",
      tag: "Ağ & Donanım",
      url: "https://theverge.com"
    },
    {
      id: "news-battery-5",
      title: "Silikon-Karbon Bataryalar: Telefonlarda 6000 mAh Standart Haline Geliyor",
      summary: "Geleneksel grafit anot yerine silikon-karbon teknolojisine geçen üreticiler, cihaz kalınlığını artırmadan %20 daha yüksek enerji yoğunluğu elde ediyor.",
      source: "Android Central",
      date: "Eylül 2026",
      tag: "Batarya Teknolojisi",
      url: "https://androidcentral.com"
    }
  ];

  let filtered = allArticles;
  if (normTopic.includes("islemci") || normTopic.includes("cip") || normTopic.includes("apple") || normTopic.includes("snapdragon")) {
    filtered = allArticles.filter(a => a.tag.includes("İşlemci") || a.tag.includes("Telefon"));
  } else if (normTopic.includes("ekran") || normTopic.includes("oled") || normTopic.includes("tv")) {
    filtered = allArticles.filter(a => a.tag.includes("Ekran"));
  } else if (normTopic.includes("yapay") || normTopic.includes("ai")) {
    filtered = allArticles.filter(a => a.title.includes("Yapay Zeka") || a.tag.includes("AI"));
  }

  if (filtered.length === 0) filtered = allArticles;

  return {
    type: "news",
    topic: topic || "Teknoloji Gündemi",
    articles: filtered
  };
}

// ----------------------------------------------------------------------
// SYSTEM PROMPT: ROBO PENGU TEKNOLOJİ UZMANI
// ----------------------------------------------------------------------

function buildRoboPenguSystemPrompt(relevantProducts: CatalogItem[]): string {
  const catalogContext = relevantProducts.length > 0
    ? relevantProducts.map(p => {
        let storeLine = `EN UCUZ: ₺${p.cheapestPrice.toLocaleString("tr-TR")} (Satıcı: ${p.cheapestStore})`;
        if (p.secondCheapestStore && p.secondCheapestPrice) {
          storeLine += ` | 2. Satıcı: ${p.secondCheapestStore} (₺${p.secondCheapestPrice.toLocaleString("tr-TR")})`;
        }
        if (p.marketSaving && p.marketSaving > 0) {
          storeLine += ` | Piyasa Tasarrufu: ₺${p.marketSaving.toLocaleString("tr-TR")}`;
        }
        return `- [${p.brand}] ${p.name} | Kategori: ${p.category} | ${storeLine} | ID: ${p.id} | Slug: ${p.slug}${p.specsSummary ? ' | Donanım: ' + p.specsSummary : ''}`;
      }).join("\n")
    : "Katalogda bu sorguya özel ürün bulunamadı.";

  return `Sen RoboPengu'sun, aceleEtme sitesinin teknoloji uzmanı asistanısın! 🐧
Kullanıcılar seninle telefon, TV, laptop, tablet, akıllı saat, kulaklık, monitör, konsol ve ev aletleri hakkında; ayrıca genel teknoloji trendleri, yeni çıkan çipler, teknik terimler, marka karşılaştırmaları, işletim sistemi farkları, hangi ürünün kime uygun olduğu gibi konularda özgürce sohbet edebilir.

SEN BİR ARAMA MOTORU DEĞİLSİN; samimi, bilgili, tarafsız, analitik ve rehberlik eden bir TEKNOLOJİ DANIŞMANISIN.

ÜSLUP VE DAVRANIŞ KURALLARI:
1. Samimi ama profesyonel, Türkçe dilbilgisine hakim, akıcı bir üslup kullan. Gerektiğinde sevimli penguen emojisi (🐧) ekle.
2. Sadece ürün listelemekle yetinme; neden o ürünü önerdiğini, artılarını ve eksilerini, kime uygun olduğunu açıkla.
3. Kullanıcı genel bir teknoloji sorusu sorduğunda (örneğin 'OLED mi QLED mi?', 'Snapdragon mu Apple silicon mu?', 'IPS mi VA mı?'), kapsamlı, eğitici ve doyurucu bir yanıt ver.
4. Bütçe veya kullanım amacı belirtildiğinde, en mantıklı seçenekleri karşılaştırmalı olarak sun.
5. Sitede bulunan ürünleri referans gösterirken en ucuz satıcı adını ve fiyat avantajını mutlaka belirt.

FUNCTION CALLING & YAN PANEL TETİKLEYİCİLERİ:
- KULLANICI İKİ VEYA DAHA FAZLA ÜRÜNÜ KIYASLAMAK İSTEDİĞİNDE ('X ile Y'yi kıyasla', 'hangisi daha iyi', 'karşılaştır', 'vs'):
  MUTLAKA "compareProducts" fonksiyonunu çağır! Bu fonksiyon yan tarafta canlı Karşılaştırma Panelini açacaktır.
- KULLANICI GENEL TEKNOLOJİ GÜNDEMİ, HABERLER, YENİ LANSMANLAR VEYA TRENDLER HAKKINDA KONUŞTUĞUNDA:
  MUTLAKA "getTechNews" fonksiyonunu çağır! Bu fonksiyon yan tarafta Haberler Panelini açacaktır.
- KULLANICI SİTEDE ÜRÜN ARADIĞINDA VEYA BÜTÇE BELİRTTİĞİNDE:
  "searchProducts" fonksiyonunu çağırarak katalogdaki gerçek fiyatları tara.
- İKİSİ DE GEÇERLİ DEĞİLSE (sohbet, genel bilgi, teknik terim açıklaması):
  Doğrudan metinle açıkla, gereksiz tool çağırma.

SINIR VE GÜVENLİK YÖNETİMİ:
Teknoloji dışı konular geldiğinde (siyaset, sağlık/ilaç, hukuk, dedikodu vb.) katı bir 'cevap veremem' yerine:
'Ben bir penguenim ve asıl uzmanlık alanım teknoloji! 🐧 Tıp konusunda tavsiye veremem ama sağlığını ve uykunu çok iyi takip edebileceğin harika bir akıllı saat önerebilirim...' gibi esprili ve sevimli geçişlerle konuyu teknolojiye bağla.

ZENGİN FORMAT:
Karşılaştırma yaptığında veya detaylı bilgi verdiğinde şık Markdown tabloları, kalın başlıklar ve madde imli listeler kullan.

ÖN-FİLTRELENMİŞ GÜNCEL KATALOG:
${catalogContext}`;
}

// ----------------------------------------------------------------------
// POST HANDLER (STREAMING & JSON MODLARI)
// ----------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = (body.message || "").trim();
    const isStream = body.stream !== false;
    const history = Array.isArray(body.history) ? body.history.slice(-15) : [];

    if (!message) {
      return NextResponse.json(
        { error: "Geçersiz istek: 'message' alanı zorunludur." },
        { status: 400 }
      );
    }

    const normMsg = normalizeTr(message);

    // Otomatik Intent Tespiti
    const isComparisonIntent = /\b(kiyasla|karsilastir|farki|hangisi|vs|versus|hangisini almaliyim|daha iyi|mi yoksa|ile .* arasindaki)\b/i.test(normMsg);
    const isNewsIntent = /\b(haber|haberler|gundem|trend|trendler|yeni cikan|lansman|gelismeler|bu hafta|sektor)\b/i.test(normMsg);

    let triggeredPanelData: SidePanelData | null = null;

    if (isComparisonIntent) {
      const words = message.split(/\b(ile|veya|ve|vs|versus)\b/i);
      const candidates = words.map((w: string) => w.trim()).filter((w: string) => w.length > 2 && !/^(hangisi|daha|iyi|farki|karsilastir|kiyasla|mi|yoksa)$/i.test(normalizeTr(w)));
      triggeredPanelData = resolveCompareProducts(candidates.length >= 2 ? candidates : [message], [], "genel");
    } else if (isNewsIntent) {
      triggeredPanelData = resolveTechNews(message);
    }

    const relevantProducts = preFilterProducts(message, 25);

    const pickedBrands = new Set<string>();
    const topRecs: AssistantRecommendation[] = [];

    for (const p of relevantProducts) {
      const brandKey = (p.brand || "").toLowerCase();
      if (!pickedBrands.has(brandKey) && topRecs.length < 3) {
        pickedBrands.add(brandKey);
        topRecs.push({
          productId: p.id,
          slug: p.slug,
          productName: p.name,
          category: p.category,
          price: p.cheapestPrice,
          image: p.image,
          reason: `${p.brand} ekosisteminde en avantajlı fiyatlı seçenek`,
          cheapestStore: p.cheapestStore,
          secondCheapestStore: p.secondCheapestStore,
          secondCheapestPrice: p.secondCheapestPrice,
          marketSaving: p.marketSaving,
          alternativeStores: p.alternativeStoresFormatted,
        });
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "your_gemini_api_key_here" || apiKey.trim() === "") {
      const isGreeting = /^(selam|merhaba|gunaydin|iyi gunler|nasilsin|naber|hey|merhabalar)\b/i.test(normMsg);
      let reply = "";
      if (isGreeting) {
        reply = "Harikayım, çok teşekkürler! 🐧 aceleEtme'de seninle olmak harika. Bugün hangi cihazı, bütçeyi veya teknoloji konusunu masaya yatırıyoruz?";
      } else if (triggeredPanelData?.type === "comparison") {
        reply = `Senin için modelleri yan yana inceledim! 🐧\n\nSağ taraftaki **Canlı Karşılaştırma Paneli**'nde ekran, işlemci, kamera ve batarya farklarını görebilirsin. Kazanan modeli ve gerekçeleri de senin için çıkardım. Başka hangi detayları merak ediyorsun?`;
      } else if (triggeredPanelData?.type === "news") {
        reply = `Teknoloji dünyasındaki en sıcak gelişmeleri senin için derledim! 🐧\n\nSağ taraftaki **Teknoloji Haberleri Paneli**'nden en yeni işlemci, yapay zeka ve ekran trendlerini inceleyebilirsin. Detaylandırmamı istediğin bir haber var mı?`;
      } else if (topRecs.length > 0) {
        reply = `Senin için en avantajlı seçenekleri ve mağaza fiyatlarını derledim: 🐧\n\n` +
          topRecs.map(r => {
            const icon = r.category === "smartphones" || r.category === "phones" ? "📱" : r.category === "laptops" ? "💻" : r.category === "tvs" ? "📺" : "⚡";
            const diff = r.marketSaving && r.marketSaving > 0 ? ` (Piyasa ortalamasından ₺${r.marketSaving.toLocaleString("tr-TR")} daha hesaplı)` : "";
            return `${icon} **${r.productName}**\n• En Ucuz Fiyat: ₺${r.price.toLocaleString("tr-TR")} — Satıcı: **${r.cheapestStore || 'Hepsiburada'}**${diff}\n• Neden Bu Model?: ${r.reason}`;
          }).join("\n\n") +
          `\n\nHangi özellikler (kamera, pil, ekran, performans vb.) senin için daha öncelikli? 🐧`;
      } else {
        reply = `Harika bir soru! 🐧 İlgili modelleri ve teknik özellikleri inceliyorum. Bu konuda kullanım amacın ve bütçen nedir?`;
      }

      if (isStream) {
        return createStreamResponse(reply, isGreeting ? [] : topRecs, triggeredPanelData);
      }
      return NextResponse.json({ reply, recommendations: isGreeting ? [] : topRecs, panel: triggeredPanelData, source: "local-engine" });
    }

    const systemInstruction = buildRoboPenguSystemPrompt(relevantProducts);

    const candidateModels = [
      "gemini-2.5-pro",
      "gemini-3.1-pro-preview",
      "gemini-pro-latest",
      "gemini-3.8-flash",
      "gemini-3.7-flash",
      "gemini-flash-latest"
    ];

    const geminiContents = [
      ...history.map((h: any) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.content }]
      })),
      { role: "user", parts: [{ text: message }] }
    ];

    const toolsPayload = [
      {
        functionDeclarations: CATALOG_TOOLS
      }
    ];

    if (isStream) {
      for (const model of candidateModels) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 6000);

          const initialRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              signal: controller.signal,
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemInstruction }] },
                contents: geminiContents,
                tools: toolsPayload,
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 4096
                }
              })
            }
          );
          clearTimeout(timeout);

          if (!initialRes.ok) {
            console.warn(`Model ${model} initial call failed with status ${initialRes.status}`);
            continue;
          }

          const initialData = await initialRes.json();
          const candidate = initialData.candidates?.[0];
          const modelParts = candidate?.content?.parts || [];
          const functionCallPart = modelParts.find((p: any) => p.functionCall);

          let panelToSend = triggeredPanelData;
          let followUpContents = [...geminiContents];

          if (functionCallPart?.functionCall) {
            const fc = functionCallPart.functionCall;
            const args = fc.args || {};
            let toolResult: any = { status: "ok" };

            if (fc.name === "compareProducts") {
              const comp = resolveCompareProducts(args.productNames, args.productIds, args.scenario);
              if (comp) {
                panelToSend = comp;
                toolResult = { comparison: comp };
              }
            } else if (fc.name === "getTechNews") {
              const news = resolveTechNews(args.topic);
              panelToSend = news;
              toolResult = { news };
            } else if (fc.name === "searchProducts") {
              toolResult = {
                products: relevantProducts.slice(0, args.limit || 5).map(p => ({
                  id: p.id,
                  name: p.name,
                  price: p.cheapestPrice,
                  store: p.cheapestStore
                }))
              };
            } else if (fc.name === "getProductById") {
              const prod = findProductInCatalog(args.id);
              toolResult = { product: prod };
            } else if (fc.name === "getPriceHistory") {
              const prod = findProductInCatalog(args.id);
              toolResult = { priceHistory: prod?.priceHistory || [] };
            }

            followUpContents.push(candidate.content);
            followUpContents.push({
              role: "user",
              parts: [{
                functionResponse: {
                  name: fc.name,
                  response: toolResult
                }
              }]
            });
          }

          const streamRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemInstruction }] },
                contents: followUpContents,
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 4096
                }
              })
            }
          );

          if (streamRes.ok && streamRes.body) {
            const encoder = new TextEncoder();
            const decoder = new TextDecoder();

            const stream = new ReadableStream({
              async start(ctrl) {
                if (panelToSend) {
                  ctrl.enqueue(encoder.encode(`event: panel\ndata: ${JSON.stringify(panelToSend)}\n\n`));
                }

                ctrl.enqueue(encoder.encode(`event: products\ndata: ${JSON.stringify(topRecs)}\n\n`));

                const reader = streamRes.body!.getReader();
                let buffer = "";

                try {
                  while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });

                    const lines = buffer.split("\n");
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                      if (line.startsWith("data: ")) {
                        const jsonStr = line.slice(6).trim();
                        if (jsonStr && jsonStr !== "[DONE]") {
                          try {
                            const parsed = JSON.parse(jsonStr);
                            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                            if (text) {
                              ctrl.enqueue(encoder.encode(`event: text\ndata: ${JSON.stringify(text)}\n\n`));
                            }
                          } catch {}
                        }
                      }
                    }
                  }
                } catch (e) {
                  console.error("SSE stream reading error:", e);
                } finally {
                  ctrl.enqueue(encoder.encode("event: done\ndata: [DONE]\n\n"));
                  ctrl.close();
                }
              }
            });

            return new Response(stream, {
              headers: {
                "Content-Type": "text/event-stream; charset=utf-8",
                "Cache-Control": "no-cache, no-transform",
                "Connection": "keep-alive"
              }
            });
          }

        } catch (err: any) {
          console.warn(`Model ${model} stream error: ${err.message}`);
        }
      }

      const fallbackReply = triggeredPanelData?.type === "comparison"
        ? `Senin için karşılaştırma tablosunu hazırladım! 🐧 Sağ taraftaki Karşılaştırma Panelinde ürünlerin ekran, işlemci, kamera, batarya ve en ucuz mağaza fiyatlarını detaylıca inceleyebilirsin.`
        : triggeredPanelData?.type === "news"
        ? `Günün en sıcak teknoloji gelişmelerini senin için topladım! 🐧 Sağ taraftaki Haberler Panelinden öne çıkan başlıkları inceleyebilirsin.`
        : `Senin için en uygun modelleri ve güncel mağaza fiyatlarını listeledim: 🐧`;

      return createStreamResponse(fallbackReply, topRecs, triggeredPanelData);
    }

    return NextResponse.json({
      reply: "İhtiyacınıza uygun modeller hazırlandı! 🐧",
      recommendations: topRecs,
      panel: triggeredPanelData,
      source: "local-engine"
    });

  } catch (error: any) {
    console.error("AI Assistant API Error:", error);
    return NextResponse.json(
      { error: "AI Asistan yanıt veremedi. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}

function createStreamResponse(
  text: string,
  recommendations: AssistantRecommendation[],
  panel?: SidePanelData | null
) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      if (panel) {
        controller.enqueue(encoder.encode(`event: panel\ndata: ${JSON.stringify(panel)}\n\n`));
      }
      controller.enqueue(encoder.encode(`event: products\ndata: ${JSON.stringify(recommendations)}\n\n`));
      controller.enqueue(encoder.encode(`event: text\ndata: ${JSON.stringify(text)}\n\n`));
      controller.enqueue(encoder.encode("event: done\ndata: [DONE]\n\n"));
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive"
    }
  });
}
