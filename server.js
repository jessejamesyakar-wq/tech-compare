import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Google Gemini API Bağlantısı
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Model listesi: Ortam değişkeni veya resmi kararlı modeller (öncelik: 3.6-flash, 2.5-flash, 1.5-flash)
const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

const SYSTEM_INSTRUCTION = `Sen RoboPengu'sun; aceleetme'nin tarafsız ve uzman baş teknoloji danışmanısın. Kullanıcılar telefon, TV veya donanım sorduğunda ekran paneli (nits/Hz), işlemci mimarisi, kamera sensörleri, şarj/batarya ve fiyat/performans dengesini doğrudan kıyasla. Asla kararsız kalma; kullanım amacına göre kesin bir kazanan belirle. Yanıtları temiz Markdown başlıkları ve maddeleriyle sun.`;

app.post("/api/chat", async (req, res) => {
  const { prompt, message } = req.body || {};
  const userPrompt = prompt || message;

  if (!userPrompt) {
    return res.status(400).json({ error: "Lütfen bir soru belirtin." });
  }

  if (!apiKey || apiKey.includes("senin_google_api_anahtarin")) {
    return res.status(500).json({
      error: "GEMINI_API_KEY .env dosyasında tanımlı değil veya geçersiz. Lütfen geçerli bir Google Gemini API anahtarı ekleyin."
    });
  }

  try {
    // Model tanımlama (Resmi ve kararlı sürüm, 404 durumunda otomatik fallback)
    const candidateModels = [PRIMARY_MODEL, "gemini-1.5-flash", "gemini-2.5-flash", "gemini-flash-latest"];
    let result = null;
    let lastError = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: SYSTEM_INSTRUCTION,
        });
        result = await model.generateContentStream(userPrompt);
        if (result && result.stream) break;
      } catch (err) {
        lastError = err;
        if (err.message && (err.message.includes("404") || err.message.includes("not found") || err.message.includes("no longer available"))) {
          continue;
        }
        throw err;
      }
    }

    if (!result || !result.stream) {
      throw lastError || new Error("Model akışı başlatılamadı.");
    }

    // Canlı Akış (Streaming / SSE) Başlıkları
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(chunkText);
      if (typeof res.flush === "function") res.flush();
    }

    res.end();
  } catch (error) {
    console.error("RoboPengu API Hatası:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "RoboPengu bağlantı hatası: " + error.message });
    } else {
      res.end();
    }
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`RoboPengu (aceleetme) http://0.0.0.0:${PORT} üzerinde hazır!`);
});
