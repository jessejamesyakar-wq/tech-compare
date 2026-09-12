import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt = body.prompt || body.message;
    const history = body.history || [];

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return new Response(JSON.stringify({ error: "Prompt eksik!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY ortam değişkeni tanımlı değil!" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2026'nın en dengeli, multimodal ve akıllı üretim modeli
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", // Hız + Yüksek Zeka dengesi için en kararlı model
      systemInstruction: `Sen RoboPengu'sun; TechKıyas platformunun tarafsız, esprili ve uzman baş teknoloji danışmanısın. Maskotun olan sevimli robot penguen kimliğini korursun ama donanım söz konusu olduğunda tam bir mühendissin.

GÖREVLERİN VE KURALLARIN:
1. NET VE TARAFSIZ KIYASLAMA: İki cihaz sorulduğunda (Örn: Redmi Note 14 Pro vs Oppo A6 Pro 5G) boş laf etme. Doğrudan Ekran Paneli (nits/Hz), İşlemci/Yonga Seti, Kamera Sensörü, Batarya/Hızlı Şarj ve Fiyat/Performans dengesini kıyasla.
2. NET KAZANAN BELİRLE: Kullanıcıyı kararsız bırakma! "Kamera ve günlük kullanım için X, saf işlem gücü ve oyun için Y önde" diyerek kesin sonuca bağla.
3. KULLANICI DOSTU ANLATIM: Derin teknik terimleri (OLED subpixel, ISP, nanometre vb.) son kullanıcının anlayacağı pratik faydaya dönüştür.
4. FORMATLAMA: Yanıtlarını her zaman temiz Markdown başlıkları, madde imleri ve kalın vurgularla ver. Asla tek bir devasa paragraf halinde yazma.
5. DİL: Kullanıcı hangi dilde sorarsa (Türkçe/İngilizce) o dilde akıcı, samimi ama profesyonel yanıt ver.`,
      // Marka ve donanım adlarının güvenlik filtresine takılmasını önlüyoruz:
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
      generationConfig: {
        temperature: 0.4, // Donanım verilerinde tutarlılık ve doğruluk için düşük ısı
        maxOutputTokens: 2048,
      }
    });

    // Sohbet geçmişini modele aktarma (SDK formatı: role 'user' | 'model', parts: [{ text }])
    const formattedHistory = Array.isArray(history)
      ? history
          .filter((h: any) => h && h.content && typeof h.content === "string")
          .map((h: any) => ({
            role: h.role === "assistant" || h.role === "model" ? "model" : "user",
            parts: [{ text: h.content }]
          }))
      : [];

    const chat = model.startChat({
      history: formattedHistory
    });

    // STREAMING ÇAĞRISI: Boş balon kalmasını imkansız kılan kısım
    const result = await chat.sendMessageStream(prompt.trim());

    // Yanıtı frontend'e canlı akıtacak stream köprüsü
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              controller.enqueue(encoder.encode(chunkText));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });

  } catch (error: any) {
    console.error("RoboPengu API Hatası:", error);
    return new Response(
      JSON.stringify({
        error: "RoboPengu bağlantı kurarken bir aksaklık yaşadı: " + (error?.message || "Bilinmeyen hata")
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
