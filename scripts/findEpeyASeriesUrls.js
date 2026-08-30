const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
  
  await page.goto('https://www.epey.com/', { waitUntil: 'domcontentloaded' });

  // Type in search bar
  const searchInput = await page.$('input[name="q"], #arama');
  if (searchInput) {
    await searchInput.type('Samsung Galaxy A55');
    await new Promise(r => setTimeout(r, 2500));

    const results = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a')).map(a => ({ href: a.href, text: a.innerText })).filter(x => x.text.includes('A55') || x.href.includes('a55'));
    });
    console.log('Search autocomplete results:', results);
  } else {
    console.log('Search input not found');
  }

  await browser.close();
})();
