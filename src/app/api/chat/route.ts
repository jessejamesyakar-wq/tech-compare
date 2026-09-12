export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt = body.prompt || body.message;
    const history = body.history || [];
    const modelChoice = body.modelChoice;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return new Response(JSON.stringify({ error: "Lütfen bir ürün veya soru belirtin." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    const isOpenRouterValid =
      openRouterKey &&
      !openRouterKey.includes("senin-openrouter-anahtarin") &&
      openRouterKey.trim().length > 10;

    // Varsayılan model: google/gemini-3.8-flash (OpenRouter)
    let selectedModel = modelChoice || process.env.OPENROUTER_MODEL || "google/gemini-3.8-flash";
    if (selectedModel === "anthropic/claude-3.5-sonnet") {
      selectedModel = "anthropic/claude-sonnet-4";
    }

    const systemMessage = {
      role: "system",
      content: `Sen RoboPengu'sun; aceleetme'nin tarafsız ve uzman baş teknoloji danışmanısın.
KİMLİĞİN VE ÇALIŞMA KURALLARIN:
1. Sen aceleetme platformunun akıllı asistanısın. Amacın kullanıcıya acele etmeden, en doğru donanım tercihini yaptırmak.
2. Telefon, TV, bilgisayar veya çevre birimi sorulduğunda ekran (panel türü/nits/Hz), işlemci mimarisi, kamera donanımı, batarya/şarj hızı ve fiyat/performans dengesini doğrudan kıyasla.
3. Kullanıcıyı kararsız bırakma; kullanım amacına göre (örn: 'Oyun ve saf performans için X, uzun pil ömrü ve ekran kalitesi için Y') kesin bir kazanan belirle.
4. Teknik jargonu son kullanıcının gündelik yaşamda hissedeceği pratik faydalara dönüştürerek açıkla.
5. Temiz ve okunaklı Markdown başlıkları ve maddeleri kullan.`
    };

    const formattedHistory = Array.isArray(history)
      ? history
          .filter((h: any) => h && h.content && typeof h.content === "string")
          .map((h: any) => ({
            role: h.role === "assistant" || h.role === "model" ? "assistant" : "user",
            content: h.content
          }))
      : [];

    const messages = [
      systemMessage,
      ...formattedHistory,
      { role: "user", content: prompt.trim() }
    ];

    // 1. ÖNCELİK: OpenRouter Claude 3.5 Sonnet
    if (isOpenRouterValid) {
      const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterKey}`,
          "HTTP-Referer": process.env.SITE_URL || "https://aceleetme.tech",
          "X-Title": process.env.SITE_NAME || "aceleetme",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: messages,
          stream: true,
          temperature: 0.3,
          max_tokens: 2000
        })
      });

      if (!openRouterRes.ok) {
        const errText = await openRouterRes.text();
        console.error(`[OpenRouter API Hatası] HTTP ${openRouterRes.status}:`, errText);
        return new Response(JSON.stringify({ error: `OpenRouter Hatası (${openRouterRes.status}): ${errText}` }), {
          status: openRouterRes.status,
          headers: { "Content-Type": "application/json" }
        });
      }

      if (!openRouterRes.body) {
        return new Response(JSON.stringify({ error: "OpenRouter stream gövdesi boş." }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }

      const reader = openRouterRes.body.getReader();
      const decoder = new TextDecoder("utf-8");
      const encoder = new TextEncoder();

      const stream = new ReadableStream({
        async start(controller) {
          let buffer = "";
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.includes("[DONE]")) continue;
                if (trimmed.startsWith("data: ")) {
                  try {
                    const data = JSON.parse(trimmed.slice(6));
                    const token = data.choices?.[0]?.delta?.content || "";
                    if (token) {
                      controller.enqueue(encoder.encode(token));
                    }
                  } catch {}
                }
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
    }

    // 2. YEDEK: Gemini 3.8 Flash (OpenRouter anahtarı girilene kadar kesintisiz akış sağlar)
    if (geminiKey && geminiKey.trim().length > 10) {
      console.log("[RoboPengu] OPENROUTER_API_KEY henüz girilmediği için GEMINI_API_KEY (Gemini 3.8 Flash) ile doğrudan yanıt üretiliyor.");
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:streamGenerateContent?alt=sse&key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemMessage.content }] },
            contents: [
              ...formattedHistory.map((h) => ({
                role: h.role === "assistant" ? "model" : "user",
                parts: [{ text: h.content }]
              })),
              { role: "user", parts: [{ text: prompt.trim() }] }
            ],
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
            ],
            generationConfig: { temperature: 0.3, maxOutputTokens: 2048 }
          })
        }
      );

      if (!geminiRes.ok) {
        const errText = await geminiRes.text();
        console.error(`[Gemini API Hatası] HTTP ${geminiRes.status}:`, errText);
        return new Response(JSON.stringify({ error: `Gemini API Hatası (${geminiRes.status}): ${errText}` }), {
          status: geminiRes.status,
          headers: { "Content-Type": "application/json" }
        });
      }

      const reader = geminiRes.body!.getReader();
      const decoder = new TextDecoder("utf-8");
      const encoder = new TextEncoder();

      const stream = new ReadableStream({
        async start(controller) {
          let buffer = "";
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith("data: ")) {
                  const dataStr = trimmed.slice(6).trim();
                  if (dataStr && dataStr !== "[DONE]") {
                    try {
                      const parsed = JSON.parse(dataStr);
                      const token = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
                      if (token) {
                        controller.enqueue(encoder.encode(token));
                      }
                    } catch {}
                  }
                }
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
    }

    return new Response(
      JSON.stringify({
        error: "Geçerli bir API anahtarı bulunamadı! Lütfen .env dosyasındaki OPENROUTER_API_KEY alanına anahtarınızı girin."
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("aceleetme API Hatası:", error);
    return new Response(
      JSON.stringify({
        error: "RoboPengu bağlantı kurarken bir aksaklık yaşadı: " + (error?.stack || error?.message || "Bilinmeyen hata")
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
