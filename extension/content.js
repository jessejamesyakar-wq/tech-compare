// extension/content.js
//
// aceleEtme Fiyat Kıyaslayıcı - İçerik Betiği
//
// Kullanıcı Hepsiburada / Trendyol / MediaMarkt / Vatan Bilgisayar'da bir ürün
// sayfasındayken çalışır. Sayfadan ürün adını çıkarır, aceleEtme'nin
// /api/compare endpoint'ine sorar ve sonucu küçük bir widget olarak gösterir.

const ACELEETME_API_BASE = "https://aceleetme.com";

function cleanTitle(raw) {
  if (!raw) return "";
  return raw
    .replace(/ - Hepsiburada.*/i, "")
    .replace(/ \| Trendyol.*/i, "")
    .replace(/ - MediaMarkt.*/i, "")
    .replace(/ - Vatan Bilgisayar.*/i, "")
    .replace(/Fiyatı, Yorumları.*/i, "")
    .replace(/Satın Al.*/i, "")
    .trim();
}

function extractProductName() {
  // 1. Mağaza-özel seçiciler
  const hostname = window.location.hostname;

  if (hostname.includes("hepsiburada.com")) {
    const hbTitle = document.querySelector('h1[data-test-id="title"]') || document.querySelector("header h1") || document.querySelector("h1");
    if (hbTitle?.textContent?.trim()) return cleanTitle(hbTitle.textContent);
  }

  if (hostname.includes("trendyol.com")) {
    const tyTitle = document.querySelector("h1.pr-new-br") || document.querySelector("h1.product-name") || document.querySelector("h1");
    if (tyTitle?.textContent?.trim()) return cleanTitle(tyTitle.textContent);
  }

  if (hostname.includes("mediamarkt.com.tr")) {
    const mmTitle = document.querySelector('h1[data-test="product-title"]') || document.querySelector("h1");
    if (mmTitle?.textContent?.trim()) return cleanTitle(mmTitle.textContent);
  }

  if (hostname.includes("vatanbilgisayar.com")) {
    const vatanTitle = document.querySelector("h1.product-list__product-name") || document.querySelector("h1");
    if (vatanTitle?.textContent?.trim()) return cleanTitle(vatanTitle.textContent);
  }

  // 2. OpenGraph Meta Etiketi
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle?.getAttribute("content")) {
    return cleanTitle(ogTitle.getAttribute("content"));
  }

  // 3. Standart H1
  const h1 = document.querySelector("h1");
  if (h1?.textContent?.trim()) {
    return cleanTitle(h1.textContent);
  }

  // 4. Belge Başlığı (Title)
  return cleanTitle(document.title);
}

function isLikelyProductPage() {
  const url = window.location.href;
  const path = window.location.pathname;

  // URL kalıpları
  if (path.includes("-p-") || path.includes("/urun/") || path.includes("/p/") || path.includes("-pm-") || path.includes(".html")) {
    return true;
  }

  // Sayfa metninde fiyat varlığı kontrolü
  const bodyText = document.body?.innerText || "";
  return /(\₺|TL)\s?[\d.,]+/.test(bodyText.slice(0, 8000));
}

async function fetchComparison(productName) {
  try {
    const res = await fetch(
      `${ACELEETME_API_BASE}/api/compare?q=${encodeURIComponent(productName)}`
    );
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn("[aceleEtme Extension] Karşılaştırma isteği başarısız:", err);
    return null;
  }
}

function renderWidget(data, productName) {
  if (document.getElementById("aceleetme-widget")) return;

  const widget = document.createElement("div");
  widget.id = "aceleetme-widget";

  if (!data || !data.match) {
    // Eşleşme yoksa kullanıcıyı rahatsız etmemek için sessiz kalabiliriz veya minimal bilgi verebiliriz
    return;
  }

  const { productName: matchedName, bestPrice, bestStore, aceleetmeUrl, allPrices } = data.match;

  const priceRows = (allPrices || [])
    .map(
      (p) => `
      <div class="aceleetme-row">
        <span>${p.store}</span>
        <span class="aceleetme-price">${p.price.toLocaleString("tr-TR")} ₺</span>
      </div>`
    )
    .join("");

  widget.innerHTML = `
    <div class="aceleetme-header">
      <span>⚡ aceleEtme Fiyat Radarı</span>
      <button class="aceleetme-close" aria-label="Kapat">✕</button>
    </div>
    <div class="aceleetme-body">
      <div class="aceleetme-product-name" title="${matchedName}">${matchedName}</div>
      <div class="aceleetme-best">
        En Düşük Fiyat: <strong>${bestPrice.toLocaleString("tr-TR")} ₺</strong> (${bestStore})
      </div>
      <div class="aceleetme-list">${priceRows}</div>
      <a href="${aceleetmeUrl}" target="_blank" rel="noopener noreferrer" class="aceleetme-cta">
        Tüm Mağazaları Karşılaştır →
      </a>
    </div>
  `;

  document.body.appendChild(widget);

  widget.querySelector(".aceleetme-close")?.addEventListener("click", () => {
    widget.remove();
  });
}

(async function init() {
  // Sayfa tamamen yüklendikten sonra çalış
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }

  async function run() {
    if (!isLikelyProductPage()) return;

    // SPA navigasyonları veya gecikmeli render için 1 saniye bekle
    setTimeout(async () => {
      const productName = extractProductName();
      if (!productName || productName.length < 3) return;

      const data = await fetchComparison(productName);
      if (data?.match) {
        renderWidget(data, productName);
      }
    }, 1000);
  }
})();
