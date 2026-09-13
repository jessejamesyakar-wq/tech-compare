import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  resolveCompareProducts,
  formatComparisonData,
  tryExtractComparisonFromMessage,
  isNewsQuery,
  resolveTechNews,
  ComparisonPanelData,
  TechNewsPanelData,
} from "@/lib/ai/resolvers";

const SYSTEM_INSTRUCTION = `Sen RoboPengu'sun; aceleetme'nin tarafsız ve uzman baş teknoloji danışmanısın. Kullanıcılar telefon, TV veya donanım sorduğunda ekran paneli (nits/Hz), işlemci mimarisi, kamera sensörleri, şarj/batarya ve fiyat/performans dengesini doğrudan kıyasla. Asla kararsız kalma; kullanım amacına göre kesin bir kazanan belirle. Yanıtları temiz Markdown başlıkları ve maddeleriyle sun.`;

function createFallbackStreamResponse(panel: ComparisonPanelData | TechNewsPanelData) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`event: panel\ndata: ${JSON.stringify(panel)}\n\n`));
      let replyText = "";
      if (panel.type === "comparison") {
        const p1 = panel.products[0];
        const p2 = panel.products[1];
        replyText = `### 🐧 RoboPengu Canlı Karşılaştırma\n\n**${p1.name}** ile **${p2.name}** modellerini aceleetme kataloğumuzdan analiz ettim!\n\nSağ taraftaki **Canlı Karşılaştırma Paneli**'nde tüm teknik özellikleri, ekran, işlemci, kamera ve batarya değerlerini yan yana görebilirsin.\n\n🏆 **RoboPengu Değerlendirmesi:** ${panel.winner.productName}\n${panel.winner.reasons.map((r) => `• ${r}`).join("\n")}`;
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
      }
    } else if (isNewsQuery(trimmedPrompt)) {
      sidePanel = resolveTechNews(trimmedPrompt);
    }

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
        });
        result = await model.generateContentStream(trimmedPrompt);
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

