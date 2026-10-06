import { chromium } from 'playwright';
import { spawn } from 'child_process';
import http from 'http';

const PORT = 3019;
const BASE_URL = `http://localhost:${PORT}`;

function waitForServer(timeoutMs = 30000): Promise<void> {
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

const ROUTES = [
  { path: '/', name: 'Homepage' },
  { path: '/phones', name: 'Phones Category' },
  { path: '/laptops', name: 'Laptops Category' },
  { path: '/tvs', name: 'TVs Category' },
  { path: '/phones/samsung-galaxy-z-flip-8', name: 'Product Detail' },
  { path: '/search', name: 'Search' },
  { path: '/compare', name: 'Compare' },
];

interface TestResult {
  route: string;
  viewport: string;
  footerBg: string;
  footerColor: string;
  footerBorderTop: string;
  overflow: boolean;
  consoleErrors: string[];
  hydrationErrors: string[];
  footerCopyMatches: boolean;
  navWidth?: number;
  catBarWidth?: number;
}

async function run() {
  console.log(`Starting Next.js on port ${PORT}...`);
  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    cwd: process.cwd(),
    shell: true,
    stdio: 'ignore'
  });

  let hasFailures = false;
  let categoryPageBottomMismatch = 0;
  let footerVariantDrift = 0;
  let unintentionalDarkFooter = 0;
  let sharedContainerAlignmentErrors = 0;
  let totalConsoleErrors = 0;
  let totalHydrationErrors = 0;
  let totalOverflowErrors = 0;

  try {
    await waitForServer();
    console.log(`Server ready at ${BASE_URL}\n`);

    const browser = await chromium.launch({ headless: true });

    for (const route of ROUTES) {
      console.log(`Checking route: ${route.name} (${route.path})`);

      for (const vp of VIEWPORTS) {
        const page = await browser.newPage();
        await page.setViewportSize({ width: vp.width, height: vp.height });

        const consoleErrors: string[] = [];
        const hydrationErrors: string[] = [];

        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            const text = msg.text();
            consoleErrors.push(text);
            if (text.toLowerCase().includes('hydration') || text.toLowerCase().includes('did not match')) {
              hydrationErrors.push(text);
            }
          }
        });

        page.on('pageerror', (err) => {
          consoleErrors.push(err.message);
          if (err.message.toLowerCase().includes('hydration') || err.message.toLowerCase().includes('did not match')) {
            hydrationErrors.push(err.message);
          }
        });

        const res = await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
        // Wait a brief moment for hydration
        await page.waitForTimeout(500);

        const data = await page.evaluate(() => {
          const footer = document.querySelector('footer');
          const footerStyle = footer ? window.getComputedStyle(footer) : null;
          const footerBg = footerStyle ? footerStyle.backgroundColor : '';
          const footerColor = footerStyle ? footerStyle.color : '';
          const footerBorderTop = footerStyle ? footerStyle.borderTopColor : '';
          const footerText = footer ? footer.innerText : '';

          const scrollWidth = document.documentElement.scrollWidth;
          const innerWidth = window.innerWidth;
          const hasOverflow = scrollWidth > innerWidth;

          // Header container
          const headerContainer = document.querySelector('header > div');
          const catBarContainer = document.querySelector('nav[aria-label="Ürün kategorileri"]')?.parentElement;
          const navWidth = headerContainer ? headerContainer.getBoundingClientRect().width : 0;
          const catBarWidth = catBarContainer ? catBarContainer.getBoundingClientRect().width : 0;

          // Required footer text markers
          const hasTagline = footerText.includes('İhtiyacını anla') || footerText.includes('Seçeneklerini karşılaştır');
          const hasPromise = footerText.includes('Bilmediğimizi de söyleriz');
          const hasCopyright = footerText.includes('aceleEtme') && footerText.includes('hakları saklıdır');
          const hasLegalLinks = footerText.includes('Gizlilik Politikası') && footerText.includes('Kullanım Koşulları');

          return {
            footerBg,
            footerColor,
            footerBorderTop,
            hasOverflow,
            scrollWidth,
            innerWidth,
            navWidth,
            catBarWidth,
            hasTagline,
            hasPromise,
            hasCopyright,
            hasLegalLinks,
            isDark: footerBg.includes('15, 23, 42') || footerBg.includes('rgb(0, 0, 0)') || footerBg.includes('rgb(2, 6, 23)')
          };
        });

        // Evaluate footer consistency
        // Expected light ice-blue background: rgb(248, 250, 254)
        const isExpectedBg = data.footerBg === 'rgb(248, 250, 254)';
        if (!isExpectedBg) {
          footerVariantDrift++;
          if (data.isDark) {
            unintentionalDarkFooter++;
            categoryPageBottomMismatch++;
          }
        }

        if (data.hasOverflow) {
          totalOverflowErrors++;
          console.warn(`  [OVERFLOW] ${route.name} @ ${vp.name}px: scrollWidth=${data.scrollWidth}, innerWidth=${data.innerWidth}`);
        }

        if (consoleErrors.length > 0) totalConsoleErrors += consoleErrors.length;
        if (hydrationErrors.length > 0) totalHydrationErrors += hydrationErrors.length;

        // Container alignment check on desktop (1024, 1440)
        if (vp.width >= 1024 && data.navWidth > 0 && data.catBarWidth > 0) {
          const diff = Math.abs(data.navWidth - data.catBarWidth);
          if (diff > 2) {
            sharedContainerAlignmentErrors++;
            console.warn(`  [ALIGNMENT] ${route.name} @ ${vp.name}px: navWidth=${data.navWidth} vs catBarWidth=${data.catBarWidth} (diff=${diff})`);
          }
        }

        await page.close();
      }
    }

    await browser.close();

    console.log(`\n================================================================`);
    console.log(`HARD FIX 04 PLAYWRIGHT VERIFICATION SUMMARY`);
    console.log(`================================================================`);
    console.log(`CATEGORY_PAGE_BOTTOM_VISUAL_MISMATCH = ${categoryPageBottomMismatch}`);
    console.log(`FOOTER_VARIANT_DRIFT = ${footerVariantDrift}`);
    console.log(`UNINTENTIONAL_DARK_FOOTER_OR_BOTTOM_SECTION = ${unintentionalDarkFooter}`);
    console.log(`SHARED_CONTAINER_ALIGNMENT_ERRORS = ${sharedContainerAlignmentErrors}`);
    console.log(`OVERFLOW_ERRORS = ${totalOverflowErrors}`);
    console.log(`CONSOLE_ERRORS = ${totalConsoleErrors}`);
    console.log(`HYDRATION_ERRORS = ${totalHydrationErrors}`);
    console.log(`================================================================\n`);

    if (categoryPageBottomMismatch > 0 || footerVariantDrift > 0 || unintentionalDarkFooter > 0 || totalOverflowErrors > 0) {
      process.exit(1);
    }
  } finally {
    server.kill();
  }
}

run().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
