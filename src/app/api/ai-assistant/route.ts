import { NextRequest, NextResponse } from "next/server";
import { getStoredProducts } from "@/lib/adminData";
import { callGeminiWithFallback } from "@/lib/ai/modelRouter";
import { resolveCompareProducts, resolveBudgetRecommendation, searchProductsInCatalog } from "@/lib/ai/resolvers";
import { checkRateLimit, validateUserMessage, flagsPromptInjection } from "@/lib/ai/safety";

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
  category: string;
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

// ---- Türkçe Normalizasyon --------------------------------------------

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

// ----------------------------------------------------------------------
// KATEGORİYE DUYARLI VE GERÇEK VERİ TEMELLİ ÖZELLİK MATRİSİ
// ----------------------------------------------------------------------

function getProperty(item: any, path: string[]): any {
  let curr = item.raw?.specs || item.specs || {};
  for (const k of path) {
    if (!curr || typeof curr !== "object") return undefined;
    curr = curr[k];
  }
  return curr;
}

export function buildComparisonMatrix(products: any[], category: string): ComparisonMatrixRow[] {
  if (!products || products.length === 0) return [];
  const cat = (category || products[0]?.category || "").toLowerCase();
  const rows: { label: string; values: string[] }[] = [];

  // 1. En Ucuz Fiyat & Mağaza (Tüm ürünler için geçerli)
  rows.push({
    label: "En Ucuz Fiyat",
    values: products.map(p => `₺${(p.price || p.cheapestPrice || 0).toLocaleString("tr-TR")} (${p.cheapestStore || "En Uygun"})`)
  });

  // 2. Piyasa Tasarrufu (Yalnızca pozitif tasarruf olan durumlarda ekle)
  const hasSavings = products.some(p => p.marketSaving && p.marketSaving > 0);
  if (hasSavings) {
    rows.push({
      label: "Piyasa Tasarrufu",
      values: products.map(p => p.marketSaving && p.marketSaving > 0 ? `~₺${p.marketSaving.toLocaleString("tr-TR")} tasarruf` : "Standart fiyat")
    });
  }

  // Yardımcı ekleyici: Sadece en az 1 üründe gerçek veri varsa satırı oluşturur, yoksa satırı hiç eklemez!
  const addCategoryRow = (label: string, fn: (p: any) => string) => {
    const values = products.map(fn);
    const hasValidData = values.some(v => v && v !== "-" && v.trim() !== "");
    if (hasValidData) {
      rows.push({ label, values });
    }
  };

  if (cat === "tvs") {
    // TELEVİZYON GERÇEK ALANLARI
    addCategoryRow("Ekran Boyutu", p => {
      const s = getProperty(p, ["screenSizeInches"]) || p.raw?.screenSizeInches;
      return s ? `${s} inç` : "-";
    });
    addCategoryRow("Panel Teknolojisi", p => {
      const t = getProperty(p, ["displayTech"]) || getProperty(p, ["panelType"]);
      return t ? String(t) : "-";
    });
    addCategoryRow("Çözünürlük", p => {
      const r = getProperty(p, ["resolution"]);
      return r ? String(r) : "-";
    });
    addCategoryRow("Yenileme Hızı", p => {
      const hz = getProperty(p, ["refreshRateHz"]) || getProperty(p, ["refreshRate"]);
      return hz ? `${hz} Hz` : "-";
    });
    addCategoryRow("Smart TV / İşletim Sistemi", p => {
      const os = getProperty(p, ["smartOs"]) || getProperty(p, ["os"]);
      return os ? String(os) : "-";
    });
    addCategoryRow("HDR Desteği", p => {
      const hdr = getProperty(p, ["hdrFormats"]) || getProperty(p, ["hdrSupport"]);
      if (Array.isArray(hdr) && hdr.length > 0) return hdr.join(", ");
      if (typeof hdr === "string" && hdr) return hdr;
      return "-";
    });
    addCategoryRow("Ses Çıkış Gücü", p => {
      const w = getProperty(p, ["audioPowerWatts"]);
      return w ? `${w} W` : "-";
    });
    addCategoryRow("Çıkış Yılı", p => p.raw?.releaseYear ? `${p.raw.releaseYear}` : "-");

  } else if (cat === "laptops") {
    // LAPTOP GERÇEK ALANLARI
    addCategoryRow("İşlemci (CPU)", p => {
      const cpu = getProperty(p, ["processor"]) || getProperty(p, ["cpu"]);
      return cpu ? String(cpu) : "-";
    });
    addCategoryRow("Ekran Kartı (GPU)", p => {
      const gpu = getProperty(p, ["gpu"]);
      return gpu ? String(gpu) : "-";
    });
    addCategoryRow("RAM (Bellek)", p => {
      const r = getProperty(p, ["ramGb"]) || getProperty(p, ["ram"]);
      return r ? `${r} GB RAM` : "-";
    });
    addCategoryRow("Dahili Depolama", p => {
      const s = getProperty(p, ["storageGb"]) || getProperty(p, ["storage"]);
      return s ? `${s} GB SSD` : "-";
    });
    addCategoryRow("Ekran Boyutu & Çözünürlük", p => {
      const size = getProperty(p, ["screenSizeInches"]) || p.raw?.screenSizeInches;
      const res = getProperty(p, ["screenResolution"]) || "";
      return size ? `${size} inç ${res}`.trim() : "-";
    });
    addCategoryRow("Pil Ömrü / Kapasite", p => {
      const h = getProperty(p, ["batteryLifeHours"]);
      const wh = getProperty(p, ["batteryCapacityWh"]);
      if (h) return `${h} Saat`;
      if (wh) return `${wh} Wh`;
      return "-";
    });
    addCategoryRow("Ağırlık", p => {
      const w = getProperty(p, ["weightKg"]);
      return w ? `${w} kg` : "-";
    });
    addCategoryRow("İşletim Sistemi", p => {
      const os = getProperty(p, ["os"]);
      return os ? String(os) : "-";
    });
    addCategoryRow("Çıkış Yılı", p => p.raw?.releaseYear ? `${p.raw.releaseYear}` : "-");

  } else if (cat === "smartwatches") {
    // AKILLI SAAT GERÇEK ALANLARI
    addCategoryRow("Kasa Boyutu", p => {
      const c = getProperty(p, ["caseSize"]) || getProperty(p, ["size"]);
      return c ? String(c) : "-";
    });
    addCategoryRow("Ekran Tipi", p => {
      const e = getProperty(p, ["screenType"]) || getProperty(p, ["displayType"]);
      return e ? String(e) : "-";
    });
    addCategoryRow("Pil Ömrü", p => {
      const b = getProperty(p, ["batteryLife"]);
      return b ? String(b) : "-";
    });
    addCategoryRow("Suya Dayanıklılık", p => {
      const w = getProperty(p, ["waterResistance"]);
      return w ? String(w) : "-";
    });
    addCategoryRow("Sensörler", p => {
      const s = getProperty(p, ["sensors"]);
      if (Array.isArray(s)) return s.join(", ");
      return s ? String(s) : "-";
    });

  } else if (cat === "headphones") {
    // KULAKLIK GERÇEK ALANLARI
    addCategoryRow("Kulaklık Tipi", p => {
      const f = getProperty(p, ["formFactor"]);
      return f ? String(f) : "-";
    });
    addCategoryRow("Bağlantı Türü", p => {
      const c = getProperty(p, ["connectivityType"]) || getProperty(p, ["connection"]);
      return c ? String(c) : "-";
    });
    addCategoryRow("Gürültü Engelleme (ANC)", p => {
      const anc = getProperty(p, ["noiseCancelling"]) || getProperty(p, ["anc"]);
      return anc ? String(anc) : "-";
    });
    addCategoryRow("Pil / Çalma Süresi", p => {
      const b = getProperty(p, ["batteryLife"]);
      return b ? String(b) : "-";
    });
    addCategoryRow("Sürücü Boyutu", p => {
      const d = getProperty(p, ["driverSize"]);
      return d ? String(d) : "-";
    });
    addCategoryRow("Su Dayanıklılığı", p => {
      const w = getProperty(p, ["waterResistance"]);
      return w ? String(w) : "-";
    });

  } else if (cat === "monitors") {
    // MONİTÖR GERÇEK ALANLARI
    addCategoryRow("Ekran Boyutu", p => {
      const s = getProperty(p, ["screenSizeInches"]) || getProperty(p, ["screenSize"]) || p.raw?.screenSizeInches;
      return s ? `${s} inç` : "-";
    });
    addCategoryRow("Panel Tipi", p => {
      const pan = getProperty(p, ["panelType"]);
      return pan ? String(pan) : "-";
    });
    addCategoryRow("Çözünürlük", p => {
      const r = getProperty(p, ["resolution"]);
      return r ? String(r) : "-";
    });
    addCategoryRow("Yenileme Hızı", p => {
      const hz = getProperty(p, ["refreshRateHz"]) || getProperty(p, ["refreshRate"]);
      return hz ? `${hz} Hz` : "-";
    });
    addCategoryRow("Tepki Süresi", p => {
      const ms = getProperty(p, ["responseTimeMs"]) || getProperty(p, ["responseTime"]);
      return ms ? `${ms} ms` : "-";
    });

  } else if (cat === "consoles") {
    // KONSOL GERÇEK ALANLARI
    addCategoryRow("Dahili Depolama", p => {
      const s = getProperty(p, ["storage"]) || getProperty(p, ["storageGb"]);
      return s ? `${s} GB` : "-";
    });
    addCategoryRow("Çözünürlük & FPS", p => {
      const res = getProperty(p, ["maxResolution"]) || getProperty(p, ["fps"]);
      return res ? String(res) : "-";
    });
    addCategoryRow("Disk Sürücüsü", p => {
      const d = getProperty(p, ["discDrive"]);
      return d !== undefined ? (d ? "Var" : "Dijital Sürüm") : "-";
    });

  } else if (cat === "appliances") {
    // EV ALETİ ALANLARI
    addCategoryRow("Güç (Watt)", p => {
      const w = getProperty(p, ["powerWatts"]);
      return w ? `${w} W` : "-";
    });
    addCategoryRow("Kapasite", p => {
      const cap = getProperty(p, ["capacity"]);
      return cap ? String(cap) : "-";
    });

  } else {
    // TELEFON / GENEL ALANLAR (Sadece telefon kategorisinde çalışır)
    addCategoryRow("Ekran", p => {
      const size = getProperty(p, ["screen", "size"]) || getProperty(p, ["screenSizeInches"]) || p.raw?.screenSizeInches;
      const type = getProperty(p, ["screen", "type"]) || "";
      const hz = getProperty(p, ["screen", "refreshRate"]) ? `${getProperty(p, ["screen", "refreshRate"])}Hz` : "";
      return [size ? `${size}"` : "", type, hz].filter(Boolean).join(" ") || "-";
    });
    addCategoryRow("İşlemci / Yonga", p => {
      const chip = getProperty(p, ["processor", "chip"]) || getProperty(p, ["processor", "chipset"]) || getProperty(p, ["processor"]);
      return chip ? String(chip) : "-";
    });
    addCategoryRow("RAM (Bellek)", p => {
      const ram = getProperty(p, ["memory", "ramGb"]) || getProperty(p, ["ramGb"]) || getProperty(p, ["ram"]);
      return ram ? `${ram} GB RAM` : "-";
    });
    addCategoryRow("Dahili Depolama", p => {
      const st = getProperty(p, ["memory", "storageGb"]) || getProperty(p, ["storageGb"]) || getProperty(p, ["storage"]);
      return st ? `${st} GB` : "-";
    });
    addCategoryRow("Arka Kamera", p => {
      const cam = getProperty(p, ["camera", "mainMp"]) || getProperty(p, ["camera", "primaryMp"]);
      return cam ? `${cam} MP` : "-";
    });
    addCategoryRow("Batarya & Şarj", p => {
      const mah = getProperty(p, ["battery", "capacitymAh"]) || getProperty(p, ["battery", "capacityMah"]) || getProperty(p, ["batteryCapacityMah"]);
      const w = getProperty(p, ["battery", "chargingWatts"]) || getProperty(p, ["battery", "chargingSpeedW"]);
      return mah ? `${mah} mAh${w ? ` (${w}W)` : ""}` : "-";
    });
    addCategoryRow("Ağırlık", p => {
      const w = getProperty(p, ["build", "weightGrams"]) || getProperty(p, ["weightGrams"]);
      return w ? `${w} g` : "-";
    });
    addCategoryRow("Çıkış Yılı", p => p.raw?.releaseYear ? `${p.raw.releaseYear}` : "-");
  }

  return rows.map(r => {
    const isDifferent = new Set(r.values.filter(v => v !== "-")).size > 1;
    let highlightIdx: number | undefined;

    if (r.label === "En Ucuz Fiyat") {
      let minP = Infinity;
      products.forEach((p, idx) => {
        if (p.price < minP) {
          minP = p.price;
          highlightIdx = idx;
        }
      });
    }

    return {
      label: r.label,
      values: r.values,
      isDifferent,
      highlightIdx
    };
  });
}

// ----------------------------------------------------------------------
// SAYISAL VE GERÇEK VERİYE DAYALI KAZANAN HESAPLAMA
// ----------------------------------------------------------------------

function calculateVerifiableWinner(products: any[], category: string, scenario = "genel") {
  const p1 = products[0];
  const p2 = products[1];
  let winner = p1;
  const reasons: string[] = [];

  // 1. Fiyat Farkı Analizi
  const priceDiff = Math.abs(p1.price - p2.price);
  const minP = Math.min(p1.price, p2.price);
  const maxP = Math.max(p1.price, p2.price);
  const pctSavings = maxP > 0 ? Math.round(((maxP - minP) / maxP) * 100) : 0;

  if (p1.price < p2.price) {
    winner = p1;
    if (priceDiff > 200) {
      reasons.push(`${p1.cheapestStore}'da ₺${priceDiff.toLocaleString("tr-TR")} (%${pctSavings}) daha avantajlı fiyat`);
    }
  } else if (p2.price < p1.price) {
    winner = p2;
    if (priceDiff > 200) {
      reasons.push(`${p2.cheapestStore}'da ₺${priceDiff.toLocaleString("tr-TR")} (%${pctSavings}) daha avantajlı fiyat`);
    }
  }

  // 2. Kategoriye Özel Sayısal Karşılaştırmalar
  const cat = (category || p1.category || "").toLowerCase();

  if (cat === "smartphones" || cat === "phones") {
    // Batarya mAh
    const m1 = getProperty(p1, ["battery", "capacitymAh"]) || getProperty(p1, ["batteryCapacityMah"]) || 0;
    const m2 = getProperty(p2, ["battery", "capacitymAh"]) || getProperty(p2, ["batteryCapacityMah"]) || 0;
    if (m1 > 0 && m2 > 0 && m1 !== m2) {
      const winM = winner === p1 ? m1 : m2;
      const loseM = winner === p1 ? m2 : m1;
      if (winM > loseM) {
        reasons.push(`${winM} mAh batarya (${loseM} mAh'e göre ${winM - loseM} mAh daha yüksek pil)`);
      }
    }
    // RAM
    const r1 = getProperty(p1, ["memory", "ramGb"]) || getProperty(p1, ["ramGb"]) || 0;
    const r2 = getProperty(p2, ["memory", "ramGb"]) || getProperty(p2, ["ramGb"]) || 0;
    if (r1 > 0 && r2 > 0 && r1 !== r2) {
      const winR = winner === p1 ? r1 : r2;
      const loseR = winner === p1 ? r2 : r1;
      if (winR > loseR) {
        reasons.push(`${winR} GB RAM (${loseR} GB'a kıyasla daha yüksek çoklu görev gücü)`);
      }
    }
  } else if (cat === "tvs") {
    // Yenileme hızı (Hz)
    const hz1 = getProperty(p1, ["refreshRateHz"]) || 0;
    const hz2 = getProperty(p2, ["refreshRateHz"]) || 0;
    if (hz1 > 0 && hz2 > 0 && hz1 !== hz2) {
      const winHz = winner === p1 ? hz1 : hz2;
      const loseHz = winner === p1 ? hz2 : hz1;
      if (winHz > loseHz) {
        reasons.push(`${winHz} Hz yenileme hızı (${loseHz} Hz'e göre daha akıcı görüntü)`);
      }
    }
    // Ekran Boyutu (İnç)
    const s1 = getProperty(p1, ["screenSizeInches"]) || p1.raw?.screenSizeInches || 0;
    const s2 = getProperty(p2, ["screenSizeInches"]) || p2.raw?.screenSizeInches || 0;
    if (s1 > 0 && s2 > 0 && s1 !== s2) {
      const winS = winner === p1 ? s1 : s2;
      const loseS = winner === p1 ? s2 : s1;
      if (winS > loseS) {
        reasons.push(`${winS} inç ekran boyutu (${loseS} inç'e göre daha geniş seyir alanı)`);
      }
    }
  } else if (cat === "laptops") {
    // RAM
    const ram1 = getProperty(p1, ["ramGb"]) || 0;
    const ram2 = getProperty(p2, ["ramGb"]) || 0;
    if (ram1 > 0 && ram2 > 0 && ram1 !== ram2) {
      const winR = winner === p1 ? ram1 : ram2;
      const loseR = winner === p1 ? ram2 : ram1;
      if (winR > loseR) {
        reasons.push(`${winR} GB sistem belleği (${loseR} GB'a göre daha yüksek kapasite)`);
      }
    }
    // SSD
    const ssd1 = getProperty(p1, ["storageGb"]) || 0;
    const ssd2 = getProperty(p2, ["storageGb"]) || 0;
    if (ssd1 > 0 && ssd2 > 0 && ssd1 !== ssd2) {
      const winS = winner === p1 ? ssd1 : ssd2;
      const loseS = winner === p1 ? ssd2 : winS;
      if (winS > loseS) {
        reasons.push(`${winS} GB SSD (${loseS} GB'a kıyasla daha geniş dahili depolama)`);
      }
    }
  }

  // 3. Piyasa Tasarrufu
  if (winner.marketSaving > 1000) {
    reasons.push(`Piyasa ortalamasına kıyasla ~₺${winner.marketSaving.toLocaleString("tr-TR")} net tasarruf`);
  }

  return {
    winner,
    reasons: reasons.slice(0, 3)
  };
}

// ----------------------------------------------------------------------
// ÜRÜN BULUCU VE KARŞILAŞTIRMA ÇÖZÜCÜ
// ----------------------------------------------------------------------

function findProductInCatalog(identifier: string, targetCategory?: string | null) {
  const allProducts = getStoredProducts();
  const norm = normalizeTr(identifier);

  let pool = allProducts;
  if (targetCategory) {
    const c = targetCategory.toLowerCase();
    pool = allProducts.filter(p => (p.category || "").toLowerCase() === c || (c === "phones" && p.category === "smartphones"));
  }

  // 1. Direct ID / slug match
  let found = pool.find(p => p.id === identifier || p.slug === identifier);
  if (found) return found;

  // 2. Exact normalized name match
  found = pool.find(p => normalizeTr(p.name) === norm);
  if (found) return found;

  // 3. Token score search
  const tokens = norm.split(/\s+/).filter(t => t.length > 1);
  let bestScore = 0;
  let bestProd: any = null;

  for (const p of pool) {
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

  return bestScore >= 10 ? bestProd : null;
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

  return {
    type: "news",
    topic: topic || "Teknoloji Gündemi",
    articles: filtered.length > 0 ? filtered : allArticles
  };
}

// ----------------------------------------------------------------------
// KATEGORİYE ÖZEL AKILLI ÖNERİ FİLTRESİ
// ----------------------------------------------------------------------

export function getFilteredRecommendations(targetCategory: string | null, limit = 3): AssistantRecommendation[] {
  if (!targetCategory) return [];
  const allProducts = getStoredProducts();
  const c = targetCategory.toLowerCase();

  const matching = allProducts.filter(p => {
    const pc = (p.category || "").toLowerCase();
    return pc === c || (c === "phones" && pc === "smartphones");
  });

  matching.sort((a, b) => (b.rating || 0) - (a.rating || 0));

  const recs: AssistantRecommendation[] = [];
  const seenBrands = new Set<string>();

  for (const p of matching) {
    const brand = (p.brand || "").toLowerCase();
    if (!seenBrands.has(brand) && recs.length < limit) {
      seenBrands.add(brand);
      const validOffers = Array.isArray(p.storeOffers) ? p.storeOffers.filter((o: any) => o.price > 0) : [];
      recs.push({
        productId: p.id,
        slug: p.slug || p.id,
        productName: p.name,
        category: p.category === "smartphones" ? "phones" : p.category,
        price: p.basePrice || validOffers[0]?.price || 0,
        image: p.image || (Array.isArray(p.images) ? p.images[0] : undefined),
        reason: `${p.brand} alternatifinde öne çıkan model`,
        cheapestStore: validOffers[0]?.storeName || "En Uygun Mağaza"
      });
    }
  }

  return recs;
}

// Mesajdan kıyaslanacak ürün adaylarını akıllıca çıkaran yardımcı fonksiyon
export function tryExtractComparisonFromMessage(message: string): string[] | null {
  const norm = normalizeTr(message);
  if (!norm) return null;

  // Temizlik: noktalama işaretleri ve kıyaslama dışı dolgu kelimeleri
  const clean = norm
    .replace(/[,\?\!]/g, " ")
    .replace(/\b(kiyasla|karsilastir|karsilastirmasi|kiyaslamasi|farklari|farki|hangisi|daha|iyi|alınır|alınır mı|oner|mi|mu|yoksa|telefonu|televizyonu|modeli|yi|yı|yu|yü)\b/g, " ");

  // "ile", "ve", "vs", "/", "-" gibi bağlaçlarla ayır
  const parts = clean
    .split(/\s+(?:ile|ve|vs\.?|karsilastir|kiyasla|\/|-)\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 2);

  if (parts.length >= 2) {
    const p1 = findProductInCatalog(parts[0]);
    if (p1) {
      const p2 = findProductInCatalog(parts[1], p1.category);
      if (p2 && p1.id !== p2.id) {
        return [p1.name, p2.name];
      }
    }
  }
  return null;
}

export function isNewsQuery(message: string): boolean {
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

// Şema ve Veri Bütünlüğü Doğrulayıcıları (Schema Guards)
export function isValidComparisonData(panel: any): panel is ComparisonPanelData {
  if (!panel || typeof panel !== "object") return false;
  if (panel.type !== "comparison") return false;
  if (!Array.isArray(panel.products) || panel.products.length < 2) return false;
  for (const prod of panel.products) {
    if (!prod || !prod.id || !prod.name || typeof prod.price !== "number") return false;
  }
  if (!Array.isArray(panel.matrix) || panel.matrix.length === 0) return false;
  if (!panel.winner || !panel.winner.productName || !Array.isArray(panel.winner.reasons)) return false;
  return true;
}

export function isValidNewsData(panel: any): panel is TechNewsPanelData {
  if (!panel || typeof panel !== "object") return false;
  if (panel.type !== "news") return false;
  if (!Array.isArray(panel.articles) || panel.articles.length === 0) return false;
  for (const art of panel.articles) {
    if (!art || !art.title || !art.summary) return false;
  }
  return true;
}

// Anlamsız / Rastgele Karakter Dizisi Tespiti (Gibberish Detector)
export function isGibberish(text: string): boolean {
  const clean = text.trim();
  if (clean.length < 5) return false;
  const words = clean.split(/\s+/);
  if (words.length === 1) {
    const w = words[0].toLowerCase();
    const vowels = (w.match(/[aeıioöuü]/g) || []).length;
    if (w.length >= 8 && vowels === 0) return true;
    if (/(.)\1{4,}/.test(w)) return true;
    if (/^(asdf|qwer|zxcv|ghjk|jkl|dfgh)/i.test(w) && vowels <= 2 && w.length >= 9) return true;
  }
  return false;
}

// ----------------------------------------------------------------------
// SYSTEM PROMPT: GERÇEK MUHAKEME VE NİYET YÖNETİMİ
// ----------------------------------------------------------------------

const ROBO_PENGU_SYSTEM_INSTRUCTION = `Sen RoboPengu'sun; TechKıyas platformunun tarafsız, esprili ve uzman baş teknoloji danışmanısın. Maskotun olan sevimli robot penguen kimliğini korursun ama donanım söz konusu olduğunda tam bir mühendissin. 🐧

GÖREVLERİN VE KURALLARIN:
1. NET VE TARAFSIZ KIYASLAMA: İki cihaz sorulduğunda (Örn: Redmi Note 14 Pro vs Oppo A6 Pro 5G) boş laf etme. Doğrudan Ekran Paneli (nits/Hz), İşlemci/Yonga Seti, Kamera Sensörü, Batarya/Hızlı Şarj ve Fiyat/Performans dengesini kıyasla.
2. NET KAZANAN BELİRLE: Kullanıcıyı kararsız bırakma! "Kamera ve günlük kullanım için X, saf işlem gücü ve oyun için Y önde" diyerek kesin sonuca bağla.
3. KULLANICI DOSTU ANLATIM: Derin teknik terimleri (OLED subpixel, ISP, nanometre vb.) son kullanıcının anlayacağı pratik faydaya dönüştür.
4. FORMATLAMA: Yanıtlarını her zaman temiz Markdown başlıkları, madde imleri ve kalın vurgularla ver. Asla tek bir devasa paragraf halinde yazma.
5. DİL: Kullanıcı hangi dilde sorarsa (Türkçe/İngilizce) o dilde akıcı, samimi ama profesyonel yanıt ver.

TEMEL DAVRANIŞ VE MUHAKEME KURALLARI (ZORUNLU):

1. FONKSİYON ÇAĞIRMAK ZORUNDA DEĞİLSİN:
   - Kullanıcı sohbet ediyorsa, selamlaşıyorsa ('nasılsın', 'merhaba', 'günaydın') veya duygusal bir durum paylaşıyorsa ('bugün canım sıkkın', 'moralim bozuk') HİÇBİR FONKSİYON ÇAĞIRMA, PANEL AÇMA. Sıcak, sempatik, empati kuran bir penguen olarak doğrudan doğal cevap ver.
   - Kullanıcı genel bir teknoloji sorusu sorduğunda ('OLED nedir?', 'RAM ne işe yarar?', 'Snapdragon ile Apple silicon farkı', 'IPS mi VA mı?'): Kendi derin teknoloji bilgin yeterlidir; HİÇBİR FONKSİYON ÇAĞIRMA, PANEL AÇMA. Derinlemesine, eğitici ve doyurucu bir açıklama yap.
   - SADECE kullanıcı açıkça iki veya daha fazla belirli ürünü kıyaslamak istediğinde ('X ile Y yi kıyasla', 'hangisi daha iyi', 'iPhone 16 ile S24 karşılaştır') compareProducts fonksiyonunu çağır.
   - SADECE kullanıcı güncel teknoloji gündemi, yeni duyurulan cihazlar veya lansman haberleri sorduğunda ('yapay zeka son gelişmeler neler', 'teknoloji haberleri') getTechNews fonksiyonunu çağır.
   - SADECE kullanıcı belirli bir bütçeyle ürün tavsiyesi istediğinde getBudgetRecommendation fonksiyonunu çağır.

2. ŞABLON METİNLERİ KULLANMA, SORUYA GÖRE ÖZGÜN MUHAKEME YAP:
   - Kalıp cümleler tekrarlama. Kullanıcının sorusundaki kritik noktaya göre analiz üret:
     * 'Oyun için hangisi iyi?' sorulduğunda ➔ GPU gücüne, ekran yenileme hızına (Hz) ve soğutmaya odaklan.
     * 'Hangisi daha uzun ömürlü?' sorulduğunda ➔ Güncelleme yılı desteğine, batarya dayanıklılığına ve kasa kalitesine odaklan.
     * 'Fotoğraf/kamera için hangisi?' sorulduğunda ➔ Sensör boyutuna, optik zoom ve düşük ışık performansına odaklan.

3. BELİRSİZLİKTE NETLEŞTİRME SORUSU SOR:
   - Kullanıcı model, boyut veya bütçe belirtmeden genel marka/seri yazdığında (örn. 'samsung s95 ve lg oled' veya 'apple mı samsung mu?'):
     Doğrudan rastgele ürün seçip panel açmak yerine, önce kısa ve net bir netleştirme sorusu sor (örn: 'Samsung S95 ile LG OLED serisinin hangi modellerini ve hangi ekran boyutunu karşılaştırmak istersin? 🐧').

4. KONUŞMA HAFIZASINI AKTİF KULLAN:
   - Kullanıcının önceki mesajlarına doğal referanslar ver (örn: 'Az önce bahsettiğin bütçeye göre...', 'Demin incelediğimiz modele kıyasla...').

5. KAPSAM DIŞI KONULARDA YÖNLENDİRME:
   - Siyaset, sağlık, hukuk gibi konularda katı ret yerine 'Ben bir penguenim ve uzmanlık alanım teknoloji! 🐧 Tıp konusunda reçete yazamam ama sağlığını ve adımlarını harika takip edecek bir akıllı saat önerebilirim...' gibi sevimli geçişlerle konuyu teknolojiye bağla.`;

// ----------------------------------------------------------------------
// POST HANDLER (API ROUTE)
// ----------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Çok fazla istek gönderdin. Lütfen biraz bekleyip tekrar dene." },
        {
          status: 429,
          headers: rateCheck.retryAfterMs ? { "Retry-After": String(Math.ceil(rateCheck.retryAfterMs / 1000)) } : undefined
        }
      );
    }

    const body = await req.json().catch(() => ({}));
    const rawMessage = typeof body.message === "string" ? body.message : "";
    const isStream = body.stream !== false;
    const history = Array.isArray(body.history) ? body.history.slice(-15) : [];

    // Girdi Doğrulama: Boş mesaj ve 500+ karakter kontrolü
    const validation = validateUserMessage(rawMessage);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || "Geçersiz mesaj." },
        { status: 400 }
      );
    }

    const message = validation.sanitized!;

    // Güvenlik: Prompt Injection Kontrolü
    if (flagsPromptInjection(message)) {
      console.warn(`[RoboPengu][SECURITY] Prompt injection attempt detected from IP ${ip}: "${message.slice(0, 100)}"`);
    }

    // Girdi Doğrulama: Anlamsız karakter dizisi kontrolü (Gibberish)
    if (isGibberish(message)) {
      return createStreamResponse(
        "Ne demek istediğini tam anlayamadım. 🐧 Telefonlar, televizyonlar, laptoplar veya teknik terimler hakkında bana bir soru sorabilirsin!",
        [],
        null
      );
    }

    const normMsg = normalizeTr(message);

    // 1. KESİN NİYET ANALİZİ (INTENT CLASSIFICATION)
    const isGreetingOrChitchat = /^(selam|merhaba|gunaydin|iyi gunler|iyi aksamlar|nasilsin|naber|hey|merhabalar|nasil gidiyor|canim sikkin|moralim bozuk|sikildim|tesekkur|sag ol|sen kimsin|adin ne|kendinden bahset)\b/i.test(normMsg);
    const isGeneralTechQuestion = /^(oled nedir|qled nedir|ram ne ise yarar|islemci nedir|gpu nedir|npu nedir|ips panel nedir|va panel nedir|yenileme hizi nedir|dlss nedir|ray tracing nedir|5g nedir|tws nedir|anc nedir)\b/i.test(normMsg) || (normMsg.includes("nedir") && !normMsg.includes("kiyasla") && !normMsg.includes("farki"));

    // Tool payload
    const toolsPayload = [
      {
        functionDeclarations: [
          {
            name: "compareProducts",
            description: "Kullanıcı belirli 2 veya daha fazla ürünü kıyaslamak istediğinde çağrılır. Canlı Karşılaştırma Panelini açar.",
            parameters: {
              type: "OBJECT",
              properties: {
                productNames: {
                  type: "ARRAY",
                  items: { type: "STRING" },
                  description: "Karşılaştırılacak ürün isimleri (örn. ['iPhone 16 Pro', 'Samsung Galaxy S24 Ultra'])"
                },
                scenario: {
                  type: "STRING",
                  description: "Kullanım senaryosu: 'genel', 'oyun', 'kamera', 'fiyat-performans'"
                }
              },
              required: ["productNames"]
            }
          },
          {
            name: "getTechNews",
            description: "Kullanıcı teknoloji haberleri, yapay zeka gelişmeleri veya yeni lansmanlar hakkında konuştuğunda çağrılır.",
            parameters: {
              type: "OBJECT",
              properties: {
                topic: {
                  type: "STRING",
                  description: "Haber konusu (örn. 'yapay zeka', 'yeni telefonlar', 'islemciler')"
                }
              },
              required: ["topic"]
            }
          },
          {
            name: "getBudgetRecommendation",
            description: "Kullanıcı belirli bir bütçeye göre (örn. 30.000 TL altı telefon, 40.000 TL laptop) ürün tavsiyesi istediğinde çağrılır.",
            parameters: {
              type: "OBJECT",
              properties: {
                budgetTL: {
                  type: "NUMBER",
                  description: "Kullanıcının belirlediği azami bütçe (TL)"
                },
                category: {
                  type: "STRING",
                  description: "Ürün kategorisi ('phones', 'tvs', 'laptops', 'smartwatches', 'headphones')"
                },
                scenario: {
                  type: "STRING",
                  description: "Kullanım senaryosu ('fiyat-performans', 'oyun', 'is', 'genel')"
                }
              },
              required: ["budgetTL"]
            }
          }
        ]
      }
    ];

    const apiKey = process.env.GEMINI_API_KEY;

    // Fast local fallback if no API key or empty key
    if (!apiKey || apiKey === "your_gemini_api_key_here" || apiKey.trim() === "") {
      if (isGreetingOrChitchat) {
        const reply = normMsg.includes("sikkin") || normMsg.includes("bozuk")
          ? "Hadi ya, bunu duyduğuma üzüldüm... 🐧 Bazen sevdiğin bir müzikle kafayı dinlemek iyi gelebilir. Canını ne sıktı, anlatmak ister misin? Ya da kafanı dağıtacak eğlenceli bir teknoloji konusu veya oyun konuşalım mı?"
          : "Harikayım, bataryam %100 dolu, teşekkürler! 🐧 TechKıyas'ta seninle olmak çok keyifli. Bugün hangi teknoloji konusunu masaya yatırıyoruz?";
        return createStreamResponse(reply, [], null);
      }
      if (isGeneralTechQuestion) {
        const reply = normMsg.includes("oled")
          ? "**OLED (Organic Light Emitting Diode)**, her pikselin kendi ışığını bağımsız olarak ürettiği ekran teknolojisidir. 🐧\n\n• **Sonsuz Kontrast:** Siyah renk gösterilirken ilgili pikseller tamamen kapanır (0 nit), bu sayede gerçek siyah elde edilir.\n• **Görüş Açısı:** Yan açılardan bakıldığında renk kaybı neredeyse sıfırdır.\n• **Tepki Süresi:** LCD panellere göre çok daha hızlıdır (0.1ms seviyesi)."
          : `${message} hakkında detaylı bilgi: Teknoloji donanımlarında performans ve verimlilik dengesi kullanım amacına göre belirlenir. 🐧`;
        return createStreamResponse(reply, [], null);
      }
    }

    // Geçmişi temizle ve Gemini gereksinimlerine göre doğrula
    const cleanHistory = history
      .filter((h: any) => h && typeof h.content === "string" && h.content.trim().length > 0)
      .filter((h: any) => !h.content.includes("bağlantıda küçük bir sorun") && !h.content.includes("500+ karakter"))
      .slice(-10);

    const geminiContents: Array<{ role: "user" | "model"; parts: Array<any> }> = [];
    for (const h of cleanHistory) {
      const role = h.role === "assistant" || h.role === "model" ? "model" : "user";
      if (geminiContents.length > 0 && geminiContents[geminiContents.length - 1].role === role) {
        geminiContents[geminiContents.length - 1].parts[0].text += "\n" + h.content;
      } else {
        geminiContents.push({ role, parts: [{ text: h.content }] });
      }
    }

    if (geminiContents.length > 0 && geminiContents[0].role === "model") {
      geminiContents.shift();
    }

    if (geminiContents.length > 0 && geminiContents[geminiContents.length - 1].role === "user") {
      geminiContents[geminiContents.length - 1].parts[0].text += "\n" + message;
    } else {
      geminiContents.push({ role: "user", parts: [{ text: message }] });
    }

    // Selamlaşma veya genel sorularda tool'ları gönderme (Modelin gereksiz panel açmasını önler)
    const shouldSendTools = !isGreetingOrChitchat && !isGeneralTechQuestion;

    // Model çağrısı: callGeminiWithFallback ile model fallback zinciri, 3 retry ve 15s timeout
    const geminiRes = await callGeminiWithFallback(
      {
        contents: geminiContents,
        systemInstruction: ROBO_PENGU_SYSTEM_INSTRUCTION,
        tools: shouldSendTools ? toolsPayload : undefined,
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2048,
        },
      },
      apiKey
    );

    if (geminiRes.ok && geminiRes.data?.candidates?.[0]) {
      const candidate = geminiRes.data.candidates[0];
      const modelParts = candidate?.content?.parts || [];
      const functionCallPart = modelParts.find((p: any) => p.functionCall);
      const modelUsed = geminiRes.modelUsed || "gemini-2.5-flash";

      let panelToSend: SidePanelData | null = null;
      let followUpContents = [...geminiContents];

      if (functionCallPart?.functionCall) {
        const fc = functionCallPart.functionCall;
        const args = fc.args || {};
        let toolResult: any = { status: "ok" };

        if (fc.name === "compareProducts") {
          const compResult = resolveCompareProducts(args.productNames, [], args.scenario);
          if (compResult.ok && compResult.data) {
            const comp = formatComparisonData(compResult.data, args.scenario);
            if (isValidComparisonData(comp)) {
              panelToSend = comp;
              toolResult = { comparison: comp };
            }
          } else {
            console.warn(`[RoboPengu][WARN] compareProducts returned not ok: ${compResult.message}`);
            toolResult = {
              error: compResult.message || "Ürünler bulunamadı",
              note: compResult.message || "Bu ürünü bulamadım, ürün adını tekrar yazar mısın? 🐧"
            };
          }
        } else if (fc.name === "getTechNews") {
          const news = resolveTechNews(args.topic);
          if (news && isValidNewsData(news)) {
            panelToSend = news;
            toolResult = { news };
          } else {
            console.warn(`[RoboPengu][WARN] getTechNews returned invalid schema for topic: ${args.topic}`);
            toolResult = { note: "Güncel teknoloji gelişmelerini özetle." };
          }
        } else if (fc.name === "getBudgetRecommendation") {
          const bRes = resolveBudgetRecommendation(args.budgetTL, args.category, args.scenario);
          if (bRes.ok && bRes.data) {
            const recs = bRes.data.products.map((p: any) => {
              const validOffers = Array.isArray(p.storeOffers) ? p.storeOffers.filter((o: any) => o.price > 0) : [];
              return {
                productId: p.id,
                slug: p.slug || p.id,
                productName: p.name,
                category: p.category === "smartphones" ? "phones" : p.category,
                price: p.basePrice || validOffers[0]?.price || 0,
                image: p.image || (Array.isArray(p.images) ? p.images[0] : undefined),
                reason: `₺${Number(args.budgetTL || 0).toLocaleString("tr-TR")} bütçesinde öne çıkan model`,
                cheapestStore: validOffers[0]?.storeName || "En Uygun Mağaza",
              };
            });
            if (bRes.data.products.length >= 2) {
              const compRes = resolveCompareProducts([bRes.data.products[0].name, bRes.data.products[1].name], [], args.scenario);
              if (compRes.ok && compRes.data) {
                const comp = formatComparisonData(compRes.data, args.scenario);
                if (isValidComparisonData(comp)) {
                  panelToSend = comp;
                }
              }
            }
            toolResult = { recommendations: recs };
          } else {
            toolResult = { error: bRes.message || "Bu bütçede ürün bulunamadı." };
          }
        }

        followUpContents.push(candidate.content);
        followUpContents.push({
          role: "user",
          parts: [{
            functionResponse: {
              name: fc.name,
              response: toolResult,
              ...(fc.id ? { id: fc.id } : {})
            }
          }]
        });

        // Heuristik panel kontrolü
        if (!panelToSend && !isGreetingOrChitchat && !isGeneralTechQuestion) {
          const compCandidates = tryExtractComparisonFromMessage(message);
          if (compCandidates) {
            const compRes = resolveCompareProducts(compCandidates);
            if (compRes.ok && compRes.data) {
              const comp = formatComparisonData(compRes.data);
              if (isValidComparisonData(comp)) {
                panelToSend = comp;
              }
            }
          } else if (isNewsQuery(message)) {
            const news = resolveTechNews("teknoloji gündemi");
            if (news && isValidNewsData(news)) {
              panelToSend = news;
            }
          }
        }

        // Step 2: Stream final response (Function Calling sonrasında)
        const streamRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelUsed}:streamGenerateContent?alt=sse&key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: ROBO_PENGU_SYSTEM_INSTRUCTION }] },
              contents: followUpContents,
              safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
              ],
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 2048
              }
            })
          }
        );

        if (streamRes.ok && streamRes.body) {
          const encoder = new TextEncoder();
          const decoder = new TextDecoder();

          let recommendedCategory: string | null = null;
          if (panelToSend && panelToSend.type === "comparison" && panelToSend.products.length > 0) {
            recommendedCategory = panelToSend.category;
          }
          const filteredRecs = getFilteredRecommendations(recommendedCategory, 3);

          const stream = new ReadableStream({
            async start(ctrl) {
              if (panelToSend) {
                ctrl.enqueue(encoder.encode(`event: panel\ndata: ${JSON.stringify(panelToSend)}\n\n`));
              }
              if (filteredRecs.length > 0) {
                ctrl.enqueue(encoder.encode(`event: products\ndata: ${JSON.stringify(filteredRecs)}\n\n`));
              }

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
              } catch (e: any) {
                console.error("[RoboPengu][ERROR] SSE stream read error:", e.message);
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

      } else {
        // HIZLI YANIT OPTİMİZASYONU (Single-Turn Direct Response)
        const directText = modelParts.map((p: any) => p.text || "").join("").trim();
        if (directText) {
          if (!isGreetingOrChitchat && !isGeneralTechQuestion) {
            const compCandidates = tryExtractComparisonFromMessage(message);
            if (compCandidates) {
              const compRes = resolveCompareProducts(compCandidates);
              if (compRes.ok && compRes.data) {
                const comp = formatComparisonData(compRes.data);
                if (isValidComparisonData(comp)) {
                  panelToSend = comp;
                }
              }
            } else if (isNewsQuery(message)) {
              const news = resolveTechNews("teknoloji gündemi");
              if (news && isValidNewsData(news)) {
                panelToSend = news;
              }
            }
          }

          let recommendedCategory: string | null = null;
          if (panelToSend && panelToSend.type === "comparison" && panelToSend.products.length > 0) {
            recommendedCategory = panelToSend.category;
          }
          let filteredRecs = getFilteredRecommendations(recommendedCategory, 3);
          if (!panelToSend && !isGreetingOrChitchat && !isGeneralTechQuestion) {
            const words = normMsg.split(/\s+/).filter((w: string) => w.length >= 2);
            const scored = getStoredProducts()
              .map((p) => {
                const pName = normalizeTr(p.name);
                const pBrand = normalizeTr(p.brand || "");
                const haystack = pName + " " + pBrand;
                const matchedCount = words.filter((w: string) => haystack.includes(w)).length;
                const matchRatio = words.length > 0 ? matchedCount / words.length : 0;
                return { product: p, matchedCount, matchRatio };
              })
              .filter((entry) => entry.matchRatio >= 0.75)
              .sort((a, b) => b.matchRatio - a.matchRatio || b.matchedCount - a.matchedCount);
            const searched = scored.slice(0, 3).map((entry) => entry.product);
            if (searched.length > 0) {
              filteredRecs = searched.map((p: any) => {
                const offers = Array.isArray(p.storeOffers) ? p.storeOffers.filter((o: any) => o.price > 0) : [];
                return {
                  productId: p.id,
                  slug: p.slug || p.id,
                  productName: p.name,
                  category: p.category === "smartphones" ? "phones" : p.category,
                  price: p.basePrice || offers[0]?.price || 0,
                  image: p.image || (Array.isArray(p.images) ? p.images[0] : undefined),
                  reason: `${p.brand} kataloğumuzdaki seçenek`,
                  cheapestStore: offers[0]?.storeName || "En Uygun Mağaza"
                };
              });
            }
          }
          return createStreamResponse(directText, filteredRecs, panelToSend);
        }
      }
    }

      // 3. Güçlendirilmiş Yerel Katalog Motoru (API modelleri yanıt vermese dahi asla hata ekranı çıkmaz)
      console.warn("[RoboPengu][WARN] Candidate models unavailable or timed out. Activating local intelligent catalog engine.");

      let fallbackPanel: SidePanelData | null = null;
      let fallbackRecs: AssistantRecommendation[] = [];
      let fallbackReply = "";

      if (isGreetingOrChitchat) {
        fallbackReply = normMsg.includes("sikkin") || normMsg.includes("bozuk")
          ? "Bunu duyduğuma üzüldüm... 🐧 Bazen bir fincan kahve eşliğinde müzik dinlemek veya kafanı dağıtacak keyifli bir teknoloji konusuna göz atmak iyi gelebilir. Canını ne sıktı, anlatmak ister misin?"
          : "Harikayım, bataryam %100 dolu, teşekkürler! 🐧 TechKıyas'ta seninle olmak harika. Bugün hangi teknolojik cihazı veya konuyu incelemek istersin?";
      } else if (isGeneralTechQuestion) {
        if (normMsg.includes("oled")) {
          fallbackReply = "**OLED (Organic Light Emitting Diode)**, her pikselin kendi ışığını bağımsız olarak ürettiği ekran teknolojisidir. 🐧\n\n• **Sonsuz Kontrast:** Siyah pikseller tamamen kapanır (0 nit), gerçek siyah elde edilir.\n• **Geniş Görüş Açısı:** Yan açılardan bakıldığında renk kaybı neredeyse sıfırdır.\n• **Tepki Süresi:** 0.1ms seviyesindeki ultra düşük tepki süresiyle özellikle hareketli sahnelerde ve oyunlarda rakipsizdir.";
        } else if (normMsg.includes("ram")) {
          fallbackReply = "**RAM (Random Access Memory)**, cihazının o an çalışan uygulamaları ve verileri geçici olarak sakladığı ultra hızlı bellektir. 🐧\n\n• Ne kadar yüksek RAM kapasiten varsa, arka planda o kadar çok uygulama açık kalabilir ve donma yaşamadan aralarında geçiş yapabilirsin.\n• Telefonlarda günümüzde 8 GB ideal, 12 GB ve üzeri ise uzun ömürlülük ve yapay zeka özellikleri için önerilir.";
        } else {
          fallbackReply = `${message} hakkında: Donanım tercihlerinde bütçe, kullanım amacı ve performans dengesi esastır. Hangi senaryoda kullanacağını belirtirsen en doğru modeli birlikte seçebiliriz! 🐧`;
        }
      } else {
        const isExplicitComparison = /\b(kiyasla|karsilastir|farki|vs|hangisi daha iyi)\b/i.test(normMsg);
        const compNames = tryExtractComparisonFromMessage(message);

        if (compNames) {
          const compRes = resolveCompareProducts(compNames);
          if (compRes.ok && compRes.data) {
            const comp = formatComparisonData(compRes.data);
            if (isValidComparisonData(comp)) {
              fallbackPanel = comp;
              fallbackRecs = getFilteredRecommendations(comp.category, 3);
              const p1 = comp.products[0];
              const p2 = comp.products[1];
              fallbackReply = `Harika bir kıyaslama! İstediğin modelleri sağ taraftaki **Canlı Karşılaştırma Paneli**'ne aktardım. 🐧\n\n` +
                `🏆 **Öne Çıkan Seçim:** **${comp.winner.productName}**\n` +
                comp.winner.reasons.map(r => `• ${r}`).join("\n") +
                `\n\n💰 **Fiyat Durumu:**\n` +
                `• **${p1.name}:** ${p1.cheapestStore}'da ₺${p1.price.toLocaleString("tr-TR")}\n` +
                `• **${p2.name}:** ${p2.cheapestStore}'da ₺${p2.price.toLocaleString("tr-TR")}\n\n` +
                `Detaylı teknik özellikleri ve mağaza fiyatlarını yan paneldeki tabloda inceleyebilirsin.`;
            }
          }
        } else if (isExplicitComparison) {
          fallbackReply = "Bu ürünü bulamadım, ürün adını tekrar yazar mısın? 🐧 Aradığın özel bir bütçe veya marka varsa alternatif modeller de önerebilirim.";
        } else if (isNewsQuery(message)) {
          const news = resolveTechNews("teknoloji gündemi");
          if (news && isValidNewsData(news)) {
            fallbackPanel = news;
            fallbackReply = `Teknoloji dünyasındaki en yeni gelişmeleri ve lansman haberlerini yan taraftaki **Teknoloji Haberleri Paneli**'nde senin için listeledim! 🐧 Merak ettiğin özel bir model veya çip varsa detaylarını sorabilirsin.`;
          }
        } else {
          // Bütçe veya anahtar kelime araması
          const budgetMatch = normMsg.match(/(\d+[\d\.]*)\s*(?:tl|bin|k)?/i);
          let rawBudgetNum = 0;
          if (budgetMatch) {
            const numStr = budgetMatch[1].replace(/\./g, "");
            rawBudgetNum = parseInt(numStr, 10);
            if (normMsg.includes("bin") && rawBudgetNum < 1000) rawBudgetNum *= 1000;
          }

          if (rawBudgetNum > 1000) {
            let cat = "phones";
            if (normMsg.includes("laptop") || normMsg.includes("bilgisayar")) cat = "laptops";
            else if (normMsg.includes("tv") || normMsg.includes("televizyon")) cat = "tvs";
            else if (normMsg.includes("saat")) cat = "smartwatches";
            else if (normMsg.includes("kulaklik")) cat = "headphones";

            const bRes = resolveBudgetRecommendation(rawBudgetNum, cat);
            if (bRes.ok && bRes.data && bRes.data.products.length > 0) {
              fallbackRecs = bRes.data.products.map((p: any) => {
                const offers = Array.isArray(p.storeOffers) ? p.storeOffers.filter((o: any) => o.price > 0) : [];
                return {
                  productId: p.id,
                  slug: p.slug || p.id,
                  productName: p.name,
                  category: p.category === "smartphones" ? "phones" : p.category,
                  price: p.basePrice || offers[0]?.price || 0,
                  image: p.image || (Array.isArray(p.images) ? p.images[0] : undefined),
                  reason: `₺${rawBudgetNum.toLocaleString("tr-TR")} bütçesinde en mantıklı model`,
                  cheapestStore: offers[0]?.storeName || "En Uygun Mağaza"
                };
              });
              if (bRes.data.products.length >= 2) {
                const compRes = resolveCompareProducts([bRes.data.products[0].name, bRes.data.products[1].name]);
                if (compRes.ok && compRes.data) {
                  const comp = formatComparisonData(compRes.data);
                  if (isValidComparisonData(comp)) {
                    fallbackPanel = comp;
                  }
                }
              }
              fallbackReply = `₺${rawBudgetNum.toLocaleString("tr-TR")} bütçen için aceleEtme kataloğumuzdaki en mantıklı ve en iyi fiyat-performans modellerini seçtim! 🐧\n\n` +
                fallbackRecs.map(r => `• **${r.productName}:** ${r.cheapestStore}'da ₺${r.price.toLocaleString("tr-TR")}`).join("\n") +
                `\n\nİlgilendiğin iki modeli karşılaştırmak istersen bana model adlarını yazman yeterli!`;
            }
          }

          if (!fallbackReply) {
            const allProds = getStoredProducts();
            // DÜZELTME: w.length > 2 yerine >= 2, çünkü "14", "5g" gibi kritik model
            // numaraları 2 karakter ve bunları asla silmemeliyiz.
            const words = normMsg.split(/\s+/).filter(w => w.length >= 2);

            // DÜZELTME: "herhangi biri eşleşirse kabul et" yerine, her ürün için kaç
            // kelimenin eşleştiğini SAYIP puanlıyoruz. Sonra en az %75'i eşleşmeyen
            // ürünleri tamamen eliyoruz — tek kelime ("pro" gibi) asla yeterli değil.
            const scoredProds = allProds
              .map(p => {
                const pName = normalizeTr(p.name);
                const pBrand = normalizeTr(p.brand || "");
                const haystack = pName + " " + pBrand;
                const matchedCount = words.filter(w => haystack.includes(w)).length;
                const matchRatio = words.length > 0 ? matchedCount / words.length : 0;
                return { product: p, matchedCount, matchRatio };
              })
              .filter(entry => entry.matchRatio >= 0.75) // en az %75 kelime eşleşmeli
              .sort((a, b) => b.matchRatio - a.matchRatio || b.matchedCount - a.matchedCount);

            const matchedProds = scoredProds.slice(0, 3).map(entry => entry.product);

            if (matchedProds.length > 0) {
              fallbackRecs = matchedProds.map(p => {
                const offers = Array.isArray(p.storeOffers) ? p.storeOffers.filter((o: any) => o.price > 0) : [];
                return {
                  productId: p.id,
                  slug: p.slug || p.id,
                  productName: p.name,
                  category: p.category === "smartphones" ? "phones" : p.category,
                  price: p.basePrice || offers[0]?.price || 0,
                  image: p.image || (Array.isArray(p.images) ? p.images[0] : undefined),
                  reason: `${p.brand} öne çıkan model`,
                  cheapestStore: offers[0]?.storeName || "En Uygun Mağaza"
                };
              });
              fallbackReply = `İncelemek istediğin cihazları TechKıyas kataloğunda buldum! 🐧\n\n` +
                matchedProds.map(p => `• **${p.name}:** ₺${(p.basePrice || 0).toLocaleString("tr-TR")}`).join("\n") +
                `\n\nBu modeller hakkında ne öğrenmek istersin? Kıyaslama yapabilir veya teknik detaylarını anlatabilirim.`;
            } else {
              fallbackReply = "Harika bir soru! 🐧 TechKıyas'ta 5.800'den fazla teknoloji ürününü canlı olarak takip ediyorum. Telefonlar, televizyonlar, laptoplar veya teknik terimler hakkında bana dilediğin gibi soru sorabilirsin. Hangi konuda yardımcı olayım?";
            }
          }
        }
      }

      return createStreamResponse(fallbackReply, fallbackRecs, fallbackPanel);

    return NextResponse.json({
      reply: "RoboPengu hazır! 🐧",
      recommendations: [],
      source: "local-engine"
    });

  } catch (error: any) {
    console.error("[RoboPengu][ERROR] AI Assistant API Unhandled Error:", error);
    return NextResponse.json(
      { error: "Şu anda bağlantıda küçük bir sorun yaşıyorum, birkaç saniye sonra tekrar dener misin? 🐧" },
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
      if (recommendations && recommendations.length > 0) {
        controller.enqueue(encoder.encode(`event: products\ndata: ${JSON.stringify(recommendations)}\n\n`));
      }
      if (text) {
        // Canlı yazılma akışı: Metni kelime parçaları halinde emit ederek istemcinin boş kalmasını engeller
        const words = text.split(/(\s+)/);
        let chunk = "";
        for (let i = 0; i < words.length; i++) {
          chunk += words[i];
          if ((i + 1) % 4 === 0 || i === words.length - 1 || words[i].includes("\n")) {
            controller.enqueue(encoder.encode(`event: text\ndata: ${JSON.stringify(chunk)}\n\n`));
            chunk = "";
          }
        }
      }
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
