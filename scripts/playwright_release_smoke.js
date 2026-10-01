const { chromium } = require('playwright');
const { spawn } = require('child_process');
const http = require('http');

const PORT = 3005;
const BASE_URL = `http://localhost:${PORT}`;

function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      http.get(url, (res) => {
        if (res.statusCode < 500) {
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
  console.log('🎭  WAVE 8 RELEASE GATE: PLAYWRIGHT SMOKE SUITE  🎭');
  console.log('====================================================\n');

  console.log(`Starting production Next.js server on port ${PORT}...`);
  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    cwd: process.cwd(),
    shell: true,
    stdio: 'pipe'
  });

  server.stdout.on('data', d => {
    // console.log(`[Next.js stdout] ${d}`);
  });
  server.stderr.on('data', d => {
    console.error(`[Next.js stderr] ${d}`);
  });

  try {
    await waitForServer(`${BASE_URL}/`, 25000);
    console.log(`Server is ready at ${BASE_URL}!\n`);

    const browser = await chromium.launch({ headless: true });
    let totalErrors = 0;
    const testResults = [];

    function setupPageMonitoring(page, testName) {
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.error(`  ❌ [Console Error on ${testName}]:`, msg.text());
          totalErrors++;
        }
      });
      page.on('pageerror', err => {
        console.error(`  ❌ [Page Error on ${testName}]:`, err.message);
        totalErrors++;
      });
    }

    // 1. Homepage 1440
    {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      setupPageMonitoring(page, 'homepage-1440');
      const res = await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
      const status = res.status();
      const content = await page.content();
      const pass = status === 200 && !content.includes('Hydration failed') && totalErrors === 0;
      testResults.push({ name: 'Homepage (1440px)', pass, status });
      await context.close();
    }

    // 2. Phones 375
    {
      const context = await browser.newContext({ viewport: { width: 375, height: 667 } });
      const page = await context.newPage();
      setupPageMonitoring(page, 'phones-375');
      const res = await page.goto(`${BASE_URL}/phones`, { waitUntil: 'domcontentloaded' });
      const status = res.status();
      const content = await page.content();
      const pass = status === 200 && !content.includes('Hydration failed') && totalErrors === 0;
      testResults.push({ name: 'Phones Listing (375px)', pass, status });
      await context.close();
    }

    // 3. Compare 768
    {
      const context = await browser.newContext({ viewport: { width: 768, height: 1024 } });
      const page = await context.newPage();
      setupPageMonitoring(page, 'compare-768');
      const res = await page.goto(`${BASE_URL}/compare`, { waitUntil: 'domcontentloaded' });
      const status = res.status();
      const content = await page.content();
      const pass = status === 200 && !content.includes('Hydration failed') && totalErrors === 0;
      testResults.push({ name: 'Compare (768px)', pass, status });
      await context.close();
    }

    // 4. Search
    {
      const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await context.newPage();
      setupPageMonitoring(page, 'search');
      const res = await page.goto(`${BASE_URL}/search?q=Samsung`, { waitUntil: 'domcontentloaded' });
      const status = res.status();
      const content = await page.content();
      const pass = status === 200 && !content.includes('Hydration failed') && totalErrors === 0;
      testResults.push({ name: 'Search Interface', pass, status });
      await context.close();
    }

    // 5. 3 Process Patch Samples
    const processSamples = [
      { slug: 'samsung-samsung-galaxy-s25-107', name: 'Samsung Galaxy S25 (256 GB)' },
      { slug: 'samsung-samsung-galaxy-s25-108', name: 'Samsung Galaxy S25+ (256 GB)' },
      { slug: 'samsung-samsung-galaxy-s25-ultra-109', name: 'Samsung Galaxy S25 Ultra (512 GB)' }
    ];

    for (const s of processSamples) {
      const context = await browser.newContext();
      const page = await context.newPage();
      setupPageMonitoring(page, `process-patch-${s.slug}`);
      const res = await page.goto(`${BASE_URL}/phones/${s.slug}`, { waitUntil: 'domcontentloaded' });
      const status = res.status();
      const content = await page.content();
      const hasNode = content.includes('TSMC 3nm') || content.includes('3nm');
      const pass = status === 200 && hasNode && totalErrors === 0;
      testResults.push({ name: `Process Patch: ${s.name}`, pass, status, detail: `Found node: ${hasNode}` });
      await context.close();
    }

    // 6. Brightness V2 Sample
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      setupPageMonitoring(page, 'brightness-v2');
      const res = await page.goto(`${BASE_URL}/phones/samsung-galaxy-s24-ultra`, { waitUntil: 'domcontentloaded' });
      const status = res.status();
      const content = await page.content();
      const hasNits = content.includes('nits') || content.includes('Nit');
      const pass = status === 200 && hasNits && totalErrors === 0;
      testResults.push({ name: 'Brightness V2 Presence', pass, status, detail: `Has nits: ${hasNits}` });
      await context.close();
    }

    // 7. Camera V2 Regression
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      setupPageMonitoring(page, 'camera-v2');
      const res = await page.goto(`${BASE_URL}/phones/vivo-y29s-5g`, { waitUntil: 'domcontentloaded' });
      const status = res.status();
      const content = await page.content();
      const pass = status === 200 && content.includes('50 MP') && totalErrors === 0;
      testResults.push({ name: 'Camera V2 Regression Guard', pass, status });
      await context.close();
    }

    // 8. Galaxy A57 Regression Guard
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      setupPageMonitoring(page, 'a57-guard');
      const res = await page.goto(`${BASE_URL}/phones/samsung-galaxy-a57-5g-128gb`, { waitUntil: 'domcontentloaded' });
      const status = res.status();
      const content = await page.content();
      const cleanCamera = !content.includes('50 MP + 45W');
      const pass = status === 200 && cleanCamera && totalErrors === 0;
      testResults.push({ name: 'Galaxy A57 Regression Guard', pass, status, detail: `Clean camera: ${cleanCamera}` });
      await context.close();
    }

    // 9. Golden Overlay Sample
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      setupPageMonitoring(page, 'golden-overlay');
      const res = await page.goto(`${BASE_URL}/phones/samsung-galaxy-s25-128gb`, { waitUntil: 'domcontentloaded' });
      const status = res.status();
      const content = await page.content();
      const hasNode = content.includes('TSMC 3nm') || content.includes('3nm');
      const pass = status === 200 && hasNode && totalErrors === 0;
      testResults.push({ name: 'Golden Overlay: Galaxy S25', pass, status, detail: `Rendered node: ${hasNode}` });
      await context.close();
    }

    // 10. Huawei Canonical Redirect (308 -> 200)
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      setupPageMonitoring(page, 'huawei-redirect');
      const res = await page.goto(`${BASE_URL}/phones/huawei-p40-pro-1`, { waitUntil: 'domcontentloaded' });
      const finalUrl = page.url();
      const status = res.status();
      const isRedirected = finalUrl.endsWith('/phones/huawei-p40-pro');
      const pass = status === 200 && isRedirected && totalErrors === 0;
      testResults.push({ name: 'Huawei Canonical Redirect', pass, status, detail: `Redirected to: ${finalUrl}` });
      await context.close();
    }

    // 11. Price & RoboPengu Fallback Health Check
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      setupPageMonitoring(page, 'health-api');
      const res = await page.goto(`${BASE_URL}/api/health`, { waitUntil: 'domcontentloaded' });
      const status = res.status();
      const text = await page.content();
      const pass = status === 200 && text.includes('UP') && text.includes('FALLBACK') && totalErrors === 0;
      testResults.push({ name: 'Price & RoboPengu Fallback Health', pass, status });
      await context.close();
    }

    await browser.close();

    console.log('=== TEST RESULTS ===');
    let allPassed = true;
    for (const r of testResults) {
      console.log(`  ${r.pass ? '✅' : '❌'} ${r.name} [HTTP ${r.status}] ${r.detail || ''}`);
      if (!r.pass) allPassed = false;
    }

    console.log(`\nTotal Console / Page Errors: ${totalErrors}`);
    console.log(`Overall Status: ${allPassed && totalErrors === 0 ? 'PASSED ✅' : 'FAILED ❌'}`);

    if (!allPassed || totalErrors > 0) {
      process.exit(1);
    }
  } finally {
    console.log('Shutting down local Next.js test server...');
    server.kill();
  }
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
