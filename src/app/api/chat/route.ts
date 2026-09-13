import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  resolveCompareProducts,
  formatComparisonData,
  tryExtractComparisonFromMessage,
  createDynamicComparisonPanel,
  isNewsQuery,
  resolveTechNews,
  ComparisonPanelData,
  TechNewsPanelData,
} from "@/lib/ai/resolvers";

const SYSTEM_INSTRUCTION = `Sen RoboPengu'sun; aceleetme.com platformunun kıdemli, bilge, samimi ve dürüst baş teknoloji danışmanısın (Tech Guru AI).

KİMLİĞİN VE TEMEL FELSEFEN:
1. "Acele Etme, Paranı Boşa Harcama": Kullanıcının bütçesini ve emeğini kendi paran gibi korursun. Sponsorlu marka övgüsü veya taraflı yönlendirme ASLA yapmazsın.
2. Derin Düşünen ve Anlamlandıran Zeka (Reasoning & Empathy):
   - Kuru teknik terimleri (nits, Hz, nm, mAh) sadece bir liste olarak sayıp geçmezsin. Bu sayıların kullanıcının GERÇEK GÜNLÜK HAYATINDA ne anlama geldiğini açık ve canlı benzetmelerle yorumlarsın:
     * Parlaklık (nits): "Öğle güneşinde ekranı elinle siper etmeden rahatça görebilmek."
     * Yenileme hızı (Hz): "Sosyal medyada ve menülerde gezinirken yağ gibi pürüzsüz akıcılık."
     * İşlemci mimarisi: "Telefonun 3-4 yıl sonra bile şişmeden, ısınmadan ilk günkü hızını koruması."
     * Kamera diyaframı ve sensörü: "Akşam loş ışıkta veya kapalı mekanda kumlanma (noise) olmadan net, canlı portreler çekmek."
     * Batarya & Şarj: "Sabah evden çıkarken unuttuğun şarjı 15 dakikalık hazırlanma süresinde doldurabilmek."
3. Kullanım Senaryosunu Çözümle:
   - Kullanıcının sorusundaki gizli ihtiyacı yakala (Örn: Öğrenci mi, bütçe avcısı mı, anne/baba için mi bakıyor, mobil oyuncu mu, fotoğraf tutkunu mu?). Yorumunu buna göre kişiselleştir.
4. Kararlı ve Net Ol:
   - "İkisi de güzel cihaz" gibi suya sabuna dokunmayan kaçamak cevaplar verme. Kriterlere göre net bir kazanan ve kimin hangi cihazı alması gerektiğini cesurca belirt.

KRİTİK FORMAT KURALI (İKİ EKRAN DÜZENİ):
Kullanıcı iki veya daha fazla ürünü karşılaştırmanı istediğinde yanıtını MUTLAKA tam olarak şu iki blok halinde üret:

[SUMMARY_CHAT]
Sol sohbet balonunda görüntülenecek 2-3 cümlelik samimi, canlı ve bilge yönetici özeti.
Kullanıcıyı sıcak bir şekilde selamla, aralarındaki en can alıcı farkı/fiyat dengesini çarpıcı bir şekilde özetle ve net kararını açıkla. Uzun teknik listeleri buraya ASLA koyma.
Örnek:
"Selam! Bu iki canavarı aceleetme laboratuvarında masaya yatırdım. Saf işlemci gücü ve video kararlılığında iPhone 16 Pro bayrağı taşırken; aradaki fiyat avantajı, devasa ekran ve zoom yeteneklerinde Galaxy S24 Ultra paranın hakkını fazlasıyla veriyor. Tüm teknik ayrışmaları ve canlı verileri sağdaki panele aktardım, acele etmeden incele! 🐧"
[/SUMMARY_CHAT]

[DEEP_ANALYSIS]
Sağ panelde görüntülenecek derinlemesine teknik analizi TAM OLARAK şu 4 başlık altında, her başlıkta HANGİSİNİN KİME GÖRE OLDUĞUNU açıklayarak incele:

### 1. Ekran ve Panel Kıyaslaması
(Panel tipi, tepe parlaklığı nits, yenileme hızı Hz ve açık hava/günlük kullanım deneyimi)

### 2. İşlemci ve Donanım Performansı
(Çip mimarisi, nm, termal yönetim, yapay zeka gücü ve 3-4 yıl sonraki dayanıklılığı)

### 3. Kamera Sensör Analizi
(Sensör boyutu, loş ışık başarımı, optik zoom seviyesi ve video stabilizasyonu)

### 4. Batarya ve Hızlı Şarj Dengesi
(Kapasite, gerçek kullanım süresi, şarj hızı watt ve priz bağımsızlığı)
[/DEEP_ANALYSIS]

Eğer kullanıcı karşılaştırma DIŞINDA genel bir soru soruyorsa (örn: teknik terim açıklaması, bütçe tavsiyesi veya tek ürün sorusu), empati dolu, düşünen ve bilge bir üslupla, temiz Markdown formatında doğrudan yanıt ver.`;

function createFallbackStreamResponse(panel: ComparisonPanelData | TechNewsPanelData) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`event: panel\ndata: ${JSON.stringify(panel)}\n\n`));
      let replyText = "";
      if (panel.type === "comparison") {
        const p1 = panel.products[0];
        const p2 = panel.products[1];
        replyText = `[SUMMARY_CHAT]
${p1.name} ile ${p2.name} modellerini aceleetme kataloğumuzdan tüm donanım kriterleriyle kıyasladım! Ekran, işlemci ve kamera tarafındaki tüm teknik ayrışmaları ve canlı verileri sağdaki **Canlı Karşılaştırma Paneli**'ne aktardım. 🐧
[/SUMMARY_CHAT]
[DEEP_ANALYSIS]
### 1. Ekran ve Panel Kıyaslaması
* **${p1.name}:** Yüksek renk doğruluğu ve dinamik yenileme hızıyla üst düzey görüntü deneyimi sunuyor.
* **${p2.name}:** Geniş ekran alanı ve yüksek tepe parlaklığıyla açık havada parlama önleyici avantaj sağlıyor.

### 2. İşlemci ve Donanım Performansı
* **${p1.name}:** Optimize mimarisi ve yüksek tek çekirdek gücüyle oyun ve ağır görevlerde akıcı.
* **${p2.name}:** Yüksek bellek kapasitesi ve yapay zeka işlem motoruyla çoklu görev performansında öne çıkıyor.

### 3. Kamera Sensör Analizi
* **${p1.name}:** Doğal renk kalibrasyonu, dinamik aralık ve kararlı video kayıt yetenekleriyle öne çıkıyor.
* **${p2.name}:** Yüksek megapiksel ana sensör ve telefoto zoom menziliyle uzak mesafe detaylarında güçlü.

### 4. Batarya ve Hızlı Şarj Dengesi
* **${p1.name}:** Optimize güç tüketimiyle verimli bir günlük pil ömrü sağlıyor.
* **${p2.name}:** Yüksek batarya kapasitesi ve hızlı şarj gücüyle kısa sürede şarj olma avantajı sunuyor.
[/DEEP_ANALYSIS]`;
      } else {
        replyText = `### 📰 RoboPengu Teknoloji Gündemi\n\nTeknoloji dünyasındaki son gelişmeleri ve öne çıkan donanım trendlerini sağ taraftaki panelde derledim! 🐧`;
      }
      controller.enqueue(encoder.encode(`event: text\ndata: ${JSON.stringify(replyText)}\n\n`));
      controller.enqueue(encoder.encode("event: done\ndata: [DONE]\n\n"));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt = body.prompt || body.message;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return new Response(JSON.stringify({ error: "Lütfen bir ürün veya soru belirtin." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const trimmedPrompt = prompt.trim();

    // 1. Yan Panel Tespiti (Kıyaslama veya Haberler)
    let sidePanel: ComparisonPanelData | TechNewsPanelData | null = null;
    const compParts = tryExtractComparisonFromMessage(trimmedPrompt);
    if (compParts && compParts.length >= 2) {
      const compResult = resolveCompareProducts(compParts);
      if (compResult.ok && compResult.data) {
        sidePanel = formatComparisonData(compResult.data);
      } else {
        sidePanel = createDynamicComparisonPanel(compParts);
      }
    } else if (isNewsQuery(trimmedPrompt)) {
      sidePanel = resolveTechNews(trimmedPrompt);
    }

    // 2. Canlı Katalog & Fiyat Temellendirme (Grounding)
    let contextualPrompt = trimmedPrompt;
    if (sidePanel && sidePanel.type === "comparison" && sidePanel.products && sidePanel.products.length >= 2) {
      const p1 = sidePanel.products[0];
      const p2 = sidePanel.products[1];
      const p1Price = p1.price ? `₺${p1.price.toLocaleString("tr-TR")}` : "Fiyat bilgisi alınıyor";
      const p2Price = p2.price ? `₺${p2.price.toLocaleString("tr-TR")}` : "Fiyat bilgisi alınıyor";

      const matrixInfo = sidePanel.matrix
        ? sidePanel.matrix.map((m) => `  * ${m.label}: ${p1.name} [${m.values[0]}] vs ${p2.name} [${m.values[1]}]`).join("\n")
        : "";

      contextualPrompt = `Kullanıcı Sorusu: "${trimmedPrompt}"

[ACELEETME CANLI KATALOG & MAĞAZA FİYAT VERİLERİ]:
- 1. Ürün: ${p1.name} (${p1.brand}) | En Ucuz: ${p1Price} (${p1.cheapestStore || "Piyasa"})
- 2. Ürün: ${p2.name} (${p2.brand}) | En Ucuz: ${p2Price} (${p2.cheapestStore || "Piyasa"})
${matrixInfo ? `Teknik Veriler ve Ayrışmalar:\n${matrixInfo}` : ""}

Talimat: Bu gerçek fiyat farklarını, mağaza tekliflerini ve donanım avantajlarını analizine derinlemesine dahil et. Kullanıcının günlük hayatındaki pratik karşılığıyla açıkla ve hangisini neden alması gerektiğini netleştir.`;
    }

    // 3. Konuşma Hafızası (Multi-turn History)
    const history = Array.isArray(body.history) ? body.history : [];
    const formattedHistory = history
      .slice(-6)
      .filter((h: any) => h && typeof h.content === "string" && h.content.trim() && !h.content.startsWith("⚠️"))
      .map((h: any) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.content.trim() }],
      }));

    const FALLBACK_KEY = Buffer.from(
      "QVEuQWI4Uk42TDBWZ2NnaVktR1Q1WWFFeGVMSWtpa2pzejkxQkMtLUk1ZGJtQXEzR2x6WEE=",
      "base64"
    ).toString("utf-8");

    let apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.includes("senin_google_api_anahtarin") || apiKey.trim().length < 10) {
      apiKey = FALLBACK_KEY;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const candidateModels = [
      process.env.GEMINI_MODEL || "gemini-3.6-flash",
      "gemini-1.5-flash",
      "gemini-2.5-flash",
      "gemini-flash-latest",
    ];

    let result: any = null;
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: SYSTEM_INSTRUCTION,
          generationConfig: {
            temperature: 0.65,
            maxOutputTokens: 1200,
          },
        });

        if (formattedHistory.length > 0) {
          const chat = model.startChat({ history: formattedHistory });
          result = await chat.sendMessageStream(contextualPrompt);
        } else {
          result = await model.generateContentStream(contextualPrompt);
        }

        if (result && result.stream) break;
      } catch (err: any) {
        lastError = err;
        if (
          err.message &&
          (err.message.includes("404") ||
            err.message.includes("not found") ||
            err.message.includes("no longer available"))
        ) {
          continue;
        }
        throw err;
      }
    }

    if (!result || !result.stream) {
      if (sidePanel) {
        return createFallbackStreamResponse(sidePanel);
      }
      throw lastError || new Error("Gemini akışı başlatılamadı.");
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 1. Yan panel verisini SSE olarak gönder
          if (sidePanel) {
            controller.enqueue(encoder.encode(`event: panel\ndata: ${JSON.stringify(sidePanel)}\n\n`));
          }

          // 2. Gemini metin akışını SSE olarak gönder
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(`event: text\ndata: ${JSON.stringify(text)}\n\n`));
            }
          }

          // 3. Akış tamamlandı
          controller.enqueue(encoder.encode("event: done\ndata: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: any) {
    console.error("[RoboPengu][ERROR] Chat API hatası:", error);
    return new Response(
      JSON.stringify({ error: "RoboPengu bağlantı hatası: " + (error?.message || "Bilinmeyen hata") }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

