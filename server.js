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

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
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
      return res.status(response.status).json({ error: `OpenRouter Hatası: ${errText}` });
    }

    // AntiGravity canlı akış (SSE) başlıkları
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
          } catch (e) {
            // Parçalı veri bloklarını atla
          }
        }
      }
    }

    res.end();
  } catch (error) {
    console.error("aceleetme API Hatası:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Sunucu hatası: " + error.message });
    } else {
      res.end();
    }
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`RoboPengu (aceleetme) http://0.0.0.0:${PORT} üzerinde hazır!`);
});
