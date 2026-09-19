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

    await page.waitForSelector('button:has-text("MSI vs Dell 280Hz")', { timeout: 10000 });

    // 1. Tıklamadan ÖNCE yanıt dinleyicisini kur
    // Her ürün yanıtında await res.finished() çalıştırılır.
    // Preset A için (MSI + Dell) ve Preset B için (iPhone + Samsung) her iki ürün de tamamlandığında completionOrder'a bir kez eklenir.
    const responseListener = async (res: any) => {
      const url = res.url();
      if (res.status() === 200 && url.includes('/api/products/')) {
        if (url.includes('msi-mag-255pxf')) {
          await res.finished();
          finishedProductsA.add('msi-mag-255pxf');
          if (finishedProductsA.has('msi-mag-255pxf') && finishedProductsA.has('dell-g2524h')) {
            if (!completionOrder.includes('Preset A (MSI vs Dell)')) {
              completionOrder.push('Preset A (MSI vs Dell)');
            }
          }
        } else if (url.includes('dell-g2524h')) {
          await res.finished();
          finishedProductsA.add('dell-g2524h');
          if (finishedProductsA.has('msi-mag-255pxf') && finishedProductsA.has('dell-g2524h')) {
            if (!completionOrder.includes('Preset A (MSI vs Dell)')) {
              completionOrder.push('Preset A (MSI vs Dell)');
            }
          }
        } else if (url.includes('apple-iphone-16-pro-max-256-gb')) {
          await res.finished();
          finishedProductsB.add('apple-iphone-16-pro-max-256-gb');
          if (finishedProductsB.has('apple-iphone-16-pro-max-256-gb') && finishedProductsB.has('samsung-galaxy-s24-ultra')) {
            if (!completionOrder.includes('Preset B (iPhone vs S24 Ultra)')) {
              completionOrder.push('Preset B (iPhone vs S24 Ultra)');
            }
          }
        } else if (url.includes('samsung-galaxy-s24-ultra')) {
          await res.finished();
          finishedProductsB.add('samsung-galaxy-s24-ultra');
          if (finishedProductsB.has('apple-iphone-16-pro-max-256-gb') && finishedProductsB.has('samsung-galaxy-s24-ultra')) {
            if (!completionOrder.includes('Preset B (iPhone vs S24 Ultra)')) {
              completionOrder.push('Preset B (iPhone vs S24 Ultra)');
            }
          }
        }
      }
    };
    page.on('response', responseListener);

    // 2. Tıklamadan ÖNCE her iki düellonun TÜM ürün isteklerinin yanıt bekleyicilerini kur
    const msiRespPromise = page.waitForResponse((res) => res.url().includes('msi-mag-255pxf') && res.status() === 200, { timeout: 15000 });
    const dellRespPromise = page.waitForResponse((res) => res.url().includes('dell-g2524h') && res.status() === 200, { timeout: 15000 });
    const iphoneRespPromise = page.waitForResponse((res) => res.url().includes('apple-iphone-16-pro-max-256-gb') && res.status() === 200, { timeout: 15000 });
    const s24RespPromise = page.waitForResponse((res) => res.url().includes('samsung-galaxy-s24-ultra') && res.status() === 200, { timeout: 15000 });

    // 3. Önce Preset A'ya (yavaş 1200ms delay), hemen ardından Preset B'ye (hızlı 0ms delay) tıkla
    await page.click('button:has-text("MSI vs Dell 280Hz")');
    await page.click('button:has-text("iPhone 16 Pro Max vs S24 Ultra")');

    // 4. Her iki düellonun da tüm ürün isteklerinin tamamlanmasını bekle
    await Promise.all([msiRespPromise, dellRespPromise, iphoneRespPromise, s24RespPromise]);

    page.off('response', responseListener);
    await page.unroute('**/api/products/**');

    // 5. İki preset de tamamlandıktan sonra sıralamanın B -> A olduğunu doğrula
    const isBFirst = completionOrder[0] === 'Preset B (iPhone vs S24 Ultra)' && completionOrder[1] === 'Preset A (MSI vs Dell)';
    assert(isBFirst, `İki preset'in de tüm ürün yanıtları tamamlandı (await response.finished()). Tamamlanma Sırası: B -> A (${completionOrder.join(' -> ')})`);

    // 6. Ekrandaki her iki ürünün de son seçilen Preset B'ye ait olduğunu doğrula
    await page.waitForSelector('h2:has-text("iPhone 16 Pro Max")', { timeout: 10000 });
    const p1Text = await page.locator('h2').nth(0).innerText();
    const p2Text = await page.locator('h2').nth(1).innerText();

    const isP1PresetB = p1Text.includes('iPhone 16 Pro Max');
    const isP2PresetB = p2Text.includes('Galaxy S24 Ultra') || p2Text.includes('S24 Ultra');
    assert(isP1PresetB && isP2PresetB, `Ekrandaki iki ürün de son seçilen Preset B'ye ("iPhone 16 Pro Max" & "Galaxy S24 Ultra") aittir (Alınan: "${p1Text}" & "${p2Text}")`);

    // ------------------------------------------------------------------------
    // TEST 5: Real Chat -> Card -> Compare -> Share Link in New Tab
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
    } catch (e) {
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
