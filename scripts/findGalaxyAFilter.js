const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  await page.goto('https://www.epey.com/akilli-telefonlar/', { waitUntil: 'networkidle2' });

  const filterLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => ({ href: a.href, text: a.innerText.trim() })).filter(x => x.text.toLowerCase().includes('galaxy a') || x.href.includes('galaxy-a'));
  });

  console.log('Galaxy A filter links found:', filterLinks);
  await browser.close();
})();
