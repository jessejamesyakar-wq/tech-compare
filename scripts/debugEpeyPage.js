const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

  await page.goto('https://www.epey.com/akilli-telefonlar/samsung-galaxy-s24.html', { waitUntil: 'networkidle2', timeout: 30000 });

  const html = await page.content();
  fs.writeFileSync(path.join(__dirname, '../data/s24_epey_page.html'), html, 'utf8');
  console.log('Saved S24 Epey HTML. Length:', html.length);

  const images = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(i => ({
      src: i.src,
      alt: i.alt,
      class: i.className
    }));
  });

  console.log('Found total images on page:', images.length);
  images.filter(i => i.src.includes('resim.epey.com') || i.src.includes('epey.com')).forEach(i => console.log('Epey image:', i));

  await browser.close();
})();
