const { chromium } = require('playwright');

const categories = [
  'phones',
  'laptops',
  'tvs',
  'tablets',
  'smartwatches',
  'headphones',
  'monitors',
  'appliances',
  'consoles'
];

const viewports = [
  { width: 375, height: 667, name: '375' },
  { width: 430, height: 932, name: '430' },
  { width: 768, height: 1024, name: '768' },
  { width: 1024, height: 768, name: '1024' },
  { width: 1440, height: 900, name: '1440' }
];

async function verifyAllCategories() {
  const browser = await chromium.launch({ headless: true });
  let consoleErrors = 0;
  let pageErrors = 0;
  let hydrationErrors = 0;
  let overflowErrors = 0;

  for (const cat of categories) {
    const url = `http://localhost:3001/${cat}`;
    for (const vp of viewports) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });

      page.on('console', msg => {
        if (msg.type() === 'error') {
          const text = msg.text();
          if (text.includes('Hydration') || text.includes('hydrat')) {
            hydrationErrors++;
          }
          consoleErrors++;
          console.log(`[Console Error][${cat}][${vp.name}]:`, text);
        }
      });

      page.on('pageerror', err => {
        if (err.message.includes('Hydration') || err.message.includes('hydrat')) {
          hydrationErrors++;
        }
        pageErrors++;
        console.log(`[Page Error][${cat}][${vp.name}]:`, err.message);
      });

      const res = await page.goto(url, { waitUntil: 'domcontentloaded' });
      if (res.status() !== 200) {
        console.error(`[HTTP Error][${cat}]: status ${res.status()}`);
      }

      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      if (hasOverflow) {
        overflowErrors++;
        console.error(`[Overflow Error][${cat}][${vp.name}]`);
      }

      await page.close();
    }
    console.log(`[OK] Category /${cat} passed all 5 viewports`);
  }

  await browser.close();

  console.log('\n--- ALL CATEGORIES PLAYWRIGHT VERIFICATION ---');
  console.log('CONSOLE_ERRORS:', consoleErrors);
  console.log('PAGE_ERRORS:', pageErrors);
  console.log('HYDRATION_ERRORS:', hydrationErrors);
  console.log('OVERFLOW_ERRORS:', overflowErrors);

  if (consoleErrors > 0 || pageErrors > 0 || hydrationErrors > 0 || overflowErrors > 0) {
    process.exit(1);
  }
}

verifyAllCategories().catch(e => {
  console.error('Test suite failed:', e);
  process.exit(1);
});
