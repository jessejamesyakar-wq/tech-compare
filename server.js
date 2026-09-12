import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.post("/api/chat", async (req, res) => {
  const { prompt, message, history, modelChoice } = req.body || {};
  const userPrompt = prompt || message;

  if (!userPrompt) {
    return res.status(400).json({ error: "Lütfen bir ürün veya soru belirtin." });
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
    ? history.map((h) => ({
        role: h.role === "assistant" ? "assistant" : "user",
        content: h.content || ""
      }))
    : [];

  const messages = [
    systemMessage,
    ...formattedHistory,
    { role: "user", content: userPrompt }
  ];

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  const isOpenRouterValid =
    openRouterKey &&
    !openRouterKey.includes("senin-openrouter-anahtarin") &&
    openRouterKey.trim().length > 10;

  try {
    if (isOpenRouterValid) {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[OpenRouter API Hatası] HTTP ${response.status}:`, errText);
        return res.status(response.status).json({
          error: `OpenRouter Hatası (${response.status}): ${errText}`
        });
      }

      res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          if (line.includes("[DONE]")) continue;
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              const token = data.choices?.[0]?.delta?.content || "";
              if (token) {
                res.write(token);
                if (typeof res.flush === "function") res.flush();
              }
            } catch {
              // Parçalı veri bloklarını atla
            }
          }
        }
      }

      return res.end();
    }

    // OpenRouter anahtarı henüz girilmediyse ve Gemini anahtarı varsa Gemini 3.8 Flash kullan
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
              { role: "user", parts: [{ text: userPrompt }] }
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
        return res.status(geminiRes.status).json({
          error: `Gemini API Hatası (${geminiRes.status}): ${errText}`
        });
      }

      res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");

      const reader = geminiRes.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

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
                  res.write(token);
                  if (typeof res.flush === "function") res.flush();
                }
              } catch {}
            }
          }
        }
      }

      return res.end();
    }

    return res.status(401).json({
      error: "Geçerli bir API anahtarı bulunamadı! Lütfen .env dosyasındaki OPENROUTER_API_KEY alanına anahtarınızı girin."
    });

  } catch (error) {
    console.error("aceleetme API Hatası:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Sunucu hatası: " + (error?.stack || error?.message || error) });
    } else {
      res.end();
    }
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`RoboPengu (aceleetme) http://0.0.0.0:${PORT} üzerinde hazır!`);
});
