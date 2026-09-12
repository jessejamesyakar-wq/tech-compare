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
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/chat", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Lütfen bir soru belirtin." });
  }

  try {
    // En kararlı ve hızlı model: gemini-1.5-flash
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `Sen RoboPengu'sun; aceleetme'nin tarafsız ve uzman baş teknoloji danışmanısın. Kullanıcı telefon veya donanım sorduğunda ekran, işlemci, kamera ve fiyat dengesini kıyasla; asla kararsız kalma, kullanım amacına göre kesin bir kazanan belirle. Yanıtlarını temiz Markdown başlıkları ve maddeleriyle sun.`,
    });

    const result = await model.generateContentStream(prompt);

    // Canlı Akış (Streaming) Başlıkları
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
