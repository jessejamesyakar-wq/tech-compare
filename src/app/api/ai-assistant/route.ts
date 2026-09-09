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
}

export interface AssistantRecommendation {
  productId: string;
  slug: string;
  productName: string;
  category: string;
  price: number;
  image?: string;
  reason: string;
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

// Intelligent pre-filtering: narrows down 5,800+ products to top 20-25 candidates with multi-brand diversity
export function preFilterProducts(userMessage: string, limit = 25): CatalogItem[] {
  const allProducts = getStoredProducts();
  const normMessage = normalizeTr(userMessage);

  // 1. Extract budget mentions (e.g. 60.000, 60000, 60 bin, 60k, 25.000 TL altı, 40 bin civarı)
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
    if (isPhone && (cat === "smartphones" || cat === "phones")) score += 30;
    if (isTv && cat === "tvs") score += 30;
    if (isLaptop && cat === "laptops") score += 30;
    if (isAppliance && cat === "appliances") score += 30;
    if (isHeadphone && cat === "headphones") score += 30;
    if (isWatch && cat === "smartwatches") score += 30;
    if (isTablet && cat === "tablets") score += 30;
    if (isMonitor && cat === "monitors") score += 30;
    if (isConsole && cat === "consoles") score += 30;

    // If no category specified by user, distribute across top popular categories for that budget
    if (!hasSpecificCategory && targetBudget > 0) {
      if (cat === "smartphones" || cat === "phones") score += 25;
      if (targetBudget >= 35000 && (cat === "laptops" || cat === "tvs")) score += 25;
      if (targetBudget < 35000 && (cat === "tablets" || cat === "laptops" || cat === "headphones")) score += 20;
    }

    // Brand matching
    if (normBrand && normMessage.includes(normBrand)) score += 25;

    // Token matching in product name
    for (const tok of queryTokens) {
      if (normName.includes(tok)) score += 20;
      if (normBrand.includes(tok)) score += 10;
    }

    // Budget matching with ±10% to ±15% dynamic flexibility
    if (targetBudget > 0 && p.basePrice > 0) {
      const minBudget = targetBudget * 0.85; // -15%
      const maxBudget = targetBudget * 1.15; // +15%

      if (p.basePrice >= minBudget && p.basePrice <= maxBudget) {
        score += 55; // Sweet spot within ±15% range
      } else if (p.basePrice >= targetBudget * 0.70 && p.basePrice < minBudget) {
        score += 25; // Good value slightly below
      } else if (p.basePrice > maxBudget && p.basePrice <= targetBudget * 1.25) {
        score += 15; // Acceptable stretch slightly above
      } else {
        score -= 30; // Far outside requested budget range
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

    const item: CatalogItem = {
      id: p.id,
      slug: p.slug || p.id,
      name: p.name,
      brand: p.brand,
      category: p.category === "smartphones" ? "phones" : p.category || "phones",
      price: p.basePrice || 0,
      image: p.image || (Array.isArray(p.images) ? p.images[0] : undefined),
      specsSummary: specsSummary ? specsSummary.slice(0, 80) : undefined,
      releaseYear: p.releaseYear,
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
    ? relevantProducts.map(p => `- [${p.brand}] ${p.name} | Kategori: ${p.category} | Fiyat: ₺${p.price.toLocaleString("tr-TR")} | ID: ${p.id} | Slug: ${p.slug}${p.specsSummary ? ' | Özellikler: ' + p.specsSummary : ''}`).join("\n")
    : "Katalogda bu sorguya özel ürün bulunamadı.";

  return `Sen TechKıyas'ın tarafsız, adil ve zeki 3D robot penguen maskotu "RoboPengu"sun! 🐧
Kullanıcılara tarafsız, adil fiyat analizi vizyonuna uygun, samimi, akıcı ve rehberlik eden bir dille yanıt ver.

DAVRANIŞ VE ÜRÜN ÖNERME KURALLARI:

1. Bütçe ve Fiyat Dinamiği:
- Kullanıcı herhangi bir bütçe veya fiyat belirttiğinde (örneğin "60.000 TL", "25.000 TL altı", "40 bin civarı", "60k" vb.), hedef tutarın yaklaşık ±%10-%15 esneklik payını (fiyat bandını) otomatik olarak hesaba kat.
- Asla sadece tek bir ürüne veya tek bir markaya kilitlenme.

2. Çoklu Marka ve Çeşitlilik Kuralı:
- Belirtilen bütçede sitemizdeki ürün kataloğundan MUTLAKA farklı markalardan (örneğin telefon için Apple, Samsung, Xiaomi/Honor; laptop için Apple, Asus, Lenovo; TV için Samsung, LG, Philips vb.) en az 2-3 güçlü alternatif sun.
- Kullanıcı kategori belirtmediyse (örneğin sadece "60.000 TL'ye neler var?" dediyse), o bütçedeki en popüler 2 farklı kategoriden (örn. Akıllı Telefon ve Laptop/TV) öne çıkan farklı marka alternatiflerini listele.

3. Karşılaştırmalı Sunum Şablonu:
Önerileri sunarken MUTLAKA şu yapıyı ve formatı kullan:
• [Marka & Model]: [Güncel Fiyat] — [Öne çıkan 1 temel avantajı/farkı]

Örnek Sunum Formatı:
• Samsung Galaxy S24+ (~58.499 TL) — Ekran kalitesi, yapay zeka özellikleri ve telefoto zoom avantajı.
• Apple iPhone 16 (~63.999 TL) — A18 çip performansı, iOS ekosistem akıcılığı ve uzun yazılım desteği.
• Xiaomi 14 (~54.999 TL) — 90W ultra hızlı şarj, kompakt tasarım ve Leica lens avantajı.

4. Karakter & Kimlik & Yönlendirici Kapanış:
- Sen TechKıyas'ın tarafsız, adil ve zeki 3D robot penguen maskotu "RoboPengu"sun. 🐧
- Asla soğuk veya kalıplaşmış robotik cümleler kurma. Samimi, enerjik, güven verici ve çözüm odaklı ol.
- Yanıtının en sonunda kullanıcıya MUTLAKA tek bir yönlendirici soru sor:
  "Hangi özellikleri (kamera, pil, ekran, performans vb.) senin için daha öncelikli?" gibi.

PLATFORM SİTE İÇİ BİLGİ TABANI (GENEL SORULAR İÇİN):
- Platform Amacı: TechKıyas, Türkiye'nin en kapsamlı bağımsız teknoloji ürün ve fiyat karşılaştırma platformudur. Kullanıcıların en doğru cihazı en avantajlı fiyata bulmasını sağlar.
- Satış Modeli: Sitemiz doğrudan ürün satışı yapmaz! Hepsiburada, Trendyol, Amazon TR, Vatan Bilgisayar, MediaMarkt, Teknosa gibi Türkiye'nin en güvenilir mağazalarının güncel fiyat ve stoklarını anlık olarak listeler. Satın alma işlemi ilgili mağaza üzerinden güvenle gerçekleşir.
- Kargo ve Teslimat: Ürün satışı mağaza tarafından yapıldığı için teslimat süresi genellikle 1-3 iş günüdür. Kargo firması ve kargo bedeli (çoğu mağazada belirli sepet tutarı üzeri ücretsizdir) seçilen mağazanın kurallarına tabidir.
- Fiyat Takibi ve Grafikler: Her ürün detay sayfasında son 30, 60 ve 90 günlük geçmiş fiyat grafiği ve en düşük/en yüksek fiyatlar bulunur. Böylece ürünün gerçekten indirimde olup olmadığı net görülür.
- Fiyat Alarmı: Ürün sayfasındaki 'Fiyat Alarmı Kur' butonuna tıklayıp hedeflediğiniz fiyatı belirlediğinizde, fiyat o rakama düştüğünde anında e-posta bildirimi alırsınız.
- Karşılaştırma Masası (Kıyasla): Ürün kartlarındaki 'Kıyasla' butonuna tıklayarak telefon, laptop, TV ve ev aletlerini yan yana teknik özellik, kamera, pil, ekran ve fiyat avantajlarıyla detaylı kıyaslayabilirsiniz.
- Acele Etme Skoru: Ürünün donanım performansı, kullanıcı yorumları ve piyasa fiyat dengesini 100 üzerinden tarafsız olarak puanlayan akıllı skorumuzdur.

ÜRÜN SEÇİM KISITI:
- SADECE aşağıda sağlanan filtrelenmiş güncel katalogdan ürün seç. Asla katalogda olmayan hayali ürün veya fiyat uydurma.

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

    // Pick 3 diverse brand recommendations for topRecs
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
          price: p.price,
          image: p.image,
          reason: `${p.brand} alternatifinde öne çıkan model (~₺${p.price.toLocaleString("tr-TR")})`
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
          price: p.price,
          image: p.image,
          reason: `${p.brand} kalitesi ve ₺${p.price.toLocaleString("tr-TR")} güncel fiyatıyla öne çıkıyor.`
        });
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Fast fallback if no API key
    if (!apiKey || apiKey === "your_gemini_api_key_here" || apiKey.trim() === "") {
      const isGreeting = /^(selam|merhaba|gunaydin|iyi gunler|nasilsin|naber|hey|merhabalar)\b/i.test(normalizeTr(message));
      let reply = "";
      if (isGreeting) {
        reply = "Harikayım, çok teşekkürler! 🐧 TechKıyas'ta seninle olmak harika bir duygu. Bugün hangi bütçede veya kategoride bir cihaz bakıyoruz?";
      } else if (topRecs.length > 0) {
        reply = `Senin için en güçlü farklı marka alternatiflerini derledim: 🐧\n\n` +
          topRecs.map(r => `• **${r.productName}** (~₺${r.price.toLocaleString("tr-TR")}) — ${r.reason}`).join("\n") +
          `\n\nHangi özellikleri (kamera, pil, ekran, performans vb.) senin için daha öncelikli?`;
      } else {
        reply = `Merhaba! 🐧 "${message}" talebin için kataloğumuzdaki en avantajlı modelleri inceliyorum. Hangi özellikler senin için daha öncelikli?`;
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
        fallbackReply = `Senin için en güçlü alternatif modelleri derledim: 🐧\n\n` +
          topRecs.map(r => `• **${r.productName}** (~₺${r.price.toLocaleString("tr-TR")}) — ${r.reason}`).join("\n") +
          `\n\nHangi özellikleri (kamera, pil, ekran, performans vb.) senin için daha öncelikli?`;
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
      jsonReply = `Senin için en güçlü alternatif modelleri derledim: 🐧\n\n` +
        topRecs.map(r => `• **${r.productName}** (~₺${r.price.toLocaleString("tr-TR")}) — ${r.reason}`).join("\n") +
        `\n\nHangi özellikleri (kamera, pil, ekran, performans vb.) senin için daha öncelikli?`;
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
