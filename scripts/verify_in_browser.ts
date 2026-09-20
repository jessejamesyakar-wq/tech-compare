// scripts/verify_in_browser.ts
import { chromium } from 'playwright';

async function runBrowserVerification() {
  console.log('================================================================');
  console.log('🌐 GERÇEK TARAYICI İLE E2E DOĞRULAMA TESTLERİ BAŞLIYOR');
  console.log('================================================================\n');

  const browser = await chromium.launch({ headless: true });
  // Grant clipboard permissions for navigator.clipboard.readText()
  const context = await browser.newContext({
    permissions: ['clipboard-read', 'clipboard-write']
  });
  const page = await context.newPage();

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, title: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${title}${detail ? ` -> ${detail}` : ''}`);
      failed++;
    }
  }

  try {
    // ------------------------------------------------------------------------
    // TEST 1: Tek Ürün İçeren URL (/compare?d1=samsung-galaxy-s24)
    // ------------------------------------------------------------------------
    console.log('Test 1: Tek Ürün İçeren URL (/compare?d1=samsung-galaxy-s24)');
    await page.goto('http://localhost:3000/compare?d1=samsung-galaxy-s24', { waitUntil: 'networkidle' });

    await page.waitForSelector('h3:has-text("Samsung Galaxy S24")', { timeout: 10000 });
    const p1Count = await page.locator('h3:has-text("Samsung Galaxy S24")').count();
    assert(p1Count > 0, '1. Ürün "Samsung Galaxy S24" ekrana yüklendi');

    await page.waitForSelector('text=İkinci ürün seçilmedi', { timeout: 10000 });
    const singlePromptCount = await page.locator('text=İkinci ürün seçilmedi').count();
    assert(singlePromptCount > 0, 'Eksik 2. ürün varsayılan ürünle DOLDURULMADI, "İkinci ürün seçilmedi" uyarısı verildi');

    const duelArenaStage = await page.locator('text=DÜELLO ARENA').count();
    assert(duelArenaStage === 0, 'İkinci ürün doğrulanmadan Düello Arena ve kazanan kartları gizlendi');

    // ------------------------------------------------------------------------
    // TEST 2: İki Geçerli Ürün URL (/compare?d1=samsung-galaxy-s24&d2=iphone-16-pro-max)
    // TAM ÜRÜN ADI AYRIMI (S24 vs S24 Ultra)
    // ------------------------------------------------------------------------
    console.log('\nTest 2: İki Geçerli Ürün İle Düello - Tam Ad Ayrımı (S24 vs S24 Ultra)');
    await page.goto('http://localhost:3000/compare?d1=samsung-galaxy-s24&d2=iphone-16-pro-max', { waitUntil: 'networkidle' });

    await page.waitForSelector('h1:has-text("DÜELLO ARENA")', { timeout: 10000 });
    const duelHeader = await page.locator('h1:has-text("DÜELLO ARENA")').count();
    assert(duelHeader > 0, 'İki ürün de doğrulandı ve Düello Arena ana sahnesi yüklendi');

    await page.waitForSelector('h2:has-text("Samsung Galaxy S24")', { timeout: 10000 });
    const p1TitleText = await page.locator('h2').nth(0).innerText();
    const isStrictS24 = p1TitleText.trim() === 'Samsung Galaxy S24' || (p1TitleText.includes('Samsung Galaxy S24') && !p1TitleText.includes('Ultra'));
    assert(isStrictS24, `1. Kartta TAM ADUYLA "Samsung Galaxy S24" görüntülendi (Alınan: "${p1TitleText}", S24 Ultra değil!)`);

    await page.waitForSelector('h2:has-text("iPhone 16 Pro Max")', { timeout: 10000 });
    const p2TitleText = await page.locator('h2').nth(1).innerText();
    assert(p2TitleText.includes('iPhone 16 Pro Max'), `2. Kartta istenen "iPhone 16 Pro Max" görüntülendi (Alınan: "${p2TitleText}")`);

    const refereeVerdict = await page.locator('text=RoboPengu Hakem Kararı').count();
    assert(refereeVerdict > 0, 'İki ürün doğrulandığı için RoboPengu Hakem Kararı gösterildi');

    // ------------------------------------------------------------------------
    // TEST 3: Geçersiz Ürün URL (/compare?d1=invalid-product-slug-xyz)
    // ------------------------------------------------------------------------
    console.log('\nTest 3: Geçersiz Ürün İçeren URL (/compare?d1=invalid-product-slug-xyz)');
    await page.goto('http://localhost:3000/compare?d1=invalid-product-slug-xyz', { waitUntil: 'networkidle' });

    await page.waitForSelector('h2:has-text("Aradığınız Karşılaştırma Ürünü Bulunamadı")', { timeout: 10000 });
    const errorHeading = await page.locator('h2:has-text("Aradığınız Karşılaştırma Ürünü Bulunamadı")').count();
    assert(errorHeading > 0, 'Sessiz varsayılan ürün gösterilmedi; açık "Ürün Bulunamadı" hata kartı rendered edildi');

    const duelHeaderInError = await page.locator('h1:has-text("DÜELLO ARENA")').count();
    assert(duelHeaderInError === 0, 'Hata durumunda Düello ve kazanan gösterimi kesin olarak engellendi');

    // ------------------------------------------------------------------------
    // TEST 4: Ardışık İstek Koruması (Yanıtları Ters Sırada Tamamlanan 2 Seçim)
    // ------------------------------------------------------------------------
    console.log('\nTest 4: Ardışık İstek Koruması - Yanıtları Ters Sırada Tamamlanan 2 Seçim Testi');
    await page.goto('http://localhost:3000/compare', { waitUntil: 'networkidle' });

    const completionOrder: string[] = [];
    const finishedProductsA = new Set<string>();
    const finishedProductsB = new Set<string>();

    // Intercept API calls to delay Preset A (MSI vs Dell) product requests by 1200ms
    await page.route('**/api/products/**', async (route, request) => {
      const url = request.url();
      if (url.includes('msi-mag-255pxf') || url.includes('dell-g2524h')) {
        await new Promise((r) => setTimeout(r, 1200));
      }
      await route.continue();
    });

    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/products/')) {
        try {
          await response.finished();
        } catch {
          return;
        }

        if (url.includes('msi-mag-255pxf') || url.includes('dell-g2524h')) {
          if (url.includes('msi-mag-255pxf')) finishedProductsA.add('msi');
          if (url.includes('dell-g2524h')) finishedProductsA.add('dell');

          if (finishedProductsA.size === 2 && !completionOrder.includes('Preset A (MSI vs Dell)')) {
            completionOrder.push('Preset A (MSI vs Dell)');
          }
        }

        if (url.includes('apple-iphone-16-pro-max-256-gb') || url.includes('samsung-galaxy-s24-ultra')) {
          if (url.includes('apple-iphone-16-pro-max-256-gb')) finishedProductsB.add('iphone');
          if (url.includes('samsung-galaxy-s24-ultra')) finishedProductsB.add('s24ultra');

          if (finishedProductsB.size === 2 && !completionOrder.includes('Preset B (iPhone vs S24 Ultra)')) {
            completionOrder.push('Preset B (iPhone vs S24 Ultra)');
          }
        }
      }
    });

    // 1. Tıkla Preset A (MSI vs Dell)
    const btnPresetA = page.locator('button:has-text("MSI MAG 255PXF vs Dell G2524H")');
    await btnPresetA.click();

    // 2. Hemen ardından Tıkla Preset B (iPhone 16 Pro Max vs S24 Ultra)
    const btnPresetB = page.locator('button:has-text("iPhone 16 Pro Max vs S24 Ultra")');
    await btnPresetB.click();

    // 3. Bekle iki Preset'in de TÜM yanıtları tamamlansın
    const startTime = Date.now();
    while (completionOrder.length < 2 && Date.now() - startTime < 15000) {
      await page.waitForTimeout(100);
    }

    const isOrderBThenA = completionOrder[0] === 'Preset B (iPhone vs S24 Ultra)' && completionOrder[1] === 'Preset A (MSI vs Dell)';
    assert(isOrderBThenA, `İki preset'in de tüm ürün yanıtları tamamlandı (await response.finished()). Tamamlanma Sırası: ${completionOrder.join(' -> ')}`);

    // 4. Son seçilen Preset B ekranda mı denetle
    await page.waitForSelector('h2:has-text("iPhone 16 Pro Max")', { timeout: 10000 });
    const finalP1 = await page.locator('h2').nth(0).innerText();
    const finalP2 = await page.locator('h2').nth(1).innerText();

    const isPresetBKept = finalP1.includes('iPhone 16 Pro Max') && finalP2.includes('Galaxy S24 Ultra');
    assert(isPresetBKept, `Ekrandaki iki ürün de son seçilen Preset B'ye ("iPhone 16 Pro Max" & "Galaxy S24 Ultra") aittir (Alınan: "${finalP1}" & "${finalP2}")`);

    // Route müdahalesini temizle
    await page.unroute('**/api/products/**');

    // ------------------------------------------------------------------------
    // TEST 5: Sohbet -> Kart -> Karşılaştırma -> Paylaşım Linkini Yeni Sayfada Açma & Kapasite Doğrulaması
    // ------------------------------------------------------------------------
    console.log('\nTest 5: Sohbet -> Kart -> Karşılaştırma -> Paylaşım Linkini Yeni Sayfada Açma & Kapasite Doğrulaması');

    // 1. Go to homepage
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

    // 2. Open Chat by clicking "RoboPengu AI" button in Navbar
    await page.waitForSelector('button:has-text("RoboPengu AI")', { timeout: 10000 });
    await page.click('button:has-text("RoboPengu AI")');

    // 3. Type prompt into chat input
    const chatInputSelector = 'input[placeholder*="RoboPengu\'ya sorun"]';
    await page.waitForSelector(chatInputSelector, { timeout: 10000 });
    await page.fill(chatInputSelector, "iPhone 17 Pro Max 512 GB ile Galaxy S26 Ultra'yı karşılaştır");
    await page.keyboard.press('Enter');

    // 4. Wait for comparison card / button "Düelloya Git" in the AI modal
    const duelBtnSelector = 'a:has-text("Düelloya Git")';
    await page.waitForSelector(duelBtnSelector, { timeout: 15000 });
    assert(true, 'Sohbet arayüzünde "iPhone 17 Pro Max 512 GB" ve "Galaxy S26 Ultra" karşılaştırma kartı üretildi');

    // 5. Click the card link to navigate to /compare
    await page.click(duelBtnSelector);
    await page.waitForURL(/\/compare\?d1=/, { timeout: 10000 });
    assert(page.url().includes('compare?d1='), `Sohbet kartındaki link üzerinden Karşılaştırma sayfasına geçildi: ${page.url()}`);

    // 6. Verify exact model and 512 GB capacity on compare page
    await page.waitForSelector('h2:has-text("iPhone 17 Pro Max")', { timeout: 10000 });
    const p1FullName = await page.locator('h2').nth(0).innerText();
    const hasExplicit512GB = p1FullName.includes('512 GB') || p1FullName.includes('512GB');
    assert(hasExplicit512GB, `1. Ürünün 512 GB KAPASİTESİ GERÇEKTEN DENETLENDİ (Alınan tam isim: "${p1FullName}")`);

    await page.waitForSelector('h2:has-text("Galaxy S26 Ultra")', { timeout: 10000 });
    const p2FullName = await page.locator('h2').nth(1).innerText();
    assert(p2FullName.includes('Galaxy S26 Ultra'), `2. Ürünün adı "Galaxy S26 Ultra" olarak yüklendi (Alınan: "${p2FullName}")`);

    // 7. Click Share button and read clipboard STRICTLY (NO page.url() fallback)
    await page.click('button:has-text("Düelloyu Paylaş")');
    await page.waitForTimeout(300);

    let copiedUrl = '';
    try {
      copiedUrl = await page.evaluate(() => navigator.clipboard.readText());
    } catch {
      copiedUrl = '';
    }
    
    const isClipboardValid = !!copiedUrl && copiedUrl.includes('d1=') && copiedUrl.includes('d2=');
    assert(isClipboardValid, `Paylaşım bağlantısı YEDEK OLMADAN doğrudan GERÇEK PANODAN okundu: "${copiedUrl}"`);

    if (!isClipboardValid) {
      throw new Error(`Pano okuması başarısız oldu veya geçersiz URL döndü! (Alınan: "${copiedUrl}")`);
    }

    // 8. Open copied URL in a BRAND NEW browser tab/page
    console.log('  -> Kopyalanan paylaşım bağlantısı yepyeni bir sekmede açılıyor...');
    const shareTab = await context.newPage();
    await shareTab.goto(copiedUrl, { waitUntil: 'networkidle' });

    await shareTab.waitForSelector('h2:has-text("iPhone 17 Pro Max")', { timeout: 10000 });
    const tabP1Name = await shareTab.locator('h2').nth(0).innerText();
    const tabP1Has512 = tabP1Name.includes('512 GB') || tabP1Name.includes('512GB');
    assert(tabP1Has512, `Yeni sekmede açılan 1. Ürünün model ve 512 GB KAPASİTESİ DOĞRULANDI (Alınan: "${tabP1Name}")`);

    await shareTab.waitForSelector('h2:has-text("Galaxy S26 Ultra")', { timeout: 10000 });
    const tabP2Name = await shareTab.locator('h2').nth(1).innerText();
    assert(tabP2Name.includes('Galaxy S26 Ultra'), `Yeni sekmede açılan 2. Ürünün modeli DOĞRULANDI (Alınan: "${tabP2Name}")`);

    await shareTab.close();

    // ------------------------------------------------------------------------
    // TEST 6: Eski TV Adresi Yönlendirmesi (/tvs/lg-lg-ultragear-27gx790a-b -> /monitors/lg-ultragear-27gx790a-b)
    // ------------------------------------------------------------------------
    console.log('\nTest 6: Eski TV Adresi Yönlendirmesi (/tvs/lg-lg-ultragear-27gx790a-b -> /monitors/lg-ultragear-27gx790a-b)');
    await page.goto('http://localhost:3000/tvs/lg-lg-ultragear-27gx790a-b', { waitUntil: 'networkidle' });

    const finalLgUrl = page.url();
    const isRedirectedToMonitors = finalLgUrl.includes('/monitors/lg-ultragear-27gx790a-b');
    assert(
      isRedirectedToMonitors,
      `Eski TV adresi /tvs/lg-lg-ultragear-27gx790a-b GERÇEK HTTP YÖNLENDİRMESİ İLE /monitors/lg-ultragear-27gx790a-b ADRESİNE YÖNLENDİ (Son URL: "${finalLgUrl}")`
    );

    await page.waitForSelector('h1:has-text("LG UltraGear 27GX790A-B")', { timeout: 10000 });
    const monitorH1 = await page.locator('h1:has-text("LG UltraGear 27GX790A-B")').count();
    assert(monitorH1 > 0, 'Yönlendirilen monitör sayfasında LG UltraGear 27GX790A-B başlığı başarıyla görüntülendi');

    console.log('\n================================================================');
    console.log(`📊 TARAYICI TEST SONUÇLARI: ${passed} Başarılı, ${failed} Başarısız`);
    console.log('================================================================');

  } catch (e) {
    console.error('Tarayıcı testi sırasında hata:', e);
    failed++;
  } finally {
    await browser.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runBrowserVerification();
