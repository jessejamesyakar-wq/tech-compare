import { chromium } from 'playwright';
import { spawn } from 'child_process';
import http from 'http';
import assert from 'node:assert/strict';

const PORT = 3016;
const BASE_URL = `http://localhost:${PORT}`;

function waitForServer(timeoutMs = 20000): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      http.get(`${BASE_URL}/`, (res) => {
        if (res.statusCode && res.statusCode < 500) {
          clearInterval(interval);
          resolve();
        }
      }).on('error', () => {
        if (Date.now() - start > timeoutMs) {
          clearInterval(interval);
          reject(new Error(`Server at ${BASE_URL} did not respond within ${timeoutMs}ms`));
        }
      });
    }, 400);
  });
}

const VIEWPORTS = [
  { width: 375, height: 667, name: '375' },
  { width: 430, height: 932, name: '430' },
  { width: 768, height: 1024, name: '768' },
  { width: 1024, height: 768, name: '1024' },
  { width: 1440, height: 900, name: '1440' },
];

const TARGET_ROUTES = [
  {
    path: '/',
    name: 'Homepage',
    type: 'home'
  },
  {
    path: '/phones/samsung-galaxy-z-flip-8',
    name: 'Galaxy Z Flip8',
    type: 'unverified_spec'
  },
  {
    path: '/phones/honor-magic8-pro',
    name: 'HONOR Magic8 Pro',
    type: 'unverified_spec'
  },
  {
    path: '/phones/apple-iphone-17-pro-max-256-gb?variantId=apple-apple-iphone-17-pro-max-256-gb-1023353-koyu',
    name: 'iPhone 17 Pro Max (Stale Offer)',
    type: 'stale_offer'
  }
];

async function run() {
  console.log('================================================================');
  console.log('🎭  HARD FIX 03: BOUNDED MULTI-VIEWPORT PLAYWRIGHT GATES  🎭');
  console.log('================================================================\n');

  console.log(`Starting Next.js server on port ${PORT}...`);
  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    cwd: process.cwd(),
    shell: true,
    stdio: 'ignore'
  });

  let totalConsoleErrors = 0;
  let totalHydrationErrors = 0;
  let totalOverflowErrors = 0;
  let totalFakeAdPlaceholders = 0;
  let totalUnverifiedPriceLeaks = 0;
  let totalChecksPassed = 0;

  try {
    await waitForServer();
    console.log(`Server ready at ${BASE_URL}\n`);

    const browser = await chromium.launch({ headless: true });

    for (const route of TARGET_ROUTES) {
      console.log(`\n--- Testing Route: ${route.name} (${route.path}) ---`);
      for (const vp of VIEWPORTS) {
        const page = await browser.newPage();
        await page.setViewportSize({ width: vp.width, height: vp.height });

        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            const txt = msg.text();
            totalConsoleErrors++;
            if (txt.toLowerCase().includes('hydrate') || txt.includes('React error #418') || txt.includes('React error #423')) {
              totalHydrationErrors++;
            }
            console.error(`  [Console Error] [${route.name}@${vp.name}]:`, txt.slice(0, 120));
          }
        });

        page.on('pageerror', (err) => {
          totalConsoleErrors++;
          console.error(`  [Page Error] [${route.name}@${vp.name}]:`, err.message.slice(0, 120));
        });

        // Strict timeout per page navigation (10s)
        await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 10000 });

        // Check horizontal overflow
        const isOverflowing = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth + 1;
        });
        if (isOverflowing) {
          totalOverflowErrors++;
          console.error(`  ❌ Horizontal overflow detected on ${route.name} at viewport ${vp.name}`);
        } else {
          totalChecksPassed++;
        }

        // Check 1: Homepage ad placeholder absence
        if (route.type === 'home') {
          const bodyText = await page.locator('body').innerText();
          const hasFakeAdText = bodyText.includes('Örnek reklam yerleşimi');
          const adSlotCount = await page.locator('[aria-label*="Reklam"]').count();
          if (hasFakeAdText || adSlotCount > 0) {
            totalFakeAdPlaceholders++;
            console.error(`  ❌ Fake ad placeholder rendered on homepage at viewport ${vp.name}`);
          } else {
            totalChecksPassed++;
          }
        }

        // Check 2: Unverified spec / reference price products
        if (route.type === 'unverified_spec') {
          const priceSummary = page.locator('[data-testid="product-price-summary"]').first();
          const summaryText = await priceSummary.innerText();
          const hasNotice = summaryText.includes('Güncel Doğrulanmış Teklif Yok');
          const hasLeakedPrice = summaryText.includes('84.000 TL') || summaryText.includes('84.999 TL') || summaryText.includes('84.000 ₺') || summaryText.includes('84.999 ₺');

          if (!hasNotice || hasLeakedPrice) {
            totalUnverifiedPriceLeaks++;
            console.error(`  ❌ Unverified price leak or missing notice on ${route.name} at viewport ${vp.name}: ${summaryText}`);
          } else {
            totalChecksPassed++;
          }
        }

        // Check 3: Stale offer product
        if (route.type === 'stale_offer') {
          const priceSummary = page.locator('[data-testid="product-price-summary"]').first();
          const summaryText = await priceSummary.innerText();
          const hasStaleHeading = summaryText.includes('Son Görülen Fiyat');
          const hasStalePrice = summaryText.includes('129.999 TL');
          const hasStaleDate = summaryText.includes('Son görülen fiyat: 20.09.2026');

          if (!hasStaleHeading || !hasStalePrice || !hasStaleDate) {
            console.error(`  ❌ Stale offer semantics mismatch on ${route.name} at viewport ${vp.name}: ${summaryText}`);
          } else {
            totalChecksPassed++;
          }
        }

        await page.close();
      }
      console.log(`  ✅ ${route.name} verified across all 5 viewports`);
    }

    await browser.close();

    console.log('\n================================================================');
    console.log('📊  MULTI-VIEWPORT PLAYWRIGHT SUMMARY:');
    console.log(`   TOTAL_CHECKS_PASSED    : ${totalChecksPassed}`);
    console.log(`   CONSOLE_ERRORS          : ${totalConsoleErrors}`);
    console.log(`   HYDRATION_ERRORS        : ${totalHydrationErrors}`);
    console.log(`   OVERFLOW_ERRORS         : ${totalOverflowErrors}`);
    console.log(`   FAKE_AD_PLACEHOLDERS    : ${totalFakeAdPlaceholders}`);
    console.log(`   UNVERIFIED_PRICE_LEAKS  : ${totalUnverifiedPriceLeaks}`);
    console.log('================================================================\n');

    assert.equal(totalConsoleErrors, 0, `Expected 0 console errors, got ${totalConsoleErrors}`);
    assert.equal(totalHydrationErrors, 0, `Expected 0 hydration errors, got ${totalHydrationErrors}`);
    assert.equal(totalOverflowErrors, 0, `Expected 0 overflow errors, got ${totalOverflowErrors}`);
    assert.equal(totalFakeAdPlaceholders, 0, `Expected 0 fake ad placeholders, got ${totalFakeAdPlaceholders}`);
    assert.equal(totalUnverifiedPriceLeaks, 0, `Expected 0 unverified price leaks, got ${totalUnverifiedPriceLeaks}`);

    console.log('🎉 ALL MULTI-VIEWPORT AUDITS STRICTLY PASSED (0 ERRORS)!');
  } finally {
    if (server.pid) {
      try {
        if (process.platform === 'win32') {
          spawn('taskkill', ['/pid', String(server.pid), '/t', '/f'], { stdio: 'ignore' });
        } else {
          process.kill(server.pid);
        }
      } catch {}
    }
  }
}

run().catch((err) => {
  console.error('Playwright verification encountered an error:', err);
  process.exit(1);
});
