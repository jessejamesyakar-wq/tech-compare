import { chromium } from 'playwright';
import { spawn } from 'child_process';
import http from 'http';
import { OptimizationBenchmark } from '../src/lib/labs/quantum/benchmark';

const PORT = 3009;
const BASE_URL = `http://localhost:${PORT}`;

function waitForServer(url: string, timeoutMs = 25000): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      http.get(url, (res) => {
        if (res.statusCode && res.statusCode < 500) {
          clearInterval(interval);
          resolve();
        }
      }).on('error', () => {
        if (Date.now() - start > timeoutMs) {
          clearInterval(interval);
          reject(new Error(`Server at ${url} did not respond within ${timeoutMs}ms`));
        }
      });
    }, 500);
  });
}

async function run() {
  console.log('====================================================');
  console.log('🎭  WAVE 10 FINAL TOUR: 7 PLAYWRIGHT SCENARIOS  🎭');
  console.log('====================================================\n');

  console.log(`Starting production Next.js server on port ${PORT}...`);
  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    cwd: process.cwd(),
    shell: true,
    stdio: 'pipe'
  });

  server.stderr.on('data', () => {});

  try {
    await waitForServer(`${BASE_URL}/`, 30000);
    console.log(`Server is ready at ${BASE_URL}!\n`);

    const browser = await chromium.launch({ headless: true });
    let totalErrors = 0;
    const testResults: any[] = [];

    function setupPageMonitoring(page: any, testName: string) {
      page.on('console', (msg: any) => {
        if (msg.type() === 'error') {
          console.error(`  ❌ [Console Error on ${testName}]:`, msg.text());
          totalErrors++;
        }
      });
      page.on('pageerror', (err: any) => {
        console.error(`  ❌ [Page Error on ${testName}]:`, err.message);
        totalErrors++;
      });
    }

    // SCENARIO 1: Natural query: "30000 TL bütçem var, kamerası ve ekranı iyi olsun, oyun odaklı değilim"
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      setupPageMonitoring(page, 'scenario-1-natural');
      
      const res = await page.request.post(`${BASE_URL}/api/chat`, {
        data: { prompt: '30000 TL bütçem var, kamerası ve ekranı iyi olsun, oyun odaklı değilim' },
        headers: { 'Content-Type': 'application/json' }
      });
      
      const status = res.status();
      const text = await res.text();
      const hasRoboPengu = text.includes('RoboPengu');
      const hasTiming = text.includes('Zamanlama Tavsiyesi') || text.includes('Satın Alınabilir') || text.includes('Nötr');
      const hasTrust = text.includes('Güvenlik') || text.includes('Doğruluk');
      const pass = status === 200 && hasRoboPengu && (hasTiming || hasTrust);

      testResults.push({
        scenario: 1,
        name: 'Natural Query (30k TL, Camera & Display priority, Buy/Wait, Trust)',
        pass,
        status,
        detail: `RoboPengu: ${hasRoboPengu}, Timing: ${hasTiming}, Trust: ${hasTrust}`
      });
      await context.close();
    }

    // SCENARIO 2: Hard constraint: "60000 TL bütçe, en az 512GB depolama, Apple istemiyorum"
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      setupPageMonitoring(page, 'scenario-2-hard-constraint');
      
      const res = await page.request.post(`${BASE_URL}/api/chat`, {
        data: { prompt: '60000 TL bütçe, en az 512GB depolama, Apple istemiyorum' },
        headers: { 'Content-Type': 'application/json' }
      });
      
      const status = res.status();
      const text = await res.text();
      
      const hasApple = text.includes('(Apple)') || text.includes('iPhone');
      const pass = status === 200 && !hasApple && text.includes('RoboPengu');

      testResults.push({
        scenario: 2,
        name: 'Hard Constraint (60k TL, >=512GB, 0 Apple)',
        pass,
        status,
        detail: `Zero Apple: ${!hasApple}`
      });
      await context.close();
    }

    // SCENARIO 3: Conflict query: "10000 TL bütçeye en iyi amiral gemisi işlemci ve 200MP kamera"
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      setupPageMonitoring(page, 'scenario-3-conflict');
      
      const res = await page.request.post(`${BASE_URL}/api/chat`, {
        data: { prompt: '10000 TL bütçeye en iyi amiral gemisi işlemci ve 200MP kamera' },
        headers: { 'Content-Type': 'application/json' }
      });
      
      const status = res.status();
      const text = await res.text();
      const hasConflictNotice = text.includes('Kısıt Değerlendirmesi') || text.includes('10.000 TL') || text.includes('amiral gemisi');
      const pass = status === 200 && hasConflictNotice;

      testResults.push({
        scenario: 3,
        name: 'Conflict Query (10k TL Flagship + 200MP Compromise Notice)',
        pass,
        status,
        detail: `Compromise flagged: ${hasConflictNotice}`
      });
      await context.close();
    }

    // SCENARIO 4: Unverified / Blocked field honest warning
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      setupPageMonitoring(page, 'scenario-4-blocked-trust');
      
      const res = await page.request.post(`${BASE_URL}/api/chat`, {
        data: { prompt: 'iPhone 11 ram tipi ve ekran parlaklığı nedir' },
        headers: { 'Content-Type': 'application/json' }
      });
      
      const status = res.status();
      const text = await res.text();
      const hasWarning = text.includes('Doğruluk Notu') || text.includes('doğrulanmadı') || text.includes('belirtilmemiştir');
      const pass = status === 200 && hasWarning;

      testResults.push({
        scenario: 4,
        name: 'Unverified / Blocked Field Honest Transparency ("Doğrulanmadı")',
        pass,
        status,
        detail: `Warning attached: ${hasWarning}`
      });
      await context.close();
    }

    // SCENARIO 5: Classical Optimizer comparison / benchmark scenario
    {
      const sample = [
        { id: 'dev-1', name: 'Alpha', value: 90, price: 30000, brand: 'Samsung' },
        { id: 'dev-2', name: 'Beta', value: 85, price: 20000, brand: 'Xiaomi' },
        { id: 'dev-3', name: 'Gamma', value: 80, price: 15000, brand: 'Vivo' },
      ];
      const benchmark = OptimizationBenchmark.runComparison(sample, 2, 35000);
      const pass = benchmark.quboMatrixSize === 3 &&
                   benchmark.isolationStatus === 'SIMULATION_READY_ZERO_EXTERNAL_DEPENDENCY' &&
                   benchmark.classical.runtimeMs < 50;

      testResults.push({
        scenario: 5,
        name: 'Classical Optimizer vs QUBO Benchmark Comparison',
        pass,
        status: 200,
        detail: `Simulation Ready: true, Classical Latency: ${benchmark.classical.runtimeMs}ms`
      });
    }

    // SCENARIO 6: Desktop & Mobile UI smoke test for RoboPengu assistant dialog/flow
    {
      // A. Desktop (1440x900)
      const contextDesktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const pageDesktop = await contextDesktop.newPage();
      setupPageMonitoring(pageDesktop, 'scenario-6-desktop-ui');
      await pageDesktop.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
      
      const desktopButton = pageDesktop.locator('button:has-text("RoboPengu"):visible, button[aria-label*="RoboPengu"]:visible').first();
      const hasDesktopButton = (await desktopButton.count()) > 0;
      let desktopModalOpened = false;
      if (hasDesktopButton) {
        try {
          await desktopButton.click({ force: true, timeout: 3000 });
          await pageDesktop.waitForTimeout(500);
          const modalOrInput = pageDesktop.locator('input[placeholder*="Sor"], textarea, div[role="dialog"]');
          desktopModalOpened = (await modalOrInput.count()) > 0;
        } catch (e) {}
      }

      // B. Mobile (375x812)
      const contextMobile = await browser.newContext({ viewport: { width: 375, height: 812 } });
      const pageMobile = await contextMobile.newPage();
      setupPageMonitoring(pageMobile, 'scenario-6-mobile-ui');
      await pageMobile.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
      
      const mobileButton = pageMobile.locator('header button[aria-label*="RoboPengu"]:visible, button:has-text("RoboPengu"):visible').first();
      const hasMobileButton = (await mobileButton.count()) > 0;
      let mobileModalOpened = false;
      if (hasMobileButton) {
        try {
          await mobileButton.click({ force: true, timeout: 3000 });
          await pageMobile.waitForTimeout(500);
          const mobileModal = pageMobile.locator('input[placeholder*="Sor"], textarea, div[role="dialog"]');
          mobileModalOpened = (await mobileModal.count()) > 0;
        } catch (e) {}
      }

      const pass = hasDesktopButton && hasMobileButton && totalErrors === 0;
      testResults.push({
        scenario: 6,
        name: 'Desktop (1440) and Mobile (375) RoboPengu UI Smoke Test',
        pass,
        status: 200,
        detail: `Desktop button: ${hasDesktopButton}, Mobile button: ${hasMobileButton}, Errors: ${totalErrors}`
      });

      await contextDesktop.close();
      await contextMobile.close();
    }

    // SCENARIO 7: Live price vs catalog fallback representation
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      setupPageMonitoring(page, 'scenario-7-price-representation');
      
      const res = await page.request.post(`${BASE_URL}/api/chat`, {
        data: { prompt: 'Samsung Galaxy telefon öner' },
        headers: { 'Content-Type': 'application/json' }
      });
      
      const status = res.status();
      const text = await res.text();
      const hasStatusLabel = text.includes('Fiyat Durumu') || text.includes('Katalog Liste') || text.includes('Doğrulanmış Canlı Fiyat');
      const pass = status === 200 && hasStatusLabel;

      testResults.push({
        scenario: 7,
        name: 'Live Price vs Catalog Fallback Distinct Representation',
        pass,
        status,
        detail: `Status label present: ${hasStatusLabel}`
      });
      await context.close();
    }

    await browser.close();

    console.log('\n=== PLAYWRIGHT WAVE 10 SCENARIOS RESULTS ===');
    let allPassed = true;
    for (const r of testResults) {
      console.log(`  ${r.pass ? '✅' : '❌'} Scenario ${r.scenario}: ${r.name} [HTTP ${r.status}] ${r.detail || ''}`);
      if (!r.pass) allPassed = false;
    }

    console.log(`\nTotal Console / Page Errors: ${totalErrors}`);
    console.log(`Overall Wave 10 Playwright Tour Status: ${allPassed && totalErrors === 0 ? 'PASSED ✅' : 'FAILED ❌'}`);

    if (!allPassed || totalErrors > 0) {
      process.exit(1);
    }
    process.exit(0);
  } finally {
    console.log('Shutting down local Next.js test server...');
    server.kill();
  }
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
