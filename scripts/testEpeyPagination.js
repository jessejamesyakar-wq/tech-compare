const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  
  const testUrls = [
    'https://www.epey.com/akilli-telefonlar/e/yt:1_m:30/1/',
    'https://www.epey.com/akilli-telefonlar/e/yt:1_m:30/2/',
    'https://www.epey.com/akilli-telefonlar/e/yt:1_m:30/3/',
    'https://www.epey.com/akilli-telefonlar/e/yt:1_m:30/4/',
    'https://www.epey.com/akilli-telefonlar/e/yt:1_m:30/5/'
  ];

  for (const u of testUrls) {
    await page.goto(u, { waitUntil: 'networkidle2' });
    const count = await page.evaluate(() => {
      return document.querySelectorAll('.urunadi, a.link, div.urun').length;
    });
    console.log(u, '-> Product count:', count);
  }

  await browser.close();
})();
