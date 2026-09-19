// scripts/test-asama1-regressions.ts
/**
 * Aşama 1 Regresyon ve Doğrulama Test Paketi
 *
 * Test edilen senaryolar:
 * 1. "20.000 TL bütçeyle pili uzun giden bir telefon arıyorum. Sitedeki iki modeli güncel fiyatları ve kaynaklarıyla karşılaştır."
 *    -> "kaynaklarıyla" veya TV sahte ürünü ASLA oluşmamalı, 20.000 TL bütçeye uygun gerçek telefon önerileri dönmeli.
 * 2. Model alt dizesi çakışması: "iPhone 17 Pro Max" tek ürününden "iPhone 17 Pro" ikinci ürün olarak türetilmemeli.
 *    Gerçekten "iPhone 17 Pro Max ile iPhone 17 Pro" dendiğinde ise iki model de ayrıştırılmalı.
 * 3. Katalogda olmayan model (örn: Nokia 3310 vs iPhone 16) -> Başarısızlık dönmeli, sahte panel oluşturulmamalı.
 * 4. Farklı kategoriler (örn: Telefon vs TV) -> Kategori uyuşmazlığı hatası dönmeli, doğrudan kıyaslanmamalı.
 * 5. Aynı ürünü kendisiyle kıyaslama (örn: iPhone 16 vs iPhone 16) -> Reddedilmeli.
 * 6. Eşit değerler: 45W vs 45W şarj -> Beraberlik (tie) dönmeli, +0W veya 2. ürün kazanmamalı.
 * 7. PPI farkı: 500 PPI - 460 PPI -> Tam olarak 40 PPI olmalı (+45 sabit dize değil).
 * 8. Geçerli aynı kategori çifti (örn: iPhone 16 Pro Max ile Galaxy S24 Ultra) -> Başarılı çözümlenmeli.
 */

import {
  tryExtractComparisonFromMessage,
  resolveCompareProducts,
  createDynamicComparisonPanel,
  extractBudgetFromText,
  resolveBudgetRecommendation,
  extractModelCodes,
} from "../src/lib/ai/resolvers";
import { getStoredProducts } from "../src/lib/adminData";
import {
  calculatePpiComparison,
  calculateWattComparison,
  getWirelessChargingText,
  getWirelessWinner,
  getProductScore,
  calculateOverallDuelWinner,
  getDuelRefereeVerdictText,
} from "../src/lib/compareMetrics";
import { getProductById } from "../src/lib/data";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}${detail ? ` -> ${detail}` : ""}`);
    failedCount++;
  }
}

console.log("=================================================");
console.log("🚀 ACELEETME AŞAMA 1 REGRESYON VE DOĞRULAMA TESTLERİ");
console.log("=================================================\n");

// TEST 1: Tekrarlanan Hedef Hata Cümlesi
console.log("Test 1: Hedef Hata Cümlesi Çözümlemesi");
const targetPrompt = "20.000 TL bütçeyle pili uzun giden bir telefon arıyorum. Sitedeki iki modeli güncel fiyatları ve kaynaklarıyla karşılaştır.";

const extractedComp = tryExtractComparisonFromMessage(targetPrompt);
assert(
  extractedComp === null,
  "Hedef cümleden sahte ürün adayları ('kaynaklarıyla', 'güncel fiyatları') çıkarılmamalı",
  `Alınan: ${JSON.stringify(extractedComp)}`
);

const budget = extractBudgetFromText(targetPrompt);
assert(
  budget !== null && budget.budget === 20000,
  "20.000 TL bütçe bilgisi doğru tespit edilmeli",
  `Alınan bütçe: ${JSON.stringify(budget)}`
);

const budgetRec = resolveBudgetRecommendation(20000, "smartphones");
assert(
  budgetRec.ok && Array.isArray(budgetRec.data?.products) && budgetRec.data.products.length > 0,
  "20.000 TL bütçeye uygun gerçek telefon önerileri getirilmeli"
);
if (budgetRec.data?.products) {
  const allPhones = budgetRec.data.products.every(
    (p: any) => p.category === "smartphones" || p.category === "phones"
  );
  assert(allPhones, "Önerilen tüm ürünler telefon kategorisinde olmalı (TV veya başka kategori olmamalı)");
  const noFakeNames = budgetRec.data.products.every(
    (p: any) => !p.name.toLowerCase().includes("kaynaklar") && !p.id.includes("kaynaklar")
  );
  assert(noFakeNames, "'kaynaklarıyla' adlı sahte ürün kesinlikle yer almamalı");
}

const fakePanelAttempt = createDynamicComparisonPanel(["güncel fiyatları", "kaynaklarıyla"]);
assert(
  fakePanelAttempt === null,
  "Katalog dışı serbest metinlerle createDynamicComparisonPanel ASLA sahte panel ve URL üretmemeli (null dönmeli)",
  `Alınan: ${JSON.stringify(fakePanelAttempt)}`
);

// TEST 2: Alt Dize Model Çakışması (Overlap / Substring Collision)
console.log("\nTest 2: Model Alt Dize Çakışma Kontrolü");
const singleModelMsg = "iphone 17 pro max almak istiyorum";
const singleExtracted = tryExtractComparisonFromMessage(singleModelMsg);
assert(
  singleExtracted === null,
  "Tek 'iPhone 17 Pro Max' içeren mesajdan 'iPhone 17 Pro' ikinci ürün olarak türetilmemeli",
  `Alınan: ${JSON.stringify(singleExtracted)}`
);

const realTwoModelMsg = "iPhone 17 Pro Max ile iPhone 17 Pro karşılaştır";
const twoExtracted = tryExtractComparisonFromMessage(realTwoModelMsg);
assert(
  twoExtracted !== null &&
  twoExtracted.length === 2 &&
  twoExtracted[0] === "iPhone 17 Pro Max" &&
  twoExtracted[1] === "iPhone 17 Pro",
  "Gerçekten iki farklı varyant ('iPhone 17 Pro Max' ve 'iPhone 17 Pro') belirtildiğinde ikisi de yakalanmalı",
  `Alınan: ${JSON.stringify(twoExtracted)}`
);

// TEST 3: Katalog Dışı Model İsteği
console.log("\nTest 3: Katalog Dışı Model İsteği");
const nonCatalogRes = resolveCompareProducts(["Nokia 3310 Efsane", "iPhone 16"]);
assert(
  !nonCatalogRes.ok,
  "Katalogda bulunmayan model için resolveCompareProducts başarısızlık (ok: false) dönmeli"
);
const nonCatalogPanel = createDynamicComparisonPanel(["Nokia 3310 Efsane", "iPhone 16"]);
assert(
  nonCatalogPanel === null,
  "Katalogda bulunmayan ürün için panel oluşturulmamalı (null dönmeli)"
);

// TEST 4: Farklı Kategori Kıyaslama Koruması
console.log("\nTest 4: Farklı Kategori Çapraz Kıyaslama Engeli");
const catalog = getStoredProducts();
const phone = catalog.find((p) => p.category === "smartphones" || (p.category as string) === "phones");
const tv = catalog.find((p) => p.category === "tvs");

if (phone && tv) {
  const crossCatRes = resolveCompareProducts([phone.id, tv.id]);
  assert(
    !crossCatRes.ok && (crossCatRes.message?.includes("farklı kategorilerden") ?? false),
    "Telefon ile TV kıyaslanmak istendiğinde kategori uyuşmazlığı hatası dönmeli"
  );
  const crossCatPanel = createDynamicComparisonPanel([phone.name, tv.name]);
  assert(
    crossCatPanel === null,
    "Farklı kategoriler için dinamik panel oluşturulmamalı"
  );
} else {
  console.log("  ⚠️ [SKIP] Katalogda telefon veya TV bulunamadı.");
}

// TEST 5: Aynı Ürünü Kendisiyle Kıyaslama (Duplicate Protection)
console.log("\nTest 5: Aynı Ürünü Kendisiyle Kıyaslama Engeli");
if (phone) {
  const selfCompRes = resolveCompareProducts([phone.id, phone.id]);
  assert(
    !selfCompRes.ok,
    "Aynı ürünü kendisiyle kıyaslama isteği reddedilmeli"
  );
}

// TEST 6 & 7: Gerçek Uygulama Karşılaştırma Fonksiyonları (PPI & Şarj Gücü & Eşitlik)
console.log("\nTest 6 & 7: Ortak Karşılaştırma Fonksiyonları (calculatePpiComparison & calculateWattComparison)");
const ppiCompResult = calculatePpiComparison(500, 460);
assert(
  ppiCompResult.diff === 40,
  "calculatePpiComparison(500, 460) farkı tam olarak 40 olmalı (sabit +45 değil)",
  `Alınan fark: ${ppiCompResult.diff}`
);
assert(
  ppiCompResult.winner === 1 && ppiCompResult.advantage === "+40 PPI Daha Keskin",
  "calculatePpiComparison(500, 460) 1. ürünü kazanan ve '+40 PPI Daha Keskin' dönmeli",
  `Alınan: ${JSON.stringify(ppiCompResult)}`
);

const ppiTieResult = calculatePpiComparison(460, 460);
assert(
  ppiTieResult.winner === "tie" && ppiTieResult.advantage === "Eşit Piksel Yoğunluğu",
  "calculatePpiComparison(460, 460) 'tie' ve 'Eşit Piksel Yoğunluğu' dönmeli",
  `Alınan: ${JSON.stringify(ppiTieResult)}`
);

const wattCompTie = calculateWattComparison(45, 45);
assert(
  wattCompTie.winner === "tie" && wattCompTie.advantage === "Eşit Şarj Gücü",
  "calculateWattComparison(45, 45) 'tie' ve 'Eşit Şarj Gücü' dönmeli",
  `Alınan: ${JSON.stringify(wattCompTie)}`
);

const wattCompDiff = calculateWattComparison(65, 30);
assert(
  wattCompDiff.winner === 1 && wattCompDiff.advantage === "+35W Daha Yüksek Şarj Gücü",
  "calculateWattComparison(65, 30) 1. ürünü kazanan ve '+35W Daha Yüksek Şarj Gücü' dönmeli",
  `Alınan: ${JSON.stringify(wattCompDiff)}`
);

// TEST 8: Alfanümerik Model Kodu Koruması (Samsung Galaxy S999 Ultra -> S20 Ultra'ya EŞLEŞMEMELİ)
console.log("\nTest 8: Alfanümerik Model Kodu Koruması (S999 -> S20 Ultra sapması engeli)");
const s999Codes = extractModelCodes("Samsung Galaxy S999 Ultra");
assert(
  s999Codes.includes("s999"),
  "extractModelCodes 'Samsung Galaxy S999 Ultra' içinden 's999' alfanümerik kodunu yakalamalı",
  `Alınan kodlar: ${JSON.stringify(s999Codes)}`
);

const s999CompareRes = resolveCompareProducts(["Samsung Galaxy S999 Ultra", "iPhone 16"]);
assert(
  !s999CompareRes.ok,
  "resolveCompareProducts(['Samsung Galaxy S999 Ultra', 'iPhone 16']) BAŞARISIZ (ok: false) dönmeli, ASLA S20 Ultra seçmemeli"
);
if (s999CompareRes.ok && (s999CompareRes as any).data?.products) {
  const chosenNames = (s999CompareRes as any).data.products.map((p: any) => p.name);
  assert(
    !chosenNames.some((n: string) => n.toLowerCase().includes("s20")),
    "Katalogda olmayan S999 modeli S20 Ultra'ya yönlendirilmemeli!",
    `Seçilenler: ${chosenNames.join(", ")}`
  );
}

// TEST 9: Açıkça İstenen Kapasite Katalogda Yoksa Başka Kapasite Seçilmeme Kuralı (iPhone 17 Pro Max 8 TB)
console.log("\nTest 9: Olmayan Açık Kapasite Koruması (8 TB -> 2 TB sapması engeli)");
const capacity8TBRes = resolveCompareProducts(["iPhone 17 Pro Max 8 TB", "iPhone 17 Pro 512 GB"]);
assert(
  !capacity8TBRes.ok,
  "resolveCompareProducts(['iPhone 17 Pro Max 8 TB', 'iPhone 17 Pro 512 GB']) BAŞARISIZ (ok: false) dönmeli, ASLA 2 TB seçmemeli"
);
assert(
  capacity8TBRes.message !== undefined &&
  (capacity8TBRes.message.includes("8TB") || capacity8TBRes.message.includes("8 TB") || capacity8TBRes.message.includes("kapasite") || capacity8TBRes.message.includes("bulamadım")),
  "Kapasite bulunamadığında kullanıcıya alternatif kapasiteler veya bulunamadı uyarısı dönmeli",
  `Mesaj: ${capacity8TBRes.message}`
);

// TEST 10 & 11: Mevcut Kapasite İsteklerinin Doğru Varyantı Seçmesi
console.log("\nTest 10 & 11: Mevcut Kapasite İsteklerinin Doğrulanması (256 GB & 512 GB)");
const storageMsg = "iPhone 17 Pro Max 256 GB ile iPhone 17 Pro 512 GB karşılaştır";
const storageExtracted = tryExtractComparisonFromMessage(storageMsg);
assert(
  storageExtracted !== null &&
  storageExtracted.length === 2 &&
  storageExtracted[0] === "iPhone 17 Pro Max 256 GB" &&
  storageExtracted[1] === "iPhone 17 Pro 512 GB",
  "Karşılaştırma ayrıştırmada 256 GB ve 512 GB kapasite bilgileri korunmalı",
  `Alınan: ${JSON.stringify(storageExtracted)}`
);

if (storageExtracted && storageExtracted.length === 2) {
  const storageResolved = resolveCompareProducts(storageExtracted);
  assert(
    storageResolved.ok && storageResolved.data?.products.length === 2,
    "256 GB ve 512 GB varyantları katalogda başarıyla çözümlenmeli"
  );
  if (storageResolved.ok && storageResolved.data?.products) {
    const pA = storageResolved.data.products[0];
    const pB = storageResolved.data.products[1];
    assert(
      pA.name.includes("256 GB") || (pA.storage && pA.storage.includes("256")),
      `1. ürün 256 GB olmalı, 2 TB'a sapmamalı (Alınan: ${pA.name})`
    );
    assert(
      pB.name.includes("512 GB") || (pB.storage && pB.storage.includes("512")),
      `2. ürün 512 GB olmalı, 1 TB'a sapmamalı (Alınan: ${pB.name})`
    );
  }
}

// TEST 12: Bütçe Sınırının Korunması
console.log("\nTest 12: Bütçe Sınırının Korunması");
const budget20k = resolveBudgetRecommendation(20000, "smartphones");
assert(
  budget20k.ok && Array.isArray(budget20k.data?.products),
  "resolveBudgetRecommendation 20000 TL için başarılı sonuç dönmeli"
);
if (budget20k.ok && budget20k.data) {
  const overBudgetInMain = budget20k.data.products.filter((p: any) => {
    const price = typeof p.price === "number" ? p.price : (p.basePrice || 0);
    return price > 20000;
  });
  assert(
    overBudgetInMain.length === 0,
    "Ana ürün öneri listesinde 20.000 TL üstünde hiçbir ürün olmamalı",
    `Bütçe üstü bulunan: ${overBudgetInMain.map((p: any) => `${p.name}: ${p.price}`).join(", ")}`
  );

  const overBudgetAlts = budget20k.data.overBudgetAlternatives || [];
  assert(
    overBudgetAlts.length > 0,
    "20.000 TL bütçenin biraz üzerindeki ürünler ayrı 'overBudgetAlternatives' alanında etiketli sunulmalı"
  );
}

// TEST 13: Kablosuz Şarj Metni ve Kazanan Doğrulaması (false vs undefined Ayrımı)
console.log("\nTest 13: Kablosuz Şarj (specs.battery.wirelessCharging = false vs undefined Ayrımı)");
const textFalse = getWirelessChargingText(false);
assert(
  textFalse === "Kablosuz Şarj Desteği Yok",
  "specs.battery.wirelessCharging = false durumunda render edilen metin 'Kablosuz Şarj Desteği Yok' olmalı",
  `Alınan: '${textFalse}'`
);

const textUndefined = getWirelessChargingText(undefined);
assert(
  textUndefined === "Doğrulanmış veri yok",
  "specs.battery.wirelessCharging = undefined durumunda render edilen metin 'Doğrulanmış veri yok' olmalı (destek yok yazılmamalı)",
  `Alınan: '${textUndefined}'`
);

const textTrueWithWatts = getWirelessChargingText(true, 15);
assert(
  textTrueWithWatts === "15W Kablosuz Şarj",
  "specs.battery.wirelessCharging = true ve 15W durumunda '15W Kablosuz Şarj' render edilmeli",
  `Alınan: '${textTrueWithWatts}'`
);

const winnerWithUndefined = getWirelessWinner(false, undefined);
assert(
  winnerWithUndefined === undefined,
  "Biri false, diğeri undefined olduğunda kazanan ilan edilmemeli (undefined dönmeli, çünkü undefined ≠ false)",
  `Alınan: ${winnerWithUndefined}`
);

const winnerTrueVsFalse = getWirelessWinner(true, false);
assert(
  winnerTrueVsFalse === 1,
  "1. ürün true, 2. ürün false iken 1. ürün kazanan olmalı",
  `Alınan: ${winnerTrueVsFalse}`
);

const winnerFalseVsFalse = getWirelessWinner(false, false);
assert(
  winnerFalseVsFalse === "tie",
  "İki ürün de false iken 'tie' dönmeli",
  `Alınan: ${winnerFalseVsFalse}`
);

// TEST 14: DuelArena Rating Fallback ve Yetersiz Veri Doğrulaması
console.log("\nTest 14: DuelArena Puan & Yetersiz Veri Mantığı (insufficient_data durumu)");
const scoreUnrated1 = getProductScore({});
const scoreUnrated2 = getProductScore({});
assert(
  scoreUnrated1 === null && scoreUnrated2 === null,
  "Derecelendirmesi olmayan ürünler için getProductScore null dönmeli (asla 4.8 veya 4.7 uydurulmamalı)",
  `Alınan: score1=${scoreUnrated1}, score2=${scoreUnrated2}`
);

// calculateOverallDuelWinner(null, null) -> 'insufficient_data'
const winnerBothNull = calculateOverallDuelWinner(null, null);
assert(
  winnerBothNull === "insufficient_data",
  "calculateOverallDuelWinner(null, null) 'insufficient_data' dönmeli (kazanan veya beraberlik döndürmemeli)",
  `Alınan: ${winnerBothNull}`
);

// calculateOverallDuelWinner(96, null) -> 'insufficient_data'
const winnerP1Only = calculateOverallDuelWinner(96, null);
assert(
  winnerP1Only === "insufficient_data",
  "calculateOverallDuelWinner(96, null) 'insufficient_data' dönmeli (tek taraflı veriyle kazanan üretmemeli)",
  `Alınan: ${winnerP1Only}`
);

// calculateOverallDuelWinner(null, 96) -> 'insufficient_data'
const winnerP2Only = calculateOverallDuelWinner(null, 96);
assert(
  winnerP2Only === "insufficient_data",
  "calculateOverallDuelWinner(null, 96) 'insufficient_data' dönmeli (tek taraflı veriyle kazanan üretmemeli)",
  `Alınan: ${winnerP2Only}`
);

// DuelArena'da render edilen hakem metni kontrolü
const textInsufficient = getDuelRefereeVerdictText("insufficient_data", "Model A", "Model B");
assert(
  textInsufficient === "Genel kazananı belirlemek için yeterli doğrulanmış puan yok",
  "insufficient_data durumunda Hakem metni tam olarak 'Genel kazananı belirlemek için yeterli doğrulanmış puan yok' olmalı",
  `Alınan: '${textInsufficient}'`
);
assert(
  !textInsufficient.includes("başa baş") && !textInsufficient.includes("üstün") && !textInsufficient.includes("🏆"),
  "insufficient_data durumunda 'başa baş', 'üstün' veya kupa emojisi içermemeli"
);

// İki geçerli ve karşılaştırılabilir puan eşitse beraberlik (tie)
const scoreRatedA = getProductScore({ rating: 4.8 }); // 96
const scoreRatedB = getProductScore({ rating: 4.8 }); // 96
assert(
  scoreRatedA === 96 && scoreRatedB === 96,
  "Gerçek 4.8 rating değeri 96/100 olarak doğru hesaplanmalı",
  `Alınan: ${scoreRatedA}, ${scoreRatedB}`
);

const winnerEqualScores = calculateOverallDuelWinner(scoreRatedA, scoreRatedB);
assert(
  winnerEqualScores === "tie",
  "İki geçerli ve eşit puan (96, 96) için calculateOverallDuelWinner 'tie' (beraberlik) dönmeli",
  `Alınan: ${winnerEqualScores}`
);

const textTie = getDuelRefereeVerdictText("tie", "Model A", "Model B");
assert(
  textTie.includes("başa baş"),
  "Geçerli puanların eşitliği (tie) durumunda Hakem metni 'başa baş' ifadesini içermeli",
  `Alınan: '${textTie}'`
);

// İki geçerli farklı puan (96 vs 80)
const winnerA = calculateOverallDuelWinner(96, 80);
assert(
  winnerA === 1,
  "İki geçerli puandan yüksek olan (96 > 80) kazanan 1 olmalı",
  `Alınan: ${winnerA}`
);
const textWinner1 = getDuelRefereeVerdictText(1, "iPhone 16", "Galaxy S24");
assert(
  textWinner1.includes("🏆") && textWinner1.includes("iPhone 16"),
  "1. ürün kazandığında kupa ve ürün adıyla üstünlük belirtilmeli",
  `Alınan: '${textWinner1}'`
);

// TEST 15 & 16: Model Çözümleme Sınırları (iphone-16-pro & samsung-galaxy-s2)
console.log("\nTest 15 & 16: Gerçek Çözümleyici Model Sınırları (iphone-16-pro & samsung-galaxy-s2)");
const ip16ProRes = getProductById("iphone-16-pro");
assert(
  ip16ProRes !== null && ip16ProRes.name.includes("iPhone 16 Pro") && !ip16ProRes.name.includes("Pro Max"),
  "getProductById('iphone-16-pro') kesinlikle iPhone 16 Pro dönmeli (asla Pro Max'e sapmamalı)",
  `Alınan: ${ip16ProRes?.name}`
);

const s2Res = getProductById("samsung-galaxy-s2");
assert(
  s2Res === null,
  "getProductById('samsung-galaxy-s2') null dönmeli (asla S20 veya S20 Ultra'ya sapmamalı)",
  `Alınan: ${s2Res?.name}`
);

console.log(`📊 TEST SONUÇLARI: ${passedCount} Başarılı, ${failedCount} Başarısız`);
console.log("=================================================");

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
