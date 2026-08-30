const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
  
  await page.goto('https://www.epey.com/akilli-telefonlar/samsung-galaxy-a55-5g.html', { waitUntil: 'networkidle2' });
  const title = await page.title();
  console.log('Title:', title);
  
  const imgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(i => ({ src: i.src, dataSrc: i.getAttribute('data-src') }));
  });
  console.log('Images found:', imgs);
  await browser.close();
})();
