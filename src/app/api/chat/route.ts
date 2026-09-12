import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_INSTRUCTION = `Sen RoboPengu'sun; aceleetme'nin tarafsız ve uzman baş teknoloji danışmanısın. Kullanıcılar telefon, TV veya donanım sorduğunda ekran paneli (nits/Hz), işlemci mimarisi, kamera sensörleri, şarj/batarya ve fiyat/performans dengesini doğrudan kıyasla. Asla kararsız kalma; kullanım amacına göre kesin bir kazanan belirle. Yanıtları temiz Markdown başlıkları ve maddeleriyle sun.`;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt = body.prompt || body.message;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return new Response(JSON.stringify({ error: "Lütfen bir ürün veya soru belirtin." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey.includes("senin_google_api_anahtarin") || apiKey.trim().length < 5) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY bulunamadı veya geçersiz. Lütfen .env dosyasında GEMINI_API_KEY değerini kontrol edin."
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const candidateModels = [
      process.env.GEMINI_MODEL || "gemini-3.6-flash",
      "gemini-1.5-flash",
      "gemini-2.5-flash",
      "gemini-flash-latest"
    ];

    let result: any = null;
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: SYSTEM_INSTRUCTION
        });
        result = await model.generateContentStream(prompt.trim());
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
      throw lastError || new Error("Gemini akışı başlatılamadı.");
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no"
      }
    });
  } catch (error: any) {
    console.error("[RoboPengu][ERROR] Chat API hatası:", error);
    return new Response(
      JSON.stringify({ error: "RoboPengu bağlantı hatası: " + (error?.message || "Bilinmeyen hata") }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
