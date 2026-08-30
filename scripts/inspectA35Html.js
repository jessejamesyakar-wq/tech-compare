const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  
  await page.goto('https://www.epey.com/akilli-telefonlar/samsung-galaxy-a35.html', { waitUntil: 'networkidle2' });
  const html = await page.content();
  fs.writeFileSync('./data/a35_epey.html', html, 'utf8');
  console.log('Saved a35_epey.html. Length:', html.length);
  
  const matches = html.match(/https:\/\/resim\.epey\.com\/[^\"]+/gi);
  console.log('Matches:', matches ? matches.slice(0, 10) : 'None');
  
  await browser.close();
})();
