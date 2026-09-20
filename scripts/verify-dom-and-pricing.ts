import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { NextRequest } from 'next/server';
import { evaluateProductPricing } from '../src/lib/pricing/unifiedPriceEvaluator';
import { resolveBudgetRecommendation } from '../src/lib/ai/resolvers';
import { saveProduct, deleteProduct, getStoredProducts } from '../src/lib/adminData';
import { getProductById } from '../src/lib/data';
import { POST as testInjectRoutePOST, DELETE as testInjectRouteDELETE } from '../src/app/api/test-inject-products/route';
import { performFullStateCleanup } from './testCleanupHelper';

async function runStrictVerificationSuite() {
  console.log('================================================================');
  console.log('🛡️  ORTAK FİYAT BİLEŞEN VE DOM DOĞRULAMA TEST PAKETİ');
  console.log('================================================================\n');

  // Resolve TEST_INJECTION_KEY (Must throw explicit error if missing)
  if (!process.env.TEST_INJECTION_KEY) {
    try {
      const envLocal = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf-8');
      const match = envLocal.match(/TEST_INJECTION_KEY=(.+)/);
      if (match) process.env.TEST_INJECTION_KEY = match[1].trim();
    } catch {}
  }

  const TEST_KEY = process.env.TEST_INJECTION_KEY;
  if (!TEST_KEY || TEST_KEY.trim() === '') {
    throw new Error('❌ KESİN HATA: TEST_INJECTION_KEY ortam değişkeni tanımlı değil! Test altyapısı çalıştırılamadı.');
  }

  // Tracking setup for initial state restoration assurance
  const injectedProductIds = new Set<string>();
  const preExistingCatalogSnapshot = getStoredProducts().map((p) => p.id);
  const preExistingCatalogSnapshotCount = preExistingCatalogSnapshot.length;

  let prodGatePassed = false;
  let securityGatePassed = false;
  let realApiCheckPassed = false;
  let serverMemoryCleanupPassed = false;
  let localMemoryCleanupPassed = false;

  // Compute dynamic expected date string for stale offers (48h ago) formatted in tr-TR
  const now = Date.now();
  const freshDateStr = new Date(now - 2 * 60 * 60 * 1000).toISOString(); // 2h old
  const staleDateObj = new Date(now - 48 * 60 * 60 * 1000); // 48h old
  const staleDateStr = staleDateObj.toISOString();
  const expectedStaleDateFormatted = staleDateObj.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  console.log(`ℹ️  Dinamik Hesaplanan Test Saatleri:`);
  console.log(`   - Fresh Teklif Tarihi : ${freshDateStr}`);
  console.log(`   - Stale Teklif Tarihi : ${staleDateStr}`);
  console.log(`   - Beklenen Stale Etiket Tarihi: "${expectedStaleDateFormatted}"\n`);

  // Controlled mock dataset definition (with rating: 9999 to prioritize on list page rendering)
  const mockFresh = {
    id: 'mock-fresh-phone',
    slug: 'mock-fresh-phone',
    name: 'Mock Fresh Phone 256 GB',
    brand: 'MockBrand',
    category: 'smartphones',
    basePrice: 50000,
    price: 42000,
    currency: 'TL',
    rating: 9999,
    isPopular: true,
    isFeatured: true,
    storeOffers: [
      {
        storeName: 'Hepsiburada',
        price: 42000,
        inStock: true,
        lastCheckedAt: freshDateStr,
        url: 'https://hepsiburada.com/mock-fresh',
      },
    ],
  };

  const mockStale = {
    id: 'mock-stale-phone',
    slug: 'mock-stale-phone',
    name: 'Mock Stale Phone 256 GB',
    brand: 'MockBrand',
    category: 'smartphones',
    basePrice: 50000,
    price: 42000,
    currency: 'TL',
    rating: 9999,
    isPopular: true,
    isFeatured: true,
    storeOffers: [
      {
        storeName: 'Hepsiburada',
        price: 42000,
        inStock: true,
        lastCheckedAt: staleDateStr,
        url: 'https://hepsiburada.com/mock-stale',
      },
    ],
  };

  const mockNoOffer = {
    id: 'mock-no-offer-phone',
    slug: 'mock-no-offer-phone',
    name: 'Mock No Offer Phone 256 GB',
    brand: 'MockBrand',
    category: 'smartphones',
    sourceType: 'unverified',
    basePrice: 50000,
    price: 50000,
    currency: 'TL',
    rating: 9999,
    isPopular: true,
    isFeatured: true,
    storeOffers: [],
  };

  // Surface x Scenario Matrix Trackers (Isolated by surface & type)
  const realMatrix: Record<string, { fresh: boolean; stale: boolean; noOffer: boolean }> = {
    '1. Liste Ekranı (/phones)': { fresh: false, stale: false, noOffer: false },
    '2. Ürün Detay Header': { fresh: false, stale: false, noOffer: false },
    '3. Yapışkan Header Bar': { fresh: false, stale: false, noOffer: false },
  };

  const mockMatrix: Record<string, { fresh: boolean; stale: boolean; noOffer: boolean }> = {
    '4. Arama UI (/search) (Arayüz)': { fresh: false, stale: false, noOffer: false },
    '5. Chat Öneri Kartı (AI) (Arayüz)': { fresh: false, stale: false, noOffer: false },
  };

  try {
    // ==========================================================================
    // BÖLÜM 1: BİRİM TESTLERİ (Unit Tests - Fiyat Mantığı ve Kurallar)
    // ==========================================================================
    console.log('PART 1: Birim Testleri (Unit Tests - Fiyat Mantığı ve Kurallar)\n');

    // Birim Test 1.1: Fresh Teklif (<= 24 Saat)
    const evalFresh = evaluateProductPricing(mockFresh as any);
    assert.equal(evalFresh.currentPrice, 42000, 'Birim Test 1.1: Fresh currentPrice 42000 olmalı');
    assert.equal(evalFresh.priceStatus, 'fresh', 'Birim Test 1.1: Fresh priceStatus "fresh" olmalı');
    assert.equal(evalFresh.statusLabel, 'Güncel Fiyat', 'Birim Test 1.1: Fresh statusLabel "Güncel Fiyat" olmalı');
    console.log('  ✅ Birim Test 1.1 Geçti: Fresh teklif (<=24h) -> currentPrice: 42.000 TL, statusLabel: "Güncel Fiyat"');

    // Birim Test 1.2: Stale Teklif (48 Saatlik)
    const evalStale = evaluateProductPricing(mockStale as any);
    assert.equal(evalStale.currentPrice, null, 'Birim Test 1.2: 48h teklifte currentPrice KESİNLİKLE null olmalı');
    assert.equal(evalStale.lastSeenPrice, 42000, 'Birim Test 1.2: 48h teklifte lastSeenPrice 42000 olmalı');
    assert.equal(evalStale.priceStatus, 'stale', 'Birim Test 1.2: 48h teklifte priceStatus "stale" olmalı');
    assert.equal(
      evalStale.statusLabel,
      `Son görülen fiyat: ${expectedStaleDateFormatted}`,
      `Birim Test 1.2: statusLabel tam tarih içermeli ("Son görülen fiyat: ${expectedStaleDateFormatted}")`
    );
    console.log(`  ✅ Birim Test 1.2 Geçti: Stale teklif (48h) -> currentPrice: null, lastSeenPrice: 42.000 TL, statusLabel: "${evalStale.statusLabel}"`);

    // Birim Test 1.3: Teklif Yok (Unverified / BasePrice Referansı)
    const evalNoOffer = evaluateProductPricing(mockNoOffer as any);
    assert.equal(evalNoOffer.currentPrice, null, 'Birim Test 1.3: Teklif yokken currentPrice null olmalı');
    assert.equal(evalNoOffer.lastSeenPrice, null, 'Birim Test 1.3: Teklif yokken lastSeenPrice null olmalı');
    assert.equal(evalNoOffer.displayPrice, 50000, 'Birim Test 1.3: Katalog basePrice referansı 50000 TL olarak korunmalı');
    assert.equal(evalNoOffer.statusLabel, 'Fiyat doğrulanmadı', 'Birim Test 1.3: statusLabel "Fiyat doğrulanmadı" olmalı');
    console.log('  ✅ Birim Test 1.3 Geçti: Teklif yok (Unverified) -> currentPrice: null, displayPrice: 50.000 TL, statusLabel: "Fiyat doğrulanmadı"');


    // ==========================================================================
    // BÖLÜM 2: AI BÜTÇE ÇÖZÜMLEME TESTİ (resolveBudgetRecommendation Sınır Denetimi)
    // ==========================================================================
    console.log('\nPART 2: AI Bütçe Çözümleyici (resolveBudgetRecommendation) Sınır Denetimi Testi\n');

    const testProdA = {
      id: 'mock-unique-budget-fresh-50k',
      name: 'Test Unique Budget Fresh Phone',
      brand: 'TestBrand',
      category: 'smartphones',
      basePrice: 50000,
      storeOffers: [
        {
          storeName: 'Hepsiburada',
          price: 42000,
          inStock: true,
          lastCheckedAt: freshDateStr,
          url: 'https://hepsiburada.com/test-fresh',
        },
      ],
    };

    const testProdB = {
      id: 'mock-unique-budget-stale-48h',
      name: 'Test Unique Budget Stale Phone',
      brand: 'TestBrand',
      category: 'smartphones',
      basePrice: 50000,
      storeOffers: [
        {
          storeName: 'Hepsiburada',
          price: 42000,
          inStock: true,
          lastCheckedAt: staleDateStr,
          url: 'https://hepsiburada.com/test-stale',
        },
      ],
    };

    const testProdC = {
      id: 'mock-unique-budget-expensive-65k',
      name: 'Test Unique Budget Expensive Phone',
      brand: 'TestBrand',
      category: 'smartphones',
      basePrice: 70000,
      storeOffers: [
        {
          storeName: 'Hepsiburada',
          price: 65000,
          inStock: true,
          lastCheckedAt: freshDateStr,
          url: 'https://hepsiburada.com/test-exp',
        },
      ],
    };

    // Assert pre-existing non-existence
    assert.equal(getProductById(testProdA.id), null, `${testProdA.id} önceden bulunmamalı`);
    assert.equal(getProductById(testProdB.id), null, `${testProdB.id} önceden bulunmamalı`);
    assert.equal(getProductById(testProdC.id), null, `${testProdC.id} önceden bulunmamalı`);

    // Track for cleanup assurance from first injection
    injectedProductIds.add(testProdA.id);
    injectedProductIds.add(testProdB.id);
    injectedProductIds.add(testProdC.id);

    await saveProduct(testProdA as any);
    await saveProduct(testProdB as any);
    await saveProduct(testProdC as any);

    try {
      const budgetRes50k = resolveBudgetRecommendation(50000, 'smartphones');
      assert.ok(budgetRes50k.ok, 'AI Bütçe Testi: resolveBudgetRecommendation ok=true olmalı');
      assert.ok(Array.isArray(budgetRes50k.data?.products) && budgetRes50k.data!.products.length > 0, 'AI Bütçe Testi: Birincil öneri dizisi dönmeli');

      const primaryPicks = budgetRes50k.data!.products;

      for (const p of primaryPicks) {
        const pEval = evaluateProductPricing(p);
        assert.notEqual(pEval.currentPrice, null, `AI Bütçe Testi: Birincil öneri ${p.name} için currentPrice KESİNLİKLE null olmamalı`);
        assert.ok(pEval.currentPrice! <= 50000, `AI Bütçe Testi: Birincil öneri ${p.name} için currentPrice (${pEval.currentPrice} TL) bütçeyi (50.000 TL) aşmamalı`);
      }

      const hasProdA = primaryPicks.some((p) => p.id === testProdA.id);
      assert.ok(hasProdA, 'AI Bütçe Testi: Uygun güncel ürün (Product A) birincil öneriye girmeli');

      const hasProdB = primaryPicks.some((p) => p.id === testProdB.id);
      assert.ok(!hasProdB, 'AI Bütçe Testi: Eski teklifli ürün (Product B) birincil öneriye GİRMEMELİ');

      const hasProdC = primaryPicks.some((p) => p.id === testProdC.id);
      assert.ok(!hasProdC, 'AI Bütçe Testi: Bütçe üzeri ürün (Product C) birincil öneriye GİRMEMELİ');

      console.log('  ✅ AI Bütçe Sınır Denetimi Geçti: Yalnızca uygun güncel ürün (Product A) önerildi; eski (Product B) ve bütçe üzeri (Product C) elendi.');
    } finally {
      // Targeted cleanup for budget test without resetToFactoryDefault
      await deleteProduct(testProdA.id);
      await deleteProduct(testProdB.id);
      await deleteProduct(testProdC.id);
      injectedProductIds.delete(testProdA.id);
      injectedProductIds.delete(testProdB.id);
      injectedProductIds.delete(testProdC.id);
      assert.equal(getProductById(testProdA.id), null, `${testProdA.id} silinmiş olmalı`);
      assert.equal(getProductById(testProdB.id), null, `${testProdB.id} silinmiş olmalı`);
      assert.equal(getProductById(testProdC.id), null, `${testProdC.id} silinmiş olmalı`);
    }


    // ==========================================================================
    // BÖLÜM 3: CANLI ARAMA API HTTP PROJEKSİYON TESTİ (/api/search)
    // ==========================================================================
    console.log('\nPART 3: Canlı Arama API Uç Noktası HTTP Projeksiyon Testi (/api/search)\n');

    const searchRes = await fetch('http://localhost:3000/api/search?q=iphone');
    assert.equal(searchRes.status, 200, 'Arama API HTTP 200 dönmeli');
    const searchJson = await searchRes.json();
    assert.ok(Array.isArray(searchJson) && searchJson.length > 0, 'Arama API sonuç dizisi dönmeli');

    const firstItem = searchJson[0];
    assert.ok('currentPrice' in firstItem, 'Arama API sonucunda currentPrice alanı bulunmalı');
    assert.ok('lastSeenPrice' in firstItem, 'Arama API sonucunda lastSeenPrice alanı bulunmalı');
    assert.ok('priceStatus' in firstItem, 'Arama API sonucunda priceStatus alanı bulunmalı');
    assert.ok('statusLabel' in firstItem, 'Arama API sonucunda statusLabel alanı bulunmalı');
    realApiCheckPassed = true;
    console.log(`  ✅ Canlı Arama API HTTP Projeksiyon Testi Geçti: "${firstItem.name}" için currentPrice, lastSeenPrice, priceStatus ("${firstItem.priceStatus}"), statusLabel ("${firstItem.statusLabel}") eksiksiz aktarıldı.`);


    // ==========================================================================
    // BÖLÜM 0: TEST ALTYAPISI GÜVENLİK VE ERİŞİM ENGELİ DENETİMLERİ
    // ==========================================================================
    console.log('\nPART 0: Test Altyapısı Güvenlik ve Erişim Engeli Denetimleri\n');

    // 0.1. Production 404 Isolated Check (Simulating NODE_ENV=production)
    console.log('  0.1. Production 404 Uç Nokta Erişim Engeli Denetimi (POST & DELETE)...');
    const originalEnvNode = process.env.NODE_ENV;
    try {
      (process.env as any).NODE_ENV = 'production';

      const prodPostReq = new NextRequest('http://localhost:3000/api/test-inject-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-test-injection-key': TEST_KEY },
        body: JSON.stringify({ products: [mockFresh] }),
      });
      const prodPostRes = await testInjectRoutePOST(prodPostReq);
      assert.equal(prodPostRes.status, 404, 'Production ortamında POST 404 Not Found dönmeli');

      const prodDeleteReq = new NextRequest('http://localhost:3000/api/test-inject-products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-test-injection-key': TEST_KEY },
        body: JSON.stringify({ deleteIds: ['mock-fresh-phone'] }),
      });
      const prodDeleteRes = await testInjectRouteDELETE(prodDeleteReq);
      assert.equal(prodDeleteRes.status, 404, 'Production ortamında DELETE 404 Not Found dönmeli');

      const checkProdMemory = getStoredProducts().find((p) => p.id === 'mock-fresh-phone');
      assert.equal(checkProdMemory, undefined, 'Production denetiminde katalog belleği değişmemeli');
      prodGatePassed = true;
      console.log('    ✅ Production 404 denetimi geçti: Doğru anahtar olsa dahi POST/DELETE 404 döndü, gövde okunmadı ve bellek korunarak değişmedi.');
    } finally {
      (process.env as any).NODE_ENV = originalEnvNode;
    }

    // 0.2. Bayrak Kapalı (ALLOW_TEST_INJECTION !== 'true') Denetimi (HTTP 403)
    console.log('  0.2. Bayrak Kapalı (ALLOW_TEST_INJECTION !== "true") Denetimi...');
    const originalFlag = process.env.ALLOW_TEST_INJECTION;
    try {
      process.env.ALLOW_TEST_INJECTION = 'false';
      const flagReq = new NextRequest('http://localhost:3000/api/test-inject-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-test-injection-key': TEST_KEY },
        body: JSON.stringify({ products: [mockFresh] }),
      });
      const flagRes = await testInjectRoutePOST(flagReq);
      assert.equal(flagRes.status, 403, 'Bayrak kapalıyken HTTP 403 Forbidden dönmeli');
    } finally {
      process.env.ALLOW_TEST_INJECTION = originalFlag || 'true';
    }

    // 0.3. Anahtarsız ve Hatalı Anahtar Denetimleri (HTTP 401 & Katalog Koruma)
    console.log('  0.3. Anahtarsız ve Hatalı Anahtar Denetimleri (HTTP 401 & Katalog Koruma)...');
    const noKeyRes = await fetch('http://localhost:3000/api/test-inject-products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products: [mockFresh] }),
    });
    assert.equal(noKeyRes.status, 401, 'Anahtarsız istek 401 Unauthorized dönmeli');

    const badKeyRes = await fetch('http://localhost:3000/api/test-inject-products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-test-injection-key': 'invalid-secret-key-123' },
      body: JSON.stringify({ products: [mockFresh] }),
    });
    assert.equal(badKeyRes.status, 401, 'Hatalı anahtarlı istek 401 Unauthorized dönmeli');

    const checkMemory = getStoredProducts().find((p) => p.id === 'mock-fresh-phone');
    assert.equal(checkMemory, undefined, 'Yetkisiz istekler sonrası katalog belleği değişmemeli');
    securityGatePassed = true;
    console.log('    ✅ Bayrak kapalı (403), anahtarsız (401) ve hatalı anahtar (401) durumlarında yetkisiz erişim engellendi ve bellek korundu.');

    // 0.4. Yetkili Test Ürün Enjeksiyonu (Valid Key)
    console.log('\n🔄 Kontrollü Test Ürünleri Canlı Sunucu Belleğine Yükleniyor (/api/test-inject-products)...');

    // Track IDs from the VERY FIRST injection!
    injectedProductIds.add(mockFresh.id);
    injectedProductIds.add(mockStale.id);
    injectedProductIds.add(mockNoOffer.id);

    const injectRes = await fetch('http://localhost:3000/api/test-inject-products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-test-injection-key': TEST_KEY },
      body: JSON.stringify({ products: [mockFresh, mockStale, mockNoOffer] }),
    });
    assert.equal(injectRes.status, 200, 'Yetkili enjeksiyon 200 OK dönmeli');
    const injectData = await injectRes.json();
    assert.equal(injectData.injectedCount, 3, 'Tam 3 mock ürün yüklenmeli');
    console.log('  ✅ Kontrollü mockFresh, mockStale ve mockNoOffer ürünleri yetkili anahtarla canlı sunucu belleğine başarıyla yüklendi.\n');


    // ==========================================================================
    // BÖLÜM 4: GERÇEK TARAYICI VE DOM GÖSTERİM DENETİMLERİ (Playwright E2E)
    // ==========================================================================
    console.log('PART 4: Gerçek Tarayıcı ve DOM Gösterim Denetimleri (Playwright E2E)\n');

    let browser;
    try {
      browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();

      // 4.1. Liste Ekranı DOM Denetimi (/phones)
      console.log('4.1. Liste Ekranı DOM Denetimi (http://localhost:3000/phones?brand=MockBrand):');
      await page.goto('http://localhost:3000/phones?brand=MockBrand', { waitUntil: 'networkidle' });
      await page.waitForSelector('h4', { timeout: 10000 });

      // 4.1.1. Fresh Senaryosu
      const freshListCard = page.locator('h4:has-text("Mock Fresh Phone")').locator('xpath=ancestor::div[contains(@class, "group")][1]');
      await freshListCard.waitFor({ state: 'visible', timeout: 5000 });
      const freshListText = await freshListCard.innerText();
      assert.ok(freshListText.includes('Mock Fresh Phone'), 'Liste Fresh kartında ürün adı "Mock Fresh Phone" olmalı');
      assert.ok(freshListText.includes('42.000'), 'Liste Fresh kartında 42.000 TL fiyat görünmeli');
      assert.ok(
        freshListText.includes('Güncel Fiyat') || freshListText.includes('Mağaza Fiyatı') || freshListText.includes('En İyi Fiyat'),
        'Liste Fresh kartında "Güncel Fiyat" / "Mağaza Fiyatı" / "En İyi Fiyat" rozeti görünmeli'
      );
      realMatrix['1. Liste Ekranı (/phones)'].fresh = true;
      console.log('  ✅ 4.1.1 Liste Ekranı Fresh Senaryosu Geçti.');

      // 4.1.2. Stale Senaryosu
      const staleListCard = page.locator('h4:has-text("Mock Stale Phone")').locator('xpath=ancestor::div[contains(@class, "group")][1]');
      await staleListCard.waitFor({ state: 'visible', timeout: 5000 });
      const staleListText = await staleListCard.innerText();
      assert.ok(staleListText.includes('Mock Stale Phone'), 'Liste Stale kartında ürün adı "Mock Stale Phone" olmalı');
      assert.ok(staleListText.includes('42.000'), 'Liste Stale kartında 42.000 TL son görülen fiyat görünmeli');
      assert.ok(staleListText.includes('Son görülen'), 'Liste Stale kartında "Son görülen" metni görünmeli');
      assert.ok(staleListText.includes(expectedStaleDateFormatted), `Liste Stale kartında dinamik hesaplanan tam tarih (${expectedStaleDateFormatted}) görünmeli`);
      realMatrix['1. Liste Ekranı (/phones)'].stale = true;
      console.log(`  ✅ 4.1.2 Liste Ekranı Stale Senaryosu Geçti (Tarih: ${expectedStaleDateFormatted}).`);

      // 4.1.3. No Offer Senaryosu
      const noOfferListCard = page.locator('h4:has-text("Mock No Offer Phone")').locator('xpath=ancestor::div[contains(@class, "group")][1]');
      await noOfferListCard.waitFor({ state: 'visible', timeout: 5000 });
      const noOfferListText = await noOfferListCard.innerText();
      assert.ok(noOfferListText.includes('Mock No Offer Phone'), 'Liste No Offer kartında ürün adı "Mock No Offer Phone" olmalı');
      assert.ok(noOfferListText.includes('50.000'), 'Liste No Offer kartında 50.000 TL katalog referans fiyatı görünmeli');
      assert.ok(
        noOfferListText.includes('Fiyat doğrulanmadı') || noOfferListText.includes('Referans Fiyat') || noOfferListText.includes('Katalog'),
        'Liste No Offer kartında doğrulama / katalog referans etiketi görünmeli'
      );
      realMatrix['1. Liste Ekranı (/phones)'].noOffer = true;
      console.log('  ✅ 4.1.3 Liste Ekranı No Offer Senaryosu Geçti.');


      // 4.2. Ürün Detay Header & Yapışkan Header Bar
      console.log('\n4.2. Ürün Detayı Header & Sticky Header Bar (Ayrı Sayfa Senaryoları):');

      // 4.2.1. Fresh Senaryosu
      console.log('  4.2.1. Fresh Senaryo Detay Sayfası (/phones/mock-fresh-phone):');
      await page.goto('http://localhost:3000/phones/mock-fresh-phone', { waitUntil: 'networkidle' });
      await page.waitForSelector('h1', { timeout: 10000 });
      const freshTitle = await page.locator('h1').innerText();
      assert.ok(freshTitle.includes('Mock Fresh Phone'), 'Fresh Detay sayfasında ürün başlığı doğru okundu');

      await page.waitForSelector('.bg-slate-50.p-5', { timeout: 5000 });
      const freshDetailBox = await page.locator('.bg-slate-50.p-5').innerText();
      assert.ok(freshDetailBox.includes('42.000'), 'Fresh Detay fiyat kutusunda 42.000 TL görünmeli');
      assert.ok(freshDetailBox.includes('Güncel Fiyat'), 'Fresh Detay fiyat kutusunda "Güncel Fiyat" rozeti görünmeli');
      realMatrix['2. Ürün Detay Header'].fresh = true;

      await page.evaluate(() => window.scrollTo(0, 800));
      await page.waitForSelector('.fixed.top-16', { timeout: 5000 });
      const freshStickyText = await page.locator('.fixed.top-16').innerText();
      assert.ok(freshStickyText.includes('Mock Fresh Phone'), 'Fresh Yapışkan Barda ürün adı görünmeli');
      assert.ok(freshStickyText.includes('42.000'), 'Fresh Yapışkan Barda 42.000 TL görünmeli');
      assert.ok(freshStickyText.includes('Güncel Fiyat'), 'Fresh Yapışkan Barda "Güncel Fiyat" rozeti görünmeli');
      realMatrix['3. Yapışkan Header Bar'].fresh = true;
      console.log('    ✅ Fresh Detay Header ve Yapışkan Bar doğrulandı.');

      // 4.2.2. Stale Senaryosu
      console.log('  4.2.2. Stale Senaryo Detay Sayfası (/phones/mock-stale-phone):');
      await page.goto('http://localhost:3000/phones/mock-stale-phone', { waitUntil: 'networkidle' });
      await page.waitForSelector('h1', { timeout: 10000 });
      const staleTitle = await page.locator('h1').innerText();
      assert.ok(staleTitle.includes('Mock Stale Phone'), 'Stale Detay sayfasında ürün başlığı doğru okundu');

      await page.waitForSelector('.bg-slate-50.p-5', { timeout: 5000 });
      const staleDetailBox = await page.locator('.bg-slate-50.p-5').innerText();
      assert.ok(staleDetailBox.includes('42.000'), 'Stale Detay fiyat kutusunda 42.000 TL son görülen fiyat görünmeli');
      assert.ok(staleDetailBox.includes('Son görülen'), 'Stale Detay fiyat kutusunda "Son görülen" rozeti görünmeli');
      assert.ok(staleDetailBox.includes(expectedStaleDateFormatted), `Stale Detay fiyat kutusunda dinamik hesaplanan tam tarih (${expectedStaleDateFormatted}) görünmeli`);
      realMatrix['2. Ürün Detay Header'].stale = true;

      await page.evaluate(() => window.scrollTo(0, 800));
      await page.waitForSelector('.fixed.top-16', { timeout: 5000 });
      const staleStickyText = await page.locator('.fixed.top-16').innerText();
      assert.ok(staleStickyText.includes('Mock Stale Phone'), 'Stale Yapışkan Barda ürün adı görünmeli');
      assert.ok(staleStickyText.includes('42.000'), 'Stale Yapışkan Barda 42.000 TL görünmeli');
      assert.ok(staleStickyText.includes('Son görülen'), 'Stale Yapışkan Barda "Son görülen" rozeti görünmeli');
      assert.ok(staleStickyText.includes(expectedStaleDateFormatted), `Stale Yapışkan Barda dinamik hesaplanan tam tarih (${expectedStaleDateFormatted}) görünmeli`);
      realMatrix['3. Yapışkan Header Bar'].stale = true;
      console.log(`    ✅ Stale Detay Header ve Yapışkan Bar doğrulandı (Tarih: ${expectedStaleDateFormatted}).`);

      // 4.2.3. No Offer Senaryosu
      console.log('  4.2.3. No Offer Senaryo Detay Sayfası (/phones/mock-no-offer-phone):');
      await page.goto('http://localhost:3000/phones/mock-no-offer-phone', { waitUntil: 'networkidle' });
      await page.waitForSelector('h1', { timeout: 10000 });
      const noOfferTitle = await page.locator('h1').innerText();
      assert.ok(noOfferTitle.includes('Mock No Offer Phone'), 'No Offer Detay sayfasında ürün başlığı doğru okundu');

      await page.waitForSelector('.bg-slate-50.p-5', { timeout: 5000 });
      const noOfferDetailBox = await page.locator('.bg-slate-50.p-5').innerText();
      assert.ok(noOfferDetailBox.includes('50.000'), 'No Offer Detay fiyat kutusunda 50.000 TL katalog fiyatı görünmeli');
      assert.ok(
        noOfferDetailBox.includes('Fiyat doğrulanmadı') || noOfferDetailBox.includes('Teklif Yok') || noOfferDetailBox.includes('Katalog Referans Fiyatı'),
        'No Offer Detay fiyat kutusunda "Fiyat doğrulanmadı" / "Teklif Yok" rozeti görünmeli'
      );
      realMatrix['2. Ürün Detay Header'].noOffer = true;

      await page.evaluate(() => window.scrollTo(0, 800));
      await page.waitForSelector('.fixed.top-16', { timeout: 5000 });
      const noOfferStickyText = await page.locator('.fixed.top-16').innerText();
      assert.ok(noOfferStickyText.includes('Mock No Offer Phone'), 'No Offer Yapışkan Barda ürün adı görünmeli');
      assert.ok(noOfferStickyText.includes('50.000'), 'No Offer Yapışkan Barda 50.000 TL görünmeli');
      assert.ok(
        noOfferStickyText.includes('Fiyat doğrulanmadı') || noOfferStickyText.includes('Referans Fiyat') || noOfferStickyText.includes('Başlangıç'),
        'No Offer Yapışkan Barda doğrulama rozeti görünmeli'
      );
      realMatrix['3. Yapışkan Header Bar'].noOffer = true;
      console.log('    ✅ No Offer Detay Header ve Yapışkan Bar doğrulandı.');


      // 4.3. Arama Ekranı DOM Denetimi
      console.log('\n4.3. Arama Ekranı DOM Denetimi (Arayüz Gösterim Simülasyonu - /search?q=iphone):');

      await page.route('**/api/search*', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'mock-fresh-phone',
              name: 'Mock Fresh Phone 256 GB',
              brand: 'Apple',
              category: 'smartphones',
              slug: 'mock-fresh-phone',
              basePrice: 50000,
              currentPrice: 42000,
              lastSeenPrice: null,
              displayPrice: 42000,
              priceStatus: 'fresh',
              statusLabel: 'Güncel Fiyat',
              lastCheckedAt: freshDateStr,
            },
            {
              id: 'mock-stale-phone',
              name: 'Mock Stale Phone 256 GB',
              brand: 'Samsung',
              category: 'smartphones',
              slug: 'mock-stale-phone',
              basePrice: 50000,
              currentPrice: null,
              lastSeenPrice: 42000,
              displayPrice: 42000,
              priceStatus: 'stale',
              statusLabel: `Son görülen fiyat: ${expectedStaleDateFormatted}`,
              lastCheckedAt: staleDateStr,
            },
            {
              id: 'mock-no-offer-phone',
              name: 'Mock No Offer Phone 256 GB',
              brand: 'Xiaomi',
              category: 'smartphones',
              slug: 'mock-no-offer-phone',
              basePrice: 50000,
              currentPrice: null,
              lastSeenPrice: null,
              displayPrice: 50000,
              priceStatus: 'unverified',
              statusLabel: 'Fiyat doğrulanmadı',
            },
          ]),
        });
      });

      await page.goto('http://localhost:3000/search?q=iphone', { waitUntil: 'networkidle' });
      await page.waitForSelector('div.grid-cols-2 > div', { timeout: 10000 });

      const searchCards = page.locator('div.grid-cols-2 > div');
      assert.equal(await searchCards.count(), 3, 'Arama ekranında 3 adet mock senaryo kartı render edilmeli');

      // Fresh Card
      const searchFreshCard = page.locator('div.grid-cols-2 > div').filter({ hasText: 'Mock Fresh Phone' });
      const freshSearchText = await searchFreshCard.innerText();
      assert.ok(freshSearchText.includes('42.000'), 'Arama Fresh kartında 42.000 TL fiyat görünmeli');
      assert.ok(freshSearchText.includes('Güncel Fiyat'), 'Arama Fresh kartında "Güncel Fiyat" etiketi görünmeli');
      mockMatrix['4. Arama UI (/search) (Arayüz)'].fresh = true;

      // Stale Card
      const searchStaleCard = page.locator('div.grid-cols-2 > div').filter({ hasText: 'Mock Stale Phone' });
      const staleSearchText = await searchStaleCard.innerText();
      assert.ok(staleSearchText.includes('42.000'), 'Arama Stale kartında 42.000 TL son görülen fiyat görünmeli');
      assert.ok(staleSearchText.includes('Son görülen'), 'Arama Stale kartında "Son görülen" etiketi görünmeli');
      assert.ok(staleSearchText.includes(expectedStaleDateFormatted), `Arama Stale kartında dinamik hesaplanan tam tarih (${expectedStaleDateFormatted}) görünmeli`);
      mockMatrix['4. Arama UI (/search) (Arayüz)'].stale = true;

      // No Offer Card
      const searchNoOfferCard = page.locator('div.grid-cols-2 > div').filter({ hasText: 'Mock No Offer Phone' });
      const noOfferSearchText = await searchNoOfferCard.innerText();
      assert.ok(noOfferSearchText.includes('50.000'), 'Arama No Offer kartında 50.000 TL katalog referans fiyatı görünmeli');
      assert.ok(
        noOfferSearchText.includes('Fiyat doğrulanmadı') || noOfferSearchText.includes('Referans Fiyat') || noOfferSearchText.includes('Katalog Referans Fiyatı'),
        'Arama No Offer kartında doğrulama / katalog referans etiketi görünmeli'
      );
      mockMatrix['4. Arama UI (/search) (Arayüz)'].noOffer = true;

      console.log('  ✅ Arama Ekranı (Search UI Arayüz Gösterim Testi): Fresh, Stale (tam tarihli) ve No Offer senaryoları kart kart doğrulandı.');


      // 4.4. Sohbet & AI Asistan Modalı (AIAssistantModal)
      console.log('\n4.4. Sohbet & AI Asistan Modalı (AIAssistantModal Arayüz Gösterim Simülasyonu):');

      const mockRecsData = [
        {
          productId: 'mock-fresh-phone',
          productName: 'Mock Fresh Phone 256 GB',
          price: 42000,
          priceStatus: 'fresh',
          statusLabel: 'Güncel Fiyat',
          cheapestStore: 'Hepsiburada',
        },
        {
          productId: 'mock-stale-phone',
          productName: 'Mock Stale Phone 256 GB',
          price: 42000,
          priceStatus: 'stale',
          statusLabel: `Son görülen fiyat: ${expectedStaleDateFormatted}`,
          cheapestStore: 'Trendyol',
        },
        {
          productId: 'mock-no-offer-phone',
          productName: 'Mock No Offer Phone 256 GB',
          price: null,
          priceStatus: 'unverified',
          statusLabel: 'Fiyat doğrulanmadı',
          cheapestStore: 'Katalog',
        },
      ];

      const sseStreamBody =
        `event: products\ndata: ${JSON.stringify(mockRecsData)}\n\n` +
        `event: text\ndata: "Bütçene uygun önerdiğim modeller yukarıdadır."\n\n` +
        `event: text\ndata: "[DONE]"\n\n`;

      await page.route('**/api/chat', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'text/event-stream',
          body: sseStreamBody,
        });
      });

      const aiBtn = page.locator('button:has-text("RoboPengu AI"), button:has-text("Asistana Sor"), button:has-text("Gemini AI")').first();
      await aiBtn.waitFor({ state: 'visible', timeout: 10000 });
      await aiBtn.click();

      await page.waitForSelector('h3:has-text("RoboPengu")', { timeout: 10000 });
      const modalTitle = await page.locator('h3:has-text("RoboPengu")').first().innerText();
      assert.ok(modalTitle.includes('RoboPengu'), 'AIAssistantModal DOM üzerine açılmalı');

      const inputSelector = 'input[placeholder*="RoboPengu"]';
      await page.waitForSelector(inputSelector, { timeout: 5000 });
      await page.fill(inputSelector, '50000 TL altı telefon öner');
      await page.keyboard.press('Enter');

      const modalContainer = page.locator('div.fixed.inset-0').first();

      // 4.4.1. Fresh Card inside modal
      const freshChatCard = modalContainer.locator('a[href*="mock-fresh-phone"]');
      await freshChatCard.waitFor({ state: 'visible', timeout: 15000 });
      const freshChatCardText = await freshChatCard.innerText();
      assert.ok(freshChatCardText.includes('Mock Fresh Phone'), 'Chat Fresh kartında ürün adı görünmeli');
      assert.ok(freshChatCardText.includes('₺42.000') || freshChatCardText.includes('42.000'), 'Chat Fresh kartında 42.000 TL görünmeli');
      assert.ok(freshChatCardText.includes('Güncel Fiyat'), 'Chat Fresh kartında "Güncel Fiyat" etiketi görünmeli');
      mockMatrix['5. Chat Öneri Kartı (AI) (Arayüz)'].fresh = true;

      // 4.4.2. Stale Card inside modal
      const staleChatCard = modalContainer.locator('a[href*="mock-stale-phone"]');
      await staleChatCard.waitFor({ state: 'visible', timeout: 15000 });
      const staleChatCardText = await staleChatCard.innerText();
      assert.ok(staleChatCardText.includes('Mock Stale Phone'), 'Chat Stale kartında ürün adı görünmeli');
      assert.ok(staleChatCardText.includes('₺42.000') || staleChatCardText.includes('42.000'), 'Chat Stale kartında 42.000 TL görünmeli');
      assert.ok(staleChatCardText.includes('Son görülen'), 'Chat Stale kartında "Son görülen" metni görünmeli');
      assert.ok(staleChatCardText.includes(expectedStaleDateFormatted), `Chat Stale kartında dinamik hesaplanan tam tarih (${expectedStaleDateFormatted}) görünmeli`);
      mockMatrix['5. Chat Öneri Kartı (AI) (Arayüz)'].stale = true;

      // 4.4.3. No Offer Card inside modal
      const noOfferChatCard = modalContainer.locator('a[href*="mock-no-offer-phone"]');
      await noOfferChatCard.waitFor({ state: 'visible', timeout: 15000 });
      const noOfferChatCardText = await noOfferChatCard.innerText();
      assert.ok(noOfferChatCardText.includes('Mock No Offer Phone'), 'Chat No Offer kartında ürün adı görünmeli');
      assert.ok(noOfferChatCardText.includes('Fiyat doğrulanmadı'), 'Chat No Offer kartında "Fiyat doğrulanmadı" etiketi görünmeli');
      mockMatrix['5. Chat Öneri Kartı (AI) (Arayüz)'].noOffer = true;

      console.log('  ✅ Sohbet & AI Asistan Modalı (Chat Arayüz Gösterim Testi): Her kart kendi ürün kimliğiyle ayrı ayrı seçildi, tam tarihli etiket ve fiyatlar kart bazlı doğrulandı.');

    } finally {
      if (browser) {
        await browser.close().catch(() => {});
      }
    }
  } finally {
    const cleanupRes = await performFullStateCleanup(
      injectedProductIds,
      preExistingCatalogSnapshot,
      preExistingCatalogSnapshotCount,
      TEST_KEY
    );
    serverMemoryCleanupPassed = cleanupRes.serverMemoryCleanupPassed;
    localMemoryCleanupPassed = cleanupRes.localMemoryCleanupPassed;
  }


  // ==========================================================================
  // BÖLÜM 5: AYRIŞTIRILMIŞ MATRİS VE RAPORLAMA
  // ==========================================================================
  console.log('\n================================================================================');
  console.log('📊 1. GERÇEK SUNUCU/BİLEŞEN RENDER MATRİSİ (REAL COMPONENT RENDERING)');
  console.log('================================================================================');
  console.log('Yüzey / Ekran                 | Fresh (<=24h) | Stale (48h) | No Offer (Unverified)');
  console.log('--------------------------------------------------------------------------------');
  let allRealPassed = true;
  for (const [surface, res] of Object.entries(realMatrix)) {
    const fStr = res.fresh ? ' ✅ GEÇTİ ' : ' ⏳ Çalıştırılmadı ';
    const sStr = res.stale ? ' ✅ GEÇTİ ' : ' ⏳ Çalıştırılmadı ';
    const nStr = res.noOffer ? ' ✅ GEÇTİ ' : ' ⏳ Çalıştırılmadı ';
    if (!res.fresh || !res.stale || !res.noOffer) allRealPassed = false;
    console.log(`${surface.padEnd(29)} | ${fStr}    | ${sStr}   | ${nStr}`);
  }

  console.log('\n================================================================================');
  console.log('📊 2. ARAYÜZ GÖSTERİM TESTLERİ MATRİSİ (MOCK API/SSE SIMULATION)');
  console.log('================================================================================');
  console.log('Yüzey / Ekran                 | Fresh (<=24h) | Stale (48h) | No Offer (Unverified)');
  console.log('--------------------------------------------------------------------------------');
  let allMockPassed = true;
  for (const [surface, res] of Object.entries(mockMatrix)) {
    const fStr = res.fresh ? ' ✅ GEÇTİ ' : ' ⏳ Çalıştırılmadı ';
    const sStr = res.stale ? ' ✅ GEÇTİ ' : ' ⏳ Çalıştırılmadı ';
    const nStr = res.noOffer ? ' ✅ GEÇTİ ' : ' ⏳ Çalıştırılmadı ';
    if (!res.fresh || !res.stale || !res.noOffer) allMockPassed = false;
    console.log(`${surface.padEnd(29)} | ${fStr}    | ${sStr}   | ${nStr}`);
  }

  console.log('\n================================================================================');
  console.log('📊 3. GÜVENLİK, YETKİLENDİRME VE BELLEK TEMİZLİĞİ RAPORU');
  console.log('================================================================================');
  console.log(`- Production 404 Uç Nokta Engeli: ${prodGatePassed ? '✅ GEÇTİ (NODE_ENV=production -> HTTP 404 Not Found & Gövde/Bellek Değişmedi)' : '❌ BAŞARISIZ / Çalıştırılmadı'}`);
  console.log(`- Yetkisiz / Anahtarsız İstek Engeli (HTTP 401/403): ${securityGatePassed ? '✅ GEÇTİ (Bayrak Kapalı 403, Anahtarsız 401, Hatalı Anahtar 401)' : '❌ BAŞARISIZ / Çalıştırılmadı'}`);
  console.log(`- Next.js Sunucu Belleği Temizliği: ${serverMemoryCleanupPassed ? '✅ GEÇTİ (HTTP POST deleteIds -> 200 OK & /api/products/[id] -> HTTP 404 Not Found)' : '❌ BAŞARISIZ / Çalıştırılmadı'}`);
  console.log(`- Test Süreci Yerel Bellek Temizliği: ${localMemoryCleanupPassed ? '✅ GEÇTİ (Genel Fabrika Sıfırlaması Kullanılmadı, Yalnızca Test Kayıtları Silindi)' : '❌ BAŞARISIZ / Çalıştırılmadı'}`);
  console.log(`- /api/search HTTP Projeksiyon Testi: ${realApiCheckPassed ? '✅ GEÇTİ (HTTP 200, Alanlar Doğrulandı)' : '❌ BAŞARISIZ / Çalıştırılmadı'}`);

  console.log('\n================================================================================');
  if (allRealPassed && allMockPassed && realApiCheckPassed && prodGatePassed && securityGatePassed && serverMemoryCleanupPassed && localMemoryCleanupPassed) {
    console.log('🎉 TÜM SIKI ASSERTION, GÜVENLİK KAPISI VE DOM DENETİMLERİ BAŞARIYLA TAMAMLANDI!');
  } else {
    console.log('⚠️ BAZI HÜCRELER VEYA GÜVENLİK/TEMİZLİK DENETİMLERİ ÇALIŞTIRILMADI VEYA BAŞARISIZ OLDU.');
    throw new Error('❌ Sıkı doğrulama testi başarısız: Bazı matris hücreleri veya bellek temizliği/güvenlik kapıları geçemedi.');
  }
  console.log('================================================================================\n');
}

runStrictVerificationSuite().catch((err) => {
  console.error('\n❌ KESİN HATA: Sıkı doğrulama testi başarısız oldu!', err);
  process.exit(1);
});
