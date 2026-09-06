import { NextRequest, NextResponse } from "next/server";
import { getStoredProducts } from "@/lib/adminData";

// ---- Tipler ----------------------------------------------------------

interface CatalogItem {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  specsSummary?: string;
  highlights?: string[];
}

interface AssistantRequestBody {
  message: string;
  history?: { role: "user" | "assistant"; content: string }[];
}

interface AssistantRecommendation {
  productId: string;
  slug: string;
  productName: string;
  category: string;
  price: number;
  reason: string;
}

interface AssistantResponse {
  reply: string;
  recommendations: AssistantRecommendation[];
}

// ---- Yardımcı: Kataloğu Claude'a göndermek için filtreleme -----------

function preFilterProducts(userMessage: string, limit = 45): CatalogItem[] {
  const allProducts = getStoredProducts();
  const lower = userMessage.toLowerCase();

  // Extract potential budget numbers (e.g. 15000, 15.000, 50k, vb.)
  const numberMatch = lower.match(/\b([0-9]{1,3}(?:\.[0-9]{3})+|[0-9]{4,6})\b/);
  let targetBudget = 0;
  if (numberMatch) {
    targetBudget = parseInt(numberMatch[1].replace(/\./g, ""), 10);
  }

  const scored = allProducts.map((p) => {
    let score = 0;
    const cat = p.category ? p.category.toLowerCase() : "";
    const brand = p.brand ? p.brand.toLowerCase() : "";
    const name = p.name ? p.name.toLowerCase() : "";

    // Category matches
    if (lower.includes("telefon") && cat === "smartphones") score += 6;
    if ((lower.includes("tv") || lower.includes("televizyon")) && cat === "tvs") score += 6;
    if ((lower.includes("laptop") || lower.includes("bilgisayar")) && cat === "laptops") score += 6;
    if ((lower.includes("kulaklık") || lower.includes("ses")) && cat === "headphones") score += 6;
    if (lower.includes("saat") && cat === "smartwatches") score += 6;
    if (lower.includes("tablet") && cat === "tablets") score += 6;
    if ((lower.includes("süpürge") || lower.includes("kahve") || lower.includes("ev")) && cat === "appliances") score += 6;
    if (lower.includes("monitör") && cat === "monitors") score += 6;

    // Brand matches
    if (brand && lower.includes(brand)) score += 5;

    // Word matches in product name
    if (name.split(" ").some((w) => w.length > 2 && lower.includes(w))) score += 3;

    // Feature keywords
    if (lower.includes("kamera") && (name.includes("pro") || name.includes("ultra"))) score += 3;
    if (lower.includes("oyun") || lower.includes("gaming")) {
      if (name.includes("gaming") || name.includes("oled") || name.includes("rtx")) score += 3;
    }

    // Budget affinity
    if (targetBudget > 0 && p.basePrice > 0) {
      if (p.basePrice <= targetBudget && p.basePrice >= targetBudget * 0.6) {
        score += 5;
      } else if (p.basePrice <= targetBudget * 1.15) {
        score += 2;
      }
    }

    if (p.isPopular || p.isFeatured) score += 1;

    let specsSummary = "";
    if (p.specs) {
      const s = p.specs as Record<string, any>;
      if (s.processor?.chipset) specsSummary += `${s.processor.chipset}, `;
      if (s.memory?.ram) specsSummary += `${s.memory.ram}, `;
      if (s.memory?.storage) specsSummary += `${s.memory.storage}, `;
      if (s.camera?.main) specsSummary += `Kamera: ${s.camera.main}, `;
      if (s.screenSizeInches) specsSummary += `${s.screenSizeInches}" Ekran, `;
      if (s.gpu) specsSummary += `${s.gpu}, `;
    }

    const item: CatalogItem = {
      id: p.id,
      slug: p.slug || p.id,
      name: p.name,
      brand: p.brand,
      category: p.category === "smartphones" ? "phones" : p.category || "phones",
      price: p.basePrice || 0,
      specsSummary: specsSummary || undefined,
      highlights: p.highlights?.slice(0, 3) || undefined,
    };

    return { item, score };
  });

  const sorted = scored.sort((a, b) => b.score - a.score);
  return sorted.slice(0, limit).map((s) => s.item);
}

// Fallback algorithm if Gemini API key is not configured or fails
function generateFallbackResponse(userMessage: string, candidates: CatalogItem[]): AssistantResponse {
  const lower = userMessage.toLowerCase();

  // If query is too vague, ask clarifying question
  const isVague =
    !lower.includes("telefon") &&
    !lower.includes("tv") &&
    !lower.includes("laptop") &&
    !lower.includes("saat") &&
    !lower.includes("kulaklık") &&
    !lower.includes("tablet") &&
    !lower.includes("süpürge") &&
    !lower.includes("monitör") &&
    !lower.match(/[0-9]{4,6}/);

  if (isVague && candidates.length === 0) {
    return {
      reply: "Size en doğru ürünü önerebilmem için aradığınız ürün kategorisini (telefon, laptop, TV vb.) veya yaklaşık bütçenizi belirtebilir misiniz?",
      recommendations: [],
    };
  }

  const topItems = candidates.slice(0, 3);
  if (topItems.length === 0) {
    return {
      reply: "Aradığınız kriterlere uygun ürünleri inceliyorum. Lütfen bütçenizi veya istediğiniz özellikleri biraz daha detaylandırarak tekrar yazınız.",
      recommendations: [],
    };
  }

  const recommendations: AssistantRecommendation[] = topItems.map((item) => ({
    productId: item.id,
    slug: item.slug,
    productName: item.name,
    category: item.category,
    price: item.price,
    reason: `${item.brand} ekosisteminde ₺${item.price.toLocaleString("tr-TR")} güncel fiyatı ve donanım dengesiyle öne çıkıyor.`,
  }));

  return {
    reply: `Sizin için güncel piyasa kataloğumuzdan en uygun ${recommendations.length} modeli seçtim. Detaylarını ve mağaza fiyatlarını inceleyebilirsiniz.`,
    recommendations,
  };
}

// ---- Ana Handler --------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    let body: AssistantRequestBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Geçersiz istek: JSON gövdesi okunamadı." },
        { status: 400 }
      );
    }

    if (!body.message || typeof body.message !== "string") {
      return NextResponse.json(
        { error: "Geçersiz istek: 'message' alanı zorunlu." },
        { status: 400 }
      );
    }

    const relevantProducts = preFilterProducts(body.message);
    const apiKey = process.env.GEMINI_API_KEY;

    // If API key is missing, use intelligent local catalog fallback
    if (!apiKey || apiKey === "your_gemini_api_key_here" || apiKey.trim() === "") {
      const fallback = generateFallbackResponse(body.message, relevantProducts);
      return NextResponse.json(fallback);
    }

    const systemPrompt = `Sen RoboPengu'sun, aceleEtme'nin sevimli robot penguen AI asistanı ve uzman teknoloji & fiyat danışmanısın. 🐧
Google Gemini 3 destekli akıllı arama ve tavsiye motoru olarak çalışıyorsun.

Görevin, kullanıcının ihtiyacına göre aşağıdaki katalogdan EN FAZLA 3 ürün önermek.

Kalite kuralları:
- Kullanıcı bütçe veya detay belirtmemiş olsa dahi, aradığı amaca/kategoriye en uygun, kataloğumuzdaki EN İYİ 3 ÜRÜNÜ MUTLAKA ÖNER (Fiyat/Performans, Orta ve Üst segment dengesi kurarak).
- SADECE aşağıda verilen katalogdaki ürünleri öner, ASLA uydurma ürün/marka/özellik ekleme.
- Her öneri için SADECE gerçek veriye dayanan somut bir gerekçe yaz — "harika bir ürün" yerine "₺X fiyatı, Y özelliğiyle bütçenize ve ihtiyacınıza tam uyuyor" gibi spesifik ol.
- Kullanıcı bütçesini aşan bir seçenek varsa bunu açıkça belirt: "Bütçenizin biraz üzerinde ama..." gibi.
- Alakasız bir soru sorulursa, nazikçe konuyu teknoloji ve fiyat kıyaslamaya geri getir.

Yanıtını SADECE aşağıdaki JSON formatında ver:
{
  "reply": "Kullanıcıya samimi, uzman ve Türkçe açıklama (2-3 cümle)",
  "recommendations": [
    {
      "productId": "ürünün katalogdaki id'si",
      "slug": "ürünün katalogdaki slug'ı",
      "productName": "tam ürün adı",
      "category": "ürünün kategorisi (phones, tvs, laptops, appliances, headphones, tablets, smartwatches, monitors, consoles)",
      "price": 45000,
      "reason": "somut veriye dayanan 1 cümlelik tavsiye gerekçesi"
    }
  ]
}

GÜNCEL KATALOG:
${JSON.stringify(relevantProducts, null, 2)}`;

    // Format conversation history for Gemini
    const contents: any[] = [];

    if (body.history && body.history.length > 0) {
      for (const h of body.history) {
        contents.push({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }],
        });
      }
    }

    contents.push({
      role: "user",
      parts: [
        {
          text: `Sistem Yönergesi:\n${systemPrompt}\n\nKullanıcı Mesajı: "${body.message}"`,
        },
      ],
    });

    const candidateModels = ["gemini-3.8-flash", "gemini-3.6-flash"];
    let rawText: string | null = null;

    for (const model of candidateModels) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
              contents,
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.2,
                maxOutputTokens: 2048,
              },
            }),
          }
        );
        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
          if (rawText) break; // Successfully got response
        } else {
          const errText = await response.text();
          console.warn(`Gemini (${model}) API hatası [${response.status}]:`, errText.slice(0, 150));
        }
      } catch (err) {
        console.warn(`Gemini (${model}) bağlantı hatası:`, err);
      }
    }

    if (!rawText) {
      // Fallback to local intelligent ranking if all Gemini models were busy/failed
      const fallback = generateFallbackResponse(body.message, relevantProducts);
      return NextResponse.json(fallback);
    }

    // Clean markdown wrappers if any
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    let parsed: AssistantResponse;
    try {
      parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed.recommendations)) {
        parsed.recommendations = parsed.recommendations.map((r) => {
          const matched = relevantProducts.find((p) => p.id === r.productId || p.slug === r.slug || p.name.toLowerCase() === (r.productName || "").toLowerCase());
          return {
            productId: matched?.id || r.productId || "",
            slug: matched?.slug || r.slug || r.productId,
            productName: matched?.name || r.productName || "Ürün",
            category: matched?.category || r.category || "phones",
            price: matched?.price || r.price || 0,
            reason: r.reason || "Kriterlerinize uygun güncel model.",
          };
        });
      } else {
        parsed.recommendations = [];
      }
    } catch {
      // If parsing fails due to truncation, attempt to extract valid JSON or fallback
      try {
        const lastBrace = cleaned.lastIndexOf("}");
        if (lastBrace > 0) {
          parsed = JSON.parse(cleaned.slice(0, lastBrace + 1));
          if (!Array.isArray(parsed.recommendations)) parsed.recommendations = [];
        } else {
          parsed = { reply: cleaned, recommendations: [] };
        }
      } catch {
        parsed = { reply: cleaned, recommendations: [] };
      }
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("AI asistan endpoint hatası:", err);
    return NextResponse.json(
      { error: "Beklenmeyen bir hata oluştu." },
      { status: 500 }
    );
  }
}
