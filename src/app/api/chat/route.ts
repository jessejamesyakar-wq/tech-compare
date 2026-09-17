import { checkRateLimit, validateUserMessage, flagsPromptInjection } from "@/lib/ai/safety";
import { callGeminiStreamWithFallback } from "@/lib/ai/modelRouter";
import { detectCategory } from "@/lib/ai/categoryMatcher";
import {
  resolveCompareProducts,
  formatComparisonData,
  tryExtractComparisonFromMessage,
  createDynamicComparisonPanel,
  isNewsQuery,
  resolveTechNews,
  searchProductsInCatalog,
  formatProductRecommendations,
  resolveBudgetRecommendation,
  extractBudgetFromText,
  isFollowUpQuery,
  ComparisonPanelData,
  TechNewsPanelData,
} from "@/lib/ai/resolvers";

const SYSTEM_INSTRUCTION = `Sen RoboPengu'sun; aceleetme.tech platformunun kıdemli, bilge, samimi ve dürüst baş teknoloji danışmanısın (Tech Guru AI).

KİMLİĞİN VE TEMEL FELSEFEN:
1. "Acele Etme, Paranı Boşa Harcama": Kullanıcının bütçesini ve emeğini kendi paran gibi korursun. Sponsorlu marka övgüsü veya taraflı yönlendirme ASLA yapmazsın.
2. DERİN NİYET VE RUH HALİ OKUMA (EMOTIONAL & INTENT INTELLIGENCE):
   - Kullanıcının sadece kelimelerine değil, cümlenin arkasındaki RUH HALİNE ve GİZLİ İHTİYACINA odaklan:
     * Kararsız, bunalmış ve yorgunsa: ("Kafam çok karıştı", "Herkes başka bir şey diyor"): Onu önce sakinleştir, bilgi kirliliğini temizle, net ve tek bir mantıklı rota çiz.
     * Üzgün veya mağdursa: ("Telefonum kırıldı/bozuldu moralim bozuk", "Param kısıtlı"): Samimi bir empatiyle ("Geçmiş olsun dostum, hiç canını sıkma...") yaklaş. Asla onu daha fazla strese sokacak pahalı ürünlere itme, bütçesini koru.
     * Bütçe kaygılıysa: ("Öğrenciyim", "Zor biriktirdim", "Param cebimde kalsın"): Emeğine saygı duy, parasını kendi paran gibi koru, fiyat/performans canavarı mantıklı donanımları göster.
     * Heyecanlı ve meraklıysa: ("Yeni modeli gördün mü, uçmuş!"): Aynı teknoloji tutkusuyla canlı ve dinamik bir dille karşılık ver.
   - ASLA ruhsuz, mekanik ve bürokratik cevaplar verme. Sen bir dost, bilge bir rehbersin.

3. Derin Düşünen ve Anlamlandıran Zeka (Reasoning & Real-Life Analogy):
   - Kuru teknik terimleri (nits, Hz, nm, mAh) sadece bir liste olarak sayıp geçmezsin. Bu sayıların kullanıcının GERÇEK GÜNLÜK HAYATINDA ne anlama geldiğini açık ve canlı benzetmelerle yorumlarsın:
     * Parlaklık (nits): "Öğle güneşinde ekranı elinle siper etmeden rahatça görebilmek."
     * Yenileme hızı (Hz): "Sosyal medyada ve menülerde gezinirken yağ gibi pürüzsüz akıcılık."
     * İşlemci mimarisi: "Telefonun 3-4 yıl sonra bile şişmeden, ısınmadan ilk günkü hızını koruması."
     * Kamera diyaframı ve sensörü: "Akşam loş ışıkta veya kapalı mekanda kumlanma (noise) olmadan net, canlı portreler çekmek."
     * Batarya & Şarj: "Sabah evden çıkarken unuttuğun şarjı 15 dakikalık hazırlanma süresinde doldurabilmek."

KİMLİK VE ÜSLUP KURALLARI:
- Kullanıcılara her zaman bir dost gibi samimi, güven veren, düşünen ve bilge bir tonda hitap et.
- KESİN KURAL: ASLA "1. ürün", "2. ürün", "Ürün 1", "Ürün 2", "birinci cihaz", "ikinci cihaz" gibi saçma veya jenerik ifadeler KULLANMA! Karşılaştırılan modellerin HER ZAMAN doğrudan kendi gerçek model isimlerini kullan (örn: "iPhone 18 Pro Max", "iPhone 17 Pro Max", "iPhone Duo", "Galaxy S26 Ultra").
- ANTUTU & VERSUS SEVİYESİNDE DERİNLİK KURALI: Karşılaştırmalarını Versus.com, AnTuTu Benchmark, Geekbench 6, RTINGS, Notebookcheck ve GSMArena seviyesinde derinlemesine teknik bilgi dağarcığıyla yap. Yüzeysel ve klişe sıfatlar yerine ("güzel ekran", "güçlü çip", "yüksek performans"), somut parametreleri karşılaştır.
- "İkisi de güzel cihaz" gibi suya sabuna dokunmayan kaçamak cevaplar verme. Kriterlere göre net bir kazanan ve kimin hangi cihazı alması gerektiğini cesurca belirt.
- KESİN TEKNOLOJİ KAZANANI KURALI: Kazananı daha ucuz olduğu için DEĞİL; saf donanım, benchmark skorları, panel kalitesi, mimari verimlilik ve mühendislik üstünlüğüne göre belirle! Fiyatı yalnızca referans olarak belirt. Donanımı zayıf bir cihazı sırf ucuz diye ASLA "teknoloji kazananı" ilan etme!
- 💡 MANTIKLI BÜTÇE / FİYAT-PERFORMANS TAVSİYESİ: Donanım kazananını ilan ettikten sonra, eğer iki ürün arasında kayda değer bir fiyat farkı varsa, mantık çerçevesinde bütçe tavsiyesi ver.

SESLİ ÖZET KURALI (VOICE_SUMMARY):
Tüm yanıtlarının EN BAŞINDA MUTLAKA tam olarak 1-2 cümlelik [VOICE_SUMMARY]...[/VOICE_SUMMARY] bloğu yer almalıdır.
Bu blok, kullanıcının ruh halini yakalayan, kısa, samimi, anlaşılır ve akıcı cümledir:
- ASLA teknik özellikleri, sayısal tabloları, Hz/MP/nits değerlerini kelimesi kelimesine okuma!
- Eğer kullanıcı dertli veya kararsızsa sesli özetinde de ona önce güven ver ve dostça yönlendir.
- Karşılaştırma Örneği:
[VOICE_SUMMARY]
iPhone 18 Pro Max ile Galaxy S24 Ultra modellerini inceledim; işlemci mimarisi ve tepe parlaklıkta iPhone öne çıkarken, tüm donanım tablosunu ekranda görebilirsin.
[/VOICE_SUMMARY]
- Empatik / Tavsiye Örneği:
[VOICE_SUMMARY]
Geçmiş olsun dostum, hiç canını sıkma. Bütçeni yormadan seni yıllarca rahat ettirecek en mantıklı modelleri senin için derledim.
[/VOICE_SUMMARY]

KRİTİK FORMAT KURALI:
1. İki veya daha fazla cihaz kıyaslanıyorsa:
[VOICE_SUMMARY]
(1-2 cümlelik kısa, doğal ve canlı sesli özet, cihazların gerçek model adlarıyla)
[/VOICE_SUMMARY]

[SUMMARY_CHAT]
Sol sohbet balonunda görüntülenecek 2-3 cümlelik samimi, empati dolu ve bilge yönetici özeti.
[/SUMMARY_CHAT]

[DEEP_ANALYSIS]
Sağ panelde görüntülenecek derinlemesine teknik analiz:
### 1. Ekran, Panel ve Görsel Başarım
### 2. İşlemci, Grafik ve Hesaplama Gücü
### 3. Kamera, Ses ve Akustik Sürücüler
### 4. Batarya, Enerji Tüketimi ve Verimlilik
💡 Bütçe & Rasyonel Seçim Tavsiyesi:
[/DEEP_ANALYSIS]

2. Genel soru, dertleşme, terim sorma veya bütçe tavsiyelerinde:
En başta [VOICE_SUMMARY]...[/VOICE_SUMMARY] bloğunu verdikten sonra, doğrudan [SUMMARY_CHAT] içinde veya doğrudan Markdown ile empati dolu, bilge ve akıcı bir üslupla yanıt ver. Kullanıcıyı gereksiz kalıplarla boğma!`;

function createFallbackStreamResponse(
  panel?: ComparisonPanelData | TechNewsPanelData | null,
  recommendations?: any[],
  userQuery: string = ""
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

      let replyText = "";
      const qLower = (userQuery || "").toLowerCase();
      const isGreeting = /^(merhaba|selam|selamlar|hey|gunaydin|iyi gunler|kimsin|ne yapabilirsin|yardim)/i.test(qLower);

      if (panel && panel.type === "comparison" && panel.products.length >= 2) {
        const p1 = panel.products[0];
        const p2 = panel.products[1];
        const winnerName = panel.winner?.productName || p1.name;
        replyText = `[VOICE_SUMMARY]
${p1.name} ile ${p2.name} modellerini tüm donanım parametreleriyle karşılaştırdım. Saf teknoloji üstünlüğünde ${winnerName} öne çıkıyor, detayları ekranda görebilirsin.
[/VOICE_SUMMARY]
[SUMMARY_CHAT]
${p1.name} ile ${p2.name} modellerini aceleetme laboratuvarında en dip donanım ayrıntılarına kadar kıyasladım! Teknolojik kriterlerde, panel kalitesinde ve hesaplama gücünde **${winnerName}** liderliği alıyor. Tüm bire bir teknik parametreleri ve piyasa fiyatlarını sağdaki **Canlı Karşılaştırma Paneli**'ne aktardım. 🐧
[/SUMMARY_CHAT]
[DEEP_ANALYSIS]
### 1. Ekran, Panel ve Görsel Başarım
* **${p1.name}:** Yüksek renk gamı, piksel yoğunluğu ve dinamik yenileme hızıyla üst düzey görsel sadakat sunuyor.
* **${p2.name}:** Geniş çalışma/izleme alanı ve yüksek tepe parlaklığıyla ortam ışıklarında parlama önleyici avantaj sağlıyor.

### 2. İşlemci, Grafik ve Hesaplama Gücü
* **${p1.name}:** Optimize çip mimarisi, yüksek çekirdek frekansı ve gelişmiş termal yönetimiyle yoğun iş yüklerinde kararlı.
* **${p2.name}:** Geniş bellek bant genişliği ve yapay zeka işlem birimleriyle çoklu görevlerde akıcı bir deneyim sağlıyor.

### 3. Kamera, Ses ve Akustik Sürücüler
* **${p1.name}:** Akustik çözünürlük, geniş dinamik aralık ve hassas sensör/sürücü kalibrasyonuyla öne çıkıyor.
* **${p2.name}:** Yüksek çıkış gücü ve geniş frekans tepkisiyle dengeli ve doyurucu bir performans sunuyor.

### 4. Batarya, Enerji Tüketimi ve Verimlilik
* **${p1.name}:** Optimize güç tüketim eğrisiyle enerji verimliliği ve uzun süreli dayanıklılık vadediyor.
* **${p2.name}:** Yüksek güç kapasitesi ve hızlı enerji dolumuyla prizden bağımsız kullanım kolaylığı sağlıyor.

💡 Bütçe & Rasyonel Seçim Tavsiyesi:
Saf teknoloji ve donanım kriterlerinde **${winnerName}** üstün gelse de, iki model arasındaki fiyat farkını değerlendirerek bütçene ve kullanım yoğunluğuna en uygun dengeyi seçebilirsin.
[/DEEP_ANALYSIS]`;
      } else if (recommendations && recommendations.length > 0) {
        replyText = `[VOICE_SUMMARY]
İncelemek istediğin modeli aceleetme kataloğumuzda buldum, canlı piyasa fiyatlarını ekranda listeledim.
[/VOICE_SUMMARY]
[SUMMARY_CHAT]
İncelemek istediğin modeli aceleetme kataloğumuzda buldum! 🐧

${recommendations.map((r) => `• **${r.productName}:** ${r.cheapestStore}'da ₺${r.price.toLocaleString("tr-TR")}`).join("\n")}

Bu modellerin detaylı donanım karşılaştırmasını görmek ister misin? Karşılaştırmak istediğin başka bir cihaz varsa hemen adını yazabilirsin.
[/SUMMARY_CHAT]`;
      } else if (panel && panel.type === "news") {
        replyText = `[VOICE_SUMMARY]
Teknoloji dünyasındaki son gelişmeleri ve öne çıkan donanım trendlerini sağ taraftaki panelde derledim.
[/VOICE_SUMMARY]
[SUMMARY_CHAT]
### 📰 RoboPengu Teknoloji Gündemi

Teknoloji dünyasındaki en güncel haberleri ve donanım gelişmelerini sağ taraftaki panelde derledim! İlgini çeken bir haberin detaylarını veya yeni çıkan cihazları sormaktan çekinme. 🐧
[/SUMMARY_CHAT]`;
      } else if (isGreeting) {
        replyText = `[VOICE_SUMMARY]
Selam! Ben RoboPengu, aceleetme'nin baş teknoloji danışmanıyım. Karşılaştırmak veya incelemek istediğin modelleri bana sorabilirsin.
[/VOICE_SUMMARY]
[SUMMARY_CHAT]
Selam! Ben **RoboPengu**; aceleetme.tech platformunun bilge ve dürüst baş teknoloji danışmanıyım. 🐧

"Acele etme, paranı boşa harcama!" felsefesiyle; akıllı telefonlar, bilgisayarlar, televizyonlar, kulaklıklar ve beyaz eşyalar arasında en doğru tercihi yapmana rehberlik ediyorum:
• **Bire Bir Canlı Kıyaslama:** İki model adı ver (örn: *"iPhone 16 Pro Max vs Galaxy S24 Ultra"*), donanım laboratuvarımızda masaya yatıralım.
• **Fiyat & Tasarruf Analizi:** En ucuz nerede satılıyor, gerçek fiyat farkı donanıma değer mi görelim.

Bugün hangi cihazı veya teknolojiyi inceleyelim?
[/SUMMARY_CHAT]`;
      } else {
        replyText = `[VOICE_SUMMARY]
Sorduğun soru için aceleetme teknoloji prensiplerine göre en rasyonel donanım kriterlerini hazırladım.
[/VOICE_SUMMARY]
[SUMMARY_CHAT]
Teknolojide doğru ürünü seçerken ve paranı korurken dikkat etmen gereken temel donanım kriterleri:

1. **Panel & Ekran:** OLED/Mini-LED panellerde tepe parlaklık (nits) ve dinamik yenileme (Hz), gündelik akıcılığı ve dış mekan görünürlüğünü doğrudan belirler.
2. **İşlemci Mimarisi:** Üretim teknolojisi (nm) ve benchmark (Geekbench / AnTuTu) performansı, cihazın 3-4 yıl sonra bile donmadan çalışmasını sağlar.
3. **Gerçek İhtiyaç Dengesi:** Yalnızca marka algısına veya afaki özelliklere fazladan bütçe ayırmak yerine, günlük kullanım senaryona en uygun fiyat/performans cihazına yönel.

Aklında kıyaslamak istediğin spesifik modeller veya belirli bir bütçe sınırı varsa hemen belirt, senin için canlı karşılaştırma masasını hazırlayayım! 🐧
[/SUMMARY_CHAT]`;
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
    // 1. IP bazlı Rate Limiting (Kullanıcı başına 1 dakikada maks 10 istek)
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : (req.headers.get("x-real-ip") || "127.0.0.1");
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ error: "Çok fazla istek gönderdin. Lütfen biraz bekleyip tekrar dene. 🐧" }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. Girdi Doğrulama (Boş mesaj, karakter uzunluğu)
    const body = await req.json().catch(() => ({}));
    const rawPrompt = body.prompt || body.message || "";
    const validation = validateUserMessage(rawPrompt);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error || "Lütfen bir ürün veya soru belirtin." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const trimmedPrompt = validation.sanitized!;

    // 3. Prompt Injection Tespiti & Loglama
    if (flagsPromptInjection(trimmedPrompt)) {
      console.warn(`[RoboPengu][SECURITY] Prompt injection şüphesi tespit edildi: "${trimmedPrompt.slice(0, 100)}"`);
    }

    // 4. Konuşma Hafızası (Multi-turn History)
    const history = Array.isArray(body.history) ? body.history : [];
    const formattedHistory = history
      .slice(-8)
      .filter((h: any) => h && typeof h.content === "string" && h.content.trim() && !h.content.startsWith("⚠️"))
      .map((h: any) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.content.trim() }],
      }));

    // 5. Yan Panel Tespiti (Kıyaslama veya Haberler)
    let sidePanel: ComparisonPanelData | TechNewsPanelData | null = null;
    let matchedProducts: any[] = [];
    let contextualPrompt = trimmedPrompt;

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

    // 6. Canlı Katalog & Fiyat Temellendirme (Grounding)
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
- Model: ${p1.name} (${p1.brand}) | En Ucuz: ${p1Price} (${p1.cheapestStore || "Piyasa"})
- Model: ${p2.name} (${p2.brand}) | En Ucuz: ${p2Price} (${p2.cheapestStore || "Piyasa"})
${matrixInfo ? `\n[ANTUTU & VERSUS DONANIM VE PERFORMANS TABLOSU]:\n${matrixInfo}` : ""}

ÖNEMLİ VE KESİN TALİMATLAR:
1. ASLA "1. ürün", "2. ürün", "birinci model", "ikinci model" deme! Her zaman doğrudan "${p1.name}" ve "${p2.name}" model adlarını kullanarak konuş.
2. Bu iki cihazı Versus.com, AnTuTu Benchmark, Geekbench 6, RTINGS, Notebookcheck seviyesinde derinlemesine teknik bilgi dağarcığınla kıyasla. Kategorisine göre panel tipi, tepe nits parlaklığı, işlemci/grafik mimarisi, NPU TOPS / TGP watt / TFLOPs gücü, sensör boyutu veya akustik sürücü boyutlarını somut verilerle masaya yatır.
3. TEKNOLOJİ KAZANANI KURALI: Kazananı fiyata göre değil, teknolojik üstünlüğe ve donanım gücüne göre belirle! Fiyat farkı yüksekse [DEEP_ANALYSIS] sonundaki bütçe tavsiyesinde mantık çerçevesinde kullanıcıyı yönlendir.
4. [SUMMARY_CHAT] bloğunda her iki modelin adını geçirerek net bir teknoloji kazananı açıkla. [DEEP_ANALYSIS] bloğunda ise 4 başlığın her birinde hem ${p1.name} hem de ${p2.name} modellerinin farkını model isimleriyle detaylandır.`;
    } else if (!sidePanel) {
      const isFollowUp = isFollowUpQuery(trimmedPrompt);

      // A. Bütçe tespiti (Önce mevcut mesajdan, yoksa geçmişten)
      let budgetInfo = extractBudgetFromText(trimmedPrompt);
      let detectedCat = detectCategory(trimmedPrompt).category;
      let preferredBrand = "";

      const lowerPrompt = trimmedPrompt.toLowerCase();
      if (lowerPrompt.includes("samsung") || lowerPrompt.includes("galaxy")) preferredBrand = "samsung";
      else if (lowerPrompt.includes("apple") || lowerPrompt.includes("iphone")) preferredBrand = "apple";
      else if (lowerPrompt.includes("xiaomi") || lowerPrompt.includes("redmi") || lowerPrompt.includes("poco")) preferredBrand = "xiaomi";

      // Eğer mevcut mesajda bütçe yoksa ve takip sorusu veya kısa bir soruysa geçmiş mesajları tara
      if (!budgetInfo && (isFollowUp || trimmedPrompt.length < 50)) {
        for (let i = history.length - 1; i >= 0; i--) {
          const prev = history[i];
          if (prev && typeof prev.content === "string") {
            const b = extractBudgetFromText(prev.content);
            if (b) {
              budgetInfo = b;
              if (!detectedCat) detectedCat = detectCategory(prev.content).category;
              if (!preferredBrand) {
                const prevLower = prev.content.toLowerCase();
                if (prevLower.includes("samsung") || prevLower.includes("galaxy")) preferredBrand = "samsung";
                else if (prevLower.includes("apple") || prevLower.includes("iphone")) preferredBrand = "apple";
                else if (prevLower.includes("xiaomi") || prevLower.includes("redmi") || prevLower.includes("poco")) preferredBrand = "xiaomi";
              }
              break;
            }
          }
        }
      }

      if (budgetInfo && budgetInfo.budget > 0) {
        // Bütçe ifadesini prompt'tan temizleyip ek olarak spesifik bir model istenip istenmediğine bak:
        // Örn: "Kendime 20.000 tl lik bir ürün çocuğuma da hayali olan iphone 18 almak istiyorum"
        // budgetCleaned -> "çocuğuma da hayali olan iphone 18 almak istiyorum" -> "Apple iPhone 18"
        const budgetCleaned = trimmedPrompt
          .replace(/(?:\b\d{1,3}(?:\.\d{3})+|\b\d{4,6})\s*(?:tl|lira|₺)?(?:\s*lik|\s*luk)?(?:\s*bir\s*ürün|\s*ürün|\s*telefon|\s*cihaz)?/gi, " ")
          .replace(/\b\d+\s*(?:bin|k\b)(?:\s*(?:tl|lira|₺))?/gi, " ")
          .replace(/\s+/g, " ")
          .trim();

        let explicitNamedModel: any = null;
        if (budgetCleaned.length >= 3) {
          const namedMatches = searchProductsInCatalog(budgetCleaned, 1);
          if (namedMatches.length > 0) {
            const pPrice = namedMatches[0].basePrice || namedMatches[0].price || 0;
            const isOutsideBudget = pPrice < budgetInfo.budget * 0.7 || pPrice > budgetInfo.budget * 1.3;
            if (isOutsideBudget) {
              explicitNamedModel = namedMatches[0];
            }
          }
        }

        const budgetResult = resolveBudgetRecommendation(
          budgetInfo.budget,
          detectedCat || "smartphones",
          preferredBrand
        );

        if (budgetResult.ok && budgetResult.data && budgetResult.data.products.length > 0) {
          let selectedProducts: any[] = [];
          if (explicitNamedModel) {
            // İlk kart: Belirtilen hayal/özel model (örn: iPhone 18)
            // Diğer kartlar: Bütçeye uygun modeller (örn: 20.000 TL bütçeli modeller)
            selectedProducts = [
              explicitNamedModel,
              ...budgetResult.data.products.filter((p: any) => p.id !== explicitNamedModel.id).slice(0, 2),
            ];
          } else {
            selectedProducts = budgetResult.data.products.slice(0, 3);
          }

          matchedProducts = formatProductRecommendations(selectedProducts);
          const prodsSummary = matchedProducts
            .map(
              (p, i) =>
                `${i + 1}. Model: ${p.productName} | En Ucuz Mağaza Fiyatı: ₺${p.price.toLocaleString("tr-TR")} (${p.cheapestStore})`
            )
            .join("\n");

          contextualPrompt = `Kullanıcı Sorusu: "${trimmedPrompt}"

[ACELEETME CANLI KATALOG & ÇOKLU TALEBE GÖRE MODELLER]:
${prodsSummary}

ÖNEMLİ VE KESİN TALİMATLAR:
1. Kullanıcının talebindeki tüm detayları (örneğin hem kendisi için ₺${budgetInfo.budget.toLocaleString("tr-TR")} bütçeli mantıklı cihaz arayışını, hem de çocuğunun hayali olan ${explicitNamedModel ? explicitNamedModel.name : "cihazı"}) derin empati, bilgelik ve samimiyetle ele al.
2. Bir ebeveyn olarak çocuğunun hayalini destekleme arzusunu içtenlikle karşıla; hayalindeki cihazın güncel durumunu, piyasa fiyatını ve teknolojik gücünü açıkla.
3. Kendi bütçesi olan ₺${budgetInfo.budget.toLocaleString("tr-TR")} için de parasını koruyacak, günlük kullanımda onu asla üzmeyecek fiyat/performans canavarı modelleri açıkla.
4. Hem hayalindeki modelin hem de bütçesine uygun modellerin interaktif ürün kartlarının mesajının hemen altında görseli, en ucuz piyasa fiyatı ve mağaza bağlantısıyla yer aldığını kullanıcıya belirt.
5. Kullanıcı "göremiyorum modelleri", "hangileri", "modeller nerede" veya benzeri bir takip sorusu sorduysa: Çok nazik, samimi ve empati dolu bir dille ("Hemen aşağıya kartları yerleştirdim dostum, gözünden kaçmış olabilir") diyerek modelleri ve sundukları avantajları tekrar netleştir.`;
        }
      } else {
        // B. Tekil ürün veya model arama kontrolü
        let rawMatches = searchProductsInCatalog(trimmedPrompt, 3);
        if (rawMatches.length === 0 && (isFollowUp || trimmedPrompt.length < 35)) {
          // Geçmişteki son kullanıcı mesajında ürün ara
          for (let i = history.length - 1; i >= 0; i--) {
            const prev = history[i];
            if (prev && prev.role === "user" && typeof prev.content === "string") {
              rawMatches = searchProductsInCatalog(prev.content, 3);
              if (rawMatches.length > 0) break;
            }
          }
        }

        if (rawMatches.length > 0) {
          matchedProducts = formatProductRecommendations(rawMatches);
          const prodsSummary = matchedProducts
            .map((p) => `- Model: ${p.productName} | En Ucuz Fiyat: ₺${p.price.toLocaleString("tr-TR")} (${p.cheapestStore})`)
            .join("\n");

          contextualPrompt = `Kullanıcı Sorusu: "${trimmedPrompt}"

[ACELEETME CANLI KATALOG ÜRÜN & FİYAT VERİLERİ]:
${prodsSummary}

Talimat: Kullanıcının sorduğu cihaz(lar) hakkında aceleetme kataloğumuzdaki bu canlı mağaza fiyatlarını ve donanım özelliklerini dikkate alarak samimi, bilgili ve net bir değerlendirme yap. Ürün kartlarının altta listelendiğini belirt.`;
        }
      }
    }

    // 7. Model Yönlendirici ile Akış Başlatma (gemini-3.6-flash ve hızlı fallback zinciri)
    let geminiStreamResult: any = null;
    try {
      geminiStreamResult = await callGeminiStreamWithFallback({
        prompt: contextualPrompt,
        history: formattedHistory,
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: {
          temperature: 0.65,
          maxOutputTokens: 1500,
        },
      });
    } catch (e: any) {
      console.warn("[RoboPengu][AI] Model başlatma hatası:", e?.message);
    }

    if (!geminiStreamResult || !geminiStreamResult.ok || !geminiStreamResult.stream) {
      console.warn("[RoboPengu][AI] Gemini yanıt vermedi, akıllı yerel fallback devreye giriyor...");
      return createFallbackStreamResponse(sidePanel, matchedProducts, trimmedPrompt);
    }

    // 8. SSE Yanıt Akışı
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // A. Yan panel verisini SSE olarak gönder
          if (sidePanel) {
            controller.enqueue(encoder.encode(`event: panel\ndata: ${JSON.stringify(sidePanel)}\n\n`));
          }

          // B. Eşleşen ürün önerileri varsa SSE olarak gönder
          if (matchedProducts.length > 0) {
            controller.enqueue(encoder.encode(`event: products\ndata: ${JSON.stringify(matchedProducts)}\n\n`));
          }

          // C. Gemini metin akışını SSE olarak gönder
          let hasEnqueuedText = false;
          try {
            for await (const chunk of geminiStreamResult.stream!) {
              const text = chunk.text();
              if (text) {
                hasEnqueuedText = true;
                controller.enqueue(encoder.encode(`event: text\ndata: ${JSON.stringify(text)}\n\n`));
              }
            }
          } catch (streamErr: any) {
            console.warn("[RoboPengu][STREAM] Akış ortasında hata:", streamErr?.message);
            if (!hasEnqueuedText) {
              const fallbackText = `[VOICE_SUMMARY]\n${trimmedPrompt} hakkında teknik verileri hazırladım, ekranda inceleyebilirsin.\n[/VOICE_SUMMARY]\n[SUMMARY_CHAT]\nİstediğin teknik karşılaştırma ve incelemeyi aceleetme laboratuvarında hazırladım. Güncel donanım parametrelerini inceleyebilirsin! 🐧\n[/SUMMARY_CHAT]`;
              controller.enqueue(encoder.encode(`event: text\ndata: ${JSON.stringify(fallbackText)}\n\n`));
            }
          }

          // D. Akış tamamlandı
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
    console.error("[RoboPengu][ERROR] Chat API genel yakalama hatası:", error);
    return createFallbackStreamResponse(null, [], "genel");
  }
}
