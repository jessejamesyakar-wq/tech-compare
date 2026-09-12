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

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OPENROUTER_API_KEY ortam değişkeni tanımlı değil!" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Varsayılan model: Claude 3.5 Sonnet
    const selectedModel = modelChoice || "anthropic/claude-3.5-sonnet";

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

    const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.SITE_URL || "https://aceleetme.tech",
        "X-Title": process.env.SITE_NAME || "aceleetme",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: messages,
        stream: true,
        temperature: 0.3
      })
    });

    if (!openRouterRes.ok) {
      const errText = await openRouterRes.text();
      return new Response(JSON.stringify({ error: `OpenRouter Hatası: ${errText}` }), {
        status: openRouterRes.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!openRouterRes.body) {
      return new Response(JSON.stringify({ error: "OpenRouter body eksik." }), {
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
                } catch {
                  // JSON parse parçalı chunk
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

  } catch (error: any) {
    console.error("aceleetme API Hatası:", error);
    return new Response(
      JSON.stringify({
        error: "RoboPengu bağlantı kurarken bir aksaklık yaşadı: " + (error?.message || "Bilinmeyen hata")
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
