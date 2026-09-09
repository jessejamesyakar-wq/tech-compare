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

// Intelligent pre-filtering: narrows down 5,800+ products to top 20-25 candidates
export function preFilterProducts(userMessage: string, limit = 20): CatalogItem[] {
  const allProducts = getStoredProducts();
  const normMessage = normalizeTr(userMessage);

  // Extract budget mentions (e.g. 20000, 20.000, 50k, 15 bin)
  let targetBudget = 0;
  const numMatch = normMessage.match(/\b([0-9]{1,3}(?:\.[0-9]{3})+|[0-9]{4,6})\b/);
  if (numMatch) {
    targetBudget = parseInt(numMatch[1].replace(/\./g, ""), 10);
  } else {
    const binMatch = normMessage.match(/\b([0-9]{1,3})\s*bin\b/);
    if (binMatch) {
      targetBudget = parseInt(binMatch[1], 10) * 1000;
    }
  }

  // Detect category keywords
  const isPhone = /telefon|iphone|samsung|galaxy|xiaomi|redmi|poco|honor|oppo|vivo|realme/i.test(normMessage);
  const isTv = /tv|televizyon|oled|qled|uhd|ekran|4k|55 inc|65 inc/i.test(normMessage);
  const isLaptop = /laptop|bilgisayar|macbook|dizustu|gaming laptop|asus|lenovo|dell/i.test(normMessage);
  const isAppliance = /supurge|robot supurge|dyson|kahve|camasir|bulasik|buzdolabi|ev aleti/i.test(normMessage);
  const isHeadphone = /kulaklik|tws|airpods|buds|bluetooth kulaklik|kulakici|kulakustu/i.test(normMessage);
  const isWatch = /saat|akilli saat|watch|apple watch|galaxy watch/i.test(normMessage);
  const isTablet = /tablet|ipad|galaxy tab/i.test(normMessage);
  const isMonitor = /monitor|144hz|165hz|240hz|ips monitor/i.test(normMessage);
  const isConsole = /ps5|playstation|xbox|nintendo|konsol/i.test(normMessage);

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

    // Brand matching
    if (normBrand && normMessage.includes(normBrand)) score += 25;

    // Token matching in product name
    for (const tok of queryTokens) {
      if (normName.includes(tok)) score += 20;
      if (normBrand.includes(tok)) score += 10;
    }

    // Budget matching
    if (targetBudget > 0 && p.basePrice > 0) {
      if (p.basePrice <= targetBudget && p.basePrice >= targetBudget * 0.65) {
        score += 35; // Perfect budget fit
      } else if (p.basePrice <= targetBudget * 1.15) {
        score += 15; // Slightly above budget
      } else if (p.basePrice > targetBudget * 1.5) {
        score -= 20; // Too expensive
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
  return scored.slice(0, limit).map((s) => s.item);
}

// System Knowledge Base & Persona Prompt
function buildSystemInstruction(relevantProducts: CatalogItem[]): string {
  const catalogContext = relevantProducts.length > 0
    ? relevantProducts.map(p => `- [${p.brand}] ${p.name} | Kategori: ${p.category} | Fiyat: ₺${p.price.toLocaleString("tr-TR")} | ID: ${p.id} | Slug: ${p.slug}${p.specsSummary ? ' | Özellikler: ' + p.specsSummary : ''}`).join("\n")
    : "Katalogda bu sorguya özel ürün bulunamadı.";

  return `Sen RoboPengu'sun! 🐧 TechCompare (aceleEtme) platformunun samimi, bilgili ve tarafsız robot penguen AI danışmanısın.
Kullanıcılara doğrudan, sıcak, akıcı ve uzman bir Türkçe ile yanıt ver.

PLATFORM SİTE İÇİ BİLGİ TABANI (GENEL SORULAR İÇİN):
- Platform Amacı: Türkiye'nin en kapsamlı bağımsız teknoloji ürün ve fiyat karşılaştırma platformudur. Kullanıcıların en doğru cihazı en avantajlı fiyata bulmasını sağlar.
- Satış Modeli: Sitemiz doğrudan ürün satışı yapmaz! Hepsiburada, Trendyol, Amazon TR, Vatan Bilgisayar, MediaMarkt, Teknosa gibi Türkiye'nin en güvenilir mağazalarının güncel fiyat ve stoklarını anlık olarak listeler. Satın alma işlemi ilgili mağaza üzerinden güvenle gerçekleşir.
- Kargo ve Teslimat: Ürün satışı mağaza tarafından yapıldığı için teslimat süresi genellikle 1-3 iş günüdür. Kargo firması ve kargo bedeli (çoğu mağazada belirli sepet tutarı üzeri ücretsizdir) seçilen mağazanın kurallarına tabidir.
- Fiyat Takibi ve Grafikler: Her ürün detay sayfasında son 30, 60 ve 90 günlük geçmiş fiyat grafiği ve en düşük/en yüksek fiyatlar bulunur. Böylece ürünün gerçekten indirimde olup olmadığı net görülür.
- Fiyat Alarmı: Ürün sayfasındaki 'Fiyat Alarmı Kur' butonuna tıklayıp hedeflediğiniz fiyatı belirlediğinizde, fiyat o rakama düştüğünde anında e-posta bildirimi alırsınız.
- Karşılaştırma Masası (Kıyasla): Ürün kartlarındaki 'Kıyasla' butonuna tıklayarak telefon, laptop, TV ve ev aletlerini yan yana teknik özellik, kamera, pil, ekran ve fiyat avantajlarıyla detaylı kıyaslayabilirsiniz.
- Acele Etme Skoru: Ürünün donanım performansı, kullanıcı yorumları ve piyasa fiyat dengesini 100 üzerinden tarafsız olarak puanlayan akıllı skorumuzdur.

ÜRÜN VE TAVSİYE KURALLARI:
- Kullanıcı ürün tavsiyesi, bütçe veya model karşılaştırması sorduğunda, SADECE aşağıda verilen filtrelenmiş ürün listesinden EN UYGUN 2 VEYA 3 ÜRÜNÜ tavsiye et.
- Her ürün için somut, ikna edici ve anlaşılır 1 cümlelik gerekçe yaz.
- Uydurma marka veya model ekleme.
- Samimi bir ton kullan, penguen emojisi (🐧) ekle.

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
    const topRecs: AssistantRecommendation[] = relevantProducts.slice(0, 4).map(p => ({
      productId: p.id,
      slug: p.slug,
      productName: p.name,
      category: p.category,
      price: p.price,
      image: p.image,
      reason: `${p.brand} kalitesi ve ₺${p.price.toLocaleString("tr-TR")} güncel fiyatıyla öne çıkıyor.`
    }));

    const apiKey = process.env.GEMINI_API_KEY;

    // Fast fallback if no API key
    if (!apiKey || apiKey === "your_gemini_api_key_here" || apiKey.trim() === "") {
      const reply = `Merhaba! 🐧 "${message}" talebiniz için kataloğumuzdaki en avantajlı modelleri derledim:`;
      if (isStream) {
        return createStreamResponse(reply, topRecs);
      }
      return NextResponse.json({ reply, recommendations: topRecs, source: "local-engine" });
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
      const fallbackReply = `Talebiniz için en popüler ve avantajlı modelleri hazırladım: 🐧`;
      return createStreamResponse(fallbackReply, topRecs);
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

    return NextResponse.json({
      reply: "İhtiyacınıza uygun güncel modelleri sizin için seçtim: 🐧",
      recommendations: topRecs,
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
