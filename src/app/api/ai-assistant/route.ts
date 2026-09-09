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

export interface AssistantResponse {
  reply: string;
  recommendations: AssistantRecommendation[];
  source?: "gemini-3.8" | "gemini-cascade" | "cache" | "local-engine";
}

// Turkish character normalization
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

// Intelligent pre-filtering: narrows down 5,800+ products to top 20-25 candidates with multi-brand diversity and store price matching
export function preFilterProducts(userMessage: string, limit = 25): CatalogItem[] {
  const allProducts = getStoredProducts();
  const normMessage = normalizeTr(userMessage);

  // 1. Extract budget mentions (e.g. "45.000 TL", "60 bin civarı", "en fazla 30.000 TL", "50k", "40000")
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

  // 2. Detect category keywords
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

    // Category affinity
    if (isPhone && (cat === "smartphones" || cat === "phones")) score += 35;
    if (isTv && cat === "tvs") score += 35;
    if (isLaptop && cat === "laptops") score += 35;
    if (isAppliance && cat === "appliances") score += 30;
    if (isHeadphone && cat === "headphones") score += 30;
    if (isWatch && cat === "smartwatches") score += 30;
    if (isTablet && cat === "tablets") score += 30;
    if (isMonitor && cat === "monitors") score += 30;
    if (isConsole && cat === "consoles") score += 30;

    // Kategori belirtilmediyse en popüler kategoriler (Telefon, Televizyon, Bilgisayar/Laptop)
    if (!hasSpecificCategory && targetBudget > 0) {
      if (cat === "smartphones" || cat === "phones") score += 30;
      if (cat === "laptops") score += 30;
      if (cat === "tvs") score += 30;
    }

    // Brand matching
    if (normBrand && normMessage.includes(normBrand)) score += 25;

    // Token matching in product name
    for (const tok of queryTokens) {
      if (normName.includes(tok)) score += 20;
      if (normBrand.includes(tok)) score += 10;
    }

    // 1. Kural: Fiyat ve Bütçe Algılama [Bütçe * 0.90] ile [Bütçe * 1.05] aralığı
    if (targetBudget > 0 && p.basePrice > 0) {
      const minBudget = targetBudget * 0.90; // Bütçe * 0.90
      const maxBudget = targetBudget * 1.05; // Bütçe * 1.05

      if (p.basePrice >= minBudget && p.basePrice <= maxBudget) {
        score += 70; // Tam hedef aralık [0.90 - 1.05]
      } else if (p.basePrice >= targetBudget * 0.80 && p.basePrice < minBudget) {
        score += 35; // Yakın alt alternatifler
      } else if (p.basePrice > maxBudget && p.basePrice <= targetBudget * 1.15) {
        score += 30; // Yakın üst alternatifler
      } else {
        score -= 40; // Bütçe aralığı dışında
      }
    }

    // Popularity and rating boost
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

    // 2. Kural: Arka plandaki mağaza fiyatlarını tara (En ucuz satıcı & alternatif satıcılar)
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

  // Multi-brand and multi-category diversity filter:
  // Cap items per brand to max 2 in the first pass to guarantee varied brands (Apple, Samsung, Xiaomi, etc.)
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

  // If we haven't reached limit, fill with highest remaining
  while (diverseList.length < limit && overflowList.length > 0) {
    diverseList.push(overflowList.shift()!);
  }

  return diverseList;
}

// System Knowledge Base & Persona Prompt
function buildSystemInstruction(relevantProducts: CatalogItem[]): string {
  const catalogContext = relevantProducts.length > 0
    ? relevantProducts.map(p => {
        let storeLine = `EN UCUZ: ₺${p.cheapestPrice.toLocaleString("tr-TR")} (Satıcı: ${p.cheapestStore})`;
        if (p.secondCheapestStore && p.secondCheapestPrice) {
          storeLine += ` | 2. En Ucuz: ${p.secondCheapestStore} (₺${p.secondCheapestPrice.toLocaleString("tr-TR")})`;
          if (p.priceDiffWithSecond && p.priceDiffWithSecond > 0) {
            storeLine += ` [${p.secondCheapestStore}'dan ₺${p.priceDiffWithSecond.toLocaleString("tr-TR")} daha ucuz!]`;
          }
        }
        if (p.marketSaving && p.marketSaving > 0) {
          storeLine += ` | Piyasa Tasarrufu: ~₺${p.marketSaving.toLocaleString("tr-TR")}`;
        }
        if (p.alternativeStoresFormatted) {
          storeLine += ` | Alternatif Satıcılar: ${p.alternativeStoresFormatted}`;
        }
        return `- [${p.brand}] ${p.name} | Kategori: ${p.category} | ${storeLine} | ID: ${p.id} | Slug: ${p.slug}${p.specsSummary ? ' | Donanım: ' + p.specsSummary : ''}`;
      }).join("\n")
    : "Katalogda bu sorguya özel ürün bulunamadı.";

  return `Sen TechKıyas'ın tarafsız, adil ve zeki 3D robot penguen maskotu "RoboPengu"sun! 🐧
Sitemiz bir "Fiyat Kıyaslama Platformu"dur ve temel ilkemiz "Adil Fiyat Kıyaslama"dır.

MİMARİ VE YANIT KURALLARI (ZORUNLU):

1. Fiyat ve Bütçe Algılama (Dinamik Aralık):
- Kullanıcı herhangi bir rakam/bütçe belirttiğinde (örneğin "45.000 TL", "60 bin civarı", "en fazla 30.000 TL", "50k" vb.), o rakamı temel al ve [Bütçe * 0.90] ile [Bütçe * 1.05] aralığındaki ürünleri öncelikle değerlendir.
- Kullanıcı kategori belirtmediyse en popüler kategorilerden (Telefon, Televizyon, Bilgisayar) çoklu marka seçeneği sun.

2. "En Ucuz Nerede?" Mantığı ve Çoklu Mağaza Karşılaştırması:
- Her önerilen model için arka plandaki mağaza fiyatlarını tara.
- Kullanıcıya öneri sunarken sadece ürün adını değil, MUTLAKA o ürünün şu an EN UCUZ hangi mağazada/pazaryerinde olduğunu ve en düşük fiyatını listele.
- Varsa ikinci en ucuz yerle arasındaki fiyat avantajını/farkını belirt (örn. "Trendyol'dan 1.250 TL daha uygun" veya "Piyasa ortalamasından 1.500 TL daha hesaplı").

3. Yanıt Şablonu (Kart Görünümü / Yapılandırılmış Çıktı):
Önerileri kullanıcıya sunarken her model için BİREBİR şu formatı uygula:

[Kategori İkonu: 📱 Telefon, 💻 Bilgisayar/Laptop, 📺 Televizyon, ⚡ Diğer] [Marka Model Adı]
• En Ucuz Fiyat: [X.XXX TL] — Satıcı: [Mağaza Adı] (Varsa 2. satıcıya veya piyasa ortalamasına göre fiyat farkını ekle: "Trendyol'a göre 1.450 TL daha uygun" veya "Piyasa ortalamasından 2.100 TL daha avantajlı")
• Alternatif Satıcı Fiyatları: [Diğer Mağaza: Y.YYY TL, Başka Mağaza: Z.ZZZ TL]
• Neden Bu Model?: [1 Cümlelik temel performans veya donanım artısı]

Örnek Şablon Uygulaması:
📱 Samsung Galaxy S24+ (256 GB)
• En Ucuz Fiyat: 58.499 TL — Satıcı: Hepsiburada (Trendyol'a göre 1.450 TL daha uygun)
• Alternatif Satıcı Fiyatları: Trendyol: 59.949 TL, MediaMarkt: 60.499 TL, Amazon TR: 60.999 TL
• Neden Bu Model?: Dynamic AMOLED 2X ekran kalitesi, Galaxy AI yapay zeka araçları ve 7 yıllık işletim sistemi güncelleme desteği.

💻 Apple MacBook Air M3 (16 GB / 512 GB)
• En Ucuz Fiyat: 56.999 TL — Satıcı: Amazon TR (Piyasa ortalamasından 2.300 TL daha hesaplı)
• Alternatif Satıcı Fiyatları: Hepsiburada: 58.999 TL, Teknosa: 59.499 TL
• Neden Bu Model?: 3nm M3 çipin yüksek güç verimliliği ve 18 saate varan kesintisiz pil ömrü.

4. Çeşitlilik İlkesi ve Yönlendirici Kapanış:
- Asla tek bir markayla sınırlı kalma. İlgili bütçe bandındaki en az 2-3 farklı markanın (Apple, Samsung, Xiaomi, Asus vb.) en güçlü rakiplerini yan yana kıyasla.
- Eğer kullanıcının bütçesine tam denk gelen model yoksa en yakın alt ve üst alternatifleri dürüstçe belirt.
- Yanıtın en sonunda kullanıcıya MUTLAKA tek bir yönlendirici soru sor:
  "Hangi özellikleri (kamera, pil, ekran, performans vb.) senin için daha öncelikli? 🐧"

PLATFORM SİTE İÇİ BİLGİ TABANI:
- Sitemiz doğrudan ürün satışı yapmaz; Hepsiburada, Trendyol, Amazon TR, Vatan Bilgisayar, MediaMarkt, Teknosa gibi güvenilir mağazaların güncel fiyatlarını anlık karşılaştırır.
- Her ürün detay sayfasında 30, 60 ve 90 günlük geçmiş fiyat grafiği ve fiyat alarmı bulunur.

ÖN-FİLTRELENMİŞ GÜNCEL KATALOG:
${catalogContext}`;
}

// In-memory cache for instant responses
const memoryCache = new Map<string, { reply: string; recommendations: AssistantRecommendation[]; expires: number }>();
const CACHE_TTL = 1000 * 60 * 15; // 15 mins

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = (body.message || "").trim();
    const isStream = body.stream !== false; // default to stream

    if (!message) {
      return NextResponse.json(
        { error: "Geçersiz istek: 'message' alanı zorunludur." },
        { status: 400 }
      );
    }

    const relevantProducts = preFilterProducts(message, 25);

    // Pick 3 diverse brand recommendations for topRecs with store info
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
          reason: `${p.brand} alternatifinde en avantajlı seçenek`,
          cheapestStore: p.cheapestStore,
          secondCheapestStore: p.secondCheapestStore,
          secondCheapestPrice: p.secondCheapestPrice,
          marketSaving: p.marketSaving,
          alternativeStores: p.alternativeStoresFormatted,
        });
      }
    }

    // Fill up to 3 if fewer distinct brands
    for (const p of relevantProducts) {
      if (topRecs.length >= 3) break;
      if (!topRecs.some(r => r.productId === p.id)) {
        topRecs.push({
          productId: p.id,
          slug: p.slug,
          productName: p.name,
          category: p.category,
          price: p.cheapestPrice,
          image: p.image,
          reason: `${p.brand} alternatifinde öne çıkan model`,
          cheapestStore: p.cheapestStore,
          secondCheapestStore: p.secondCheapestStore,
          secondCheapestPrice: p.secondCheapestPrice,
          marketSaving: p.marketSaving,
          alternativeStores: p.alternativeStoresFormatted,
        });
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Fast fallback if no API key
    if (!apiKey || apiKey === "your_gemini_api_key_here" || apiKey.trim() === "") {
      const isGreeting = /^(selam|merhaba|gunaydin|iyi gunler|nasilsin|naber|hey|merhabalar)\b/i.test(normalizeTr(message));
      let reply = "";
      if (isGreeting) {
        reply = "Harikayım, çok teşekkürler! 🐧 TechKıyas'ta seninle olmak çok keyifli. Bugün hangi bütçede veya kategoride en ucuz fiyatlı cihazı arıyoruz?";
      } else if (topRecs.length > 0) {
        reply = `Senin için en ucuz satıcıları ve alternatif modelleri derledim: 🐧\n\n` +
          topRecs.map(r => {
            const icon = r.category === "smartphones" || r.category === "phones" ? "📱" : r.category === "laptops" ? "💻" : r.category === "tvs" ? "📺" : "⚡";
            const diff = r.marketSaving && r.marketSaving > 0 ? ` (Piyasa ortalamasından ₺${r.marketSaving.toLocaleString("tr-TR")} daha hesaplı)` : "";
            const altText = r.alternativeStores ? `\n• Alternatif Satıcı Fiyatları: ${r.alternativeStores}` : "";
            return `${icon} **${r.productName}**\n• En Ucuz Fiyat: ₺${r.price.toLocaleString("tr-TR")} — Satıcı: **${r.cheapestStore || 'Hepsiburada'}**${diff}${altText}\n• Neden Bu Model?: ${r.reason}`;
          }).join("\n\n") +
          `\n\nHangi özellikleri (kamera, pil, ekran, performans vb.) senin için daha öncelikli? 🐧`;
      } else {
        reply = `Merhaba! 🐧 "${message}" talebin için güncel mağaza fiyatlarını tarıyorum. Hangi özellikler senin için daha öncelikli?`;
      }
      if (isStream) {
        return createStreamResponse(reply, isGreeting ? [] : topRecs);
      }
      return NextResponse.json({ reply, recommendations: isGreeting ? [] : topRecs, source: "local-engine" });
    }

    const systemInstruction = buildSystemInstruction(relevantProducts);
    const candidateModels = [
      "gemini-3.8-flash",
      "gemini-3.7-flash",
      "gemini-3.6-flash",
      "gemini-flash-latest"
    ];

    // STREAMING MODE (Default)
    if (isStream) {
      for (const model of candidateModels) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 4000);

          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              signal: controller.signal,
              body: JSON.stringify({
                systemInstruction: {
                  parts: [{ text: systemInstruction }]
                },
                contents: [
                  ...(body.history ? body.history.slice(-3).map((h: any) => ({
                    role: h.role === "assistant" ? "model" : "user",
                    parts: [{ text: h.content }]
                  })) : []),
                  { role: "user", parts: [{ text: message }] }
                ],
                generationConfig: {
                  temperature: 0.3,
                  maxOutputTokens: 1024
                }
              })
            }
          );
          clearTimeout(timeout);

          if (geminiRes.ok && geminiRes.body) {
            // Stream SSE chunks directly to client
            const encoder = new TextEncoder();
            const decoder = new TextDecoder();
            const stream = new ReadableStream({
              async start(controller) {
                // First event: send product recommendations immediately
                const recEvent = `event: products\ndata: ${JSON.stringify(topRecs)}\n\n`;
                controller.enqueue(encoder.encode(recEvent));

                const reader = geminiRes.body!.getReader();
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
                              const sseMsg = `event: text\ndata: ${JSON.stringify(text)}\n\n`;
                              controller.enqueue(encoder.encode(sseMsg));
                            }
                          } catch {}
                        }
                      }
                    }
                  }
                } catch (e) {
                  console.error("Stream reading error:", e);
                } finally {
                  controller.enqueue(encoder.encode("event: done\ndata: [DONE]\n\n"));
                  controller.close();
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
          console.warn(`Model ${model} stream failover: ${err.message}`);
        }
      }

      // If all streaming models failed, stream fallback
      const isGreeting = /^(selam|merhaba|gunaydin|iyi gunler|nasilsin|naber|hey|merhabalar)\b/i.test(normalizeTr(message));
      let fallbackReply = "";
      if (isGreeting) {
        fallbackReply = "Harikayım, teşekkürler! 🐧 TechKıyas'ta seninle olmak çok keyifli. Teknolojide neyi merak ediyorsun, nasıl yardımcı olabilirim?";
      } else if (topRecs.length > 0) {
        fallbackReply = `Senin için en ucuz satıcıları ve alternatif modelleri derledim: 🐧\n\n` +
          topRecs.map(r => {
            const icon = r.category === "smartphones" || r.category === "phones" ? "📱" : r.category === "laptops" ? "💻" : r.category === "tvs" ? "📺" : "⚡";
            const diff = r.marketSaving && r.marketSaving > 0 ? ` (Piyasa ortalamasından ₺${r.marketSaving.toLocaleString("tr-TR")} daha hesaplı)` : "";
            const altText = r.alternativeStores ? `\n• Alternatif Satıcı Fiyatları: ${r.alternativeStores}` : "";
            return `${icon} **${r.productName}**\n• En Ucuz Fiyat: ₺${r.price.toLocaleString("tr-TR")} — Satıcı: **${r.cheapestStore || 'Hepsiburada'}**${diff}${altText}\n• Neden Bu Model?: ${r.reason}`;
          }).join("\n\n") +
          `\n\nHangi özellikleri (kamera, pil, ekran, performans vb.) senin için daha öncelikli? 🐧`;
      } else {
        fallbackReply = `Talebiniz için kataloğumuzdaki en popüler ve avantajlı modelleri hazırladım: 🐧`;
      }
      return createStreamResponse(fallbackReply, isGreeting ? [] : topRecs);
    }

    // NON-STREAMING JSON MODE (For fallback/classic callers)
    for (const model of candidateModels) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemInstruction }] },
              contents: [{ role: "user", parts: [{ text: message }] }],
              generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
            })
          }
        );
        clearTimeout(timeout);

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          return NextResponse.json({
            reply,
            recommendations: topRecs,
            source: model.includes("3.8") ? "gemini-3.8" : "gemini-cascade"
          });
        }
      } catch (err: any) {
        console.warn(`Model ${model} JSON failover: ${err.message}`);
      }
    }

    const isGreeting = /^(selam|merhaba|gunaydin|iyi gunler|nasilsin|naber|hey|merhabalar)\b/i.test(normalizeTr(message));
    let jsonReply = "";
    if (isGreeting) {
      jsonReply = "Harikayım, çok teşekkür ederim! 🐧 Seninle burada olmak harika. Bugün nasıl bir teknoloji arıyoruz?";
    } else if (topRecs.length > 0) {
      jsonReply = `Senin için en ucuz satıcıları ve alternatif modelleri derledim: 🐧\n\n` +
        topRecs.map(r => {
          const icon = r.category === "smartphones" || r.category === "phones" ? "📱" : r.category === "laptops" ? "💻" : r.category === "tvs" ? "📺" : "⚡";
          const diff = r.marketSaving && r.marketSaving > 0 ? ` (Piyasa ortalamasından ₺${r.marketSaving.toLocaleString("tr-TR")} daha hesaplı)` : "";
          const altText = r.alternativeStores ? `\n• Alternatif Satıcı Fiyatları: ${r.alternativeStores}` : "";
          return `${icon} **${r.productName}**\n• En Ucuz Fiyat: ₺${r.price.toLocaleString("tr-TR")} — Satıcı: **${r.cheapestStore || 'Hepsiburada'}**${diff}${altText}\n• Neden Bu Model?: ${r.reason}`;
        }).join("\n\n") +
        `\n\nHangi özellikleri (kamera, pil, ekran, performans vb.) senin için daha öncelikli? 🐧`;
    } else {
      jsonReply = "İhtiyacınıza uygun güncel modelleri sizin için seçtim: 🐧";
    }

    return NextResponse.json({
      reply: jsonReply,
      recommendations: isGreeting ? [] : topRecs,
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

// Helper to stream a fixed text response
function createStreamResponse(text: string, recommendations: AssistantRecommendation[]) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Products
      controller.enqueue(encoder.encode(`event: products\ndata: ${JSON.stringify(recommendations)}\n\n`));
      // Text
      controller.enqueue(encoder.encode(`event: text\ndata: ${JSON.stringify(text)}\n\n`));
      // Done
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
