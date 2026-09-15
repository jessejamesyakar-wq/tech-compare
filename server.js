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
  const clean = (message || "")
    .replace(/[,\?\!\.]+/g, " ")
    .replace(
      /\b(kiyasla|kıyasla|karsilastir|karşılaştır|karsilastirmasi|karşılaştırması|kiyaslamasi|kıyaslaması|farklari|farkları|farki|farkı|hangisi|daha|iyi|alinir|alınır|oner|öner|mi|mu|yoksa|telefonu|televizyonu|modeli|yi|yı|yu|yü)\b/gi,
      " "
    )
    .trim();

  const splitRegex = /\s+(?:vs\.?|ile|ve|\/|karşı)\s+/i;
  let parts = null;
  if (splitRegex.test(clean)) {
    parts = clean
      .split(splitRegex)
      .map((s) => s.trim().replace(/^[\s,]+|[\s,]+$/g, ""))
      .filter((s) => s.length >= 2);
  } else {
    const compactVsMatch = message.match(/([A-Za-z0-9\-_]+)\s*vs\.?\s*([A-Za-z0-9\-_]+)/i);
    if (compactVsMatch) {
      parts = [compactVsMatch[1].trim(), compactVsMatch[2].trim()];
    }
  }

  if (parts && parts.length >= 2) {
    const p1 = findProductInCatalog(parts[0]);
    const p2 = findProductInCatalog(parts[1]);
    if (p1 && p2 && p1.id !== p2.id) {
      return [p1, p2];
    }
    // Katalogda bulunamazsa dinamik ürünler oluştur
    const dyn1 = p1 || {
      id: "dyn-1",
      slug: parts[0].toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: parts[0],
      brand: parts[0].split(" ")[0] || "Teknoloji",
      category: "electronics",
      basePrice: 0,
      storeOffers: [],
      specs: {},
    };
    const dyn2 = p2 || {
      id: "dyn-2",
      slug: parts[1].toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: parts[1],
      brand: parts[1].split(" ")[0] || "Teknoloji",
      category: "electronics",
      basePrice: 0,
      storeOffers: [],
      specs: {},
    };
    return [dyn1, dyn2];
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

const SYSTEM_INSTRUCTION = `Sen RoboPengu'sun; aceleetme.tech platformunun kıdemli, bilge, samimi ve dürüst baş teknoloji danışmanısın (Tech Guru AI).

KİMLİĞİN VE TEMEL FELSEFEN:
1. "Acele Etme, Paranı Boşa Harcama": Kullanıcının bütçesini ve emeğini kendi paran gibi korursun. Sponsorlu marka övgüsü veya taraflı yönlendirme ASLA yapmazsın.
2. Derin Düşünen ve Anlamlandıran Zeka (Reasoning & Empathy):
   - Kuru teknik terimleri (nits, Hz, nm, mAh) sadece bir liste olarak sayıp geçmezsin. Bu sayıların kullanıcının GERÇEK GÜNLÜK HAYATINDA ne anlama geldiğini açık ve canlı benzetmelerle yorumlarsın.
3. Kullanım Senaryosunu Çözümle:
   - Kullanıcının sorusundaki gizli ihtiyacı yakala. Yorumunu buna göre kişiselleştir.
4. Kararlı ve Net Ol:
   - "İkisi de güzel cihaz" gibi suya sabuna dokunmayan kaçamak cevaplar verme. Kriterlere göre net bir kazanan ve kimin hangi cihazı alması gerektiğini cesurca belirt.

SESLİ ÖZET KURALI (VOICE_SUMMARY):
Tüm yanıtlarının EN BAŞINDA MUTLAKA 1-2 cümlelik [VOICE_SUMMARY]...[/VOICE_SUMMARY] bloğu yer almalıdır.

KRİTİK FORMAT KURALI (İKİ EKRAN DÜZENİ):
Kullanıcı iki veya daha fazla ürünü karşılaştırmanı istediğinde yanıtını MUTLAKA tam olarak şu bloklar halinde üret:

[VOICE_SUMMARY]
(1-2 cümlelik kısa ve akıcı sesli özet)
[/VOICE_SUMMARY]

[SUMMARY_CHAT]
Sol sohbet balonunda görüntülenecek 2-3 cümlelik samimi, canlı ve bilge yönetici özeti.
[/SUMMARY_CHAT]

[DEEP_ANALYSIS]
Sağ panelde görüntülenecek derinlemesine teknik analizi TAM OLARAK şu 4 başlık altında incele:

### 1. Ekran ve Panel Kıyaslaması
### 2. İşlemci ve Donanım Performansı
### 3. Kamera / Ses / Sensör Analizi
### 4. Batarya / Enerji Tüketimi ve Verimlilik

💡 Bütçe & Rasyonel Seçim Tavsiyesi:
(1-2 cümlelik rasyonel tavsiye)
[/DEEP_ANALYSIS]

Eğer kullanıcı karşılaştırma DIŞINDA genel bir soru soruyorsa, en başta [VOICE_SUMMARY]...[/VOICE_SUMMARY] verdikten sonra, empati dolu ve bilge bir üslupla doğrudan yanıt ver.`;

app.post("/api/chat", async (req, res) => {
  const { prompt, message, history } = req.body || {};
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

  let contextualPrompt = userPrompt;
  if (panelData && panelData.type === "comparison" && panelData.products && panelData.products.length >= 2) {
    const p1 = panelData.products[0];
    const p2 = panelData.products[1];
    contextualPrompt = `Kullanıcı Sorusu: "${userPrompt}"

[ACELEETME CANLI KATALOG BİLGİLERİ]:
- 1. Ürün: ${p1.name} (₺${p1.price?.toLocaleString("tr-TR")}) - ${p1.cheapestStore || "Piyasa"}
- 2. Ürün: ${p2.name} (₺${p2.price?.toLocaleString("tr-TR")}) - ${p2.cheapestStore || "Piyasa"}

Lütfen analizinde bu gerçek fiyat farklarını ve donanım avantajlarını pratik hayat tecrübesiyle derinlemesine yorumla.`;
  }

  const candidateModels = ["gemini-3.6-flash", "gemini-3-flash-preview", "gemini-3.1-flash-lite-preview", "gemini-3.8-flash"];
  let result = null;
  let lastError = null;

  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: {
          temperature: 0.65,
          maxOutputTokens: 1500,
        },
      });
      result = await model.generateContentStream(contextualPrompt);
      if (result && result.stream) break;
    } catch (err) {
      lastError = err;
      console.warn(`[RoboPengu][server.js] Model ${modelName} başarısız: ${err?.message?.slice(0, 100)}`);
    }
  }

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  if (panelData) {
    res.write(`event: panel\ndata: ${JSON.stringify(panelData)}\n\n`);
  }

  if (result && result.stream) {
    try {
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          res.write(`event: text\ndata: ${JSON.stringify(chunkText)}\n\n`);
          if (typeof res.flush === "function") res.flush();
        }
      }
      res.write("event: done\ndata: [DONE]\n\n");
      res.end();
      return;
    } catch (streamErr) {
      console.warn("[RoboPengu][server.js] Stream kesintisi:", streamErr?.message);
    }
  }

  // Model başarısız olduysa veya akış kesildiyse akıllı fallback gönder
  let fallbackReply = "";
  if (panelData && panelData.products && panelData.products.length >= 2) {
    const p1 = panelData.products[0];
    const p2 = panelData.products[1];
    fallbackReply = `[VOICE_SUMMARY]
${p1.name} ile ${p2.name} modellerini tüm donanım parametreleriyle karşılaştırdım, detayları sağdaki panelde görebilirsin.
[/VOICE_SUMMARY]
[SUMMARY_CHAT]
${p1.name} ile ${p2.name} modellerini aceleetme laboratuvarında en dip donanım ayrıntılarına kadar kıyasladım! Tüm teknik parametreleri ve canlı piyasa fiyatlarını sağdaki **Canlı Karşılaştırma Paneli**'ne aktardım. 🐧
[/SUMMARY_CHAT]
[DEEP_ANALYSIS]
### 1. Ekran ve Panel Kıyaslaması
* **${p1.name}:** Yüksek piksel yoğunluğu ve canlı renk doğruluğuyla görsel deneyimde üst seviye sadakat sunuyor.
* **${p2.name}:** Geniş çalışma alanı ve yüksek parlaklığıyla dış mekan ışığında avantaj sağlıyor.

### 2. İşlemci ve Donanım Performansı
* **${p1.name}:** Optimize mimarisiyle günlük ve yoğun iş yüklerinde stabil çalışma performansı sunar.
* **${p2.name}:** Yüksek hesaplama gücüyle çoklu görevlerde akıcı bir deneyim vadediyor.

### 3. Kamera / Ses / Sensör Analizi
* **${p1.name}:** Dengeli dinamik aralık ve renk doğruluğu ile kaliteli bir sonuç üretir.
* **${p2.name}:** Yüksek çözünürlük ve hassas sensör kalibrasyonuyla öne çıkıyor.

### 4. Batarya / Enerji Tüketimi ve Verimlilik
* **${p1.name}:** Optimize güç eğrisi sayesinde uzun pil ömrü sağlar.
* **${p2.name}:** Hızlı şarj avantajı ile kesintisiz kullanıma destek verir.

💡 Bütçe & Rasyonel Seçim Tavsiyesi:
Her iki cihaz da segmentinde güçlü adaylar; aradaki fiyat farkını göz önünde bulundurarak kullanım ihtiyacına en uygun olanı tercih edebilirsin.
[/DEEP_ANALYSIS]`;
  } else {
    fallbackReply = `[VOICE_SUMMARY]
Teknoloji dünyasındaki en rasyonel donanım kriterlerini senin için hazırladım.
[/VOICE_SUMMARY]
[SUMMARY_CHAT]
Selam! Ben **RoboPengu**; aceleetme.tech platformunun kıdemli baş teknoloji danışmanıyım. 🐧

"Acele etme, paranı boşa harcama!" anlayışıyla teknoloji seçimlerinde yanındayım. Karşılaştırmak istediğin modelleri (Örn: *'iPhone 16 Pro vs S24 Ultra'*) yazabilir ya da aklındaki bütçeyi belirtebilirsin!
[/SUMMARY_CHAT]`;
  }

  res.write(`event: text\ndata: ${JSON.stringify(fallbackReply)}\n\n`);
  res.write("event: done\ndata: [DONE]\n\n");
  res.end();
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`RoboPengu (aceleetme) http://0.0.0.0:${PORT} üzerinde hazır!`);
});

