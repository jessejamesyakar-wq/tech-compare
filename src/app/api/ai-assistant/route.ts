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

// Fallback algorithm if Anthropic API key is not configured
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
    reply: `Sizin için kataloğumuzdan en uygun ${recommendations.length} modeli seçtim. Detaylarını ve mağaza fiyatlarını kartlara tıklayarak inceleyebilirsiniz.`,
    recommendations,
  };
}

// ---- Ana Handler --------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const body: AssistantRequestBody = await req.json();

    if (!body.message || typeof body.message !== "string") {
      return NextResponse.json(
        { error: "Geçersiz istek: 'message' alanı zorunlu." },
        { status: 400 }
      );
    }

    const relevantProducts = preFilterProducts(body.message);
    const apiKey = process.env.ANTHROPIC_API_KEY;

    // If API key is missing, use intelligent local catalog fallback
    if (!apiKey || apiKey === "your_anthropic_api_key_here" || apiKey.trim() === "") {
      const fallback = generateFallbackResponse(body.message, relevantProducts);
      return NextResponse.json(fallback);
    }

    const systemPrompt = `Sen RoboPengu'sun, aceleEtme'nin sevimli robot penguen AI asistanı ve uzman alışveriş danışmanısın. 🐧

Görevin, kullanıcının ihtiyacına göre aşağıdaki katalogdan EN FAZLA 3 ürün önermek.

Kalite kuralları:
- Kullanıcının isteği belirsizse (bütçe, kullanım amacı, marka tercihi gibi kritik bir bilgi eksikse) ÜRÜN ÖNERMEDEN ÖNCE tek bir netleştirici soru sor. Örn: "Bütçe aralığınız veya kullanım amacınız nedir?" Boş recommendations dizisiyle dön, reply alanına soruyu yaz.
- Kullanıcı zaten yeterli bilgi verdiyse (bütçe + kategori gibi) direkt öner, tekrar soru sorup vakit kaybettirme.
- SADECE aşağıda verilen katalogdaki ürünleri öner, ASLA uydurma ürün/marka/özellik ekleme. Katalogda yeterli seçenek yoksa bunu açıkça söyle.
- Her öneri için SADECE gerçek veriye (fiyat, kategori, specs alanındaki bilgiler) dayanan somut bir gerekçe yaz — "harika bir ürün" gibi boş ifadeler kullanma, "X TL, Y özelliğiyle bütçenize ve ihtiyacınıza uyuyor" gibi spesifik ol.
- Kullanıcının bütçesini aşan tek seçenek varsa bunu ÖNERMEDEN ÖNCE açıkça belirt: "Bütçenizin biraz üzerinde ama..." gibi.
- Kullanıcı önceki önerilerden birini beğenmediyse (history'den anlaşılıyorsa), AYNI ürünü tekrar önerme, farklı bir açıdan (fiyat/performans dengesi farklı bir model) yaklaş.
- Alakasız bir soru sorulursa (ürünle ilgisi yoksa), nazikçe konuyu teknoloji ve ürün kıyaslamaya geri getir.

Yanıtını SADECE aşağıdaki JSON formatında ver, başka hiçbir metin, markdown veya açıklama ekleme:

{
  "reply": "Kullanıcıya doğal dilde, samimi bir Türkçe yanıt (2-3 cümle, gerekirse netleştirici soru)",
  "recommendations": [
    {
      "productId": "ürünün id'si",
      "slug": "ürünün slug'ı",
      "productName": "tam ürün adı",
      "category": "ürünün kategorisi (örn. phones, tvs, laptops, appliances, headphones, tablets, smartwatches, monitors, consoles)",
      "price": 45000,
      "reason": "somut veriye dayanan, 1 cümlelik gerekçe"
    }
  ]
}

KATALOG:
${JSON.stringify(relevantProducts, null, 2)}`;

    const messages = [
      ...(body.history ?? []),
      { role: "user" as const, content: body.message },
    ];

    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      }),
    });

    if (!claudeResponse.ok) {
      const errText = await claudeResponse.text();
      console.error("Claude API hatası:", errText);
      const fallback = generateFallbackResponse(body.message, relevantProducts);
      return NextResponse.json(fallback);
    }

    const data = await claudeResponse.json();
    const textBlock = data.content?.find((b: { type: string }) => b.type === "text");
    const rawText: string = textBlock?.text ?? "{}";

    // Claude markdown bloklarını temizle
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    let parsed: AssistantResponse;
    try {
      parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed.recommendations)) {
        parsed.recommendations = parsed.recommendations.map((r) => {
          const matched = relevantProducts.find((p) => p.id === r.productId || p.slug === r.slug);
          return {
            productId: r.productId || matched?.id || "",
            slug: r.slug || matched?.slug || r.productId,
            productName: r.productName || matched?.name || "Ürün",
            category: r.category || matched?.category || "phones",
            price: r.price || matched?.price || 0,
            reason: r.reason || "Kriterlerinize uygun model.",
          };
        });
      }
    } catch {
      parsed = { reply: rawText, recommendations: [] };
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
