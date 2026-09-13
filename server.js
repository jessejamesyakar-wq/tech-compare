import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Veri kataloğunu yükle (Kıyaslama paneli için)
let smartphonesData = [];
try {
  smartphonesData = JSON.parse(
    fs.readFileSync(new URL("./src/lib/smartphonesData.json", import.meta.url), "utf-8")
  );
} catch (e) {
  console.warn("smartphonesData yüklenemedi:", e.message);
}

function normalizeTr(text) {
  if (!text) return "";
  return text
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function findProductInCatalog(identifier) {
  const norm = normalizeTr(identifier);
  if (!norm) return null;

  const direct = smartphonesData.find(
    (p) => p.id === identifier || p.slug === identifier || normalizeTr(p.name) === norm
  );
  if (direct) return direct;

  const candidates = smartphonesData.filter((p) => normalizeTr(p.name).includes(norm));
  if (candidates.length > 0) {
    const hasMax = norm.includes("max");
    const hasPlus = norm.includes("plus");
    const hasUltra = norm.includes("ultra");

    const exactRanked = candidates.filter((p) => {
      const pNorm = normalizeTr(p.name);
      if (!hasMax && pNorm.includes("max")) return false;
      if (!hasPlus && pNorm.includes("plus")) return false;
      if (!hasUltra && pNorm.includes("ultra")) return false;
      return true;
    });

    if (exactRanked.length > 0) return exactRanked[0];
    return candidates[0];
  }
  return null;
}

function tryExtractComparison(message) {
  const norm = normalizeTr(message);
  if (!norm) return null;

  const clean = norm
    .replace(/[,\?\!]/g, " ")
    .replace(
      /\b(kiyasla|karsilastir|karsilastirmasi|kiyaslamasi|farklari|farki|hangisi|daha|iyi|alınır|alınır mı|oner|mi|mu|yoksa|telefonu|televizyonu|modeli|yi|yı|yu|yü)\b/g,
      " "
    );

  const parts = clean
    .split(/\s+(?:ile|ve|vs\.?|karsilastir|kiyasla|\/|-)\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);

  if (parts.length >= 2) {
    const p1 = findProductInCatalog(parts[0]);
    const p2 = findProductInCatalog(parts[1]);
    if (p1 && p2 && p1.id !== p2.id) {
      return [p1, p2];
    }
  }
  return null;
}

function buildComparisonPanel(p1, p2) {
  const winner = p1.basePrice < p2.basePrice ? p1 : p2;
  const loser = winner === p1 ? p2 : p1;
  const priceDiff = Math.abs(p1.basePrice - p2.basePrice);

  return {
    type: "comparison",
    scenario: "Fiyat / Donanım Kıyaslaması",
    category: "smartphones",
    products: [p1, p2].map((p) => {
      const validOffers = Array.isArray(p.storeOffers)
        ? p.storeOffers.filter((o) => o.price > 0).sort((a, b) => a.price - b.price)
        : [];
      return {
        id: p.id,
        slug: p.slug || p.id,
        name: p.name,
        brand: p.brand,
        category: "phones",
        image: p.image || (Array.isArray(p.images) ? p.images[0] : undefined),
        price: validOffers[0]?.price || p.basePrice || 0,
        cheapestStore: validOffers[0]?.storeName || "Hepsiburada",
      };
    }),
    matrix: [
      { label: "En Ucuz Fiyat", values: [`₺${p1.basePrice?.toLocaleString("tr-TR")}`, `₺${p2.basePrice?.toLocaleString("tr-TR")}`], isDifferent: p1.basePrice !== p2.basePrice },
      { label: "İşlemci", values: [p1.specs?.processor?.chip || "-", p2.specs?.processor?.chip || "-"], isDifferent: true },
      { label: "Ekran", values: [p1.specs?.screen?.type || p1.specs?.screen?.size || "-", p2.specs?.screen?.type || p2.specs?.screen?.size || "-"], isDifferent: true },
      { label: "RAM & Depolama", values: [`${p1.specs?.memory?.ramGb || "-"} GB / ${p1.specs?.memory?.storageGb || "-"} GB`, `${p2.specs?.memory?.ramGb || "-"} GB / ${p2.specs?.memory?.storageGb || "-"} GB`], isDifferent: true },
      { label: "Ana Kamera", values: [p1.specs?.camera?.mainMp || "-", p2.specs?.camera?.mainMp || "-"], isDifferent: true },
      { label: "Batarya & Şarj", values: [`${p1.specs?.battery?.capacitymAh || "-"} mAh (${p1.specs?.battery?.chargingWatts || "-"}W)`, `${p2.specs?.battery?.capacitymAh || "-"} mAh (${p2.specs?.battery?.chargingWatts || "-"}W)`], isDifferent: true },
    ],
    winner: {
      productId: winner.id,
      productName: winner.name,
      scenario: "Fiyat / Donanım",
      reasons: [
        `₺${priceDiff.toLocaleString("tr-TR")} daha avantajlı fiyat etiketi`,
        `Kullanım senaryosuna göre dengeli donanım paketi`,
      ],
    },
  };
}

// Google Gemini API Bağlantısı
const FALLBACK_KEY = Buffer.from(
  "QVEuQWI4Uk42TDBWZ2NnaVktR1Q1WWFFeGVMSWtpa2pzejkxQkMtLUk1ZGJtQXEzR2x6WEE=",
  "base64"
).toString("utf-8");

let apiKey = process.env.GEMINI_API_KEY;
if (!apiKey || apiKey.includes("senin_google_api_anahtarin") || apiKey.trim().length < 10) {
  apiKey = FALLBACK_KEY;
}

const genAI = new GoogleGenerativeAI(apiKey);
const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

const SYSTEM_INSTRUCTION = `Sen RoboPengu'sun; aceleetme'nin tarafsız ve uzman baş teknoloji danışmanısın. Kullanıcılar telefon, TV veya donanım sorduğunda ekran paneli (nits/Hz), işlemci mimarisi, kamera sensörleri, şarj/batarya ve fiyat/performans dengesini doğrudan kıyasla. Asla kararsız kalma; kullanım amacına göre kesin bir kazanan belirle. Yanıtları temiz Markdown başlıkları ve maddeleriyle sun.`;

app.post("/api/chat", async (req, res) => {
  const { prompt, message } = req.body || {};
  const userPrompt = (prompt || message || "").trim();

  if (!userPrompt) {
    return res.status(400).json({ error: "Lütfen bir soru belirtin." });
  }

  // 1. Yan panel tespiti (Kıyaslama)
  let panelData = null;
  const matchedPhones = tryExtractComparison(userPrompt);
  if (matchedPhones) {
    panelData = buildComparisonPanel(matchedPhones[0], matchedPhones[1]);
  }

  try {
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
      throw lastError || new Error("Model akışı başlatılamadı.");
    }

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    if (panelData) {
      res.write(`event: panel\ndata: ${JSON.stringify(panelData)}\n\n`);
    }

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        res.write(`event: text\ndata: ${JSON.stringify(chunkText)}\n\n`);
        if (typeof res.flush === "function") res.flush();
      }
    }

    res.write("event: done\ndata: [DONE]\n\n");
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

